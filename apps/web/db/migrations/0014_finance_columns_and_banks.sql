ALTER TABLE finance_movements ADD COLUMN observaciones TEXT;
ALTER TABLE finance_movements ADD COLUMN pagado_por_user_id TEXT;
ALTER TABLE finance_movements ADD COLUMN comprobante_url TEXT;
ALTER TABLE finance_movements ADD COLUMN updated_by_user_id TEXT;

INSERT OR IGNORE INTO bank_configs (id, name, active, display_order, created_at)
VALUES
  ('bank-bac', 'BAC', 1, 1, '2026-06-14T00:00:00.000Z'),
  ('bank-lafise', 'LAFISE', 1, 2, '2026-06-14T00:00:00.000Z');
