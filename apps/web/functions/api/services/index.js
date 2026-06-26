import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const isAdmin = Boolean(context.data?.user);
  const sql = isAdmin
    ? "SELECT * FROM services WHERE deleted_at IS NULL ORDER BY name ASC"
    : "SELECT * FROM services WHERE deleted_at IS NULL AND landing_visible = 1 ORDER BY name ASC";
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
    INSERT INTO services (id, name, duration, price, description, category, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, body.name, body.duration || 60, body.price || 0, body.description || null, body.category || null, body.active !== false ? 1 : 0, now).run();
  const row = await db.prepare("SELECT * FROM services WHERE id = ?").bind(id).first();
  return json(row, 201);
}
