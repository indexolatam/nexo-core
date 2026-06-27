import { json, error } from "../../_core/response.js";
import { ensureAllSchemas, mapUserRow, fetchRelatedData } from "../../_core/db.js";
import { getUserPermission } from "../../_core/permissions.js";

async function checkPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const db = context.env.DB;
  const perm = await getUserPermission(db, user.role, "usuarios");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

function buildOwnershipFilter(user) {
  if (user.role === "root" || user.role === "admin") return { sql: "", params: [] };
  return { sql: "AND user_assigned_to = ?", params: [user.id] };
}

function parseName(fullName) {
  if (!fullName) return { user_name_1: null, user_name_2: null, user_lastname_1: null, user_lastname_2: null };
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  return {
    user_name_1: parts[0] || null,
    user_name_2: parts.length > 3 ? parts[1] : null,
    user_lastname_1: parts.length >= 3 ? parts.slice(2).join(" ") : parts[1] || null,
    user_lastname_2: parts.length > 4 ? parts[parts.length - 1] : null,
  };
}

export async function onRequestGet(context) {
  const denied = await checkPermission(context, "read");
  if (denied) return denied;

  const db = context.env.DB;
  await ensureAllSchemas(db);

  const user = context.data.user;
  const ownershipFilter = buildOwnershipFilter(user);
  const row = await db.prepare(`SELECT * FROM usuarios WHERE user_id = ? AND user_deleted_at IS NULL${ownershipFilter.sql}`).bind(context.params.id, ...ownershipFilter.params).first();
  if (!row) return json(null);
  const relatedData = await fetchRelatedData(db, row.user_id);
  return json(mapUserRow(row, relatedData));
}

export async function onRequestPatch(context) {
  const denied = await checkPermission(context, "edit");
  if (denied) return denied;

  const db = context.env.DB;
  await ensureAllSchemas(db);

  const user = context.data.user;
  const ownershipFilter = buildOwnershipFilter(user);
  const existing = await db.prepare(`SELECT user_id FROM usuarios WHERE user_id = ? AND user_deleted_at IS NULL${ownershipFilter.sql}`).bind(context.params.id, ...ownershipFilter.params).first();
  if (!existing) return error("Usuario no encontrado o sin acceso", 404);

  let body = {};
  try { body = await context.request.json(); } catch { return error("JSON inválido", 400); }

  const now = new Date().toISOString();
  const { user_name_1, user_name_2, user_lastname_1, user_lastname_2 } = parseName(body.user_name);

  await db.prepare(
    `UPDATE usuarios SET
     user_name_1 = COALESCE(?, user_name_1), user_name_2 = COALESCE(?, user_name_2),
     user_lastname_1 = COALESCE(?, user_lastname_1), user_lastname_2 = COALESCE(?, user_lastname_2),
     user_phone = COALESCE(?, user_phone), user_email = COALESCE(?, user_email),
     user_status = COALESCE(?, user_status), user_source = COALESCE(?, user_source),
     user_last_interaction = COALESCE(?, user_last_interaction),
     user_next_activity = COALESCE(?, user_next_activity),
     user_next_activity_detail = COALESCE(?, user_next_activity_detail),
     user_types = COALESCE(?, user_types), user_tags = COALESCE(?, user_tags),
     user_admin_notes = COALESCE(?, user_admin_notes),
     user_assigned_to = COALESCE(?, user_assigned_to),
     user_address = COALESCE(?, user_address),
     user_birth_date = COALESCE(?, user_birth_date),
     user_gender = COALESCE(?, user_gender),
     user_doc_id = COALESCE(?, user_doc_id),
     user_photo_url = COALESCE(?, user_photo_url),
     user_notes = COALESCE(?, user_notes),
     user_contact_pref = COALESCE(?, user_contact_pref), user_updated_at = ?
     WHERE user_id = ?`
  ).bind(
    user_name_1, user_name_2, user_lastname_1, user_lastname_2,
    body.user_phone ?? null, body.user_email ?? null, body.user_status ?? null, body.user_source ?? null,
    body.user_last_interaction ?? null, body.user_next_activity ?? null, body.user_next_activity_detail ?? null,
    body.user_types ? JSON.stringify(body.user_types) : null, body.user_tags ? JSON.stringify(body.user_tags) : null,
    body.user_admin_notes ?? null,
    body.user_assigned_to ?? null,
    body.user_address ?? null, body.user_birth_date ?? null,
    body.user_gender ?? null, body.user_doc_id ?? null,
    body.user_photo_url ?? null, body.user_notes ?? null,
    body.user_contact_pref ?? null, now, context.params.id
  ).run();

  const row = await db.prepare("SELECT * FROM usuarios WHERE user_id = ?").bind(context.params.id).first();
  const relatedData = await fetchRelatedData(db, row.user_id);
  return json(mapUserRow(row, relatedData));
}

export async function onRequestDelete(context) {
  const denied = await checkPermission(context, "delete");
  if (denied) return denied;

  const db = context.env.DB;
  await ensureAllSchemas(db);

  const user = context.data.user;
  const ownershipFilter = buildOwnershipFilter(user);
  const existing = await db.prepare(`SELECT user_id FROM usuarios WHERE user_id = ? AND user_deleted_at IS NULL${ownershipFilter.sql}`).bind(context.params.id, ...ownershipFilter.params).first();
  if (!existing) return error("Usuario no encontrado o sin acceso", 404);

  await db.prepare("UPDATE usuarios SET user_deleted_at = ?, user_updated_at = ? WHERE user_id = ?")
    .bind(new Date().toISOString(), new Date().toISOString(), context.params.id).run();
  return json(null);
}
