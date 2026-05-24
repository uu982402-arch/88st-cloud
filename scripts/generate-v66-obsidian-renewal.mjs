import fs from 'fs';
import path from 'path';
const root = process.cwd();
const cssHref = '/assets/css/v66.obsidian-dashboard.css?v=static-growth-conversion-v66';
const jsSrc = '/assets/js/v66.obsidian-dashboard.js?v=static-growth-conversion-v66';
const cssTag = `<link rel="stylesheet" href="${cssHref}" data-v66-obsidian="true">`;
const jsTag = `<script src="${jsSrc}" defer data-v66-obsidian="true"></script>`;
function walk(dir){
  let out=[];
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(['.git','node_modules'].includes(ent.name)) continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) out=out.concat(walk(p)); else if(ent.isFile()) out.push(p);
  }
  return out;
}
function rel(p){return path.relative(root,p).replaceAll('\\','/');}
function pageFromUrl(u){
  try{const url=new URL(u); let p=decodeURI(url.pathname); if(p==='/'||p==='') return 'index.html'; if(p.endsWith('/')) return p.slice(1)+'index.html'; return p.slice(1);}catch{return null;}
}
function inject(file){
  let html=fs.readFileSync(file,'utf8');
  if(!html.includes('data-v66-obsidian="true"')){
    html=html.replace(/<\/head>/i, `${cssTag}</head>`);
    html=html.replace(/<\/body>/i, `${jsTag}</body>`);
  }
  html=html.replace(/<meta name="theme-color" content="#[^"]*">/i,'<meta name="theme-color" content="#05070b">');
  html=html.replace(/<body([^>]*)class="([^"]*)"/i,(m,a,c)=>`<body${a}class="${c} v66-obsidian-renewal"`);
  if(!/<body[^>]*class=/i.test(html)) html=html.replace(/<body([^>]*)>/i,'<body$1 class="v66-obsidian-renewal">');
  fs.writeFileSync(file,html);
}
const providers=[
  {slug:'queenbee',name:'여왕벌',label:'QUEENBEE',amount:'보증금액 1억',domain:'qb-700.com',code:'seoa',href:'https://qb-700.com/?code=seoa',note:'신규·USDT·미니게임 혜택 중심',img:'/assets/vendor-logos/v59/queenbee-card.svg'},
  {slug:'sk-holdings',name:'SK 홀딩스',label:'SK HOLDINGS',amount:'보증금액 1억',domain:'snk-99.com',code:'IRON888',href:'https://snk-99.com/',note:'입금 플러스·VIP 이벤트 중심',img:'/assets/vendor-logos/v59/sk-holdings-card.svg'},
  {slug:'anybet',name:'ANY BET',label:'ANY BET',amount:'보증금액 1억',domain:'any-777.com',code:'seoa',href:'https://any-777.com/',note:'원화·USDT 첫충 혜택 중심',img:'/assets/vendor-logos/v59/anybet-card.svg'},
  {slug:'udt',name:'UDT BET',label:'UDT BET',amount:'보증금액 1억',domain:'특공대.COM',code:'SEOA',href:'https://udt-01.com/',note:'미니게임·파워볼·페이백 중심',img:'/assets/vendor-logos/v59/udt-card.svg'},
  {slug:'ddangkong',name:'땅콩 BET',label:'DDANGKONG',amount:'보증금액 1억',domain:'ddk-2025.com',code:'ddk888',href:'https://ddk-2025.com',note:'카지노·슬롯 콤프 중심',img:'/assets/vendor-logos/v59/ddangkong-card.svg'}
];
function providerCard(p){return `<article class="v66-provider" data-v66-provider="${p.slug}">
  <a class="v66-provider-logo" href="/guaranteed/${p.slug}/" aria-label="${p.name} 상세보기"><img src="${p.img}" alt="${p.name} 로고" width="640" height="240" loading="eager" decoding="async"></a>
  <div class="v66-provider-meta">
    <div class="v66-provider-title"><h2>${p.name}</h2><span>${p.amount}</span></div>
    <p>${p.note}</p>
    <div class="v66-provider-info"><div><small>업체명</small><b>${p.label}</b></div><div><small>공식 도메인</small><b>${p.domain}</b></div><div><small>가입코드</small><code>${p.code}</code></div></div>
    <div class="v66-provider-actions"><button type="button" data-v66-copy-code="${p.code}" aria-label="${p.name} 가입코드 복사">가입코드 복사</button><a class="go" href="${p.href}" target="_blank" rel="nofollow sponsored noopener noreferrer">즉시이동 CTA</a></div>
  </div>
</article>`}
function rewriteGuaranteed(){
  const f=path.join(root,'guaranteed/index.html');
  if(!fs.existsSync(f)) return;
  let html=fs.readFileSync(f,'utf8');
  const title='88ST.Cloud 보증업체 | V66 Obsidian Dashboard';
  html=html.replace(/<title>[^<]*<\/title>/i,`<title>${title}</title>`);
  const body=`<main id="main" class="v66-guaranteed-main">
  <section class="v66-guaranteed-wrap" aria-label="보증업체 리스트">
    <div class="v66-guaranteed-head">
      <div><span class="v66-kicker">GUARANTEED PARTNERS</span><h1>보증업체를 바로 비교하고 이동합니다.</h1><p>큰 설명 영역을 제거하고 업체명, 보증금액, 도메인, 가입코드, 즉시이동 CTA만 대시보드 카드로 정렬했습니다.</p></div>
    </div>
    <div class="v66-provider-grid">${providers.map(providerCard).join('\n')}</div>
    <section class="v66-consult-card" aria-label="상담센터 연결"><div><h2>업체 선택 전 확인이 필요하면 상담센터로 연결하세요.</h2><p>코드, 도메인, 이벤트 조건을 정리해서 빠르게 확인합니다.</p></div><a href="https://t.me/TRS999_bot" target="_blank" rel="nofollow noopener noreferrer">상담센터 바로가기</a></section>
  </section>
</main>`;
  html=html.replace(/<body[^>]*>[\s\S]*?<\/body>/i,`<body class="v66-obsidian-renewal">${body}${jsTag}</body>`);
  if(!html.includes(cssTag)) html=html.replace(/<\/head>/i,`${cssTag}</head>`);
  fs.writeFileSync(f,html);
}
const htmlFiles=walk(root).filter(f=>f.endsWith('.html'));
for(const f of htmlFiles) inject(f);
rewriteGuaranteed();
const sitemapPath=path.join(root,'sitemap.txt');
let sitemapRows=[]; let matched=0; let missing=[];
if(fs.existsSync(sitemapPath)){
  const urls=fs.readFileSync(sitemapPath,'utf8').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  for(const u of urls){const p=pageFromUrl(u); const ok=p && fs.existsSync(path.join(root,p)); if(ok) matched++; else missing.push({url:u,path:p||''}); sitemapRows.push({url:u,path:p||'',status:ok?'OK':'MISSING'});}
}
const groups={main:[],blog:[],tools:[],guaranteed:[],consult:[],faq:[],other:[]};
for(const row of sitemapRows){let key='other'; if(row.path==='index.html') key='main'; else if(row.path.startsWith('blog/')) key='blog'; else if(row.path.startsWith('tools/')||row.path.startsWith('tool-')) key='tools'; else if(row.path.startsWith('guaranteed/')) key='guaranteed'; else if(row.path.startsWith('consult')) key='consult'; else if(row.path.startsWith('faq/')) key='faq'; groups[key].push(row);}
const report=`# V66 sitemap.txt 전수 점검 및 리뉴얼 완료 명세서\n\n- 기준 파일: V65 최신 FULL ZIP 내부 sitemap.txt\n- sitemap URL 수: ${sitemapRows.length}\n- 매칭 성공: ${matched}\n- 누락: ${missing.length}\n- 리뉴얼 적용 HTML: ${htmlFiles.length}\n- 디자인 기준: Deep Charcoal / Obsidian Black Base, glassmorphism dashboard, 44px touch target, global header/footer/mobile bottom nav/FAB\n\n## 영역별 점검\n\n| 영역 | 페이지 수 | 처리 상태 |\n|---|---:|---|\n| 메인 | ${groups.main.length} | V66 다크 SaaS 공통 시스템 적용 |\n| 블로그 | ${groups.blog.length} | 글/카테고리 전 페이지 공통 헤더·카드·푸터·FAB 적용 |\n| 도구 | ${groups.tools.length} | 오로라 카드 텍스트 고대비 강제 및 공통 레이아웃 적용 |\n| 보증업체 | ${groups.guaranteed.length} | /guaranteed 카드 아키텍처 직접 재작성, 하위 페이지 공통 시스템 적용 |\n| 고객센터/상담 | ${groups.consult.length} | 공통 상담 FAB 및 하단 상담 흐름 적용 |\n| FAQ | ${groups.faq.length} | 공통 카드형 다크 가독성 적용 |\n| 기타 | ${groups.other.length} | 공통 안전 레이아웃 적용 |\n\n## 페이지별 공통 변경 포인트\n\n1. 기존 페이지 구조와 URL/API/라우팅은 유지하고, V66 공통 CSS/JS를 모든 HTML에 삽입했습니다.\n2. PC에서 모바일 하단바가 떠 보이는 문제는 1100px 이상에서 하단 내비게이션을 숨기는 표준 규칙으로 차단했습니다.\n3. 모바일은 5탭 하단 내비게이션을 공통 컴포넌트로 통일했습니다.\n4. 우측 하단 상담 FAB를 전 페이지 공통으로 복원했습니다.\n5. 카드, 섹션, 입력창, CTA 버튼은 반투명 블러, border white/10 계열, 300ms 전환 효과로 통일했습니다.\n6. /tools 계열 카드 텍스트는 밝은 오로라 배경에서도 묻히지 않도록 검정 텍스트와 강한 font-weight를 강제했습니다.\n7. /guaranteed는 큰 히어로를 제거하고 업체 카드가 상단부터 바로 노출되도록 직접 재구성했습니다.\n\n## 누락 URL\n\n${missing.length?missing.map(m=>`- ${m.url} -> ${m.path}`).join('\n'):'- 없음'}\n`;
fs.writeFileSync(path.join(root,'V66_SITEMAP_RENEWAL_REPORT.md'),report);
const change=`# V66 변경/삭제 완료 명세서\n\n## 변경 파일 핵심\n\n- package.json: build 파이프라인 끝에 V66 리뉴얼 생성 스크립트 연결\n- scripts/generate-v66-obsidian-renewal.mjs: sitemap 전수 파싱, 전 HTML 주입, /guaranteed 재작성, 보고서 생성\n- assets/css/v66.obsidian-dashboard.css: 전 페이지 프리미엄 다크 SaaS 디자인 시스템\n- assets/js/v66.obsidian-dashboard.js: 공통 헤더, 모바일 하단 내비게이션, 상담 FAB, 코드 복사 토스트, 이미지 오류 방어\n- guaranteed/index.html 외 HTML ${htmlFiles.length}개: V66 공통 자산 주입\n\n## 실제 삭제 파일\n\n- 없음\n\n## 제거 후보\n\n실제 삭제는 하지 않았습니다. 기존 라우팅/빌드 안정성을 우선하여 레거시 CSS/JS는 보존하고 V66 오버레이 시스템으로 통합했습니다. 향후 라이브 확인 뒤 의존성 없는 버전별 CSS/JS(v52~v65 중 미사용)를 후보로 재점검할 수 있습니다.\n`;
fs.writeFileSync(path.join(root,'V66_CHANGE_DELETE_REPORT.md'),change);
const checklist=`# V66 엔지니어링 검증 포인트\n\n## 완료 검증\n\n- npm run build 실행 대상에 V66 생성 스크립트 포함\n- sitemap.txt URL 매칭 리포트 생성\n- 모든 HTML에 V66 CSS/JS 주입\n- /guaranteed 카드 구조 직접 리뉴얼\n\n## 해상도 체크리스트\n\n- 320px: 카드 1열, 버튼 44px 이상, 상담 FAB 축약 표시\n- 390px~430px: 모바일 하단 5탭 정상, 텍스트 줄바꿈 방어\n- 768px~1024px: 카드 자동 1~2열 확장\n- 1100px 이상: 모바일 하단바 숨김, PC 헤더만 노출\n- 1920px~2560px: max-width 확장, 카드 그리드 3열 대응\n\n## 예외 처리\n\n- 이미지 로딩 실패 시 display none 처리 및 data-image-error 부여\n- clipboard 실패 시 페이지 오류 없이 토스트 흐름 유지\n- 기존 footer/header는 숨김 처리 후 V66 공통 컴포넌트 삽입\n- 기존 라우팅과 외부 링크는 유지\n`;
fs.writeFileSync(path.join(root,'V66_ENGINEERING_CHECKLIST.md'),checklist);
console.log(`V66 renewal complete: html=${htmlFiles.length}, sitemap=${sitemapRows.length}, matched=${matched}, missing=${missing.length}`);
