-- Migration 0018: Update roles from doctor to colaborador
-- This migration updates the CHECK constraint and seed data

-- SQLite does not support ALTER TABLE for CHECK constraints
-- We need to recreate the users table with the new constraint

-- Step 1: Create new table with updated CHECK constraint
CREATE TABLE IF NOT EXISTS users_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lastname TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK(role IN ('root', 'admin', 'asistente', 'colaborador')),
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
  allowed_types TEXT DEFAULT '[]'
);

-- Step 2: Copy data, converting doctor to colaborador
INSERT INTO users_new (id, name, lastname, role, active, username, email, password_hash, display_label, last_login_at, created_at, updated_at, deleted_at, created_by_user_id, updated_by_user_id, allowed_types)
SELECT id, name, lastname,
  CASE WHEN role = 'doctor' THEN 'colaborador' ELSE role END as role,
  active, username, email, password_hash, display_label, last_login_at, created_at, updated_at, deleted_at, created_by_user_id, updated_by_user_id, allowed_types
FROM users;

-- Step 3: Drop old table and rename new
DROP TABLE IF EXISTS users;
ALTER TABLE users_new RENAME TO users;

-- Step 4: Recreate indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Step 5: Update module_permissions CHECK constraint
CREATE TABLE IF NOT EXISTS module_permissions_new (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK(role IN ('root', 'admin', 'asistente', 'colaborador')),
  module TEXT NOT NULL,
  can_read INTEGER DEFAULT 1,
  can_create INTEGER DEFAULT 0,
  can_edit INTEGER DEFAULT 0,
  can_delete INTEGER DEFAULT 0,
  updated_at TEXT,
  UNIQUE(role, module)
);

INSERT INTO module_permissions_new (id, role, module, can_read, can_create, can_edit, can_delete, updated_at)
SELECT id,
  CASE WHEN role = 'doctor' THEN 'colaborador' ELSE role END as role,
  module, can_read, can_create, can_edit, can_delete, updated_at
FROM module_permissions;

DROP TABLE IF EXISTS module_permissions;
ALTER TABLE module_permissions_new RENAME TO module_permissions;

-- Step 6: Insert colaborador permissions (replacing doctor)
INSERT OR IGNORE INTO module_permissions (id, role, module, can_read, can_create, can_edit, can_delete) VALUES
  ('perm-colaborador-personas', 'colaborador', 'personas', 0, 0, 0, 0),
  ('perm-colaborador-finanzas', 'colaborador', 'finanzas', 0, 0, 0, 0),
  ('perm-colaborador-agenda', 'colaborador', 'agenda', 1, 1, 1, 0),
  ('perm-colaborador-tareas', 'colaborador', 'tareas', 1, 1, 1, 0),
  ('perm-colaborador-configuracion', 'colaborador', 'configuracion', 0, 0, 0, 0),
  ('perm-colaborador-auditoria', 'colaborador', 'auditoria', 0, 0, 0, 0),
  ('perm-colaborador-blog', 'colaborador', 'blog', 0, 0, 0, 0);

-- Step 7: Update seed user to root only (password: root)
-- SHA-256 hash of "root"
UPDATE users SET
  name = 'Root',
  lastname = 'Admin',
  role = 'root',
  username = 'root',
  email = 'root@nexo.local',
  password_hash = '4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2',
  display_label = 'Root Admin',
  active = 1,
  updated_at = datetime('now')
WHERE id = 'root';

-- Remove other default users
DELETE FROM users WHERE id != 'root';
