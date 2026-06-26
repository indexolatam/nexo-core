# Documentación del Proyecto nexo-core

Índice de navegación para agentes de IA y desarrolladores.

## Documentos Disponibles

| Documento | Contenido | Tamaño aprox. |
|-----------|-----------|---------------|
| [general.md](./general.md) | Arquitectura, stack, estructura, patrones, convenciones | ~200 líneas |
| [modules/people.md](./modules/people.md) | Módulo Personas: DB, API, componentes, flujos | ~350 líneas |

## Cómo Usar Esta Documentación

### Para agentes de IA
- Buscar por encabezados `##` con grep
- Rutas de archivos siempre en formato `apps/web/src/...`
- Líneas de referencia: `PeoplePage.tsx:69-90`

### Para desarrolladores
- Leer `general.md` primero para entender la arquitectura
- Luego leer el documento del módulo específico a trabajar
- Cada módulo documenta: archivos, tipos, endpoints, componentes, flujos

## Módulos Documentados

- [x] People (Personas)
- [ ] Agenda
- [ ] Finance (Finanzas)
- [ ] Tasks (Tareas)
- [ ] Dashboard
- [ ] Auth (Autenticación)
- [x] Settings (Configuración) — documentado en general.md (sección 10: Permisos)
- [ ] Blog
- [ ] AuditLogs (Bitácora)

## Convenciones de Nomenclatura

- Archivos de componentes: `PascalCase.tsx` (ej: `PeoplePage.tsx`)
- Archivos de servicios: `camelCase.ts` (ej: `peopleService.ts`)
- Archivos de tipos: `camelCase.ts` (ej: `adminPeople.ts`)
- Migraciones: `0001_descripcion.sql`
