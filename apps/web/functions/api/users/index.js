import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const { results } = await context.env.DB.prepare("SELECT id, name, lastname, role, username, email, display_label, active FROM users WHERE deleted_at IS NULL ORDER BY name ASC").all();
  return json(results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  await ensureAllSchemas(db);
  const body = await context.request.json();
  const id = `usr-${Date.now()}`;
  const now = new Date().toISOString();
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body.password || "changeme"))
    .then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join(""));
  await db.prepare(`
    INSERT INTO users (id, name, lastname, role, username, email, password_hash, display_label, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, body.name, body.lastname, body.role || "admin", body.username, body.email || null, hash, body.display_label || `${body.name} ${body.lastname}`, body.active !== false ? 1 : 0, now).run();
  const row = await db.prepare("SELECT id, name, lastname, role, username, email, display_label, active FROM users WHERE id = ?").bind(id).first();
  return json(row, 201);
}
