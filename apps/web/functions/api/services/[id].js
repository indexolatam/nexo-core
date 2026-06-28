import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";
import { getUserPermission } from "../../_core/permissions.js";

async function checkPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const perm = await getUserPermission(context.env.DB, user.role, "configuracion");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

const ALLOWED_COLUMNS = [
  "services_name", "services_category", "services_duration",
  "services_duration_unit", "services_price", "services_currency",
  "services_participants", "services_description",
  "services_landing_visible", "services_landing_title",
  "services_landing_paragraph", "services_landing_image",
  "services_landing_icon", "services_landing_order",
  "services_landing_cta", "services_active",
  "services_updated_by"
];

export async function onRequestPatch(context) {
  const denied = await checkPermission(context, "edit");
  if (denied) return denied;
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  const body = await context.request.json();
  const safeKeys = Object.keys(body).filter((k) => ALLOWED_COLUMNS.includes(k) && body[k] !== undefined);
  if (safeKeys.length === 0) return json({ ok: true });
  safeKeys.push("services_updated_at");
  const sets = safeKeys.map((k) => `${k} = ?`).join(", ");
  const values = safeKeys.map((k) => {
    if (k === "services_participants" && Array.isArray(body[k])) return JSON.stringify(body[k]);
    if (k === "services_landing_visible" || k === "services_active") return body[k] ? 1 : 0;
    if (k === "services_updated_at") return new Date().toISOString();
    return body[k];
  });
  values.push(id);
  await context.env.DB.prepare(`UPDATE services SET ${sets} WHERE services_id = ?`).bind(...values).run();
  const row = await context.env.DB.prepare("SELECT * FROM services WHERE services_id = ?").bind(id).first();
  if (!row) return error("No encontrado", 404);
  if (row.services_participants && typeof row.services_participants === "string") { try { row.services_participants = JSON.parse(row.services_participants); } catch { row.services_participants = [{ count: 1, label: "Individual", price: 0 }]; } }
  return json(row);
}

export async function onRequestDelete(context) {
  const denied = await checkPermission(context, "delete");
  if (denied) return denied;
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  await context.env.DB.prepare("UPDATE services SET services_deleted_at = ? WHERE services_id = ?").bind(new Date().toISOString(), id).run();
  return json({ ok: true });
}
