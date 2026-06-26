import { Card, Col } from "antd";
import type { ReactNode } from "react";

export function StatCard({ label, value, helper, icon }: { label: string; value: string; helper: string; icon: ReactNode }) {
  return (
    <Col xs={24} sm={12} lg={6}>
      <Card className="rounded-3xl border-[var(--border)]">
        <p className="text-sm text-surface-secondary">{label}</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-4xl font-bold text-surface-main">{value}</p>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-transparent text-xl text-[var(--accent-deep)]">
            {icon}
          </span>
        </div>
        <p className="mt-2 text-xs text-surface-muted">{helper}</p>
      </Card>
    </Col>
  );
}