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
  let body = {};
  try { body = await context.request.json(); } catch { return error("JSON inválido", 400); }

  const now = new Date().toISOString();
  const nombreParts = body.nombre ? String(body.nombre).trim().split(/\s+/) : null;
  const nombre_1 = nombreParts ? nombreParts[0] : null;
  const apellido_1 = nombreParts && nombreParts.length > 1 ? nombreParts.slice(1).join(" ") : null;

  await db.prepare(
    `UPDATE people SET
     nombre_1 = COALESCE(?, nombre_1), apellido_1 = COALESCE(?, apellido_1),
     telefono = COALESCE(?, telefono), email = COALESCE(?, email), estado = COALESCE(?, estado),
     fuente = COALESCE(?, fuente), ultima_interaccion = COALESCE(?, ultima_interaccion),
     proxima_actividad = COALESCE(?, proxima_actividad), proxima_actividad_detalle = COALESCE(?, proxima_actividad_detalle),
     tipos = COALESCE(?, tipos), etiquetas = COALESCE(?, etiquetas),
     observaciones_administrativas = COALESCE(?, observaciones_administrativas), updated_at = ?
     WHERE id = ?`
  ).bind(
    nombre_1, apellido_1,
    body.telefono ?? null, body.email ?? null, body.estado ?? null, body.fuente ?? null,
    body.ultima_interaccion ?? null, body.proxima_actividad ?? null, body.proxima_actividad_detalle ?? null,
    body.tipos ? JSON.stringify(body.tipos) : null, body.etiquetas ? JSON.stringify(body.etiquetas) : null,
    body.observaciones_administrativas ?? null, now, context.params.id
  ).run();

  const row = await db.prepare("SELECT * FROM people WHERE id = ?").bind(context.params.id).first();
  const relatedData = await fetchRelatedData(db, row.id);
  return json(mapPersonRow(row, relatedData));
}

export async function onRequestDelete(context) {
  const denied = await checkPermission(context, "edit");
  if (denied) return denied;

  await ensureAllSchemas(context.env.DB);
  await context.env.DB.prepare("UPDATE people SET deleted_at = ?, updated_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), new Date().toISOString(), context.params.id).run();
  return json(null);
}
