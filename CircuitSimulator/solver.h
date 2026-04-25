#pragma once
#include <vector>
#include <cmath>
#include <algorithm>
#include <stdexcept>
#include <complex> 

class Solver {
public:
	/**
	* @brief Solves system of equation Ax = b in place and returns result
	* @param A The matrix A, representing coefficients
	* @param b The matrix b, representing known values
	* @return The solution matrix x
	* @throws std::invalid_argument Throws on non-square matrices
	* @throws std::runtime_error Throws on invalid circuits
	**/
	template <typename T>
	std::vector<T> solve(std::vector<std::vector<T>> A, std::vector<T> b) {
		int n = A.size();

		if (n == 0 || A[0].size() != n || b.size() != n) {
			throw std::invalid_argument("Matrix dimensions do not match.");
		}

		for (int k = 0; k < n; ++k) {
			int max_row = k;

			double max_val = std::abs(A[k][k]);

			for (int i = k + 1; i < n; ++i) {
				if (std::abs(A[i][k]) > max_val) {
					max_val = std::abs(A[i][k]);
					max_row = i;
				}
			}

			if (max_val < 1e-12) {
				throw std::runtime_error("Matrix is singular (Circuit may have floating nodes or shorted batteries).");
			}

			if (max_row != k) {
				std::swap(A[k], A[max_row]);
				std::swap(b[k], b[max_row]);
			}

			for (int i = k + 1; i < n; ++i) {
				T factor = A[i][k] / A[k][k]; 

				for (int j = k; j < n; ++j) {
					A[i][j] -= factor * A[k][j];
				}
				b[i] -= factor * b[k];
			}
		}

		std::vector<T> x(n, T(0.0));

		for (int i = n - 1; i >= 0; --i) {
			T sum = b[i]; 
			for (int j = i + 1; j < n; ++j) {
				sum -= A[i][j] * x[j];
			}
			x[i] = sum / A[i][i];
		}

		return x;
	}
};