# Usuarios - Pendientes y Backlog

Estado de bugs, mejoras pendientes y backlog del módulo Usuarios.

## 1. Bugs Pendientes

| # | Bug | Prioridad | Archivo | Notas |
|---|-----|-----------|---------|-------|
| P3 | Crear usuario no asigna responsable por defecto | Media | `UsersPage.tsx` | El modal create simple no tiene campo responsable |
| P4 | Sin indicador visual de usuario sin responsable en tabla | Baja | `UsersTable.tsx` | No hay forma de ver qué usuarios no tienen responsable |
| P5 | N+1 query: fetchRelatedData ejecuta 3 queries por usuario | Media | `api/usuarios/index.js` | Para 100 usuarios = 301 queries |
| P6 | Error catch genérico silencia mensajes reales de API | Baja | `UsersPage.tsx` | Catch muestra mensaje genérico |

## 2. Backlog de Mejoras

### 2.1 Prioridad Alta

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| D2 | Implementar enlace público | Botón "Enlace" en create modal → link `/reg/:code` para auto-registro del cliente | Backend + `UserForm.tsx` + `PublicRegisterPage.tsx` + `main.tsx` |

### 2.2 Prioridad Media

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| U1 | Exportación CSV/Excel | Botón para exportar el listado filtrado de usuarios | `UsersPage.tsx`, nuevo componente |
| U2 | Operaciones batch | Selección múltiple para editar/eliminar en lote | `UsersTable.tsx`, `UsersPage.tsx` |
| U3 | Undo para eliminaciones | Deshacer eliminación (soft delete con ventana de 30s) | `UsersPage.tsx` |
| U4 | Guardar preset de filtros | Guardar combinaciones de filtros frecuentes | `UsersPage.tsx` |

### 2.3 Prioridad Baja

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| L1 | Búsqueda avanzada con operadores | Soporte para `name:Ana AND status:Activo` | `UsersPage.tsx` |
| L2 | Historial de cambios (audit trail visual) | Qué cambió, cuándo y quién | `UserDetail.tsx`, nuevo componente |
| L3 | Importación masiva desde CSV | Subir archivo CSV para crear usuarios en lote | Nuevo componente + endpoint |
| L4 | Comparación de usuarios | Vista side-by-side de dos usuarios | Nuevo componente |

### 2.4 Futuro

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| F1 | Paginación server-side | Para datasets >1000 usuarios | Backend + `UsersPage.tsx` |
| F2 | Búsqueda full-text server-side | Mover matchesText al backend | Backend + `UsersPage.tsx` |
| F3 | Filtros guardados server-side | Persistir filtros en la DB | Backend + nuevo endpoint |
| F4 | ~~Renombrar `api/people/` → `api/usuarios/`~~ | ✅ Completado | Backend |

## 3. Referencia Rápida

### Archivos clave del módulo

```
apps/web/src/modules/users/
├── UsersPage.tsx                    # Componente principal (324 líneas)
└── components/
    ├── UsersTable.tsx               # Tabla con filtros (141 líneas)
    ├── UsersBigCounter.tsx          # Widget de conteo (21 líneas)
    ├── UserCard.tsx                 # Tarjeta de usuario (39 líneas)
    ├── UserDetail.tsx               # Vista detalle (126 líneas)
    ├── UserSummaryLine.tsx          # Línea de resumen (13 líneas)
    ├── UserAgendaList.tsx           # Lista de citas (23 líneas)
    ├── UserTasksList.tsx            # Lista de tareas (22 líneas)
    ├── UserFinanceList.tsx          # Lista de pagos (33 líneas)
    ├── UserHistoryList.tsx          # Historial (18 líneas)
    ├── UserForm.tsx                 # Formulario compartido (286 líneas)
    └── UserFormSection.tsx          # Wrapper de sección (13 líneas)

apps/web/src/types/adminUsers.ts     # Tipos (126 líneas)
apps/web/src/utils/formatting.tsx    # Funciones compartidas (21 líneas)

apps/web/functions/api/usuarios/
├── index.js                         # GET list + POST create (98 líneas)
└── [id].js                          # GET/PATCH/DELETE (117 líneas)
```

### Endpoints

| Método | Endpoint | Permiso |
|--------|----------|---------|
| GET | `/api/usuarios` | `usuarios → read` |
| POST | `/api/usuarios` | `usuarios → create` |
| GET | `/api/usuarios/:id` | `usuarios → read` |
| PATCH | `/api/usuarios/:id` | `usuarios → edit` |
| DELETE | `/api/usuarios/:id` | `usuarios → edit` |

### Última revisión

- **Fecha**: 2026-06-28
- **Bugs corregidos**: 29
- **Bugs pendientes**: 4
- **Mejoras pendientes**: 11
