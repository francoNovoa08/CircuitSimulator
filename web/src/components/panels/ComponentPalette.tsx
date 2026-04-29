import type { JSX } from "react";
import type { ComponentType } from "../../store/circuitStore";

type Tool = ComponentType | "select" | "wire";

interface Props {
    activeTool: Tool;
    onToolChange: (tool: Tool) => void;
}

function IconSelect(): JSX.Element {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 2l10 6-5.5 1.5L6 15 3 2z" />
        </svg>
    );
}
function IconWire(): JSX.Element {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        >
            <line x1="2" y1="8" x2="14" y2="8" />
            <circle cx="2" cy="8" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="14" cy="8" r="1.5" fill="currentColor" stroke="none" />
        </svg>
    );
}
function IconResistor(): JSX.Element {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="1" y1="8" x2="3.5" y2="8" />
            <rect x="3.5" y="5.5" width="9" height="5" rx="1" />
            <line x1="12.5" y1="8" x2="15" y2="8" />
        </svg>
    );
}
function IconCapacitor(): JSX.Element {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        >
            <line x1="1" y1="8" x2="6.5" y2="8" />
            <line x1="6.5" y1="4" x2="6.5" y2="12" />
            <line x1="9.5" y1="4" x2="9.5" y2="12" />
            <line x1="9.5" y1="8" x2="15" y2="8" />
        </svg>
    );
}
function IconInductor(): JSX.Element {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="1" y1="8" x2="3.5" y2="8" />
            <rect
                x="3.5"
                y="5.5"
                width="9"
                height="5"
                rx="1"
                strokeDasharray="2 1.5"
            />
            <line x1="12.5" y1="8" x2="15" y2="8" />
        </svg>
    );
}
function IconVoltageSource(): JSX.Element {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        >
            <line x1="1" y1="8" x2="3.5" y2="8" />
            <circle cx="8" cy="8" r="4.5" />
            <line x1="12.5" y1="8" x2="15" y2="8" />
            <line x1="6.5" y1="8" x2="8" y2="8" />
            <line x1="7.25" y1="7.25" x2="7.25" y2="8.75" />
            <line x1="9" y1="8" x2="10" y2="8" />
        </svg>
    );
}
function IconCurrentSource(): JSX.Element {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="1" y1="8" x2="3.5" y2="8" />
            <circle cx="8" cy="8" r="4.5" />
            <line x1="12.5" y1="8" x2="15" y2="8" />
            <line x1="5.5" y1="8" x2="9.5" y2="8" />
            <path d="M8 6l2 2-2 2" />
        </svg>
    );
}
function IconGround(): JSX.Element {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        >
            <line x1="8" y1="2" x2="8" y2="8" />
            <line x1="3" y1="8" x2="13" y2="8" />
            <line x1="5" y1="11" x2="11" y2="11" />
            <line x1="7" y1="14" x2="9" y2="14" />
        </svg>
    );
}

interface ToolDef {
    id: Tool;
    label: string;
    key: string;
    icon: () => JSX.Element;
    section?: string;
}

const tools: ToolDef[] = [
    {
        id: "select",
        label: "Select",
        key: "S",
        icon: IconSelect,
        section: "Tools",
    },
    { id: "wire", label: "Wire", key: "W", icon: IconWire },
    {
        id: "resistor",
        label: "Resistor",
        key: "R",
        icon: IconResistor,
        section: "Passive",
    },
    { id: "capacitor", label: "Capacitor", key: "C", icon: IconCapacitor },
    { id: "inductor", label: "Inductor", key: "L", icon: IconInductor },
    {
        id: "voltageSource",
        label: "Voltage Source",
        key: "V",
        icon: IconVoltageSource,
        section: "Sources",
    },
    {
        id: "currentSource",
        label: "Current Source",
        key: "I",
        icon: IconCurrentSource,
    },
    {
        id: "ground",
        label: "Ground",
        key: "G",
        icon: IconGround,
        section: "Other",
    },
];

export default function ComponentPalette({ activeTool, onToolChange }: Props) {
    let lastSection = "";

    return (
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] z-10">
            <div className="px-4 pb-1 pt-2 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Components
                </h2>
            </div>

            <div className="flex flex-col px-4 py-1 gap-1.5">
                {tools.map((t) => {
                    const active = activeTool === t.id;
                    const showSection = t.section && t.section !== lastSection;
                    if (t.section) lastSection = t.section;

                    return (
                        <div key={t.id}>
                            {showSection && (
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-5 pb-2">
                                    {t.section}
                                </p>
                            )}
                            <button
                                onClick={() => onToolChange(t.id)}
                                title={`${t.label} (${t.key})`}
                                className={[
                                    "flex items-center gap-3 w-full px-3 py-3 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer text-left",
                                    active
                                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                ].join(" ")}
                            >
                                <span
                                    className={[
                                        "shrink-0 p-1.5 rounded",
                                        active
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-slate-50 text-slate-500 shadow-sm border border-slate-200",
                                    ].join(" ")}
                                >
                                    <t.icon />
                                </span>
                                <span className="flex-1 truncate">
                                    {t.label}
                                </span>
                                <kbd
                                    className={[
                                        "inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md text-[11px] font-mono font-semibold border shrink-0",
                                        active
                                            ? "border-blue-200 text-blue-600 bg-blue-100/50"
                                            : "border-slate-200 text-slate-400 bg-slate-50 shadow-sm",
                                    ].join(" ")}
                                >
                                    {t.key}
                                </kbd>
                            </button>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
