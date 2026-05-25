import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MARKER = 'V93_TOOLS_USABILITY_PASS_ACTIVE';
const toolsPath = path.join(ROOT, 'tools', 'index.html');
const cssPath = path.join(ROOT, 'assets', 'css', 'v93-tools-usability-pass.css');
const jsPath = path.join(ROOT, 'assets', 'js', 'v93-tools-usability-pass.js');
const dataPath = path.join(ROOT, 'assets', 'data', 'v93-tools-usability-pass.json');

function ensureFile(file, label) {
  if (!fs.existsSync(file)) throw new Error(`[V93] missing ${label}: ${path.relative(ROOT, file)}`);
}
function injectBefore(text, marker, insert) {
  if (text.includes(insert.trim())) return text;
  if (!text.includes(marker)) throw new Error(`[V93] marker not found: ${marker}`);
  return text.replace(marker, `${insert}\n${marker}`);
}
function removeDuplicateV93(text) {
  text = text.replace(/\n\s*<link[^>]+v93-tools-usability-pass\.css[^>]*>/g, '');
  text = text.replace(/\n\s*<script[^>]+v93-tools-usability-pass\.js[^>]*><\/script>/g, '');
  text = text.replace(/\s*data-v93-tools-usability="true"/g, '');
  text = text.replace(/\s*data-v93-build-marker="V93_TOOLS_USABILITY_PASS_ACTIVE"/g, '');
  text = text.replace(/\s*<!-- V93_TOOLS_USABILITY_PASS_ACTIVE -->/g, '');
  return text;
}

ensureFile(toolsPath, 'tools page');
ensureFile(cssPath, 'V93 css');
ensureFile(jsPath, 'V93 js');
ensureFile(dataPath, 'V93 data');

let html = fs.readFileSync(toolsPath, 'utf8');
html = removeDuplicateV93(html);

if (!html.includes('data-v73-tools-page="true"')) {
  throw new Error('[V93] tools page is not the V73 dashboard expected by V93');
}
html = html.replace(/<body([^>]*)>/, (m, attrs) => {
  return `<body${attrs} data-v93-tools-usability="true" data-v93-build-marker="${MARKER}">`;
});
html = injectBefore(html, '</head>', '  <link rel="stylesheet" href="/assets/css/v93-tools-usability-pass.css?v=static-v93-tools-usability-20260525" data-v93-tools-usability="true">');
html = injectBefore(html, '</body>', '  <!-- V93_TOOLS_USABILITY_PASS_ACTIVE -->\n  <script src="/assets/js/v93-tools-usability-pass.js?v=static-v93-tools-usability-20260525" defer data-v93-tools-usability="true"></script>');

fs.writeFileSync(toolsPath, html);

// Keep package scripts locked to V93 after older generators rewrite package.json.
const pkgPath = path.join(ROOT, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  let build = String(pkg.scripts.build || '');
  const ordered = [
    'generate-v83-schema-structured-data.mjs',
    'generate-v84-performance-optimization.mjs',
    'generate-v90-blog-quality-pass.mjs',
    'generate-v91-hub-content-depth.mjs',
    'generate-v93-tools-usability-pass.mjs'
  ];
  for (const script of ordered) {
    build = build.replace(new RegExp('\\s*&&\\s*node scripts/' + script.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'g'), '');
  }
  const insertAfter = 'node scripts/generate-v82-3-indexing-measurement.mjs';
  const early = ['generate-v83-schema-structured-data.mjs','generate-v84-performance-optimization.mjs'];
  if (build.includes(insertAfter)) {
    build = build.replace(insertAfter, `${insertAfter} && ${early.map(s => 'node scripts/' + s).join(' && ')}`);
  } else {
    build += ' && ' + early.map(s => 'node scripts/' + s).join(' && ');
  }
  const insertBefore = 'node scripts/generate-v92-vendor-conversion-pass.mjs';
  const late = ['generate-v90-blog-quality-pass.mjs','generate-v91-hub-content-depth.mjs'];
  if (build.includes(insertBefore)) {
    build = build.replace(insertBefore, `${late.map(s => 'node scripts/' + s).join(' && ')} && ${insertBefore}`);
  } else {
    build += ' && ' + late.map(s => 'node scripts/' + s).join(' && ');
  }
  build += ' && node scripts/generate-v93-tools-usability-pass.mjs';
  pkg.scripts.build = build;
  pkg.scripts.verify = 'node scripts/verify-v93-tools-usability-pass.mjs';
  pkg.scripts['quality:v93'] = 'node scripts/generate-v93-tools-usability-pass.mjs';
  pkg.scripts['verify:v93'] = 'node scripts/verify-v93-tools-usability-pass.mjs';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

console.log(`[V93] tools usability pass generated: ${MARKER}`);
