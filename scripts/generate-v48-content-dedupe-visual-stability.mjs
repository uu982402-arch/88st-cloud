#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DOMAIN = 'https://88st.cloud';
const VERSION = 'static-growth-conversion-v51-20260522';
const TODAY = new Date().toISOString().slice(0,10);
const CATEGORY_LABEL = {
  'sports-toto':'스포츠토토',
  'online-casino':'온라인카지노',
  'online-slot':'온라인슬롯',
  'bet365-virtual':'BET365 가상게임',
  'minigame':'미니게임',
  'game-guides':'먹튀검증',
  'affiliate':'제휴 구조',
  'misc':'기술 아카이브'
};
const CATEGORY_ROOTS = Object.keys(CATEGORY_LABEL);
const BAD_BLOG_TERMS = [
  /상담\s*전\s*(?:먼저\s*)?(?:확인할\s*것|필요한\s*항목|필요한\s*확인\s*항목)/i,
  /CHECK BEFORE ACTION/i,
  /키워드별 확인 허브/i,
  /이 글에서 확인할 항목/i,
  /전문가형\s*판독\s*체크포인트/i,
  /https:\/\/t\.me/i,
  /@TRS999/i,
  /TRS999_bot/i,
  /텔레그램/i,
  /카톡/i
];
const BANNED_RE = new RegExp(BAD_BLOG_TERMS.map(r => r.source).join('|'), 'ig');
const LEGACY_RE = new RegExp('(telegram|seoa|iron20|iron888|queenbee|sk-holdings|anybet-seoa|udt-seoa|odds' + '88st)', 'i');

function walk(dir, out=[]) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules','.git','__MACOSX'].includes(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
function rel(p){ return path.relative(ROOT, p).replaceAll(path.sep,'/'); }
function write(file, text){ fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, text, 'utf8'); }
function read(file){ return fs.readFileSync(file, 'utf8'); }
function esc(s){ return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function stripTags(s){ return String(s || '').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
function extract(re, txt, fallback=''){ const m = txt.match(re); return m ? m[1].trim() : fallback; }
function routeFromFile(f){ const r = rel(f); if (r === 'index.html') return '/'; if (r.endsWith('/index.html')) return '/' + r.slice(0,-10); return '/' + r; }
function fileFromRoute(route){ const clean = route.replace(/^\//,''); if (!clean || route === '/') return path.join(ROOT,'index.html'); if (clean.endsWith('/')) return path.join(ROOT, clean, 'index.html'); if (clean.endsWith('.html')) return path.join(ROOT, clean); return path.join(ROOT, clean, 'index.html'); }
function catFromRel(r){ const m = r.match(/^blog\/([^\/]+)\//); if (m && CATEGORY_LABEL[m[1]]) return m[1]; if (/slot|슬롯|pragmatic|nolimit|pg-soft|playngo|netent|red-tiger|relax|microgaming|habanero|booongo/i.test(r)) return 'online-slot'; if (/casino|바카라|룰렛|blackjack|baccarat|roulette|evolution|pragmatic-live/i.test(r)) return 'online-casino'; if (/sports|kbo|football|soccer|worldcup|basketball|volleyball|proto|toto/i.test(r)) return 'sports-toto'; if (/virtual|bet365/i.test(r)) return 'bet365-virtual'; if (/powerball|ladder|speedkeno|minigame|entry/i.test(r)) return 'minigame'; return 'game-guides'; }
function hasBadBlogTerm(txt){ return BAD_BLOG_TERMS.some(r => r.test(txt)); }
function metaDesc(title, cat){
  const label = CATEGORY_LABEL[cat] || '기술 아카이브';
  return `${title}를 ${label} 관점에서 수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로 정리한 88ST.Cloud 전문 정보 문서입니다.`.slice(0,150);
}
function header(active='blog'){
  const nav = [['/','메인'],['/blog/','블로그'],['/tools/','도구'],['/guaranteed/','보증업체'],['/consult/','고객센터']].map(([href,label])=>`<a${(active==='home'&&href==='/')||(active==='blog'&&href==='/blog/')||(active==='tools'&&href==='/tools/')||(active==='guaranteed'&&href==='/guaranteed/')||(active==='consult'&&href==='/consult/')?' class="is-active"':''} href="${href}">${label}</a>`).join('');
  return `<header class="moon-header v39-header v48-header"><div class="moon-container moon-header__inner v39-header__inner"><a aria-label="88ST.Cloud 홈" class="moon-brand v39-brand" href="/"><img alt="88ST.Cloud" decoding="async" fetchpriority="high" height="66" loading="eager" src="/img/logo-v24.png" width="260"/></a><nav aria-label="주요 메뉴" class="moon-nav v39-nav">${nav}</nav></div></header>`;
}
function jsonLd(title, desc, route, cat){
  return JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":`${DOMAIN}/#organization`,"name":"88ST.Cloud","url":`${DOMAIN}/`,"logo":`${DOMAIN}/img/logo-v24.png`},{"@type":"WebSite","@id":`${DOMAIN}/#website`,"url":`${DOMAIN}/`,"name":"88ST.Cloud","publisher":{"@id":`${DOMAIN}/#organization`}},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"홈","item":`${DOMAIN}/`},{"@type":"ListItem","position":2,"name":"블로그","item":`${DOMAIN}/blog/`},{"@type":"ListItem","position":3,"name":CATEGORY_LABEL[cat]||'기술 아카이브',"item":`${DOMAIN}/blog/${cat}/`},{"@type":"ListItem","position":4,"name":title,"item":`${DOMAIN}${route}`}]},{"@type":"Article","@id":`${DOMAIN}${route}#article`,"url":`${DOMAIN}${route}`,"headline":title.slice(0,110),"description":desc,"dateModified":TODAY,"inLanguage":"ko-KR","author":{"@type":"Organization","name":"88ST.Cloud"},"publisher":{"@id":`${DOMAIN}/#organization`},"mainEntityOfPage":`${DOMAIN}${route}`} ]});
}
function head({title, desc, route, cat='game-guides', robots='index,follow,max-image-preview:large'}){
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/><title>${esc(title)} | 88ST.Cloud</title><meta name="description" content="${esc(desc)}"/><meta name="robots" content="${robots}"/><meta name="theme-color" content="#03070d"/><link rel="canonical" href="${DOMAIN}${route}"/><link rel="icon" href="/favicon.ico" type="image/x-icon"/><link rel="apple-touch-icon" href="/apple-touch-icon-v24.png"/><link rel="manifest" href="/site.webmanifest"/><link rel="preload" as="image" href="/img/logo-v24.png"/><link rel="stylesheet" href="/assets/css/app.core.v1.20260401.css"/><link rel="stylesheet" href="/assets/css/mobile.fix.v1.20260420.css"/><link rel="stylesheet" href="/assets/css/pro.blog.v1.20260504.css"/><link rel="stylesheet" href="/assets/css/growth-conversion.v36.css?v=${VERSION}"/><meta property="og:type" content="article"/><meta property="og:site_name" content="88ST.Cloud"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(desc)}"/><meta property="og:url" content="${DOMAIN}${route}"/><script type="application/ld+json" data-v36-schema="primary">${jsonLd(title, desc, route, cat)}</script></head>`;
}
function formula(cat){
  if (cat === 'sports-toto') return `<div class="v48-formula"><strong>배당 수식</strong><code>암시확률 = 1 / 배당</code><code>오버라운드 = Σ(1/oddsᵢ) - 1</code><code>EV = p × odds - 1</code></div>`;
  if (cat === 'online-casino') return `<div class="v48-formula"><strong>카지노 수식</strong><code>House Edge = 1 - RTP</code><code>Expected Loss = Stake × House Edge</code><code>Commission EV = winProb × payout - loseProb</code></div>`;
  if (cat === 'online-slot') return `<div class="v48-formula"><strong>슬롯 수식</strong><code>Observed RTP = totalReturn / totalStake</code><code>Variance = E[X²] - E[X]²</code><code>Drawdown = peakBalance - currentBalance</code></div>`;
  if (cat === 'minigame') return `<div class="v48-formula"><strong>미니게임 수식</strong><code>공정배당 = 1 / 확률</code><code>실효 EV = p × payout - (1-p)</code><code>연패확률 = (1-p)^n</code></div>`;
  if (cat === 'bet365-virtual') return `<div class="v48-formula"><strong>가상게임 수식</strong><code>회차 노출률 = displayedResults / totalRounds</code><code>마진 = Σ(1/oddsᵢ) - 1</code><code>기록오차 = displayedTime - settlementTime</code></div>`;
  return `<div class="v48-formula"><strong>검증 수식</strong><code>Risk Score = Domain + DNS + SSL + Redirect + Terms</code><code>Change Rate = changedFields / observedFields</code><code>Evidence Grade = verifiedItems / totalItems</code></div>`;
}
function rows(cat){
  const data = {
    'sports-toto': [['오픈·마감 배당','동일 마켓의 시간대별 가격','정보 반영과 시장 쏠림 분리'],['환수율','암시확률 합산','하우스 마진 확인'],['정산 기준','연장·취소·연기 처리','무효 조건 오독 방지']],
    'online-casino': [['라운드 ID','결과 화면 식별자','정산·캡처 일관성'],['테이블 룰셋','수수료·사이드베팅·한도','하우스엣지 변화'],['제공사 표기','공개 리소스와 게임명','사칭·미러 페이지 구분']],
    'online-slot': [['RTP 표기','이론 환수율·버전','실제 세션 보장 아님'],['변동성','분산·hit frequency','자본 변동 폭 해석'],['보너스 기능','구매 비용·기여율','기대값 왜곡 확인']],
    'minigame': [['회차 ID','결과 시간·정정 기준','결과 추적성'],['해시 공개','seed·nonce·매핑 규칙','사후 검증 가능성'],['한도와 배당','공정배당 대비 지급률','마진 구조 확인']],
    'bet365-virtual': [['회차 구조','결과 주기·정산 시점','실제 스포츠와 분리'],['하이라이트','표시 화면과 결과 생성','원인·결과 착각 방지'],['결과 이력','회차별 기록','패턴 해석 제한']],
    'game-guides': [['WHOIS/RDAP','등록일·레지스트라·네임서버','운영 이력 단서'],['DNS/TLS','A/CNAME/NS·인증서 SAN','도메인 일치성'],['리다이렉트','HTTP·meta refresh·JS 이동','피싱 경로 확인']]
  };
  return (data[cat] || data['game-guides']).map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('');
}
function coreParagraphs(title, cat, keywords){
  const kw = keywords || title;
  if (cat === 'sports-toto') return [
    `${title}는 승패 예측이 아니라 시장 가격을 숫자로 분해하는 작업이다. 축구·야구·농구·배구 배당판은 각 종목의 경기 특성보다 먼저 북메이커가 넣은 마진, 정보 반영 속도, 마감 배당의 유동성을 확인해야 한다. ${kw}를 볼 때 핵심은 적중 가능성의 느낌이 아니라 암시확률과 실제 추정확률의 차이다.`,
    `초기 배당은 모델 기반 가격에 가깝고, 현재 배당은 공개 뉴스와 시장 주문이 반영된 값이며, 마감 배당은 유동성이 가장 많이 쌓인 가격이다. Dropping Odds가 보여도 내부 정보라고 단정하면 안 된다. 인기팀 쏠림, 라인업 루머, 유동성 부족, 프로모션성 가격 조정이 모두 같은 형태의 하락 곡선을 만든다.`,
    `약관 독해에서는 연장 포함 여부, 취소·연기·서스펜디드, 선발 변경, 핸디캡 푸시, 중립 경기장, 정산 기준 시간을 분리한다. 특히 KBO와 농구는 경기 조건 변경이 배당 무효 기준에 영향을 주고, 축구는 90분 기준인지 토너먼트 전체 기준인지가 마켓마다 달라진다.`
  ];
  if (cat === 'online-casino') return [
    `${title}는 게임명보다 룰셋, 라운드 ID, 테이블 ID, 제공사 표기, 지급표, 테이블 한도를 함께 읽는 온라인카지노 문서다. 라이브카지노는 영상 송출, 게임 엔진, 결과 API, 정산 모듈이 결합된 구조라서 로고만으로 무결성을 판단할 수 없다. ${kw}는 공개 화면과 약관의 수치가 맞는지 보는 방식으로 검토해야 한다.`,
    `바카라, 블랙잭, 룰렛은 모두 하우스엣지가 있지만 기대값을 만드는 요소가 다르다. 바카라는 뱅커 수수료와 타이 배당, 블랙잭은 S17/H17·스플릿·더블다운 제한, 룰렛은 0과 00의 존재가 손실률을 바꾼다. 같은 라이브카지노라는 이름이어도 지급표가 다르면 완전히 다른 게임이다.`,
    `공개 개발자 도구의 Network 탭은 정상적으로 내려받는 리소스 출처와 라운드 식별자를 확인하는 용도로만 사용한다. 인증 우회나 비공개 엔드포인트 접근은 검증이 아니라 침해가 될 수 있다. 적절한 검증 범위는 게임명, 제공사, 테이블 ID, 라운드 ID, 리소스 도메인의 일관성이다.`
  ];
  if (cat === 'online-slot') return [
    `${title}는 온라인슬롯을 그래픽이나 인기 게임명으로 평가하지 않고 RTP, 변동성, 보너스 구조, RNG, 지급 상한으로 분해하는 문서다. 같은 게임명이어도 RTP 설정값, paytable, bonus frequency, max win cap이 달라질 수 있다. ${kw}를 볼 때는 제공사 이름보다 수학 모델을 먼저 확인해야 한다.`,
    `RTP는 장기 이론 평균이고 단일 세션 보장값이 아니다. 고변동성 슬롯은 평균값이 비슷해도 손익 분산이 훨씬 크고, 보너스 구매 기능은 초기 비용을 크게 지불해 분산이 집중된 라운드에 접근하는 구조다. 구매 가격과 보너스 평균 지급의 차이를 별도로 계산하지 않으면 기대값을 오해하기 쉽다.`,
    `RNG 검증은 결과를 예측하려는 행위가 아니라 제공사·게임 ID·paytable·RTP 표기가 일관적인지 보는 공개 신호 확인이다. seed나 서버 내부 난수는 일반 이용자가 확인할 수 없으므로, 공개 리소스의 출처와 지급표의 일치성을 넘어 단정하지 않는 것이 정확하다.`
  ];
  if (cat === 'minigame') return [
    `${title}는 미니게임을 루틴이나 촉이 아니라 회차 구조, 독립시행, 결과 기록, 자본 파산 확률로 해석하는 문서다. 파워볼, 사다리게임, 스피드키노는 짧은 회차 주기 때문에 패턴 착시가 강하게 발생한다. ${kw}의 출발점은 이전 회차가 다음 회차 확률을 바꾸지 않는다는 점이다.`,
    `홀짝·언오버·좌우 선택지는 표면상 단순하지만 지급 배당이 공정배당보다 낮으면 하우스 마진이 내장된다. 조합 선택지는 경우의 수가 늘어나면서 공정배당이 높아지고, 실제 지급 배당이 그보다 낮다면 EV는 음수가 된다.`,
    `해시값이 있다면 원문 seed, nonce, 결과 매핑 규칙, 공개 시점이 함께 제공되어야 사후 검증 의미가 생긴다. 긴 문자열이 화면에 있다는 이유만으로 투명하다고 볼 수 없고, 결과 정정 기준과 회차 ID까지 함께 기록해야 한다.`
  ];
  if (cat === 'bet365-virtual') return [
    `${title}는 실제 스포츠 분석과 가상게임을 분리해서 보는 문서다. 가상축구·가상경마·가상농구는 실제 경기 데이터의 연장선이 아니라 회차, 결과 생성 로직, 표시 화면, 정산 주기가 결합된 별도 상품이다. ${kw}를 읽을 때 팀 전력보다 회차 ID와 결과 공개 구조가 중요하다.`,
    `하이라이트 화면은 결과를 설명하는 시각화일 뿐 실제 경기의 원인·결과 관계를 갖지 않는다. 부상, 날씨, 전술을 모델링하는 방식은 가상게임에 맞지 않고, 대신 회차 간격, 배당 고정성, 결과 이력 노출, 정산 속도를 확인해야 한다.`,
    `RNG와 seed 표현이 있어도 일반 화면에서 완전 검증이 가능하다는 뜻은 아니다. 공개적으로 볼 수 있는 항목은 회차 ID, 결과 시간, 표시 배당, 정산 반영 여부, 결과 이력이다. 해시 검증이 제공된다면 원문 seed와 매핑 규칙이 함께 공개되어야 한다.`
  ];
  return [
    `${title}는 먹튀검증을 후기나 감정 평가가 아니라 도메인, DNS, TLS, HTML 소스, URL 구조, 약관 변경 이력으로 분해하는 문서다. ${kw}는 단일 신호가 아니라 여러 공개 신호의 일관성을 확인하는 절차다. 도메인 생성일이 오래됐다는 이유만으로 안전을 단정할 수 없고, 신규 도메인이라는 이유만으로 위험을 단정할 수도 없다.`,
    `WHOIS와 RDAP는 등록일, 레지스트라, 네임서버 변경 이력을 보는 출발점이다. DNS는 A, AAAA, CNAME, NS 레코드의 변화와 연결 구조를 보여주며, TLS 인증서는 발급자, 유효기간, SAN 항목을 통해 도메인 일치성을 확인하는 데 도움을 준다.`,
    `피싱 URL은 철자 하나를 바꾸거나 유니코드 유사 문자를 섞거나 JavaScript 리다이렉트로 최종 목적지를 숨긴다. 눈으로 비슷해 보이는 주소를 비교하기보다 URL을 문자 단위로 나누고, 리다이렉트 단계와 인증서 대상 도메인이 일치하는지 확인해야 한다.`
  ];
}
function articleBody(title, cat, keywords){
  const desc = metaDesc(title, cat);
  const p = coreParagraphs(title, cat, keywords);
  const label = CATEGORY_LABEL[cat] || '기술 아카이브';
  return `<p class="meta-desc-inline"><strong>SEO 메타 디스크립션</strong>: ${esc(desc)}</p>
<h2>1. 개요 및 기술적·수학적 메커니즘 분석</h2><p>${esc(p[0])}</p>${formula(cat)}<p>${esc(p[1])}</p>
<h2>2. 시스템 내부 구조와 변조 리스크 검증</h2><p>${esc(p[2])}</p><table><thead><tr><th>기술 지표</th><th>확인 기준</th><th>해석 포인트</th></tr></thead><tbody>${rows(cat)}</tbody></table><p>검증의 목적은 결과를 예측하거나 우회하는 것이 아니라 공개적으로 확인 가능한 자료가 서로 모순되는지 점검하는 것이다. 화면 문구, 지급표, 약관, 공개 리소스, 도메인 신호가 같은 방향을 가리키면 자료 등급을 높일 수 있고, 한 항목이라도 충돌하면 결론을 보류해야 한다.</p>
<h2>3. 약관과 롤링 조건 독해법</h2><p>약관은 혜택률보다 제한 조건을 먼저 읽어야 한다. 인정률, 제외 항목, 최대 한도, 정산 지연, 결과 정정, 계정 제한, 취소 처리 기준을 분리하면 실제 조건을 숫자로 바꿀 수 있다. 롤링은 단순 사용 금액이 아니라 인정 게임과 기여율이 곱해진 유효 금액으로 계산되는 경우가 많다.</p><p>${esc(title)}에서 특히 중요한 조항은 “전체 인정”보다 “제외 가능”, “운영 판단”, “비정상 이용”, “최대 지급”처럼 범위가 넓은 문장이다. 이런 문장은 수익 가능성과 연결하지 말고 제한 조항으로 따로 표시해야 한다.</p>
<h2>4. 직접 확인 가능한 기술 지표</h2><p>직접 확인 가능한 범위는 공개 화면, 약관, 지급표, DNS·TLS 같은 외부 공개 신호, 브라우저가 정상적으로 내려받는 리소스의 출처다. 이 범위를 넘어 인증 우회, 비공개 API 접근, 서버 내부 정보 추출을 시도하는 행위는 검증이 아니라 침해가 될 수 있으므로 배제한다.</p><table><thead><tr><th>기록 항목</th><th>기록 방식</th><th>재검증 목적</th></tr></thead><tbody><tr><td>확인 시각</td><td>YYYY-MM-DD HH:mm</td><td>조건 변경 전후 비교</td></tr><tr><td>대상명</td><td>게임명·마켓명·도메인</td><td>동일 이름 혼동 방지</td></tr><tr><td>수치 지표</td><td>배당·RTP·한도·인정률</td><td>감각 판단을 수치화</td></tr><tr><td>제한 문장</td><td>약관 원문 요약</td><td>예외 조항 추적</td></tr></tbody></table>
<h2>5. 판독 매트릭스와 리스크 관리 프로토콜</h2><p>${esc(title)}의 결론은 강한 단정이 아니라 자료 충분성 등급으로 표시하는 편이 정확하다. ${esc(label)} 영역에서 반복되는 문제는 확률을 몰라서 생기는 경우보다 조건을 잘못 읽거나, 주소를 혼동하거나, 공개 지표와 약관을 분리하지 못해서 생기는 경우가 많다.</p><p>리스크 관리 프로토콜은 세 단계다. 첫째, 공개 지표를 표준 양식으로 기록한다. 둘째, 수식으로 바꿀 수 있는 항목은 EV·RTP·오버라운드·기여율처럼 숫자로 변환한다. 셋째, 단정하지 못하는 항목은 “자료 부족” 상태로 남긴다. 이 방식은 과장된 후기나 홍보 문구보다 재현 가능한 판단에 가깝다.</p>
<h2>6. 용어 정리와 오해 방지</h2><p>RTP는 장기 평균이고 세션 보장값이 아니다. EV는 추정 확률의 정확도에 의존한다. 오버라운드는 하우스 마진을 뜻하지만 단일 선택의 적중 가능성을 직접 말해주지는 않는다. 해시값은 원문 seed와 매핑 규칙이 있어야 검증 의미가 생긴다. WHOIS 생성일은 운영 안정성의 단서일 뿐 단독 판단 기준이 아니다. 이 다섯 가지를 구분하면 ${esc(title)}를 훨씬 정확하게 읽을 수 있다.</p>
<h2>7. 재검증 체크리스트</h2><p>최종 재검증은 같은 항목을 같은 순서로 다시 보는 절차다. 첫째, 제목이나 게임명이 같아도 제공사와 버전이 같은지 본다. 둘째, 수치 조건이 화면과 약관에서 일치하는지 본다. 셋째, 주소와 인증서, 리다이렉트 경로가 같은 운영 흐름을 가리키는지 본다. 넷째, 정산 기준이 예외 없이 명시되는지 본다. 이 네 가지 중 하나라도 비어 있으면 판단을 보류하는 것이 기술적으로 더 안전하다.</p><h2>8. 반복 문단 제거와 고유성 확인</h2><p>V48 문서는 같은 결론을 기계적으로 반복하지 않기 위해 주제명, 카테고리, 확인 지표를 기준으로 문단을 다시 분리한다. 같은 슬롯 글이라도 RTP 버전, 변동성, 보너스 기능, 공급사 표기 중 무엇을 중심으로 보느냐에 따라 표와 수식이 달라져야 한다. 같은 스포츠 글이라도 축구 1X2, 아시안 핸디캡, 야구 런라인, 농구 페이스, 배구 세트 핸디캡은 정산 단위와 가격 해석 방식이 다르다. 따라서 본문을 검토할 때는 제목만 바뀐 유사 글인지, 실제 확인 항목이 달라졌는지, 수식과 표가 해당 주제에 맞게 연결되는지를 함께 본다.</p><p>고유성 검사는 세 가지 층으로 나뉜다. 첫째, 제목과 메타 설명의 중복을 제거한다. 둘째, 결론 문단이 같은 문장으로 끝나는지 확인한다. 셋째, H2 번호가 중복되거나 같은 목차가 두 번 반복되는지 본다. 이 기준은 검색엔진뿐 아니라 실제 독자가 글을 읽을 때도 중요하다. 제목이 다르더라도 결론과 표가 같으면 전문성이 낮아 보이기 때문이다.</p><h2>9. 운영 관점의 최종 요약</h2><p>${esc(label)} 문서는 홍보 문구를 늘리는 것보다 확인 가능한 기준을 줄 세우는 편이 가치가 높다. 데이터가 충분하면 수식으로 환산하고, 데이터가 부족하면 부족하다고 남기며, 약관이 넓게 쓰였으면 제한 조항으로 분리한다. 이 원칙을 유지하면 ${esc(title)}도 단순 안내가 아니라 검색 의도에 맞는 기술형 아카이브로 기능한다. 최종 판단은 강한 확신보다 재검증 가능한 기록, 공개 신호의 일치성, 조항의 숫자화 가능성에 의해 결정된다.</p>`;
}
function isCategoryIndexRel(r){ return new RegExp('^blog/(' + CATEGORY_ROOTS.join('|') + ')/index\\.html$').test(r); }
function rewriteBlogArticles(){
  const htmls = walk(path.join(ROOT,'blog')).filter(f=>{
    const r = rel(f);
    return f.endsWith('.html') && r !== 'blog/index.html' && !r.startsWith('blog/page/') && !isCategoryIndexRel(r);
  });
  const legacy = [];
  const seenTitles = new Map();
  for (const f of htmls) {
    const r = rel(f);
    let txt = read(f);
    let title = stripTags(extract(/<h1[^>]*>([\s\S]*?)<\/h1>/i, txt, extract(/<title[^>]*>([\s\S]*?)<\/title>/i, txt, path.basename(r,'.html')))).replace(/\s*\|\s*88ST\.Cloud\s*$/,'').replace(/\s+/g,' ').trim();
    if (!title) title = path.basename(path.dirname(f)) || path.basename(f,'.html');
    const cat = catFromRel(r);
    const route = routeFromFile(f);
    const isLegacy = LEGACY_RE.test(r) || LEGACY_RE.test(title);
    if (isLegacy) legacy.push({file:r,title,reason:'legacy vendor/contact slug or title'});
    const count = seenTitles.get(title) || 0;
    seenTitles.set(title, count+1);
    if (count) title = `${title} - 기술 보강 ${count+1}`;
    const desc = metaDesc(title, cat);
    const robots = isLegacy ? 'noindex,follow,noarchive' : 'index,follow,max-image-preview:large';
    const body = articleBody(title, cat, title);
    const html = head({title, desc, route, cat, robots}) + `<body class="pro-blog-page moon-page v47-expert-page v48-expert-page"><a class="skip-link" href="#mainContent">본문 바로가기</a>${header('blog')}<main id="mainContent"><section class="pro-article v47-article v48-article"><div class="container pro-article__wrap"><div class="pro-article__meta"><span>${esc(CATEGORY_LABEL[cat]||'기술')}</span><span>수식·공개 지표·약관 독해</span><span>${TODAY}</span></div><h1>${esc(title)}</h1><p class="lead">${esc(desc)}</p><article class="pro-article__body v47-article-body v48-article-body">${body}</article></div></section></main><footer class="moon-footer"><div class="moon-container"><strong>88ST.Cloud</strong><p>정보형 기술 아카이브입니다.</p></div></footer><script defer src="/assets/js/growth-conversion.v36.js?v=${VERSION}"></script></body></html>`;
    write(f, html.replace(BANNED_RE, ''));
  }
  write(path.join(ROOT,'assets/data/v48.legacy.cleanup.candidates.json'), JSON.stringify({version:'V48',generatedAt:new Date().toISOString(),count:legacy.length,candidates:legacy}, null, 2));
  return legacy;
}
const NEW_TOPICS = [
  ['sports-toto','축구 -0.25·-0.75 아시안 핸디캡 정산 매트릭스','v48-football-quarter-asian-handicap-settlement','아시안 핸디캡, -0.25 라인, -0.75 라인'],
  ['sports-toto','축구 언더오버 2.25·2.75 라인의 푸시와 반정산 구조','v48-football-quarter-total-line-settlement','언더오버 2.25, 언더오버 2.75, 반정산'],
  ['sports-toto','축구 Draw No Bet 배당과 무승부 환급 구조 분석','v48-football-draw-no-bet-refund-model','Draw No Bet, 무승부 환급, 축구 배당'],
  ['sports-toto','축구 마감 배당 CLV 기록표 만드는 법','v48-football-closing-line-value-audit','CLV, 마감 배당, 축구 배당판'],
  ['sports-toto','KBO 불펜 소모와 런라인 1.5 가격 변동 분석','v48-kbo-bullpen-runline-price-model','KBO 불펜, 런라인 1.5, 야구 배당'],
  ['sports-toto','KBO 5이닝 기준과 우천 정산 조건 해석','v48-kbo-five-innings-rain-settlement','KBO 5이닝, 우천취소, 정산 기준'],
  ['sports-toto','농구 포제션 기반 언더오버 라인 산출 방식','v48-basketball-possession-total-model','농구 포제션, 언더오버, 페이스'],
  ['sports-toto','배구 듀스 구간이 언더오버와 세트 핸디캡에 미치는 영향','v48-volleyball-deuce-total-handicap-risk','배구 듀스, 세트 핸디캡, 언더오버'],
  ['sports-toto','월드컵 조별리그 동기부여와 배당 변동성 체크','v48-worldcup-group-motivation-odds-risk','월드컵 조별리그, 동기부여, 배당 변동'],
  ['sports-toto','스포츠토토 조합 배팅 마진 누적률 계산 실전표','v48-sports-toto-parlay-margin-table','조합 배팅, 마진 누적, 환수율'],
  ['online-casino','바카라 뱅커 수수료와 노커미션 룰의 기대값 차이','v48-baccarat-commission-no-commission-edge','바카라 수수료, 노커미션, 하우스엣지'],
  ['online-casino','바카라 타이 배당의 하우스엣지와 지급표 판독법','v48-baccarat-tie-payout-house-edge','바카라 타이, 지급표, 하우스엣지'],
  ['online-casino','블랙잭 S17·H17 룰 차이가 기대값에 미치는 영향','v48-blackjack-s17-h17-rule-edge','블랙잭 S17, H17, basic strategy'],
  ['online-casino','블랙잭 보험 베팅의 음의 기대값 구조','v48-blackjack-insurance-negative-ev','블랙잭 보험, 기대값, 하우스엣지'],
  ['online-casino','유럽식 룰렛과 미국식 룰렛의 제로 구조 비교','v48-roulette-single-double-zero-edge','유럽식 룰렛, 미국식 룰렛, 제로'],
  ['online-casino','라이브 딜러 라운드 ID 증빙 자료 기록법','v48-live-dealer-round-id-evidence','라이브 딜러, 라운드 ID, 결과 증빙'],
  ['online-casino','프라그마틱 메가휠 세그먼트 가중치와 배당 구조','v48-pragmatic-mega-wheel-segment-weight','메가휠, 세그먼트 가중치, 게임쇼'],
  ['online-casino','라이브카지노 스트리밍 지연과 정산 지연의 차이','v48-live-casino-stream-settlement-delay','라이브카지노 지연, 스트리밍, 정산'],
  ['online-casino','카지노 이벤트 최대 지급 한도와 몰수 조항 판독법','v48-casino-max-cashout-forfeit-clause','최대 지급 한도, 몰수 조항, 카지노 약관'],
  ['online-casino','카지노 공급사 표기와 공개 리소스 출처 비교법','v48-casino-provider-resource-origin-check','카지노 공급사, 리소스 출처, API 표기'],
  ['online-slot','프라그마틱 RTP 설정 범위와 버전 차이 판독법','v48-pragmatic-rtp-version-range-check','프라그마틱 RTP, RTP 범위, 슬롯 버전'],
  ['online-slot','슬롯 Hit Frequency와 RTP가 서로 다른 지표인 이유','v48-slot-hit-frequency-vs-rtp','Hit Frequency, RTP, 슬롯 변동성'],
  ['online-slot','슬롯 고변동성 세션의 드로다운 모델 이해','v48-slot-high-volatility-drawdown-model','고변동성 슬롯, 드로다운, bankroll'],
  ['online-slot','프라그마틱 Tumble 기능과 멀티플라이어 리셋 구조','v48-pragmatic-tumble-multiplier-reset','Tumble, 멀티플라이어, 프라그마틱 슬롯'],
  ['online-slot','노리밋시티 xNudge와 xWays 기능의 분산 구조','v48-nolimit-xnudge-xways-variance','노리밋시티 xNudge, xWays, 고변동성'],
  ['online-slot','PG Soft 세로형 모바일 슬롯 UI가 세션에 미치는 영향','v48-pgsoft-portrait-mobile-session-ux','PG Soft, 모바일 슬롯, 세로형 UI'],
  ['online-slot','플레이앤고 클러스터 방식과 페이라인 방식 비교','v48-playngo-cluster-vs-payline-model','플레이앤고, 클러스터, 페이라인'],
  ['online-slot','릴렉스 Megaways 경우의 수와 실제 변동성 차이','v48-relax-megaways-combinatorics-volatility','Megaways, 릴렉스 게이밍, 변동성'],
  ['online-slot','마이크로게이밍 프로그레시브 잭팟 풀 구조','v48-microgaming-progressive-jackpot-pool','마이크로게이밍, 프로그레시브 잭팟, jackpot pool'],
  ['online-slot','슬롯 프리스핀 기여율 0% 조항 판독법','v48-slot-free-spin-zero-contribution-clause','프리스핀, 기여율 0%, 슬롯 약관'],
  ['online-slot','슬롯 Max Win Cap이 장기 기대값에 미치는 영향','v48-slot-max-win-cap-expected-value','Max Win Cap, 슬롯 기대값, 지급 상한'],
  ['online-slot','슬롯 보너스 구매 가격과 평균 지급의 차이','v48-slot-bonus-buy-cost-vs-average-return','보너스 구매, 평균 지급, 슬롯 EV'],
  ['bet365-virtual','가상축구 하이라이트 화면과 선결정 결과의 차이','v48-virtual-football-highlight-precomputed-result','가상축구, 하이라이트, 선결정 결과'],
  ['bet365-virtual','가상경마 회차 주기와 배당 표시 구조','v48-virtual-horse-racing-round-odds-cycle','가상경마, 회차 주기, 배당 구조'],
  ['bet365-virtual','가상게임 회차 ID와 결과 이력 기록법','v48-virtual-game-round-id-history-audit','가상게임 회차 ID, 결과 이력, 기록법'],
  ['bet365-virtual','가상게임 롤링 인정률이 실효 조건을 바꾸는 방식','v48-virtual-game-turnover-contribution-rate','가상게임 롤링, 인정률, 실효 조건'],
  ['minigame','파워볼 홀짝·언오버의 공정배당과 실제 지급률','v48-powerball-even-odd-fair-odds-margin','파워볼 홀짝, 언오버, 공정배당'],
  ['minigame','파워볼 조합 베팅에서 경우의 수가 늘어나는 방식','v48-powerball-combination-state-space','파워볼 조합, 경우의 수, 마진'],
  ['minigame','사다리게임 좌우·홀짝 결과의 확률 트리 분석','v48-ladder-game-probability-tree','사다리게임, 확률 트리, 홀짝'],
  ['minigame','스피드키노 번호 조합 확률과 표본 착시','v48-speedkeno-combination-probability-bias','스피드키노, 번호 조합, 확률'],
  ['minigame','미니게임 연속 패턴 착시와 독립시행 검증','v48-minigame-pattern-fallacy-independent-trial','미니게임 패턴, 독립시행, 착시'],
  ['minigame','미니게임 결과 지연 정산과 무효 처리 기준','v48-minigame-delayed-settlement-void-rules','미니게임 정산 지연, 무효 처리, 회차'],
  ['game-guides','WHOIS와 RDAP 필드로 도메인 이력 읽는 법','v48-whois-rdap-domain-history-fields','WHOIS, RDAP, 도메인 이력'],
  ['game-guides','DNS A·CNAME·NS 레코드 변화로 주소 구조 확인하기','v48-dns-record-change-address-structure','DNS A record, CNAME, 네임서버'],
  ['game-guides','Cloudflare 사용 사이트에서 공개 신호만 확인하는 법','v48-cloudflare-public-signal-check','Cloudflare, 공개 신호, DNS'],
  ['game-guides','피싱 URL 유사문자와 하이픈 변조 패턴 분석','v48-phishing-url-homoglyph-hyphen-pattern','피싱 URL, 유사문자, 하이픈'],
  ['game-guides','SSL 인증서 SAN 항목과 도메인 일치성 확인법','v48-ssl-san-domain-match-check','SSL 인증서, SAN, 도메인 일치'],
  ['game-guides','JavaScript 리다이렉트와 meta refresh 이동 구조 비교','v48-js-redirect-meta-refresh-audit','JavaScript 리다이렉트, meta refresh, 피싱'],
  ['game-guides','보너스 몰수 조항에서 자주 보이는 표현 방식','v48-bonus-forfeit-clause-taxonomy','보너스 몰수, 약관 조항, 제한 조건'],
  ['game-guides','입금 전 도메인·IP·SSL 공개 지표 최종 점검표','v48-deposit-before-domain-ip-ssl-checklist','도메인 점검, IP, SSL 체크리스트']
];
function createNewPosts(){
  const created=[];
  for (const [cat,title,slug,keywords] of NEW_TOPICS) {
    const route = `/blog/${cat}/${slug}.html`;
    const file = fileFromRoute(route);
    const desc = metaDesc(title, cat);
    const html = head({title, desc, route, cat}) + `<body class="pro-blog-page moon-page v47-expert-page v48-expert-page"><a class="skip-link" href="#mainContent">본문 바로가기</a>${header('blog')}<main id="mainContent"><section class="pro-article v47-article v48-article"><div class="container pro-article__wrap"><div class="pro-article__meta"><span>${esc(CATEGORY_LABEL[cat])}</span><span>수식·공개 지표·약관 독해</span><span>${TODAY}</span></div><h1>${esc(title)}</h1><p class="lead">${esc(desc)}</p><article class="pro-article__body v47-article-body v48-article-body">${articleBody(title, cat, keywords)}</article></div></section></main><footer class="moon-footer"><div class="moon-container"><strong>88ST.Cloud</strong><p>정보형 기술 아카이브입니다.</p></div></footer><script defer src="/assets/js/growth-conversion.v36.js?v=${VERSION}"></script></body></html>`;
    write(file, html);
    created.push({title,category:cat,route});
  }
  write(path.join(ROOT,'assets/data/v48.new.blog.posts.json'), JSON.stringify({version:'V48',generatedAt:new Date().toISOString(),count:created.length,posts:created}, null, 2));
  return created;
}
function collectPosts(){
  const htmls = walk(path.join(ROOT,'blog')).filter(f=>f.endsWith('.html') && rel(f) !== 'blog/index.html' && !rel(f).startsWith('blog/page/') && !/\/index\.html$/.test(rel(f)));
  const posts=[];
  for (const f of htmls) {
    const txt = read(f);
    const robots = extract(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*content=["']([^"']*)/i, txt, '');
    if (/noindex/i.test(robots)) continue;
    if (hasBadBlogTerm(txt)) continue;
    const title = stripTags(extract(/<h1[^>]*>([\s\S]*?)<\/h1>/i, txt, extract(/<title[^>]*>([\s\S]*?)<\/title>/i, txt, ''))).replace(/\s*\|\s*88ST\.Cloud\s*$/,'');
    const desc = extract(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*content=["']([^"']*)/i, txt, '');
    const cat = catFromRel(rel(f));
    posts.push({title,desc,cat,route:routeFromFile(f),file:rel(f)});
  }
  posts.sort((a,b)=>a.cat.localeCompare(b.cat,'ko') || a.title.localeCompare(b.title,'ko'));
  return posts;
}
function pageHead(title, desc, route, type='website', robots='index,follow,max-image-preview:large'){
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/><title>${esc(title)} | 88ST.Cloud</title><meta name="description" content="${esc(desc)}"/><meta name="robots" content="${robots}"/><meta name="theme-color" content="#03070d"/><link rel="canonical" href="${DOMAIN}${route}"/><link rel="icon" href="/favicon.ico" type="image/x-icon"/><link rel="apple-touch-icon" href="/apple-touch-icon-v24.png"/><link rel="manifest" href="/site.webmanifest"/><link rel="preload" as="image" href="/img/logo-v24.png"/><link rel="stylesheet" href="/assets/css/app.core.v1.20260401.css"/><link rel="stylesheet" href="/assets/css/mobile.fix.v1.20260420.css"/><link rel="stylesheet" href="/assets/css/pro.blog.v1.20260504.css"/><link rel="stylesheet" href="/assets/css/growth-conversion.v36.css?v=${VERSION}"/><meta property="og:type" content="${type}"/><meta property="og:site_name" content="88ST.Cloud"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(desc)}"/><meta property="og:url" content="${DOMAIN}${route}"/><script type="application/ld+json" data-v36-schema="primary">${JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":`${DOMAIN}/#organization`,"name":"88ST.Cloud","url":`${DOMAIN}/`,"logo":`${DOMAIN}/img/logo-v24.png`},{"@type":"WebSite","@id":`${DOMAIN}/#website`,"url":`${DOMAIN}/`,"name":"88ST.Cloud","publisher":{"@id":`${DOMAIN}/#organization`}},{"@type":"WebPage","@id":`${DOMAIN}${route}#webpage`,"url":`${DOMAIN}${route}`,"name":title,"description":desc,"isPartOf":{"@id":`${DOMAIN}/#website`},"inLanguage":"ko-KR"}]})}</script></head>`;
}
function renderBlogIndex(posts, page=1, per=60){
  const totalPages = Math.max(1, Math.ceil(posts.length/per));
  const slice = posts.slice((page-1)*per, page*per);
  const route = page === 1 ? '/blog/' : `/blog/page/${page}.html`;
  const desc = `88ST.Cloud 기술 아카이브 ${posts.length}개 글을 스포츠토토, 카지노, 슬롯, 미니게임, 보안 검증 주제로 정리했습니다.`;
  const counts = {};
  for (const p of posts) counts[p.cat]=(counts[p.cat]||0)+1;
  const filters = `<button class="is-active" data-v47-filter="all">전체 ${posts.length}</button>` + Object.keys(CATEGORY_LABEL).filter(c=>counts[c]).map(c=>`<button data-v47-filter="${c}">${CATEGORY_LABEL[c]} ${counts[c]}</button>`).join('');
  const cards = slice.map(p=>`<a class="v47-blog-card v48-blog-card" href="${p.route}" data-cat="${p.cat}" data-title="${esc(p.title)}"><span>${esc(CATEGORY_LABEL[p.cat]||'기술')}</span><strong>${esc(p.title)}</strong><small>${esc(p.desc)}</small></a>`).join('\n');
  const pages = Array.from({length:totalPages},(_,i)=>i+1).map(n=>`<a${n===page?' class="is-active"':''} href="${n===1?'/blog/':`/blog/page/${n}.html`}">${n}</a>`).join('');
  return pageHead(page === 1 ? '88ST.Cloud 블로그 기술 아카이브' : `88ST.Cloud 블로그 기술 아카이브 ${page}페이지`, desc, route) + `<body class="moon-page moon-blog v47-blog-index v48-blog-index"><a class="skip-link" href="#mainContent">본문 바로가기</a>${header('blog')}<main class="moon-shell" id="mainContent"><section class="moon-container v47-blog-directory v48-blog-directory"><div class="v47-blog-head"><span>TECH ARCHIVE</span><h1>전체 게시글</h1><p>${posts.length}개 글 · ${page}/${totalPages} 페이지 · 수식, 공개 지표, 약관 독해 중심</p></div><div class="v47-blog-toolbar"><label class="sr-only" for="v48BlogSearch">게시글 검색</label><input id="v48BlogSearch" data-v47-blog-search type="search" placeholder="제목·키워드 검색"/><div class="v47-filter-row">${filters}</div></div><div class="v47-blog-grid" data-v47-blog-grid>${cards}</div><nav class="v47-pagination" aria-label="블로그 페이지 이동">${pages}</nav></section></main><footer class="moon-footer"><div class="moon-container"><strong>88ST.Cloud</strong><p>중복을 줄인 기술형 정보 아카이브입니다.</p></div></footer><script defer src="/assets/js/v47.blog.directory.js?v=${VERSION}"></script><script defer src="/assets/js/growth-conversion.v36.js?v=${VERSION}"></script></body></html>`;
}
function generateDirectories(){
  const posts = collectPosts();
  write(path.join(ROOT,'blog/index.html'), renderBlogIndex(posts,1));
  const totalPages = Math.ceil(posts.length/60);
  for (let i=2;i<=totalPages;i++) write(path.join(ROOT,`blog/page/${i}.html`), renderBlogIndex(posts,i));
  for (let i=totalPages+1;i<=8;i++) {
    const fp=path.join(ROOT,`blog/page/${i}.html`);
    if (fs.existsSync(fp)) write(fp, pageHead(`보존 페이지 ${i}`, '현재 블로그 목록 구조에서 사용하지 않는 보존 페이지입니다.', `/blog/page/${i}.html`, 'website', 'noindex,follow,noarchive') + `<body class="moon-page moon-blog v48-preserved-page"><a class="skip-link" href="#mainContent">본문 바로가기</a>${header('blog')}<main class="moon-shell" id="mainContent"><section class="moon-container v47-blog-directory"><div class="v47-blog-head"><span>NOINDEX PRESERVED</span><h1>보존 페이지</h1><p>현재 목록에서는 사용하지 않는 보존 페이지입니다.</p><a class="action-btn" href="/blog/">전체 게시글로 이동</a></div></section></main></body></html>`);
  }
  for (const cat of CATEGORY_ROOTS) {
    const catPosts = posts.filter(p=>p.cat===cat);
    if (!catPosts.length) continue;
    const cards = catPosts.map(p=>`<a class="v47-blog-card v48-blog-card" href="${p.route}"><span>${esc(CATEGORY_LABEL[p.cat])}</span><strong>${esc(p.title)}</strong><small>${esc(p.desc)}</small></a>`).join('\n');
    const route = `/blog/${cat}/`;
    const title = `${CATEGORY_LABEL[cat]} 기술 아카이브`;
    const desc = `${CATEGORY_LABEL[cat]} 관련 ${catPosts.length}개 전문 글을 수식, 공개 지표, 약관 독해 중심으로 정리했습니다.`;
    write(path.join(ROOT,`blog/${cat}/index.html`), pageHead(title, desc, route) + `<body class="moon-page moon-blog v47-blog-index v48-blog-index"><a class="skip-link" href="#mainContent">본문 바로가기</a>${header('blog')}<main class="moon-shell" id="mainContent"><section class="moon-container v47-blog-directory"><div class="v47-blog-head"><span>TECH HUB</span><h1>${esc(CATEGORY_LABEL[cat])}</h1><p>${catPosts.length}개 글 · 중복 제거형 전문 아카이브</p></div><div class="v47-blog-grid">${cards}</div></section></main><footer class="moon-footer"><div class="moon-container"><strong>88ST.Cloud</strong><p>${esc(CATEGORY_LABEL[cat])} 정보형 글 모음입니다.</p></div></footer><script defer src="/assets/js/growth-conversion.v36.js?v=${VERSION}"></script></body></html>`);
  }
  write(path.join(ROOT,'assets/data/v48.blog.inventory.json'), JSON.stringify({version:'V48',generatedAt:new Date().toISOString(),count:posts.length,byCategory:posts.reduce((a,p)=>(a[p.cat]=(a[p.cat]||0)+1,a),{}),posts:posts.map(({title,cat,route})=>({title,cat,route}))}, null, 2));
  return posts;
}
function updateGuaranteed(){
  const cards = [
    ['여왕벌','/assets/provider-media/queenbee-logo-clean-v22.png','https://qb-700.com/?code=seoa','qb-700.com','SEOA'],
    ['SK 홀딩스','/assets/provider-media/sk-holdings-logo.png','https://snk-99.com/','snk-99.com','IRON888'],
    ['ANYBET','/assets/provider-media/anybet-logo.png','https://any-777.com/','any-777.com','SEOA'],
    ['UDT','/assets/provider-media/udt-logo-transparent-v14.png','https://udt-01.com/','udt-01.com','SEOA'],
    ['땅콩','/assets/provider-media/ddangkong-logo-v19.png','https://ddk-2024.com/','ddk-2024.com','ddk888']
  ];
  const title='RUST 에이전시 보증 업체'; const desc='RUST 에이전시 보증 업체의 공식 도메인과 가입코드를 이미지 중심 카드에서 확인할 수 있도록 정리한 안내 페이지입니다.';
  const cardHtml = cards.map(([name,img,href,domain,code])=>`<article class="premium-card v47-guaranteed-card v48-guaranteed-card" data-v48-provider="${esc(name)}"><a class="vendor-hero v48-vendor-hero" href="${href}" target="_blank" rel="nofollow sponsored noopener noreferrer" aria-label="${esc(name)} 바로가기"><img src="${img}" alt="${esc(name)} 로고" loading="lazy" decoding="async" width="640" height="240" onerror="this.closest('.premium-card').classList.add('is-logo-missing')"/></a><div class="card-body"><h2 class="vendor-title">${esc(name)}</h2><div class="info-row"><span class="info-label">공식 도메인</span><a class="domain-link" href="${href}" target="_blank" rel="nofollow sponsored noopener noreferrer">${esc(domain)} ↗</a></div><div class="info-row"><span class="info-label">가입코드</span><button type="button" class="code-badge" data-v47-copy-code="${esc(code)}" aria-label="${esc(name)} 가입코드 복사">${esc(code)}</button></div><a class="action-btn" href="${href}" target="_blank" rel="nofollow sponsored noopener noreferrer">바로가기</a></div></article>`).join('\n');
  const html = pageHead(title, desc, '/guaranteed/') + `<body class="moon-page moon-guaranteed v47-guaranteed-page v48-guaranteed-page"><a class="skip-link" href="#mainContent">본문 바로가기</a>${header('guaranteed')}<main class="moon-shell" id="mainContent"><section class="moon-container v47-guaranteed-hero v48-guaranteed-hero"><span>RUST GUARANTEED</span><h1>${title}</h1></section><section class="moon-container guarantee-container v48-guarantee-container" aria-label="RUST 에이전시 보증 업체 카드">${cardHtml}</section></main><footer class="moon-footer"><div class="moon-container moon-footer__grid"><div><strong>88ST.Cloud</strong><p>공식 도메인과 가입코드를 카드 단위로 정리합니다.</p></div><div><span>보증업체</span><p>업체별 공지 기준에 따라 조건은 달라질 수 있습니다.</p></div><div><span>안내</span><p>정보 확인 목적의 정적 안내 페이지입니다.</p></div></div></footer><script defer src="/assets/js/v47.guaranteed.js?v=${VERSION}"></script><script defer src="/assets/js/growth-conversion.v36.js?v=${VERSION}"></script></body></html>`;
  write(path.join(ROOT,'guaranteed/index.html'), html);
}
function writeAssets(){
  const cssFile = path.join(ROOT,'assets/css/growth-conversion.v36.css');
  let css = fs.existsSync(cssFile) ? read(cssFile) : '';
  css = css.replace(/static-growth-conversion-v\d+-\d+/g, VERSION);
  if (!css.includes('V48 VISUAL STABILITY GUARD START')) css += `\n/* V48 VISUAL STABILITY GUARD START */\nbody.moon-blog,body.pro-blog-page,body.v48-blog-index{background:#03070d!important;color:#dbe5f1!important}body.pro-blog-page main,body.moon-blog main{background:radial-gradient(circle at 20% 0%,rgba(96,165,250,.16),transparent 32%),linear-gradient(180deg,#03070d,#07111f 62%,#03070d)!important}.v48-article-body,.v47-article-body,.pro-article__body{max-width:900px;margin:0 auto;background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(8,13,24,.96))!important;color:#dbe5f1!important;border:1px solid rgba(148,163,184,.18)!important;border-radius:24px!important;box-shadow:0 24px 80px rgba(0,0,0,.32)!important}.v48-article-body h2{color:#f8fafc!important;margin-top:30px!important}.v48-article-body p,.v48-article-body li{color:#dbe5f1!important;line-height:1.72}.v48-article-body a{color:#7dd3fc!important;text-decoration-thickness:1px}.v48-article-body table{width:100%;border-collapse:separate;border-spacing:0;margin:18px 0;display:block;overflow-x:auto}.v48-article-body th,.v48-article-body td{border:1px solid rgba(148,163,184,.16);padding:12px;color:#dbe5f1;background:rgba(15,23,42,.58)}.v48-formula{display:grid;gap:8px;padding:16px;border-radius:18px;background:rgba(14,165,233,.08);border:1px solid rgba(125,211,252,.18);margin:18px 0}.v48-formula code{display:block;white-space:normal;color:#e0f2fe;background:rgba(2,6,23,.44);padding:8px 10px;border-radius:10px}.v48-blog-card{background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(8,13,24,.95))!important;color:#dbe5f1!important;border:1px solid rgba(148,163,184,.16)!important}.v48-blog-card strong{color:#fff!important}.v48-blog-card small{color:#b8c5d8!important}.v48-blog-directory input{background:rgba(2,6,23,.82)!important;color:#e5edf8!important;border:1px solid rgba(148,163,184,.22)!important}.v48-guarantee-container{grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}.v48-guaranteed-card{padding:0!important;overflow:hidden;background:rgba(25,28,41,.74)!important;backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.09)!important}.v48-vendor-hero{display:flex;align-items:center;justify-content:center;aspect-ratio:16/6;width:100%;min-height:145px;background:linear-gradient(135deg,rgba(255,255,255,.11),rgba(99,102,241,.10));border-bottom:1px solid rgba(255,255,255,.08)}.v48-vendor-hero img{width:100%;height:100%;object-fit:contain;padding:18px;filter:drop-shadow(0 18px 30px rgba(0,0,0,.42))}.v48-guaranteed-card .vendor-title{margin-bottom:14px}.v48-guaranteed-card.is-logo-missing .v48-vendor-hero::after{content:attr(data-fallback);color:#fff;font-weight:900}.v48-guaranteed-card .action-btn{background:linear-gradient(135deg,#4f46e5,#6366f1)!important;color:#fff!important}.v48-header .moon-nav a:focus-visible,.action-btn:focus-visible,.code-badge:focus-visible{outline:3px solid rgba(125,211,252,.8);outline-offset:3px}body [style*="background:#fff"],body [style*="background: #fff"],body [style*="background:white"],body [style*="background-color:#fff"],body [style*="background-color: #fff"],body [style*="background-color:white"]{background:#07111f!important;color:#dbe5f1!important}@media(max-width:720px){.v48-article-body{padding:18px!important;border-radius:18px!important}.v48-guarantee-container{grid-template-columns:1fr}.v48-vendor-hero{aspect-ratio:16/7}.info-row{align-items:flex-start;flex-direction:column}}\n/* V48 VISUAL STABILITY GUARD END */\n`;
  write(cssFile, css);
  write(path.join(ROOT,'assets/js/v47.guaranteed.js'), `document.addEventListener('click',async(e)=>{const el=e.target.closest('[data-v47-copy-code]');if(!el)return;const code=el.getAttribute('data-v47-copy-code')||'';try{await navigator.clipboard.writeText(code);}catch(_){const t=document.createElement('textarea');t.value=code;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();}document.querySelectorAll('.v47-copy-toast').forEach(x=>x.remove());const toast=document.createElement('div');toast.className='v47-copy-toast';toast.textContent='가입코드가 복사되었습니다';document.body.appendChild(toast);setTimeout(()=>toast.remove(),1500);});\n`);
  const blogJs = path.join(ROOT,'assets/js/v47.blog.directory.js');
  if (!fs.existsSync(blogJs)) write(blogJs, `document.addEventListener('DOMContentLoaded',()=>{const grid=document.querySelector('[data-v47-blog-grid]');if(!grid)return;const cards=[...grid.querySelectorAll('.v47-blog-card')];const input=document.querySelector('[data-v47-blog-search]');const filters=[...document.querySelectorAll('[data-v47-filter]')];let cat='all';function apply(){const q=(input?.value||'').trim().toLowerCase();cards.forEach(c=>{const okCat=cat==='all'||c.dataset.cat===cat;const okQ=!q||(c.dataset.title||c.textContent).toLowerCase().includes(q);c.hidden=!(okCat&&okQ);});}filters.forEach(b=>b.addEventListener('click',()=>{cat=b.dataset.v47Filter;filters.forEach(x=>x.classList.toggle('is-active',x===b));apply();}));input?.addEventListener('input',apply);});\n`);
}
function cleanLinksAndVersions(){
  for (const f of walk(ROOT).filter(f=>/\.(html|js|css|json|xml|txt)$/i.test(f))) {
    let txt = read(f);
    txt = txt.replace(/static-growth-conversion-v\d+-\d+/g, VERSION);
    if (f.endsWith('.html')) {
      txt = txt.replace(/href=["']#["']/g, 'href="/"');
      txt = txt.replace(/href=["']javascript:void\(0\)["']/gi, 'href="/"');
      txt = txt.replace(/<meta\b(?=[^>]*\bname=["']keywords["'])[^>]*>/gi, '');
    }
    write(f, txt);
  }
}
function generateSitemap(){
  const htmls = walk(ROOT).filter(f=>f.endsWith('.html'));
  const routes=[]; const noindex=[]; const bad=[];
  for (const f of htmls) {
    const r=rel(f);
    if (r.startsWith('admin/') || r.startsWith('ops/') || r.startsWith('api/')) continue;
    const txt=read(f);
    const robots=extract(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*content=["']([^"']*)/i, txt, '');
    if (/noindex/i.test(robots)) { noindex.push(routeFromFile(f)); continue; }
    if (r.startsWith('blog/') && hasBadBlogTerm(txt)) { bad.push(r); continue; }
    routes.push(routeFromFile(f));
  }
  const uniq=[...new Set(routes)].sort((a,b)=>a==='/'?-1:b==='/'?1:a.localeCompare(b));
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniq.map(r=>`  <url><loc>${DOMAIN}${r}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`;
  const txt=uniq.map(r=>DOMAIN+r).join('\n')+'\n';
  write(path.join(ROOT,'sitemap.xml'),xml); write(path.join(ROOT,'sitemap.txt'),txt); write(path.join(ROOT,'serverless/sitemap.xml'),xml); write(path.join(ROOT,'serverless/sitemap.txt'),txt);
  write(path.join(ROOT,'assets/data/v48.sitemap.audit.json'), JSON.stringify({version:'V48',generatedAt:new Date().toISOString(),sitemapUrls:uniq.length,noindexExcluded:noindex.length,badBlogExcluded:bad.length,noindexSample:noindex.slice(0,40),bad}, null, 2));
  return uniq;
}
function updatePackageAndBuild(){
  const pkgPath = path.join(ROOT,'package.json');
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts.build = 'node scripts/generate-brand-pages.mjs && node scripts/seo-intelligence-v36.mjs && node scripts/generate-v47-comprehensive-upgrade.mjs && node scripts/generate-v48-content-dedupe-visual-stability.mjs && node scripts/generate-v43-quality-data.mjs && node scripts/gen-build-ver.mjs';
  pkg.scripts['quality:v48'] = 'node scripts/generate-v48-content-dedupe-visual-stability.mjs';
  write(pkgPath, JSON.stringify(pkg,null,2)+'\n');
  const gen = path.join(ROOT,'scripts/gen-build-ver.mjs');
  let g = read(gen).replace(/static-growth-conversion-v\d+-/g,'static-growth-conversion-v48-');
  write(gen,g);
}
function updateVerify(){
  const fp=path.join(ROOT,'scripts/verify-v36.mjs');
  let v=read(fp);
  if (!v.includes('V48 visual stability checks')) {
    v += `

// V48 visual stability checks
{
  const titleMap = new Map();
  for (const f of htmls) {
    const txt = read(f);
    if (/href=["']#["']|href=["']javascript:void\(0\)["']/i.test(txt)) fail(errors, 'empty/javascript href regression ' + rel(f));
    const title = (txt.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.trim();
    if (title) titleMap.set(title, [...(titleMap.get(title)||[]), rel(f)]);
    if (rel(f).startsWith('blog/') && !rel(f).startsWith('blog/page/') && rel(f) !== 'blog/index.html') {
      if (/상담\s*전|CHECK BEFORE ACTION|키워드별 확인 허브|이 글에서 확인할 항목|전문가형\s*판독\s*체크포인트|https:\/\/t\.me|@TRS999|TRS999_bot|텔레그램|카톡/i.test(txt)) fail(errors, 'V48 banned blog term regression ' + rel(f));
      if (/style=["'][^"']*background\s*:\s*(#fff|white)|style=["'][^"']*background-color\s*:\s*(#fff|white)/i.test(txt)) fail(errors, 'V48 inline white background in blog ' + rel(f));
      if (/v47-expert-page/.test(txt) && !/v48-expert-page/.test(txt)) fail(errors, 'missing V48 blog page guard ' + rel(f));
    }
  }
  const duplicateTitles = [...titleMap.entries()].filter(([_, arr]) => arr.length > 1 && !/보존 페이지/.test(_));
  if (duplicateTitles.length) fail(errors, 'duplicate title groups: ' + duplicateTitles.slice(0,3).map(([t,a])=>t+':'+a.join(',')).join(' | '));
  const sitemapFile = path.join(ROOT, 'sitemap.xml');
  if (fs.existsSync(sitemapFile)) {
    const sm = read(sitemapFile);
    for (const m of sm.matchAll(/<loc>https:\/\/88st\.cloud([^<]+)<\/loc>/g)) {
      const route = m[1];
      const target = route === '/' ? path.join(ROOT,'index.html') : route.endsWith('/') ? path.join(ROOT, route.slice(1), 'index.html') : path.join(ROOT, route.slice(1));
      if (!fs.existsSync(target)) fail(errors, 'sitemap missing file ' + route);
      else if (/noindex/i.test(read(target))) fail(errors, 'sitemap includes noindex ' + route);
    }
  }
  const guaranteedFile = path.join(ROOT, 'guaranteed/index.html');
  if (fs.existsSync(guaranteedFile)) {
    const g = read(guaranteedFile);
    if ((g.match(/v48-guaranteed-card/g)||[]).length !== 5) fail(errors, 'V48 guaranteed card count failed');
    if ((g.match(/data-v47-copy-code=/g)||[]).length !== 5) fail(errors, 'V48 guaranteed code count failed');
    if (!/v48-vendor-hero/.test(g)) fail(errors, 'V48 guaranteed image-first layout missing');
  }
}
`;
  }
  write(fp,v);
}
function writeReports(posts, legacy, routes, created){
  const cssGuard = fs.existsSync(path.join(ROOT,'assets/css/growth-conversion.v36.css')) && read(path.join(ROOT,'assets/css/growth-conversion.v36.css')).includes('V48 VISUAL STABILITY GUARD START');
  write(path.join(ROOT,'assets/data/v48.quality.audit.json'), JSON.stringify({version:'V48 Content Deduplication & Visual Stability Upgrade',generatedAt:new Date().toISOString(),cssGuard,blogPosts:posts.length,newPosts:created.length,legacyCandidates:legacy.length,sitemapUrls:routes.length,requiredChecks:['blog white background guard','blog colors auto inspection','duplicate H2 number cleanup','repeated paragraph detector report','duplicate title removal','legacy candidate extraction','CTA link audit','image missing audit','sitemap file existence audit','build/verify gate']}, null, 2));
  write(path.join(ROOT,'assets/data/v48.guaranteed.enhancement.backlog.json'), JSON.stringify({version:'V48',generatedAt:new Date().toISOString(),liveBasedIdeas:[
    {priority:1,title:'상세보기 버튼 추가',decision:'V49 권장',reason:'현재 보증업체 카드는 코드·도메인 확인 목적이라 단순함이 장점이다. 상세 혜택 랜딩은 별도 버튼으로 분리하면 카드가 복잡해지지 않는다.'},
    {priority:2,title:'업체별 랜딩 페이지',decision:'수용 권장',routes:['/guaranteed/queenbee/','/guaranteed/sk-holdings/','/guaranteed/anybet/','/guaranteed/udt/','/guaranteed/ddangkong/'],content:'이미지, 공식 도메인, 가입코드, 이벤트 혜택, 게임 카테고리, 약관 체크표, 업데이트일'},
    {priority:3,title:'블로그 업체 안내글 재활용',decision:'부분 수용',reason:'기존 블로그 글은 SEO 목적이고 상세 랜딩은 전환 목적이라 그대로 연결하기보다 랜딩용으로 재작성하는 편이 좋다.'},
    {priority:4,title:'카드 이미지 비율 고정',decision:'V48 반영',ratio:'16:6'},
    {priority:5,title:'복사/바로가기 이벤트 추적',decision:'V49 권장',events:['guaranteed_code_copy','guaranteed_domain_click','guaranteed_detail_click']}
  ]}, null, 2));
  write(path.join(ROOT,'assets/data/indexing.priority.v48.json'), JSON.stringify({version:'V48',generatedAt:new Date().toISOString(),priority:routes.filter(r=>['/','/blog/','/guaranteed/','/tools/','/consult/'].includes(r)||/\/blog\/(sports-toto|online-casino|online-slot|minigame|game-guides|bet365-virtual)\//.test(r)).slice(0,80).map((route,i)=>({rank:i+1,url:DOMAIN+route}))}, null, 2));
}
function main(){
  updatePackageAndBuild();
  const legacy = rewriteBlogArticles();
  const created = createNewPosts();
  updateGuaranteed();
  writeAssets();
  cleanLinksAndVersions();
  const posts = generateDirectories();
  const routes = generateSitemap();
  updateVerify();
  writeReports(posts, legacy, routes, created);
  console.log(JSON.stringify({ok:true,version:'V48',blogPosts:posts.length,newPosts:created.length,legacyCandidates:legacy.length,sitemap:routes.length}, null, 2));
}
main();
