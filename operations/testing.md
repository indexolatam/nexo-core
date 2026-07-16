# Verificación de base

Antes de hacer un commit de trabajo en Core ejecutar desde la raíz global:

```bash
npm run typecheck
npm run build
npm test
```

Las pruebas de aislamiento multi-tenant se agregan cuando existan bindings D1 locales explícitos para `demo` y `gmoran`.
