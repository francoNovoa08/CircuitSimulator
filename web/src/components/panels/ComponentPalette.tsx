import type { ComponentType } from "../../store/circuitStore";

type Tool = ComponentType | "select" | "wire";

interface Props {
    activeTool: Tool;
    onToolChange: (tool: Tool) => void;
}

const tools: { id: Tool; label: string; key: string }[] = [
    { id: "select", label: "Select", key: "S" },
    { id: "wire", label: "Wire", key: "W" },
    { id: "resistor", label: "Resistor", key: "R" },
    { id: "capacitor", label: "Capacitor", key: "C" },
    { id: "inductor", label: "Inductor", key: "L" },
    { id: "voltageSource", label: "V Source", key: "V" },
    { id: "currentSource", label: "I Source", key: "I" },
    { id: "ground", label: "Ground", key: "G" },
];

export default function ComponentPalette({ activeTool, onToolChange }: Props) {
    return (
        <div className="flex flex-col gap-0.5 p-2 bg-circuit-surface border-r border-circuit-border w-24 shrink-0">
            {tools.map((t) => {
                const active = activeTool === t.id;
                return (
                    <button
                        key={t.id}
                        onClick={() => onToolChange(t.id)}
                        title={`${t.label} (${t.key})`}
                        className={[
                            "flex items-center justify-between px-2 py-1.5 rounded",
                            "border font-mono text-[11px] w-full text-left cursor-pointer",
                            "transition-colors duration-100",
                            active
                                ? "bg-circuit-raised border-circuit-accent text-circuit-accent"
                                : "bg-transparent border-transparent text-circuit-muted hover:bg-circuit-raised hover:text-circuit-text",
                        ].join(" ")}
                    >
                        <span className="flex-1">{t.label}</span>
                        <span
                            className={[
                                "text-[9px] rounded px-0.5 py-px bg-circuit-bg",
                                active
                                    ? "text-circuit-accent"
                                    : "text-circuit-dim",
                            ].join(" ")}
                        >
                            {t.key}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
