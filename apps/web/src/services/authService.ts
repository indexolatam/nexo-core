import { apiRequest } from "./apiClient";
import type { AdminUser } from "../modules/auth/AuthContext";

interface AuthResponse {
  user: AdminUser;
  token: string;
}

class AuthApiService {
  async login(username: string, password: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/login", { method: "POST", body: { username, password } });
  }

  async logout(): Promise<void> {
    await apiRequest<null>("/auth/logout", { method: "POST" });
  }

  async validateToken(token: string): Promise<AdminUser> {
    return apiRequest<AdminUser>("/auth/validate", { method: "GET", headers: { Authorization: `Bearer ${token}` } });
  }
}

export const authService = new AuthApiService();
