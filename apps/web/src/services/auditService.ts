import { apiRequest } from "./apiClient";

export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  event_type: string;
  user_label: string;
  user_id?: string;
  timestamp: string;
  detail?: string;
  old_value?: string;
  new_value?: string;
}

class AuditApiService {
  async list(params?: { entity_type?: string; entity_id?: string; limit?: number }): Promise<AuditLogEntry[]> {
    const searchParams = new URLSearchParams();
    if (params?.entity_type) searchParams.set("entity_type", params.entity_type);
    if (params?.entity_id) searchParams.set("entity_id", params.entity_id);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return apiRequest<AuditLogEntry[]>(`/audit${query ? `?${query}` : ""}`);
  }
}

export const auditService = new AuditApiService();