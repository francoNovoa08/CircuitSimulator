export interface HilMeasurement {
    time_ms: number;
    voltage: number;
}

export interface Experiment {
    id: string;
    title: string;
    description: string;
    netlist: string;
    tStep: number;
    tStop: number;
    rmse: number;
    nodeOfInterest: number;
    measured: HilMeasurement[];
}