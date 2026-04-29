import { create } from "zustand";
import type { DCResult, ACResult, TransientResult } from "../engine/types";
import type { HilMeasurement } from "../data/experiments/types";
import type { Experiment } from "../data/experiments";

export type AnalysisType = "dc" | "ac" | "transient";

export type SimulationResult = DCResult | ACResult | TransientResult;

interface SimulationParams {
    frequency: number; // AC
    tStep: number; // Transient
    tStop: number; // Transient
}

interface SimulationState {
    analysisType: AnalysisType;
    params: SimulationParams;
    result: SimulationResult | null;
    error: string | null;
    loading: boolean;

    setAnalysisType: (type: AnalysisType) => void;
    setParams: (params: Partial<SimulationParams>) => void;
    setResult: (result: SimulationResult) => void;
    setError: (error: string) => void;
    setLoading: (loading: boolean) => void;
    clear: () => void;

    hilData: HilMeasurement[] | null;
    hilRmse: number | null;
    hilTitle: string | null;

    setHilData: (
        data: HilMeasurement[],
        rmse: number,
        title: string,
        experiment: Experiment,
    ) => void;
    clearHilData: () => void;

    activeExperiment: Experiment | null;
}

export const useSimulationStore = create<SimulationState>((set) => ({
    analysisType: "dc",
    params: {
        frequency: 1000,
        tStep: 1e-5,
        tStop: 5e-3,
    },
    result: null,
    error: null,
    loading: false,

    setAnalysisType(type) {
        set({ analysisType: type, result: null, error: null });
    },

    setParams(params) {
        set((state) => ({ params: { ...state.params, ...params } }));
    },

    setResult(result) {
        set({ result, error: null, loading: false });
    },

    setError(error) {
        set({ error, result: null, loading: false });
    },

    setLoading(loading) {
        set({ loading });
    },

    clear() {
        set({ result: null, error: null, loading: false });
    },

    hilData: null,
    hilRmse: null,
    hilTitle: null,

    setHilData(data, rmse, title, experiment) {
        set({
            hilData: data,
            hilRmse: rmse,
            hilTitle: title,
            activeExperiment: experiment,
        });
    },

    clearHilData() {
        set({
            hilData: null,
            hilRmse: null,
            hilTitle: null,
            activeExperiment: null,
        });
    },

    activeExperiment: null,
}));
