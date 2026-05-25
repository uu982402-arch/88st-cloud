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
  if (!/v57-guaranteed-page/.test(g)) {
    if (!/premium-card/.test(g) || !/code-badge/.test(g)) fail(errors, "guaranteed missing premium card code facts");
    const codeRows = (g.match(/class=["'][^"']*code-badge/gi) || []).length;
    if (codeRows !== 5) fail(errors, `guaranteed code badge count regression: ${codeRows}`);
  }
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
    if (!/v57-guaranteed-page/.test(g)) {
      if ((g.match(/v48-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V48 guaranteed card count failed');
      if ((g.match(/data-v47-copy-code=/g)||[]).length !== 5) fail(errors, 'V48 guaranteed code count failed');
      if (!/v48-vendor-hero/.test(g)) fail(errors, 'V48 guaranteed image-first layout missing');
    }
  }
}

// V49 guaranteed vendor landing checks
{
  const vendorRoutes = ['queenbee','sk-holdings','anybet','udt','ddangkong'];
  const guaranteedIndex = path.join(ROOT, 'guaranteed/index.html');
  if (!fs.existsSync(guaranteedIndex)) fail(errors, 'V49 guaranteed index missing');
  else {
    const g = read(guaranteedIndex);
    if (!/v57-guaranteed-page/.test(g)) {
      if ((g.match(/v49-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V49 guaranteed card count failed');
      if ((g.match(/data-v49-detail-click=/g)||[]).length !== 5) fail(errors, 'V49 detail button count failed');
      if ((g.match(/data-v49-domain-click=/g)||[]).length < 5) fail(errors, 'V49 domain click tracking missing');
    }
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
    if (!/v57-guaranteed-page/.test(g)) {
      if (!/v50-guaranteed-page/.test(g)) fail(errors, 'V50 guaranteed page class missing');
      if (!/v50-guarantee-container/.test(g)) fail(errors, 'V50 guaranteed compact container missing');
      if ((g.match(/v50-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V50 guaranteed compact card count failed');
      if ((g.match(/class=["'][^"']*detail-btn/g)||[]).length < 5) fail(errors, 'V50 guaranteed detail buttons missing');
      if ((g.match(/class=["'][^"']*action-btn/g)||[]).length < 5) fail(errors, 'V50 guaranteed shortcut buttons missing');
    }
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







































// V54 vendor landing design checks
{
  const vendorRoutes = ['queenbee','sk-holdings','anybet','udt','ddangkong'];
  for (const slug of vendorRoutes) {
    const fp = path.join(ROOT, 'guaranteed', slug, 'index.html');
    if (!fs.existsSync(fp)) fail(errors, `V54 vendor landing missing: ${slug}`);
    else {
      const txt = read(fp);
      if (!/v54-vendor-detail/.test(txt)) fail(errors, `V54 vendor detail body class missing: ${slug}`);
      if (!/v54.vendor-landing.css/.test(txt)) fail(errors, `V54 vendor CSS missing: ${slug}`);
      if (!/v54-hero-card/.test(txt) || !/v54-visual-card/.test(txt)) fail(errors, `V54 compact visual hero missing: ${slug}`);
      if (!/v54-fact-strip/.test(txt) || !/v54-benefit-grid/.test(txt)) fail(errors, `V54 vendor fact/benefit layout missing: ${slug}`);
    }
  }
  if (!fs.existsSync(path.join(ROOT, 'assets/css/v54.vendor-landing.css'))) fail(errors, 'V54 vendor CSS file missing');
  if (!fs.existsSync(path.join(ROOT, 'assets/js/v54.vendor-landing.js'))) fail(errors, 'V54 vendor JS file missing');
}

// V55 luminous sitewide visual renewal checks
{
  const css = path.join(ROOT, 'assets/css/v55.luminous-sitewide.css');
  const js = path.join(ROOT, 'assets/js/v55.luminous-sitewide.js');
  const audit = path.join(ROOT, 'assets/data/v55.luminous.audit.json');
  const generator = path.join(ROOT, 'scripts/generate-v55-luminous-sitewide-design.mjs');
  if (!fs.existsSync(css)) fail(errors, 'V55 luminous CSS file missing');
  else {
    const c = read(css);
    if (!/V55 Luminous Sitewide Renewal/.test(c)) fail(errors, 'V55 CSS header missing');
    if (!/compact title-section guard/.test(c)) fail(errors, 'V55 compact title guard missing');
    for (const m of c.matchAll(/font-size:\s*clamp\(([^)]*)\)/gi)) {
      const parts = m[1].split(',').map(x => x.trim());
      const max = parts[2] || '';
      const n = Number((max.match(/([0-9.]+)rem/i)||[])[1] || 0);
      if (n >= 3.6) fail(errors, 'V55 title font too large');
    }
  }
  if (!fs.existsSync(js)) fail(errors, 'V55 luminous JS file missing');
  if (!fs.existsSync(audit)) fail(errors, 'V55 luminous audit JSON missing');
  if (!fs.existsSync(generator)) fail(errors, 'V55 generator missing');
  const corePages = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html'];
  for (const route of corePages) {
    const fp = path.join(ROOT, route);
    if (fs.existsSync(fp)) {
      const txt = read(fp);
      if (!/v55-luminous-site|v57-high-end|v58-dashboard-home|v58-enhanced|v61-home|v62-home|v62-home|v62-home|v62-home|v62-home|v62-home/.test(txt)) fail(errors, 'V55/V57/V58 body class missing ' + route);
      if (!/v55\.luminous-sitewide\.css|v57\.mobile-bento\.css|v58\.app-dashboard\.css|v61\.main-dashboard-rebuild\.css|v62\.main-hard-reset\.css|v62\.main-hard-reset\.css|v62\.main-hard-reset\.css|v62\.main-hard-reset\.css|v62\.main-hard-reset\.css|v62\.main-hard-reset\.css/.test(txt)) fail(errors, 'V55/V57/V58 CSS link missing ' + route);
      if (!/v55\.luminous-sitewide\.js|v57\.mobile-bento\.js|v58\.app-dashboard\.js|v61\.main-dashboard-rebuild\.js|v62\.main-hard-reset\.js|v62\.main-hard-reset\.js|v62\.main-hard-reset\.js|v62\.main-hard-reset\.js|v62\.main-hard-reset\.js|v62\.main-hard-reset\.js/.test(txt)) fail(errors, 'V55/V57/V58 JS link missing ' + route);
    }
  }
}














// V56 high-end unified design system checks
{
  const css = path.join(ROOT, 'assets/css/v56.high-end-system.css');
  const js = path.join(ROOT, 'assets/js/v56.design-system.js');
  const audit = path.join(ROOT, 'assets/data/v56.high-end-system.audit.json');
  if (!fs.existsSync(css)) fail(errors, 'V56 high-end CSS file missing');
  if (!fs.existsSync(js)) fail(errors, 'V56 design JS file missing');
  if (!fs.existsSync(audit)) fail(errors, 'V56 audit JSON missing');
  let missingV56 = 0;
  let missingLogo = 0;
  for (const f of htmls) {
    const txt = read(f);
    if (!/v61-home|v62-home|v57-home-page|v57-guaranteed-page|v58-dashboard-home/.test(txt) && (!/v56-design-system/.test(txt) || !/v56\.high-end-system\.css/.test(txt) || !/v56\.design-system\.js/.test(txt))) missingV56++;
    const hasHeaderBrand = /<a\b[^>]*class=["'][^"']*(moon-brand|\bbrand\b)[^"']*["'][^>]*>/i.test(txt);
    const isRedirectOnly = /http-equiv=["']refresh["']/i.test(txt) && !/<main\b/i.test(txt);
    if (hasHeaderBrand && !isRedirectOnly && (!(/v56-logo-symbol/.test(txt) && /v56-logo-main/.test(txt) && /v56-logo-cloud/.test(txt)) && !/v57-logo-mark|v58-logo-symbol|v61-logo-mark|v62-symbol|v62-symbol|v62-symbol|v62-symbol|v62-symbol|v62-symbol/.test(txt))) missingLogo++;
    if (/href=["']#["']|href=["']javascript:void\(0\)["']/i.test(txt)) fail(errors, 'V56 bad href regression ' + rel(f));
    if (/<img[^>]+logo-v24\.png[^>]*>/.test(txt) && /moon-brand/.test(txt)) fail(errors, 'V56 legacy image logo in header ' + rel(f));
  }
  if (missingV56) fail(errors, 'V56 design layer missing from ' + missingV56 + ' HTML files');
  if (missingLogo) fail(errors, 'V56 unified CSS logo missing from ' + missingLogo + ' HTML files');
  const style = fs.existsSync(css) ? read(css) : '';
  for (const token of ['#090D16', '#00F0FF', '#39FF14', 'v56-logo-symbol', 'backdrop-filter', 'hover:border']) {
    if (!style.includes(token)) fail(errors, 'V56 design token missing ' + token);
  }
}
// END V56 high-end unified design system checks










// V57 mobile-first high-end bento checks
{
  const css = path.join(ROOT, 'assets/css/v57.mobile-bento.css');
  const js = path.join(ROOT, 'assets/js/v57.mobile-bento.js');
  const audit = path.join(ROOT, 'assets/data/v57.mobile-bento.audit.json');
  if (!fs.existsSync(css)) fail(errors, 'V57 mobile bento CSS file missing');
  if (!fs.existsSync(js)) fail(errors, 'V57 mobile bento JS file missing');
  if (!fs.existsSync(audit)) fail(errors, 'V57 audit JSON missing');
  const home = path.join(ROOT, 'index.html');
  if (fs.existsSync(home)) {
    const h = read(home);
    if (!/v61-home|v62-home|v57-home-page|v58-dashboard-home/.test(h)) fail(errors, 'V57/V58/V61 home body class missing');
    if (!/v61-home|v62-home|v58-dashboard-home/.test(h)) {
      if (!/v57-provider-grid2/.test(h)) fail(errors, 'V57 provider section missing on home');
      if ((h.match(/class=["'][^"']*v57-provider-card2/g)||[]).length !== 5) fail(errors, 'V57 home provider card count failed');
      if ((h.match(/class=["'][^"']*v57-bento-card/g)||[]).length !== 12) fail(errors, 'V57 bento tool card count failed');
      if ((h.match(/class=["'][^"']*v57-blog-card2/g)||[]).length !== 4) fail(errors, 'V57 blog card count failed');
    }
    if (/상담 전 체크|RUST 에이전시/.test(h)) fail(errors, 'V57 removed home copy returned');
    if (/data-g-code=/.test(h)) fail(errors, 'V57 data-g-code leaked on home provider cards');
  }
  const guaranteed = path.join(ROOT, 'guaranteed/index.html');
  if (fs.existsSync(guaranteed)) {
    const g = read(guaranteed);
    if (!/v57-guaranteed-page/.test(g)) fail(errors, 'V57 guaranteed body class missing');
    if ((g.match(/class=["'][^"']*v57-premium-provider-card/g)||[]).length !== 5) fail(errors, 'V57 guaranteed card count failed');
    if ((g.match(/class=["'][^"']*v57-provider-logo-frame/g)||[]).length !== 5) fail(errors, 'V57 guaranteed logo frame count failed');
    if ((g.match(/data-v57-copy-code=/g)||[]).length !== 5) fail(errors, 'V57 copy code count failed');
    for (const img of ['queenbee-card.svg','sk-holdings-card.svg','anybet-card.svg','udt-card.svg','ddangkong-card.svg']) {
      if (!g.includes(img)) fail(errors, 'V57/V59 missing unified provider image ' + img);
      if (!fs.existsSync(path.join(ROOT, 'assets/vendor-logos/v59', img))) fail(errors, 'V57/V59 unified provider image asset missing ' + img);
    }
  }
  const style = fs.existsSync(css) ? read(css) : '';
  for (const token of ['grid-template-columns:repeat(4', '@media (max-width:768px)', 'grid-template-columns:1fr', '#090D16', '#00F0FF', '#39FF14', 'v57-provider-logo-frame']) {
    if (!style.includes(token)) fail(errors, 'V57 design token missing ' + token);
  }
}
// END V57 mobile-first high-end bento checks






















// V58 app-style dashboard checks
{
  const home = path.join(ROOT, 'index.html');
  const css = path.join(ROOT, 'assets/css/v58.app-dashboard.css');
  const js = path.join(ROOT, 'assets/js/v58.app-dashboard.js');
  const audit = path.join(ROOT, 'assets/data/v58.app-dashboard.audit.json');
  if (!fs.existsSync(css)) fail(errors, 'V58 CSS file missing');
  if (!fs.existsSync(js)) fail(errors, 'V58 JS file missing');
  if (!fs.existsSync(audit)) fail(errors, 'V58 audit JSON missing');
  if (fs.existsSync(home)) {
    const h = read(home);
    if (!/v61-home|v62-home/.test(h)) {
      if (!/v58-dashboard-home/.test(h)) fail(errors, 'V58 home body class missing');
      if ((h.match(/data-v58-tab-trigger=/g)||[]).length < 10) fail(errors, 'V58 tab trigger count failed');
    if ((h.match(/data-v58-view=/g)||[]).length !== 5) fail(errors, 'V58 view count failed');
    if ((h.match(/class=["'][^"']*v58-provider-card/g)||[]).length < 10) fail(errors, 'V58 provider cards missing');
    if ((h.match(/class=["'][^"']*v58-tool-card/g)||[]).length < 18) fail(errors, 'V58 tool cards missing');
    if ((h.match(/class=["'][^"']*v58-guide-card/g)||[]).length < 4) fail(errors, 'V58 guide cards missing');
    if (!/data-v58-live-search/.test(h)) fail(errors, 'V58 live search missing');
    if (!/v58-bottom-nav/.test(h)) fail(errors, 'V58 mobile bottom nav missing');
    if (/href=["']#["']|javascript:void(0)/i.test(h)) fail(errors, 'V58 bad href in home');
    }
  }
  const style = fs.existsSync(css) ? read(css) : '';
  for (const token of ['#000','rgba(255,255,255,.026)','@media (max-width:768px)','overflow-x:auto','grid-template-columns:repeat(4','v58-bottom-nav','translateY(-5px)']) {
    if (!style.includes(token)) fail(errors, 'V58 design token missing ' + token);
  }
  const script = fs.existsSync(js) ? read(js) : '';
  for (const token of ['setTab','data-v58-live-search','v58-ripple','v58-image-fallback']) {
    if (!script.includes(token)) fail(errors, 'V58 JS token missing ' + token);
  }
}
// END V58 app-style dashboard checks


















// V59 vendor logo system checks
{
  const css = path.join(ROOT, 'assets/css/v59.vendor-logo-system.css');
  const js = path.join(ROOT, 'assets/js/v59.vendor-logo-system.js');
  const audit = path.join(ROOT, 'assets/data/v59.vendor-logo-system.audit.json');
  const logos = ['queenbee-card.svg','sk-holdings-card.svg','anybet-card.svg','udt-card.svg','ddangkong-card.svg'];
  if (!fs.existsSync(css)) fail(errors, 'V59 vendor logo CSS missing');
  if (!fs.existsSync(js)) fail(errors, 'V59 vendor logo JS missing');
  if (!fs.existsSync(audit)) fail(errors, 'V59 vendor logo audit missing');
  for (const logo of logos) {
    const fp = path.join(ROOT, 'assets/vendor-logos/v59', logo);
    if (!fs.existsSync(fp)) fail(errors, 'V59 unified SVG logo missing: ' + logo);
    else if (!/<svg/i.test(read(fp))) fail(errors, 'V59 logo is not SVG: ' + logo);
  }
  const runtimePages = ['index.html','guaranteed/index.html','tools/index.html','guaranteed/queenbee/index.html','guaranteed/sk-holdings/index.html','guaranteed/anybet/index.html','guaranteed/udt/index.html','guaranteed/ddangkong/index.html'];
  for (const route of runtimePages) {
    const fp = path.join(ROOT, route);
    if (!fs.existsSync(fp)) continue;
    const txt = read(fp);
    if (!/v61-home|v62-home/.test(txt)) {
      if (!/v59-vendor-logo-system/.test(txt)) fail(errors, 'V59 body class missing ' + route);
      if (!/v59.vendor-logo-system.css/.test(txt)) fail(errors, 'V59 CSS link missing ' + route);
      if (!/v59.vendor-logo-system.js/.test(txt)) fail(errors, 'V59 JS link missing ' + route);
    } else if (!/v59.vendor-logo-system.css/.test(txt)) fail(errors, 'V59 CSS link missing ' + route);
  }
  const guaranteed = path.join(ROOT, 'guaranteed/index.html');
  if (fs.existsSync(guaranteed)) {
    const g = read(guaranteed);
    for (const logo of logos) if (!g.includes('/assets/vendor-logos/v59/' + logo)) fail(errors, 'V59 guaranteed missing logo reference ' + logo);
    for (const old of ['queenbee-logo-clean-v22.png','sk-holdings-logo.png','anybet-logo.png','udt-logo-transparent-v14.png','ddangkong-logo-v19.png']) if (g.includes(old)) fail(errors, 'V59 old provider logo leaked in guaranteed ' + old);
  }
  const home = path.join(ROOT, 'index.html');
  if (fs.existsSync(home)) {
    const h = read(home);
    if (!/v61-home|v62-home/.test(h) && (h.match(/v59-provider-logo-img/g)||[]).length < 5) fail(errors, 'V59 home unified logo count failed');
    if (/v61-home|v62-home/.test(h) && (h.match(/assets\/vendor-logos\/v59\//g)||[]).length < 5) fail(errors, 'V61 home unified logo count failed');
  }
  const tools = path.join(ROOT, 'tools/index.html');
  if (fs.existsSync(tools)) {
    const t = read(tools);
    for (const logo of logos) if (!t.includes('/assets/vendor-logos/v59/' + logo)) fail(errors, 'V59 tools missing logo reference ' + logo);
  }
}
// END V59 vendor logo system checks










// V60 open-ready conversion finalization checks
{
  const css = path.join(ROOT, 'assets/css/v60.open-ready-final.css');
  const js = path.join(ROOT, 'assets/js/v60.open-ready-final.js');
  const audit = path.join(ROOT, 'assets/data/v60.open-ready-final.audit.json');
  const generator = path.join(ROOT, 'scripts/generate-v60-open-ready-finalization.mjs');
  if (!fs.existsSync(css)) fail(errors, 'V60 CSS file missing');
  if (!fs.existsSync(js)) fail(errors, 'V60 JS file missing');
  if (!fs.existsSync(audit)) fail(errors, 'V60 audit JSON missing');
  if (!fs.existsSync(generator)) fail(errors, 'V60 generator missing');
  const cssText = fs.existsSync(css) ? read(css) : '';
  for (const token of ['V60 Open-Ready Conversion', '--v60-cyan', 'v60-toast', 'v60-vendor-sticky', '@media (max-width:768px)', 'min-height:56px']) {
    if (!cssText.includes(token)) fail(errors, 'V60 CSS token missing ' + token);
  }
  const jsText = fs.existsSync(js) ? read(js) : '';
  for (const token of ['v60-toast', 'data-v60-copy-result', 'ensureVendorSticky', 'imageFallbacks']) {
    if (!jsText.includes(token)) fail(errors, 'V60 JS token missing ' + token);
  }
  let auditData = null;
  if (fs.existsSync(audit)) {
    try { auditData = JSON.parse(read(audit)); }
    catch(e) { fail(errors, 'V60 audit JSON parse failed: ' + e.message); }
  }
  if (auditData) {
    if (auditData.summary.badHref !== 0) fail(errors, 'V60 bad href count not zero: ' + auditData.summary.badHref);
    if (auditData.summary.missingAsset !== 0) fail(errors, 'V60 missing asset count not zero: ' + auditData.summary.missingAsset);
    if (auditData.summary.deadInternal !== 0) fail(errors, 'V60 dead internal count not zero: ' + auditData.summary.deadInternal);
    if (auditData.summary.sitemapMissing !== 0) fail(errors, 'V60 sitemap missing count not zero: ' + auditData.summary.sitemapMissing);
    if (auditData.summary.sitemapDuplicates !== 0) fail(errors, 'V60 sitemap duplicate count not zero: ' + auditData.summary.sitemapDuplicates);
    if (auditData.summary.noindexInSitemap !== 0) fail(errors, 'V60 noindex sitemap count not zero: ' + auditData.summary.noindexInSitemap);
    if ((auditData.vendor?.vendorLandings || 0) !== 5) fail(errors, 'V60 vendor landing count failed');
    if ((auditData.tools?.cards || 0) < 12 || (auditData.tools?.panels || 0) < 12) fail(errors, 'V60 tools inventory failed');
  }
  const requiredPages = ['index.html','tools/index.html','guaranteed/index.html','consult/index.html','blog/index.html','guaranteed/queenbee/index.html','guaranteed/sk-holdings/index.html','guaranteed/anybet/index.html','guaranteed/udt/index.html','guaranteed/ddangkong/index.html'];
  for (const route of requiredPages) {
    const fp = path.join(ROOT, route);
    if (!fs.existsSync(fp)) fail(errors, 'V60 required page missing ' + route);
    else {
      const txt = read(fp);
      if (!/v61-home|v62-home/.test(txt)) {
        if (!/v60-open-ready/.test(txt)) fail(errors, 'V60 body class missing ' + route);
        if (!/v60\.open-ready-final\.css/.test(txt)) fail(errors, 'V60 CSS link missing ' + route);
        if (!/v60\.open-ready-final\.js/.test(txt)) fail(errors, 'V60 JS link missing ' + route);
      }
    }
  }
  const home = path.join(ROOT, 'index.html');
  if (fs.existsSync(home)) {
    const h = read(home);
    if (/data-g-code=|RUST 에이전시|상담 전 체크/.test(h)) fail(errors, 'V60 home regression');
  }
  const g = path.join(ROOT, 'guaranteed/index.html');
  if (fs.existsSync(g)) {
    const txt = read(g);
    for (const logo of ['queenbee-card.svg','sk-holdings-card.svg','anybet-card.svg','udt-card.svg','ddangkong-card.svg']) if (!txt.includes(logo)) fail(errors, 'V60 guaranteed missing unified logo ' + logo);
  }
}
// END V60 open-ready conversion finalization checks

















































































// V61 compact main dashboard checks
if (fs.existsSync(path.join(ROOT, "index.html"))) {
  const v61Home = read(path.join(ROOT, "index.html"));
  if (!/v61-home|v62-home/.test(v61Home)) fail(errors, "V61/V62 main dashboard class missing");
  if (/Team RUST MAIN|RUST 에이전시/.test(v61Home)) fail(errors, "V61 old giant title text regression");
  const providerLogos = (v61Home.match(/assets\/vendor-logos\/v59\//g) || []).length;
  if (providerLogos < 5) fail(errors, `V61 provider logos missing: ${providerLogos}`);
  if (!/v61-provider-visual|v62-provider-art/.test(v61Home)) fail(errors, "V61/V62 large provider visual missing");
}

// V62 main hard reset checks
try {
  const h = read(path.join(ROOT, 'index.html'));
  if (!/v62-home/.test(h)) fail(errors, 'V62 home body class missing');
  if (!/v62\.main-hard-reset\.css/.test(h)) fail(errors, 'V62 main CSS missing');
  if (!/v62\.main-hard-reset\.js/.test(h)) fail(errors, 'V62 main JS missing');
  if (/Team RUST MAIN|Trust OS|보증업체·도구·전문 가이드/.test(h)) fail(errors, 'V62 legacy large hero text remains');
  if ((h.match(/v62-provider-card/g) || []).length !== 5) fail(errors, 'V62 provider card count mismatch');
  if ((h.match(/v62-tool-card/g) || []).length !== 12) fail(errors, 'V62 tool card count mismatch');
  if (/data-g-code=|공식 도메인/.test(h)) fail(errors, 'V62 home leaks code/domain labels');
} catch (e) { fail(errors, 'V62 main checks failed: ' + e.message); }


// V64 mobile/tools/guaranteed regression checks
try {
  const sampleTools = read(path.join(ROOT, 'tools/index.html'));
  const sampleGuaranteed = read(path.join(ROOT, 'guaranteed/index.html'));
  if (!/v64\.mobile-tools-dark-fix\.css/.test(sampleTools)) fail(errors, 'V64 tools CSS missing');
  if (!/v64\.mobile-tools-dark-fix\.js/.test(sampleTools)) fail(errors, 'V64 tools JS missing');
  if (!/v64-mobile-tools-dark-fix/.test(sampleTools)) fail(errors, 'V64 tools body class missing');
  if (!/v64-mobile-tools-dark-fix/.test(sampleGuaranteed)) fail(errors, 'V64 guaranteed body class missing');
  const v64Css = read(path.join(ROOT, 'assets/css/v64.mobile-tools-dark-fix.css'));
  if (!/v52-tool-card/.test(v64Css) || !/background:linear-gradient\(180deg,rgba\(255,255,255,.055\)/.test(v64Css)) fail(errors, 'V64 dark tool card guard missing');
  if (!/v52-provider-card/.test(v64Css) || !/object-fit:contain/.test(v64Css)) fail(errors, 'V64 provider image fit guard missing');
  const v58jsPath = path.join(ROOT, 'assets/js/v58.app-dashboard.js');
  if (fs.existsSync(v58jsPath)) {
    const v58js = read(v58jsPath);
    if (/\['\/blog\/',\s*'가이드',\s*'블로그'\]/.test(v58js)) fail(errors, 'V64 old guide bottom label remains in v58 JS');
    if (/\['\/guaranteed\/',\s*'업체',\s*'보증업체'\]/.test(v58js)) fail(errors, 'V64 old vendor short label remains in v58 JS');
  }
} catch (e) { fail(errors, 'V64 checks failed: ' + e.message); }


// V65 global premium UI fix checks
try {
  const v65Css = read(path.join(ROOT, 'assets/css/v65.global-premium-fix.css'));
  const v65Js = read(path.join(ROOT, 'assets/js/v65.global-premium-fix.js'));
  const guaranteedV65 = read(path.join(ROOT, 'guaranteed/index.html'));
  const toolsV65 = read(path.join(ROOT, 'tools/index.html'));
  const consultV65 = read(path.join(ROOT, 'consult/index.html'));
  if (!/v65-provider-board/.test(guaranteedV65) || !/v65-consult-banner/.test(guaranteedV65)) fail(errors, 'V65 guaranteed layout missing');
  if (/v57-guaranteed-hero[\s\S]*RUST 에이전시 보증 업체/.test(guaranteedV65)) fail(errors, 'V65 guaranteed title hero still visible');
  if (!/v65-chat-bubble/.test(guaranteedV65) || !/v65-chat-bubble/.test(toolsV65) || !/v65-chat-bubble/.test(consultV65)) fail(errors, 'V65 global chat bubble missing');
  if (!/v65-tools-page/.test(toolsV65)) fail(errors, 'V65 tools page class missing');
  if (!/v65-consult-page/.test(consultV65)) fail(errors, 'V65 consult page class missing');
  if (!/v65-provider-card/.test(v65Css) || !/v65-chat-bubble/.test(v65Css)) fail(errors, 'V65 global premium fix CSS missing');
  if (!/data-v65-copy-code/.test(v65Js)) fail(errors, 'V65 copy handler missing');
} catch (err) {
  fail(errors, `V65 verification failed: ${err.message}`);
}

// END V62 checks


// V63 sitewide hard reset checks
const v63KeyPages = [
  'index.html','tools/index.html','guaranteed/index.html','blog/index.html','consult/index.html',
  'guaranteed/queenbee/index.html','guaranteed/sk-holdings/index.html','guaranteed/anybet/index.html','guaranteed/udt/index.html','guaranteed/ddangkong/index.html'
];
for (const page of v63KeyPages) {
  const p = path.join(ROOT, page);
  if (!fs.existsSync(p)) fail(errors, `V63 key page missing ${page}`);
  else {
    const txt = read(p);
    if (!/v63\.sitewide-hard-reset\.css/i.test(txt)) fail(errors, `V63 css missing ${page}`);
    if (!/v63\.sitewide-hard-reset\.js/i.test(txt)) fail(errors, `V63 js missing ${page}`);
    if (!/v63-sitewide-hard-reset/i.test(txt)) fail(errors, `V63 body class missing ${page}`);
  }
}
if (!fs.existsSync(path.join(ROOT,'assets/css/v63.sitewide-hard-reset.css'))) fail(errors, 'V63 css asset missing');
if (!fs.existsSync(path.join(ROOT,'assets/js/v63.sitewide-hard-reset.js'))) fail(errors, 'V63 js asset missing');
if (!fs.existsSync(path.join(ROOT,'assets/data/v63.sitewide-hard-reset.audit.json'))) fail(errors, 'V63 audit missing');



























































































































































































































































































































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
    if (!/v52-guaranteed-page|v57-guaranteed-page/.test(g)) fail(errors, 'V52/V57 guaranteed body class missing');
    if (!/v52-guaranteed-grid|v57-premium-provider-grid/.test(g)) fail(errors, 'V52/V57 guaranteed grid missing');
    if (!/v57-guaranteed-page/.test(g)) {
      if ((g.match(/class=["'][^"']*v52-provider-card/g)||[]).length !== 5) fail(errors, 'V52 provider card count failed');
      if ((g.match(/data-v52-copy-code=/g)||[]).length !== 5) fail(errors, 'V52 copy code count failed');
      if ((g.match(/data-v52-detail-click=/g)||[]).length !== 5) fail(errors, 'V52 detail click count failed');
      if ((g.match(/data-v52-domain-click=/g)||[]).length < 5) fail(errors, 'V52 domain click count failed');
    }
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
    if (!/v61-home|v53-home-page|v57-home-page|v58-dashboard-home/.test(h)) fail(errors, 'V53/V57/V58/V61 home body class missing');
    if (!/v61.main-dashboard-rebuild.css|v53.main-open-ready.css|v57.mobile-bento.css|v58.app-dashboard.css/.test(h)) fail(errors, 'V53/V57/V58/V61 main CSS missing');
    if (!/assets\/js\/v61\.main-dashboard-rebuild\.js|assets\/js\/v53\.main\.js|assets\/js\/v57\.mobile-bento\.js|assets\/js\/v58\.app-dashboard\.js/.test(h)) fail(errors, 'V53/V57/V58/V61 main JS missing');
    if (!/v61-home|v57-home-page|v58-dashboard-home/.test(h)) {
      if ((h.match(/class=["'][^"']*v53-provider-card/g)||[]).length !== 5) fail(errors, 'V53 home provider card count failed');
      if ((h.match(/class=["'][^"']*v53-tool-card/g)||[]).length !== 6) fail(errors, 'V53 home tool card count failed');
      if ((h.match(/class=["'][^"']*v53-guide-card/g)||[]).length !== 4) fail(errors, 'V53 home guide card count failed');
    }
    if (/RUST 에이전시/.test(h)) fail(errors, 'V53 removed title returned on home');
    if (/상담 전 체크/.test(h)) fail(errors, 'V53 old consult-check card returned on home');
    if (!/v61-home|v57-home-page|v58-dashboard-home/.test(h) && /data-g-code=|가입코드|공식 도메인/.test(h)) fail(errors, 'V53 code/domain leaked on home provider cards');
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
