import {
  CheckCircleOutlined,
  EditOutlined,
  PlusOutlined,
  RedoOutlined,
  StopOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Input, Modal, Row } from "antd";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  agendaFilters,
  agendaViews,
  type AgendaEvent,
  type AgendaFilter,
  type AgendaLocationType,
  type AgendaTone,
  type AgendaView,
} from "../../types/adminAgenda";
import type { D1AgendaEvent } from "../../types/d1";
import { agendaService } from "../../services";
import { Pill, SegmentedControl, PeriodNavigator } from "./components/AgendaFilters";
import {
  CalendarBoard,
  EventList,
  LocationBadge,
  dayNames,
  getPeriodLabel,
  isEventInPeriod,
} from "./components/CalendarView";
import { type QuickAction, QuickActionContent } from "./components/EventForm";

type FocusMode = "Eventos" | "Calendario";

const focusModes: FocusMode[] = ["Eventos", "Calendario"];

const actions: { label: QuickAction; icon: ReactNode; requiresEvent?: boolean }[] = [
  { label: "Confirmar", icon: <CheckCircleOutlined />, requiresEvent: true },
  { label: "Editar", icon: <EditOutlined /> },
  { label: "Reprogramar", icon: <SwapOutlined />, requiresEvent: true },
  { label: "Repetir", icon: <RedoOutlined />, requiresEvent: true },
  { label: "Duplicar", icon: <PlusOutlined />, requiresEvent: true },
  { label: "Cancelar", icon: <StopOutlined />, requiresEvent: true },
];

const statusMap: Record<string, AgendaEvent["status"]> = {
  Pendiente: "Pendiente",
  Confirmado: "Confirmado",
  Completado: "Completado",
  Cancelado: "Cancelado",
  Reprogramado: "Reprogramado",
  "En curso": "En curso",
};

const toneMap: Record<string, AgendaTone> = {
  correcto: "correcto",
  atencion: "atencion",
  neutro: "neutro",
};

function toAgendaEvent(d1: D1AgendaEvent): AgendaEvent {
  const startDate = new Date(d1.starts_at);
  return {
    id: d1.id,
    day: dayNames[startDate.getDay()],
    date: startDate.getDate(),
    time: `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`,
    title: d1.title,
    meta: d1.meta ?? "",
    filter: d1.category as AgendaEvent["filter"],
    tone: toneMap[d1.tone ?? ""] ?? "neutro",
    status: statusMap[d1.status] ?? "Pendiente",
    owner: d1.assigned_user_id === "asistente" ? "Asistente" : "Doctora",
    person: d1.person_id ?? undefined,
    isRecurring: d1.is_recurring || undefined,
    locationType: (d1.location_type as AgendaLocationType) || "en_clinica",
    tiempoPrevioMinutes: d1.tiempo_previo_minutes ?? undefined,
    tiempoPosteriorMinutes: d1.tiempo_posterior_minutes ?? undefined,
    locationDepartment: d1.location_department ?? undefined,
    locationReference: d1.location_reference ?? undefined,
    meetingUrl: d1.meeting_url ?? undefined,
  };
}

export function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [focusMode, setFocusMode] = useState<FocusMode>("Eventos");
  const [activeView, setActiveView] = useState<AgendaView>("Hoy");
  const [periodOffset, setPeriodOffset] = useState(0);
  const [activeFilter, setActiveFilter] = useState<AgendaFilter>("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | undefined>();
  const [activeAction, setActiveAction] = useState<QuickAction | undefined>();

  useEffect(() => {
    agendaService
      .list()
      .then((d1Events) => {
        setEvents((d1Events as unknown as D1AgendaEvent[]).map(toAgendaEvent));
      })
      .catch(() => {});
  }, []);

  const filteredEvents = useMemo(() => {
    const byPeriod = events.filter((event) =>
      isEventInPeriod(event, activeView, periodOffset),
    );
    const byType =
      activeFilter === "Todos"
        ? byPeriod
        : byPeriod.filter((event) => event.filter === activeFilter);
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return byType;

    return byType.filter((event) =>
      [event.title, event.meta, event.filter, event.owner, event.person, event.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
    );
  }, [activeFilter, activeView, events, periodOffset, searchTerm]);

  const openQuickAction = (action: QuickAction) => {
    setActiveAction(action);
  };

  const closeQuickAction = () => {
    setActiveAction(undefined);
  };

  const modalOkLabel =
    activeAction === "Confirmar"
      ? "Confirmar"
      : activeAction === "Cancelar"
        ? "Cancelar evento"
        : activeAction === "Reprogramar"
          ? "Reprogramar"
          : activeAction === "Repetir"
            ? "Crear recurrencia"
            : activeAction === "Duplicar"
              ? "Duplicar"
              : activeAction === "Editar"
                ? "Guardar cambios"
                : "Crear actividad";

  const currentPeriodLabel = getPeriodLabel(activeView, periodOffset);
  const activeEvent = events.find((event) => event.status === "En curso");
  const nextEvent = events.find(
    (event) =>
      event.status !== "En curso" && event.date === 12 && event.time > "11:30",
  );

  const openEventAction = (action: QuickAction, event: AgendaEvent) => {
    setSelectedEvent(event);
    setActiveAction(action);
  };

  const handleViewChange = (view: AgendaView) => {
    setActiveView(view);
    setPeriodOffset(0);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Resumen de agenda
        </p>
        <h1 className="mt-2 text-2xl font-bold text-surface-main sm:mt-3 sm:text-4xl">
          Agenda
        </h1>
        <p className="mt-2 max-w-3xl text-xs text-surface-secondary sm:text-sm">
          Eventos, calendario y actividad clínica del día. Acciones rápidas para
          gestionar citas.
        </p>
      </section>

      <Card
        className="rounded-3xl border-[var(--border)]"
        styles={{ body: { padding: 16 } }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Actividad en curso
        </p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-surface-main sm:text-xl">
              {activeEvent
                ? activeEvent.title
                : "No hay actividades activas"}
            </h2>
            <p className="mt-1 text-sm text-surface-secondary">
              {activeEvent
                ? `Responsable: ${activeEvent.owner} · Inicio: ${activeEvent.time} · Estado: ${activeEvent.status}`
                : "La agenda no tiene actividad en curso registrada."}
            </p>
            <p className="mt-1 text-xs text-surface-secondary">
              Próximo evento:{" "}
              {nextEvent
                ? `${nextEvent.title} ${nextEvent.time}`
                : "Sin próximos eventos"}
            </p>
          </div>
          {activeEvent ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="small"
                className="rounded-button"
                icon={<CheckCircleOutlined />}
                onClick={() => openEventAction("Confirmar", activeEvent)}
              >
                Confirmar
              </Button>
              <Button
                size="small"
                className="rounded-button"
                icon={<SwapOutlined />}
                onClick={() => openEventAction("Reprogramar", activeEvent)}
              >
                Reprogramar
              </Button>
              <Button
                size="small"
                className="rounded-button"
                icon={<StopOutlined />}
                onClick={() => openEventAction("Cancelar", activeEvent)}
              >
                Cancelar
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      <Card
        className="rounded-3xl border-[var(--border)]"
        styles={{ body: { padding: 16 } }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Buscar y crear
            </p>
            <p className="mt-1 text-xs text-surface-secondary sm:text-sm">
              Acceso rápido a pacientes, empresas, talleres, actividades y
              responsables.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input.Search
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar paciente, contacto, empresa, taller, actividad o responsable..."
            className="min-w-0 flex-1 rounded-2xl bg-[var(--agenda-search-bg)]"
            allowClear
          />
          <Button
            className="h-9 rounded-button border-[var(--agenda-action-border)] px-5"
            icon={<PlusOutlined />}
            onClick={() => setActiveAction("Crear actividad")}
          >
            Crear
          </Button>
        </div>
      </Card>

      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} xl={18}>
          <Card
            className="h-auto rounded-3xl border-[var(--border)] bg-[var(--agenda-panel-bg)] xl:h-[680px]"
            styles={{ body: { height: "100%", padding: 18 } }}
          >
            <div className="flex max-h-[640px] flex-col xl:h-full xl:max-h-none">
              <div className="min-h-0 shrink-0 border-b border-[var(--border-subtle)] pb-3 xl:min-h-[158px] xl:pb-4">
                <div className="flex flex-col gap-3 xl:gap-4">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-surface-main sm:text-xl">
                        {focusMode}
                      </h2>
                      <p className="mt-1 text-xs text-surface-secondary sm:text-sm">
                        {focusMode === "Eventos"
                          ? "Lista con scroll para operar citas y bloques."
                          : "Calendario visual con navegación por periodo."}
                      </p>
                    </div>

                    <div className="max-w-full overflow-x-auto pb-1">
                      <SegmentedControl
                        items={focusModes}
                        value={focusMode}
                        onChange={setFocusMode}
                      />
                    </div>
                  </div>

                  {focusMode === "Eventos" ? (
                    <div className="min-w-0 space-y-2">
                      <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <PeriodNavigator
                          label={currentPeriodLabel}
                          onPrevious={() =>
                            setPeriodOffset((value) => value - 1)
                          }
                          onNext={() =>
                            setPeriodOffset((value) => value + 1)
                          }
                        />
                        <div className="max-w-full overflow-x-auto pb-1">
                          <SegmentedControl
                            items={agendaViews}
                            value={activeView}
                            onChange={handleViewChange}
                          />
                        </div>
                      </div>
                      <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                        {agendaFilters.map((item) => (
                          <Pill
                            key={item}
                            active={activeFilter === item}
                            onClick={() => setActiveFilter(item)}
                          >
                            {item}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-w-0 flex-col gap-2 pt-1 lg:flex-row lg:items-center lg:justify-between">
                      <PeriodNavigator
                        label={currentPeriodLabel}
                        onPrevious={() =>
                          setPeriodOffset((value) => value - 1)
                        }
                        onNext={() =>
                          setPeriodOffset((value) => value + 1)
                        }
                      />
                      <div className="max-w-full overflow-x-auto pb-1">
                        <SegmentedControl
                          items={agendaViews}
                          value={activeView}
                          onChange={handleViewChange}
                          todayLabel="Día"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 xl:mt-4">
                {focusMode === "Eventos" ? (
                  <EventList
                    events={filteredEvents}
                    view={activeView}
                    selectedEventId={selectedEvent?.id}
                    onSelectEvent={setSelectedEvent}
                  />
                ) : (
                  <CalendarBoard
                    view={activeView}
                    events={filteredEvents}
                    selectedEventId={selectedEvent?.id}
                    onSelectEvent={setSelectedEvent}
                  />
                )}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={6}>
          <Card
            className="h-auto rounded-3xl border-[var(--border)] xl:h-[680px]"
            styles={{ body: { padding: 18 } }}
          >
            <div className="rounded-2xl border border-[var(--border-subtle)] p-3.5">
              <p className="text-sm font-semibold text-surface-main">
                Evento seleccionado
              </p>
              {selectedEvent ? (
                <div className="mt-2 space-y-1.5 text-xs text-surface-secondary">
                  <p className="font-semibold text-surface-main">
                    {selectedEvent.title}
                  </p>
                  <p>
                    {selectedEvent.day} · {selectedEvent.time}
                  </p>
                  {selectedEvent.person ? (
                    <p>Paciente/contacto: {selectedEvent.person}</p>
                  ) : null}
                  <p>Estado: {selectedEvent.status}</p>
                  <p>Responsable: {selectedEvent.owner}</p>
                  {selectedEvent.locationType === "en_campo" ? (
                    <>
                      <div className="flex flex-wrap gap-1.5">
                        <LocationBadge event={selectedEvent} />
                      </div>
                      {selectedEvent.tiempoPrevioMinutes ? (
                        <p>
                          🕐 Ida: {selectedEvent.tiempoPrevioMinutes} min
                        </p>
                      ) : null}
                      {selectedEvent.tiempoPosteriorMinutes ? (
                        <p>
                          🕐 Vuelta: {selectedEvent.tiempoPosteriorMinutes} min
                        </p>
                      ) : null}
                      {selectedEvent.locationReference ? (
                        <p
                          className="truncate"
                          title={selectedEvent.locationReference}
                        >
                          📍 {selectedEvent.locationReference}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                  {selectedEvent.isRecurring ? (
                    <Pill>↻ Recurrente</Pill>
                  ) : null}
                </div>
              ) : (
                <p className="mt-1 text-sm text-surface-secondary">
                  Selecciona un evento.
                </p>
              )}
            </div>

            <div className="mt-3 rounded-2xl border border-[var(--border-subtle)] p-3.5">
              <p className="text-sm font-semibold text-surface-main">
                Acciones
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 xl:grid-cols-1">
                {actions.map((item) => (
                  <Button
                    key={item.label}
                    size="small"
                    className="h-8 justify-start rounded-button text-[11px] sm:text-xs"
                    icon={item.icon}
                    onClick={() => openQuickAction(item.label)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-[var(--border-subtle)] p-3.5">
              <p className="text-sm font-semibold text-surface-main">
                Disponibilidad
              </p>
              <div className="mt-2 grid gap-2 text-xs text-surface-secondary sm:grid-cols-3 xl:block xl:space-y-2">
                <p>
                  <span className="font-semibold text-surface-main">Hoy</span>
                  <br />
                  2 espacios disponibles
                </p>
                <p>
                  <span className="font-semibold text-surface-main">
                    Esta semana
                  </span>
                  <br />
                  8 espacios disponibles
                </p>
                <p>
                  <span className="font-semibold text-surface-main">
                    Próximo espacio libre
                  </span>
                  <br />
                  Martes 10:00
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        centered
        open={Boolean(activeAction)}
        title={activeAction}
        okText={modalOkLabel}
        cancelText="Cancelar"
        onOk={closeQuickAction}
        onCancel={closeQuickAction}
        width={620}
      >
        <div className="pt-2">
          {activeAction ? (
            <QuickActionContent
              action={activeAction}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
            />
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
