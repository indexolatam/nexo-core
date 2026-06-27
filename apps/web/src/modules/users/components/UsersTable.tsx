import { FilterOutlined } from "@ant-design/icons";
import { Button, Checkbox, DatePicker, Empty, Input, Popover, Select, Tooltip } from "antd";
import { useMemo, type ReactNode } from "react";
import { userTypeOptions } from "../../../types/adminUsers";
import type { User, UserStatus, UserType } from "../../../types/adminUsers";
import { formatTypeLabel, highlight, formatDate } from "../../../utils/formatting";

const statusOptions: UserStatus[] = ["Activo", "Inactivo", "Pendiente", "Archivado"];

export type TableFilterState = {
  user_types: UserType[];
  user_status: UserStatus[];
  user_phone: string;
  user_last_interaction_date: string;
  user_next_activity_date: string;
  user_next_activity_hour: string;
  user_next_activity_text: string;
};

function HeaderFilterButton({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <button type="button"
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
        active ? "border-[var(--accent-border)] bg-[var(--accent-soft)]/40 text-[var(--accent-deep)]" : "border-[var(--border-subtle)] text-surface-muted hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)]"
      }`}>{children}</button>
  );
}

export function UsersTable({ items, allFilteredPeople, onSelect, query, filters, onChangeFilters, onClearFilters }: {
  items: User[];
  allFilteredPeople: User[];
  onSelect: (person: User) => void;
  query: string;
  filters: TableFilterState;
  onChangeFilters: (next: TableFilterState) => void;
  onClearFilters: () => void;
}) {
  const setFilter = <K extends keyof TableFilterState>(key: K, value: TableFilterState[K]) => onChangeFilters({ ...filters, [key]: value });

  const upcomingHourOptions = useMemo(() =>
    Array.from(new Set(allFilteredPeople.flatMap((p) => p.citas.proximas.map((e) => e.time)))).sort().map((t) => ({ value: t, label: t })), [allFilteredPeople]);

  const columnHeader = (label: string, active: boolean, content: ReactNode) => (
    <div className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <Popover trigger="click" placement="bottomRight" content={content}>
        <span><HeaderFilterButton active={active}><FilterOutlined /></HeaderFilterButton></span>
      </Popover>
    </div>
  );

  return (
    <div className="max-h-[620px] overflow-auto rounded-2xl border border-[var(--border-subtle)]">
      <table className="min-w-[800px] w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-20 bg-[var(--surface-strong)] text-xs uppercase tracking-[0.14em] text-surface-muted">
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="sticky left-0 z-30 min-w-[240px] bg-[var(--surface-strong)] px-4 py-3 font-semibold shadow-[8px_0_12px_-12px_var(--table-sticky-shadow)]">
              {columnHeader("Nombre", Boolean(false), (
                <div className="w-64 space-y-3 p-1">
                  <Input allowClear placeholder="Buscar nombre o email" value="" onChange={() => {}} />
                  <Button size="small" className="rounded-button w-full" onClick={() => {}}>Limpiar</Button>
                </div>
              ))}
            </th>
            <th className="px-4 py-3 font-semibold">
              {columnHeader("Tipos", filters.user_types.length > 0, (
                <div className="w-64 space-y-3 p-1">
                  <Checkbox.Group className="flex flex-col gap-2" value={filters.user_types} onChange={(v) => setFilter("user_types", v as UserType[])} options={userTypeOptions.map((t) => ({ label: t, value: t }))} />
                  <Button size="small" className="rounded-button w-full" onClick={() => setFilter("user_types", [])}>Limpiar</Button>
                </div>
              ))}
            </th>
            <th className="px-4 py-3 font-semibold">
              {columnHeader("Estado", filters.user_status.length > 0, (
                <div className="w-56 space-y-3 p-1">
                  <Checkbox.Group className="flex flex-col gap-2" value={filters.user_status} onChange={(v) => setFilter("user_status", v as UserStatus[])} options={statusOptions.map((s) => ({ label: s, value: s }))} />
                  <Button size="small" className="rounded-button w-full" onClick={() => setFilter("user_status", [])}>Limpiar</Button>
                </div>
              ))}
            </th>
            <th className="px-4 py-3 font-semibold">
              {columnHeader("Teléfono", Boolean(filters.user_phone), (
                <div className="w-64 space-y-3 p-1">
                  <Input allowClear placeholder="Filtrar teléfono" value={filters.user_phone} onChange={(e) => setFilter("user_phone", e.target.value)} />
                  <Button size="small" className="rounded-button w-full" onClick={() => setFilter("user_phone", "")}>Limpiar</Button>
                </div>
              ))}
            </th>
            <th className="px-4 py-3 font-semibold">
              {columnHeader("Última interacción", Boolean(filters.user_last_interaction_date), (
                <div className="w-64 space-y-3 p-1">
                  <DatePicker className="w-full" format="YYYY-MM-DD" placeholder="Seleccionar fecha" onChange={(_, ds) => setFilter("user_last_interaction_date", Array.isArray(ds) ? ds[0] ?? "" : ds)} />
                  <Button size="small" className="rounded-button w-full" onClick={() => setFilter("user_last_interaction_date", "")}>Limpiar</Button>
                </div>
              ))}
            </th>
            <th className="px-4 py-3 font-semibold">
              {columnHeader("Próxima actividad", Boolean(filters.user_next_activity_date || filters.user_next_activity_hour || filters.user_next_activity_text), (
                <div className="w-64 space-y-3 p-1">
                  <DatePicker className="w-full" format="YYYY-MM-DD" placeholder="Seleccionar día" onChange={(_, ds) => setFilter("user_next_activity_date", Array.isArray(ds) ? ds[0] ?? "" : ds)} />
                  <Select allowClear className="w-full" placeholder="Seleccionar hora" value={filters.user_next_activity_hour || undefined} options={upcomingHourOptions} onChange={(v) => setFilter("user_next_activity_hour", v ?? "")} />
                  <Input allowClear placeholder="Buscar actividad" value={filters.user_next_activity_text} onChange={(e) => setFilter("user_next_activity_text", e.target.value)} />
                  <Button size="small" className="rounded-button w-full" onClick={() => onChangeFilters({ ...filters, user_next_activity_date: "", user_next_activity_hour: "", user_next_activity_text: "" })}>Limpiar</Button>
                </div>
              ))}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? items.map((person) => (
            <tr key={person.user_id} onClick={() => onSelect(person)}
              className="group cursor-pointer border-b border-[var(--border-subtle)] transition-colors duration-150 hover:bg-[var(--accent-soft)]/30">
              <td className="sticky left-0 z-10 max-w-[240px] min-w-[240px] bg-[var(--surface-strong)] px-4 py-4 shadow-[8px_0_12px_-12px_var(--table-sticky-shadow)] group-hover:bg-[var(--accent-soft)]/30">
                <Tooltip title={person.user_name} placement="topLeft">
                  <p className="truncate whitespace-nowrap font-semibold text-surface-main">{highlight(person.user_name, query)}</p>
                </Tooltip>
                <p className="mt-1 truncate whitespace-nowrap text-xs text-surface-muted">{person.user_email ?? "Sin correo"}</p>
                {!person.user_assigned_to ? <p className="mt-0.5 text-[10px] text-[var(--status-attention)]">Sin asignar</p> : null}
              </td>
              <td className="px-4 py-4">
                <div className="flex max-w-[220px] flex-wrap gap-1.5">
                  {person.user_types.map((type) => <span key={type} className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] text-surface-secondary">{formatTypeLabel(type)}</span>)}
                </div>
              </td>
              <td className="px-4 py-4"><span className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-surface-secondary">{person.user_status}</span></td>
              <td className="whitespace-nowrap px-4 py-4 text-surface-secondary">{person.user_phone}</td>
              <td className="whitespace-nowrap px-4 py-4 text-surface-secondary">{formatDate(person.user_last_interaction)}</td>
              <td className="max-w-[220px] px-4 py-4">
                <p className="truncate whitespace-nowrap text-surface-main">{person.user_next_activity}</p>
                <p className="mt-1 truncate whitespace-nowrap text-xs text-surface-muted">{person.user_next_activity_detail}</p>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center">
                <Empty description="No se encontraron usuarios" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="border-t border-[var(--border-subtle)] px-4 py-3 text-xs text-surface-muted">
        Filtros tipo Excel disponibles en cada encabezado · {items.length} resultado(s)
        <Button type="link" size="small" className="ml-3 px-0" onClick={onClearFilters}>Limpiar filtros de tabla</Button>
      </div>
    </div>
  );
}
