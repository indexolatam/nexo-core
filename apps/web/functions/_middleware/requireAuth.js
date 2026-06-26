import { getUserFromToken, requireAuth as getToken } from "../_core/auth.js";
import { unauthorized } from "../_core/errors.js";

export async function onRequest(context) {
  const token = getToken(context);
  if (!token) return unauthorized();

  const user = await getUserFromToken(context.env.DB, token);
  if (!user) return unauthorized();

  context.data = context.data || {};
  context.data.user = user;

  return context.next();
}
