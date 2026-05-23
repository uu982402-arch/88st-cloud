#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-growth-conversion-v59';
const CSS = `/assets/css/v59.vendor-logo-system.css?v=${VERSION}`;
const JS = `/assets/js/v59.vendor-logo-system.js?v=${VERSION}`;

const vendors = [
  { slug:'queenbee', name:'여왕벌', alt:'여왕벌 통일 카드 로고', svg:'/assets/vendor-logos/v59/queenbee-card.svg', first:'여왕', second:'벌', firstRed:true, secondRed:false },
  { slug:'sk-holdings', name:'SK 홀딩스', alt:'SK 홀딩스 통일 카드 로고', svg:'/assets/vendor-logos/v59/sk-holdings-card.svg', first:'SK', second:'홀딩스', firstRed:true, secondRed:false },
  { slug:'anybet', name:'ANYBET', alt:'ANYBET 통일 카드 로고', svg:'/assets/vendor-logos/v59/anybet-card.svg', first:'ANY', second:'BET', firstRed:false, secondRed:true },
  { slug:'udt', name:'UDT BET', alt:'UDT BET 통일 카드 로고', svg:'/assets/vendor-logos/v59/udt-card.svg', first:'UDT', second:'BET', firstRed:false, secondRed:true },
  { slug:'ddangkong', name:'땅콩 BET', alt:'땅콩 BET 통일 카드 로고', svg:'/assets/vendor-logos/v59/ddangkong-card.svg', first:'땅콩', second:'BET', firstRed:false, secondRed:true }
];

const oldMap = new Map([
  ['/assets/provider-media/queenbee-logo-clean-v22.png','/assets/vendor-logos/v59/queenbee-card.svg'],
  ['/assets/provider-media/queenbee-logo-transparent-v14.png','/assets/vendor-logos/v59/queenbee-card.svg'],
  ['/assets/provider-media/queenbee-logo-v13.png','/assets/vendor-logos/v59/queenbee-card.svg'],
  ['/assets/provider-media/queenbee-logo.svg','/assets/vendor-logos/v59/queenbee-card.svg'],
  ['/assets/provider-media/sk-holdings-logo.png','/assets/vendor-logos/v59/sk-holdings-card.svg'],
  ['/assets/provider-media/anybet-logo.png','/assets/vendor-logos/v59/anybet-card.svg'],
  ['/assets/provider-media/udt-logo-transparent-v14.png','/assets/vendor-logos/v59/udt-card.svg'],
  ['/assets/provider-media/udt-logo.webp','/assets/vendor-logos/v59/udt-card.svg'],
  ['/assets/provider-media/ddangkong-logo-v19.png','/assets/vendor-logos/v59/ddangkong-card.svg']
]);
const removalCandidates = [
  'assets/provider-media/queenbee-logo-clean-v22.png',
  'assets/provider-media/queenbee-logo-transparent-v14.png',
  'assets/provider-media/queenbee-logo-v13.png',
  'assets/provider-media/queenbee-logo.svg',
  'assets/provider-media/sk-holdings-logo.png',
  'assets/provider-media/anybet-logo.png',
  'assets/provider-media/udt-logo-transparent-v14.png',
  'assets/provider-media/udt-logo.webp',
  'assets/provider-media/ddangkong-logo-v19.png'
];

function write(file, content){ const p=path.join(ROOT,file); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,content,'utf8'); }
function read(file){ return fs.readFileSync(path.join(ROOT,file),'utf8'); }
function walk(dir, acc=[]){ for(const name of fs.readdirSync(dir)){ if(['node_modules','.git','__MACOSX'].includes(name)) continue; const p=path.join(dir,name); const st=fs.statSync(p); if(st.isDirectory()) walk(p,acc); else acc.push(p); } return acc; }
function rel(p){ return path.relative(ROOT,p).replaceAll(path.sep,'/'); }
function xml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c])); }
function svgFor(v){
  const firstSize = /[가-힣]/.test(v.first) ? 31 : 39;
  const secondSize = /[가-힣]/.test(v.second) ? 28 : 34;
  const twoLine = v.second === 'BET';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="${xml(v.alt)}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="34%" r="68%"><stop offset="0" stop-color="#202632"/><stop offset="0.56" stop-color="#07090d"/><stop offset="1" stop-color="#000"/></radialGradient>
    <linearGradient id="ring" x1="42" y1="34" x2="198" y2="208"><stop offset="0" stop-color="#8893a7" stop-opacity=".70"/><stop offset=".52" stop-color="#252b36"/><stop offset="1" stop-color="#ef1d2f" stop-opacity=".54"/></linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#000" flood-opacity=".68"/><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#fff" flood-opacity=".15"/></filter>
  </defs>
  <circle cx="120" cy="120" r="112" fill="url(#bg)" stroke="url(#ring)" stroke-width="3" filter="url(#shadow)"/>
  <circle cx="120" cy="120" r="99" fill="none" stroke="#fff" stroke-opacity=".05"/>
  <g font-family="Inter, Pretendard, Noto Sans KR, Arial, sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="central" letter-spacing="-1.2" paint-order="stroke" stroke="#07090d" stroke-width="3">
    <text x="120" y="${twoLine?108:108}" font-size="${firstSize}" fill="${v.firstRed?'#ef1d2f':'#f8fafc'}">${xml(v.first)}</text>
    <text x="120" y="${twoLine?148:145}" font-size="${secondSize}" fill="${v.secondRed?'#ef1d2f':'#f8fafc'}">${xml(v.second)}</text>
  </g>
  <path d="M70 184h100" stroke="#ef1d2f" stroke-width="3" stroke-linecap="round" opacity=".72"/>
</svg>`;
}
function addCssJsAndBody(html){
  html=html.replace(/<link[^>]+v59\.vendor-logo-system\.css[^>]*>/g,'');
  html=html.replace(/<script[^>]+v59\.vendor-logo-system\.js[^>]*><\/script>/g,'');
  html=html.replace('</head>', `<link rel="stylesheet" href="${CSS}"/></head>`);
  html=html.replace('</body>', `<script src="${JS}" defer></script></body>`);
  html=html.replace(/<body(?![^>]*v59-vendor-logo-system)([^>]*)>/i,(m,attrs)=>/class\s*=/.test(attrs)?m.replace(/class=["']([^"']*)["']/,(_,c)=>`class="${c} v59-vendor-logo-system"`):`<body${attrs} class="v59-vendor-logo-system">`);
  return html;
}
function replaceOldPaths(text){
  for(const [oldPath,newPath] of oldMap){
    text=text.split(oldPath).join(newPath);
    text=text.split(oldPath.replace(/^\//,'')).join(newPath.replace(/^\//,''));
  }
  return text;
}
function img(v){ return `<img class="v59-provider-logo-img" src="${v.svg}" alt="${v.alt}" width="240" height="240" loading="lazy" decoding="async"/>`; }

for(const v of vendors) write(v.svg.replace(/^\//,''), svgFor(v));
write('assets/css/v59.vendor-logo-system.css', `/* V59 Vendor Logo Unification & Asset Cleanup */
:root{--v59-red:#ef1d2f;--v59-white:#f8fafc;--v59-card:#05070b;--v59-line:rgba(255,255,255,.12)}
.v59-vendor-logo-system .v58-provider-avatar,.v59-vendor-logo-system .v57-provider-logo-frame,.v59-vendor-logo-system .v50-provider-mini-card img,.v59-vendor-logo-system .v54-visual-card{background:radial-gradient(circle at 50% 32%,rgba(255,255,255,.10),rgba(239,29,47,.06) 34%,#020306 72%)!important;border:1px solid rgba(255,255,255,.13)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 18px 44px rgba(0,0,0,.42),0 0 0 1px rgba(239,29,47,.07)!important;}
.v59-vendor-logo-system .v58-provider-avatar{overflow:hidden;display:grid;place-items:center;color:transparent!important;padding:0!important;min-width:64px!important;width:64px!important;height:64px!important;border-radius:999px!important;}
.v59-vendor-logo-system .v58-provider-avatar .v59-provider-logo-img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;}
.v59-vendor-logo-system .v57-provider-logo-frame{display:grid!important;place-items:center!important;overflow:hidden!important;border-radius:22px!important;}
.v59-vendor-logo-system .v57-provider-logo-frame img{width:min(78%,188px)!important;height:auto!important;aspect-ratio:1/1!important;object-fit:contain!important;border-radius:999px!important;background:#020306!important;box-shadow:0 0 0 1px rgba(255,255,255,.10),0 12px 32px rgba(0,0,0,.45)!important;}
.v59-vendor-logo-system .v50-provider-mini-card img{width:86px!important;height:86px!important;object-fit:cover!important;border-radius:999px!important;padding:0!important;}
.v59-vendor-logo-system .v54-visual-card{min-height:160px!important;display:grid!important;place-items:center!important;overflow:hidden!important;}
.v59-vendor-logo-system .v54-visual-card img{width:min(220px,66vw)!important;height:auto!important;aspect-ratio:1/1!important;object-fit:contain!important;border-radius:999px!important;background:#020306!important;box-shadow:0 0 0 1px rgba(255,255,255,.10),0 18px 44px rgba(0,0,0,.48)!important;}
@media (max-width:768px){.v59-vendor-logo-system .v58-provider-avatar{width:58px!important;height:58px!important;min-width:58px!important}.v59-vendor-logo-system .v54-visual-card{min-height:132px!important}.v59-vendor-logo-system .v57-provider-logo-frame img{width:min(74%,150px)!important}}
`);
write('assets/js/v59.vendor-logo-system.js', `(()=>{const mark='v59VendorLogoSystem';if(window[mark])return;window[mark]=true;document.querySelectorAll('img[src*="/assets/vendor-logos/v59/"]').forEach(img=>{img.addEventListener('error',()=>{const p=img.parentElement;if(p){p.classList.add('v58-image-fallback');p.dataset.v58Fallback=img.alt?.replace(/\\s*통일.*$/,'')||'88ST';}img.remove();},{once:true});});})();\n`);

const files=walk(ROOT);
for(const file of files){
  const r=rel(file);
  if(r==='scripts/generate-v59-vendor-logo-system.mjs') continue;
  if(!/\.(html|css|js|mjs|json|xml|txt)$/i.test(file)) continue;
  let s=fs.readFileSync(file,'utf8'); const before=s;
  s=replaceOldPaths(s);
  if(file.endsWith('.html')){
    s=addCssJsAndBody(s);
    if(r==='index.html'){
      const map={QB:vendors[0],SK:vendors[1],AB:vendors[2],UDT:vendors[3],DK:vendors[4]};
      for(const [label,v] of Object.entries(map)) s=s.replace(new RegExp(`<span class="v58-provider-avatar" aria-hidden="true">${label}<\\/span>`,'g'), `<span class="v58-provider-avatar v59-provider-logo-pill" aria-hidden="true">${img(v)}</span>`);
    }
  }
  if(s!==before) fs.writeFileSync(file,s,'utf8');
}

const v49Data=path.join(ROOT,'assets/data/v49.guaranteed.vendors.json');
if(fs.existsSync(v49Data)){
  const data=JSON.parse(fs.readFileSync(v49Data,'utf8'));
  for(const item of data.vendors||[]){ const v=vendors.find(x=>x.slug===item.slug); if(v){ item.originalImage=item.originalImage||item.image; item.image=v.svg; item.logoSystem='v59-red-white-svg'; } }
  data.version='V59'; data.logoSystem='red-white-unified-card-svg'; data.updatedAt=new Date().toISOString();
  fs.writeFileSync(v49Data,JSON.stringify(data,null,2),'utf8');
}

const allRuntimeText=walk(ROOT).filter(f=>/\.(html|css|js|mjs|json|xml|txt)$/i.test(f) && rel(f)!=='scripts/generate-v59-vendor-logo-system.mjs' && rel(f)!=='assets/data/v59.vendor-logo-system.audit.json').map(f=>fs.readFileSync(f,'utf8')).join('\n');
const removed=[]; const kept=[]; const alreadyAbsent=[];
for(const candidate of removalCandidates){ const abs=path.join(ROOT,candidate); if(!fs.existsSync(abs)){alreadyAbsent.push(candidate); continue;} const ref1='/'+candidate, ref2=candidate; if(allRuntimeText.includes(ref1)||allRuntimeText.includes(ref2)){kept.push({path:candidate,reason:'still referenced'}); continue;} const bytes=fs.statSync(abs).size; fs.unlinkSync(abs); removed.push({path:candidate,bytes}); }
write('assets/data/v59.vendor-logo-system.audit.json', JSON.stringify({version:'V59',name:'Vendor Logo Unification & Asset Cleanup',logoRule:'black circular SVG, white typography, red accent',vendors:vendors.map(v=>({slug:v.slug,name:v.name,svg:v.svg})),removedAssets:removed,alreadyAbsentAssets:alreadyAbsent,keptCandidates:kept,generatedAt:new Date().toISOString()},null,2));

const pkgPath=path.join(ROOT,'package.json');
if(fs.existsSync(pkgPath)){ const pkg=JSON.parse(fs.readFileSync(pkgPath,'utf8')); if(!pkg.scripts.build.includes('generate-v59-vendor-logo-system.mjs')) pkg.scripts.build=pkg.scripts.build.replace('node scripts/generate-v58-app-dashboard.mjs && node scripts/generate-v43-quality-data.mjs','node scripts/generate-v58-app-dashboard.mjs && node scripts/generate-v59-vendor-logo-system.mjs && node scripts/generate-v43-quality-data.mjs'); if(fs.existsSync(path.join(ROOT,'scripts/generate-v60-open-ready-finalization.mjs')) && !pkg.scripts.build.includes('generate-v60-open-ready-finalization.mjs')) pkg.scripts.build=pkg.scripts.build.replace('node scripts/generate-v59-vendor-logo-system.mjs && node scripts/generate-v43-quality-data.mjs','node scripts/generate-v59-vendor-logo-system.mjs && node scripts/generate-v60-open-ready-finalization.mjs && node scripts/generate-v43-quality-data.mjs'); pkg.scripts['quality:v59']='node scripts/generate-v59-vendor-logo-system.mjs'; if(fs.existsSync(path.join(ROOT,'scripts/generate-v60-open-ready-finalization.mjs'))) pkg.scripts['quality:v60']='node scripts/generate-v60-open-ready-finalization.mjs'; fs.writeFileSync(pkgPath,JSON.stringify(pkg,null,2)+'\n','utf8'); }
const genBuild=path.join(ROOT,'scripts/gen-build-ver.mjs');
if(fs.existsSync(genBuild)){ let g=fs.readFileSync(genBuild,'utf8').replace(/static-growth-conversion-v\d+-/g,'static-growth-conversion-v59-'); fs.writeFileSync(genBuild,g,'utf8'); }
function patchVerify(){ const vf=path.join(ROOT,'scripts/verify-v36.mjs'); if(!fs.existsSync(vf)) return; let s=fs.readFileSync(vf,'utf8'); s=s.replace(`for (const img of ['queenbee-logo-clean-v22.png','sk-holdings-logo.png','anybet-logo.png','udt-logo-transparent-v14.png','ddangkong-logo-v19.png']) {\n      if (!g.includes(img)) fail(errors, 'V57 missing provider image ' + img);\n      if (!fs.existsSync(path.join(ROOT, 'assets/provider-media', img))) fail(errors, 'V57 provider image asset missing ' + img);\n    }`,`for (const img of ['queenbee-card.svg','sk-holdings-card.svg','anybet-card.svg','udt-card.svg','ddangkong-card.svg']) {\n      if (!g.includes(img)) fail(errors, 'V57/V59 missing unified provider image ' + img);\n      if (!fs.existsSync(path.join(ROOT, 'assets/vendor-logos/v59', img))) fail(errors, 'V57/V59 unified provider image asset missing ' + img);\n    }`); if(!s.includes('V59 vendor logo system checks')){ const block=`\n\n// V59 vendor logo system checks\n{\n  const css = path.join(ROOT, 'assets/css/v59.vendor-logo-system.css');\n  const js = path.join(ROOT, 'assets/js/v59.vendor-logo-system.js');\n  const audit = path.join(ROOT, 'assets/data/v59.vendor-logo-system.audit.json');\n  const logos = ['queenbee-card.svg','sk-holdings-card.svg','anybet-card.svg','udt-card.svg','ddangkong-card.svg'];\n  if (!fs.existsSync(css)) fail(errors, 'V59 vendor logo CSS missing');\n  if (!fs.existsSync(js)) fail(errors, 'V59 vendor logo JS missing');\n  if (!fs.existsSync(audit)) fail(errors, 'V59 vendor logo audit missing');\n  for (const logo of logos) {\n    const fp = path.join(ROOT, 'assets/vendor-logos/v59', logo);\n    if (!fs.existsSync(fp)) fail(errors, 'V59 unified SVG logo missing: ' + logo);\n    else if (!/<svg/i.test(read(fp))) fail(errors, 'V59 logo is not SVG: ' + logo);\n  }\n  const runtimePages = ['index.html','guaranteed/index.html','tools/index.html','guaranteed/queenbee/index.html','guaranteed/sk-holdings/index.html','guaranteed/anybet/index.html','guaranteed/udt/index.html','guaranteed/ddangkong/index.html'];\n  for (const route of runtimePages) {\n    const fp = path.join(ROOT, route);\n    if (!fs.existsSync(fp)) continue;\n    const txt = read(fp);\n    if (!/v59-vendor-logo-system/.test(txt)) fail(errors, 'V59 body class missing ' + route);\n    if (!/v59\\.vendor-logo-system\\.css/.test(txt)) fail(errors, 'V59 CSS link missing ' + route);\n    if (!/v59\\.vendor-logo-system\\.js/.test(txt)) fail(errors, 'V59 JS link missing ' + route);\n  }\n  const guaranteed = path.join(ROOT, 'guaranteed/index.html');\n  if (fs.existsSync(guaranteed)) {\n    const g = read(guaranteed);\n    for (const logo of logos) if (!g.includes('/assets/vendor-logos/v59/' + logo)) fail(errors, 'V59 guaranteed missing logo reference ' + logo);\n    for (const old of ['queenbee-logo-clean-v22.png','sk-holdings-logo.png','anybet-logo.png','udt-logo-transparent-v14.png','ddangkong-logo-v19.png']) if (g.includes(old)) fail(errors, 'V59 old provider logo leaked in guaranteed ' + old);\n  }\n  const home = path.join(ROOT, 'index.html');\n  if (fs.existsSync(home)) {\n    const h = read(home);\n    if ((h.match(/v59-provider-logo-img/g)||[]).length < 5) fail(errors, 'V59 home unified logo count failed');\n  }\n  const tools = path.join(ROOT, 'tools/index.html');\n  if (fs.existsSync(tools)) {\n    const t = read(tools);\n    for (const logo of logos) if (!t.includes('/assets/vendor-logos/v59/' + logo)) fail(errors, 'V59 tools missing logo reference ' + logo);\n  }\n}\n// END V59 vendor logo system checks\n`; s=s.replace('\nconst result = {', block+'\nconst result = {'); } fs.writeFileSync(vf,s,'utf8'); }
patchVerify();
console.log('V59 vendor logo system generated', JSON.stringify({removed:removed.length, alreadyAbsent:alreadyAbsent.length, kept:kept.length}));
