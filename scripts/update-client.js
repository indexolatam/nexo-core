/**
 * update-client.js
 *
 * Propaga cambios desde nexo-core a un cliente existente.
 * Respeta: client.ts, public/, wrangler.toml
 *
 * Uso:
 *   node scripts/update-client.js ../cliente-moran
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PROTECTED_PATHS = [
  "apps/web/src/config/client.ts",
  "apps/web/src/index.css",
  "apps/web/index.html",
  "apps/web/package.json",
  "apps/web/scripts/dev.ps1",
  "apps/web/public/img",
  "apps/web/public/fonts",
  "apps/web/public/favicon.svg",
  "apps/web/wrangler.toml",
  "README.md",
  ".gitignore",
];

function copyRecursive(src, dest, protectedPaths = []) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".wrangler") continue;
    if (entry.name.startsWith(".")) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (protectedPaths.some(p => destPath.endsWith(p))) {
      console.log(`  ↻ Protegido: ${entry.name}`);
      continue;
    }
    if (entry.isDirectory()) {
      if (fs.existsSync(destPath)) {
        copyRecursive(srcPath, destPath, protectedPaths);
      } else {
        fs.cpSync(srcPath, destPath, { recursive: true });
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  const clientDir = process.argv[2];
  if (!clientDir) {
    console.error("Uso: node scripts/update-client.js <ruta-cliente>");
    process.exit(1);
  }

  const clientPath = path.resolve(clientDir);
  if (!fs.existsSync(clientPath)) {
    console.error(`El directorio ${clientPath} no existe.`);
    process.exit(1);
  }

  console.log(`\nActualizando cliente desde nexo-core...`);
  console.log(`Origen: ${ROOT}`);
  console.log(`Destino: ${clientPath}\n`);

  copyRecursive(ROOT, clientPath, PROTECTED_PATHS);

  console.log(`\n✅ Cliente actualizado.`);
  console.log("Los siguientes archivos no fueron modificados:");
  PROTECTED_PATHS.forEach(p => console.log(`  - ${p}`));
}

main().catch(console.error);
