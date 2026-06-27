export type UserType = "Cliente" | "Empresa" | "Freelancer" | "Proveedor";

export type UserStatus = "Activo" | "Inactivo" | "Pendiente" | "Archivado";

export type UserStatusFilter = null | "inactivos" | "archivados";

export type UserConditionFilter = null | "conTareas" | "pagoPendiente";

export type UserTypeFilter = "Todos" | UserType;

export const userTypeOptions: UserType[] = ["Cliente", "Empresa", "Freelancer", "Proveedor"];

export type UserAgendaEntry = {
  id: string; date: string; time: string; title: string;
  status: "Confirmada" | "Pendiente" | "Atendida" | "Cancelada";
  note?: string;
};

export type UserTaskEntry = {
  id: string; title: string;
  status: "Pendiente" | "En curso" | "Completada" | "Cancelada";
  priority: "Alta" | "Media" | "Baja";
};

export type UserPaymentEntry = {
  id: string; service: string; amount: string;
  status: "Pagado" | "Pendiente"; dueDate: string;
};

export type UserHistoryEntry = {
  id: string; date: string; title: string; detail: string;
};

export type User = {
  user_id: string;
  user_name: string;
  user_name_1: string;
  user_name_2?: string;
  user_lastname_1: string;
  user_lastname_2?: string;
  user_phone_code: string;
  user_phone: string;
  user_contact_phone_code?: string;
  user_contact_phone?: string;
  user_contact_name?: string;
  user_contact_lastname?: string;
  user_email?: string;
  user_status: UserStatus;
  user_source: string;
  user_created_date: string;
  user_last_interaction: string;
  user_next_activity: string;
  user_next_activity_detail: string;
  user_consent: boolean;
  user_assigned_to: string;
  user_types: UserType[];
  user_tags: string[];
  user_admin_notes: string;
  user_created_at: string;
  user_updated_at: string;
  user_deleted_at: string;
  user_created_by: string;
  user_updated_by: string;
  citas: {
    proximas: UserAgendaEntry[];
    historial: UserAgendaEntry[];
  };
  tareas: {
    pendientes: UserTaskEntry[];
    completadas: UserTaskEntry[];
  };
  finanzas: {
    pagadas: UserPaymentEntry[];
    pendientes: UserPaymentEntry[];
    servicios: string[];
  };
  historial: UserHistoryEntry[];

  // Backward-compatible aliases (remove when migration is complete)
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  tipos: UserType[];
  estado: UserStatus;
  fecha_creacion: string;
  ultima_interaccion: string;
  observaciones_administrativas: string;
  fuente: string;
  responsable: string;
  etiquetas: string[];
  proxima_actividad: string;
  proxima_actividad_detalle: string;
};

export type CreateUserInput = {
  user_name: string;
  user_phone: string;
  user_email?: string;
  user_types: UserType[];
  user_status: UserStatus;
  user_created_date?: string;
  user_last_interaction?: string;
  user_admin_notes?: string;
  user_source?: string;
  user_assigned_to?: string;
  user_tags?: string[];
  user_next_activity?: string;
  user_next_activity_detail?: string;
};

export type UpdateUserInput = Partial<CreateUserInput>;
