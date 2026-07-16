import type { ExecutionContext, Handler } from "../../types.js";

export function withSecurityHeaders(handler: Handler): Handler {
  return async (ctx: ExecutionContext) => {
    const response = await handler(ctx);
    const headers = new Headers(response.headers);
    const host = ctx.tenant.host;

    headers.set("Access-Control-Allow-Origin", `https://${host}`);
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Max-Age", "86400");
    headers.set("X-Frame-Options", "DENY");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-XSS-Protection", "1; mode=block");

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  };
}

export function handleOptions(ctx: ExecutionContext): Response | null {
  if (ctx.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": `https://${ctx.tenant.host}`,
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return null;
}
