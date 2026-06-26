/**
 * create-client.js
 *
 * Crea un nuevo cliente copiando nexo-core y personalizando:
 *  - client.ts
 *  - public/
 *  - wrangler.toml
 *  - package.json name
 *
 * Uso:
 *   node scripts/create-client.js <nombre-cliente> [--config ./ruta/config.json]
 *
 * Ejemplo:
 *   node scripts/create-client.js nexo-moran --config ./clientes/moran.config.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APPS_WEB = path.join(ROOT, "apps", "web");

function copyRecursive(src, dest, exclude = []) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function generateClientTs(config, clientName) {
  const assets = config.assets || {};
  return `export const CLIENT = {
  id: "${config.id || clientName}",
  branding: {
    name: "${config.branding?.name || "Cliente"}",
    tagline: "${config.branding?.tagline || ""}",
    description: "${(config.branding?.description || "").replace(/"/g, '\\"')}",
  },
  contact: {
    city: "${config.contact?.city || "TODO_CIUDAD"}",
    whatsapp: "${config.contact?.whatsapp || "TODO_WHATSAPP"}",
    email: "${config.contact?.email || "TODO_CORREO"}",
    address: "${(config.contact?.address || "TODO_DIRECCION").replace(/"/g, '\\"')}",
    schedule: "${(config.contact?.schedule || "TODO_HORARIOS").replace(/"/g, '\\"')}",
    phoneCode: "${config.phoneCode || "TODO_CODIGO"}",
    socialLinks: {
      facebook: "${config.contact?.socialLinks?.facebook || ""}",
      instagram: "${config.contact?.socialLinks?.instagram || ""}",
      linkedin: "${config.contact?.socialLinks?.linkedin || ""}",
    },
  },
  locale: {
    currency: "${config.locale?.currency || "USD"}",
    currencySymbol: "${config.locale?.currencySymbol || "$"}",
    timezone: "${config.locale?.timezone || "America/Managua"}",
    dateLocale: "${config.locale?.dateLocale || "es-NI"}",
  },
  roles: { root: "Root", owner: "Propietario", assistant: "Asistente" },
  landing: {
    template: "${config.landing?.template || "default"}",
    sections: ${JSON.stringify(config.landing?.sections || {
      hero: true, services: true, about: true, faq: true, testimonials: false, contact: true
    }, null, 2).replace(/\n/g, "\n  ")},
  },
  dashboard: {
    modules: ${JSON.stringify(config.dashboard?.modules || {
      people: true, finance: true, agenda: true, tasks: true, blog: true, users: true, audit: true, settings: true
    }, null, 2).replace(/\n/g, "\n    ")},
    labels: {
      people: "Personas", finance: "Finanzas", agenda: "Agenda",
      tasks: "Tareas", blog: "Blog", users: "Usuarios",
      audit: "Auditoría", settings: "Configuración",
    },
  },
  theme: {
    palette: ${JSON.stringify(config.theme?.palette || {
      light: { accent: "#2D4D42", bgPrimary: "#FAF8F6", bgSecondary: "#F0EDEA", textPrimary: "#1A1A1A", textSecondary: "#5A5A5A", border: "#E0DDDA" },
      dark: { accent: "#8FA596", bgPrimary: "#121B18", bgSecondary: "#1E2B26", textPrimary: "#EEE8E5", textSecondary: "#C6D0CB", border: "#3D4C47" },
    }, null, 2).replace(/\n/g, "\n    ")},
    fonts: { title: "${config.theme?.fonts?.title || "Inter"}", body: "${config.theme?.fonts?.body || "Inter"}" },
  },
  assets: {
    headerLogo: "${assets.headerLogo || "/img/logo.png"}",
    footerLogo: "${assets.footerLogo || "/img/logo.png"}",
    heroPhoto: "${assets.heroPhoto || "/img/hero.jpg"}",
    favicon: "${assets.favicon || "/favicon.svg"}",
  },
  services: ${JSON.stringify(config.services || [], null, 2).replace(/\n/g, "\n  ")},
  faq: ${JSON.stringify(config.faq || [], null, 2).replace(/\n/g, "\n  ")},
};\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const clientName = args[0];
  const configIndex = args.indexOf("--config");
  const configPath = configIndex !== -1 ? args[configIndex + 1] : null;

  if (!clientName) {
    console.error("Uso: node scripts/create-client.js <nombre-cliente> [--config ./ruta/config.json]");
    process.exit(1);
  }

  const clientDir = path.resolve(ROOT, "..", clientName);

  if (fs.existsSync(clientDir)) {
    console.error(`El directorio ${clientDir} ya existe. Elimínalo primero o usa otro nombre.`);
    process.exit(1);
  }

  console.log(`\nCreando cliente: ${clientName}`);
  console.log(`Origen: ${ROOT}`);
  console.log(`Destino: ${clientDir}\n`);

  // 1. Copiar nexo-core (excluyendo scripts, template, node_modules)
  console.log("Copiando estructura base desde nexo-core...");
  copyRecursive(ROOT, clientDir, ["node_modules", "dist", ".wrangler", "scripts", "template"]);

  // 2. Cargar configuración si existe
  let config = {};
  if (configPath && fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    console.log(`Configuración cargada desde ${configPath}`);
  } else {
    console.log("Sin archivo de configuración. Se usará plantilla genérica.");
  }

  // 3. Generar client.ts
  const clientTsPath = path.join(clientDir, "apps", "web", "src", "config", "client.ts");
  const clientTsContent = generateClientTs(config, clientName);
  fs.writeFileSync(clientTsPath, clientTsContent, "utf-8");
  console.log("✓ client.ts generado");

  // 4. Actualizar package.json name
  const pkgPath = path.join(clientDir, "apps", "web", "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.name = clientName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
    console.log("✓ package.json actualizado");
  }

  // 5. Actualizar wrangler.toml
  const wranglerPath = path.join(clientDir, "apps", "web", "wrangler.toml");
  if (fs.existsSync(wranglerPath)) {
    let wrangler = fs.readFileSync(wranglerPath, "utf-8");
    wrangler = wrangler.replace(/^name\s*=\s*".*"/m, `name = "${clientName}"`);
    wrangler = wrangler.replace(/database_name\s*=\s*"REPLACE_CLIENT_DB"/, `database_name = "${clientName}_db"`);
    wrangler = wrangler.replace(/database_name\s*=\s*"REPLACE_CLIENT_AUDIT_DB"/, `database_name = "${clientName}_audit_db"`);
    wrangler = wrangler.replace(/database_name\s*=\s*"nexo_local"/, `database_name = "${clientName}_db"`);
    wrangler = wrangler.replace(/database_name\s*=\s*"nexo_audit_local"/, `database_name = "${clientName}_audit_db"`);
    fs.writeFileSync(wranglerPath, wrangler, "utf-8");
    console.log("✓ wrangler.toml actualizado");
  }

  // 6. Actualizar título en index.html
  const indexHtmlPath = path.join(clientDir, "apps", "web", "index.html");
  if (fs.existsSync(indexHtmlPath)) {
    const brandName = config.branding?.name || clientName;
    const html = fs.readFileSync(indexHtmlPath, "utf-8")
      .replace(/<title>.*<\/title>/, `<title>${brandName}</title>`);
    fs.writeFileSync(indexHtmlPath, html, "utf-8");
    console.log("✓ index.html actualizado");
  }

  // 7. Copiar public/ del cliente si existe
  const clientPublic = configPath ? path.join(path.dirname(configPath), "public") : null;
  if (clientPublic && fs.existsSync(clientPublic)) {
    const destPublic = path.join(clientDir, "apps", "web", "public");
    copyRecursive(clientPublic, destPublic);
    console.log("✓ assets del cliente copiados");
  }

  // 8. Generar script delegado dev.ps1 (apunta a nexo-core)
  const scriptsDir = path.join(clientDir, "apps", "web", "scripts");
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }
  const delegator = `param([switch]\$SkipBuild, [switch]\$SkipMigrations)
\$core = Join-Path \$PSScriptRoot "../../../../nexo-core/apps/web/scripts/dev.ps1"
\$projectDir = Split-Path -Parent \$PSScriptRoot
& \$core -ProjectDir \$projectDir -SkipBuild:\$SkipBuild -SkipMigrations:\$SkipMigrations
`;
  fs.writeFileSync(path.join(scriptsDir, "dev.ps1"), delegator, "utf-8");
  console.log("✓ dev.ps1 delegado generado");

  // 9. Generar package.json en la raíz del cliente
  const rootPkg = {
    name: clientName,
    private: true,
    scripts: {
      "dev:api": "cd apps/web && npm run dev:api",
      dev: "cd apps/web && npx vite",
      build: "cd apps/web && npm run build",
    },
  };
  fs.writeFileSync(path.join(clientDir, "package.json"), JSON.stringify(rootPkg, null, 2), "utf-8");
  console.log("✓ package.json raíz generado");

  // 10. Git init
  try {
    execSync("git init", { cwd: clientDir, stdio: "ignore" });
    console.log("✓ git init");
  } catch {
    console.log("⚠ git init falló (git no instalado?)");
  }

  console.log(`\n✅ Cliente ${clientName} creado en ${clientDir}`);
  console.log("\nPróximos pasos:");
  console.log(`  cd ${clientDir}`);
  console.log(`  npm run dev              # (frontend vite)`);
  console.log(`  npm run dev:api          # (build + D1 local + API + Vite)`);
  console.log("  # Configurar wrangler.toml con database_id real");
  console.log("  # Conectar a Cloudflare Pages");
  console.log("  # git add . && git commit -m \"init\" && git push");
}

main().catch(console.error);
