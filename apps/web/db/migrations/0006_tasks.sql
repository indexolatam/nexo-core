CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_user_id TEXT,
  priority TEXT NOT NULL DEFAULT 'Media',
  due_at TEXT,
  status TEXT NOT NULL DEFAULT 'Pendiente',
  category TEXT NOT NULL DEFAULT 'Administrativa',
  related_entity_type TEXT,
  related_entity_id TEXT,
  person_id TEXT,
  event_id TEXT,
  service_id TEXT,
  completed_at TEXT,
  completed_by_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT,
  FOREIGN KEY (assigned_user_id) REFERENCES users(id),
  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (event_id) REFERENCES agenda_events(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

INSERT OR IGNORE INTO tasks (
  id, title, description, assigned_user_id, priority, due_at, status, category,
  related_entity_type, related_entity_id, person_id, created_at, updated_at
) VALUES
  ('task-001', 'Confirmar cita Ana Pérez', 'Llamar para confirmar asistencia a consulta del lunes 14:00.', 'asistente', 'Alta', '2026-06-12T11:00', 'Pendiente', 'Consulta', 'evento', 'evt-004', 'per-001', '2026-06-01T00:00:00.000Z', '2026-06-12T00:00:00.000Z'),
  ('task-002', 'Preparar materiales taller ansiedad', 'Imprimir fichas, preparar sala y verificar proyector.', 'doctor', 'Media', '2026-06-12', 'En curso', 'Taller', NULL, NULL, NULL, '2026-06-01T00:00:00.000Z', '2026-06-12T00:00:00.000Z'),
  ('task-003', 'Llamar Empresa ABC', 'Confirmar participación en capacitación de la próxima semana.', 'asistente', 'Alta', '2026-06-13', 'Pendiente', 'Empresa', 'empresa', 'per-002', 'per-002', '2026-06-01T00:00:00.000Z', '2026-06-12T00:00:00.000Z'),
  ('task-004', 'Redactar artículo blog', 'Escribir artículo sobre manejo de ansiedad para publicación semanal.', 'doctor', 'Media', '2026-06-12', 'Pendiente', 'Marketing', NULL, NULL, NULL, '2026-06-01T00:00:00.000Z', '2026-06-12T00:00:00.000Z'),
  ('task-005', 'Seguimiento paciente Carlos Pérez', 'Llamar para ver evolución post-consulta.', 'doctor', 'Alta', '2026-06-12T12:00', 'Pendiente', 'Seguimiento', 'persona', NULL, NULL, '2026-06-01T00:00:00.000Z', '2026-06-12T00:00:00.000Z');
