import { FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Divider, Empty, Form, Input, message, Modal, Pagination, Popover, Select, Spin, DatePicker } from "antd";
import { useEffect, useMemo, useState } from "react";
import { peopleService, usersService } from "../../services";
import { usePermissions } from "../../hooks/usePermissions";
import type { Person, PersonCondition, PersonQuickFilter, PersonStatus, PersonType, PeopleFilterState } from "../../types/adminPeople";
import { personTypeOptions } from "../../types/adminPeople";
import { formatTypeLabel } from "../../utils/formatting";
import { PersonCard } from "./components/PersonCard";
import { PeopleBigCounter } from "./components/PeopleBigCounter";
import { PersonDetail } from "./components/PersonDetail";
import { PeopleTable, type TableFilterState } from "./components/PeopleTable";

const quickFilterLabels: { value: PersonQuickFilter; label: string }[] = [
  { value: "Todos", label: "Todos" }, { value: "Pacientes", label: "Pacientes" },
  { value: "Empresas", label: "Empresas"}, { value: "Con tareas", label: "Con tareas" }, { value: "Pagos", label: "Pagos" },
];

const statusOptions: PersonStatus[] = ["Activo", "Inactivo", "Pendiente", "Archivado"];
const conditionOptions: PersonCondition[] = ["Con citas", "Con tareas", "Con pagos pendientes"];
const fuenteOptions = ["Manual", "Referido", "Red social", "Web", "Otro"];

const defaultFilters: PeopleFilterState = { types: [], statuses: [], conditions: [] };
const defaultTableFilters: TableFilterState = {
  nombre: "", tipos: [], estado: [], telefono: "", ultimaInteraccionFecha: "",
  proximaActividadDia: "", proximaActividadHora: "", proximaActividadTexto: "", indicadores: [],
};

function useDebouncedValue<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = window.setTimeout(() => setDebounced(value), delay); return () => window.clearTimeout(t); }, [delay, value]);
  return debounced;
}

function matchesText(person: Person, search: string) {
  if (!search.trim()) return true;
  const q = search.trim().toLowerCase();
  return [person.nombre, person.telefono, person.email ?? "", person.tipos.join(" "), person.etiquetas.join(" ")].some((v) => v.toLowerCase().includes(q));
}

function matchesAdvancedFilters(person: Person, filters: PeopleFilterState) {
  const typeMatch = filters.types.length === 0 || filters.types.some((t) => person.tipos.includes(t));
  const statusMatch = filters.statuses.length === 0 || filters.statuses.includes(person.estado);
  const conditionMatch = filters.conditions.length === 0 || filters.conditions.every((c) => {
    if (c === "Con citas") return person.citas.proximas.length > 0 || person.citas.historial.length > 0;
    if (c === "Con tareas") return person.tareas.pendientes.length > 0 || person.tareas.completadas.length > 0;
    return person.finanzas.pendientes.length > 0;
  });
  return typeMatch && statusMatch && conditionMatch;
}

function matchesTableFilters(person: Person, filters: TableFilterState) {
  const q = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
  const nombre = q(filters.nombre), telefono = q(filters.telefono);
  const nextAppt = person.citas.proximas[0];
  const proxActividad = q(filters.proximaActividadTexto);
  return (!nombre || q(person.nombre).includes(nombre) || q(person.email ?? "").includes(nombre))
    && (!telefono || q(person.telefono).includes(telefono))
    && (!filters.ultimaInteraccionFecha || person.ultima_interaccion.slice(0, 10) === filters.ultimaInteraccionFecha)
    && (!filters.proximaActividadDia || nextAppt?.date === filters.proximaActividadDia)
    && (!filters.proximaActividadHora || nextAppt?.time === filters.proximaActividadHora)
    && (!proxActividad || q(person.proxima_actividad).includes(proxActividad) || q(person.proxima_actividad_detalle).includes(proxActividad))
    && (filters.tipos.length === 0 || filters.tipos.some((t) => person.tipos.includes(t)))
    && (filters.estado.length === 0 || filters.estado.includes(person.estado))
    && (filters.indicadores.length === 0 || filters.indicadores.every((ind) => {
      if (ind === "Con citas próximas") return person.citas.proximas.length > 0;
      if (ind === "Con tareas pendientes") return person.tareas.pendientes.length > 0;
      return person.finanzas.pendientes.length > 0;
    }));
}

export function PeoplePage() {
  const { hasPermission } = usePermissions();
  const canRead = hasPermission("personas", "read");
  const canCreate = hasPermission("personas", "create");
  const canEdit = hasPermission("personas", "edit");
  const [items, setItems] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [quickFilter, setQuickFilter] = useState<PersonQuickFilter>("Todos");
  const [showInactive, setShowInactive] = useState(false);
  const [filters, setFilters] = useState<PeopleFilterState>(defaultFilters);
  const [tempFilters, setTempFilters] = useState<PeopleFilterState>(defaultFilters);
  const [tableFilters, setTableFilters] = useState<TableFilterState>(defaultTableFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [users, setUsers] = useState<{ id: string; name: string; display_label?: string }[]>([]);

  const selectedPerson = items.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    if (!canRead) { setLoading(false); return; }
    let active = true;
    Promise.all([
      peopleService.list(),
      usersService.list(),
    ]).then(([records, userRecords]) => {
      if (active) { setItems(records); setUsers(userRecords as { id: string; name: string; display_label?: string }[]); }
    }).catch(() => message.error("No se pudieron cargar los datos"))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canRead]);

  const filteredPeople = useMemo(() => items.filter((p) => {
    if (!showInactive && p.estado !== "Activo" && p.estado !== "Pendiente") return false;
    return matchesText(p, debouncedSearch) && matchesAdvancedFilters(p, filters);
  }), [debouncedSearch, filters, items, showInactive]);

  const tableFilteredPeople = useMemo(() => filteredPeople.filter((p) => matchesTableFilters(p, tableFilters)), [filteredPeople, tableFilters]);

  useEffect(() => { setPage(1); }, [debouncedSearch, filters, showInactive, tableFilters]);

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (search.trim()) activeChips.push({ label: `Buscar: ${search.trim()}`, onRemove: () => setSearch("") });
  filters.types.forEach((type) => activeChips.push({ label: formatTypeLabel(type), onRemove: () => { setQuickFilter("Todos"); setFilters((p) => ({ ...p, types: p.types.filter((t) => t !== type) })); } }));
  filters.statuses.forEach((status) => activeChips.push({ label: status, onRemove: () => { setQuickFilter("Todos"); setFilters((p) => ({ ...p, statuses: p.statuses.filter((s) => s !== status) })); } }));
  filters.conditions.forEach((condition) => activeChips.push({ label: condition, onRemove: () => { setQuickFilter("Todos"); setFilters((p) => ({ ...p, conditions: p.conditions.filter((c) => c !== condition) })); } }));

  const clearAllFilters = () => { setSearch(""); setQuickFilter("Todos"); setFilters(defaultFilters); setTempFilters(defaultFilters); setTableFilters(defaultTableFilters); };
  const clearTableFilters = () => setTableFilters(defaultTableFilters);

  const handleQuickFilter = (value: PersonQuickFilter) => {
    setQuickFilter(value);
    if (value === "Todos") { setFilters(defaultFilters); setTempFilters(defaultFilters); return; }
    const next: PeopleFilterState = { types: [], statuses: [], conditions: [] };
    if (value === "Pacientes") next.types = ["Paciente"];
    if (value === "Empresas") next.types = ["Empresa", "Contacto Empresarial"];
    if (value === "Con tareas") next.conditions = ["Con tareas"];
    if (value === "Pagos") next.conditions = ["Con pagos pendientes"];
    setFilters(next); setTempFilters(next);
  };

  const applyAdvancedFilters = () => { setFilters(tempFilters); setQuickFilter("Todos"); setFilterOpen(false); };
  const clearAdvancedFilters = () => { setTempFilters(defaultFilters); };

  const onCreatePerson = async () => {
    try {
      const values = await form.validateFields();
      const newPerson = await peopleService.create({
        nombre: values.nombre, telefono: values.telefono, email: values.email,
        tipos: values.tipos, estado: values.estado, fecha_creacion: new Date().toISOString().slice(0, 10),
        ultima_interaccion: new Date().toISOString().slice(0, 10), observaciones_administrativas: values.observaciones ?? "",
        fuente: values.fuente || "Manual", etiquetas: values.etiquetas || [],
        proxima_actividad: "Sin actividad", proxima_actividad_detalle: "Pendiente de asignación",
      });
      setItems((c) => [newPerson, ...c]); setSelectedId(newPerson.id); setCreateOpen(false); form.resetFields();
    } catch (err: any) {
      if (!err?.errorFields) message.error("No se pudo crear la persona");
    }
  };

  const onUpdatePerson = async () => {
    if (!editPerson) return;
    try {
      const values = await editForm.validateFields();
      const updated = await peopleService.update(editPerson.id, {
        nombre: values.nombre, telefono: values.telefono, email: values.email,
        tipos: values.tipos, estado: values.estado,
        observaciones_administrativas: values.observaciones ?? "",
        fuente: values.fuente, etiquetas: values.etiquetas,
        responsable: values.responsable,
        ultima_interaccion: values.ultima_interaccion || new Date().toISOString().slice(0, 10),
        proxima_actividad: values.proxima_actividad,
        proxima_actividad_detalle: values.proxima_actividad_detalle,
      });
      setItems((c) => c.map((p) => (p.id === editPerson.id ? updated : p))); setSelectedId(updated.id); setEditOpen(false); setEditPerson(null); editForm.resetFields();
    } catch (err: any) {
      if (!err?.errorFields) message.error("No se pudo actualizar la persona");
    }
  };

  const handleDeletePerson = async (person: Person) => {
    try {
      await peopleService.remove(person.id);
      setItems((c) => c.filter((p) => p.id !== person.id));
      if (selectedId === person.id) setSelectedId(null);
    } catch (err) { message.error("No se pudo eliminar la persona"); }
  };

  const filterPopover = (
    <div className="w-[320px] space-y-4 p-1">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Tipos</p><Checkbox.Group className="mt-3 flex flex-col gap-2" value={tempFilters.types} onChange={(v) => setTempFilters((p) => ({ ...p, types: v as PersonType[] }))} options={personTypeOptions.map((t) => ({ label: t, value: t }))} /></div>
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Estado</p><Checkbox.Group className="mt-3 flex flex-col gap-2" value={tempFilters.statuses} onChange={(v) => setTempFilters((p) => ({ ...p, statuses: v as PersonStatus[] }))} options={statusOptions.map((s) => ({ label: s, value: s }))} /></div>
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Condición</p><Checkbox.Group className="mt-3 flex flex-col gap-2" value={tempFilters.conditions} onChange={(v) => setTempFilters((p) => ({ ...p, conditions: v as PersonCondition[] }))} options={conditionOptions.map((c) => ({ label: c, value: c }))} /></div>
      <div className="flex items-center justify-between gap-3 pt-1"><Button className="rounded-button" onClick={clearAdvancedFilters}>Limpiar</Button><Button type="primary" className="rounded-button" onClick={applyAdvancedFilters}>Aplicar</Button></div>
    </div>
  );

  const rightList = selectedPerson ? [selectedPerson, ...tableFilteredPeople.filter((p) => p.id !== selectedPerson.id)] : tableFilteredPeople;
  const paginatedPeople = tableFilteredPeople.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Resumen de personas</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div><h1 className="text-2xl font-bold text-surface-main sm:text-4xl">Personas</h1><p className="mt-2 max-w-3xl text-sm text-surface-secondary">Gestión de personas relacionadas al consultorio. Fichas, historial y contexto centralizado.</p></div>
        </div>
      </section>

      {!canRead ? (
        <Card className="rounded-3xl border-[var(--border)]">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tienes permiso para ver este módulo" />
        </Card>
      ) : loading ? (
        <div className="flex min-h-[300px] items-center justify-center"><Spin size="large" /></div>
      ) : (<>

      <Card className="rounded-3xl border-[var(--border)] border-b border-b-[var(--border-subtle)] bg-[var(--surface-strong)] shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} allowClear prefix={<SearchOutlined className="text-surface-muted" />} placeholder="Buscar persona..." className="rounded-button sm:max-w-md" />
            <Popover open={filterOpen} onOpenChange={(o) => { if (o) setTempFilters(filters); setFilterOpen(o); }} trigger="click" placement="bottomLeft" content={filterPopover}>
              <Button icon={<FilterOutlined />} className="rounded-button">Filtro</Button>
            </Popover>
            <Button type="primary" icon={<PlusOutlined />} className="rounded-button" disabled={!canCreate} onClick={() => setCreateOpen(true)}>Nueva persona</Button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
            <div className="flex flex-wrap gap-2">
              {quickFilterLabels.map((item) => (
                <button key={item.value} type="button" onClick={() => handleQuickFilter(item.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${quickFilter === item.value ? "border-[var(--accent-border)] bg-[var(--accent-soft)]/40 text-[var(--accent-deep)]" : "border-[var(--border-subtle)] text-surface-secondary hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)]"}`}>{item.label}</button>
              ))}
              <button type="button" onClick={() => setShowInactive((p) => !p)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${showInactive ? "border-[var(--accent-border)] bg-[var(--accent-soft)]/40 text-[var(--accent-deep)]" : "border-[var(--border-subtle)] text-surface-secondary hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)]"}`}>{showInactive ? "Ocultar inactivos" : "Ver inactivos"}</button>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--status-correct)]/40 bg-[var(--status-correct)]/15 text-sm font-black text-[var(--status-correct)] shadow-[0_0_0_4px_rgba(34,197,94,0.08)]">{tableFilteredPeople.length}</div>
          </div>
        </div>
        {activeChips.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button key={chip.label} type="button" onClick={chip.onRemove} className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)]/40 px-3 py-1.5 text-xs font-medium text-[var(--accent-deep)]">{chip.label} ×</button>
            ))}
            <Button size="small" type="text" onClick={clearAllFilters}>Limpiar filtros</Button>
          </div>
        ) : null}
      </Card>

      <div>
      {selectedPerson ? (
        <div className="grid items-stretch gap-6 transition-[height] duration-200 ease-in-out xl:h-[720px] xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
          <div><PersonDetail person={selectedPerson} onBack={() => setSelectedId(null)} onEdit={canEdit ? (p) => { setEditPerson(p); setEditOpen(true); } : undefined} onDelete={canEdit ? handleDeletePerson : undefined} /></div>
          <div className="min-h-0 xl:h-full">
            <Card className="flex h-full flex-col rounded-3xl border-[var(--border)] [&_.ant-card-body]:flex [&_.ant-card-body]:min-h-0 [&_.ant-card-body]:flex-1 [&_.ant-card-body]:flex-col">
              <div className="flex shrink-0 items-start justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Lista compacta</p><h2 className="mt-2 text-lg font-bold text-surface-main">Personas</h2></div>
                <PeopleBigCounter items={items} />
              </div>
              <Divider className="shrink-0" />
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 thin-task-scrollbar">
                {rightList.map((p) => <PersonCard key={p.id} person={p} compact selected={p.id === selectedPerson.id} onClick={(person) => setSelectedId(person.id)} query={search} />)}
                {rightList.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No se encontraron personas" /> : null}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="rounded-3xl border-[var(--border)]">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Listado</p><h2 className="mt-2 text-xl font-bold text-surface-main">Personas registradas</h2></div>
          </div>
          <Divider />
          {tableFilteredPeople.length > 0 ? (
            <PeopleTable items={paginatedPeople} allFilteredPeople={tableFilteredPeople} onSelect={(person) => setSelectedId(person.id)} query={search} filters={tableFilters} onChangeFilters={setTableFilters} onClearFilters={clearTableFilters} />
          ) : (
            <div className="py-6"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No se encontraron personas"><Button onClick={clearAllFilters}>Limpiar filtros</Button></Empty></div>
          )}
          {tableFilteredPeople.length > pageSize && (
            <div className="flex justify-end px-4 py-3">
              <Pagination current={page} pageSize={pageSize} total={tableFilteredPeople.length} onChange={(p, ps) => { setPage(p); setPageSize(ps); }} pageSizeOptions={[10, 20, 50, 100]} showSizeChanger showTotal={(total, range) => `${range[0]}-${range[1]} de ${total}`} />
            </div>
          )}
        </Card>
      )}
      </div>

      <Modal title="Nueva persona" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={onCreatePerson} okText="Guardar" cancelText="Cancelar" centered destroyOnClose>
        <Form form={form} layout="vertical" initialValues={{ estado: "Activo", tipos: ["Paciente"], fuente: "Manual" }}>
          <Form.Item label="Nombre" name="nombre" rules={[{ required: true, message: "Ingresa el nombre" }]}><Input placeholder="Nombre completo" /></Form.Item>
          <Form.Item label="Teléfono" name="telefono" rules={[{ required: true, message: "Ingresa el teléfono" }]}><Input placeholder="+505 ..." /></Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Email inválido" }]}><Input placeholder="correo@email.com" /></Form.Item>
          <Form.Item label="Tipos" name="tipos" rules={[{ required: true, message: "Selecciona al menos un tipo" }]}><Select mode="multiple" options={personTypeOptions.map((t) => ({ value: t, label: t }))} placeholder="Selecciona tipos" /></Form.Item>
          <Form.Item label="Estado" name="estado" rules={[{ required: true }]}><Select options={statusOptions.map((s) => ({ value: s, label: s }))} /></Form.Item>
          <Form.Item label="Fuente" name="fuente"><Select options={fuenteOptions.map((f) => ({ value: f, label: f }))} /></Form.Item>
          <Form.Item label="Etiquetas" name="etiquetas"><Select mode="tags" placeholder="Escribe etiquetas" /></Form.Item>
          <Form.Item label="Observaciones" name="observaciones"><Input.TextArea rows={4} placeholder="Notas administrativas" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Editar persona" open={editOpen} onCancel={() => { setEditOpen(false); setEditPerson(null); editForm.resetFields(); }} onOk={onUpdatePerson} okText="Guardar cambios" cancelText="Cancelar" centered destroyOnClose
        afterOpenChange={(open) => { if (open && editPerson) editForm.setFieldsValue({ nombre: editPerson.nombre, telefono: editPerson.telefono, email: editPerson.email, tipos: editPerson.tipos, estado: editPerson.estado, observaciones: editPerson.observaciones_administrativas, fuente: editPerson.fuente, etiquetas: editPerson.etiquetas, responsable: editPerson.responsable, ultima_interaccion: editPerson.ultima_interaccion, proxima_actividad: editPerson.proxima_actividad, proxima_actividad_detalle: editPerson.proxima_actividad_detalle }); }}>
        <Form form={editForm} layout="vertical" initialValues={{ estado: "Activo", tipos: ["Paciente"], fuente: "Manual" }}>
          <Form.Item label="Nombre" name="nombre" rules={[{ required: true, message: "Ingresa el nombre" }]}><Input placeholder="Nombre completo" /></Form.Item>
          <Form.Item label="Teléfono" name="telefono" rules={[{ required: true, message: "Ingresa el teléfono" }]}><Input placeholder="+505 ..." /></Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Email inválido" }]}><Input placeholder="correo@email.com" /></Form.Item>
          <Form.Item label="Tipos" name="tipos" rules={[{ required: true, message: "Selecciona al menos un tipo" }]}><Select mode="multiple" options={personTypeOptions.map((t) => ({ value: t, label: t }))} placeholder="Selecciona tipos" /></Form.Item>
          <Form.Item label="Estado" name="estado" rules={[{ required: true }]}><Select options={statusOptions.map((s) => ({ value: s, label: s }))} /></Form.Item>
          <Form.Item label="Fuente" name="fuente"><Select options={fuenteOptions.map((f) => ({ value: f, label: f }))} /></Form.Item>
          <Form.Item label="Etiquetas" name="etiquetas"><Select mode="tags" placeholder="Escribe etiquetas" /></Form.Item>
          <Form.Item label="Responsable" name="responsable"><Select allowClear placeholder="Asignar responsable" options={users.map((u) => ({ value: u.id, label: u.display_label || u.name }))} /></Form.Item>
          <Form.Item label="Última interacción" name="ultima_interaccion"><DatePicker className="w-full" format="YYYY-MM-DD" /></Form.Item>
          <Form.Item label="Próxima actividad" name="proxima_actividad"><Input placeholder="Título de la actividad" /></Form.Item>
          <Form.Item label="Detalle de actividad" name="proxima_actividad_detalle"><Input placeholder="Descripción" /></Form.Item>
          <Form.Item label="Observaciones" name="observaciones"><Input.TextArea rows={4} placeholder="Notas administrativas" /></Form.Item>
        </Form>
      </Modal>
      </>
      )}
    </div>
  );
}