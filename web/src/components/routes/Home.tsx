import { useNavigate } from "react-router-dom";
import { experiments } from "../../data/experiments";
import { useSimulationStore } from "../../store/simulationStore";
import { ArrowRight, Pencil } from "lucide-react";
import { useEffect, useRef } from "react";
import Icon from "../../assets/Icon.png";
import Accordion from "../ui/Accordion";
import { Fragment } from "react";

const FAQ_ITEMS = [
    {
        question: "What is a Hardware-in-the-Loop simulation?",
        answer: "Hardware-in-the-Loop (HIL) connects a physical circuit to a simulation running in parallel. Here, an Arduino samples real voltage from a breadboard RC circuit and sends it to the engine, which simultaneously computes the theoretical voltage.",
    },
    {
        question: "The simulation doesn't work, why?",
        answer: "The simulator is based on a SPICE engine, which means a ground component is obligatory. If the ground component doesn't fix the circuit, try following a SPICE-working circuit. If it still doesn't work, please report the bug.",
    },
    {
        question: "Why does the simulation run in the browser?",
        answer: "The C++ engine was compiled to WebAssembly, which runs at near-native speed inside the browser, so no installation or server is required.",
    },
    {
        question: "Can I simulate my own circuits?",
        answer: "Yes — click 'Build your own circuit' to open the schematic editor. Place components from the left panel, connect them with wires, set component values in the right panel, and run DC, AC, or transient analysis. The same MNA engine that validated the HIL experiments runs your circuit.",
    },
];

const EXPERIMENT_STYLES: Record<
    string,
    { sparkPath: string; sparkPathMeasured: string }
> = {
    rc_charging: {
        sparkPath: "M 4 44 C 30 44 50 10 80 6 C 110 3 140 3 196 3",
        sparkPathMeasured: "M 4 44 C 32 46 52 14 82 10 C 112 6 142 6 196 6",
    },
    rc_leaky: {
        sparkPath: "M 4 44 C 20 44 40 20 70 14 C 100 9 130 16 196 18",
        sparkPathMeasured: "M 4 44 C 22 44 42 24 72 20 C 102 14 132 22 196 24",
    },
    rc_discharge: {
        sparkPath: "M 4 4 C 30 4 50 38 80 43 C 110 46 140 46 196 46",
        sparkPathMeasured: "M 4 4 C 32 4 52 40 82 45 C 112 47 142 47 196 47",
    },
};

function AnimatedPath({
    d,
    stroke,
    strokeWidth,
    strokeDasharray,
    opacity,
}: {
    d: string;
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
    opacity?: number;
}) {
    const ref = useRef<SVGPathElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const len = el.getTotalLength();
        el.style.strokeDasharray = String(len);
        el.style.strokeDashoffset = String(len);
        void el.getBoundingClientRect();
        el.style.transition =
            "stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)";
        el.style.strokeDashoffset = "0";
    }, []);

    return (
        <path
            ref={ref}
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            opacity={opacity ?? 1}
        />
    );
}

export default function Home() {
    const navigate = useNavigate();
    const { setPendingExperiment } = useSimulationStore();

    const handleLoadExperiment = (id: string) => {
        setPendingExperiment(id);
        navigate("/lab");
    };

    const handleScratch = () => {
        setPendingExperiment(null);
        navigate("/lab");
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100">
            <header className="bg-white border-b border-slate-200 px-6 py-3.5 anim-fade-in">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <img
                        src={Icon}
                        alt="HIL Circuit Simulator"
                        className="w-12"
                    />
                    <span className="font-bold tracking-tight text-slate-900">
                        HIL Circuit Simulator
                    </span>
                    <button
                        onClick={handleScratch}
                        className="ml-auto text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 transition-colors cursor-pointer"
                    >
                        Open lab
                    </button>
                </div>
            </header>

            <section className="bg-white border-b border-slate-200 relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
            linear-gradient(to bottom, transparent 47%, #ffffff 47%, #ffffff 53%, transparent 53%),
            radial-gradient(circle, rgba(203, 213, 225, 0.4) 1px, transparent 1px)
        `,
                        backgroundSize: "100% 100%, 24px 24px",
                    }}
                />
                <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <h1
                            className="anim-fade-up text-4xl font-bold tracking-tight text-slate-900 leading-[1.15] mb-4 max-w-sm"
                            style={{ animationDelay: "0.12s" }}
                        >
                            Where simulation meets{" "}
                            <span className="text-amber-600">physical</span>{" "}
                            reality
                        </h1>
                        <p
                            className="anim-fade-up text-sm text-slate-500 leading-relaxed mb-7 max-w-sm"
                            style={{ animationDelay: "0.2s" }}
                        >
                            Draw a circuit, run a SPICE simulation, then overlay
                            real voltage measurements sampled by an Arduino. See
                            exactly where theory diverges from reality.
                        </p>
                        <div
                            className="anim-fade-up flex items-center gap-3"
                            style={{ animationDelay: "0.28s" }}
                        >
                            <button
                                onClick={handleScratch}
                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 shadow-sm hover:shadow transition-all cursor-pointer"
                            >
                                <Pencil size={13} />
                                Build your own circuit
                            </button>
                            <button
                                onClick={() =>
                                    document
                                        .getElementById("experiments")
                                        ?.scrollIntoView({ behavior: "smooth" })
                                }
                                className="text-sm text-slate-500 border border-slate-200 px-4 py-2.5 rounded-lg hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 transition-colors cursor-pointer bg-white"
                            >
                                View experiments ↓
                            </button>
                        </div>
                    </div>

                    {/* Oscilloscope — curves draw on mount */}
                    <div
                        className="anim-fade-up bg-slate-900 rounded-xl border border-slate-700 p-4"
                        style={{ animationDelay: "0.18s" }}
                    >
                        <p className="font-mono text-[10px] text-slate-500 mb-3 tracking-wider uppercase">
                            RC Charging — 10kΩ · 105µF · 4.951V
                        </p>
                        <svg width="100%" height="160" viewBox="0 0 320 160">
                            {[40, 80, 120].map((y) => (
                                <line
                                    key={y}
                                    x1="0"
                                    y1={y}
                                    x2="320"
                                    y2={y}
                                    stroke="#1e293b"
                                    strokeWidth="0.5"
                                />
                            ))}
                            {[80, 160, 240].map((x) => (
                                <line
                                    key={x}
                                    x1={x}
                                    y1="0"
                                    x2={x}
                                    y2="160"
                                    stroke="#1e293b"
                                    strokeWidth="0.5"
                                />
                            ))}
                            <text
                                x="4"
                                y="38"
                                fill="#475569"
                                fontFamily="monospace"
                                fontSize="8"
                            >
                                4.8V
                            </text>
                            <text
                                x="4"
                                y="78"
                                fill="#475569"
                                fontFamily="monospace"
                                fontSize="8"
                            >
                                2.4V
                            </text>
                            <text
                                x="4"
                                y="118"
                                fill="#475569"
                                fontFamily="monospace"
                                fontSize="8"
                            >
                                0.0V
                            </text>

                            <AnimatedPath
                                d="M 20 140 C 60 140 70 50 100 38 C 130 28 160 28 310 27"
                                stroke="#10b981"
                                strokeWidth={2}
                            />
                            <AnimatedPath
                                d="M 20 140 C 62 142 72 54 102 42 C 134 31 162 31 310 30"
                                stroke="#f59e0b"
                                strokeWidth={1.5}
                                strokeDasharray="5 4"
                                opacity={0.85}
                            />

                            <line
                                x1="24"
                                y1="16"
                                x2="40"
                                y2="16"
                                stroke="#10b981"
                                strokeWidth="2"
                            />
                            <text
                                x="44"
                                y="19"
                                fill="#94a3b8"
                                fontFamily="monospace"
                                fontSize="8"
                            >
                                Simulated
                            </text>
                            <line
                                x1="112"
                                y1="16"
                                x2="128"
                                y2="16"
                                stroke="#f59e0b"
                                strokeWidth="1.5"
                                strokeDasharray="4 3"
                            />
                            <text
                                x="132"
                                y="19"
                                fill="#94a3b8"
                                fontFamily="monospace"
                                fontSize="8"
                            >
                                Measured
                            </text>
                            <line
                                x1="230"
                                y1="27"
                                x2="230"
                                y2="30"
                                stroke="#6366f1"
                                strokeWidth="1"
                            />
                            <line
                                x1="230"
                                y1="27"
                                x2="258"
                                y2="20"
                                stroke="#6366f1"
                                strokeWidth="0.8"
                                strokeDasharray="2 2"
                            />
                            <text
                                x="260"
                                y="20"
                                fill="#818cf8"
                                fontFamily="monospace"
                                fontSize="7.5"
                            >
                                RMSE 0.037V
                            </text>
                        </svg>
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex items-start">
                    {[
                        {
                            num: "01",
                            title: "Draw",
                            body: "Place resistors, capacitors, and sources on a schematic canvas. Connect with wires.",
                            circle: "bg-slate-100 text-slate-500",
                        },
                        {
                            num: "02",
                            title: "Simulate",
                            body: "A C++ MNA SPICE engine compiled to WebAssembly runs DC, AC, or transient analysis in your browser.",
                            circle: "bg-teal-100 text-teal-700",
                        },
                        {
                            num: "03",
                            title: "Compare",
                            body: "Overlay real Arduino measurements against the simulation curve, RMSE included.",
                            circle: "bg-amber-100 text-amber-700",
                        },
                    ].map(({ num, title, body, circle }, i, arr) => (
                        <Fragment key={num}>
                            <div className="flex-1">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-[11px] font-bold mb-3 ${circle}`}
                                >
                                    {num}
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                                    {title}
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {body}
                                </p>
                            </div>
                            {i < arr.length - 1 && (
                                <div className="w-8 h-px bg-slate-200 mt-4 shrink-0" />
                            )}
                        </Fragment>
                    ))}
                </div>
            </section>

            <section
                id="experiments"
                className="border-t border-slate-200 bg-white"
            >
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="mb-7">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1.5">
                            HIL Experiments
                        </h2>
                        <p className="text-sm text-slate-500">
                            Three physical RC circuits, sampled at 50ms
                            intervals, validated against the SPICE model.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {experiments.map((exp) => {
                            const style = EXPERIMENT_STYLES[exp.id];
                            return (
                                <div
                                    key={exp.id}
                                    className="border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-teal-300 hover:shadow-sm transition-shadow"
                                >
                                    <div className="p-5 flex flex-col gap-4 flex-1">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                                                {exp.title}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                                {exp.description}
                                            </p>
                                        </div>
                                        {style && (
                                            <div className="bg-slate-900 rounded-lg p-2">
                                                <svg
                                                    width="100%"
                                                    height="48"
                                                    viewBox="0 0 200 48"
                                                    preserveAspectRatio="none"
                                                >
                                                    <path
                                                        d={style.sparkPath}
                                                        fill="none"
                                                        stroke="#10b981"
                                                        strokeWidth="1.5"
                                                    />
                                                    <path
                                                        d={style.sparkPathMeasured}
                                                        fill="none"
                                                        stroke="#f59e0b"
                                                        strokeWidth="1"
                                                        strokeDasharray="3 3"
                                                        opacity="0.8"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-auto gap-3">
                                            <div className="font-mono text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 rounded px-2.5 py-1.5">
                                                {exp.rmse.toFixed(3)} V
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleLoadExperiment(exp.id)
                                                }
                                                className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-700 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 transition-all cursor-pointer"
                                            >
                                                Load <ArrowRight size={11} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-7">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1.5">
                        How it works
                    </h2>
                    <p className="text-sm text-slate-500">
                        Common questions about the simulator and the HIL
                        methodology.
                    </p>
                </div>

                <Accordion items={FAQ_ITEMS} />
            </section>

            <footer className="border-t border-slate-200 bg-white px-6 py-5">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex gap-2">
                        {["C++ MNA", "WebAssembly", "Arduino HIL"].map((t) => (
                            <span
                                key={t}
                                className="font-mono text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                    <span className="text-xs text-slate-400">Franco Novoa</span>
                </div>
            </footer>
        </div>
    );
}
