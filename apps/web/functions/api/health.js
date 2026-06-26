export async function onRequestGet(context) {
  return Response.json({
    data: { ok: true, worker: "pages-functions", d1_bound: Boolean(context.env.DB) }
  });
}
