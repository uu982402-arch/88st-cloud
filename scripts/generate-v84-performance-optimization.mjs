import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const VERSION = 'V84_PERFORMANCE_OPTIMIZATION_ACTIVE';
const REPORT_PATH = path.join(ROOT, 'assets', 'data', 'v84-performance-audit.json');

function walk(dir, predicate = () => true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, predicate));
    else if (entry.isFile() && predicate(full)) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content);
}

function ensurePackageScripts() {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts = pkg.scripts || {};
  const generate = 'node scripts/generate-v84-performance-optimization.mjs';
  const verify = 'node scripts/verify-v84-performance-optimization.mjs';
  if (!String(pkg.scripts.build || '').includes(generate)) {
    pkg.scripts.build = String(pkg.scripts.build || '').trim();
    pkg.scripts.build = pkg.scripts.build ? `${pkg.scripts.build} && ${generate}` : generate;
  }
  pkg.scripts.verify = verify;
  pkg.scripts['quality:v84'] = generate;
  pkg.scripts['verify:v84'] = verify;
  write(pkgPath, JSON.stringify(pkg, null, 2));
}

function normalizeHref(href) {
  return String(href || '').split('#')[0].trim();
}

function removeDuplicateStylesheets(html, fileReport) {
  const seen = new Set();
  return html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, (tag) => {
    const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1] || '';
    const key = normalizeHref(href);
    if (!key) return tag;
    if (seen.has(key)) {
      fileReport.duplicateStylesheetTagsRemoved += 1;
      fileReport.duplicateStylesheetHrefs.push(key);
      return '';
    }
    seen.add(key);
    return tag;
  });
}

function ensureImagePerfAttrs(html, fileReport) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let next = tag;
    const src = (tag.match(/\bsrc=["']([^"']+)["']/i) || [])[1] || '';
    const isRustLogo = /\/assets\/img\/rust\/rust-crest|rust-crest|favicon|apple-touch-icon/i.test(src);
    const isAboveFoldPartner = /\/assets\/img\/partners\/v71-sk-holdings/i.test(src);

    if (!/\bdecoding=/i.test(next)) {
      next = next.replace(/>$/, ' decoding="async">');
      fileReport.imagesDecodingAdded += 1;
    }

    if (!/\bloading=/i.test(next)) {
      const loading = isRustLogo || isAboveFoldPartner ? 'eager' : 'lazy';
      next = next.replace(/>$/, ` loading="${loading}">`);
      fileReport.imagesLoadingAdded += 1;
    }

    if ((isRustLogo || isAboveFoldPartner) && !/\bfetchpriority=/i.test(next)) {
      next = next.replace(/>$/, ' fetchpriority="high">');
      fileReport.imagesFetchPriorityAdded += 1;
    }

    return next;
  });
}

function ensureLocalScriptDefer(html, fileReport) {
  return html.replace(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)>/gi, (match, before, src, after) => {
    if (/\b(async|defer)\b/i.test(match)) return match;
    if (/^https?:\/\//i.test(src) || /^\/\//.test(src)) return match;
    fileReport.scriptDeferAdded += 1;
    return match.replace(/<script\b/i, '<script defer');
  });
}

function ensurePreconnects(html, fileReport) {
  if (!/<head[\s>]/i.test(html)) return html;
  const inserts = [];
  if (!/rel=["']preconnect["'][^>]+googletagmanager\.com/i.test(html)) {
    inserts.push('<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin data-v84-performance="preconnect">');
    fileReport.preconnectsAdded += 1;
  }
  if (!/rel=["']dns-prefetch["'][^>]+googletagmanager\.com/i.test(html)) {
    inserts.push('<link rel="dns-prefetch" href="//www.googletagmanager.com" data-v84-performance="dns-prefetch">');
    fileReport.preconnectsAdded += 1;
  }
  if (!inserts.length) return html;
  return html.replace(/<head([^>]*)>/i, `<head$1>\n  ${inserts.join('\n  ')}`);
}

function ensureCriticalStyle(html, fileReport) {
  if (html.includes('data-v84-critical="true"')) return html;
  const style = `<style data-v84-critical="true">html{background:#06090f;color-scheme:dark}body{min-width:320px;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}img{max-width:100%;height:auto}iframe,video{max-width:100%}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}</style>`;
  if (/<\/head>/i.test(html)) {
    fileReport.criticalStyleAdded = true;
    return html.replace(/<\/head>/i, `  ${style}\n</head>`);
  }
  return html;
}

function markHtml(html, fileReport) {
  if (html.includes('data-v84-performance="active"')) return html;
  if (/<html\b/i.test(html)) {
    fileReport.markerAdded = true;
    return html.replace(/<html\b([^>]*)>/i, (m, attrs) => {
      if (/data-v84-performance=/i.test(attrs)) return m;
      return `<html${attrs} data-v84-performance="active">`;
    });
  }
  return html;
}

function collectAssetStats() {
  const assetFiles = walk(path.join(ROOT, 'assets'), (file) => /\.(png|jpe?g|webp|gif|svg|css|js)$/i.test(file));
  const images = [];
  const css = [];
  const js = [];
  for (const file of assetFiles) {
    const stat = fs.statSync(file);
    const item = { path: rel(file), bytes: stat.size };
    if (/\.(png|jpe?g|webp|gif|svg)$/i.test(file)) images.push(item);
    if (/\.css$/i.test(file)) css.push(item);
    if (/\.js$/i.test(file)) js.push(item);
  }
  images.sort((a, b) => b.bytes - a.bytes);
  css.sort((a, b) => b.bytes - a.bytes);
  js.sort((a, b) => b.bytes - a.bytes);
  return {
    imageCount: images.length,
    cssCount: css.length,
    jsCount: js.length,
    largeImagesOver250KB: images.filter((item) => item.bytes > 250 * 1024),
    largestImages: images.slice(0, 25),
    largestCss: css.slice(0, 20),
    largestJs: js.slice(0, 20)
  };
}

function collectCssReferenceStats(htmlFiles) {
  const hrefCount = new Map();
  const pageRefs = [];
  for (const file of htmlFiles) {
    const html = read(file);
    const hrefs = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)].map((m) => normalizeHref(m[1]));
    const unique = [...new Set(hrefs)];
    pageRefs.push({ page: rel(file), stylesheetCount: hrefs.length, uniqueStylesheetCount: unique.length });
    for (const href of unique) hrefCount.set(href, (hrefCount.get(href) || 0) + 1);
  }
  const globalRefs = [...hrefCount.entries()].map(([href, count]) => ({ href, pages: count })).sort((a, b) => b.pages - a.pages || a.href.localeCompare(b.href));
  return { globalRefs, pagesWithManyStylesheets: pageRefs.filter((p) => p.stylesheetCount >= 9).slice(0, 80) };
}

function collectUnusedCandidateStats(htmlFiles) {
  const htmlAll = htmlFiles.map((file) => read(file)).join('\n');
  const candidates = [];
  const cssFiles = walk(path.join(ROOT, 'assets', 'css'), (file) => file.endsWith('.css'));
  const jsFiles = walk(path.join(ROOT, 'assets', 'js'), (file) => file.endsWith('.js'));
  for (const file of [...cssFiles, ...jsFiles]) {
    const r = '/' + rel(file);
    const base = path.basename(file);
    if (!htmlAll.includes(r) && !htmlAll.includes(rel(file)) && !htmlAll.includes(base)) {
      candidates.push({ path: rel(file), reason: 'no direct HTML reference detected; verify generator dependency before deletion' });
    }
  }
  return candidates.slice(0, 200);
}

ensurePackageScripts();

const htmlFiles = walk(ROOT, (file) => file.endsWith('.html'));
const totals = {
  htmlFiles: htmlFiles.length,
  changedHtml: 0,
  duplicateStylesheetTagsRemoved: 0,
  imagesLoadingAdded: 0,
  imagesDecodingAdded: 0,
  imagesFetchPriorityAdded: 0,
  scriptDeferAdded: 0,
  preconnectsAdded: 0,
  criticalStyleAdded: 0,
  markerAdded: 0
};
const changedPages = [];

for (const file of htmlFiles) {
  const before = read(file);
  const fileReport = {
    page: rel(file),
    duplicateStylesheetTagsRemoved: 0,
    duplicateStylesheetHrefs: [],
    imagesLoadingAdded: 0,
    imagesDecodingAdded: 0,
    imagesFetchPriorityAdded: 0,
    scriptDeferAdded: 0,
    preconnectsAdded: 0,
    criticalStyleAdded: false,
    markerAdded: false
  };

  let html = before;
  html = removeDuplicateStylesheets(html, fileReport);
  html = ensurePreconnects(html, fileReport);
  html = ensureImagePerfAttrs(html, fileReport);
  html = ensureLocalScriptDefer(html, fileReport);
  html = ensureCriticalStyle(html, fileReport);
  html = markHtml(html, fileReport);

  if (html !== before) {
    write(file, html);
    totals.changedHtml += 1;
    changedPages.push(fileReport);
  }
  totals.duplicateStylesheetTagsRemoved += fileReport.duplicateStylesheetTagsRemoved;
  totals.imagesLoadingAdded += fileReport.imagesLoadingAdded;
  totals.imagesDecodingAdded += fileReport.imagesDecodingAdded;
  totals.imagesFetchPriorityAdded += fileReport.imagesFetchPriorityAdded;
  totals.scriptDeferAdded += fileReport.scriptDeferAdded;
  totals.preconnectsAdded += fileReport.preconnectsAdded;
  totals.criticalStyleAdded += fileReport.criticalStyleAdded ? 1 : 0;
  totals.markerAdded += fileReport.markerAdded ? 1 : 0;
}

const report = {
  version: VERSION,
  generatedAt: new Date().toISOString(),
  summary: totals,
  assetAudit: collectAssetStats(),
  cssReferenceAudit: collectCssReferenceStats(htmlFiles),
  cleanupCandidates: collectUnusedCandidateStats(htmlFiles),
  changedPages: changedPages.slice(0, 80)
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
write(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(`[V84] performance optimization applied. html=${totals.htmlFiles} changed=${totals.changedHtml} lazy=${totals.imagesLoadingAdded} defer=${totals.scriptDeferAdded} duplicateCssRemoved=${totals.duplicateStylesheetTagsRemoved}`);
