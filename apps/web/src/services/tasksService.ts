import { apiRequest } from "./apiClient";

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  [key: string]: unknown;
}

class TasksApiService {
  async list() { return apiRequest<Task[]>("/tasks"); }
  async create(data: Partial<Task>) { return apiRequest<Task>("/tasks", { method: "POST", body: data }); }
  async update(id: string, data: Partial<Task>) { return apiRequest<Task>("/tasks/" + id, { method: "PATCH", body: data }); }
  async remove(id: string) { await apiRequest<null>("/tasks/" + id, { method: "DELETE" }); }
}

export const tasksService = new TasksApiService();
