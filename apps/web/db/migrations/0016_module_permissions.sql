-- ============================================================
-- 0016: Permisos por módulo y rol
-- Cada rol tiene un techo de permisos preestablecido.
-- Root/Admin solo pueden RESTAR acceso, nunca sumar más allá del techo.
-- ============================================================

CREATE TABLE IF NOT EXISTS module_permissions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK(role IN ('root','admin','doctor','asistente')),
  module TEXT NOT NULL,
  can_read INTEGER DEFAULT 1,
  can_create INTEGER DEFAULT 0,
  can_edit INTEGER DEFAULT 0,
  updated_at TEXT,
  UNIQUE(role, module)
);

-- Techo por defecto (basado en AdminLayout.tsx)
-- root: acceso total
INSERT OR IGNORE INTO module_permissions (id, role, module, can_read, can_create, can_edit) VALUES
  ('perm-root-personas',      'root', 'personas',      1, 1, 1),
  ('perm-root-finanzas',      'root', 'finanzas',      1, 1, 1),
  ('perm-root-agenda',        'root', 'agenda',        1, 1, 1),
  ('perm-root-tareas',        'root', 'tareas',        1, 1, 1),
  ('perm-root-configuracion', 'root', 'configuracion', 1, 1, 1),
  ('perm-root-auditoria',     'root', 'auditoria',     1, 1, 1),
  ('perm-root-blog',          'root', 'blog',          1, 1, 1);

-- admin: personas, finanzas, agenda, tareas, configuracion
INSERT OR IGNORE INTO module_permissions (id, role, module, can_read, can_create, can_edit) VALUES
  ('perm-admin-personas',      'admin', 'personas',      1, 1, 1),
  ('perm-admin-finanzas',      'admin', 'finanzas',      1, 1, 1),
  ('perm-admin-agenda',        'admin', 'agenda',        1, 1, 1),
  ('perm-admin-tareas',        'admin', 'tareas',        1, 1, 1),
  ('perm-admin-configuracion', 'admin', 'configuracion', 1, 1, 1),
  ('perm-admin-auditoria',     'admin', 'auditoria',     0, 0, 0),
  ('perm-admin-blog',          'admin', 'blog',          0, 0, 0);

-- doctor: agenda, tareas
INSERT OR IGNORE INTO module_permissions (id, role, module, can_read, can_create, can_edit) VALUES
  ('perm-doctor-personas',      'doctor', 'personas',      0, 0, 0),
  ('perm-doctor-finanzas',      'doctor', 'finanzas',      0, 0, 0),
  ('perm-doctor-agenda',        'doctor', 'agenda',        1, 1, 1),
  ('perm-doctor-tareas',        'doctor', 'tareas',        1, 1, 1),
  ('perm-doctor-configuracion', 'doctor', 'configuracion', 0, 0, 0),
  ('perm-doctor-auditoria',     'doctor', 'auditoria',     0, 0, 0),
  ('perm-doctor-blog',          'doctor', 'blog',          0, 0, 0);

-- asistente: personas (R+C+E), finanzas (R+C+E), agenda (R+C+E), tareas (R+C+E), configuracion (R)
INSERT OR IGNORE INTO module_permissions (id, role, module, can_read, can_create, can_edit) VALUES
  ('perm-asistente-personas',      'asistente', 'personas',      1, 1, 1),
  ('perm-asistente-finanzas',      'asistente', 'finanzas',      1, 1, 1),
  ('perm-asistente-agenda',        'asistente', 'agenda',        1, 1, 1),
  ('perm-asistente-tareas',        'asistente', 'tareas',        1, 1, 1),
  ('perm-asistente-configuracion', 'asistente', 'configuracion', 1, 0, 0),
  ('perm-asistente-auditoria',     'asistente', 'auditoria',     0, 0, 0),
  ('perm-asistente-blog',          'asistente', 'blog',          0, 0, 0);
