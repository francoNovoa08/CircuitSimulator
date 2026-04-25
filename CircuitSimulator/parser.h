#pragma once
#include "component.h"
#include <vector>
#include <string>

struct SimulationConfig {
	std::vector<Component> components;
	bool isAC = false;
	double frequency = 0.0;

	bool isTran = false;
	double tStep = 0.0;
	double tStop = 0.0;
};

class Parser {
public: 
	/**
	* @brief Builds a config for the simulation from a netlist file
	* @param filename The file containing the circuit components
	* @return An object containing a vector of Component types,
	   boolean if the circuit is AC, and a frequency as described by the file
	* @throws std::runtime_error Throws on file open failure and incorrect SPICE file
	**/
	SimulationConfig parse(const std::string& filename);

	/**
	* @brief Returns the name from a ComponentType
	* @param type The ComponentType of the component
	* @return A string for the ComponentType
	**/
	std::string nameFromType(const ComponentType type);

	/**
	* @brief Returns the ComponentType from its string name
	* @param name The name of the component (must not be empty)
	* @return A ComponentType for the component
	* @throws std::invalid_argument Throws on empty component names
	* @throws std::runtime_error Throws on incorrect component names
	**/
	ComponentType typeFromName(const std::string& name);
};

