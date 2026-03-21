#include <iostream>
#include <vector>
#include <string>
#include <iomanip> 
#include <complex>
#include <numbers> 
#include "parser.h"
#include "circuit.h"
#include "solver.h"

int main()
{
    Parser parser;
    Circuit circuit;
    Solver solver;

    std::string filename = "circuit.net";

    try {
        // Parsing
        SimulationConfig config = parser.parse(filename);
        std::cout << "Successfully loaded " << config.components.size() << " components from " << filename << "\n";

        // Build Circuit Blueprint
        for (const auto& comp : config.components) {
            circuit.addComponent(comp);
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

        int nodeCount = circuit.getNodeCount();
        int vSourceCount = circuit.getVoltageSourceCount();

        // ==========================================
        // TRANSIENT ANALYSIS
        // ==========================================
        if (config.isTran) {
            std::vector<std::vector<double>> A;
            std::vector<double> b;

            std::vector<double> x_prev(nodeCount + vSourceCount, 0.0);
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