export type Env = {
  DB_CENTRAL: D1Database;
  DB_demo?: D1Database;
  DB_AUDIT_demo?: D1Database;
  DB_gmoran?: D1Database;
  DB_AUDIT_gmoran?: D1Database;
  ENVIRONMENT: string;
};

export type TenantContext = {
  tenantId: string;
  host: string;
  brand: string;
  plan: string;
  modules: Record<string, boolean>;
  database: D1Database;
  auditDatabase: D1Database;
};

export type AuthenticatedUser = {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
  name: string;
  lastname: string;
  email: string;
};

export type ExecutionContext = {
  request: Request;
  env: Env;
  tenant: TenantContext;
  user?: AuthenticatedUser;
};

export type Handler = (ctx: ExecutionContext) => Response | Promise<Response>;
