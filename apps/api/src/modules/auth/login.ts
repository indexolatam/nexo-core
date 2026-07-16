import type { ExecutionContext, Handler } from "../../types.js";
import { json, error } from "../../infrastructure/http/response.js";
import { generateId, generateToken, hashPassword } from "../../infrastructure/db/helpers.js";
import { loginSchema } from "@nexo-core/contracts";

export const loginHandler: Handler = async (ctx: ExecutionContext) => {
  const body: unknown = await ctx.request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return error("Datos inválidos", 422, "VALIDATION_ERROR");

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await ctx.tenant.database
    .prepare("SELECT id, name, lastname, role, active, username, email, display_label, password_hash FROM users WHERE username = ? AND deleted_at IS NULL")
    .bind(parsed.data.username).first();

  if (!user || user.password_hash !== passwordHash) return error("Credenciales inválidas", 401);
  if (user.active !== 1) return error("Usuario desactivado", 403);

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await ctx.tenant.database
    .prepare("INSERT INTO auth_sessions (id, user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, datetime('now'), ?)")
    .bind(generateId("sess"), user.id, token, expiresAt).run();

  const { password_hash: _, ...safeUser } = user as any;
  return json({ user: safeUser, token });
};
