import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V102_LIVE_UX_POLISH_CTA_FINAL';
const STAMP = '20260526';
const cssPath = 'assets/css/v102-live-ux-polish-cta-final.css';
const jsPath = 'assets/js/v102-live-ux-polish-cta-final.js';
const dataPath = 'assets/data/v102-live-ux-polish-cta-final.json';
const genCmd = 'node scripts/generate-v102-live-ux-polish-cta-final.mjs';
const verifyCmd = 'node scripts/verify-v102-live-ux-polish-cta-final.mjs';
const metaTag = '<meta name="v102-live-ux-polish-cta-final" content="V102_LIVE_UX_POLISH_CTA_FINAL_ACTIVE" data-v102-live-ux="true">';
const cssTag = `<link rel="stylesheet" href="/${cssPath}?v=v102-live-ux-polish-cta-final-${STAMP}" data-v102-live-ux="true">`;
const jsTag = `<script defer src="/${jsPath}?v=v102-live-ux-polish-cta-final-${STAMP}" data-v102-live-ux="true"></script>`;
const removedRoutes = ['faq','consult-motives','consult-result','provider-updates'];
const vendorLinks = {
  'sk-holdings':'/guaranteed/sk-holdings/',
  'zakum':'/guaranteed/zakum/',
  'udt':'/guaranteed/udt/',
  'queenbee':'/guaranteed/queenbee/',
  'ddangkong':'/guaranteed/ddangkong/',
  'anybet':'/guaranteed/anybet/'
};
const coreRoutes = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html','admin/index.html'];

function p(rel){ return path.join(ROOT, rel); }
function exists(rel){ return fs.existsSync(p(rel)); }
function read(rel){ return fs.readFileSync(p(rel),'utf8'); }
function write(rel, s){ fs.mkdirSync(path.dirname(p(rel)),{recursive:true}); fs.writeFileSync(p(rel),s); }
function rmrf(rel){ fs.rmSync(p(rel),{recursive:true,force:true}); }
function walk(dir='.'){
  const out=[]; const base=p(dir); if(!fs.existsSync(base)) return out;
  for(const name of fs.readdirSync(base)){
    if(['node_modules','.git','.wrangler'].includes(name)) continue;
    const full=path.join(base,name); const rel=path.relative(ROOT,full).replaceAll(path.sep,'/'); const st=fs.statSync(full);
    if(st.isDirectory()) out.push(...walk(rel)); else out.push(rel);
  }
  return out;
}
function inject(html){
  if(!html.includes('data-v102-live-ux="true"')) html = html.includes('<head>') ? html.replace('<head>', `<head>\n  ${metaTag}`) : `${metaTag}\n${html}`;
  if(!html.includes(cssPath) && html.includes('</head>')) html = html.replace('</head>', `  ${cssTag}\n</head>`);
  if(!html.includes(jsPath)) html = html.includes('</body>') ? html.replace('</body>', `  ${jsTag}\n</body>`) : html.replace('</head>', `  ${jsTag}\n</head>`);
  html = html.replace(/<html([^>]*)>/, (m,attrs)=> attrs.includes('data-v102-live-ux') ? m : `<html${attrs} data-v102-live-ux="active">`);
  html = html.replace(/<body(?![^>]*data-v102-live-ux=)([^>]*)>/, '<body data-v102-live-ux="active" class="v102-live-ux"$1>');
  html = html.replace(/<body([^>]*)class="([^"]*)"([^>]*)data-v102-live-ux="active"([^>]*)>/, (m,a,c,b,d)=> c.includes('v102-live-ux') ? m : `<body${a}class="v102-live-ux ${c}"${b}data-v102-live-ux="active"${d}>`);
  html = html.replace(/<body([^>]*)data-v102-live-ux="active"([^>]*)class="([^"]*)"([^>]*)>/, (m,a,b,c,d)=> c.includes('v102-live-ux') ? m : `<body${a}data-v102-live-ux="active"${b}class="v102-live-ux ${c}"${d}>`);
  return html;
}
function addAttr(tag, name, value){
  if(new RegExp(`\\s${name}=`).test(tag)) return tag;
  return tag.replace(/>$/, ` ${name}="${value}">`);
}
function decorateAnchors(html){
  html = html.replace(/<a([^>]*class="[^"]*rust-bottom-nav[\s\S]*?)/g, m=>m); // no-op guard
  html = html.replace(/<a([^>]*class="[^"]*v74-1-btn--detail[^"]*"[^>]*)>/g, (m,attrs)=>addAttr(`<a${attrs}>`,'data-ga4-event','vendor_detail_click'));
  html = html.replace(/<button([^>]*class="[^"]*v74-1-btn--go[^"]*"[^>]*)>/g, (m,attrs)=>addAttr(`<button${attrs}>`,'data-ga4-event','vendor_outbound_click'));
  html = html.replace(/<a([^>]*class="[^"]*v71-more[^"]*"[^>]*href="\/blog\/"[^>]*)>/g, (m,attrs)=>addAttr(`<a${attrs}>`,'data-ga4-event','blog_card_click'));
  html = html.replace(/<a([^>]*class="[^"]*v71-more[^"]*"[^>]*href="\/guaranteed\/"[^>]*)>/g, (m,attrs)=>addAttr(`<a${attrs}>`,'data-ga4-event','vendor_detail_click'));
  html = html.replace(/<a([^>]*class="[^"]*v71-tool-card[^"]*"[^>]*)>/g, (m,attrs)=>addAttr(`<a${attrs}>`,'data-ga4-event','tool_open'));
  html = html.replace(/<a([^>]*class="[^"]*(?:v71-fab|v74-fab|v71-telegram)[^"]*"[^>]*)>/g, (m,attrs)=>addAttr(`<a${attrs}>`,'data-ga4-event','consult_click'));
  html = html.replace(/<a([^>]*class="[^"]*(?:v71-blog-card|v72-blog-card)[^"]*"[^>]*)>/g, (m,attrs)=>addAttr(`<a${attrs}>`,'data-ga4-event','blog_card_click'));
  html = html.replace(/<nav class="rust-bottom-nav"([\s\S]*?)<\/nav>/g, nav => nav.replace(/<a(?![^>]*data-ga4-event=)([^>]*)>/g, '<a$1 data-ga4-event="mobile_bottom_nav_click">'));
  html = html.replace(/<nav class="v71-mobile-nav"([\s\S]*?)<\/nav>/g, nav => nav.replace(/<a(?![^>]*data-ga4-event=)([^>]*)>/g, '<a$1 data-ga4-event="mobile_bottom_nav_click">'));
  return html;
}
function tuneHome(html){
  if(!html.includes('v71-main')) return html;
  html = html.replace('모바일에서는 이미지만 넘겨보는 가로 슬라이더로 표시합니다.','카드 이미지를 넘겨 보고 상세에서 조건을 확인합니다.');
  html = html.replace('주요 글 15개를 자동 순환해 빠르게 확인합니다.','핵심 글만 압축해 첫 화면에서 바로 확인합니다.');
  html = html.replace('PC에서는 우측 타일형 이미지 카드로 고정 노출합니다.','PC에서는 보증업체 이미지를 타일형으로 정리해 보여줍니다.');
  const vendorLabelMap = {
    'SK 홀딩스':'sk-holdings', '자쿰':'zakum', 'UDT BET':'udt', '여왕벌':'queenbee', '땅콩 BET':'ddangkong', 'ANY BET':'anybet'
  };
  for(const [label,key] of Object.entries(vendorLabelMap)){
    const href = vendorLinks[key];
    const rx = new RegExp(`<a([^>]*class="[^"]*v71-partner-card[^"]*"[^>]*href=")\/guaranteed\/("[^>]*aria-label="${label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[^"]*"[^>]*)>`, 'g');
    html = html.replace(rx, `<a$1${href}$2 data-ga4-event="vendor_detail_click" data-v102-cta="home_partner_${key}">`);
  }
  return html;
}
function cleanRemovedReferences(text){
  for(const r of removedRoutes){
    const route = new RegExp(`https://88st\\.cloud/${r}(?:/[^\\s<]*)?`, 'g');
    text = text.replace(route, '');
    const href = new RegExp(`href=(["'])/${r}(?:/[^"']*)?\\1`, 'g');
    text = text.replace(href, r==='provider-updates' ? 'href="/guaranteed/"' : (r==='faq' ? 'href="/blog/"' : 'href="/consult/"'));
  }
  return text;
}
function updatePackage(){
  if(!exists('package.json')) return;
  const pkg = JSON.parse(read('package.json'));
  pkg.scripts ||= {};
  const build = pkg.scripts.build || '';
  if(!build.includes(genCmd)) pkg.scripts.build = build ? `${build} && ${genCmd}` : genCmd;
  pkg.scripts['quality:v102'] = genCmd;
  pkg.scripts['verify:v102'] = verifyCmd;
  pkg.scripts['verify:live:v102'] = 'V102_LIVE_CHECK=1 node scripts/verify-v102-live-ux-polish-cta-final.mjs';
  pkg.scripts.verify = verifyCmd;
  write('package.json', JSON.stringify(pkg,null,2)+'\n');
}

for(const r of removedRoutes) rmrf(r);
for(const file of walk('.').filter(f=>f.endsWith('.html'))){
  if(removedRoutes.some(r=>file===r||file.startsWith(r+'/'))) continue;
  let html = read(file);
  html = cleanRemovedReferences(html);
  if(file==='index.html') html = tuneHome(html);
  html = decorateAnchors(html);
  html = inject(html);
  write(file, html);
}
for(const sp of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']){
  if(!exists(sp)) continue;
  let lines = read(sp).split(/\r?\n/).filter(line => !removedRoutes.some(r => line.includes(`https://88st.cloud/${r}`) || line.includes(`/${r}/`)));
  write(sp, lines.join('\n').trimEnd()+'\n');
}
let robots = exists('robots.txt') ? read('robots.txt') : 'User-agent: *\nAllow: /\n';
for(const r of removedRoutes){ const line=`Disallow: /${r}/`; if(!robots.includes(line)) robots += (robots.endsWith('\n')?'':'\n')+line+'\n'; }
write('robots.txt', robots);
write('build.txt', '88ST_CLOUD_V102_LIVE_UX_POLISH_CTA_FINAL\n');
write('assets/js/build.ver.js', "window.__BUILD_VERSION__='88ST_CLOUD_V102_LIVE_UX_POLISH_CTA_FINAL';\nwindow.__BUILD_TIME__='2026-05-26T00:00:00+09:00';\n");
write(dataPath, JSON.stringify({version:VERSION, date:'2026-05-26', base:'V101_REMOVED_ROUTE_LOCK_BUILD_HYGIENE', scope:['guaranteed CTA touch polish','mobile bottom nav/FAB micro adjustment','blog hub first-view readability','home first-view balance','GA4 click marker coverage','Cloudflare Pages live QA checklist'], core_routes:coreRoutes, removed_routes:removedRoutes, live_qa_urls:['/','/blog/','/tools/','/guaranteed/','/guaranteed/zakum/','/consult/','/ops/'], verify_script:verifyCmd}, null, 2));
updatePackage();
console.log(`[${VERSION}] live UX polish and CTA final patch applied.`);
