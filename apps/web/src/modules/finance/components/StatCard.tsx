import { CalendarOutlined, DollarOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { FinanceMovement } from "../types/adminFinance";

const FINANCE_BASE_DATE = new Date();

function getWeekRange(baseDate: Date) {
  const day = baseDate.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(monday), end: fmt(sunday) };
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("es-PE")}`;
}

export function StatCard({ items }: { items: FinanceMovement[] }) {
  const baseDate = FINANCE_BASE_DATE;
  const today = baseDate.toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);
  const { start: weekStart, end: weekEnd } = getWeekRange(baseDate);

  const hoy = items
    .filter((m) => m.estado === "Pagado" && m.fecha === today)
    .reduce((sum, m) => sum + m.monto, 0);
  const semana = items
    .filter((m) => m.estado === "Pagado" && m.fecha >= weekStart && m.fecha <= weekEnd)
    .reduce((sum, m) => sum + m.monto, 0);
  const mes = items
    .filter((m) => m.estado === "Pagado" && m.fecha.startsWith(currentMonth))
    .reduce((sum, m) => sum + m.monto, 0);
  const pendiente = items
    .filter((m) => m.estado === "Pendiente")
    .reduce((sum, m) => sum + m.monto, 0);

  const indicators = [
    { label: "Ingresos hoy", value: formatCurrency(hoy), icon: <CalendarOutlined /> },
    { label: "Ingresos semana", value: formatCurrency(semana), icon: <CalendarOutlined /> },
    { label: "Ingresos mes", value: formatCurrency(mes), icon: <DollarOutlined /> },
    { label: "Pendiente por cobrar", value: formatCurrency(pendiente), icon: <ExclamationCircleOutlined />, accent: true },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {indicators.map((indicator) => (
        <div
          key={indicator.label}
          className={`rounded-3xl border p-5 ${
            indicator.accent
              ? "border-[var(--status-attention)]/30 bg-[var(--status-attention)]/10"
              : "border-[var(--border)] bg-[var(--surface-strong)]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-surface-muted">{indicator.label}</p>
            <span className={`text-lg ${indicator.accent ? "text-[var(--status-attention)]" : "text-[var(--accent-deep)]"}`}>{indicator.icon}</span>
          </div>
          <p className={`mt-3 text-3xl font-black tracking-tight ${indicator.accent ? "text-[var(--status-attention)]" : "text-surface-main"}`}>
            {indicator.value}
          </p>
        </div>
      ))}
    </div>
  );
}
