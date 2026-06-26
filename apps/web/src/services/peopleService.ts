import { apiRequest } from "./apiClient";
import type { Person, PersonType, PersonStatus } from "../types/adminPeople";

export interface CreatePersonInput {
  nombre: string;
  telefono: string;
  email?: string;
  tipos: PersonType[];
  estado: PersonStatus;
  fecha_creacion: string;
  ultima_interaccion: string;
  observaciones_administrativas?: string;
  fuente?: string;
  responsable?: string;
  etiquetas?: string[];
  proxima_actividad?: string;
  proxima_actividad_detalle?: string;
  citas?: Person["citas"];
  tareas?: Person["tareas"];
  finanzas?: Person["finanzas"];
  historial?: Person["historial"];
}

export type UpdatePersonInput = Partial<CreatePersonInput>;

class PeopleApiService {
  async list() { return apiRequest<Person[]>("/people"); }
  async getById(id: string) { return apiRequest<Person | null>("/people/" + id); }
  async create(data: CreatePersonInput) { return apiRequest<Person>("/people", { method: "POST", body: data }); }
  async update(id: string, data: UpdatePersonInput) { return apiRequest<Person>("/people/" + id, { method: "PATCH", body: data }); }
  async remove(id: string) { await apiRequest<null>("/people/" + id, { method: "DELETE" }); }
}

export const peopleService = new PeopleApiService();