const ACCENT = '#64748b'; 
const ACTIVE = '#2563eb';  
const DIM = '#94a3b8';     
const STROKE = 1.8;

interface SymbolProps {
    x: number;
    y: number;
    selected: boolean;
    label: string;
    value: number;
}

function Label({
    x,
    y,
    label,
    value,
    unit,
    selected,
}: {
    x: number;
    y: number;
    label: string;
    value: number;
    unit: string;
    selected: boolean;
}) {
    const cx = x + 20;
    if (!selected) {
        return (
            <text
                x={cx}
                y={y - 16}
                textAnchor="middle"
                fontSize={7}
                fill={DIM}
                fontFamily="monospace"
                style={{ pointerEvents: "none", userSelect: "none" }}
            >
                {label}
            </text>
        );
    }
    return (
        <>
            <text
                x={cx}
                y={y - 16}
                textAnchor="middle"
                fontSize={8}
                fill={DIM}
                fontFamily="monospace"
                style={{ pointerEvents: "none", userSelect: "none" }}
            >
                {label}
            </text>
            <text
                x={cx}
                y={y + 24}
                textAnchor="middle"
                fontSize={8}
                fill={DIM}
                fontFamily="monospace"
                style={{ pointerEvents: "none", userSelect: "none" }}
            >
                {formatValue(value, unit)}
            </text>
        </>
    );
}

function LeadLines({ x, y, colour }: { x: number; y: number; colour: string }) {
    return (
        <>
            <line
                x1={x - 20}
                y1={y}
                x2={x - 12}
                y2={y}
                stroke={colour}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <line
                x1={x + 12}
                y1={y}
                x2={x + 20}
                y2={y}
                stroke={colour}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
        </>
    );
}

function TerminalDots({
    x,
    y,
    colour,
}: {
    x: number;
    y: number;
    colour: string;
}) {
    return (
        <>
            <circle cx={x} cy={y} r={2.5} fill={colour} />
            <circle cx={x + 40} cy={y} r={2.5} fill={colour} />
        </>
    );
}

function formatValue(value: number, unit: string): string {
    if (value >= 1e6) return `${+(value / 1e6).toPrecision(3)}M${unit}`;
    if (value >= 1e3) return `${+(value / 1e3).toPrecision(3)}k${unit}`;
    if (value >= 1) return `${+value.toPrecision(3)}${unit}`;
    if (value >= 1e-3) return `${+(value * 1e3).toPrecision(3)}m${unit}`;
    if (value >= 1e-6) return `${+(value * 1e6).toPrecision(3)}µ${unit}`;
    if (value >= 1e-9) return `${+(value * 1e9).toPrecision(3)}n${unit}`;
    return `${value}${unit}`;
}

function HitArea({ x, y }: { x: number; y: number }) {
    return <rect x={x} y={y - 20} width={40} height={40} fill="transparent" />;
}

export function ResistorSymbol({ x, y, selected, label, value }: SymbolProps) {
    const c = selected ? ACTIVE : ACCENT;
    const cx = x + 20;
    return (
        <g>
            <HitArea x={x} y={y} />
            {/* Lead lines from terminals to body */}
            <line
                x1={x}
                y1={y}
                x2={cx - 12}
                y2={y}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <line
                x1={cx + 12}
                y1={y}
                x2={x + 40}
                y2={y}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            {/* Body */}
            <rect
                x={cx - 12}
                y={y - 6}
                width={24}
                height={12}
                rx={1}
                fill="#ffffff"
                stroke={c}
                strokeWidth={STROKE}
            />
            <Label
                x={x}
                y={y}
                label={label}
                value={value}
                unit="Ω"
                selected={selected}
            />
            <TerminalDots x={x} y={y} colour={c} />
        </g>
    );
}

export function CapacitorSymbol({ x, y, selected, label, value }: SymbolProps) {
    const c = selected ? ACTIVE : ACCENT;
    const cx = x + 20;
    return (
        <g>
            <HitArea x={x} y={y} />
            <line
                x1={x}
                y1={y}
                x2={cx - 5}
                y2={y}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <line
                x1={cx + 5}
                y1={y}
                x2={x + 40}
                y2={y}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <line
                x1={cx - 5}
                y1={y - 10}
                x2={cx - 5}
                y2={y + 10}
                stroke={c}
                strokeWidth={STROKE + 0.5}
                strokeLinecap="round"
            />
            <line
                x1={cx + 5}
                y1={y - 10}
                x2={cx + 5}
                y2={y + 10}
                stroke={c}
                strokeWidth={STROKE + 0.5}
                strokeLinecap="round"
            />
            <Label
                x={x}
                y={y}
                label={label}
                value={value}
                unit="F"
                selected={selected}
            />
            <TerminalDots x={x} y={y} colour={c} />
        </g>
    );
}

export function InductorSymbol({ x, y, selected, label, value }: SymbolProps) {
    const c = selected ? ACTIVE : ACCENT;
    const cx = x + 20;
    return (
        <g>
            <HitArea x={x} y={y} />
            <line
                x1={x}
                y1={y}
                x2={cx - 12}
                y2={y}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <line
                x1={cx + 12}
                y1={y}
                x2={x + 40}
                y2={y}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <rect
                x={cx - 12}
                y={y - 6}
                width={24}
                height={12}
                rx={1}
                fill="#ffffff"
                stroke={c}
                strokeWidth={STROKE}
            />
            <line
                x1={cx - 7}
                y1={y}
                x2={cx + 7}
                y2={y}
                stroke={c}
                strokeWidth={1}
                strokeDasharray="2 2"
            />
            <Label
                x={x}
                y={y}
                label={label}
                value={value}
                unit="H"
                selected={selected}
            />
            <TerminalDots x={x} y={y} colour={c} />
        </g>
    );
}

export function VoltageSourceSymbol({
    x,
    y,
    selected,
    label,
    value,
}: SymbolProps) {
    const c = selected ? ACTIVE : ACCENT;
    const cx = x + 20;
    const r = 13;
    return (
        <g>
            <HitArea x={x} y={y} />
            <line
                x1={x}
                y1={y}
                x2={cx - r}
                y2={y}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <line
                x1={cx + r}
                y1={y}
                x2={x + 40}
                y2={y}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <circle
                cx={cx}
                cy={y}
                r={r}
                fill="#ffffff"
                stroke={c}
                strokeWidth={STROKE}
            />
            <text
                x={cx - 5}
                y={y + 4}
                textAnchor="middle"
                fontSize={9}
                fill={c}
                fontFamily="monospace"
                style={{ pointerEvents: "none", userSelect: "none" }}
            >
                +
            </text>
            <text
                x={cx + 5}
                y={y + 4}
                textAnchor="middle"
                fontSize={9}
                fill={c}
                fontFamily="monospace"
                style={{ pointerEvents: "none", userSelect: "none" }}
            >
                −
            </text>
            <Label
                x={x}
                y={y}
                label={label}
                value={value}
                unit="V"
                selected={selected}
            />
            <TerminalDots x={x} y={y} colour={c} />
        </g>
    );
}

export function CurrentSourceSymbol({
    x,
    y,
    selected,
    label,
    value,
}: SymbolProps) {
    const c = selected ? ACTIVE : ACCENT;
    const cx = x + 20;
    const r = 13;
    const arrowPath = `M ${cx - 7} ${y} L ${cx + 3} ${y} M ${cx} ${y - 5} L ${cx + 7} ${y} L ${cx} ${y + 5}`;
    return (
        <g>
            <HitArea x={x} y={y} />
            <line
                x1={x}
                y1={y}
                x2={cx - r}
                y2={y}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <line
                x1={cx + r}
                y1={y}
                x2={x + 40}
                y2={y}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <circle
                cx={cx}
                cy={y}
                r={r}
                fill="#ffffff"
                stroke={c}
                strokeWidth={STROKE}
            />
            <path
                d={arrowPath}
                stroke={c}
                strokeWidth={1.2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Label
                x={x}
                y={y}
                label={label}
                value={value}
                unit="A"
                selected={selected}
            />
            <TerminalDots x={x} y={y} colour={c} />
        </g>
    );
}

export function GroundSymbol({
    x,
    y,
    selected,
}: Omit<SymbolProps, "label" | "value">) {
    const c = selected ? ACTIVE : ACCENT;
    return (
        <g>
            <rect
                x={x - 20}
                y={y - 20}
                width={40}
                height={40}
                fill="transparent"
            />
            <line
                x1={x}
                y1={y}
                x2={x}
                y2={y + 8}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <line
                x1={x - 12}
                y1={y + 8}
                x2={x + 12}
                y2={y + 8}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <line
                x1={x - 8}
                y1={y + 13}
                x2={x + 8}
                y2={y + 13}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <line
                x1={x - 4}
                y1={y + 18}
                x2={x + 4}
                y2={y + 18}
                stroke={c}
                strokeWidth={STROKE}
                strokeLinecap="round"
            />
            <circle cx={x} cy={y} r={2.5} fill={c} />
        </g>
    );
}

import type { ComponentType } from "../../store/circuitStore";

interface ComponentSymbolProps {
    type: ComponentType;
    x: number;
    y: number;
    selected: boolean;
    label: string;
    value: number;
}

export function ComponentSymbol({
    type,
    x,
    y,
    selected,
    label,
    value,
}: ComponentSymbolProps) {
    switch (type) {
        case "resistor":
            return (
                <ResistorSymbol
                    x={x}
                    y={y}
                    selected={selected}
                    label={label}
                    value={value}
                />
            );
        case "capacitor":
            return (
                <CapacitorSymbol
                    x={x}
                    y={y}
                    selected={selected}
                    label={label}
                    value={value}
                />
            );
        case "inductor":
            return (
                <InductorSymbol
                    x={x}
                    y={y}
                    selected={selected}
                    label={label}
                    value={value}
                />
            );
        case "voltageSource":
            return (
                <VoltageSourceSymbol
                    x={x}
                    y={y}
                    selected={selected}
                    label={label}
                    value={value}
                />
            );
        case "currentSource":
            return (
                <CurrentSourceSymbol
                    x={x}
                    y={y}
                    selected={selected}
                    label={label}
                    value={value}
                />
            );
        case "ground":
            return <GroundSymbol x={x} y={y} selected={selected} />;
    }
}
