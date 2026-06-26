import { apiRequest } from "./apiClient";

export interface ServiceItem {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
  description?: string;
  category?: string;
  color?: string;
  [key: string]: unknown;
}

class ServicesApiService {
  async list() { return apiRequest<ServiceItem[]>("/services"); }
  async create(data: Partial<ServiceItem>) { return apiRequest<ServiceItem>("/services", { method: "POST", body: data }); }
  async update(id: string, data: Partial<ServiceItem>) { return apiRequest<ServiceItem>("/services/" + id, { method: "PATCH", body: data }); }
  async remove(id: string) { await apiRequest<null>("/services/" + id, { method: "DELETE" }); }
}

export const servicesService = new ServicesApiService();