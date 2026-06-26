import { apiRequest } from "./apiClient";

export interface FinanceMovement {
  id: string;
  monto: number;
  metodo_pago: string;
  estado: string;
  fecha: string;
  [key: string]: unknown;
}

class FinanceApiService {
  async list() { return apiRequest<FinanceMovement[]>("/finance"); }
  async create(data: Partial<FinanceMovement>) { return apiRequest<FinanceMovement>("/finance", { method: "POST", body: data }); }
  async update(id: string, data: Partial<FinanceMovement>) { return apiRequest<FinanceMovement>(`/finance/${id}`, { method: "PATCH", body: data }); }
}

export const financeService = new FinanceApiService();
