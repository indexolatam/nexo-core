export type PersonType = "Cliente" | "Empresa" | "Freelancer" | "Proveedor";

export type PersonStatus = "Activo" | "Inactivo" | "Pendiente" | "Archivado";

export type PersonQuickFilter = "Todos" | "Clientes" | "Empresas" | "Freelancers" | "Proveedores" | "Con tareas" | "Pendientes de pago";

export const personTypeOptions: PersonType[] = ["Cliente", "Empresa", "Freelancer", "Proveedor"];

export type PersonAgendaEntry = {
  id: string;
  date: string;
  time: string;
  title: string;
  status: "Confirmada" | "Pendiente" | "Atendida" | "Cancelada";
  note?: string;
};

export type PersonTaskEntry = {
  id: string;
  title: string;
  status: "Pendiente" | "En curso" | "Completada" | "Cancelada";
  priority: "Alta" | "Media" | "Baja";
};

export type PersonPaymentEntry = {
  id: string;
  service: string;
  amount: string;
  status: "Pagado" | "Pendiente";
  dueDate: string;
};

export type PersonHistoryEntry = {
  id: string;
  date: string;
  title: string;
  detail: string;
};

export type Person = {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  tipos: PersonType[];
  estado: PersonStatus;
  fecha_creacion: string;
  ultima_interaccion: string;
  observaciones_administrativas: string;
  fuente: string;
  responsable: string;
  etiquetas: string[];
  proxima_actividad: string;
  proxima_actividad_detalle: string;
  citas: {
    proximas: PersonAgendaEntry[];
    historial: PersonAgendaEntry[];
  };
  tareas: {
    pendientes: PersonTaskEntry[];
    completadas: PersonTaskEntry[];
  };
  finanzas: {
    pagadas: PersonPaymentEntry[];
    pendientes: PersonPaymentEntry[];
    servicios: string[];
  };
  historial: PersonHistoryEntry[];
};
