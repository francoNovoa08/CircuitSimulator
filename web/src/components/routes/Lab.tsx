import { useState, useEffect, useRef } from "react";
import CircuitCanvas from "../canvas/CircuitCanvas";
import ComponentPalette from "../panels/ComponentPalette";
import type { ComponentType } from "../../store/circuitStore";
import PropertiesPanel from "../panels/PropertiesPanel";
import ResultsPanel from "../panels/ResultsPanel";
import SimulationPanel from "../panels/SimulationPanel";
import ExperimentLoader from "../panels/ExperimentLoader";

type Tool = ComponentType | "select" | "wire";

const keyMap: Record<string, Tool> = {
    s: "select",
    w: "wire",
    r: "resistor",
    c: "capacitor",
    l: "inductor",
    v: "voltageSource",
    i: "currentSource",
    g: "ground",
};

export default function Lab() {
    const [activeTool, setActiveTool] = useState<Tool>("select");
    const panelRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            const tool = keyMap[e.key.toLowerCase()];
            if (tool) setActiveTool(tool);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    const scrollToResults = () => {
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 50);
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-blue-100">
            <main className="flex flex-1 min-h-0 overflow-hidden">
                <ComponentPalette
                    activeTool={activeTool}
                    onToolChange={setActiveTool}
                />

                <div className="flex-1 min-h-0 min-w-0 bg-slate-50">
                    <CircuitCanvas activeTool={activeTool} />
                </div>

                <aside
                    ref={panelRef}
                    className="w-80 shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-y-auto shadow-[-2px_0_8px_-4px_rgba(0,0,0,0.05)] z-10"
                >
                    <ExperimentLoader onLoaded={scrollToResults} />
                    <PropertiesPanel />
                    <SimulationPanel />
                    <div ref={resultsRef}>
                        <ResultsPanel />
                    </div>
                </aside>
            </main>
        </div>
    );
}
