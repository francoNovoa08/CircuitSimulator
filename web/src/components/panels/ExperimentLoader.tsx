import { useState } from "react";
import { experiments } from "../../data/experiments";
import { useSimulationStore } from "../../store/simulationStore";
import { runTransient } from "../../engine/simulator";
import { FlaskConical, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
    onLoaded: () => void;
}

export default function ExperimentLoader({ onLoaded }: Props) {
    const [open, setOpen] = useState(false);
    const [runningId, setRunningId] = useState<string | null>(null);
    const { setResult, setError, setLoading, setHilData, setAnalysisType } =
        useSimulationStore();

    const handleLoad = async (expId: string) => {
        const exp = experiments.find((e) => e.id === expId);
        if (!exp) return;

        setRunningId(expId);
        setLoading(true);
        setError("");
        setAnalysisType("transient");

        try {
            const result = await runTransient(
                exp.netlist,
                exp.tStep,
                exp.tStop,
            );
            setResult(result);
            setHilData(exp.measured, exp.rmse, exp.title, exp);
            onLoaded();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Simulation failed.");
        } finally {
            setLoading(false);
            setRunningId(null);
        }
    };

    return (
        <div className="border-b border-slate-200 bg-white shrink-0">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <FlaskConical size={14} className="text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        HIL Experiments
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
                    {experiments.map((exp) => {
                        const running = runningId === exp.id;
                        return (
                            <div
                                key={exp.id}
                                className="border border-slate-200 rounded-lg p-3 flex flex-col gap-2"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold text-slate-800">
                                        {exp.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400 leading-relaxed">
                                        {exp.description}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] text-slate-400">
                                        RMSE{" "}
                                        <span className="text-amber-600 font-semibold">
                                            {exp.rmse.toFixed(3)} V
                                        </span>
                                    </span>
                                    <button
                                        onClick={() => handleLoad(exp.id)}
                                        disabled={runningId !== null}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-semibold hover:bg-slate-700 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {running ? (
                                            <>
                                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                                                Running
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
