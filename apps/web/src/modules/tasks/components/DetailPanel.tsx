import type { Task } from "../types/adminTasks";
import { PriorityDot, StatusBadge } from "./ui";
import { eventLabelById, isEventRelation } from "./TaskForm";

export function SelectedTaskDetail({ task }: { task?: Task }) {
  if (!task) {
    return (
      <div className="h-[150px] rounded-2xl border border-[var(--border-subtle)] p-3.5 text-sm text-surface-secondary">
        Selecciona una tarea
      </div>
    );
  }

  return (
    <div className="h-[150px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="break-words font-semibold text-surface-main">{task.title}</p>
        <StatusBadge status={task.status} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <PriorityDot priority={task.priority} />
        <span className="text-xs text-surface-secondary">{task.priority}</span>
        <span className="text-xs text-surface-muted">·</span>
        <span className="text-xs text-surface-secondary">{task.type}</span>
      </div>
      <p className="mt-2 text-xs text-surface-secondary">{task.responsible} · {task.deadline}</p>
      {task.description ? (
        <p className="mt-2 max-h-[34px] overflow-hidden break-words text-xs text-surface-secondary">{task.description}</p>
      ) : null}
    </div>
  );
}

export function RelatedSection({ task }: { task?: Task }) {
  if (!task || task.relationType === "Ninguno") {
    return (
      <div className="h-[96px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-3.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-muted">Relacion</p>
        <p className="mt-2 text-sm text-surface-secondary">Sin relacion</p>
      </div>
    );
  }

  const relationDisplay = isEventRelation(task.relationType) && task.relationLabel ? eventLabelById(task.relationLabel) : task.relationLabel;

  return (
    <div className="h-[96px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-3.5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-muted">Relacion</p>
      <p className="mt-1 text-xs text-surface-secondary">{task.relationType}</p>
      <p className="mt-1 max-h-[34px] overflow-hidden break-words text-sm font-semibold text-surface-main">{relationDisplay ?? "—"}</p>
      {task.relationMeta ? (
        <p className="mt-1 text-xs text-surface-secondary">{task.relationMeta}</p>
      ) : null}
    </div>
  );
}
