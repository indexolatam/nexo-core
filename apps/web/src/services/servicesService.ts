import { apiRequest } from "./apiClient";

export interface ServiceItem {
  services_id: string;
  services_name: string;
  services_duration: number;
  services_price: number;
  services_active: boolean;
  services_description?: string;
  services_category?: string;
  services_landing_visible?: boolean;
  services_landing_paragraph?: string;
  services_landing_image?: string;
  services_landing_icon?: string;
  services_landing_order?: number;
  services_landing_cta?: string;
  [key: string]: unknown;
}

class ServicesApiService {
  async list() { return apiRequest<ServiceItem[]>("/services"); }
  async create(data: Partial<ServiceItem>) { return apiRequest<ServiceItem>("/services", { method: "POST", body: data }); }
  async update(id: string, data: Partial<ServiceItem>) { return apiRequest<ServiceItem>("/services/" + id, { method: "PATCH", body: data }); }
  async remove(id: string) { await apiRequest<null>("/services/" + id, { method: "DELETE" }); }
}

export const servicesService = new ServicesApiService();
