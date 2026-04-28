import { create } from 'zustand';
import type { DCResult, ACResult, TransientResult } from '../engine/types';

export type AnalysisType = 'dc' | 'ac' | 'transient';

export type SimulationResult = DCResult | ACResult | TransientResult;

interface SimulationParams {
    frequency: number;   // AC
    tStep: number;       // Transient
    tStop: number;       // Transient
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
}

export const useSimulationStore = create<SimulationState>((set) => ({
    analysisType: 'dc',
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
        set(state => ({ params: { ...state.params, ...params } }));
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
}));