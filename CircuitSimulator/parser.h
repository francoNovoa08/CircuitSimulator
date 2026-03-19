#pragma once
#include "component.h"
#include <vector>
#include <string>

class Parser {
public: 
	std::vector<Component> parse(const std::string& filename);
private:
	ComponentType typeFromName(const std::string& name);
};

