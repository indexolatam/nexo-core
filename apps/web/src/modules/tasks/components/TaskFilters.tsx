import { Select } from "antd";
import type { TaskType } from "../types/adminTasks";
import { taskTypes } from "../types/adminTasks";
import { FieldLabel } from "./ui";

export type SortMode = "Fecha limite" | "Prioridad" | "Estado";

export const sortOptions: { value: SortMode; label: string }[] = [
  { value: "Fecha limite", label: "Fecha limite" },
  { value: "Prioridad", label: "Prioridad" },
  { value: "Estado", label: "Estado" },
];

export const ownerOptions = [
  { value: "Todos", label: "Todos" },
  { value: "Doctora", label: "Doctora" },
  { value: "Asistente", label: "Asistente" },
];

const typeOptions = [
  { value: "Todos", label: "Todos" },
  ...taskTypes.map((t) => ({ value: t, label: t })),
];

export function TaskFilters({
  activeOwner,
  onOwnerChange,
  activeType,
  onTypeChange,
  sortBy,
  onSortChange,
  filteredCount,
  showHistory,
  onToggleHistory,
}: {
  activeOwner: string;
  onOwnerChange: (v: string) => void;
  activeType: TaskType | "Todos";
  onTypeChange: (v: TaskType | "Todos") => void;
  sortBy: SortMode;
  onSortChange: (v: SortMode) => void;
  filteredCount: number;
  showHistory: boolean;
  onToggleHistory: () => void;
}) {
  return (
    <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-strong)]/80 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-muted">Filtros</p>
          <p className="mt-1 text-sm text-surface-secondary">Ajusta la lista sin perder el contexto visual.</p>
        </div>
        <span className="flex items-center gap-2">
          <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-surface-muted">
            {filteredCount} visibles
          </span>
          <button
            onClick={onToggleHistory}
            className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]/20"
          >
            {showHistory ? "Ocultar historial" : "Ver historial"}
          </button>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FieldLabel label="Asignado a">
          <Select value={activeOwner} onChange={onOwnerChange} options={ownerOptions} className="w-full" popupMatchSelectWidth={false} />
        </FieldLabel>
        <FieldLabel label="Tipo de tarea">
          <Select value={activeType} onChange={onTypeChange} options={typeOptions} className="w-full" popupMatchSelectWidth={false} />
        </FieldLabel>
        <FieldLabel label="Ordenar por">
          <Select value={sortBy} onChange={onSortChange} options={sortOptions} className="w-full" popupMatchSelectWidth={false} />
        </FieldLabel>
      </div>
    </div>
  );
}
