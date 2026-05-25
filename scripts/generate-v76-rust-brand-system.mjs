import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const VERSION = 'static-v76-rust-brand-system-20260524';
const CSS = '/assets/css/v76.rust-brand-system.css?v=' + VERSION;
const JS = '/assets/js/v76.rust-brand-system.js?v=' + VERSION;
const KEYWORDS = [
  'RUST','러스트','88st cloud','88st.cloud','토토','온라인스포츠토토사이트추천','토토사이트추천','입플사이트추천','스포츠입플','카지노입플','미니게임입플사이트','카지노입플사이트추천','2026토토사이트추천','안전한토토사이트추천','러스트 추천 안전한 토토사이트 2026 검증 리스트','88st cloud 러스트 보증 카지노입플 및 스포츠입플 조건 비교','실시간 온라인스포츠토토사이트추천 및 롤링 계산기 도구 모음','먹튀 없는 미니게임입플사이트 가입코드 즉시 복사'
].join(', ');
const DEFAULT_DESC = 'RUST는 88st.cloud에서 제공하는 2026 토토사이트추천, 스포츠입플, 카지노입플, 미니게임입플사이트, 보증업체 큐레이션, 롤링·EV 계산 도구, 공식 상담 연결을 통합한 정보 플랫폼입니다.';
const DEFAULT_TITLE = 'RUST | 2026 토토사이트추천 및 입플사이트 분석 허브';

const nav = [
  ['/', '메인', '⌂'],
  ['/blog/', '블로그', '▤'],
  ['/tools/', '도구', '◈'],
  ['/guaranteed/', '보증', '◆'],
  ['/consult/', '상담', '✦']
];

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
function titleFor(file){
  const r=rel(file);
  if(r==='index.html') return DEFAULT_TITLE;
  if(r.startsWith('blog/')) return 'RUST 블로그 | 토토·입플·롤링·EV 정보 허브';
  if(r.startsWith('tools/')) return 'RUST 도구 | 배당 마진·EV·롤링·입플 계산 대시보드';
  if(r.startsWith('guaranteed/')) return 'RUST 보증업체 | 안전한 토토사이트추천 및 가입코드 허브';
  if(r.startsWith('consult/')) return 'RUST 공식 상담 | @TRS999_bot 텔레그램 연결';
  return DEFAULT_TITLE;
}
function descFor(file){
  const r=rel(file);
  if(r.startsWith('blog/')) return 'RUST 블로그는 토토사이트추천, 스포츠입플, 카지노입플, 미니게임입플사이트, 롤링 조건, EV 계산법, 먹튀 구분법을 정리한 88st.cloud 정보 허브입니다.';
  if(r.startsWith('tools/')) return 'RUST 도구는 주소 확인, 가입코드 확인, 보너스 실수령, 롤링 조건, 배당 마진, 기대값 계산, 스포츠 분석, 이벤트 조건을 한 화면에서 실행하는 88st.cloud 분석 대시보드입니다.';
  if(r.startsWith('guaranteed/')) return 'RUST 보증업체 페이지는 SK 홀딩스, 여왕벌, ANY BET, UDT BET, 땅콩 BET의 가입코드, 상세보기, 공식주소 바로가기를 제공하는 88st.cloud 큐레이션 허브입니다.';
  if(r.startsWith('consult/')) return 'RUST 공식 상담센터 @TRS999_bot에서 보증업체, 가입코드, 공식주소, 카지노입플, 스포츠입플 조건을 빠르게 확인하세요.';
  return DEFAULT_DESC;
}
function ensureHead(html,file){
  const t=titleFor(file), d=descFor(file);
  html=html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`);
  const stripPatterns=[
    /<meta\s+name=["']description["'][^>]*>\s*/ig,
    /<meta\s+name=["']keywords["'][^>]*>\s*/ig,
    /<meta\s+property=["']og:title["'][^>]*>\s*/ig,
    /<meta\s+property=["']og:description["'][^>]*>\s*/ig,
    /<meta\s+property=["']og:site_name["'][^>]*>\s*/ig,
    /<meta\s+property=["']og:type["'][^>]*>\s*/ig,
    /<meta\s+name=["']twitter:card["'][^>]*>\s*/ig,
    /<link\s+rel=["']stylesheet["'][^>]*v76\.rust-brand-system\.css[^>]*>\s*/ig,
    /<script[^>]*v76\.rust-brand-system\.js[^>]*><\/script>\s*/ig
  ];
  for(const re of stripPatterns) html=html.replace(re,'');
  const meta = `\n  <meta name="description" content="${d}">\n  <meta name="keywords" content="${KEYWORDS}">\n  <meta property="og:type" content="website">\n  <meta property="og:site_name" content="RUST by 88ST">\n  <meta property="og:title" content="${t}">\n  <meta property="og:description" content="${d}">\n  <meta name="twitter:card" content="summary_large_image">\n  <link rel="stylesheet" href="${CSS}" data-v76-rust="true">`;
  if(/<meta\s+name=["']viewport["']/i.test(html)){
    html=html.replace(/(<meta\s+name=["']viewport["'][^>]*>)/i, `$1${meta}`);
  }else{
    html=html.replace(/<head>/i, `<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">${meta}`);
  }
  return html;
}
function header(){
  const desktop = nav.map(([href,label])=>`<a href="${href}">${label}</a>`).join('');
  const mobile = nav.map(([href,label])=>`<a href="${href}">${label}</a>`).join('');
  return `<header class="rust-global-header" id="rust-global-header" data-rust-brand-header="true">
  <div class="rust-header-inner">
    <a class="rust-brand" href="/" aria-label="RUST 메인으로 이동">
      <span class="rust-brand-mark" aria-hidden="true"><img src="/assets/img/rust/rust-emblem.svg" alt="" width="42" height="42" decoding="async"></span>
      <span class="rust-brand-type"><strong>RUST</strong><span>by 88ST</span></span>
    </a>
    <nav class="rust-desktop-nav" aria-label="RUST 주요 메뉴" data-rust-nav="desktop">${desktop}</nav>
    <button class="rust-menu-button" type="button" aria-label="메뉴 열기" aria-expanded="false" data-rust-menu-toggle><span></span><span></span></button>
  </div>
  <nav class="rust-mobile-menu" aria-label="RUST 모바일 메뉴" data-rust-nav="mobile-menu">${mobile}</nav>
</header>`;
}
function bottom(){
  const items = nav.map(([href,label,icon])=>`<a href="${href}"><span>${icon}</span>${label}</a>`).join('');
  return `<nav class="rust-bottom-nav" aria-label="RUST 모바일 하단 메뉴" data-rust-nav="bottom">${items}</nav>`;
}
function ensureBody(html){
  html=html.replace(/<header[^>]*class=["'][^"']*rust-global-header[^"']*["'][\s\S]*?<\/header>\s*/ig,'');
  html=html.replace(/<nav[^>]*class=["'][^"']*rust-bottom-nav[^"']*["'][\s\S]*?<\/nav>\s*/ig,'');
  html=html.replace(/<script[^>]*v76\.rust-brand-system\.js[^>]*><\/script>\s*/ig,'');
  html=html.replace(/<body([^>]*)>/i,(m,attrs)=>{
    if(/class=/i.test(attrs)){
      attrs=attrs.replace(/class=["']([^"']*)["']/i,(mm,c)=>`class="${c.split(/\s+/).filter(Boolean).filter(x=>x!=='rust-brand-system').concat('rust-brand-system').join(' ')}"`);
    }else attrs += ' class="rust-brand-system"';
    return `<body${attrs}>\n${header()}`;
  });
  html=html.replace(/<\/body>/i, `${bottom()}\n<script src="${JS}" defer data-v76-rust="true"></script>\n</body>`);
  return html;
}

const files = walk(ROOT).filter(f=>!rel(f).startsWith('admin/') && !rel(f).startsWith('ops/'));
let touched=0;
for(const f of files){
  let html=fs.readFileSync(f,'utf8');
  let next=ensureBody(ensureHead(html,f));
  if(next!==html){fs.writeFileSync(f,next); touched++;}
}
function walkAll(dir){
  const out=[];
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(['node_modules','.git'].includes(ent.name)) continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) out.push(...walkAll(p));
    else if(ent.isFile()) out.push(p);
  }
  return out;
}
const mdFiles = walkAll(ROOT).filter(f=>f.endsWith('.md'));
const cleanup = {
  version:'V76_RUST_BRAND_SYSTEM',
  touchedHtml:touched,
  scannedHtml:files.length,
  markdownRemovalCandidates:mdFiles.map(rel).sort(),
  assetRemovalCandidates:['assets/img/partners/v71-*.svg','legacy report markdown files','old version specific CSS/JS after final visual QA'],
  note:'No binary/image/code asset was deleted automatically. Markdown report files may be removed after owner confirmation.'
};
fs.writeFileSync(path.join(ROOT,'V76_RUST_REBRAND_CLEANUP_MANIFEST.json'), JSON.stringify(cleanup,null,2));
console.log(`[V76] RUST brand system generated. html=${files.length} touched=${touched}`);
