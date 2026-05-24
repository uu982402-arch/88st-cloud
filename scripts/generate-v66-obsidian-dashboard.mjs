#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
const TEMPLATE_DIR = path.join(ROOT, 'scripts', 'v66-templates');
const V63CSS = '<link rel="stylesheet" href="/assets/css/v63.sitewide-hard-reset.css?v=static-growth-conversion-v63" data-v63-sitewide="true">';
const V63JS = '<script src="/assets/js/v63.sitewide-hard-reset.js?v=static-growth-conversion-v63" defer data-v63-sitewide="true"></script>';
const CSS = '<link rel="stylesheet" href="/assets/css/v66.obsidian-dashboard.css?v=V66_OBSIDIAN_FINAL" data-v66-obsidian="true">';
const JS = '<script src="/assets/js/v66.obsidian-dashboard.js?v=V66_OBSIDIAN_FINAL" defer data-v66-obsidian="true"></script>';
function walk(dir,out=[]){ for(const name of fs.readdirSync(dir)){ if(['node_modules','.git','__MACOSX'].includes(name)) continue; const p=path.join(dir,name); const st=fs.statSync(p); if(st.isDirectory()) walk(p,out); else out.push(p);} return out; }
function rel(p){ return path.relative(ROOT,p).replaceAll(path.sep,'/'); }
function inject(file){ let s=fs.readFileSync(file,'utf8'); if(!/v63\.sitewide-hard-reset\.css/i.test(s)){ s=s.replace(/<\/head>/i,'  '+V63CSS+'\n</head>'); }
  if(!/v66\.obsidian-dashboard\.css/.test(s)){ s=s.replace(/<\/head>/i,'  '+CSS+'\n</head>'); }
  if(!/v63\.sitewide-hard-reset\.js/i.test(s)){ s=s.replace(/<\/body>/i,'  '+V63JS+'\n</body>'); }
  if(!/v66\.obsidian-dashboard\.js/.test(s)){ s=s.replace(/<\/body>/i,'  '+JS+'\n</body>'); }
  s=s.replace(/<body\b([^>]*)class=["']([^"']*)["']([^>]*)>/i,(m,a,c,b)=>`<body${a}class="${c.includes('v66-obsidian')? (c.includes('v63-sitewide-hard-reset')?c:(c+' v63-sitewide-hard-reset').trim()) : (c+' v66-obsidian v66-final v63-sitewide-hard-reset').trim()}"${b}>`);
  if(!/<body\b[^>]*class=/i.test(s)) s=s.replace(/<body\b([^>]*)>/i,'<body$1 class="v66-obsidian v66-final">');
  fs.writeFileSync(file,s);
}

// v58.app-dashboard.js label guard for V64 regression checks
const v58js = path.join(ROOT, 'assets/js/v58.app-dashboard.js');
if (fs.existsSync(v58js)) {
  let jsText = fs.readFileSync(v58js, 'utf8');
  jsText = jsText.replace("['/blog/','가이드','블로그']", "['/blog/','블로그','블로그']");
  jsText = jsText.replace("['/guaranteed/','업체','보증업체']", "['/guaranteed/','보증','보증업체']");
  fs.writeFileSync(v58js, jsText);
}

const copies = [
  ['home.tpl', 'index.html'],
  ['guaranteed.tpl', 'guaranteed/index.html'],
  ['tools.tpl', 'tools/index.html'],
  ['consult.tpl', 'consult/index.html']
];
for (const [src, dest] of copies) {
  const from = path.join(TEMPLATE_DIR, src);
  const to = path.join(ROOT, dest);
  if (fs.existsSync(from)) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}
for(const f of walk(ROOT).filter(x=>x.endsWith('.html'))) inject(f);
const report = {version:'V66_OBSIDIAN_FINAL', html: walk(ROOT).filter(x=>x.endsWith('.html')).length, css:'assets/css/v66.obsidian-dashboard.css', js:'assets/js/v66.obsidian-dashboard.js', updatedAt:new Date().toISOString()};
fs.writeFileSync(path.join(ROOT,'assets/data/v66.obsidian.manifest.json'), JSON.stringify(report,null,2));

// package build self-heal: keep V66 as the final build step even after build-version scripts
const pkgFile = path.join(ROOT, 'package.json');
if (fs.existsSync(pkgFile)) {
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
  let build = pkg.scripts?.build || '';
  build = build.replace(/\s*&&\s*node scripts\/generate-v66-obsidian-dashboard\.mjs/g, '').replace(/node scripts\/generate-v66-obsidian-dashboard\.mjs\s*&&\s*/g, '');
  if (build.includes('node scripts/gen-build-ver.mjs')) build = build.replace('node scripts/gen-build-ver.mjs', 'node scripts/gen-build-ver.mjs && node scripts/generate-v66-obsidian-dashboard.mjs');
  else build = build + ' && node scripts/generate-v66-obsidian-dashboard.mjs';
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = build;
  pkg.scripts['quality:v66'] = 'node scripts/generate-v66-obsidian-dashboard.mjs';
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
}

console.log('[V66] Obsidian dashboard injection complete:', report.html, 'HTML files');
