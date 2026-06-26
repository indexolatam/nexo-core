import type { ReactNode } from "react";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

export function Pill({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  const className = `inline-flex min-h-6 items-center rounded-full border px-2 py-1 text-[10px] font-medium leading-none sm:min-h-7 sm:px-2.5 sm:text-[11px] ${
    active
      ? "border-[var(--accent-border)] text-[var(--accent-deep)]"
      : "border-[var(--border-subtle)] text-surface-secondary"
  } bg-transparent transition-colors hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)]`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return <span className={className}>{children}</span>;
}

export function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <span className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-surface-muted sm:w-16 sm:text-[11px]">
        {label}
      </span>
      <div className="flex max-w-full gap-2 overflow-x-auto pb-1">{children}</div>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  todayLabel = "Hoy",
}: {
  items: T[];
  value: T;
  onChange: (value: T) => void;
  todayLabel?: string;
}) {
  return (
    <div className="inline-flex max-w-full overflow-hidden rounded-full border border-[var(--agenda-filter-border)] bg-[var(--agenda-control-bg)] p-1">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`min-w-0 truncate rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 ${
            value === item
              ? "bg-[var(--agenda-control-active-bg)] text-[var(--accent-deep)]"
              : "text-surface-secondary"
          }`}
        >
          {item === "Hoy" ? todayLabel : item}
        </button>
      ))}
    </div>
  );
}

export function PeriodNavigator({
  label,
  onPrevious,
  onNext,
}: {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
      <Button
        size="small"
        className="shrink-0 rounded-button"
        icon={<LeftOutlined />}
        onClick={onPrevious}
      />
      <span className="min-w-0 truncate rounded-full border border-[var(--agenda-filter-border)] bg-[var(--agenda-control-bg)] px-3 py-1 text-xs text-surface-secondary sm:text-sm">
        {label}
      </span>
      <Button
        size="small"
        className="shrink-0 rounded-button"
        icon={<RightOutlined />}
        onClick={onNext}
      />
    </div>
  );
}
