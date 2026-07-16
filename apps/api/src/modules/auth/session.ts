import type { ExecutionContext, Handler } from "../../types.js";
import { json, error } from "../../infrastructure/http/response.js";

export const sessionHandler: Handler = async (ctx: ExecutionContext) => {
  if (!ctx.user) return error("No autenticado", 401);
  const user = await ctx.tenant.database
    .prepare("SELECT id, name, lastname, role, active, username, email, display_label FROM users WHERE id = ? AND deleted_at IS NULL")
    .bind(ctx.user.userId).first();
  if (!user) return error("Usuario no encontrado", 404);
  return json({ user, permissions: ctx.user.permissions });
};
