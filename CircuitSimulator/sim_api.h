#pragma once

extern "C" {
    /**
     * @brief Runs a DC simulation using the provided netlist.
     * @param netlist A string containing the SPICE netlist to simulate.
     * @return A JSON formatted string containing the solved circuit.
             Returns a JSON error message on exceptions
    **/
    const char* runDC(const char* netlist);

    /**
     * @brief Runs an AC simulation on the circuit at a specified frequency.
     * @param netlist A string containing the SPICE netlist to simulate.
     * @param frequency The operating frequency for the AC simulation.
     * @return A JSON formatted string containing the node voltage magnitudes and phases (in degrees).
             Returns a JSON error message if an exception occurs.
    **/
    const char* runAC(const char* netlist, double frequency);

    /**
     * @brief Runs a transient simulation on the circuit.
     * @param netlist A string containing the SPICE netlist to simulate.
     * @param tStep The time step interval between evaluation points.
     * @param tStop The final time at which to stop the simulation.
     * @return A JSON formatted string containing an array of time steps with their corresponding node voltages. 
             Returns a JSON error message if an exception occurs.
    **/
    const char* runTransient(const char* netlist, double tStep, double tStop);
}