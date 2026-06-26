import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  EditOutlined,
  MoneyCollectOutlined,
  TableOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Badge, Button, Card, Divider, Empty, Segmented, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import type { FinanceMovement, PaymentMethod, PaymentStatus, PaymentView } from "../../../types/adminFinance";

const FINANCE_BASE_DATE = new Date(2026, 5, 14);

function formatCurrency(value: number) {
  return `$${value.toLocaleString("es-PE")}`;
}

function formatearFecha(dateStr: string) {
  const d = dayjs(dateStr);
  if (!d.isValid()) return dateStr;
  const hoy = dayjs(FINANCE_BASE_DATE);
  const diff = hoy.diff(d, "day");
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff > 1 && diff <= 3) return `Hace ${diff} días`;
  return d.format("DD MMM");
}

const statusColors: Record<PaymentStatus, string> = {
  Pagado: "var(--status-correct)",
  Pendiente: "var(--status-attention)",
  Cancelado: "var(--border-subtle)",
};

const statusBgColors: Record<PaymentStatus, string> = {
  Pagado: "rgba(34,197,94,0.12)",
  Pendiente: "rgba(234,179,8,0.15)",
  Cancelado: "rgba(148,163,184,0.15)",
};

const methodIcons: Record<PaymentMethod, ReactNode> = {
  Efectivo: <MoneyCollectOutlined />,
  Transferencia: <CreditCardOutlined />,
  Tarjeta: <CreditCardOutlined />,
  Otro: <DollarOutlined />,
};

interface FinanceTableProps {
  filtered: FinanceMovement[];
  viewMode: PaymentView;
  onViewModeChange: (mode: PaymentView) => void;
  onCobrar: (movement: FinanceMovement) => void;
  onCancelar: (id: string) => void;
  onEdit: (movement: FinanceMovement) => void;
  onClearFilters: () => void;
}

export function FinanceTable({
  filtered,
  viewMode,
  onViewModeChange,
  onCobrar,
  onCancelar,
  onEdit,
  onClearFilters,
}: FinanceTableProps) {
  return (
    <Card className="rounded-3xl border-[var(--border)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Movimientos</p>
            <h2 className="mt-2 text-lg font-bold text-surface-main">Pagos registrados</h2>
          </div>
          <Badge count={filtered.length} className="[&_.ant-badge-count]:bg-[var(--accent-soft)]/40 [&_.ant-badge-count]:text-[var(--accent-deep)] [&_.ant-badge-count]:shadow-none" />
        </div>
        <div className="w-full sm:w-auto">
          <Segmented
            block
            value={viewMode}
            onChange={(val) => onViewModeChange(val as PaymentView)}
            options={[
              { value: "lista", label: <span className="flex items-center gap-1.5"><UnorderedListOutlined className="text-xs" />Lista</span> },
              { value: "tabla", label: <span className="flex items-center gap-1.5"><TableOutlined className="text-xs" />Tabla</span> },
              { value: "cuadricula", label: <span className="flex items-center gap-1.5"><AppstoreOutlined className="text-xs" />Cuadrícula</span> },
            ]}
          />
        </div>
      </div>

      <Divider />

      {filtered.length > 0 ? (
        <>
          {viewMode === "lista" ? (
            <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1 thin-task-scrollbar">
              {filtered.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-start justify-between gap-4 rounded-3xl border border-[var(--border-subtle)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Tooltip title={movement.persona_nombre} placement="topLeft">
                          <h3 className="truncate whitespace-nowrap text-sm font-semibold text-surface-main">{movement.persona_nombre}</h3>
                        </Tooltip>
                        <p className="mt-1 text-sm text-surface-secondary">{movement.servicio}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-surface-main">{formatCurrency(movement.monto)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Tag
                        className="m-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                        style={{
                          borderColor: statusColors[movement.estado],
                          backgroundColor: statusBgColors[movement.estado],
                          color: statusColors[movement.estado],
                        }}
                      >
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColors[movement.estado] }} />
                        {movement.estado}
                      </Tag>
                      {movement.estado === "Pendiente" ? (
                        <>
                          <Button
                            size="small"
                            type="text"
                            icon={<CheckCircleOutlined />}
                            className="text-xs text-[var(--status-correct)] hover:text-[var(--status-correct)]"
                            onClick={() => onCobrar(movement)}
                          >
                            Cobrar
                          </Button>
                          <Button
                            size="small"
                            type="text"
                            icon={<CloseCircleOutlined />}
                            className="text-xs text-[var(--status-attention)] hover:text-[var(--status-attention)]"
                            onClick={() => onCancelar(movement.id)}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : null}
                      <Button
                        size="small"
                        type="text"
                        icon={<EditOutlined />}
                        className="text-xs text-surface-muted hover:text-[var(--accent-deep)]"
                        onClick={() => onEdit(movement)}
                      >
                        Editar
                      </Button>
                      <span className="flex items-center gap-1 text-[11px] text-surface-muted">
                        {methodIcons[movement.metodo_pago]}
                        {movement.metodo_pago}
                      </span>
                      <span className="text-[11px] text-surface-muted">· {formatearFecha(movement.fecha)} {movement.hora}</span>
                      {movement.observaciones ? (
                        <Tooltip title={movement.observaciones} placement="topLeft">
                          <span className="cursor-help text-[11px] text-surface-muted underline decoration-dotted">Nota</span>
                        </Tooltip>
                      ) : null}
                    </div>
                    {movement.referencia_transaccion || movement.banco ? (
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-surface-muted">
                        {movement.referencia_transaccion ? (
                          <span className="font-mono tracking-wide">Ref: {movement.referencia_transaccion}</span>
                        ) : null}
                        {movement.banco ? (
                          <span>Banco: {movement.banco}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {viewMode === "tabla" ? (
            <div className="max-h-[620px] overflow-auto rounded-2xl border border-[var(--border-subtle)] thin-task-scrollbar">
              <table className="min-w-[980px] w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-20 bg-[var(--surface-strong)] text-xs uppercase tracking-[0.14em] text-surface-muted">
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="sticky left-0 z-30 min-w-[132px] max-w-[132px] bg-[var(--surface-strong)] px-3 py-3 font-semibold shadow-[8px_0_12px_-12px_rgba(15,23,42,0.35)]">Persona</th>
                    <th className="min-w-[180px] px-3 py-3 font-semibold">Servicio</th>
                    <th className="min-w-[100px] px-3 py-3 text-right font-semibold">Monto</th>
                    <th className="min-w-[110px] px-3 py-3 font-semibold">Estado</th>
                    <th className="min-w-[120px] px-3 py-3 font-semibold">Método</th>
                    <th className="min-w-[120px] px-3 py-3 font-semibold">Fecha</th>
                    <th className="min-w-[170px] px-3 py-3 font-semibold">Ref / Banco</th>
                    <th className="min-w-[96px] px-3 py-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((movement) => (
                    <tr key={movement.id} className="group border-b border-[var(--border-subtle)] transition-colors duration-150 hover:bg-[var(--accent-soft)]/30">
                      <td className="sticky left-0 z-10 min-w-[132px] max-w-[132px] bg-[var(--surface-strong)] px-3 py-3 align-middle shadow-[8px_0_12px_-12px_rgba(15,23,42,0.25)] group-hover:bg-[var(--accent-soft)]/30">
                        <Tooltip title={movement.persona_nombre} placement="topLeft">
                          <span className="block truncate whitespace-nowrap font-semibold text-surface-main">{movement.persona_nombre}</span>
                        </Tooltip>
                      </td>
                      <td className="max-w-[180px] px-3 py-3 align-middle">
                        <Tooltip title={movement.servicio} placement="topLeft">
                          <span className="block truncate whitespace-nowrap text-surface-secondary">{movement.servicio}</span>
                        </Tooltip>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right align-middle font-bold text-surface-main">{formatCurrency(movement.monto)}</td>
                      <td className="px-3 py-3 align-middle">
                        <Tag className="m-0 rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ borderColor: statusColors[movement.estado], backgroundColor: statusBgColors[movement.estado], color: statusColors[movement.estado] }}>
                          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColors[movement.estado] }} />
                          {movement.estado}
                        </Tag>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle text-xs text-surface-muted">
                        <span className="flex items-center gap-1">{methodIcons[movement.metodo_pago]}{movement.metodo_pago}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle text-xs text-surface-muted">{formatearFecha(movement.fecha)} {movement.hora}</td>
                      <td className="max-w-[170px] px-3 py-3 align-middle text-[11px] text-surface-muted">
                        {movement.referencia_transaccion || movement.banco ? (
                          <div className="flex max-w-[150px] flex-col gap-0.5">
                            {movement.referencia_transaccion ? (
                              <Tooltip title={movement.referencia_transaccion} placement="topLeft">
                                <span className="block truncate whitespace-nowrap font-mono">Ref: {movement.referencia_transaccion}</span>
                              </Tooltip>
                            ) : null}
                            {movement.banco ? (
                              <Tooltip title={movement.banco} placement="topLeft">
                                <span className="block truncate whitespace-nowrap">Banco: {movement.banco}</span>
                              </Tooltip>
                            ) : null}
                          </div>
                        ) : <span className="text-surface-muted/50">—</span>}
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <div className="flex flex-col items-start gap-0.5">
                          {movement.estado === "Pendiente" ? (
                            <>
                              <Button size="small" type="text" icon={<CheckCircleOutlined />} className="text-xs text-[var(--status-correct)] hover:text-[var(--status-correct)]" onClick={() => onCobrar(movement)}>Cobrar</Button>
                              <Button size="small" type="text" icon={<CloseCircleOutlined />} className="text-xs text-[var(--status-attention)] hover:text-[var(--status-attention)]" onClick={() => onCancelar(movement.id)}>Cancelar</Button>
                            </>
                          ) : null}
                          <Button size="small" type="text" icon={<EditOutlined />} className="text-xs text-surface-muted hover:text-[var(--accent-deep)]" onClick={() => onEdit(movement)}>Editar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {viewMode === "cuadricula" ? (
            <div className="max-h-[620px] overflow-y-auto pr-1 thin-task-scrollbar">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Tooltip title={movement.persona_nombre} placement="topLeft">
                          <p className="truncate text-sm font-semibold text-surface-main">{movement.persona_nombre}</p>
                        </Tooltip>
                        <p className="mt-0.5 truncate text-xs text-surface-secondary">{movement.servicio}</p>
                      </div>
                      <Tag
                        className="m-0 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          borderColor: statusColors[movement.estado],
                          backgroundColor: statusBgColors[movement.estado],
                          color: statusColors[movement.estado],
                        }}
                      >
                        {movement.estado}
                      </Tag>
                    </div>
                    <p className="mt-2 text-lg font-black tracking-tight text-surface-main">{formatCurrency(movement.monto)}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-surface-muted">
                      {methodIcons[movement.metodo_pago]}
                      <span>{movement.metodo_pago}</span>
                      <span>·</span>
                      <span>{formatearFecha(movement.fecha)}</span>
                    </div>
                    {movement.referencia_transaccion || movement.banco ? (
                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-surface-muted">
                        {movement.referencia_transaccion ? <span className="font-mono">Ref: {movement.referencia_transaccion}</span> : null}
                        {movement.banco ? <span>· {movement.banco}</span> : null}
                      </div>
                    ) : null}
                    <div className="mt-auto flex items-center gap-1.5 border-t border-[var(--border-subtle)] pt-2">
                      {movement.estado === "Pendiente" ? (
                        <>
                          <Button size="small" type="text" icon={<CheckCircleOutlined />} className="text-xs text-[var(--status-correct)] hover:text-[var(--status-correct)]" onClick={() => onCobrar(movement)} />
                          <Button size="small" type="text" icon={<CloseCircleOutlined />} className="text-xs text-[var(--status-attention)] hover:text-[var(--status-attention)]" onClick={() => onCancelar(movement.id)} />
                        </>
                      ) : null}
                      <Button size="small" type="text" icon={<EditOutlined />} className="text-xs text-surface-muted hover:text-[var(--accent-deep)]" onClick={() => onEdit(movement)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="py-6">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No se encontraron movimientos">
            <Button onClick={onClearFilters}>Limpiar filtros</Button>
          </Empty>
        </div>
      )}
    </Card>
  );
}
