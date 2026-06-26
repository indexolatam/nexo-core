import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  const row = await context.env.DB.prepare("SELECT * FROM finance_movements WHERE id = ?").bind(id).first();
  if (!row) return error("No encontrado", 404);
  return json(row);
}

export async function onRequestPatch(context) {
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
