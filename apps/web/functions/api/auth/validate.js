import { json, error } from "../../_core/response.js";
import { getUserFromToken, requireAuth as getToken } from "../../_core/auth.js";

export async function onRequestGet(context) {
  const token = getToken(context);
  if (!token) return error("No autorizado", 401);

  const user = await getUserFromToken(context.env.DB, token);
  if (!user) return error("Sesión inválida", 401);

  return json(user);
}
