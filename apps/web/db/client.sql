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
  active INTEGER DEFAULT 1,
  landing_visible INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT
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
  tipo_movimiento TEXT DEFAULT 'ingreso',
  moneda TEXT DEFAULT 'USD',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT,
  fecha_vencimiento TEXT,
  pagado_en TEXT,
  created_by_user_id TEXT,
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
  person_id TEXT,
  event_id TEXT,
  service_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  completed_at TEXT,
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

-- ============================================================
-- SEEDS
-- ============================================================

-- seed_people
INSERT OR IGNORE INTO people (id, nombre_1, apellido_1, telefono, email, estado, fecha_creacion, created_at)
VALUES
  ('per-demo-1', 'Juan', 'Pérez', '+50588880001', 'juan@demo.local', 'Activo', datetime('now'), datetime('now')),
  ('per-demo-2', 'María', 'García', '+50588880002', 'maria@demo.local', 'Activo', datetime('now'), datetime('now'));

-- seed_services_landing
INSERT OR IGNORE INTO services (id, name, duration, price, description, category, active, landing_visible)
VALUES
  ('svc-demo-1', 'Servicio Demo 1', 60, 50.00, 'Descripción del servicio demo 1.', 'Categoría Demo', 1, 1),
  ('svc-demo-2', 'Servicio Demo 2', 45, 35.00, 'Descripción del servicio demo 2.', 'Categoría Demo', 1, 1);

-- seed_users_credentials (password: admin123)
INSERT OR IGNORE INTO users (id, name, lastname, role, username, email, password_hash, display_label, active, created_at)
VALUES
  ('usr-root', 'Root', 'Admin', 'root', 'root', 'root@nexo.local', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Root Admin', 1, datetime('now')),
  ('usr-admin', 'Admin', 'User', 'admin', 'admin', 'admin@nexo.local', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin User', 1, datetime('now'));
