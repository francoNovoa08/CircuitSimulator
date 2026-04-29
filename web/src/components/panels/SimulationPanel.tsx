import { useState } from "react";
import { Play } from "lucide-react";
import { useSimulationStore } from "../../store/simulationStore";
import { useCircuitStore } from "../../store/circuitStore";
import { runDC, runAC, runTransient } from "../../engine/simulator";

export default function SimulationPanel() {
    const {
        analysisType,
        params,
        loading,
        setAnalysisType,
        setParams,
        setResult,
        setError,
        setLoading,
    } = useSimulationStore();
    const { generateNetlist, components } = useCircuitStore();
    const [localError, setLocalError] = useState<string | null>(null);

    const handleRun = async () => {
        setLocalError(null);
        if (components.length === 0) {
            setLocalError("No components on canvas.");
            return;
        }
        setLoading(true);
        try {
            if (analysisType === "dc") {
                setResult(await runDC(generateNetlist(".DC")));
            } else if (analysisType === "ac") {
                setResult(
                    await runAC(
                        generateNetlist(`.AC ${params.frequency}`),
                        params.frequency,
                    ),
                );
            } else {
                setResult(
                    await runTransient(
                        generateNetlist(
                            `.TRAN ${params.tStep} ${params.tStop}`,
                        ),
                        params.tStep,
                        params.tStop,
                    ),
                );
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Simulation failed.";
            setError(msg);
            setLocalError(msg);
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="flex flex-col bg-slate-50/50 border-b border-slate-200 shrink-0">
            <div className="px-4 py-3 border-b border-slate-100 bg-white">
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Simulation Settings
                </h2>

                <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200/60 mb-4">
                    {(["dc", "ac", "transient"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setAnalysisType(t)}
                            className={[
                                "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer",
                                analysisType === t
                                    ? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50",
                            ].join(" ")}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {analysisType === "ac" && (
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase">
                                Freq (Hz)
                            </label>
                            <input
                                type="number"
                                value={params.frequency}
                                step="any"
                                onChange={(e) =>
                                    setParams({
                                        frequency:
                                            parseFloat(e.target.value) || 1000,
                                    })
                                }
                                className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                            />
                        </div>
                    )}
                    {analysisType === "transient" && (
                        <div className="flex gap-2">
                            <div className="flex-1 flex flex-col gap-1">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase">
                                    Step (s)
                                </label>
                                <input
                                    type="number"
                                    value={params.tStep}
                                    step="any"
                                    onChange={(e) =>
                                        setParams({
                                            tStep:
                                                parseFloat(e.target.value) ||
                                                1e-5,
                                        })
                                    }
                                    className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                                />
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                <label className="text-[10px] font-semibold text-slate-500 uppercase">
                                    Stop (s)
                                </label>
                                <input
                                    type="number"
                                    value={params.tStop}
                                    step="any"
                                    onChange={(e) =>
                                        setParams({
                                            tStop:
                                                parseFloat(e.target.value) ||
                                                5e-3,
                                        })
                                    }
                                    className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-white">
                {localError && (
                    <p className="text-xs text-red-600 mb-3">{localError}</p>
                )}
                <button
                    onClick={handleRun}
                    disabled={loading}
                    className={[
                        "w-full flex items-center cursor-pointer justify-center gap-2 py-2.5 px-4 rounded-lg text-white font-semibold text-sm transition-all duration-200",
                        loading
                            ? "bg-emerald-500 cursor-wait opacity-90"
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-[0.98]",
                        "disabled:opacity-40 disabled:cursor-not-allowed",
                    ].join(" ")}
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Play size={15} className="fill-current" />
                            <span>Run Simulation</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
