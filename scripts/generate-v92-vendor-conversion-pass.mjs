import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v92-vendor-conversion-pass-20260526';
const CSS = '/assets/css/v92-vendor-conversion-pass.css';
const JS = '/assets/js/v92-vendor-conversion-pass.js';
const vendors = [
  { id:'sk-holdings', detail:'/guaranteed/sk-holdings/', name:'SK 홀딩스', code:'IRON888', image:'/assets/img/guaranteed/cards/sk-holdings.webp', target:'https://snk-99.com/' },
  { id:'queenbee', detail:'/guaranteed/queenbee/', name:'여왕벌', code:'SEOA', image:'/assets/img/guaranteed/cards/queenbee.webp', target:'https://qb-700.com/?code=seoa' },
  { id:'anybet', detail:'/guaranteed/anybet/', name:'ANY BET', code:'SEOA', image:'/assets/img/guaranteed/cards/anybet.webp', target:'https://any-777.com/' },
  { id:'udt', detail:'/guaranteed/udt/', name:'UDT BET', code:'SEOA', image:'/assets/img/guaranteed/cards/udt-bet.webp', target:'https://udt-01.com/' },
  { id:'ddangkong', detail:'/guaranteed/ddangkong/', name:'땅콩 BET', code:'DDK888', image:'/assets/img/guaranteed/cards/ddangkong-bet.webp', target:'https://ddk-2024.com/' }
];
const detailAlias = { 'sk-holdings':'sk-holdings', queenbee:'queenbee', anybet:'anybet', udt:'udt', ddangkong:'ddangkong' };

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function write(rel, text){ fs.writeFileSync(path.join(ROOT, rel), text); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function ensureHead(html){
  if(!html.includes('data-v92-vendor-conversion="true"')){
    html = html.replace('</head>', `  <meta name="v92-vendor-conversion-pass" content="${VERSION}">\n  <link rel="stylesheet" href="${CSS}?v=${VERSION}" data-v92-vendor-conversion="true">\n</head>`);
  }
  return html;
}
function ensureBodyClass(html){
  if(/<body[^>]*class="/.test(html)){
    html = html.replace(/<body([^>]*class=")([^"]*)"/i, (m,a,b)=> b.includes('v92-vendor-conversion-active') ? m : `<body${a}${b} v92-vendor-conversion-active"`);
  } else {
    html = html.replace(/<body(.*?)>/i, '<body$1 class="v92-vendor-conversion-active">');
  }
  if(!/<body[^>]*data-v92-vendor-conversion-pass=/.test(html)){
    html = html.replace(/<body/i, `<body data-v92-vendor-conversion-pass="V92_VENDOR_CONVERSION_PASS_ACTIVE"`);
  }
  return html;
}
function ensureScript(html){
  html = html.replace(/<script\s+src="\/assets\/js\/v92-vendor-conversion-pass\.js[^>]*><\/script>\s*/g, '');
  html = html.replace('</body>', `  <script src="${JS}?v=${VERSION}" defer data-v92-vendor-conversion="true"></script>\n</body>`);
  return html;
}
function ensureImgAttrs(tag, vendor, detail=false, eager=false){
  let out = tag;
  out = out.replace(/src="[^"]*"/, `src="${vendor.image}"`);
  if(/alt="[^"]*"/.test(out)) out = out.replace(/alt="[^"]*"/, `alt="${vendor.name} 보증업체 카드 이미지"`);
  else out = out.replace('<img ', `<img alt="${vendor.name} 보증업체 카드 이미지" `);
  const attrs = [
    ['loading', eager ? 'eager':'lazy'],
    ['decoding','async'],
    ['width','960'],
    ['height','540']
  ];
  for(const [k,v] of attrs){
    if(new RegExp(`${k}="`).test(out)) out = out.replace(new RegExp(`${k}="[^"]*"`), `${k}="${v}"`);
    else out = out.replace(/>$/, ` ${k}="${v}">`);
  }
  if(eager){
    if(/fetchpriority="/.test(out)) out = out.replace(/fetchpriority="[^"]*"/, 'fetchpriority="high"');
    else out = out.replace(/>$/, ' fetchpriority="high">');
  } else {
    out = out.replace(/\sfetchpriority="high"/g, '');
  }
  const dataAttr = detail ? 'data-v92-detail-image' : 'data-v92-card-image';
  if(new RegExp(`${dataAttr}="`).test(out)) out = out.replace(new RegExp(`${dataAttr}="[^"]*"`), `${dataAttr}="${vendor.id}"`);
  else out = out.replace(/>$/, ` ${dataAttr}="${vendor.id}">`);
  return out;
}
function patchHub(){
  let rel = 'guaranteed/index.html';
  let html = read(rel);
  html = ensureHead(html);
  html = ensureBodyClass(html);
  for(const [idx, v] of vendors.entries()){
    const cardRe = new RegExp(`(<article class="v74-1-vendor-card"[^>]*data-vendor="${v.id}"[\\s\\S]*?<\\/article>)`, 'm');
    html = html.replace(cardRe, (card)=>{
      card = card.replace(/<img\b[^>]*>/, img => ensureImgAttrs(img, v, false, idx===0));
      card = card.replace(new RegExp(`(<a class="v74-1-btn v74-1-btn--detail" href="${v.detail}")([^>]*)>`), `$1 data-v92-detail="true" data-ga4-event="vendor_detail_click" data-vendor="${v.name}" aria-label="${v.name} 상세보기"$2>`);
      card = card.replace(/<button class="v74-1-btn v74-1-btn--go"[^>]*>/, `<button class="v74-1-btn v74-1-btn--go" type="button" data-v74-go="true" data-v92-go="true" data-ga4-event="vendor_outbound_click" data-code="${v.code}" data-href="${v.target}" data-vendor="${v.name}" aria-label="${v.name} 가입코드 ${v.code} 복사 후 바로가기">`);
      return card;
    });
  }
  html = ensureScript(html);
  write(rel, html);
}
function vendorFromDetailRel(rel){
  const slug = rel.split('/')[1];
  return vendors.find(v=>v.detail === `/guaranteed/${slug}/`) || null;
}
function patchDetail(rel){
  let html = read(rel);
  const v = vendorFromDetailRel(rel);
  if(!v) return;
  html = ensureHead(html);
  html = ensureBodyClass(html);
  html = html.replace(/<meta name="v92-vendor-detail"[^>]*>\s*/g, '');
  html = html.replace('</head>', `  <meta name="v92-vendor-detail" content="${v.id};${v.image}">\n</head>`);
  html = html.replace(/<link rel="preload" as="image" href="[^"]*"\/?>(?![\s\S]*<link rel="preload" as="image" href="[^"]*"\/>)/, `<link rel="preload" as="image" href="${v.image}"/>`);
  html = html.replace(/<div class="v54-visual-card"><img\b[^>]*><\/div>/, (block)=>block.replace(/<img\b[^>]*>/, img=>ensureImgAttrs(img, v, true, true)));
  html = html.replace(/<a class="v54-btn v54-btn-primary" href="[^"]*" target="_blank" rel="nofollow sponsored noopener noreferrer" data-v54-domain-click="[^"]*">공식 도메인 바로가기<\/a>/, `<a class="v54-btn v54-btn-primary" href="${v.target}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-v54-domain-click="${v.id}" data-ga4-event="vendor_outbound_click" data-v92-go="true" data-code="${v.code}" data-href="${v.target}" data-vendor="${v.name}" aria-label="${v.name} 가입코드 ${v.code} 복사 후 공식 도메인 바로가기">공식 도메인 바로가기</a>`);
  html = html.replace(/<button type="button" class="v54-fact v54-code-copy"[^>]*>/, `<button type="button" class="v54-fact v54-code-copy" data-v54-copy-code="${v.code}" data-v54-provider="${v.id}" data-v92-copy="true" data-ga4-event="vendor_copy_code" data-code="${v.code}" data-vendor="${v.name}" aria-label="${v.name} 가입코드 ${v.code} 복사">`);
  html = ensureScript(html);
  write(rel, html);
}
function patchMain(){
  const rel = 'index.html';
  if(!exists(rel)) return;
  let html = read(rel);
  html = ensureHead(html);
  // Main preview images can use the same guaranteed images. Keep layout intact; only improve attrs and GA4 metadata.
  for(const [idx, v] of vendors.entries()){
    const imgRegex = new RegExp(`<img\\b(?=[^>]*(?:${v.image.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}|v71-[^\"]*${v.id}[^\"]*|${v.id}[^\"]*\\.(?:webp|svg)))[^>]*>`, 'g');
    html = html.replace(imgRegex, img=>ensureImgAttrs(img, v, false, idx===0));
  }
  html = html.replace(/(<a\b[^>]*href="\/guaranteed\/[^"]+\/"[^>]*)(>)/g, (m,a,b)=> a.includes('data-ga4-event')?m:`${a} data-ga4-event="vendor_detail_click" data-v92-detail="true"${b}`);
  html = ensureScript(html);
  write(rel, html);
}
function writeManifest(){
  const manifest = { version: VERSION, vendors: vendors.map(v=>({id:v.id,name:v.name,code:v.code,image:v.image,detail:v.detail,target:v.target})), checks:['image-alt','lazy-decoding','touch-52','ga4-vendor-events','copy-toast','external-link-new-tab'] };
  fs.writeFileSync(path.join(ROOT,'assets/data/v92-vendor-conversion-pass.json'), JSON.stringify(manifest,null,2));
}
function updatePackage(){
  const rel = 'package.json';
  const pkg = JSON.parse(read(rel));
  const gen = 'node scripts/generate-v92-vendor-conversion-pass.mjs';
  if(!pkg.scripts.build.includes(gen)) pkg.scripts.build = `${pkg.scripts.build} && ${gen}`;
  pkg.scripts.verify = 'node scripts/verify-v92-vendor-conversion-pass.mjs';
  pkg.scripts['quality:v92'] = gen;
  pkg.scripts['verify:v92'] = pkg.scripts.verify;
  write(rel, JSON.stringify(pkg,null,2)+'\n');
}

for(const v of vendors){ if(!exists(v.image.slice(1))) throw new Error(`Missing vendor image ${v.image}`); }
patchHub();
for(const f of ['guaranteed/sk-holdings/index.html','guaranteed/queenbee/index.html','guaranteed/anybet/index.html','guaranteed/udt/index.html','guaranteed/ddangkong/index.html']) patchDetail(f);
patchMain();
writeManifest();
updatePackage();
console.log(`[V92] vendor conversion pass generated: vendors=${vendors.length} marker=V92_VENDOR_CONVERSION_PASS_ACTIVE`);
