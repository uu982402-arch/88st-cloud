import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DOMAIN = 'https://88st.cloud';
const VERSION = 'static-growth-conversion-v51-20260522';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const write = (p, s) => { const fp = path.join(ROOT, p); fs.mkdirSync(path.dirname(fp), {recursive:true}); fs.writeFileSync(fp, s, 'utf8'); };
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const fileExists = p => fs.existsSync(path.join(ROOT, p));

const providers = [
  { slug:'queenbee', name:'여왕벌', label:'QUEENBEE', img:'/assets/provider-media/queenbee-logo-clean-v22.png', domain:'https://qb-700.com/?code=seoa', display:'qb-700.com', code:'seoa', detail:'/guaranteed/queenbee/', note:'신규·USDT 혜택 중심' },
  { slug:'sk-holdings', name:'SK 홀딩스', label:'SK HOLDINGS', img:'/assets/provider-media/sk-holdings-logo.png', domain:'https://snk-99.com/', display:'snk-99.com', code:'IRON888', detail:'/guaranteed/sk-holdings/', note:'입금 플러스·복귀 이벤트 중심' },
  { slug:'anybet', name:'ANYBET', label:'ANYBET', img:'/assets/provider-media/anybet-logo.png', domain:'https://any-777.com/', display:'any-777.com', code:'seoa', detail:'/guaranteed/anybet/', note:'원화·USDT 첫충 혜택 중심' },
  { slug:'udt', name:'UDT', label:'UDT', img:'/assets/provider-media/udt-logo-transparent-v14.png', domain:'https://특공대.com', display:'특공대.COM', code:'SEOA', detail:'/guaranteed/udt/', note:'미니게임·페이백 중심' },
  { slug:'ddangkong', name:'땅콩', label:'DDANGKONG', img:'/assets/provider-media/ddangkong-logo-v19.png', domain:'https://ddk-2025.com', display:'ddk-2025.com', code:'ddk888', detail:'/guaranteed/ddangkong/', note:'카지노·슬롯 콤프 중심' }
];

const tools = [
  {id:'official-url', group:'주소·코드', title:'공식주소 확인', summary:'입력한 주소의 HTTPS, 서브도메인, 숫자·하이픈 변조 신호를 빠르게 점검합니다.', inputs:['확인 URL','기준 도메인'], badge:'URL', related:['/tools/official-check/','/blog/game-guides/v47-whois-domain-creation-date-risk.html']},
  {id:'join-code', group:'주소·코드', title:'가입코드 확인', summary:'업체별 기준 코드와 입력 코드를 대조해 오입력 가능성을 줄입니다.', inputs:['업체','입력 코드'], badge:'CODE', related:['/tools/code-check/','/guaranteed/']},
  {id:'bonus-net', group:'보너스·롤링', title:'보너스 실수령 계산', summary:'입금액·보너스율·롤링 배수를 넣어 총 크레딧과 필요 턴오버를 계산합니다.', inputs:['입금액','보너스율','롤링 배수'], badge:'BONUS', related:['/tools/bonus-calculator/','/tools/rolling-calculator/']},
  {id:'rolling', group:'보너스·롤링', title:'롤링 조건 계산', summary:'기준 금액, 진행 배팅액, 인정 비율을 기준으로 남은 롤링을 정리합니다.', inputs:['기준 금액','진행 배팅액'], badge:'ROLL', related:['/tools/rolling-calculator/','/blog/game-guides/rtp-volatility-simple-meaning.html']},
  {id:'withdraw', group:'출금', title:'출금 가능 금액 계산', summary:'잔액·최대 한도·남은 롤링을 분리해 출금 가능 금액을 추정합니다.', inputs:['현재 잔액','최대 한도'], badge:'PAYOUT', related:['/tools/withdraw-limit/','/tools/payout-kit/']},
  {id:'first-recurring', group:'혜택 비교', title:'첫충 / 매충 비교', summary:'보너스 금액뿐 아니라 필요한 롤링 부담까지 같이 비교합니다.', inputs:['입금액','첫충율','매충율'], badge:'COMPARE', related:['/tools/first-bonus/','/tools/recurring-bonus/']},
  {id:'overround', group:'스포츠 배당', title:'환수율 계산', summary:'2~3개 배당의 내재확률 합계, 오버라운드, 환수율을 계산합니다.', inputs:['소수 배당 목록'], badge:'MARGIN', related:['/tools/line-payout/','/blog/sports-toto/v47-football-1x2-overround-calculation.html']},
  {id:'ev', group:'스포츠 배당', title:'EV 기대값 계산', summary:'추정 확률과 배당을 비교해 손익분기 확률과 기대값을 산출합니다.', inputs:['배당','추정 확률'], badge:'EV', related:['/tools/odds-band/','/sports-check/']},
  {id:'combo', group:'스포츠 배당', title:'조합 배당 실수령', summary:'복수 배당 조합의 총 배당, 예상 지급액, 순손익을 계산합니다.', inputs:['배당 목록','투입 금액'], badge:'SLIP', related:['/tools/slip-compare/','/tools/handicap-payout/']},
  {id:'slot-rtp', group:'카지노·슬롯', title:'슬롯 RTP 체감 손실', summary:'회전당 금액, 회전 수, RTP를 넣어 장기 기대 손실을 계산합니다.', inputs:['회전당 금액','회전 수','RTP'], badge:'RTP', related:['/tools/slot-rtp/','/blog/online-slot/pragmatic-play-volatility-check.html']},
  {id:'martingale', group:'미니게임', title:'마틴게일 파산 위험', summary:'기준 배팅액, 배수, 자본 기준으로 감당 가능 단계와 연패 위험을 계산합니다.', inputs:['기준 배팅액','보유 자본'], badge:'RISK', related:['/tools/minigame-round-planner/','/blog/minigame/ladder-game-gambler-ruin.html']},
  {id:'phishing', group:'주소·보안', title:'피싱 URL 변조 확인', summary:'기준 도메인과 검사 URL을 비교해 유사문자·서브도메인 사칭 신호를 찾습니다.', inputs:['기준 도메인','검사 URL'], badge:'SAFE', related:['/tools/similar-domain/','/blog/game-guides/whois-domain-age-risk-score.html']}
];

function updateGenBuildVersion() {
  const p = path.join(ROOT, 'scripts/gen-build-ver.mjs');
  if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/static-growth-conversion-v\d+-\$\{compact\}/g, 'static-growth-conversion-v52-${compact}');
  s = s.replace(/static-growth-conversion-v\d+-\$\{compact\}/g, 'static-growth-conversion-v52-${compact}');
  s = s.replace(/const version = `static-growth-conversion-v\d+-\$\{compact\}`;/, 'const version = `static-growth-conversion-v52-${compact}`;');
  fs.writeFileSync(p, s, 'utf8');
}

function schema({title, description, url}) {
  return JSON.stringify({
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'Organization','@id':`${DOMAIN}/#organization`,name:'88ST.Cloud',url:`${DOMAIN}/`,logo:`${DOMAIN}/img/logo-v24.png`},
      {'@type':'WebSite','@id':`${DOMAIN}/#website`,url:`${DOMAIN}/`,name:'88ST.Cloud',publisher:{'@id':`${DOMAIN}/#organization`}},
      {'@type':'WebPage','@id':`${url}#webpage`,url,name:title,description,isPartOf:{'@id':`${DOMAIN}/#website`},inLanguage:'ko-KR'}
    ]
  });
}

function head({title, description, canonical, bodyClass, extraCss='', extraJs=''}) {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/><title>${esc(title)}</title><meta name="description" content="${esc(description)}"/><meta name="robots" content="index,follow,max-image-preview:large"/><meta name="theme-color" content="#050b13"/><link rel="canonical" href="${canonical}"/><link rel="icon" href="/favicon.ico" type="image/x-icon"/><link rel="apple-touch-icon" href="/apple-touch-icon-v24.png"/><link rel="manifest" href="/site.webmanifest"/><link rel="preload" as="image" href="/img/logo-v24.png"/><link rel="stylesheet" href="/assets/css/app.core.v1.20260401.css"/><link rel="stylesheet" href="/assets/css/mobile.fix.v1.20260420.css"/><link rel="stylesheet" href="/assets/css/pro.blog.v1.20260504.css"/><link rel="stylesheet" href="/assets/css/growth-conversion.v36.css?v=${VERSION}"/><link rel="stylesheet" href="/assets/css/v52.open-ready.css?v=${VERSION}"/>${extraCss}<meta property="og:type" content="website"/><meta property="og:site_name" content="88ST.Cloud"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${canonical}"/><meta property="og:image" content="${DOMAIN}/img/logo-v24.png"/><script type="application/ld+json" data-v36-schema="primary">${schema({title, description, url: canonical})}</script></head><body class="${bodyClass}"><a class="skip-link" href="#mainContent">본문 바로가기</a><header class="moon-header v39-header v52-header"><div class="moon-container moon-header__inner v39-header__inner v52-header__inner"><a aria-label="88ST.Cloud 홈" class="moon-brand v39-brand v52-brand" href="/"><img alt="88ST.Cloud" decoding="async" fetchpriority="high" height="66" loading="eager" src="/img/logo-v24.png" width="260"/></a><nav aria-label="주요 메뉴" class="moon-nav v39-nav v52-nav"><a href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/"${canonical.endsWith('/tools/')?' class="is-active"':''}>도구</a><a href="/guaranteed/"${canonical.endsWith('/guaranteed/')?' class="is-active"':''}>보증업체</a><a href="/consult/">고객센터</a></nav></div></header>`;
}
function foot(extraJs='') {
  return `<footer class="moon-footer v52-footer"><div class="moon-container"><strong>88ST.Cloud</strong><p>코드, 공식주소, 조건 확인을 한 화면에서 정리합니다.</p></div></footer><script src="/assets/js/growth-conversion.v36.js?v=${VERSION}" defer></script>${extraJs}</body></html>`;
}

function input(label, name, type='number', value='', extra='') {
  return `<label><span>${esc(label)}</span><input name="${name}" type="${type}" value="${esc(value)}" ${extra}/></label>`;
}
function select(label, name, opts) {
  return `<label><span>${esc(label)}</span><select name="${name}">${opts.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select></label>`;
}
function formFor(id) {
  const providerOpts = providers.map(p => ({value:`${p.slug}|${p.code}`, label:`${p.name} / ${p.code}`}));
  const map = {
    'official-url': `${input('확인할 URL','url','url','https://qb-700.com/?code=seoa')} ${input('기준 도메인','base','text','qb-700.com')}`,
    'join-code': `${select('업체 선택','provider',providerOpts)} ${input('입력 코드','code','text','seoa')}`,
    'bonus-net': `${input('입금액','deposit','number','100000')} ${input('보너스율 %','bonusRate','number','50')} ${input('롤링 배수','rolling','number','5')} ${input('인정 비율 %','contribution','number','100')}`,
    'rolling': `${input('기준 금액','base','number','150000')} ${input('롤링 배수','multiple','number','5')} ${input('진행 배팅액','progress','number','300000')} ${input('인정 비율 %','contribution','number','100')}`,
    'withdraw': `${input('현재 잔액','balance','number','250000')} ${input('최대 출금 한도','cap','number','500000')} ${input('남은 롤링','remaining','number','0')}`,
    'first-recurring': `${input('입금액','deposit','number','100000')} ${input('첫충율 %','firstRate','number','40')} ${input('첫충 롤링','firstRolling','number','5')} ${input('매충율 %','recRate','number','10')} ${input('매충 롤링','recRolling','number','3')}`,
    'overround': `${input('소수 배당 목록','odds','text','1.85, 3.35, 4.10')}`,
    'ev': `${input('소수 배당','odds','number','2.10','step="0.01"')} ${input('내 추정 확률 %','prob','number','51')}`,
    'combo': `${input('배당 목록','odds','text','1.72, 1.95, 2.05')} ${input('투입 금액','stake','number','50000')}`,
    'slot-rtp': `${input('회전당 금액','stake','number','1000')} ${input('회전 수','spins','number','500')} ${input('RTP %','rtp','number','96')}`,
    'martingale': `${input('기준 배팅액','base','number','10000')} ${input('배수','multiplier','number','2')} ${input('보유 자본','bankroll','number','500000')} ${input('단일 승률 %','winProb','number','49.5')}`,
    'phishing': `${input('기준 도메인','base','text','qb-700.com')} ${input('검사 URL','url','url','https://q-b700.com')}`
  };
  return `${map[id] || ''}<button type="button" data-v52-calc="${id}">계산 / 확인</button>`;
}

function renderTools() {
  const title = '도구 | 실사용 계산기·확인기';
  const description = '공식주소, 가입코드, 보너스, 롤링, 배당, RTP, 미니게임 위험도를 직접 계산하고 확인하는 방문자용 도구 페이지입니다.';
  const cards = tools.map((t, i) => `<button class="v51-tool-card v52-tool-card${i===0?' is-active':''}" type="button" data-v51-open="${t.id}" data-v52-open="${t.id}"><span>${esc(t.group)}</span><strong>${esc(t.title)}</strong><small>${esc(t.summary)}</small></button>`).join('\n');
  const panels = tools.map((t, i) => `<section class="v51-tool-panel v52-tool-panel${i===0?' is-active':''}" id="tool-${t.id}" data-v51-panel="${t.id}" data-v52-panel="${t.id}"><div class="v52-panel-head"><b>${esc(t.badge)}</b><span>${esc(t.group)}</span><h2>${esc(t.title)}</h2><p>${esc(t.summary)}</p></div><div class="v51-tool-form v52-tool-form" data-v51-form="${t.id}" data-v52-form="${t.id}">${formFor(t.id)}</div><output class="v51-tool-result v52-tool-result" data-v51-result="${t.id}" data-v52-result="${t.id}">값을 입력하면 계산 결과가 여기에 표시됩니다.</output><div class="v51-tool-related v52-tool-related">${t.related.map((href, idx) => `<a href="${href}">${idx===0?'관련 도구':'관련 글'} →</a>`).join('')}</div></section>`).join('\n');
  const providerMini = providers.map(p => `<a class="v50-provider-mini-card v51-provider-mini-card v52-provider-mini" href="${p.detail}" aria-label="${esc(p.name)} 상세보기"><img src="${p.img}" alt="${esc(p.name)} 로고" width="320" height="120" loading="lazy" decoding="async"/><span>${esc(p.name)}</span><small>${esc(p.note)}</small></a>`).join('\n');
  const html = `${head({title, description, canonical:`${DOMAIN}/tools/`, bodyClass:'moon-page v50-tools-index v51-tools-index v52-tools-index'})}<main id="mainContent" class="v52-tools-shell"><section class="v51-tools-app v52-tools-app"><div class="v52-tools-hero"><div><span>USER TOOLS</span><h1>실사용 도구</h1><p>방문자가 바로 입력하고 결과를 확인할 수 있는 계산기와 확인기만 남겼습니다. 운영자용 QA 후보는 전면 노출하지 않습니다.</p></div><label class="v52-tools-search"><span>도구 검색</span><input id="v52ToolSearch" type="search" placeholder="예: 롤링, RTP, 코드, 배당" autocomplete="off"/><small>12개 핵심 도구</small></label></div><div class="v52-tool-quick"><a href="#tool-official-url">공식주소</a><a href="#tool-join-code">가입코드</a><a href="#tool-bonus-net">보너스</a><a href="#tool-overround">배당</a><a href="#tool-slot-rtp">RTP</a><a href="#tool-phishing">피싱 URL</a></div><div class="v51-tools-layout v52-tools-layout"><aside class="v51-tool-list v52-tool-list" aria-label="도구 목록">${cards}</aside><div class="v51-tool-panels v52-tool-panels">${panels}</div></div><section class="v52-tools-section"><div><span>GUARANTEED</span><h2>보증업체 상세 바로가기</h2><p>도구 계산 후 업체별 공식 도메인, 가입코드, 이벤트 조건은 상세 페이지에서 다시 확인할 수 있습니다.</p></div><div class="v50-provider-row v51-provider-row v52-provider-strip">${providerMini}</div></section><section class="v51-legacy-tools v52-legacy-tools"><h2>기존 도구 바로가기</h2><div><a href="/tools/inquiry-builder/">문의 문구 만들기</a><a href="/tools/code-check/">가입코드 확인</a><a href="/tools/official-check/">공식주소 확인</a><a href="/tools/event-checker/">이벤트 조건 확인</a><a href="/tools/payout-kit/">출금 전 자료 정리</a><a href="/tools/ai-game-lab/">게임 조건 해석</a></div></section></section></main>${foot('<script src="/assets/js/v51.tools.js?v='+VERSION+'" defer></script><script src="/assets/js/v52.tools.js?v='+VERSION+'" defer></script>')}`;
  write('tools/index.html', html);
}

function renderGuaranteed() {
  const title = 'RUST 에이전시 보증 업체 | 88ST.Cloud';
  const description = '여왕벌, SK 홀딩스, ANYBET, UDT, 땅콩의 공식 도메인, 가입코드, 상세 안내와 바로가기를 카드형으로 정리했습니다.';
  const cards = providers.map(p => `<article class="premium-card v47-guaranteed-card v48-guaranteed-card v49-guaranteed-card v50-guaranteed-card v52-provider-card" data-v52-provider="${p.slug}"><a class="vendor-hero v48-vendor-hero v49-vendor-hero v50-vendor-hero v52-provider-image" href="${p.detail}" aria-label="${esc(p.name)} 상세보기"><img src="${p.img}" alt="${esc(p.name)} 로고" width="640" height="240" loading="lazy" decoding="async" onerror="this.parentElement.parentElement.classList.add('is-logo-missing')"/></a><div class="card-body v49-card-body v50-card-body v52-provider-body"><div class="v49-card-title-row v52-provider-title"><span>${esc(p.label)}</span><h2>${esc(p.name)}</h2><p>${esc(p.note)}</p></div><div class="v52-provider-facts"><div><span>공식 도메인</span><a href="${p.domain}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-v49-domain-click="${p.slug}" data-v52-domain-click="${p.slug}">${esc(p.display)} ↗</a></div><div><span>가입코드</span><button type="button" class="code-badge" data-v47-copy-code="${esc(p.code)}" data-v49-copy-code="${p.slug}" data-v52-copy-code="${esc(p.code)}" data-v52-copy-provider="${p.slug}" aria-label="${esc(p.name)} 가입코드 복사">${esc(p.code)}</button></div></div><div class="v49-card-actions v50-card-actions v52-provider-actions"><a class="detail-btn v52-detail-btn" href="${p.detail}" data-v49-detail-click="${p.slug}" data-v52-detail-click="${p.slug}">상세보기</a><a class="action-btn v52-shortcut-btn" href="${p.domain}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-v49-domain-click="${p.slug}" data-v52-domain-click="${p.slug}">바로가기</a></div></div></article>`).join('\n');
  const html = `${head({title, description, canonical:`${DOMAIN}/guaranteed/`, bodyClass:'moon-page moon-guaranteed v47-guaranteed-page v48-guaranteed-page v49-guaranteed-page v50-guaranteed-page v52-guaranteed-page'})}<main id="mainContent" class="v52-guaranteed-shell"><section class="moon-container v47-guaranteed-hero v48-guaranteed-hero v49-guaranteed-hero v50-guaranteed-hero v52-guaranteed-hero"><span>RUST GUARANTEED</span><h1>RUST 에이전시 보증 업체</h1><p>카드는 작고 선명하게, 상세한 이벤트와 조건은 업체별 랜딩에서 확인하도록 분리했습니다.</p></section><section class="moon-container guarantee-container v48-guarantee-container v49-guarantee-container v50-guarantee-container v52-guaranteed-grid" aria-label="RUST 에이전시 보증 업체 카드">${cards}</section></main>${foot('<script src="/assets/js/v52.guaranteed.js?v='+VERSION+'" defer></script>')}`;
  write('guaranteed/index.html', html);
}

function writeAssets() {
  write('assets/css/v52.open-ready.css', `/* V52 OPEN READY UI */
:root{--v52-bg:#050b13;--v52-panel:rgba(8,15,28,.86);--v52-panel2:rgba(255,255,255,.055);--v52-line:rgba(211,226,255,.14);--v52-line2:rgba(232,189,104,.40);--v52-text:#e8eef8;--v52-muted:#9fb0c5;--v52-gold:#f1d59b;--v52-blue:#8bdcff;--v52-green:#55e6a5;}
body.v52-tools-index,body.v52-guaranteed-page{margin:0!important;background:radial-gradient(circle at 10% -8%,rgba(85,130,255,.16),transparent 30%),radial-gradient(circle at 90% 0,rgba(16,185,129,.10),transparent 30%),linear-gradient(180deg,#040812,#07111f 50%,#03070d)!important;color:var(--v52-text)!important;}
body.v52-tools-index *,body.v52-guaranteed-page *{box-sizing:border-box;}
.v52-header{position:sticky!important;top:0!important;z-index:80!important;background:rgba(3,7,13,.82)!important;backdrop-filter:blur(18px)!important;border-bottom:1px solid rgba(255,255,255,.08)!important;}
.v52-header__inner{min-height:66px!important;display:flex!important;align-items:center!important;gap:18px!important;}
.v52-brand img{width:150px!important;height:auto!important;max-height:44px!important;object-fit:contain!important;}
.v52-nav{display:flex!important;align-items:center!important;gap:6px!important;margin-left:auto!important;overflow-x:auto!important;white-space:nowrap!important;scrollbar-width:none!important;}
.v52-nav a{min-height:38px!important;display:inline-flex!important;align-items:center!important;padding:0 11px!important;border-radius:999px!important;color:#dce8f7!important;text-decoration:none!important;font-size:14px!important;font-weight:850!important;}
.v52-nav a:hover,.v52-nav a.is-active{background:rgba(232,189,104,.13)!important;color:#fff4df!important;}
.v52-tools-shell,.v52-guaranteed-shell{padding:20px 0 56px!important;}
.v52-tools-app{width:min(1180px,calc(100% - 28px));margin:0 auto;}
.v52-tools-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,360px);gap:16px;align-items:end;margin-bottom:14px;padding:18px;border:1px solid var(--v52-line);border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.065),rgba(255,255,255,.025));box-shadow:0 22px 70px rgba(0,0,0,.30);}
.v52-tools-hero span,.v52-tools-section span,.v52-guaranteed-hero span{display:block;color:var(--v52-blue);font-size:11px;font-weight:950;letter-spacing:.13em;}
.v52-tools-hero h1,.v52-guaranteed-hero h1{margin:5px 0 8px!important;color:#fff8e9!important;font-size:clamp(28px,4vw,48px)!important;line-height:1.02!important;letter-spacing:-.045em!important;}
.v52-tools-hero p,.v52-guaranteed-hero p,.v52-tools-section p{margin:0;color:var(--v52-muted)!important;line-height:1.58!important;}
.v52-tools-search{display:grid;gap:8px;color:#c8d7e8;font-weight:900;}
.v52-tools-search input{width:100%;min-height:46px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(3,9,18,.80);color:#fff!important;padding:0 14px;outline:none;}
.v52-tools-search small{color:var(--v52-gold);font-weight:900;}
.v52-tool-quick{display:flex;gap:8px;overflow-x:auto;padding:4px 0 14px;}
.v52-tool-quick a{flex:0 0 auto;display:inline-flex;align-items:center;min-height:34px;padding:0 12px;border:1px solid var(--v52-line);border-radius:999px;background:rgba(255,255,255,.045);color:#e8eef8!important;text-decoration:none;font-weight:850;font-size:13px;}
.v52-tools-layout{display:grid;grid-template-columns:minmax(245px,310px) minmax(0,1fr);gap:16px;align-items:start;}
.v52-tool-list{display:grid;gap:9px;position:sticky;top:82px;max-height:calc(100vh - 96px);overflow:auto;padding-right:3px;}
.v52-tool-card{border:1px solid var(--v52-line);border-radius:16px;background:rgba(255,255,255,.045);color:#dce8f7;text-align:left;padding:12px;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease;}
.v52-tool-card:hover,.v52-tool-card.is-active{border-color:var(--v52-line2);background:rgba(232,189,104,.105);transform:translateY(-1px);}
.v52-tool-card span{display:block;color:var(--v52-blue);font-size:11px;font-weight:900;letter-spacing:.06em;margin-bottom:4px;}
.v52-tool-card strong{display:block;color:#fff7e8;font-size:15px;line-height:1.24;margin-bottom:5px;}
.v52-tool-card small{display:block;color:#aab9cb;line-height:1.45;font-size:12.5px;}
.v52-tool-panel{display:none;border:1px solid var(--v52-line);border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.032)),rgba(5,12,23,.86);padding:20px;box-shadow:0 24px 82px rgba(0,0,0,.32);}
.v52-tool-panel.is-active{display:block!important;}
.v52-panel-head b{display:inline-flex;align-items:center;min-height:28px;padding:0 10px;border-radius:999px;background:rgba(139,220,255,.10);border:1px solid rgba(139,220,255,.22);color:#dff7ff;font-size:12px;}
.v52-panel-head span{display:block;margin-top:12px;color:var(--v52-gold);font-size:12px;font-weight:950;letter-spacing:.08em;}
.v52-panel-head h2{margin:6px 0 8px!important;color:#fff8e9!important;font-size:clamp(23px,3vw,34px)!important;}
.v52-panel-head p{margin:0 0 16px;color:#b9c8da;line-height:1.65;}
.v52-tool-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.v52-tool-form label{display:grid;gap:6px;color:#b9c8da;font-size:13px;font-weight:850;}
.v52-tool-form input,.v52-tool-form select{min-height:44px;border:1px solid rgba(255,255,255,.14);border-radius:13px;background:rgba(1,6,14,.78)!important;color:#fff!important;padding:0 12px;outline:none;}
.v52-tool-form button{grid-column:1/-1;min-height:48px;border:0;border-radius:14px;background:linear-gradient(180deg,#f5d998,#bf8739);color:#171009!important;font-weight:950;cursor:pointer;}
.v52-tool-result{display:block;margin-top:14px;padding:16px;border:1px solid rgba(139,220,255,.21);border-radius:16px;background:rgba(2,8,17,.86)!important;color:#dfeeff!important;line-height:1.8;}
.v52-tool-result b,.v52-tool-result strong{color:#fff3d2!important;}
.v52-tool-related{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}
.v52-tool-related a,.v52-legacy-tools a{display:inline-flex;align-items:center;min-height:34px;padding:0 11px;border:1px solid var(--v52-line);border-radius:999px;color:#dce8f7!important;text-decoration:none;background:rgba(255,255,255,.045);font-weight:850;}
.v52-tools-section,.v52-legacy-tools{margin:18px 0;padding:18px;border:1px solid var(--v52-line);border-radius:22px;background:rgba(255,255,255,.04);}
.v52-tools-section{display:grid;grid-template-columns:minmax(0,.65fr) minmax(0,1.35fr);gap:16px;align-items:start;}
.v52-tools-section h2,.v52-legacy-tools h2{margin:4px 0 8px!important;color:#fff8e9!important;}
.v52-provider-strip{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;}
.v52-provider-mini{min-height:108px;padding:11px;border:1px solid var(--v52-line);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.025));text-decoration:none;color:#e7eefb!important;display:grid;align-content:center;gap:7px;}
.v52-provider-mini img{width:100%;height:48px;object-fit:contain;filter:drop-shadow(0 9px 16px rgba(0,0,0,.34));}
.v52-provider-mini span{color:#fff4df;font-weight:950;}
.v52-provider-mini small{color:var(--v52-blue);font-size:11px;line-height:1.35;}
.v52-legacy-tools div{display:flex;flex-wrap:wrap;gap:8px;}
.v52-guaranteed-hero{padding:22px 0 10px!important;}
.v52-guaranteed-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;gap:14px!important;align-items:stretch!important;padding:10px 0 42px!important;}
.v52-provider-card{display:flex!important;flex-direction:column!important;min-height:100%!important;border:1px solid rgba(255,255,255,.11)!important;border-radius:20px!important;background:linear-gradient(180deg,rgba(22,27,43,.88),rgba(6,11,22,.98))!important;box-shadow:0 18px 54px rgba(0,0,0,.28)!important;overflow:hidden!important;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
.v52-provider-card:hover{transform:translateY(-3px);border-color:rgba(232,189,104,.42)!important;box-shadow:0 22px 62px rgba(0,0,0,.34),0 10px 42px rgba(232,189,104,.08)!important;}
.v52-provider-image{display:flex!important;align-items:center!important;justify-content:center!important;margin:10px 10px 0!important;aspect-ratio:16/6.2!important;border-radius:14px!important;background:linear-gradient(135deg,rgba(255,255,255,.11),rgba(99,102,241,.075))!important;border:1px solid rgba(255,255,255,.08)!important;overflow:hidden!important;text-decoration:none!important;}
.v52-provider-image img{width:100%!important;height:100%!important;object-fit:contain!important;padding:10px!important;filter:drop-shadow(0 12px 20px rgba(0,0,0,.42))!important;}
.v52-provider-body{display:grid!important;gap:9px!important;padding:12px!important;flex:1!important;}
.v52-provider-title span{display:block;color:var(--v52-blue);font-size:10px;font-weight:950;letter-spacing:.14em;}
.v52-provider-title h2{margin:3px 0 4px!important;color:#fff4df!important;font-size:18px!important;line-height:1.14!important;}
.v52-provider-title p{margin:0;color:#9fb0c5!important;font-size:12px!important;line-height:1.45!important;}
.v52-provider-facts{display:grid;gap:7px;}
.v52-provider-facts>div{display:grid;gap:4px;padding:8px;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:rgba(0,0,0,.20);}
.v52-provider-facts span{color:#91a3b8;font-size:11px;font-weight:900;}
.v52-provider-facts a{color:#c7f0ff!important;text-decoration:none!important;font-size:13px!important;font-weight:850!important;word-break:break-all;}
.v52-provider-facts button{justify-self:start;border:1px solid rgba(85,230,165,.24);background:rgba(85,230,165,.10);color:#8ff7bf!important;border-radius:8px;padding:5px 8px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;font-weight:950;cursor:pointer;}
.v52-provider-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:auto;}
.v52-detail-btn,.v52-shortcut-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:38px!important;border-radius:11px!important;text-decoration:none!important;font-size:13px!important;font-weight:950!important;}
.v52-detail-btn{border:1px solid rgba(139,220,255,.25)!important;background:rgba(14,165,233,.11)!important;color:#dff7ff!important;}
.v52-shortcut-btn{border:0!important;background:linear-gradient(180deg,#f5d998,#bf8739)!important;color:#171009!important;}
.v52-copy-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;background:#101827;color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:12px 16px;box-shadow:0 14px 50px rgba(0,0,0,.32);font-weight:850;}
.v52-footer{border-top:1px solid rgba(255,255,255,.08);padding:24px 0;color:#94a3b8;background:rgba(2,6,13,.42);}
.v52-footer strong{color:#fff4df;}
.v52-footer p{margin:6px 0 0;}
@media(max-width:980px){.v52-tools-hero,.v52-tools-layout,.v52-tools-section{grid-template-columns:1fr!important}.v52-tool-list{position:relative;top:auto;max-height:none;grid-template-columns:repeat(2,minmax(0,1fr));}.v52-provider-strip{grid-template-columns:repeat(2,minmax(0,1fr));}.v52-guaranteed-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;padding-inline:12px!important;}.v52-brand img{width:132px!important;}}
@media(max-width:560px){.v52-tools-app{width:min(100% - 18px,1180px)}.v52-tools-hero,.v52-tool-panel,.v52-tools-section,.v52-legacy-tools{padding:14px;border-radius:18px}.v52-tool-list,.v52-tool-form,.v52-provider-strip,.v52-guaranteed-grid{grid-template-columns:1fr!important}.v52-nav a{font-size:13px!important;padding:0 9px!important}.v52-provider-actions{grid-template-columns:1fr!important}.v52-provider-image{aspect-ratio:16/6.8!important}}
`);
  write('assets/js/v52.tools.js', `(() => {\n  const money=n=>Number.isFinite(n)?Math.round(n).toLocaleString('ko-KR')+'원':'-';\n  const pct=n=>Number.isFinite(n)?n.toFixed(2)+'%':'-';\n  const num=(f,n,d=0)=>{const v=Number((f.querySelector('[name="'+n+'"]')||{}).value);return Number.isFinite(v)?v:d};\n  const val=(f,n)=>((f.querySelector('[name="'+n+'"]')||{}).value||'').trim();\n  const parseOdds=s=>String(s||'').split(/[,\\s]+/).map(Number).filter(n=>Number.isFinite(n)&&n>1);\n  const hostOf=u=>{try{return new URL(String(u).includes('://')?u:'https://'+u).hostname.toLowerCase()}catch{return ''}};\n  const dist=(a,b)=>{a=a||'';b=b||'';const dp=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)dp[0][j]=j;for(let i=1;i<=a.length;i++){for(let j=1;j<=b.length;j++){dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));}}return dp[a.length][b.length]};\n  const render=(id,html)=>{const out=document.querySelector('[data-v52-result="'+id+'"]');if(out)out.innerHTML=html};\n  const riskUrl=(url,base)=>{const h=hostOf(url),b=hostOf(base||url)||String(base||'').toLowerCase();const flags=[];if(!String(url||'').toLowerCase().startsWith('https://'))flags.push('HTTPS 아님 또는 스킴 누락');if(h.includes('xn--'))flags.push('punycode 도메인');if(h&&b&&h!==b&&!h.endsWith('.'+b))flags.push('기준 도메인과 불일치');if((h.match(/-/g)||[]).length>=2)flags.push('하이픈 과다');if(/0|1|3|5|7/.test(h.replace(b,'')))flags.push('숫자 치환 가능성');if(h.split('.').length>b.split('.').length+1)flags.push('서브도메인 단계 과다');return{h,b,flags,d:dist(h.replace(/[^a-z0-9]/g,''),b.replace(/[^a-z0-9]/g,''))}};\n  const calcs={\n    'official-url':f=>{const r=riskUrl(val(f,'url'),val(f,'base'));render('official-url','<strong>도메인:</strong> '+(r.h||'-')+'<br><strong>기준:</strong> '+(r.b||'-')+'<br><strong>문자열 거리:</strong> '+r.d+'<br><strong>확인 신호:</strong> '+(r.flags.length?r.flags.join(' · '):'큰 변조 신호 없음'))},\n    'join-code':f=>{const [provider,code]=(val(f,'provider')||'|').split('|');const input=val(f,'code');const ok=input.toLowerCase()===String(code).toLowerCase();render('join-code','<strong>'+provider+'</strong><br>기준 코드: <b>'+code+'</b><br>입력 코드: <b>'+input+'</b><br>결과: '+(ok?'일치':'불일치 또는 대소문자/공백 확인 필요'))},\n    'bonus-net':f=>{const dep=num(f,'deposit'),br=num(f,'bonusRate')/100,roll=num(f,'rolling'),c=Math.max(num(f,'contribution')/100,.01);const bonus=dep*br,total=dep+bonus,turnover=total*roll/c;render('bonus-net','보너스: <b>'+money(bonus)+'</b><br>총 크레딧: <b>'+money(total)+'</b><br>필요 롤링: <b>'+money(turnover)+'</b>')},\n    'rolling':f=>{const base=num(f,'base'),m=num(f,'multiple'),p=num(f,'progress'),c=Math.max(num(f,'contribution')/100,.01);const need=base*m/c,done=p*c,remain=Math.max(need-done,0);render('rolling','필요 롤링: <b>'+money(need)+'</b><br>인정 진행액: <b>'+money(done)+'</b><br>남은 롤링: <b>'+money(remain)+'</b>')},\n    'withdraw':f=>{const bal=num(f,'balance'),cap=num(f,'cap'),rem=num(f,'remaining');const possible=rem>0?0:Math.min(bal,cap||bal);render('withdraw','현재 잔액: <b>'+money(bal)+'</b><br>최대 한도 반영: <b>'+money(cap||bal)+'</b><br>남은 롤링: <b>'+money(rem)+'</b><br>즉시 출금 가능 추정: <b>'+money(possible)+'</b>')},\n    'first-recurring':f=>{const dep=num(f,'deposit'),fr=num(f,'firstRate')/100,rr=num(f,'recRate')/100,froll=num(f,'firstRolling'),rroll=num(f,'recRolling');const fb=dep*fr,rb=dep*rr;render('first-recurring','첫충 보너스: <b>'+money(fb)+'</b> / 필요 롤링: <b>'+money((dep+fb)*froll)+'</b><br>매충 보너스: <b>'+money(rb)+'</b> / 필요 롤링: <b>'+money((dep+rb)*rroll)+'</b>')},\n    'overround':f=>{const odds=parseOdds(val(f,'odds'));const sum=odds.reduce((a,o)=>a+1/o,0);render('overround','입력 배당: '+odds.join(' / ')+'<br>내재확률 합계: <b>'+pct(sum*100)+'</b><br>오버라운드: <b>'+pct((sum-1)*100)+'</b><br>환수율 추정: <b>'+pct(100/sum)+'</b>')},\n    'ev':f=>{const o=num(f,'odds'),p=num(f,'prob')/100;render('ev','손익분기 확률: <b>'+pct(100/o)+'</b><br>공정 배당: <b>'+(p>0?(1/p).toFixed(3):'-')+'</b><br>EV: <b>'+pct((o*p-1)*100)+'</b>')},\n    'combo':f=>{const odds=parseOdds(val(f,'odds')),stake=num(f,'stake');const total=odds.reduce((a,o)=>a*o,1),payout=stake*total;render('combo','총 조합 배당: <b>'+total.toFixed(3)+'</b><br>예상 지급액: <b>'+money(payout)+'</b><br>순손익: <b>'+money(payout-stake)+'</b>')},\n    'slot-rtp':f=>{const stake=num(f,'stake'),spins=num(f,'spins'),rtp=num(f,'rtp')/100;const total=stake*spins,ret=total*rtp;render('slot-rtp','총 투입액: <b>'+money(total)+'</b><br>이론 환급: <b>'+money(ret)+'</b><br>이론 손실: <b>'+money(total-ret)+'</b>')},\n    'martingale':f=>{const base=num(f,'base'),mul=num(f,'multiplier'),bank=num(f,'bankroll'),p=num(f,'winProb')/100,q=1-p;let need=0,step=0,bet=base;while(need+bet<=bank&&step<50){need+=bet;bet*=mul;step++;}render('martingale','감당 가능 연속 단계: <b>'+step+'단계</b><br>누적 필요 자본: <b>'+money(need)+'</b><br>다음 배팅액: <b>'+money(bet)+'</b><br>단순 연패 위험: <b>'+pct(Math.pow(q,Math.max(step,1))*100)+'</b>')},\n    'phishing':f=>{const r=riskUrl(val(f,'url'),val(f,'base'));render('phishing','검사 도메인: <b>'+(r.h||'-')+'</b><br>기준 도메인: <b>'+(r.b||'-')+'</b><br>문자열 거리: <b>'+r.d+'</b><br>변조 신호: <b>'+(r.flags.length?r.flags.join(' · '):'큰 변조 신호 없음')+'</b>')}\n  };\n  document.addEventListener('click',e=>{const open=e.target.closest('[data-v52-open]');if(open){const id=open.dataset.v52Open;document.querySelectorAll('[data-v52-open]').forEach(x=>x.classList.toggle('is-active',x===open));document.querySelectorAll('[data-v52-panel]').forEach(x=>x.classList.toggle('is-active',x.dataset.v52Panel===id));history.replaceState(null,'','#tool-'+id)}const calc=e.target.closest('[data-v52-calc]');if(calc){const id=calc.dataset.v52Calc;const form=calc.closest('[data-v52-form]');if(calcs[id])calcs[id](form)}});\n  document.addEventListener('input',e=>{if(e.target&&e.target.id==='v52ToolSearch'){const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.v52-tool-card').forEach(card=>{card.hidden=q&&!card.textContent.toLowerCase().includes(q)})}});\n  document.querySelectorAll('[data-v52-calc]').forEach(btn=>btn.click());\n})();\n`);
  write('assets/js/v52.guaranteed.js', `document.addEventListener('click',async(e)=>{\n const copy=e.target.closest('[data-v52-copy-code]');\n if(copy){const code=copy.getAttribute('data-v52-copy-code')||copy.textContent.trim();try{await navigator.clipboard.writeText(code)}catch(_){const t=document.createElement('textarea');t.value=code;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}document.querySelectorAll('.v52-copy-toast').forEach(x=>x.remove());const toast=document.createElement('div');toast.className='v52-copy-toast';toast.textContent='가입코드가 복사되었습니다';document.body.appendChild(toast);setTimeout(()=>toast.remove(),1600);window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'guaranteed_code_copy',provider:copy.getAttribute('data-v52-copy-provider')||''});}\n const domain=e.target.closest('[data-v52-domain-click]');if(domain){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'guaranteed_domain_click',provider:domain.getAttribute('data-v52-domain-click')||''});}\n const detail=e.target.closest('[data-v52-detail-click]');if(detail){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'guaranteed_detail_click',provider:detail.getAttribute('data-v52-detail-click')||''});}\n});\n`);
}

function updatePackage() {
  const pkg = JSON.parse(read('package.json'));
  const v52 = 'node scripts/generate-v52-open-ready-ui.mjs';
  if (!pkg.scripts.build.includes('generate-v52-open-ready-ui.mjs')) {
    pkg.scripts.build = pkg.scripts.build.replace('node scripts/generate-v51-user-facing-tools.mjs', 'node scripts/generate-v51-user-facing-tools.mjs && ' + v52);
  }
  pkg.scripts['quality:v52'] = v52;
  write('package.json', JSON.stringify(pkg, null, 2) + '\n');
}

function updateVerify() {
  const p = path.join(ROOT, 'scripts/verify-v36.mjs');
  if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/\/\/ V52 open ready checks[\s\S]*?\/\/ END V52 open ready checks\n?/g, '');
  const block = `\n// V52 open ready checks\n{\n  const tools = path.join(ROOT, 'tools/index.html');\n  if (!fs.existsSync(tools)) fail(errors, 'V52 tools index missing');\n  else {\n    const t = read(tools);\n    if (!/v52-tools-index/.test(t)) fail(errors, 'V52 tools body class missing');\n    if (!/v52.open-ready.css/.test(t)) fail(errors, 'V52 CSS missing from tools');\n    if (!/assets\\/js\\/v52\\.tools\\.js/.test(t)) fail(errors, 'V52 tools JS missing from tools');\n    if ((t.match(/data-v52-open=/g)||[]).length !== 12) fail(errors, 'V52 tool card count failed');\n    if ((t.match(/data-v52-panel=/g)||[]).length !== 12) fail(errors, 'V52 tool panel count failed');\n    if (/href=["']#["']|javascript:void\\(0\\)/i.test(t)) fail(errors, 'V52 bad href in tools');\n    if (/도구 기능 추가 후보 500건/i.test(t)) fail(errors, 'V52 internal roadmap exposed on tools page');\n  }\n  const gfp = path.join(ROOT, 'guaranteed/index.html');\n  if (!fs.existsSync(gfp)) fail(errors, 'V52 guaranteed index missing');\n  else {\n    const g = read(gfp);\n    if (!/v52-guaranteed-page/.test(g)) fail(errors, 'V52 guaranteed body class missing');\n    if (!/v52-guaranteed-grid/.test(g)) fail(errors, 'V52 guaranteed grid missing');\n    if ((g.match(/class=["'][^"']*v52-provider-card/g)||[]).length !== 5) fail(errors, 'V52 provider card count failed');\n    if ((g.match(/data-v52-copy-code=/g)||[]).length !== 5) fail(errors, 'V52 copy code count failed');\n    if ((g.match(/data-v52-detail-click=/g)||[]).length !== 5) fail(errors, 'V52 detail click count failed');\n    if ((g.match(/data-v52-domain-click=/g)||[]).length < 5) fail(errors, 'V52 domain click count failed');\n    if (new RegExp('SEO'+'A69|seo'+'a69','i').test(g)) fail(errors, 'V52 forbidden legacy contact in guaranteed');\n  }\n  for (const f of htmls) {\n    const txt = read(f);\n    if (/href=["']#["']|href=["']javascript:void\\(0\\)["']/i.test(txt)) fail(errors, 'V52 bad href regression ' + rel(f));\n  }\n  const css = path.join(ROOT, 'assets/css/v52.open-ready.css');\n  const jsTools = path.join(ROOT, 'assets/js/v52.tools.js');\n  const jsG = path.join(ROOT, 'assets/js/v52.guaranteed.js');\n  if (!fs.existsSync(css)) fail(errors, 'V52 CSS file missing');\n  if (!fs.existsSync(jsTools)) fail(errors, 'V52 tools JS file missing');\n  if (!fs.existsSync(jsG)) fail(errors, 'V52 guaranteed JS file missing');\n}\n// END V52 open ready checks\n`;
  s = s.replace(/const result = \{/, block + '\nconst result = {');
  fs.writeFileSync(p, s, 'utf8');
}

function writeAudit() {
  write('assets/data/v52.open-ready.audit.json', JSON.stringify({
    version: VERSION,
    generatedAt: new Date().toISOString(),
    pages: ['/tools/','/guaranteed/'],
    providers: providers.map(p => ({slug:p.slug, name:p.name, route:p.detail, domain:p.display, code:p.code})),
    tools: tools.map(t => ({id:t.id, group:t.group, title:t.title})),
    checks: ['tools_12_cards','tools_12_panels','guaranteed_5_cards','copy_code_5','detail_links_5','domain_links_5','no_hash_href','no_javascript_void']
  }, null, 2));
}

updatePackage();
updateGenBuildVersion();
renderTools();
renderGuaranteed();
writeAssets();
writeAudit();
updateVerify();
console.log('V52 open-ready tools and guaranteed UI generated');
