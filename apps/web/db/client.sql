-- ============================================================
-- NEXO — Base de datos del cliente
-- Contiene todas las tablas operativas + datos de semilla
-- ============================================================

-- 0001_local_core: people + bank_configs
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  nombre_1 TEXT NOT NULL,
  nombre_2 TEXT,
  apellido_1 TEXT NOT NULL,
  apellido_2 TEXT,
  telefono TEXT NOT NULL,
  telefono_adicional TEXT,
  contacto_adicional_nombre TEXT,
  contacto_adicional_apellido TEXT,
  email TEXT,
  estado TEXT NOT NULL DEFAULT 'Pendiente',
  fuente TEXT,
  fecha_creacion TEXT NOT NULL,
  ultima_interaccion TEXT,
  proximo_evento_fecha TEXT,
  proxima_actividad TEXT,
  proxima_actividad_detalle TEXT,
  consentimiento_contacto INTEGER DEFAULT 1,
  assigned_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT
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

-- 0002_services
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER DEFAULT 60,
  price REAL DEFAULT 0,
  description TEXT,
  category TEXT,
  color TEXT,
  max_participants INTEGER,
  is_online INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  landing_visible INTEGER DEFAULT 1,
  landing_description TEXT,
  landing_image TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT
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
  updated_by_user_id TEXT
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
  service_id TEXT,
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
  FOREIGN KEY (service_id) REFERENCES services(id),
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
  service_id TEXT,
  is_recurring INTEGER DEFAULT 0,
  recurring_rule TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
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
  service_id TEXT,
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
  FOREIGN KEY (service_id) REFERENCES services(id)
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
  role TEXT NOT NULL CHECK(role IN ('root','admin','doctor','asistente')),
  module TEXT NOT NULL,
  can_read INTEGER DEFAULT 1,
  can_create INTEGER DEFAULT 0,
  can_edit INTEGER DEFAULT 0,
  updated_at TEXT,
  UNIQUE(role, module)
);

-- ============================================================
-- SEEDS
-- ============================================================

-- seed_people
INSERT OR IGNORE INTO people (id, nombre_1, apellido_1, telefono, email, estado, fecha_creacion, created_at)
VALUES
  ('per-001', 'Ana', 'Pérez', '+505 8888 1001', 'ana.perez@email.com', 'Activo', '2026-06-01', '2026-06-01T00:00:00.000Z'),
  ('per-002', 'Empresa', 'ABC', '+505 8888 1002', 'rrhh@empresaabc.com', 'Activo', '2026-05-20', '2026-05-20T00:00:00.000Z');

-- seed_services_landing
INSERT OR IGNORE INTO services (id, name, duration, price, description, category, active, landing_visible)
VALUES
  ('consulta-individual', 'Consulta individual', 60, 30.00, 'Atención psicológica individual con modalidad a coordinar.', 'Terapia individual', 1, 1),
  ('terapia-familiar', 'Terapia familiar', 90, 50.00, 'Espacio de acompañamiento terapéutico para familias.', 'Terapia familiar', 1, 1);

-- seed_bank_configs
INSERT OR IGNORE INTO bank_configs (id, name, active, display_order, created_at)
VALUES
  ('bank-bac', 'BAC', 1, 1, '2026-06-14T00:00:00.000Z'),
  ('bank-lafise', 'LAFISE', 1, 2, '2026-06-14T00:00:00.000Z');

-- seed_users_credentials (password: admin123)
INSERT OR IGNORE INTO users (id, name, lastname, role, username, email, password_hash, display_label, active, created_at)
VALUES
  ('root', 'Root', 'Admin', 'root', 'root', 'root@clinica.com', '4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2', 'root', 1, datetime('now')),
  ('admin', 'Admin', 'Clínica', 'admin', 'admin', 'admin@clinica.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin', 1, datetime('now')),
  ('doctor', 'Doctor', 'Principal', 'doctor', 'doc', 'doc@clinica.com', '139d544b821b13ebea14f1b0fe18577222e415c2966e3a3511c4196055232202', 'doctor', 1, datetime('now')),
  ('asistente', 'Asistente', 'Administrativo', 'asistente', 'asis', 'asis@clinica.com', '105f495d894006d1dd5a432123573c88bdc64b58949d98af4c26e238f8be28a4', 'asistente', 1, datetime('now'));

-- seed_module_permissions
INSERT OR IGNORE INTO module_permissions (id, role, module, can_read, can_create, can_edit) VALUES
  ('perm-root-personas','root','personas',1,1,1), ('perm-root-finanzas','root','finanzas',1,1,1),
  ('perm-root-agenda','root','agenda',1,1,1), ('perm-root-tareas','root','tareas',1,1,1),
  ('perm-root-configuracion','root','configuracion',1,1,1), ('perm-root-auditoria','root','auditoria',1,1,1),
  ('perm-root-blog','root','blog',1,1,1),
  ('perm-admin-personas','admin','personas',1,1,1), ('perm-admin-finanzas','admin','finanzas',1,1,1),
  ('perm-admin-agenda','admin','agenda',1,1,1), ('perm-admin-tareas','admin','tareas',1,1,1),
  ('perm-admin-configuracion','admin','configuracion',1,1,1), ('perm-admin-auditoria','admin','auditoria',0,0,0),
  ('perm-admin-blog','admin','blog',0,0,0),
  ('perm-doctor-personas','doctor','personas',0,0,0), ('perm-doctor-finanzas','doctor','finanzas',0,0,0),
  ('perm-doctor-agenda','doctor','agenda',1,1,1), ('perm-doctor-tareas','doctor','tareas',1,1,1),
  ('perm-doctor-configuracion','doctor','configuracion',0,0,0), ('perm-doctor-auditoria','doctor','auditoria',0,0,0),
  ('perm-doctor-blog','doctor','blog',0,0,0),
  ('perm-asistente-personas','asistente','personas',1,1,1), ('perm-asistente-finanzas','asistente','finanzas',1,1,1),
  ('perm-asistente-agenda','asistente','agenda',1,1,1), ('perm-asistente-tareas','asistente','tareas',1,1,1),
  ('perm-asistente-configuracion','asistente','configuracion',1,0,0), ('perm-asistente-auditoria','asistente','auditoria',0,0,0),
  ('perm-asistente-blog','asistente','blog',0,0,0);
