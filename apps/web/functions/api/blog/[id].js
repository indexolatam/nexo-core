import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";
import { getUserPermission } from "../../_core/permissions.js";

async function checkPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const perm = await getUserPermission(context.env.DB, user.role, "blog");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
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
  await context.env.DB.prepare(`UPDATE blog_posts SET ${sets}, updated_at = ? WHERE id = ?`).bind(...values, new Date().toISOString()).run();
  const row = await context.env.DB.prepare("SELECT * FROM blog_posts WHERE id = ?").bind(id).first();
  if (!row) return error("No encontrado", 404);
  // TODO: parse JSON columns with parseJsonArray() from db.js if added in the future
  return json(row);
}

export async function onRequestDelete(context) {
  const denied = await checkPermission(context, "delete");
  if (denied) return denied;
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  await context.env.DB.prepare("UPDATE blog_posts SET deleted_at = ? WHERE id = ?").bind(new Date().toISOString(), id).run();
  return json({ ok: true });
}
