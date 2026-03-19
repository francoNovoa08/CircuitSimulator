#include "parser.h"
#include <fstream>
#include <sstream>
#include <stdexcept>

ComponentType Parser::typeFromName(const std::string& name) {
	if (name.empty()) {
		throw std::invalid_argument("Component name can't be empty");
	}
	
	char c = std::toupper(name[0]);
	switch (c) {
		case 'R': return ComponentType::Resistor;
		case 'V': return ComponentType::VoltageSource;
		case 'I': return ComponentType::CurrentSource;
		case 'C': return ComponentType::Capacitor;
		case 'L': return ComponentType::Inductor;
	}

	throw std::runtime_error("Unknown component: " + name);
}

std::string Parser::nameFromType(const ComponentType type) {
	switch (type) {
		case ComponentType::Resistor: return "Resistor";
		case ComponentType::VoltageSource: return "Voltage Source";
		case ComponentType::CurrentSource: return "Current Source";
		case ComponentType::Capacitor: return "Capacitor";
		case ComponentType::Inductor: return "Inductor";
		default: return "Unknown";
	}
}

SimulationConfig Parser::parse(const std::string& filename) {
	std::ifstream file(filename);
	if (!file.is_open()) throw std::runtime_error("Can't open file: " + filename);

	SimulationConfig config;

	std::vector<Component> components;
	std::string line;

	while (std::getline(file, line)) {
		if (line.empty() || line[0] == '*') continue;

		std::istringstream ss(line);

		if (line[0] == '.') {
			std::string command;
			ss >> command;

			if (command == ".ac" || command == ".AC") {
				config.isAC = true;
				if (!(ss >> config.frequency)) {
					throw std::runtime_error("Malformed command: .ac requires a frequency value");
				}
			}
			else if (command == ".dc" || command == ".DC" || command == ".op" || command == ".OP") {
				config.isAC = false;
				config.frequency = 0.0;
			}
			else {
				throw std::runtime_error("Unknown simulation command: " + command);
			}
			continue;
		}
		Component c;
		std::string name;

		if (ss >> name >> c.node_pos >> c.node_neg >> c.value) {
			c.name = name;
			c.type = typeFromName(name);
			config.components.push_back(c);
		}
		else {
			throw std::runtime_error("Malformed netlist line: " + line);
		}
	}

	return config;
}