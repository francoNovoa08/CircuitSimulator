interface CircuitModule {
    cwrap: (name: string, returnType: string, argTypes: string[]) => (...args: any[]) => any;
    onRuntimeInitialized?: () => void;
}

declare global {
    interface Window {
        Module: CircuitModule;
    }
}

let modulePromise: Promise<CircuitModule> | null = null;

export function getModule(): Promise<CircuitModule> {
    if (!modulePromise) {
        modulePromise = new Promise((resolve, reject) => {
            window.Module = {
                cwrap: () => { throw new Error('Module not yet initialised'); },
                onRuntimeInitialized() {
                    resolve(window.Module);
                },
            };

            const script = document.createElement('script');
            script.src = '/circuit_sim.js';
            script.onerror = () => reject(new Error('Failed to load circuit_sim.js'));
            document.head.appendChild(script);
        });
    }
    return modulePromise;
}