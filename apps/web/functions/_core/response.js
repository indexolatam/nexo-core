export function json(data, status = 200) {
  return Response.json({ data }, { status });
}

export function error(message, status = 400) {
  return Response.json({ error: message }, { status });
}
