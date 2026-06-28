import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";
import { getUserPermission } from "../../_core/permissions.js";

async function checkPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const perm = await getUserPermission(context.env.DB, user.role, "configuracion");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const isAdmin = Boolean(context.data?.user);
  const sql = isAdmin
    ? "SELECT * FROM services WHERE services_deleted_at IS NULL ORDER BY services_name ASC"
    : "SELECT * FROM services WHERE services_deleted_at IS NULL AND services_landing_visible = 1 ORDER BY services_name ASC";
  const { results } = await context.env.DB.prepare(sql).all();
  const parsed = results.map((r) => {
    let participants = r.services_participants;
    if (typeof participants === "string") { try { participants = JSON.parse(participants); } catch { participants = [{ count: 1, label: "Individual", price: 0 }]; } }
    return { ...r, services_participants: participants };
  });
  return json(parsed);
}

export async function onRequestPost(context) {
  const denied = await checkPermission(context, "create");
  if (denied) return denied;
  const db = context.env.DB;
  await ensureAllSchemas(db);
  let body;
  try {
    body = await context.request.json();
  } catch {
    return error("Cuerpo de petición no válido", 400);
  }
  if (!body?.services_name?.trim()) {
    return error("El nombre del servicio es requerido", 400);
  }
  const id = `svc-${Date.now()}`;
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO services (
      services_id, services_name, services_category,
      services_duration, services_duration_unit, services_price, services_currency,
      services_participants, services_description,
      services_landing_visible, services_landing_title, services_landing_paragraph,
      services_landing_image, services_landing_icon, services_landing_order,
      services_landing_cta, services_active, services_created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.services_name || body.name,
    body.services_category || body.category || 'General',
    body.services_duration || body.duration || 60,
    body.services_duration_unit || 'minutes',
    body.services_price || body.price || 0,
    body.services_currency || 'USD',
    JSON.stringify(body.services_participants || [{"count":1,"label":"Individual","price":0}]),
    body.services_description || body.description || null,
    body.services_landing_visible ? 1 : 0,
    body.services_landing_title || null,
    body.services_landing_paragraph || null,
    body.services_landing_image || null,
    body.services_landing_icon || null,
    body.services_landing_order || 0,
    body.services_landing_cta || 'Consultar',
    body.services_active !== false ? 1 : 0,
    now
  ).run();
  const row = await db.prepare("SELECT * FROM services WHERE services_id = ?").bind(id).first();
  if (row.services_participants && typeof row.services_participants === "string") { try { row.services_participants = JSON.parse(row.services_participants); } catch { row.services_participants = [{ count: 1, label: "Individual", price: 0 }]; } }
  return json(row, 201);
}
