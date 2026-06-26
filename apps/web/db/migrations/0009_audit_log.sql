CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  user_label TEXT NOT NULL,
  user_id TEXT,
  timestamp TEXT NOT NULL,
  detail TEXT,
  old_value TEXT,
  new_value TEXT
);

INSERT OR IGNORE INTO audit_log (id, entity_type, entity_id, event_type, user_label, user_id, timestamp, detail)
VALUES
  ('aud-001', 'people', 'per-001', 'created', 'asistente', 'asis', '2026-06-01T10:00:00.000Z', 'Ficha creada'),
  ('aud-002', 'people', 'per-002', 'created', 'asistente', 'asis', '2026-06-01T10:05:00.000Z', 'Ficha creada'),
  ('aud-003', 'finance_movements', 'fin-001', 'paid', 'admin', 'admin', '2026-06-02T14:30:00.000Z', 'Pago registrado');
