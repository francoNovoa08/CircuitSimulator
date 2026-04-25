#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <complex>
#include <numbers>
#include <fstream>
#include <sstream>
#include "parser.h"
#include "circuit.h"
#include "solver.h"
#include "serial.h"

int main(int argc, char* argv[])
{
    bool hilMode = false;
    std::string comPort = "COM3";
    std::string filename = "circuit.net";

    for (int i = 1; i < argc; i++) {
        std::string arg = argv[i];
        if (arg == "--hil") {
            hilMode = true;
        }
        else if (arg.rfind("--port=", 0) == 0) {
            comPort = arg.substr(7);
        }
        else if (arg.rfind("--net=", 0) == 0) {
            filename = arg.substr(6);
        }
    }

    Parser parser;
    Circuit circuit;
    Solver solver;

    try {
        // Parsing
        SimulationConfig config = parser.parse(filename);
        std::cout << "Successfully loaded " << config.components.size() << " components from " << filename << "\n";

        // Build Circuit Blueprint
        for (const auto& comp : config.components) {
            circuit.addComponent(comp);
        }

        int nodeCount = circuit.getNodeCount();
        int vSourceCount = circuit.getVoltageSourceCount();

        // HIL Mode
        if (hilMode) {
            if (!config.isTran) {
                std::cerr << "[HIL] Error: HIL mode requires a transient netlist\n";
                return 1;
            }

            std::cout << "\n[HIL] Hardware-in-the-Loop mode\n";
            std::cout << "[HIL] Circuit: " << filename << "\n";
            std::cout << "[HIL] Port:    " << comPort << "\n";

            SerialReader serial(comPort);

            std::cout << "[HIL] Waiting for Arduino...\n";
            while (true) {
                std::string line = serial.readLine();
                if (line == "READY") break;
            }

            std::cout << "[HIL] Sending trigger. Waiting for discharge/charge...\n";
            serial.sendCommand('G');

            std::ofstream csv("hil_results.csv");
            csv << "timestamp_ms,v_theoretical,v_actual,abs_error,pct_error\n";

            std::cout << std::left
                << std::setw(14) << "Time(ms)"
                << std::setw(18) << "V_theoretical(V)"
                << std::setw(16) << "V_actual(V)"
                << std::setw(14) << "Abs_err(V)"
                << std::setw(12) << "Pct_err(%)"
                << "\n";
            std::cout << std::string(74, '-') << "\n";

            std::vector<std::vector<double>> A;
            std::vector<double> b;
            std::vector<double> x_prev(nodeCount + vSourceCount, 0.0);

            for (Component component : config.components) {
                Circuit::applyCapacitorInitialConditions(component, x_prev);
            }
            circuit.updateInductors(x_prev, config.tStep, true);

            int sampleCount = 0;
            double rmseAccum = 0.0;
            double simTime = 0.0;

            while (true) {
                std::string line = serial.readLine();
                if (line == "DONE") break;
                if (line.empty()) continue;

                double hw_timestamp_ms = 0.0;
                double v_actual = 0.0;
                if (!SerialReader::parseArduinoSample(line, hw_timestamp_ms, v_actual)) continue;

                // Advance simulation one timestep
                circuit.buildMNA_Tran(A, b, config.tStep,
                    x_prev, simTime, config.frequency);
                std::vector<double> x_current = solver.solve(A, b);
                circuit.updateInductors(x_current, config.tStep, false);

                double v_theoretical = x_current[0];
                double abs_error = std::abs(v_theoretical - v_actual);
                double pct_error = (v_theoretical > 1e-9)
                    ? (abs_error / v_theoretical * 100.0)
                    : 0.0;

                std::cout << std::fixed << std::setprecision(4) << std::left
                    << std::setw(14) << hw_timestamp_ms
                    << std::setw(18) << v_theoretical
                    << std::setw(16) << v_actual
                    << std::setw(14) << abs_error
                    << std::setw(12) << pct_error
                    << "\n";

                csv << std::fixed << std::setprecision(6)
                    << hw_timestamp_ms << ","
                    << v_theoretical << ","
                    << v_actual << ","
                    << abs_error << ","
                    << pct_error << "\n";

                rmseAccum += abs_error * abs_error;
                ++sampleCount;

                x_prev = x_current;
                simTime += config.tStep;
            }

            double rmse = sampleCount > 0
                ? std::sqrt(rmseAccum / sampleCount)
                : 0.0;

            std::cout << std::string(74, '-') << "\n";
            std::cout << "[HIL] Samples collected: " << sampleCount << "\n";
            std::cout << "[HIL] RMSE: " << std::fixed
                << std::setprecision(4) << rmse << " V\n";
            std::cout << "[HIL] Results saved to hil_results.csv\n";

            csv.close();
            return 0;
        }

        std::cout << "\n======================================\n";
        if (config.isTran) {
            std::cout << "      TRANSIENT SIMULATION RESULTS    \n";
        }
        else if (config.isAC) {
            std::cout << "   AC SIMULATION RESULTS (" << config.frequency << " Hz)\n";
        }
        else {
            std::cout << "         DC SIMULATION RESULTS        \n";
        }
        std::cout << "======================================\n";
        std::cout << std::fixed << std::setprecision(4);

        // ==========================================
        // TRANSIENT ANALYSIS
        // ==========================================
        if (config.isTran) {
            std::vector<std::vector<double>> A;
            std::vector<double> b;

            std::vector<double> x_prev(nodeCount + vSourceCount, 0.0);

            for (Component component : config.components) {
                Circuit::applyCapacitorInitialConditions(component, x_prev);
            }
            circuit.updateInductors(x_prev, config.tStep, true);

            std::cout << std::left << std::setw(12) << "Time(s)";
            for (int i = 0; i < nodeCount; ++i) {
                std::string title = "V(Node " + std::to_string(i + 1) + ")";
                std::cout << std::setw(15) << title;
            }
            std::cout << "\n------------------------------------------------\n";

            std::cout << std::left << std::setw(12) << 0.0000;
            for (int i = 0; i < nodeCount; ++i) {
                std::cout << std::setw(15) << x_prev[i];
            }
            std::cout << "\n";

            double currentTime = config.tStep;
            while (currentTime <= config.tStop + 1e-9) {

                circuit.buildMNA_Tran(A, b, config.tStep, x_prev, currentTime, config.frequency);
                std::vector<double> x_current = solver.solve(A, b);
                circuit.updateInductors(x_current, config.tStep, false);

                std::cout << std::left << std::setw(12) << currentTime;
                for (int i = 0; i < nodeCount; ++i) {
                    std::cout << std::setw(15) << x_current[i];
                }
                std::cout << "\n";

                x_prev = x_current;
                currentTime += config.tStep;
            }
        }
        // ==========================================
        // AC ANALYSIS 
        // ==========================================
        else if (config.isAC) {
            ComplexMatrix A;
            ComplexVector b;
            circuit.buildMNA_AC(A, b, config.frequency);

            ComplexVector x = solver.solve(A, b);

            std::cout << "--- Node Voltages (Magnitude & Phase) ---\n";
            for (int i = 0; i < nodeCount; ++i) {
                double magnitude = std::abs(x[i]);
                double phase_deg = std::arg(x[i]) * 180.0 / std::numbers::pi;

                std::cout << "  V(Node " << (i + 1) << ") = "
                    << magnitude << " V, Phase: " << phase_deg << " deg\n";
            }

            if (vSourceCount > 0) {
                std::cout << "\n--- Voltage Source Currents ---\n";
                for (int i = 0; i < vSourceCount; ++i) {
                    int index = nodeCount + i;
                    double magnitude = std::abs(x[index]);
                    double phase_deg = std::arg(x[index]) * 180.0 / std::numbers::pi;

                    std::cout << "  I(V_source " << (i + 1) << ") = "
                        << magnitude << " A, Phase: " << phase_deg << " deg\n";
                }
            }
        }
        // ==========================================
        // DC ANALYSIS
        // ==========================================
        else {
            std::vector<std::vector<double>> A;
            std::vector<double> b;
            circuit.buildMNA_DC(A, b);

            std::vector<double> x = solver.solve(A, b);

            std::cout << "--- Node Voltages ---\n";
            for (int i = 0; i < nodeCount; ++i) {
                std::cout << "  V(Node " << (i + 1) << ") = " << x[i] << " V\n";
            }

            if (vSourceCount > 0) {
                std::cout << "\n--- Voltage Source Currents ---\n";
                for (int i = 0; i < vSourceCount; ++i) {
                    int index = nodeCount + i;
                    std::cout << "  I(V_source " << (i + 1) << ") = " << x[index] << " A\n";
                }
            }
        }
        std::cout << "======================================\n\n";
    }
    catch (const std::exception& e) {
        std::cerr << "\n[SIMULATION ABORTED] Error: " << e.what() << "\n";
        return 1;
    }

    return 0;
}