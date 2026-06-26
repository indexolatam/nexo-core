CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Borrador',
  tags TEXT,
  content TEXT,
  image TEXT,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT
);

INSERT OR IGNORE INTO blog_posts (id, title, status, tags, content, image, date, created_at)
VALUES
  ('bienvenidos-a-punto-de-equilibrio', 'Bienvenidos a Punto de Equilibrio', 'Publicado', 'bienvenida,clinica,psicologia', 'Contenido de ejemplo para el blog de bienvenida.', '', '2026-06-14', '2026-06-14T00:00:00.000Z'),
  ('como-prepararse-para-su-primera-consulta', 'Cómo prepararse para su primera consulta', 'Publicado', 'consejos,primera-consulta,preparacion', 'Consejos útiles para prepararse antes de su primera visita.', '/images/blog/consulta.jpg', '2026-06-14', '2026-06-14T00:00:00.000Z');
