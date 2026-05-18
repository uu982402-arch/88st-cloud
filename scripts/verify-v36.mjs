#!/usr/bin/env node
/* V36/V43 pre-deploy verification. Run: npm run verify */
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


// V44 regression checks
const blogDetails = htmls.filter(f => rel(f).startsWith("blog/") && rel(f) !== "blog/index.html" && /pro-blog-page/i.test(read(f)));
for (const f of blogDetails) {
  const txt = read(f);
  if (/v36-conversion-cta|CHECK BEFORE ACTION|상담 전 필요한 항목만 먼저 확인하세요|blog-standard-cta-v16|상담 전 확인할 것|상담 전 먼저 확인할 것|v27-detail-support/i.test(txt)) fail(errors, `blog consult/support section regression ${rel(f)}`);
  if (/v36-growth-hubs|키워드별 확인 허브/i.test(txt)) fail(errors, `blog keyword hub regression ${rel(f)}`);
  if (!/v43-blog-visual-guard/i.test(txt)) fail(errors, `missing blog visual guard ${rel(f)}`);
  if (/<meta\b(?=[^>]*\bname=["']keywords["'])/i.test(txt)) fail(errors, `meta keywords should not exist ${rel(f)}`);
  const related = (txt.match(/<div\s+class=["']pro-related__grid["'][^>]*>[\s\S]*?<\/div>/i) || [""])[0];
  const linkCount = (related.match(/<a\b/gi) || []).length;
  if (related && linkCount > 4) fail(errors, `pro related over 4 links ${rel(f)}: ${linkCount}`);
}
const guaranteed = path.join(ROOT, "guaranteed/index.html");
if (fs.existsSync(guaranteed)) {
  const g = read(guaranteed);
  if (!/v41-provider-facts/.test(g)) fail(errors, "guaranteed missing provider facts");
  if (!/>바로가기<|>바로가기\s*</.test(g)) fail(errors, "guaranteed missing shortcut button text");
  if (/class=["'][^"']*moon-code|<button[^>]*data-g-copy/i.test(g)) fail(errors, "guaranteed duplicate code button regression");
  if (/접속 전 확인|빠른 체크/.test(g)) fail(errors, "guaranteed removed section regressed");
}
const consult = path.join(ROOT, "consult/index.html");
if (fs.existsSync(consult) && /가이드\s*고객센터|가이드고객센터/.test(read(consult))) fail(errors, "consult header text regression");
const toolsIndex = path.join(ROOT, "tools/index.html");
if (fs.existsSync(toolsIndex) && /조건\s*비교/.test(read(toolsIndex))) fail(errors, "tools label regression: 조건 비교");
const mainIndex = path.join(ROOT, "index.html");
if (fs.existsSync(mainIndex)) {
  const home = read(mainIndex);
  if (/moon-provider-chip[\s\S]{0,260}<small>/i.test(home)) fail(errors, "home provider chip code/domain text regression");
}
for (const f of htmls) {
  const txt = read(f);
  if (/<meta\b(?=[^>]*\bname=["']keywords["'])/i.test(txt)) fail(errors, `meta keywords exists ${rel(f)}`);
}
for (const must of ["assets/data/v43.quality.audit.json","assets/data/indexing.priority.v43.json","assets/data/asset.inventory.v43.json"]) {
  if (!fs.existsSync(path.join(ROOT, must))) fail(errors, `missing V43 quality data ${must}`);
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
