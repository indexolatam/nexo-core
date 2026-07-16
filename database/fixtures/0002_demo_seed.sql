INSERT OR IGNORE INTO users (id, name, lastname, role, active, username, email, display_label, password_hash, created_at)
VALUES ('usr-demo-root', 'Admin', 'Demo', 'root', 1, 'admin', 'admin@demo.com', 'Admin Demo', 'CHANGE_ME', datetime('now'));

INSERT OR IGNORE INTO usuarios (user_id, user_name_1, user_lastname_1, user_phone, user_email, user_status, user_created_date, user_created_at)
VALUES ('per-demo-001', 'María', 'González', '+505 8888-1234', 'maria@example.com', 'Activo', date('now'), datetime('now'));

INSERT OR IGNORE INTO module_permissions (id, role, module, can_read, can_create, can_edit, can_delete)
VALUES
  ('mp-root-dashboard', 'root', 'dashboard', 1, 0, 0, 0),
  ('mp-root-personas', 'root', 'personas', 1, 1, 1, 1),
  ('mp-root-agenda', 'root', 'agenda', 1, 1, 1, 1),
  ('mp-root-finanzas', 'root', 'finanzas', 1, 1, 1, 1),
  ('mp-root-tareas', 'root', 'tareas', 1, 1, 1, 1);
