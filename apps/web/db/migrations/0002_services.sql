CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price REAL NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  category TEXT,
  color TEXT,
  max_participants INTEGER,
  is_online INTEGER NOT NULL DEFAULT 0,
  landing_visible INTEGER NOT NULL DEFAULT 0,
  landing_description TEXT,
  landing_image TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT
);

INSERT OR IGNORE INTO services (
  id, name, duration, price, active, category, color, is_online,
  landing_visible, landing_description, created_at, updated_at
) VALUES
  ('consulta-individual', 'Consulta individual', 60, 30, 1, 'Terapia individual', '#60a5fa', 1, 1, 'Atención psicológica individual con modalidad a coordinar.', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),
  ('terapia-familiar', 'Terapia familiar', 90, 50, 1, 'Terapia familiar', '#34d399', 0, 1, 'Espacio de acompañamiento para familias, sujeto a disponibilidad.', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z');
