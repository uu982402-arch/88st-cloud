import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mustExist = [
  'assets/css/v96-3-mobile-safe-layout.css',
  'assets/js/v96-3-mobile-safe-layout.js',
  'scripts/generate-v96-3-mobile-safe-layout.mjs'
];
const criticalHtml = [
  'index.html',
  'blog/index.html',
  'tools/index.html',
  'guaranteed/index.html',
  'guaranteed/sk-holdings/index.html',
  'guaranteed/udt/index.html',
  'guaranteed/queenbee/index.html',
  'guaranteed/ddangkong/index.html',
  'guaranteed/anybet/index.html',
  'guaranteed/zakum/index.html',
  'consult/index.html',
  'sports-check/index.html',
  'search-guides/index.html',
  'ops/index.html'
];
const errors = [];
for (const file of mustExist) if (!fs.existsSync(path.join(root, file))) errors.push(`missing file: ${file}`);
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (!pkg.scripts?.build?.includes('generate-v96-3-mobile-safe-layout.mjs')) errors.push('package build missing V96.3 generator');
if (!pkg.scripts?.verify?.includes('verify-v96-3-mobile-safe-layout.mjs')) errors.push('package verify is not V96.3 verifier');

const css = fs.readFileSync(path.join(root, 'assets/css/v96-3-mobile-safe-layout.css'), 'utf8');
for (const token of ['overflow-x:hidden', '100dvh', 'viewport', 'clamp(184px,46vw,236px)', 'env(safe-area-inset-bottom', 'object-fit:contain', 'grid-template-columns:repeat(2,minmax(0,1fr))']) {
  if (!css.includes(token)) errors.push(`css missing token: ${token}`);
}
const js = fs.readFileSync(path.join(root, 'assets/js/v96-3-mobile-safe-layout.js'), 'utf8');
for (const token of ['visualViewport', 'v96-3-chrome-web', 'orientationchange', '--v96-3-js-vw']) {
  if (!js.includes(token)) errors.push(`js missing token: ${token}`);
}
for (const file of criticalHtml) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) { errors.push(`missing critical html: ${file}`); continue; }
  const html = fs.readFileSync(full, 'utf8');
  if (!html.includes('data-v96-3-mobile-safe-layout="true"')) errors.push(`${file}: missing V96.3 assets`);
  if (!/viewport-fit=cover/.test(html)) errors.push(`${file}: missing viewport-fit=cover`);
  if (!/v96-3-mobile-safe-layout/.test(html)) errors.push(`${file}: missing body class`);
}
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!index.includes('v71-partner-carousel')) errors.push('index: partner carousel missing');
if (!index.includes('v71-blog-grid')) errors.push('index: blog grid missing');
const guaranteed = fs.readFileSync(path.join(root, 'guaranteed/index.html'), 'utf8');
for (const vendor of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']) {
  if (!guaranteed.includes(vendor)) errors.push(`guaranteed index missing vendor: ${vendor}`);
}
if (errors.length) {
  console.error('[V96.3 verify failed]');
  for (const err of errors) console.error('-', err);
  process.exit(1);
}
console.log('[V96.3 verify ok] mobile safe layout patch verified');
