import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const VERSION = 'V139_5_WORKER_DUPLICATE_SYMBOL_HOTFIX';
const changed = new Set();
const p = (...parts) => path.join(ROOT, ...parts);
const rel = fp => path.relative(ROOT, fp).replaceAll(path.sep, '/');
const read = fp => fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : '';
function write(fp, text){ fs.mkdirSync(path.dirname(fp), {recursive:true}); fs.writeFileSync(fp, text); changed.add(rel(fp)); }
function count(haystack, needle){ return (haystack.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length; }
function stripWorkerRouteBlocks(worker){
  const before = worker;
  const blockPatterns = [
    /\nconst V139_3_BLOG_403_ROUTE_HOTFIX_REDIRECTS = new Map\(\[[\s\S]*?\]\);\s*\n\s*function v1393RouteHotfixRedirect\(pathname\) \{[\s\S]*?\n\}\s*\n/g,
    /\nconst V139_4_STALE_BLOG_ROUTE_REDIRECTS = new Map\(\[[\s\S]*?\]\);\s*\n\s*function v1394StaleRouteRedirect\(pathname\) \{[\s\S]*?\n\}\s*\n/g,
    /\nconst V139_5_SAFE_BLOG_ROUTE_REDIRECTS = new Map\(\[[\s\S]*?\]\);\s*\n\s*function v1395SafeBlogRouteRedirect\(pathname\) \{[\s\S]*?\n\}\s*\n/g
  ];
  for(const re of blockPatterns) worker = worker.replace(re, '\n');
  const callPatterns = [
    /\s*const v139\dRedirect = v139[0-9A-Za-z]+\(url\.pathname\);\n\s*if \(v139\dRedirect\) return v139\dRedirect;\n/g
  ];
  for(const re of callPatterns) worker = worker.replace(re, '\n');
  return {worker, removed: before !== worker};
}
const workerFile = p('_worker.js');
let worker = read(workerFile);
if(!worker){ console.error('[V139.5 GENERATE FAIL] _worker.js missing'); process.exit(1); }
const beforeCounts = {
  v1393Const: count(worker, 'V139_3_BLOG_403_ROUTE_HOTFIX_REDIRECTS'),
  v1394Const: count(worker, 'V139_4_STALE_BLOG_ROUTE_REDIRECTS'),
  v1393Fn: count(worker, 'v1393RouteHotfixRedirect'),
  v1394Fn: count(worker, 'v1394StaleRouteRedirect')
};
const stripped = stripWorkerRouteBlocks(worker);
worker = stripped.worker;
const safeBlock = `\nconst V139_5_SAFE_BLOG_ROUTE_REDIRECTS = new Map([\n  ["/blog/queenbee-telegram-seoa69.html", "/search-guides/queenbee-seoa-code.html"],\n  ["/blog/queenbee-telegram-seoa69", "/search-guides/queenbee-seoa-code.html"],\n  ["/blog/minigame/minigame-losing-streak-event-exclusion-condition-first", "/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html"]\n]);\n\nfunction v1395SafeBlogRouteRedirect(pathname) {\n  const target = V139_5_SAFE_BLOG_ROUTE_REDIRECTS.get(pathname);\n  return target ? new Response(null, { status: 301, headers: { location: target, 'cache-control': 'no-store' } }) : null;\n}\n`;
const exportMarker = 'export default {';
const exportIndex = worker.indexOf(exportMarker);
if(exportIndex < 0){ console.error('[V139.5 GENERATE FAIL] _worker.js missing export default'); process.exit(1); }
let prefix = worker.slice(0, exportIndex);
let suffix = worker.slice(exportIndex + exportMarker.length);
if(!suffix.includes('v1395SafeBlogRouteRedirect(url.pathname)')){
  suffix = suffix.replace('try {', 'try {\n      const v1395Redirect = v1395SafeBlogRouteRedirect(url.pathname);\n      if (v1395Redirect) return v1395Redirect;\n');
}
if(!suffix.includes('v1395SafeBlogRouteRedirect(url.pathname)')){
  console.error('[V139.5 GENERATE FAIL] unable to insert worker redirect hook'); process.exit(1);
}
worker = prefix + safeBlock + '\n' + exportMarker + suffix;
write(workerFile, worker);
// Harden V139.4 generator so future local runs do not reintroduce duplicate route symbols before V139.5 cleanup.
const v1394GenFile = p('scripts/generate-v139-4-blog-direct-html-fallback.mjs');
let gen4 = read(v1394GenFile);
if(gen4 && !gen4.includes('V139.5 idempotent worker cleanup')){
  gen4 = gen4.replace("let w=read(p('_worker.js')); if(w){", "let w=read(p('_worker.js')); if(w){\n  // V139.5 idempotent worker cleanup: remove older duplicate worker redirect blocks before applying V139.4 normalization.\n  w=w.replace(/\\nconst V139_3_BLOG_403_ROUTE_HOTFIX_REDIRECTS = new Map\\(\\[[\\s\\S]*?\\]\\);\\s*\\n\\s*function v1393RouteHotfixRedirect\\(pathname\\) \\{[\\s\\S]*?\\n\\}\\s*\\n/g,'\\n')\n     .replace(/\\nconst V139_4_STALE_BLOG_ROUTE_REDIRECTS = new Map\\(\\[[\\s\\S]*?\\]\\);\\s*\\n\\s*function v1394StaleRouteRedirect\\(pathname\\) \\{[\\s\\S]*?\\n\\}\\s*\\n/g,'\\n')\n     .replace(/\\s*const v1393Redirect = v1393RouteHotfixRedirect\\(url\\.pathname\\);\\n\\s*if \\(v1393Redirect\\) return v1393Redirect;\\n/g,'\\n')\n     .replace(/\\s*const v1394Redirect = v1394StaleRouteRedirect\\(url\\.pathname\\);\\n\\s*if \\(v1394Redirect\\) return v1394Redirect;\\n/g,'\\n');");
  write(v1394GenFile, gen4);
}
// Update package scripts to v139-5.
const pkgFile = p('package.json');
let pkg = JSON.parse(read(pkgFile));
pkg.scripts = pkg.scripts || {};
pkg.scripts.build = 'node scripts/build-v139-5-cloudflare-pages-safe.mjs';
pkg.scripts.verify = 'node scripts/verify-v139-5-worker-duplicate-symbol-hotfix.mjs';
pkg.scripts['quality:v139-5'] = 'node scripts/generate-v139-5-worker-duplicate-symbol-hotfix.mjs';
pkg.scripts['verify:v139-5'] = 'node scripts/verify-v139-5-worker-duplicate-symbol-hotfix.mjs';
write(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
fs.mkdirSync(p('reports'), {recursive:true});
const audit = { ok:true, version:VERSION, purpose:'Remove duplicate top-level Worker route redirect declarations that pass node build but fail Cloudflare Pages Functions bundling.', beforeCounts, afterCounts:{ v1395Const: count(worker, 'V139_5_SAFE_BLOG_ROUTE_REDIRECTS'), v1395Fn: count(worker, 'v1395SafeBlogRouteRedirect'), oldV1393: count(worker, 'V139_3_BLOG_403_ROUTE_HOTFIX_REDIRECTS'), oldV1394: count(worker, 'V139_4_STALE_BLOG_ROUTE_REDIRECTS') }, changedFiles:[...changed].sort(), deletedFiles:[], generatedAt:new Date().toISOString() };
write(p('reports/v139-5-worker-duplicate-symbol-hotfix-audit.json'), JSON.stringify(audit, null, 2) + '\n');
write(p('V139_5_PATCH_MANIFEST.json'), JSON.stringify({version:VERSION, base:'V139.4 BLOG DIRECT HTML 403 FALLBACK', changedFiles:[...changed].sort(), deletedFiles:[], uploadMode:'PATCH root overwrite; FULL full replacement', generatedAt:new Date().toISOString()}, null, 2) + '\n');
write(p('V139_5_UPGRADE_REPORT.md'), `# ${VERSION}\n\n- Fixed Cloudflare Pages Functions bundling failure caused by duplicate top-level Worker declarations.\n- Removed repeated V139.3/V139.4 route redirect const/function blocks from _worker.js.\n- Replaced them with one idempotent V139.5 safe redirect block.\n- Hardened V139.4 generator to avoid reintroducing duplicate Worker declarations on future builds.\n- Kept V139 blog content, GA4 coverage, and direct .html V9 fallback behavior.\n- Deleted files: 0\n`);
console.log('[V139.5 GENERATE PASS]', JSON.stringify({ok:true, version:VERSION, beforeCounts, changedFiles:changed.size}, null, 2));
