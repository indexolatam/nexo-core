import { Switch } from "antd";

export function ConfigListItem({ title, subtitle, active, onToggle }: { title: string; subtitle: string; active?: boolean; onToggle?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] p-4">
      <div>
        <p className="font-semibold text-surface-main">{title}</p>
        <p className="mt-1 text-sm text-surface-secondary">{subtitle}</p>
      </div>
      {onToggle ? <Switch checked={active} onChange={onToggle} size="small" /> : null}
    </div>
  );
}