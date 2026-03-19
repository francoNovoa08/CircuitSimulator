#include "gtest/gtest.h"
#include "parser.h"
#include <fstream>
#include <cstdio>
#include <stdexcept>
#include "component.h"

class ParserTest : public::testing::Test {
protected:
	const std::string validTestFile = "test_valid_circuit.net";
	const std::string malformedTestFile = "test_malformed_circuit.net";

	void SetUp() override {
		std::ofstream validFile(validTestFile);
		validFile << "* This is a valid comment line\n";
		validFile << "R1 1 0 100\n";
		validFile << "V1 2 0 5.0\n";
		validFile << "\n";
		validFile << "I1 2 1 0.01\n";
		validFile.close();

		std::ofstream malformedFile(malformedTestFile);
		malformedFile << "R2 1 0\n";
		malformedFile.close();
	}

	void TearDown() override {
		std::remove(validTestFile.c_str());
		std::remove(malformedTestFile.c_str());
	}

	Parser parser;
};

// ==========================================
// Tests for typeFromName()
// ==========================================

TEST_F(ParserTest, TypeFromName_ValidComponents) {
	EXPECT_EQ(parser.typeFromName("R1"), ComponentType::Resistor);
	EXPECT_EQ(parser.typeFromName("V_source"), ComponentType::VoltageSource);
	EXPECT_EQ(parser.typeFromName("Iin"), ComponentType::CurrentSource);

	EXPECT_EQ(parser.typeFromName("r2"), ComponentType::Resistor);
	EXPECT_EQ(parser.typeFromName("v1"), ComponentType::VoltageSource);
	EXPECT_EQ(parser.typeFromName("i1"), ComponentType::CurrentSource);
}

TEST_F(ParserTest, TypeFromName_EmptyStringThrows) {
	EXPECT_THROW(parser.typeFromName(""), std::invalid_argument);
}

TEST_F(ParserTest, TypeFromName_UnknownComponentThrows) {
	EXPECT_THROW(parser.typeFromName("C1"), std::runtime_error);
	EXPECT_THROW(parser.typeFromName("X_Unknown"), std::runtime_error);
}

// ==========================================
// Tests for nameFromType()
// ==========================================

TEST_F(ParserTest, NameFromType_ReturnsCorrectStrings) {
	EXPECT_EQ(parser.nameFromType(ComponentType::Resistor), "Resistor");
	EXPECT_EQ(parser.nameFromType(ComponentType::VoltageSource), "Voltage Source");
	EXPECT_EQ(parser.nameFromType(ComponentType::CurrentSource), "Current Source");

	EXPECT_EQ(parser.nameFromType(static_cast<ComponentType>(999)), "Unknown");
}

// ==========================================
// Tests for parse()
// ==========================================

TEST_F(ParserTest, Parse_FileNotFoundThrows) {
	EXPECT_THROW(parser.parse("does_not_exist.net"), std::runtime_error);
}

TEST_F(ParserTest, Parse_MalformedFileThrows) {
	EXPECT_THROW(parser.parse(malformedTestFile), std::runtime_error);
}

TEST_F(ParserTest, Parse_ValidFileParsesCorrectly) {
	auto components = parser.parse(validTestFile);

	ASSERT_EQ(components.size(), 3);

	EXPECT_EQ(components[0].name, "R1");
	EXPECT_EQ(components[0].type, ComponentType::Resistor);
	EXPECT_DOUBLE_EQ(components[0].value, 100.0);

	EXPECT_EQ(components[1].name, "V1");
	EXPECT_EQ(components[1].type, ComponentType::VoltageSource);
	EXPECT_DOUBLE_EQ(components[1].value, 5.0);

	EXPECT_EQ(components[2].name, "I1");
	EXPECT_EQ(components[2].type, ComponentType::CurrentSource);
	EXPECT_DOUBLE_EQ(components[2].value, 0.01);
}