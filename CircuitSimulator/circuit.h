#pragma once
#include "component.h"
#include <vector>

class Circuit {
public:
	/**
	* @brief Adds a component to the components vector and updates max node count
	* @param c A component object added to the vector
	**/
	void addComponent(const Component& c);

	int getNodeCount();
	int getVoltageSourceCount() const;

	/**
	* @brief Populates the A and b matrices to solve Ax = b, where A contains conductances 
	  between nodes and 1/-1 for voltage sources and b contains known values.
	* @param A An empty 2D vector 
	* @param b An empty 1D vector
	**/
	void buildMNA(
		std::vector<std::vector<double>>& A, 
		std::vector<double>& b
	) const;

private:
	std::vector<Component> components_;
	int max_node_ = 0;
	int voltage_source_count_ = 0;
};