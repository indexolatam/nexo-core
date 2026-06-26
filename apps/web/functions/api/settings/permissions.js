import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";
import { getMaxPermissions, canExceedMax, getUserPermission } from "../../_core/permissions.js";

async function checkPerm(context, action) {
  const user = context.data?.user;
  if (!user) return error("No autenticado", 401);
  if (user.role === "root") return null;
  if (user.role !== "admin") return error("Solo root y admin pueden gestionar permisos", 403);
  const db = context.env.DB;
  const perm = await getUserPermission(db, user.role, "configuracion");
  if (!perm[`can_${action}`]) return error("Sin permiso para esta acción", 403);
  return null;
}

export async function onRequestGet(context) {
  const denied = await checkPerm(context, "read");
  if (denied) return denied;

  const db = context.env.DB;
  if (!db) return error("D1 no configurado", 500);
  await ensureAllSchemas(db);

  const { results } = await db.prepare(
    "SELECT id, role, module, can_read, can_create, can_edit, can_delete FROM module_permissions ORDER BY role, module"
  ).all();

  const grouped = {};
  for (const row of results) {
    if (!grouped[row.role]) grouped[row.role] = [];
    grouped[row.role].push({
      module: row.module,
      can_read: !!row.can_read,
      can_create: !!row.can_create,
      can_edit: !!row.can_edit,
      can_delete: !!row.can_delete,
    });
  }
  return json(grouped);
}

export async function onRequestPut(context) {
  const denied = await checkPerm(context, "edit");
  if (denied) return denied;

  const db = context.env.DB;
  if (!db) return error("D1 no configurado", 500);
  await ensureAllSchemas(db);

  let body = {};
  try { body = await context.request.json(); } catch { return error("JSON inválido", 400); }

  const { permissions } = body;
  if (!permissions || typeof permissions !== "object") return error("Formato inválido", 400);

  const now = new Date().toISOString();
  const stmt = await db.prepare(
    "UPDATE module_permissions SET can_read = ?, can_create = ?, can_edit = ?, can_delete = ?, updated_at = ? WHERE role = ? AND module = ?"
  );

  const batch = [];
  for (const [role, modules] of Object.entries(permissions)) {
    if (!["root", "admin", "doctor", "asistente"].includes(role)) continue;
    for (const [module, perms] of Object.entries(modules)) {
      if (typeof perms !== "object") continue;

      const requested = {
        can_read: perms.can_read ? 1 : 0,
        can_create: perms.can_create ? 1 : 0,
        can_edit: perms.can_edit ? 1 : 0,
        can_delete: perms.can_delete ? 1 : 0,
      };

      if (canExceedMax(role, module, requested)) {
        return error(`Permiso excede el máximo para ${role} en ${module}`, 400);
      }

      batch.push(stmt.bind(requested.can_read, requested.can_create, requested.can_edit, requested.can_delete, now, role, module));
    }
  }

  if (batch.length > 0) await db.batch(batch);
  return json({ updated: batch.length });
}
