import type { ExecutionContext, Handler } from "../../types.js";
import { json, error } from "../../infrastructure/http/response.js";
import { generateId } from "../../infrastructure/db/helpers.js";
import { logAuditEvent } from "../../infrastructure/db/audit.js";
import { createPersonSchema, updatePersonSchema } from "@nexo-core/contracts";

const PERSON_UPDATE_FIELDS = [
  "user_name_1","user_name_2","user_lastname_1","user_lastname_2",
  "user_phone_code","user_phone","user_email","user_status","user_source",
  "user_address","user_birth_date","user_gender","user_doc_id","user_notes",
  "user_types","user_tags","user_admin_notes","user_assigned_to","user_consent",
] as const;

function getPersonId(ctx: ExecutionContext): string | null {
  const parts = new URL(ctx.request.url).pathname.split("/").filter(Boolean);
  return parts.length >= 3 && parts[0] === "api" && parts[1] === "personas" ? parts[2] : null;
}

export const listPersonsHandler: Handler = async (ctx) => {
  const url = new URL(ctx.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "20"));
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const offset = (page - 1) * limit;

  let where = "WHERE user_deleted_at IS NULL";
  const params: any[] = [];
  if (search) {
    where += " AND (user_name_1 LIKE ? OR user_lastname_1 LIKE ? OR user_email LIKE ? OR user_phone LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (status) { where += " AND user_status = ?"; params.push(status); }

  const count = await ctx.tenant.database.prepare(`SELECT COUNT(*) as total FROM usuarios ${where}`).bind(...params).first<{ total: number }>();
  const results = await ctx.tenant.database
    .prepare(`SELECT user_id, user_name_1, user_name_2, user_lastname_1, user_lastname_2, user_phone, user_email, user_status, user_types, user_created_at FROM usuarios ${where} ORDER BY user_created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset).all();

  return json({ data: results.results || [], pagination: { page, limit, total: count?.total || 0, totalPages: Math.ceil((count?.total || 0) / limit) } });
};

export const getPersonHandler: Handler = async (ctx) => {
  const id = getPersonId(ctx);
  if (!id) return error("ID requerido", 400);
  const person = await ctx.tenant.database.prepare("SELECT * FROM usuarios WHERE user_id = ? AND user_deleted_at IS NULL").bind(id).first();
  return person ? json(person) : error("No encontrada", 404);
};

export const createPersonHandler: Handler = async (ctx) => {
  if (!ctx.user?.permissions.includes("personas:create")) return error("Sin permisos", 403);
  const body: unknown = await ctx.request.json().catch(() => null);
  const parsed = createPersonSchema.safeParse(body);
  if (!parsed.success) return error("Datos inválidos", 422, "VALIDATION_ERROR");
  const data = parsed.data;

  const id = generateId("per");
  await ctx.tenant.database.prepare(
    `INSERT INTO usuarios (user_id, user_name_1, user_name_2, user_lastname_1, user_lastname_2, user_phone_code, user_phone, user_email, user_status, user_types, user_tags, user_created_date, user_created_at, user_created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), datetime('now'), ?)`
  ).bind(id, data.user_name_1, data.user_name_2 || null, data.user_lastname_1, data.user_lastname_2 || null, data.user_phone_code || "505", data.user_phone, data.user_email || null, data.user_status || "Pendiente", JSON.stringify(data.user_types || []), JSON.stringify(data.user_tags || []), ctx.user.userId).run();

  const created = await ctx.tenant.database.prepare("SELECT * FROM usuarios WHERE user_id = ?").bind(id).first();
  await logAuditEvent(ctx.tenant.auditDatabase, { entityType: "usuarios", entityId: id, eventType: "created", userId: ctx.user.userId, userLabel: `${ctx.user.name} ${ctx.user.lastname}` });
  return json(created, 201);
};

export const updatePersonHandler: Handler = async (ctx) => {
  if (!ctx.user?.permissions.includes("personas:edit")) return error("Sin permisos", 403);
  const id = getPersonId(ctx);
  if (!id) return error("ID requerido", 400);
  const body: unknown = await ctx.request.json().catch(() => null);
  const parsed = updatePersonSchema.safeParse(body);
  if (!parsed.success) return error("Datos inválidos", 422, "VALIDATION_ERROR");
  const bodyData = parsed.data as Record<string, unknown>;

  const current = await ctx.tenant.database.prepare("SELECT * FROM usuarios WHERE user_id = ? AND user_deleted_at IS NULL").bind(id).first();
  if (!current) return error("No encontrada", 404);

  const updates: Record<string, any> = {};
  for (const key of PERSON_UPDATE_FIELDS) { if (key in bodyData) updates[key] = bodyData[key]; }
  if (!Object.keys(updates).length) return error("Sin cambios", 400);

  updates.user_updated_at = new Date().toISOString();
  updates.user_updated_by = ctx.user.userId;
  const setSql = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
  await ctx.tenant.database.prepare(`UPDATE usuarios SET ${setSql} WHERE user_id = ?`).bind(...Object.values(updates), id).run();

  const updated = await ctx.tenant.database.prepare("SELECT * FROM usuarios WHERE user_id = ?").bind(id).first();
  await logAuditEvent(ctx.tenant.auditDatabase, { entityType: "usuarios", entityId: id, eventType: "updated", userId: ctx.user.userId, userLabel: `${ctx.user.name} ${ctx.user.lastname}` });
  return json(updated);
};

export const deletePersonHandler: Handler = async (ctx) => {
  if (!ctx.user?.permissions.includes("personas:delete")) return error("Sin permisos", 403);
  const id = getPersonId(ctx);
  if (!id) return error("ID requerido", 400);
  const current = await ctx.tenant.database.prepare("SELECT user_id FROM usuarios WHERE user_id = ? AND user_deleted_at IS NULL").bind(id).first();
  if (!current) return error("No encontrada", 404);

  await ctx.tenant.database.prepare("UPDATE usuarios SET user_deleted_at = datetime('now'), user_updated_by = ? WHERE user_id = ?").bind(ctx.user.userId, id).run();
  await logAuditEvent(ctx.tenant.auditDatabase, { entityType: "usuarios", entityId: id, eventType: "deleted", userId: ctx.user.userId, userLabel: `${ctx.user.name} ${ctx.user.lastname}` });
  return json({ success: true });
};
