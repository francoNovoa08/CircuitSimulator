#include "sim_api.h"
#include "parser.h"
#include "circuit.h"
#include "solver.h"
#include <sstream>
#include <string>
#include <cstring>
#include <cmath>

static std::string g_result; 

static std::string errorJson(const std::string& msg) {
    return "{\"error\":\"" + msg + "\"}";
}

extern "C" {

    const char* runDC(const char* netlist) {
        try {
            Parser parser;
            SimulationConfig config = parser.parseFromString(netlist);

            Circuit circuit;
            for (const auto& comp : config.components)
                circuit.addComponent(comp);

            std::vector<std::vector<double>> A;
            std::vector<double> b;
            circuit.buildMNA_DC(A, b);

            Solver solver;
            std::vector<double> x = solver.solve(A, b);

            std::ostringstream json;
            json << "{\"type\":\"dc\",\"nodes\":[";
            for (int i = 0; i < circuit.getNodeCount(); ++i) {
                if (i > 0) json << ",";
                json << "{\"node\":" << (i + 1) << ",\"voltage\":" << x[i] << "}";
            }
            json << "],\"sources\":[";
            for (int i = 0; i < circuit.getVoltageSourceCount(); ++i) {
                if (i > 0) json << ",";
                json << "{\"source\":" << (i + 1)
                    << ",\"current\":" << x[circuit.getNodeCount() + i] << "}";
            }
            json << "]}";
            g_result = json.str();
        }
        catch (const std::exception& e) {
            g_result = errorJson(e.what());
        }
        return g_result.c_str();
    }

    const char* runAC(const char* netlist, double frequency) {
        try {
            Parser parser;
            SimulationConfig config = parser.parseFromString(netlist);

            Circuit circuit;
            for (const auto& comp : config.components)
                circuit.addComponent(comp);

            ComplexMatrix A;
            ComplexVector b;
            circuit.buildMNA_AC(A, b, frequency);

            Solver solver;
            ComplexVector x = solver.solve(A, b);

            std::ostringstream json;
            json << "{\"type\":\"ac\",\"frequency\":" << frequency << ",\"nodes\":[";
            for (int i = 0; i < circuit.getNodeCount(); ++i) {
                if (i > 0) json << ",";
                json << "{\"node\":" << (i + 1)
                    << ",\"magnitude\":" << std::abs(x[i])
                    << ",\"phase\":" << (std::arg(x[i]) * 180.0 / M_PI) << "}";
            }
            json << "]}";
            g_result = json.str();
        }
        catch (const std::exception& e) {
            g_result = errorJson(e.what());
        }
        return g_result.c_str();
    }

    const char* runTransient(const char* netlist, double tStep, double tStop) {
        try {
            Parser parser;
            SimulationConfig config = parser.parseFromString(netlist);

            Circuit circuit;
            for (const auto& comp : config.components)
                circuit.addComponent(comp);

            Solver solver;
            int nodeCount = circuit.getNodeCount();
            int vSourceCount = circuit.getVoltageSourceCount();

            std::vector<double> x_prev(nodeCount + vSourceCount, 0.0);
            for (auto& comp : config.components)
                Circuit::applyCapacitorInitialConditions(comp, x_prev);
            circuit.updateInductors(x_prev, tStep, true);

            std::ostringstream json;
            json << "{\"type\":\"transient\",\"steps\":[";

            bool firstStep = true;
            double t = 0.0;

            auto writeStep = [&](double time, const std::vector<double>& x) {
                if (!firstStep) json << ",";
                firstStep = false;
                json << "{\"time\":" << time << ",\"nodes\":[";
                for (int i = 0; i < nodeCount; ++i) {
                    if (i > 0) json << ",";
                    json << x[i];
                }
                json << "]}";
                };

            writeStep(0.0, x_prev);

            while (t <= tStop + 1e-9) {
                std::vector<std::vector<double>> A;
                std::vector<double> b;
                circuit.buildMNA_Tran(A, b, tStep, x_prev, t, config.frequency);
                std::vector<double> x_curr = solver.solve(A, b);
                circuit.updateInductors(x_curr, tStep, false);
                t += tStep;
                writeStep(t, x_curr);
                x_prev = x_curr;
            }

            json << "]}";
            g_result = json.str();
        }
        catch (const std::exception& e) {
            g_result = errorJson(e.what());
        }
        return g_result.c_str();
    }

} 