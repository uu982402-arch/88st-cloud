import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-growth-conversion-v51-20260522';
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => fs.writeFileSync(path.join(ROOT, p), s, 'utf8');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function walk(dir, out=[]) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules','.git','__MACOSX'].includes(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

// V49 generator intentionally rewrites gen-build-ver to the current major; restore V50 after it runs.
{
  const genBuild = path.join(ROOT, 'scripts/gen-build-ver.mjs');
  if (fs.existsSync(genBuild)) {
    let g = fs.readFileSync(genBuild, 'utf8');
    g = g.replace(/static-growth-conversion-v\d+-\$\{compact\}/g, 'static-growth-conversion-v50-${compact}');
    fs.writeFileSync(genBuild, g, 'utf8');
  }
}

const providers = [
  { slug:'queenbee', name:'여왕벌', label:'QUEENBEE', img:'/assets/vendor-logos/v59/queenbee-card.svg', detail:'/guaranteed/queenbee/' },
  { slug:'sk-holdings', name:'SK 홀딩스', label:'SK HOLDINGS', img:'/assets/vendor-logos/v59/sk-holdings-card.svg', detail:'/guaranteed/sk-holdings/' },
  { slug:'anybet', name:'ANYBET', label:'ANYBET', img:'/assets/vendor-logos/v59/anybet-card.svg', detail:'/guaranteed/anybet/' },
  { slug:'udt', name:'UDT', label:'UDT', img:'/assets/vendor-logos/v59/udt-card.svg', detail:'/guaranteed/udt/' },
  { slug:'ddangkong', name:'땅콩', label:'DDANGKONG', img:'/assets/vendor-logos/v59/ddangkong-card.svg', detail:'/guaranteed/ddangkong/' }
];

function classAdd(html, selector, addClass) {
  return html.replace(selector, (m) => m.includes(addClass) ? m : m.replace(/"$/, ` ${addClass}"`));
}

// Guaranteed index compact layout markers
{
  let html = read('guaranteed/index.html');
  html = html.replace(/<body class="([^"]*)"/, (m, cls) => `<body class="${cls.includes('v50-guaranteed-page') ? cls : cls + ' v50-guaranteed-page'}"`);
  html = html.replace(/class="moon-container v47-guaranteed-hero v48-guaranteed-hero v49-guaranteed-hero"/, 'class="moon-container v47-guaranteed-hero v48-guaranteed-hero v49-guaranteed-hero v50-guaranteed-hero"');
  html = html.replace(/<section class="moon-container guarantee-container v48-guarantee-container v49-guarantee-container"/, '<section id="providerCards" class="moon-container guarantee-container v48-guarantee-container v49-guarantee-container v50-guarantee-container"');
  html = html.replace(/premium-card v47-guaranteed-card v48-guaranteed-card v49-guaranteed-card/g, 'premium-card v47-guaranteed-card v48-guaranteed-card v49-guaranteed-card v50-guaranteed-card');
  html = html.replace(/vendor-hero v48-vendor-hero v49-vendor-hero/g, 'vendor-hero v48-vendor-hero v49-vendor-hero v50-vendor-hero');
  html = html.replace(/card-body v49-card-body/g, 'card-body v49-card-body v50-card-body');
  html = html.replace(/v49-card-actions/g, 'v49-card-actions v50-card-actions');
  html = html.replace(/static-growth-conversion-v\d+-\d+/g, VERSION);
  write('guaranteed/index.html', html);
}

// Tools page compact provider row + safer markup
{
  let html = read('tools/index.html');
  html = html.replace(/<body class="([^"]*)"/, (m, cls) => `<body class="${cls.includes('v50-tools-index') ? cls : cls + ' v50-tools-index'}"`);
  const providerCards = providers.map(p => `<a class="v50-provider-mini-card" href="${p.detail}" aria-label="${esc(p.name)} 상세보기"><img alt="${esc(p.name)} 로고" decoding="async" loading="lazy" src="${p.img}" width="320" height="120"/><span>${esc(p.name)}</span><small>${esc(p.label)}</small></a>`).join('\n');
  const strip = `<section class="moon-section v37-provider-strip v38-tools-provider-strip v50-tools-provider-strip">
<div class="moon-section-head"><h2>보증업체</h2><a href="/guaranteed/">전체 보기 →</a></div>
<div aria-label="보증업체 상세 랜딩 빠른 이동" class="v50-provider-row">
${providerCards}
</div>
</section>`;
  html = html.replace(/<section class="moon-section v37-provider-strip[\s\S]*?<\/section>/, strip);
  html = html.replace(/<img alt="88ST\.Cloud" height="66" src="\/img\/logo-v24\.png" width="260"\/ decoding="async" loading="eager" fetchpriority="high">/g, '<img alt="88ST.Cloud" height="66" src="/img/logo-v24.png" width="260" decoding="async" loading="eager" fetchpriority="high"/>');
  html = html.replace(/static-growth-conversion-v\d+-\d+/g, VERSION);
  write('tools/index.html', html);
}

// CSS: compact guaranteed cards + tools polish
{
  const cssPath = 'assets/css/growth-conversion.v36.css';
  let css = read(cssPath);
  css = css.replace(/\/\* V50 GUARANTEED COMPACT \+ TOOLS POLISH START \*\/[\s\S]*?\/\* V50 GUARANTEED COMPACT \+ TOOLS POLISH END \*\//, '').trimEnd();
  css += `\n/* V50 GUARANTEED COMPACT + TOOLS POLISH START */\n.v50-guaranteed-page .v50-guaranteed-hero{padding:18px 0 8px!important}.v50-guaranteed-page .v50-guaranteed-hero span{font-size:10px!important;letter-spacing:.18em}.v50-guaranteed-page .v50-guaranteed-hero h1{font-size:clamp(24px,3vw,38px)!important;line-height:1.08!important;margin-top:6px!important}.v50-guaranteed-page .v50-guaranteed-hero p{font-size:13.5px!important;max-width:720px!important;margin-top:8px!important}.v50-guaranteed-page .v50-guarantee-container{grid-template-columns:repeat(auto-fit,minmax(188px,220px))!important;justify-content:center!important;align-items:start!important;gap:14px!important;padding:12px 0 36px!important}.v50-guaranteed-page .v50-guaranteed-card{width:100%!important;max-width:220px!important;min-height:0!important;border-radius:16px!important;background:linear-gradient(180deg,rgba(25,28,41,.80),rgba(7,12,22,.96))!important;box-shadow:0 10px 34px rgba(0,0,0,.24)!important}.v50-guaranteed-page .v50-guaranteed-card:hover{transform:translateY(-3px)!important;box-shadow:0 14px 36px rgba(99,102,241,.16),0 22px 54px rgba(0,0,0,.24)!important}.v50-guaranteed-page .v50-vendor-hero{margin:9px 9px 0!important;aspect-ratio:16/6!important;border-radius:12px!important}.v50-guaranteed-page .v50-vendor-hero img{padding:9px!important;filter:drop-shadow(0 9px 18px rgba(0,0,0,.38))!important}.v50-guaranteed-page .v50-card-body{padding:11px!important;gap:7px!important}.v50-guaranteed-page .v49-card-title-row span{font-size:9px!important;letter-spacing:.13em!important}.v50-guaranteed-page .v49-card-title-row .vendor-title{font-size:16px!important;line-height:1.12!important;margin-top:2px!important}.v50-guaranteed-page .info-row{display:grid!important;gap:4px!important;align-items:start!important;margin-bottom:6px!important;padding:8px 9px!important;border-radius:10px!important}.v50-guaranteed-page .info-label{font-size:11px!important}.v50-guaranteed-page .domain-link{font-size:12px!important;text-align:left!important;line-height:1.25!important}.v50-guaranteed-page .code-badge{font-size:12px!important;line-height:1!important;padding:6px 8px!important;width:max-content!important}.v50-guaranteed-page .v50-card-actions{grid-template-columns:1fr 1fr!important;gap:7px!important}.v50-guaranteed-page .v50-card-actions .detail-btn,.v50-guaranteed-page .v50-card-actions .action-btn{min-height:36px!important;border-radius:10px!important;font-size:12.5px!important;margin:0!important;padding:0 6px!important}.v50-tools-index .v37-list-page{padding-top:18px!important}.v50-tools-index .moon-tool-grid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;gap:12px!important}.v50-tools-index .moon-tool-card{min-height:0!important;padding:18px!important;border-radius:18px!important}.v50-tools-index .moon-tool-card h2{font-size:18px!important}.v50-tools-index .moon-tool-card p{font-size:13.5px!important;line-height:1.6!important}.v50-tools-provider-strip{margin-top:18px!important}.v50-provider-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.v50-provider-mini-card{display:grid;gap:8px;align-content:center;min-height:132px;padding:12px;border:1px solid rgba(215,228,255,.14);border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.03));text-decoration:none;color:#e7eefb;transition:transform .18s ease,border-color .18s ease}.v50-provider-mini-card:hover{transform:translateY(-2px);border-color:rgba(245,215,139,.36)}.v50-provider-mini-card img{width:100%;height:58px;object-fit:contain;filter:drop-shadow(0 10px 18px rgba(0,0,0,.35))}.v50-provider-mini-card span{font-weight:950;color:#fff4df}.v50-provider-mini-card small{color:#8bd5ff;font-size:10px;font-weight:900;letter-spacing:.12em}@media(max-width:760px){.v50-guaranteed-page .v50-guarantee-container{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;padding-inline:10px!important}.v50-guaranteed-page .v50-guaranteed-card{max-width:none!important}.v50-guaranteed-page .v50-card-actions{grid-template-columns:1fr!important}.v50-tools-index .moon-tool-grid{grid-template-columns:1fr!important}.v50-provider-row{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:430px){.v50-guaranteed-page .v50-guarantee-container,.v50-provider-row{grid-template-columns:1fr!important}.v50-guaranteed-page .v50-vendor-hero{aspect-ratio:16/6.5!important}}\n/* V50 GUARANTEED COMPACT + TOOLS POLISH END */\n`;
  css = css.replace(/static-growth-conversion-v\d+-\d+/g, VERSION);
  write(cssPath, css);
}

// 500-item tools roadmap JSON for the next tool expansion planning
const categories = [
  ['domain_dns_ssl','도메인·DNS·SSL 공개 신호 도구',['WHOIS 생성일 확인','WHOIS 만료일 확인','네임서버 변경 이력 메모','A 레코드 구조 확인','CNAME 구조 확인','MX 레코드 유무 확인','CAA 레코드 확인','SSL 발급자 확인','SSL 만료일 확인','SAN 도메인 일치 확인','HTTP→HTTPS 리다이렉트 확인','www/non-www 정규화 확인','punycode 도메인 변환','유사문자 도메인 탐지','하이픈/숫자 변조 패턴 탐지','서브도메인 사칭 패턴 탐지','도메인 나이 위험 점수','DNS TTL 확인','robots/sitemap 위치 확인','canonical 도메인 일치 확인','OG URL 도메인 일치 확인','favicon 해시 비교','브랜드명-도메인 문자열 거리','도메인 변경 메모장','주소 확인 리포트 출력']],
  ['url_redirect_phishing','URL·리다이렉트·피싱 판독 도구',['리다이렉트 체인 표시','meta refresh 탐지','JS location 이동 탐지','short URL 확장','쿼리 파라미터 위험도','utm 파라미터 정리','앵커 링크 무결성','외부 링크 rel 검사','target blank rel 검사','문자열 난독화 탐지','iframe 삽입 탐지','폼 action 도메인 검사','로그인 폼 mixed-content 검사','복사한 주소 정규화','한글 도메인 표시/변환','사칭 URL 비교표','브랜드명 포함 URL 점수','과도한 팝업 스크립트 탐지','브라우저 경고 체크리스트','링크 스냅샷 저장','URL 검사 결과 공유문 생성','위험 파라미터 하이라이트','리다이렉트 최종 도착지 요약','공식주소 대비 차이점','피싱 의심 근거 리포트']],
  ['sports_odds_math','스포츠 배당·EV·환수율 도구',['1X2 오버라운드 계산','2-way 마진 계산','아시안핸디캡 -0.25 분할 계산','아시안핸디캡 -0.75 분할 계산','언더오버 2.25 분할 계산','언더오버 2.75 분할 계산','공정확률 변환','소수 배당→확률 변환','확률→공정 배당 변환','EV 계산','Kelly stake 계산','half-Kelly 계산','조합 배당 마진 누적','초기배당-현재배당 차이','배당 급락률 계산','closing line value 메모','핸디캡 push 처리','야구 선발투수 변경 메모','KBO 우천취소 체크','농구 pace 지표 입력','배구 세트핸디캡 비교','월드컵 조별/토너먼트 구분','인기팀 쏠림 메모','라이브 배팅 지연 체크','스포츠 이벤트 기대값 요약']],
  ['casino_live_math','라이브카지노 수학·라운드 검증 도구',['바카라 Banker 수수료 EV','바카라 Player EV','바카라 Tie 하우스엣지','바카라 페어 배당 기대값','라운드 ID 메모','테이블 ID 메모','결과 캡처 체크리스트','블랙잭 basic strategy 요약','블랙잭 보험 EV','블랙잭 split 조건 확인','블랙잭 double 조건 확인','룰렛 유럽식 하우스엣지','룰렛 미국식 하우스엣지','룰렛 베팅 유형별 배당표','라이브딜러 지연 메모','정산 지연 사유 분류','테이블 한도 비교','게임 공급사 표기 확인','excluded game list 메모','max cashout 조건 계산','wagering contribution 표','라이브 이벤트 조건 파서','라운드 증빙 묶음 생성','카지노 약관 조항 하이라이트','카지노 리스크 요약 카드']],
  ['slot_rtp_variance','슬롯 RTP·분산·보너스 도구',['RTP 표기값 입력','가변 RTP range 비교','theoretical RTP 설명 카드','observed RTP 샘플 계산','변동성 등급 메모','단기 분산 시뮬레이션','bankroll drawdown 계산','free spin contribution 계산','bonus buy 비용 대비 EV','max win cap 영향 계산','payline 방식 설명','ways 방식 설명','cluster 방식 설명','Megaways 경우의 수 메모','xNudge 기능 메모','xWays 기능 메모','scatter 조건 메모','wild 기능 메모','tumble 기능 메모','progressive jackpot pool 메모','Hold and Win 구조표','provider official game list 체크','데모/실게임 차이 기록','slot session limit 계산','슬롯 약관 제외 게임 정리']],
  ['minigame_probability','미니게임 확률·회차 검증 도구',['파워볼 홀짝 확률표','파워볼 언오버 확률표','파워볼 조합 마진 계산','회차 ID 기록','결과 발표 시각 기록','독립시행 설명 카드','연속패턴 착시 체크','마틴게일 파산확률 계산','Gambler ruin 입력 계산','사다리 좌우 확률표','사다리 홀짝 조합표','사다리 확률 트리','동행파워볼 공식 결과 링크 메모','동행스피드키노 번호 조합 계산','키노 번호 빈도 메모','결과 정정 기준 메모','결과 지연 정산 분류','미니게임 인정 회차 체크','제외 회차 체크','round proof 캡처 체크리스트','API provider 표기 메모','hash value 기록란','해시 비교 설명 카드','루틴 배팅 리스크 요약','미니게임 이벤트 조건 요약']],
  ['bonus_rolling_payout','보너스·롤링·출금 조건 도구',['첫충 보너스 실수령 계산','매충 보너스 실수령 계산','롤링 배수 계산','turnover required 계산','입금+보너스 합산 기준','보너스 제외 게임 체크','최대출금 한도 계산','max cashout 적용 후 실수령','쿠폰 금액 반영 계산','페이백 퍼센트 계산','콤프 적립률 계산','슬롯 콤프 계산','카지노 콤프 계산','룰렛 쿠폰 가치 산정','페이백 정산 주기 메모','이벤트 중복 적용 여부','복귀 이벤트 조건 정리','지인추천 조건 정리','출석체크 누적값 계산','충전 구간별 혜택 비교','스포츠/카지노/슬롯 기여도 표','롤링 부족분 계산','출금 전 자료 체크리스트','약관 독소조항 하이라이트','조건표 공유 이미지 생성']],
  ['vendor_partner_ops','보증업체·파트너 운영 도구',['업체 카드 데이터 검증','가입코드 중복 노출 검사','도메인 누락 검사','상세보기 링크 검사','바로가기 링크 검사','로고 이미지 누락 검사','로고 비율 검사','업체별 이벤트 갱신일','이벤트 변경 로그','업체별 태그 정리','업체별 혜택 비교표','업체별 게임 카테고리 지원표','업체별 충전 혜택 표','업체별 페이백 표','업체별 콤프 표','업체별 주의 조항 메모','상세 랜딩 SEO 점수','카드 클릭 이벤트 QA','코드 복사 이벤트 QA','도메인 클릭 이벤트 QA','업체 카드 모바일 QA','업체 카드 PC QA','이미지 fallback 점검','sponsored rel 검사','보증업체 sitemap 검사']],
  ['content_seo_blog','블로그·SEO 콘텐츠 QA 도구',['title 중복 검사','description 중복 검사','canonical 누락 검사','schema 누락 검사','H1 누락 검사','H2 번호 중복 검사','본문 3000자 검사','반복 결론 문단 탐지','템플릿 문단 유사도 검사','금지 상담 문구 검사','키워드 밀도 계산','내부링크 개수 계산','외부링크 rel 검사','관련글 과다 검사','noindex 포함 검사','sitemap 포함 검사','meta keywords 차단','OG title 검사','OG image 검사','breadcrumb schema 검사','Article schema 검사','thin content 후보 추출','legacy 파일 후보 추출','GSC 색인 우선순위 산출','블로그 시각 QA 점수']],
  ['technical_audit_build','빌드·배포·정적 QA 도구',['npm build 결과 요약','npm verify 결과 요약','JS syntax 전체 검사','MJS syntax 전체 검사','JSON parse 전체 검사','HTML 파일 수 카운트','sitemap URL 수 카운트','sitemap missing file 검사','dead internal link 검사','missing asset 검사','bad href 검사','href # 검사','javascript void 검사','worker safe mode 검사','PRAGMA 문자열 검사','CREATE TABLE 문자열 검사','CREATE INDEX 문자열 검사','schemaSQL 문자열 검사','foreign_keys 문자열 검사','ZIP testzip 검사','패치 변경 파일 카운트','FULL ZIP 용량 검사','asset inventory 생성','빌드 버전 표시','배포 후 확인 URL 출력']],
  ['performance_cwv','성능·Core Web Vitals 도구',['이미지 width/height 검사','lazy loading 누락 검사','eager 이미지 과다 검사','CSS 파일 수 점검','JS defer 누락 검사','preload 이미지 검사','font preload 검사','unused CSS 후보','inline style 과다 검사','LCP 후보 이미지 표시','CLS 위험 요소 표시','FID/INP 위험 JS 표시','DOM 노드 수 점검','HTML 용량 점검','이미지 총 용량 점검','WebP 후보 추출','PNG 대체 후보 추출','cache query version 검사','Cloudflare cache purge URL 목록','critical CSS 후보','페이지별 script 조건부 실행표','bundle 크기 리포트','mobile 390px QA','desktop 1440px QA','성능 개선 우선순위']],
  ['accessibility_ui','접근성·UI 일관성 도구',['색 대비 계산','focus-visible 누락 검사','skip-link 확인','button aria-label 검사','img alt 누락 검사','nav aria-label 검사','touch target 크기 검사','모바일 overflow 검사','헤더 줄바꿈 검사','sticky header z-index 검사','카드 radius 일관성 검사','shadow 과다 검사','링크 밑줄 정책 검사','폼 label 연결 검사','input placeholder 길이 검사','keyboard tab 순서','모달 focus trap 점검','toast aria-live 검토','텍스트 clamp 검사','모바일 글자 크기 검사','다크/화이트 배경 충돌 검사','버튼 상태 hover/focus/active','카드 grid 균형 검사','안전영역 inset 대응','UI 회귀 스냅샷 메모']],
  ['consult_flow','고객센터·상담 흐름 QA 도구',['상담 CTA 단일 흐름 검사','상담 버튼 링크 검사','상담 start 파라미터 검사','구버전 봇명 검사','금지 연락처 검사','고객센터 페이지 hero 높이 검사','고객센터 버튼 대비 검사','상담 문구 과다 검사','개인정보 입력 유도 문구 검사','문의 문구 템플릿 생성','출금 전 증빙 목록 생성','이벤트 문의 문구 생성','도메인 확인 문의 문구 생성','코드 확인 문의 문구 생성','상담 목적 분류','상담 답변 캡처 체크리스트','상담 CTA GA4 이벤트','상담 링크 rel 검사','상담 페이지 sitemap 검사','상담 페이지 meta 검사','상담 페이지 noindex 확인','상담 버튼 모바일 full width','상담 단계 3줄 요약','상담 전제조건 문구 검수','고객센터 회귀 테스트']],
  ['analytics_ga4','GA4·이벤트 분석 도구',['page_view 정상 수집 체크','blog_filter_click 이벤트','blog_search 이벤트','tool_open 이벤트','provider_detail_click 이벤트','provider_domain_click 이벤트','provider_code_copy 이벤트','consult_click 이벤트','outbound_click 이벤트','scroll_depth 이벤트','copy_success 이벤트','form_submit 이벤트','error_event 이벤트','404 감지 이벤트','CTA 위치별 이벤트명 표준화','event parameter 길이 검사','UTM 보존 검사','referrer 분류','landing page 그룹화','blog category 그룹화','provider slug 그룹화','tools funnel 정의','conversion path 요약','GA4 debug mode 메모','이벤트 QA 리포트']],
  ['search_indexing','색인·검색노출 운영 도구',['오늘 색인 요청 15개 산출','신규 글 색인 우선순위','카테고리 허브 우선순위','보증업체 상세 우선순위','sitemap 제출 체크','lastmod 변경 파일 목록','noindex 파일 목록','canonical mismatch 목록','검색 의도별 URL 묶음','seasonal URL 묶음','월드컵 URL 묶음','KBO URL 묶음','슬롯 게임사 URL 묶음','카지노 공급사 URL 묶음','미니게임 URL 묶음','먹튀검증 URL 묶음','오래된 URL 갱신 후보','중복 URL 제거 후보','페이지네이션 색인 정책','GSC 수동 요청 큐','색인 제외 사유 메모','URL inspection 체크리스트','CTR 개선 title 후보','description 개선 후보','검색노출 운영 로그']],
  ['security_privacy','보안·개인정보 안전 도구',['민감정보 문자열 검사','텔레그램 구버전 ID 검사','이메일 노출 검사','전화번호 노출 검사','토큰 패턴 검사','API 키 패턴 검사','Cloudflare token 패턴 검사','wrangler 설정 노출 검사','source map 노출 검사','admin 경로 robots 검사','ops 경로 robots 검사','api 경로 robots 검사','CSP 후보 생성','X-Content-Type header 확인','referrer-policy 확인','permissions-policy 확인','외부 스크립트 목록','외부 이미지 목록','nofollow/sponsored 링크 검사','사용자 입력 저장 여부 검사','개인정보 입력 폼 탐지','쿠키 사용 여부 점검','로컬스토리지 사용 점검','보안 헤더 리포트','배포 전 민감정보 스캔']],
  ['forms_inputs','입력폼·계산기 UX 도구',['input type 검사','number input min/max 검사','placeholder 짧게 만들기','error message 일관화','copy button 상태 복구','reset button 제공','결과 박스 다크톤 검사','결과 공유 텍스트 생성','입력값 trim 처리','한글 도메인 입력 처리','대소문자 코드 정규화','콤마 금액 입력 처리','퍼센트 입력 처리','배당 소수점 검사','잘못된 수식 입력 안내','모바일 키보드 타입','autofocus 제거 검사','form preventDefault 검사','no-JS fallback 안내','계산 결과 aria-live','도구별 예시 입력','도구별 빈값 처리','도구별 최대값 보호','도구별 GA4 이벤트','입력폼 회귀 테스트']],
  ['data_management','데이터·콘텐츠 관리 도구',['업체 데이터 JSON 검증','블로그 데이터 JSON 검증','검색 키워드 JSON 검증','로드맵 JSON 검증','sitemap source 목록','카테고리별 글 수 통계','slug 중복 검사','파일명 규칙 검사','한글 파일명 검사','이미지 매핑 검사','provider 이미지 매핑 검사','vendor detail 매핑 검사','legacy 후보 목록','삭제 후보 목록','noindex 후보 목록','최근 업데이트 파일 목록','대량 변경 diff 요약','패치 파일 목록 생성 금지 검사','설명 MD 생성 금지 검사','DELETE_FILES 생성 금지 검사','PATCH_MANIFEST 생성 금지 검사','빌드 데이터 버전 표시','데이터 스키마 설명','정적 데이터 압축 후보','데이터 회귀 테스트']],
  ['visual_regression','시각 회귀·디자인 QA 도구',['홈 첫 화면 QA','블로그 목록 QA','블로그 상세 QA','도구 페이지 QA','보증업체 페이지 QA','업체 상세 랜딩 QA','고객센터 QA','헤더 PC QA','헤더 모바일 QA','푸터 QA','카드 크기 QA','카드 간격 QA','버튼 색 대비 QA','노란 버튼 글자색 QA','흰 배경 재발 QA','이미지 찌그러짐 QA','로고 잘림 QA','긴 제목 줄바꿈 QA','모바일 360px QA','모바일 390px QA','태블릿 768px QA','PC 1440px QA','초대형 1920px QA','스크롤바 overflow QA','시각 점검 체크리스트']],
  ['future_ai_assist','AI 보조·해석 도구 후보',['약관 문장 요약','이벤트 조건 자동 분류','롤링 조건 자동 추출','최대출금 조건 자동 추출','제외 게임 자동 추출','주소 공지 자동 비교','도메인 변경 요약','배당판 수식 설명','슬롯 RTP 설명','바카라 하우스엣지 설명','미니게임 파산확률 설명','피싱 URL 근거 설명','SEO title 후보 생성','description 후보 생성','FAQ 후보 생성','관련글 후보 추천','내부링크 anchor 추천','글 중복도 설명','문단 반복 제거 제안','모바일 문구 압축 제안','CTA 과다 탐지 제안','고객센터 답변 초안','증빙자료 목록 생성','운영 점검 요약','배포 후 QA 요약']]
];
const roadmap = [];
let id = 1;
for (const [key, category, items] of categories) {
  for (const item of items) roadmap.push({ id:id++, category_key:key, category, title:item, status:'candidate', duplicate_policy:'중복 기능 제외 후 기존 도구에 통합 또는 신규 상세 도구로 분리' });
}
if (roadmap.length !== 500) throw new Error(`V50 tools roadmap must be 500 items, got ${roadmap.length}`);
fs.mkdirSync(path.join(ROOT, 'assets/data'), { recursive:true });
write('assets/data/v50.tools.feature-roadmap.json', JSON.stringify({ version:VERSION, count:roadmap.length, generatedAt:new Date().toISOString(), policy:'중복 내용 및 중복 기능 제외. 실제 구현 전 기존 도구와 URL 충돌 여부를 우선 검사합니다.', items:roadmap }, null, 2) + '\n');

// Replace asset cache version in HTML/JS/CSS files.
for (const file of walk(ROOT)) {
  if (!/\.(html|css|js|mjs|json|txt|xml)$/.test(file)) continue;
  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  if (rel.startsWith('node_modules/')) continue;
  let txt = fs.readFileSync(file, 'utf8');
  const next = txt.replace(/static-growth-conversion-v\d+-\d+/g, VERSION);
  if (next !== txt) fs.writeFileSync(file, next, 'utf8');
}

console.log(`V50 guaranteed compact cards + tools roadmap generated: ${roadmap.length} items`);
