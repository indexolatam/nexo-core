import { apiRequest } from "./apiClient";
import type { ModulePermissionsByRole } from "../types/adminSettings";

class PermissionsApiService {
  async list() { return apiRequest<ModulePermissionsByRole>("/settings/permissions"); }
  async update(permissions: ModulePermissionsByRole) { return apiRequest<{ updated: number }>("/settings/permissions", { method: "PUT", body: { permissions } }); }
}

export const permissionsService = new PermissionsApiService();
