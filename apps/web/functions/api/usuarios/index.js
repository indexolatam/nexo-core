import { json, error } from "../../_core/response.js";
import { ensureAllSchemas, mapUserRow, fetchBatchRelatedData } from "../../_core/db.js";
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

function buildRoleFilter(user) {
  if (user.role === "root" || user.role === "admin") return { sql: "", params: [] };
  if (user.role === "colaborador" || user.role === "asistente") return { sql: "AND user_assigned_to = ?", params: [user.id] };
  return { sql: "AND 1=0", params: [] };
}

export async function onRequestGet(context) {
  const denied = await checkPermission(context, "read");
  if (denied) return denied;

  const db = context.env.DB;
  if (!db) return error("D1 no configurado", 500);
  await ensureAllSchemas(db);

  const user = context.data.user;
  const url = new URL(context.request.url);
  const showInactive = url.searchParams.get("showInactive") === "true";
  const showArchived = url.searchParams.get("showArchived") === "true";

  let statusFilter = "";
  if (user.role !== "root") {
    statusFilter = "AND (user_status = 'Activo' || user_status = 'Pendiente')";
    if (showInactive) statusFilter = "AND (user_status = 'Activo' || user_status = 'Pendiente' || user_status = 'Inactivo')";
    if (showArchived) statusFilter = "AND (user_status = 'Activo' || user_status = 'Pendiente' || user_status = 'Inactivo' || user_status = 'Archivado')";
  }

  const roleFilter = buildRoleFilter(user);

  const query = `SELECT * FROM usuarios WHERE user_deleted_at IS NULL ${statusFilter} ${roleFilter.sql} ORDER BY user_created_at DESC`;
  const { results } = await db.prepare(query).bind(...roleFilter.params).all();

  const userIds = results.map((r) => r.user_id);
  const batchData = await fetchBatchRelatedData(db, userIds);

  const users = [];
  for (const row of results) {
    const relatedData = batchData.get(row.user_id) || { citas: { proximas: [], historial: [] }, tareas: { pendientes: [], completadas: [] }, finanzas: { pagadas: [], pendientes: [], servicios: [] }, historial: [] };
    users.push(mapUserRow(row, relatedData));
  }
  return json(users);
}

export async function onRequestPost(context) {
  const denied = await checkPermission(context, "create");
  if (denied) return denied;

  const db = context.env.DB;
  if (!db) return error("D1 no configurado", 500);
  await ensureAllSchemas(db);

  let body = {};
  try { body = await context.request.json(); } catch { return error("JSON inválido", 400); }

  const id = `usr-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const nameParts = String(body.user_name || "").trim().split(/\s+/).filter(Boolean);
  const user_name_1 = nameParts[0] || body.user_name || "Sin nombre";
  const user_name_2 = nameParts.length > 3 ? nameParts[1] : null;
  const user_lastname_1 = nameParts.length >= 3 ? nameParts.slice(2).join(" ") : nameParts[1] || "";
  const user_lastname_2 = nameParts.length > 4 ? nameParts[nameParts.length - 1] : null;
  const user_types = body.user_types ? JSON.stringify(body.user_types) : '[]';
  const user_tags = body.user_tags ? JSON.stringify(body.user_tags) : '[]';

  await db.prepare(
    `INSERT INTO usuarios (user_id, user_name_1, user_name_2, user_lastname_1, user_lastname_2, user_phone, user_email, user_status, user_source, user_created_date, user_last_interaction, user_next_activity, user_next_activity_detail, user_assigned_to, user_created_at, user_updated_at, user_types, user_tags, user_admin_notes,
     user_address, user_birth_date, user_gender, user_doc_id, user_photo_url, user_notes, user_contact_pref)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
     ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user_name_1 || body.user_name || "Sin nombre", user_name_2 || null,
    user_lastname_1 || "", user_lastname_2 || null, body.user_phone || "", body.user_email || null,
    body.user_status || "Pendiente", body.user_source || null, body.user_created_date || now.slice(0, 10),
    body.user_last_interaction || null, body.user_next_activity || null, body.user_next_activity_detail || null,
    body.user_assigned_to || null, now, now, user_types, user_tags, body.user_admin_notes || null,
    body.user_address || null, body.user_birth_date || null,
    body.user_gender || null, body.user_doc_id || null,
    body.user_photo_url || null, body.user_notes || null,
    body.user_contact_pref || null
  ).run();

  const created = await db.prepare("SELECT * FROM usuarios WHERE user_id = ?").bind(id).first();
  const relatedData = await fetchBatchRelatedData(db, [id]);
  return json(mapUserRow(created, relatedData.get(id)), 201);
}
