import { useTutorialStore } from "../../store/tutorialStore";

export default function MissingGroundNotice() {
    const openTutorial = useTutorialStore((s) => s.open);

    return (
        <div
            role="status"
            className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5"
        >
            <p className="text-xs font-semibold text-amber-900">
                No ground connected
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800">
                The simulator needs a 0 V reference. Place a Ground (G) and wire
                it to a terminal of your circuit.
            </p>
            <button
                onClick={() => openTutorial("ground")}
                className="mt-2 cursor-pointer text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950"
            >
                See how to add a ground
            </button>
        </div>
    );
}
