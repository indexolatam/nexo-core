import { CheckCircleOutlined } from "@ant-design/icons";
import type { Task } from "../../../types/adminTasks";
import { Pill, PriorityDot, statusBorderColor } from "./ui";

export function TaskCard({ task, isSelected, onSelect }: { task: Task; isSelected: boolean; onSelect: () => void }) {
  const completed = task.status === "Completada";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl border bg-transparent p-3 text-left transition-colors hover:border-[var(--accent-border)] sm:gap-4 sm:p-3.5"
      style={{
        borderColor: isSelected ? "var(--accent-deep)" : statusBorderColor(task.status),
        boxShadow: isSelected ? "0 0 0 2px var(--agenda-selected-shadow)" : undefined,
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-semibold text-surface-main">{task.title}</p>
        <p className="mt-1 text-[11px] text-surface-secondary sm:text-xs">{task.responsible} · {task.deadline}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PriorityDot priority={task.priority} />
          <Pill>{task.type}</Pill>
          {task.relationType !== "Ninguno" ? <Pill>{task.relationType}</Pill> : null}
        </div>
      </div>
      <CheckCircleOutlined
        className="shrink-0 text-lg"
        style={{ color: completed ? "var(--status-correct)" : "var(--text-muted)" }}
      />
    </button>
  );
}
