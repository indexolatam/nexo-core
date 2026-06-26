import { UnorderedListOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import type { Person } from "../../../types/adminPeople";

function formatTypeLabel(type: string) {
  return type === "Participante Taller" ? "Taller" : type;
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.trim().toLowerCase()
      ? <mark key={index} className="rounded bg-[var(--accent-soft)] px-0.5 text-[var(--accent-deep)]">{part}</mark>
      : <span key={index}>{part}</span>
  );
}

export function PersonCard({ person, compact, selected, onClick, query }: { person: Person; compact?: boolean; selected?: boolean; onClick: (person: Person) => void; query: string }) {
  return (
    <button type="button" onClick={() => onClick(person)}
      className={`w-full rounded-3xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border)] ${selected ? "border-[var(--accent-border)] bg-[var(--accent-soft)]/40 shadow-sm" : "border-[var(--border-subtle)] bg-transparent"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Tooltip title={person.nombre} placement="topLeft">
            <h3 className={`max-w-full truncate whitespace-nowrap font-semibold text-surface-main ${compact ? "text-sm" : "text-base"}`}>{highlight(person.nombre, query)}</h3>
          </Tooltip>
          <div className="mt-2 flex flex-wrap gap-2">
            {person.tipos.map((type) => (
              <span key={type} className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-surface-secondary">{formatTypeLabel(type)}</span>
            ))}
          </div>
        </div>
        <span className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-surface-secondary">{person.estado}</span>
      </div>
      {!compact ? (
        <div className="mt-4 space-y-2 text-sm text-surface-secondary">
          <p>Última interacción: {person.ultima_interaccion}</p>
          <p>Próxima: {person.proxima_actividad} · {person.proxima_actividad_detalle}</p>
          <p className="flex items-center gap-2 text-xs font-medium text-[var(--status-attention)]">
            <UnorderedListOutlined />{person.tareas.pendientes.length} tarea(s) pendiente(s)
          </p>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between text-xs text-surface-secondary">
          <span>{person.ultima_interaccion}</span>
          <span>{person.proxima_actividad}</span>
        </div>
      )}
    </button>
  );
}