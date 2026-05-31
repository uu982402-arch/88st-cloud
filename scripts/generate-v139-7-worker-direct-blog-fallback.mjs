
import fs from 'fs';
import path from 'path';
const root = process.cwd();
const p = (...x) => path.join(root, ...x);
const pagePath = p('blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html');
const fallbackPath = p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html');
const html = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf8') : fs.readFileSync(fallbackPath, 'utf8');
const worker = fs.readFileSync(p('_worker.js'), 'utf8');
if (!worker.includes('V139_7_DIRECT_BLOG_HTML')) {
  throw new Error('V139.7 worker direct blog fallback missing from _worker.js');
}
if (/(V139_4_STALE_BLOG_ROUTE_REDIRECTS|v1394StaleRouteRedirect|V139_6_SAFE_BLOG_ROUTE_REDIRECTS|v1396SafeBlogRouteRedirect)/.test(worker)) {
  throw new Error('Older duplicated route redirect symbols remain in _worker.js');
}
const indexPath = p('blog/index.html');
if (fs.existsSync(indexPath)) {
  let index = fs.readFileSync(indexPath, 'utf8');
  index = index.replaceAll('/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html', '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html');
  index = index.replaceAll('/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/', '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html');
  fs.writeFileSync(indexPath, index);
}
const report = {
  ok: true,
  version: 'V139_7_WORKER_DIRECT_BLOG_FALLBACK',
  directRoutes: [
    '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html',
    '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html',
    '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/',
    '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first'
  ],
  embeddedHtmlBytes: Buffer.byteLength(html, 'utf8'),
  changedFiles: ['_worker.js', 'package.json', 'blog/index.html']
};
fs.mkdirSync(p('reports'), { recursive: true });
fs.writeFileSync(p('reports/v139-7-worker-direct-blog-fallback-audit.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(p('V139_7_UPGRADE_REPORT.md'), `# V139-7 Worker Direct Blog Fallback\n\n- Direct worker fallback for V9 minigame blog route.\n- Avoids Cloudflare asset conflict/Internal Error by returning the canonical article HTML before ASSETS.fetch.\n- Older V139-4/V139-6 duplicate route symbols are blocked.\n`);
fs.writeFileSync(p('V139_7_PATCH_MANIFEST.json'), JSON.stringify({ version: report.version, files: report.changedFiles.concat(['scripts/generate-v139-7-worker-direct-blog-fallback.mjs','scripts/verify-v139-7-worker-direct-blog-fallback.mjs','scripts/build-v139-7-cloudflare-pages-safe.mjs','reports/v139-7-worker-direct-blog-fallback-audit.json','V139_7_UPGRADE_REPORT.md','V139_7_PATCH_MANIFEST.json','blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html']) }, null, 2));
console.log('[V139.7 GENERATE PASS]', JSON.stringify(report, null, 2));
