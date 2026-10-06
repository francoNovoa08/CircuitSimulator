import { create } from "zustand";

export type ComponentType =
    | "resistor"
    | "capacitor"
    | "inductor"
    | "voltageSource"
    | "currentSource"
    | "ground";
export type Orientation = "horizontal" | "vertical";

export interface Point {
    x: number;
    y: number;
}

export interface PlacedComponent {
    id: string;
    type: ComponentType;
    position: Point;
    orientation: Orientation;
    value: number;
    name: string;
    initialVoltage?: number; // IC= for capacitors
}

export interface Wire {
    id: string;
    from: Point;
    to: Point;
}

interface CircuitState {
    components: PlacedComponent[];
    wires: Wire[];
    selectedId: string | null;

    addComponent: (type: ComponentType, position: Point) => void;
    moveComponent: (id: string, position: Point) => void;
    updateValue: (id: string, value: number) => void;
    updateInitialVoltage: (id: string, voltage: number) => void;
    removeComponent: (id: string) => void;
    selectComponent: (id: string | null) => void;

    addWire: (from: Point, to: Point) => void;
    removeWire: (id: string) => void;

    clear: () => void;
    generateNetlist: (analysisLine: string) => string;
    generateNetlistWithLabels: (analysisLine: string) => {
        netlist: string;
        nodeLabels: Map<number, string>;
    };

    loadSnapshot: (components: PlacedComponent[], wires: Wire[]) => void;
}

export const GROUND_NODE = 0;

const counters: Record<ComponentType, number> = {
    resistor: 0,
    capacitor: 0,
    inductor: 0,
    voltageSource: 0,
    currentSource: 0,
    ground: 0,
};

const prefixMap: Record<ComponentType, string> = {
    resistor: "R",
    capacitor: "C",
    inductor: "L",
    voltageSource: "V",
    currentSource: "I",
    ground: "GND",
};

const defaultValueMap: Record<ComponentType, number> = {
    resistor: 1000,
    capacitor: 1e-6,
    inductor: 1e-3,
    voltageSource: 5,
    currentSource: 0.01,
    ground: 0,
};

function generateId(): string {
    return Math.random().toString(36).slice(2, 9);
}

type NodeResolver = (point: Point) => number;

function pointKey(p: Point): string {
    return `${p.x},${p.y}`;
}

function createNodeResolver(
    components: PlacedComponent[],
    wires: Wire[],
): NodeResolver {
    const parent = new Map<string, string>();

    function find(key: string): string {
        const current = parent.get(key);
        if (current === undefined) {
            parent.set(key, key);
            return key;
        }
        if (current === key) return key;
        const root = find(current);
        parent.set(key, root);
        return root;
    }

    for (const wire of wires) {
        parent.set(find(pointKey(wire.from)), find(pointKey(wire.to)));
    }

    const groundRoots = new Set<string>();
    for (const comp of components) {
        if (comp.type === "ground") {
            groundRoots.add(find(pointKey(comp.position)));
        }
    }

    const nodeNumbers = new Map<string, number>();

    return (point) => {
        const root = find(pointKey(point));
        if (groundRoots.has(root)) return GROUND_NODE;

        let node = nodeNumbers.get(root);
        if (node === undefined) {
            node = nodeNumbers.size + 1;
            nodeNumbers.set(root, node);
        }
        return node;
    };
}

function buildNetlist(
    components: PlacedComponent[],
    wires: Wire[],
    analysisLine: string,
): { netlist: string; nodeLabels: Map<number, string> } {
    const nodeFor = createNodeResolver(components, wires);
    const nodeNames = new Map<number, Set<string>>();

    function addName(node: number, name: string) {
        if (node === GROUND_NODE) return;
        const names = nodeNames.get(node) ?? new Set<string>();
        names.add(name);
        nodeNames.set(node, names);
    }

    const lines: string[] = [];
    for (const comp of components) {
        if (comp.type === "ground") continue;
        const [pos, neg] = getTerminals(comp);
        const nodePos = nodeFor(pos);
        const nodeNeg = nodeFor(neg);

        addName(nodePos, `${comp.name}+`);
        addName(nodeNeg, `${comp.name}-`);

        let line = `${comp.name} ${nodePos} ${nodeNeg} ${comp.value}`;
        if (comp.type === "capacitor" && comp.initialVoltage !== undefined) {
            line += ` IC=${comp.initialVoltage}`;
        }
        lines.push(line);
    }
    lines.push(analysisLine);

    const nodeLabels = new Map<number, string>();
    for (const [node, names] of nodeNames) {
        nodeLabels.set(node, [...names].join(" / "));
    }

    return { netlist: lines.join("\n") + "\n", nodeLabels };
}

export function hasGroundReference(
    components: PlacedComponent[],
    wires: Wire[],
): boolean {
    const nodeFor = createNodeResolver(components, wires);
    return components.some(
        (comp) =>
            comp.type !== "ground" &&
            getTerminals(comp).some((t) => nodeFor(t) === GROUND_NODE),
    );
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
    components: [],
    wires: [],
    selectedId: null,

    addComponent(type, position) {
        counters[type] += 1;
        const name =
            type === "ground" ? "GND" : `${prefixMap[type]}${counters[type]}`;

        const component: PlacedComponent = {
            id: generateId(),
            type,
            position,
            orientation: "horizontal",
            value: defaultValueMap[type],
            name,
        };

        set((state) => ({ components: [...state.components, component] }));
    },

    moveComponent(id, position) {
        set((state) => ({
            components: state.components.map((c) =>
                c.id === id ? { ...c, position } : c,
            ),
        }));
    },

    updateValue(id, value) {
        set((state) => ({
            components: state.components.map((c) =>
                c.id === id ? { ...c, value } : c,
            ),
        }));
    },

    updateInitialVoltage(id, voltage) {
        set((state) => ({
            components: state.components.map((c) =>
                c.id === id ? { ...c, initialVoltage: voltage } : c,
            ),
        }));
    },

    removeComponent(id) {
        set((state) => ({
            components: state.components.filter((c) => c.id !== id),
            wires: state.wires.filter((w) => {
                const comp = state.components.find((c) => c.id === id);
                if (!comp) return true;
                return !(
                    (w.from.x === comp.position.x &&
                        w.from.y === comp.position.y) ||
                    (w.to.x === comp.position.x && w.to.y === comp.position.y)
                );
            }),
            selectedId: state.selectedId === id ? null : state.selectedId,
        }));
    },

    selectComponent(id) {
        set({ selectedId: id });
    },

    addWire(from, to) {
        const wire: Wire = { id: generateId(), from, to };
        set((state) => ({ wires: [...state.wires, wire] }));
    },

    removeWire(id) {
        set((state) => ({ wires: state.wires.filter((w) => w.id !== id) }));
    },

    clear() {
        Object.keys(counters).forEach((k) => {
            counters[k as ComponentType] = 0;
        });
        set({ components: [], wires: [], selectedId: null });
    },

    generateNetlist(analysisLine) {
        const { components, wires } = get();
        return buildNetlist(components, wires, analysisLine).netlist;
    },

    generateNetlistWithLabels(analysisLine) {
        const { components, wires } = get();
        return buildNetlist(components, wires, analysisLine);
    },

    loadSnapshot(components, wires) {
        Object.keys(counters).forEach((k) => {
            counters[k as ComponentType] = 0;
        });
        set({ components, wires, selectedId: null });
    },
}));

// Returns [positive terminal, negative terminal] grid positions for a component
export function getTerminals(comp: PlacedComponent): [Point, Point] {
    const offset =
        comp.orientation === "horizontal" ? { x: 1, y: 0 } : { x: 0, y: 1 };

    return [
        comp.position,
        { x: comp.position.x + offset.x, y: comp.position.y + offset.y },
    ];
}

export function getOccupiedCells(comp: PlacedComponent): Point[] {
    if (comp.type === "ground") return [comp.position];
    const [a, b] = getTerminals(comp);
    return [a, b];
}