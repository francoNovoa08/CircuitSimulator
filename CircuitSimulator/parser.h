#pragma once
#include "component.h"
#include <vector>
#include <string>

class Parser {
public: 
	std::vector<Component> parse(const std::string& filename);
	std::string nameFromType(const ComponentType& type);
private:
	ComponentType typeFromName(const std::string& name);
};

