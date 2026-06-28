# Módulo Usuarios

Gestión de las relaciones externas del negocio: clientes, empresas, freelancers y proveedores. Fichas, historial y contexto centralizado.

## 1. Archivos del Módulo

### Frontend

| Archivo | Líneas | Función |
|---------|--------|---------|
| `apps/web/src/modules/users/UsersPage.tsx` | 324 | Componente principal con toda la lógica |
| `apps/web/src/modules/users/components/UsersTable.tsx` | 141 | Tabla con filtros por columna |
| `apps/web/src/modules/users/components/UsersBigCounter.tsx` | 21 | Widget de conteo |
| `apps/web/src/modules/users/components/UserCard.tsx` | 39 | Tarjeta de usuario |
| `apps/web/src/modules/users/components/UserDetail.tsx` | 149 | Vista detalle con tabs |
| `apps/web/src/modules/users/components/UserSummaryLine.tsx` | 13 | Línea de resumen |
| `apps/web/src/modules/users/components/UserAgendaList.tsx` | 23 | Lista de citas |
| `apps/web/src/modules/users/components/UserTasksList.tsx` | 22 | Lista de tareas |
| `apps/web/src/modules/users/components/UserFinanceList.tsx` | 33 | Lista de pagos |
| `apps/web/src/modules/users/components/UserHistoryList.tsx` | 18 | Historial |
| `apps/web/src/modules/users/components/UserForm.tsx` | 286 | Componente compartido de formulario (6 modos) |
| `apps/web/src/modules/users/components/UserFormSection.tsx` | 13 | Wrapper de sección para formulario |

### Servicios, Tipos y Utilidades

| Archivo | Función |
|---------|---------|
| `apps/web/src/types/adminUsers.ts` | Tipos TypeScript (User, UserType, etc.) |
| `apps/web/src/services/index.ts` | Barrel export (usuariosService, usersService) |
| `apps/web/src/utils/formatting.tsx` | Funciones compartidas (formatTypeLabel, formatDate, highlight) |

### Backend (API)

| Archivo | Función |
|---------|---------|
| `apps/web/functions/api/usuarios/index.js` | GET listar + POST crear (con permisos) |
| `apps/web/functions/api/usuarios/[id].js` | GET/PATCH/DELETE por ID (con permisos) |
| `apps/web/functions/_core/db.js` | Schema, mapUserRow, fetchRelatedData |
| `apps/web/functions/_core/permissions.js` | Helper requirePermission + getUserPermission |

### Base de Datos

| Archivo | Función |
|---------|---------|
| `apps/web/db/migrations/0018_rename_people_to_usuarios.sql` | Migración people → usuarios |
| `apps/web/db/migrations/0004_finance_movements.sql` | FK → usuarios |
| `apps/web/db/migrations/0005_agenda_events.sql` | FK → usuarios |
| `apps/web/db/migrations/0006_tasks.sql` | FK → usuarios |
| `apps/web/db/migrations/0009_audit_log.sql` | Auditoría sobre usuarios |

## 2. Base de Datos

### 2.1 Esquema de la tabla `usuarios` (36 columnas)

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  user_id TEXT PRIMARY KEY,
  user_name_1 TEXT NOT NULL,         user_name_2 TEXT,
  user_lastname_1 TEXT NOT NULL,     user_lastname_2 TEXT,
  user_phone_code TEXT DEFAULT '505', user_phone TEXT NOT NULL,
  user_contact_phone_code TEXT,      user_contact_phone TEXT,
  user_contact_name TEXT,            user_contact_lastname TEXT,
  user_email TEXT,                   user_status TEXT DEFAULT 'Pendiente',
  user_source TEXT,                  user_created_date DATE NOT NULL,
  user_last_interaction DATETIME,    user_next_event_date DATETIME,
  user_next_activity TEXT,           user_next_activity_detail TEXT,
  user_consent INTEGER DEFAULT 1,    user_assigned_to TEXT,
  user_address TEXT,                 user_birth_date DATE,
  user_gender TEXT,                  user_doc_id TEXT,
  user_photo_url TEXT,               user_notes TEXT,
  user_contact_pref TEXT,
  user_created_at DATETIME NOT NULL, user_updated_at DATETIME,
  user_deleted_at DATETIME,          user_created_by TEXT,
  user_updated_by TEXT,
  user_types TEXT DEFAULT '[]',      user_tags TEXT DEFAULT '[]',
  user_admin_notes TEXT DEFAULT ''
);
```

### 2.2 Relaciones FK

```
usuarios.user_id ← finance_movements.persona_id
usuarios.user_id ← agenda_events.person_id
usuarios.user_id ← tasks.person_id
usuarios.user_id ← audit_log.entity_id (entidad = 'usuarios')
```

## 3. Modelo de Datos TypeScript

### 3.1 Tipo Principal: `User`

```typescript
type User = {
  user_id: string;
  user_name_1: string;          user_name_2?: string;
  user_lastname_1: string;      user_lastname_2?: string;
  user_phone_code: string;      user_phone: string;
  user_contact_phone_code?: string; user_contact_phone?: string;
  user_contact_name?: string;   user_contact_lastname?: string;
  user_email?: string;          user_status: UserStatus;
  user_source: string;          user_created_date: string;
  user_last_interaction: string; user_next_event_date?: string;
  user_next_activity: string;   user_next_activity_detail: string;
  user_consent: boolean;        user_assigned_to: string;
  user_types: UserType[];       user_tags: string[];
  user_admin_notes: string;     user_address?: string;
  user_birth_date?: string;     user_gender?: string;
  user_doc_id?: string;         user_photo_url?: string;
  user_notes?: string;          user_contact_pref?: string;
  user_created_at: string;      user_updated_at: string;
  user_deleted_at?: string;
  citas: { proximas: UserAgendaEntry[]; historial: UserAgendaEntry[] };
  tareas: { pendientes: UserTaskEntry[]; completadas: UserTaskEntry[] };
  finanzas: { pagadas: UserPaymentEntry[]; pendientes: UserPaymentEntry[]; servicios: string[] };
  historial: UserHistoryEntry[];
};
```

### 3.2 Tipos Derivados

```typescript
type UserType = "Cliente" | "Empresa" | "Freelancer" | "Proveedor";
type UserStatus = "Activo" | "Inactivo" | "Pendiente" | "Archivado";
type UserTypeFilter = "Todos" | UserType;
type UserConditionFilter = null | "conTareas" | "pagoPendiente";
type UserStatusFilter = null | "inactivos" | "archivados";
```

## 4. Sistema de Filtros

### 4.1 Toolbar (4 filas)

```
Fila 1: [🔍 Buscar nombre, email, teléfono...]  [●]  [+ Nuevo]
Fila 2: [Todos] [Clientes] [Empresas] [Freelancers] [Proveedores]
Fila 3: [Con tareas] [Pend. pago] | [Inactivos] [Archivados] | Limpiar filtros
Fila 4: "2 filtros · 42 resultados" [chip×] [chip×] ...
```

### 4.2 Reglas de filtros

| Filtro | Tipo | Combinación |
|--------|------|-------------|
| Fila 2 (Tipo) | Single-select | Solo uno activo a la vez |
| Con tareas / Pend. pago | Toggle acumulativo | Se combina con tipo, mutuamente excluyentes entre sí |
| Inactivos / Archivados | Toggle único | Mutuamente excluyentes, filtran tipo Y estado |

### 4.3 Columnas de tabla

| Columna | Filtro | Tipo |
|---------|--------|------|
| Nombre | Búsqueda global | Input (en toolbar) |
| Tipos | Selección múltiple | Checkbox.Group |
| Estado | Selección múltiple | Checkbox.Group |
| Teléfono | Búsqueda por texto | Input |
| Última interacción | Selector de fecha | DatePicker |
| Próxima actividad | Fecha + Hora + Texto | DatePicker + Select + Input |

## 5. Componente UserForm (6 modos)

### 5.1 Prop `mode`

| Modo | Layout | Botones | Estado al guardar |
|------|--------|---------|:-----------------:|
| `create` | Simple (9 campos) | Cancelar, Guardar, Enlace, Avanzado → | Pendiente |
| `create-full` | Completo (23 campos) | ← Simple, Cancelar, Guardar, Enlace | Pendiente |
| `edit` | Simple + Estado (9 campos) | ← Avanzado, Cancelar, Guardar cambios | Sin cambio |
| `edit-full` | Completo (22 campos) | ← Simple, Cancelar, Guardar cambios | Sin cambio |
| `edit-pending` | Completo (22 campos) | Cancelar, Guardar, Validar | Guardar→Pendiente, Validar→Activo |
| `public` | Público (11 campos) | Completar registro | Activo |

### 5.2 Campos por modo

| Campo | create | create-full | edit | edit-full | edit-pending | public |
|-------|:-----:|:-----------:|:----:|:---------:|:------------:|:------:|
| user_name_1, user_name_2, user_lastname_1, user_lastname_2 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| user_phone_code, user_phone | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| user_email | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| user_types | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| user_status | — | auto | ✅ | ✅ | ✅ | auto |
| user_source | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| user_tags | — | ✅ | — | ✅ | ✅ | ✅ |
| user_contact_name, user_contact_lastname, user_contact_phone_code, user_contact_phone | — | ✅ | — | ✅ | ✅ | — |
| user_address, user_birth_date, user_gender, user_doc_id | — | ✅ | — | ✅ | ✅ | — |
| user_contact_pref | — | ✅ | — | ✅ | ✅ | — |
| user_assigned_to | — | ✅ | — | ✅ | ✅ | — |
| user_next_activity, user_next_activity_detail | — | ✅ | — | ✅ | ✅ | — |
| user_admin_notes, user_notes | — | ✅ | — | ✅ | ✅ | — |
| user_consent | — | — | — | — | — | ✅ |

### 5.3 Flujo de estados

```
create (simple) ──→ Pendiente ──→ click ──→ edit-pending
     │                              │               │
     ├─ Avanzado → create-full     │        [Guardar] → Pendiente
     │                              │        [Validar] → Activo
     └─ Enlace → link público      │
                                   └─ edit (activo/inactivo/archivado)
```

## 6. Componente UserDetail

### 6.1 Estructura (3 Cards + Collapse)

```
Card 1 — Header
┌─────────────────────────────────────┐
│ Avatar  Nombre                       │
│         [Cliente] [Activo]          │
│         [Eliminar] [Editar] [Volver]│
│ ───────────────────────────────     │
│ Teléfono │ Email │ Últ. contacto    │
└─────────────────────────────────────┘

Card 2 — Tabs
┌─────────────────────────────────────┐
│ [Resumen] [Agenda] [Tareas] [Finanzas] [Historial]
└─────────────────────────────────────┘

Collapse — Info no repetida
┌─────────────────────────────────────┐
│ ▼ Clasificación                     │
│   Fuente, Etiquetas                 │
│ ▼ Actividad programada              │
│   Próxima actividad, Detalle       │
│ ▼ Administración                    │
│   Responsable, Observaciones, Consentimiento
│ ▶ Contacto adicional (condicional) │
│ ▶ Metadata (colapsado default)     │
└─────────────────────────────────────┘
```

### 6.2 Secciones evitando repetición

| Sección Collapse | Campos | Visible en Card 1 |
|------------------|--------|:-----------------:|
| Clasificación | Fuente, Etiquetas | ❌ No |
| Actividad programada | Próxima actividad, Detalle | ❌ No |
| Administración | Responsable, Observaciones, Consentimiento | ❌ No |
| Contacto adicional | Nombre, Teléfono, Pref. (solo si existe) | ❌ No |
| Metadata | ID, Creado, Actualizado | ❌ No |

**No se repiten**: Teléfono, Email, Tipo, Estado, Última interacción (ya en Card 1).

## 7. Funciones Compartidas

### `utils/formatting.tsx`

| Función | Línea | Descripción | Usado en |
|---------|-------|-------------|----------|
| `formatTypeLabel()` | 3-5 | Acorta nombres de tipos | UsersPage, UsersTable, UserCard, UserDetail |
| `formatDate()` | 7-11 | ISO → dd/mm/yyyy locale es-NI | UsersTable |
| `highlight()` | 13-21 | Resalta texto coincidente | UsersTable, UserCard |

## 8. Observaciones Técnicas

### 8.1 Backend

Los endpoints están en `apps/web/functions/api/usuarios/`. Todos requieren permiso específico (`usuarios → read/create/edit`).

### 8.2 Filtrado

- **Toolbar**: client-side (3 estados separados: tipoFilter, conditionFilter, statusFilter)
- **Tabla**: client-side (column filters con matchesTableFilters)
- **Status**: back-end (showInactive/showArchived pasa como query params)

### 8.3 Modal Dual

El componente `UserForm` reemplazó los Forms inline. Un solo componente con 6 modos de visualización. Los botones y campos cambian según `mode`.

### 8.4 Enlace Público (pendiente)

El botón "Enlace" en los modales de crear está preparado para generar un link temporal `/reg/:code` para auto-registro del cliente, pero el backend y la ruta pública aún no están implementados.
