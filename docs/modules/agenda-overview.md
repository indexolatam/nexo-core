# Agenda — Documento de lectura para desarrolladores

Este documento explica en lenguaje natural cómo funciona el módulo de Agenda de nexo-core, qué hace, qué le falta, y qué hay que saber antes de tocar código aquí.

---

## Qué es el módulo Agenda

Es el módulo de gestión de eventos, calendario y actividad del negocio. Permite crear, editar, reprogramar, confirmar, cancelar, repetir y duplicar actividades. Cada evento tiene fecha, hora, duración, ubicación, responsable, estado y tipo/categoría.

La pantalla principal tiene dos modos: vista de lista y vista de calendario. Un panel lateral derecho muestra el evento seleccionado, acciones rápidas y disponibilidad.

### Tipos de eventos (categorías)

| Categoría | Descripción |
|-----------|-------------|
| **Consultas** | Citas clínicas o de atención al cliente |
| **Administración** | Tareas administrativas internas |
| **Marketing** | Contenido, campañas, redes sociales |
| **Empresas** | Actividades con clientes corporativos |
| **Talleres** | Capacitaciones, eventos grupales |
| **Personal** | Actividades personales del responsable |

### Estados

| Estado | Significado |
|--------|-------------|
| **Pendiente** | Evento creado, aún no confirmado |
| **Confirmado** | Evento confirmado por el responsable |
| **En curso** | Evento happening now |
| **Completado** | Evento finalizado |
| **Cancelado** | Evento cancelado |
| **Reprogramado** | Evento movido a nueva fecha/hora |

---

## Cómo funciona por dentro

### La base de datos

La tabla `agenda_events` tiene 25 columnas. Campos principales: `title`, `category`, `status`, `starts_at`/`ends_at`, `assigned_user_id`, `person_id`, `location_type`, `is_recurring`, `deleted_at`.

La tabla secundaria `agenda_event_instances` almacena instancias de eventos recurrentes.

### El frontend

Todo está en `AgendaPage.tsx` (~504 líneas) con componentes separados.

El estado incluye: `events`, `focusMode`, `activeView`, `periodOffset`, `activeFilter`, `searchTerm`, `selectedEvent`, `activeAction`.

### El backend

Está en `apps/web/functions/api/agenda/`. Usa Cloudflare Pages Functions con raw SQL contra D1.

Cada endpoint verifica permisos con `checkPermission`.

---

## Archivos clave para empezar a trabajar

1. `apps/web/src/modules/agenda/AgendaPage.tsx`
2. `apps/web/src/modules/agenda/components/EventForm.tsx`
3. `apps/web/src/modules/agenda/components/CalendarView.tsx`
4. `apps/web/src/modules/agenda/components/AgendaFilters.tsx`
5. `apps/web/functions/api/agenda/index.js`
6. `apps/web/functions/api/agenda/[id].js`
7. `apps/web/src/services/agendaService.ts`
8. `apps/web/src/types/adminAgenda.ts`
9. `apps/web/src/types/d1.ts`
10. `apps/web/functions/_core/db.js`

Para referencia rápida, ver `docs/modules/agenda.md` (documentación técnica) y `docs/modules/agenda-pending.md` (bugs y backlog).
