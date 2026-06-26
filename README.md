# NEXO Core

Repositorio maestro del sistema NEXO. Todo cambio de lógica, backend, módulos y estructura se hace aquí primero.

## Regla principal

Nunca desarrollar lógica directamente en clientes.

Flujo obligatorio:

1. Cambiar en `nexo-core`
2. Propagar con `scripts/update-client.js`
3. Mantener en clientes solo personalización de marca/configuración

## Arquitectura

```
nexo-core       -> fuente maestra (este repo)
cliente-0       -> demo funcional
cliente-X       -> cliente real
```

## Qué puede cambiar por cliente

| Archivo | Uso |
|---------|-----|
| `apps/web/src/config/client.ts` | identidad, textos, módulos visibles |
| `apps/web/public/` | logos, imágenes, fuentes |
| `apps/web/wrangler.toml` | DB por cliente y bindings |
| `apps/web/index.html` | título |
| dominio / variables cloudflare | despliegue |

## Qué no debe cambiar en clientes

`apps/web/src/modules/`, `apps/web/src/services/`, `apps/web/src/context/`, `apps/web/functions/`, `apps/web/db/` (estructura), `apps/web/scripts/dev.ps1` (delegado), lógica de negocio.

## Base de datos en core

Se usa esquema consolidado:

- `apps/web/db/client.sql` (DB operativa)
- `apps/web/db/audit.sql` (DB auditoría)

## Desarrollo local

Dependencias se instalan en la raíz de NEXO una sola vez.

```bash
cd O:\INDEXO\.DEV\.nexo
npm install
```

Luego, por cliente:

```bash
cd <cliente>/apps/web
npm run dev
npm run dev:api
```

`dev:api` del cliente usa un delegado que llama al script central en `nexo-core/apps/web/scripts/dev.ps1`.

## Scripts de core

| Script | Propósito |
|--------|-----------|
| `scripts/create-client.js` | crear nuevo cliente desde template core |
| `scripts/update-client.js` | propagar cambios del core preservando personalización |
| `scripts/apply-migrations.js` | aplicar `client.sql` y/o `audit.sql` en D1 |

---

Desarrollado por INDEXO.
