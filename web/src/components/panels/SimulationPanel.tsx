import { useState } from "react";
import { useSimulationStore } from "../../store/simulationStore";
import { useCircuitStore } from "../../store/circuitStore";
import { runDC, runAC, runTransient } from "../../engine/simulator";

function FieldInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number;
    onChange: (val: number) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-circuit-muted uppercase tracking-wide">
                {label}
            </label>
            <input
                type="number"
                value={value}
                step="any"
                className="bg-circuit-bg border border-circuit-border rounded px-1.5 py-1 font-mono text-[11px] text-circuit-text outline-none focus:border-circuit-accent w-full transition-colors"
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            />
        </div>
    );
}

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
        }
    };

    return (
        <div className="flex flex-col gap-2 p-3 border-b border-circuit-border">
            <span className="font-mono text-[11px] text-circuit-text">
                Simulation
            </span>

            <div className="flex gap-0.5">
                {(["dc", "ac", "transient"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setAnalysisType(t)}
                        className={[
                            "flex-1 py-1 rounded border font-mono text-[10px] cursor-pointer transition-colors",
                            analysisType === t
                                ? "bg-circuit-raised border-circuit-accent text-circuit-accent"
                                : "bg-transparent border-circuit-border text-circuit-muted hover:text-circuit-text hover:border-circuit-muted",
                        ].join(" ")}
                    >
                        {t.toUpperCase()}
                    </button>
                ))}
            </div>

            {analysisType === "ac" && (
                <FieldInput
                    label="Frequency (Hz)"
                    value={params.frequency}
                    onChange={(v) => setParams({ frequency: v })}
                />
            )}

            {analysisType === "transient" && (
                <>
                    <FieldInput
                        label="Time step (s)"
                        value={params.tStep}
                        onChange={(v) => setParams({ tStep: v })}
                    />
                    <FieldInput
                        label="Stop time (s)"
                        value={params.tStop}
                        onChange={(v) => setParams({ tStop: v })}
                    />
                </>
            )}

            {localError && (
                <p className="font-mono text-[10px] text-circuit-error leading-relaxed">
                    {localError}
                </p>
            )}

            <button
                onClick={handleRun}
                disabled={loading}
                className="w-full py-1.5 rounded bg-circuit-accent text-circuit-bg font-mono text-[11px] font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
                {loading ? "Running…" : "▶ Run"}
            </button>
        </div>
    );
}
