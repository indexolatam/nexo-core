INSERT OR IGNORE INTO users (id, name, lastname, role, username, email, password_hash, display_label, active, created_at)
VALUES
  ('root', 'Root', 'Admin', 'root', 'root', 'root@clinica.com', '4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2', 'root', 1, datetime('now')),
  ('admin', 'Admin', 'Clínica', 'admin', 'admin', 'admin@clinica.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin', 1, datetime('now')),
  ('doctor', 'Doctor', 'Principal', 'doctor', 'doc', 'doc@clinica.com', '139d544b821b13ebea14f1b0fe18577222e415c2966e3a3511c4196055232202', 'doctor', 1, datetime('now')),
  ('asistente', 'Asistente', 'Administrativo', 'asistente', 'asis', 'asis@clinica.com', '105f495d894006d1dd5a432123573c88bdc64b58949d98af4c26e238f8be28a4', 'asistente', 1, datetime('now'));

INSERT OR IGNORE INTO people (id, nombre_1, apellido_1, telefono, email, estado, fecha_creacion, created_at)
VALUES
  ('per-001', 'Ana', 'Pérez', '+505 8888 1001', 'ana.perez@email.com', 'Activo', '2026-06-01', '2026-06-01T00:00:00.000Z'),
  ('per-002', 'Empresa', 'ABC', '+505 8888 1002', 'rrhh@empresaabc.com', 'Activo', '2026-05-20', '2026-05-20T00:00:00.000Z');
