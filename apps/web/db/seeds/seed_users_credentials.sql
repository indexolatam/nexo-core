UPDATE users SET
  username = 'root',
  email = 'root@clinica.com',
  password_hash = '4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2',
  display_label = 'root',
  updated_at = '2026-06-15T00:00:00.000Z'
WHERE id = 'root';

UPDATE users SET
  username = 'admin',
  email = 'admin@clinica.com',
  password_hash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  display_label = 'admin',
  updated_at = '2026-06-15T00:00:00.000Z'
WHERE id = 'admin';

UPDATE users SET
  name = 'Doctor',
  lastname = 'Principal',
  username = 'doc',
  email = 'doc@clinica.com',
  password_hash = '139d544b821b13ebea14f1b0fe18577222e415c2966e3a3511c4196055232202',
  display_label = 'doctor',
  updated_at = '2026-06-15T00:00:00.000Z'
WHERE id = 'doctor';

UPDATE users SET
  name = 'Asistente',
  lastname = 'Administrativo',
  username = 'asis',
  email = 'asis@clinica.com',
  password_hash = '105f495d894006d1dd5a432123573c88bdc64b58949d98af4c26e238f8be28a4',
  display_label = 'asistente',
  updated_at = '2026-06-15T00:00:00.000Z'
WHERE id = 'asistente';
