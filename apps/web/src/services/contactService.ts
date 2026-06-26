import { apiRequest } from "./apiClient";

export type ContactRequestInput = {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message?: string;
};

export interface ContactService {
  submit(data: ContactRequestInput): Promise<{ id: string; status: string; created_at: string }>;
}

class ContactApiService implements ContactService {
  async submit(data: ContactRequestInput) {
    return apiRequest<{ id: string; status: string; created_at: string }>("/contact", { method: "POST", body: data });
  }
}

export const contactService: ContactService = new ContactApiService();
