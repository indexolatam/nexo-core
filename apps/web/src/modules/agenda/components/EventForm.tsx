import { useMemo, useState, type ReactNode } from "react";
import { Input, InputNumber, Radio, Select } from "antd";
import {
  EnvironmentOutlined,
  HomeOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import type {
  AgendaEvent,
  AgendaFilter,
  AgendaView,
} from "../../../types/adminAgenda";
import {
  agendaFilters,
  agendaLocationLabels,
  agendaLocationTypes,
  agendaViews,
} from "../../../types/adminAgenda";
import { FilterGroup, Pill } from "./AgendaFilters";
import { LocationBadge } from "./CalendarView";

export type QuickAction =
  | "Crear actividad"
  | "Editar"
  | "Reprogramar"
  | "Confirmar"
  | "Cancelar"
  | "Repetir"
  | "Duplicar";

const locationIcons: Record<string, ReactNode> = {
  en_clinica: <HomeOutlined />,
  remoto: <VideoCameraOutlined />,
  en_campo: <EnvironmentOutlined />,
};

const eventTypeOptions = agendaFilters
  .filter((item) => item !== "Todos")
  .map((item) => ({ value: item, label: item }));

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function SelectedEventSummary({ event }: { event?: AgendaEvent }) {
  if (!event) {
    return (
      <div className="rounded-2xl border border-[var(--border-subtle)] p-4 text-sm text-surface-secondary">
        Selecciona un evento del listado o calendario para usar esta acción.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
      <p className="font-semibold text-surface-main">{event.title}</p>
      <p className="mt-1 text-sm text-surface-secondary">
        {event.day} · {event.time} · {event.meta}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill>{event.filter}</Pill>
        <Pill>{event.owner}</Pill>
        {event.isRecurring ? <Pill>↻ Recurrente</Pill> : null}
      </div>
      {event.locationType === "en_campo" ? (
        <>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <LocationBadge event={event} />
            {event.tiempoPrevioMinutes ? (
              <Pill>🕐 Ida: {event.tiempoPrevioMinutes} min</Pill>
            ) : null}
            {event.tiempoPosteriorMinutes ? (
              <Pill>🕐 Vuelta: {event.tiempoPosteriorMinutes} min</Pill>
            ) : null}
          </div>
          {event.locationReference ? (
            <p className="mt-2 truncate text-xs text-surface-muted">
              📍 {event.locationReference}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function FutureEventPicker({
  selectedEventId,
  onSelectEvent,
}: {
  selectedEventId?: string;
  onSelectEvent: (event: AgendaEvent) => void;
}) {
  const [periodFilter, setPeriodFilter] = useState<AgendaView>("Semana");
  const [typeFilter, setTypeFilter] = useState<AgendaFilter>("Todos");

  const futureEvents = useMemo(() => {
    const byPeriod =
      periodFilter === "Hoy"
        ? ([] as AgendaEvent[]).filter((event) => event.date === 12)
        : ([] as AgendaEvent[]);
    return typeFilter === "Todos"
      ? byPeriod
      : byPeriod.filter((event) => event.filter === typeFilter);
  }, [periodFilter, typeFilter]);

  return (
    <div className="grid gap-3">
      <FilterGroup label="Periodo">
        {agendaViews.map((view) => (
          <Pill
            key={view}
            active={periodFilter === view}
            onClick={() => setPeriodFilter(view)}
          >
            {view}
          </Pill>
        ))}
      </FilterGroup>
      <FilterGroup label="Tipo">
        {agendaFilters.map((item) => (
          <Pill
            key={item}
            active={typeFilter === item}
            onClick={() => setTypeFilter(item)}
          >
            {item}
          </Pill>
        ))}
      </FilterGroup>
      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {futureEvents.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelectEvent(event)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-transparent p-3 text-left transition-colors hover:border-[var(--accent-border)] ${
              selectedEventId === event.id
                ? "border-[var(--agenda-action-border)]"
                : "border-[var(--agenda-event-border)]"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-surface-main">
                {event.day} · {event.time} · {event.title}
              </p>
              <p className="mt-1 text-xs text-surface-secondary">
                {event.meta}
              </p>
            </div>
            <Pill>{event.filter}</Pill>
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuickActionContent({
  action,
  selectedEvent,
  onSelectEvent,
}: {
  action: QuickAction;
  selectedEvent?: AgendaEvent;
  onSelectEvent: (event: AgendaEvent) => void;
}) {
  const [editingEvent, setEditingEvent] = useState<
    AgendaEvent | undefined
  >(selectedEvent);

  const handleEditSelect = (event: AgendaEvent) => {
    setEditingEvent(event);
    onSelectEvent(event);
  };

  if (
    (action === "Reprogramar" ||
      action === "Confirmar" ||
      action === "Cancelar" ||
      action === "Repetir" ||
      action === "Duplicar") &&
    !selectedEvent
  ) {
    return <SelectedEventSummary />;
  }

  if (action === "Crear actividad") {
    return (
      <div className="grid gap-4">
        <FieldLabel label="Ubicación">
          <Radio.Group defaultValue="en_clinica" className="flex gap-2">
            {agendaLocationTypes.map((loc) => (
              <Radio.Button
                key={loc}
                value={loc}
                className="flex items-center gap-1 rounded-button border-[var(--border-subtle)]"
              >
                {locationIcons[loc]} {agendaLocationLabels[loc]}
              </Radio.Button>
            ))}
          </Radio.Group>
        </FieldLabel>

        <div className="rounded-2xl border border-[var(--border-subtle)] p-3">
          <FieldLabel label="Enlace de videollamada">
            <Input placeholder="https://meet.google.com/..." />
          </FieldLabel>
        </div>

        <div className="grid gap-4 rounded-2xl border border-[var(--border-subtle)] p-3">
          <FieldLabel label="Departamento">
            <Input placeholder="Ej: Managua, Masaya, Granada..." />
          </FieldLabel>
          <FieldLabel label="Dirección o referencia">
            <Input placeholder="Dirección completa del lugar" />
          </FieldLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldLabel label="Tiempo de ida (minutos)">
              <InputNumber
                min={0}
                max={1440}
                className="w-full rounded-button"
                placeholder="30"
              />
            </FieldLabel>
            <FieldLabel label="Tiempo de regreso (minutos)">
              <InputNumber
                min={0}
                max={1440}
                className="w-full rounded-button"
                placeholder="30"
              />
            </FieldLabel>
          </div>
        </div>

        <FieldLabel label="Crear como">
          <Select
            defaultValue="contacto"
            options={[
              { value: "contacto", label: "Contacto" },
              { value: "actividad", label: "Actividad" },
            ]}
          />
        </FieldLabel>
        <FieldLabel label="Contacto / actividad">
          <Input placeholder="Nombre del contacto o título de la actividad" />
        </FieldLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label="Fecha">
            <Input placeholder="__/__/____" />
          </FieldLabel>
          <FieldLabel label="Hora inicio">
            <Input placeholder="__:__" />
          </FieldLabel>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label="Duración">
            <Select
              defaultValue="50"
              options={[
                { value: "30", label: "30 min" },
                { value: "50", label: "50 min" },
                { value: "60", label: "60 min" },
              ]}
            />
          </FieldLabel>
          <FieldLabel label="Estado">
            <Select
              defaultValue="pendiente"
              options={[
                { value: "pendiente", label: "Pendiente" },
                { value: "confirmada", label: "Confirmada" },
              ]}
            />
          </FieldLabel>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label="Tipo / etiqueta">
            <Select defaultValue="Consultas" options={eventTypeOptions} />
          </FieldLabel>
          <FieldLabel label="Responsable">
            <Select
              defaultValue="root"
              options={[
                { value: "root", label: "Root Admin" },
              ]}
            />
          </FieldLabel>
        </div>
        <FieldLabel label="Recurrente">
          <Select
            defaultValue="no"
            options={[
              { value: "no", label: "No" },
              { value: "si", label: "Sí" },
            ]}
          />
        </FieldLabel>
        <FieldLabel label="Notas administrativas">
          <Input.TextArea rows={3} placeholder="Sin datos clínicos sensibles" />
        </FieldLabel>
        <p className="rounded-2xl border border-[var(--border-subtle)] p-3 text-xs text-surface-secondary">
          El sistema validará conflictos de horario antes de guardar.
        </p>
      </div>
    );
  }

  if (action === "Editar") {
    const eventToEdit = editingEvent ?? selectedEvent;

    return (
      <div className="grid gap-4">
        <FutureEventPicker
          selectedEventId={eventToEdit?.id}
          onSelectEvent={handleEditSelect}
        />
        {eventToEdit ? (
          <>
            <SelectedEventSummary event={eventToEdit} />
            <FieldLabel label="Título">
              <Input value={eventToEdit.title} readOnly />
            </FieldLabel>
            <div className="grid gap-4 sm:grid-cols-3">
              <FieldLabel label="Hora">
                <Input value={eventToEdit.time} readOnly />
              </FieldLabel>
              <FieldLabel label="Tipo">
                <Select
                  value={eventToEdit.filter}
                  options={eventTypeOptions}
                />
              </FieldLabel>
              <FieldLabel label="Estado">
                <Select
                  value={eventToEdit.tone}
                  options={[
                    { value: "correcto", label: "Confirmado" },
                    { value: "atencion", label: "Pendiente" },
                    { value: "neutro", label: "Informativo" },
                  ]}
                />
              </FieldLabel>
            </div>
            <FieldLabel label="Ubicación">
              <Radio.Group
                defaultValue={eventToEdit.locationType || "en_clinica"}
                className="flex gap-2"
              >
                {agendaLocationTypes.map((loc) => (
                  <Radio.Button
                    key={loc}
                    value={loc}
                    className="flex items-center gap-1 rounded-button border-[var(--border-subtle)]"
                  >
                    {locationIcons[loc]} {agendaLocationLabels[loc]}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </FieldLabel>
          </>
        ) : (
          <p className="text-sm text-surface-secondary">
            Selecciona una actividad futura para editar sus datos
            administrativos.
          </p>
        )}
      </div>
    );
  }

  if (action === "Reprogramar" && selectedEvent) {
    return (
      <div className="grid gap-4">
        <SelectedEventSummary event={selectedEvent} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label="Nueva fecha">
            <Input placeholder="__/__/____" />
          </FieldLabel>
          <FieldLabel label="Nueva hora">
            <Input placeholder="__:__" />
          </FieldLabel>
        </div>
        <FieldLabel label="Motivo administrativo">
          <Input.TextArea rows={3} placeholder="Opcional" />
        </FieldLabel>
      </div>
    );
  }

  if (action === "Confirmar" && selectedEvent) {
    return (
      <div className="grid gap-4">
        <p className="text-sm text-surface-secondary">
          ¿Deseas marcar este evento como confirmado?
        </p>
        <SelectedEventSummary event={selectedEvent} />
      </div>
    );
  }

  if (action === "Cancelar" && selectedEvent) {
    return (
      <div className="grid gap-4">
        <p className="text-sm text-surface-secondary">
          ¿Deseas cancelar este evento?
        </p>
        <SelectedEventSummary event={selectedEvent} />
        <FieldLabel label="Motivo administrativo">
          <Input.TextArea rows={3} placeholder="No incluir notas clínicas" />
        </FieldLabel>
      </div>
    );
  }

  if (action === "Repetir" && selectedEvent) {
    return (
      <div className="grid gap-4">
        <SelectedEventSummary event={selectedEvent} />
        <FieldLabel label="Frecuencia">
          <Select
            defaultValue="semanal"
            options={[
              { value: "diario", label: "Diario" },
              { value: "semanal", label: "Semanal" },
              { value: "mensual", label: "Mensual" },
              { value: "personalizado", label: "Personalizado" },
            ]}
          />
        </FieldLabel>
        <FieldLabel label="Finalización">
          <Select
            defaultValue="nunca"
            options={[
              { value: "nunca", label: "Nunca" },
              { value: "fecha", label: "Fecha específica" },
              { value: "repeticiones", label: "Número de repeticiones" },
            ]}
          />
        </FieldLabel>
        <FieldLabel label="Al editar serie">
          <Select
            defaultValue="este"
            options={[
              { value: "este", label: "Solo este evento" },
              { value: "futuros", label: "Este y futuros eventos" },
              { value: "serie", label: "Toda la serie" },
            ]}
          />
        </FieldLabel>
      </div>
    );
  }

  if (action === "Duplicar" && selectedEvent) {
    return (
      <div className="grid gap-4">
        <SelectedEventSummary event={selectedEvent} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label="Nueva fecha">
            <Input placeholder="__/__/____" />
          </FieldLabel>
          <FieldLabel label="Nueva hora">
            <Input placeholder="__:__" />
          </FieldLabel>
        </div>
        <FieldLabel label="Responsable">
          <Select
            defaultValue={selectedEvent.owner.toLowerCase()}
            options={[
              { value: "root", label: "Root Admin" },
            ]}
          />
        </FieldLabel>
        <p className="rounded-2xl border border-[var(--border-subtle)] p-3 text-xs text-surface-secondary">
          Se validará conflicto de horario antes de duplicar.
        </p>
      </div>
    );
  }

  return null;
}
