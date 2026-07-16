import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { apiRequest } from "../../services/apiClient.js";

type User = { id: string; name: string; lastname: string; role: string; username: string; email: string; display_label: string | null };
type AuthCtx = { user: User | null; token: string | null; loading: boolean; isAuthenticated: boolean; login: (u: string, p: string) => Promise<void>; logout: () => void };

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => { try { return JSON.parse(localStorage.getItem("nexo-admin-user") || "null"); } catch { return null; } });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("nexo-admin-token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && !user) {
      apiRequest<{ user: User }>("/auth/session")
        .then((r) => { setUser(r.user); localStorage.setItem("nexo-admin-user", JSON.stringify(r.user)); })
        .catch(() => { localStorage.removeItem("nexo-admin-token"); localStorage.removeItem("nexo-admin-user"); setToken(null); setUser(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await apiRequest<{ user: User; token: string }>("/auth/login", { method: "POST", body: { username, password } });
    localStorage.setItem("nexo-admin-token", res.token);
    localStorage.setItem("nexo-admin-user", JSON.stringify(res.user));
    setToken(res.token); setUser(res.user);
  };

  const logout = () => {
    apiRequest("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("nexo-admin-token"); localStorage.removeItem("nexo-admin-user");
    setToken(null); setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, isAuthenticated: Boolean(user) && Boolean(token), login, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
}
