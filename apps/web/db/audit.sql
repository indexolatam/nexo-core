-- ============================================================
-- NEXO — Base de datos de auditoría
-- Contiene solo la tabla audit_log
-- Se aplica sobre el binding DB_AUDIT
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  event_type TEXT NOT NULL,
  user_id TEXT,
  user_label TEXT,
  timestamp TEXT NOT NULL,
  detail TEXT,
  old_value TEXT,
  new_value TEXT
);