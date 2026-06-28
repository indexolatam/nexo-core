import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";
import { getUserPermission } from "../../_core/permissions.js";

async function checkPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const perm = await getUserPermission(context.env.DB, user.role, "finanzas");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

export async function onRequestGet(context) {
  const denied = await checkPermission(context, "read");
  if (denied) return denied;
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  const row = await context.env.DB.prepare("SELECT * FROM finance_movements WHERE id = ?").bind(id).first();
  if (!row) return error("No encontrado", 404);
  // TODO: parse JSON columns with parseJsonArray() from db.js if added in the future
  return json(row);
}

export async function onRequestPatch(context) {
  const denied = await checkPermission(context, "edit");
  if (denied) return denied;
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  const body = await context.request.json();

  const normalized = { ...body };
  if (normalized.banco !== undefined && normalized.banco_id === undefined) {
    normalized.banco_id = normalized.banco;
  }
  if (normalized.observaciones !== undefined && normalized.notes === undefined) {
    normalized.notes = normalized.observaciones;
  }
  delete normalized.banco;
  delete normalized.observaciones;

  const sets = Object.keys(normalized).map(k => `${k} = ?`).join(", ");
  const values = Object.values(normalized);
  values.push(id);
  await context.env.DB.prepare(`UPDATE finance_movements SET ${sets} WHERE id = ?`).bind(...values).run();
  const row = await context.env.DB.prepare("SELECT * FROM finance_movements WHERE id = ?").bind(id).first();
  return json(row);
}
