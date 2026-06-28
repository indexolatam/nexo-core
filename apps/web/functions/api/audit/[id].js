import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";
import { getUserPermission } from "../../_core/permissions.js";

async function checkPermission(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  const perm = await getUserPermission(context.env.DB, user.role, "auditoria");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

export async function onRequestDelete(context) {
  const denied = await checkPermission(context, "delete");
  if (denied) return denied;
  const db = context.env.DB_AUDIT;
  if (!db) return error("D1 de auditoría no configurado", 500);
  await ensureAllSchemas(db);
  await db.prepare("DELETE FROM audit_log WHERE id = ?").bind(context.params.id).run();
  return json(null);
}