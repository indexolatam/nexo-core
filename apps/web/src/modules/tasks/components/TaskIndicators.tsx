import { Card } from "antd";
import type { Task } from "../../../types/adminTasks";
import { TASK_BASE_DATE } from "../../../types/adminTasks";

export function IndicatorsRow({ tasks, filteredTasks }: { tasks: Task[]; filteredTasks: Task[] }) {
  const total = tasks.length;
  const pendientes = tasks.filter((t) => t.status === "Pendiente").length;
  const enCurso = tasks.filter((t) => t.status === "En curso").length;

  const filteredTotal = filteredTasks.length;
  const filteredPendientes = filteredTasks.filter((t) => t.status === "Pendiente").length;
  const filteredEnCurso = filteredTasks.filter((t) => t.status === "En curso").length;

  const items = [
    { label: "En curso", value: enCurso, small: filteredEnCurso, borderColor: "var(--accent)" },
    { label: "Pendientes", value: pendientes, small: filteredPendientes, borderColor: "var(--status-attention)" },
    { label: "Total", value: total, small: filteredTotal, borderColor: "var(--accent-border)" },
  ];

  return (
    <div className="grid gap-2 sm:gap-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {items.map((item) => (
          <Card
            key={item.label}
            className="overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            style={{ borderTopColor: item.borderColor, borderTopWidth: 3 }}
            styles={{ body: { padding: "14px 16px" } }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-surface-muted sm:text-[11px]">{item.label}</p>
                <p className="mt-1 text-2xl font-bold leading-none text-surface-main sm:text-[2rem]">{item.value}</p>
              </div>
              <span className="rounded-full bg-[var(--surface-soft)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-surface-muted">
                {item.small}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function RightPanelCounters({ tasks, filteredCount }: { tasks: Task[]; filteredCount: number }) {
  const completadas = tasks.filter((t) => t.status === "Completada").length;
  const vencidas = tasks.filter((t) => t.status !== "Completada" && t.status !== "Cancelada" && t.deadlineDate < TASK_BASE_DATE).length;
  const items = [
    { label: "Vencidas", value: vencidas, color: "var(--status-attention)" },
    { label: "Completadas", value: completadas, color: "var(--status-correct)" },
    { label: "Tareas", value: filteredCount, color: "var(--accent-deep)" },
  ];

  return (
    <div className="mt-3 shrink-0 border-t border-[var(--border-subtle)] pt-3">
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-surface-muted">Resumen</p>
      <div className="flex flex-col">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center justify-between px-1 py-2.5 ${i < items.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-muted">{item.label}</span>
            <span className="text-sm font-bold leading-none sm:text-base" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
