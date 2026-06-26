import { Empty } from "antd";
import type { PersonPaymentEntry } from "../../../types/adminPeople";

export function PersonFinanceList({ payments, services }: { payments: PersonPaymentEntry[]; services: string[] }) {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-sm font-semibold text-surface-main">Pagos pendientes</h3>
        <div className="mt-3 space-y-3">
          {payments.length > 0 ? payments.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-[var(--border-subtle)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-surface-main">{entry.service}</p>
                  <p className="mt-1 text-sm text-surface-secondary">Vence: {entry.dueDate}</p>
                </div>
                <p className="text-sm font-semibold text-[var(--accent-deep)]">{entry.amount}</p>
              </div>
            </div>
          )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin pagos pendientes" />}
        </div>
      </section>
      <section>
        <h3 className="text-sm font-semibold text-surface-main">Servicios</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {services.length > 0
            ? services.map((s) => <span key={s} className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-surface-secondary">{s}</span>)
            : <span className="text-sm text-surface-muted">Sin servicios registrados</span>}
        </div>
      </section>
    </div>
  );
}