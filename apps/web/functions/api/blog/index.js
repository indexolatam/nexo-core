import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";
import { getUserPermission } from "../../_core/permissions.js";

async function checkPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const perm = await getUserPermission(context.env.DB, user.role, "blog");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const isAdmin = Boolean(context.data?.user);
  const sql = isAdmin
    ? "SELECT * FROM blog_posts WHERE deleted_at IS NULL ORDER BY created_at DESC"
    : "SELECT * FROM blog_posts WHERE deleted_at IS NULL AND status = 'Publicado' ORDER BY created_at DESC";
  const { results } = await context.env.DB.prepare(sql).all();
  // TODO: parse JSON columns with parseJsonArray() from db.js if added in the future
  return json(results);
}

export async function onRequestPost(context) {
  const denied = await checkPermission(context, "create");
  if (denied) return denied;
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
