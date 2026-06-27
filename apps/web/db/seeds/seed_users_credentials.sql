UPDATE users SET
  name = 'Root',
  lastname = 'Admin',
  role = 'root',
  username = 'root',
  email = 'root@nexo.local',
  password_hash = '4813494d137e1631bba301d5acab6e7bb7aa74ce1185d456565ef51d737677b2',
  display_label = 'Root Admin',
  updated_at = datetime('now')
WHERE id = 'root';

DELETE FROM users WHERE id != 'root';
