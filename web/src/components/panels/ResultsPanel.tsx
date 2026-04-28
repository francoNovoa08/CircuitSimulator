import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useSimulationStore } from "../../store/simulationStore";
import type { DCResult, ACResult, TransientResult } from "../../engine/types";

const NODE_COLOURS = ["#4dff91", "#ffb340", "#ff5c5c", "#5c9fff", "#d04dff"];

function Section({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2 p-3 border-b border-circuit-border">
            {children}
        </div>
    );
}

function SectionTitle() {
    return (
        <span className="font-mono text-[11px] text-circuit-text">Results</span>
    );
}

export default function ResultsPanel() {
    const { result, error } = useSimulationStore();

    if (error)
        return (
            <Section>
                <SectionTitle />
                <p className="font-mono text-[10px] text-circuit-error leading-relaxed">
                    {error}
                </p>
            </Section>
        );

    if (!result)
        return (
            <Section>
                <SectionTitle />
                <p className="font-mono text-[10px] text-circuit-dim leading-relaxed">
                    Run a simulation to see results.
                </p>
            </Section>
        );

    return (
        <Section>
            <SectionTitle />
            {result.type === "dc" && <DCResults result={result} />}
            {result.type === "ac" && <ACResults result={result} />}
            {result.type === "transient" && (
                <TransientResults result={result} />
            )}
        </Section>
    );
}

function Row({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex justify-between font-mono text-[10px] gap-1">
            <span className="text-circuit-muted">{label}</span>
            <span className="text-circuit-accent text-right">{children}</span>
        </div>
    );
}

function DCResults({ result }: { result: DCResult }) {
    return (
        <div className="flex flex-col gap-1">
            {result.nodes.map((n) => (
                <Row key={n.node} label={`V(node ${n.node})`}>
                    {n.voltage.toPrecision(5)} V
                </Row>
            ))}
            {result.sources.map((s) => (
                <Row key={s.source} label={`I(V${s.source})`}>
                    {s.current.toPrecision(5)} A
                </Row>
            ))}
        </div>
    );
}

function ACResults({ result }: { result: ACResult }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px] text-circuit-dim border-b border-circuit-border pb-1 mb-1">
                <span>Node</span>
                <span>Mag (V)</span>
                <span>Phase (°)</span>
            </div>
            {result.nodes.map((n) => (
                <div
                    key={n.node}
                    className="flex justify-between font-mono text-[10px]"
                >
                    <span className="text-circuit-muted">Node {n.node}</span>
                    <span className="text-circuit-accent">
                        {n.magnitude.toPrecision(4)}
                    </span>
                    <span className="text-circuit-accent">
                        {n.phase.toFixed(2)}
                    </span>
                </div>
            ))}
        </div>
    );
}

function TransientResults({ result }: { result: TransientResult }) {
    if (result.steps.length === 0) return null;
    const nodeCount = result.steps[0].nodes.length;
    const step = Math.max(1, Math.floor(result.steps.length / 300));
    const data = result.steps
        .filter((_, i) => i % step === 0)
        .map((s) => {
            const row: Record<string, number> = { time: s.time };
            s.nodes.forEach((v, i) => {
                row[`node${i + 1}`] = v;
            });
            return row;
        });

    return (
        <div className="mt-2">
            <ResponsiveContainer width="100%" height={180}>
                <LineChart
                    data={data}
                    margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
                >
                    <XAxis
                        dataKey="time"
                        tick={{
                            fontSize: 8,
                            fill: "#4a5056",
                            fontFamily: "monospace",
                        }}
                        tickFormatter={(v) => `${(v * 1000).toFixed(1)}ms`}
                    />
                    <YAxis
                        tick={{
                            fontSize: 8,
                            fill: "#4a5056",
                            fontFamily: "monospace",
                        }}
                        tickFormatter={(v) => `${v.toFixed(1)}V`}
                        width={32}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "#151617",
                            border: "1px solid #2a2d2e",
                            fontSize: 10,
                            fontFamily: "monospace",
                        }}
                        formatter={(v: any) =>
                            typeof v === "number" ? `${v.toFixed(4)} V` : v
                        }
                        labelFormatter={(v) =>
                            `t = ${(v * 1000).toFixed(3)} ms`
                        }
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 9, fontFamily: "monospace" }}
                    />
                    {Array.from({ length: nodeCount }, (_, i) => (
                        <Line
                            key={i}
                            type="monotone"
                            dataKey={`node${i + 1}`}
                            stroke={NODE_COLOURS[i % NODE_COLOURS.length]}
                            dot={false}
                            strokeWidth={1.5}
                            name={`Node ${i + 1}`}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
