import { json, error } from "../../_core/response.js";
import { ensureAuditSchema, mapAuditRow } from "../../_core/audit.js";
import { getUserPermission } from "../../_core/permissions.js";

async function checkPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const perm = await getUserPermission(context.env.DB, user.role, "auditoria");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

export async function onRequestGet(context) {
  const denied = await checkPermission(context, "read");
  if (denied) return denied;
  const db = context.env.DB_AUDIT;
  if (!db) return error("D1 de auditoría no configurado", 500);
  await ensureAuditSchema(db);

  const { searchParams } = new URL(context.request.url);
  const entityType = searchParams.get("entity_type");
  const entityId = searchParams.get("entity_id");
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 500);

  let query = "SELECT * FROM audit_log";
  const binds = [];

  if (entityType && entityId) {
    query += " WHERE entity_type = ? AND entity_id = ?";
    binds.push(entityType, entityId);
  } else if (entityType) {
    query += " WHERE entity_type = ?";
    binds.push(entityType);
  }

  query += " ORDER BY timestamp DESC LIMIT ?";
  binds.push(limit);

  const { results } = await db.prepare(query).bind(...binds).all();
  return json(results.map(mapAuditRow));
}

export async function onRequestPost(context) {
  const denied = await checkPermission(context, "create");
  if (denied) return denied;
  const db = context.env.DB_AUDIT;
  if (!db) return error("D1 de auditoría no configurado", 500);
  await ensureAuditSchema(db);

  let body = {};
  try { body = await context.request.json(); } catch {}

  const { entity_type, entity_id, event_type, user_label, user_id, detail, old_value, new_value } = body;

  if (!entity_type || !event_type) {
    return error("Faltan campos requeridos: entity_type, event_type", 400);
  }

  const now = new Date().toISOString();
  const id = `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  await db.prepare(
    "INSERT INTO audit_log (id, entity_type, entity_id, event_type, user_label, user_id, timestamp, detail, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, entity_type, entity_id ?? null, event_type, user_label ?? null, user_id ?? null, now, detail ?? null, old_value ?? null, new_value ?? null).run();

  const row = await db.prepare("SELECT * FROM audit_log WHERE id = ?").bind(id).first();
  return json(mapAuditRow(row), 201);
}
