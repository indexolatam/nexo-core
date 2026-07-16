import type { ExecutionContext, Handler } from "../../types.js";
import { error } from "./response.js";

export function requireAuth(handler: Handler): Handler {
  return async (ctx: ExecutionContext) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return error("Token requerido", 401, "UNAUTHORIZED");
    }

    const token = authHeader.substring(7);
    const session = await ctx.tenant.database
      .prepare(
        `SELECT s.user_id, u.name, u.lastname, u.role, u.email, u.active
         FROM auth_sessions s JOIN users u ON s.user_id = u.id
         WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > datetime('now')`
      )
      .bind(token)
      .first<{ user_id: string; name: string; lastname: string; role: string; email: string; active: number }>();

    if (!session) return error("Sesión inválida", 401, "UNAUTHORIZED");
    if (session.active !== 1) return error("Usuario desactivado", 403, "FORBIDDEN");

    const permResult = await ctx.tenant.database
      .prepare(`SELECT module, can_read, can_create, can_edit, can_delete FROM module_permissions WHERE role = ?`)
      .bind(session.role)
      .all<{ module: string; can_read: number; can_create: number; can_edit: number; can_delete: number }>();

    const permissions: string[] = [];
    for (const p of permResult.results || []) {
      if (p.can_read) permissions.push(`${p.module}:read`);
      if (p.can_create) permissions.push(`${p.module}:create`);
      if (p.can_edit) permissions.push(`${p.module}:edit`);
      if (p.can_delete) permissions.push(`${p.module}:delete`);
    }

    ctx.user = {
      userId: session.user_id,
      tenantId: ctx.tenant.tenantId,
      role: session.role,
      permissions,
      name: session.name,
      lastname: session.lastname,
      email: session.email,
    };

    return handler(ctx);
  };
}
