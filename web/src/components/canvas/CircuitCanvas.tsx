import { useRef, useState, useCallback, useEffect } from "react";
import { useCircuitStore } from "../../store/circuitStore";
import type {
    ComponentType,
    PlacedComponent,
    Point,
} from "../../store/circuitStore";

const CELL = 40;

function isCellOccupied(components: PlacedComponent[], pt: Point): boolean {
    return components.some(
        (c) => c.position.x === pt.x && c.position.y === pt.y,
    );
}

interface Props {
    activeTool: ComponentType | "select" | "wire";
}

function gridPoint(px: number, py: number, rect: DOMRect): Point {
    return {
        x: Math.round((px - rect.left) / CELL),
        y: Math.round((py - rect.top) / CELL),
    };
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
    } = useCircuitStore();
    const [hoverCell, setHoverCell] = useState<Point | null>(null);
    const [size, setSize] = useState({ width: 960, height: 640 });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (selectedId) {
                    removeComponent(selectedId);
                }
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

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!svgRef.current) return;
        const pt = gridPoint(
            e.clientX,
            e.clientY,
            svgRef.current.getBoundingClientRect(),
        );
        if (pt.x >= 0 && pt.x <= cols && pt.y >= 0 && pt.y <= rows) {
            setHoverCell(pt);
        } else {
            setHoverCell(null);
        }
    }, []);

    const handleMouseLeave = useCallback(() => setHoverCell(null), []);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (!svgRef.current) return;

            const target = e.target as SVGElement;
            if (target.closest("[data-component]")) return;

            const pt = gridPoint(
                e.clientX,
                e.clientY,
                svgRef.current.getBoundingClientRect(),
            );

            if (activeTool === "select") {
                selectComponent(null);
                return;
            }

            if (activeTool !== "wire") {
                if (!isCellOccupied(components, pt)) {
                    addComponent(activeTool, pt);
                }
            }
        },
        [activeTool, addComponent, selectComponent, components],
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

                {wires.map((w) => (
                    <line
                        key={w.id}
                        x1={w.from.x * CELL}
                        y1={w.from.y * CELL}
                        x2={w.to.x * CELL}
                        y2={w.to.y * CELL}
                        className="canvas-wire"
                    />
                ))}

                {components.map((comp) => (
                    <g
                        key={comp.id}
                        data-component={comp.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            selectComponent(comp.id);
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        <ComponentMarker
                            type={comp.type}
                            x={comp.position.x * CELL}
                            y={comp.position.y * CELL}
                            selected={comp.id === selectedId}
                            label={comp.name}
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

interface MarkerProps {
    type: ComponentType;
    x: number;
    y: number;
    selected: boolean;
    label: string;
}

function ComponentMarker({ type, x, y, selected, label }: MarkerProps) {
    const colour = selected ? '#a0ffcc' : 'var(--color-circuit-accent)';
    const abbrev =
        type === "voltageSource"
            ? "VS"
            : type === "currentSource"
              ? "IS"
              : type.slice(0, 2).toUpperCase();

    return (
        <g>
            <rect
                x={x - CELL / 2}
                y={y - CELL / 2}
                width={CELL}
                height={CELL}
                fill="transparent"
            />
            <rect
                x={x - 12}
                y={y - 10}
                width={24}
                height={20}
                rx={2}
                fill="var(--color-circuit-surface)"
                stroke={colour}
                strokeWidth={1.5}
            />
            <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize={9}
                fill={colour}
                fontFamily="monospace"
                style={{ pointerEvents: "none", userSelect: "none" }}
            >
                {abbrev}
            </text>
            <text
                x={x}
                y={y - 14}
                textAnchor="middle"
                fontSize={8}
                fill="#4a5056"
                fontFamily="monospace"
                style={{ pointerEvents: "none", userSelect: "none" }}
            >
                {label}
            </text>
        </g>
    );
}
