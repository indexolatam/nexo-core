import {
  AlertOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  PlusOutlined, TeamOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { peopleService } from "../../services/peopleService";
import { agendaService } from "../../services/agendaService";
import { tasksService } from "../../services/tasksService";
import { financeService } from "../../services/financeService";
import { StatCard } from "./components/StatCard";
import { WeekDayCard } from "./components/WeekDayCard";

interface DayEvent { label: string; type: "consulta" | "taller" | "reel" | "blog" | "admin" | "descanso"; }

interface DayInfo {
  day: string; date: number; today: boolean;
  events: DayEvent[]; eventCount: number;
  tasks: { label: string; done: boolean }[]; taskCount: number;
}

const DAY_LABELS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const EVENT_TYPE_MAP: Record<string, DayEvent["type"]> = {
  Consultas: "consulta", Taller: "taller", "Participante Taller": "taller",
  Reel: "reel", Blog: "blog", Administrativa: "admin", Administración: "admin", Personal: "descanso",
};

function inferEventType(category: string): DayEvent["type"] {
  return EVENT_TYPE_MAP[category] || "consulta";
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [peopleCount, setPeopleCount] = useState(0);
  const [todayEvents, setTodayEvents] = useState<string[]>([]);
  const [todayEventCount, setTodayEventCount] = useState(0);
  const [todayConfirmed, setTodayConfirmed] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [nextEvent, setNextEvent] = useState<{ title: string; time: string; fromNow: string } | null>(null);
  const [weekDays, setWeekDays] = useState<DayInfo[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [operationalStatus, setOperationalStatus] = useState<string[]>([]);
  const [nowLabel, setNowLabel] = useState("");

  useEffect(() => {
    let active = true;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const dayOfWeek = now.getDay();
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const timeStr = `${hour}:${minute}`;
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    setNowLabel(`${dayNames[dayOfWeek]} ${now.getDate()} ${monthNames[now.getMonth()]} · ${timeStr}`);

    Promise.all([
      peopleService.list(),
      agendaService.list(),
      tasksService.list(),
      financeService.list(),
    ]).then(([people, events, tasks, finances]) => {
      if (!active) return;

      const activePeople = people.filter((p) => p.estado === "Activo").length;
      setPeopleCount(activePeople);

      const todayEvts = events.filter((evt) => evt.starts_at?.slice(0, 10) === today);
      const confirmedToday = todayEvts.filter((evt) => evt.status === "Confirmada" || evt.status === "Atendida").length;
      setTodayEventCount(todayEvts.length);
      setTodayConfirmed(confirmedToday);

      const sortedToday = [...todayEvts].sort((a, b) => (a.starts_at || "").localeCompare(b.starts_at || ""));
      const myDayList: string[] = [];
      let foundNextEvent: typeof nextEvent = null;
      for (const evt of sortedToday) {
        const startTime = evt.starts_at ? evt.starts_at.slice(11, 16) : "";
        const label = startTime ? `${startTime} ${evt.title}` : evt.title;
        myDayList.push(label);
        if (!foundNextEvent && startTime && startTime >= timeStr && evt.status !== "Cancelada") {
          const [eh, em] = startTime.split(":").map(Number);
          const [nh, nm] = timeStr.split(":").map(Number);
          const diffMin = (eh * 60 + em) - (nh * 60 + nm);
          const fromNow = diffMin <= 0 ? "Ahora" : diffMin <= 60 ? `En ${diffMin} minutos` : `En ${Math.round(diffMin / 60)}h`;
          foundNextEvent = { title: evt.title, time: startTime, fromNow };
        }
      }
      if (!foundNextEvent && myDayList.length > 0) {
        foundNextEvent = { title: sortedToday[0]?.title || "", time: sortedToday[0]?.starts_at?.slice(11, 16) || "", fromNow: "Finalizado" };
      }
      setTodayEvents(myDayList.length > 0 ? myDayList : ["Sin actividades programadas"]);
      setNextEvent(foundNextEvent);

      const pending = tasks.filter((t) => t.status !== "Completada" && t.status !== "Cancelada").length;
      setPendingTasks(pending);

      const pendingFin = finances.filter((f) => f.estado === "Pendiente").length;
      setPendingPayments(pendingFin);

      const newAlerts: string[] = [];
      const unconfirmedToday = todayEvts.filter((evt) => evt.status === "Pendiente").length;
      if (unconfirmedToday > 0) newAlerts.push(`${unconfirmedToday} cita(s) sin confirmar`);
      if (pending > 0) newAlerts.push(`${pending} tarea(s) pendiente(s)`);
      if (pendingFin > 0) newAlerts.push(`${pendingFin} pago(s) pendiente(s)`);
      setAlerts(newAlerts.length > 0 ? newAlerts : ["Sin alertas"]);

      const opStatus: string[] = [];
      if (confirmedToday > 0) opStatus.push(`${confirmedToday} cita(s) confirmada(s)`);
      if (myDayList.length > 0) opStatus.push(`${myDayList.length} actividad(es) programada(s)`);
      const weekEvents = events.filter((evt) => {
        const d = evt.starts_at?.slice(0, 10);
        return d && d >= today && d <= getEndOfWeek(today);
      }).length;
      if (weekEvents > 0) opStatus.push(`${weekEvents} evento(s) esta semana`);
      setOperationalStatus(opStatus.length > 0 ? opStatus : ["Sin actividad registrada"]);

      const weekDaysResult: DayInfo[] = [];
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        const isToday = dateStr === today;

        const dayEvts = events.filter((evt) => evt.starts_at?.slice(0, 10) === dateStr && !evt.starts_at?.startsWith("Sin"));
        const dayTasks = tasks.filter(
          (t) => (t.due_at as string)?.slice(0, 10) === dateStr && t.status !== "Completada" && t.status !== "Cancelada"
        );

        weekDaysResult.push({
          day: DAY_LABELS[d.getDay()],
          date: d.getDate(),
          today: isToday,
          events: dayEvts.slice(0, 3).map((evt) => ({ label: evt.title, type: inferEventType(evt.category as string) })),
          eventCount: dayEvts.length,
          tasks: dayTasks.slice(0, 3).map((t) => ({ label: t.title, done: t.status === "Completada" })),
          taskCount: dayTasks.length,
        });
      }
      setWeekDays(weekDaysResult);
    }).catch((err) => {
      console.error("Dashboard: error cargando datos", err);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, []);

  function getEndOfWeek(dateStr: string): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + (7 - d.getDay()));
    return d.toISOString().slice(0, 10);
  }

  const quickActions = [
    { label: "Nueva cita", to: "/admin/agenda" },
    { label: "Nueva persona", to: "/admin/personas" },
    { label: "Nueva tarea", to: "/admin/tareas" },
  ];

  const indicators = [
    { label: "Personas activas", value: String(peopleCount), helper: "En el consultorio", icon: <TeamOutlined /> },
    { label: "Citas hoy", value: `${todayConfirmed}/${todayEventCount}`, helper: `${todayEventCount - todayConfirmed} pendiente(s) de confirmar`, icon: <CalendarOutlined /> },
    { label: "Tareas pendientes", value: String(pendingTasks), helper: "En curso", icon: <CheckCircleOutlined /> },
    { label: "Pagos pendientes", value: String(pendingPayments), helper: "Por cobrar", icon: <TeamOutlined /> },
  ];

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center"><Spin size="large" /></div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Resumen del panel</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-main sm:text-4xl">Inicio</h1>
            <p className="mt-2 max-w-3xl text-sm text-surface-secondary">
              Estado general, próximos pasos y alertas del consultorio. Todo en un vistazo.
            </p>
          </div>
          <p className="text-xs font-medium text-surface-muted">{nowLabel}</p>
        </div>
      </section>

      <Row gutter={[16, 16]}>
        {indicators.map((item) => <StatCard key={item.label} {...item} />)}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card className="h-full rounded-3xl border-[var(--border)]">
            {nextEvent ? (
              <>
                <h2 className="text-xl font-bold text-surface-main">Próximo evento</h2>
                <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] p-4">
                  <p className="flex items-center gap-2 font-semibold text-surface-main">
                    <CalendarOutlined className="text-[var(--accent-deep)]" />
                    {nextEvent.title}
                  </p>
                  <p className="mt-1 text-sm text-surface-secondary">{nextEvent.time} · {nextEvent.fromNow}</p>
                </div>
              </>
            ) : null}

            <h2 className="mt-6 text-xl font-bold text-surface-main">Mi día</h2>
            <div className="mt-4 space-y-3">
              {todayEvents.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] p-4">
                  <ClockCircleOutlined className="text-[var(--accent)]" />
                  <span className="flex-1 text-sm text-surface-secondary">{item}</span>
                  {item.includes("Ahora") || (nextEvent && item.includes(nextEvent.time) && nextEvent.fromNow === "Ahora") ? (
                    <span className="rounded-full border border-[var(--accent-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-deep)]">Ahora</span>
                  ) : null}
                </div>
              ))}
            </div>
            <Link to="/admin/agenda" className="mt-4 inline-flex text-sm font-semibold text-[var(--accent-deep)] hover:text-[var(--accent)]">
              Ver agenda completa →
            </Link>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <div className="flex h-full flex-col gap-4">
            <Card className="rounded-3xl border-[var(--border)]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-surface-main">Alertas</h2>
                <span className="rounded-full border border-[var(--status-attention)]/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--status-attention)]">{alerts.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {alerts.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs text-surface-secondary">
                    <AlertOutlined className="shrink-0 text-[var(--status-attention)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-3xl border-[var(--border)]">
              <h2 className="text-sm font-bold text-surface-main">Estado operativo</h2>
              <div className="mt-3 space-y-2">
                {operationalStatus.map((item, index) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs text-surface-secondary">
                    <CheckCircleOutlined className={`shrink-0 ${index === 0 ? "text-[var(--status-correct)]" : "text-[var(--text-muted)]"}`} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-3xl border-[var(--border)]">
              <h2 className="text-sm font-bold text-surface-main">Acciones rápidas</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Link key={action.label} to={action.to}>
                    <Button size="small" className="rounded-button text-xs" icon={<PlusOutlined />}>{action.label}</Button>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      <Card className="rounded-3xl border-[var(--border)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-surface-main">Esta semana</h2>
          <span className="text-xs text-surface-muted">
            7 días · {weekDays.reduce((a, d) => a + d.eventCount + d.taskCount, 0)} ítems
          </span>
        </div>
        {weekDays.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4 2xl:grid-cols-7">
            {weekDays.map((d) => <WeekDayCard key={`${d.day}-${d.date}`} d={d} />)}
          </div>
        ) : (
          <div className="mt-4 text-sm text-surface-muted">No hay eventos programados para esta semana.</div>
        )}
      </Card>
    </div>
  );
}