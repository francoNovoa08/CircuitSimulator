import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useSimulationStore } from "../../store/simulationStore";
import type { DCResult, ACResult, TransientResult } from "../../engine/types";

const NODE_COLOURS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ResultsPanel() {
    const { result, error, loading } = useSimulationStore();

    return (
        <div className="flex-1 flex flex-col bg-slate-900 min-h-50">
            <div className="px-4 py-2 border-b border-slate-800 bg-slate-950 flex items-center shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Results Console
                </span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
                {loading && (
                    <div className="text-emerald-400 animate-pulse">
                        Running simulation...
                    </div>
                )}
                {error && !loading && (
                    <div className="text-red-400">Error: {error}</div>
                )}
                {!result && !error && !loading && (
                    <div className="text-slate-500">
                        Ready. Waiting for parameters...
                    </div>
                )}
                {result?.type === "dc" && <DCResults result={result} />}
                {result?.type === "ac" && <ACResults result={result} />}
                {result?.type === "transient" && (
                    <TransientResults result={result} />
                )}
            </div>
        </div>
    );
}

function DCResults({ result }: { result: DCResult }) {
    return (
        <div className="space-y-1 text-slate-300">
            {result.nodes.map((n) => (
                <div key={n.node} className="flex justify-between">
                    <span className="text-slate-500">V(node {n.node})</span>
                    <span className="text-emerald-400">
                        {n.voltage.toPrecision(5)} V
                    </span>
                </div>
            ))}
            {result.sources.map((s) => (
                <div key={s.source} className="flex justify-between">
                    <span className="text-slate-500">I(V{s.source})</span>
                    <span className="text-blue-400">
                        {s.current.toPrecision(5)} A
                    </span>
                </div>
            ))}
        </div>
    );
}

function ACResults({ result }: { result: ACResult }) {
    return (
        <div className="space-y-1 text-slate-300">
            <div className="flex justify-between text-slate-500 border-b border-slate-700 pb-1 mb-2">
                <span>Node</span>
                <span>Mag (V)</span>
                <span>Phase (°)</span>
            </div>
            {result.nodes.map((n) => (
                <div key={n.node} className="flex justify-between">
                    <span>Node {n.node}</span>
                    <span className="text-emerald-400">
                        {n.magnitude.toPrecision(4)}
                    </span>
                    <span className="text-blue-400">{n.phase.toFixed(1)}</span>
                </div>
            ))}
        </div>
    );
}

function TransientResults({ result }: { result: TransientResult }) {
    const { hilData, hilRmse, hilTitle, activeExperiment } =
        useSimulationStore();

    if (result.steps.length === 0) return null;

    const nodeCount = result.steps[0].nodes.length;
    const step = Math.max(1, Math.floor(result.steps.length / 300));

    const simData = result.steps
        .filter((_, i) => i % step === 0)
        .map((s) => {
            const row: Record<string, number> = { time: s.time };
            s.nodes.forEach((v, i) => {
                row[`node${i + 1}`] = v;
            });
            return row;
        });

    const hilStep = hilData ? Math.max(1, Math.floor(hilData.length / 300)) : 1;

    const hilSeries = hilData
        ? hilData
              .filter((_, i) => i % hilStep === 0)
              .map((d) => ({ time: d.time_ms / 1000, measured: d.voltage }))
        : [];

    const combined = simData.map((s) => {
        const closest = hilSeries.find(
            (h) => Math.abs(h.time - s.time) < 0.026,
        );
        return { ...s, measured: closest?.measured ?? null };
    });

    const nodesToPlot =
        hilData && activeExperiment
            ? [activeExperiment.nodeOfInterest - 1]
            : Array.from({ length: nodeCount }, (_, i) => i);

    return (
        <div className="mt-2">
            <div className="h-48 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={combined}
                        margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
                    >
                        <XAxis
                            dataKey="time"
                            tick={{
                                fontSize: 9,
                                fill: "#64748b",
                                fontFamily: "monospace",
                            }}
                            tickFormatter={(v) => `${(v * 1000).toFixed(0)}ms`}
                            stroke="#334155"
                        />
                        <YAxis
                            tick={{
                                fontSize: 9,
                                fill: "#64748b",
                                fontFamily: "monospace",
                            }}
                            tickFormatter={(v) => `${v.toFixed(1)}V`}
                            width={35}
                            stroke="#334155"
                        />
                        <Tooltip
                            contentStyle={{
                                background: "#0f172a",
                                border: "1px solid #334155",
                                fontSize: 11,
                                fontFamily: "monospace",
                                color: "#f8fafc",
                                borderRadius: 6,
                            }}
                            labelStyle={{ color: "#94a3b8" }}
                            formatter={(v: any) => `${v.toFixed(4)} V`}
                            labelFormatter={(v) =>
                                `t = ${(v * 1000).toFixed(0)} ms`
                            }
                        />
                        {nodesToPlot.map((i) => (
                            <Line
                                key={`sim-${i}`}
                                type="monotone"
                                dataKey={`node${i + 1}`}
                                stroke={NODE_COLOURS[i % NODE_COLOURS.length]}
                                dot={false}
                                strokeWidth={2}
                                name={
                                    hilData
                                        ? "Simulated"
                                        : `Node ${i + 1} (sim)`
                                }
                            />
                        ))}
                        {hilData && (
                            <Line
                                type="monotone"
                                dataKey="measured"
                                stroke="#f59e0b"
                                strokeDasharray="4 3"
                                dot={false}
                                strokeWidth={1.5}
                                name="Measured (Arduino)"
                                connectNulls={false}
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {hilData && (
                <div className="mt-2 pt-2 border-t border-slate-700 space-y-1">
                    <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-slate-500">Experiment</span>
                        <span className="text-slate-300">{hilTitle}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-slate-500">RMSE vs measured</span>
                        <span className="text-amber-400 font-semibold">
                            {hilRmse?.toFixed(3)} V
                        </span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-slate-500">Samples</span>
                        <span className="text-slate-400">{hilData.length}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
