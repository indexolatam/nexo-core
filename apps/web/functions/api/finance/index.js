import { json, error } from "../../_core/response.js";
import { ensureAllSchemas } from "../../_core/db.js";

export async function onRequestGet(context) {
  await ensureAllSchemas(context.env.DB);
  const { status, metodo_pago, start_date, end_date } = context.request.query || {};
  let sql = "SELECT * FROM finance_movements WHERE 1=1";
  const params = [];
  if (status) { sql += " AND estado = ?"; params.push(status); }
  if (metodo_pago) { sql += " AND metodo_pago = ?"; params.push(metodo_pago); }
  if (start_date) { sql += " AND fecha >= ?"; params.push(start_date); }
  if (end_date) { sql += " AND fecha <= ?"; params.push(end_date); }
  sql += " ORDER BY fecha DESC";
  const { results } = await context.env.DB.prepare(sql).bind(...params).all();
  return json(results);
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  await ensureAllSchemas(db);
  const body = await context.request.json();
  const id = `fin-${Date.now()}`;
  const now = new Date().toISOString();

   const bancoId = body.banco_id || body.banco || null;
   const notes = body.notes || body.observaciones || null;

  await db.prepare(`
    INSERT INTO finance_movements (
      id, persona_id, persona_nombre, servicio, service_id, monto,
      metodo_pago, estado, fecha, hora, banco_id, referencia_transaccion,
      notes, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.persona_id || null,
    body.persona_nombre || null,
    body.servicio || null,
    body.service_id || null,
    body.monto,
    body.metodo_pago,
    body.estado || "Pendiente",
    body.fecha || now,
    body.hora || null,
    bancoId,
    body.referencia_transaccion || null,
    notes,
    now,
  ).run();
  const row = await db.prepare("SELECT * FROM finance_movements WHERE id = ?").bind(id).first();
  return json(row, 201);
}
