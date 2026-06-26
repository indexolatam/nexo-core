import { getUserFromToken, requireAuth as getToken } from "../_core/auth.js";
import { unauthorized } from "../_core/errors.js";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const publicPaths = ["/api/auth/login", "/api/health"];
  if (publicPaths.some((p) => url.pathname.startsWith(p))) {
    return context.next();
  }

  const token = getToken(context);
  if (!token) return unauthorized();

  const user = await getUserFromToken(context.env.DB, token);
  if (!user) return unauthorized();

  context.data = context.data || {};
  context.data.user = user;

  return context.next();
}
