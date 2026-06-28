import { Empty } from "antd";
import type { UserTaskEntry } from "../types/adminUsers";

export function UserTasksList({ entries }: { entries: UserTaskEntry[] }) {
  if (entries.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin tareas" />;

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.id} className="rounded-2xl border border-[var(--border-subtle)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-surface-main">{entry.title}</p>
              <p className="mt-1 text-sm text-surface-secondary">Prioridad: {entry.priority}</p>
            </div>
            <span className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-surface-secondary">{entry.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
