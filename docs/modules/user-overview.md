# Usuarios — Documento de lectura para desarrolladores

Este documento explica en lenguaje natural cómo funciona el módulo de Usuarios de nexo-core, qué hace, qué le falta, y qué hay que saber antes de tocar código aquí.

---

## Qué es el módulo Usuarios

Es el módulo principal del sistema. Gestiona las relaciones externas del negocio: clientes, empresas, freelancers y proveedores. Cada usuario tiene una ficha con datos de contacto, tipo, estado, etiquetas, responsable e historial.

La pantalla principal tiene dos modos: una vista de tabla con filtros (toolbar de 4 filas + column filters), y una vista de detalle dividida en dos columnas con un Collapse de información no repetida.

### Tipos de usuarios

| Tipo | Descripción |
|------|-------------|
| **Cliente** | Persona individual que recibe servicios |
| **Empresa** | Cliente corporativo |
| **Freelancer** | Profesional externo |
| **Proveedor** | Vende insumos o equipos |

### Estados

| Estado | Significado |
|--------|-------------|
| **Activo** | Usuario vigente |
| **Pendiente** | Usuario en proceso |
| **Inactivo** | Usuario desactivado |
| **Archivado** | Usuario archivado |

---

## Cómo funciona por dentro

### La base de datos

La tabla `usuarios` tiene 36 columnas con nombres `user_*`. Los campos de nombre están separados en `user_name_1`, `user_name_2`, `user_lastname_1`, `user_lastname_2` como decisión de diseño del backend. El campo `user_name` se concatena en el backend al responder. El teléfono también está separado en `user_phone_code` + `user_phone`.

### Sistema de filtros (3 capas)

1. **Toolbar**: 4 filas — búsqueda global, tipo (single-select), condición/estado (toggles), chips activos
2. **Column filters**: Popover por columna en la tabla (Tipos, Estado, Teléfono, Última interacción, Próxima actividad)
3. **Búsqueda global**: debounce 200ms, busca en nombre, teléfono, email, tipos, etiquetas

### El frontend

- `UsersPage.tsx` (~322 líneas) — Componente principal
- `UserForm.tsx` — Componente compartido con 6 modos (create, create-full, edit, edit-full, edit-pending, public)
- `UserDetail.tsx` — 3 Cards + Collapse con 5 secciones sin repetición
- No hay hooks separados ni estado global para este módulo

### El backend

Cloudflare Pages Functions con raw SQL contra D1. Filtrado por rol en GET. La migración `0018_rename_people_to_usuarios.sql` renombró la tabla `people` a `usuarios` con nuevo schema.

### Los permisos

Tabla `module_permissions` con 28 filas (4 roles × 7 módulos). Hook `usePermissions()` en frontend. Todos los endpoints requieren permiso `usuarios → read/create/edit`.

---

## Archivos clave para empezar a trabajar

1. `apps/web/src/modules/users/UsersPage.tsx` — Componente principal
2. `apps/web/src/modules/users/components/UserForm.tsx` — Formulario compartido (6 modos)
3. `apps/web/src/modules/users/components/UserDetail.tsx` — Vista detalle
4. `apps/web/src/modules/users/components/UsersTable.tsx` — Tabla con filtros
5. `apps/web/functions/api/usuarios/index.js` — GET list + POST create
6. `apps/web/functions/api/usuarios/[id].js` — GET/PATCH/DELETE por ID
7. `apps/web/src/types/adminUsers.ts` — Tipos TypeScript
8. `apps/web/functions/_core/db.js` — Schema de la DB, `mapUserRow`
9. `apps/web/functions/_core/permissions.js` — Helper de permisos

Para referencia rápida, ver `docs/modules/user.md` (documentación técnica) y `docs/modules/user-pending.md` (bugs y backlog).
