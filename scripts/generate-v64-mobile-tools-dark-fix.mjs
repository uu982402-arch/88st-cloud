import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const VERSION = 'static-growth-conversion-v64';
const cssHref = `/assets/css/v64.mobile-tools-dark-fix.css?v=${VERSION}`;
const jsSrc = `/assets/js/v64.mobile-tools-dark-fix.js?v=${VERSION}`;
function walk(dir, out=[]) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules','.git','__MACOSX'].includes(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
function addBodyClass(html) {
  if (/<body\b[^>]*class=/i.test(html)) {
    return html.replace(/<body\b([^>]*?)class=["']([^"']*)["']([^>]*)>/i, (m,a,c,b)=>{
      const set = new Set(c.split(/\s+/).filter(Boolean));
      set.add('v64-mobile-tools-dark-fix');
      return `<body${a}class="${Array.from(set).join(' ')}"${b}>`;
    });
  }
  return html.replace(/<body\b([^>]*)>/i, '<body$1 class="v64-mobile-tools-dark-fix">');
}
function injectHead(html) {
  html = html.replace(/<link[^>]+v64\.mobile-tools-dark-fix\.css[^>]*>\s*/gi, '');
  const tag = `<link rel="stylesheet" href="${cssHref}" data-v64-mobile-tools-dark-fix="true">`;
  return html.includes('</head>') ? html.replace('</head>', `${tag}</head>`) : tag + html;
}
function injectBody(html) {
  html = html.replace(/<script[^>]+v64\.mobile-tools-dark-fix\.js[^>]*><\/script>\s*/gi, '');
  const tag = `<script src="${jsSrc}" defer data-v64-mobile-tools-dark-fix="true"></script>`;
  return html.includes('</body>') ? html.replace('</body>', `${tag}</body>`) : html + tag;
}
function normalizeBottomLabels(html) {
  return html
    .replace(/>가이드<\/span><small>블로그<\/small>/g, '>블로그</span><small>블로그</small>')
    .replace(/>업체<\/span><small>보증업체<\/small>/g, '>보증</span><small>보증업체</small>')
    .replace(/\['\/blog\/',\s*'가이드',\s*'블로그'\]/g, "['/blog/','블로그','블로그']")
    .replace(/\['\/guaranteed\/',\s*'업체',\s*'보증업체'\]/g, "['/guaranteed/','보증','보증업체']");
}
const files = walk(ROOT);
const htmls = files.filter(f => f.endsWith('.html'));
let changed = 0;
for (const f of htmls) {
  let html = fs.readFileSync(f, 'utf8');
  const before = html;
  html = normalizeBottomLabels(html);
  html = addBodyClass(injectBody(injectHead(html)));
  if (html !== before) { fs.writeFileSync(f, html, 'utf8'); changed++; }
}
// Normalize old app dashboard JS nav labels if present.
const v58 = path.join(ROOT, 'assets/js/v58.app-dashboard.js');
if (fs.existsSync(v58)) {
  let js = fs.readFileSync(v58, 'utf8');
  js = js.replace(/\['\/blog\/',\s*'가이드',\s*'블로그'\]/g, "['/blog/','블로그','블로그']");
  js = js.replace(/\['\/guaranteed\/',\s*'업체',\s*'보증업체'\]/g, "['/guaranteed/','보증','보증업체']");
  fs.writeFileSync(v58, js, 'utf8');
}
const audit = {
  version: VERSION,
  generatedAt: new Date().toISOString(),
  htmlScanned: htmls.length,
  htmlUpdated: changed,
  fixes: [
    'mobile bottom nav labels: guide->blog, vendor->guaranteed',
    'tools bright pastel card override to dark readable cards',
    'provider card image fit to section area',
    'compact title guard kept'
  ]
};
fs.mkdirSync(path.join(ROOT, 'assets/data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'assets/data/v64.mobile-tools-dark-fix.audit.json'), JSON.stringify(audit, null, 2) + '\n', 'utf8');
const genBuildPath = path.join(ROOT, 'scripts/gen-build-ver.mjs');
if (fs.existsSync(genBuildPath)) {
  let gen = fs.readFileSync(genBuildPath, 'utf8');
  gen = gen.replace(/static-growth-conversion-v\d+-\$\{compact\}/g, 'static-growth-conversion-v64-${compact}');
  fs.writeFileSync(genBuildPath, gen, 'utf8');
}
console.log(`V64 mobile tools dark fix applied: ${changed}/${htmls.length} HTML files`);
