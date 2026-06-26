import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

function mapRowsToPalette(rows) {
  const light = {};
  const dark = {};

  for (const row of rows) {
    if (!row || !row.theme || !row.key) continue;
    if (row.theme === "dark") {
      dark[row.key] = row.value;
    } else {
      light[row.key] = row.value;
    }
  }

  return { light, dark };
}

function mapPaletteToRows(body) {
  if (Array.isArray(body?.data)) {
    return body.data;
  }

  const rows = [];
  const themes = ["light", "dark"];

  for (const theme of themes) {
    const palette = body?.[theme];
    if (!palette || typeof palette !== "object") continue;
    for (const key of Object.keys(palette)) {
      rows.push({
        id: `${theme}-${key}`,
        theme,
        key,
        value: String(palette[key]),
      });
    }
  }

  return rows;
}

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const { results } = await context.env.DB.prepare("SELECT * FROM palette_settings ORDER BY id ASC").all();
  return json(mapRowsToPalette(results));
}

export async function onRequestPut(context) {
  const db = context.env.DB;
  await ensureAllSchemas(db);
  const body = await context.request.json();
  const rows = mapPaletteToRows(body);
  if (!rows.length) return error("Formato de paleta inválido", 400);

  for (const item of rows) {
    if (!item.id || !item.theme || !item.key) continue;
      await db.prepare(`
        INSERT INTO palette_settings (id, theme, key, value, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET value = ?, updated_at = ?
      `).bind(item.id, item.theme, item.key, item.value, new Date().toISOString(), item.value, new Date().toISOString()).run();
  }
  return json({ ok: true });
}
