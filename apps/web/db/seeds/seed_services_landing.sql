INSERT OR IGNORE INTO services (
  services_id, services_name, services_duration, services_price,
  services_active, services_description, services_category,
  services_landing_visible, services_landing_paragraph, services_landing_icon,
  services_created_at, services_updated_at
) VALUES
('svc-001', 'Psicoterapia individual', 60, 30, 1,
 'Acompañamiento psicológico individual para procesos personales y emocionales. Incluye modalidad presencial o remota.',
 'Terapia individual', 1,
 'Acompañamiento psicológico para procesos personales y emocionales.',
 'HeartOutlined',
 '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('svc-002', 'Terapia de pareja', 60, 40, 1,
 'Orientación profesional para mejorar comunicación, acuerdos y convivencia en pareja. Disponible presencial o remoto.',
 'Terapia pareja', 1,
 'Orientación para mejorar comunicación, acuerdos y convivencia.',
 'TeamOutlined',
 '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('svc-003', 'Psicología infantil', 45, 30, 1,
 'Orientación psicológica para niños, niñas y familias. Sesiones adaptadas a la edad del paciente.',
 'Terapia individual', 1,
 'Orientación psicológica para niños, niñas y familias.',
 'SmileOutlined',
 '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('svc-004', 'Talleres grupales', 120, 25, 1,
 'Actividades grupales sobre bienestar emocional y habilidades socioemocionales. Precio por persona.',
 'Taller', 1,
 'Actividades grupales sobre bienestar y habilidades socioemocionales.',
 'TeamOutlined',
 '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('svc-005', 'Actividades empresariales', 180, 150, 1,
 'Charlas, capacitaciones y actividades de bienestar laboral para organizaciones. Precio base por sesión grupal.',
 'Empresa', 1,
 'Charlas y actividades para organizaciones.',
 'ShopOutlined',
 '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z');
