import { apiRequest } from "./apiClient";

export interface BlogPost {
  id: string;
  title: string;
  content?: string;
  status: string;
  [key: string]: unknown;
}

class BlogApiService {
  async list() { return apiRequest<BlogPost[]>("/blog"); }
  async create(data: Partial<BlogPost>) { return apiRequest<BlogPost>("/blog", { method: "POST", body: data }); }
  async update(id: string, data: Partial<BlogPost>) { return apiRequest<BlogPost>("/blog/" + id, { method: "PATCH", body: data }); }
  async remove(id: string) { await apiRequest<null>("/blog/" + id, { method: "DELETE" }); }
}

export const blogService = new BlogApiService();
