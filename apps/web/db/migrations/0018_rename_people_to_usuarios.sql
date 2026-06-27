-- 0018: Renombrar people → usuarios con nuevo schema
-- Crea nueva tabla, migra datos, actualiza FK, elimina tabla vieja

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

-- Migrar datos existentes
INSERT INTO usuarios (
  user_id, user_name_1, user_name_2, user_lastname_1, user_lastname_2,
  user_phone, user_email, user_status, user_source, user_created_date,
  user_last_interaction, user_next_activity, user_next_activity_detail,
  user_consent, user_assigned_to, user_created_at, user_updated_at,
  user_deleted_at, user_created_by, user_updated_by,
  user_types, user_tags, user_admin_notes
)
SELECT
  id, nombre_1, nombre_2, apellido_1, apellido_2,
  telefono, email, estado, fuente, fecha_creacion,
  ultima_interaccion, proxima_actividad, proxima_actividad_detalle,
  consentimiento_contacto, assigned_user_id, created_at, updated_at,
  deleted_at, created_by_user_id, updated_by_user_id,
  tipos, etiquetas, observaciones_administrativas
FROM people;

-- Actualizar FK en otras tablas
UPDATE module_permissions SET module = 'usuarios' WHERE module = 'personas';

-- Eliminar tabla antigua
DROP TABLE IF EXISTS people;
