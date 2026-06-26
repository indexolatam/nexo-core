import { ClockCircleOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Input, Spin, Table, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import type { AuditLogEntry } from "../../services/auditService";
import { auditService } from "../../services/auditService";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  section: string;
  detail: string;
  type: "creación" | "edición" | "eliminación" | "acceso" | "configuración";
}

function toAuditEntry(entry: AuditLogEntry): AuditEntry {
  const date = entry.timestamp.slice(0, 10);
  const time = entry.timestamp.slice(11, 19);
  const timestamp = `${date} ${time}`;

  const actionMap: Record<string, string> = {
    created: "Creación",
    updated: "Actualización",
    deleted: "Eliminación",
    paid: "Pago registrado",
    canceled: "Cancelación",
    note_added: "Nota agregada",
    password_changed: "Cambio de contraseña",
  };

  const sectionMap: Record<string, string> = {
    person: "Persona",
    agenda: "Agenda",
    task: "Tareas",
    finance: "Finanzas",
    user: "Usuarios",
    settings: "Configuración",
  };

  const typeMap: Record<string, AuditEntry["type"]> = {
    created: "creación",
    updated: "edición",
    deleted: "edición",
    paid: "creación",
    canceled: "eliminación",
    note_added: "edición",
    password_changed: "configuración",
  };

  const section = sectionMap[entry.entity_type] ?? entry.entity_type;
  const action = actionMap[entry.event_type] ?? entry.event_type;
  const detail = entry.detail ?? `${entry.event_type} en ${entry.entity_type} (${entry.entity_id})`;
  const type = typeMap[entry.event_type] ?? "acceso";

  return { id: entry.id, timestamp, user: entry.user_label, action, section, detail, type };
}

const typeColors: Record<AuditEntry["type"], string> = {
  creación: "green",
  edición: "blue",
  eliminación: "red",
  acceso: "purple",
  configuración: "orange",
};

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    auditService.list().then((data) => {
      setRows(data.map(toAuditEntry));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(
      (entry) =>
        entry.user.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.section.toLowerCase().includes(q) ||
        entry.detail.toLowerCase().includes(q),
    );
  }, [search, rows]);

  const columns: ColumnsType<AuditEntry> = [
    {
      title: "Fecha y hora", dataIndex: "timestamp", key: "timestamp", width: 160,
      className: "whitespace-nowrap",
      render: (value: string) => (
        <span className="flex items-center gap-1.5 text-xs text-surface-secondary">
          <ClockCircleOutlined className="text-surface-muted" />{value}
        </span>
      ),
    },
    {
      title: "Usuario", dataIndex: "user", key: "user", width: 130,
      render: (value: string) => (
        <span className="flex items-center gap-1.5 text-sm font-medium text-surface-main">
          <UserOutlined className="text-surface-muted" />{value}
        </span>
      ),
    },
    {
      title: "Acción", dataIndex: "action", key: "action", width: 180,
      render: (value: string) => <span className="text-sm text-surface-main">{value}</span>,
    },
    {
      title: "Sección", dataIndex: "section", key: "section", width: 110,
      render: (value: string) => (
        <Tag className="rounded-full border-0 text-[11px] font-medium" style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>{value}</Tag>
      ),
    },
    {
      title: "Detalle", dataIndex: "detail", key: "detail",
      render: (value: string) => <span className="text-sm text-surface-secondary">{value}</span>,
    },
    {
      title: "Tipo", dataIndex: "type", key: "type", width: 110,
      render: (value: AuditEntry["type"]) => (
        <Tag color={typeColors[value]} className="rounded-full border-0 text-[11px] font-medium uppercase">{value}</Tag>
      ),
    },
  ];

  return (
    <section>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-muted">Auditoría</p>
        <h2 className="text-2xl font-black text-surface-main">Logs del sistema</h2>
        <p className="mt-1 text-sm text-surface-secondary">Registro de actividad del panel administrativo.</p>
      </header>

      <Card className="rounded-3xl border-[var(--border)]" styles={{ body: { padding: 16 } }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            prefix={<SearchOutlined className="text-surface-muted" />}
            placeholder="Buscar en logs..."
            className="rounded-button sm:max-w-md"
          />
          <span className="text-xs text-surface-muted">{filtered.length} de {rows.length} registros</span>
        </div>
      </Card>

      <Card className="mt-4 rounded-3xl border-[var(--border)]" styles={{ body: { padding: 0 } }}>
        <Spin spinning={loading}>
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 20, showSizeChanger: false, simple: true }}
            className="[&_.ant-table-cell]:px-4 [&_.ant-table-cell]:py-3"
            locale={{ emptyText: "No hay registros de actividad." }}
          />
        </Spin>
      </Card>
    </section>
  );
}