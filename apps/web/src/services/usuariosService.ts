import { apiRequest } from "./apiClient";
import type { User, CreateUserInput, UpdateUserInput } from "../types/adminUsers";

class UsuariosApiService {
  async list(options?: { showInactive?: boolean; showArchived?: boolean }) {
    const params = new URLSearchParams();
    if (options?.showInactive) params.set("showInactive", "true");
    if (options?.showArchived) params.set("showArchived", "true");
    const qs = params.toString();
    return apiRequest<User[]>("/usuarios" + (qs ? `?${qs}` : ""));
  }
  async getById(id: string) { return apiRequest<User | null>("/usuarios/" + id); }
  async create(data: CreateUserInput) { return apiRequest<User>("/usuarios", { method: "POST", body: data }); }
  async update(id: string, data: UpdateUserInput) { return apiRequest<User>("/usuarios/" + id, { method: "PATCH", body: data }); }
  async remove(id: string) { await apiRequest<null>("/usuarios/" + id, { method: "DELETE" }); }
}

export const usuariosService = new UsuariosApiService();
