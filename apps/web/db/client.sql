-- ============================================================
-- NEXO — Base de datos del cliente
-- Contiene todas las tablas operativas + datos de semilla
-- ============================================================

-- 0018: usuarios (reemplaza people)
CREATE TABLE IF NOT EXISTS usuarios (
  user_id TEXT PRIMARY KEY,
  user_name_1 TEXT NOT NULL,
  user_name_2 TEXT,
  user_lastname_1 TEXT NOT NULL,
  user_lastname_2 TEXT,
  user_phone_code TEXT NOT NULL DEFAULT '505',
  user_phone TEXT NOT NULL,
  user_contact_phone_code TEXT,
  user_contact_phone TEXT,
  user_contact_name TEXT,
  user_contact_lastname TEXT,
  user_email TEXT,
  user_status TEXT NOT NULL DEFAULT 'Pendiente',
  user_source TEXT,
  user_created_date DATE NOT NULL,
  user_last_interaction DATETIME,
  user_next_event_date DATETIME,
  user_next_activity TEXT,
  user_next_activity_detail TEXT,
  user_consent INTEGER DEFAULT 1,
  user_assigned_to TEXT,
  user_created_at DATETIME NOT NULL,
  user_updated_at DATETIME,
  user_deleted_at DATETIME,
  user_created_by TEXT,
  user_updated_by TEXT,
  user_types TEXT DEFAULT '[]',
  user_tags TEXT DEFAULT '[]',
  user_admin_notes TEXT DEFAULT '',
  user_address TEXT,
  user_birth_date DATE,
  user_gender TEXT,
  user_doc_id TEXT,
  user_photo_url TEXT,
  user_notes TEXT,
  user_contact_pref TEXT
);

CREATE TABLE IF NOT EXISTS bank_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  account_number TEXT,
  account_holder TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 0019_services_redesign
CREATE TABLE IF NOT EXISTS services (
  services_id TEXT PRIMARY KEY,
  services_name TEXT NOT NULL,
  services_category TEXT DEFAULT 'General',
  services_duration INTEGER DEFAULT 60,
  services_duration_unit TEXT DEFAULT 'minutes',
  services_price REAL DEFAULT 0,
  services_currency TEXT DEFAULT 'USD',
  services_participants TEXT DEFAULT '[{"count":1,"label":"Individual","price":0}]',
  services_description TEXT,
  services_landing_visible INTEGER DEFAULT 0,
  services_landing_title TEXT,
  services_landing_paragraph TEXT,
  services_landing_image TEXT,
  services_landing_icon TEXT,
  services_landing_order INTEGER DEFAULT 0,
  services_landing_cta TEXT DEFAULT 'Consultar',
  services_active INTEGER DEFAULT 1,
  services_created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  services_updated_at TEXT,
  services_deleted_at TEXT,
  services_created_by TEXT,
  services_updated_by TEXT
);

-- 0003_users_auth: users + auth_sessions
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lastname TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  display_label TEXT,
  active INTEGER DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT,
  allowed_types TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 0004_finance_movements
CREATE TABLE IF NOT EXISTS finance_movements (
  id TEXT PRIMARY KEY,
  persona_id TEXT,
  persona_nombre TEXT,
  servicio TEXT,
  services_id TEXT,
  monto REAL NOT NULL,
  metodo_pago TEXT NOT NULL DEFAULT 'Efectivo',
  estado TEXT NOT NULL DEFAULT 'Pendiente',
  fecha TEXT NOT NULL,
  hora TEXT,
  banco_id TEXT,
  referencia_transaccion TEXT,
  observaciones TEXT,
  tipo_movimiento TEXT DEFAULT 'ingreso',
  moneda TEXT DEFAULT 'USD',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT,
  fecha_vencimiento TEXT,
  pagado_en TEXT,
  pagado_por_user_id TEXT,
  comprobante_url TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT,
  FOREIGN KEY (persona_id) REFERENCES people(id),
  FOREIGN KEY (services_id) REFERENCES services(services_id),
  FOREIGN KEY (banco_id) REFERENCES bank_configs(id)
);

-- 0005_agenda_events
CREATE TABLE IF NOT EXISTS agenda_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  meta TEXT,
  category TEXT DEFAULT 'general',
  tone TEXT DEFAULT 'neutro',
  status TEXT DEFAULT 'Pendiente',
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  all_day INTEGER DEFAULT 0,
  location_type TEXT DEFAULT 'en_clinica',
  meeting_url TEXT,
  location_department TEXT,
  location_reference TEXT,
  tiempo_previo_minutes INTEGER DEFAULT 0,
  tiempo_posterior_minutes INTEGER DEFAULT 0,
  assigned_user_id TEXT,
  person_id TEXT,
  services_id TEXT,
  is_recurring INTEGER DEFAULT 0,
  recurring_rule TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (services_id) REFERENCES services(services_id),
  FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS agenda_event_instances (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  status TEXT DEFAULT 'Pendiente',
  is_confirmed INTEGER DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (event_id) REFERENCES agenda_events(id)
);

-- 0006_tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_user_id TEXT,
  priority TEXT DEFAULT 'Media',
  due_at TEXT,
  status TEXT DEFAULT 'Pendiente',
  category TEXT DEFAULT 'Administrativa',
  related_entity_type TEXT,
  related_entity_id TEXT,
  person_id TEXT,
  event_id TEXT,
  services_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  completed_at TEXT,
  completed_by_user_id TEXT,
  updated_by_user_id TEXT,
  FOREIGN KEY (assigned_user_id) REFERENCES users(id),
  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (event_id) REFERENCES agenda_events(id),
  FOREIGN KEY (services_id) REFERENCES services(services_id)
);

-- 0007_blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  status TEXT DEFAULT 'draft',
  author_id TEXT,
  published_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 0008_palette
CREATE TABLE IF NOT EXISTS palette_settings (
  id TEXT PRIMARY KEY,
  theme TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 0016_module_permissions
CREATE TABLE IF NOT EXISTS module_permissions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK(role IN ('root','admin','asistente','colaborador')),
  module TEXT NOT NULL,
  can_read INTEGER DEFAULT 1,
  can_create INTEGER DEFAULT 0,
  can_edit INTEGER DEFAULT 0,
  can_delete INTEGER DEFAULT 0,
  updated_at TEXT,
  UNIQUE(role, module)
);

-- ============================================================
-- SEEDS
-- ============================================================

-- seed_usuarios
INSERT OR IGNORE INTO usuarios (user_id, user_name_1, user_lastname_1, user_phone, user_email, user_status, user_created_date, user_created_at)
VALUES
  ('usr-001', 'Ana', 'Pérez', '+505 8888 1001', 'ana.perez@email.com', 'Activo', '2026-06-01', '2026-06-01T00:00:00.000Z'),
  ('usr-002', 'Empresa ABC', '—', '+505 8888 1002', 'rrhh@empresaabc.com', 'Activo', '2026-05-20', '2026-05-20T00:00:00.000Z');

-- seed_services_landing
INSERT OR IGNORE INTO services (services_id, services_name, services_duration, services_price, services_description, services_category, services_active, services_landing_visible)
VALUES
  ('svc-001', 'Consulta individual', 60, 30.00, 'Atención psicológica individual con modalidad a coordinar.', 'Terapia individual', 1, 1),
  ('svc-002', 'Terapia familiar', 90, 50.00, 'Espacio de acompañamiento terapéutico para familias.', 'Terapia familiar', 1, 1);

-- seed_bank_configs
INSERT OR IGNORE INTO bank_configs (id, name, active, display_order, created_at)
VALUES
  ('bank-bac', 'BAC', 1, 1, '2026-06-14T00:00:00.000Z'),
  ('bank-lafise', 'LAFISE', 1, 2, '2026-06-14T00:00:00.000Z');

-- seed_users_credentials (password: root)
INSERT OR IGNORE INTO users (id, name, lastname, role, username, email, password_hash, display_label, active, created_at)
VALUES
  ('root', 'Root', 'Admin', 'root', 'root', 'root@nexo.local', '4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2', 'Root Admin', 1, datetime('now')),
  ('usr-admin', 'Admin', 'User', 'admin', 'admin', 'admin@nexo.local', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin User', 1, datetime('now')),
  ('usr-asistente', 'Asistente', 'User', 'asistente', 'asis', 'asis@nexo.local', '3b0f4397bb0cf0b3f97704aa31b20accf225710ad86e83c9cbc63b706fd1f1d3', 'Asistente User', 1, datetime('now')),
  ('usr-colaborador', 'Colaborador', 'User', 'colaborador', 'colab', 'colab@nexo.local', 'f2c7c2aa06a1c44c175729dd3c88c34e66e355628d13364336b32cb858bf50d6', 'Colaborador User', 1, datetime('now'));

-- seed_module_permissions
INSERT OR IGNORE INTO module_permissions (id, role, module, can_read, can_create, can_edit, can_delete) VALUES
  ('perm-root-usuarios','root','usuarios',1,1,1,1), ('perm-root-finanzas','root','finanzas',1,1,1,1),
  ('perm-root-agenda','root','agenda',1,1,1,1), ('perm-root-tareas','root','tareas',1,1,1,1),
  ('perm-root-configuracion','root','configuracion',1,1,1,1), ('perm-root-auditoria','root','auditoria',1,1,1,1),
  ('perm-root-blog','root','blog',1,1,1,1),
  ('perm-admin-usuarios','admin','usuarios',1,1,1,1), ('perm-admin-finanzas','admin','finanzas',1,1,1,1),
  ('perm-admin-agenda','admin','agenda',1,1,1,1), ('perm-admin-tareas','admin','tareas',1,1,1,1),
  ('perm-admin-configuracion','admin','configuracion',1,1,1,1), ('perm-admin-auditoria','admin','auditoria',0,0,0,0),
  ('perm-admin-blog','admin','blog',0,0,0,0),
  ('perm-colaborador-usuarios','colaborador','usuarios',0,0,0,0), ('perm-colaborador-finanzas','colaborador','finanzas',0,0,0,0),
  ('perm-colaborador-agenda','colaborador','agenda',1,1,1,0), ('perm-colaborador-tareas','colaborador','tareas',1,1,1,0),
  ('perm-colaborador-configuracion','colaborador','configuracion',0,0,0,0), ('perm-colaborador-auditoria','colaborador','auditoria',0,0,0,0),
  ('perm-colaborador-blog','colaborador','blog',0,0,0,0),
  ('perm-asistente-usuarios','asistente','usuarios',1,1,1,1), ('perm-asistente-finanzas','asistente','finanzas',1,1,1,1),
  ('perm-asistente-agenda','asistente','agenda',1,1,1,1), ('perm-asistente-tareas','asistente','tareas',1,1,1,1),
  ('perm-asistente-configuracion','asistente','configuracion',1,0,0,0), ('perm-asistente-auditoria','asistente','auditoria',0,0,0,0),
  ('perm-asistente-blog','asistente','blog',0,0,0,0);
