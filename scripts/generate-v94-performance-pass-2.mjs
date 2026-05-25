import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const VERSION = 'V94_PERFORMANCE_PASS_2_ACTIVE';
const REPORT_PATH = path.join(ROOT, 'assets', 'data', 'v94-performance-pass-2.json');

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

function rel(file) { return path.relative(ROOT, file).replace(/\\/g, '/'); }
function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, content) { fs.writeFileSync(file, content); }
function bytes(file) { return fs.existsSync(file) ? fs.statSync(file).size : 0; }
function normalizeUrl(value) { return String(value || '').split('#')[0].split('?')[0].trim(); }
function isExternal(src) { return /^https?:\/\//i.test(src) || /^\/\//.test(src) || /^data:/i.test(src) || /^mailto:/i.test(src) || /^tel:/i.test(src); }
function localPathFromUrl(src) {
  const clean = normalizeUrl(src);
  if (!clean || isExternal(clean)) return null;
  const noSlash = clean.startsWith('/') ? clean.slice(1) : clean;
  const file = path.join(ROOT, noSlash);
  return fs.existsSync(file) ? file : null;
}

function ensurePackageScripts() {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts = pkg.scripts || {};
  const generate = 'node scripts/generate-v94-performance-pass-2.mjs';
  const verify = 'node scripts/verify-v94-performance-pass-2.mjs';
  if (!String(pkg.scripts.build || '').includes(generate)) {
    const current = String(pkg.scripts.build || '').trim();
    pkg.scripts.build = current ? `${current} && ${generate}` : generate;
  }
  pkg.scripts.verify = verify;
  pkg.scripts['quality:v94'] = generate;
  pkg.scripts['verify:v94'] = verify;
  write(pkgPath, JSON.stringify(pkg, null, 2));
}

function readImageSize(file) {
  try {
    const buf = fs.readFileSync(file);
    const ext = path.extname(file).toLowerCase();
    if (ext === '.png' && buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG') {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), type: 'png' };
    }
    if ((ext === '.jpg' || ext === '.jpeg') && buf[0] === 0xff && buf[1] === 0xd8) {
      let offset = 2;
      while (offset < buf.length) {
        if (buf[offset] !== 0xff) break;
        const marker = buf[offset + 1];
        const len = buf.readUInt16BE(offset + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7), type: 'jpeg' };
        }
        offset += 2 + len;
      }
    }
    if (ext === '.webp' && buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const chunk = buf.toString('ascii', 12, 16);
      if (chunk === 'VP8X' && buf.length >= 30) {
        const width = 1 + buf.readUIntLE(24, 3);
        const height = 1 + buf.readUIntLE(27, 3);
        return { width, height, type: 'webp' };
      }
      if (chunk === 'VP8 ' && buf.length >= 30) {
        const start = 20;
        const width = buf.readUInt16LE(start + 6) & 0x3fff;
        const height = buf.readUInt16LE(start + 8) & 0x3fff;
        return { width, height, type: 'webp' };
      }
      if (chunk === 'VP8L' && buf.length >= 25) {
        const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + ((b3 << 6) | (b2 >> 2) | ((b1 & 0xc0) << 6));
        return { width, height, type: 'webp' };
      }
    }
    if (ext === '.svg') {
      const text = buf.toString('utf8').slice(0, 2000);
      const width = (text.match(/\bwidth=["']([0-9.]+)/i) || [])[1];
      const height = (text.match(/\bheight=["']([0-9.]+)/i) || [])[1];
      if (width && height) return { width: Math.round(Number(width)), height: Math.round(Number(height)), type: 'svg' };
      const vb = (text.match(/viewBox=["'][^"']*?\s([0-9.]+)\s([0-9.]+)["']/i) || []);
      if (vb[1] && vb[2]) return { width: Math.round(Number(vb[1])), height: Math.round(Number(vb[2])), type: 'svg' };
    }
  } catch (error) {}
  return null;
}

function markHtml(html, fileReport) {
  if (html.includes('data-v94-performance="active"')) return html;
  if (!/<html\b/i.test(html)) return html;
  fileReport.markerAdded = true;
  return html.replace(/<html\b([^>]*)>/i, (m, attrs) => {
    if (/data-v94-performance=/i.test(attrs)) return m;
    return `<html${attrs} data-v94-performance="active">`;
  });
}

function removeDuplicateTags(html, fileReport) {
  const seenCss = new Set();
  html = html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, (tag) => {
    const href = normalizeUrl((tag.match(/\bhref=["']([^"']+)["']/i) || [])[1] || '');
    if (!href) return tag;
    if (seenCss.has(href)) {
      fileReport.duplicateStylesheetTagsRemoved += 1;
      fileReport.duplicateStylesheetHrefs.push(href);
      return '';
    }
    seenCss.add(href);
    return tag;
  });

  const seenJs = new Set();
  html = html.replace(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi, (tag, src) => {
    const key = normalizeUrl(src);
    if (!key) return tag;
    if (seenJs.has(key)) {
      fileReport.duplicateScriptTagsRemoved += 1;
      fileReport.duplicateScriptSrcs.push(key);
      return '';
    }
    seenJs.add(key);
    return tag;
  });
  return html;
}

function ensureScriptAttrs(html, fileReport) {
  return html.replace(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi, (tag, before, src, after) => {
    const local = !isExternal(src);
    if (!local) return tag;
    if (/\b(async|defer)\b/i.test(tag) || /type=["']module["']/i.test(tag)) return tag;
    fileReport.deferAdded += 1;
    return tag.replace(/<script\b/i, '<script defer');
  });
}

function ensureImageAttrs(html, fileReport) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let next = tag;
    const src = (tag.match(/\bsrc=["']([^"']+)["']/i) || [])[1] || '';
    const local = localPathFromUrl(src);
    const isLogo = /rust-crest|favicon|apple-touch-icon|icon-192|icon-512/i.test(src);
    const isPartnerHero = /\/assets\/img\/partners\/|\/assets\/img\/guaranteed\/cards\//i.test(src);

    if (!/\bdecoding=/i.test(next)) {
      next = next.replace(/>$/, ' decoding="async">');
      fileReport.decodingAdded += 1;
    }
    if (!/\bloading=/i.test(next)) {
      const mode = isLogo ? 'eager' : 'lazy';
      next = next.replace(/>$/, ` loading="${mode}">`);
      fileReport.loadingAdded += 1;
    }
    if ((isLogo || isPartnerHero) && !/\bfetchpriority=/i.test(next)) {
      const priority = isLogo ? 'high' : 'low';
      next = next.replace(/>$/, ` fetchpriority="${priority}">`);
      fileReport.fetchPriorityAdded += 1;
    }
    if (local && (!/\bwidth=/i.test(next) || !/\bheight=/i.test(next))) {
      const size = readImageSize(local);
      if (size && size.width > 0 && size.height > 0) {
        if (!/\bwidth=/i.test(next)) {
          next = next.replace(/>$/, ` width="${size.width}">`);
          fileReport.widthHeightAdded += 1;
        }
        if (!/\bheight=/i.test(next)) {
          next = next.replace(/>$/, ` height="${size.height}">`);
          fileReport.widthHeightAdded += 1;
        }
      }
    }
    return next;
  });
}

function ensureHeadHints(html, fileReport) {
  if (!/<head[\s>]/i.test(html)) return html;
  const hints = [];
  const required = [
    ['preconnect', 'https://www.googletagmanager.com', 'crossorigin'],
    ['dns-prefetch', '//www.googletagmanager.com', ''],
    ['preconnect', 'https://www.google-analytics.com', 'crossorigin'],
    ['dns-prefetch', '//www.google-analytics.com', '']
  ];
  for (const [rel, href, extra] of required) {
    const needle = new RegExp(`rel=["']${rel}["'][^>]+${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    if (!needle.test(html)) {
      hints.push(`<link rel="${rel}" href="${href}"${extra ? ' ' + extra : ''} data-v94-performance="hint">`);
    }
  }
  if (!hints.length) return html;
  fileReport.resourceHintsAdded += hints.length;
  return html.replace(/<head([^>]*)>/i, `<head$1>\n  ${hints.join('\n  ')}`);
}

function ensureV94Critical(html, fileReport) {
  if (html.includes('data-v94-critical="true"')) return html;
  const style = '<style data-v94-critical="true">html{background:#06090f;color-scheme:dark}body{min-width:320px;overflow-x:hidden;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}img{max-width:100%;height:auto}a,button{touch-action:manipulation}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}</style>';
  if (!/<\/head>/i.test(html)) return html;
  fileReport.criticalAdded = true;
  return html.replace(/<\/head>/i, `  ${style}\n</head>`);
}

function collectReferences(files) {
  const text = files.map((file) => {
    try { return read(file); } catch { return ''; }
  }).join('\n');
  return text;
}

function collectAssetAudit(htmlFiles, codeFiles) {
  const imageFiles = walk(path.join(ROOT, 'assets'), (file) => /\.(png|jpe?g|webp|gif|svg)$/i.test(file));
  const cssFiles = walk(path.join(ROOT, 'assets', 'css'), (file) => file.endsWith('.css'));
  const jsFiles = walk(path.join(ROOT, 'assets', 'js'), (file) => file.endsWith('.js'));
  const allRefs = collectReferences([...htmlFiles, ...codeFiles]);

  const images = imageFiles.map((file) => {
    const r = rel(file);
    const size = readImageSize(file);
    const b = bytes(file);
    const directRef = allRefs.includes('/' + r) || allRefs.includes(r) || allRefs.includes(path.basename(file));
    return { path: r, bytes: b, kb: Math.round(b / 1024), dimensions: size || null, directReferenceDetected: directRef };
  }).sort((a, b) => b.bytes - a.bytes);

  const css = cssFiles.map((file) => {
    const r = rel(file); const b = bytes(file);
    return { path: r, bytes: b, kb: Math.round(b / 1024), directReferenceDetected: allRefs.includes('/' + r) || allRefs.includes(r) || allRefs.includes(path.basename(file)) };
  }).sort((a, b) => b.bytes - a.bytes);

  const js = jsFiles.map((file) => {
    const r = rel(file); const b = bytes(file);
    return { path: r, bytes: b, kb: Math.round(b / 1024), directReferenceDetected: allRefs.includes('/' + r) || allRefs.includes(r) || allRefs.includes(path.basename(file)) };
  }).sort((a, b) => b.bytes - a.bytes);

  return {
    counts: { images: images.length, css: css.length, js: js.length },
    largeImagesOver300KB: images.filter((item) => item.bytes > 300 * 1024),
    pngJpgOver180KB: images.filter((item) => /\.(png|jpe?g)$/i.test(item.path) && item.bytes > 180 * 1024),
    largestImages: images.slice(0, 40),
    largestCss: css.slice(0, 30),
    largestJs: js.slice(0, 30),
    unusedAssetCandidates: [...css, ...js, ...images].filter((item) => !item.directReferenceDetected).slice(0, 250).map((item) => ({ ...item, reason: 'no direct HTML/script reference detected; do not delete until generator dependency is checked' }))
  };
}

function collectHtmlLoadingAudit(htmlFiles) {
  const pages = [];
  for (const file of htmlFiles) {
    const html = read(file);
    const cssRefs = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => normalizeUrl(m[1]));
    const jsRefs = [...html.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi)].map((m) => normalizeUrl(m[1]));
    const v84CriticalCount = (html.match(/data-v84-critical=/g) || []).length;
    const v94CriticalCount = (html.match(/data-v94-critical=/g) || []).length;
    pages.push({
      page: rel(file),
      cssRefs: cssRefs.length,
      uniqueCssRefs: new Set(cssRefs).size,
      jsRefs: jsRefs.length,
      uniqueJsRefs: new Set(jsRefs).size,
      v84CriticalCount,
      v94CriticalCount,
      criticalOverInsertionRisk: v84CriticalCount + v94CriticalCount > 2
    });
  }
  return {
    pagesWithManyCssRefs: pages.filter((p) => p.cssRefs >= 10).slice(0, 100),
    pagesWithManyJsRefs: pages.filter((p) => p.jsRefs >= 8).slice(0, 100),
    pagesWithCriticalOverInsertionRisk: pages.filter((p) => p.criticalOverInsertionRisk).slice(0, 100)
  };
}

ensurePackageScripts();

const htmlFiles = walk(ROOT, (file) => file.endsWith('.html'));
const codeFiles = walk(ROOT, (file) => /\.(mjs|js|css|json|xml|txt)$/i.test(file));
const totals = {
  htmlFiles: htmlFiles.length,
  changedHtml: 0,
  duplicateStylesheetTagsRemoved: 0,
  duplicateScriptTagsRemoved: 0,
  loadingAdded: 0,
  decodingAdded: 0,
  fetchPriorityAdded: 0,
  widthHeightAdded: 0,
  deferAdded: 0,
  resourceHintsAdded: 0,
  criticalAdded: 0,
  markerAdded: 0
};
const changedPages = [];

for (const file of htmlFiles) {
  const before = read(file);
  const fileReport = {
    page: rel(file),
    duplicateStylesheetTagsRemoved: 0,
    duplicateStylesheetHrefs: [],
    duplicateScriptTagsRemoved: 0,
    duplicateScriptSrcs: [],
    loadingAdded: 0,
    decodingAdded: 0,
    fetchPriorityAdded: 0,
    widthHeightAdded: 0,
    deferAdded: 0,
    resourceHintsAdded: 0,
    criticalAdded: false,
    markerAdded: false
  };
  let html = before;
  html = removeDuplicateTags(html, fileReport);
  html = ensureHeadHints(html, fileReport);
  html = ensureImageAttrs(html, fileReport);
  html = ensureScriptAttrs(html, fileReport);
  html = ensureV94Critical(html, fileReport);
  html = markHtml(html, fileReport);
  if (html !== before) {
    write(file, html);
    totals.changedHtml += 1;
    changedPages.push(fileReport);
  }
  for (const key of ['duplicateStylesheetTagsRemoved','duplicateScriptTagsRemoved','loadingAdded','decodingAdded','fetchPriorityAdded','widthHeightAdded','deferAdded','resourceHintsAdded']) {
    totals[key] += fileReport[key] || 0;
  }
  totals.criticalAdded += fileReport.criticalAdded ? 1 : 0;
  totals.markerAdded += fileReport.markerAdded ? 1 : 0;
}

const report = {
  version: VERSION,
  generatedAt: new Date().toISOString(),
  summary: totals,
  assetAudit: collectAssetAudit(htmlFiles, codeFiles),
  htmlLoadingAudit: collectHtmlLoadingAudit(htmlFiles),
  changedPages: changedPages.slice(0, 120),
  deletionPolicy: 'No files were deleted in V94. Candidates are audit-only until direct references and generator dependencies are verified.'
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
write(REPORT_PATH, JSON.stringify(report, null, 2));
console.log(`[V94] performance pass 2 applied. html=${totals.htmlFiles} changed=${totals.changedHtml} defer=${totals.deferAdded} imgAttrs=${totals.loadingAdded + totals.decodingAdded + totals.widthHeightAdded} duplicateCss=${totals.duplicateStylesheetTagsRemoved} duplicateJs=${totals.duplicateScriptTagsRemoved}`);
