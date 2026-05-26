import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V101_REMOVED_ROUTE_LOCK_BUILD_HYGIENE';
const REMOVED = ['faq', 'consult-motives', 'consult-result', 'provider-updates'];
const CORE_ROUTES = ['/', '/blog/', '/tools/', '/guaranteed/', '/consult/', '/sports-check/', '/search-guides/', '/ops/', '/admin/'];
const VENDORS = ['SK 홀딩스', '자쿰', 'UDT BET', '여왕벌', '땅콩 BET', 'ANY BET'];
const cssPath = 'assets/css/v101-removed-route-lock-build-hygiene.css';
const jsPath = 'assets/js/v101-removed-route-lock-build-hygiene.js';
const genCmd = 'node scripts/generate-v101-removed-route-lock-build-hygiene.mjs';
const verifyCmd = 'node scripts/verify-v101-removed-route-lock-build-hygiene.mjs';
const metaTag = '<meta name="v101-removed-route-lock" content="V101_REMOVED_ROUTE_LOCK_BUILD_HYGIENE_ACTIVE" data-v101-removed-route-lock="true">';
const cssTag = `<link rel="stylesheet" href="/${cssPath}?v=v101-removed-route-lock-build-hygiene-20260526" data-v101-removed-route-lock="true">`;
const jsTag = `<script defer src="/${jsPath}?v=v101-removed-route-lock-build-hygiene-20260526" data-v101-removed-route-lock="true"></script>`;

function exists(p){ return fs.existsSync(path.join(ROOT,p)); }
function read(p){ return fs.readFileSync(path.join(ROOT,p), 'utf8'); }
function write(p, s){ fs.mkdirSync(path.dirname(path.join(ROOT,p)), {recursive:true}); fs.writeFileSync(path.join(ROOT,p), s); }
function rmrf(p){ fs.rmSync(path.join(ROOT,p), {recursive:true, force:true}); }
function walk(dir='.'){
  const out=[];
  const base=path.join(ROOT,dir);
  if(!fs.existsSync(base)) return out;
  for(const name of fs.readdirSync(base)){
    if(['node_modules','.git','.wrangler'].includes(name)) continue;
    const full=path.join(base,name);
    const rel=path.relative(ROOT,full).replaceAll(path.sep,'/');
    const st=fs.statSync(full);
    if(st.isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}
function replaceRemovedLinks(html){
  const map = {'faq':'/blog/','consult-motives':'/consult/','consult-result':'/consult/','provider-updates':'/guaranteed/'};
  html = html.replace(/href=(["'])\/(faq|consult-motives|consult-result|provider-updates)(?:\/[^"']*)?\1/g, (_m,q,root)=>`href=${q}${map[root]}${q}`);
  html = html.replace(/(data-href|data-url)=(["'])\/(faq|consult-motives|consult-result|provider-updates)(?:\/[^"']*)?\2/g, (_m,attr,q,root)=>`${attr}=${q}${map[root]}${q}`);
  return html;
}
function inject(html){
  if(!html.includes('data-v101-removed-route-lock')){
    html = html.includes('<head>') ? html.replace('<head>', `<head>\n  ${metaTag}`) : `${metaTag}\n${html}`;
  }
  if(!html.includes(cssPath) && html.includes('</head>')) html = html.replace('</head>', `  ${cssTag}\n</head>`);
  if(!html.includes(jsPath)){
    if(html.includes('</body>')) html = html.replace('</body>', `  ${jsTag}\n</body>`);
    else if(html.includes('</head>')) html = html.replace('</head>', `  ${jsTag}\n</head>`);
  }
  return html;
}
function cleanGuaranteed(html){
  html = html.replace(/\n\s*<section class="v96-5-conversion-rail[\s\S]*?<\/section>\s*\n/, '\n');
  html = html.replace(/\n\s*<section class="v74-shell v74-1-bridge"[\s\S]*?<\/section>\s*\n/, '\n');
  html = html.replace(/(data-v965-card="true"\s+data-v965-rank="([^"]+)"\s+data-v965-tag="([^"]+)"\s+)(?:data-v965-card="true"\s+data-v965-rank="\2"\s+data-v965-tag="\3"\s+)+/g, '$1');
  if(!html.includes('data-v101-guaranteed-clean="true"')) html = html.replace('<body', '<body data-v101-guaranteed-clean="true"');
  return html;
}
function updatePackage(){
  if(!exists('package.json')) return;
  const pkg = JSON.parse(read('package.json'));
  pkg.scripts ||= {};
  const build = pkg.scripts.build || '';
  if(!build.includes(genCmd)) pkg.scripts.build = build ? `${build} && ${genCmd}` : genCmd;
  pkg.scripts['quality:v101'] = genCmd;
  pkg.scripts['verify:v101'] = verifyCmd;
  pkg.scripts.verify = verifyCmd;
  write('package.json', JSON.stringify(pkg, null, 2) + '\n');
}

for(const r of REMOVED) rmrf(r);

write(cssPath, `/* ${VERSION} */
:root{--v101-route-lock:1}
.v96-5-conversion-rail,.v74-1-bridge[data-v101-remove="true"]{display:none!important}
a[data-v101-route-repaired="true"]{text-decoration:inherit}
.guaranteed-page[data-v101-guaranteed-clean="true"] .v96-5-conversion-rail{display:none!important}
.guaranteed-page[data-v101-guaranteed-clean="true"] .v74-1-grid{margin-top:clamp(14px,3vw,24px)!important}
body.v96-5-guaranteed-conversion .v74-1-vendor-card[data-v965-card="true"]::before,
body.v96-5-guaranteed-conversion .v74-1-vendor-card[data-v965-card="true"]::after{content:none!important;display:none!important}
`);
write(jsPath, `/* ${VERSION} */
(function(){
  var replacements=[[/^\\/faq(?:\\/|$)/,'/blog/'],[/^\\/consult-motives(?:\\/|$)/,'/consult/'],[/^\\/consult-result(?:\\/|$)/,'/consult/'],[/^\\/provider-updates(?:\\/|$)/,'/guaranteed/']];
  function repair(anchor){var href=anchor.getAttribute('href')||''; if(!href||href.indexOf('http')===0||href.indexOf('#')===0)return; for(var i=0;i<replacements.length;i++){if(replacements[i][0].test(href)){anchor.setAttribute('href',replacements[i][1]);anchor.setAttribute('data-v101-route-repaired','true');return;}}}
  document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('a[href]').forEach(repair);document.querySelectorAll('.v96-5-conversion-rail').forEach(function(el){el.setAttribute('hidden','hidden');});});
})();
`);

for(const file of walk('.').filter(f=>f.endsWith('.html'))){
  if(REMOVED.some(r=>file === r || file.startsWith(r + '/'))) continue;
  let html = read(file);
  html = replaceRemovedLinks(html);
  if(file === 'guaranteed/index.html') html = cleanGuaranteed(html);
  html = inject(html);
  write(file, html);
}

for(const sp of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']){
  if(!exists(sp)) continue;
  const kept = read(sp).split(/\r?\n/).filter(line => !REMOVED.some(r => line.includes(`https://88st.cloud/${r}`)));
  write(sp, kept.join('\n').trimEnd() + '\n');
}

if(exists('_redirects')){
  const kept = read('_redirects').split(/\r?\n/).filter(line => !REMOVED.some(r => new RegExp(`(^|\\s)/${r.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:/|\\*|\\s|$)`).test(line.trim())));
  write('_redirects', kept.join('\n').trimEnd() + '\n');
}
let robots = exists('robots.txt') ? read('robots.txt') : 'User-agent: *\nAllow: /\n';
for(const r of REMOVED){
  const line = `Disallow: /${r}/`;
  if(!robots.includes(line)) robots += (robots.endsWith('\n')?'':'\n') + line + '\n';
}
write('robots.txt', robots);
write('build.txt', '88ST_CLOUD_V101_REMOVED_ROUTE_LOCK_BUILD_HYGIENE\n');
write('assets/js/build.ver.js', "window.__BUILD_VERSION__='88ST_CLOUD_V101_REMOVED_ROUTE_LOCK_BUILD_HYGIENE';\nwindow.__BUILD_TIME__='2026-05-26T00:00:00+09:00';\n");
write('assets/data/v101-removed-route-lock-build-hygiene.json', JSON.stringify({version:VERSION, removed_routes:REMOVED, locked_routes:CORE_ROUTES, guaranteed_cards:VENDORS}, null, 2));
updatePackage();
console.log(`[${VERSION}] removed route lock applied: ${REMOVED.join(', ')}`);
