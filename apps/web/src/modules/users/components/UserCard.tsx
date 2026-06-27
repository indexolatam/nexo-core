import { UnorderedListOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { User } from "../../../types/adminUsers";
import { formatTypeLabel, highlight } from "../../../utils/formatting";

export function UserCard({ person, compact, selected, onClick, query }: { person: User; compact?: boolean; selected?: boolean; onClick: (person: User) => void; query: string }) {
  return (
    <button type="button" onClick={() => onClick(person)}
      className={`w-full rounded-3xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border)] ${selected ? "border-[var(--accent-border)] bg-[var(--accent-soft)]/40 shadow-sm" : "border-[var(--border-subtle)] bg-transparent"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Tooltip title={person.user_name} placement="topLeft">
            <h3 className={`max-w-full truncate whitespace-nowrap font-semibold text-surface-main ${compact ? "text-sm" : "text-base"}`}>{highlight(person.user_name, query)}</h3>
          </Tooltip>
          <div className="mt-2 flex flex-wrap gap-2">
            {person.user_types.map((type) => (
              <span key={type} className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-surface-secondary">{formatTypeLabel(type)}</span>
            ))}
          </div>
        </div>
        <span className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-surface-secondary">{person.user_status}</span>
      </div>
      {!compact ? (
        <div className="mt-4 space-y-2 text-sm text-surface-secondary">
          <p>Última interacción: {person.user_last_interaction}</p>
          <p>Próxima: {person.user_next_activity} · {person.user_next_activity_detail}</p>
          <p className="flex items-center gap-2 text-xs font-medium text-[var(--status-attention)]">
            <UnorderedListOutlined />{person.tareas.pendientes.length} tarea(s) pendiente(s)
          </p>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between text-xs text-surface-secondary">
          <span>{person.user_last_interaction}</span>
          <span>{person.user_next_activity}</span>
        </div>
      )}
    </button>
  );
}
