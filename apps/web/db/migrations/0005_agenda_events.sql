CREATE TABLE IF NOT EXISTS agenda_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  meta TEXT,
  category TEXT NOT NULL DEFAULT 'Consultas',
  tone TEXT,
  status TEXT NOT NULL DEFAULT 'Pendiente',
  assigned_user_id TEXT,
  person_id TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  tiempo_previo_minutes INTEGER,
  tiempo_posterior_minutes INTEGER,
  location_type TEXT NOT NULL DEFAULT 'en_clinica',
  location_department TEXT,
  location_reference TEXT,
  meeting_url TEXT,
  service_id TEXT,
  is_recurring INTEGER NOT NULL DEFAULT 0,
  recurrence_frecuencia TEXT,
  recurrence_interval INTEGER,
  recurrence_dias_semana TEXT,
  recurrence_dia_mes INTEGER,
  recurrence_count INTEGER,
  recurrence_fin TEXT,
  recurrence_ajustar_laboral INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT,
  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (assigned_user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS agenda_event_instances (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  status TEXT NOT NULL DEFAULT 'Pendiente',
  is_confirmed INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (event_id) REFERENCES agenda_events(id)
);

INSERT OR IGNORE INTO agenda_events (
  id, title, meta, category, tone, status, assigned_user_id, person_id,
  starts_at, ends_at, location_type, created_at, updated_at
) VALUES
  ('evt-001', 'Consulta', 'Confirmada', 'Consultas', 'correcto', 'Confirmado', 'doctor', 'per-001', '2026-06-12T09:00:00.000Z', '2026-06-12T10:00:00.000Z', 'en_clinica', '2026-06-01T00:00:00.000Z', '2026-06-12T00:00:00.000Z'),
  ('evt-002', 'Consulta', 'Confirmada', 'Consultas', 'correcto', 'Confirmado', 'doctor', NULL, '2026-06-12T10:00:00.000Z', '2026-06-12T11:00:00.000Z', 'en_clinica', '2026-06-01T00:00:00.000Z', '2026-06-12T00:00:00.000Z'),
  ('evt-003', 'Grabación Reel', 'Contenido', 'Marketing', 'neutro', 'En curso', 'asistente', NULL, '2026-06-12T11:30:00.000Z', '2026-06-12T12:30:00.000Z', 'remoto', '2026-06-01T00:00:00.000Z', '2026-06-12T00:00:00.000Z'),
  ('evt-004', 'Consulta', 'Pendiente de confirmar', 'Consultas', 'atencion', 'Pendiente', 'doctor', 'per-001', '2026-06-12T14:00:00.000Z', '2026-06-12T15:00:00.000Z', 'en_clinica', '2026-06-01T00:00:00.000Z', '2026-06-12T00:00:00.000Z'),
  ('evt-005', 'Empresa ABC', 'Actividad empresarial', 'Empresas', 'correcto', 'Confirmado', 'asistente', 'per-002', '2026-06-13T09:30:00.000Z', '2026-06-13T11:00:00.000Z', 'en_campo', '2026-06-01T00:00:00.000Z', '2026-06-12T00:00:00.000Z');
