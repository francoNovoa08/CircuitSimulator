#pragma once
#include "component.h"
#include <vector>
#include <string>

class Parser {
public: 
	/**
	* @brief Builds a components vector from a netlist file
	* @param filename The file containing the circuit components
	* @return A vector of Component types as described by the file
	**/
	std::vector<Component> parse(const std::string& filename);

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
	**/
	ComponentType typeFromName(const std::string& name);
};

