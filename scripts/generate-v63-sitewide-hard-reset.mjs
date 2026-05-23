
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const VERSION = 'static-growth-conversion-v63';
const cssHref = `/assets/css/v63.sitewide-hard-reset.css?v=${VERSION}`;
const jsSrc = `/assets/js/v63.sitewide-hard-reset.js?v=${VERSION}`;
function walk(dir, out=[]) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules','.git','__MACOSX'].includes(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p,out); else out.push(p);
  }
  return out;
}
function rel(p){return path.relative(ROOT,p).replaceAll(path.sep,'/');}
function injectHead(html){
  html = html.replace(/<link[^>]+v63\.sitewide-hard-reset\.css[^>]*>\s*/gi,'');
  const tag = `<link rel="stylesheet" href="${cssHref}" data-v63-sitewide="true">`;
  return html.includes('</head>') ? html.replace('</head>', `${tag}</head>`) : tag + html;
}
function injectBody(html){
  html = html.replace(/<script[^>]+v63\.sitewide-hard-reset\.js[^>]*><\/script>\s*/gi,'');
  const tag = `<script src="${jsSrc}" defer data-v63-sitewide="true"></script>`;
  return html.includes('</body>') ? html.replace('</body>', `${tag}</body>`) : html + tag;
}
function addBodyClass(html){
  if (/<body\b[^>]*class=/i.test(html)) {
    return html.replace(/<body\b([^>]*?)class=["']([^"']*)["']([^>]*)>/i, (m,a,c,b)=>{
      const classes = new Set(c.split(/\s+/).filter(Boolean));
      classes.add('v63-sitewide-hard-reset');
      return `<body${a}class="${Array.from(classes).join(' ')}"${b}>`;
    });
  }
  return html.replace(/<body\b([^>]*)>/i, '<body$1 class="v63-sitewide-hard-reset">');
}
const files = walk(ROOT);
const htmls = files.filter(f => f.endsWith('.html'));
let changed = 0;
for (const f of htmls) {
  let html = fs.readFileSync(f,'utf8');
  const before = html;
  html = injectHead(html);
  html = injectBody(html);
  html = addBodyClass(html);
  if (html !== before) { fs.writeFileSync(f, html, 'utf8'); changed++; }
}
const audit = {
  version: VERSION,
  generatedAt: new Date().toISOString(),
  htmlScanned: htmls.length,
  htmlUpdated: changed,
  css: 'assets/css/v63.sitewide-hard-reset.css',
  js: 'assets/js/v63.sitewide-hard-reset.js',
  scope: ['main','tools','guaranteed','vendor-landings','blog','consult','headers','footers'],
  compactTitleLock: true,
  providerImageEmphasis: true,
  mobileAppNavigationGuard: true,
  note: 'V63 applies a final global premium hard reset layer after previous V55-V62 styles without removing existing functionality.'
};
fs.mkdirSync(path.join(ROOT,'assets/data'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'assets/data/v63.sitewide-hard-reset.audit.json'), JSON.stringify(audit,null,2)+'\n','utf8');

// Keep final build metadata on V63 even when previous generators rewrite it.
const genBuildPath = path.join(ROOT, 'scripts/gen-build-ver.mjs');
if (fs.existsSync(genBuildPath)) {
  let genBuild = fs.readFileSync(genBuildPath, 'utf8');
  genBuild = genBuild.replace(/static-growth-conversion-v\d+-\$\{compact\}/g, 'static-growth-conversion-v63-${compact}');
  fs.writeFileSync(genBuildPath, genBuild, 'utf8');
}

console.log(`V63 sitewide hard reset applied: ${changed}/${htmls.length} HTML files`);
