import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const { status, assigned_user_id } = context.request.query || {};
  let sql = "SELECT * FROM tasks WHERE deleted_at IS NULL";
  const params = [];
  if (status) { sql += " AND status = ?"; params.push(status); }
  if (assigned_user_id) { sql += " AND assigned_user_id = ?"; params.push(assigned_user_id); }
  sql += " ORDER BY due_at ASC";
  const { results } = await context.env.DB.prepare(sql).bind(...params).all();
  return json(results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  await ensureAllSchemas(db);
  const body = await context.request.json();
  const id = `tsk-${Date.now()}`;
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, due_at, assigned_user_id, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, body.title, body.description || null, body.status || "Pendiente", body.priority || "Media", body.due_at || null, body.assigned_user_id || null, body.category || "Administrativa", now).run();
  const row = await db.prepare("SELECT * FROM tasks WHERE id = ?").bind(id).first();
  return json(row, 201);
}
