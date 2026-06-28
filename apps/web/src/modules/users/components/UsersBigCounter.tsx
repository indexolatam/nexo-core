import type { User } from "../types/adminUsers";

export function UsersBigCounter({ items }: { items: User[] }) {
  const activos = items.filter((p) => p.user_status === "Activo").length;
  const pendientes = items.filter((p) => p.user_status === "Pendiente").length;
  const inactivos = items.filter((p) => p.user_status === "Inactivo").length;
  const archivados = items.filter((p) => p.user_status === "Archivado").length;
  const total = items.length;

  return (
    <div className="flex min-w-[118px] items-end justify-center gap-2 rounded-3xl border border-[var(--border-subtle)] bg-[var(--accent-soft)]/20 px-4 py-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-surface-muted">Usuarios</p>
        <div className="mt-1 flex items-start gap-2 leading-none">
          <span className="text-5xl font-black tracking-tight text-surface-main">{activos}</span>
          <span className="pt-1 text-sm font-bold text-surface-secondary">{pendientes + inactivos + archivados}/{total}</span>
        </div>
      </div>
    </div>
  );
}