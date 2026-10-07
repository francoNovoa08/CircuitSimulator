# Usage: python create_.py hil_data/charging.csv hil_data/discharge.csv out.png

import csv
import math
import sys
from typing import NamedTuple

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

STEP = 0.05
R = 10e3

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


def pick_font(*names):
    installed = {f.name for f in font_manager.fontManager.ttflist}
    return next((n for n in names if n in installed), "DejaVu Sans")


def load(path):
    with open(path, newline="") as f:
        rows = list(csv.DictReader(f))
    t = [float(r["timestamp_ms"]) / 1000 for r in rows]
    return t, [float(r["v_theoretical"]) for r in rows], [float(r["v_actual"]) for r in rows]


def charge(v_supply, c, n):
    k, v, out = STEP / (R * c), 0.0, []
    for _ in range(n):
        v = (v + k * v_supply) / (1 + k)
        out.append(v)
    return out


def discharge(v0, c, n):
    k, v, out = STEP / (R * c), v0, []
    for _ in range(n):
        v = v / (1 + k)
        out.append(v)
    return out


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


def draw_panel(top, bottom, title, t, measured, stages, xmax, ylim_top, ylim_residual, xlabel):
    style(top)
    style(bottom)

    top.plot(t, measured, color=INK, linewidth=1.8, label="Measured")
    top.plot(t, stages[-1].model, color=BEST, linewidth=1.2, linestyle=(0, (4, 2)), label="Simulated")
    top.set_ylim(0, ylim_top)
    top.set_xlim(0, xmax)
    top.set_ylabel("Voltage (V)", fontsize=10, color=MUTED)
    top.set_title(title, loc="left", fontsize=12, color=INK, pad=8)
    top.tick_params(labelbottom=False)
    top.legend(frameon=False, fontsize=9, labelcolor=INK, loc="best")

    for stage in stages:
        residual = [a - b for a, b in zip(stage.model, measured)]
        label = f"{stage.name} (RMSE {rmse(stage.model, measured):.3f} V)"
        bottom.plot(t, residual, color=stage.colour, linewidth=1.5, label=label)
    bottom.axhline(0, color=INK, linewidth=0.8)
    bottom.set_ylim(*ylim_residual)
    bottom.set_ylabel("Residual (V)", fontsize=10, color=MUTED)
    bottom.set_xlabel(xlabel, fontsize=10, color=MUTED)
    bottom.legend(frameon=False, fontsize=9, labelcolor=INK, loc="best")


def main(charging_csv, discharge_csv, out):
    plt.rcParams["font.family"] = pick_font("Arial", "Helvetica Neue", "Helvetica", "Liberation Sans", "Segoe UI")

    tc, th_c, ac_c = load(charging_csv)
    td, th_d, ac_d = load(discharge_csv)
    check(charge(4.78, 105e-6, len(tc)), th_c, "charging file")
    check(discharge(4.78, 105e-6, len(td)), th_d, "discharge file")

    charging = [
        Stage("Nominal values", charge(5.0, 100e-6, len(tc)), WORST),
        Stage("Supply measured", charge(4.951, 100e-6, len(tc)), MIDDLE),
        Stage("Capacitance measured", charge(4.951, 105e-6, len(tc)), BEST),
    ]
    discharging = [
        Stage("Assumed 4.78 V start", discharge(4.78, 105e-6, len(td)), WORST),
        Stage("Measured 4.912 V start", discharge(4.912, 105e-6, len(td)), BEST),
    ]

    fig, axes = plt.subplots(
        2, 2, figsize=(12, 6.6), dpi=200, height_ratios=[1.2, 1.0], constrained_layout=True,
    )
    draw_panel(axes[0, 0], axes[1, 0], "Charging", tc, ac_c, charging, 10, 5.6, (-0.10, 0.30), "Time (s)")
    draw_panel(axes[0, 1], axes[1, 1], "Discharging (first 8 s of 15)", td, ac_d, discharging, 8, 5.4, (-0.45, 0.12), "Time (s)")

    fig.savefig(out)
    print("saved", out)


if __name__ == "__main__":
    main(*sys.argv[1:4])