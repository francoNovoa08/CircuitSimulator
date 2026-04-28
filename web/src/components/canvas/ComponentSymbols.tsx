const ACCENT = 'var(--color-circuit-accent)';
const ACTIVE = '#a0ffcc';
const DIM = '#4a5056';
const STROKE = 1.8;

interface SymbolProps {
    x: number;
    y: number;
    selected: boolean;
    label: string;
    value: number;
}

function Label({ x, y, label, value, unit, selected }: {
    x: number; y: number; label: string; value: number; unit: string; selected: boolean;
}) {
    if (!selected) {
        return (
            <text x={x} y={y - 18} textAnchor="middle" fontSize={7}
                fill={DIM} fontFamily="monospace"
                style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {label}
            </text>
        );
    }
    const formatted = formatValue(value, unit);
    return (
        <>
            <text x={x} y={y - 18} textAnchor="middle" fontSize={8}
                fill="#a0ffcc" fontFamily="monospace"
                style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {label}
            </text>
            <text x={x} y={y + 26} textAnchor="middle" fontSize={8}
                fill="#a0ffcc" fontFamily="monospace"
                style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {formatted}
            </text>
        </>
    );
}

function LeadLines({ x, y, colour }: { x: number; y: number; colour: string }) {
    return (
        <>
            <line x1={x - 20} y1={y} x2={x - 12} y2={y}
                stroke={colour} strokeWidth={STROKE} strokeLinecap="round" />
            <line x1={x + 12} y1={y} x2={x + 20} y2={y}
                stroke={colour} strokeWidth={STROKE} strokeLinecap="round" />
        </>
    );
}

function TerminalDots({ x, y, colour }: { x: number; y: number; colour: string }) {
    return (
        <>
            <circle cx={x - 20} cy={y} r={2} fill={colour} />
            <circle cx={x + 20} cy={y} r={2} fill={colour} />
        </>
    );
}

function formatValue(value: number, unit: string): string {
    if (value >= 1e6)  return `${value / 1e6}M${unit}`;
    if (value >= 1e3)  return `${value / 1e3}k${unit}`;
    if (value >= 1)    return `${value}${unit}`;
    if (value >= 1e-3) return `${value * 1e3}m${unit}`;
    if (value >= 1e-6) return `${value * 1e6}µ${unit}`;
    if (value >= 1e-9) return `${value * 1e9}n${unit}`;
    return `${value}${unit}`;
}

export function ResistorSymbol({ x, y, selected, label, value }: SymbolProps) {
    const c = selected ? ACTIVE : ACCENT;
    return (
        <g>
            <LeadLines x={x} y={y} colour={c} />
            <rect x={x - 12} y={y - 5} width={24} height={10}
                rx={1} fill="var(--color-circuit-surface)"
                stroke={c} strokeWidth={STROKE} />
            <Label x={x} y={y} label={label} value={value} unit="Ω" selected={selected} />
            <TerminalDots x={x} y={y} colour={c} />
        </g>
    );
}

export function CapacitorSymbol({ x, y, selected, label, value }: SymbolProps) {
    const c = selected ? ACTIVE : ACCENT;
    return (
        <g>
            <line x1={x - 20} y1={y} x2={x - 4} y2={y}
                stroke={c} strokeWidth={STROKE} strokeLinecap="round" />
            <line x1={x + 4} y1={y} x2={x + 20} y2={y}
                stroke={c} strokeWidth={STROKE} strokeLinecap="round" />
            {/* Two plates */}
            <line x1={x - 4} y1={y - 9} x2={x - 4} y2={y + 9}
                stroke={c} strokeWidth={STROKE + 0.5} strokeLinecap="round" />
            <line x1={x + 4} y1={y - 9} x2={x + 4} y2={y + 9}
                stroke={c} strokeWidth={STROKE + 0.5} strokeLinecap="round" />
            <Label x={x} y={y} label={label} value={value} unit="F" selected={selected} />
            <TerminalDots x={x} y={y} colour={c} />
        </g>
    );
}

export function InductorSymbol({ x, y, selected, label, value }: SymbolProps) {
    const c = selected ? ACTIVE : ACCENT;
    return (
        <g>
            <LeadLines x={x} y={y} colour={c} />
            <rect x={x - 12} y={y - 5} width={24} height={10}
                rx={1} fill="var(--color-circuit-surface)"
                stroke={c} strokeWidth={STROKE} />
            {/* Inductor marker: small horizontal lines inside box */}
            <line x1={x - 6} y1={y} x2={x + 6} y2={y}
                stroke={c} strokeWidth={1} strokeDasharray="2 2" />
            <Label x={x} y={y} label={label} value={value} unit="H" selected={selected} />
            <TerminalDots x={x} y={y} colour={c} />
        </g>
    );
}

export function VoltageSourceSymbol({ x, y, selected, label, value }: SymbolProps) {
    const c = selected ? ACTIVE : ACCENT;
    const r = 12;
    return (
        <g>
            <line x1={x - 20} y1={y} x2={x - r} y2={y}
                stroke={c} strokeWidth={STROKE} strokeLinecap="round" />
            <line x1={x + r} y1={y} x2={x + 20} y2={y}
                stroke={c} strokeWidth={STROKE} strokeLinecap="round" />
            <circle cx={x} cy={y} r={r}
                fill="var(--color-circuit-surface)" stroke={c} strokeWidth={STROKE} />
            <text x={x - 5} y={y + 3} textAnchor="middle" fontSize={9}
                fill={c} fontFamily="monospace"
                style={{ pointerEvents: 'none', userSelect: 'none' }}>
                +
            </text>
            <text x={x + 5} y={y + 3} textAnchor="middle" fontSize={9}
                fill={c} fontFamily="monospace"
                style={{ pointerEvents: 'none', userSelect: 'none' }}>
                −
            </text>
            <Label x={x} y={y} label={label} value={value} unit="V" selected={selected} />
            <TerminalDots x={x} y={y} colour={c} />
        </g>
    );
}

export function CurrentSourceSymbol({ x, y, selected, label, value }: SymbolProps) {
    const c = selected ? ACTIVE : ACCENT;
    const r = 12;
    const arrowPath = `M ${x - 6} ${y} L ${x + 4} ${y} M ${x + 1} ${y - 4} L ${x + 6} ${y} L ${x + 1} ${y + 4}`;
    return (
        <g>
            <line x1={x - 20} y1={y} x2={x - r} y2={y}
                stroke={c} strokeWidth={STROKE} strokeLinecap="round" />
            <line x1={x + r} y1={y} x2={x + 20} y2={y}
                stroke={c} strokeWidth={STROKE} strokeLinecap="round" />
            <circle cx={x} cy={y} r={r}
                fill="var(--color-circuit-surface)" stroke={c} strokeWidth={STROKE} />
            <path d={arrowPath} stroke={c} strokeWidth={1.2}
                fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Label x={x} y={y} label={label} value={value} unit="A" selected={selected} />
            <TerminalDots x={x} y={y} colour={c} />
        </g>
    );
}


export function GroundSymbol({ x, y, selected }: Omit<SymbolProps, 'label' | 'value'>) {
    const c = selected ? ACTIVE : ACCENT;
    return (
        <g>
            {/* Lead up to the symbol */}
            <line x1={x} y1={y - 20} x2={x} y2={y - 6}
                stroke={c} strokeWidth={STROKE} strokeLinecap="round" />
            {/* Three descending horizontal bars */}
            <line x1={x - 12} y1={y - 6} x2={x + 12} y2={y - 6}
                stroke={c} strokeWidth={STROKE} strokeLinecap="round" />
            <line x1={x - 8} y1={y - 1} x2={x + 8} y2={y - 1}
                stroke={c} strokeWidth={STROKE} strokeLinecap="round" />
            <line x1={x - 4} y1={y + 4} x2={x + 4} y2={y + 4}
                stroke={c} strokeWidth={STROKE} strokeLinecap="round" />
            {/* Terminal dot at top */}
            <circle cx={x} cy={y - 20} r={2} fill={c} />
        </g>
    );
}

import type { ComponentType } from '../../store/circuitStore';

interface ComponentSymbolProps {
    type: ComponentType;
    x: number;
    y: number;
    selected: boolean;
    label: string;
    value: number;
}

export function ComponentSymbol({ type, x, y, selected, label, value }: ComponentSymbolProps) {
    switch (type) {
        case 'resistor':      return <ResistorSymbol x={x} y={y} selected={selected} label={label} value={value} />;
        case 'capacitor':     return <CapacitorSymbol x={x} y={y} selected={selected} label={label} value={value} />;
        case 'inductor':      return <InductorSymbol x={x} y={y} selected={selected} label={label} value={value} />;
        case 'voltageSource': return <VoltageSourceSymbol x={x} y={y} selected={selected} label={label} value={value} />;
        case 'currentSource': return <CurrentSourceSymbol x={x} y={y} selected={selected} label={label} value={value} />;
        case 'ground':        return <GroundSymbol x={x} y={y} selected={selected} />;
    }
}