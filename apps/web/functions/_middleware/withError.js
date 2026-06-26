export async function onRequest(context) {
  try {
    return await context.next();
  } catch (err) {
    return Response.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}
