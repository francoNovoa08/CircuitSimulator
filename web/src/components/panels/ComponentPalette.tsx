import type { ComponentType } from '../../store/circuitStore';

type Tool = ComponentType | 'select' | 'wire';

interface Props {
    activeTool: Tool;
    onToolChange: (tool: Tool) => void;
}

const tools: { id: Tool; label: string; key: string }[] = [
    { id: 'select',        label: 'Select',   key: 'S' },
    { id: 'wire',          label: 'Wire',     key: 'W' },
    { id: 'resistor',      label: 'Resistor', key: 'R' },
    { id: 'capacitor',     label: 'Capacitor',key: 'C' },
    { id: 'inductor',      label: 'Inductor', key: 'L' },
    { id: 'voltageSource', label: 'V Source', key: 'V' },
    { id: 'currentSource', label: 'I Source', key: 'I' },
    { id: 'ground',        label: 'Ground',   key: 'G' },
];

export default function ComponentPalette({ activeTool, onToolChange }: Props) {
    return (
        <div className="palette w-50">
            {tools.map(t => (
                <button
                    key={t.id}
                    className={`palette-btn ${activeTool === t.id ? 'palette-btn--active' : ''}`}
                    onClick={() => onToolChange(t.id)}
                    title={`${t.label} (${t.key})`}
                >
                    <span className="palette-btn__label">{t.label}</span>
                    <span className="palette-btn__key">{t.key}</span>
                </button>
            ))}
        </div>
    );
}