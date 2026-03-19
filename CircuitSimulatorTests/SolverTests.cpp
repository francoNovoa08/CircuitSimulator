#include "gtest/gtest.h"
#include "solver.h"
#include <vector>

class SolverTest : public::testing::Test {
protected:
	Solver solver = Solver();
};

TEST_F(SolverTest, Solver_CurrentSourceCircuitSolved) {
	std::vector<std::vector<double>> A = {
		{ 0.5, -0.5 }, { -0.5, 1.0 }
	};

	std::vector<double> b = { 2.0, 0.0 };
	
	std::vector<double> x = solver.solve(A, b);

	EXPECT_DOUBLE_EQ(x[0], 8.0);
	EXPECT_DOUBLE_EQ(x[1], 4.0);
}

TEST_F(SolverTest, Solver_VoltageSourceCircuitSolved) {
	std::vector<std::vector<double>> A = {
		{ 0.1, 1.0 }, { 1.0, 0.0 }
	};

	std::vector<double> b = { 0.0, 5.0 };

	std::vector<double> x = solver.solve(A, b);

	EXPECT_DOUBLE_EQ(x[0], 5.0);
	EXPECT_DOUBLE_EQ(x[1], -0.5);
}

TEST_F(SolverTest, Solver_MultipleSourcesCircuitSolved) {
	std::vector<std::vector<double>> A = {
		{ 0.0, 0.0, 1.0 }, { 0.0, 0.25, -1.0 }, { 1.0, -1.0, 0.0 }
	};

	std::vector<double> b = { 1.0, 0.0, 2.0 };

	std::vector<double> x = solver.solve(A, b);

	EXPECT_DOUBLE_EQ(x[0], 6.0);
	EXPECT_DOUBLE_EQ(x[1], 4.0);
	EXPECT_DOUBLE_EQ(x[2], 1.0);
}