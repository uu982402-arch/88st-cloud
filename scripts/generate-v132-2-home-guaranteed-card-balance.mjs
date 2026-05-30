import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V132_2_HOME_GUARANTEED_CARD_BALANCE';
const now=new Date().toISOString();
const CSS='assets/css/v132-2-home-guaranteed-card-balance.css';
const CSS_HREF='/assets/css/v132-2-home-guaranteed-card-balance.css?v=20260530';
const IMG1='assets/img/guaranteed/cards/ad-inquiry-01.webp';
const IMG2='assets/img/guaranteed/cards/ad-inquiry-02.webp';
function abs(rel){return path.join(ROOT,rel)}
function exists(rel){return fs.existsSync(abs(rel))}
function read(rel){return fs.readFileSync(abs(rel),'utf8')}
function write(rel,body){fs.mkdirSync(path.dirname(abs(rel)),{recursive:true});fs.writeFileSync(abs(rel),body)}
function addAttr(html,tag,attr,value){ const re=new RegExp(`<${tag}\\b([^>]*)>`,'i'); if(!re.test(html)) return html; return html.replace(re,(m,attrs='')=>new RegExp(`${attr}=`,'i').test(attrs)?m:`<${tag}${attrs} ${attr}="${value}">`); }
function ensureCss(html){ if(html.includes('v132-2-home-guaranteed-card-balance.css')) return html; return html.replace(/<\/head>/i,`  <link rel="stylesheet" href="${CSS_HREF}" data-v132-2-home-card-balance="true">\n</head>`); }
function inquiryCards(){
  return `<a class="v71-partner-card v71-glow-border v1322-ad-inquiry-card" href="/consult/" aria-label="광고 문의 이미지 카드 1" data-ga4-event="consult_click" data-v1322-ad-card="inquiry-01"><img data-v128-img="lightweight" src="/assets/img/guaranteed/cards/ad-inquiry-01.webp" alt="광고 문의 이미지 카드" loading="lazy" decoding="async" width="1536" height="864" fetchpriority="low" data-v1322-card-image="ad-inquiry-01"></a><a class="v71-partner-card v71-glow-border v1322-ad-inquiry-card" href="/consult/" aria-label="광고 문의 이미지 카드 2" data-ga4-event="consult_click" data-v1322-ad-card="inquiry-02"><img data-v128-img="lightweight" src="/assets/img/guaranteed/cards/ad-inquiry-02.webp" alt="광고 문의 이미지 카드" loading="lazy" decoding="async" width="1536" height="864" fetchpriority="low" data-v1322-card-image="ad-inquiry-02"></a>`;
}
function patchIndex(){
  const rel='index.html'; if(!exists(rel)) throw new Error('missing index.html');
  let html=read(rel); const before=html;
  html=addAttr(html,'html','data-v132-2-home-card-balance','true');
  html=addAttr(html,'body','data-v132-2-home-card-balance','true');
  html=ensureCss(html);
  // Remove prior generated inquiry cards if re-run, then append exactly two as the final cards in the home partner grid.
  html=html.replace(/<a\b[^>]*data-v1322-ad-card="inquiry-0[12]"[\s\S]*?<\/a>/g,'');
  const gridRe=/(<div class="v71-partner-tile-grid">)([\s\S]*?)(\s*<\/div>\s*<\/aside>)/;
  if(!gridRe.test(html)) throw new Error('home partner grid not found');
  html=html.replace(gridRe,(m,open,body,close)=>`${open}${body.trim()}${inquiryCards()}\n          ${close}`);
  if(html!==before) write(rel,html);
  return html!==before;
}
if(!exists(CSS)) throw new Error(`missing ${CSS}`);
if(!exists(IMG1)||!exists(IMG2)) throw new Error('missing V132.2 inquiry card images');
const touched=[]; if(patchIndex()) touched.push('index.html');
// Keep package build safe and point verify at V132.2.
if(exists('package.json')){
  const pkg=JSON.parse(read('package.json')); pkg.scripts=pkg.scripts||{};
  pkg.scripts.build='node scripts/build-v132-2-cloudflare-pages-safe.mjs';
  pkg.scripts.verify='node scripts/verify-v132-2-home-guaranteed-card-balance.mjs';
  pkg.scripts['verify:deploy']='node scripts/build-v132-2-cloudflare-pages-safe.mjs';
  pkg.scripts['quality:v132.2']='node scripts/generate-v132-2-home-guaranteed-card-balance.mjs';
  pkg.scripts['verify:v132.2']='node scripts/verify-v132-2-home-guaranteed-card-balance.mjs';
  write('package.json',JSON.stringify(pkg,null,2));
  touched.push('package.json');
}
const report={ok:true,version:VERSION,base:'V132.1 HEADER TOOLS CLEANUP',touched,home:{existingVendorCards:6,addedInquiryCards:2,totalHomePartnerCards:8,order:'existing 6 vendors first, inquiry cards last 2'},assets:[IMG1,IMG2,CSS],deletedFiles:0,generatedAt:now};
write('reports/v132-2-home-guaranteed-card-balance-audit.json',JSON.stringify(report,null,2));
write('reports/v132-2-remove-candidates.txt',['# V132.2 remove candidates','No file deletion in this patch.','Home partner card sizing is corrected by CSS override, not by deleting vendor cards.'].join('\n'));
write('V132_2_PATCH_MANIFEST.json',JSON.stringify({version:VERSION,patchUploadSafe:true,changedFiles:touched.concat([CSS,IMG1,IMG2,'scripts/build-v132-2-cloudflare-pages-safe.mjs','scripts/generate-v132-2-home-guaranteed-card-balance.mjs','scripts/verify-v132-2-home-guaranteed-card-balance.mjs']),deletedFiles:0,generatedAt:now},null,2));
write('V132_2_UPGRADE_REPORT.md',`# ${VERSION}\n\n메인 보증업체 카드가 너무 작아진 문제를 보정하고, 첨부 광고문의 이미지를 마지막 2개 카드로 추가했습니다. /guaranteed/ 허브의 보증업체 6개 구조는 변경하지 않았습니다.\n\n- Home partner cards: 8\n- Added image cards: 2\n- Deleted files: 0\n- Generated: ${now}\n`);
console.log('[V132.2 GENERATE PASS]',JSON.stringify(report,null,2));
