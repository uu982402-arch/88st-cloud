import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v82-1-structure-ga4-20260525';
const MARKER = 'V82_1_STRUCTURE_GA4_ACTIVE';
const GA_ID = 'G-KWT87FBY6S';
const JS_HREF = `/assets/js/v82.ga4-events.js?v=${VERSION}`;
const CSS_HREF = `/assets/css/v82.structure-guard.css?v=${VERSION}`;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function stripLegacyGa(html) {
  let next = html;
  next = next.replace(/<script\b[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"']+["'][^>]*>\s*<\/script>/gi, '');
  next = next.replace(/<script\b[^>]*>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];[\s\S]*?gtag\(['"]config['"][\s\S]*?<\/script>/gi, '');
  return next;
}

function upsertHead(html, fileRel) {
  let next = stripLegacyGa(html);
  const isPrivate = /^(ops|admin)\//.test(fileRel);

  next = next.replace(/<meta\s+name=["']v82-1-structure-ga4["'][^>]*>\s*/gi, '');
  next = next.replace(/<meta\s+name=["']rust-ga4-id["'][^>]*>\s*/gi, '');
  next = next.replace(/<link\b[^>]*v82\.structure-guard\.css[^>]*>\s*/gi, '');
  next = next.replace(/<script\b[^>]*v82\.ga4-events\.js[^>]*>\s*<\/script>\s*/gi, '');

  const parts = [
    `  <meta name="v82-1-structure-ga4" content="${MARKER}">`
  ];

  if (!isPrivate) {
    parts.push(`  <meta name="rust-ga4-id" content="${GA_ID}">`);
    parts.push(`  <link rel="stylesheet" href="${CSS_HREF}" data-v82-structure-guard="true">`);
    parts.push(`  <script defer src="${JS_HREF}" data-v82-ga4-events="true"></script>`);
  }

  const block = `${parts.join('\n')}\n`;
  if (/<\/head>/i.test(next)) {
    return next.replace(/<\/head>/i, `${block}</head>`);
  }
  return `${block}${next}`;
}

function ensureNoindex(fileRel, html) {
  if (!/^(ops|admin)\//.test(fileRel)) return html;
  let next = html;
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(next)) {
    next = next.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,nofollow,noarchive">');
  } else {
    next = next.replace(/<head[^>]*>/i, '$&\n  <meta name="robots" content="noindex,nofollow,noarchive">');
  }
  return next;
}

function ensureRobots() {
  const file = path.join(ROOT, 'robots.txt');
  let body = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : 'User-agent: *\nAllow: /\n';
  if (!/Sitemap:\s*https:\/\/88st\.cloud\/sitemap\.xml/i.test(body)) {
    body = body.trimEnd() + '\nSitemap: https://88st.cloud/sitemap.xml\n';
  }
  fs.writeFileSync(file, body, 'utf8');
}

function updatePackage() {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const generate = 'node scripts/generate-v82-1-structure-ga4.mjs';
  const verify = 'node scripts/verify-v82-1-structure-ga4.mjs';
  const chain = String(pkg.scripts?.build || '')
    .split('&&')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item !== generate);
  chain.push(generate);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = chain.join(' && ');
  pkg.scripts.verify = verify;
  pkg.scripts['quality:v82-1'] = generate;
  pkg.scripts['verify:v82-1'] = verify;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

let touched = 0;
for (const file of walk(ROOT)) {
  const fileRel = rel(file);
  let html = fs.readFileSync(file, 'utf8');
  const updated = ensureNoindex(fileRel, upsertHead(html, fileRel));
  if (updated !== html) {
    fs.writeFileSync(file, updated, 'utf8');
    touched += 1;
  }
}

ensureRobots();
updatePackage();

console.log(`[V82-1] structure guard + GA4 applied. html=${walk(ROOT).length} touched=${touched} ga4=${GA_ID}`);
