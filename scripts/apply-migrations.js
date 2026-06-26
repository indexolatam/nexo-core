/**
 * apply-migrations.js
 *
 * Aplica los archivos SQL consolidados a D1.
 * Por defecto aplica client.sql al binding DB.
 * Con --audit aplica audit.sql al binding DB_AUDIT.
 * Con --all aplica ambos.
 *
 * Uso:
 *   node scripts/apply-migrations.js <database-name> [--remote] [--audit|--all]
 *
 * Ejemplo:
 *   node scripts/apply-migrations.js cliente_db --remote --all
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.resolve(__dirname, "..", "apps", "web", "db");

async function main() {
  const args = process.argv.slice(2);
  const dbName = args[0];
  const isRemote = args.includes("--remote");
  const applyAudit = args.includes("--audit");
  const applyAll = args.includes("--all");

  if (!dbName) {
    console.error("Uso: node scripts/apply-migrations.js <database-name> [--remote] [--audit|--all]");
    process.exit(1);
  }

  const mode = isRemote ? "--remote" : "--local";

  const files = [];
  if (applyAll || (!applyAudit)) files.push("client.sql");
  if (applyAll || applyAudit) files.push("audit.sql");

  console.log(`\nAplicando ${files.length} archivo(s) a "${dbName}" (${isRemote ? "remoto" : "local"})...\n`);

  for (const file of files) {
    const filePath = path.join(DB_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`  ✗ No encontrado: ${file}`);
      process.exit(1);
    }
    console.log(`  ▶ ${file}...`);
    try {
      execSync(
        `npx wrangler d1 execute ${dbName} ${mode} --file="${filePath}"`,
        { stdio: "inherit", cwd: path.resolve(__dirname, "..", "apps", "web") }
      );
      console.log(`  ✓ ${file}`);
    } catch (err) {
      console.error(`  ✗ Error en ${file}:`, err.message);
      process.exit(1);
    }
  }

  console.log(`\n✅ Migraciones aplicadas correctamente.`);
}

main().catch(console.error);