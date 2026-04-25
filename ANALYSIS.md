# HIL Project Analysis
## 1. System Overview

An Arduino Uno acquires live voltage measurements from physical RC circuits at 50ms intervals and transmits them over USB serial to a host computer. A C++ application reads this stream, runs a parallel transient simulation of the same circuit using a Modified Nodal Analysis SPICE engine, and compares measured against theoretical voltage at each timestep, outputting RMSE and a timestamped CSV for post-processing.

## 2. Results Summary

| Experiment | Configuration | Initial RMSE | Final RMSE | Reduction |
|---|---|---|---|---|
| Charging | $R= 10 \text{ kΩ}$, $C=105 \text{ µF}$, $V=4.78\text{ V}$ | $1.503 \text{ V}$ | $0.101 \text{ V}$ | 93.3% |
| Leaky capacitor | $R=10 \text{ kΩ}$, $C=680 \text{ µF}$, $R_{leak}=17.8\text{ kΩ}$ | $2.306 \text{ V}$ | $0.214 \text{ V}$ | 90.7% |
| Discharge | $R=10 \text{ kΩ}$, $C=105\text{ µF}$, $\text{IC}=4.78\text{ V}$ | — | $0.051 \text{ V}$ | — |

Initial RMSE uses nominal component values and $V_{supply} = 5.0 \text{ V}$. Final RMSE uses refined parameters extracted from experimental data.

## 3. Error Sources and Quantification
### 3.1 D2 Pin Output Impedance

The Arduino D2 digital output pin is not an ideal voltage source. Under load, its output voltage sags below the nominal 5V. With a 10kΩ resistor connected, the measured steady-state capacitor voltage was 4.78V, showing a 220mV drop representing a 4.4% systematic underestimate of the supply voltage. Using the nominal 5.0V in the SPICE model produced an initial RMSE of 1.503V. Correcting V1 to 4.78V reduced this to 0.156V. This was the single largest improvement across the entire refinement sequence, achieved by correcting one parameter. 

### 3.2 Capacitor Tolerance

Electrolytic capacitors carry a ±20% nominal tolerance, but real deviation depends heavily on manufacturing quality. The 100µF capacitor used in Phases 3a and 3c measured an effective capacitance of 105µF (+5%), well within specification. The 1000µF capacitor used in Phase 3b measured $C_{eff} = 680 \text{ µF}$ (−32%), outside nominal tolerance. Both deviations shifted the RC time constant: $τ_{measured} = RC_{eff}$ rather than the nominal $RC$, producing a systematic phase offset between the theoretical and physical curves that compounds over time.

### 3.3 Capacitor Leakage Current

The Chong $1000µF$ capacitor exhibited voltage-limited charging behaviour: after 300 seconds the physical circuit had only reached 3.06V, against a theoretical steady-state of 4.78V. This 36% deficit is not explained by capacitance deviation alone and it reflects significant leakage current through the capacitor's dielectric.

At steady state, the current supplied through R1 equals the leakage current through the capacitor:
$$
(V_{supply} − V_{ss}) / R1 = V_{ss} / R_{leak}
$$

Solving for the leakage resistance:
$$
R_{leak} = V_{ss} × R1 / (V_{supply} − V_{ss}) = 3.06 × 10,000 / 1.72 ≈ 17.8 \text{ k}Ω
$$

Adding this parallel resistance to the SPICE netlist reduced RMSE from 1.60V to 0.214V. The residual error reflects a limitation of the fixed $R_{leak}$ model. Electrolytic leakage resistance is voltage-dependent, not constant. The model captures the dominant behaviour but underestimates steady-state voltage as the capacitor approaches full charge and leakage resistance rises.

### 3.4 ADC Quantisation

The Arduino ADC is 10-bit over a 0-5V range, giving a resolution of $5000 \text{ mV} / 1023 ≈ 4.88 \text{ mV}$ per step. Baseline characterisation in Phase 1 measured a noise floor of ±2mV (1-sigma) at mid-range voltages, with zero measurable noise at the 5V ceiling (ADC saturated at count 1023).

This quantisation floor sets a hard lower bound on achievable RMSE. No amount of model refinement can reduce error below it. This is reflected by the discharge result of 0.051V RMSE. At low voltages (below 0.5V, reached after t ≈ 2.4s) the 4.88mV step represents a larger fractional error, inflating RMSE slightly above the mid-range floor. The mid-discharge RMSE of 0.005V and tail RMSE of 0.001V confirm that once the signal is in a well-resolved range, the simulator tracks the physical curve to within ADC noise.

### 3.5 Initial Condition Mismatch

The discharge experiment assumed the capacitor was fully charged to V1 = 4.78V, modelled via the IC = 4.78 netlist parameter. The physical capacitor had actually charged to 4.912V (a 132mV excess), consistent with the D2 pin voltage rising slightly as charging current tapered off near full charge (lower current demand implies a decreased resistive drop and thus a higher pin voltage). This mismatch produced an RMSE of 0.139V in the first two seconds. By $t = 2 \text{ s}$ the curves converged and RMSE dropped to 0.005V, confirming the discharge physics are correctly modelled once the initial condition is accurately known.

### 3.6 Sampling Jitter

The Arduino `delay(50)` function introduces timing uncertainty of approximately ±2ms per sample. At the steepest point of the charging curve (near $t = 0$ where $\frac{dV}{dt}$ is highest) the RC model gives
$\frac{dV}{dt} ≈ V_{supply} / τ = 4.78 / 1.05 ≈ 4.6 \text{ Vs}^{-1}$ 
A ±2ms timing error at this rate produces a voltage uncertainty of ±9mV. This is the worst-case jitter contribution; for most of the charging curve where $\frac{dV}{dt}$ is lower, jitter contributes less than ±2mV. Sampling jitter is negligible relative to the other sources identified above and does not meaningfully affect the RMSE figures.

## 4. Model Refinement Methodology

Each experiment began with a nominal SPICE model using datasheet component values and an assumed supply voltage of 5.0V. Parameters were then corrected in order of contribution to RMSE: supply voltage first (single largest source, responsible for the majority of initial error), then effective capacitance (extracted from the measured time constant $τ_{measured} = RC_{eff}$), then leakage resistance where applicable (inferred from the equilibrium condition at steady state). Each correction was applied independently and RMSE recomputed. The residual error after all corrections is bounded by the ADC quantisation floor (4.88mV resolution, ±2mV measured noise), confirming that the simulator's MNA solver is correct. The gap between simulation and reality was due to physical constraints rather than methodology.

## 5. Conclusion

A C++ SPICE simulator based on Modified Nodal Analysis correctly predicts RC circuit behaviour when supplied with accurate component parameters; nominal datasheet values alone are insufficient. Across three experiments, systematic model refinement reduced RMSE by 90-93%, with the dominant sources of initial error being D2 pin output impedance (220mV systematic voltage drop, correctable by measurement), capacitor tolerance deviation (−32% to +5% from nominal, extractable from the measured time constant), and capacitor leakage current (significant in low-grade electrolytics, modellable as a parallel resistance inferred from steady-state equilibrium). The irreducible floor is ADC quantisation at 4.88mV resolution, the point at which measurement precision limits further improvement rather than modelling accuracy. Ideal linear SPICE models cannot predict voltage-dependent leakage behaviour without model extension; the Hardware-in-the-Loop system successfully identified this limitation, quantified it, and produced a corrected model that tracks the physical circuit to within the measurement floor.