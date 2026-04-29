import { useNavigate } from "react-router-dom";
import { experiments } from "../../data/experiments";
import { useSimulationStore } from "../../store/simulationStore";
import { Activity, ArrowRight, Pencil } from "lucide-react";
import { useEffect, useRef } from "react";

const EXPERIMENT_STYLES: Record<
    string,
    { accent: string; sparkPath: string; sparkPathMeasured: string }
> = {
    rc_charging: {
        accent: "#10b981",
        sparkPath: "M 4 44 C 30 44 50 10 80 6 C 110 3 140 3 196 3",
        sparkPathMeasured: "M 4 44 C 32 46 52 14 82 10 C 112 6 142 6 196 6",
    },
    rc_leaky: {
        accent: "#f59e0b",
        sparkPath: "M 4 44 C 20 44 40 20 70 14 C 100 9 130 16 196 18",
        sparkPathMeasured: "M 4 44 C 22 44 42 24 72 20 C 102 14 132 22 196 24",
    },
    rc_discharge: {
        accent: "#6366f1",
        sparkPath: "M 4 4 C 30 4 50 38 80 43 C 110 46 140 46 196 46",
        sparkPathMeasured: "M 4 4 C 32 4 52 40 82 45 C 112 47 142 47 196 47",
    },
};

function AnimatedPath({ d, stroke, strokeWidth, strokeDasharray, opacity }: {
    d: string; stroke: string; strokeWidth: number;
    strokeDasharray?: string; opacity?: number;
}) {
    const ref = useRef<SVGPathElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const len = el.getTotalLength();
        el.style.strokeDasharray = String(len);
        el.style.strokeDashoffset = String(len);
        // Trigger reflow then animate
        void el.getBoundingClientRect();
        el.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.strokeDashoffset = '0';
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

    // Scroll reveal for cards and steps
    useEffect(() => {
        const els = document.querySelectorAll<HTMLElement>('.scroll-reveal');
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target as HTMLElement;
                        const delay = el.dataset.delay ?? '0';
                        setTimeout(() => el.classList.add('visible'), parseInt(delay));
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.15 }
        );
        els.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-3.5 anim-fade-in">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                        <Activity size={16} />
                    </div>
                    <span className="font-bold tracking-tight text-slate-900">CircuitSim</span>
                    <button
                        onClick={handleScratch}
                        className="ml-auto text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        Open lab →
                    </button>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-white border-b border-slate-200 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                        backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />
                <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-2 gap-12 items-center relative z-10">
                    {/* Hero left — staggered entrance */}
                    <div>
                        <div
                            className="anim-fade-up inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-[11px] font-semibold mb-5"
                            style={{ animationDelay: '0.05s' }}
                        >
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Hardware-in-the-Loop · WebAssembly
                        </div>
                        <h1
                            className="anim-fade-up text-4xl font-bold tracking-tight text-slate-900 leading-[1.15] mb-4 max-w-sm"
                            style={{ animationDelay: '0.12s' }}
                        >
                            Where simulation meets{" "}
                            <span className="text-emerald-600">physical</span>{" "}
                            reality
                        </h1>
                        <p
                            className="anim-fade-up text-sm text-slate-500 leading-relaxed mb-7 max-w-sm"
                            style={{ animationDelay: '0.2s' }}
                        >
                            Draw a circuit, run a SPICE simulation, then overlay
                            real voltage measurements sampled by an Arduino. See
                            exactly where theory diverges from reality.
                        </p>
                        <div
                            className="anim-fade-up flex items-center gap-3"
                            style={{ animationDelay: '0.28s' }}
                        >
                            <button
                                onClick={handleScratch}
                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <Pencil size={13} />
                                Build your own circuit
                            </button>
                            <button
                                onClick={() => document.getElementById("experiments")?.scrollIntoView({ behavior: "smooth" })}
                                className="text-sm text-slate-500 border border-slate-200 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                            >
                                View experiments ↓
                            </button>
                        </div>
                    </div>

                    {/* Oscilloscope — curves draw on mount */}
                    <div
                        className="anim-fade-up bg-slate-900 rounded-xl border border-slate-700 p-4"
                        style={{ animationDelay: '0.18s' }}
                    >
                        <p className="font-mono text-[10px] text-slate-500 mb-3 tracking-wider uppercase">
                            RC Charging — 10kΩ · 105µF · 4.78V
                        </p>
                        <svg width="100%" height="160" viewBox="0 0 320 160">
                            {[40, 80, 120].map(y => (
                                <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#1e293b" strokeWidth="0.5" />
                            ))}
                            {[80, 160, 240].map(x => (
                                <line key={x} x1={x} y1="0" x2={x} y2="160" stroke="#1e293b" strokeWidth="0.5" />
                            ))}
                            <text x="4" y="38" fill="#475569" fontFamily="monospace" fontSize="8">4.8V</text>
                            <text x="4" y="78" fill="#475569" fontFamily="monospace" fontSize="8">2.4V</text>
                            <text x="4" y="118" fill="#475569" fontFamily="monospace" fontSize="8">0.0V</text>

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

                            <line x1="24" y1="16" x2="40" y2="16" stroke="#10b981" strokeWidth="2" />
                            <text x="44" y="19" fill="#94a3b8" fontFamily="monospace" fontSize="8">Simulated</text>
                            <line x1="112" y1="16" x2="128" y2="16" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
                            <text x="132" y="19" fill="#94a3b8" fontFamily="monospace" fontSize="8">Measured</text>
                            <line x1="230" y1="27" x2="230" y2="30" stroke="#6366f1" strokeWidth="1" />
                            <line x1="230" y1="27" x2="258" y2="20" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="2 2" />
                            <text x="260" y="20" fill="#818cf8" fontFamily="monospace" fontSize="7.5">RMSE 0.101V</text>
                        </svg>
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-3 gap-6">
                {[
                    { num: "01", title: "Draw", body: "Place resistors, capacitors, and sources on a schematic canvas. Connect with wires.", accent: "border-indigo-400", delay: 0 },
                    { num: "02", title: "Simulate", body: "A C++ MNA SPICE engine compiled to WebAssembly runs DC, AC, or transient analysis in your browser.", accent: "border-sky-400", delay: 100 },
                    { num: "03", title: "Compare", body: "Overlay real Arduino measurements against the simulation curve — RMSE included.", accent: "border-emerald-400", delay: 200 },
                ].map(({ num, title, body, accent, delay }) => (
                    <div
                        key={num}
                        className={`scroll-reveal border-l-[3px] ${accent} pl-4`}
                        data-delay={delay}
                    >
                        <p className="font-mono text-[10px] font-bold text-slate-400 mb-2 tracking-widest">{num}</p>
                        <h3 className="font-bold text-slate-900 text-sm mb-1.5">{title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
                    </div>
                ))}
            </section>

            {/* Experiments */}
            <section id="experiments" className="border-t border-slate-200 bg-white">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="scroll-reveal mb-7" data-delay="0">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1.5">HIL Experiments</h2>
                        <p className="text-sm text-slate-500">
                            Three physical RC circuits, sampled at 50ms intervals, validated against the SPICE model.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {experiments.map((exp, i) => {
                            const style = EXPERIMENT_STYLES[exp.id];
                            return (
                                <div
                                    key={exp.id}
                                    className="scroll-reveal border border-slate-200 rounded-xl overflow-hidden flex flex-col"
                                    data-delay={i * 80}
                                >
                                    <div style={{ height: 3, background: style?.accent ?? "#64748b" }} />
                                    <div className="p-5 flex flex-col gap-4 flex-1">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm mb-1.5">{exp.title}</h3>
                                            <p className="text-[11px] text-slate-500 leading-relaxed">{exp.description}</p>
                                        </div>
                                        {style && (
                                            <svg width="100%" height="48" viewBox="0 0 200 48" preserveAspectRatio="none">
                                                <path d={style.sparkPath} fill="none" stroke="#10b981" strokeWidth="1.5" />
                                                <path d={style.sparkPathMeasured} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
                                            </svg>
                                        )}
                                        <div className="flex items-center justify-between mt-auto">
                                            <div>
                                                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Final RMSE</p>
                                                <p className="font-mono font-bold text-amber-600 text-base">{exp.rmse.toFixed(3)} V</p>
                                            </div>
                                            <button
                                                onClick={() => handleLoadExperiment(exp.id)}
                                                className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-700 active:scale-[0.97] transition-all cursor-pointer"
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

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white px-6 py-5">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex gap-2">
                        {["C++ MNA", "WebAssembly", "Arduino HIL"].map(t => (
                            <span key={t} className="font-mono text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
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