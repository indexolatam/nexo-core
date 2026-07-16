import { generateId } from "./helpers.js";

export async function logAuditEvent(
  auditDb: D1Database,
  input: { entityType: string; entityId?: string; eventType: string; userId?: string; userLabel?: string; detail?: string; oldValue?: string; newValue?: string },
): Promise<void> {
  await auditDb
    .prepare(
      `INSERT INTO audit_log (id, entity_type, entity_id, event_type, user_id, user_label, timestamp, detail, old_value, new_value)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?)`
    )
    .bind(
      generateId("aud"), input.entityType, input.entityId || null,
      input.eventType, input.userId || null, input.userLabel || null,
      input.detail || null, input.oldValue || null, input.newValue || null,
    )
    .run();
}
