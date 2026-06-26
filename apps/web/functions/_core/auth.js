import { ensureAllSchemas } from "./db.js";

export async function getUserFromToken(db, token) {
  await ensureAllSchemas(db);
  const session = await db.prepare(
    "SELECT user_id FROM auth_sessions WHERE token = ? AND expires_at > datetime('now')"
  ).bind(token).first();
  if (!session) return null;
  const user = await db.prepare("SELECT id, name, lastname, role, username, email, display_label FROM users WHERE id = ? AND active = 1 AND deleted_at IS NULL").bind(session.user_id).first();
  if (!user) return null;
  return user;
}

export function requireAuth(context) {
  const authHeader = context.request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}