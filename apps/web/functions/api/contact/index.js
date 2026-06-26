function json(data, status = 200) {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function ensureSchema(db) {
  await db
    .prepare(`CREATE TABLE IF NOT EXISTS contact_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      service TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    )`)
    .run();
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  if (!db) return new Response("D1 no configurado", { status: 500 });
  await ensureSchema(db);

  const body = await readJson(context.request);
  if (!body.name || !body.phone) {
    return new Response("name y phone son requeridos", { status: 400 });
  }

  const id = `contact-${Date.now()}`;
  const now = new Date().toISOString();

  await db
    .prepare(
      "INSERT INTO contact_requests (id, name, phone, email, service, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)"
    )
    .bind(id, body.name, body.phone, body.email || null, body.service || null, body.message || null, now)
    .run();

  return json({ id, status: "pending", created_at: now }, 201);
}
