# Circuit Simulator
## Motivation
The IB Physics curriculum has been updated and greatly downscaled the coverage of circuits. Kirchhoff's laws are not even covered. One student seeking to increase their knowledge of the topic would perhaps do some reading on the side. A crazy one would build an AC/DC linear circuit simulator from scratch to understand exactly how electrical circuits are modelled and the rigorous mathematics behind them. Hence the motivation for this project. 

## Modified Nodal Analysis
This simulator employs Modified Nodal Analysis (MNA) to use Kirchhoff's current law to solve for circuit quantities via systems of equations. The "modified" being due to the need to account for voltage sources. While for other components the voltage across them is what's being found, it is the current through voltage sources what needs to be found in those scenarios.

The systems of equations to solve are of the form:

$$\begin{bmatrix} G & B \\\\ C & D\end{bmatrix} \begin{bmatrix} v \\\\ j \end{bmatrix} = \begin{bmatrix} i_s \\\\ v_s \end{bmatrix}$$

Here, the first row is for a component that is not a voltage source, such as a resistor. The second row is for a voltage source.

* $G$ is the conductance/admittance matrix constructed from components
* $B$ and $C$ map the connections of the voltage sources
* $D$ is zero for ideal independent voltage sources
* $v$ is the unknown voltage across the component
* $j$ is the unknown current through the voltage source
* $v_s$ and $i_s$ are the known voltages and currents

## Stamping
The simulator algorithms construct the matrix iteratively via "stamping rules". For example, a resistor $R$ connected between nodes $i$ and $j$ introduced a current $I=(v_i - v_j)/R$. By Kirchhoff's current law, which states the current in must equal the current out (or, the sum of currents is equal to zero), this stamps an addition of $1/R$ into the diagonal elements $G_{ii}$ and $G_{jj}$ and subtracts $1/R$ from the off-diagonals $G_{ij}$ and $G_{ji}$.

For AC analysis, the real-valued conductances are replaced with frequency-dependent complex admittances, $Y(\omega)$. A capacitor becomes $Y_C = j\omega C$ and an inductor becomes $Y_L = 1/(j\omega L)$, allowing the exact same stamping method to solve for phase shifts using complex numbers.

## Transient Analysis
Energy storing components like charging capacitors or RLC circuits are not instantaneous. To simulate time, the simulator implements numerical integration using the backward Euler method. A continuous differential equation such as $i(t)=C\frac{dv}{dt}$ is approximated over a discrete time step $\Delta t$:

$$i(t) \\approx C\frac{v(t) - v(t - \Delta t)}{\Delta t}$$

Based on the previous step, capacitors and inductors are replaced with a parallel combination of an equivalent conductance $G_{eq} = C/\Delta t$, and a known current source $I_{eq}$. This allows the same solver to simulate continuous time by iterating, stepping time forward and updating reactive components.

## Architecture and Design
### Structs over Polymorphism
Circuit components appear to map nicely to an inheritance-oriented OOP design. An abstract component class can be inherited by Resistor, Capacitor, Inductor, etc. classes. However, the program must iterate rapidly through every component to stamp values into a contiguous matrix. A Component struct using a ComponentType enum allows the matrix builder to use contiguous Component vectors, resulting in faster matrix assembly and better cache locality.

### Partial Pivoting
Because the MNA formulation introduces $0$ entries on the main diagonal (specifically in the $D$ block due to voltage sources), a standard naive Gaussian elimination solver will immediately fail via division by zero. The solution used is partial pivoting. By actively scanning for the largest absolute value in the current column and swapping rows before elimination, the solver prevents compounding rounding errors.

## Hardware Validation

The simulator's transient analysis has been validated against physical RC circuits using a Hardware-in-the-Loop system. An Arduino Uno acquires live voltage measurements from breadboard circuits and transmits them to the simulator in real time, enabling direct comparison between theoretical and measured behaviour.

Across three experiments (RC charging, leaky capacitor, RC discharge), systematic model refinement reduced RMSE by 90–93%. Residual error after refinement is bounded by ADC quantisation at 4.88mV resolution. This is a physical measurement floor, not a modelling limitation.

For full methodology, data, and analysis see ANALYSIS.md.

## Future Work
This engine currently handles DC, steady-state AC. and transient analysis for linear components. Reasonable extensions may include:
1. Non-linear components (diodes, transistors, etc.)
2. GUI
