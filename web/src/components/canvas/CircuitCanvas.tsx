import { useRef, useState, useCallback, useEffect } from "react";
import {
    getTerminals,
    getOccupiedCells,
    useCircuitStore,
} from "../../store/circuitStore";
import type {
    ComponentType,
    PlacedComponent,
    Point,
} from "../../store/circuitStore";
import { ComponentSymbol } from "./ComponentSymbols";

const CELL = 40;
const TERMINAL_SNAP_RADIUS = 0.5;

function isCellOccupied(components: PlacedComponent[], pt: Point): boolean {
    return components.some((c) =>
        getOccupiedCells(c).some((cell) => cell.x === pt.x && cell.y === pt.y),
    );
}

function getAllTerminals(components: PlacedComponent[]): Point[] {
    const pts: Point[] = [];
    for (const comp of components) {
        if (comp.type === "ground") {
            pts.push(comp.position);
        } else {
            const [a, b] = getTerminals(comp);
            pts.push(a, b);
        }
    }
    return pts;
}

function snapToTerminal(pt: Point, terminals: Point[]): Point | null {
    for (const t of terminals) {
        const dx = pt.x - t.x;
        const dy = pt.y - t.y;
        if (Math.sqrt(dx * dx + dy * dy) <= TERMINAL_SNAP_RADIUS) {
            return t;
        }
    }
    return null;
}

interface Props {
    activeTool: ComponentType | "select" | "wire";
}

function gridPoint(px: number, py: number, rect: DOMRect): Point {
    return {
        x: (px - rect.left) / CELL,
        y: (py - rect.top) / CELL,
    };
}

function snapGridPoint(px: number, py: number, rect: DOMRect): Point {
    const raw = gridPoint(px, py, rect);
    return { x: Math.round(raw.x), y: Math.round(raw.y) };
}

export default function CircuitCanvas({ activeTool }: Props) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const {
        components,
        wires,
        selectedId,
        addComponent,
        selectComponent,
        removeComponent,
        addWire,
        removeWire,
    } = useCircuitStore();
    const [hoverCell, setHoverCell] = useState<Point | null>(null);
    const [size, setSize] = useState({ width: 960, height: 640 });

    const [wireStart, setWireStart] = useState<Point | null>(null);
    const [wirePreview, setWirePreview] = useState<Point | null>(null);
    const [snapHighlight, setSnapHighlight] = useState<Point | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setWireStart(null);
                setWirePreview(null);
            }
            if (
                (e.key === "Delete" || e.key === "Backspace") &&
                !(e.target instanceof HTMLInputElement) &&
                selectedId
            ) {
                removeComponent(selectedId);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedId, removeComponent]);

    useEffect(() => {
        if (!wrapperRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setSize({
                width: Math.floor(width / CELL) * CELL,
                height: Math.floor(height / CELL) * CELL,
            });
        });
        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, []);

    const cols = size.width / CELL;
    const rows = size.height / CELL;
    const terminals = getAllTerminals(components);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!svgRef.current) return;
            const rect = svgRef.current.getBoundingClientRect();
            const raw = gridPoint(e.clientX, e.clientY, rect);
            const snapped = { x: Math.round(raw.x), y: Math.round(raw.y) };

            if (raw.x >= 0 && raw.x <= cols && raw.y >= 0 && raw.y <= rows) {
                setHoverCell(snapped);
            } else {
                setHoverCell(null);
            }

            if (activeTool === "wire") {
                const terminal = snapToTerminal(raw, terminals);
                setSnapHighlight(terminal);
                setWirePreview(terminal ?? snapped);
            }
        },
        [activeTool, terminals, cols, rows],
    );

    const handleMouseLeave = useCallback(() => {
        setHoverCell(null);
        setWirePreview(null);
        setSnapHighlight(null);
    }, []);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (!svgRef.current) return;

            const target = e.target as SVGElement;

            if (activeTool === "select") {
                if (!target.closest("[data-component]")) {
                    selectComponent(null);
                }
                return;
            }

            const rect = svgRef.current.getBoundingClientRect();
            const raw = gridPoint(e.clientX, e.clientY, rect);
            const snapped = snapGridPoint(e.clientX, e.clientY, rect);

            if (activeTool === "wire") {
                const terminal = snapToTerminal(raw, terminals) ?? snapped;
                if (!wireStart) {
                    setWireStart(terminal);
                    setWirePreview(terminal);
                } else {
                    if (
                        terminal.x !== wireStart.x ||
                        terminal.y !== wireStart.y
                    ) {
                        addWire(wireStart, terminal);
                    }
                    setWireStart(null);
                    setWirePreview(null);
                }
                return;
            }

            if (!isCellOccupied(components, snapped)) {
                addComponent(activeTool, snapped);
            }
        },
        [
            activeTool,
            wireStart,
            terminals,
            components,
            addComponent,
            addWire,
            selectComponent,
        ],
    );

    const cursorStyle =
        activeTool === "select"
            ? "default"
            : activeTool === "wire"
              ? "crosshair"
              : "cell";

    return (
        <div ref={wrapperRef} className="canvas-wrapper">
            <svg
                ref={svgRef}
                width={size.width}
                height={size.height}
                viewBox={`0 0 ${size.width} ${size.height}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                style={{ cursor: cursorStyle, display: "block" }}
            >
                <GridDots cols={cols} rows={rows} cell={CELL} />

                {hoverCell &&
                    activeTool !== "select" &&
                    activeTool !== "wire" &&
                    !isCellOccupied(components, hoverCell) && (
                        <circle
                            cx={hoverCell.x * CELL}
                            cy={hoverCell.y * CELL}
                            r={5}
                            className="canvas-hover"
                        />
                    )}
                {activeTool === "wire" &&
                    terminals.map((t, i) => (
                        <circle
                            key={i}
                            cx={t.x * CELL}
                            cy={t.y * CELL}
                            r={4}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth={1}
                            opacity={0.4}
                        />
                    ))}

                {snapHighlight && (
                    <circle
                        cx={snapHighlight.x * CELL}
                        cy={snapHighlight.y * CELL}
                        r={6}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        opacity={0.9}
                    />
                )}

                {wireStart && wirePreview && (
                    <line
                        x1={wireStart.x * CELL}
                        y1={wireStart.y * CELL}
                        x2={wirePreview.x * CELL}
                        y2={wirePreview.y * CELL}
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        opacity={0.7}
                        strokeLinecap="round"
                    />
                )}

                {wires.map((w) => (
                    <g key={w.id}>
                        <line
                            x1={w.from.x * CELL}
                            y1={w.from.y * CELL}
                            x2={w.to.x * CELL}
                            y2={w.to.y * CELL}
                            stroke="transparent"
                            strokeWidth={12}
                            style={{
                                cursor:
                                    activeTool === "select"
                                        ? "pointer"
                                        : "default",
                            }}
                            onClick={(e) => {
                                if (activeTool === "select") {
                                    e.stopPropagation();
                                    removeWire(w.id);
                                }
                            }}
                        />
                        <line
                            x1={w.from.x * CELL}
                            y1={w.from.y * CELL}
                            x2={w.to.x * CELL}
                            y2={w.to.y * CELL}
                            className="canvas-wire"
                            style={{ pointerEvents: "none" }}
                        />
                    </g>
                ))}

                {wireStart && (
                    <circle
                        cx={wireStart.x * CELL}
                        cy={wireStart.y * CELL}
                        r={4}
                        fill="#3b82f6"
                        opacity={0.8}
                    />
                )}

                {components.map((comp) => (
                    <g
                        key={comp.id}
                        data-component={comp.id}
                        onClick={(e) => {
                            if (activeTool === "select") {
                                e.stopPropagation();
                                selectComponent(comp.id);
                            }
                        }}
                        style={{
                            cursor:
                                activeTool === "select" ? "pointer" : "inherit",
                        }}
                    >
                        <ComponentSymbol
                            type={comp.type}
                            x={comp.position.x * CELL}
                            y={comp.position.y * CELL}
                            selected={comp.id === selectedId}
                            label={comp.name}
                            value={comp.value}
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
}

function GridDots({
    cols,
    rows,
    cell,
}: {
    cols: number;
    rows: number;
    cell: number;
}) {
    const dots: React.ReactNode[] = [];
    for (let x = 0; x <= cols; x++) {
        for (let y = 0; y <= rows; y++) {
            dots.push(
                <circle
                    key={`${x}-${y}`}
                    cx={x * cell}
                    cy={y * cell}
                    r={1.5}
                    className="canvas-dot"
                />,
            );
        }
    }
    return <>{dots}</>;
}
