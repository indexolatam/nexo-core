# Módulo Agenda

Gestión de eventos, calendario y actividad del negocio. Crear, editar, reprogramar, confirmar, cancelar, repetir y duplicar actividades.

## 1. Archivos del Módulo

### Frontend

| Archivo | Líneas | Función |
|---------|--------|---------|
| `apps/web/src/pages/admin/AgendaPage.tsx` | 1 | Re-export wrapper |
| `apps/web/src/modules/agenda/AgendaPage.tsx` | 504 | Componente principal con toda la lógica |
| `apps/web/src/modules/agenda/components/AgendaFilters.tsx` | 107 | UI: Pill, FilterGroup, SegmentedControl, PeriodNavigator |
| `apps/web/src/modules/agenda/components/CalendarView.tsx` | 436 | UI: EventList, CalendarBoard, LocationBadge |
| `apps/web/src/modules/agenda/components/EventForm.tsx` | 500 | Formulario de acciones rápidas |

### Servicios, Tipos y Utilidades

| Archivo | Función |
|---------|---------|
| `apps/web/src/types/adminAgenda.ts` | Tipos TypeScript + constantes (AgendaEvent, AgendaView, AgendaFilter, etc.) |
| `apps/web/src/types/d1.ts` | Tipos D1 (D1AgendaEvent, D1AgendaEventInstance) |
| `apps/web/src/services/agendaService.ts` | Servicio REST: list(), create(), update() |
| `apps/web/src/services/apiClient.ts` | Cliente HTTP base con auth |
| `apps/web/src/services/index.ts` | Barrel export |

### Backend (API)

| Archivo | Función |
|---------|---------|
| `apps/web/functions/api/agenda/index.js` | GET listar + POST crear |
| `apps/web/functions/api/agenda/[id].js` | PATCH actualizar por ID |
| `apps/web/functions/_core/db.js` | Schema de la DB |
| `apps/web/functions/_core/permissions.js` | Helper requirePermission + getUserPermission |

### Base de Datos

| Archivo | Función |
|---------|---------|
| `apps/web/db/migrations/0005_agenda_events.sql` | CREATE TABLE agenda_events + agenda_event_instances + seeds |
| `apps/web/db/seeds/seed_agenda_juan_pedro.sql` | Seeds: 6 eventos para personas per-005 y per-007 |
| `apps/web/db/seeds/seed_agenda_3_sessions.sql` | Seeds: 15 eventos para 6 personas |
| `apps/web/db/client.sql` | BD completa unificada |

## 2. Base de Datos

### 2.1 Esquema de la tabla `agenda_events`

```sql
CREATE TABLE IF NOT EXISTS agenda_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  meta TEXT,
  category TEXT DEFAULT 'Consultas',
  tone TEXT,
  status TEXT NOT NULL DEFAULT 'Pendiente',
  assigned_user_id TEXT,
  person_id TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  tiempo_previo_minutes INTEGER,
  tiempo_posterior_minutes INTEGER,
  location_type TEXT NOT NULL DEFAULT 'en_clinica',
  location_department TEXT,
  location_reference TEXT,
  meeting_url TEXT,
  service_id TEXT,
  is_recurring INTEGER NOT NULL DEFAULT 0,
  recurrence_frecuencia TEXT,
  recurrence_interval INTEGER,
  recurrence_dias_semana TEXT,
  recurrence_dia_mes INTEGER,
  recurrence_count INTEGER,
  recurrence_fin TEXT,
  recurrence_ajustar_laboral INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT,
  created_by_user_id TEXT,
  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (assigned_user_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);
```

### 2.2 Esquema de la tabla `agenda_event_instances`

```sql
CREATE TABLE IF NOT EXISTS agenda_event_instances (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  status TEXT NOT NULL DEFAULT 'Pendiente',
  is_confirmed INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (event_id) REFERENCES agenda_events(id)
);
```

### 2.3 Relaciones FK

```
agenda_events.person_id → people.id
agenda_events.assigned_user_id → users.id
agenda_events.service_id → services.id
agenda_event_instances.event_id → agenda_events.id
```

### 2.4 Seeds

```sql
INSERT INTO agenda_events (id, title, meta, category, tone, status, ...)
VALUES
  ('evt-001', 'Consulta', 'Confirmada', 'Consultas', 'correcto', 'Confirmado', ...),
  ('evt-002', 'Consulta', 'Confirmada', 'Consultas', 'correcto', 'Confirmado', ...);
```

## 3. Modelo de Datos TypeScript

### 3.1 Tipo Principal: `AgendaEvent`

```typescript
type AgendaEvent = {
  id: string;
  day: string;
  date: number;
  time: string;
  title: string;
  meta: string;
  filter: AgendaFilter;
  tone: AgendaTone;
  status: AgendaStatus;
  owner: AgendaOwner;
  person?: string;
  isRecurring?: boolean;
  locationType: AgendaLocationType;
  tiempoPrevioMinutes?: number;
  tiempoPosteriorMinutes?: number;
  locationDepartment?: string;
  locationReference?: string;
  meetingUrl?: string;
};
```

### 3.2 Tipo D1: `D1AgendaEvent`

```typescript
type D1AgendaEvent = {
  id: string;
  title: string;
  meta?: string;
  category: string;
  tone?: string;
  status: string;
  assigned_user_id?: string;
  person_id?: string;
  starts_at: string;
  ends_at?: string;
  tiempo_previo_minutes?: number;
  tiempo_posterior_minutes?: number;
  location_type: string;
  location_department?: string;
  location_reference?: string;
  meeting_url?: string;
  service_id?: string;
  is_recurring: boolean;
};
```

### 3.3 Tipos Derivados

```typescript
type AgendaView = "Hoy" | "Semana" | "Mes";
type AgendaFilter = "Todos" | "Consultas" | "Administración" | "Marketing" | "Empresas" | "Talleres" | "Personal";
type AgendaTone = "correcto" | "atencion" | "neutro";
type AgendaStatus = "Pendiente" | "Confirmado" | "Completado" | "Cancelado" | "Reprogramado" | "En curso";
type AgendaOwner = "Doctora" | "Asistente";
type AgendaLocationType = "remoto" | "en_clinica" | "en_campo";
```

## 4. API / Endpoints

### 4.1 Endpoints Consumidos

| Método | Endpoint | Función | Permiso | Usado en |
|--------|----------|---------|---------|----------|
| `GET` | `/api/agenda` | Listar todas | `agenda → read` | `AgendaPage.tsx:96-101` |
| `POST` | `/api/agenda` | Crear evento | `agenda → create` | `agendaService.create()` |
| `PATCH` | `/api/agenda/:id` | Actualizar evento | `agenda → edit` | `agendaService.update()` |

### 4.2 Respuesta Esperada

```json
{ "data": AgendaEvent | AgendaEvent[] | null }
```

### 4.3 Datos para Crear Evento

```json
{
  "title": "string (requerido)",
  "meta": "string (opcional)",
  "category": "string (default: 'general')",
  "status": "string (default: 'Pendiente')",
  "starts_at": "ISO datetime (requerido)",
  "ends_at": "ISO datetime (opcional)",
  "location_type": "string (default: 'en_clinica')",
  "assigned_user_id": "string (opcional)",
  "person_id": "string (opcional)",
  "service_id": "string (opcional)"
}
```

## 5. Componentes

### 5.1 Árbol de Componentes

```
AgendaPage (AgendaPage.tsx)
├── Header Section (Card)
├── Actividad en curso (Card)
├── Buscar y crear (Card)
├── Row (2 columnas)
│   ├── Col xl={18} (Panel principal)
│   │   ├── Card "Eventos" / "Calendario"
│   │   │   ├── FocusMode toggle
│   │   │   ├── PeriodNavigator
│   │   │   ├── SegmentedControl (Hoy | Semana | Mes)
│   │   │   ├── Filtros (Pills por categoría)
│   │   │   └── EventList | CalendarBoard
│   │   └── ...
│   └── Col xl={6} (Panel lateral)
│       ├── Card "Evento seleccionado"
│       ├── Card "Acciones"
│       └── Card "Disponibilidad"
├── Modal (acciones rápidas)
│   └── QuickActionContent
│       ├── "Crear actividad"
│       ├── "Editar"
│       ├── "Reprogramar"
│       ├── "Confirmar"
│       ├── "Cancelar"
│       ├── "Repetir"
│       └── "Duplicar"
```

## 6. Flujos Principales

### 6.1 Carga de Datos

```
1. AgendaPage monta
2. useEffect llama agendaService.list()
3. GET /api/agenda
4. Respuesta: D1AgendaEvent[]
5. toAgendaEvent() transforma cada registro
6. setEvents(events)
```

### 6.2 Filtrado y Búsqueda

```
1. filteredEvents se calcula con useMemo
2. Filtra por período (isEventInPeriod)
3. Filtra por categoría (activeFilter)
4. Filtra por búsqueda (searchTerm)
5. Retorna eventos filtrados
```

### 6.3 Crear Actividad

```
1. Click "Crear" o acción "Crear actividad"
2. setActiveAction("Crear actividad")
3. Modal abre con QuickActionContent
4. Formulario muestra campos
5. Click "Crear actividad" (onOk)
6. closeQuickAction()
7. TODO: No hay llamada a API
```

## 7. Observaciones Técnicas

### 7.1 Backend Integrado

- `GET /api/agenda` — Requiere permiso `agenda → read`
- `POST /api/agenda` — Requiere permiso `agenda → create`
- `PATCH /api/agenda/:id` — Requiere permiso `agenda → edit`

**Nota**: No hay endpoint DELETE (el schema soporta soft delete via `deleted_at` pero no está implementado).

### 7.2 Filtrado 100% Client-side

Se descargan TODOS los eventos al montar.

### 7.3 Formulario sin Conectar

El formulario de crear actividad NO está conectado con la API.

### 7.4 Sin Permisos por Rol

El módulo Agenda NO tiene filtrado por rol en el backend.

### 7.5 Consumidores Externos

- `apps/web/src/main.tsx` — Ruta `/admin/agenda`
- `apps/web/src/modules/dashboard/DashboardPage.tsx` — `agendaService.list()`
- `apps/web/src/modules/people/components/PersonAgendaList.tsx` — Lista de agenda de una persona
