import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const version = 'v108-tools-result-ux-polish-20260527';
const page = path.join(ROOT, 'tools/index.html');
if (!fs.existsSync(page)) throw new Error('tools/index.html not found');
for (const asset of ['assets/css/v108-tools-result-ux-polish.css','assets/js/v108-tools-result-ux-polish.js']) {
  if (!fs.existsSync(path.join(ROOT, asset))) throw new Error(`missing ${asset}`);
}
let html = fs.readFileSync(page, 'utf8');
if (!html.includes('data-v108-tools-result-ux="active"')) html = html.replace(/<html([^>]*)>/, '<html$1 data-v108-tools-result-ux="active">');
if (!html.includes('/assets/css/v108-tools-result-ux-polish.css')) html = html.replace('</head>', `  <meta name="v108-tools-result-ux-polish" content="V108_TOOLS_RESULT_UX_POLISH_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v108-tools-result-ux-polish.css?v=${version}" data-v108-tools-result-ux="true">\n</head>`);
if (!html.includes('data-v108-tools-result-ux="true"')) html = html.replace(/<body([^>]*)>/, '<body$1 data-v108-tools-result-ux="true">');
if (!html.includes('/assets/js/v108-tools-result-ux-polish.js')) html = html.replace('</body>', `  <script src="/assets/js/v108-tools-result-ux-polish.js?v=${version}" defer data-v108-tools-result-ux="true"></script>\n</body>`);
fs.writeFileSync(page, html);
fs.writeFileSync(path.join(ROOT, 'build.txt'), '88ST.Cloud build V108 TOOLS RESULT UX POLISH PATCH\n2026-05-27T04:35:00.000Z\n');
fs.writeFileSync(path.join(ROOT, 'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V108-TOOLS-RESULT-UX-POLISH-PATCH-20260527';\nwindow.__RUST_BUILD_LABEL__ = 'V108 TOOLS RESULT UX POLISH PATCH';\n");
console.log('[V108] tools result UX polish applied');
