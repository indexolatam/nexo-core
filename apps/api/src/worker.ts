import { resolveTenant, getTenantDb, getTenantAuditDb } from "./modules/tenant/resolve-tenant.js";
import { withErrorHandling } from "./infrastructure/http/error-handler.js";
import { handleOptions, withSecurityHeaders } from "./infrastructure/http/security.js";
import { requireAuth } from "./infrastructure/http/auth.js";
import { json, error } from "./infrastructure/http/response.js";
import { loginHandler, sessionHandler, logoutHandler } from "./modules/auth/index.js";
import { listPersonsHandler, getPersonHandler, createPersonHandler, updatePersonHandler, deletePersonHandler } from "./modules/usuarios/index.js";
import type { Env, ExecutionContext, Handler } from "./types.js";

const routes: { method: string; pattern: RegExp; handler: Handler; auth?: boolean }[] = [
  { method: "POST", pattern: /^\/api\/auth\/login$/, handler: loginHandler },
  { method: "GET", pattern: /^\/api\/auth\/session$/, handler: sessionHandler, auth: true },
  { method: "POST", pattern: /^\/api\/auth\/logout$/, handler: logoutHandler, auth: true },
  { method: "GET", pattern: /^\/api\/personas$/, handler: listPersonsHandler, auth: true },
  { method: "POST", pattern: /^\/api\/personas$/, handler: createPersonHandler, auth: true },
  { method: "GET", pattern: /^\/api\/personas\/[^/]+$/, handler: getPersonHandler, auth: true },
  { method: "PATCH", pattern: /^\/api\/personas\/[^/]+$/, handler: updatePersonHandler, auth: true },
  { method: "DELETE", pattern: /^\/api\/personas\/[^/]+$/, handler: deletePersonHandler, auth: true },
  { method: "GET", pattern: /^\/api\/tenant\/config$/, handler: (ctx) => json({ tenant_id: ctx.tenant.tenantId, brand: ctx.tenant.brand, plan: ctx.tenant.plan, modules: ctx.tenant.modules }) },
  { method: "GET", pattern: /^\/api\/health$/, handler: () => json({ status: "ok" }) },
];

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const resolved = await resolveTenant(request, env);
  if (!resolved) return error("Tenant no encontrado", 404);

  const database = getTenantDb(env, resolved.tenantId);
  const auditDatabase = getTenantAuditDb(env, resolved.tenantId);
  if (!database || !auditDatabase) return error("DB no disponible", 500);

  const ctx: ExecutionContext = {
    request, env,
    tenant: { ...resolved, database, auditDatabase },
  };

  const optionsResp = handleOptions(ctx);
  if (optionsResp) return optionsResp;

  const route = routes.find((r) => r.method === request.method && r.pattern.test(new URL(request.url).pathname));
  if (!route) return error("No encontrado", 404);

  let handler = route.handler;
  if (route.auth) handler = requireAuth(handler);

  return withSecurityHeaders(withErrorHandling(handler))(ctx);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await handleRequest(request, env);
    } catch (cause) {
      console.error("[Worker Error]", cause);
      return error("Error interno", 500, "INTERNAL_ERROR");
    }
  },
};
