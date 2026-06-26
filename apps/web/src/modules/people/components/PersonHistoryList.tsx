import { Empty } from "antd";
import type { PersonHistoryEntry } from "../../../types/adminPeople";

export function PersonHistoryList({ entries }: { entries: PersonHistoryEntry[] }) {
  if (entries.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin historial" />;

  return (
    <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1 thin-task-scrollbar">
      {entries.map((entry) => (
        <div key={entry.id} className="rounded-2xl border border-[var(--border-subtle)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{entry.date}</p>
          <p className="mt-1 font-semibold text-surface-main">{entry.title}</p>
          <p className="mt-1 text-sm text-surface-secondary">{entry.detail}</p>
        </div>
      ))}
    </div>
  );
}