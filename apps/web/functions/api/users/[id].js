import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";
import { getUserPermission } from "../../_core/permissions.js";

const ALLOWED_COLUMNS = ["name", "lastname", "email", "display_label", "active", "password"];

async function checkConfigPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const db = context.env.DB;
  const perm = await getUserPermission(db, user.role, "configuracion");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

export async function onRequestPatch(context) {
  const denied = await checkConfigPermission(context, "edit");
  if (denied) return denied;

  const db = context.env.DB;
  await ensureAllSchemas(db);
  const { id } = context.params;

  let body = {};
  try { body = await context.request.json(); } catch { return error("JSON inválido", 400); }

  const allowed = Object.keys(body).filter((k) => ALLOWED_COLUMNS.includes(k));
  if (allowed.length === 0) return error("Sin campos válidos para actualizar", 400);

  const sets = [];
  const values = [];
  for (const key of allowed) {
    if (key === "password") {
      const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body.password))
        .then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join(""));
      sets.push("password_hash = ?");
      values.push(hash);
    } else {
      sets.push(`${key} = ?`);
      values.push(body[key]);
    }
  }

  values.push(id);
  await db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).bind(...values).run();
  const row = await db.prepare("SELECT id, name, lastname, role, username, email, display_label, active FROM users WHERE id = ?").bind(id).first();
  if (!row) return error("No encontrado", 404);
  return json(row);
}
