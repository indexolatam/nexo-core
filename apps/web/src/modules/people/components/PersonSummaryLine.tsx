import type { ReactNode } from "react";

export function PersonSummaryLine({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="min-w-0 flex items-start gap-3 rounded-2xl border border-[var(--border-subtle)] bg-transparent p-4">
      <span className="mt-0.5 text-base text-[var(--accent-deep)]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-muted">{label}</p>
        <p className="mt-1 whitespace-normal break-words text-sm font-medium leading-5 text-surface-main [overflow-wrap:anywhere]">{value}</p>
      </div>
    </div>
  );
}