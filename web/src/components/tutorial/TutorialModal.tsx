import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, SyntheticEvent } from "react";
import { X } from "lucide-react";
import {
    selectTutorialVisible,
    useTutorialStore,
} from "../../store/tutorialStore";
import type { TutorialStepId } from "../../store/tutorialStore";
import { tutorialSteps } from "./tutorialSteps";

export default function TutorialModal() {
    const visible = useTutorialStore(selectTutorialVisible);
    const initialStep = useTutorialStore((s) => s.initialStep);

    return visible ? <TutorialDialog initialStep={initialStep} /> : null;
}

function TutorialDialog({ initialStep }: { initialStep: TutorialStepId }) {
    const close = useTutorialStore((s) => s.close);
    const titleId = useId();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const primaryRef = useRef<HTMLButtonElement>(null);
    const [index, setIndex] = useState(() =>
        tutorialSteps.findIndex((s) => s.id === initialStep),
    );

    const step = tutorialSteps[index];
    const isLast = index === tutorialSteps.length - 1;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        dialog.showModal();
        primaryRef.current?.focus();
        return () => dialog.close();
    }, []);

    const goTo = (next: number) =>
        setIndex(Math.min(Math.max(next, 0), tutorialSteps.length - 1));

    const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
        e.stopPropagation();
        if (e.key === "ArrowRight") goTo(index + 1);
        if (e.key === "ArrowLeft") goTo(index - 1);
    };

    const handleCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
        e.preventDefault();
        close();
    };

    return (
        <dialog
            ref={dialogRef}
            tabIndex={-1}
            aria-labelledby={titleId}
            onKeyDown={handleKeyDown}
            onCancel={handleCancel}
            className="m-auto w-[min(56rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white p-0 text-slate-800 shadow-xl outline-none backdrop:bg-slate-900/40"
        >
            <div className="flex h-152 max-h-[calc(100vh-2rem)]">
                <nav
                    aria-label="Guide steps"
                    className="flex w-52 shrink-0 flex-col gap-1 border-r border-slate-200 bg-slate-50 p-3"
                >
                    <h2 className="px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Lab guide
                    </h2>
                    {tutorialSteps.map((s, i) => {
                        const active = i === index;
                        return (
                            <button
                                key={s.id}
                                onClick={() => goTo(i)}
                                aria-current={active ? "step" : undefined}
                                className={[
                                    "flex items-baseline gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors cursor-pointer",
                                    active
                                        ? "bg-white font-semibold text-slate-900 ring-1 ring-slate-200"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                                ].join(" ")}
                            >
                                <span className="font-mono text-xs text-slate-400">
                                    {i + 1}
                                </span>
                                <span className="flex-1">{s.title}</span>
                                {s.required && (
                                    <span className="text-[10px] font-semibold text-amber-700">
                                        Required
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <section className="flex min-w-0 flex-1 flex-col">
                    <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h2
                            id={titleId}
                            className="text-lg font-semibold text-slate-900"
                        >
                            {step.title}
                        </h2>
                        <button
                            onClick={close}
                            aria-label="Close guide"
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </header>

                    <div
                        key={step.id}
                        className="flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-slate-600"
                    >
                        {step.content}
                    </div>

                    <footer className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                        <button
                            onClick={() => goTo(index - 1)}
                            disabled={index === 0}
                            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                        >
                            Back
                        </button>
                        <span className="text-xs text-slate-400">
                            {index + 1} of {tutorialSteps.length}
                        </span>
                        <button
                            ref={primaryRef}
                            onClick={isLast ? close : () => goTo(index + 1)}
                            className="rounded-md bg-slate-800 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-slate-700 active:scale-[0.97] cursor-pointer"
                        >
                            {isLast ? "Done" : "Next"}
                        </button>
                    </footer>
                </section>
            </div>
        </dialog>
    );
}
