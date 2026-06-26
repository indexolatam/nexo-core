INSERT OR IGNORE INTO services (id, name, duration, price, description, category, active, landing_visible, created_at)
VALUES
  ('consulta-individual', 'Consulta individual', 60, 30.00, 'Atención psicológica individual con modalidad a coordinar.', 'Terapia individual', 1, 1, datetime('now')),
  ('terapia-familiar', 'Terapia familiar', 90, 50.00, 'Espacio de acompañamiento terapéutico para familias.', 'Terapia familiar', 1, 1, datetime('now'));
