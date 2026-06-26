export async function ensureAuditSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    event_type TEXT NOT NULL,
    user_label TEXT,
    user_id TEXT,
    timestamp TEXT NOT NULL,
    detail TEXT,
    old_value TEXT,
    new_value TEXT
  )`).run();
}

export async function logAudit(db, { entity_type, entity_id, event_type, user_id, user_label, detail, old_value, new_value }) {
  await ensureAuditSchema(db);
  const id = `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  await db.prepare(`
    INSERT INTO audit_log (id, entity_type, entity_id, event_type, user_id, user_label, timestamp, detail, old_value, new_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, entity_type, entity_id, event_type, user_id, user_label, now, detail, old_value ?? null, new_value ?? null).run();
  return id;
}

export function mapAuditRow(row) {
  return {
    id: row.id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    event_type: row.event_type,
    user_label: row.user_label,
    user_id: row.user_id,
    timestamp: row.timestamp,
    detail: row.detail,
    old_value: row.old_value,
    new_value: row.new_value,
  };
}
