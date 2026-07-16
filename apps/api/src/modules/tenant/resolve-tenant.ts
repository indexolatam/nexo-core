import type { Env } from "../../types.js";

type DomainRow = { host: string; tenant_id: string };
type TenantRow = { tenant_id: string; database_id: string; audit_database_id: string; brand: string; status: string; plan: string; modules: string };

export async function resolveTenant(request: Request, env: Env) {
  const host = new URL(request.url).hostname.toLowerCase().replace(/\.$/, "");
  if (!host) return null;

  const domain = await env.DB_CENTRAL
    .prepare("SELECT host, tenant_id FROM tenant_domains WHERE host = ?")
    .bind(host).first<DomainRow>();
  if (!domain) return null;

  const tenant = await env.DB_CENTRAL
    .prepare("SELECT * FROM tenant_registry WHERE tenant_id = ?")
    .bind(domain.tenant_id).first<TenantRow>();
  if (!tenant || tenant.status === "suspended") return null;

  let modules: Record<string, boolean> = {};
  try { modules = JSON.parse(tenant.modules); } catch {}

  return { tenantId: tenant.tenant_id, host, brand: tenant.brand, plan: tenant.plan, modules, databaseId: tenant.database_id, auditDatabaseId: tenant.audit_database_id };
}

export function getTenantDb(env: Env, tenantId: string): D1Database | null {
  const bindings: Record<string, D1Database | undefined> = {
    demo: env.DB_demo,
    gmoran: env.DB_gmoran,
  };
  const db = bindings[tenantId];
  if (db && typeof db === "object" && "prepare" in db) return db;
  return null;
}

export function getTenantAuditDb(env: Env, tenantId: string): D1Database | null {
  const bindings: Record<string, D1Database | undefined> = {
    demo: env.DB_AUDIT_demo,
    gmoran: env.DB_AUDIT_gmoran,
  };
  const db = bindings[tenantId];
  if (db && typeof db === "object" && "prepare" in db) return db;
  return null;
}
