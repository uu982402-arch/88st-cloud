#!/usr/bin/env node
/* V36 pre-deploy verification. Run: npm run verify */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const ROOT = process.cwd();
const RISK = [/PRAGMA\s+foreign_keys/i, /CREATE\s+TABLE/i, /CREATE\s+INDEX/i, /schemaSQL/i, /foreign_keys/i];
const FORBIDDEN_CONTACT = [
  "seo" + "a69",
  "odds" + "88st",
  "@" + "odds" + "88st_bot",
  "t\\.me/" + "odds" + "88st",
  "\\uBD84\\uC11D\\uBD07",
  "\\uC2A4\\uD3EC\\uCE20\\s*\\uBC30\\uB2F9\\uBD84\\uC11D",
  "\\uCF54\\uC778\\s*\\uD604\\uBB3C"
].map(x => new RegExp(x, "i"));
const ASSET_EXT = /\.(css|js|png|jpe?g|webp|svg|ico|json|txt|xml|webmanifest|pdf|map)$/i;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (["node_modules",".git","__MACOSX"].includes(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
function rel(p){ return path.relative(ROOT,p).replaceAll(path.sep,"/"); }
function fail(errors, msg){ errors.push(msg); }
function read(p){ return fs.readFileSync(p,"utf8"); }

const errors = [];
const warnings = [];
const files = walk(ROOT);
const htmls = files.filter(f => f.endsWith(".html"));
const jsons = files.filter(f => f.endsWith(".json") || path.basename(f) === "site.webmanifest");
const scripts = files.filter(f => (f.endsWith(".js") || f.endsWith(".mjs")) && !rel(f).startsWith("node_modules/"));

const worker = path.join(ROOT, "_worker.js");
if (!fs.existsSync(worker)) fail(errors, "_worker.js missing");
else {
  const txt = read(worker);
  for (const r of RISK) if (r.test(txt)) fail(errors, `_worker.js risk token: ${r}`);
  const check = spawnSync(process.execPath, ["--check", worker], { encoding:"utf8" });
  if (check.status !== 0) fail(errors, `_worker.js syntax failed: ${check.stderr || check.stdout}`);
}

for (const f of scripts) {
  const result = spawnSync(process.execPath, ["--check", f], { encoding:"utf8" });
  if (result.status !== 0) fail(errors, `JS syntax failed ${rel(f)}: ${result.stderr || result.stdout}`);
}

for (const f of jsons) {
  try { JSON.parse(read(f)); } catch(e) { fail(errors, `JSON parse failed ${rel(f)}: ${e.message}`); }
}

for (const f of files) {
  let txt = "";
  try { txt = read(f); } catch { continue; }
  for (const r of FORBIDDEN_CONTACT) if (r.test(txt)) fail(errors, `forbidden contact/bot term ${r} in ${rel(f)}`);
}

const existing = new Set(["/"]);
for (const f of htmls) {
  const r = "/" + rel(f);
  existing.add(r);
  if (r.endsWith("/index.html")) { existing.add(r.slice(0,-10)); existing.add(r.slice(0,-11)); }
}
for (const f of htmls) {
  const txt = read(f);
  if (!/<title[\s>]/i.test(txt)) fail(errors, `missing title ${rel(f)}`);
  if (!/<meta\b(?=[^>]*\bname=["']description["'])/i.test(txt)) fail(errors, `missing description ${rel(f)}`);
  if (!/<link\b(?=[^>]*\brel=["']canonical["'])/i.test(txt)) fail(errors, `missing canonical ${rel(f)}`);
  if (!/data-v36-schema="primary"|data-v31-schema="primary"/i.test(txt)) fail(errors, `missing schema ${rel(f)}`);
  for (const m of txt.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
    const href = m[1].split("#")[0].split("?")[0];
    if (!href.startsWith("/") || href.startsWith("//") || !href) continue;
    if (ASSET_EXT.test(href)) {
      if (!fs.existsSync(path.join(ROOT, href.replace(/^\//,"")))) fail(errors, `missing asset ${rel(f)} -> ${href}`);
      continue;
    }
    if (!existing.has(href) && !existing.has(href.replace(/\/$/,"")) && !existing.has(href + "/") && !existing.has(href.replace(/\/$/,"") + "/index.html")) {
      fail(errors, `dead internal link ${rel(f)} -> ${href}`);
    }
  }
}

const sitemap = path.join(ROOT, "sitemap.xml");
const robots = path.join(ROOT, "robots.txt");
if (!fs.existsSync(sitemap)) fail(errors, "sitemap.xml missing");
else {
  const txt = read(sitemap);
  const locs = (txt.match(/<loc>/g) || []).length;
  if (locs < 10) fail(errors, `sitemap too small: ${locs}`);
  for (const r of FORBIDDEN_CONTACT) if (r.test(txt)) fail(errors, `forbidden sitemap term ${r}`);
}
if (!fs.existsSync(robots)) fail(errors, "robots.txt missing");
else {
  const txt = read(robots);
  for (const x of ["Disallow: /admin/","Disallow: /ops/","Disallow: /api/","Sitemap: https://88st.cloud/sitemap.xml"]) {
    if (!txt.includes(x)) fail(errors, `robots missing ${x}`);
  }
}

const wranglerWanted = process.env.RUN_WRANGLER_VERIFY === "1";
if (wranglerWanted) {
  const wr = spawnSync("npx", ["wrangler@3.101.0", "pages", "functions", "build", "--outfile", ".v36-worker-check.js"], { cwd: ROOT, encoding:"utf8", shell: process.platform === "win32" });
  if (wr.status !== 0) fail(errors, `wrangler pages functions build failed:\n${wr.stderr || wr.stdout}`);
} else {
  warnings.push("wrangler verification skipped; set RUN_WRANGLER_VERIFY=1 to run Cloudflare Pages Functions build locally.");
}

const result = {
  ok: errors.length === 0,
  html: htmls.length,
  json: jsons.length,
  scripts: scripts.length,
  errors,
  warnings,
  checkedAt: new Date().toISOString()
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
