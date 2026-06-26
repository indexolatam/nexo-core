import { FilterOutlined } from "@ant-design/icons";
import { Button, Checkbox, DatePicker, Input, Popover, Select, Tooltip } from "antd";
import { useMemo, type ReactNode } from "react";
import { personTypeOptions } from "../../../types/adminPeople";
import type { Person, PersonStatus, PersonType, TableIndicatorFilter } from "../../../types/adminPeople";
import { formatTypeLabel, highlight } from "../../../utils/formatting";

const statusOptions: PersonStatus[] = ["Activo", "Inactivo", "Pendiente", "Archivado"];

export type TableFilterState = {
  nombre: string;
  tipos: PersonType[];
  estado: PersonStatus[];
  telefono: string;
  ultimaInteraccionFecha: string;
  proximaActividadDia: string;
  proximaActividadHora: string;
  proximaActividadTexto: string;
  indicadores: TableIndicatorFilter[];
};

function HeaderFilterButton({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <button type="button"
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
        active ? "border-[var(--accent-border)] bg-[var(--accent-soft)]/40 text-[var(--accent-deep)]" : "border-[var(--border-subtle)] text-surface-muted hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)]"
      }`}>{children}</button>
  );
}

export function PeopleTable({ items, allFilteredPeople, onSelect, query, filters, onChangeFilters, onClearFilters }: {
  items: Person[];
  allFilteredPeople: Person[];
  onSelect: (person: Person) => void;
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
      <table className="min-w-[980px] w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-20 bg-[var(--surface-strong)] text-xs uppercase tracking-[0.14em] text-surface-muted">
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="sticky left-0 z-30 min-w-[240px] bg-[var(--surface-strong)] px-4 py-3 font-semibold shadow-[8px_0_12px_-12px_var(--table-sticky-shadow)]">
              {columnHeader("Nombre", Boolean(filters.nombre), (
                <div className="w-64 space-y-3 p-1">
                  <Input allowClear placeholder="Buscar nombre o email" value={filters.nombre} onChange={(e) => setFilter("nombre", e.target.value)} />
                  <Button size="small" className="rounded-button w-full" onClick={() => setFilter("nombre", "")}>Limpiar</Button>
                </div>
              ))}
            </th>
            <th className="px-4 py-3 font-semibold">
              {columnHeader("Tipos", filters.tipos.length > 0, (
                <div className="w-64 space-y-3 p-1">
                  <Checkbox.Group className="flex flex-col gap-2" value={filters.tipos} onChange={(v) => setFilter("tipos", v as PersonType[])} options={personTypeOptions.map((t) => ({ label: t, value: t }))} />
                  <Button size="small" className="rounded-button w-full" onClick={() => setFilter("tipos", [])}>Limpiar</Button>
                </div>
              ))}
            </th>
            <th className="px-4 py-3 font-semibold">
              {columnHeader("Estado", filters.estado.length > 0, (
                <div className="w-56 space-y-3 p-1">
                  <Checkbox.Group className="flex flex-col gap-2" value={filters.estado} onChange={(v) => setFilter("estado", v as PersonStatus[])} options={statusOptions.map((s) => ({ label: s, value: s }))} />
                  <Button size="small" className="rounded-button w-full" onClick={() => setFilter("estado", [])}>Limpiar</Button>
                </div>
              ))}
            </th>
            <th className="px-4 py-3 font-semibold">
              {columnHeader("Teléfono", Boolean(filters.telefono), (
                <div className="w-64 space-y-3 p-1">
                  <Input allowClear placeholder="Filtrar teléfono" value={filters.telefono} onChange={(e) => setFilter("telefono", e.target.value)} />
                  <Button size="small" className="rounded-button w-full" onClick={() => setFilter("telefono", "")}>Limpiar</Button>
                </div>
              ))}
            </th>
            <th className="px-4 py-3 font-semibold">
              {columnHeader("Última interacción", Boolean(filters.ultimaInteraccionFecha), (
                <div className="w-64 space-y-3 p-1">
                  <DatePicker className="w-full" format="YYYY-MM-DD" placeholder="Seleccionar fecha" onChange={(_, ds) => setFilter("ultimaInteraccionFecha", Array.isArray(ds) ? ds[0] ?? "" : ds)} />
                  <Button size="small" className="rounded-button w-full" onClick={() => setFilter("ultimaInteraccionFecha", "")}>Limpiar</Button>
                </div>
              ))}
            </th>
            <th className="px-4 py-3 font-semibold">
              {columnHeader("Próxima actividad", Boolean(filters.proximaActividadDia || filters.proximaActividadHora || filters.proximaActividadTexto), (
                <div className="w-64 space-y-3 p-1">
                  <DatePicker className="w-full" format="YYYY-MM-DD" placeholder="Seleccionar día" onChange={(_, ds) => setFilter("proximaActividadDia", Array.isArray(ds) ? ds[0] ?? "" : ds)} />
                  <Select allowClear className="w-full" placeholder="Seleccionar hora" value={filters.proximaActividadHora || undefined} options={upcomingHourOptions} onChange={(v) => setFilter("proximaActividadHora", v ?? "")} />
                  <Input allowClear placeholder="Buscar actividad" value={filters.proximaActividadTexto} onChange={(e) => setFilter("proximaActividadTexto", e.target.value)} />
                  <Button size="small" className="rounded-button w-full" onClick={() => onChangeFilters({ ...filters, proximaActividadDia: "", proximaActividadHora: "", proximaActividadTexto: "" })}>Limpiar</Button>
                </div>
              ))}
            </th>
            <th className="px-4 py-3 font-semibold">
              {columnHeader("Indicadores", filters.indicadores.length > 0, (
                <div className="w-64 space-y-3 p-1">
                  <Checkbox.Group className="flex flex-col gap-2" value={filters.indicadores} onChange={(v) => setFilter("indicadores", v as TableIndicatorFilter[])}
                    options={[{ label: "Con citas próximas", value: "Con citas próximas" }, { label: "Con tareas pendientes", value: "Con tareas pendientes" }, { label: "Con pagos pendientes", value: "Con pagos pendientes" }]} />
                  <Button size="small" className="rounded-button w-full" onClick={() => setFilter("indicadores", [])}>Limpiar</Button>
                </div>
              ))}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((person) => (
            <tr key={person.id} onClick={() => onSelect(person)}
              className="group cursor-pointer border-b border-[var(--border-subtle)] transition-colors duration-150 hover:bg-[var(--accent-soft)]/30">
              <td className="sticky left-0 z-10 max-w-[240px] min-w-[240px] bg-[var(--surface-strong)] px-4 py-4 shadow-[8px_0_12px_-12px_var(--table-sticky-shadow)] group-hover:bg-[var(--accent-soft)]/30">
                <Tooltip title={person.nombre} placement="topLeft">
                  <p className="truncate whitespace-nowrap font-semibold text-surface-main">{highlight(person.nombre, query)}</p>
                </Tooltip>
                <p className="mt-1 truncate whitespace-nowrap text-xs text-surface-muted">{person.email ?? "Sin correo"}</p>
              </td>
              <td className="px-4 py-4">
                <div className="flex max-w-[220px] flex-wrap gap-1.5">
                  {person.tipos.map((type) => <span key={type} className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] text-surface-secondary">{formatTypeLabel(type)}</span>)}
                </div>
              </td>
              <td className="px-4 py-4"><span className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-surface-secondary">{person.estado}</span></td>
              <td className="whitespace-nowrap px-4 py-4 text-surface-secondary">{person.telefono}</td>
              <td className="whitespace-nowrap px-4 py-4 text-surface-secondary">{person.ultima_interaccion}</td>
              <td className="max-w-[220px] px-4 py-4">
                <p className="truncate whitespace-nowrap text-surface-main">{person.proxima_actividad}</p>
                <p className="mt-1 truncate whitespace-nowrap text-xs text-surface-muted">{person.proxima_actividad_detalle}</p>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                  <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-surface-secondary">{person.citas.proximas.length} cita(s)</span>
                  <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-surface-secondary">{person.tareas.pendientes.length} tarea(s)</span>
                  <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-surface-secondary">{person.finanzas.pendientes.length} pago(s)</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-[var(--border-subtle)] px-4 py-3 text-xs text-surface-muted">
        Filtros tipo Excel disponibles en cada encabezado · {items.length} resultado(s)
        <Button type="link" size="small" className="ml-3 px-0" onClick={onClearFilters}>Limpiar filtros de tabla</Button>
      </div>
    </div>
  );
}