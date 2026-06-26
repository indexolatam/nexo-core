# Documentación General - nexo-core

Arquitectura y patrones del proyecto para agentes de IA y desarrolladores.

## 1. Visión General

**nexo-core** es un sistema de gestión para consultorios/clinicas que incluye:
- Panel de administración (React SPA)
- API REST backend (Cloudflare Pages Functions en `apps/web/functions/`)
- Base de datos Cloudflare D1 (SQLite en el edge)

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Framework | React | 19.1.0 |
| Lenguaje | TypeScript | 5.8.3 |
| UI Library | Ant Design | 5.24.9 |
| Estilos | Tailwind CSS | 3.4.13 |
| Routing | React Router DOM | 7.5.3 |
| Build Tool | Vite | 6.3.5 |
| Base de datos | Cloudflare D1 | (SQLite edge) |
| Backend | Cloudflare Pages Functions | (serverless) |

## 3. Estructura del Proyecto

```
nexo-core/
├── apps/
│   └── web/                    # Aplicación principal
│       ├── db/                 # Migraciones y seeds SQL
│       │   ├── migrations/     # Archivos de migración
│       │   ├── seeds/          # Datos de prueba
│       │   └── client.sql      # BD completa unificada
│       ├── scripts/            # Scripts de desarrollo
│       ├── src/
│       │   ├── config/         # Configuración (client.ts)
│       │   ├── context/        # React Contexts globales
│       │   ├── layouts/        # Layouts (AdminLayout, PublicLayout)
│       │   ├── modules/        # Módulos por dominio
│       │   │   ├── auth/       # Autenticación
│       │   │   ├── dashboard/  # Dashboard principal
│       │   │   ├── finance/    # Finanzas
│       │   │   ├── people/     # Personas (CRUD)
│       │   │   ├── tasks/      # Tareas
│       │   │   └── ...         # Otros módulos
│       │   ├── pages/          # Re-exports de páginas
│       │   ├── services/       # Servicios API (REST clients)
│       │   ├── shared/         # Componentes compartidos
│       │   ├── types/          # Definiciones TypeScript
│       │   ├── main.tsx        # Entry point + Router
│       │   └── index.css       # Estilos globales
│       ├── package.json
│       └── vite.config.ts
├── docs/                       # Esta documentación
├── scripts/                    # Scripts de root
└── template/                   # Plantillas reutilizables
```

## 4. Arquitectura de Aplicación

### 4.1 Router (main.tsx)

```
/ -> App
├── /login -> LoginPage
├── /admin -> RequireAuth > BankConfigProvider > AdminLayout
│   ├── /admin (index) -> DashboardPage
│   ├── /admin/personas -> PeoplePage
│   ├── /admin/agenda -> AgendaPage
│   ├── /admin/finanzas -> FinancePage
│   ├── /admin/tareas -> TasksPage
│   ├── /admin/configuracion -> SettingsPage
│   ├── /admin/logs -> AuditLogsPage
│   └── /admin/blog -> BlogPage
└── / (PublicLayout)
    ├── / (index) -> HomePage
    ├── /servicios -> ServicesPage
    ├── /blog -> BlogPage
    └── /contacto -> ContactPage
```

### 4.2 Providers (Envoltorios)

```
ThemeProvider (contexto global de tema)
└── AuthProvider (contexto de autenticación)
    └── RouterProvider (enrutador)
        └── RequireAuth (protección de rutas admin)
            └── BankConfigProvider (configuración bancaria)
```

## 5. Patrones de Código

### 5.1 Módulos

Cada dominio del negocio tiene su propio módulo en `src/modules/{nombre}/`:

```
modules/people/
├── PeoplePage.tsx           # Componente principal (página)
└── components/
    ├── PeopleTable.tsx      # Tabla con filtros
    ├── PeopleBigCounter.tsx # Widget de conteo
    ├── PersonCard.tsx       # Tarjeta compacta
    ├── PersonDetail.tsx     # Vista detalle
    └── Person*.tsx          # Sub-componentes
```

### 5.2 Re-exports en Pages

`src/pages/admin/PeoplePage.tsx` es un wrapper de 1 línea:
```tsx
export { PeoplePage } from "../../modules/people/PeoplePage";
```

### 5.3 Servicios API

Patrón de servicio en `src/services/`:

```typescript
// peopleService.ts
class PeopleApiService {
  async list() { return apiRequest<Person[]>("/people"); }
  async getById(id: string) { return apiRequest<Person>("/people/" + id); }
  async create(data: Record<string, unknown>) { return apiRequest<Person>("/people", { method: "POST", body: data }); }
  async update(id: string, data: Record<string, unknown>) { return apiRequest<Person>("/people/" + id, { method: "PATCH", body: data }); }
  async remove(id: string) { await apiRequest<null>("/people/" + id, { method: "DELETE" }); }
}
export const peopleService = new PeopleApiService();
```

### 5.4 Cliente HTTP (apiClient.ts)

- Base URL: `VITE_API_BASE_URL` o fallback `/api`
- Auth: Bearer token en localStorage (`${CLIENT.id}-admin-token`)
- Respuesta esperada: `{ data: T }`
- Errores: Lanza `Error` con mensaje del body

### 5.5 Tipos TypeScript

Definidos en `src/types/adminPeople.ts` (por módulo):

```typescript
export type PersonType = "Paciente" | "Contacto" | "Participante Taller" | "Empresa" | "Contacto Empresarial";
export type PersonStatus = "Activo" | "Inactivo" | "Pendiente" | "Archivado";
export type Person = {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  tipos: PersonType[];
  estado: PersonStatus;
  // ... más campos
};
```

### 5.6 Hooks

- **useDebouncedValue**: Hook local en PeoplePage.tsx (no en archivo separado)
- **useState/useEffect/useMemo**: Lógica de estado concentrada en el componente principal
- **Form.useForm()**: Dos instancias (crear y editar)

## 6. Base de Datos

### 6.1 Migraciones

Ubicación: `apps/web/db/migrations/`

| Archivo | Contenido |
|---------|-----------|
| `0001_local_core.sql` | Tablas: `people`, `bank_configs` + seeds |
| `0002_services.sql` | Tabla: `services` |
| `0003_users_auth.sql` | Tablas: `users`, `auth_sessions` |
| `0004_finance_movements.sql` | Tabla: `finance_movements` (FK → people) |
| `0005_agenda_events.sql` | Tablas: `agenda_events`, `agenda_event_instances` (FK → people) |
| `0006_tasks.sql` | Tabla: `tasks` (FK → people) |
| `0007_blog_posts.sql` | Tabla: `blog_posts` |
| `0008_palette.sql` | Tabla: `palette_settings` |
| `0009_audit_log.sql` | Tabla: `audit_log` (FK → people) |
| `0010_contact_requests.sql` | Tabla: `contact_requests` |
| `0011_services_columns.sql` | ALTER TABLE services (columnas adicionales) |
| `0012_core_seed_dependencies.sql` | Seeds de people, services, users |
| `0013_service_seed_dependencies.sql` | Seeds de services |
| `0014_finance_columns_and_banks.sql` | ALTER TABLE finance + seed banks |
| `0015_tasks_columns.sql` | ALTER TABLE tasks (columnas adicionales) |
| `0016_module_permissions.sql` | Tabla: `module_permissions` (permisos por rol/módulo) |

### 6.2 Convenciones de Tablas

```sql
CREATE TABLE IF NOT EXISTS entidad (
  id TEXT PRIMARY KEY,
  -- campos de negocio --
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT,              -- Soft delete
  created_by_user_id TEXT,
  updated_by_user_id TEXT
);
```

### 6.3 Seeds

- `db/seeds/seed_people.sql` - Datos adicionales de prueba
- `db/client.sql` - Archivo completo unificado (DDL + seeds)

## 7. Convenciones de Código

### 7.1 Naming

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `PeoplePage.tsx` |
| Servicios | camelCase | `peopleService.ts` |
| Tipos | PascalCase | `Person`, `PersonType` |
| Constantes | camelCase | `defaultFilters` |
| Funciones auxiliares | camelCase | `formatTypeLabel()` |

### 7.2 Estilos

- **Tailwind CSS** para utilidades
- **CSS Variables** para temas: `var(--accent)`, `var(--border)`, `var(--surface-strong)`
- **Ant Design** para componentes UI
- **Clases híbridas**: Tailwind + Ant Design `className`

### 7.3 Formularios

- Patrón `Form.useForm()` para crear y editar
- Modal con `destroyOnClose` para resetear estado
- Validación con `rules` de Ant Design

### 7.4 Filtrado (Client-side)

```typescript
// Patrón PeoplePage.tsx
const debouncedSearch = useDebouncedValue(search, 200);
const filteredPeople = useMemo(() => items.filter(...), [debouncedSearch, filters, items]);
const paginatedPeople = filteredPeople.slice((page - 1) * pageSize, page * pageSize);
```

## 8. Scripts Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo (Vite)
npm run build    # Compilar producción (tsc + vite build)
npm run lint     # Ejecutar ESLint
npm run dev:api  # Iniciar con backend (PowerShell)
```

## 9. Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL base de la API | `/api` |

## 10. Autenticación y Permisos

### 10.1 Autenticación

- Token almacenado en `localStorage` con key `${CLIENT.id}-admin-token`
- Enviado como `Authorization: Bearer {token}`
- Rutas admin protegidas con componente `RequireAuth`
- Middleware `requireAuth.js` valida token en cada request API

### 10.2 Permisos por Módulo

Sistema de control de acceso basado en roles y módulos:

- **Tabla**: `module_permissions` (role, module, can_read, can_create, can_edit)
- **API**: `GET/PUT /api/settings/permissions` (solo root/admin)
- **Hook**: `usePermissions()` → `hasPermission(module, action)`
- **Backend**: `requirePermission(module, action)` por endpoint

**Roles y techo máximo de permisos:**

| Módulo | root | admin | doctor | asistente |
|--------|------|-------|--------|-----------|
| personas | R+C+E | R+C+E | — | R+C+E |
| finanzas | R+C+E | R+C+E | — | R+C+E |
| agenda | R+C+E | R+C+E | R+C+E | R+C+E |
| tareas | R+C+E | R+C+E | R+C+E | R+C+E |
| configuracion | R+C+E | R+C+E | — | R |
| auditoria | R+C+E | — | — | — |
| blog | R+C+E | — | — | — |

Root/admin pueden **restar** privilegios pero nunca exceder el techo del rol.
