"""
 Usage: python create_chart.py hil_data/charging.csv hil_data/discharge.csv hil_data/leaky_run1.csv hil_data/leaky_run2.csv out_rc.png out_leakage.png
"""

import argparse
import csv
import math
from typing import NamedTuple

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import font_manager
from scipy.optimize import least_squares

STEP = 0.05
R = 10e3

V_SUPPLY_NOMINAL = 5.0
V_SUPPLY_MEASURED = 4.951 
C_LEAKY_NOMINAL = 1000e-6

INK = "#222222"
MUTED = "#6b6b6b"
GRID = "#e6e6e6"
WORST = "#d1603d"
MIDDLE = "#8a9aa8"
BEST = "#2a6f97"


class Stage(NamedTuple):
    name: str
    model: list[float]
    colour: str


class Panel(NamedTuple):
    title: str
    t: list[float]
    measured: list[float]
    stages: list[Stage]
    xmax: float
    ylim_top: float
    ylim_residual: tuple[float, float]
    simulated_label: str = "Simulated"


def pick_font(*names):
    installed = {f.name for f in font_manager.fontManager.ttflist}
    return next((n for n in names if n in installed), "DejaVu Sans")


def load(path):
    with open(path, newline="") as f:
        rows = list(csv.DictReader(f))
    t = [float(r["timestamp_ms"]) / 1000 for r in rows]
    return t, [float(r["v_theoretical"]) for r in rows], [float(r["v_actual"]) for r in rows]


def charge(v_supply, c, n, r_leak=None):
    """Backward-Euler charge of C through R, optionally with a resistor across C."""
    conductance = 1 / R + (0 if r_leak is None else 1 / r_leak)
    a = STEP / c
    v, out = 0.0, []
    for _ in range(n):
        v = (v + a * v_supply / R) / (1 + a * conductance)
        out.append(v)
    return out


def discharge(v0, c, n):
    k, v, out = STEP / (R * c), v0, []
    for _ in range(n):
        v = v / (1 + k)
        out.append(v)
    return out


def fit_leakage(measured, free_capacitance):
    """Least-squares fit of the leakage resistance, and optionally the capacitance.

    Returns (capacitance in uF, leakage resistance in kohm).
    """
    n = len(measured)
    target = np.asarray(measured)

    def model(c, r_leak):
        return np.asarray(charge(V_SUPPLY_MEASURED, c, n, r_leak))

    if free_capacitance:
        fitted = least_squares(lambda p: model(p[0] * 1e-6, p[1] * 1e3) - target, [1000, 20]).x
        return fitted[0], fitted[1]

    fitted = least_squares(lambda p: model(C_LEAKY_NOMINAL, p[0] * 1e3) - target, [20]).x
    return C_LEAKY_NOMINAL * 1e6, fitted[0]


def rmse(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)) / len(a))


def check(model, recorded, label):
    worst = max(abs(x - y) for x, y in zip(model, recorded))
    assert worst < 1e-5, f"{label}: model differs from recorded v_theoretical by {worst:.2e}"


def style(ax):
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(MUTED)
        ax.spines[side].set_linewidth(0.8)
    ax.tick_params(colors=MUTED, labelsize=9, length=3, width=0.8)
    ax.grid(axis="y", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)


def draw_panel(top, bottom, panel, xlabel="Time (s)"):
    style(top)
    style(bottom)

    top.plot(panel.t, panel.measured, color=INK, linewidth=1.8, label="Measured")
    top.plot(panel.t, panel.stages[-1].model, color=BEST, linewidth=1.2, linestyle=(0, (4, 2)),
             label=panel.simulated_label)
    top.set_ylim(0, panel.ylim_top)
    top.set_xlim(0, panel.xmax)
    top.set_ylabel("Voltage (V)", fontsize=10, color=MUTED)
    top.set_title(panel.title, loc="left", fontsize=12, color=INK, pad=8)
    top.tick_params(labelbottom=False)
    top.legend(frameon=False, fontsize=9, labelcolor=INK, loc="best")

    for stage in panel.stages:
        residual = [a - b for a, b in zip(stage.model, panel.measured)]
        label = f"{stage.name} (RMSE {rmse(stage.model, panel.measured):.3f} V)"
        bottom.plot(panel.t, residual, color=stage.colour, linewidth=1.5, label=label)
    bottom.axhline(0, color=INK, linewidth=0.8)
    bottom.set_xlim(0, panel.xmax)
    bottom.set_ylim(*panel.ylim_residual)
    bottom.set_ylabel("Residual (V)", fontsize=10, color=MUTED)
    bottom.set_xlabel(xlabel, fontsize=10, color=MUTED)
    bottom.legend(frameon=False, fontsize=9, labelcolor=INK, loc="best")


def render(panels, out):
    fig, axes = plt.subplots(
        2, len(panels), figsize=(12, 6.6), dpi=200, height_ratios=[1.2, 1.0], constrained_layout=True,
    )
    for column, panel in enumerate(panels):
        draw_panel(axes[0, column], axes[1, column], panel)
    fig.savefig(out)
    plt.close(fig)
    print("saved", out)


def build_rc_panels(charging_csv, discharge_csv):
    tc, th_c, ac_c = load(charging_csv)
    td, th_d, ac_d = load(discharge_csv)
    check(charge(4.78, 105e-6, len(tc)), th_c, "charging file")
    check(discharge(4.78, 105e-6, len(td)), th_d, "discharge file")

    charging = [
        Stage("Nominal values", charge(V_SUPPLY_NOMINAL, 100e-6, len(tc)), WORST),
        Stage("Supply measured", charge(V_SUPPLY_MEASURED, 100e-6, len(tc)), MIDDLE),
        Stage("Capacitance measured", charge(V_SUPPLY_MEASURED, 105e-6, len(tc)), BEST),
    ]
    discharging = [
        Stage("Assumed 4.78 V start", discharge(4.78, 105e-6, len(td)), WORST),
        Stage("Measured 4.912 V start", discharge(4.912, 105e-6, len(td)), BEST),
    ]
    return [
        Panel("Charging", tc, ac_c, charging, 10, 5.6, (-0.10, 0.30)),
        Panel("Discharging (first 8 s of 15)", td, ac_d, discharging, 8, 5.4, (-0.45, 0.12)),
    ]


def build_leakage_panels(run_paths):
    titles = ["1000 µF capacitor, first run", "1000 µF capacitor, second run"]
    residual_limits = [(-0.7, 2.0), (-0.7, 2.8)]
    panels = []
    for path, title, limits in zip(run_paths, titles, residual_limits):
        t, theoretical, measured = load(path)
        n = len(t)
        check(charge(V_SUPPLY_NOMINAL, C_LEAKY_NOMINAL, n), theoretical, path)

        _, r_only = fit_leakage(measured, free_capacitance=False)
        c_both, r_both = fit_leakage(measured, free_capacitance=True)
        print(f"{path}: leakage only {r_only:.1f} kohm | capacitance and leakage {c_both:.0f} uF, {r_both:.1f} kohm")

        stages = [
            Stage("Nominal values", charge(V_SUPPLY_NOMINAL, C_LEAKY_NOMINAL, n), WORST),
            Stage("Leakage added", charge(V_SUPPLY_MEASURED, C_LEAKY_NOMINAL, n, r_only * 1e3), MIDDLE),
            Stage("Capacitance fitted", charge(V_SUPPLY_MEASURED, c_both * 1e-6, n, r_both * 1e3), BEST),
        ]
        simulated_label = f"Simulated ({c_both:.0f} µF, {r_both:.0f} kΩ leakage)"
        panels.append(Panel(title, t, measured, stages, 90, 5.6, limits, simulated_label))
    return panels


def parse_args():
    parser = argparse.ArgumentParser(description="Draw the RC and leakage comparison charts.")
    parser.add_argument("charging_csv")
    parser.add_argument("discharge_csv")
    parser.add_argument("leaky_run1_csv")
    parser.add_argument("leaky_run2_csv")
    parser.add_argument("out_rc")
    parser.add_argument("out_leakage")
    return parser.parse_args()


def main():
    args = parse_args()
    plt.rcParams["font.family"] = pick_font("Arial", "Helvetica Neue", "Helvetica", "Liberation Sans", "Segoe UI")

    render(build_rc_panels(args.charging_csv, args.discharge_csv), args.out_rc)
    render(build_leakage_panels([args.leaky_run1_csv, args.leaky_run2_csv]), args.out_leakage)


if __name__ == "__main__":
    main()