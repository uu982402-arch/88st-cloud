import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const compact = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const VERSION = `static-growth-conversion-v55-${compact}`;
const CSS_HREF = `/assets/css/v55.luminous-sitewide.css?v=${VERSION}`;
const JS_SRC = `/assets/js/v55.luminous-sitewide.js?v=${VERSION}`;
const skipDirs = new Set(['node_modules', '.git', '__MACOSX']);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (skipDirs.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}
function rel(p) { return path.relative(ROOT, p).replaceAll(path.sep, '/'); }
function hasNoindex(html) { return /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*noindex)/i.test(html); }
function addBodyClass(html) {
  return html.replace(/<body\b([^>]*)>/i, (m, attrs) => {
    if (/class=["'][^"']*\bv55-luminous-site\b/i.test(attrs)) return m;
    if (/class=["']/i.test(attrs)) {
      return '<body' + attrs.replace(/class=(["'])([^"']*)\1/i, (mm, q, cls) => `class=${q}${cls} v55-luminous-site${q}`) + '>';
    }
    return `<body${attrs} class="v55-luminous-site">`;
  });
}
function injectCss(html) {
  html = html.replace(/<link\b[^>]*href=["']\/assets\/css\/v55\.luminous-sitewide\.css[^>]*>\s*/gi, '');
  const tag = `<link rel="stylesheet" href="${CSS_HREF}"/>`;
  const anchor = html.match(/<link\b[^>]*href=["'][^"']*v54\.vendor-landing\.css[^>]*>/i)
    || html.match(/<link\b[^>]*href=["'][^"']*v53\.main-open-ready\.css[^>]*>/i)
    || html.match(/<link\b[^>]*href=["'][^"']*v52\.open-ready\.css[^>]*>/i)
    || html.match(/<link\b[^>]*href=["'][^"']*growth-conversion\.v36\.css[^>]*>/i);
  if (anchor) return html.replace(anchor[0], `${anchor[0]}${tag}`);
  return html.replace(/<\/head>/i, `${tag}</head>`);
}
function injectJs(html) {
  html = html.replace(/<script\b[^>]*src=["']\/assets\/js\/v55\.luminous-sitewide\.js[^>]*>\s*<\/script>\s*/gi, '');
  const tag = `<script defer src="${JS_SRC}"></script>`;
  return html.replace(/<\/body>/i, `${tag}</body>`);
}
function refreshCacheVersion(html) {
  return html.replace(/static-growth-conversion-v\d+-[^"'&<>\s]+/g, VERSION);
}

const htmls = walk(ROOT);
let updated = 0;
let indexable = 0;
const sample = [];
for (const file of htmls) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  html = refreshCacheVersion(html);
  html = addBodyClass(html);
  html = injectCss(html);
  html = injectJs(html);
  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    updated++;
    if (sample.length < 24) sample.push(rel(file));
  }
  if (!hasNoindex(html)) indexable++;
}
const audit = {
  version: 'v55-luminous-sitewide-design',
  cacheVersion: VERSION,
  updatedHtml: updated,
  totalHtml: htmls.length,
  indexableHtml: indexable,
  css: 'assets/css/v55.luminous-sitewide.css',
  js: 'assets/js/v55.luminous-sitewide.js',
  mode: 'sitewide visual renewal only; existing routes, posts, tools and vendor functions preserved',
  sampleUpdated: sample,
  generatedAt: new Date().toISOString()
};
fs.mkdirSync(path.join(ROOT, 'assets/data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'assets/data/v55.luminous.audit.json'), JSON.stringify(audit, null, 2) + '\n', 'utf8');

// Keep final build version aligned with the current V55 layer even when older generators rewrote gen-build-ver.mjs.
const genBuildFile = path.join(ROOT, 'scripts/gen-build-ver.mjs');
if (fs.existsSync(genBuildFile)) {
  const src = fs.readFileSync(genBuildFile, 'utf8').replace(/static-growth-conversion-v\d+-/g, 'static-growth-conversion-v55-');
  fs.writeFileSync(genBuildFile, src, 'utf8');
}
const packageFile = path.join(ROOT, 'package.json');
if (fs.existsSync(packageFile)) {
  const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  const v55 = 'node scripts/generate-v55-luminous-sitewide-design.mjs';
  if (!pkg.scripts.build.includes('generate-v55-luminous-sitewide-design.mjs')) {
    if (pkg.scripts.build.includes('node scripts/generate-v54-vendor-landing-design.mjs')) {
      pkg.scripts.build = pkg.scripts.build.replace('node scripts/generate-v54-vendor-landing-design.mjs', 'node scripts/generate-v54-vendor-landing-design.mjs && ' + v55);
    } else {
      pkg.scripts.build = pkg.scripts.build.replace('node scripts/generate-v43-quality-data.mjs', v55 + ' && node scripts/generate-v43-quality-data.mjs');
    }
  }
  pkg.scripts['quality:v55'] = v55;
  fs.writeFileSync(packageFile, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

console.log(`V55 luminous sitewide design applied to ${updated}/${htmls.length} HTML files.`);
