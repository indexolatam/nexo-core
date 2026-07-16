# nexo-core

Core del sistema NEXO — monorepo multi-tenant.

## Estructura

```text
apps/api/           Worker central (Cloudflare Workers)
apps/dashboard/     Panel admin (React + Vite + Antd + Tailwind)
packages/contracts/ Tipos y validaciones Zod
database/           Migraciones SQL forward-only
tenants/            Config por tenant
docs/               Documentación inmutable (NO modificar)
```

## Desarrollo

```bash
# Desde la raíz del workspace global (O:\INDEXO\.DEV\nexo)
npm install

# API
npm run dev:core:api

# Dashboard
npm run dev:core:dashboard
```

## Docs

La carpeta `docs/` y `docs/legacy/` son **inmutables**. No modificar ningún archivo dentro de ellas.
