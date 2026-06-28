# Servicios - Pendientes y Backlog

Estado de bugs, mejoras pendientes y backlog del módulo Servicios.

## 1. Estado de Bugs

### 1.1 Bugs Corregidos

| # | Bug | Archivo | Estado |
|---|-----|---------|--------|
| 1 | Schema desincronizado entre client.sql, migrations y db.js | `db/client.sql`, `db.js` | CORREGIDO — unificado con prefijo `services_` |
| 2 | Missing FKs no actualizadas tras renombrar `id` → `services_id` | `finance_movements`, `agenda_events`, `tasks` | CORREGIDO — migration 0019 renombra `service_id` → `services_id` en las 3 tablas |
| 3 | PATCH sin whitelist (inyección SQL potencial) | `functions/api/services/[id].js` | CORREGIDO — whitelist de 17 columnas permitidas |
| 4 | POST no inserta todos los campos del nuevo schema | `functions/api/services/index.js` | CORREGIDO — INSERT con todos los campos `services_*` |
| 5 | GET query usa nombres de columna antiguos | `functions/api/services/index.js` | CORREGIDO — usa `services_*` |
| 6 | Landing usa config estática en vez de DB | `src/landing/components/ServicesPreview.tsx` | CORREGIDO — ahora fetch desde `/api/services` |
| 7 | Seed files con IDs viejos (`consulta-individual`, `terapia-familiar`) | 3 seed files | CORREGIDO — actualizados a `svc-001`, `svc-002`, etc. |
| 8 | `CLIENT.services` obsoleto y referencia rota en ContactSection | `src/config/client.ts` | CORREGIDO — eliminado, ContactSection usa lista estática inline |

### 1.2 Bugs Pendientes

| # | Bug | Prioridad | Archivo | Notas |
|---|-----|-----------|---------|-------|
| P1 | Sin indicador de carga en Settings al listar servicios | Baja | `SettingsPage.tsx` | Los servicios se cargan en useEffect pero no hay estado `loading` ni skeleton |
| P2 | Modal de crear servicio sin validación de campos duplicados | Baja | `SettingsPage.tsx` | Podrían crearse dos servicios con el mismo nombre sin advertencia |
| P3 | `services_participants` no se parsea en respuesta API | Media | `functions/api/services/index.js` | Se guarda como TEXT pero se devuelve como string, no como array JSON parseado |

## 2. Backlog de Mejoras

### 2.1 Prioridad Alta

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| A1 | Ampliar modal de crear servicio | Agregar campos: categoría, duración_unit, moneda, participantes, descripción, landing fields | `SettingsPage.tsx` |
| A2 | Editar servicio | Modal/panel para editar campos existentes (no solo toggle active) | `SettingsPage.tsx` + endpoint |
| A3 | Landing dinámico con iconos | Renderizar iconos Ant Design desde `services_landing_icon` | `ServicesPreview.tsx` |
| A4 | Ordenar servicios en landing | Respetar `services_landing_order` en el orden de renderizado | `ServicesPreview.tsx` |
| A5 | Delete desde UI | Agregar botón de eliminar con confirmación (soft delete) | `SettingsPage.tsx` |

### 2.2 Prioridad Media

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| M1 | ContactSection dinámico | Cargar servicios desde API en vez de lista estática | `ContactSection.tsx` |
| M2 | Imagen de landing | Renderizar `services_landing_image` en la card del servicio | `ServicesPreview.tsx` |
| M3 | Filtro por categoría en admin | Poder filtrar servicios por categoría en Settings | `SettingsPage.tsx` |
| M4 | Duplicar servicio | Botón para duplicar un servicio existente | `SettingsPage.tsx` + endpoint |
| M5 | Precargar datos para ContactSection | Usar `services_name` de la API como opciones del dropdown | `ContactSection.tsx` |

### 2.3 Prioridad Baja

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| L1 | Exportar servicios a CSV | Botón para exportar listado de servicios | `SettingsPage.tsx` |
| L2 | Historial de cambios de servicio | Versiones/auditoría de cambios en servicios | Nuevo endpoint |
| L3 | Vista previa de landing | Preview de cómo se ve el servicio en la landing desde admin | `SettingsPage.tsx` |

### 2.4 Futuro

| # | Mejora | Descripción | Archivos |
|---|--------|-------------|----------|
| F1 | Precios por participante dinámicos | UI para gestionar el JSON `services_participants` con inputs dedicados | `SettingsPage.tsx` |
| F2 | Imágenes de servicio | Upload de imágenes para `services_landing_image` | Nuevo endpoint + `SettingsPage.tsx` |
| F3 | Multi-moneda | Conversión automática entre USD/NIO | Backend |
| F4 | Servicios por sucursal | Asignar servicios a diferentes ubicaciones/sucursales | Schema + Frontend |

## 3. Ideas / Brainstorm

| # | Idea | Categoría | Notas |
|---|------|-----------|-------|
| I1 | Paquetes de servicios | Producto | Agrupar servicios en paquetes con descuento |
| I2 | Disponibilidad por servicio | Agenda | Configurar horarios disponibles por servicio |
| I3 | Precios por duración | Pricing | Precio variable según duración seleccionada |
| I4 | Cupones/descuentos | Marketing | Códigos de descuento aplicables a servicios |
| I5 | Notificaciones de precio | Automatización | Alertar cuando un servicio cambie de precio |
| I6 | Comparador de servicios | UX | Vista comparativa de servicios lado a lado |
| I7 | Reviews/valoraciones | Social | Permitir a clientes valorar servicios |
| I8 | Wishlist de servicios | UX | Clientes pueden guardar servicios favoritos |
| I9 | SEO por servicio | Marketing | Meta tags individuales por servicio en landing |

## 4. Referencia Rápida

### Archivos clave del módulo

```
apps/web/src/modules/settings/
├── SettingsPage.tsx              # Componente principal (275 líneas)
└── components/
    └── ConfigListItem.tsx        # Item genérico configurable

apps/web/src/landing/components/
├── ServicesPreview.tsx           # Landing pública (60 líneas)
└── ContactSection.tsx            # Formulario de contacto (77 líneas)

apps/web/src/services/servicesService.ts    # Servicio REST (22 líneas)
apps/web/src/types/adminSettings.ts         # Tipo ServiceConfig (54 líneas)
apps/web/src/types/d1.ts                    # Tipo D1Service (líneas 63-82)

apps/web/functions/api/services/
├── index.js                      # GET list + POST create (44 líneas)
└── [id].js                       # PATCH whitelist + DELETE (39 líneas)

apps/web/functions/_core/db.js    # Schema services + seed (líneas 26-31, 145-146)
```

### Endpoints

| Método | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/services` | Público (landing) / Admin (config) |
| POST | `/api/services` | Admin |
| PATCH | `/api/services/:id` | Admin (whitelist) |
| DELETE | `/api/services/:id` | Admin |

### Schema de la tabla `services`

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| services_id | TEXT PK | — | ID único (svc-{timestamp}) |
| services_name | TEXT | — | Nombre del servicio |
| services_category | TEXT | 'General' | Categoría |
| services_duration | INTEGER | 60 | Duración numérica |
| services_duration_unit | TEXT | 'minutes' | Unidad de duración |
| services_price | REAL | 0 | Precio base |
| services_currency | TEXT | 'USD' | Moneda |
| services_participants | TEXT | JSON | Opciones de participantes |
| services_description | TEXT | NULL | Descripción interna |
| services_landing_visible | INTEGER | 0 | Visible en landing |
| services_landing_title | TEXT | NULL | Título landing |
| services_landing_paragraph | TEXT | NULL | Párrafo landing |
| services_landing_image | TEXT | NULL | URL imagen landing |
| services_landing_icon | TEXT | NULL | Icono Ant Design |
| services_landing_order | INTEGER | 0 | Orden en landing |
| services_landing_cta | TEXT | 'Consultar' | Texto botón CTA |
| services_active | INTEGER | 1 | Activo/Inactivo |
| services_created_at | TEXT | CURRENT_TIMESTAMP | Creación |
| services_updated_at | TEXT | NULL | Última actualización |
| services_deleted_at | TEXT | NULL | Soft delete |
| services_created_by | TEXT | NULL | Creado por |
| services_updated_by | TEXT | NULL | Actualizado por |

### Última revisión

- **Fecha**: 2026-06-27
- **Bugs corregidos**: 8
- **Bugs pendientes**: 3 (1 media, 2 baja)
- **Mejoras pendientes**: 13 (5 alta, 5 media, 3 baja)
- **Ideas backlog**: 9
