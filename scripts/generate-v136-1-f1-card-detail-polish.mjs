import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V136_1_F1_CARD_DETAIL_POLISH';
const vendors=['sk-holdings','zakum','udt','queenbee','ddangkong','anybet','f1'];
const p=(...a)=>path.join(ROOT,...a);
const read=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8'):'';
const write=(f,s)=>{fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s)};
function ensureCss(html, href, attr='data-v136-1-f1-detail-polish="true"'){
  if(html.includes(href)) return html;
  return html.replace('</head>',`  <link rel="stylesheet" href="${href}?v=20260530-2" ${attr}>\n</head>`);
}
function mark(html){
  html=html.replace(/<html([^>]*)>/i,(m,a)=>a.includes('data-v136-1-f1-polish')?m:`<html${a} data-v136-1-f1-polish="active">`);
  html=html.replace(/<body([^>]*)>/i,(m,a)=>a.includes('data-v136-1-f1-polish')?m:`<body${a} data-v136-1-f1-polish="true">`);
  return html;
}
function walk(dir){
  let out=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){ if(['.git','node_modules'].includes(e.name)) continue; const fp=path.join(dir,e.name); if(e.isDirectory()) out=out.concat(walk(fp)); else out.push(fp); } return out;
}
function writeCss(){
  const css=`/* V136.1 F-1 home card scale + guaranteed detail bottom section CTA polish */
html[data-v136-1-f1-polish="active"] body[data-v136-1-f1-polish="true"] .v71-desktop-partner-panel .v136-f1-home-card{
  padding:4px!important;
  overflow:hidden!important;
  border-color:rgba(239,68,68,.28)!important;
  box-shadow:0 16px 42px rgba(239,68,68,.12), inset 0 1px 0 rgba(255,255,255,.78)!important;
}
html[data-v136-1-f1-polish="active"] body[data-v136-1-f1-polish="true"] .v71-desktop-partner-panel .v136-f1-home-card img{
  padding:0!important;
  transform:scale(1.075)!important;
  transform-origin:center!important;
  object-fit:contain!important;
  object-position:center!important;
  background:#fff!important;
}
.v136-1-guaranteed-detail-lock .v113-depth{
  display:block!important;
  margin:28px 0 0!important;
  padding:24px!important;
  border:1px solid rgba(246,201,107,.20)!important;
  border-radius:24px!important;
  background:linear-gradient(135deg,rgba(17,24,39,.82),rgba(8,12,20,.94))!important;
  box-shadow:0 22px 64px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05)!important;
  color:#e5edf7!important;
}
.v136-1-guaranteed-detail-lock .v113-depth-head{
  display:grid!important;
  grid-template-columns:1fr auto!important;
  gap:18px!important;
  align-items:center!important;
}
.v136-1-guaranteed-detail-lock .v113-depth-head span{
  display:inline-block!important;
  margin-bottom:7px!important;
  color:#f6c96b!important;
  font-size:12px!important;
  font-weight:900!important;
  letter-spacing:.14em!important;
}
.v136-1-guaranteed-detail-lock .v113-depth-head h2{margin:0 0 8px!important;color:#fff!important;font-size:clamp(22px,3vw,32px)!important;line-height:1.18!important;}
.v136-1-guaranteed-detail-lock .v113-depth-head p{margin:0!important;color:#aab6c8!important;line-height:1.72!important;}
.v136-1-guaranteed-detail-lock .v113-depth-head>a,
.v136-1-guaranteed-detail-lock [data-v136-1-detail-cta="true"]{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  min-height:46px!important;
  padding:0 18px!important;
  border-radius:999px!important;
  border:1px solid rgba(246,201,107,.36)!important;
  background:linear-gradient(135deg,#f6c96b,#ef4444)!important;
  color:#111827!important;
  font-weight:900!important;
  text-decoration:none!important;
  white-space:nowrap!important;
  box-shadow:0 12px 30px rgba(239,68,68,.18)!important;
}
.v136-1-guaranteed-detail-lock .v113-depth-grid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:14px!important;margin-top:18px!important;}
.v136-1-guaranteed-detail-lock .v113-depth-card{border:1px solid rgba(255,255,255,.10)!important;border-radius:20px!important;background:rgba(255,255,255,.045)!important;padding:18px!important;}
.v136-1-guaranteed-detail-lock .v113-depth-card h3{margin:0 0 10px!important;color:#fff!important;}
.v136-1-guaranteed-detail-lock .v113-depth-list{display:grid!important;gap:10px!important;list-style:none!important;padding:0!important;margin:12px 0 0!important;}
.v136-1-guaranteed-detail-lock .v113-depth-list li{display:grid!important;grid-template-columns:42px 1fr!important;gap:10px!important;align-items:start!important;color:#cbd5e1!important;}
.v136-1-guaranteed-detail-lock .v113-depth-list b{color:#f6c96b!important;}
.v136-1-guaranteed-detail-lock .v113-matrix{overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;}
.v136-1-guaranteed-detail-lock .v113-matrix table{width:100%!important;border-collapse:collapse!important;min-width:620px!important;}
.v136-1-guaranteed-detail-lock .v113-matrix th,.v136-1-guaranteed-detail-lock .v113-matrix td{padding:12px!important;border-bottom:1px solid rgba(255,255,255,.08)!important;color:#d8e2ee!important;text-align:left!important;}
.v136-1-guaranteed-detail-lock .v113-matrix th{color:#f6c96b!important;background:rgba(246,201,107,.06)!important;}
.v96-2-neighbors{display:none!important;}
@media(max-width:760px){
  html[data-v136-1-f1-polish="active"] body[data-v136-1-f1-polish="true"] .v71-desktop-partner-panel .v136-f1-home-card img{transform:scale(1.04)!important;}
  .v136-1-guaranteed-detail-lock .v113-depth{padding:18px!important;border-radius:20px!important;}
  .v136-1-guaranteed-detail-lock .v113-depth-head{grid-template-columns:1fr!important;}
  .v136-1-guaranteed-detail-lock .v113-depth-head>a{width:100%!important;}
  .v136-1-guaranteed-detail-lock .v113-matrix table{min-width:560px!important;}
}`;
  write(p('assets/css/v136-1-f1-card-detail-polish.css'),css);
}
function injectAllCss(){
  const href='/assets/css/v136-1-f1-card-detail-polish.css';
  let touched=0;
  for(const file of walk(ROOT).filter(f=>f.endsWith('.html'))){
    let html=read(file);
    let next=mark(ensureCss(html,href));
    if(next!==html){write(file,next); touched++;}
  }
  return touched;
}
function updateHome(){
  const file=p('index.html'); let html=read(file); if(!html) return false;
  html=mark(ensureCss(html,'/assets/css/v136-1-f1-card-detail-polish.css'));
  // Mark F-1 home card for stronger scale lock if a previous generator missed the class.
  html=html.replace(/(<a class="v71-partner-card v71-glow-border)\s+(v136-f1-home-card)/g,'$1 $2 v136-1-f1-scale');
  html=html.replace(/(<a class="v71-partner-card v71-glow-border)(" href="\/guaranteed\/f1\/)/g,'$1 v136-f1-home-card v136-1-f1-scale$2');
  html=html.replace(/data-v136-f1-card="home"/g,'data-v136-f1-card="home" data-v136-1-f1-scale="true"');
  write(file,html); return true;
}
function cleanGuaranteedIndex(){
  const file=p('guaranteed/index.html'); let html=read(file); if(!html) return false;
  html=mark(ensureCss(html,'/assets/css/v136-1-f1-card-detail-polish.css'));
  html=html.replace(/6개 보증업체/g,'7개 보증업체');
  html=html.replace(/F-1, F-1/g,'F-1');
  html=html.replace(/SK 홀딩스, 자쿰, UDT BET, 여왕벌, 땅콩 BET, ANY BET, F-1, F-1/g,'SK 홀딩스, 자쿰, UDT BET, 여왕벌, 땅콩 BET, ANY BET, F-1');
  write(file,html); return true;
}
function addBodyClassAndMarker(html){
  return html.replace(/<body([^>]*)>/i,(m,a)=>{
    let attrs=a;
    let cls='';
    attrs=attrs.replace(/\sclass="([^"]*)"/i,(mm,c)=>{cls=c; return '';});
    const classes=new Set((cls+' v136-1-guaranteed-detail-lock').split(/\s+/).filter(Boolean));
    if(!/data-v136-1-f1-polish=/i.test(attrs)) attrs += ' data-v136-1-f1-polish="true"';
    return `<body${attrs} class="${[...classes].join(' ')}">`;
  });
}
function ensureDepthCtaMarker(html){
  // Remove accidental CTA markers outside the v113 depth header first.
  html=html.replace(/(<footer class="moon-footer"[\s\S]*?<\/footer>)/g,(m)=>m.replace(/\sdata-v136-1-detail-cta="true"/g,''));
  html=html.replace(/(<nav class="rust-bottom-nav"[\s\S]*?<\/nav>)/g,(m)=>m.replace(/\sdata-v136-1-detail-cta="true"/g,''));
  return html.replace(/(<div class="v113-depth-head">[\s\S]*?<a\s)([^>]*)(>)/,(m,pre,attrs,end)=>{
    attrs=attrs.replace(/\sdata-v136-1-detail-cta="true"/g,'');
    return `${pre}data-v136-1-detail-cta="true" ${attrs.trim()}${end}`;
  });
}
function cleanDetail(slug){
  const file=p('guaranteed',slug,'index.html'); let html=read(file); if(!html) return false;
  html=mark(ensureCss(html,'/assets/css/v136-1-f1-card-detail-polish.css'));
  html=addBodyClassAndMarker(html);
  // Remove broken neighbor section wrapper while keeping scripts/footer after main.
  html=html.replace(/<section class="v96-2-neighbors"[^>]*>/g,'</section></main>');
  html=html.replace(/<\/main>\s*<\/section>\s*<\/main>/g,'</main>');
  html=html.replace(/<\/section>\s*<\/main>\s*<\/section>\s*<\/main>/g,'</section></main>');
  // Ensure the F-1 compact depth section has grid/card structure aligned with older pages.
  if(slug==='f1' && !html.includes('data-v136-1-f1-depth-card="true"')){
    html=html.replace(/<section class="v113-depth" aria-label="F-1 실사용 확인 가이드"><div class="v113-depth-head"><div><span>DETAIL CHECK<\/span><h2>F-1 이용 전 정리<\/h2><p>가입코드 888, USDT 입출금, 게임별 보너스율을 같은 기준으로 확인합니다\.<\/p><\/div><a ([^>]*)>코드복사 · 이동<\/a><\/div><\/section>/,
`<section class="v113-depth" aria-label="F-1 실사용 확인 가이드" data-v136-1-f1-depth-card="true"><div class="v113-depth-head"><div><span>DETAIL CHECK</span><h2>F-1 이용 전 정리</h2><p>가입코드 888, USDT 입출금, 게임별 보너스율을 같은 기준으로 확인합니다.</p></div><a $1>코드복사 · 이동</a></div><div class="v113-depth-grid"><article class="v113-depth-card"><h3>F-1 체크 포인트</h3><ul class="v113-depth-list"><li><b>01</b><span>가입코드 888과 공식 도메인 f1-77.com을 같은 화면 기준으로 확인</span></li><li><b>02</b><span>USDT 입출금과 수수료 지원 항목을 충전 전 먼저 확인</span></li><li><b>03</b><span>스포츠·미니게임·슬롯·카지노·홀덤 첫충/매충 보너스를 구분해 확인</span></li></ul></article></div></section>`);
  }
  html=ensureDepthCtaMarker(html);
  html=html.replace(/\sdata-v136-1-detail-cta="true"(?=[^<]*data-v136-1-detail-cta="true")/g,'');
  html=html.replace(/class="([^"]*)"/g,(m,c)=>`class="${[...new Set(c.split(/\s+/).filter(Boolean))].join(' ')}"`);
  // Ensure exactly one footer stays after main and outside main.
  const footerMatch=html.match(/<footer class="moon-footer"[\s\S]*?<\/footer>/);
  let footer=footerMatch?footerMatch[0]:'';
  if(footer){html=html.replace(/<footer class="moon-footer"[\s\S]*?<\/footer>/g,'');}
  if(!html.includes('</main>')){
    html=html.replace(/(<nav class="rust-bottom-nav")/,'</section></main>$1');
  }
  if(footer){html=html.replace('</body>',`${footer}\n</body>`);}
  write(file,html); return true;
}
function updatePackage(){
  const file=p('package.json'); const pkg=JSON.parse(read(file));
  pkg.scripts.build='node scripts/build-v136-1-cloudflare-pages-safe.mjs';
  pkg.scripts.verify='node scripts/verify-v136-1-f1-card-detail-polish.mjs';
  pkg.scripts['quality:v136-1']='node scripts/generate-v136-1-f1-card-detail-polish.mjs';
  pkg.scripts['verify:v136-1']='node scripts/verify-v136-1-f1-card-detail-polish.mjs';
  write(file,JSON.stringify(pkg,null,2));
}
function writeReports(touched){
  fs.mkdirSync(p('reports'),{recursive:true});
  const report={ok:true,version:VERSION,changes:['F-1 home card image scaled slightly larger','Guaranteed detail bottom v113 sections wrapped/styled','Removed broken v96-2-neighbors wrapper','CTA marker applied to detail bottom CTAs'],vendors,htmlCssTouched:touched,generatedAt:new Date().toISOString()};
  write(p('reports/v136-1-f1-card-detail-polish-audit.json'),JSON.stringify(report,null,2));
  write(p('V136_1_UPGRADE_REPORT.md'),`# V136.1 F-1 Card / Guaranteed Detail Polish\n\n- 메인 F-1 이미지카드를 소폭 확대했습니다.\n- 보증업체 7개 상세 랜딩 하단 v113 섹션을 공통 디자인으로 감쌌습니다.\n- 깨진 v96-2-neighbors 래퍼를 제거하고 공통 푸터는 최하단 1개만 유지했습니다.\n- 하단 CTA 버튼 스타일을 공통 적용했습니다.\n`);
  write(p('V136_1_PATCH_MANIFEST.json'),JSON.stringify({version:VERSION,files:['index.html','guaranteed/index.html','guaranteed/*/index.html','assets/css/v136-1-f1-card-detail-polish.css','scripts/generate-v136-1-f1-card-detail-polish.mjs','scripts/verify-v136-1-f1-card-detail-polish.mjs','scripts/build-v136-1-cloudflare-pages-safe.mjs','package.json']},null,2));
}
writeCss(); const touched=injectAllCss(); updateHome(); cleanGuaranteedIndex(); for(const v of vendors) cleanDetail(v); updatePackage(); writeReports(touched);
console.log('[V136.1 GENERATE PASS]', {version:VERSION, vendors:vendors.length, touched});
