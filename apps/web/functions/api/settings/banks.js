import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const { results } = await context.env.DB.prepare("SELECT * FROM bank_configs ORDER BY display_order ASC").all();
  return json(results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  await ensureAllSchemas(db);
  const body = await context.request.json();
  const id = `bnk-${Date.now()}`;
  await db.prepare(`
    INSERT INTO bank_configs (id, name, active, display_order)
    VALUES (?, ?, ?, ?)
  `).bind(id, body.name, body.active !== false ? 1 : 0, body.display_order || 1).run();
  const row = await db.prepare("SELECT * FROM bank_configs WHERE id = ?").bind(id).first();
  return json(row, 201);
}

export async function onRequestPatch(context) {
  await ensureAllSchemas(context.env.DB);
  const { searchParams } = new URL(context.request.url);
  const id = searchParams.get("id");
  if (!id) return error("id requerido");
  const body = await context.request.json();
  const sets = Object.keys(body).map(k => `${k} = ?`).join(", ");
  const values = Object.values(body);
  values.push(id);
  await context.env.DB.prepare(`UPDATE bank_configs SET ${sets} WHERE id = ?`).bind(...values).run();
  const row = await context.env.DB.prepare("SELECT * FROM bank_configs WHERE id = ?").bind(id).first();
  return json(row);
}
