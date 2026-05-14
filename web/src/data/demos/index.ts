import type { PlacedComponent, Wire } from "../../store/circuitStore";
import type { AnalysisType } from "../../store/simulationStore";

export interface DemoSimParams {
    analysisType: AnalysisType;
    frequency?: number;
    tStep?: number;
    tStop?: number;
}

export interface DemoCircuit {
    id: string;
    title: string;
    caption: string;
    components: PlacedComponent[];
    wires: Wire[];
    simParams: DemoSimParams;
}

const voltageDivider: DemoCircuit = {
    id: "voltage-divider",
    title: "Voltage Divider",
    caption:
        "DC — two equal resistors split a 10 V source; midpoint node reads 5 V.",
    simParams: { analysisType: "dc" },
    components: [
        {
            id: "vd-v1",
            type: "voltageSource",
            position: { x: 3, y: 7 },
            orientation: "horizontal",
            value: 10,
            name: "V1",
        },
        {
            id: "vd-r1",
            type: "resistor",
            position: { x: 5, y: 5 },
            orientation: "horizontal",
            value: 10000,
            name: "R1",
        },
        {
            id: "vd-r2",
            type: "resistor",
            position: { x: 7, y: 5 },
            orientation: "horizontal",
            value: 10000,
            name: "R2",
        },
        {
            id: "vd-gnd",
            type: "ground",
            position: { x: 9, y: 7 },
            orientation: "horizontal",
            value: 0,
            name: "GND",
        },
    ],
    wires: [
        { id: "vd-w1", from: { x: 3, y: 5 }, to: { x: 3, y: 7 } },
        { id: "vd-w2", from: { x: 3, y: 5 }, to: { x: 5, y: 5 } },
        { id: "vd-w3", from: { x: 6, y: 5 }, to: { x: 7, y: 5 } },
        { id: "vd-w4", from: { x: 8, y: 5 }, to: { x: 9, y: 5 } },
        { id: "vd-w5", from: { x: 9, y: 5 }, to: { x: 9, y: 7 } },
        { id: "vd-w6", from: { x: 4, y: 7 }, to: { x: 9, y: 7 } },
    ],
};

const rcCharging: DemoCircuit = {
    id: "rc-charging",
    title: "RC Charging",
    caption:
        "Transient — capacitor charges toward 5 V with τ = RC = 1 ms; watch node R1−/C1+.",
    simParams: {
        analysisType: "transient",
        tStep: 1e-5,
        tStop: 5e-3,
    },
    components: [
        {
            id: "rc-v1",
            type: "voltageSource",
            position: { x: 3, y: 7 },
            orientation: "horizontal",
            value: 5,
            name: "V1",
        },
        {
            id: "rc-r1",
            type: "resistor",
            position: { x: 5, y: 5 },
            orientation: "horizontal",
            value: 1000,
            name: "R1",
        },
        {
            id: "rc-c1",
            type: "capacitor",
            position: { x: 7, y: 5 },
            orientation: "horizontal",
            value: 1e-6,
            name: "C1",
            initialVoltage: 0,
        },
        {
            id: "rc-gnd",
            type: "ground",
            position: { x: 9, y: 7 },
            orientation: "horizontal",
            value: 0,
            name: "GND",
        },
    ],
    wires: [
        { id: "rc-w1", from: { x: 3, y: 5 }, to: { x: 3, y: 7 } },
        { id: "rc-w2", from: { x: 3, y: 5 }, to: { x: 5, y: 5 } },
        { id: "rc-w3", from: { x: 6, y: 5 }, to: { x: 7, y: 5 } },
        { id: "rc-w4", from: { x: 8, y: 5 }, to: { x: 9, y: 5 } },
        { id: "rc-w5", from: { x: 9, y: 5 }, to: { x: 9, y: 7 } },
        { id: "rc-w6", from: { x: 4, y: 7 }, to: { x: 9, y: 7 } },
    ],
};

const rlcAC: DemoCircuit = {
    id: "rlc-ac",
    title: "RLC Series (AC)",
    caption:
        "AC — series RLC at resonance (≈1592 Hz); inductor and capacitor impedances cancel.",
    simParams: {
        analysisType: "ac",
        frequency: 1592,
    },
    components: [
        {
            id: "rlc-v1",
            type: "voltageSource",
            position: { x: 2, y: 7 },
            orientation: "horizontal",
            value: 1,
            name: "V1",
        },
        {
            id: "rlc-r1",
            type: "resistor",
            position: { x: 4, y: 5 },
            orientation: "horizontal",
            value: 100,
            name: "R1",
        },
        {
            id: "rlc-l1",
            type: "inductor",
            position: { x: 6, y: 5 },
            orientation: "horizontal",
            value: 1e-2,
            name: "L1",
        },
        {
            id: "rlc-c1",
            type: "capacitor",
            position: { x: 8, y: 5 },
            orientation: "horizontal",
            value: 1e-6,
            name: "C1",
        },
        {
            id: "rlc-gnd",
            type: "ground",
            position: { x: 10, y: 7 },
            orientation: "horizontal",
            value: 0,
            name: "GND",
        },
    ],
    wires: [
        { id: "rlc-w1", from: { x: 2, y: 5 }, to: { x: 2, y: 7 } },
        { id: "rlc-w2", from: { x: 2, y: 5 }, to: { x: 4, y: 5 } },
        { id: "rlc-w3", from: { x: 5, y: 5 }, to: { x: 6, y: 5 } },
        { id: "rlc-w4", from: { x: 7, y: 5 }, to: { x: 8, y: 5 } },
        { id: "rlc-w5", from: { x: 9, y: 5 }, to: { x: 10, y: 5 } },
        { id: "rlc-w6", from: { x: 10, y: 5 }, to: { x: 10, y: 7 } },
        { id: "rlc-w7", from: { x: 3, y: 7 }, to: { x: 10, y: 7 } },
    ],
};

export const demos: DemoCircuit[] = [voltageDivider, rcCharging, rlcAC];