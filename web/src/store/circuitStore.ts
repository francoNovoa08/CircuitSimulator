import { create } from 'zustand';

export type ComponentType = 'resistor' | 'capacitor' | 'inductor' | 'voltageSource' | 'currentSource' | 'ground';
export type Orientation = 'horizontal' | 'vertical';

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
}

const counters: Record<ComponentType, number> = {
    resistor: 0,
    capacitor: 0,
    inductor: 0,
    voltageSource: 0,
    currentSource: 0,
    ground: 0,
};

const prefixMap: Record<ComponentType, string> = {
    resistor: 'R',
    capacitor: 'C',
    inductor: 'L',
    voltageSource: 'V',
    currentSource: 'I',
    ground: 'GND',
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

export const useCircuitStore = create<CircuitState>((set, get) => ({
    components: [],
    wires: [],
    selectedId: null,

    addComponent(type, position) {
        counters[type] += 1;
        const name = type === 'ground'
            ? 'GND'
            : `${prefixMap[type]}${counters[type]}`;

        const component: PlacedComponent = {
            id: generateId(),
            type,
            position,
            orientation: 'horizontal',
            value: defaultValueMap[type],
            name,
        };

        set(state => ({ components: [...state.components, component] }));
    },

    moveComponent(id, position) {
        set(state => ({
            components: state.components.map(c =>
                c.id === id ? { ...c, position } : c
            ),
        }));
    },

    updateValue(id, value) {
        set(state => ({
            components: state.components.map(c =>
                c.id === id ? { ...c, value } : c
            ),
        }));
    },

    updateInitialVoltage(id, voltage) {
        set(state => ({
            components: state.components.map(c =>
                c.id === id ? { ...c, initialVoltage: voltage } : c
            ),
        }));
    },

    removeComponent(id) {
        set(state => ({
            components: state.components.filter(c => c.id !== id),
            wires: state.wires.filter(w => {
                const comp = state.components.find(c => c.id === id);
                if (!comp) return true;
                return !(
                    (w.from.x === comp.position.x && w.from.y === comp.position.y) ||
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
        set(state => ({ wires: [...state.wires, wire] }));
    },

    removeWire(id) {
        set(state => ({ wires: state.wires.filter(w => w.id !== id) }));
    },

    clear() {
        Object.keys(counters).forEach(k => {
            counters[k as ComponentType] = 0;
        });
        set({ components: [], wires: [], selectedId: null });
    },

    generateNetlist(analysisLine) {
        const { components, wires } = get();

        // Assign node numbers by finding connected groups of wire endpoints
        // and component terminals. Ground nodes are always node 0.
        const allPoints: Point[] = [];

        for (const comp of components) {
            if (comp.type === 'ground') continue;
            const [p, n] = getTerminals(comp);
            allPoints.push(p, n);
        }
        for (const wire of wires) {
            allPoints.push(wire.from, wire.to);
        }

        // Union-find to group connected points
        const parent = new Map<string, string>();

        function key(p: Point) { return `${p.x},${p.y}`; }

        function find(k: string): string {
            if (parent.get(k) !== k) parent.set(k, find(parent.get(k)!));
            return parent.get(k)!;
        }

        function union(a: string, b: string) {
            parent.set(find(a), find(b));
        }

        for (const p of allPoints) {
            const k = key(p);
            if (!parent.has(k)) parent.set(k, k);
        }

        for (const wire of wires) {
            union(key(wire.from), key(wire.to));
        }

        const groundKeys = new Set<string>();
        for (const comp of components) {
            if (comp.type === 'ground') {
                const gKey = key(comp.position);
                if (!parent.has(gKey)) parent.set(gKey, gKey);
                groundKeys.add(find(gKey));
            }
        }

        const nodeMap = new Map<string, number>();
        let nextNode = 1;

        function nodeFor(p: Point): number {
            const root = find(key(p));
            if (groundKeys.has(root)) return 0;
            if (!nodeMap.has(root)) nodeMap.set(root, nextNode++);
            return nodeMap.get(root)!;
        }

        const lines: string[] = [];

        for (const comp of components) {
            if (comp.type === 'ground') continue;
            const [pos, neg] = getTerminals(comp);
            const nodePos = nodeFor(pos);
            const nodeNeg = nodeFor(neg);

            let line = `${comp.name} ${nodePos} ${nodeNeg} ${comp.value}`;
            if (comp.type === 'capacitor' && comp.initialVoltage !== undefined) {
                line += ` IC=${comp.initialVoltage}`;
            }
            lines.push(line);
        }

        lines.push(analysisLine);
        return lines.join('\n') + '\n';
    },
}));

// Returns [positive terminal, negative terminal] grid positions for a component
function getTerminals(comp: PlacedComponent): [Point, Point] {
    const offset = comp.orientation === 'horizontal'
        ? { x: 1, y: 0 }
        : { x: 0, y: 1 };

    return [
        comp.position,
        { x: comp.position.x + offset.x, y: comp.position.y + offset.y },
    ];
}