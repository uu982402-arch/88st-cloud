import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const VERSION = 'V96_1_GUARANTEED_CARD_SCALE_ACTIVE';
const stamp = 'static-v96-1-guaranteed-card-scale-20260526';
const cssPath = 'assets/css/v96-1-guaranteed-card-scale.css';
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, data) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), data); };
const exists = p => fs.existsSync(path.join(root, p));
const css = `/* V96-1 guaranteed card scale refinement. Keeps V96 structure; only reduces card footprint and enlarges Zakum artwork. */
:root{--v96-1-shell:1020px;--v96-1-gap:10px;--v96-1-radius:16px}
.v96-1-guaranteed-card-scale .v74-1-main{padding-top:10px;padding-bottom:calc(82px + env(safe-area-inset-bottom))}
.v96-1-guaranteed-card-scale .v74-shell.v74-1-grid{width:min(var(--v96-1-shell),calc(100% - 44px));grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:var(--v96-1-gap)!important;align-items:start}
.v96-1-guaranteed-card-scale .v74-1-vendor-card{border-radius:var(--v96-1-radius);box-shadow:0 16px 46px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.07)}
.v96-1-guaranteed-card-scale .v74-1-image-link{aspect-ratio:2.18/1;margin:8px 8px 0;border-radius:13px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(246,247,249,.96))!important}
.v96-1-guaranteed-card-scale .v74-1-image-link img{object-fit:cover;object-position:center;transform:translateZ(0)}
.v96-1-guaranteed-card-scale .v74-1-card-body{padding:8px 8px 9px}
.v96-1-guaranteed-card-scale .v74-1-name-row{margin-bottom:6px;gap:6px}
.v96-1-guaranteed-card-scale .v74-1-name-row h2{font-size:clamp(13px,1.02vw,16px);line-height:1.08}
.v96-1-guaranteed-card-scale .v74-1-name-row span{min-height:22px;padding:0 7px;font-size:9px}
.v96-1-guaranteed-card-scale .v74-1-info-grid{gap:5px;margin-bottom:7px}
.v96-1-guaranteed-card-scale .v74-1-info-grid div{min-height:34px;padding:6px 8px;border-radius:11px}
.v96-1-guaranteed-card-scale .v74-1-info-grid small{font-size:9px}
.v96-1-guaranteed-card-scale .v74-1-info-grid b,.v96-1-guaranteed-card-scale .v74-1-info-grid code{font-size:11px}
.v96-1-guaranteed-card-scale .v74-1-actions{gap:6px}
.v96-1-guaranteed-card-scale .v74-1-btn{min-height:44px;border-radius:11px;font-size:11px}
.v96-1-guaranteed-card-scale .v74-1-vendor-card[data-vendor="zakum"] .v74-1-image-link img{object-fit:cover;object-position:center;filter:contrast(1.04) saturate(1.02)}
.v96-1-guaranteed-card-scale .v74-1-bridge{width:min(var(--v96-1-shell),calc(100% - 44px));padding:14px;margin-top:12px;border-radius:18px}
.v96-1-guaranteed-card-scale .v74-1-bridge b{font-size:15px}.v96-1-guaranteed-card-scale .v74-1-bridge span{font-size:11px}.v96-1-guaranteed-card-scale .v74-1-bridge a{min-height:44px;border-radius:12px}
.v96-1-guaranteed-card-scale .v54-visual-card img[data-v92-detail-image="zakum"]{object-fit:cover;object-position:center;background:#fff;filter:contrast(1.04) saturate(1.02)}
@media(min-width:1380px){.v96-1-guaranteed-card-scale .v74-shell.v74-1-grid,.v96-1-guaranteed-card-scale .v74-1-bridge{--v96-1-shell:1080px}}
@media(max-width:980px){.v96-1-guaranteed-card-scale .v74-shell.v74-1-grid{width:calc(100% - 34px);grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}.v96-1-guaranteed-card-scale .v74-1-bridge{width:calc(100% - 34px)}}
@media(max-width:720px){.v96-1-guaranteed-card-scale .v74-1-main{padding-top:10px;padding-bottom:calc(102px + env(safe-area-inset-bottom))}.v96-1-guaranteed-card-scale .v74-shell.v74-1-grid{width:calc(100% - 28px);grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.v96-1-guaranteed-card-scale .v74-1-image-link{aspect-ratio:1.72/1;margin:7px 7px 0;border-radius:12px}.v96-1-guaranteed-card-scale .v74-1-card-body{padding:7px}.v96-1-guaranteed-card-scale .v74-1-name-row{display:block;margin-bottom:6px}.v96-1-guaranteed-card-scale .v74-1-name-row h2{font-size:14px}.v96-1-guaranteed-card-scale .v74-1-name-row span{display:none}.v96-1-guaranteed-card-scale .v74-1-info-grid div{min-height:34px;padding:6px 7px;display:block}.v96-1-guaranteed-card-scale .v74-1-actions{grid-template-columns:1fr;gap:6px}.v96-1-guaranteed-card-scale .v74-1-btn{min-height:44px;font-size:11px}.v96-1-guaranteed-card-scale .v74-1-bridge{display:block;width:calc(100% - 28px);padding:13px}.v96-1-guaranteed-card-scale .v74-1-bridge a{width:100%;justify-content:center;margin-top:10px}}
@media(max-width:360px){.v96-1-guaranteed-card-scale .v74-shell.v74-1-grid{width:calc(100% - 22px);gap:7px!important}.v96-1-guaranteed-card-scale .v74-1-image-link{aspect-ratio:1.6/1;margin:6px 6px 0}.v96-1-guaranteed-card-scale .v74-1-card-body{padding:6px}.v96-1-guaranteed-card-scale .v74-1-btn{min-height:42px;font-size:10.5px}.v96-1-guaranteed-card-scale .v74-1-info-grid b,.v96-1-guaranteed-card-scale .v74-1-info-grid code{font-size:10.5px}}
`;
function ensureHead(html) {
  html = html.replace(/<meta name="v96-1-guaranteed-card-scale" content="[^"]*">\s*/g, '');
  html = html.replace(/<link rel="stylesheet" href="\/assets\/css\/v96-1-guaranteed-card-scale\.css[^>]*>\s*/g, '');
  return html.replace('</head>', `  <meta name="v96-1-guaranteed-card-scale" content="${VERSION}">\n  <link rel="stylesheet" href="/${cssPath}?v=${stamp}" data-v96-1-guaranteed-scale="true">\n</head>`);
}
function markBody(html) {
  if (html.includes('class="')) {
    html = html.replace(/<body([^>]*)class="([^"]*)"/, (m, before, cls) => `<body${before}class="${Array.from(new Set(`${cls} v96-1-guaranteed-card-scale`.trim().split(/\s+/))).join(' ')}"`);
  } else {
    html = html.replace('<body', '<body class="v96-1-guaranteed-card-scale"');
  }
  html = html.replace(/<body([^>]*)data-v96-1-guaranteed-scale="[^"]*"/, '<body$1');
  html = html.replace('<body', `<body data-v96-1-guaranteed-scale="${VERSION}"`);
  return html;
}
function cleanBridge(html) {
  return html.replace(/6개 보증업체 카드에서\s*6개 보증업체 카드에서/g, '6개 보증업체 카드에서');
}
function touch(file) {
  if (!exists(file)) return false;
  let html = read(file);
  html = ensureHead(html);
  html = markBody(html);
  html = cleanBridge(html);
  write(file, html);
  return true;
}
function updatePackageScripts() {
  const p = 'package.json';
  const pkg = JSON.parse(read(p));
  const gen = 'node scripts/generate-v96-1-guaranteed-card-scale.mjs';
  const parts = String(pkg.scripts.build || '').split('&&').map(x => x.trim()).filter(Boolean).filter(x => x !== gen);
  parts.push(gen);
  pkg.scripts.build = parts.join(' && ');
  pkg.scripts.verify = 'node scripts/verify-v96-1-guaranteed-card-scale.mjs';
  pkg.scripts['quality:v96-1'] = gen;
  pkg.scripts['verify:v96-1'] = 'node scripts/verify-v96-1-guaranteed-card-scale.mjs';
  write(p, JSON.stringify(pkg, null, 2) + '\n');
}
write(cssPath, css);
for (const file of ['guaranteed/index.html','guaranteed/zakum/index.html']) touch(file);
updatePackageScripts();
write('assets/data/v96-1-guaranteed-card-scale.json', JSON.stringify({version:VERSION,generatedAt:new Date().toISOString(),changes:['guaranteed card footprint reduced','zakum image recropped larger','v96 generator output locked by v96-1 final override']}, null, 2));
console.log(`[V96-1] guaranteed card scale lock applied`);
