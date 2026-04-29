import { MousePointer2, Settings2 } from "lucide-react";
import { useCircuitStore } from "../../store/circuitStore";

const unitMap: Record<string, string> = {
    resistor: "Ω",
    capacitor: "F",
    inductor: "H",
    voltageSource: "V",
    currentSource: "A",
    ground: "",
};
const labelMap: Record<string, string> = {
    resistor: "Resistance",
    capacitor: "Capacitance",
    inductor: "Inductance",
    voltageSource: "Voltage",
    currentSource: "Current",
    ground: "Ground",
};

export default function PropertiesPanel() {
    const {
        components,
        selectedId,
        updateValue,
        updateInitialVoltage,
        removeComponent,
        selectComponent,
    } = useCircuitStore();

    const comp = components.find((c) => c.id === selectedId);

    return (
        <div className="h-[35%] flex flex-col border-b border-slate-200 bg-white shrink-0">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <Settings2 size={14} className="text-slate-500" />
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Properties
                </h2>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {!comp ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 text-slate-400">
                            <MousePointer2 size={16} />
                        </div>
                        <p className="text-xs text-slate-500 max-w-[180px]">
                            Select a component on the grid to edit its
                            properties.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-semibold text-slate-800">
                                {comp.name}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                {labelMap[comp.type]}
                            </span>
                        </div>

                        {comp.type !== "ground" && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-500 font-medium">
                                    Value ({unitMap[comp.type]})
                                </label>
                                <input
                                    type="number"
                                    defaultValue={comp.value}
                                    step="any"
                                    onBlur={(e) => {
                                        const n = parseFloat(e.target.value);
                                        if (!isNaN(n) && n > 0)
                                            updateValue(comp.id, n);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            const n = parseFloat(
                                                (e.target as HTMLInputElement)
                                                    .value,
                                            );
                                            if (!isNaN(n) && n > 0)
                                                updateValue(comp.id, n);
                                        }
                                    }}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white font-mono text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow shadow-sm"
                                />
                            </div>
                        )}

                        {comp.type === "capacitor" && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-500 font-medium">
                                    Initial voltage (V)
                                </label>
                                <input
                                    type="number"
                                    defaultValue={comp.initialVoltage ?? 0}
                                    step="any"
                                    onBlur={(e) =>
                                        updateInitialVoltage(
                                            comp.id,
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white font-mono text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow shadow-sm"
                                />
                            </div>
                        )}

                        <button
                            onClick={() => {
                                removeComponent(comp.id);
                                selectComponent(null);
                            }}
                            className="w-full mt-2 py-2 rounded-md border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            Remove component
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
