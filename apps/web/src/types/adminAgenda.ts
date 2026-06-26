export type AgendaView = "Hoy" | "Semana" | "Mes";
export type AgendaFilter = "Todos" | "Consultas" | "Administración" | "Marketing" | "Empresas" | "Talleres" | "Personal";
export type AgendaTone = "correcto" | "atencion" | "neutro";
export type AgendaStatus = "Pendiente" | "Confirmado" | "Completado" | "Cancelado" | "Reprogramado" | "En curso";
export type AgendaOwner = "Doctora" | "Asistente";

export type AgendaLocationType = "remoto" | "en_clinica" | "en_campo";

export type AgendaEvent = {
  id: string;
  day: string;
  date: number;
  time: string;
  title: string;
  meta: string;
  filter: Exclude<AgendaFilter, "Todos">;
  tone: AgendaTone;
  status: AgendaStatus;
  owner: AgendaOwner;
  person?: string;
  isRecurring?: boolean;
  locationType: AgendaLocationType;
  tiempoPrevioMinutes?: number;
  tiempoPosteriorMinutes?: number;
  locationDepartment?: string;
  locationReference?: string;
  meetingUrl?: string;
};

export const agendaViews: AgendaView[] = ["Hoy", "Semana", "Mes"];
export const agendaFilters: AgendaFilter[] = ["Todos", "Consultas", "Administración", "Marketing", "Empresas", "Talleres", "Personal"];
export const agendaWeekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export const agendaLocationTypes: AgendaLocationType[] = ["en_clinica", "remoto", "en_campo"];
export const agendaLocationLabels: Record<AgendaLocationType, string> = {
  en_clinica: "En clínica",
  remoto: "Remoto",
  en_campo: "En campo / Domicilio",
};
export const agendaLocationIcons: Record<AgendaLocationType, string> = {
  en_clinica: "🏥",
  remoto: "💻",
  en_campo: "🚗",
};