import { CLIENT } from "../config/client";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

const TOKEN_KEY = `${CLIENT.id}-admin-token`;

function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) {
    const bodyText = await response.text();
    let message = `Error API ${response.status}`;
    try { const errorBody = JSON.parse(bodyText); message = errorBody.error || message; } catch { if (bodyText) message = bodyText; }
    throw new Error(message);
  }
  const payload = await response.json() as { data: T };
  return payload.data;
}
