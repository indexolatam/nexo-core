const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("nexo-admin-token");
}

export async function apiRequest<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!res.ok) {
    const text = await res.text();
    try { throw new Error(JSON.parse(text).error?.message || text); } catch (e) { if (e instanceof Error) throw e; throw new Error(text); }
  }

  return (await res.json()).data;
}
