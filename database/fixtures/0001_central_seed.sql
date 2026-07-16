INSERT OR IGNORE INTO tenant_registry (tenant_id, host, database_id, database_name, audit_database_id, brand, status, plan, schema_version, modules, created_at)
VALUES
  ('demo', 'demo.localhost', 'demo-db-id', 'nexo-tenant-demo_db', 'demo-audit-db-id', 'Demo NEXO', 'active', 'basico', 1, '{"people":true,"agenda":true,"finance":true,"tasks":true,"services":true,"audit":true,"settings":true}', datetime('now')),
  ('gmoran', 'gmoran.localhost', 'gmoran-db-id', 'nexo-tenant-gmoran_db', 'gmoran-audit-db-id', 'Punto de Equilibrio', 'active', 'basico', 1, '{"people":true,"agenda":true,"finance":true,"tasks":true,"services":true,"audit":true,"settings":true}', datetime('now'));

INSERT OR IGNORE INTO tenant_domains (host, tenant_id, is_primary, created_at)
VALUES ('demo.localhost', 'demo', 1, datetime('now')), ('gmoran.localhost', 'gmoran', 1, datetime('now'));

INSERT OR IGNORE INTO tenant_config (id, tenant_id, palette, roles, assets, created_at)
VALUES
  ('tc-demo', 'demo', '{"primary":"#1E88E5"}', '{"root":"Root","admin":"Admin","doctor":"Doctor"}', '{}', datetime('now')),
  ('tc-gmoran', 'gmoran', '{"primary":"#2D4D42"}', '{"root":"Root","admin":"Propietaria","doctor":"Doctora"}', '{}', datetime('now'));
