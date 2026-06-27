INSERT OR IGNORE INTO agenda_events (id, title, meta, category, tone, status, assigned_user_id, person_id, starts_at, ends_at, location_type, service_id, created_at, updated_at) VALUES

('evt-501', 'Consulta individual', 'Sesión 1 - Primer contacto', 'Consultas', 'neutro', 'Pendiente', 'root', 'per-005', '2026-06-18T15:00:00.000Z', '2026-06-18T16:00:00.000Z', 'remoto', 'consulta-individual', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z'),
('evt-502', 'Consulta individual', 'Sesión 2 - Evaluación', 'Consultas', 'neutro', 'Pendiente', 'root', 'per-005', '2026-06-25T15:00:00.000Z', '2026-06-25T16:00:00.000Z', 'en_clinica', 'consulta-individual', '2026-06-18T00:00:00.000Z', '2026-06-18T00:00:00.000Z'),
('evt-503', 'Consulta individual', 'Sesión 3 - Seguimiento', 'Consultas', 'neutro', 'Pendiente', 'root', 'per-005', '2026-07-02T15:00:00.000Z', '2026-07-02T16:00:00.000Z', 'en_clinica', 'consulta-individual', '2026-06-25T00:00:00.000Z', '2026-06-25T00:00:00.000Z'),

('evt-701', 'Consulta individual', 'Sesión 1 - Evaluación inicial', 'Consultas', 'correcto', 'Completado', 'root', 'per-007', '2026-03-25T09:00:00.000Z', '2026-03-25T10:00:00.000Z', 'en_clinica', 'consulta-individual', '2026-03-20T00:00:00.000Z', '2026-03-25T00:00:00.000Z'),
('evt-702', 'Consulta individual', 'Sesión 2 - Seguimiento', 'Consultas', 'atencion', 'Completado', 'root', 'per-007', '2026-04-08T09:00:00.000Z', '2026-04-08T10:00:00.000Z', 'en_clinica', 'consulta-individual', '2026-03-25T00:00:00.000Z', '2026-04-08T00:00:00.000Z'),
('evt-703', 'Consulta individual', 'Sesión 3 - Abandono', 'Consultas', 'neutro', 'Cancelado', 'root', 'per-007', '2026-04-22T09:00:00.000Z', '2026-04-22T10:00:00.000Z', 'en_clinica', 'consulta-individual', '2026-04-08T00:00:00.000Z', '2026-04-22T00:00:00.000Z');
