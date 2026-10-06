import type { ReactNode } from "react";
import type { TutorialStepId } from "../../store/tutorialStore";
import GroundDiagram from "./GroundDiagram";
import Key from "./Key";

export interface TutorialStep {
    id: TutorialStepId;
    title: string;
    required?: boolean;
    content: ReactNode;
}

export const tutorialSteps: TutorialStep[] = [
    {
        id: "overview",
        title: "Welcome to the lab",
        content: (
            <div className="max-w-prose space-y-3">
                <p>
                    You build a circuit on the grid, run a simulation and read
                    the results in the panel on the right.
                </p>
                <p>
                    The components you can place are listed on the left. Demo
                    Circuits loads ready-made circuits onto the grid. HIL
                    Experiments runs a prepared circuit next to measured data,
                    so you can see how closely the two agree. The difference is
                    reported as an RMSE value.
                </p>
                <p>
                    This guide takes about a minute. The ground step matters
                    most, because a circuit without a ground cannot be
                    simulated.
                </p>
            </div>
        ),
    },
    {
        id: "components",
        title: "Place components",
        content: (
            <div className="max-w-prose space-y-3">
                <p>
                    Choose a component in the left panel, then click a point on
                    the grid. The shortcut for each component is shown beside
                    its name. The tool stays active, so you can place several in
                    a row.
                </p>
                <p>
                    Every component except ground spans two grid points, the one
                    you click and the one to its right. These are its terminals,
                    and the left one is positive.
                </p>
                <p>
                    Press <Key>S</Key> to switch to the Select tool. Click a
                    component to edit its value in the Properties panel, and
                    press <Key>Delete</Key> to remove it.
                </p>
            </div>
        ),
    },
    {
        id: "wiring",
        title: "Connect with wires",
        content: (
            <div className="max-w-prose space-y-3">
                <p>
                    Press <Key>W</Key>, click a terminal, then click where the
                    wire should end. A ring appears as the pointer nears a
                    terminal, and the wire snaps to it. Press <Key>Esc</Key> to
                    cancel a wire you have started.
                </p>
                <p>
                    A wire connects only at its two ends. If it passes over a
                    terminal or crosses another wire, nothing is joined, so end
                    each wire on the point you want to connect.
                </p>
                <p>To delete a wire, switch to Select and click it.</p>
            </div>
        ),
    },
    {
        id: "ground",
        title: "Add a ground",
        required: true,
        content: (
            <div className="flex gap-6">
                <div className="min-w-0 flex-1 space-y-3">
                    <p className= "px-3 py-2 font-medium text-red-600">
                        Every circuit needs a ground. Run Simulation stays
                        disabled until one is connected.
                    </p>
                    <p>
                        The simulator uses modified nodal analysis, which solves
                        for the voltage at every node relative to one reference
                        node. Ground is that reference, fixed at 0 V. Without it
                        the equations have no unique solution.
                    </p>
                    <ol className="list-decimal space-y-1.5 pl-5 marker:text-slate-400">
                        <li>
                            Press <Key>G</Key> and click an empty point on the
                            grid.
                        </li>
                        <li>
                            Press <Key>W</Key>, then click the dot at the top of
                            the ground symbol and a terminal of your circuit.
                            For a single source, its negative terminal is the
                            usual choice.
                        </li>
                        <li>
                            Check that the ground is wired. A ground symbol on
                            its own has no effect.
                        </li>
                    </ol>
                    <p>
                        All ground symbols are the same 0 V reference, and every
                        voltage in the results is measured against it. If your
                        circuit has separate sections, each one needs its own
                        connection to ground.
                    </p>
                </div>
                <GroundDiagram />
            </div>
        ),
    },
    {
        id: "running",
        title: "Run the simulation",
        content: (
            <div className="max-w-prose space-y-3">
                <p>
                    Choose DC, AC or transient under Simulation Settings, then
                    press Run Simulation. AC needs a frequency, and transient
                    needs a step and a stop time.
                </p>
                <p>
                    Results appear in the panel below the settings. Node
                    voltages are named after the terminals that meet there, for
                    example R1+ / V1-.
                </p>
                <p>
                    If Run Simulation is greyed out, the note above it explains
                    why, and a missing ground is the usual reason. You can
                    reopen this guide from the question mark above the component
                    list.
                </p>
            </div>
        ),
    },
];
