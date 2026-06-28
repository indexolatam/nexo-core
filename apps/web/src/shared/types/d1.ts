import type { UserStatus } from "../../modules/users/types/adminUsers";

export type D1Role = "root" | "admin" | "asistente" | "colaborador";

export type D1AuditEventType =
  | "created"
  | "updated"
  | "deleted"
  | "paid"
  | "canceled"
  | "note_added"
  | "password_changed";

export type D1User = {
  id: string;
  name: string;
  lastname: string;
  role: D1Role;
  active: boolean;
  username: string;
  email: string;
  display_label: string;
};

export type D1Person = {
  id: string;
  nombre_1: string;
  nombre_2?: string;
  apellido_1: string;
  apellido_2?: string;
  telefono: string;
  telefono_adicional?: string;
  contacto_adicional_nombre?: string;
  contacto_adicional_apellido?: string;
  email?: string;
  estado: UserStatus;
  fuente?: string;
  fecha_creacion: string;
  ultima_interaccion?: string;
  proximo_evento_fecha?: string;
  proxima_actividad?: string;
  proxima_actividad_detalle?: string;
  consentimiento_contacto?: boolean;
  assigned_user_id?: string;
};

export type ParticipantOption = {
  count: number;
  label: string;
  price: number;
};

export type D1Service = {
  services_id: string;
  services_name: string;
  services_category: string;
  services_duration: number;
  services_duration_unit: "minutes" | "hours" | "days" | "weeks" | "months" | "years";
  services_price: number;
  services_currency: string;
  services_participants: ParticipantOption[];
  services_description?: string;
  services_landing_visible: boolean;
  services_landing_title?: string;
  services_landing_paragraph?: string;
  services_landing_image?: string;
  services_landing_icon?: string;
  services_landing_order: number;
  services_landing_cta: string;
  services_active: boolean;
  services_created_at: string;
  services_updated_at?: string;
  services_deleted_at?: string;
  services_created_by?: string;
  services_updated_by?: string;
};

export type D1BankConfig = {
  id: string;
  name: string;
  active: boolean;
  display_order?: number;
  account_number?: string;
  account_holder?: string;
};

export type D1FinanceMovement = {
  id: string;
  persona_id: string;
  persona_nombre?: string;
  servicio?: string;
  services_id?: string;
  monto: number;
  metodo_pago: string;
  estado: string;
  fecha: string;
  hora?: string;
  referencia_transaccion?: string;
  banco_id?: string;
  observaciones?: string;
  tipo_movimiento: string;
  fecha_vencimiento?: string;
  pagado_en?: string;
  moneda: string;
};

export type D1AgendaEvent = {
  id: string;
  title: string;
  meta?: string;
  category: string;
  tone?: string;
  status: string;
  assigned_user_id?: string;
  person_id?: string;
  starts_at: string;
  ends_at?: string;
  tiempo_previo_minutes?: number;
  tiempo_posterior_minutes?: number;
  location_type: string;
  location_department?: string;
  location_reference?: string;
  meeting_url?: string;
  services_id?: string;
  is_recurring: boolean;
};

export type D1AgendaEventInstance = {
  id: string;
  event_id: string;
  starts_at: string;
  ends_at?: string;
  status: string;
  is_confirmed: boolean;
  notes?: string;
};

export type D1Task = {
  id: string;
  title: string;
  description?: string;
  assigned_user_id?: string;
  priority: string;
  due_at?: string;
  status: string;
  category: string;
  related_entity_type?: string;
  related_entity_id?: string;
  person_id?: string;
  event_id?: string;
  services_id?: string;
  completed_at?: string;
};

export type D1ApiResponse<T> = {
  data: T;
};