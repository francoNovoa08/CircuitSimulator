import { getModule } from './wasmLoader';
import type { DCResult, ACResult, TransientResult, SimulationError } from './types';

type RawResult = DCResult | ACResult | TransientResult | SimulationError;

function parseResult<T>(raw: string): T {
    const parsed = JSON.parse(raw) as RawResult;
    if ('error' in parsed) {
        throw new Error(parsed.error);
    }
    return parsed as T;
}

export async function runDC(netlist: string): Promise<DCResult> {
    const mod = await getModule();
    const fn = mod.cwrap('runDC', 'string', ['string']);
    return parseResult<DCResult>(fn(netlist));
}

export async function runAC(netlist: string, frequency: number): Promise<ACResult> {
    const mod = await getModule();
    const fn = mod.cwrap('runAC', 'string', ['string', 'number']);
    return parseResult<ACResult>(fn(netlist, frequency));
}

export async function runTransient(
    netlist: string,
    tStep: number,
    tStop: number
): Promise<TransientResult> {
    const mod = await getModule();
    const fn = mod.cwrap('runTransient', 'string', ['string', 'number', 'number']);
    return parseResult<TransientResult>(fn(netlist, tStep, tStop));
}