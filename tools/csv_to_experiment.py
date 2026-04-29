#!/usr/bin/env python3
"""
Converts HIL CSV output from the C++ simulator to experiment JSON files
for the web frontend.

Usage:
    python tools/csv_to_experiment.py

Expects CSV files in tools/hil_data/ and writes JSON to web/src/data/experiments/
"""

import csv
import json
import os
from pathlib import Path

OUTPUT_DIR = Path("web/src/data/experiments")
INPUT_DIR = Path("tools/hil_data")

EXPERIMENTS = [
    {
        "id": "rc_charging",
        "title": "RC Charging",
        "description": "10kΩ resistor, 105µF capacitor charging from 0V. Supply voltage corrected to 4.78V to account for D2 pin output impedance.",
        "csv": "charging.csv",
        "netlist": "R1 1 2 10000\nC1 2 0 105e-6 IC=0\nV1 1 0 4.78\n.TRAN 0.05 30\n",
        "tStep": 0.05,
        "tStop": 30.0,
        "rmse": 0.101,
        "node_of_interest": 1,
    },
    {
        "id": "rc_discharge",
        "title": "RC Discharge",
        "description": "10kΩ resistor, 105µF capacitor discharging from 4.78V initial condition. RMSE bounded by ADC quantisation floor of 4.88mV.",
        "csv": "discharge.csv",
        "netlist": "R1 1 2 10000\nC1 2 0 105e-6 IC=4.912\nV1 1 0 0\n.TRAN 0.05 10\n",
        "tStep": 0.05,
        "tStop": 10.0,
        "rmse": 0.051,
        "node_of_interest": 1,
    },
]


def parse_csv(path: Path) -> list[dict]:
    """
    Parses a HIL CSV file with columns:
    timestamp_ms, v_theoretical, v_actual, abs_error, pct_error
    Returns list of {time_ms, voltage} keeping only the measured voltage.
    """
    rows = []
    with open(path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                rows.append({
                    "time_ms": round(float(row["timestamp_ms"]), 3),
                    "voltage": round(float(row["v_actual"]), 6),
                })
            except (KeyError, ValueError) as e:
                print(f"  Skipping malformed row in {path.name}: {e}")
    return rows


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if not INPUT_DIR.exists():
        print(f"Creating input directory: {INPUT_DIR}")
        print("Place your HIL CSV files there and re-run.")
        INPUT_DIR.mkdir(parents=True, exist_ok=True)
        return

    for exp in EXPERIMENTS:
        csv_path = INPUT_DIR / exp["csv"]

        if not csv_path.exists():
            print(f"[SKIP] {exp['id']}: {csv_path} not found")
            continue

        print(f"[PROCESSING] {exp['id']} from {csv_path.name}")
        measured = parse_csv(csv_path)
        print(f"  {len(measured)} samples read")

        output = {
            "id": exp["id"],
            "title": exp["title"],
            "description": exp["description"],
            "netlist": exp["netlist"],
            "tStep": exp["tStep"],
            "tStop": exp["tStop"],
            "rmse": exp["rmse"],
            "nodeOfInterest": exp["node_of_interest"],
            "measured": measured,
        }

        out_path = OUTPUT_DIR / f"{exp['id']}.json"
        with open(out_path, "w") as f:
            json.dump(output, f, indent=2)

        size_kb = out_path.stat().st_size / 1024
        print(f"  Written to {out_path} ({size_kb:.1f} KB)")

    print("\nDone.")


if __name__ == "__main__":
    main()