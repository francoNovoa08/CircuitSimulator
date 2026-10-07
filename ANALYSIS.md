# HIL Project Analysis
## 1. System Overview

An Arduino Uno acquires live voltage measurements from physical RC circuits at 50ms intervals and transmits them over USB serial to a host computer. A C++ application reads this stream, runs a parallel transient simulation of the same circuit using a Modified Nodal Analysis SPICE engine, and compares measured against theoretical voltage at each timestep, outputting RMSE and a timestamped CSV for post-processing.

## 2. Results Summary

| Experiment | Configuration | Initial RMSE | Final RMSE | Reduction |
|---|---|---|---|---|
| Charging | $R= 10 \text{ kΩ}$, $C=105 \text{ µF}$, $V=4.951\text{ V}$ | $0.077 \text{ V}$ | $0.037 \text{ V}$ | 51.2% |
| Leaky capacitor | $R=10 \text{ kΩ}$, $C=680 \text{ µF}$, $R_{leak}=17.8\text{ kΩ}$ | $2.306 \text{ V}$ | $0.214 \text{ V}$ | 90.7% |
| Discharge | $R=10 \text{ kΩ}$, $C=105\text{ µF}$ | $0.051 \text{ V}$ (IC = 4.78 V) | $0.028 \text{ V}$ (IC = 4.912 V) | 45.2% |

Initial RMSE uses nominal component values and $V_{supply} = 5.0 \text{ V}$. Final RMSE uses refined parameters extracted from experimental data.

For the discharge run, the initial figure uses the assumed initial condition of 4.78 V and the final figure uses the measured starting voltage of 4.912 V.

## 3. Error Sources and Quantification

The capacitor settled at 4.951 V, 49 mV below the nominal 5 V, so V1 in the model is set to the measured value. The cause was not isolated; likely candidates are the board's supply rail and capacitor leakage current.

### 3.1 Capacitor Tolerance

Electrolytic capacitors carry a ±20% nominal tolerance, but real deviation depends heavily on manufacturing quality. The 100µF capacitor used in Phases 3a and 3c measured an effective capacitance of 105µF (+5%), well within specification. The 1000µF capacitor used in Phase 3b measured $C_{eff} = 680 \text{ µF}$ (−32%), outside nominal tolerance. Both deviations shifted the RC time constant: $τ_{measured} = RC_{eff}$ rather than the nominal $RC$, producing a systematic phase offset between the theoretical and physical curves that compounds over time. For the charging experiment, correcting the capacitance to 105µF alongside the corrected supply voltage brought RMSE from 0.054V down to 0.037V, a combined 51% reduction from the nominal-parameter baseline.

### 3.2 Capacitor Leakage Current

The $1000µF$ capacitor exhibited voltage-limited charging behaviour: after 300 seconds the physical circuit had only reached 3.06V, against a theoretical steady-state of 4.78V. This 36% deficit is not explained by capacitance deviation alone; it reflects significant leakage current through the capacitor's dielectric.

At steady state, the current supplied through R1 equals the leakage current through the capacitor:
$$(V_{supply} − V_{ss}) / R1 = V_{ss} / R_{leak}$$

Solving for the leakage resistance:
$$R_{leak} = V_{ss} × R1 / (V_{supply} − V_{ss}) = 3.06 × 10,000 / 1.72 ≈ 17.8 \text{ k}Ω$$

Adding this parallel resistance to the SPICE netlist reduced RMSE from 1.60V to 0.214V. The residual error reflects a limitation of the fixed $R_{leak}$ model. Electrolytic leakage resistance is voltage-dependent, not constant. The model captures the dominant behaviour but underestimates steady-state voltage as the capacitor approaches full charge and leakage resistance rises.

### 3.3 ADC Quantisation

The Arduino ADC is 10-bit over a 0-5V range, giving a resolution of $5000 \text{ mV} / 1023 ≈ 4.88 \text{ mV}$ per step. Baseline characterisation in Phase 1 measured a noise floor of ±2mV (1-sigma) at mid-range voltages, with zero measurable noise at the 5V ceiling (ADC saturated at count 1023).

This quantisation floor sets a hard lower bound on achievable RMSE. No amount of model refinement can reduce error below it. At low voltages (below 0.5V, reached after t ≈ 2.4s) the 4.88mV step represents a larger fractional error, inflating RMSE slightly above the mid-range floor. Over the full discharge run the RMSE is 0.028 V, dominated by the first two seconds (0.076 V), where the curve is steepest. From 2 s to 7.8 s it is 0.002 V and beyond 7.8 s it is 0.001 V, below a single ADC step.

### 3.4 Initial Condition Mismatch

The discharge experiment assumed the capacitor was fully charged to V1 = 4.78V, modelled via the IC = 4.78 netlist parameter. The physical capacitor had actually charged to 4.912V (a 132mV excess), consistent with the D2 pin voltage rising slightly as charging current tapered off near full charge (lower current demand implies a decreased resistive drop and thus a higher pin voltage). This mismatch produced an RMSE of 0.139V in the first two seconds. By $t = 2 \text{ s}$ the curves converged and RMSE dropped to 0.005V, confirming the discharge physics are correctly modelled once the initial condition is accurately known. Setting the initial condition to the measured 4.912 V reduced the RMSE over the whole run from 0.051 V to 0.028 V.

### 3.5 Sampling Jitter

The Arduino `delay(50)` function introduces timing uncertainty of approximately ±2ms per sample. At the steepest point of the charging curve (near $t = 0$ where $\frac{dV}{dt}$ is highest) the RC model gives
$\frac{dV}{dt} ≈ V_{supply} / τ = 4.951 / 1.05 ≈ 4.7 \text{ Vs}^{-1}$ 
A ±2ms timing error at this rate produces a voltage uncertainty of ±9mV. This is the worst-case jitter contribution; for most of the charging curve where $\frac{dV}{dt}$ is lower, jitter contributes less than ±2mV. Sampling jitter is negligible relative to the other sources identified above and does not meaningfully affect the RMSE figures.

### 3.6 Time Stamping and Sample Alignment
In HIL mode the solver advances one backward Euler step of $h = 0.05\text{ s}$ for each received sample and the result is compared with that sample. This produces three effects that are separate from the physical error sources in Sections 3.1 to 3.5:
1. **Truncation error.** With $\tau = RC \approx 1.05\text{ s}$, $h/\tau \approx 0.048$. Backward Euler lags the exact RC curve by up to $0.043\text{ V}$ near $t \approx \tau$ for a 4.951 V step.
2. **Clock mismatch.** The mean interval between samples is $50.77\text{ ms}$, not $50\text{ ms}$, so simulated time runs about 1.5% fast.
3. **Sample offset.** The solver steps before comparing, so sample $k$ is compared with the state at $(k+1)h$. This is visible as a 0.22 V gap at $t = 0$ in the charging run. In charging it partly cancels the lag in effect 1.

To separate these from the physical error, the measured traces were compared with the exact solutions $V(1 - e^{-t/RC})$ and $V_0 e^{-t/RC}$ evaluated at the recorded timestamps, using the refined parameters:

| Run | Parameters | RMSE from solver | RMSE, exact solution at recorded timestamps |
|---|---|---|---|
| Charging | $V=4.951\text{ V}$, $C=105\text{ µF}$ | $0.037 \text{ V}$ | $0.010 \text{ V}$ |
| Discharge | $\text{IC}=4.912\text{ V}$, $C=105\text{ µF}$ | $0.028 \text{ V}$ | $0.008 \text{ V}$ |

Best-fit capacitances from the exact solutions are $104.0\text{ µF}$ (charging) and $105.5\text{ µF}$ (discharge). Reading $\tau$ directly from the charging trace at 63.2% of the final voltage gives $1.041\text{ s}$, or $104.1\text{ µF}$. These agree with the 105 µF used, so the capacitance correction in Section 3.2 does not depend on the stepping scheme.

Most of the RMSE reported for these two runs therefore comes from the time stepping and alignment, and the remaining $0.010\text{ V}$ and $0.008\text{ V}$ are the better estimate of physical and measurement error. The RMSE figures in Section 2 are kept as the HIL mode reports them. A smaller step, or a second-order integration method, would reduce the effect; neither has been tested on the HIL runs.

## 4. Model Refinement Methodology

Each experiment began with a nominal SPICE model using datasheet component values and an assumed supply voltage of 5.0V. Parameters were then corrected in order of contribution to RMSE: supply voltage first, then effective capacitance (extracted from the measured time constant $τ_{measured} = RC_{eff}$), then the initial condition where it applies (discharge), then leakage resistance where applicable (inferred from the equilibrium condition at steady state). Each correction was applied independently and RMSE recomputed. Residual error after correction varies by experiment — closest to the 4.88mV ADC quantisation floor for the discharge run, further above it for charging and the leaky capacitor, reflecting the additional error sources discussed in Section 3 that the current model doesn't fully capture.

## 5. Conclusion

A C++ SPICE simulator based on Modified Nodal Analysis correctly predicts RC circuit behaviour when supplied with accurate component parameters; nominal datasheet values alone are insufficient. Across three experiments, systematic model refinement reduced RMSE by 45-91%, with the dominant sources of initial error being capacitor tolerance deviation (−32% to +5% from nominal, extractable from the measured time constant), capacitor leakage current (significant in low-grade electrolytics, modellable as a parallel resistance inferred from steady-state equilibrium), and, to a lesser extent, D2 pin output impedance (a 49mV drop, correctable by measurement). ADC quantisation sets a 4.88mV floor on achievable RMSE. The discharge experiment's residual (28 mV) is closest to it, though still about six times larger, mostly attributed to the errors described in Section 3.6; the charging residual (37mV) mostly reflects time-stepping effects, and the leaky capacitor (214mV) still carries errors the current model doesn't fully capture. Ideal linear SPICE models cannot predict voltage-dependent leakage behaviour without model extension — the Hardware-in-the-Loop system identified this limitation, quantified it, and produced a corrected model that tracks the physical circuit far more closely than the nominal datasheet parameters alone.
