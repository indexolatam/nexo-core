# Desarrollo local

## Dependencias

Las dependencias se instalan una sola vez desde `O:\INDEXO\.DEV\nexo`:

```bash
npm install
```

`node_modules` y `package-lock.json` pertenecen a la raíz global. No crear instalaciones dentro de `nexo-core`. Por compatibilidad con este volumen Windows, la raíz actúa como agregador de dependencias; las variantes no son workspaces npm enlazados mediante symlinks.

## Comandos

```bash
npm run dev:core:api
npm run dev:core:dashboard
npm run typecheck
npm run build
npm test
```

## Límite de D1 actual

La configuración productiva requiere una estrategia Cloudflare soportada para enlazar las D1 operativa y de auditoría por tenant. Un UUID en `tenant_registry` no crea un binding D1 dinámico por sí solo.

Para desarrollo deben declararse bindings explícitos y controlados para cada tenant de prueba en `apps/api/wrangler.toml`.

Los IDs actuales son placeholders intencionales. El build en modo `--dry-run` valida el bundle; no desplegar hasta crear las D1 reales y suministrar sus IDs mediante la configuración segura de Cloudflare.
