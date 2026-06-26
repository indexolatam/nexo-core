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
  deleted_at TEXT,
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
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT
);

INSERT OR IGNORE INTO people (
  id, nombre_1, nombre_2, apellido_1, apellido_2, telefono, email, estado,
  fuente, fecha_creacion, ultima_interaccion, proxima_actividad,
  proxima_actividad_detalle, assigned_user_id, created_at, updated_at
) VALUES
  ('per-001', 'Ana', NULL, 'Pérez', NULL, '+505 8888 1001', 'ana.perez@email.com', 'Activo', 'WhatsApp', '2026-06-01', '2026-06-12', 'Martes 14:00', 'Consulta de seguimiento', 'doctor', '2026-06-01T00:00:00.000Z', '2026-06-12T00:00:00.000Z'),
  ('per-002', 'Empresa', NULL, 'ABC', NULL, '+505 8888 1002', 'rrhh@empresaabc.com', 'Activo', 'Referencia', '2026-05-20', '2026-06-11', 'Jueves 09:30', 'Seguimiento de propuesta', 'asistente', '2026-05-20T00:00:00.000Z', '2026-06-11T00:00:00.000Z');

INSERT OR IGNORE INTO bank_configs (id, name, active, display_order, created_at)
VALUES
  ('bank-bac', 'BAC', 1, 1, '2026-06-14T00:00:00.000Z'),
  ('bank-lafise', 'LAFISE', 1, 2, '2026-06-14T00:00:00.000Z');
