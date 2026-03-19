#pragma once
#include "component.h"
#include <vector>
#include <complex>

using ComplexMatrix = std::vector<std::vector<std::complex<double>>>;
using ComplexVector = std::vector<std::complex<double>>;

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
	* @brief DC Circuits - Populates the A and b matrices to solve Ax = b, where A 
	   contains conductances between nodes and 1/-1 for voltage sources and b 
	   contains known values.
	* @param A An empty 2D vector 
	* @param b An empty 1D vector
	**/
	void buildMNA_DC(
		std::vector<std::vector<double>>& A, 
		std::vector<double>& b
	) const;

	/**
	* @brief AC Circuits - Populates the A and b matrices to solve Ax = b, where A
	   contains admittances between nodes and complex voltage sources and b
	   contains known complex values.
	* @param A An empty 2D vector
	* @param b An empty 1D vector
	* @param frequency The frequency of the AC Circuit
	**/
	void buildMNA_AC(
		ComplexMatrix& A,
		ComplexVector& b,
		double frequency
	) const;

private:
	std::vector<Component> components_;
	int max_node_ = 0;
	int voltage_source_count_ = 0;
};