import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestPatch(context) {
  await ensureAllSchemas(context.env.DB);
  const { id } = context.params;
  const body = await context.request.json();
  if (body.password) {
    body.password_hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body.password))
      .then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join(""));
    delete body.password;
  }
  const sets = Object.keys(body).map(k => `${k} = ?`).join(", ");
  const values = Object.values(body);
  values.push(id);
  await context.env.DB.prepare(`UPDATE users SET ${sets} WHERE id = ?`).bind(...values).run();
  const row = await context.env.DB.prepare("SELECT id, name, lastname, role, username, email, display_label, active FROM users WHERE id = ?").bind(id).first();
  if (!row) return error("No encontrado", 404);
  return json(row);
}
