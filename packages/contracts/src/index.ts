export type ApiResponse<T> = { data: T };
export type ApiError = { error: { code: string; message: string; details?: unknown[] } };
export type PaginationParams = { page?: number; limit?: number; search?: string; sort?: string; order?: "asc" | "desc" };
export type PaginatedResponse<T> = { data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } };

export type TenantStatus = "active" | "trial" | "suspended";
export type TenantPlan = "basico" | "profesional" | "premium";
export type SystemUserRole = "root" | "admin" | "doctor" | "asistente" | "colaborador";

export type Person = {
  user_id: string; user_name_1: string; user_name_2: string | null; user_lastname_1: string; user_lastname_2: string | null;
  user_phone: string; user_email: string | null; user_status: string; user_created_at: string; user_types: string;
};

export type AuditEventType = "created" | "updated" | "deleted" | "paid" | "canceled" | "login" | "logout";

export {
  loginSchema,
  createPersonSchema,
  updatePersonSchema,
  PERSON_UPDATE_WHITELIST,
} from "./schemas/index.js";
