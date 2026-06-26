import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestPatch(context) {
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  const body = await context.request.json();
  const sets = Object.keys(body).map(k => `${k} = ?`).join(", ");
  const values = Object.values(body);
  values.push(id);
  await context.env.DB.prepare(`UPDATE agenda_events SET ${sets} WHERE id = ?`).bind(...values).run();
  const row = await context.env.DB.prepare("SELECT * FROM agenda_events WHERE id = ?").bind(id).first();
  if (!row) return error("No encontrado", 404);
  return json(row);
}
