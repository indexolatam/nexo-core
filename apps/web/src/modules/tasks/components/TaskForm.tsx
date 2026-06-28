import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Input, Select } from "antd";
import type { AgendaEvent } from "../../agenda/types/adminAgenda";
import type { Task, TaskRelationType, TaskType } from "../types/adminTasks";
import { taskPriorities, taskTypes } from "../types/adminTasks";
import { FieldLabel } from "./ui";

const agendaEventTypeOptions = [
  { value: "Consultas", label: "Consultas" },
  { value: "Administración", label: "Administración" },
  { value: "Marketing", label: "Marketing" },
  { value: "Empresas", label: "Empresas" },
  { value: "Talleres", label: "Talleres" },
  { value: "Personal", label: "Personal" },
  { value: "Otros", label: "Otros" },
];

function getAvailableEvents(typeFilter?: string): AgendaEvent[] {
  return ([] as AgendaEvent[]).filter((e) => {
    if (e.status === "Cancelado") return false;
    if (e.status === "Completado" && e.date < 12) return false;
    if (typeFilter && typeFilter !== "Todos" && e.filter !== typeFilter) return false;
    return true;
  });
}

function eventSelectOptions(typeFilter?: string): { value: string; label: string }[] {
  return getAvailableEvents(typeFilter).map((e) => ({
    value: e.id,
    label: `${e.day} ${e.date} · ${e.time} · ${e.title}${e.person ? ` (${e.person})` : ""}`,
  }));
}

export function eventLabelById(id: string): string {
  const event = ([] as AgendaEvent[]).find((e) => e.id === id);
  if (!event) return id;
  return `${event.day} ${event.date} · ${event.time} · ${event.title}`;
}

export function eventDateById(id: string): string {
  const event = ([] as AgendaEvent[]).find((e) => e.id === id);
  if (!event) return "";
  const month = 6;
  const day = String(event.date).padStart(2, "0");
  return `2026-${String(month).padStart(2, "0")}-${day}`;
}

export function isDeadlineAfterEvent(deadlineDate: string, eventDate: string): boolean {
  return deadlineDate > eventDate;
}

export function defaultEventFilterForTaskType(type?: TaskType): string {
  if (type === "Consulta" || type === "Seguimiento") return "Consultas";
  if (type === "Marketing") return "Marketing";
  if (type === "Empresa") return "Empresas";
  if (type === "Taller") return "Talleres";
  if (type === "Personal") return "Personal";
  if (type === "Administrativa") return "Administración";
  return "Todos";
}

export function relationTypeFromEventFilter(filter: string): TaskRelationType {
  if (filter === "Talleres") return "Taller";
  if (filter === "Empresas") return "Empresa";
  if (filter === "Otros") return "Otros";
  return "Evento";
}

export function isEventRelation(relationType?: TaskRelationType): boolean {
  return relationType === "Evento" || relationType === "Taller" || relationType === "Empresa";
}

export function TaskForm({
  form,
  setForm,
  eventFilter,
  setEventFilter,
}: {
  form: Partial<Task>;
  setForm: (f: Partial<Task>) => void;
  eventFilter: string;
  setEventFilter: (v: string) => void;
}) {
  const showEventPicker = eventFilter !== "Otros";
  const effectiveEventFilter = eventFilter;
  const selectedEventDate = showEventPicker && form.relationLabel ? eventDateById(form.relationLabel) : "";
  const deadlineDate = form.deadlineDate ?? "";
  const showDeadlineWarning = showEventPicker && selectedEventDate && deadlineDate && isDeadlineAfterEvent(deadlineDate, selectedEventDate);

  return (
    <div className="grid gap-4">
      <FieldLabel label="Titulo">
        <Input
          value={form.title ?? ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Titulo de la tarea"
        />
      </FieldLabel>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel label="Responsable">
          <Select
            value={form.responsible ?? "Doctora"}
            onChange={(v) => setForm({ ...form, responsible: v })}
            options={[
              { value: "Doctora", label: "Doctora" },
              { value: "Asistente", label: "Asistente" },
            ]}
            className="w-full"
            popupMatchSelectWidth={false}
          />
        </FieldLabel>
        <FieldLabel label="Prioridad">
          <Select
            value={form.priority ?? "Media"}
            onChange={(v) => setForm({ ...form, priority: v })}
            options={taskPriorities.map((p) => ({ value: p, label: p }))}
            className="w-full"
            popupMatchSelectWidth={false}
          />
        </FieldLabel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel label="Tipo">
          <Select
            value={form.type ?? "Administrativa"}
            onChange={(v) => {
              const nextEventFilter = defaultEventFilterForTaskType(v);
              setForm({ ...form, type: v, relationType: relationTypeFromEventFilter(nextEventFilter), relationLabel: undefined, relationMeta: undefined });
              setEventFilter(nextEventFilter);
            }}
            options={taskTypes.map((t) => ({ value: t, label: t }))}
            className="w-full"
            popupMatchSelectWidth={false}
          />
        </FieldLabel>
        <FieldLabel label="Fecha limite">
          <Input
            type="date"
            value={form.deadlineDate ?? ""}
            onChange={(e) => setForm({ ...form, deadlineDate: e.target.value, deadline: e.target.value })}
          />
        </FieldLabel>
      </div>

      <FieldLabel label="Descripcion">
        <Input.TextArea
          rows={3}
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Detalle de la tarea"
        />
      </FieldLabel>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-surface-muted">Relacion</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label="Filtro de evento">
            <Select
              value={effectiveEventFilter}
              onChange={(v) => {
                setEventFilter(v);
                setForm({ ...form, relationType: relationTypeFromEventFilter(v), relationLabel: undefined, relationMeta: undefined });
              }}
              options={[{ value: "Todos", label: "Todos" }, ...agendaEventTypeOptions]}
              className="w-full"
              popupMatchSelectWidth={false}
            />
          </FieldLabel>

          {showEventPicker ? (
            <FieldLabel label="Evento relacionado">
              <Select
                value={form.relationLabel ?? undefined}
                onChange={(v) => {
                  const event = ([] as AgendaEvent[]).find((e) => e.id === v);
                  setForm({ ...form, relationLabel: v, relationMeta: event ? `${event.day} ${event.date} · ${event.time}` : undefined });
                }}
                options={eventSelectOptions(effectiveEventFilter === "Todos" ? undefined : effectiveEventFilter)}
                showSearch
                optionFilterProp="label"
                className="w-full"
                popupMatchSelectWidth={false}
                placeholder={eventFilter !== "Todos" ? `Eventos de ${eventFilter}...` : "Buscar evento..."}
              />
            </FieldLabel>
          ) : (
            <FieldLabel label="Referencia / detalle">
              <Input
                value={form.relationLabel ?? ""}
                onChange={(e) => setForm({ ...form, relationType: "Otros", relationLabel: e.target.value, relationMeta: "Fuera de agenda" })}
                placeholder="Tarea personal, interna o fuera de agenda"
              />
            </FieldLabel>
          )}
        </div>

        {showDeadlineWarning ? (
          <p className="mt-3 flex items-center gap-1.5 rounded-xl border border-[var(--status-attention)] p-2.5 text-xs text-[var(--status-attention)]">
            <ExclamationCircleOutlined />
            La fecha limite es posterior al evento relacionado.
          </p>
        ) : null}
      </div>
    </div>
  );
}
