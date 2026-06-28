import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

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
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  const body = await context.request.json();
  const safeKeys = Object.keys(body).filter((k) => ALLOWED_COLUMNS.includes(k));
  if (safeKeys.length === 0) return json({ ok: true });
  if (body.services_updated_at === undefined) safeKeys.push("services_updated_at");
  const sets = safeKeys.map((k) => `${k} = ?`).join(", ");
  const values = safeKeys.map((k) => body[k]);
  if (body.services_updated_at === undefined) values.push(new Date().toISOString());
  values.push(id);
  await context.env.DB.prepare(`UPDATE services SET ${sets} WHERE services_id = ?`).bind(...values).run();
  const row = await context.env.DB.prepare("SELECT * FROM services WHERE services_id = ?").bind(id).first();
  if (!row) return error("No encontrado", 404);
  return json(row);
}

export async function onRequestDelete(context) {
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  await context.env.DB.prepare("UPDATE services SET services_deleted_at = ? WHERE services_id = ?").bind(new Date().toISOString(), id).run();
  return json({ ok: true });
}
