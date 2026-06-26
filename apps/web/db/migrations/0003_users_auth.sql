CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lastname TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK(role IN ('root', 'admin', 'doctor', 'asistente')),
  active INTEGER NOT NULL DEFAULT 1,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_label TEXT NOT NULL,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  FOREIGN KEY (updated_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  last_activity_at TEXT,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

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
  new_value TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT OR IGNORE INTO users (
  id, name, lastname, role, active, username, email, password_hash, display_label,
  created_at, updated_at
) VALUES
  ('root', 'Root', 'Admin', 'root', 1, 'root', 'root@puntodeequilibrio.com', '4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2', 'root', '2026-06-01T00:00:00.000Z', '2026-06-01T00:00:00.000Z'),
  ('admin', 'Admin', 'Clínica', 'admin', 1, 'admin', 'admin@puntodeequilibrio.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin', '2026-06-01T00:00:00.000Z', '2026-06-01T00:00:00.000Z'),
  ('doctor', 'Doctora', 'Principal', 'doctor', 1, 'doctora', 'doctora@puntodeequilibrio.com', 'efb86b1a6c91a5cd0e42fb058bd2f83f2a28f1f3f2f9c8f9d5c5e8a9d4a2c1b', 'doctor 1', '2026-06-01T00:00:00.000Z', '2026-06-01T00:00:00.000Z'),
  ('asistente', 'Asistente', 'Administrativo', 'asistente', 1, 'asistente', 'asistente@puntodeequilibrio.com', '7894b0e3e0c0d9f8e0c3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5', 'asistente', '2026-06-01T00:00:00.000Z', '2026-06-01T00:00:00.000Z');
