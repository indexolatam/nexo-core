# Módulo Servicios

Gestión de servicios ofrecidos por el negocio: terapias, membresías, talleres y ofertas. Incluye configuración de precio, duración, participantes y visualización en landing.

## 1. Archivos del Módulo

### Frontend (Settings)

| Archivo | Líneas | Función |
|---------|--------|---------|
| `apps/web/src/pages/admin/SettingsPage.tsx` | 1 | Re-export wrapper |
| `apps/web/src/modules/settings/SettingsPage.tsx` | 275 | Componente principal (sección servicios) |
| `apps/web/src/modules/settings/components/ConfigListItem.tsx` | — | Componente genérico de item configurable |

### Servicios, Tipos y Utilidades

| Archivo | Función |
|---------|---------|
| `apps/web/src/types/adminSettings.ts` | Tipos TypeScript (ServiceConfig) |
| `apps/web/src/types/d1.ts` | Tipos D1 (D1Service, ParticipantOption) |
| `apps/web/src/services/servicesService.ts` | Servicio REST CRUD con tipo ServiceItem |
| `apps/web/src/services/apiClient.ts` | Cliente HTTP base con auth |
| `apps/web/src/services/index.ts` | Barrel export |

### Landing

| Archivo | Función |
|---------|---------|
| `apps/web/src/landing/components/ServicesPreview.tsx` | Vista pública de servicios (fetch desde API) |
| `apps/web/src/landing/components/ContactSection.tsx` | Dropdown de servicios en formulario de contacto |

### Backend (API)

| Archivo | Función |
|---------|---------|
| `apps/web/functions/api/services/index.js` | GET listar (público + admin) + POST crear |
| `apps/web/functions/api/services/[id].js` | PATCH actualizar (con whitelist) + DELETE soft delete |
| `apps/web/functions/_core/db.js` | Schema ensureAllSchemas + seed |

### Base de Datos

| Archivo | Función |
|---------|---------|
| `apps/web/db/migrations/0019_services_redesign.sql` | Migración: DROP + CREATE con prefijo services_ + FKs |
| `apps/web/db/seeds/seed_services_landing.sql` | Seeds de servicios para landing |
| `apps/web/db/client.sql` | BD completa unificada |

## 2. Base de Datos

### 2.1 Esquema de la tabla `services`

```sql
CREATE TABLE IF NOT EXISTS services (
  services_id TEXT PRIMARY KEY,
  services_name TEXT NOT NULL,
  services_category TEXT DEFAULT 'General',
  services_duration INTEGER DEFAULT 60,
  services_duration_unit TEXT DEFAULT 'minutes',
  services_price REAL DEFAULT 0,
  services_currency TEXT DEFAULT 'USD',
  services_participants TEXT DEFAULT '[{"count":1,"label":"Individual","price":0}]',
  services_description TEXT,
  services_landing_visible INTEGER DEFAULT 0,
  services_landing_title TEXT,
  services_landing_paragraph TEXT,
  services_landing_image TEXT,
  services_landing_icon TEXT,
  services_landing_order INTEGER DEFAULT 0,
  services_landing_cta TEXT DEFAULT 'Consultar',
  services_active INTEGER DEFAULT 1,
  services_created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  services_updated_at TEXT,
  services_deleted_at TEXT,
  services_created_by TEXT,
  services_updated_by TEXT
);
```

**Convención de naming**: todas las columnas usan el prefijo `services_` (singular del nombre de tabla), en inglés, snake_case.

### 2.2 Columnas Detalladas

| Columna | Tipo | Default | Obligatorio | Descripción |
|---------|------|---------|:-----------:|-------------|
| `services_id` | TEXT | — | ★ | PK (formato `svc-{timestamp}`) |
| `services_name` | TEXT | — | ★ | Nombre interno/administrativo |
| `services_category` | TEXT | 'General' | | Terapia / Membresía / Taller / Oferta |
| `services_duration` | INTEGER | 60 | | Cantidad numérica de duración |
| `services_duration_unit` | TEXT | 'minutes' | | minutes / hours / days / weeks / months / years |
| `services_price` | REAL | 0 | | Precio base |
| `services_currency` | TEXT | 'USD' | | USD / NIO |
| `services_participants` | TEXT | JSON | | Array JSON de opciones de participantes |
| `services_description` | TEXT | — | | Descripción interna / administrativa |
| `services_landing_visible` | INTEGER | 0 | | 0=oculto, 1=visible en landing |
| `services_landing_title` | TEXT | — | | Título para landing (si difiere del name) |
| `services_landing_paragraph` | TEXT | — | | Párrafo descriptivo para landing |
| `services_landing_image` | TEXT | — | | URL de imagen para landing |
| `services_landing_icon` | TEXT | — | | Nombre del icono Ant Design |
| `services_landing_order` | INTEGER | 0 | | Orden de aparición en landing |
| `services_landing_cta` | TEXT | 'Consultar' | | Texto del botón CTA |
| `services_active` | INTEGER | 1 | | 0=inactivo, 1=activo |
| `services_created_at` | TEXT | CURRENT_TIMESTAMP | ★ | |
| `services_updated_at` | TEXT | — | | |
| `services_deleted_at` | TEXT | — | | Soft delete |
| `services_created_by` | TEXT | — | | FK → users(id) simplificado |
| `services_updated_by` | TEXT | — | | FK → users(id) simplificado |

### 2.3 Formato de `services_participants`

Columna JSON con array de objetos:

```json
[
  {"count": 1, "label": "Individual", "price": 30},
  {"count": 2, "label": "Pareja", "price": 50},
  {"count": 10, "label": "Grupo (10 personas)", "price": 15}
]
```

TypeScript:

```typescript
type ParticipantOption = {
  count: number;    // Cantidad de participantes
  label: string;    // Etiqueta descriptiva
  price: number;    // Precio por persona
};
```

### 2.4 Relaciones FK

```
services.services_id ← finance_movements.services_id
services.services_id ← agenda_events.services_id
services.services_id ← tasks.services_id
```

Las 3 tablas usan `services_id` (renombrado desde `service_id`) y referencian `services(services_id)`.

### 2.5 Seeds

```sql
INSERT INTO services (services_id, services_name, services_category, services_duration, services_duration_unit, services_price, services_currency, services_participants, services_description, services_landing_visible, services_landing_title, services_landing_paragraph, services_landing_icon, services_landing_order, services_landing_cta, services_active, services_created_at)
VALUES
  ('svc-001', 'Consulta individual', 'Terapia', 60, 'minutes', 30, 'USD', '[{"count":1,"label":"Individual","price":30}]', 'Atención terapéutica individual.', 1, 'Consulta Individual', 'Atención psicológica personalizada.', 'HeartOutlined', 1, 'Agendar', 1, datetime('now')),
  ('svc-002', 'Terapia de pareja', 'Terapia', 90, 'minutes', 50, 'USD', '[{"count":2,"label":"Pareja","price":50}]', 'Sesión terapéutica para parejas.', 1, 'Terapia de Pareja', 'Espacio de acompañamiento para parejas.', 'TeamOutlined', 2, 'Agendar', 1, datetime('now')),
  ('svc-003', 'Membresía mensual', 'Membresía', 1, 'months', 80, 'USD', '[{"count":1,"label":"Individual","price":80}]', 'Acceso mensual a servicios.', 0, NULL, NULL, NULL, 0, 'Consultar', 1, datetime('now')),
  ('svc-004', 'Taller grupal', 'Taller', 3, 'hours', 15, 'USD', '[{"count":10,"label":"Grupo (10 personas)","price":15}]', 'Taller participativo grupal.', 1, 'Taller Grupal', 'Aprende en grupo con acompañamiento.', 'TeamOutlined', 3, 'Inscribirme', 1, datetime('now'));
```

### 2.6 Migración 0019

La migración `0019_services_redesign.sql` realiza:
1. Crea tabla temporal `services_new` con prefijo `services_`
2. Migra datos existentes mapeando columnas viejas → nuevas
3. Elimina tabla `services` antigua
4. Renombra `services_new` → `services`
5. Renombra `service_id` → `services_id` en `finance_movements`, `agenda_events`, `tasks`

**Columnas eliminadas**: `color`, `is_online`, `max_participants` (reemplazado por `services_participants` JSON)

## 3. Modelo de Datos TypeScript

### 3.1 Tipo Principal: `D1Service`

```typescript
// apps/web/src/types/d1.ts
type ParticipantOption = {
  count: number;
  label: string;
  price: number;
};

type D1Service = {
  services_id: string;
  services_name: string;
  services_category: string;
  services_duration: number;
  services_duration_unit: "minutes" | "hours" | "days" | "weeks" | "months" | "years";
  services_price: number;
  services_currency: string;
  services_participants: ParticipantOption[];
  services_description?: string;
  services_landing_visible: boolean;
  services_landing_title?: string;
  services_landing_paragraph?: string;
  services_landing_image?: string;
  services_landing_icon?: string;
  services_landing_order: number;
  services_landing_cta: string;
  services_active: boolean;
  services_created_at: string;
  services_updated_at?: string;
  services_deleted_at?: string;
  services_created_by?: string;
  services_updated_by?: string;
};
```

### 3.2 Tipo Admin: `ServiceConfig`

```typescript
// apps/web/src/types/adminSettings.ts
type ServiceConfig = {
  services_id: string;
  services_name: string;
  services_duration: number;
  services_price: number;
  services_active: boolean;
};
```

### 3.3 Tipo Servicio: `ServiceItem`

```typescript
// apps/web/src/services/servicesService.ts
interface ServiceItem {
  services_id: string;
  services_name: string;
  services_duration: number;
  services_price: number;
  services_active: boolean;
  services_description?: string;
  services_category?: string;
  services_landing_visible?: boolean;
  services_landing_paragraph?: string;
  services_landing_image?: string;
  services_landing_icon?: string;
  services_landing_order?: number;
  services_landing_cta?: string;
  [key: string]: unknown;
}
```

## 4. API / Endpoints

### 4.1 Endpoints Consumidos

| Método | Endpoint | Función | Permiso | Usado en |
|--------|----------|---------|---------|----------|
| `GET` | `/api/services` | Listar servicios | Público (solo `landing_visible=1`) / Admin (todos) | `servicesService.list()`, `ServicesPreview.tsx` |
| `POST` | `/api/services` | Crear servicio | Admin | `servicesService.create()` |
| `PATCH` | `/api/services/:id` | Actualizar servicio | Admin (whitelist) | `servicesService.update()` |
| `DELETE` | `/api/services/:id` | Eliminar servicio (soft) | Admin | `servicesService.remove()` |

### 4.2 GET `/api/services`

- **Público** (sin auth): `SELECT * FROM services WHERE services_deleted_at IS NULL AND services_landing_visible = 1 ORDER BY services_name ASC`
- **Admin** (con auth): `SELECT * FROM services WHERE services_deleted_at IS NULL ORDER BY services_name ASC`

Respuesta: `D1Service[]`

### 4.3 POST `/api/services`

Crea un servicio con todos los campos. Acepta tanto nombres `services_*` como `name`, `duration`, `price`, `description`, `category` (backward compat).

```json
{
  "services_name": "Consulta individual",
  "services_duration": 60,
  "services_price": 30,
  "services_category": "Terapia",
  "services_landing_visible": 1
}
```

### 4.4 PATCH `/api/services/:id`

Actualiza solo las columnas permitidas por whitelist:

```javascript
const ALLOWED_COLUMNS = [
  "services_name", "services_category", "services_duration",
  "services_duration_unit", "services_price", "services_currency",
  "services_participants", "services_description",
  "services_landing_visible", "services_landing_title",
  "services_landing_paragraph", "services_landing_image",
  "services_landing_icon", "services_landing_order",
  "services_landing_cta", "services_active",
  "services_updated_by"
];
```

Cualquier campo fuera de la whitelist es ignorado (seguridad contra inyección SQL).

### 4.5 DELETE `/api/services/:id`

Soft delete: setea `services_deleted_at = now`.

## 5. Componentes

### 5.1 SettingsPage — Sección Servicios

La sección de servicios vive dentro de `SettingsPage.tsx` como una de las secciones colapsables (ConfigSection `"servicios"`).

```
SettingsPage (SettingsPage.tsx)
├── Card
│   ├── Section "Servicios"
│   │   ├── Button "Nuevo servicio"
│   │   └── Grid de ConfigListItem
│   │       ├── title = services_name
│   │       ├── subtitle = "{services_duration} min · ${services_price} · Activo/Inactivo"
│   │       ├── active = services_active
│   │       └── onToggle = toggleService(service)
│   ...
└── Modal "Nuevo servicio"
    ├── Input (services_name)
    ├── InputNumber (services_duration + addonAfter "min")
    └── InputNumber (services_price + prefix "$")
```

### 5.2 ServicesPreview (Landing)

```typescript
// apps/web/src/landing/components/ServicesPreview.tsx
```

Obtiene servicios desde `GET /api/services` (público). Muestra skeleton loading mientras carga.

```
ServicesPreview
├── Header "Servicios principales"
├── Grid de Cards
│   ├── title = services_name
│   ├── description = services_landing_paragraph || services_description
│   └── Button = services_landing_cta (href WhatsApp)
└── Empty state si no hay servicios
```

### 5.3 ContactSection — Dropdown de Servicios

Dropdown en formulario de contacto con opciones estáticas inline (no depende de la DB).

## 6. Flujos Principales

### 6.1 Carga de Servicios (Admin)

```
1. SettingsPage monta
2. useEffect llama servicesService.list()
3. GET /api/services (admin → todos, no ocultos)
4. Respuesta: ServiceItem[]
5. setServices(data)
6. Se renderiza grid de ConfigListItem
```

### 6.2 Crear Servicio

```
1. Click "Nuevo servicio"
2. setServiceOpen(true)
3. Modal con form (nombre, duración, precio)
4. Usuario llena campos
5. Click "Guardar"
6. servicesService.create({services_name, services_duration, services_price, services_active: true})
7. POST /api/services
8. Respuesta: ServiceItem creado
9. setServices([created, ...prev])
10. Modal cierra, form resetea
```

**Ubicación**: `SettingsPage.tsx:64-74`

### 6.3 Toggle Activo/Inactivo

```
1. Click Switch en ConfigListItem
2. toggleService(service)
3. servicesService.update(service.services_id, {services_active: !service.services_active})
4. PATCH /api/services/:id
5. Respuesta: ServiceItem actualizado
6. setServices(prev.map(s => s.services_id === updated.services_id ? updated : s))
```

**Ubicación**: `SettingsPage.tsx:76-82`

### 6.4 Soft Delete

```
1. DELETE /api/services/:id
2. UPDATE services SET services_deleted_at = now WHERE services_id = ?
```

**Nota**: No hay botón de eliminar en la UI actual. Solo disponible via API.

### 6.5 Landing Público

```
1. ServicesPreview monta
2. useEffect fetch("/api/services")
3. GET /api/services (público → solo landing_visible=1)
4. Respuesta: D1Service[] filtrado
5. Renderiza cards con skeleton loading
```

## 7. Wireframe / Layout

### 7.1 Settings — Sección Servicios

```
┌─────────────────────────────────────────────────────────┐
│  SERVICIOS                                              │
│  ════════════════════                                   │
│                                                         │
│  [+ Nuevo servicio]                                     │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │ Consulta Individual │  │ Terapia de Pareja   │      │
│  │ 60 min · $30 · Acti │  │ 90 min · $50 · Acti │      │
│  │             [🔘 on] │  │             [🔘 on] │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │ Membresía Mensual   │  │ Taller Grupal       │      │
│  │ 1 months · $80 · In │  │ 3 hours · $15 · Act │      │
│  │             [🔘 off]│  │             [🔘 on] │      │
│  └─────────────────────┘  └─────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Modal "Nuevo servicio"

```
┌─────────────────────────────────────┐
│  Nuevo servicio               [X]  │
│  ───────────────────────────────    │
│                                     │
│  Nombre del servicio                │
│  [____________________________]    │
│                                     │
│  [    60    | min ▼]                │
│                                     │
│  [$        0_                        │
│                                     │
│  ───────────────────────────────    │
│      [Cancelar] [Guardar]           │
└─────────────────────────────────────┘
```

### 7.3 Landing — ServicesPreview

```
┌─────────────────────────────────────────────────────────┐
│  Servicios                                              │
│  ════════════════════                                   │
│                                                         │
│  Servicios principales                                  │
│  Consulta los servicios disponibles...                  │
│                                                         │
│  ┌──────────────────┐ ┌──────────────────┐             │
│  │ Consulta Indiv.  │ │ Terapia Pareja   │             │
│  │                  │ │                  │             │
│  │ Atención terap.. │ │ Espacio de acom..│             │
│  │                  │ │                  │             │
│  │ [Agendar]        │ │ [Agendar]        │             │
│  └──────────────────┘ └──────────────────┘             │
│                                                         │
│  ┌──────────────────┐ ┌──────────────────┐             │
│  │ Taller Grupal    │ │ Membresía Mensual│             │
│  │                  │ │                  │             │
│  │ Aprende en grupo.│ │ Acceso mensual.. │             │
│  │                  │ │                  │             │
│  │ [Inscribirme]    │ │ [Consultar]      │             │
│  └──────────────────┘ └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

## 8. Funciones Auxiliares

### 8.1 En SettingsPage.tsx

| Función | Línea | Descripción |
|---------|-------|-------------|
| `createService()` | 64-74 | Crea servicio vía API y agrega al state |
| `toggleService()` | 76-82 | Alterna activo/inactivo vía API |

### 8.2 En ServicesPreview.tsx

| Función | Descripción |
|---------|-------------|
| `useEffect` fetch | Obtiene servicios públicos desde `/api/services` |

## 9. Observaciones Técnicas

### 9.1 Backend Integrado

El backend está en `apps/web/functions/api/services/`. Endpoints:
- `GET /api/services` — Público (sin auth) + Admin (con auth)
- `POST /api/services` — Requiere auth (admin)
- `PATCH /api/services/:id` — Requiere auth (admin) + whitelist de columnas
- `DELETE /api/services/:id` — Requiere auth (admin) + soft delete

### 9.2 Whitelist de Seguridad

El endpoint PATCH usa una whitelist de 17 columnas permitidas. Cualquier campo enviado que no esté en la lista es ignorado. Esto previene inyección SQL por column names maliciosos.

### 9.3 Landing Dinámico

`ServicesPreview.tsx` ya no usa `CLIENT.services` estático. Ahora obtiene los servicios desde la API pública (`/api/services`), filtrando solo aquellos con `services_landing_visible = 1`.

### 9.4 Patrón de Naming Consistente

La tabla `services` sigue el mismo patrón que `usuarios`:
- Prefijo = nombre de tabla en singular (`user_` / `services_`)
- Nombres en inglés
- Snake_case
- PK con prefijo (`usr-` / `svc-`)

### 9.5 Consumidores Externos

- `apps/web/src/main.tsx` — Define ruta `/servicios`
- `apps/web/src/landing/components/ServicesPreview.tsx` — Landing page
- `apps/web/src/landing/components/ContactSection.tsx` — Dropdown estático en formulario de contacto
- `apps/web/src/modules/dashboard/DashboardPage.tsx` — No consume servicios actualmente

### 9.6 Columnas Eliminadas en Redesign

- `color` — No se usaba en UI
- `is_online` — No se usaba en UI
- `max_participants` — Reemplazado por `services_participants` (JSON array)

### 9.7 Columnas Simplificadas

- `created_by_user_id` → `services_created_by`
- `updated_by_user_id` → `services_updated_by`

### 9.8 Columnas Nuevas

- `services_duration_unit` — Unidad de duración (minutes/hours/days/weeks/months/years)
- `services_currency` — Moneda (USD/NIO)
- `services_participants` — JSON array de opciones de participantes
- `services_landing_title` — Título específico para landing
- `services_landing_icon` — Nombre de icono Ant Design
- `services_landing_order` — Orden en landing
- `services_landing_cta` — Texto del botón CTA
