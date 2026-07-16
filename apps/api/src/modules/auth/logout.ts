import type { ExecutionContext, Handler } from "../../types.js";
import { json } from "../../infrastructure/http/response.js";

export const logoutHandler: Handler = async (ctx: ExecutionContext) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    await ctx.tenant.database
      .prepare("UPDATE auth_sessions SET revoked_at = datetime('now') WHERE token_hash = ? AND revoked_at IS NULL")
      .bind(authHeader.substring(7)).run();
  }
  return json({ success: true });
};
