import CircuitCanvas from "../canvas/CircuitCanvas";

export default function Lab() {
    return (
        <div className="p-2 min-h-svh bg-circuit-bg text-circuit-text font-plex-sans antialiased w-full flex flex-col">
            <div className="flex-1 min-h-0">
                <CircuitCanvas activeTool="resistor" />
            </div>
        </div>
    );
}