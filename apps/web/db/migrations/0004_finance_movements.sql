CREATE TABLE IF NOT EXISTS finance_movements (
  id TEXT PRIMARY KEY,
  persona_id TEXT NOT NULL,
  persona_nombre TEXT,
  servicio TEXT,
  service_id TEXT,
  monto REAL NOT NULL,
  metodo_pago TEXT NOT NULL DEFAULT 'Efectivo',
  estado TEXT NOT NULL DEFAULT 'Pendiente',
  fecha TEXT NOT NULL,
  hora TEXT,
  referencia_transaccion TEXT,
  banco_id TEXT,
  observaciones TEXT,
  tipo_movimiento TEXT NOT NULL DEFAULT 'ingreso',
  fecha_vencimiento TEXT,
  pagado_en TEXT,
  pagado_por_user_id TEXT,
  comprobante_url TEXT,
  moneda TEXT NOT NULL DEFAULT 'NIO',
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT,
  FOREIGN KEY (persona_id) REFERENCES people(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (banco_id) REFERENCES bank_configs(id)
);

INSERT OR IGNORE INTO finance_movements (
  id, persona_id, persona_nombre, servicio, monto, metodo_pago, estado,
  fecha, hora, banco_id, created_at, updated_at
) VALUES
  ('fin-001', 'per-001', 'Ana Pérez', 'Consulta individual', 30, 'Efectivo', 'Pagado', '2026-06-12', '14:00', NULL, '2026-06-12T14:00:00.000Z', '2026-06-12T14:00:00.000Z'),
  ('fin-002', 'per-002', 'Empresa ABC', 'Terapia familiar', 50, 'Transferencia', 'Pendiente', '2026-06-14', '10:00', 'bank-bac', '2026-06-14T10:00:00.000Z', '2026-06-14T10:00:00.000Z');
