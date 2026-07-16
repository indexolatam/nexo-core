-- NEXO Tenant Database (per-tenant, operational)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lastname TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'doctor',
  active INTEGER NOT NULL DEFAULT 1,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_label TEXT,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  deleted_at TEXT,
  created_by TEXT,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS module_permissions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  module TEXT NOT NULL,
  can_read INTEGER NOT NULL DEFAULT 1,
  can_create INTEGER NOT NULL DEFAULT 0,
  can_edit INTEGER NOT NULL DEFAULT 0,
  can_delete INTEGER NOT NULL DEFAULT 0,
  UNIQUE(role, module)
);

CREATE TABLE IF NOT EXISTS usuarios (
  user_id TEXT PRIMARY KEY,
  user_name_1 TEXT NOT NULL,
  user_name_2 TEXT,
  user_lastname_1 TEXT NOT NULL,
  user_lastname_2 TEXT,
  user_phone_code TEXT DEFAULT '505',
  user_phone TEXT NOT NULL,
  user_email TEXT,
  user_status TEXT DEFAULT 'Pendiente',
  user_source TEXT,
  user_created_date DATE DEFAULT (date('now')),
  user_consent INTEGER DEFAULT 1,
  user_address TEXT,
  user_birth_date DATE,
  user_gender TEXT,
  user_doc_id TEXT,
  user_notes TEXT,
  user_types TEXT DEFAULT '[]',
  user_tags TEXT DEFAULT '[]',
  user_admin_notes TEXT DEFAULT '',
  user_created_at DATETIME DEFAULT (datetime('now')),
  user_updated_at DATETIME,
  user_deleted_at DATETIME,
  user_created_by TEXT,
  user_updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios(user_status);
