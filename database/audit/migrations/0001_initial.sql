-- NEXO Audit Database (per-tenant)

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  event_type TEXT NOT NULL,
  user_id TEXT,
  user_label TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  detail TEXT,
  old_value TEXT,
  new_value TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
