# Módulo Personas (People)

Gestión de personas relacionadas al consultorio: fichas, historial y contexto centralizado.

## 1. Archivos del Módulo

### Frontend

| Archivo | Líneas | Función |
|---------|--------|---------|
| `apps/web/src/pages/admin/PeoplePage.tsx` | 1 | Re-export wrapper |
| `apps/web/src/modules/people/PeoplePage.tsx` | 320 | Componente principal con toda la lógica |
| `apps/web/src/modules/people/components/PeopleTable.tsx` | 159 | Tabla con filtros tipo Excel por columna |
| `apps/web/src/modules/people/components/PeopleBigCounter.tsx` | 21 | Widget de conteo (activos/pendientes/inactivos/archivados) |
| `apps/web/src/modules/people/components/PersonCard.tsx` | 39 | Tarjeta de persona (compacta o completa) |
| `apps/web/src/modules/people/components/PersonDetail.tsx` | 114 | Vista detalle con tabs |
| `apps/web/src/modules/people/components/PersonSummaryLine.tsx` | 13 | Línea de resumen con icono |
| `apps/web/src/modules/people/components/PersonAgendaList.tsx` | 23 | Lista de citas de la persona |
| `apps/web/src/modules/people/components/PersonTasksList.tsx` | 22 | Lista de tareas de la persona |
| `apps/web/src/modules/people/components/PersonFinanceList.tsx` | 33 | Lista de pagos pendientes + servicios |
| `apps/web/src/modules/people/components/PersonHistoryList.tsx` | 18 | Historial de interacciones |

### Servicios, Tipos y Utilidades

| Archivo | Función |
|---------|---------|
| `apps/web/src/types/adminPeople.ts` | Tipos TypeScript (Person, PersonType, etc.) |
| `apps/web/src/services/peopleService.ts` | Servicio REST CRUD con tipos `CreatePersonInput`/`UpdatePersonInput` |
| `apps/web/src/services/apiClient.ts` | Cliente HTTP base con auth |
| `apps/web/src/services/index.ts` | Barrel export |
| `apps/web/src/utils/formatting.tsx` | Funciones compartidas: `formatTypeLabel()`, `highlight()` |

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
  proximaActividadTexto: string;  // ← Verificado en matchesTableFilters
  indicadores: TableIndicatorFilter[];
};
```

## 4. API / Endpoints

### 4.1 Endpoints Consumidos

| Método | Endpoint | Función | Permiso | Usado en |
|--------|----------|---------|---------|----------|
| `GET` | `/api/people` | Listar todas | `personas → read` | `PeoplePage.tsx:102` |
| `POST` | `/api/people` | Crear persona | `personas → create` | `PeoplePage.tsx:147` |
| `PATCH` | `/api/people/:id` | Actualizar persona | `personas → edit` | `PeoplePage.tsx:164` |
| `DELETE` | `/api/people/:id` | Eliminar persona | `personas → edit` | `PeoplePage.tsx:182` |
| `GET` | `/api/people/:id` | Obtener por ID | `personas → read` | (disponible, no usado directamente) |

### 4.2 Tipos de Entrada del Servicio

```typescript
// apps/web/src/services/peopleService.ts:4-24
interface CreatePersonInput {
  nombre: string;
  telefono: string;
  email?: string;
  tipos: PersonType[];
  estado: PersonStatus;
  fecha_creacion: string;
  ultima_interaccion: string;
  observaciones_administrativas?: string;
  fuente?: string;
  responsable?: string;
  etiquetas?: string[];
  proxima_actividad?: string;
  proxima_actividad_detalle?: string;
  citas?: Person["citas"];
  tareas?: Person["tareas"];
  finanzas?: Person["finanzas"];
  historial?: Person["historial"];
}

type UpdatePersonInput = Partial<CreatePersonInput>;
```

### 4.3 Respuesta Esperada

```json
{ "data": Person | Person[] | null }
```

### 4.4 Datos para Crear Persona

```json
{
  "nombre": "string (requerido)",
  "telefono": "string (requerido)",
  "email": "string (opcional)",
  "tipos": "PersonType[] (requerido)",
  "estado": "PersonStatus (requerido, default: 'Activo')",
  "fecha_creacion": "YYYY-MM-DD (auto)",
  "ultima_interaccion": "YYYY-MM-DD (auto)",
  "observaciones_administrativas": "string (opcional)",
  "fuente": "string (default: 'Manual')",
  "responsable": "string (opcional, user.id)",
  "etiquetas": "string[] (opcional)",
  "proxima_actividad": "string (default: 'Sin actividad')",
  "proxima_actividad_detalle": "string (default: 'Pendiente de asignación')",
  "citas": "{ proximas: [], historial: [] } (auto)",
  "tareas": "{ pendientes: [], completadas: [] } (auto)",
  "finanzas": "{ pagadas: [], pendientes: [], servicios: [] } (auto)",
  "historial": "[] (auto)"
}
```

## 5. Componentes

### 5.1 Árbol de Componentes

```
PeoplePage (PeoplePage.tsx)
├── Header Section (Card)
│   ├── Título "Personas"
│   └── Descripción
│
├── [Si !canRead]
│   └── Empty "No tienes permiso para ver este módulo"
│
├── [Si loading]
│   └── Spin (centrado, min-h-[300px])
│
├── [Si canRead && !loading]
│   ├── Toolbar Section (Card)
│   │   ├── Input (búsqueda)
│   │   ├── Popover (filtro avanzado)
│   │   ├── Button "Nueva persona" (disabled si !canCreate)
│   │   ├── Quick Filters (botones)
│   │   ├── Toggle "Ver inactivos"
│   │   └── Counter ( PeopleBigCounter )
│   ├── Active Chips (condicional)
│   │
│   ├── [Si selectedPerson]
│   │   ├── PersonDetail (layout izquierda)
│   │   │   ├── Card (info + avatar + acciones condicionales a canEdit)
│   │   │   ├── Tabs (Resumen, Agenda, Tareas, Finanzas, Historial)
│   │   │   │   ├── PersonSummaryLine (×3)
│   │   │   │   ├── PersonAgendaList
│   │   │   │   ├── PersonTasksList
│   │   │   │   ├── PersonFinanceList
│   │   │   │   └── PersonHistoryList
│   │   │   └── Card (info general)
│   │   └── Lista compacta (derecha)
│   │       ├── PeopleBigCounter
│   │       └── PersonCard (×n, compact)
│   │
│   ├── [Si no selectedPerson]
│   │   └── PeopleTable (con prop allFilteredPeople)
│   │       ├── thead (filtros por columna)
│   │       └── tbody (filas clickeables)
│   │
│   ├── Modal "Nueva persona"
│   │   └── Form (nombre, teléfono, email, tipos, estado, fuente, etiquetas, observaciones)
│   │
│   └── Modal "Editar persona"
│       └── Form (nombre, teléfono, email, tipos, estado, fuente, etiquetas, responsable,
│                  última interacción, próxima actividad, detalle actividad, observaciones)
```

### 5.2 PeopleTable (PeopleTable.tsx)

Tabla con filtros tipo Excel por columna. Recibe `allFilteredPeople` como prop para calcular opciones de horas correctamente (no solo la página actual).

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

Props: `person`, `onBack`, `onEdit?` (opcional), `onDelete?` (opcional)
- `onEdit` y `onDelete` son opcionales: si no se pasan, los botones no se renderizan
- Importa `formatTypeLabel` desde `utils/formatting.tsx`

Tabs disponibles:
1. **Resumen**: Próxima cita, tareas pendientes, pagos pendientes
2. **Agenda**: Lista de citas (próximas + historial)
3. **Tareas**: Lista de tareas (pendientes + completadas)
4. **Finanzas**: Pagos pendientes + servicios
5. **Historial**: Registro de interacciones

### 5.4 PersonCard (PersonCard.tsx)

Props: `person`, `compact?`, `selected?`, `onClick`, `query?`

Importa `formatTypeLabel` y `highlight` desde `utils/formatting.tsx`.

Modos:
- **Completo**: Muestra todos los detalles (última interacción, próxima actividad, tareas pendientes)
- **Compacto**: Solo nombre, email, tipos, estado, fecha, próxima actividad

## 6. Flujos Principales

### 6.1 Carga de Datos

```
1. PeoplePage monta
2. Verifica canRead → si no, muestra Empty y return
3. useEffect llama Promise.all([peopleService.list(), usersService.list()])
4. GET /api/people + GET /api/users (en paralelo)
5. Respuesta: Person[] + User[]
6. setItems(records), setUsers(userRecords)
7. setLoading(false)
8. Muestra Spin mientras carga
9. Todo el filtrado es client-side
```

**Ubicación**: `PeoplePage.tsx:99-110`

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
- `useDebouncedValue()` - `PeoplePage.tsx:29-33`
- `matchesText()` - `PeoplePage.tsx:35-39`

### 6.3 Filtrado Rápido (Quick Filters)

| Filtro | Comportamiento |
|--------||
| Todos | Limpia todos los filtros |
| Pacientes | `types = ["Paciente"]` |
| Empresas | `types = ["Empresa", "Contacto Empresarial"]` |
| Con tareas | `conditions = ["Con tareas"]` |
| Pagos | `conditions = ["Con pagos pendientes"]` |

**Ubicación**: `PeoplePage.tsx:130-139`

### 6.4 Filtrado Avanzado (Popover)

Filtros por:
- Tipos (checkbox)
- Estado (checkbox)
- Condición (checkbox)

Patrón: `tempFilters` → `applyAdvancedFilters()` para evitar aplicar en tiempo real.
`clearAdvancedFilters()` solo resetea `tempFilters`, no `filters` (se aplican solo al hacer click en "Aplicar").

**Ubicación**: `PeoplePage.tsx:141-142, 188-195`

### 6.5 Filtrado de Tabla (Excel-style)

Cada columna de `PeopleTable` tiene su propio Popover con filtro. Recibe `allFilteredPeople` para que el dropdown de horas muestre todas las opciones disponibles (no solo las de la página actual).

**Función**: `matchesTableFilters()` - `PeoplePage.tsx:52-70`
**Prop**: `allFilteredPeople` - `PeopleTable.tsx:33, 43`

### 6.6 Crear Persona

```
1. Click "Nueva persona" (verificado canCreate)
2. setCreateOpen(true)
3. Modal abre con Form (initialValues: estado="Activo", tipos=["Paciente"], fuente="Manual")
4. Usuario llena campos:
   - nombre* (requerido)
   - teléfono* (requerido)
   - email (validación de tipo)
   - tipos* (requerido, multi-select)
   - estado* (requerido)
   - fuente (select: Manual, Referido, Red social, Web, Otro)
   - etiquetas (mode="tags")
   - observaciones (textarea)
5. Click "Guardar"
6. form.validateFields() (dentro de try/catch)
7. peopleService.create({...})
8. POST /api/people
9. Backend: parsea nombre en nombre_1/apellido_1, crea registros relacionados vacíos
10. Respuesta: Person con datos completos (incluye relatedData vacío)
11. setItems([newPerson, ...items])
12. setSelectedId(newPerson.id)
13. setCreateOpen(false)
14. form.resetFields()
```

**Ubicación**: `PeoplePage.tsx:144-158`

### 6.7 Editar Persona

```
1. Click "Editar" en PersonDetail (solo visible si canEdit)
2. setEditPerson(person), setEditOpen(true)
3. Modal abre con Form pre-llenado (afterOpenChange → editForm.setFieldsValue)
4. Usuarios cargados desde usersService para selector de responsable
5. Usuario modifica campos:
   - nombre*, teléfono*, email, tipos*, estado*
   - fuente, etiquetas
   - responsable (select de usuarios)
   - última interacción (DatePicker)
   - próxima actividad, detalle de actividad
   - observaciones
6. Click "Guardar cambios"
7. editForm.validateFields() (dentro de try/catch)
8. peopleService.update(id, {...})
9. PATCH /api/people/:id
10. Backend: parsea nombre, actualiza campos con COALESCE
11. Respuesta: Person actualizada con relatedData
12. setItems(c.map(p => p.id === id ? updated : p))
13. setSelectedId(updated.id)
14. setEditOpen(false), setEditPerson(null)
15. editForm.resetFields()
```

**Ubicación**: `PeoplePage.tsx:160-178`

### 6.8 Eliminar Persona

```
1. Click "Eliminar" en PersonDetail (solo visible si canEdit)
2. Popconfirm aparece ("¿Eliminar esta persona?")
3. Click "Eliminar" en Popconfirm
4. onDelete(person)
5. peopleService.remove(person.id)
6. DELETE /api/people/:id
7. Backend: soft delete (deleted_at = now)
8. setItems(c.filter(p => p.id !== person.id))
9. Si selectedId === person.id → setSelectedId(null)
```

**Ubicación**: `PeoplePage.tsx:180-186`

### 6.9 Paginación Client-side

```typescript
const paginatedPeople = tableFilteredPeople.slice(
  (page - 1) * pageSize,
  page * pageSize
);
```

Opciones: 10, 20, 50, 100 items por página.

**Ubicación**: `PeoplePage.tsx:93-94, 198`

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

### 7.3 Modal "Nueva persona"

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
│  Fuente                             │
│  [Manual v]                         │
│                                     │
│  Etiquetas                          │
│  [escribe y presiona Enter]         │
│                                     │
│  Observaciones                      │
│  [____________________________]     │
│  [____________________________]     │
│                                     │
│         [Cancelar] [Guardar]        │
└─────────────────────────────────────┘
```

### 7.4 Modal "Editar persona"

```
┌─────────────────────────────────────┐
│  Editar persona                [X]  │
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
│  Fuente                             │
│  [Manual v]                         │
│                                     │
│  Etiquetas                          │
│  [escribe y presiona Enter]         │
│                                     │
│  Responsable                        │
│  [Seleccionar usuario v]            │
│                                     │
│  Última interacción                 │
│  [📅 2026-06-26]                    │
│                                     │
│  Próxima actividad                  │
│  [Título de la actividad]           │
│                                     │
│  Detalle de actividad               │
│  [Descripción]                      │
│                                     │
│  Observaciones                      │
│  [____________________________]     │
│  [____________________________]     │
│                                     │
│      [Cancelar] [Guardar cambios]   │
└─────────────────────────────────────┘
```

## 8. Funciones Auxiliares

### 8.1 En PeoplePage.tsx

| Función | Línea | Descripción |
|---------|-------|-------------|
| `useDebouncedValue<T>()` | 29-33 | Hook de debounce genérico |
| `matchesText()` | 35-39 | Busca texto en campos de persona |
| `matchesAdvancedFilters()` | 41-50 | Aplica filtros de tipo/estado/condición |
| `matchesTableFilters()` | 52-70 | Aplica filtros de tabla Excel-style (incluye proximaActividadTexto) |

### 8.2 En PeopleTable.tsx

| Función | Línea | Descripción |
|---------|-------|-------------|
| `HeaderFilterButton()` | 22-29 | Botón de filtro de columna |

### 8.3 En utils/formatting.tsx (compartido)

| Función | Línea | Descripción | Usado en |
|---------|-------|-------------|----------|
| `formatTypeLabel()` | 3-5 | Acorta "Participante Taller" a "Taller" | PeoplePage, PeopleTable, PersonCard, PersonDetail |
| `highlight()` | 7-15 | Resalta texto coincidente con búsqueda | PeopleTable, PersonCard |

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
- `form` → Modal de crear (initialValues: estado="Activo", tipos=["Paciente"], fuente="Manual")
- `editForm` → Modal de editar (pre-llenado con `afterOpenChange`)

### 9.4 Hooks Concentrados

A diferencia de otros módulos, People concentra toda la lógica de hooks en `PeoplePage.tsx` (no hay archivos de hooks separados).

### 9.5 Funciones Compartidas

`formatTypeLabel()` y `highlight()` están centralizadas en `utils/formatting.tsx` e importadas por PeoplePage, PeopleTable, PersonCard y PersonDetail.

### 9.6 Consumidores Externos

- `apps/web/src/main.tsx` - Define ruta `/admin/personas`
- `apps/web/src/modules/dashboard/DashboardPage.tsx` - Usa `peopleService.list()` con `Promise.allSettled`

### 9.7 Control de Permisos

El módulo usa `usePermissions()` para controlar visibilidad de botones:
- **Botón "Nueva persona"**: Solo habilitado si `hasPermission("personas", "create")`
- **Botón "Editar"**: Solo visible si `hasPermission("personas", "edit")`
- **Botón "Eliminar"**: Solo visible si `hasPermission("personas", "edit")`
- **Página completa**: Muestra Empty si `!canRead`

Los permisos se gestionan desde **Configuración → Permisos de módulos** (solo root/admin).

### 9.8 Loading State

La página muestra un `<Spin>` centrado mientras carga los datos iniciales (people + users). Si no tiene permiso de lectura, muestra un `<Empty>` con mensaje de "Sin permiso".

### 9.9 Selector de Responsable

El modal de editar incluye un selector de responsable cargado desde `usersService.list()`. El valor se envía como `responsable` y se almacena en la columna `assigned_user_id` de la DB.
