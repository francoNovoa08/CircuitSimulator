import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TutorialStepId =
    | "overview"
    | "components"
    | "wiring"
    | "ground"
    | "running";

interface TutorialState {
    hasSeen: boolean;
    isOpen: boolean;
    initialStep: TutorialStepId;

    open: (step?: TutorialStepId) => void;
    close: () => void;
}

export const useTutorialStore = create<TutorialState>()(
    persist(
        (set) => ({
            hasSeen: false,
            isOpen: false,
            initialStep: "overview",

            open(step = "overview") {
                set({ isOpen: true, initialStep: step });
            },

            close() {
                set({ isOpen: false, hasSeen: true });
            },
        }),
        {
            name: "lab-tutorial",
            storage: createJSONStorage(() => localStorage),
            partialize: ({ hasSeen }) => ({ hasSeen }),
        },
    ),
);

export const selectTutorialVisible = (state: TutorialState): boolean =>
    state.isOpen || !state.hasSeen;