import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { CLIENT } from "../../config/client";

export interface AdminUser {
  id: string;
  name: string;
  lastname: string;
  role: string;
  username: string;
  email: string;
  display_label: string;
}

interface AuthResponse {
  user: AdminUser;
  token: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = `${CLIENT.id}-admin-session`;
const TOKEN_KEY = `${CLIENT.id}-admin-token`;

const API_BASE = "/api";

function getStoredUser(): AdminUser | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(getStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token && !getStoredUser()) {
      fetch(`${API_BASE}/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then((payload) => { setUser(payload.data); })
        .catch(() => { clearToken(); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(user) && !loading,
    user,
    login: async (username: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err ? JSON.parse(err).error : "Credenciales inválidas");
      }
      const payload: { data: AuthResponse } = await res.json();
      storeToken(payload.data.token);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload.data.user));
      setUser(payload.data.user);
    },
    logout: () => { clearToken(); setUser(null); },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
