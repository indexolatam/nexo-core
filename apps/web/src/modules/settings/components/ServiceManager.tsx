import { DeleteOutlined, EditOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Input, InputNumber, message, Modal, Row, Select, Switch, Tag, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { servicesService } from "../../../services";
import type { ServiceConfig, ParticipantOption } from "../types/adminSettings";

const DURATION_UNITS = [
  { value: "minutes", label: "Minutos" },
  { value: "hours", label: "Horas" },
  { value: "days", label: "Días" },
  { value: "weeks", label: "Semanas" },
  { value: "months", label: "Meses" },
  { value: "years", label: "Años" },
];

const CATEGORIES = ["General", "Terapia", "Taller", "Empresarial"];
const CURRENCIES = ["USD", "NIO"];

const defaultDraft = {
  services_name: "",
  services_category: "General",
  services_duration: 60,
  services_duration_unit: "minutes",
  services_price: 0,
  services_currency: "USD",
  services_participants: [{ count: 1, label: "Individual", price: 0 }] as ParticipantOption[],
  services_description: "",
  services_landing_visible: false,
  services_landing_title: "",
  services_landing_paragraph: "",
  services_landing_image: "",
  services_landing_icon: "",
  services_landing_order: 0,
  services_landing_cta: "Consultar",
  services_active: true,
};

function unitLabel(unit: string) {
  return DURATION_UNITS.find((u) => u.value === unit)?.label ?? unit;
}

function formatDuration(duration: number, unit: string) {
  return `${duration} ${unitLabel(unit).toLowerCase()}`;
}

export function ServiceManager() {
  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(defaultDraft);

  useEffect(() => {
    servicesService
      .list()
      .then((data) => setServices(data as unknown as ServiceConfig[]))
      .catch(() => message.error("No se pudieron cargar los servicios"))
      .finally(() => setLoading(false));
  }, []);

  const openEditor = (service?: ServiceConfig) => {
    if (service) {
      setEditingId(service.services_id);
      setDraft({
        services_name: service.services_name,
        services_category: service.services_category || "General",
        services_duration: service.services_duration || 60,
        services_duration_unit: service.services_duration_unit || "minutes",
        services_price: service.services_price || 0,
        services_currency: service.services_currency || "USD",
        services_participants: service.services_participants?.length ? service.services_participants : [{ count: 1, label: "Individual", price: 0 }],
        services_description: service.services_description || "",
        services_landing_visible: service.services_landing_visible || false,
        services_landing_title: service.services_landing_title || "",
        services_landing_paragraph: service.services_landing_paragraph || "",
        services_landing_image: service.services_landing_image || "",
        services_landing_icon: service.services_landing_icon || "",
        services_landing_order: service.services_landing_order || 0,
        services_landing_cta: service.services_landing_cta || "Consultar",
        services_active: service.services_active,
      });
    } else {
      setEditingId(null);
      setDraft(defaultDraft);
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    const name = draft.services_name.trim();
    if (!name) return message.warning("Escribe el nombre del servicio");
    try {
      if (editingId) {
        const updated = await servicesService.update(editingId, draft as Partial<ServiceConfig>);
        setServices((prev) => prev.map((s) => (s.services_id === updated.services_id ? (updated as unknown as ServiceConfig) : s)));
        message.success("Servicio actualizado");
      } else {
        const created = await servicesService.create(draft as Partial<ServiceConfig>);
        setServices((prev) => [created as unknown as ServiceConfig, ...prev]);
        message.success("Servicio creado");
      }
      setModalOpen(false);
    } catch {
      message.error(editingId ? "No se pudo actualizar el servicio" : "No se pudo crear el servicio");
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "¿Eliminar servicio?",
      content: "Esta acción no se puede deshacer. El servicio se eliminará de forma permanente.",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      centered: true,
      onOk: async () => {
        try {
          await servicesService.remove(id);
          setServices((prev) => prev.filter((s) => s.services_id !== id));
          message.success("Servicio eliminado");
        } catch {
          message.error("No se pudo eliminar el servicio");
        }
      },
    });
  };

  const toggleActive = async (service: ServiceConfig) => {
    try {
      const updated = await servicesService.update(service.services_id, { services_active: !service.services_active });
      setServices((prev) => prev.map((s) => (s.services_id === updated.services_id ? { ...s, services_active: !service.services_active } : s)));
      message.success(service.services_active ? "Servicio desactivado" : "Servicio activado");
    } catch {
      message.error("No se pudo actualizar el servicio");
    }
  };

  const updateDraft = <K extends keyof typeof draft>(field: K, value: (typeof draft)[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const addParticipant = () => {
    setDraft((prev) => ({ ...prev, services_participants: [...prev.services_participants, { count: 1, label: "", price: 0 }] }));
  };

  const removeParticipant = (index: number) => {
    setDraft((prev) => ({ ...prev, services_participants: prev.services_participants.filter((_, i) => i !== index) }));
  };

  const updateParticipant = (index: number, field: keyof ParticipantOption, value: number | string) => {
    setDraft((prev) => ({
      ...prev,
      services_participants: prev.services_participants.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  };

  return (
    <div className="space-y-4">
      <Button icon={<PlusOutlined />} className="rounded-button" onClick={() => openEditor()}>
        Nuevo servicio
      </Button>

      {loading ? (
        <p className="text-sm text-surface-secondary">Cargando servicios...</p>
      ) : services.length === 0 ? (
        <p className="text-sm text-surface-muted">No hay servicios configurados. Crea el primero.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <div key={service.services_id} className={`group relative rounded-2xl border p-4 transition-colors ${service.services_active ? "border-[var(--border-subtle)]" : "border-dashed border-[var(--border-subtle)]/50 opacity-60"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-semibold text-surface-main ${!service.services_active ? "line-through text-surface-muted" : ""}`}>{service.services_name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Tag className="text-[10px]">{service.services_category || "General"}</Tag>
                    <Tag className="text-[10px]" color={service.services_active ? "green" : "default"}>{service.services_active ? "Activo" : "Inactivo"}</Tag>
                  </div>
                  <p className="mt-2 text-xs text-surface-secondary">
                    {formatDuration(service.services_duration, service.services_duration_unit)} · ${service.services_price} {service.services_currency || "USD"}
                  </p>
                  {service.services_participants?.length > 1 && (
                    <p className="mt-1 text-[11px] text-surface-muted">{service.services_participants.length} opciones de participantes</p>
                  )}
                  {service.services_landing_visible && (
                    <Tag className="mt-2 text-[10px]" color="blue">Visible en landing</Tag>
                  )}
                </div>
                <Switch checked={service.services_active} onChange={() => toggleActive(service)} size="small" />
              </div>
              <div className="mt-3 flex gap-2 border-t border-[var(--border-subtle)] pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                <Tooltip title="Editar">
                  <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditor(service)} />
                </Tooltip>
                <Tooltip title="Eliminar">
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(service.services_id)} />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editingId ? "Editar servicio" : "Nuevo servicio"}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Guardar"
        cancelText="Cancelar"
        centered
        width={640}
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-muted">Información básica</p>
            <div className="space-y-3">
              <Input placeholder="Nombre del servicio" value={draft.services_name} onChange={(e) => updateDraft("services_name", e.target.value)} />
              <Select className="w-full" placeholder="Categoría" value={draft.services_category} onChange={(v) => updateDraft("services_category", v)} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
              <Input.TextArea rows={3} placeholder="Descripción (opcional)" value={draft.services_description} onChange={(e) => updateDraft("services_description", e.target.value)} />
            </div>
          </div>

          <Divider className="!my-3" />

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-muted">Duración y precio</p>
            <Row gutter={12}>
              <Col span={12}>
                <InputNumber className="w-full" min={1} placeholder="Duración" value={draft.services_duration} onChange={(v) => updateDraft("services_duration", v ?? 60)} addonAfter={<Select style={{ width: 110 }} value={draft.services_duration_unit} onChange={(v) => updateDraft("services_duration_unit", v)} options={DURATION_UNITS} bordered={false} />} />
              </Col>
              <Col span={12}>
                <InputNumber className="w-full" min={0} placeholder="Precio" value={draft.services_price} onChange={(v) => updateDraft("services_price", v ?? 0)} prefix="$" addonAfter={<Select style={{ width: 70 }} value={draft.services_currency} onChange={(v) => updateDraft("services_currency", v)} options={CURRENCIES.map((c) => ({ value: c, label: c }))} bordered={false} />} />
              </Col>
            </Row>
          </div>

          <Divider className="!my-3" />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-muted">Participantes</p>
              <Button type="link" size="small" icon={<PlusOutlined />} onClick={addParticipant} className="!px-0">Agregar</Button>
            </div>
            <div className="space-y-2">
              {draft.services_participants.map((p, i) => (
                <Row key={i} gutter={8} align="middle">
                  <Col span={6}>
                    <InputNumber className="w-full" min={1} placeholder="Cant." value={p.count} onChange={(v) => updateParticipant(i, "count", v ?? 1)} />
                  </Col>
                  <Col span={10}>
                    <Input placeholder="Etiqueta (ej: Pareja)" value={p.label} onChange={(e) => updateParticipant(i, "label", e.target.value)} />
                  </Col>
                  <Col span={6}>
                    <InputNumber className="w-full" min={0} placeholder="Precio" value={p.price} onChange={(v) => updateParticipant(i, "price", v ?? 0)} prefix="$" />
                  </Col>
                  <Col span={2}>
                    {draft.services_participants.length > 1 && (
                      <Button type="text" size="small" danger icon={<MinusCircleOutlined />} onClick={() => removeParticipant(i)} />
                    )}
                  </Col>
                </Row>
              ))}
            </div>
          </div>

          <Divider className="!my-3" />

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-muted">Estado</p>
            <div className="flex items-center gap-3">
              <Switch checked={draft.services_active} onChange={(v) => updateDraft("services_active", v)} />
              <span className="text-sm text-surface-secondary">{draft.services_active ? "Activo" : "Inactivo"}</span>
            </div>
          </div>

          <Divider className="!my-3" />

          <div>
            <div className="mb-2 flex items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-muted">Landing</p>
              <Switch checked={draft.services_landing_visible} onChange={(v) => updateDraft("services_landing_visible", v)} size="small" />
              <span className="text-xs text-surface-secondary">{draft.services_landing_visible ? "Visible" : "Oculto"}</span>
            </div>
            {draft.services_landing_visible && (
              <div className="space-y-3">
                <Input placeholder="Título en landing" value={draft.services_landing_title} onChange={(e) => updateDraft("services_landing_title", e.target.value)} />
                <Input.TextArea rows={2} placeholder="Párrafo descriptivo" value={draft.services_landing_paragraph} onChange={(e) => updateDraft("services_landing_paragraph", e.target.value)} />
                <Row gutter={12}>
                  <Col span={16}>
                    <Input placeholder="URL de imagen" value={draft.services_landing_image} onChange={(e) => updateDraft("services_landing_image", e.target.value)} />
                  </Col>
                  <Col span={8}>
                    <Input placeholder="Ícono" value={draft.services_landing_icon} onChange={(e) => updateDraft("services_landing_icon", e.target.value)} />
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col span={8}>
                    <InputNumber className="w-full" min={0} placeholder="Orden" value={draft.services_landing_order} onChange={(v) => updateDraft("services_landing_order", v ?? 0)} />
                  </Col>
                  <Col span={16}>
                    <Input placeholder="Texto del botón (CTA)" value={draft.services_landing_cta} onChange={(e) => updateDraft("services_landing_cta", e.target.value)} />
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
