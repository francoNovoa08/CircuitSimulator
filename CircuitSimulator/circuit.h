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
	* @throws std::invalid_argument Throws on incorrect SPICE formatting
	**/
	void buildMNA_AC(
		ComplexMatrix& A,
		ComplexVector& b,
		double frequency
	) const;

	/**
	* @brief Transient Circuits - Populates the A and b matrices for a specific time step}
	* @param A An empty 2D vector
	* @param b An empty 1D vector
	* @param delta_t The time step size
	* @param x_prev The solved x vector from the previous time step
	* @param current_time The time elapsed thus far (optional)
	* @param frequency The frequency if the circuit is AC (optional)
	**/
	void buildMNA_Tran(
		std::vector<std::vector<double>>& A,
		std::vector<double>& b,
		double delta_t,
		const std::vector<double>& x_prev,
		double current_time = 0.0,
		double frequency = 0.0
	) const;

	/**
	* @brief Updates the current history of inductors after a time step
	* @param x_current The solved x vector from the current time step
	* @param delta_t The time step size
	* @param is_dc_init True if solving for t = 0 (starting current)
	**/
	void updateInductors(const std::vector<double>& x_current, double delta_t, bool is_dc_init = false);

private:
	std::vector<Component> components_;
	int max_node_ = 0;
	int voltage_source_count_ = 0;
};