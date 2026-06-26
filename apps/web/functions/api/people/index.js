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
  if (!db) return error("D1 no configurado", 500);
  await ensureAllSchemas(db);

  const { results } = await db.prepare("SELECT * FROM people WHERE deleted_at IS NULL ORDER BY created_at DESC").all();
  const persons = [];
  for (const row of results) {
    const relatedData = await fetchRelatedData(db, row.id);
    persons.push(mapPersonRow(row, relatedData));
  }
  return json(persons);
}

export async function onRequestPost(context) {
  const denied = await checkPermission(context, "create");
  if (denied) return denied;

  const db = context.env.DB;
  if (!db) return error("D1 no configurado", 500);
  await ensureAllSchemas(db);

  let body = {};
  try { body = await context.request.json(); } catch { return error("JSON inválido", 400); }

  const id = `per-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const nombreParts = String(body.nombre || "").trim().split(/\s+/).filter(Boolean);
  const nombre_1 = nombreParts[0] || body.nombre || "Sin nombre";
  const nombre_2 = nombreParts.length > 3 ? nombreParts[1] : null;
  const apellido_1 = nombreParts.length >= 3 ? nombreParts.slice(2).join(" ") : nombreParts[1] || "";
  const apellido_2 = nombreParts.length > 4 ? nombreParts[nombreParts.length - 1] : null;  const tipos = body.tipos ? JSON.stringify(body.tipos) : '[]';
  const etiquetas = body.etiquetas ? JSON.stringify(body.etiquetas) : '[]';

  await db.prepare(
    `INSERT INTO people (id, nombre_1, nombre_2, apellido_1, apellido_2, telefono, email, estado, fuente, fecha_creacion, ultima_interaccion, proxima_actividad, proxima_actividad_detalle, assigned_user_id, created_at, updated_at, tipos, etiquetas, observaciones_administrativas)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, nombre_1 || body.nombre || "Sin nombre", nombre_2 || null,
    apellido_1 || "", apellido_2 || null, body.telefono || "", body.email || null,
    body.estado || "Pendiente", body.fuente || null, body.fecha_creacion || now.slice(0, 10),
    body.ultima_interaccion || null, body.proxima_actividad || null, body.proxima_actividad_detalle || null,
    body.responsable || null, now, now, tipos, etiquetas, body.observaciones_administrativas || null
  ).run();

  const created = await db.prepare("SELECT * FROM people WHERE id = ?").bind(id).first();
  const relatedData = await fetchRelatedData(db, id);
  return json(mapPersonRow(created, relatedData), 201);
}
