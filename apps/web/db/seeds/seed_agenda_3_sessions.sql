INSERT OR IGNORE INTO agenda_events (id, title, meta, category, tone, status, assigned_user_id, person_id, starts_at, ends_at, location_type, services_id, created_at, updated_at) VALUES

('evt-101', 'Consulta individual', 'Sesión 1 - Evaluación inicial', 'Consultas', 'correcto', 'Completado', 'root', 'per-001', '2026-06-01T09:00:00.000Z', '2026-06-01T10:00:00.000Z', 'en_clinica', 'svc-001', '2026-05-25T00:00:00.000Z', '2026-06-01T00:00:00.000Z'),
('evt-102', 'Consulta individual', 'Sesión 2 - Seguimiento', 'Consultas', 'correcto', 'Confirmado', 'root', 'per-001', '2026-06-08T09:00:00.000Z', '2026-06-08T10:00:00.000Z', 'en_clinica', 'svc-001', '2026-06-01T00:00:00.000Z', '2026-06-08T00:00:00.000Z'),
('evt-103', 'Consulta individual', 'Sesión 3 - Revisión', 'Consultas', 'neutro', 'Pendiente', 'root', 'per-001', '2026-06-22T09:00:00.000Z', '2026-06-22T10:00:00.000Z', 'remoto', 'svc-001', '2026-06-08T00:00:00.000Z', '2026-06-08T00:00:00.000Z'),

('evt-201', 'Taller bienestar laboral', 'Sesión 1 - Diagnóstico', 'Empresas', 'correcto', 'Completado', 'root', 'per-002', '2026-06-03T14:00:00.000Z', '2026-06-03T15:30:00.000Z', 'en_campo', 'svc-002', '2026-05-28T00:00:00.000Z', '2026-06-03T00:00:00.000Z'),
('evt-202', 'Taller bienestar laboral', 'Sesión 2 - Capacitación', 'Empresas', 'correcto', 'Confirmado', 'root', 'per-002', '2026-06-17T14:00:00.000Z', '2026-06-17T15:30:00.000Z', 'en_campo', 'svc-002', '2026-06-03T00:00:00.000Z', '2026-06-03T00:00:00.000Z'),
('evt-203', 'Taller bienestar laboral', 'Sesión 3 - Seguimiento', 'Empresas', 'neutro', 'Pendiente', 'root', 'per-002', '2026-07-01T14:00:00.000Z', '2026-07-01T15:30:00.000Z', 'en_campo', 'svc-002', '2026-06-17T00:00:00.000Z', '2026-06-17T00:00:00.000Z'),

('evt-301', 'Consulta individual', 'Sesión 1 - Evaluación', 'Consultas', 'correcto', 'Confirmado', 'root', 'per-003', '2026-06-15T10:00:00.000Z', '2026-06-15T11:00:00.000Z', 'en_clinica', 'svc-001', '2026-06-10T00:00:00.000Z', '2026-06-10T00:00:00.000Z'),
('evt-302', 'Consulta individual', 'Sesión 2 - Seguimiento', 'Consultas', 'neutro', 'Pendiente', 'root', 'per-003', '2026-06-22T10:00:00.000Z', '2026-06-22T11:00:00.000Z', 'en_clinica', 'svc-001', '2026-06-15T00:00:00.000Z', '2026-06-15T00:00:00.000Z'),
('evt-303', 'Consulta individual', 'Sesión 3 - Cierre', 'Consultas', 'neutro', 'Pendiente', 'root', 'per-003', '2026-06-29T10:00:00.000Z', '2026-06-29T11:00:00.000Z', 'remoto', 'svc-001', '2026-06-22T00:00:00.000Z', '2026-06-22T00:00:00.000Z'),

('evt-401', 'Consulta individual', 'Sesión 1 - Valoración', 'Consultas', 'correcto', 'Confirmado', 'root', 'per-004', '2026-06-16T11:00:00.000Z', '2026-06-16T12:00:00.000Z', 'en_clinica', 'svc-001', '2026-06-13T00:00:00.000Z', '2026-06-13T00:00:00.000Z'),
('evt-402', 'Consulta individual', 'Sesión 2 - Terapia', 'Consultas', 'neutro', 'Pendiente', 'root', 'per-004', '2026-06-23T11:00:00.000Z', '2026-06-23T12:00:00.000Z', 'remoto', 'svc-001', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:00.000Z'),
('evt-403', 'Consulta individual', 'Sesión 3 - Seguimiento', 'Consultas', 'neutro', 'Pendiente', 'root', 'per-004', '2026-06-30T11:00:00.000Z', '2026-06-30T12:00:00.000Z', 'en_clinica', 'svc-001', '2026-06-23T00:00:00.000Z', '2026-06-23T00:00:00.000Z'),

('evt-601', 'Terapia familiar', 'Sesión 1 - Familiar', 'Talleres', 'correcto', 'Completado', 'root', 'per-006', '2026-06-05T16:00:00.000Z', '2026-06-05T17:30:00.000Z', 'en_clinica', 'svc-002', '2026-05-20T00:00:00.000Z', '2026-06-05T00:00:00.000Z'),
('evt-602', 'Terapia familiar', 'Sesión 2 - Familiar', 'Talleres', 'atencion', 'En curso', 'root', 'per-006', '2026-06-12T16:00:00.000Z', '2026-06-12T17:30:00.000Z', 'en_clinica', 'svc-002', '2026-06-05T00:00:00.000Z', '2026-06-12T00:00:00.000Z'),
('evt-603', 'Terapia familiar', 'Sesión 3 - Cierre', 'Talleres', 'neutro', 'Pendiente', 'root', 'per-006', '2026-06-26T16:00:00.000Z', '2026-06-26T17:30:00.000Z', 'en_clinica', 'svc-002', '2026-06-12T00:00:00.000Z', '2026-06-12T00:00:00.000Z');
