import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";
import { getUserPermission } from "../../_core/permissions.js";

async function checkPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const perm = await getUserPermission(context.env.DB, user.role, "tareas");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

export async function onRequestGet(context) {
  const denied = await checkPermission(context, "read");
  if (denied) return denied;
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  const row = await context.env.DB.prepare("SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL").bind(id).first();
  if (!row) return error("No encontrado", 404);
  return json(row);
}

export async function onRequestPatch(context) {
  const denied = await checkPermission(context, "edit");
  if (denied) return denied;
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  const body = await context.request.json();
  const sets = Object.keys(body).map(k => `${k} = ?`).join(", ");
  const values = Object.values(body);
  values.push(id);
  await context.env.DB.prepare(`UPDATE tasks SET ${sets} WHERE id = ?`).bind(...values).run();
  const row = await context.env.DB.prepare("SELECT * FROM tasks WHERE id = ?").bind(id).first();
  return json(row);
}

export async function onRequestDelete(context) {
  const denied = await checkPermission(context, "delete");
  if (denied) return denied;
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  await context.env.DB.prepare("UPDATE tasks SET deleted_at = ? WHERE id = ?").bind(new Date().toISOString(), id).run();
  return json({ ok: true });
}
