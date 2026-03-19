#include "parser.h"
#include <fstream>
#include <sstream>
#include <stdexcept>

ComponentType Parser::typeFromName(const std::string& name) {
	char c = std::toupper(name[0]);
	switch (c) {
		case 'R': return ComponentType::Resistor;
		case 'V': return ComponentType::VoltageSource;
		case 'I': return ComponentType::CurrentSource;
	}

	throw std::runtime_error("Unknown component: " + name);
}

std::string Parser::nameFromType(const ComponentType& type) {
	switch (type) {
		case ComponentType::Resistor: return "Resistor";
		case ComponentType::VoltageSource: return "Voltage Source";
		case ComponentType::CurrentSource: return "Current Source";
		default: return "Unknown";
	}
}

std::vector<Component> Parser::parse(const std::string& filename) {
	std::ifstream file(filename);
	if (!file.is_open()) throw std::runtime_error("Can't open file: " + filename);

	std::vector<Component> components;
	std::string line;

	while (std::getline(file, line)) {
		if (line.empty() || line[0] == '*') continue;

		std::istringstream ss(line);

		Component c;
		std::string name;
		ss >> name >> c.node_pos >> c.node_neg >> c.value;
		c.name = name;
		c.type = typeFromName(name);
		components.push_back(c);
	}

	return components;
}