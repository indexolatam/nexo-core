import { Button, Select } from "antd";
import { CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Task, TaskOwner, TaskPriority } from "../types/adminTasks";
import { taskPriorities } from "../types/adminTasks";
import { PriorityDot, FieldLabel } from "./ui";
import { ownerOptions } from "./TaskFilters";

export type QuickAction = "Crear" | "Editar" | "Completar" | "Cancelar" | "Eliminar" | "Reasignar" | "Cambiar prioridad";

export function QuickActionContent({
  action,
  selectedTask,
  onComplete,
  onDelete,
  onReassign,
  onChangePriority,
}: {
  action: QuickAction;
  selectedTask?: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onReassign: (id: string, owner: TaskOwner) => void;
  onChangePriority: (id: string, priority: TaskPriority) => void;
}) {
  if (action === "Crear") {
    return <p className="text-sm text-surface-secondary">Use el formulario de nueva tarea para crear una tarea.</p>;
  }

  if (!selectedTask) {
    return (
      <div className="rounded-2xl border border-[var(--border-subtle)] p-4 text-sm text-surface-secondary">
        Selecciona una tarea del listado para usar esta accion.
      </div>
    );
  }

  if (action === "Completar") {
    return (
      <div className="grid gap-4">
        <p className="text-sm text-surface-secondary">¿Deseas marcar esta tarea como completada?</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-3">
          <p className="font-semibold text-surface-main">{selectedTask.title}</p>
          <p className="mt-1 text-xs text-surface-secondary">{selectedTask.responsible} · {selectedTask.deadline}</p>
        </div>
        <Button className="rounded-button" icon={<CheckCircleOutlined />} onClick={() => onComplete(selectedTask.id)}>
          Marcar completada
        </Button>
      </div>
    );
  }

  if (action === "Eliminar") {
    return (
      <div className="grid gap-4">
        <p className="text-sm text-surface-secondary">¿Deseas eliminar esta tarea? Esta accion no se puede deshacer.</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-3">
          <p className="font-semibold text-surface-main">{selectedTask.title}</p>
          <p className="mt-1 text-xs text-surface-secondary">{selectedTask.responsible} · {selectedTask.deadline}</p>
        </div>
        <Button danger className="rounded-button" icon={<DeleteOutlined />} onClick={() => onDelete(selectedTask.id)}>
          Eliminar tarea
        </Button>
      </div>
    );
  }

  if (action === "Reasignar") {
    return (
      <div className="grid gap-4">
        <p className="text-sm text-surface-secondary">Reasignar tarea a otro responsable.</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-3">
          <p className="font-semibold text-surface-main">{selectedTask.title}</p>
          <p className="mt-1 text-xs text-surface-secondary">Responsable actual: {selectedTask.responsible}</p>
        </div>
        <FieldLabel label="Nuevo responsable">
          <Select
            defaultValue={selectedTask.responsible}
            onChange={(v) => onReassign(selectedTask.id, v)}
            options={ownerOptions.filter((o) => o.value !== "Todos")}
            className="w-full"
            popupMatchSelectWidth={false}
          />
        </FieldLabel>
      </div>
    );
  }

  if (action === "Cambiar prioridad") {
    return (
      <div className="grid gap-4">
        <p className="text-sm text-surface-secondary">Cambiar prioridad de la tarea.</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-3">
          <p className="font-semibold text-surface-main">{selectedTask.title}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-surface-secondary">
            <PriorityDot priority={selectedTask.priority} /> Prioridad actual: {selectedTask.priority}
          </p>
        </div>
        <FieldLabel label="Nueva prioridad">
          <Select
            defaultValue={selectedTask.priority}
            onChange={(v) => onChangePriority(selectedTask.id, v)}
            options={taskPriorities.map((p) => ({ value: p, label: p }))}
            className="w-full"
            popupMatchSelectWidth={false}
          />
        </FieldLabel>
      </div>
    );
  }

  if (action === "Editar") {
    return (
      <p className="text-sm text-surface-secondary">Use el formulario para editar la tarea seleccionada.</p>
    );
  }

  return null;
}
