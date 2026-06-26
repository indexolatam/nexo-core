import type { Person } from "../../../types/adminPeople";

export function PeopleBigCounter({ items }: { items: Person[] }) {
  const activos = items.filter((p) => p.estado === "Activo").length;
  const pendientes = items.filter((p) => p.estado === "Pendiente").length;
  const inactivos = items.filter((p) => p.estado === "Inactivo").length;
  const archivados = items.filter((p) => p.estado === "Archivado").length;
  const total = items.length;

  return (
    <div className="flex min-w-[118px] items-end justify-center gap-2 rounded-3xl border border-[var(--border-subtle)] bg-[var(--accent-soft)]/20 px-4 py-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-surface-muted">Personas</p>
        <div className="mt-1 flex items-start gap-2 leading-none">
          <span className="text-5xl font-black tracking-tight text-surface-main">{activos}</span>
          <span className="pt-1 text-sm font-bold text-surface-secondary">{pendientes + inactivos + archivados}/{total}</span>
        </div>
      </div>
    </div>
  );
}