export async function ensureAllSchemas(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS people (
    id TEXT PRIMARY KEY, nombre_1 TEXT NOT NULL, nombre_2 TEXT,
    apellido_1 TEXT NOT NULL, apellido_2 TEXT, telefono TEXT NOT NULL,
    telefono_adicional TEXT, contacto_adicional_nombre TEXT, contacto_adicional_apellido TEXT,
    email TEXT, estado TEXT NOT NULL DEFAULT 'Pendiente', fuente TEXT,
    fecha_creacion TEXT NOT NULL, ultima_interaccion TEXT, proximo_evento_fecha TEXT,
    proxima_actividad TEXT, proxima_actividad_detalle TEXT, consentimiento_contacto INTEGER DEFAULT 1,
    assigned_user_id TEXT, created_at TEXT NOT NULL, updated_at TEXT, deleted_at TEXT,
    created_by_user_id TEXT, updated_by_user_id TEXT
  )`).run();
  try { await db.prepare("ALTER TABLE people ADD COLUMN tipos TEXT DEFAULT '[]'").run(); } catch {}
  try { await db.prepare("ALTER TABLE people ADD COLUMN etiquetas TEXT DEFAULT '[]'").run(); } catch {}
  try { await db.prepare("ALTER TABLE people ADD COLUMN observaciones_administrativas TEXT DEFAULT ''").run(); } catch {}

  await db.prepare(`CREATE TABLE IF NOT EXISTS bank_configs (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0, account_number TEXT, account_holder TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, duration INTEGER DEFAULT 60,
    price REAL DEFAULT 0, description TEXT, category TEXT, color TEXT,
    active INTEGER DEFAULT 1, landing_visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT, deleted_at TEXT
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, lastname TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1,
    username TEXT NOT NULL UNIQUE, email TEXT, password_hash TEXT NOT NULL,
    display_label TEXT, last_login_at TEXT, created_at TEXT NOT NULL,
    updated_at TEXT, deleted_at TEXT, created_by_user_id TEXT, updated_by_user_id TEXT,
    allowed_types TEXT DEFAULT '[]'
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL, expires_at TEXT NOT NULL, ip_address TEXT, user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS finance_movements (
    id TEXT PRIMARY KEY, persona_id TEXT, persona_nombre TEXT, servicio TEXT,
    service_id TEXT, monto REAL NOT NULL, metodo_pago TEXT NOT NULL DEFAULT 'Efectivo',
    estado TEXT NOT NULL DEFAULT 'Pendiente', fecha TEXT NOT NULL, hora TEXT,
    banco_id TEXT, referencia_transaccion TEXT, tipo_movimiento TEXT DEFAULT 'ingreso',
    moneda TEXT DEFAULT 'USD', notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT, created_by_user_id TEXT, deleted_at TEXT,
    fecha_vencimiento TEXT, pagado_en TEXT,
    FOREIGN KEY (persona_id) REFERENCES people(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (banco_id) REFERENCES bank_configs(id)
  )`).run();
  try { await db.prepare("ALTER TABLE finance_movements ADD COLUMN deleted_at TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE finance_movements ADD COLUMN fecha_vencimiento TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE finance_movements ADD COLUMN pagado_en TEXT").run(); } catch {}

  await db.prepare(`CREATE TABLE IF NOT EXISTS agenda_events (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, meta TEXT, category TEXT DEFAULT 'general',
    tone TEXT DEFAULT 'neutro', status TEXT DEFAULT 'Pendiente', starts_at TEXT NOT NULL,
    ends_at TEXT, all_day INTEGER DEFAULT 0, location_type TEXT DEFAULT 'en_clinica',
    meeting_url TEXT, location_department TEXT, location_reference TEXT,
    tiempo_previo_minutes INTEGER DEFAULT 0, tiempo_posterior_minutes INTEGER DEFAULT 0,
    assigned_user_id TEXT, person_id TEXT, service_id TEXT, is_recurring INTEGER DEFAULT 0,
    recurring_rule TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT, created_by_user_id TEXT, deleted_at TEXT,
    FOREIGN KEY (person_id) REFERENCES people(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (assigned_user_id) REFERENCES users(id)
  )`).run();
  try { await db.prepare("ALTER TABLE agenda_events ADD COLUMN deleted_at TEXT").run(); } catch {}

  await db.prepare(`CREATE TABLE IF NOT EXISTS agenda_event_instances (
    id TEXT PRIMARY KEY, event_id TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT,
    status TEXT DEFAULT 'Pendiente', is_confirmed INTEGER DEFAULT 0, notes TEXT,
    FOREIGN KEY (event_id) REFERENCES agenda_events(id)
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
    assigned_user_id TEXT, priority TEXT DEFAULT 'Media', due_at TEXT,
    status TEXT DEFAULT 'Pendiente', category TEXT DEFAULT 'Administrativa',
    person_id TEXT, event_id TEXT, service_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT, deleted_at TEXT,
    created_by_user_id TEXT, completed_at TEXT,
    FOREIGN KEY (assigned_user_id) REFERENCES users(id),
    FOREIGN KEY (person_id) REFERENCES people(id),
    FOREIGN KEY (event_id) REFERENCES agenda_events(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT, excerpt TEXT,
    status TEXT DEFAULT 'draft', author_id TEXT, published_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT, deleted_at TEXT,
    FOREIGN KEY (author_id) REFERENCES users(id)
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS palette_settings (
    id TEXT PRIMARY KEY, theme TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS module_permissions (
    id TEXT PRIMARY KEY, role TEXT NOT NULL, module TEXT NOT NULL,
    can_read INTEGER DEFAULT 1, can_create INTEGER DEFAULT 0, can_edit INTEGER DEFAULT 0, can_delete INTEGER DEFAULT 0,
    updated_at TEXT, UNIQUE(role, module)
  )`).run();

  const perms = [
    ['perm-root-personas','root','personas',1,1,1,1], ['perm-root-finanzas','root','finanzas',1,1,1,1],
    ['perm-root-agenda','root','agenda',1,1,1,1], ['perm-root-tareas','root','tareas',1,1,1,1],
    ['perm-root-configuracion','root','configuracion',1,1,1,1], ['perm-root-auditoria','root','auditoria',1,1,1,1],
    ['perm-root-blog','root','blog',1,1,1,1],
    ['perm-admin-personas','admin','personas',1,1,1,1], ['perm-admin-finanzas','admin','finanzas',1,1,1,1],
    ['perm-admin-agenda','admin','agenda',1,1,1,1], ['perm-admin-tareas','admin','tareas',1,1,1,1],
    ['perm-admin-configuracion','admin','configuracion',1,1,1,1], ['perm-admin-auditoria','admin','auditoria',0,0,0,0],
    ['perm-admin-blog','admin','blog',0,0,0,0],
    ['perm-doctor-personas','doctor','personas',0,0,0,0], ['perm-doctor-finanzas','doctor','finanzas',0,0,0,0],
    ['perm-doctor-agenda','doctor','agenda',1,1,1,1], ['perm-doctor-tareas','doctor','tareas',1,1,1,1],
    ['perm-doctor-configuracion','doctor','configuracion',0,0,0,0], ['perm-doctor-auditoria','doctor','auditoria',0,0,0,0],
    ['perm-doctor-blog','doctor','blog',0,0,0,0],
    ['perm-asistente-personas','asistente','personas',1,1,1,1], ['perm-asistente-finanzas','asistente','finanzas',1,1,1,1],
    ['perm-asistente-agenda','asistente','agenda',1,1,1,1], ['perm-asistente-tareas','asistente','tareas',1,1,1,1],
    ['perm-asistente-configuracion','asistente','configuracion',1,0,0,0], ['perm-asistente-auditoria','asistente','auditoria',0,0,0,0],
    ['perm-asistente-blog','asistente','blog',0,0,0,0],
  ];
  for (const p of perms) {
    await db.prepare("INSERT OR IGNORE INTO module_permissions (id, role, module, can_read, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(...p).run();
  }

  const { results } = await db.prepare("SELECT COUNT(*) as cnt FROM people").all();
  if (results[0]?.cnt === 0) {
    const now = new Date().toISOString();
    const hash = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
    await db.prepare("INSERT OR IGNORE INTO people (id, nombre_1, apellido_1, telefono, email, estado, fecha_creacion, tipos, etiquetas, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind("per-001", "Ana", "Pérez", "+50588881001", "ana@cliente.local", "Activo", now.slice(0, 10), '["Paciente"]', '["regular"]', now).run();
    await db.prepare("INSERT OR IGNORE INTO services (id, name, duration, price, description, category, active, landing_visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind("svc-001", "Consulta general", 60, 50, "Atención psicológica general", "Consultas", 1, 1).run();
    await db.prepare("INSERT OR IGNORE INTO users (id, name, lastname, role, username, email, password_hash, display_label, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind("usr-root", "Root", "Admin", "root", "root", "root@nexo.local", hash, "Root Admin", 1, now).run();
    await db.prepare("INSERT OR IGNORE INTO users (id, name, lastname, role, username, email, password_hash, display_label, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind("usr-admin", "Admin", "User", "admin", "admin", "admin@nexo.local", hash, "Admin User", 1, now).run();
  }
}

export async function ensurePeopleSchema(db) {
  await ensureAllSchemas(db);
}

function parseJsonArray(val) {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

export function mapPersonRow(row, relatedData) {
  if (!row) return null;
  const data = relatedData || {};
  return {
    id: row.id,
    nombre: [row.nombre_1, row.nombre_2, row.apellido_1, row.apellido_2].filter(Boolean).join(" ").trim(),
    telefono: row.telefono,
    email: row.email || undefined,
    tipos: parseJsonArray(row.tipos),
    estado: row.estado,
    fecha_creacion: row.fecha_creacion,
    ultima_interaccion: row.ultima_interaccion || "",
    observaciones_administrativas: row.observaciones_administrativas || "",
    fuente: row.fuente || "",
    responsable: row.assigned_user_id || "",
    etiquetas: parseJsonArray(row.etiquetas),
    proxima_actividad: row.proxima_actividad || "",
    proxima_actividad_detalle: row.proxima_actividad_detalle || "",
    citas: data.citas || { proximas: [], historial: [] },
    tareas: data.tareas || { pendientes: [], completadas: [] },
    finanzas: data.finanzas || { pagadas: [], pendientes: [], servicios: [] },
    historial: data.historial || [],
  };
}

export async function fetchRelatedData(db, personId) {
  const now = new Date().toISOString();
  const nowDate = now.slice(0, 10);

  const events = await db.prepare(`SELECT ae.*, aei.starts_at AS instance_starts_at, aei.ends_at AS instance_ends_at,
    aei.status AS instance_status, aei.notes AS instance_notes
    FROM agenda_events ae LEFT JOIN agenda_event_instances aei ON aei.event_id = ae.id
    WHERE ae.person_id = ? AND ae.deleted_at IS NULL
    ORDER BY COALESCE(aei.starts_at, ae.starts_at) DESC`).bind(personId).all();

  const tasks = await db.prepare("SELECT * FROM tasks WHERE person_id = ? AND deleted_at IS NULL ORDER BY created_at DESC").bind(personId).all();
  const finances = await db.prepare("SELECT * FROM finance_movements WHERE persona_id = ? ORDER BY fecha DESC").bind(personId).all();

  const upcomingEvents = [], pastEvents = [];
  for (const evt of events.results || []) {
    const entry = {
      id: evt.id, date: (evt.instance_starts_at || evt.starts_at).slice(0, 10),
      time: (evt.instance_starts_at || evt.starts_at).slice(11, 16), title: evt.title,
      status: evt.instance_status || evt.status, note: evt.instance_notes || evt.meta || null,
    };
    if (entry.date >= nowDate && entry.status !== 'Cancelada' && entry.status !== 'Atendida') upcomingEvents.push(entry);
    else pastEvents.push(entry);
  }

  const pendingTasks = [], completedTasks = [];
  for (const task of tasks.results || []) {
    if (task.status === 'Completada' || task.status === 'Cancelada') completedTasks.push({ id: task.id, title: task.title, status: task.status, priority: task.priority });
    else pendingTasks.push({ id: task.id, title: task.title, status: task.status, priority: task.priority });
  }

  const paidPayments = [], pendingPayments = []; const servicesSet = new Set();
  for (const fin of finances.results || []) {
    const entry = { id: fin.id, service: fin.servicio || 'Sin servicio', amount: fin.moneda === 'USD' ? `$${Number(fin.monto).toFixed(2)}` : `C$${Number(fin.monto).toFixed(2)}`, status: fin.estado === 'Pagado' ? 'Pagado' : 'Pendiente', dueDate: fin.fecha_vencimiento || fin.fecha };
    if (fin.estado === 'Pagado') paidPayments.push(entry); else pendingPayments.push(entry);
    if (fin.servicio) servicesSet.add(fin.servicio);
  }

  return {
    citas: { proximas: upcomingEvents, historial: pastEvents },
    tareas: { pendientes: pendingTasks, completadas: completedTasks },
    finanzas: { pagadas: paidPayments, pendientes: pendingPayments, servicios: Array.from(servicesSet) },
    historial: [],
  };
}

export async function fetchBatchRelatedData(db, personIds) {
  if (personIds.length === 0) return new Map();
  const now = new Date().toISOString();
  const nowDate = now.slice(0, 10);
  const placeholders = personIds.map(() => "?").join(",");

  const events = await db.prepare(`SELECT ae.*, aei.starts_at AS instance_starts_at, aei.ends_at AS instance_ends_at,
    aei.status AS instance_status, aei.notes AS instance_notes
    FROM agenda_events ae LEFT JOIN agenda_event_instances aei ON aei.event_id = ae.id
    WHERE ae.person_id IN (${placeholders}) AND ae.deleted_at IS NULL
    ORDER BY ae.person_id, COALESCE(aei.starts_at, ae.starts_at) DESC`).bind(...personIds).all();

  const tasks = await db.prepare(`SELECT * FROM tasks WHERE person_id IN (${placeholders}) AND deleted_at IS NULL ORDER BY person_id, created_at DESC`).bind(...personIds).all();
  const finances = await db.prepare(`SELECT * FROM finance_movements WHERE persona_id IN (${placeholders}) ORDER BY persona_id, fecha DESC`).bind(...personIds).all();

  const map = new Map();
  for (const id of personIds) map.set(id, { events: [], tasks: [], finances: [] });

  for (const evt of events.results || []) {
    const arr = map.get(evt.person_id);
    if (arr) arr.events.push(evt);
  }
  for (const t of tasks.results || []) {
    const arr = map.get(t.person_id);
    if (arr) arr.tasks.push(t);
  }
  for (const f of finances.results || []) {
    const arr = map.get(f.persona_id);
    if (arr) arr.finances.push(f);
  }

  const result = new Map();
  for (const id of personIds) {
    const d = map.get(id);
    const upcomingEvents = [], pastEvents = [];
    for (const evt of d.events) {
      const entry = { id: evt.id, date: (evt.instance_starts_at || evt.starts_at).slice(0, 10), time: (evt.instance_starts_at || evt.starts_at).slice(11, 16), title: evt.title, status: evt.instance_status || evt.status, note: evt.instance_notes || evt.meta || null };
      if (entry.date >= nowDate && entry.status !== 'Cancelada' && entry.status !== 'Atendida') upcomingEvents.push(entry);
      else pastEvents.push(entry);
    }
    const pendingTasks = [], completedTasks = [];
    for (const t of d.tasks) {
      if (t.status === 'Completada' || t.status === 'Cancelada') completedTasks.push({ id: t.id, title: t.title, status: t.status, priority: t.priority });
      else pendingTasks.push({ id: t.id, title: t.title, status: t.status, priority: t.priority });
    }
    const paidPayments = [], pendingPayments = []; const servicesSet = new Set();
    for (const f of d.finances) {
      const entry = { id: f.id, service: f.servicio || 'Sin servicio', amount: f.moneda === 'USD' ? `$${Number(f.monto).toFixed(2)}` : `C$${Number(f.monto).toFixed(2)}`, status: f.estado === 'Pagado' ? 'Pagado' : 'Pendiente', dueDate: f.fecha_vencimiento || f.fecha };
      if (f.estado === 'Pagado') paidPayments.push(entry); else pendingPayments.push(entry);
      if (f.servicio) servicesSet.add(f.servicio);
    }
    result.set(id, {
      citas: { proximas: upcomingEvents, historial: pastEvents },
      tareas: { pendientes: pendingTasks, completadas: completedTasks },
      finanzas: { pagadas: paidPayments, pendientes: pendingPayments, servicios: Array.from(servicesSet) },
      historial: [],
    });
  }
  return result;
}