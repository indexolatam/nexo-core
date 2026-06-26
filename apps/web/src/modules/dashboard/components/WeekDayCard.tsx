import {
  CalendarOutlined, CheckCircleOutlined, ReadOutlined,
  ShoppingCartOutlined, TeamOutlined, VideoCameraOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

type DayEventType = "consulta" | "taller" | "reel" | "blog" | "admin" | "descanso";

const dayIcons: Record<DayEventType, ReactNode> = {
  consulta: <TeamOutlined />,
  taller: <ShoppingCartOutlined />,
  reel: <VideoCameraOutlined />,
  blog: <ReadOutlined />,
  admin: <CalendarOutlined />,
  descanso: <CheckCircleOutlined />,
};

interface DayEvent {
  label: string;
  type: DayEventType;
}

interface DayInfo {
  day: string;
  date: number;
  today: boolean;
  events: DayEvent[];
  eventCount: number;
  tasks: { label: string; done: boolean }[];
  taskCount: number;
}

export function WeekDayCard({ d }: { d: DayInfo }) {
  const isToday = d.today;
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        isToday
          ? "border-[var(--accent-border)] bg-[var(--accent-soft)]/10"
          : "border-[var(--border-subtle)] bg-[var(--section-bg)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-[0.12em] ${isToday ? "text-[var(--accent-deep)]" : "text-surface-muted"}`}>
          {d.day}
        </span>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
            isToday
              ? "bg-[var(--accent-deep)] text-white"
              : "bg-[var(--surface-soft)] text-surface-secondary"
          }`}
        >
          {d.date}
        </span>
      </div>

      <div className="mt-3 flex gap-3 text-[11px] text-surface-muted">
        {d.eventCount > 0 && <span>{d.eventCount} eventos</span>}
        {d.taskCount > 0 && <span>{d.taskCount} tareas</span>}
        {d.eventCount === 0 && d.taskCount === 0 && <span className="italic">Sin actividad</span>}
      </div>

      {d.events.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {d.events.map((ev) => (
            <div key={ev.label} className="flex items-center gap-1.5 text-xs text-surface-secondary">
              <span className="shrink-0 text-[var(--accent)]">{dayIcons[ev.type]}</span>
              <span className="truncate">{ev.label}</span>
            </div>
          ))}
        </div>
      )}

      {d.tasks.length > 0 && (
        <div className="mt-2 space-y-1 border-t border-[var(--border-subtle)] pt-1.5">
          {d.tasks.map((t) => (
            <div key={t.label} className="flex items-center gap-1.5 text-[11px] text-surface-muted">
              <span className={`shrink-0 ${t.done ? "text-[var(--success)]" : "text-surface-muted"}`}>
                {t.done ? "✓" : "○"}
              </span>
              <span className={`truncate ${t.done ? "line-through opacity-60" : ""}`}>{t.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}