# Módulo Personas (People)

Gestión de personas relacionadas al consultorio: fichas, historial y contexto centralizado.

## 1. Archivos del Módulo

### Frontend

| Archivo | Líneas | Función |
|---------|--------|---------|
| `apps/web/src/pages/admin/PeoplePage.tsx` | 1 | Re-export wrapper |
| `apps/web/src/modules/people/PeoplePage.tsx` | 265 | Componente principal con toda la lógica |
| `apps/web/src/modules/people/components/PeopleTable.tsx` | 169 | Tabla con filtros tipo Excel por columna |
| `apps/web/src/modules/people/components/PeopleBigCounter.tsx` | 19 | Widget de conteo (activos/inactivos/total) |
| `apps/web/src/modules/people/components/PersonCard.tsx` | 53 | Tarjeta de persona (compacta o completa) |
| `apps/web/src/modules/people/components/PersonDetail.tsx` | 113 | Vista detalle con tabs |
| `apps/web/src/modules/people/components/PersonSummaryLine.tsx` | 13 | Línea de resumen con icono |
| `apps/web/src/modules/people/components/PersonAgendaList.tsx` | 23 | Lista de citas de la persona |
| `apps/web/src/modules/people/components/PersonTasksList.tsx` | 22 | Lista de tareas de la persona |
| `apps/web/src/modules/people/components/PersonFinanceList.tsx` | 33 | Lista de pagos pendientes + servicios |
| `apps/web/src/modules/people/components/PersonHistoryList.tsx` | 18 | Historial de interacciones |

### Servicios y Tipos

| Archivo | Función |
|---------|---------|
| `apps/web/src/types/adminPeople.ts` | Tipos TypeScript (Person, PersonType, etc.) |
| `apps/web/src/services/peopleService.ts` | Servicio REST CRUD |
| `apps/web/src/services/apiClient.ts` | Cliente HTTP base con auth |
| `apps/web/src/services/index.ts` | Barrel export |

### Backend (API)

| Archivo | Función |
|---------|---------|
| `apps/web/functions/api/people/index.js` | GET listar + POST crear (con permisos) |
| `apps/web/functions/api/people/[id].js` | GET/PATCH/DELETE por ID (con permisos) |
| `apps/web/functions/_core/db.js` | Schema, mapPersonRow, fetchRelatedData |
| `apps/web/functions/_core/permissions.js` | Helper requirePermission + getUserPermission |

### Base de Datos

| Archivo | Función |
|---------|---------|
| `apps/web/db/migrations/0001_local_core.sql` | CREATE TABLE people + seeds |
| `apps/web/db/migrations/0004_finance_movements.sql` | FK → people |
| `apps/web/db/migrations/0005_agenda_events.sql` | FK → people |
| `apps/web/db/migrations/0006_tasks.sql` | FK → people |
| `apps/web/db/migrations/0009_audit_log.sql` | Auditoría sobre people |
| `apps/web/db/seeds/seed_people.sql` | Seeds adicionales |
| `apps/web/db/client.sql` | BD completa unificada |

## 2. Base de Datos

### 2.1 Esquema de la tabla `people`

```sql
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  nombre_1 TEXT NOT NULL,
  nombre_2 TEXT,
  apellido_1 TEXT NOT NULL,
  apellido_2 TEXT,
  telefono TEXT NOT NULL,
  telefono_adicional TEXT,
  contacto_adicional_nombre TEXT,
  contacto_adicional_apellido TEXT,
  email TEXT,
  estado TEXT NOT NULL DEFAULT 'Pendiente',
  fuente TEXT,
  fecha_creacion TEXT NOT NULL,
  ultima_interaccion TEXT,
  proximo_evento_fecha TEXT,
  proxima_actividad TEXT,
  proxima_actividad_detalle TEXT,
  consentimiento_contacto INTEGER DEFAULT 1,
  assigned_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  updated_by_user_id TEXT
);
```

### 2.2 Relaciones FK

```
people.id ← finance_movements.persona_id
people.id ← agenda_events.person_id
people.id ← tasks.person_id
people.id ← audit_log.entity_id (entidad = 'people')
```

### 2.3 Seeds

```sql
INSERT INTO people (id, nombre_1, apellido_1, telefono, email, estado, ...)
VALUES
  ('per-001', 'Ana', 'Pérez', '+505 8888 1001', 'ana.perez@email.com', 'Activo', ...),
  ('per-002', 'Empresa', 'ABC', '+505 8888 1002', 'rrhh@empresaabc.com', 'Activo', ...);
```

### 2.4 Nota: Desfase DB vs Frontend

La DB usa campos separados (`nombre_1`, `apellido_1`, `apellido_2`), pero el frontend usa un campo único `nombre`. El backend concatena estos campos antes de servir los datos.

## 3. Modelo de Datos TypeScript

### 3.1 Tipo Principal: `Person`

```typescript
// apps/web/src/types/adminPeople.ts:49-78
type Person = {
  id: string;
  nombre: string;                    // Concatenación de nombre_1 + apellido_1
  telefono: string;
  email?: string;
  tipos: PersonType[];
  estado: PersonStatus;
  fecha_creacion: string;
  ultima_interaccion: string;
  observaciones_administrativas: string;
  fuente: string;
  responsable: string;
  etiquetas: string[];
  proxima_actividad: string;
  proxima_actividad_detalle: string;
  citas: {
    proximas: PersonAgendaEntry[];
    historial: PersonAgendaEntry[];
  };
  tareas: {
    pendientes: PersonTaskEntry[];
    completadas: PersonTaskEntry[];
  };
  finanzas: {
    pagadas: PersonPaymentEntry[];
    pendientes: PersonPaymentEntry[];
    servicios: string[];
  };
  historial: PersonHistoryEntry[];
};
```

### 3.2 Tipos Derivados

```typescript
type PersonType = "Paciente" | "Contacto" | "Participante Taller" | "Empresa" | "Contacto Empresarial";
type PersonStatus = "Activo" | "Inactivo" | "Pendiente" | "Archivado";
type PersonCondition = "Con citas" | "Con tareas" | "Con pagos pendientes";
type PersonQuickFilter = "Todos" | "Pacientes" | "Empresas" | "Con tareas" | "Pagos";
```

### 3.3 Subtipos de Entradas

```typescript
type PersonAgendaEntry = {
  id: string; date: string; time: string; title: string;
  status: "Confirmada" | "Pendiente" | "Atendida" | "Cancelada";
  note?: string;
};

type PersonTaskEntry = {
  id: string; title: string;
  status: "Pendiente" | "En curso" | "Completada" | "Cancelada";
  priority: "Alta" | "Media" | "Baja";
};

type PersonPaymentEntry = {
  id: string; service: string; amount: string;
  status: "Pagado" | "Pendiente"; dueDate: string;
};

type PersonHistoryEntry = {
  id: string; date: string; title: string; detail: string;
};
```

### 3.4 Estado de Filtros

```typescript
type PeopleFilterState = {
  types: PersonType[];
  statuses: PersonStatus[];
  conditions: PersonCondition[];
};

type TableFilterState = {
  nombre: string;
  tipos: PersonType[];
  estado: PersonStatus[];
  telefono: string;
  ultimaInteraccionFecha: string;
  proximaActividadDia: string;
  proximaActividadHora: string;
  proximaActividadTexto: string;
  indicadores: TableIndicatorFilter[];
};
```

## 4. API / Endpoints

### 4.1 Endpoints Consumidos

| Método | Endpoint | Función | Permiso | Usado en |
|--------|----------|---------|---------|----------|
| `GET` | `/api/people` | Listar todas | `personas → read` | `PeoplePage.tsx:90` |
| `POST` | `/api/people` | Crear persona | `personas → create` | `PeoplePage.tsx:126` |
| `PATCH` | `/api/people/:id` | Actualizar persona | `personas → edit` | `PeoplePage.tsx:141` |
| `DELETE` | `/api/people/:id` | Eliminar persona | `personas → edit` | `PeoplePage.tsx:146` |
| `GET` | `/api/people/:id` | Obtener por ID | `personas → read` | (disponible, no usado directamente) |

### 4.2 Respuesta Esperada

```json
{ "data": Person | Person[] | null }
```

### 4.3 Datos para Crear Persona

```json
{
  "nombre": "string (requerido)",
  "telefono": "string (requerido)",
  "email": "string (opcional)",
  "tipos": "PersonType[] (requerido)",
  "estado": "PersonStatus (requerido)",
  "fecha_creacion": "YYYY-MM-DD (auto)",
  "ultima_interaccion": "YYYY-MM-DD (auto)",
  "observaciones_administrativas": "string",
  "fuente": "Manual (default)",
  "responsable": "Doctora (default)",
  "etiquetas": "[] (default)",
  "proxima_actividad": "Sin actividad (default)",
  "citas": "{ proximas: [], historial: [] }",
  "tareas": "{ pendientes: [], completadas: [] }",
  "finanzas": "{ pagadas: [], pendientes: [], servicios: [] }",
  "historial": "[]"
}
```

## 5. Componentes

### 5.1 Árbol de Componentes

```
PeoplePage (PeoplePage.tsx)
├── Header Section (Card)
│   ├── Título "Personas"
│   └── Descripción
├── Toolbar Section (Card)
│   ├── Input (búsqueda)
│   ├── Popover (filtro avanzado)
│   ├── Button "Nueva persona"
│   ├── Quick Filters (botones)
│   ├── Toggle "Ver inactivos"
│   └── Counter ( PeopleBigCounter )
├── Active Chips (condicional)
│
├── [Si selectedPerson]
│   ├── PersonDetail (layout izquierda)
│   │   ├── Card (info + avatar + acciones)
│   │   ├── Tabs (Resumen, Agenda, Tareas, Finanzas, Historial)
│   │   │   ├── PersonSummaryLine (×3)
│   │   │   ├── PersonAgendaList
│   │   │   ├── PersonTasksList
│   │   │   ├── PersonFinanceList
│   │   │   └── PersonHistoryList
│   │   └── Card (info general)
│   └── Lista compacta (derecha)
│       ├── PeopleBigCounter
│       └── PersonCard (×n, compact)
│
├── [Si no selectedPerson]
│   └── PeopleTable
│       ├── thead (filtros por columna)
│       └── tbody (filas clickeables)
│
├── Modal "Nueva persona"
│   └── Form (nombre, teléfono, email, tipos, estado, observaciones)
│
└── Modal "Editar persona"
    └── Form (mismos campos, pre-llenado)
```

### 5.2 PeopleTable (PeopleTable.tsx)

Tabla con filtros tipo Excel por columna:

| Columna | Filtro | Tipo |
|---------|--------|------|
| Nombre | Búsqueda por texto | Input |
| Tipos | Selección múltiple | Checkbox.Group |
| Estado | Selección múltiple | Checkbox.Group |
| Teléfono | Búsqueda por texto | Input |
| Última interacción | Selector de fecha | DatePicker |
| Próxima actividad | Fecha + Hora + Texto | DatePicker + Select + Input |
| Indicadores | Selección múltiple | Checkbox.Group |

### 5.3 PersonDetail (PersonDetail.tsx)

Layout de 2 columnas:
- **Izquierda**: Tarjeta de info + Tabs con sub-componentes
- **Derecha**: Lista compacta de personas (seleccionable)

Tabs disponibles:
1. **Resumen**: Próxima cita, tareas pendientes, pagos pendientes
2. **Agenda**: Lista de citas (próximas + historial)
3. **Tareas**: Lista de tareas (pendientes + completadas)
4. **Finanzas**: Pagos pendientes + servicios
5. **Historial**: Registro de interacciones

### 5.4 PersonCard (PersonCard.tsx)

Props: `person`, `compact?`, `selected?`, `onClick`, `query?`

Modos:
- **Completo**: Muestra todos los detalles
- **Compacto**: Solo nombre, email, tipos, estado

## 6. Flujos Principales

### 6.1 Carga de Datos

```
1. PeoplePage monta
2. useEffect llama a peopleService.list()
3. GET /api/people
4. Respuesta: Person[]
5. setItems(records) → estado local
6. Todo el filtrado es client-side
```

**Ubicación**: `PeoplePage.tsx:90`

### 6.2 Búsqueda con Debounce

```
1. Usuario escribe en Input
2. setSearch(e.target.value)
3. useDebouncedValue(search, 200)
4. debouncedSearch cambia después de 200ms
5. useMemo recalcula filteredPeople
6. matchesText() busca en: nombre, telefono, email, tipos, etiquetas
```

**Funciones clave**:
- `useDebouncedValue()` - `PeoplePage.tsx:26-30`
- `matchesText()` - `PeoplePage.tsx:34-38`

### 6.3 Filtrado Rápido (Quick Filters)

| Filtro | Comportamiento |
|--------||
| Todos | Limpia todos los filtros |
| Pacientes | `types = ["Paciente"]` |
| Empresas | `types = ["Empresa", "Contacto Empresarial"]` |
| Con tareas | `conditions = ["Con tareas"]` |
| Pagos | `conditions = ["Con pagos pendientes"]` |

**Ubicación**: `PeoplePage.tsx:110-119`

### 6.4 Filtrado Avanzado (Popover)

Filtros por:
- Tipos (checkbox)
- Estado (checkbox)
- Condición (checkbox)

Patrón: `tempFilters` → `applyAdvancedFilters()` para evitar aplicar en tiempo real.

**Ubicación**: `PeoplePage.tsx:121-122, 151-158`

### 6.5 Filtrado de Tabla (Excel-style)

Cada columna de `PeopleTable` tiene su propio Popover con filtro.

**Función**: `matchesTableFilters()` - `PeoplePage.tsx:51-67`

### 6.6 Crear Persona

```
1. Click "Nueva persona"
2. setCreateOpen(true)
3. Modal abre con Form
4. Usuario llena campos (nombre, teléfono, email, tipos, estado)
5. Click "Guardar"
6. form.validateFields()
7. peopleService.create({...})
8. POST /api/people
9. Respuesta: Person
10. setItems([newPerson, ...items])
11. setSelectedId(newPerson.id)
12. setCreateOpen(false)
```

**Ubicación**: `PeoplePage.tsx:124-136`

### 6.7 Editar Persona

```
1. Click "Editar" en PersonDetail
2. setEditPerson(person), setEditOpen(true)
3. Modal abre con Form pre-llenado
4. afterOpenChange → editForm.setFieldsValue(...)
5. Usuario modifica campos
6. Click "Guardar cambios"
7. editForm.validateFields()
8. peopleService.update(id, {...})
9. PATCH /api/people/:id
10. Respuesta: Person actualizada
11. setItems(c.map(p => p.id === id ? updated : p))
12. setSelectedId(updated.id)
13. setEditOpen(false)
```

**Ubicación**: `PeoplePage.tsx:138-143`

### 6.8 Eliminar Persona

```
1. Click "Eliminar" en PersonDetail
2. Popconfirm aparece
3. Click "Eliminar" en Popconfirm
4. onDelete(person)
5. peopleService.remove(person.id)
6. DELETE /api/people/:id
7. setItems(c.filter(p => p.id !== person.id))
8. Si selectedId === person.id → setSelectedId(null)
```

**Ubicación**: `PeoplePage.tsx:145-149`

### 6.9 Paginación Client-side

```typescript
const paginatedPeople = tableFilteredPeople.slice(
  (page - 1) * pageSize,
  page * pageSize
);
```

Opciones: 10, 20, 50, 100 items por página.

**Ubicación**: `PeoplePage.tsx:86, 161`

## 7. Wireframe / Layout

### 7.1 Vista Lista (sin persona seleccionada)

```
┌─────────────────────────────────────────────────────────┐
│  RESUMEN DE PERSONAS                                    │
│  ════════════════════                                   │
│  Personas                                               │
│  Gestión de personas relacionadas al consultorio...     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [🔍 Buscar persona...] [🔽 Filtro] [+ Nueva persona]  │
│  [Todos] [Pacientes] [Empresas] [Con tareas] [Pagos]   │
│                                        [Ver inactivos] [3]│
│  [Buscar: xxx ×] [Paciente ×] [Limpiar filtros]        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  LISTADO                                               │
│  Personas registradas                                  │
│  ─────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ NOMBRE ▼ │ TIPOS │ ESTADO │ TEL │ ÚLTIMA │ ... │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ Ana Pé  │ Pacie │ Activo │ 888 │ 2026-06│ ... │   │
│  │ Empres  │ Empre │ Activo │ 888 │ 2026-06│ ... │   │
│  └─────────────────────────────────────────────────┘   │
│                                      1-20 de 42        │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Vista Detalle (con persona seleccionada)

```
┌─────────────────────────────────────────────────────────┐
│  [🔍 Buscar...] [🔽 Filtro] [+ Nueva persona]          │
│  [Todos] [Pacientes] [Empresas] [Con tareas] [Pagos]   │
└─────────────────────────────────────────────────────────┘

┌────────────────────────────────┬────────────────────────┐
│  ┌──────────────────────────┐  │  LISTA COMPACTA        │
│  │ [👤] Ana Pérez           │  │  Personas              │
│  │ [Paciente] [Activo]      │  │  ────────────────────  │
│  │                          │  │  ┌──────────────────┐  │
│  │ 📞 +505 8888 1001        │  │  │ 👤 Ana Pérez     │  │
│  │ 📧 ana@email.com         │  │  │ Paciente · Activo│  │
│  │ 📅 2026-06-12            │  │  ├──────────────────┤  │
│  └──────────────────────────┘  │  │ 👤 Empresa ABC   │  │
│                                │  │ Empresa · Activo │  │
│  [Resumen][Agenda][Tareas]... │  │ ...               │  │
│  ────────────────────────────  │  └──────────────────┘  │
│                                │                        │
│  ┌──────────────────────────┐  │                        │
│  │ Resumen:                 │  │                        │
│  │ Próxima cita: Martes 14  │  │                        │
│  │ Tareas: 2 pendientes     │  │                        │
│  │ Pagos: 1 pendiente       │  │                        │
│  └──────────────────────────┘  │                        │
│                                │                        │
│  [🗑 Eliminar] [✏️ Editar] [← Volver]                  │
└────────────────────────────────┴────────────────────────┘
```

### 7.3 Modal "Nueva/Editar persona"

```
┌─────────────────────────────────────┐
│  Nueva persona                  [X] │
│  ───────────────────────────────    │
│                                     │
│  Nombre *                           │
│  [____________________________]     │
│                                     │
│  Teléfono *                         │
│  [+505 _____________________]       │
│                                     │
│  Email                              │
│  [correo@email.com ___________]     │
│                                     │
│  Tipos *                            │
│  [Paciente | Contacto | ... v]      │
│                                     │
│  Estado *                           │
│  [Activo v]                         │
│                                     │
│  Observaciones                      │
│  [____________________________]     │
│  [____________________________]     │
│                                     │
│         [Cancelar] [Guardar]        │
└─────────────────────────────────────┘
```

## 8. Funciones Auxiliares

### 8.1 En PeoplePage.tsx

| Función | Línea | Descripción |
|---------|-------|-------------|
| `useDebouncedValue<T>()` | 26-30 | Hook de debounce genérico |
| `formatTypeLabel()` | 32 | Acorta "Participante Taller" a "Taller" |
| `matchesText()` | 34-38 | Busca texto en campos de persona |
| `matchesAdvancedFilters()` | 40-49 | Aplica filtros de tipo/estado/condición |
| `matchesTableFilters()` | 51-67 | Aplica filtros de tabla Excel-style |

### 8.2 En PeopleTable.tsx

| Función | Línea | Descripción |
|---------|-------|-------------|
| `highlight()` | 11-19 | Resalta texto coincidente con búsqueda |
| `HeaderFilterButton()` | 33-40 | Botón de filtro de columna |

## 9. Observaciones Técnicas

### 9.1 Backend Integrado

El backend está en `apps/web/functions/api/people/`. Endpoints:
- `GET /api/people` — Requiere permiso `personas → read`
- `POST /api/people` — Requiere permiso `personas → create`
- `GET /api/people/:id` — Requiere permiso `personas → read`
- `PATCH /api/people/:id` — Requiere permiso `personas → edit`
- `DELETE /api/people/:id` — Requiere permiso `personas → edit`

### 9.2 Filtrado 100% Client-side

Se descargan TODAS las personas al montar. No hay búsqueda server-side ni paginación server-side.

### 9.3 Patrón de Modal Dual

Dos instancias de `Form.useForm()`:
- `form` → Modal de crear
- `editForm` → Modal de editar

### 9.4 Hooks Concentrados

A diferencia de otros módulos, People concentra toda la lógica de hooks en `PeoplePage.tsx` (no hay archivos de hooks separados).

### 9.5 Consumidores Externos

- `apps/web/src/main.tsx` - Define ruta `/admin/personas`
- `apps/web/src/modules/dashboard/DashboardPage.tsx` - Usa `peopleService.list()` para contar personas activas

### 9.6 Control de Permisos

El módulo usa `usePermissions()` para controlar visibilidad de botones:
- **Botón "Nueva persona"**: Solo visible si `hasPermission("personas", "create")`
- **Botón "Editar"**: Solo visible si `hasPermission("personas", "edit")`
- **Botón "Eliminar"**: Solo visible si `hasPermission("personas", "edit")`

Los permisos se gestionan desde **Configuración → Permisos de módulos** (solo root/admin).
