# People - Pendientes y Backlog

Estado de bugs, mejoras pendientes y backlog del módulo Personas.

## 1. Estado de Bugs

### 1.1 Bugs Corregidos

| # | Bug | Archivo | Estado |
|---|-----|---------|--------|
| 1 | PATCH no actualiza nombre (nombre_1/apellido_1) | `functions/api/people/[id].js:52-66` | CORREGIDO — usa `parseName()` |
| 2 | POST trunca nombres >4 palabras | `functions/api/people/index.js:45-49` | MEJORADO — `slice(2).join(" ")` para apellido_1 |
| 3 | Filtro "Buscar actividad" roto (variable no consumida) | `PeoplePage.tsx:56,62` | CORREGIDO — `matchesTableFilters` verifica `proximaActividadTexto` |
| 4 | Dashboard falla con `Promise.all` si un servicio retorna 403 | `DashboardPage.tsx:66` | CORREGIDO — usa `Promise.allSettled` |
| 5 | PeoplePage no verifica `hasPermission("personas", "read")` | `PeoplePage.tsx:74,99-100` | CORREGIDO — muestra Empty si !canRead |
| 6 | POST no llama `fetchRelatedData` — persona sin sub-arrelacionados | `functions/api/people/index.js:64` | CORREGIDO — llama `fetchRelatedData` |
| 7 | Timezone bugs (`toISOString()` vs `getDay()`) | `DashboardPage.tsx:33-38` | CORREGIDO — usa `toLocalDateStr()` |
| 8 | `responsable` se guarda como `assigned_user_id` con nombre en vez de ID | `PeoplePage.tsx:169` + `[id].js:71` | PARCIAL — edit envía user.id, create no asigna |
| 9 | Sin indicador de carga (spinner/skeleton) al montar | `PeoplePage.tsx:78,214` | CORREGIDO — `<Spin>` con estado `loading` |
| 10 | PeopleBigCounter no cuenta personas Pendiente ni Archivado | `PeopleBigCounter.tsx:5-7` | CORREGIDO — cuenta los 4 estados |
| 11 | Dropdown de horas del filtro solo muestra horas de la página actual | `PeopleTable.tsx:33,43` | CORREGIDO — recibe `allFilteredPeople` |
| 12 | `form.validateFields()` fuera de try/catch | `PeoplePage.tsx:146,163` | CORREGIDO — dentro de try/catch |
| 13 | Botón "Limpiar" en popover resetea filtros activos inmediatamente | `PeoplePage.tsx:142` | CORREGIDO — solo resetea `tempFilters` |
| 14 | `personTypeFilterMap` exportado pero nunca importado (dead code) | `adminPeople.ts` | CORREGIDO — eliminado del código |
| 15 | `formatTypeLabel` duplicado 4 veces | 4 archivos | CORREGIDO — centralizado en `utils/formatting.tsx` |
| 16 | `highlight` duplicado en PeopleTable y PersonCard | 2 archivos | CORREGIDO — centralizado en `utils/formatting.tsx` |
| 17 | Servicio usa `Record<string, unknown>` sin tipos de entrada | `peopleService.ts:7-8` | CORREGIDO — usa `CreatePersonInput`/`UpdatePersonInput` |
| 18 | Backend: espacios dobles en nombre producen partes vacías | `index.js:45` | CORREGIDO — `split(/\s+/).filter(Boolean)` |

### 1.2 Bugs Pendientes

| # | Bug | Prioridad | Archivo | Notas |
|---|-----|-----------|---------|-------|
| P3 | Crear persona no asigna responsable por defecto | Media | `PeoplePage.tsx:147-153` | El POST envía `body.responsable \|\| null` a `assigned_user_id`. El modal crear no tiene campo de responsable. Opcional: agregar selector o asignar "Sin asignar" por defecto. |
| P4 | Sin indicador visual de persona sin responsable en tabla | Baja | `PeopleTable.tsx` | No hay forma de ver rápidamente qué personas no tienen responsable asignado. |

## 2. Backlog de Mejoras

### 2.1 Prioridad Alta

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| D1 | Actualizar people.md | Documentación desactualizada vs código actual | `docs/modules/people.md` |
| D2 | Actualizar general.md | Agregar `utils/formatting.tsx` y otros cambios | `docs/general.md` |

### 2.2 Prioridad Media

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| U1 | Exportación CSV/Excel | Botón para exportar el listado filtrado de personas | `PeoplePage.tsx`, nuevo componente |
| U2 | Operaciones batch | Selección múltiple para editar/eliminar en lote | `PeopleTable.tsx`, `PeoplePage.tsx` |
| U3 | Undo para eliminaciones | Deshacer eliminación (soft delete con ventana de 30s) | `PeoplePage.tsx` |
| U4 | Guardar preset de filtros | Guardar combinaciones de filtros frecuentes (ej: "Pacientes activos con tareas") | `PeoplePage.tsx` |

### 2.3 Prioridad Baja

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| L1 | Búsqueda avanzada con operadores | Soporte para `nombre:Ana AND estado:Activo` | `PeoplePage.tsx` |
| L2 | Historial de cambios (audit trail visual) | Ver qué cambió, cuándo y quién en cada persona | `PersonDetail.tsx`, nuevo componente |
| L3 | Importación masiva desde CSV | Subir archivo CSV para crear personas en lote | Nuevo componente + endpoint |
| L4 | Notificaciones de seguimiento | Alertas automáticas cuando una persona necesita seguimiento | Nuevo servicio + componente |
| L5 | Comparación de personas | Vista side-by-side de dos personas | Nuevo componente |

### 2.4 Futuro

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| F1 | Paginación server-side | Para datasets >1000 personas, paginar en la API | Backend + `PeoplePage.tsx` |
| F2 | Búsqueda full-text server-side | Mover `matchesText` al backend para mejor rendimiento | Backend + `PeoplePage.tsx` |
| F3 | Filtros guardados server-side | Persistir filtros del usuario en la DB | Backend + nuevo endpoint |

## 3. Ideas / Brainstorm

| # | Idea | Categoría | Notas |
|---|------|-----------|-------|
| I1 | Dashboard de métricas por persona | Analytics | Tiempo total de atención, frecuencia de visitas, monto total de pagos |
| I2 | Línea de tiempo visual | UX | Timeline interactivo de todas las interacciones con la persona |
| I3 | Etiquetas con colores | UX | Asignar colores a etiquetas para identificación visual rápida |
| I4 | Filtros geográficos | Búsqueda | Filtrar por ubicación/zona (si se agrega campo de dirección) |
| I5 | Integración con calendario | Sincronización | Sync de citas con Google Calendar / Outlook |
| I6 | Recordatorios automáticos | Automatización | Enviar WhatsApp/email antes de citas programadas |
| I7 | Perfil de persona con avatar | UX | Subir foto de perfil, no solo iniciales |
| I8 | Modo oscuro para fichas | UX | Toggle de tema específicamente para la vista de personas |
| I9 | Búsqueda por voz | Accesibilidad | Buscar personas hablando en lugar de escribir |
| I10 | Export a PDF | Reportes | Generar ficha resumen de una persona en PDF |

## 4. Referencia Rápida

### Archivos clave del módulo

```
apps/web/src/modules/people/
├── PeoplePage.tsx                    # Componente principal (320 líneas)
└── components/
    ├── PeopleTable.tsx               # Tabla con filtros (159 líneas)
    ├── PeopleBigCounter.tsx          # Widget de conteo (21 líneas)
    ├── PersonCard.tsx                # Tarjeta de persona (39 líneas)
    ├── PersonDetail.tsx              # Vista detalle (114 líneas)
    ├── PersonSummaryLine.tsx         # Línea de resumen (13 líneas)
    ├── PersonAgendaList.tsx          # Lista de citas (23 líneas)
    ├── PersonTasksList.tsx           # Lista de tareas (22 líneas)
    ├── PersonFinanceList.tsx         # Lista de pagos (33 líneas)
    └── PersonHistoryList.tsx         # Historial (18 líneas)

apps/web/src/services/peopleService.ts    # Servicio REST (34 líneas)
apps/web/src/types/adminPeople.ts         # Tipos (79 líneas)
apps/web/src/utils/formatting.tsx         # Funciones compartidas (15 líneas)

apps/web/functions/api/people/
├── index.js                         # GET list + POST create (66 líneas)
└── [id].js                          # GET/PATCH/DELETE by ID (92 líneas)
```

### Endpoints

| Método | Endpoint | Permiso |
|--------|----------|---------|
| GET | `/api/people` | read |
| POST | `/api/people` | create |
| GET | `/api/people/:id` | read |
| PATCH | `/api/people/:id` | edit |
| DELETE | `/api/people/:id` | edit |

### Última revisión

- **Fecha**: 2026-06-26
- **Bugs corregidos**: 17/18 (89%)
- **Bugs pendientes**: 2
- **Mejoras pendientes**: 11
- **Ideas backlog**: 10
