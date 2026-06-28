export async function onRequest(context) {
  const user = context.data?.user;
  if (!user) return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401, headers: { "Content-Type": "application/json" } });
  if (user.role !== "root") return new Response(JSON.stringify({ error: "Solo root puede acceder" }), { status: 403, headers: { "Content-Type": "application/json" } });
  return context.next();
}
