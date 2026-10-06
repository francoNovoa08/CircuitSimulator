import type { Point } from "../../store/circuitStore";
import { ComponentSymbol } from "../canvas/ComponentSymbols";

const CELL = 40;

const toPixels = (p: Point): Point => ({ x: p.x * CELL, y: p.y * CELL });

const resistor = toPixels({ x: 2, y: 1 });
const source = toPixels({ x: 2, y: 3 });
const ground = toPixels({ x: 3, y: 4 });

const wires: Array<{ from: Point; to: Point }> = [
    { from: { x: 2, y: 3 }, to: { x: 2, y: 1 } },
    { from: { x: 3, y: 1 }, to: { x: 3, y: 3 } },
    { from: { x: 3, y: 3 }, to: { x: 3, y: 4 } },
].map(({ from, to }) => ({ from: toPixels(from), to: toPixels(to) }));

export default function GroundDiagram() {
    return (
        <figure className="m-0 w-44 shrink-0">
            <svg
                viewBox="60 14 120 172"
                role="img"
                aria-label="A voltage source and a resistor in a loop, with a ground symbol wired to the negative terminal of the source"
                className="w-full rounded-md border border-slate-200 bg-slate-50"
            >
                {wires.map((w, i) => (
                    <line
                        key={i}
                        x1={w.from.x}
                        y1={w.from.y}
                        x2={w.to.x}
                        y2={w.to.y}
                        className="canvas-wire"
                    />
                ))}

                <ComponentSymbol
                    type="resistor"
                    x={resistor.x}
                    y={resistor.y}
                    selected={false}
                    label="R1"
                    value={1000}
                />
                <ComponentSymbol
                    type="voltageSource"
                    x={source.x}
                    y={source.y}
                    selected={false}
                    label="V1"
                    value={5}
                />
                <ComponentSymbol
                    type="ground"
                    x={ground.x}
                    y={ground.y}
                    selected
                    label="GND"
                    value={0}
                />

                <circle
                    cx={ground.x}
                    cy={ground.y}
                    r={6}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                />
                <text
                    x={ground.x + 18}
                    y={ground.y + 4}
                    fontSize={9}
                    fontFamily="monospace"
                    fill="#475569"
                >
                    0 V
                </text>
            </svg>
            <figcaption className="mt-2 text-xs leading-snug text-slate-500">
                V1 and R1 in a loop, with the ground wired to the negative
                terminal of V1.
            </figcaption>
        </figure>
    );
}