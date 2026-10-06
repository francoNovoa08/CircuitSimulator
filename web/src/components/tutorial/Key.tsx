import type { ReactNode } from "react";

export default function Key({ children }: { children: ReactNode }) {
    return (
        <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[11px] font-semibold text-slate-500 shadow-sm">
            {children}
        </kbd>
    );
}
