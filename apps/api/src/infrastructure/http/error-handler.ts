import type { Handler } from "../../types.js";

export function withErrorHandling(handler: Handler): Handler {
  return async (ctx) => {
    try {
      return await handler(ctx);
    } catch (err) {
      console.error("[API Error]", err);
      const message = err instanceof Error ? err.message : "Error interno";
      return Response.json(
        { error: { code: "INTERNAL_ERROR", message } },
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  };
}
