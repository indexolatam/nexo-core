INSERT OR IGNORE INTO services (id, name, duration, price, active, description, category, color, is_online, landing_visible, landing_description, created_at, updated_at) VALUES
('psicoterapia-individual', 'Psicoterapia individual', 60, 30, 1,
 'Acompañamiento psicológico individual para procesos personales y emocionales. Incluye modalidad presencial o remota.',
 'Terapia individual', '#60a5fa', 1, 1,
 'Acompañamiento psicológico para procesos personales y emocionales.',
 '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('terapia-pareja', 'Terapia de pareja', 60, 40, 1,
 'Orientación profesional para mejorar comunicación, acuerdos y convivencia en pareja. Disponible presencial o remoto.',
 'Terapia pareja', '#f472b6', 1, 1,
 'Orientación para mejorar comunicación, acuerdos y convivencia.',
 '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('psicologia-infantil', 'Psicología infantil', 45, 30, 1,
 'Orientación psicológica para niños, niñas y familias. Sesiones adaptadas a la edad del paciente.',
 'Terapia individual', '#a78bfa', 0, 1,
 'Orientación psicológica para niños, niñas y familias.',
 '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('talleres', 'Talleres grupales', 120, 25, 1,
 'Actividades grupales sobre bienestar emocional y habilidades socioemocionales. Precio por persona.',
 'Taller', '#fbbf24', 1, 1,
 'Actividades grupales sobre bienestar y habilidades socioemocionales.',
 '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('empresas', 'Actividades empresariales', 180, 150, 1,
 'Charlas, capacitaciones y actividades de bienestar laboral para organizaciones. Precio base por sesión grupal.',
 'Empresa', '#34d399', 1, 1,
 'Charlas y actividades para organizaciones.',
 '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z');

UPDATE services SET
  category = 'Terapia familiar',
  color = '#34d399',
  is_online = 1,
  landing_visible = 1,
  landing_description = 'Acompañamiento para dinámicas familiares y espacios de diálogo.',
  description = 'Espacio de acompañamiento terapéutico para familias. Modalidad presencial o remota.',
  updated_at = '2026-06-14T00:00:00.000Z'
WHERE id = 'terapia-familiar';

UPDATE services SET
  category = 'Terapia individual',
  color = '#60a5fa',
  is_online = 1,
  landing_visible = 1,
  landing_description = 'Acompañamiento psicológico para procesos personales y emocionales.',
  updated_at = '2026-06-14T00:00:00.000Z'
WHERE id = 'consulta-individual';
