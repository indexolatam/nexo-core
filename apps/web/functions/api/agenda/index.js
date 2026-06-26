import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const { results } = await context.env.DB.prepare("SELECT * FROM agenda_events ORDER BY starts_at DESC").all();
  return json(results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  await ensureAllSchemas(db);
  const body = await context.request.json();
  const id = `evt-${Date.now()}`;
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO agenda_events (id, title, category, status, starts_at, ends_at, location_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, body.title, body.category || "general", body.status || "Pendiente", body.starts_at, body.ends_at || null, body.location_type || "en_clinica", now).run();
  const row = await db.prepare("SELECT * FROM agenda_events WHERE id = ?").bind(id).first();
  return json(row, 201);
}
