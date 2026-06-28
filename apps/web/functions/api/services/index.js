import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const isAdmin = Boolean(context.data?.user);
  const sql = isAdmin
    ? "SELECT * FROM services WHERE services_deleted_at IS NULL ORDER BY services_name ASC"
    : "SELECT * FROM services WHERE services_deleted_at IS NULL AND services_landing_visible = 1 ORDER BY services_name ASC";
  const { results } = await context.env.DB.prepare(sql).all();
  return json(results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  await ensureAllSchemas(db);
  const body = await context.request.json();
  const id = `svc-${Date.now()}`;
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO services (
      services_id, services_name, services_category,
      services_duration, services_duration_unit, services_price, services_currency,
      services_participants, services_description,
      services_landing_visible, services_landing_title, services_landing_paragraph,
      services_landing_image, services_landing_icon, services_landing_order,
      services_landing_cta, services_active, services_created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.services_name || body.name,
    body.services_category || body.category || 'General',
    body.services_duration || body.duration || 60,
    body.services_duration_unit || 'minutes',
    body.services_price || body.price || 0,
    body.services_currency || 'USD',
    body.services_participants || '[{"count":1,"label":"Individual","price":0}]',
    body.services_description || body.description || null,
    body.services_landing_visible ?? 0,
    body.services_landing_title || null,
    body.services_landing_paragraph || null,
    body.services_landing_image || null,
    body.services_landing_icon || null,
    body.services_landing_order || 0,
    body.services_landing_cta || 'Consultar',
    body.services_active !== false ? 1 : 0,
    now
  ).run();
  const row = await db.prepare("SELECT * FROM services WHERE services_id = ?").bind(id).first();
  return json(row, 201);
}
