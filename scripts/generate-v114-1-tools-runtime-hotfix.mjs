import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const jsPath = path.join(ROOT, 'assets/js/v114-tools-logic-expansion.js');
const htmlPath = path.join(ROOT, 'tools/index.html');
let js = fs.readFileSync(jsPath, 'utf8');
js = js.replace(/  var observer = new MutationObserver\([\s\S]*?observer\.observe\(document\.body, \{ childList:true, subtree:true \}\);\n/g, '');
js = js.replace(/panel\.innerHTML = buildPanel\(data\);/g, `var nextHtml = buildPanel(data);
    if (panel.getAttribute('data-v114-html') === nextHtml) return;
    panel.setAttribute('data-v114-html', nextHtml);
    panel.innerHTML = nextHtml;`);
if (!js.includes('V114.1 hotfix')) {
  js = js.replace(/\}\)\(\);\s*$/, `  /* V114.1 hotfix: MutationObserver 반복 갱신 제거. */\n})();`);
}
fs.writeFileSync(jsPath, js);
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/v114-tools-logic-expansion\.js\?v=[^"]+/g, 'v114-tools-logic-expansion.js?v=v114-1-tools-runtime-hotfix-20260527');
if (!html.includes('v114-1-tools-runtime-hotfix')) {
  html = html.replace('</head>', '  <meta name="v114-1-tools-runtime-hotfix" content="V114_1_TOOLS_RUNTIME_HOTFIX_ACTIVE">\\n</head>');
}
if (!html.includes('data-v114-1-tools-runtime-hotfix="active"')) {
  html = html.replace('<html ', '<html data-v114-1-tools-runtime-hotfix="active" ');
}
fs.writeFileSync(htmlPath, html);
fs.writeFileSync(path.join(ROOT, 'build.txt'), '88ST.Cloud build V114.1 TOOLS RUNTIME HOTFIX\\n2026-05-27T00:00:00.000Z\\n');
fs.writeFileSync(path.join(ROOT, 'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V114.1-TOOLS-RUNTIME-HOTFIX-20260527';\\nwindow.__RUST_BUILD_LABEL__ = 'V114.1 TOOLS RUNTIME HOTFIX';\\n");
console.log('[V114.1] tools runtime hotfix applied');
