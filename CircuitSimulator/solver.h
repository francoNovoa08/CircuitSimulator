#pragma once
#include <vector>

class Solver {
public:
	/**
	* @brief Solves system of equation Ax = b in place and returns result
	* @param A The matrix A, representing coefficients
	* @param b The matrix b, representing known values
	* @return The solution matrix x
	**/
	std::vector<double> solve(std::vector<std::vector<double>> A, std::vector<double> b);
};