import { apiRequest } from "./apiClient";
import type { AdminUser } from "../modules/auth/AuthContext";

export interface CreateUserPayload {
  name: string;
  lastname: string;
  role: string;
  username: string;
  email?: string;
  password: string;
  display_label?: string;
  active?: boolean;
}

class UsersApiService {
  async list() { return apiRequest<AdminUser[]>("/users"); }
  async create(data: CreateUserPayload) { return apiRequest<AdminUser>("/users", { method: "POST", body: data }); }
  async update(id: string, data: Partial<AdminUser>) { return apiRequest<AdminUser>("/users/" + id, { method: "PATCH", body: data }); }
}

export const usersService = new UsersApiService();
