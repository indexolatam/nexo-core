export type TaskStatus = "Pendiente" | "En curso" | "Completada" | "Cancelada";
export type TaskPriority = "Alta" | "Media" | "Baja";
export type TaskType = "Administrativa" | "Seguimiento" | "Consulta" | "Marketing" | "Empresa" | "Taller" | "Personal";
export type TaskOwner = "Doctora" | "Asistente";
export type TaskFilter = "Todas" | "Mías" | "Asistente" | "Seguimientos" | "Vencidas" | "Completadas";
export type TaskRelationType = "Ninguno" | "Evento" | "Persona" | "Empresa" | "Taller" | "Otros";

export type Task = {
  id: string;
  title: string;
  description: string;
  responsible: TaskOwner;
  priority: TaskPriority;
  deadline: string;
  deadlineDate: string;
  status: TaskStatus;
  type: TaskType;
  relationType: TaskRelationType;
  relationLabel?: string;
  relationMeta?: string;
};

export const taskFilters: TaskFilter[] = ["Todas", "Mías", "Asistente", "Seguimientos", "Vencidas", "Completadas"];
export const taskTypes: TaskType[] = ["Administrativa", "Seguimiento", "Consulta", "Marketing", "Empresa", "Taller", "Personal"];
export const taskPriorities: TaskPriority[] = ["Alta", "Media", "Baja"];
export const TASK_BASE_DATE = new Date().toISOString().slice(0, 10);
