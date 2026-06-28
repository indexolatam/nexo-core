import {
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { App, Button, Card, DatePicker, Form, Input, InputNumber, Modal, Popover, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { paymentMethods, paymentStatuses } from "./types/adminFinance";
import { financeService } from "../../services";
import { useBankConfig } from "../../context/BankConfigContext";
import type { FinanceFilterState, FinanceMovement, FinanceQuickFilter, PaymentMethod, PaymentStatus, PaymentView } from "./types/adminFinance";
import type { D1FinanceMovement } from "../../shared/types/d1";
import { StatCard } from "./components/StatCard";
import { FinanceTable } from "./components/FinanceTable";
import { FinanceFilters } from "./components/FinanceFilters";

const FINANCE_BASE_DATE = new Date();

function toFinanceMovement(d1: D1FinanceMovement): FinanceMovement {
  return {
    id: d1.id,
    persona_id: d1.persona_id,
    persona_nombre: d1.persona_nombre || "",
    servicio: d1.servicio || "",
    monto: d1.monto,
    metodo_pago: d1.metodo_pago as PaymentMethod,
    referencia_transaccion: d1.referencia_transaccion || "",
    banco: d1.banco_id || "",
    estado: d1.estado as PaymentStatus,
    fecha: d1.fecha,
    hora: d1.hora || "",
    observaciones: d1.observaciones || "",
  };
}

const quickFilterLabels: { value: FinanceQuickFilter; label: string; icon: ReactNode }[] = [
  { value: "Pendientes", label: "Pendientes", icon: <WarningOutlined /> },
];

const defaultFilters: FinanceFilterState = {
  estado: [],
  metodo: [],
  fecha_desde: "",
  fecha_hasta: "",
  servicio: "",
  monto_min: "",
  monto_max: "",
};

function useDebouncedValue<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);
  return debounced;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function matchesQuickFilter(movement: FinanceMovement, filter: FinanceQuickFilter) {
  if (filter === "Todos") return true;
  if (filter === "Pendientes") return movement.estado === "Pendiente";
  return true;
}

function matchesAdvancedFilters(movement: FinanceMovement, filters: FinanceFilterState) {
  const estadoMatch = filters.estado.length === 0 || filters.estado.includes(movement.estado);
  const metodoMatch = filters.metodo.length === 0 || filters.metodo.includes(movement.metodo_pago);
  const fechaDesdeMatch = !filters.fecha_desde || movement.fecha >= filters.fecha_desde;
  const fechaHastaMatch = !filters.fecha_hasta || movement.fecha <= filters.fecha_hasta;
  const servicioMatch = !filters.servicio || normalizeText(movement.servicio).includes(normalizeText(filters.servicio));
  const montoMinMatch = !filters.monto_min || movement.monto >= Number(filters.monto_min);
  const montoMaxMatch = !filters.monto_max || movement.monto <= Number(filters.monto_max);
  return estadoMatch && metodoMatch && fechaDesdeMatch && fechaHastaMatch && servicioMatch && montoMinMatch && montoMaxMatch;
}

function matchesSearch(movement: FinanceMovement, query: string) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return [movement.persona_nombre, movement.servicio, movement.id].some((value) => value.toLowerCase().includes(q));
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("es-PE")}`;
}

export function FinancePage() {
  const { message } = App.useApp();
  const { enabledBanks } = useBankConfig();
  const [items, setItems] = useState<FinanceMovement[]>([]);

  useEffect(() => {
    financeService.list().then((data) => {
      setItems((data as unknown as D1FinanceMovement[]).map(toFinanceMovement));
    }).catch(() => {
      message.error("No se pudieron cargar movimientos");
    });
  }, [message]);

  const currentMonth = FINANCE_BASE_DATE.toISOString().slice(0, 7);
  const [showHistory, setShowHistory] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [quickFilter, setQuickFilter] = useState<FinanceQuickFilter>("Todos");
  const [viewMode, setViewMode] = useState<PaymentView>("lista");
  const [filters, setFilters] = useState<FinanceFilterState>(defaultFilters);
  const [tempFilters, setTempFilters] = useState<FinanceFilterState>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const personOptions = useMemo(() => {
    const names = new Set<string>();
    items.forEach((m) => names.add(m.persona_nombre));
    return Array.from(names).sort().map((name) => ({ value: name, label: name }));
  }, [items]);

  const selectedPersonName = Form.useWatch("persona_nombre", form);

  const serviceOptionsForPerson = useMemo(() => {
    if (!selectedPersonName) return [];
    const services = new Set<string>();
    items
      .filter((m) => m.persona_nombre === selectedPersonName)
      .forEach((m) => services.add(m.servicio));
    return Array.from(services).sort().map((s) => ({ value: s, label: s }));
  }, [selectedPersonName, items]);

  const filtered = useMemo(() => {
    return items.filter(
      (movement) => {
        if (showHistory) {
          return (
            matchesQuickFilter(movement, quickFilter) &&
            matchesAdvancedFilters(movement, filters) &&
            matchesSearch(movement, debouncedSearch)
          );
        }
        if (movement.estado === "Pagado" && !movement.fecha.startsWith(currentMonth)) return false;
        return (
          matchesQuickFilter(movement, quickFilter) &&
          matchesAdvancedFilters(movement, filters) &&
          matchesSearch(movement, debouncedSearch)
        );
      },
    );
  }, [items, quickFilter, filters, debouncedSearch, showHistory, currentMonth]);

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (search.trim()) activeChips.push({ label: `Buscar: ${search.trim()}`, onRemove: () => setSearch("") });
  filters.estado.forEach((e) => activeChips.push({ label: e, onRemove: () => setFilters((prev) => ({ ...prev, estado: prev.estado.filter((item) => item !== e) })) }));
  filters.metodo.forEach((m) => activeChips.push({ label: m, onRemove: () => setFilters((prev) => ({ ...prev, metodo: prev.metodo.filter((item) => item !== m) })) }));
  if (filters.servicio) activeChips.push({ label: `Servicio: ${filters.servicio}`, onRemove: () => setFilters((prev) => ({ ...prev, servicio: "" })) });
  if (filters.fecha_desde || filters.fecha_hasta) {
    const label = `Fecha: ${filters.fecha_desde || "..."} → ${filters.fecha_hasta || "..."}`;
    activeChips.push({ label, onRemove: () => setFilters((prev) => ({ ...prev, fecha_desde: "", fecha_hasta: "" })) });
  }

  const clearAllFilters = () => {
    setSearch("");
    setQuickFilter("Todos");
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
  };

  const handleFilterOpenChange = (open: boolean) => {
    if (open) setTempFilters(filters);
    setFilterOpen(open);
  };

  const applyAdvancedFilters = () => {
    setFilters(tempFilters);
    setFilterOpen(false);
  };

  const clearAdvancedFilters = () => {
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setQuickFilter("Todos");
  };

  const [cobrarOpen, setCobrarOpen] = useState(false);
  const [cobrarMovement, setCobrarMovement] = useState<FinanceMovement | null>(null);
  const [cobrarForm] = Form.useForm();

  const handleOpenCobrar = (movement: FinanceMovement) => {
    setCobrarMovement(movement);
    cobrarForm.setFieldsValue({
      metodo_pago: movement.metodo_pago,
      referencia_transaccion: movement.referencia_transaccion,
      banco: movement.banco,
      observaciones: movement.observaciones,
    });
    setCobrarOpen(true);
  };

  const handleConfirmCobrar = async () => {
    if (!cobrarMovement) return;
    const values = await cobrarForm.validateFields();
    await financeService.update(cobrarMovement.id, {
      metodo_pago: values.metodo_pago,
      referencia_transaccion: values.referencia_transaccion,
      banco: values.banco,
      estado: "Pagado",
      observaciones: values.observaciones,
    });
    setItems((prev) =>
      prev.map((m) =>
        m.id === cobrarMovement.id
          ? { ...m, metodo_pago: values.metodo_pago, referencia_transaccion: values.referencia_transaccion, banco: values.banco, estado: "Pagado" as PaymentStatus, observaciones: values.observaciones }
          : m,
      ),
    );
    setCobrarOpen(false);
    setCobrarMovement(null);
    cobrarForm.resetFields();
    message.success("Pago cobrado");
  };

  const handleMarkAsCancelado = async (id: string) => {
    await financeService.update(id, { estado: "Cancelado" });
    setItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, estado: "Cancelado" as PaymentStatus } : m)),
    );
    message.success("Pago cancelado");
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editMovement, setEditMovement] = useState<FinanceMovement | null>(null);
  const [editForm] = Form.useForm();
  const editPersonName = Form.useWatch("persona_nombre", editForm);
  const editServiceOptions = useMemo(() => {
    if (!editPersonName) return [];
    const services = new Set<string>();
    items
      .filter((m) => m.persona_nombre === editPersonName)
      .forEach((m) => services.add(m.servicio));
    return Array.from(services).sort().map((s) => ({ value: s, label: s }));
  }, [editPersonName, items]);

  const handleEditPayment = (movement: FinanceMovement) => {
    setEditMovement(movement);
    editForm.setFieldsValue({
      persona_nombre: movement.persona_nombre,
      servicio: movement.servicio,
      monto: movement.monto,
      metodo_pago: movement.metodo_pago,
      referencia_transaccion: movement.referencia_transaccion,
      banco: movement.banco,
      estado: movement.estado,
      fecha: movement.fecha ? dayjs(movement.fecha) : null,
      observaciones: movement.observaciones,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editMovement) return;
    const values = await editForm.validateFields();
    await financeService.update(editMovement.id, {
      persona_id: editMovement.persona_id,
      persona_nombre: values.persona_nombre,
      servicio: values.servicio,
      monto: values.monto,
      metodo_pago: values.metodo_pago,
      referencia_transaccion: values.referencia_transaccion,
      banco: values.banco,
      estado: values.estado,
      observaciones: values.observaciones,
    });
    setItems((prev) =>
      prev.map((m) =>
        m.id === editMovement.id
          ? {
              ...m,
              persona_nombre: values.persona_nombre,
              servicio: values.servicio,
              monto: values.monto,
              metodo_pago: values.metodo_pago,
              referencia_transaccion: values.referencia_transaccion,
              banco: values.banco,
              estado: values.estado,
              fecha: values.fecha ? values.fecha.format("YYYY-MM-DD") : m.fecha,
              observaciones: values.observaciones,
            }
          : m,
      ),
    );
    setEditOpen(false);
    setEditMovement(null);
    editForm.resetFields();
    message.success("Pago actualizado");
  };

  const onCreatePayment = async () => {
    const values = await form.validateFields();
    const newMovement: FinanceMovement = {
      id: `fin-${String(items.length + 1).padStart(3, "0")}`,
      persona_id: `per-${String(items.length + 1).padStart(3, "0")}`,
      persona_nombre: values.persona_nombre,
      servicio: values.servicio,
      monto: values.monto,
      metodo_pago: values.metodo_pago,
      referencia_transaccion: values.referencia_transaccion,
      banco: values.banco,
      estado: values.estado,
      fecha: values.fecha ? values.fecha.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
      hora: dayjs().format("HH:mm"),
      observaciones: values.observaciones,
    };
    setItems((prev) => [newMovement, ...prev]);
    setCreateOpen(false);
    form.resetFields();
  };

  const totalIngresos = filtered.filter((m) => m.estado === "Pagado").reduce((sum, m) => sum + m.monto, 0);
  const totalPendiente = filtered.filter((m) => m.estado === "Pendiente").reduce((sum, m) => sum + m.monto, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Resumen financiero</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-main sm:text-4xl">Finanzas</h1>
            <p className="mt-2 max-w-3xl text-sm text-surface-secondary">
              Ingresos, movimientos y pagos pendientes. Control financiero simple sin contabilidad compleja.
            </p>
          </div>
        </div>
      </section>

      <Card className="rounded-3xl border-[var(--border)] border-b border-b-[var(--border-subtle)] bg-[var(--surface-strong)] shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              allowClear
              prefix={<SearchOutlined className="text-surface-muted" />}
              placeholder="Buscar pago..."
              className="rounded-button sm:max-w-md"
            />

            <Popover open={filterOpen} onOpenChange={handleFilterOpenChange} trigger="click" placement="bottomLeft" content={
              <FinanceFilters
                tempFilters={tempFilters}
                setTempFilters={setTempFilters}
                onApply={applyAdvancedFilters}
                onClear={clearAdvancedFilters}
              />
            }>
              <Button icon={<FilterOutlined />} className="rounded-button">
                Filtro
              </Button>
            </Popover>

            <Button type="primary" icon={<PlusOutlined />} className="rounded-button" onClick={() => setCreateOpen(true)}>
              Nuevo pago
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
            <div className="flex flex-wrap gap-2">
              {quickFilterLabels.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => { setQuickFilter(quickFilter === item.value ? "Todos" : item.value); setFilters(defaultFilters); }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    quickFilter === item.value
                      ? "border-[var(--accent-border)] bg-[var(--accent)] text-white shadow-sm"
                      : "border-[var(--border-subtle)] text-surface-secondary hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowHistory((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  showHistory
                    ? "border-[var(--accent-border)] bg-[var(--accent)] text-white shadow-sm"
                    : "border-[var(--border-subtle)] text-surface-secondary hover:border-[var(--accent-border)] hover:text-[var(--accent-deep)]"
                }`}
              >
                {showHistory ? "Historial activo" : "Ver historial"}
              </button>
            </div>
            <div className="flex items-center gap-3 self-end xl:self-auto">
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-surface-muted">Ingresado</p>
                <p className="text-lg font-black text-surface-main">{formatCurrency(totalIngresos)}</p>
              </div>
              <div className="h-8 w-px bg-[var(--border-subtle)]" />
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-surface-muted">Pendiente</p>
                <p className="text-lg font-black text-[var(--status-attention)]">{formatCurrency(totalPendiente)}</p>
              </div>
            </div>
          </div>
        </div>

        {activeChips.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.onRemove}
                className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)]/40 px-3 py-1.5 text-xs font-medium text-[var(--accent-deep)]"
              >
                {chip.label} ×
              </button>
            ))}
            <Button size="small" type="text" onClick={clearAllFilters}>
              Limpiar filtros
            </Button>
          </div>
        ) : null}
      </Card>

      <StatCard items={items} />

      <FinanceTable
        filtered={filtered}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCobrar={handleOpenCobrar}
        onCancelar={handleMarkAsCancelado}
        onEdit={handleEditPayment}
        onClearFilters={clearAllFilters}
      />

      <Modal title="Nuevo pago" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={onCreatePayment} okText="Guardar" cancelText="Cancelar" centered destroyOnClose>
        <Form form={form} layout="vertical" initialValues={{ estado: "Pagado", metodo_pago: "Efectivo" }}>
          <Form.Item label="Persona" name="persona_nombre" rules={[{ required: true, message: "Selecciona la persona" }]}>
            <Select
              showSearch
              placeholder="Buscar persona..."
              options={personOptions}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item label="Evento en agenda / Servicio" name="servicio" rules={[{ required: true, message: "Selecciona el servicio" }]}>
            <Select
              showSearch
              placeholder={selectedPersonName ? "Seleccionar evento o servicio..." : "Primero selecciona una persona"}
              options={
                serviceOptionsForPerson.length > 0
                  ? [...serviceOptionsForPerson.map((s) => ({ value: s.value, label: s.label }))]
                  : []
              }
              disabled={!selectedPersonName}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={
                selectedPersonName
                  ? "No hay eventos o servicios registrados para esta persona"
                  : "Selecciona una persona primero"
              }
            />
          </Form.Item>
          <Form.Item label="Monto ($)" name="monto" rules={[{ required: true, message: "Ingresa el monto" }]}>
            <InputNumber className="w-full" min={0} placeholder="0" prefix="$" />
          </Form.Item>
          <Form.Item label="Método de pago" name="metodo_pago" rules={[{ required: true }]}>
            <Select options={paymentMethods.map((m) => ({ value: m, label: m }))} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, next) => prev.metodo_pago !== next.metodo_pago}>
            {({ getFieldValue }) =>
              getFieldValue("metodo_pago") !== "Efectivo" ? (
                <>
                  <Form.Item label="Referencia de transacción" name="referencia_transaccion" rules={[{ required: true, message: "Ingresa la referencia" }]}>
                    <Input placeholder="Número de referencia, voucher, etc." />
                  </Form.Item>
                  <Form.Item label="Banco / Entidad" name="banco" rules={[{ required: true, message: "Selecciona el banco" }]}>
                    <Select
                      placeholder="Seleccionar banco..."
                      options={enabledBanks.map((b) => ({ value: b.name, label: b.name }))}
                    />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
          <Form.Item label="Estado" name="estado" rules={[{ required: true }]}>
            <Select options={paymentStatuses.map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item label="Fecha" name="fecha">
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item label="Observaciones" name="observaciones">
            <Input.TextArea rows={3} placeholder="Notas opcionales" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Editar pago" open={editOpen} onCancel={() => { setEditOpen(false); setEditMovement(null); editForm.resetFields(); }} onOk={handleSaveEdit} okText="Guardar cambios" cancelText="Cancelar" centered destroyOnClose>
        <Form form={editForm} layout="vertical">
          <Form.Item label="Persona" name="persona_nombre" rules={[{ required: true, message: "Selecciona la persona" }]}>
            <Select
              showSearch
              placeholder="Buscar persona..."
              options={personOptions}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item label="Evento en agenda / Servicio" name="servicio" rules={[{ required: true, message: "Selecciona el servicio" }]}>
            <Select
              showSearch
              placeholder={editPersonName ? "Seleccionar evento o servicio..." : "Primero selecciona una persona"}
              options={editServiceOptions.length > 0 ? [...editServiceOptions] : []}
              disabled={!editPersonName}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={
                editPersonName
                  ? "No hay eventos o servicios registrados para esta persona"
                  : "Selecciona una persona primero"
              }
            />
          </Form.Item>
          <Form.Item label="Monto ($)" name="monto" rules={[{ required: true, message: "Ingresa el monto" }]}>
            <InputNumber className="w-full" min={0} placeholder="0" prefix="$" />
          </Form.Item>
          <Form.Item label="Método de pago" name="metodo_pago" rules={[{ required: true }]}>
            <Select options={paymentMethods.map((m) => ({ value: m, label: m }))} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, next) => prev.metodo_pago !== next.metodo_pago}>
            {({ getFieldValue }) =>
              getFieldValue("metodo_pago") !== "Efectivo" ? (
                <>
                  <Form.Item label="Referencia de transacción" name="referencia_transaccion" rules={[{ required: true, message: "Ingresa la referencia" }]}>
                    <Input placeholder="Número de referencia, voucher, etc." />
                  </Form.Item>
                  <Form.Item label="Banco / Entidad" name="banco" rules={[{ required: true, message: "Selecciona el banco" }]}>
                    <Select
                      placeholder="Seleccionar banco..."
                      options={enabledBanks.map((b) => ({ value: b.name, label: b.name }))}
                    />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
          <Form.Item label="Estado" name="estado" rules={[{ required: true }]}>
            <Select options={paymentStatuses.map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item label="Fecha" name="fecha">
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item label="Observaciones" name="observaciones">
            <Input.TextArea rows={3} placeholder="Notas opcionales" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Cobrar pago" open={cobrarOpen} onCancel={() => { setCobrarOpen(false); setCobrarMovement(null); cobrarForm.resetFields(); }} onOk={handleConfirmCobrar} okText="Confirmar cobro" cancelText="Cancelar" centered destroyOnClose>
        <div className="space-y-1">
          {cobrarMovement ? (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-semibold text-surface-main">{cobrarMovement.persona_nombre}</p>
              <p className="mt-1 text-sm text-surface-secondary">{cobrarMovement.servicio}</p>
              <p className="mt-2 text-2xl font-black text-surface-main">{formatCurrency(cobrarMovement.monto)}</p>
            </div>
          ) : null}
        </div>
        <Form form={cobrarForm} layout="vertical" className="mt-4" initialValues={{ metodo_pago: "Efectivo" }}>
          <Form.Item label="Método de pago" name="metodo_pago" rules={[{ required: true, message: "Selecciona el método" }]}>
            <Select options={paymentMethods.map((m) => ({ value: m, label: m }))} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, next) => prev.metodo_pago !== next.metodo_pago}>
            {({ getFieldValue }) =>
              getFieldValue("metodo_pago") !== "Efectivo" ? (
                <>
                  <Form.Item label="Referencia de transacción" name="referencia_transaccion" rules={[{ required: true, message: "Ingresa la referencia" }]}>
                    <Input placeholder="Número de referencia, voucher, etc." />
                  </Form.Item>
                  <Form.Item label="Banco / Entidad" name="banco" rules={[{ required: true, message: "Selecciona el banco" }]}>
                    <Select
                      placeholder="Seleccionar banco..."
                      options={enabledBanks.map((b) => ({ value: b.name, label: b.name }))}
                    />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
          <Form.Item label="Observaciones / Comentarios" name="observaciones">
            <Input.TextArea rows={3} placeholder="Notas sobre el cobro (opcional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
