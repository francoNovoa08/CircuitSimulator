import { useState } from "react";
import { Cpu, ChevronDown, ChevronUp } from "lucide-react";
import { useCircuitStore } from "../../store/circuitStore";
import { useSimulationStore } from "../../store/simulationStore";
import { demos } from "../../data/demos";

export default function DemoCircuits() {
    const [open, setOpen] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const { loadSnapshot } = useCircuitStore();
    const {
        setAnalysisType,
        setParams,
        clear: clearSim,
    } = useSimulationStore();

    const handleLoad = (id: string) => {
        const demo = demos.find((d) => d.id === id);
        if (!demo) return;

        setLoadingId(id);

        requestAnimationFrame(() => {
            clearSim();
            loadSnapshot(demo.components, demo.wires);

            const { analysisType, frequency, tStep, tStop } = demo.simParams;
            setAnalysisType(analysisType);

            if (analysisType === "ac" && frequency !== undefined) {
                setParams({ frequency });
            } else if (
                analysisType === "transient" &&
                tStep !== undefined &&
                tStop !== undefined
            ) {
                setParams({ tStep, tStop });
            }

            setLoadingId(null);
        });
    };

    return (
        <div className="border-b border-slate-200 bg-white shrink-0">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Demo Circuits
                    </span>
                </div>
                {open ? (
                    <ChevronUp size={14} className="text-slate-400" />
                ) : (
                    <ChevronDown size={14} className="text-slate-400" />
                )}
            </button>

            {open && (
                <div className="px-3 pb-3 flex flex-col gap-2">
                    {demos.map((demo) => {
                        const loading = loadingId === demo.id;
                        return (
                            <div
                                key={demo.id}
                                className="border border-slate-200 rounded-lg p-3 flex flex-col gap-2"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold text-slate-800">
                                        {demo.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400 leading-relaxed">
                                        {demo.caption}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                                        {demo.simParams.analysisType}
                                    </span>
                                    <button
                                        onClick={() => handleLoad(demo.id)}
                                        disabled={loadingId !== null}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-semibold hover:bg-slate-700 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                                                Loading
                                            </>
                                        ) : (
                                            "Load"
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
