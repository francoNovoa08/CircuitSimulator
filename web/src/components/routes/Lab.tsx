import { useState, useEffect } from 'react';
import CircuitCanvas from '../canvas/CircuitCanvas';
import ComponentPalette from '../panels/ComponentPalette';
import type { ComponentType } from '../../store/circuitStore';

type Tool = ComponentType | 'select' | 'wire';

const keyMap: Record<string, Tool> = {
    s: 'select', w: 'wire', r: 'resistor', c: 'capacitor',
    l: 'inductor', v: 'voltageSource', i: 'currentSource', g: 'ground',
};

export default function Lab() {
    const [activeTool, setActiveTool] = useState<Tool>('select');

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            const tool = keyMap[e.key.toLowerCase()];
            if (tool) setActiveTool(tool);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <div className="min-h-svh overflow-hidden bg-circuit-bg text-circuit-text font-plex-sans antialiased w-full flex flex-col">
            <div className="flex flex-1 min-h-0">
                <ComponentPalette activeTool={activeTool} onToolChange={setActiveTool} />
                <div className="flex-1 min-h-0 p-2">
                    <CircuitCanvas activeTool={activeTool} />
                </div>
            </div>
        </div>
    );
}