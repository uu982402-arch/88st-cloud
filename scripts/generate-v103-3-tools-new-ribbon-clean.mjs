import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const cssPath = path.join(ROOT, 'assets/css/v103-3-tools-new-ribbon-clean.css');
if (!fs.existsSync(cssPath)) throw new Error('missing assets/css/v103-3-tools-new-ribbon-clean.css');
const toolsPath = path.join(ROOT, 'tools/index.html');
let html = fs.readFileSync(toolsPath, 'utf8');
if (!html.includes('data-v103-3-tools-new-ribbon-clean="active"')) html = html.replace('<html ', '<html data-v103-3-tools-new-ribbon-clean="active" ');
if (!html.includes('/assets/css/v103-3-tools-new-ribbon-clean.css')) html = html.replace('</head>', '  <meta name="v103-3-tools-new-ribbon-clean" content="V103_3_TOOLS_NEW_RIBBON_HARD_CLEAN_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v103-3-tools-new-ribbon-clean.css?v=v103-3-tools-new-ribbon-clean-20260526" data-v103-3-tools-new-ribbon-clean="true">\n</head>');
if (!html.includes('data-v103-3-tools-new-ribbon-clean="true"')) html = html.replace('<body ', '<body data-v103-3-tools-new-ribbon-clean="true" ');
fs.writeFileSync(toolsPath, html);
const unifyPath = path.join(ROOT, 'assets/css/v103-1-tools-section-unify.css');
if (fs.existsSync(unifyPath)) {
  let css = fs.readFileSync(unifyPath, 'utf8');
  css = css.replace(/body\[data-v103-1-tools-unified="true"\] \.v103-unified-tool-card::after\{[^}]*\}/g, 'body[data-v103-1-tools-unified="true"] .v103-unified-tool-card::after{content:none!important;display:none!important}');
  fs.writeFileSync(unifyPath, css);
}
fs.writeFileSync(path.join(ROOT, 'build.txt'), '88ST.Cloud build V103.3 TOOLS NEW RIBBON HARD CLEAN PATCH\n2026-05-26T09:05:00.000Z\n');
fs.writeFileSync(path.join(ROOT, 'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V103.3-TOOLS-NEW-RIBBON-HARD-CLEAN-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V103.3 TOOLS NEW RIBBON HARD CLEAN PATCH';\n");
console.log('[V103.3] Tools NEW ribbon hard-clean applied');
