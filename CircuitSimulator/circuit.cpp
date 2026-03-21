#include "circuit.h"
#include <vector>
#include "component.h"
#include <algorithm>
#include <numbers>

void Circuit::addComponent(const Component& c) {
	max_node_ = std::max({ max_node_, c.node_pos, c.node_neg });

	if (c.type == ComponentType::VoltageSource) voltage_source_count_++;

	components_.push_back(c);
	return;
}

int Circuit::getNodeCount() {
	return max_node_;
}

int Circuit::getVoltageSourceCount() const {
	return voltage_source_count_;
}

void Circuit::buildMNA_DC(std::vector<std::vector<double>>& A, std::vector<double>& b) const {
	int newSize = max_node_ + getVoltageSourceCount();
	
	A.assign(newSize, std::vector<double>(newSize, 0.0));
	b.assign(newSize, 0.0);

	int voltageSourceIndex = 0;
	
	for (Component c : components_) {
		int positiveNode = c.node_pos - 1;
		int negativeNode = c.node_neg - 1;

		switch (c.type) {
		case ComponentType::Resistor: {
			double conductance = 1.0 / c.value;

			if (positiveNode >= 0) A[positiveNode][positiveNode] += conductance;
			if (negativeNode >= 0) A[negativeNode][negativeNode] += conductance;

			if (positiveNode >= 0 && negativeNode >= 0) {
				A[positiveNode][negativeNode] -= conductance;
				A[negativeNode][positiveNode] -= conductance;
			}
			break;
		}

		case ComponentType::CurrentSource: {
			if (positiveNode >= 0) b[positiveNode] += c.value;
			if (negativeNode >= 0) b[negativeNode] -= c.value;
			break;
		}

		case ComponentType::VoltageSource: {
			int voltageSourcePosition = max_node_ + voltageSourceIndex;

			if (positiveNode >= 0) {
				A[positiveNode][voltageSourcePosition] += 1.0;
				A[voltageSourcePosition][positiveNode] += 1.0;
			}
			if (negativeNode >= 0) {
				A[negativeNode][voltageSourcePosition] -= 1.0;
				A[voltageSourcePosition][negativeNode] -= 1.0;
			}

			b[voltageSourcePosition] += c.value;

			voltageSourceIndex++;
			break;
		}

		case ComponentType::Capacitor: {
			break;
		}

		case ComponentType::Inductor: {
			double conductance = 1.0 / 1E-9;

			if (positiveNode >= 0) A[positiveNode][positiveNode] += conductance;
			if (negativeNode >= 0) A[negativeNode][negativeNode] += conductance;

			if (positiveNode >= 0 && negativeNode >= 0) {
				A[positiveNode][negativeNode] -= conductance;
				A[negativeNode][positiveNode] -= conductance;
			}
			break;
		}
		}
	}

	return;
}

void Circuit::buildMNA_AC(ComplexMatrix& A, ComplexVector& b, double frequency) const {
	if (frequency == 0) throw std::invalid_argument("Use DC function for 0 frequency.");
	double omega = 2 * std::numbers::pi * frequency;

	int newSize = max_node_ + getVoltageSourceCount();

	A.assign(newSize, std::vector<std::complex<double>>(newSize, 0.0));
	b.assign(newSize, 0.0);

	int voltageSourceIndex = 0;

	for (Component c : components_) {
		int positiveNode = c.node_pos - 1;
		int negativeNode = c.node_neg - 1;

		switch (c.type) {
		case ComponentType::Resistor:
		case ComponentType::Capacitor:
		case ComponentType::Inductor: {
			std::complex<double> admittance;

			if (c.type == ComponentType::Resistor) {
				admittance = std::complex<double>(1.0 / c.value, 0.0);
			}
			else if (c.type == ComponentType::Capacitor) {
				admittance = std::complex<double>(0.0, omega * c.value);
			}
			else if (c.type == ComponentType::Inductor) {
				admittance = std::complex<double>(0.0, -1.0 / (omega * c.value));
			}

			if (positiveNode >= 0) A[positiveNode][positiveNode] += admittance;
			if (negativeNode >= 0) A[negativeNode][negativeNode] += admittance;
			if (positiveNode >= 0 && negativeNode >= 0) {
				A[positiveNode][negativeNode] -= admittance;
				A[negativeNode][positiveNode] -= admittance;
			}
			break;
		}

		case ComponentType::CurrentSource: {
			if (positiveNode >= 0) b[positiveNode] += std::complex<double>(c.value, 0.0);
			if (negativeNode >= 0) b[negativeNode] -= std::complex<double>(c.value, 0.0);
			break;
		}

		case ComponentType::VoltageSource: {
			int voltageSourcePosition = max_node_ + voltageSourceIndex;

			if (positiveNode >= 0) {
				A[positiveNode][voltageSourcePosition] += std::complex <double>(1.0, 0.0);
				A[voltageSourcePosition][positiveNode] += std::complex <double>(1.0, 0.0);
			}
			if (negativeNode >= 0) {
				A[negativeNode][voltageSourcePosition] -= std::complex <double>(1.0, 0.0);
				A[voltageSourcePosition][negativeNode] -= std::complex <double>(1.0, 0.0);
			}

			b[voltageSourcePosition] += std::complex<double>(c.value, 0.0);

			voltageSourceIndex++;
			break;
		}
		}
	}

	return;
}

void Circuit::buildMNA_Tran(
	std::vector<std::vector<double>>& A,
	std::vector<double>& b,
	double delta_t,
	const std::vector<double>& x_prev
) const {
	int newSize = max_node_ + getVoltageSourceCount();

	A.assign(newSize, std::vector<double>(newSize, 0.0));
	b.assign(newSize, 0.0);

	int voltageSourceIndex = 0;

	for (Component c : components_) {
		int positiveNode = c.node_pos - 1;
		int negativeNode = c.node_neg - 1;

		switch (c.type) {
		case ComponentType::Resistor: {
			double conductance = 1.0 / c.value;

			if (positiveNode >= 0) A[positiveNode][positiveNode] += conductance;
			if (negativeNode >= 0) A[negativeNode][negativeNode] += conductance;

			if (positiveNode >= 0 && negativeNode >= 0) {
				A[positiveNode][negativeNode] -= conductance;
				A[negativeNode][positiveNode] -= conductance;
			}
			break;
		}

		case ComponentType::Capacitor: {
			double geq = c.value / delta_t;

			if (positiveNode >= 0) A[positiveNode][positiveNode] += geq;
			if (negativeNode >= 0) A[negativeNode][negativeNode] += geq;
			if (positiveNode >= 0 && negativeNode >= 0) {
				A[positiveNode][negativeNode] -= geq;
				A[negativeNode][positiveNode] -= geq;
			}

			double v_pos_prev = (positiveNode >= 0) ? x_prev[positiveNode] : 0.0;
			double v_neg_prev = (negativeNode >= 0) ? x_prev[negativeNode] : 0.0;

			double i_eq = geq * (v_pos_prev - v_neg_prev);

			if (positiveNode >= 0) b[positiveNode] += i_eq;
			if (negativeNode >= 0) b[negativeNode] -= i_eq;

			break;
		}

		case ComponentType::Inductor: {
			double geq = delta_t / c.value;

			if (positiveNode >= 0) A[positiveNode][positiveNode] += geq;
			if (negativeNode >= 0) A[negativeNode][negativeNode] += geq;
			if (positiveNode >= 0 && negativeNode >= 0) {
				A[positiveNode][negativeNode] -= geq;
				A[negativeNode][positiveNode] -= geq;
			}

			if (positiveNode >= 0) b[positiveNode] -= c.i_prev;
			if (negativeNode >= 0) b[negativeNode] += c.i_prev;

			break;
		}

		case ComponentType::CurrentSource: {
			if (positiveNode >= 0) b[positiveNode] += c.value;
			if (negativeNode >= 0) b[negativeNode] -= c.value;
			break;
		}

		case ComponentType::VoltageSource: {
			int voltageSourcePosition = max_node_ + voltageSourceIndex;

			if (positiveNode >= 0) {
				A[positiveNode][voltageSourcePosition] += 1.0;
				A[voltageSourcePosition][positiveNode] += 1.0;
			}
			if (negativeNode >= 0) {
				A[negativeNode][voltageSourcePosition] -= 1.0;
				A[voltageSourcePosition][negativeNode] -= 1.0;
			}

			b[voltageSourcePosition] += c.value;

			voltageSourceIndex++;
			break;
		}
		}
	}
}

void Circuit::updateInductors(const std::vector<double>& x_current, double delta_t, bool is_dc_init) {
	for (Component& c : components_) {
		if (c.type == ComponentType::Inductor) {
			int positiveNode = c.node_pos - 1;
			int negativeNode = c.node_neg - 1;

			double v_pos = (positiveNode >= 0) ? x_current[positiveNode] : 0.0;
			double v_neg = (negativeNode >= 0) ? x_current[negativeNode] : 0.0;
			double v_drop = v_pos - v_neg;

			if (is_dc_init) {
				c.i_prev = v_drop * 1E9;
			}
			else {
				c.i_prev = c.i_prev + (delta_t / c.value) * v_drop;
			}
		}
	}
}