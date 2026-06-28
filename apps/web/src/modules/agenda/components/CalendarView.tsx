import { type CSSProperties } from "react";
import {
  ClockCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import type {
  AgendaEvent,
  AgendaTone,
  AgendaView,
} from "../types/adminAgenda";
import {
  agendaLocationLabels,
  agendaWeekDays,
} from "../types/adminAgenda";
import { Pill } from "./AgendaFilters";

export const dayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const monthDays = Array.from({ length: 30 }, (_, index) => index + 1);

export function getPeriodLabel(view: AgendaView, offset: number) {
  const baseDate = new Date();

  if (view === "Hoy") {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + offset);
    return date.toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  if (view === "Semana") {
    const start = new Date(baseDate);
    start.setDate(baseDate.getDate() + offset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startLabel = start.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
    });
    const endLabel = end.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
    });

    return `${startLabel} - ${endLabel}`;
  }

  const monthDate = new Date(baseDate);
  monthDate.setMonth(baseDate.getMonth() + offset);
  return monthDate.toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric",
  });
}

export function isEventInPeriod(
  event: AgendaEvent,
  view: AgendaView,
  offset: number,
) {
  if (view === "Hoy") return event.date === 12 + offset;
  if (view === "Semana") {
    const start = 12 + offset * 7;
    const end = start + 6;
    return event.date >= start && event.date <= end;
  }

  return offset === 0;
}

function getEventFrameStyle(
  event: AgendaEvent,
  selected?: boolean,
): CSSProperties {
  const borderColor =
    event.status === "Cancelado"
      ? "var(--status-cancelled-border)"
      : event.status === "Reprogramado"
        ? "var(--status-reprogrammed-border)"
        : event.status === "Confirmado" || event.status === "Completado"
          ? "var(--status-correct-border)"
          : "var(--agenda-event-border)";

  return {
    borderColor,
    boxShadow: selected
      ? "0 0 0 2px var(--agenda-selected-shadow)"
      : undefined,
  };
}

function StatusDot({ tone }: { tone: AgendaTone }) {
  const className =
    tone === "correcto"
      ? "border-[var(--status-correct-border)] text-[var(--status-correct)]"
      : tone === "atencion"
        ? "border-[var(--status-attention-border)] text-[var(--status-attention)]"
        : "border-[var(--agenda-event-border)] text-[var(--status-neutral)]";

  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-transparent text-sm ${className}`}
    >
      <ClockCircleOutlined />
    </span>
  );
}

export function LocationBadge({ event }: { event: AgendaEvent }) {
  if (event.locationType !== "en_campo") return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] text-surface-muted"
      title={event.locationReference || agendaLocationLabels.en_campo}
    >
      <EnvironmentOutlined />
      <span>{agendaLocationLabels.en_campo}</span>
    </span>
  );
}

function CalendarEventChip({
  event,
  selected,
  onSelect,
}: {
  event: AgendaEvent;
  selected?: boolean;
  onSelect?: (event: AgendaEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(event)}
      style={getEventFrameStyle(event, selected)}
      className={`w-full truncate rounded-lg border bg-transparent px-2 py-1 text-left text-[11px] transition-colors hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)] ${
        selected ? "text-[var(--accent-deep)]" : "text-surface-secondary"
      }`}
    >
      <div className="truncate">
        <span>
          {event.time} · {event.title}
        </span>
        {event.locationType === "en_campo" ? (
          <div className="mt-0.5 flex flex-wrap gap-1">
            <LocationBadge event={event} />
          </div>
        ) : null}
      </div>
    </button>
  );
}

export function EventList({
  events,
  view,
  selectedEventId,
  onSelectEvent,
}: {
  events: AgendaEvent[];
  view: AgendaView;
  selectedEventId?: string;
  onSelectEvent: (event: AgendaEvent) => void;
}) {
  return (
    <div className="space-y-2 pr-1">
      {events.length > 0 ? (
        events.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelectEvent(event)}
            style={getEventFrameStyle(event, selectedEventId === event.id)}
            className={`flex w-full gap-2 rounded-xl border bg-transparent p-2.5 text-left transition-colors hover:border-[var(--accent-border)] sm:gap-3 sm:p-3 ${
              selectedEventId === event.id ? "" : ""
            }`}
          >
            <StatusDot tone={event.tone} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-surface-main sm:text-sm">
                {view === "Hoy" ? "" : `${event.day} · `}
                {event.time} · {event.title}
              </p>
              <p className="mt-1 text-[11px] text-surface-secondary sm:text-xs">
                {event.meta}
              </p>
              {event.locationType === "en_campo" ? (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <LocationBadge event={event} />
                </div>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                <Pill>{event.filter}</Pill>
                <Pill>{event.owner}</Pill>
                {event.isRecurring ? <Pill>↻ Recurrente</Pill> : null}
              </div>
            </div>
            <EditOutlined className="mt-1 text-[var(--text-muted)]" />
          </button>
        ))
      ) : (
        <div className="rounded-2xl border border-[var(--border-subtle)] p-4 text-sm text-surface-secondary">
          No hay eventos para esta combinación de vista y filtro.
        </div>
      )}
    </div>
  );
}

export function CalendarBoard({
  view,
  events,
  selectedEventId,
  onSelectEvent,
}: {
  view: AgendaView;
  events: AgendaEvent[];
  selectedEventId?: string;
  onSelectEvent: (event: AgendaEvent) => void;
}) {
  if (view === "Hoy") {
    return (
      <div className="min-h-[320px] pb-2 sm:min-h-[420px]">
        <div className="space-y-2 sm:hidden">
          {events.length > 0 ? (
            events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                style={getEventFrameStyle(
                  event,
                  selectedEventId === event.id,
                )}
                className="grid w-full grid-cols-[56px_1fr] gap-3 rounded-xl border bg-transparent p-3 text-left transition-colors hover:border-[var(--accent-border)]"
              >
                <div className="text-xs font-semibold text-surface-main">
                  {event.time}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-surface-main">
                    {event.title}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-surface-secondary">
                    {event.meta} · {event.owner}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Pill>{event.filter}</Pill>
                    {event.isRecurring ? <Pill>↻ Recurrente</Pill> : null}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-[var(--agenda-event-border)] p-4 text-sm text-surface-secondary">
              Sin eventos para este día.
            </div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <div className="min-w-[780px] rounded-2xl border border-[var(--agenda-event-border)] p-3">
            <div className="grid grid-cols-11 gap-2 text-xs text-surface-muted">
              {[
                "08",
                "09",
                "10",
                "11",
                "12",
                "13",
                "14",
                "15",
                "16",
                "17",
                "18",
              ].map((hour) => (
                <span key={hour}>{hour}:00</span>
              ))}
            </div>
            <div className="mt-3 h-px bg-[var(--border-subtle)]" />
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-surface-muted">
                  Doctora
                </p>
                <div className="grid grid-cols-11 gap-2">
                  {events
                    .filter(
                      (event) =>
                        event.filter === "Consultas" ||
                        event.filter === "Administración",
                    )
                    .map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onSelectEvent(event)}
                        style={getEventFrameStyle(
                          event,
                          selectedEventId === event.id,
                        )}
                        className={`col-span-2 rounded-xl border bg-transparent p-2 text-left text-xs transition-colors hover:border-[var(--accent-border)] ${
                          selectedEventId === event.id
                            ? "text-[var(--accent-deep)]"
                            : "text-surface-secondary"
                        }`}
                      >
                        <p className="truncate font-semibold text-surface-main">
                          {event.title}
                        </p>
                        <p className="mt-1 text-xs">{event.time}</p>
                      </button>
                    ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-surface-muted">
                  Asistente
                </p>
                <div className="grid grid-cols-11 gap-2">
                  {events
                    .filter(
                      (event) =>
                        event.filter !== "Consultas" &&
                        event.filter !== "Administración",
                    )
                    .map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onSelectEvent(event)}
                        style={getEventFrameStyle(
                          event,
                          selectedEventId === event.id,
                        )}
                        className={`col-span-2 rounded-xl border bg-transparent p-2 text-left text-xs transition-colors hover:border-[var(--accent-border)] ${
                          selectedEventId === event.id
                            ? "text-[var(--accent-deep)]"
                            : "text-surface-secondary"
                        }`}
                      >
                        <p className="truncate font-semibold text-surface-main">
                          {event.title}
                        </p>
                        <p className="mt-1 text-xs">{event.time}</p>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "Semana") {
    return (
      <div className="grid min-h-[320px] gap-2 sm:grid-cols-2 lg:min-h-[420px] lg:grid-cols-7">
        {agendaWeekDays.map((day) => {
          const dayEvents = events.filter((event) => event.day === day);

          return (
            <div
              key={day}
              className="min-h-36 rounded-2xl border border-[var(--agenda-event-border)] p-2.5"
            >
              <p className="text-xs font-semibold text-surface-main">{day}</p>
              <div className="mt-2 space-y-2">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => (
                    <CalendarEventChip
                      key={event.id}
                      event={event}
                      selected={selectedEventId === event.id}
                      onSelect={onSelectEvent}
                    />
                  ))
                ) : (
                  <p className="text-xs text-surface-muted">Sin eventos</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid min-h-[320px] grid-cols-2 gap-2 sm:grid-cols-3 lg:min-h-[420px] lg:grid-cols-5 xl:grid-cols-6">
      {monthDays.map((day) => {
        const dayEvents = events.filter((event) => event.date === day);

        return (
          <div
            key={day}
            className="min-h-24 rounded-2xl border border-[var(--agenda-event-border)] p-2.5"
          >
            <p className="text-xs font-semibold text-surface-main">{day}</p>
            <div className="mt-2 space-y-2">
              {dayEvents
                .slice(0, 2)
                .map((event) => (
                  <CalendarEventChip
                    key={event.id}
                    event={event}
                    selected={selectedEventId === event.id}
                    onSelect={onSelectEvent}
                  />
                ))}
              {dayEvents.length > 2 ? (
                <p className="text-xs text-surface-muted">
                  +{dayEvents.length - 2} más
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
