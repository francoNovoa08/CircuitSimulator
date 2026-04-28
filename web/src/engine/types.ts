export interface DCNode { node: number; voltage: number; }
export interface DCSource { source: number; current: number; }
export interface DCResult { type: 'dc'; nodes: DCNode[]; sources: DCSource[]; }

export interface ACNode { node: number; magnitude: number; phase: number; }
export interface ACResult { type: 'ac'; frequency: number; nodes: ACNode[]; }

export interface TransientStep { time: number; nodes: number[]; }
export interface TransientResult { type: 'transient'; steps: TransientStep[]; }

export type SimulationResult = DCResult | ACResult | TransientResult;
export type SimulationError = { error: string; };