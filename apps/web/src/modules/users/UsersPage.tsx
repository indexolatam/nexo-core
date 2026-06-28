import { CloseCircleOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Empty, Form, Input, message, Modal, Pagination, Select, Spin, DatePicker } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { usuariosService, usersService } from "../../services";
import { usePermissions } from "../../shared/hooks/usePermissions";
import type { User, UserStatus, UserTypeFilter, UserConditionFilter, UserStatusFilter } from "./types/adminUsers";
import { userTypeOptions } from "./types/adminUsers";
import { UserCard } from "./components/UserCard";
import { UsersBigCounter } from "./components/UsersBigCounter";
import { UserDetail } from "./components/UserDetail";
import { UsersTable, type TableFilterState } from "./components/UsersTable";

const tipoFilterLabels: { value: UserTypeFilter; label: string }[] = [
  { value: "Todos", label: "Todos" },
  { value: "Cliente", label: "Clientes" },
  { value: "Empresa", label: "Empresas" },
  { value: "Freelancer", label: "Freelancers" },
  { value: "Proveedor", label: "Proveedores" },
];

const conditionFilterLabels: { value: UserConditionFilter; label: string }[] = [
  { value: "conTareas", label: "Con tareas" },
  { value: "pagoPendiente", label: "Pend. pago" },
];

const statusFilterLabels: { value: UserStatusFilter; label: string }[] = [
  { value: "inactivos", label: "Inactivos" },
  { value: "archivados", label: "Archivados" },
];

const statusOptions: UserStatus[] = ["Activo", "Inactivo", "Pendiente", "Archivado"];
const fuenteOptions = ["Manual", "Referido", "Red social", "Web", "Otro"];

const defaultTableFilters: TableFilterState = {
  user_types: [], user_status: [], user_phone: "", user_last_interaction_date: "",
  user_next_activity_date: "", user_next_activity_hour: "", user_next_activity_text: "",
};

function useDebouncedValue<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = window.setTimeout(() => setDebounced(value), delay); return () => window.clearTimeout(t); }, [delay, value]);
  return debounced;
}

function matchesText(user: User, search: string) {
  if (!search.trim()) return true;
  const q = search.trim().toLowerCase();
  return [user.user_name, user.user_phone, user.user_email ?? "", user.user_types.join(" "), user.user_tags.join(" ")].some((v) => v.toLowerCase().includes(q));
}

function matchesTableFilters(user: User, filters: TableFilterState) {
  const q = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
  const user_phone = q(filters.user_phone);
  const nextAppt = user.citas.proximas[0];
  const proxActividad = q(filters.user_next_activity_text);
  return (!user_phone || q(user.user_phone).includes(user_phone))
    && (!filters.user_last_interaction_date || user.user_last_interaction.slice(0, 10) === filters.user_last_interaction_date)
    && (!filters.user_next_activity_date || nextAppt?.date === filters.user_next_activity_date)
    && (!filters.user_next_activity_hour || nextAppt?.time === filters.user_next_activity_hour)
    && (!proxActividad || q(user.user_next_activity).includes(proxActividad) || q(user.user_next_activity_detail).includes(proxActividad))
    && (filters.user_types.length === 0 || filters.user_types.some((t) => user.user_types.includes(t)))
    && (filters.user_status.length === 0 || filters.user_status.includes(user.user_status));
}

export function UsersPage() {
  const { hasPermission } = usePermissions();
  const canRead = hasPermission("usuarios", "read");
  const canCreate = hasPermission("usuarios", "create");
  const canEdit = hasPermission("usuarios", "edit");
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [tipoFilter, setTipoFilter] = useState<UserTypeFilter>("Todos");
  const [conditionFilter, setConditionFilter] = useState<UserConditionFilter>(null);
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>(null);
  const [tableFilters, setTableFilters] = useState<TableFilterState>(defaultTableFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [users, setUsers] = useState<{ id: string; name: string; display_label?: string }[]>([]);

  const selectedUser = items.find((p) => p.user_id === selectedId) ?? null;

  useEffect(() => {
    if (!canRead) { setLoading(false); return; }
    let active = true;
    const showInactive = statusFilter === "inactivos";
    const showArchived = statusFilter === "archivados";
    Promise.all([
      usuariosService.list({ showInactive, showArchived }),
      usersService.list(),
    ]).then(([records, userRecords]) => {
      if (active) { setItems(records); setUsers(userRecords as { id: string; name: string; display_label?: string }[]); }
    }).catch(() => message.error("No se pudieron cargar los datos"))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canRead, statusFilter]);

  const filteredUsers = useMemo(() => items.filter((p) => {
    if (statusFilter === "inactivos") {
      if (p.user_status !== "Inactivo") return false;
    } else if (statusFilter === "archivados") {
      if (p.user_status !== "Archivado") return false;
    } else {
      if (p.user_status === "Inactivo" || p.user_status === "Archivado") return false;
    }
    if (!matchesText(p, debouncedSearch)) return false;
    if (tipoFilter !== "Todos" && !p.user_types.includes(tipoFilter)) return false;
    if (conditionFilter === "conTareas" && p.tareas.pendientes.length === 0) return false;
    if (conditionFilter === "pagoPendiente" && p.finanzas.pendientes.length === 0) return false;
    return true;
  }), [debouncedSearch, tipoFilter, conditionFilter, statusFilter, items]);

  const tableFilteredUsers = useMemo(() => filteredUsers.filter((p) => matchesTableFilters(p, tableFilters)), [filteredUsers, tableFilters]);

  useEffect(() => { setPage(1); }, [debouncedSearch, tipoFilter, conditionFilter, statusFilter, tableFilters]);

  const clearAllFilters = () => { setSearch(""); setTipoFilter("Todos"); setConditionFilter(null); setStatusFilter(null); setTableFilters(defaultTableFilters); };
  const clearTableFilters = () => setTableFilters(defaultTableFilters);

  const hasActiveFilters = search !== "" || tipoFilter !== "Todos" || conditionFilter !== null || statusFilter !== null
    || tableFilters.user_types.length > 0 || tableFilters.user_status.length > 0
    || tableFilters.user_phone !== "" || tableFilters.user_last_interaction_date !== ""
    || tableFilters.user_next_activity_date !== "" || tableFilters.user_next_activity_hour !== "" || tableFilters.user_next_activity_text !== "";

  const activeFilterChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (search) activeFilterChips.push({ key: "search", label: `"${search}"`, onRemove: () => setSearch("") });
  if (tipoFilter !== "Todos") activeFilterChips.push({ key: "tipo", label: tipoFilter === "Cliente" ? "Clientes" : tipoFilter === "Empresa" ? "Empresas" : tipoFilter === "Freelancer" ? "Freelancers" : "Proveedores", onRemove: () => setTipoFilter("Todos") });
  if (conditionFilter === "conTareas") activeFilterChips.push({ key: "condition", label: "Con tareas", onRemove: () => setConditionFilter(null) });
  if (conditionFilter === "pagoPendiente") activeFilterChips.push({ key: "condition", label: "Pend. pago", onRemove: () => setConditionFilter(null) });
  if (statusFilter === "inactivos") activeFilterChips.push({ key: "status", label: "Inactivos", onRemove: () => setStatusFilter(null) });
  if (statusFilter === "archivados") activeFilterChips.push({ key: "status", label: "Archivados", onRemove: () => setStatusFilter(null) });
  tableFilters.user_types.forEach((t) => activeFilterChips.push({ key: `tipo-${t}`, label: t, onRemove: () => setTableFilters({ ...tableFilters, user_types: tableFilters.user_types.filter((x) => x !== t) }) }));
  tableFilters.user_status.forEach((s) => activeFilterChips.push({ key: `estado-${s}`, label: s, onRemove: () => setTableFilters({ ...tableFilters, user_status: tableFilters.user_status.filter((x) => x !== s) }) }));
  if (tableFilters.user_phone) activeFilterChips.push({ key: "tel", label: `Tel: ${tableFilters.user_phone}`, onRemove: () => setTableFilters({ ...tableFilters, user_phone: "" }) });
  if (tableFilters.user_last_interaction_date) activeFilterChips.push({ key: "ultima", label: `Última: ${tableFilters.user_last_interaction_date}`, onRemove: () => setTableFilters({ ...tableFilters, user_last_interaction_date: "" }) });
  if (tableFilters.user_next_activity_date || tableFilters.user_next_activity_hour || tableFilters.user_next_activity_text) {
    activeFilterChips.push({ key: "prox", label: "Próxima actividad", onRemove: () => setTableFilters({ ...tableFilters, user_next_activity_date: "", user_next_activity_hour: "", user_next_activity_text: "" }) });
  }

  const onCreateUser = async () => {
    try {
      const values = await form.validateFields();
      const newUser = await usuariosService.create({
        user_name: values.user_name, user_phone: values.user_phone, user_email: values.user_email,
        user_types: values.user_types, user_status: values.user_status,
        user_created_date: new Date().toISOString().slice(0, 10),
        user_last_interaction: new Date().toISOString().slice(0, 10),
        user_admin_notes: values.user_admin_notes ?? "",
        user_source: values.user_source || "Manual", user_tags: values.user_tags || [],
        user_assigned_to: values.user_assigned_to,
        user_next_activity: "Sin actividad", user_next_activity_detail: "Pendiente de asignación",
      });
      setItems((c) => [newUser, ...c]); setSelectedId(newUser.user_id); setCreateOpen(false); form.resetFields();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || "No se pudo crear el usuario");
    }
  };

  const onUpdateUser = async () => {
    if (!editUser) return;
    try {
      const values = await editForm.validateFields();
      const updated = await usuariosService.update(editUser.user_id, {
        user_name: values.user_name, user_phone: values.user_phone, user_email: values.user_email,
        user_types: values.user_types, user_status: values.user_status,
        user_admin_notes: values.user_admin_notes ?? "",
        user_source: values.user_source, user_tags: values.user_tags,
        user_assigned_to: values.user_assigned_to,
        user_last_interaction: values.user_last_interaction || new Date().toISOString().slice(0, 10),
        user_next_activity: values.user_next_activity,
        user_next_activity_detail: values.user_next_activity_detail,
      });
      setItems((c) => c.map((p) => (p.user_id === editUser.user_id ? updated : p))); setSelectedId(updated.user_id); setEditOpen(false); setEditUser(null); editForm.resetFields();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || "No se pudo actualizar el usuario");
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await usuariosService.remove(user.user_id);
      setItems((c) => c.filter((p) => p.user_id !== user.user_id));
      if (selectedId === user.user_id) setSelectedId(null);
    } catch (err: any) { message.error(err?.message || "No se pudo eliminar el usuario"); }
  };

  const rightList = selectedUser ? [selectedUser, ...tableFilteredUsers.filter((p) => p.user_id !== selectedUser.user_id)] : tableFilteredUsers;
  const paginatedUsers = tableFilteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Resumen de usuarios</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div><h1 className="text-2xl font-bold text-surface-main sm:text-4xl">Usuarios</h1><p className="mt-2 max-w-3xl text-sm text-surface-secondary">Gestión de las relaciones externas del negocio: clientes, empresas, freelancers y proveedores.</p></div>
        </div>
      </section>

      {!canRead ? (
        <Card className="rounded-3xl border-[var(--border)]">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tienes permiso para ver este módulo" />
        </Card>
      ) : loading ? (
        <div className="flex min-h-[300px] items-center justify-center"><Spin size="large" /></div>
      ) : (<>

      <Card className="rounded-3xl border-[var(--border)] bg-[var(--surface-strong)] shadow-sm">
        <div className="flex items-center gap-3">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} allowClear prefix={<SearchOutlined className="text-surface-muted" />} placeholder="Buscar nombre, email, teléfono..." className="rounded-button flex-1 sm:max-w-md" />
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--status-correct)]/40 bg-[var(--status-correct)]/15 text-xs font-black text-[var(--status-correct)]">{tableFilteredUsers.length}</div>
          <Button type="primary" icon={<PlusOutlined />} className="rounded-button shrink-0" disabled={!canCreate} onClick={() => setCreateOpen(true)}>Nuevo</Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tipoFilterLabels.map((item) => (
            <button key={item.value} type="button" onClick={() => setTipoFilter(item.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${tipoFilter === item.value ? "border-[var(--accent-border)] bg-[var(--accent-soft)]/40 text-[var(--accent-deep)]" : "border-[var(--border-subtle)] text-surface-secondary hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)]"}`}>{item.label}</button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {conditionFilterLabels.map((item) => (
            <button key={item.value} type="button" onClick={() => setConditionFilter(conditionFilter === item.value ? null : item.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${conditionFilter === item.value ? "border-[var(--accent-border)] bg-[var(--accent-soft)]/40 text-[var(--accent-deep)]" : "border-[var(--border-subtle)] text-surface-secondary hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)]"}`}>{item.label}</button>
          ))}
          <span className="mx-1 h-4 w-px bg-[var(--border-subtle)]" />
          {statusFilterLabels.map((item) => (
            <button key={item.value} type="button" onClick={() => setStatusFilter(statusFilter === item.value ? null : item.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === item.value ? "border-[var(--accent-border)] bg-[var(--accent-soft)]/40 text-[var(--accent-deep)]" : "border-[var(--border-subtle)] text-surface-secondary hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)]"}`}>{item.label}</button>
          ))}
          {hasActiveFilters && (
            <>
              <span className="mx-1 h-4 w-px bg-[var(--border-subtle)]" />
              <button type="button" onClick={clearAllFilters} className="text-xs font-medium text-[var(--accent)] hover:underline">Limpiar filtros</button>
            </>
          )}
        </div>

        {hasActiveFilters && activeFilterChips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2">
            <span className="text-xs text-surface-muted">{activeFilterChips.length} filtro{activeFilterChips.length > 1 ? "s" : ""} · {tableFilteredUsers.length} resultado{tableFilteredUsers.length !== 1 ? "s" : ""}</span>
            {activeFilterChips.map((chip) => (
              <span key={chip.key} className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)]/30 px-2 py-0.5 text-xs text-[var(--accent-deep)]">
                {chip.label}
                <button type="button" onClick={chip.onRemove} className="ml-0.5 text-[var(--accent)]/60 hover:text-[var(--accent)]"><CloseCircleOutlined className="text-[10px]" /></button>
              </span>
            ))}
          </div>
        )}
      </Card>

      <div>
      {selectedUser ? (
        <div className="grid items-stretch gap-6 transition-[height] duration-200 ease-in-out xl:h-[720px] xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
          <div><UserDetail user={selectedUser} onBack={() => setSelectedId(null)} onEdit={canEdit ? (u) => { setEditUser(u); setEditOpen(true); } : undefined} onDelete={canEdit ? handleDeleteUser : undefined} /></div>
          <div className="min-h-0 xl:h-full">
            <Card className="flex h-full flex-col rounded-3xl border-[var(--border)] [&_.ant-card-body]:flex [&_.ant-card-body]:min-h-0 [&_.ant-card-body]:flex-1 [&_.ant-card-body]:flex-col">
              <div className="flex shrink-0 items-start justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Lista compacta</p><h2 className="mt-2 text-lg font-bold text-surface-main">Usuarios</h2></div>
                <UsersBigCounter items={items} />
              </div>
              <Divider className="shrink-0" />
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 thin-task-scrollbar">
                {rightList.map((p) => <UserCard key={p.user_id} user={p} compact selected={p.user_id === selectedUser.user_id} onClick={(user) => setSelectedId(user.user_id)} query={search} />)}
                {rightList.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No se encontraron usuarios" /> : null}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="rounded-3xl border-[var(--border)]">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Listado</p><h2 className="mt-2 text-xl font-bold text-surface-main">Usuarios registrados</h2></div>
          </div>
          <Divider />
          <UsersTable items={paginatedUsers} allFilteredUsers={tableFilteredUsers} onSelect={(u) => setSelectedId(u.user_id)} query={search} filters={tableFilters} onChangeFilters={setTableFilters} onClearFilters={clearTableFilters} />
          {tableFilteredUsers.length > pageSize && (
            <div className="flex justify-end px-4 py-3">
              <Pagination current={page} pageSize={pageSize} total={tableFilteredUsers.length} onChange={(p, ps) => { setPage(p); setPageSize(ps); }} pageSizeOptions={[10, 20, 50, 100]} showSizeChanger showTotal={(total, range) => `${range[0]}-${range[1]} de ${total}`} />
            </div>
          )}
        </Card>
      )}
      </div>

      <Modal title="Nuevo usuario" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={onCreateUser} okText="Guardar" cancelText="Cancelar" centered destroyOnClose>
        <Form form={form} layout="vertical" initialValues={{ user_status: "Activo", user_types: ["Cliente"], user_source: "Manual" }}>
          <Form.Item label="Nombre" name="user_name" rules={[{ required: true, message: "Ingresa el nombre" }]}><Input placeholder="Nombre completo" /></Form.Item>
          <Form.Item label="Teléfono" name="user_phone" rules={[{ required: true, message: "Ingresa el teléfono" }]}><Input placeholder="+505 ..." /></Form.Item>
          <Form.Item label="Email" name="user_email" rules={[{ type: "email", message: "Email inválido" }]}><Input placeholder="correo@email.com" /></Form.Item>
          <Form.Item label="Tipos" name="user_types" rules={[{ required: true, message: "Selecciona al menos un tipo" }]}><Select mode="multiple" options={userTypeOptions.map((t) => ({ value: t, label: t }))} placeholder="Selecciona tipos" /></Form.Item>
          <Form.Item label="Estado" name="user_status" rules={[{ required: true }]}><Select options={statusOptions.map((s) => ({ value: s, label: s }))} /></Form.Item>
          <Form.Item label="Fuente" name="user_source"><Select options={fuenteOptions.map((f) => ({ value: f, label: f }))} /></Form.Item>
          <Form.Item label="Etiquetas" name="user_tags"><Select mode="tags" placeholder="Escribe etiquetas" /></Form.Item>
          <Form.Item label="Responsable" name="user_assigned_to"><Select allowClear placeholder="Asignar responsable" options={users.map((u) => ({ value: u.id, label: u.display_label || u.name }))} /></Form.Item>
          <Form.Item label="Observaciones" name="user_admin_notes"><Input.TextArea rows={4} placeholder="Notas administrativas" /></Form.Item>
          <Form.Item label="Dirección" name="user_address"><Input placeholder="Dirección completa" /></Form.Item>
          <Form.Item label="Fecha de nacimiento" name="user_birth_date"><DatePicker className="w-full" format="YYYY-MM-DD" /></Form.Item>
          <Form.Item label="Género" name="user_gender"><Select options={["Masculino", "Femenino", "Otro"].map((g) => ({ value: g, label: g }))} /></Form.Item>
          <Form.Item label="Documento de identidad" name="user_doc_id"><Input placeholder="Cédula o pasaporte" /></Form.Item>
          <Form.Item label="Foto URL" name="user_photo_url"><Input placeholder="URL de foto de perfil" /></Form.Item>
          <Form.Item label="Notas internas" name="user_notes"><Input.TextArea rows={2} placeholder="Notas (no visibles para el cliente)" /></Form.Item>
          <Form.Item label="Contacto preferido" name="user_contact_pref"><Select allowClear placeholder="Automático según disponibilidad" options={[{ value: "teléfono", label: "Teléfono" }, { value: "email", label: "Email" }]} /></Form.Item>
          <Form.Item label="Última interacción" name="user_last_interaction"><DatePicker className="w-full" format="YYYY-MM-DD" /></Form.Item>
          <Form.Item label="Próxima actividad" name="user_next_activity"><Input placeholder="Título de la actividad" /></Form.Item>
          <Form.Item label="Detalle de actividad" name="user_next_activity_detail"><Input placeholder="Descripción" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Editar usuario" open={editOpen} onCancel={() => { setEditOpen(false); setEditUser(null); editForm.resetFields(); }} onOk={onUpdateUser} okText="Guardar cambios" cancelText="Cancelar" centered destroyOnClose
        afterOpenChange={(open) => { if (open && editUser) editForm.setFieldsValue({ user_name: editUser.user_name, user_phone: editUser.user_phone, user_phone_code: editUser.user_phone_code, user_email: editUser.user_email, user_types: editUser.user_types, user_status: editUser.user_status, user_admin_notes: editUser.user_admin_notes, user_source: editUser.user_source, user_tags: editUser.user_tags, user_assigned_to: editUser.user_assigned_to, user_last_interaction: editUser.user_last_interaction ? dayjs(editUser.user_last_interaction) : null, user_next_activity: editUser.user_next_activity, user_next_activity_detail: editUser.user_next_activity_detail, user_address: editUser.user_address || "", user_birth_date: editUser.user_birth_date ? dayjs(editUser.user_birth_date) : null, user_gender: editUser.user_gender || "", user_doc_id: editUser.user_doc_id || "", user_photo_url: editUser.user_photo_url || "", user_notes: editUser.user_notes || "", user_contact_pref: editUser.user_contact_pref || "", user_contact_phone: editUser.user_contact_phone || "", user_contact_phone_code: editUser.user_contact_phone_code || "", user_contact_name: editUser.user_contact_name || "", user_contact_lastname: editUser.user_contact_lastname || "", user_consent: editUser.user_consent ? "Sí" : "No" }); }}>
        <Form form={editForm} layout="vertical" initialValues={{ user_status: "Activo", user_types: ["Cliente"], user_source: "Manual" }}>
          <Form.Item label="Nombre" name="user_name" rules={[{ required: true, message: "Ingresa el nombre" }]}><Input placeholder="Nombre completo" /></Form.Item>
          <Form.Item label="Código país" name="user_phone_code"><Input placeholder="505" /></Form.Item>
          <Form.Item label="Teléfono" name="user_phone" rules={[{ required: true, message: "Ingresa el teléfono" }]}><Input placeholder="+505 ..." /></Form.Item>
          <Form.Item label="Email" name="user_email" rules={[{ type: "email", message: "Email inválido" }]}><Input placeholder="correo@email.com" /></Form.Item>
          <Form.Item label="Tipos" name="user_types" rules={[{ required: true, message: "Selecciona al menos un tipo" }]}><Select mode="multiple" options={userTypeOptions.map((t) => ({ value: t, label: t }))} placeholder="Selecciona tipos" /></Form.Item>
          <Form.Item label="Estado" name="user_status" rules={[{ required: true }]}><Select options={statusOptions.map((s) => ({ value: s, label: s }))} /></Form.Item>
          <Form.Item label="Consentimiento" name="user_consent"><Select options={[{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }]} /></Form.Item>
          <Form.Item label="Fuente" name="user_source"><Select options={fuenteOptions.map((f) => ({ value: f, label: f }))} /></Form.Item>
          <Form.Item label="Etiquetas" name="user_tags"><Select mode="tags" placeholder="Escribe etiquetas" /></Form.Item>
          <Form.Item label="Responsable" name="user_assigned_to"><Select allowClear placeholder="Asignar responsable" options={users.map((u) => ({ value: u.id, label: u.display_label || u.name }))} /></Form.Item>
          <Form.Item label="Código país contacto" name="user_contact_phone_code"><Input placeholder="505" /></Form.Item>
          <Form.Item label="Teléfono contacto" name="user_contact_phone"><Input placeholder="Teléfono del contacto adicional" /></Form.Item>
          <Form.Item label="Nombre contacto" name="user_contact_name"><Input placeholder="Nombre del contacto" /></Form.Item>
          <Form.Item label="Apellido contacto" name="user_contact_lastname"><Input placeholder="Apellido del contacto" /></Form.Item>
          <Form.Item label="Última interacción" name="user_last_interaction"><DatePicker className="w-full" format="YYYY-MM-DD" /></Form.Item>
          <Form.Item label="Próxima actividad" name="user_next_activity"><Input placeholder="Título de la actividad" /></Form.Item>
          <Form.Item label="Detalle de actividad" name="user_next_activity_detail"><Input placeholder="Descripción" /></Form.Item>
          <Form.Item label="Observaciones" name="user_admin_notes"><Input.TextArea rows={4} placeholder="Notas administrativas" /></Form.Item>
          <Form.Item label="Dirección" name="user_address"><Input placeholder="Dirección completa" /></Form.Item>
          <Form.Item label="Fecha de nacimiento" name="user_birth_date"><DatePicker className="w-full" format="YYYY-MM-DD" /></Form.Item>
          <Form.Item label="Género" name="user_gender"><Select options={["Masculino", "Femenino", "Otro"].map((g) => ({ value: g, label: g }))} /></Form.Item>
          <Form.Item label="Documento de identidad" name="user_doc_id"><Input placeholder="Cédula o pasaporte" /></Form.Item>
          <Form.Item label="Foto URL" name="user_photo_url"><Input placeholder="URL de foto de perfil" /></Form.Item>
          <Form.Item label="Notas internas" name="user_notes"><Input.TextArea rows={2} placeholder="Notas (no visibles para el cliente)" /></Form.Item>
          <Form.Item label="Contacto preferido" name="user_contact_pref"><Select allowClear placeholder="Automático según disponibilidad" options={[{ value: "teléfono", label: "Teléfono" }, { value: "email", label: "Email" }]} /></Form.Item>
        </Form>
      </Modal>
      </>
      )}
    </div>
  );
}
