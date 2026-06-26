import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestDelete(context) {
  const db = context.env.DB_AUDIT;
  if (!db) return error("D1 de auditoría no configurado", 500);
  await ensureAllSchemas(db);
  await db.prepare("DELETE FROM audit_log WHERE id = ?").bind(context.params.id).run();
  return json(null);
}