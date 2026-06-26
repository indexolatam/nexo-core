import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const { results } = await context.env.DB.prepare("SELECT * FROM blog_posts WHERE deleted_at IS NULL ORDER BY created_at DESC").all();
  return json(results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  await ensureAllSchemas(db);
  const body = await context.request.json();
  const id = `blog-${Date.now()}`;
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO blog_posts (id, title, content, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, body.title, body.content || null, body.status || "draft", now, now).run();
  const row = await db.prepare("SELECT * FROM blog_posts WHERE id = ?").bind(id).first();
  return json(row, 201);
}
