-- 0019_services_redesign
-- Migra la tabla services al prefijo services_ + elimina columnas legacy

-- 1. Crear tabla temporal con nuevo schema
CREATE TABLE IF NOT EXISTS services_new (
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

-- 2. Migrar datos existentes
INSERT INTO services_new (
  services_id, services_name, services_category,
  services_duration, services_price,
  services_description, services_active,
  services_landing_visible, services_landing_paragraph, services_landing_image,
  services_created_at, services_updated_at, services_deleted_at,
  services_created_by, services_updated_by
)
SELECT
  id, name, category,
  duration, price,
  description, active,
  landing_visible, landing_description, landing_image,
  created_at, updated_at, deleted_at,
  created_by_user_id, updated_by_user_id
FROM services;

-- 3. Eliminar tabla antigua
DROP TABLE IF EXISTS services;

-- 4. Renombrar nueva tabla
ALTER TABLE services_new RENAME TO services;

-- 5. Actualizar FKs en tablas dependientes
ALTER TABLE finance_movements RENAME COLUMN service_id TO services_id;
ALTER TABLE agenda_events RENAME COLUMN service_id TO services_id;
ALTER TABLE tasks RENAME COLUMN service_id TO services_id;

-- 6. Seeds de ejemplo
INSERT OR IGNORE INTO services (
  services_id, services_name, services_category,
  services_duration, services_duration_unit, services_price, services_currency,
  services_participants, services_description,
  services_landing_visible, services_landing_title, services_landing_paragraph,
  services_landing_icon, services_landing_order, services_landing_cta,
  services_active, services_created_at
) VALUES
  ('svc-001', 'Consulta individual', 'Terapia',
   60, 'minutes', 30, 'USD',
   '[{"count":1,"label":"Individual","price":30}]',
   'Atención terapéutica individual.',
   1, 'Consulta Individual', 'Atención psicológica personalizada.',
   'HeartOutlined', 1, 'Agendar',
   1, datetime('now')),
  ('svc-002', 'Terapia de pareja', 'Terapia',
   90, 'minutes', 50, 'USD',
   '[{"count":2,"label":"Pareja","price":50}]',
   'Sesión terapéutica para parejas.',
   1, 'Terapia de Pareja', 'Espacio de acompañamiento para parejas.',
   'TeamOutlined', 2, 'Agendar',
   1, datetime('now')),
  ('svc-003', 'Membresía mensual', 'Membresía',
   1, 'months', 80, 'USD',
   '[{"count":1,"label":"Individual","price":80}]',
   'Acceso mensual a servicios.',
   0, NULL, NULL,
   NULL, 0, 'Consultar',
   1, datetime('now')),
  ('svc-004', 'Taller grupal', 'Taller',
   3, 'hours', 15, 'USD',
   '[{"count":10,"label":"Grupo (10 personas)","price":15}]',
   'Taller participativo grupal.',
   1, 'Taller Grupal', 'Aprende en grupo con acompañamiento.',
   'TeamOutlined', 3, 'Inscribirme',
   1, datetime('now'));
