-- NEXO Central Database: tenant_registry, tenant_domains, tenant_config

CREATE TABLE IF NOT EXISTS tenant_registry (
  tenant_id TEXT PRIMARY KEY,
  host TEXT NOT NULL UNIQUE,
  database_id TEXT NOT NULL,
  database_name TEXT NOT NULL,
  audit_database_id TEXT NOT NULL,
  brand TEXT NOT NULL,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  plan TEXT NOT NULL DEFAULT 'basico',
  schema_version INTEGER NOT NULL DEFAULT 1,
  modules TEXT NOT NULL DEFAULT '{}',
  config TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  last_request_at TEXT
);

CREATE TABLE IF NOT EXISTS tenant_domains (
  host TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenant_registry(tenant_id)
);

CREATE TABLE IF NOT EXISTS tenant_config (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL UNIQUE,
  palette TEXT NOT NULL DEFAULT '{}',
  roles TEXT NOT NULL DEFAULT '{}',
  assets TEXT NOT NULL DEFAULT '{}',
  landing_config TEXT NOT NULL DEFAULT '{}',
  faq TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenant_registry(tenant_id)
);
