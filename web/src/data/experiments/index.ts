import rcCharging from './rc_charging.json';
import rcDischarge from './rc_discharge.json';
import type { Experiment } from './types';

export const experiments: Experiment[] = [
    rcCharging as Experiment,
    rcDischarge as Experiment,
];

export type { Experiment, HilMeasurement } from './types';