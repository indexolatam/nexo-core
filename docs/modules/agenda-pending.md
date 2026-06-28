# Agenda - Pendientes y Backlog

Estado de bugs, mejoras pendientes y backlog del módulo Agenda.

## 1. Estado de Bugs

### 1.1 Bugs Corregidos

| # | Bug | Archivo | Estado |
|---|-----|---------|--------|
| — | — | — | No hay bugs reportados aún |

### 1.2 Bugs Pendientes

| # | Bug | Prioridad | Archivo | Notas |
|---|-----|-----------|---------|-------|
| B1 | Formulario "Crear actividad" no conectado con API | Alta | `EventForm.tsx` | El formulario tiene campos controlados pero no hay handler onSubmit que llame a agendaService.create() |
| B2 | Formulario sin validaciones | Alta | `EventForm.tsx` | No hay campos required ni reglas de validación |
| B3 | No hay endpoint DELETE | Media | `functions/api/agenda/[id].js` | El schema soporta soft delete pero no está implementado |
| B4 | `isEventInPeriod` usa día fijo | Media | `CalendarView.tsx:74` | Hardcodea `event.date === 12 + offset` |
| B5 | `FutureEventPicker` retorna array vacío | Media | `EventForm.tsx:110-118` | No carga eventos reales |
| B6 | No hay indicador de carga | Baja | `AgendaPage.tsx` | No hay Spin ni skeleton |
| B7 | `AgendaOwner` hardcodeado | Baja | `AgendaPage.tsx:73` | Solo verifica "asistente", todo lo demás es "Doctora" |
| B8 | Modal no cierra al crear exitosamente | Media | `AgendaPage.tsx:488` | No hay feedback de éxito ni cierre condicional |

## 2. Backlog de Mejoras

### 2.1 Prioridad Alta

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| A1 | Conectar formulario crear con API | Implementar onSubmit que llame a agendaService.create() | `EventForm.tsx`, `AgendaPage.tsx` |
| A2 | Conectar formulario editar con API | Implementar onSubmit que llame a agendaService.update() | `EventForm.tsx`, `AgendaPage.tsx` |
| A3 | Agregar validaciones al formulario | Campos requeridos: título, fecha, hora | `EventForm.tsx` |
| A4 | Implementar endpoint DELETE | Soft delete via deleted_at | `functions/api/agenda/[id].js` |
| A5 | Conectar reprogramar/cancelar | Handlers que actualicen estado del evento | `EventForm.tsx`, `AgendaPage.tsx` |

### 2.2 Prioridad Media

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| M1 | Cargar eventos reales en FutureEventPicker | Usar events del state | `EventForm.tsx` |
| M2 | Corregir isEventInPeriod | Usar fecha actual | `CalendarView.tsx` |
| M3 | Agregar Spin/skeleton de carga | Indicador mientras carga | `AgendaPage.tsx` |
| M4 | Conectar repetir/duplicar | Handlers para crear recurrentes/duplicados | `EventForm.tsx`, `AgendaPage.tsx` |
| M5 | Selector de persona/contacto | Select con personas del sistema | `EventForm.tsx` |
| M6 | Selector de responsable dinámico | Cargar usuarios desde usersService | `EventForm.tsx` |
| M7 | Date picker y time picker | Reemplazar inputs textuales | `EventForm.tsx` |

## 3. Referencia Rápida

### Archivos clave del módulo

```
apps/web/src/modules/agenda/
├── AgendaPage.tsx                    # Componente principal (504 líneas)
└── components/
    ├── AgendaFilters.tsx             # UI: Pills, Filters (107 líneas)
    ├── CalendarView.tsx              # UI: EventList, CalendarBoard (436 líneas)
    └── EventForm.tsx                 # Formularios acciones rápidas (500 líneas)

apps/web/functions/api/agenda/
├── index.js                         # GET list + POST create (22 líneas)
└── [id].js                          # PATCH update (15 líneas)
```

### Endpoints

| Método | Endpoint | Permiso |
|--------|----------|---------|
| GET | `/api/agenda` | read |
| POST | `/api/agenda` | create |
| PATCH | `/api/agenda/:id` | edit |
| DELETE | `/api/agenda/:id` | edit (NO IMPLEMENTADO) |

### Última revisión

- **Fecha**: 2026-06-26
- **Bugs pendientes**: 8
- **Mejoras pendientes**: 12 (5 alta, 7 media)
