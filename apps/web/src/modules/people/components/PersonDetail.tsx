import { ArrowLeftOutlined, CalendarOutlined, DeleteOutlined, EditOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Divider, Popconfirm, Tabs } from "antd";
import type { Person } from "../../../types/adminPeople";
import { formatTypeLabel } from "../../../utils/formatting";
import { PersonSummaryLine } from "./PersonSummaryLine";
import { PersonAgendaList } from "./PersonAgendaList";
import { PersonTasksList } from "./PersonTasksList";
import { PersonFinanceList } from "./PersonFinanceList";
import { PersonHistoryList } from "./PersonHistoryList";

export function PersonDetail({ person, onBack, onEdit, onDelete }: { person: Person; onBack: () => void; onEdit?: (person: Person) => void; onDelete?: (person: Person) => void }) {
  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-[var(--border)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar size={56} className="bg-[var(--accent)] text-white">
              {person.nombre.split(" ").slice(0, 2).map((part) => part[0]).join("")}
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-surface-main">{person.nombre}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {person.tipos.map((type) => (
                  <span key={type} className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-surface-secondary">{formatTypeLabel(type)}</span>
                ))}
                <span className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-surface-secondary">{person.estado}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onDelete ? (
              <Popconfirm title="¿Eliminar esta persona?" description="Se marcará como eliminada pero los datos se conservan." onConfirm={() => onDelete(person)} okText="Eliminar" cancelText="Cancelar" okButtonProps={{ danger: true }}>
                <Button icon={<DeleteOutlined />} danger className="rounded-button">Eliminar</Button>
              </Popconfirm>
            ) : null}
            {onEdit ? (
              <Button icon={<EditOutlined />} className="rounded-button" onClick={() => onEdit(person)}>Editar</Button>
            ) : null}
            <Button icon={<ArrowLeftOutlined />} className="rounded-button" onClick={onBack}>Volver</Button>
          </div>
        </div>
        <Divider className="my-5" />
        <div className="grid min-w-0 gap-3 md:grid-cols-3">
          <PersonSummaryLine label="Teléfono" value={person.telefono} icon={<PhoneOutlined />} />
          <PersonSummaryLine label="Email" value={person.email ?? "Sin correo"} icon={<MailOutlined />} />
          <PersonSummaryLine label="Último contacto" value={person.ultima_interaccion} icon={<CalendarOutlined />} />
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
                    <p className="mt-2 text-sm font-semibold text-surface-main">{person.proxima_actividad}</p>
                    <p className="mt-1 text-sm text-surface-secondary">{person.proxima_actividad_detalle}</p>
                  </Card>
                  <Card className="rounded-2xl border-[var(--border-subtle)] bg-transparent shadow-none">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-muted">Tareas pendientes</p>
                    <p className="mt-2 text-sm font-semibold text-surface-main">{person.tareas.pendientes.length}</p>
                    <p className="mt-1 text-sm text-surface-secondary">Operativas y administrativas</p>
                  </Card>
                  <Card className="rounded-2xl border-[var(--border-subtle)] bg-transparent shadow-none">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface-muted">Pagos pendientes</p>
                    <p className="mt-2 text-sm font-semibold text-surface-main">{person.finanzas.pendientes.length}</p>
                    <p className="mt-1 text-sm text-surface-secondary">Pendientes de atención</p>
                  </Card>
                </div>
              ),
            },
            { key: "Agenda", label: "Agenda", children: <PersonAgendaList entries={person.citas.proximas.concat(person.citas.historial)} /> },
            { key: "Tareas", label: "Tareas", children: <PersonTasksList entries={person.tareas.pendientes.concat(person.tareas.completadas)} /> },
            { key: "Finanzas", label: "Finanzas", children: <PersonFinanceList payments={person.finanzas.pendientes} services={person.finanzas.servicios} /> },
            { key: "Historial", label: "Historial", children: <PersonHistoryList entries={person.historial} /> },
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
            <p><span className="font-semibold text-surface-main">ID:</span> {person.id}</p>
            <p><span className="font-semibold text-surface-main">Creado:</span> {person.fecha_creacion}</p>
            <p><span className="font-semibold text-surface-main">Última interacción:</span> {person.ultima_interaccion}</p>
            <p><span className="font-semibold text-surface-main">Estado:</span> {person.estado}</p>
          </div>
          <div className="space-y-3 text-sm text-surface-secondary">
            <p><span className="font-semibold text-surface-main">Fuente:</span> {person.fuente}</p>
            <p><span className="font-semibold text-surface-main">Responsable:</span> {person.responsable}</p>
            <div>
              <p className="font-semibold text-surface-main">Etiquetas:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {person.etiquetas.map((tag) => (
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