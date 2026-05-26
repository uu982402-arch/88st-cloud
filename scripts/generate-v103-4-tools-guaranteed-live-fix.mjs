import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const cssHref = '/assets/css/v103-4-tools-guaranteed-live-fix.css?v=v103-4-tools-guaranteed-live-fix-20260526';
const cssFile = path.join(ROOT, 'assets/css/v103-4-tools-guaranteed-live-fix.css');
if (!fs.existsSync(cssFile)) throw new Error('missing V103.4 css asset');
function patch(file, kind){
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return;
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('data-v103-4-tools-guaranteed-fix="active"')) html = html.replace(/<html([^>]*)>/, '<html$1 data-v103-4-tools-guaranteed-fix="active">');
  if (!html.includes('/assets/css/v103-4-tools-guaranteed-live-fix.css')) html = html.replace('</head>', `  <meta name="v103-4-tools-guaranteed-live-fix" content="V103_4_TOOLS_GUARANTEED_LIVE_FIX_ACTIVE">\n  <link rel="stylesheet" href="${cssHref}" data-v103-4-tools-guaranteed-fix="true">\n</head>`);
  if (kind === 'tools') {
    if (!html.includes('data-v103-4-tools-ribbon-clean="true"')) html = html.replace(/<body([^>]*)>/, '<body$1 data-v103-4-tools-ribbon-clean="true">');
    html = html.replaceAll('v73-tool-card v103-unified-tool-card', 'v73-tool-card');
    html = html.replaceAll('>신규 9<', '>인기 9<').replaceAll('>신규 10<', '>인기 10<').replaceAll('>신규 11<', '>인기 11<').replaceAll('>신규 12<', '>인기 12<');
  }
  if (kind === 'guaranteed') {
    if (!html.includes('data-v103-4-guaranteed-card-compact="true"')) html = html.replace(/<body([^>]*)>/, '<body$1 data-v103-4-guaranteed-card-compact="true">');
  }
  fs.writeFileSync(full, html);
}
patch('tools/index.html','tools');
patch('guaranteed/index.html','guaranteed');
fs.writeFileSync(path.join(ROOT,'build.txt'), '88ST.Cloud build V103.4 TOOLS GUARANTEED LIVE FIX\n2026-05-26T17:05:00.000Z\n');
fs.writeFileSync(path.join(ROOT,'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V103.4-TOOLS-GUARANTEED-LIVE-FIX-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V103.4 TOOLS GUARANTEED LIVE FIX';\n");
console.log('[V103.4] tools ribbon clean + guaranteed compact applied');
