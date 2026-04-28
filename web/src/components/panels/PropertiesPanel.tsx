import { useCircuitStore } from "../../store/circuitStore";

const unitMap: Record<string, string> = {
    resistor: "Ω",
    capacitor: "F",
    inductor: "H",
    voltageSource: "V",
    currentSource: "A",
    ground: "",
};

const labelMap: Record<string, string> = {
    resistor: "Resistance",
    capacitor: "Capacitance",
    inductor: "Inductance",
    voltageSource: "Voltage",
    currentSource: "Current",
    ground: "Ground",
};

function PanelSection({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2 p-3 border-b border-circuit-border">
            {children}
        </div>
    );
}

function FieldInput({
    label,
    defaultValue,
    onCommit,
    step = "any",
}: {
    label: string;
    defaultValue: number;
    onCommit: (val: string) => void;
    step?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-circuit-muted uppercase tracking-wide">
                {label}
            </label>
            <input
                type="number"
                defaultValue={defaultValue}
                step={step}
                className="bg-circuit-bg border border-circuit-border rounded px-1.5 py-1 font-mono text-[11px] text-circuit-text outline-none focus:border-circuit-accent w-full transition-colors"
                onBlur={(e) => onCommit(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter")
                        onCommit((e.target as HTMLInputElement).value);
                }}
            />
        </div>
    );
}

export default function PropertiesPanel() {
    const {
        components,
        selectedId,
        updateValue,
        updateInitialVoltage,
        removeComponent,
        selectComponent,
    } = useCircuitStore();

    const comp = components.find((c) => c.id === selectedId);

    if (!comp) {
        return (
            <PanelSection>
                <p className="font-mono text-[10px] text-circuit-dim leading-relaxed">
                    Select a component to edit its properties.
                </p>
            </PanelSection>
        );
    }

    const handleDelete = () => {
        removeComponent(comp.id);
        selectComponent(null);
    };

    return (
        <PanelSection>
            <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-circuit-text">
                    {comp.name}
                </span>
                <span className="font-mono text-[9px] text-circuit-accent border border-circuit-accent rounded px-1.5 py-px opacity-70">
                    {labelMap[comp.type]}
                </span>
            </div>

            {comp.type !== "ground" && (
                <FieldInput
                    label={`Value (${unitMap[comp.type]})`}
                    defaultValue={comp.value}
                    onCommit={(raw) => {
                        const n = parseFloat(raw);
                        if (!isNaN(n) && n > 0) updateValue(comp.id, n);
                    }}
                />
            )}

            {comp.type === "capacitor" && (
                <FieldInput
                    label="Initial voltage (V)"
                    defaultValue={comp.initialVoltage ?? 0}
                    onCommit={(raw) =>
                        updateInitialVoltage(comp.id, parseFloat(raw) || 0)
                    }
                />
            )}

            <button
                onClick={handleDelete}
                className="flex items-center justify-between w-full px-2 py-1 rounded border border-circuit-error text-circuit-error font-mono text-[10px] bg-transparent hover:bg-red-500/8 transition-colors cursor-pointer"
            >
                Delete
                <span className="text-[9px] bg-circuit-bg rounded px-1 py-px opacity-70">
                    Del
                </span>
            </button>
        </PanelSection>
    );
}
