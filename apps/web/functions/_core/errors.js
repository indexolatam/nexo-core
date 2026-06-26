export function notFound(message = "No encontrado") {
  return Response.json({ error: message }, { status: 404 });
}

export function unauthorized(message = "No autorizado") {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Acceso denegado") {
  return Response.json({ error: message }, { status: 403 });
}
