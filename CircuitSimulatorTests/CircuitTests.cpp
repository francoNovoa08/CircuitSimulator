#include "gtest/gtest.h"
#include "circuit.h"
#include "component.h"
#include <vector>

class CircuitTest : public::testing::Test {
protected:
	Circuit circuit;

    Component createComponent(ComponentType type, int pos, int neg, double val) {
        Component c;
        c.type = type;
        c.node_pos = pos;
        c.node_neg = neg;
        c.value = val;
        return c;
    }

    void SetUp() override {
        circuit = Circuit();
    }
};

// ==========================================
// Tests for state tracking
// ==========================================

TEST_F(CircuitTest, AddComponent_UpdatesMaxNode) {
    circuit.addComponent(createComponent(ComponentType::Resistor, 1, 0, 100));
    EXPECT_EQ(circuit.getNodeCount(), 1);

    circuit.addComponent(createComponent(ComponentType::Resistor, 3, 2, 50));
    EXPECT_EQ(circuit.getNodeCount(), 3);
}

TEST_F(CircuitTest, AddComponent_TracksVoltageSources) {
    circuit.addComponent(createComponent(ComponentType::Resistor, 1, 0, 100));
    EXPECT_EQ(circuit.getVoltageSourceCount(), 0);

    circuit.addComponent(createComponent(ComponentType::VoltageSource, 1, 0, 5));
    circuit.addComponent(createComponent(ComponentType::VoltageSource, 2, 1, 10));
    EXPECT_EQ(circuit.getVoltageSourceCount(), 2);
}

// ==========================================
// Tests for buildMNA()
// ==========================================

TEST_F(CircuitTest, BuildMNA_SizesMatricesCorrectly) {
    // 2 nodes + 1 voltage source = 3x3 A matrix, 3x1 b matrix
    circuit.addComponent(createComponent(ComponentType::Resistor, 1, 0, 10));
    circuit.addComponent(createComponent(ComponentType::Resistor, 2, 1, 20));
    circuit.addComponent(createComponent(ComponentType::VoltageSource, 2, 0, 5));

    std::vector<std::vector<double>> A;
    std::vector<double> b;

    circuit.buildMNA(A, b);

    ASSERT_EQ(A.size(), 3);
    EXPECT_EQ(A[0].size(), 3);
    EXPECT_EQ(b.size(), 3);
}

TEST_F(CircuitTest, BuildMNA_StampsResistorCorrectly) {
    // Conductance 0.1 from Node 1 to Ground
    circuit.addComponent(createComponent(ComponentType::Resistor, 1, 0, 10));

    std::vector<std::vector<double>> A;
    std::vector<double> b;
    circuit.buildMNA(A, b);

    EXPECT_DOUBLE_EQ(A[0][0], 0.1);
    EXPECT_DOUBLE_EQ(b[0], 0.0);
}

TEST_F(CircuitTest, BuildMNA_StampsResistorBetweenNodes) {
    // Conductance 0.1 between Node 1 and Node 2
    circuit.addComponent(createComponent(ComponentType::Resistor, 1, 2, 10));

    std::vector<std::vector<double>> A;
    std::vector<double> b;
    circuit.buildMNA(A, b);

    EXPECT_DOUBLE_EQ(A[0][0], 0.1);  // Node 1 self
    EXPECT_DOUBLE_EQ(A[1][1], 0.1);  // Node 2 self
    EXPECT_DOUBLE_EQ(A[0][1], -0.1); // Node 1 to 2
    EXPECT_DOUBLE_EQ(A[1][0], -0.1); // Node 2 to 1
}

TEST_F(CircuitTest, BuildMNA_StampsCurrentSourceCorrectly) {
    circuit.addComponent(createComponent(ComponentType::CurrentSource, 1, 0, 2.0));

    std::vector<std::vector<double>> A;
    std::vector<double> b;
    circuit.buildMNA(A, b);

    EXPECT_DOUBLE_EQ(A[0][0], 0.0);
    EXPECT_DOUBLE_EQ(b[0], 2.0);
}

TEST_F(CircuitTest, BuildMNA_StampsVoltageSourceCorrectly) {
    circuit.addComponent(createComponent(ComponentType::VoltageSource, 1, 0, 5.0));
    std::vector<std::vector<double>> A;
    std::vector<double> b;
    circuit.buildMNA(A, b);

    ASSERT_EQ(A.size(), 2);
    EXPECT_DOUBLE_EQ(A[0][1], 1.0);
    EXPECT_DOUBLE_EQ(A[1][0], 1.0);
    EXPECT_DOUBLE_EQ(b[1], 5.0);
}