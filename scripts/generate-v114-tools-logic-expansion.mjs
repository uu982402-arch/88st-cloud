import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const toolsPath = path.join(ROOT, 'tools/index.html');
if (!fs.existsSync(toolsPath)) throw new Error('tools/index.html missing');
let html = fs.readFileSync(toolsPath, 'utf8');
if (!html.includes('data-v114-tools-logic="active"')) html = html.replace(/<html([^>]*)>/, '<html$1 data-v114-tools-logic="active">');
if (!html.includes('data-v114-tools-logic="true"')) html = html.replace(/<body([^>]*)>/, '<body$1 data-v114-tools-logic="true">');
if (!html.includes('/assets/css/v114-tools-logic-expansion.css')) {
  html = html.replace('</head>', '  <meta name="v114-tools-logic-expansion" content="V114_TOOLS_LOGIC_EXPANSION_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v114-tools-logic-expansion.css?v=v114-tools-logic-expansion-20260527" data-v114-tools-logic="true">\n</head>');
}
if (!html.includes('/assets/js/v114-tools-logic-expansion.js')) {
  html = html.replace('</body>', '  <script src="/assets/js/v114-tools-logic-expansion.js?v=v114-tools-logic-expansion-20260527" defer data-v114-tools-logic="true"></script>\n</body>');
}
fs.writeFileSync(toolsPath, html);
fs.writeFileSync(path.join(ROOT, 'build.txt'), '88ST.Cloud build V114 TOOLS LOGIC EXPANSION PATCH\n2026-05-27T00:00:00.000Z\n');
fs.writeFileSync(path.join(ROOT, 'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V114-TOOLS-LOGIC-EXPANSION-PATCH-20260527';\nwindow.__RUST_BUILD_LABEL__ = 'V114 TOOLS LOGIC EXPANSION PATCH';\n");
console.log('[V114] tools logic expansion applied');
