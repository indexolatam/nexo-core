import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import type { TaskPriority, TaskStatus } from "../../../types/adminTasks";

export const priorityWeight = (p: TaskPriority): number => {
  if (p === "Alta") return 0;
  if (p === "Media") return 1;
  return 2;
};

export const statusWeight = (s: TaskStatus): number => {
  if (s === "Pendiente") return 0;
  if (s === "En curso") return 1;
  if (s === "Completada") return 2;
  return 3;
};

export const priorityColor = (priority: TaskPriority): string => {
  if (priority === "Alta") return "var(--status-attention)";
  if (priority === "Media") return "var(--accent)";
  return "var(--status-correct)";
};

export const statusBorderColor = (status: TaskStatus): string => {
  if (status === "Pendiente") return "var(--accent-border)";
  if (status === "En curso") return "var(--status-attention)";
  if (status === "Completada") return "var(--status-correct)";
  return "var(--border-subtle)";
};

export function Pill({ children, active = false, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  const className = `inline-flex min-h-6 items-center rounded-full border px-2 py-1 text-[10px] font-medium leading-none sm:min-h-7 sm:px-2.5 sm:text-[11px] ${
    active ? "border-[var(--accent-border)] text-[var(--accent-deep)]" : "border-[var(--border-subtle)] text-surface-secondary"
  } bg-transparent transition-colors hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)]`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return <span className={className}>{children}</span>;
}

export function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-muted">{label}</span>
      {children}
    </label>
  );
}

export function PriorityDot({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: priorityColor(priority) }}
    />
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const icon = status === "Completada" ? <CheckCircleOutlined /> : status === "Cancelada" ? <CloseCircleOutlined /> : <ExclamationCircleOutlined />;
  const label = status === "En curso" ? "Activo" : status;
  return (
    <span
      className="inline-flex whitespace-nowrap items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium sm:text-[11px]"
      style={{ borderColor: statusBorderColor(status), color: statusBorderColor(status) }}
    >
      {icon}
      {label}
    </span>
  );
}
