import type { Person } from "./adminPeople";

export type D1Role = "root" | "admin" | "doctor" | "asistente";

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
  estado: Person["estado"];
  fuente?: string;
  fecha_creacion: string;
  ultima_interaccion?: string;
  proximo_evento_fecha?: string;
  proxima_actividad?: string;
  proxima_actividad_detalle?: string;
  consentimiento_contacto?: boolean;
  assigned_user_id?: string;
};

export type D1Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
  description?: string;
  category?: string;
  color?: string;
  max_participants?: number;
  is_online?: boolean;
  landing_visible?: boolean;
  landing_description?: string;
  landing_image?: string;
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
  service_id?: string;
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
  service_id?: string;
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
  service_id?: string;
  completed_at?: string;
};

export type D1ApiResponse<T> = {
  data: T;
};