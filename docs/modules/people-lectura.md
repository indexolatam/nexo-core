# People — Documento de lectura para desarrolladores

Este documento explica en lenguaje natural cómo funciona el módulo de Personas de nexo-core, qué hace, qué le falta, y qué hay que saber antes de tocar código aquí.

---

## Qué es el módulo People

Es el módulo principal del sistema. Permite gestionar las personas relacionadas al consultorio: pacientes, empresas, contactos, participantes de talleres. Cada persona tiene una ficha con datos de contacto, tipo, estado, etiquetas, responsable, historial de citas, tareas y pagos.

La pantalla principal tiene dos modos: una vista de tabla con filtros estilo Excel, y una vista de detalle dividida en dos columnas donde se ve la info de la persona seleccionada y una lista compacta a la derecha.

---

## Cómo funciona por dentro

### La base de datos

La tabla `people` tiene 27 columnas. Los campos de nombre están separados en `nombre_1`, `nombre_2`, `apellido_1`, `apellido_2` por una decisión de diseño del backend (SQL puro, sin ORM). El frontend usa un solo campo `nombre` que es la concatenación de los cuatro. El backend se encarga de hacer el split cuando recibe el nombre completo y la concatenación cuando responde.

Los campos importantes:
- `nombre_1`, `nombre_2`, `apellido_1`, `apellido_2` — nombre separado
- `tipos` — JSON array: puede ser "Paciente", "Contacto", "Participante Taller", "Empresa", "Contacto Empresarial"
- `etiquetas` — JSON array libre de strings
- `estado` — "Activo", "Inactivo", "Pendiente", "Archivado"
- `responsable` / `assigned_user_id` — ID del usuario asignado
- `fuente` — de dónde vino la persona (Manual, Referido, Red social, Web, Otro)
- `deleted_at` — soft delete, nunca se borra realmente

### El frontend

Todo está en `PeoplePage.tsx` (un componente grande de ~320 líneas que concentra toda la lógica). No hay hooks separados ni estado global para este módulo.

El estado incluye:
- `items` — todas las personas cargadas del backend
- `users` — todos los usuarios (para el selector de responsable)
- `selectedId` — persona seleccionada en la vista detalle
- `filters`, `tempFilters`, `tableFilters` — múltiples niveles de filtrado
- `createOpen`, `editOpen` — estado de los modales

Los filtros funcionan en cadena: primero `matchesText` (búsqueda por texto), luego `matchesAdvancedFilters` (tipo/estado/condición), luego `matchesTableFilters` (filtros de columna estilo Excel). Todo es client-side.

### El backend

Está en `apps/web/functions/api/people/`. Usa Cloudflare Pages Functions con raw SQL contra D1 (no hay ORM).

Cada endpoint tiene su propio `checkPermission` que:
1. Verifica que el usuario exista en `context.data.user` (lo setea el middleware `requireAuth`)
2. Si es root, pasa directo
3. Si no, consulta `module_permissions` en la DB para ver si tiene el permiso requerido (read/create/edit)

El POST parsea el nombre completo en las 4 partes usando `split(/\s+/).filter(Boolean)`. El PATCH hace lo mismo. Ambos usan `COALESCE` en el UPDATE para no sobreescribir campos que no se envían.

### Los permisos

Hay una tabla `module_permissions` con 28 filas (4 roles × 7 módulos). Cada fila tiene `can_read`, `can_create`, `can_edit`. Root siempre tiene todo habilitado y se salta la verificación.

El hook `usePermissions()` en el frontend carga los permisos al montar y expone `hasPermission(module, action)`. Se usa para habilitar/deshabilitar botones y mostrar/ocultar secciones.

El Settings tiene un editor de permisos donde root/admin puede quitar acceso (pero nunca dar más del techo del rol).

---

## Qué corregimos en esta sesión

Hicimos una auditoría completa de 27 hallazgos. Aquí el resumen:

### Lo que estaba roto y ya funciona

- **PATCH no actualizaba el nombre** — el SQL no tenía `nombre_1`/`apellido_1` en el UPDATE. Corregido.
- **PATCH crasheaba si la persona no existía** — `row.id` sobre `null`. Corregido con null check.
- **PATCH perdía `nombre_2`/`apellido_2`** — solo parseaba 2 partes del nombre. Corregido con `parseName()` que extrae las 4 partes.
- **PATCH no podía cambiar el responsable** — `assigned_user_id` no estaba en el UPDATE. Corregido.
- **DELETE devolvía 200 aunque no existiera** — agregado check de existencia + 404.
- **El middleware de auth no funcionaba** — los archivos en `_middleware/` nunca se ejecutaban. Se creó `functions/_middleware.js` que los encadena correctamente.
- **Login creaba un loop infinito** — el middleware exigía auth para el propio endpoint de login. Se agregó skip para `/api/auth/login` y `/api/health`.
- **Token expirado causaba loop de errores** — `apiClient.ts` no manejaba 401. Ahora hace auto-logout y redirect a `/login`.
- **El schema de la DB estaba desincronizado** — `client.sql` no tenía `deleted_at`, `tipos`, `etiquetas`. Corregido.
- **El seed de permisos fallaba** — `db.batch()` con `stmt.bind()` mutaba el mismo objeto. Corregido con loop individual.
- **El form de crear no tenía fuente ni etiquetas** — ahora los incluye.
- **El form de editar solo tenía 6 campos** — ahora tiene 12 campos: nombre, teléfono, email, tipos, estado, fuente, etiquetas, responsable, última interacción, próxima actividad, detalle actividad, observaciones.
- **El filtro "Buscar actividad" no funcionaba** — la variable existía pero no se verificaba en `matchesTableFilters`. Corregido.
- **El contador de personas no mostraba Pendientes ni Archivados** — BigCounter solo contaba Activos e Inactivos. Corregido.
- **El dropdown de horas del filtro solo mostraba horas de la página actual** — ahora recibe `allFilteredPeople` con todos los filtrados.
- **La búsqueda de actividad usaba UTC en vez de hora local** — DashboardPage usaba `toISOString()` que es UTC. Corregido con `toLocalDateStr()`.
- **Las funciones `formatTypeLabel` y `highlight` estaban duplicadas 4 y 2 veces** — centralizadas en `utils/formatting.tsx`.
- **El servicio usaba `Record<string, unknown>`** — ahora tiene tipos fuertes `CreatePersonInput` y `UpdatePersonInput`.

### Lo que todavía no funciona

1. **`/api/settings/palette` y otros endpoints públicos** — el middleware los bloquea. Falta agregar `publicReadPaths` en `requireAuth.js`. Sin esto, el landing page no carga colores ni servicios.

2. **El form de crear no tiene campo de responsable** — solo el de editar lo tiene. Se puede agregar si se necesita.

3. **N+1 query en el listado** — `fetchRelatedData` hace 3 queries por persona. Para 100 personas son 301 queries. No es crítico pero escala mal.

4. **Los mensajes de error de la API se pierden** — el `catch` en `onCreatePerson` y `onUpdatePerson` muestra "No se pudo crear/actualizar" en vez del mensaje real que viene del backend.

5. **El dev script no pasa `DB_AUDIT`** — el módulo de auditoría está roto en desarrollo local. Solo funciona en producción.

6. **Los seeds de usuarios son inconsistentes** — `client.sql` usa IDs `'root'`, `'admin'` con un hash, `ensureAllSchemas` usa `'usr-root'`, `'usr-admin'` con otro hash. Si el D1 se crea por un camino u otro, los usuarios son diferentes.

---

## Qué hay que saber antes de tocar código

### El middleware

Los middlewares están en `functions/_middleware/` como archivos separados, pero se encadenan desde `functions/_middleware.js` (el archivo, no el directorio). El orden es: `withError` → `requireAuth` → `requireRoot`. Si agregas un endpoint público, hay que agregar su path a `requireAuth.js` en el array `publicPaths` o `publicReadPaths`.

### La DB

No hay ORM. Todo es raw SQL con `db.prepare().bind().run()`. Si necesitas agregar una columna a `people`, tienes que:
1. Agregarla al `CREATE TABLE` en `db.js` (`ensureAllSchemas`)
2. Agregarla al `CREATE TABLE` en `client.sql`
3. Crear migración en `db/migrations/` si el D1 ya existe en producción

### Los permisos

Si agregas un endpoint nuevo, necesitas llamar a `checkPermission(context, "read"|"create"|"edit")` al inicio del handler. El middleware solo valida auth, no permisos por módulo.

### Los formularios

Los modales usan `Form.useForm()` de Ant Design. El de crear se llama `form`, el de editar `editForm`. El de editar pre-llena los campos en `afterOpenChange` usando `editForm.setFieldsValue()`. Cuando agregues un campo nuevo, acuérdate de agregarlo al `setFieldsValue` del edit y al payload de `onUpdatePerson`.

### Las migraciones

El script `dev.ps1` ejecuta `client.sql` contra la D1 local. `ensureAllSchemas` crea las tablas si no existen (para el cold start en Cloudflare). En producción, las migraciones se aplican con `wrangler d1 execute`.

---

## Archivos clave para empezar a trabajar

Si necesitas modificar algo en Personas, estos son los archivos que necesitas leer en este orden:

1. `apps/web/src/modules/people/PeoplePage.tsx` — aquí está toda la lógica
2. `apps/web/functions/api/people/index.js` — GET list y POST create
3. `apps/web/functions/api/people/[id].js` — GET/PATCH/DELETE por ID
4. `apps/web/src/services/peopleService.ts` — tipos de entrada y métodos del servicio
5. `apps/web/src/types/adminPeople.ts` — tipos de TypeScript
6. `apps/web/functions/_core/db.js` — schema de la DB, `mapPersonRow`, `fetchRelatedData`
7. `apps/web/functions/_core/permissions.js` — helper de permisos

Para referencia rápida, ver `docs/modules/people.md` (documentación técnica) y `docs/modules/people-pending.md` (bugs y backlog).
