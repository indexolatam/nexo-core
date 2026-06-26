CREATE TABLE IF NOT EXISTS palette_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  light_palette TEXT NOT NULL DEFAULT '{}',
  dark_palette TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT
);

INSERT OR IGNORE INTO palette_settings (id, light_palette, dark_palette, created_at)
VALUES ('default', '{}', '{}', '2026-06-14T00:00:00.000Z');
