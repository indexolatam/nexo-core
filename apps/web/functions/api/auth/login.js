import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestPost(context) {
  const db = context.env.DB;
  if (!db) return error("D1 no configurado", 500);
  await ensureAllSchemas(db);

  let body = {};
  try { body = await context.request.json(); } catch {}

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "").trim();

  if (!username || !password) return error("Usuario y contraseña requeridos", 400);

  const user = await db.prepare(
    "SELECT * FROM users WHERE (username = ? OR email = ?) AND deleted_at IS NULL AND active = 1"
  ).bind(username, username).first();

  if (!user) return error("Credenciales inválidas", 401);

  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))
    .then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join(""));

  if (user.password_hash !== hash) return error("Credenciales inválidas", 401);

  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const token = crypto.randomUUID();
  const sessionId = `sess-${Date.now()}`;

  await db.prepare(
    "INSERT INTO auth_sessions (id, user_id, token, created_at, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    sessionId, user.id, token, now, expiresAt,
    context.request.headers.get("CF-Connecting-IP") || context.request.headers.get("x-forwarded-for") || null,
    context.request.headers.get("user-agent") || null
  ).run();

  await db.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").bind(now, user.id).run();

  return json({
    user: { id: user.id, name: user.name, lastname: user.lastname, role: user.role, username: user.username, email: user.email, display_label: user.display_label },
    token,
  });
}