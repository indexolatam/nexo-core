# Servicios — Documento de lectura para desarrolladores

Este documento explica en lenguaje natural cómo funciona el módulo de Servicios de nexo-core, qué hace, qué le falta, y qué hay que saber antes de tocar código aquí.

---

## Qué es el módulo Servicios

Es el submódulo de configuración que gestiona los servicios ofrecidos por el negocio: terapias, membresías, talleres y ofertas. Cada servicio tiene nombre, categoría, duración, precio, moneda, opciones de participantes (JSON), descripción y configuración de landing (visible, título, párrafo, imagen, icono, orden, CTA).

Desde el panel admin (Configuración → Servicios) se pueden crear, activar/desactivar y ver servicios. La landing pública los muestra dinámicamente vía API.

### Categorías

| Categoría | Descripción |
|-----------|-------------|
| **Terapia** | Servicios terapéuticos individuales, de pareja, familiares |
| **Membresía** | Suscripciones mensuales/anuales |
| **Taller** | Actividades grupales, capacitaciones |
| **Oferta** | Promociones y paquetes especiales |

### Estados

| Estado | Significado |
|--------|-------------|
| **Activo** | Servicio disponible, visible en admin y (si corresponde) en landing |
| **Inactivo** | Servicio desactivado, no visible |

---

## Cómo funciona por dentro

### La base de datos

La tabla `services` tiene 22 columnas con el prefijo `services_` (siguiendo el mismo patrón que `usuarios` con `user_`). No hay ORM, todo es raw SQL contra D1.

Los campos importantes:
- `services_participants` — JSON array con opciones de participantes: `[{"count":1,"label":"Individual","price":30}]`
- `services_landing_*` — 8 columnas para controlar la visualización en la landing
- `services_deleted_at` — soft delete, nunca se borra realmente

#### Relaciones

Tres tablas referencian `services(services_id)`:
- `finance_movements.services_id`
- `agenda_events.services_id`
- `tasks.services_id`

#### Migración 0019

Se eliminó `0011_services_columns.sql` (redundante) y se creó `0019_services_redesign.sql` que:
1. Crea tabla temporal con prefijo `services_`
2. Migra datos antiguos
3. Renombra `service_id` → `services_id` en las 3 tablas FK
4. Inserta seeds normados (`svc-001`, `svc-002`, etc.)

Columnas eliminadas: `color`, `is_online`, `max_participants` → reemplazado por `services_participants` JSON.

### El frontend

Los servicios se gestionan desde `SettingsPage.tsx` como una sección colapsable (no hay página dedicada). El estado incluye:
- `services` — lista de servicios cargados del backend (tipados como `ServiceConfig[]`)
- `serviceOpen` — control del modal de creación
- `serviceDraft` — formulario de nuevo servicio

#### La landing

`ServicesPreview.tsx` ya no usa datos estáticos. Ahora hace fetch a `/api/services` (público) y muestra los servicios con `services_landing_visible = 1`. Muestra skeleton loading mientras carga.

### El backend

Está en `apps/web/functions/api/services/`. Cloudflare Pages Functions con raw SQL contra D1 (no hay ORM).

**GET /api/services**: Público (sin auth) para landing, Admin (con auth) para configuración.

**POST /api/services**: Crea servicio. Acepta tanto nombres nuevos (`services_*`) como antiguos (`name`, `duration`, `price`) para backward compat.

**PATCH /api/services/:id**: Actualiza solo las columnas permitidas por whitelist de 17 campos. Previene inyección SQL.

**DELETE /api/services/:id**: Soft delete via `services_deleted_at`.

### Los permisos

No hay permisos específicos para el módulo de servicios. La sección de servicios en Settings es visible para cualquier admin. Los endpoints POST/PATCH/DELETE requieren auth (cualquier usuario logueado).

---

## Qué hay que saber antes de tocar código

### Las migraciones

El script `dev.ps1` ejecuta `client.sql` contra la D1 local. `ensureAllSchemas` crea las tablas si no existen. En producción, las migraciones se aplican con `wrangler d1 execute`.

### La convención de naming

TODAS las columnas de `services` usan el prefijo `services_`. Si agregas una columna nueva:
1. Agrégala al `CREATE TABLE` en `db.js` (`ensureAllSchemas`)
2. Agrégala al `CREATE TABLE` en `client.sql`
3. Agrégala a la whitelist de `[id].js` si debe ser editable vía API
4. Crea migración si el D1 ya existe en producción

### La whitelist del PATCH

No agregues columnas a la whitelist sin pensar en seguridad. La whitelist existe para prevenir que un cliente malicioso pueda modificar cualquier columna (incluyendo `services_deleted_at` o `services_created_at`).

### Los tipos de TypeScript

Hay 3 tipos diferentes que describen servicios:
- `D1Service` (d1.ts) — tipo completo DB, para respuestas API
- `ServiceConfig` (adminSettings.ts) — tipo mínimo, para listado en Settings
- `ServiceItem` (servicesService.ts) — tipo del servicio REST, con index signature

Si agregas una columna, actualiza los 3 tipos.

### ContactSection

El dropdown de servicios en el formulario de contacto usa una lista estática inline (no depende de la DB). Si agregas servicios nuevos y quieres que aparezcan ahí, hay que actualizar el array manualmente en `ContactSection.tsx:58-63`.

---

## Archivos clave para empezar a trabajar

Si necesitas modificar algo en Servicios, estos son los archivos que necesitas leer en este orden:

1. `apps/web/src/modules/settings/SettingsPage.tsx` — componente con sección de servicios
2. `apps/web/functions/api/services/index.js` — GET list y POST create
3. `apps/web/functions/api/services/[id].js` — PATCH whitelist + DELETE
4. `apps/web/src/services/servicesService.ts` — servicio REST con tipos
5. `apps/web/src/types/adminSettings.ts` — tipo ServiceConfig
6. `apps/web/src/types/d1.ts` — tipo D1Service, ParticipantOption
7. `apps/web/src/landing/components/ServicesPreview.tsx` — landing pública
8. `apps/web/functions/_core/db.js` — schema ensureAllSchemas
9. `apps/web/db/client.sql` — schema completo unificado
10. `apps/web/db/migrations/0019_services_redesign.sql` — migración

Para referencia rápida, ver `docs/modules/servicio.md` (documentación técnica) y `docs/modules/servicio-pending.md` (bugs y backlog).
