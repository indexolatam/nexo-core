import { json } from "../../_core/response.js";
import { requireAuth as getToken } from "../../_core/auth.js";

export async function onRequestPost(context) {
  const token = getToken(context);
  if (token) {
    await context.env.DB.prepare("DELETE FROM auth_sessions WHERE token = ?").bind(token).run();
  }
  return json({ ok: true });
}
