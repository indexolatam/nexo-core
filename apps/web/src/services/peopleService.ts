import { apiRequest } from "./apiClient";
import type { Person } from "../types/adminPeople";

class PeopleApiService {
  async list() { return apiRequest<Person[]>("/people"); }
  async getById(id: string) { return apiRequest<Person | null>("/people/" + id); }
  async create(data: Record<string, unknown>) { return apiRequest<Person>("/people", { method: "POST", body: data }); }
  async update(id: string, data: Record<string, unknown>) { return apiRequest<Person>("/people/" + id, { method: "PATCH", body: data }); }
  async remove(id: string) { await apiRequest<null>("/people/" + id, { method: "DELETE" }); }
}

export const peopleService = new PeopleApiService();