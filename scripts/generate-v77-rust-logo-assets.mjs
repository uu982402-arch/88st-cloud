import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const VERSION = 'static-v77-rust-logo-assets-20260524';
const CSS = `/assets/css/v77.rust-logo-assets.css?v=${VERSION}`;
const JS = `/assets/js/v77.rust-logo-assets.js?v=${VERSION}`;
const MARK = '/assets/img/rust/rust-crest-192.png';

function updatePackageScripts(){
  const pkgPath = path.join(ROOT,'package.json');
  if(!fs.existsSync(pkgPath)) return false;
  const pkg = JSON.parse(fs.readFileSync(pkgPath,'utf8'));
  pkg.scripts = pkg.scripts || {};
  const v76Build = 'node scripts/generate-v76-rust-brand-system.mjs';
  const v77Build = 'node scripts/generate-v77-rust-logo-assets.mjs';
  const genBuild = 'node scripts/gen-build-ver.mjs';
  let build = pkg.scripts.build || '';
  build = build.replace(/\s*&&\s*node scripts\/generate-v76-rust-brand-system\.mjs/g,'');
  build = build.replace(/\s*&&\s*node scripts\/generate-v77-rust-logo-assets\.mjs/g,'');
  if(build.includes(genBuild)) build = build.replace(genBuild, `${v76Build} && ${v77Build} && ${genBuild}`);
  else if(build.trim()) build = `${build} && ${v76Build} && ${v77Build}`;
  else build = `${v76Build} && ${v77Build}`;
  pkg.scripts.build = build;
  pkg.scripts.verify = 'node scripts/verify-v77-rust-logo-assets.mjs';
  pkg.scripts['quality:v77'] = v77Build;
  pkg.scripts['verify:v77'] = 'node scripts/verify-v77-rust-logo-assets.mjs';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg,null,2)+'\n');
  return true;
}

const OG = 'https://88st.cloud/assets/img/rust/rust-og.jpg';
const ICONS = `
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/rust/rust-crest-32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#06090F">
  <meta property="og:image" content="${OG}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:image" content="${OG}">
  <link rel="preload" as="image" href="${MARK}" imagesrcset="/assets/img/rust/rust-crest-96.png 96w, /assets/img/rust/rust-crest-192.png 192w" data-v77-rust-logo="true">
  <link rel="stylesheet" href="${CSS}" data-v77-rust-logo="true">`;

function walk(dir){
  const out=[];
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(['node_modules','.git'].includes(ent.name)) continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) out.push(...walk(p));
    else if(ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}
function rel(p){return path.relative(ROOT,p).replaceAll('\\','/');}
function stripOldHead(html){
  const patterns = [
    /<link[^>]+rel=["'][^"']*(?:shortcut\s+icon|icon)[^"']*["'][^>]*>\s*/ig,
    /<link[^>]+rel=["']apple-touch-icon["'][^>]*>\s*/ig,
    /<link[^>]+rel=["']manifest["'][^>]*>\s*/ig,
    /<link[^>]+href=["'][^"']*apple-touch-icon[^"']*["'][^>]*>\s*/ig,
    /<meta\s+name=["']theme-color["'][^>]*>\s*/ig,
    /<meta\s+property=["']og:image(?::width|:height)?["'][^>]*>\s*/ig,
    /<meta\s+name=["']twitter:image["'][^>]*>\s*/ig,
    /<link\s+rel=["']preload["'][^>]*(?:logo-v24|rust-crest|v77-rust-logo)[^>]*>\s*/ig,
    /<link\s+rel=["']stylesheet["'][^>]*v77\.rust-logo-assets\.css[^>]*>\s*/ig,
    /<script[^>]*v77\.rust-logo-assets\.js[^>]*><\/script>\s*/ig
  ];
  for(const re of patterns) html = html.replace(re,'');
  return html;
}
function injectHead(html){
  html = stripOldHead(html);
  if(/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${ICONS}\n</head>`);
  return html;
}
function injectBody(html){
  html = html.replaceAll('/assets/img/rust/rust-emblem.svg', MARK);
  html = html.replaceAll('/img/logo-v24.png', '/assets/img/rust/rust-crest-192.png');
  html = html.replaceAll('https://88st.cloud/img/logo-v24.png', 'https://88st.cloud/assets/img/rust/rust-crest-512.png');
  html = html.replace(/"name":"88ST\.Cloud"/g, '"name":"RUST by 88ST"');
  html = html.replace(/<script[^>]*v77\.rust-logo-assets\.js[^>]*><\/script>\s*/ig,'');
  return html.replace(/<\/body>/i, `<script src="${JS}" defer data-v77-rust-logo="true"></script>\n</body>`);
}

const htmlFiles = walk(ROOT).filter(f=>!rel(f).startsWith('admin/'));
let touched=0;
for(const file of htmlFiles){
  const before = fs.readFileSync(file,'utf8');
  const after = injectBody(injectHead(before));
  if(after !== before){
    fs.writeFileSync(file, after);
    touched++;
  }
}

const removalTargets = [
  'assets/img/rust/rust-emblem.svg',
  'apple-touch-icon-180.png',
  'apple-touch-icon-v19.png',
  'apple-touch-icon-v23.png',
  'apple-touch-icon-v24.png',
  'favicon-16x16.png',
  'favicon-32x32.png'
];
const removed=[];
for(const target of removalTargets){
  const p=path.join(ROOT,target);
  if(fs.existsSync(p)){
    fs.rmSync(p,{force:true});
    removed.push(target);
  }
}

const packageUpdated = updatePackageScripts();
const manifest = {
  version:'V77_RUST_LOGO_ASSETS',
  touchedHtml:touched,
  scannedHtml:htmlFiles.length,
  logoMark:MARK,
  favicon:'/favicon.ico',
  appleTouchIcon:'/apple-touch-icon.png',
  ogImage:'/assets/img/rust/rust-og.jpg',
  removedFiles:removed,
  keptForCompatibility:['/icon-192.png','/icon-512.png','/site.webmanifest'],
  packageUpdated,
  note:'The old SVG placeholder and stale versioned root icons were removed only after all HTML was rewritten to the new RUST crest assets.'
};
fs.writeFileSync(path.join(ROOT,'V77_RUST_LOGO_ASSET_MANIFEST.json'), JSON.stringify(manifest,null,2));
console.log(`[V77] RUST logo assets applied. html=${htmlFiles.length} touched=${touched} removed=${removed.length}`);
