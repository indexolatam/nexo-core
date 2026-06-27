import { forbidden } from "./errors.js";
import { ensureAllSchemas } from "./db.js";

const ROLE_MAX_PERMISSIONS = {
  root: {
    personas: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
    finanzas: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
    agenda: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
    tareas: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
    configuracion: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
    auditoria: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
    blog: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
  },
  admin: {
    personas: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
    finanzas: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
    agenda: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
    tareas: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
    configuracion: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 1 },
    auditoria: { can_read: 0, can_create: 0, can_edit: 0, can_delete: 0 },
    blog: { can_read: 0, can_create: 0, can_edit: 0, can_delete: 0 },
  },
  asistente: {
    personas: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 0 },
    finanzas: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 0 },
    agenda: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 0 },
    tareas: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 0 },
    configuracion: { can_read: 1, can_create: 0, can_edit: 0, can_delete: 0 },
    auditoria: { can_read: 0, can_create: 0, can_edit: 0, can_delete: 0 },
    blog: { can_read: 0, can_create: 0, can_edit: 0, can_delete: 0 },
  },
  colaborador: {
    personas: { can_read: 0, can_create: 0, can_edit: 0, can_delete: 0 },
    finanzas: { can_read: 0, can_create: 0, can_edit: 0, can_delete: 0 },
    agenda: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 0 },
    tareas: { can_read: 1, can_create: 1, can_edit: 1, can_delete: 0 },
    configuracion: { can_read: 0, can_create: 0, can_edit: 0, can_delete: 0 },
    auditoria: { can_read: 0, can_create: 0, can_edit: 0, can_delete: 0 },
    blog: { can_read: 0, can_create: 0, can_edit: 0, can_delete: 0 },
  },
};

export function getMaxPermissions(role, module) {
  return ROLE_MAX_PERMISSIONS[role]?.[module] || { can_read: 0, can_create: 0, can_edit: 0, can_delete: 0 };
}

export function canExceedMax(role, module, permissions) {
  const max = getMaxPermissions(role, module);
  if (permissions.can_read > max.can_read) return true;
  if (permissions.can_create > max.can_create) return true;
  if (permissions.can_edit > max.can_edit) return true;
  if (permissions.can_delete > max.can_delete) return true;
  return false;
}

export async function getUserPermission(db, role, module) {
  await ensureAllSchemas(db);
  const perm = await db.prepare(
    "SELECT can_read, can_create, can_edit, can_delete FROM module_permissions WHERE role = ? AND module = ?"
  ).bind(role, module).first();
  return perm || { can_read: 0, can_create: 0, can_edit: 0, can_delete: 0 };
}

export function requirePermission(module, action) {
  return async (context) => {
    const user = context.data?.user;
    if (!user) return forbidden("No autenticado");
    if (user.role === "root") return context.next();
    const db = context.env.DB;
    const perm = await db.prepare(
      "SELECT can_read, can_create, can_edit, can_delete FROM module_permissions WHERE role = ? AND module = ?"
    ).bind(user.role, module).first();
    const key = `can_${action}`;
    if (!perm || !perm[key]) return forbidden(`Sin permiso: ${module} → ${action}`);
    return context.next();
  };
}
