export function json<T>(data: T, status = 200): Response {
  return Response.json({ data }, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function error(message: string, status = 400, code?: string): Response {
  return Response.json(
    { error: { code: code || `ERROR_${status}`, message } },
    { status, headers: { "Content-Type": "application/json" } },
  );
}
