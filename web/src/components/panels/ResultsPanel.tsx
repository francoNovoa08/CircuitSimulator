import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Maximize2, X } from "lucide-react";
import { useSimulationStore } from "../../store/simulationStore";
import type { DCResult, ACResult, TransientResult } from "../../engine/types";
import type { HilMeasurement, Experiment } from "../../data/experiments";
import type { NameType } from "recharts/types/component/DefaultTooltipContent";

const NODE_COLOURS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ResultsPanel() {
    const { result, error, loading, nodeLabels } = useSimulationStore();

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
                {result?.type === "dc" && (
                    <DCResults result={result} nodeLabels={nodeLabels} />
                )}
                {result?.type === "ac" && (
                    <ACResults result={result} nodeLabels={nodeLabels} />
                )}
                {result?.type === "transient" && (
                    <TransientResults result={result} nodeLabels={nodeLabels} />
                )}
            </div>
        </div>
    );
}

function DCResults({
    result,
    nodeLabels,
}: {
    result: DCResult;
    nodeLabels: Map<number, string> | null;
}) {
    return (
        <div className="space-y-1 text-slate-300">
            {result.nodes.map((n) => (
                <div key={n.node} className="flex justify-between gap-4">
                    <span className="text-slate-500">
                        V({nodeLabel(n.node, nodeLabels)})
                    </span>
                    <span className="text-emerald-400 tabular-nums">
                        {n.voltage.toPrecision(5)} V
                    </span>
                </div>
            ))}
            {result.sources.map((s) => (
                <div key={s.source} className="flex justify-between gap-4">
                    <span className="text-slate-500">I({s.source})</span>
                    <span className="text-blue-400 tabular-nums">
                        {s.current.toPrecision(5)} A
                    </span>
                </div>
            ))}
        </div>
    );
}

function ACResults({
    result,
    nodeLabels,
}: {
    result: ACResult;
    nodeLabels: Map<number, string> | null;
}) {
    return (
        <div className="space-y-1 text-slate-300">
            <div className="flex justify-between text-slate-500 border-b border-slate-700 pb-1 mb-2">
                <span>Node</span>
                <span>Mag (V)</span>
                <span>Phase (°)</span>
            </div>
            {result.nodes.map((n) => (
                <div key={n.node} className="flex justify-between gap-4">
                    <span>{nodeLabel(n.node, nodeLabels)}</span>
                    <span className="text-emerald-400 tabular-nums">
                        {n.magnitude.toPrecision(4)}
                    </span>
                    <span className="text-blue-400 tabular-nums">
                        {n.phase.toFixed(1)}
                    </span>
                </div>
            ))}
        </div>
    );
}

interface ChartData {
    combined: Record<string, number | null>[];
    nodesToPlot: number[];
    hasHil: boolean;
}

function nearestIndex(times: number[], t: number): number {
    let lo = 0;
    let hi = times.length - 1;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (times[mid] < t) lo = mid + 1;
        else hi = mid;
    }
    if (lo > 0 && Math.abs(times[lo - 1] - t) <= Math.abs(times[lo] - t)) {
        return lo - 1;
    }
    return lo;
}

function buildChartData(
    result: TransientResult,
    hilData: HilMeasurement[] | null,
    activeExperiment: Experiment | null,
    maxPoints: number,
): ChartData {
    const nodeCount = result.steps[0].nodes.length;
    const step = Math.max(1, Math.floor(result.steps.length / maxPoints));

    const hilTimes = hilData ? hilData.map((d) => d.time_ms / 1000) : [];
    const hilTolerance =
        hilTimes.length > 1
            ? (hilTimes[hilTimes.length - 1] - hilTimes[0]) /
              (hilTimes.length - 1)
            : 0;

    const combined = result.steps
        .filter((_, i) => i % step === 0)
        .map((s) => {
            const row: Record<string, number | null> = { time: s.time };
            s.nodes.forEach((v, i) => {
                row[`node${i + 1}`] = v;
            });
            row.measured = null;
            if (hilData) {
                const j = nearestIndex(hilTimes, s.time);
                if (Math.abs(hilTimes[j] - s.time) <= hilTolerance) {
                    row.measured = hilData[j].voltage;
                }
            }
            return row;
        });

    const nodesToPlot =
        hilData && activeExperiment
            ? [activeExperiment.nodeOfInterest - 1]
            : Array.from({ length: nodeCount }, (_, i) => i);

    return { combined, nodesToPlot, hasHil: !!hilData };
}

interface TransientChartProps {
    data: ChartData;
    nodeLabels: Map<number, string> | null;
    heightClassName: string;
    showLegend?: boolean;
}

function TransientChart({
    data,
    nodeLabels,
    heightClassName,
    showLegend = false,
}: TransientChartProps) {
    const { combined, nodesToPlot, hasHil } = data;
    return (
        <div className={`${heightClassName} -mx-1`}>
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
                        tickFormatter={(v) =>
                            v >= 1
                                ? `${v.toFixed(0)}s`
                                : `${(v * 1000).toFixed(0)}ms`
                        }
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
                        formatter={(v: any, name: NameType | undefined) => [
                            `${v.toFixed(4)} V`,
                            name ?? "",
                        ]}
                        labelFormatter={(v) =>
                            v >= 1
                                ? `t = ${v.toFixed(1)} s`
                                : `t = ${(v * 1000).toFixed(0)} ms`
                        }
                    />
                    {showLegend && (
                        <Legend
                            wrapperStyle={{
                                fontSize: 10,
                                fontFamily: "monospace",
                                color: "#94a3b8",
                                paddingTop: 8,
                            }}
                        />
                    )}
                    {nodesToPlot.map((i) => (
                        <Line
                            key={`sim-${i}`}
                            type="monotone"
                            dataKey={`node${i + 1}`}
                            stroke={NODE_COLOURS[i % NODE_COLOURS.length]}
                            dot={false}
                            strokeWidth={2}
                            name={
                                hasHil
                                    ? "Simulated"
                                    : nodeLabel(i + 1, nodeLabels)
                            }
                        />
                    ))}
                    {hasHil && (
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
    );
}

interface ExpandedChartModalProps {
    result: TransientResult;
    nodeLabels: Map<number, string> | null;
    hilData: HilMeasurement[] | null;
    hilRmse: number | null;
    hilTitle: string | null;
    activeExperiment: Experiment | null;
    onClose: () => void;
}

function ExpandedChartModal({
    result,
    nodeLabels,
    hilData,
    hilRmse,
    hilTitle,
    activeExperiment,
    onClose,
}: ExpandedChartModalProps) {
    const data = buildChartData(result, hilData, activeExperiment, 600);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-5xl bg-slate-900 rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
                style={{ height: "min(80vh, 600px)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Transient Response
                        </span>
                        {hilTitle && (
                            <>
                                <span className="text-slate-700">·</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                    {hilTitle}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {hilRmse != null && (
                            <span className="font-mono text-[10px] text-slate-500">
                                RMSE{" "}
                                <span className="text-amber-400 font-semibold">
                                    {hilRmse.toFixed(3)} V
                                </span>
                            </span>
                        )}
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-4 min-h-0">
                    <TransientChart
                        data={data}
                        nodeLabels={nodeLabels}
                        heightClassName="h-full"
                        showLegend
                    />
                </div>
            </div>
        </div>
    );
}

function TransientResults({
    result,
    nodeLabels,
}: {
    result: TransientResult;
    nodeLabels: Map<number, string> | null;
}) {
    const { hilData, hilRmse, hilTitle, activeExperiment } =
        useSimulationStore();
    const [expanded, setExpanded] = useState(false);

    if (result.steps.length === 0) return null;

    const data = buildChartData(result, hilData, activeExperiment, 300);

    return (
        <>
            <div className="mt-2">
                {/* Chart header row with expand button */}
                <div className="flex items-center justify-end mb-1">
                    <button
                        onClick={() => setExpanded(true)}
                        title="Expand chart"
                        className="flex items-center justify-center w-6 h-6 rounded text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                        aria-label="Expand chart"
                    >
                        <Maximize2 size={11} />
                    </button>
                </div>

                <TransientChart
                    data={data}
                    nodeLabels={nodeLabels}
                    heightClassName="h-48"
                />

                {hilData && (
                    <div className="mt-2 pt-2 border-t border-slate-700 space-y-1">
                        <div className="flex justify-between font-mono text-[10px]">
                            <span className="text-slate-500">Experiment</span>
                            <span className="text-slate-300">{hilTitle}</span>
                        </div>
                        <div className="flex justify-between font-mono text-[10px]">
                            <span className="text-slate-500">
                                RMSE vs measured
                            </span>
                            <span className="text-amber-400 font-semibold">
                                {hilRmse?.toFixed(3)} V
                            </span>
                        </div>
                        <div className="flex justify-between font-mono text-[10px]">
                            <span className="text-slate-500">Samples</span>
                            <span className="text-slate-400">
                                {hilData.length}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {expanded && (
                <ExpandedChartModal
                    result={result}
                    nodeLabels={nodeLabels}
                    hilData={hilData}
                    hilRmse={hilRmse}
                    hilTitle={hilTitle}
                    activeExperiment={activeExperiment}
                    onClose={() => setExpanded(false)}
                />
            )}
        </>
    );
}

function nodeLabel(
    node: number,
    nodeLabels: Map<number, string> | null,
): string {
    return nodeLabels?.get(node) ?? `Node ${node}`;
}
