import { ArrowLeftOutlined, CalendarOutlined, DeleteOutlined, EditOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Divider, Popconfirm, Tabs } from "antd";
import type { User } from "../../../types/adminUsers";
import { formatTypeLabel } from "../../../utils/formatting";
import { UserSummaryLine } from "./UserSummaryLine";
import { UserAgendaList } from "./UserAgendaList";
import { UserTasksList } from "./UserTasksList";
import { UserFinanceList } from "./UserFinanceList";
import { UserHistoryList } from "./UserHistoryList";

export function UserDetail({ user, onBack, onEdit, onDelete }: { user: User; onBack: () => void; onEdit?: (user: User) => void; onDelete?: (user: User) => void }) {
  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-[var(--border)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar size={56} className="bg-[var(--accent)] text-white">
              {user.user_name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-surface-main">{user.user_name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.user_types.map((type) => (
                  <span key={type} className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-surface-secondary">{formatTypeLabel(type)}</span>
                ))}
                <span className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-surface-secondary">{user.user_status}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onDelete ? (
              <Popconfirm title="¿Eliminar este usuario?" description="Se marcará como eliminado pero los datos se conservan." onConfirm={() => onDelete(user)} okText="Eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }}>
                <Button icon={<DeleteOutlined />} danger className="rounded-button">Eliminar</Button>
              </Popconfirm>
            ) : null}
            {onEdit ? (
              <Button icon={<EditOutlined />} className="rounded-button" onClick={() => onEdit(user)}>Editar</Button>
            ) : null}
            <Button icon={<ArrowLeftOutlined />} className="rounded-button" onClick={onBack}>Volver</Button>
          </div>
        </div>
        <Divider className="my-5" />
        <div className="grid min-w-0 gap-3 md:grid-cols-3">
          <UserSummaryLine label="Teléfono" value={`+${user.user_phone_code} ${user.user_phone}`} icon={<PhoneOutlined />} />
          <UserSummaryLine label="Email" value={user.user_email ?? "Sin correo"} icon={<MailOutlined />} />
          <UserSummaryLine label="Último contacto" value={user.user_last_interaction} icon={<CalendarOutlined />} />
        </div>
      </Card>

      <Card className="rounded-3xl border-[var(--border)]">
        <Tabs defaultActiveKey="Resumen"
          items={[
            {
              key: "Resumen", label: "Resumen",
              children: (
                <div className="grid gap-4 lg:grid-cols-3">
                  <Card className="rounded-2xl border-[var(--border-subtle)] bg-transparent shadow-none">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-muted">Próxima cita</p>
                    <p className="mt-2 text-sm font-semibold text-surface-main">{user.user_next_activity}</p>
                    <p className="mt-1 text-sm text-surface-secondary">{user.user_next_activity_detail}</p>
                  </Card>
                  <Card className="rounded-2xl border-[var(--border-subtle)] bg-transparent shadow-none">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-muted">Tareas pendientes</p>
                    <p className="mt-2 text-sm font-semibold text-surface-main">{user.tareas.pendientes.length}</p>
                    <p className="mt-1 text-sm text-surface-secondary">Operativas y administrativas</p>
                  </Card>
                  <Card className="rounded-2xl border-[var(--border-subtle)] bg-transparent shadow-none">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-muted">Pagos pendientes</p>
                    <p className="mt-2 text-sm font-semibold text-surface-main">{user.finanzas.pendientes.length}</p>
                    <p className="mt-1 text-sm text-surface-secondary">Pendientes de atención</p>
                  </Card>
                </div>
              ),
            },
            { key: "Agenda", label: "Agenda", children: <UserAgendaList entries={user.citas.proximas.concat(user.citas.historial)} /> },
            { key: "Tareas", label: "Tareas", children: <UserTasksList entries={user.tareas.pendientes.concat(user.tareas.completadas)} /> },
            { key: "Finanzas", label: "Finanzas", children: <UserFinanceList payments={user.finanzas.pendientes} services={user.finanzas.servicios} /> },
            { key: "Historial", label: "Historial", children: <UserHistoryList entries={user.historial} /> },
          ]}
        />
      </Card>

      <Card className="rounded-3xl border-[var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Información general</p>
            <h3 className="mt-2 text-lg font-bold text-surface-main">Arriba = acción · Abajo = contexto</h3>
          </div>
        </div>
        <Divider />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 text-sm text-surface-secondary">
            <p><span className="font-semibold text-surface-main">ID:</span> {user.user_id}</p>
            <p><span className="font-semibold text-surface-main">Creado:</span> {user.user_created_date}</p>
            <p><span className="font-semibold text-surface-main">Última interacción:</span> {user.user_last_interaction}</p>
            <p><span className="font-semibold text-surface-main">Estado:</span> {user.user_status}</p>
          </div>
          <div className="space-y-3 text-sm text-surface-secondary">
            <p><span className="font-semibold text-surface-main">Fuente:</span> {user.user_source}</p>
            <p><span className="font-semibold text-surface-main">Responsable:</span> {user.user_assigned_to}</p>
            <p><span className="font-semibold text-surface-main">Dirección:</span> {user.user_address || "—"}</p>
            <p><span className="font-semibold text-surface-main">Nacimiento:</span> {user.user_birth_date || "—"}</p>
            <p><span className="font-semibold text-surface-main">Género:</span> {user.user_gender || "—"}</p>
            <p><span className="font-semibold text-surface-main">Documento:</span> {user.user_doc_id || "—"}</p>
            <p><span className="font-semibold text-surface-main">Foto:</span> {user.user_photo_url ? <a href={user.user_photo_url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Ver foto</a> : "—"}</p>
            <p><span className="font-semibold text-surface-main">Notas internas:</span> {user.user_notes || "—"}</p>
            <p><span className="font-semibold text-surface-main">Contacto pref.:</span> {user.user_contact_pref || "—"}</p>
            {user.user_contact_phone ? (
              <>
                <p><span className="font-semibold text-surface-main">Contacto:</span> +{user.user_contact_phone_code} {user.user_contact_phone}</p>
                <p><span className="font-semibold text-surface-main">Nombre contacto:</span> {user.user_contact_name} {user.user_contact_lastname}</p>
              </>
            ) : null}
            <p><span className="font-semibold text-surface-main">Consentimiento:</span> {user.user_consent ? "Sí" : "No"}</p>
            <p><span className="font-semibold text-surface-main">Actualizado:</span> {user.user_updated_at || "—"}</p>
            <div>
              <p className="font-semibold text-surface-main">Etiquetas:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.user_tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-surface-secondary">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
