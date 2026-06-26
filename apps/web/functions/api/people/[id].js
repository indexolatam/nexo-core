import { json, error } from "../../_core/response.js";
import { ensureAllSchemas, mapPersonRow, fetchRelatedData } from "../../_core/db.js";
import { getUserPermission } from "../../_core/permissions.js";

async function checkPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const db = context.env.DB;
  const perm = await getUserPermission(db, user.role, "personas");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

function parseName(fullName) {
  if (!fullName) return { nombre_1: null, nombre_2: null, apellido_1: null, apellido_2: null };
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  return {
    nombre_1: parts[0] || null,
    nombre_2: parts.length > 3 ? parts[1] : null,
    apellido_1: parts.length >= 3 ? parts.slice(2).join(" ") : parts[1] || null,
    apellido_2: parts.length > 4 ? parts[parts.length - 1] : null,
  };
}

export async function onRequestGet(context) {
  const denied = await checkPermission(context, "read");
  if (denied) return denied;

  const db = context.env.DB;
  await ensureAllSchemas(db);
  const row = await db.prepare("SELECT * FROM people WHERE id = ? AND deleted_at IS NULL").bind(context.params.id).first();
  if (!row) return json(null);
  const relatedData = await fetchRelatedData(db, row.id);
  return json(mapPersonRow(row, relatedData));
}

export async function onRequestPatch(context) {
  const denied = await checkPermission(context, "edit");
  if (denied) return denied;

  const db = context.env.DB;
  await ensureAllSchemas(db);

  const existing = await db.prepare("SELECT id FROM people WHERE deleted_at IS NULL").bind(context.params.id).first();
  if (!existing) return error("Persona no encontrada", 404);

  let body = {};
  try { body = await context.request.json(); } catch { return error("JSON inválido", 400); }

  const now = new Date().toISOString();
  const { nombre_1, nombre_2, apellido_1, apellido_2 } = parseName(body.nombre);

  await db.prepare(
    `UPDATE people SET
     nombre_1 = COALESCE(?, nombre_1), nombre_2 = COALESCE(?, nombre_2),
     apellido_1 = COALESCE(?, apellido_1), apellido_2 = COALESCE(?, apellido_2),
     telefono = COALESCE(?, telefono), email = COALESCE(?, email), estado = COALESCE(?, estado),
     fuente = COALESCE(?, fuente), ultima_interaccion = COALESCE(?, ultima_interaccion),
     proxima_actividad = COALESCE(?, proxima_actividad), proxima_actividad_detalle = COALESCE(?, proxima_actividad_detalle),
     tipos = COALESCE(?, tipos), etiquetas = COALESCE(?, etiquetas),
     observaciones_administrativas = COALESCE(?, observaciones_administrativas),
     assigned_user_id = COALESCE(?, assigned_user_id), updated_at = ?
     WHERE id = ?`
  ).bind(
    nombre_1, nombre_2, apellido_1, apellido_2,
    body.telefono ?? null, body.email ?? null, body.estado ?? null, body.fuente ?? null,
    body.ultima_interaccion ?? null, body.proxima_actividad ?? null, body.proxima_actividad_detalle ?? null,
    body.tipos ? JSON.stringify(body.tipos) : null, body.etiquetas ? JSON.stringify(body.etiquetas) : null,
    body.observaciones_administrativas ?? null,
    body.responsable ?? null, now, context.params.id
  ).run();

  const row = await db.prepare("SELECT * FROM people WHERE id = ?").bind(context.params.id).first();
  const relatedData = await fetchRelatedData(db, row.id);
  return json(mapPersonRow(row, relatedData));
}

export async function onRequestDelete(context) {
  const denied = await checkPermission(context, "edit");
  if (denied) return denied;

  const db = context.env.DB;
  await ensureAllSchemas(db);

  const existing = await db.prepare("SELECT id FROM people WHERE id = ? AND deleted_at IS NULL").bind(context.params.id).first();
  if (!existing) return error("Persona no encontrada", 404);

  await db.prepare("UPDATE people SET deleted_at = ?, updated_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), new Date().toISOString(), context.params.id).run();
  return json(null);
}
