#!/usr/bin/env node
/* V36/V46 pre-deploy verification. Run: npm run verify */
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


// V45 blog/detail regression checks
const blogHtmls = htmls.filter(f => rel(f).startsWith("blog/") && rel(f) !== "blog/index.html" && !rel(f).startsWith("blog/page/"));
for (const f of blogHtmls) {
  const txt = read(f);
  if (/v36-conversion-cta|CHECK BEFORE ACTION|상담 전 필요한 항목|blog-standard-cta-v16|상담 전 확인할 것|상담 전 먼저 확인할 것|v27-detail-support/i.test(txt)) fail(errors, `blog consult/support section regression ${rel(f)}`);
  if (/v36-growth-hubs|키워드별 확인 허브/i.test(txt)) fail(errors, `blog keyword hub regression ${rel(f)}`);
  if (/https:\/\/t\.me|@TRS999|TRS999_bot|텔레그램|카톡|상담\s*전/i.test(txt)) fail(errors, `blog messenger/contact regression ${rel(f)}`);
  if (/<meta\b(?=[^>]*\bname=["']keywords["'])/i.test(txt)) fail(errors, `meta keywords should not exist ${rel(f)}`);
}
const blogDetails = blogHtmls.filter(f => /<body[^>]*class=["'][^"']*pro-blog-page/i.test(read(f)));
for (const f of blogDetails) {
  const txt = read(f);
  if (!/v47-expert-page/i.test(txt)) fail(errors, `missing blog visual guard ${rel(f)}`);
  if (/<section\b(?=[^>]*class=["'][^"']*v36-related-links)/i.test(txt)) fail(errors, `blog automated related block regression ${rel(f)}`);
  const m = txt.match(/<article\b(?=[^>]*class=["'][^"']*pro-article__body)[^>]*>([\s\S]*?)<\/article>/i);
  if (!m) fail(errors, `missing expert article body ${rel(f)}`);
  else {
    const bodyText = m[1].replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
    if (bodyText.length < 3000) fail(errors, `blog expert body under 3000 chars ${rel(f)}: ${bodyText.length}`);
  }
}
const v47BlogDetails = blogHtmls.filter(f => /<body[^>]*class=["'][^"']*v47-expert-page/i.test(read(f)));
if (v47BlogDetails.length < 300) fail(errors, `V47 minimum blog inventory failed: ${v47BlogDetails.length}`);
for (const f of v47BlogDetails) {
  const txt = read(f);
  const m = txt.match(/<article\b(?=[^>]*class=["'][^"']*v47-article-body)[^>]*>([\s\S]*?)<\/article>/i);
  if (!m) fail(errors, `missing V47 article body ${rel(f)}`);
  else {
    const plain = m[1].replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    if (plain.length < 3000) fail(errors, `V47 body under 3000 chars ${rel(f)}: ${plain.length}`);
  }
}
const guaranteed = path.join(ROOT, "guaranteed/index.html");
if (fs.existsSync(guaranteed)) {
  const g = read(guaranteed);
  if (!/premium-card/.test(g) || !/code-badge/.test(g)) fail(errors, "guaranteed missing premium card code facts");
  if (!/>바로가기<|>바로가기\s*</.test(g)) fail(errors, "guaranteed missing shortcut button text");
  if (/class=["'][^"']*moon-code|<button[^>]*data-g-copy/i.test(g)) fail(errors, "guaranteed duplicate code button regression");
  const codeRows = (g.match(/class=["'][^"']*code-badge/gi) || []).length;
  if (codeRows !== 5) fail(errors, `guaranteed code badge count regression: ${codeRows}`);
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
for (const must of ["assets/data/v43.quality.audit.json","assets/data/indexing.priority.v43.json","assets/data/asset.inventory.v43.json","assets/data/v45.content.upgrade.json","assets/data/v47.comprehensive.upgrade.json","assets/data/indexing.priority.v47.json"]) {
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


// V48 visual stability checks
{
  const titleMap = new Map();
  for (const f of htmls) {
    const txt = read(f);
    if (/href=["']#["']|href=["']javascript:void\(0\)["']/i.test(txt)) fail(errors, 'empty/javascript href regression ' + rel(f));
    const title = (txt.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.trim();
    if (title) titleMap.set(title, [...(titleMap.get(title)||[]), rel(f)]);
    if (rel(f).startsWith('blog/') && !rel(f).startsWith('blog/page/') && rel(f) !== 'blog/index.html') {
      if (/상담\s*전|CHECK BEFORE ACTION|키워드별 확인 허브|이 글에서 확인할 항목|전문가형\s*판독\s*체크포인트|https:\/\/t\.me|@TRS999|TRS999_bot|텔레그램|카톡/i.test(txt)) fail(errors, 'V48 banned blog term regression ' + rel(f));
      if (/style=["'][^"']*background\s*:\s*(#fff|white)|style=["'][^"']*background-color\s*:\s*(#fff|white)/i.test(txt)) fail(errors, 'V48 inline white background in blog ' + rel(f));
      if (/v47-expert-page/.test(txt) && !/v48-expert-page/.test(txt)) fail(errors, 'missing V48 blog page guard ' + rel(f));
    }
  }
  const duplicateTitles = [...titleMap.entries()].filter(([_, arr]) => arr.length > 1 && !/보존 페이지/.test(_));
  if (duplicateTitles.length) fail(errors, 'duplicate title groups: ' + duplicateTitles.slice(0,3).map(([t,a])=>t+':'+a.join(',')).join(' | '));
  const sitemapFile = path.join(ROOT, 'sitemap.xml');
  if (fs.existsSync(sitemapFile)) {
    const sm = read(sitemapFile);
    for (const m of sm.matchAll(/<loc>https:\/\/88st\.cloud([^<]+)<\/loc>/g)) {
      const route = m[1];
      const target = route === '/' ? path.join(ROOT,'index.html') : route.endsWith('/') ? path.join(ROOT, route.slice(1), 'index.html') : path.join(ROOT, route.slice(1));
      if (!fs.existsSync(target)) fail(errors, 'sitemap missing file ' + route);
      else if (/noindex/i.test(read(target))) fail(errors, 'sitemap includes noindex ' + route);
    }
  }
  const guaranteedFile = path.join(ROOT, 'guaranteed/index.html');
  if (fs.existsSync(guaranteedFile)) {
    const g = read(guaranteedFile);
    if ((g.match(/v48-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V48 guaranteed card count failed');
    if ((g.match(/data-v47-copy-code=/g)||[]).length !== 5) fail(errors, 'V48 guaranteed code count failed');
    if (!/v48-vendor-hero/.test(g)) fail(errors, 'V48 guaranteed image-first layout missing');
  }
}

// V49 guaranteed vendor landing checks
{
  const vendorRoutes = ['queenbee','sk-holdings','anybet','udt','ddangkong'];
  const guaranteedIndex = path.join(ROOT, 'guaranteed/index.html');
  if (!fs.existsSync(guaranteedIndex)) fail(errors, 'V49 guaranteed index missing');
  else {
    const g = read(guaranteedIndex);
    if ((g.match(/v49-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V49 guaranteed card count failed');
    if ((g.match(/data-v49-detail-click=/g)||[]).length !== 5) fail(errors, 'V49 detail button count failed');
    if ((g.match(/data-v49-domain-click=/g)||[]).length < 5) fail(errors, 'V49 domain click tracking missing');
    if (!/상세보기/.test(g)) fail(errors, 'V49 detail button text missing');
    if (new RegExp("SEO"+"A69|seo"+"a69", "i").test(g)) fail(errors, 'V49 forbidden legacy contact regression in guaranteed index');
  }
  for (const slug of vendorRoutes) {
    const fp = path.join(ROOT, 'guaranteed', slug, 'index.html');
    if (!fs.existsSync(fp)) fail(errors, `V49 vendor landing missing: ${slug}`);
    else {
      const txt = read(fp);
      if (!/<meta\b(?=[^>]*\bname=["']description["'])/i.test(txt)) fail(errors, `V49 vendor missing description: ${slug}`);
      if (!/<link\b(?=[^>]*\brel=["']canonical["'])/i.test(txt)) fail(errors, `V49 vendor missing canonical: ${slug}`);
      if (!/v49-vendor-landing/.test(txt)) fail(errors, `V49 vendor landing class missing: ${slug}`);
      if (!/공식 도메인/.test(txt) || !/가입코드/.test(txt) || !/핵심 혜택 요약/.test(txt)) fail(errors, `V49 vendor content block missing: ${slug}`);
      if (!/@TRS999_bot/.test(txt)) fail(errors, `V49 vendor common consult bot missing: ${slug}`);
      if (new RegExp("SEO"+"A69|seo"+"a69", "i").test(txt)) fail(errors, `V49 forbidden legacy contact regression: ${slug}`);
    }
  }
  const sm = path.join(ROOT, 'sitemap.xml');
  if (fs.existsSync(sm)) {
    const txt = read(sm);
    for (const slug of vendorRoutes) if (!txt.includes(`https://88st.cloud/guaranteed/${slug}/`)) fail(errors, `V49 sitemap missing vendor route: ${slug}`);
  }
}

// V50 guaranteed compact + tools roadmap checks
{
  const gfp = path.join(ROOT, 'guaranteed/index.html');
  if (!fs.existsSync(gfp)) fail(errors, 'V50 guaranteed index missing');
  else {
    const g = read(gfp);
    if (!/v50-guaranteed-page/.test(g)) fail(errors, 'V50 guaranteed page class missing');
    if (!/v50-guarantee-container/.test(g)) fail(errors, 'V50 guaranteed compact container missing');
    if ((g.match(/v50-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V50 guaranteed compact card count failed');
    if ((g.match(/class=["'][^"']*detail-btn/g)||[]).length < 5) fail(errors, 'V50 guaranteed detail buttons missing');
    if ((g.match(/class=["'][^"']*action-btn/g)||[]).length < 5) fail(errors, 'V50 guaranteed shortcut buttons missing');
  }
  const tools = path.join(ROOT, 'tools/index.html');
  if (!fs.existsSync(tools)) fail(errors, 'V50 tools index missing');
  else {
    const t = read(tools);
    if (!/v50-tools-index/.test(t)) fail(errors, 'V50 tools page class missing');
    if (!/v50-provider-row/.test(t)) fail(errors, 'V50 tools provider row missing');
    if ((t.match(/v50-provider-mini-card/g)||[]).length !== 5) fail(errors, 'V50 tools provider card count failed');
    if (/<img[^>]*\/\s+decoding=/.test(t)) fail(errors, 'V50 malformed img regression in tools');
  }
  const roadmap = path.join(ROOT, 'assets/data/v50.tools.feature-roadmap.json');
  if (!fs.existsSync(roadmap)) fail(errors, 'V50 tools roadmap JSON missing');
  else {
    try {
      const data = JSON.parse(read(roadmap));
      if (!Array.isArray(data.items) || data.items.length !== 500) fail(errors, 'V50 tools roadmap count failed');
    } catch(e) { fail(errors, 'V50 tools roadmap JSON parse failed: ' + e.message); }
  }
  const css = path.join(ROOT, 'assets/css/growth-conversion.v36.css');
  if (fs.existsSync(css) && !/V50 GUARANTEED COMPACT \+ TOOLS POLISH START/.test(read(css))) fail(errors, 'V50 CSS block missing');
}


// V51 user-facing tools checks
{
  const tools = path.join(ROOT, 'tools/index.html');
  if (!fs.existsSync(tools)) fail(errors, 'V51 tools index missing');
  else {
    const t = read(tools);
    if (!/v51-tools-index/.test(t)) fail(errors, 'V51 tools body class missing');
    if (!/v51-tools-app/.test(t)) fail(errors, 'V51 tools app missing');
    if ((t.match(/data-v51-open=/g)||[]).length !== 12) fail(errors, 'V51 implemented tool card count failed');
    if ((t.match(/data-v51-panel=/g)||[]).length !== 12) fail(errors, 'V51 implemented tool panel count failed');
    if (!/assets\/js\/v51\.tools\.js/.test(t)) fail(errors, 'V51 tools JS missing from index');
    if (/도구 기능 추가 후보 500건/i.test(t)) fail(errors, 'V51 internal roadmap exposed on tools page');
    if (/href=["']#["']|javascript:void\(0\)/i.test(t)) fail(errors, 'V51 bad href in tools');
  }
  const js = path.join(ROOT, 'assets/js/v51.tools.js');
  if (!fs.existsSync(js)) fail(errors, 'V51 tools JS file missing');
  const roadmap = path.join(ROOT, 'assets/data/v51.user-facing-tools.json');
  if (!fs.existsSync(roadmap)) fail(errors, 'V51 user-facing tools JSON missing');
  else {
    try {
      const data = JSON.parse(read(roadmap));
      if (!Array.isArray(data.implementedTools) || data.implementedTools.length !== 12) fail(errors, 'V51 implemented tools JSON count failed');
      if (data.roadmapTotal !== 500) fail(errors, 'V51 roadmap total should be 500 from V50 source');
      if (!data.buckets || !data.buckets.visitor_candidate) fail(errors, 'V51 roadmap bucket classification missing');
    } catch(e) { fail(errors, 'V51 user-facing tools JSON parse failed: ' + e.message); }
  }
  const pkg = path.join(ROOT, 'package.json');
  if (fs.existsSync(pkg) && !/generate-v51-user-facing-tools\.mjs/.test(read(pkg))) fail(errors, 'V51 build script missing');
}


















// V52 open ready checks
{
  const tools = path.join(ROOT, 'tools/index.html');
  if (!fs.existsSync(tools)) fail(errors, 'V52 tools index missing');
  else {
    const t = read(tools);
    if (!/v52-tools-index/.test(t)) fail(errors, 'V52 tools body class missing');
    if (!/v52.open-ready.css/.test(t)) fail(errors, 'V52 CSS missing from tools');
    if (!/assets\/js\/v52\.tools\.js/.test(t)) fail(errors, 'V52 tools JS missing from tools');
    if ((t.match(/data-v52-open=/g)||[]).length !== 12) fail(errors, 'V52 tool card count failed');
    if ((t.match(/data-v52-panel=/g)||[]).length !== 12) fail(errors, 'V52 tool panel count failed');
    if (/href=["']#["']|javascript:void\(0\)/i.test(t)) fail(errors, 'V52 bad href in tools');
    if (/도구 기능 추가 후보 500건/i.test(t)) fail(errors, 'V52 internal roadmap exposed on tools page');
  }
  const gfp = path.join(ROOT, 'guaranteed/index.html');
  if (!fs.existsSync(gfp)) fail(errors, 'V52 guaranteed index missing');
  else {
    const g = read(gfp);
    if (!/v52-guaranteed-page/.test(g)) fail(errors, 'V52 guaranteed body class missing');
    if (!/v52-guaranteed-grid/.test(g)) fail(errors, 'V52 guaranteed grid missing');
    if ((g.match(/class=["'][^"']*v52-provider-card/g)||[]).length !== 5) fail(errors, 'V52 provider card count failed');
    if ((g.match(/data-v52-copy-code=/g)||[]).length !== 5) fail(errors, 'V52 copy code count failed');
    if ((g.match(/data-v52-detail-click=/g)||[]).length !== 5) fail(errors, 'V52 detail click count failed');
    if ((g.match(/data-v52-domain-click=/g)||[]).length < 5) fail(errors, 'V52 domain click count failed');
    if (new RegExp('SEO'+'A69|seo'+'a69','i').test(g)) fail(errors, 'V52 forbidden legacy contact in guaranteed');
  }
  for (const f of htmls) {
    const txt = read(f);
    if (/href=["']#["']|href=["']javascript:void\(0\)["']/i.test(txt)) fail(errors, 'V52 bad href regression ' + rel(f));
  }
  const css = path.join(ROOT, 'assets/css/v52.open-ready.css');
  const jsTools = path.join(ROOT, 'assets/js/v52.tools.js');
  const jsG = path.join(ROOT, 'assets/js/v52.guaranteed.js');
  if (!fs.existsSync(css)) fail(errors, 'V52 CSS file missing');
  if (!fs.existsSync(jsTools)) fail(errors, 'V52 tools JS file missing');
  if (!fs.existsSync(jsG)) fail(errors, 'V52 guaranteed JS file missing');
}
// END V52 open ready checks


// V53 main open ready checks
{
  const home = path.join(ROOT, 'index.html');
  if (!fs.existsSync(home)) fail(errors, 'V53 home index missing');
  else {
    const h = read(home);
    if (!/v53-home-page/.test(h)) fail(errors, 'V53 home body class missing');
    if (!/v53.main-open-ready.css/.test(h)) fail(errors, 'V53 main CSS missing');
    if (!/assets\/js\/v53\.main\.js/.test(h)) fail(errors, 'V53 main JS missing');
    if ((h.match(/class=["'][^"']*v53-provider-card/g)||[]).length !== 5) fail(errors, 'V53 home provider card count failed');
    if ((h.match(/class=["'][^"']*v53-tool-card/g)||[]).length !== 6) fail(errors, 'V53 home tool card count failed');
    if ((h.match(/class=["'][^"']*v53-guide-card/g)||[]).length !== 4) fail(errors, 'V53 home guide card count failed');
    if (/RUST 에이전시/.test(h)) fail(errors, 'V53 removed title returned on home');
    if (/상담 전 체크/.test(h)) fail(errors, 'V53 old consult-check card returned on home');
    if (/data-g-code=|가입코드|공식 도메인/.test(h)) fail(errors, 'V53 code/domain leaked on home provider cards');
    if (/href=["']#["']|javascript:void\(0\)/i.test(h)) fail(errors, 'V53 bad href in home');
  }
  const css = path.join(ROOT, 'assets/css/v53.main-open-ready.css');
  const js = path.join(ROOT, 'assets/js/v53.main.js');
  const audit = path.join(ROOT, 'assets/data/v53.main.audit.json');
  if (!fs.existsSync(css)) fail(errors, 'V53 main CSS file missing');
  if (!fs.existsSync(js)) fail(errors, 'V53 main JS file missing');
  if (!fs.existsSync(audit)) fail(errors, 'V53 audit JSON missing');
}
// END V53 main open ready checks

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
