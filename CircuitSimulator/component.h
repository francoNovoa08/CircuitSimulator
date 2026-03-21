#pragma once
#include <string>

enum class ComponentType { Resistor, VoltageSource, CurrentSource, Capacitor, Inductor };

struct Component {
	ComponentType type;
	std::string name;
	int node_pos;
	int node_neg;
	double value;
	double i_prev = 0.0;
};