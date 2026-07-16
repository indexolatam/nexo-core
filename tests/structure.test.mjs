import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const core = process.cwd();

test("nexo-core contains required foundation directories", () => {
  for (const path of [
    "apps/api/src",
    "apps/dashboard/src",
    "packages/contracts/src",
    "database/central/migrations",
    "database/tenant/migrations",
    "database/audit/migrations",
    "tenants/demo",
    "tenants/gmoran",
  ]) {
    assert.equal(existsSync(join(core, path)), true, path);
  }
});

test("migrations define core tenant isolation tables", () => {
  const central = readFileSync(join(core, "database/central/migrations/0001_initial.sql"), "utf8");
  const tenant = readFileSync(join(core, "database/tenant/migrations/0001_initial.sql"), "utf8");
  const audit = readFileSync(join(core, "database/audit/migrations/0001_initial.sql"), "utf8");

  assert.match(central, /tenant_registry/);
  assert.match(central, /tenant_domains/);
  assert.match(tenant, /usuarios/);
  assert.match(tenant, /auth_sessions/);
  assert.match(audit, /audit_log/);
});
