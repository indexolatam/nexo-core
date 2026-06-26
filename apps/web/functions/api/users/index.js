import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";
import { getUserPermission } from "../../_core/permissions.js";

async function checkConfigPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const db = context.env.DB;
  const perm = await getUserPermission(db, user.role, "configuracion");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

export async function onRequestGet(context) {
  const denied = await checkConfigPermission(context, "read");
  if (denied) return denied;

  const db = context.env.DB;
  await ensureAllSchemas(db);
  const { results } = await db.prepare("SELECT id, name, lastname, role, username, email, display_label, active FROM users WHERE deleted_at IS NULL ORDER BY name ASC").all();
  return json(results);
}

export async function onRequestPost(context) {
  const denied = await checkConfigPermission(context, "edit");
  if (denied) return denied;

  const db = context.env.DB;
  await ensureAllSchemas(db);

  let body = {};
  try { body = await context.request.json(); } catch { return error("JSON inválido", 400); }

  if (!body.name || !body.username) return error("name y username son requeridos", 400);

  const allowedRoles = ["admin", "doctor", "asistente"];
  const role = allowedRoles.includes(body.role) ? body.role : "admin";

  const id = `usr-${Date.now()}`;
  const now = new Date().toISOString();
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body.password || "changeme"))
    .then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join(""));
  await db.prepare(`
    INSERT INTO users (id, name, lastname, role, username, email, password_hash, display_label, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, body.name, body.lastname || "", role, body.username, body.email || null, hash, body.display_label || `${body.name} ${body.lastname || ""}`, body.active !== false ? 1 : 0, now).run();
  const row = await db.prepare("SELECT id, name, lastname, role, username, email, display_label, active FROM users WHERE id = ?").bind(id).first();
  return json(row, 201);
}
