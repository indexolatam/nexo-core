import { apiRequest } from "./apiClient";

export interface AgendaEvent {
  id: string;
  title: string;
  starts_at: string;
  ends_at?: string;
  status: string;
  [key: string]: unknown;
}

class AgendaApiService {
  async list() { return apiRequest<AgendaEvent[]>("/agenda"); }
  async create(data: Partial<AgendaEvent>) { return apiRequest<AgendaEvent>("/agenda", { method: "POST", body: data }); }
  async update(id: string, data: Partial<AgendaEvent>) { return apiRequest<AgendaEvent>("/agenda/" + id, { method: "PATCH", body: data }); }
}

export const agendaService = new AgendaApiService();
