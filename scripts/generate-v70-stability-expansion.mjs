import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const stamp = 'static-v70-stability-expansion-20260524';
const cssHref = `/assets/css/v70.stability-platform.css?v=${stamp}`;
const jsSrc = `/assets/js/v70.stability-platform.js?v=${stamp}`;
const cssTag = `<link rel="stylesheet" href="${cssHref}" data-v70-stability="true">`;
const jsTag = `<script src="${jsSrc}" defer data-v70-stability="true"></script>`;
const nav = (active='') => `<header class="v70-header" data-v70-component="global-header"><div class="v70-shell v70-header__inner"><a class="v70-brand" href="/" aria-label="88ST.Cloud 홈"><span class="v70-brand__mark">88</span><span class="v70-brand__text"><strong>88ST</strong><span>.Cloud</span></span></a><nav class="v70-nav" aria-label="주요 메뉴"><a href="/"${active==='home'?' aria-current="page"':''}>메인</a><a href="/blog/"${active==='blog'?' aria-current="page"':''}>블로그</a><a href="/tools/"${active==='tools'?' aria-current="page"':''}>도구</a><a href="/guaranteed/"${active==='guaranteed'?' aria-current="page"':''}>보증업체</a><a href="/consult/"${active==='consult'?' aria-current="page"':''}>상담</a></nav><a class="v70-header-cta" href="/consult/">자동 상담 시작</a></div></header>`;
const mobile = (active='') => `<nav class="v70-mobile-nav" aria-label="모바일 하단 내비게이션" data-v70-component="mobile-nav"><a href="/"${active==='home'?' aria-current="page"':''}><span>⌂</span>메인</a><a href="/blog/"${active==='blog'?' aria-current="page"':''}><span>▤</span>블로그</a><a href="/tools/"${active==='tools'?' aria-current="page"':''}><span>◇</span>도구</a><a href="/guaranteed/"${active==='guaranteed'?' aria-current="page"':''}><span>◆</span>보증</a><a href="/consult/"${active==='consult'?' aria-current="page"':''}><span>✦</span>상담</a></nav>`;
const footer = `<footer class="v70-footer"><div class="v70-shell v70-footer__inner"><div><b>88ST.Cloud</b><p>보증업체 큐레이션, 계산 도구, 자동 상담 연결을 하나의 정보 플랫폼으로 정리합니다.</p></div><nav aria-label="하단 메뉴"><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">상담</a></nav></div></footer>`;
const commonTail = (active='') => `<div class="v70-sticky-cta" data-v70-component="sticky-cta"><a class="v70-btn--ghost" href="/guaranteed/">보증업체 보기</a><a class="v70-btn--primary" href="/consult/">자동 상담 시작</a></div><a class="v70-fab" href="/consult/" aria-label="자동 상담 시작" data-v70-component="fab">💬 상담</a>${mobile(active)}${jsTag}`;
function page(title, desc, active, body, canonicalPath){
  const canonical = canonicalPath || (active==='home' ? '/' : `/${active}/`);
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${title}</title><meta name="description" content="${desc}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#0F172A"><link rel="canonical" href="https://88st.cloud${canonical}"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon-v24.png"><link rel="manifest" href="/site.webmanifest">${cssTag}<meta property="og:type" content="website"><meta property="og:site_name" content="88ST.Cloud"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"></head><body class="v70-platform"><div class="v70-page">${nav(active)}<main class="v70-main">${body}</main>${footer}</div>${commonTail(active)}</body></html>`;
}
function cleanLegacy(html){
  let out = html;
  out = out.replace(/<a\b[^>]*class=["'][^"']*\bv68-fab\b[^"']*["'][\s\S]*?<\/a>/gi,'');
  out = out.replace(/<nav\b[^>]*class=["'][^"']*\bv68-mobile-nav\b[^"']*["'][\s\S]*?<\/nav>/gi,'');
  out = out.replace(/<a\b[^>]*class=["'][^"']*\bv69-fab\b[^"']*["'][\s\S]*?<\/a>/gi,'');
  out = out.replace(/<nav\b[^>]*class=["'][^"']*\bv69-mobile-nav\b[^"']*["'][\s\S]*?<\/nav>/gi,'');
  out = out.replace(/<div\b[^>]*class=["'][^"']*\bv69-sticky-cta\b[^"']*["'][\s\S]*?<\/div>/gi,'');
  out = out.replace(/<script\b[^>]*src=["'][^"']*v70\.stability-platform\.js[^"']*["'][^>]*><\/script>/gi,'');
  out = out.replace(/<link\b[^>]*href=["'][^"']*v70\.stability-platform\.css[^"']*["'][^>]*>/gi,'');
  return out;
}
const homeBody = `<section class="v70-shell v70-hero"><div class="v70-card v70-hero-card"><span class="v70-kicker">SAFETY · TOOLS · CONSULT</span><h1 class="v70-title">보증업체 안내와 분석 도구를 한 화면에서.</h1><p class="v70-lead">88ST.Cloud는 광고 랜딩이 아니라 주소 확인, 조건 계산, 보증업체 큐레이션, 자동 상담을 연결하는 정보 플랫폼입니다.</p><div class="v70-actions"><a class="v70-btn v70-btn--primary" href="/guaranteed/">보증업체 보기</a><a class="v70-btn v70-btn--ghost" href="/consult/">자동 상담 시작</a></div></div><aside class="v70-card v70-side"><div class="v70-metrics"><div class="v70-metric"><strong>5</strong><span>추천 업체</span></div><div class="v70-metric"><strong>8+</strong><span>실사용 도구</span></div><div class="v70-metric"><strong>24H</strong><span>상담 연결</span></div><div class="v70-metric"><strong>MO</strong><span>모바일 우선</span></div></div></aside></section><section class="v70-shell v70-section"><div class="v70-section-head"><div><h2>먼저 확인할 핵심 기능</h2><p>보증업체, 도구, 상담 흐름을 짧고 명확하게 배치했습니다.</p></div></div><div class="v70-grid"><a class="v70-tool" href="/guaranteed/"><em>PARTNERS</em><h3>보증업체 큐레이션</h3><p>업체명, 혜택, 가입코드, 공식주소 연결을 카드 단위로 확인합니다.</p></a><a class="v70-tool" href="/tools/"><em>TOOLS</em><h3>계산·분석 도구</h3><p>보너스, 롤링, 배당, EV 계산 흐름을 도구형 UI로 정리합니다.</p></a><a class="v70-tool" href="/consult/"><em>CONSULT</em><h3>자동 상담 연결</h3><p>조건이 애매할 때 텔레그램 상담으로 최종 확인합니다.</p></a></div></section>`;
const vendors = [['SK 홀딩스','SK','첫충 40%','슬롯 20%','수수료 지원','IRON888'],['여왕벌','QB','첫충 혜택','미니게임 이벤트','테더 상담','SEOA'],['ANY BET','AB','원화·테더','페이백 확인','빠른 상담','SEOA'],['UDT BET','UDT','스포츠 이벤트','파워볼 조건','미니게임 상담','SEOA'],['땅콩 BET','PN','신규 혜택','간편 상담','조건 확인','SEOA']];
const guaranteedBody = `<section class="v70-shell v70-section" style="margin-top:0"><div class="v70-section-head"><div><h1>보증업체</h1><p>혜택 3줄, 가입코드, 공식주소 연결만 남긴 모바일 우선 카드입니다.</p></div><a class="v70-btn v70-btn--primary" href="/consult/">업체 상담</a></div><div class="v70-grid v70-grid--2">${vendors.map(v=>`<article class="v70-vendor"><div class="v70-vendor__top"><div class="v70-logo">${v[1]}</div><h3>${v[0]}</h3></div><ul><li>✔ ${v[2]}</li><li>✔ ${v[3]}</li><li>✔ ${v[4]}</li></ul><div class="v70-vendor-actions"><button class="v70-chip" type="button" data-v70-copy="${v[5]}">가입코드 복사</button><a class="v70-chip v70-chip--hot" href="/consult/">공식주소</a></div></article>`).join('')}</div></section><section class="v70-shell v70-section"><div class="v70-card v70-hero-card"><span class="v70-kicker">CONSULT CENTER</span><h2 style="margin:0;font-size:26px;letter-spacing:-.04em">조건이 헷갈리면 상담센터에서 최종 확인하세요.</h2><p class="v70-lead">도메인, 가입코드, 이벤트 조건은 변경될 수 있으므로 이용 전 상담 연결을 권장합니다.</p><div class="v70-actions"><a class="v70-btn v70-btn--primary" href="/consult/">자동 상담 시작</a><a class="v70-btn v70-btn--ghost" href="/tools/">조건 계산하기</a></div></div></section>`;
const tools = [['/tools/official-check/','ADDR','공식주소 확인','도메인과 안내 채널 일치 여부를 확인합니다.'],['/tools/code-check/','CODE','가입코드 확인','업체명과 가입코드를 상담 전 대조합니다.'],['/tools/bonus-calculator/','BONUS','보너스 실수령','첫충, 매충, 롤링, 최대 출금 조건을 계산합니다.'],['/tools/rolling-calculator/','ROLL','롤링 조건','필요 롤링 금액과 진행률을 정리합니다.'],['/tool-margin/','MARGIN','배당 마진','배당에 포함된 마진과 공정 확률을 확인합니다.'],['/tool-ev/','EV','기대값 계산','예상 확률과 배당 기준 기대값을 계산합니다.']];
const toolsBody = `<section class="v70-shell v70-section" style="margin-top:0"><div class="v70-section-head"><div><h1>도구</h1><p>금융 분석툴처럼 입력 목적과 결과 확인 흐름을 분명하게 정리했습니다.</p></div></div><div class="v70-grid">${tools.map(t=>`<a class="v70-tool" href="${t[0]}"><em>${t[1]}</em><h3>${t[2]}</h3><p>${t[3]}</p></a>`).join('')}</div></section>`;
const consultBody = `<section class="v70-shell v70-hero"><div class="v70-card v70-hero-card"><span class="v70-kicker">AUTO CONSULT</span><h1 class="v70-title">상담은 짧게, 확인은 정확하게.</h1><p class="v70-lead">업체명, 가입코드, 도메인만 정리하면 상담센터에서 조건 확인과 연결을 빠르게 진행할 수 있습니다.</p><div class="v70-actions"><a class="v70-btn v70-btn--primary" href="https://t.me/TRS999_bot" target="_blank" rel="nofollow noopener noreferrer">텔레그램 상담 시작</a><a class="v70-btn v70-btn--ghost" href="/guaranteed/">업체 먼저 보기</a></div></div><aside class="v70-card v70-side"><div class="v70-step"><span class="v70-step-num">1</span><div><h3>업체 선택</h3><p>보증업체 카드에서 원하는 업체를 고릅니다.</p></div></div><div class="v70-step"><span class="v70-step-num">2</span><div><h3>코드 확인</h3><p>가입코드와 이벤트 조건을 상담 전 정리합니다.</p></div></div><div class="v70-step"><span class="v70-step-num">3</span><div><h3>상담 연결</h3><p>텔레그램으로 최종 주소와 조건을 확인합니다.</p></div></div></aside></section>`;
const blogCards = [
  ['/blog/game-guides/first-charge-meaning.html','카지노','첫충 뜻과 확인 기준','첫 충전 혜택을 볼 때 실제 혜택률과 롤링 조건을 같이 확인하는 방법입니다.'],
  ['/blog/game-guides/recharge-meaning.html','카지노','매충 뜻과 계산법','매 충전 이벤트가 실제로 유리한지 조건과 제한을 기준으로 계산합니다.'],
  ['/tool-ev/','스포츠','EV 계산법','예상 확률과 배당을 기준으로 기대값을 읽는 기본 구조입니다.'],
  ['/blog/game-guides/slot-rtp-volatility.html','슬롯','슬롯 RTP 설명','RTP와 변동성을 구분해 장기 기대값과 체감 리스크를 이해합니다.'],
  ['/blog/game-guides/sports-odds-reading.html','스포츠','스포츠 배당 보는법','배당, 확률, 마진을 나눠서 보는 기본 루틴입니다.'],
  ['/tools/rolling-calculator/','도구','롤링 조건 계산','보너스 조건에서 실제 필요한 롤링 금액을 계산기로 연결합니다.'],
  ['/blog/game-guides/scam-site-checklist.html','보증','먹튀 구분법','주소, 도메인, 이벤트 조건, 상담 채널을 순서대로 점검합니다.'],
  ['/guaranteed/','보증','보증업체 선택 기준','혜택보다 먼저 공식주소, 코드, 상담 확인 흐름을 기준으로 봅니다.']
];
const blogBody = `<section class="v70-shell v70-section" style="margin-top:0"><div class="v70-section-head"><div><h1>블로그</h1><p>검색 유입용 글을 카지노, 스포츠, 슬롯, 미니게임, 보증업체 기준으로 정리했습니다.</p></div><a class="v70-btn v70-btn--primary" href="/tools/">계산기 보기</a></div><div class="v70-grid v70-grid--2">${blogCards.map(c=>`<a class="v70-blog-card" href="${c[0]}"><em>${c[1]}</em><h3>${c[2]}</h3><p>${c[3]}</p><div class="v70-tags"><span>도구 연결</span><span>상담 연결</span></div></a>`).join('')}</div></section><section class="v70-shell v70-section"><div class="v70-card v70-hero-card"><span class="v70-kicker">SEO HUB</span><h2 style="margin:0;font-size:26px;letter-spacing:-.04em">글을 읽고 바로 계산하거나 상담으로 이어지게 구성했습니다.</h2><p class="v70-lead">각 콘텐츠는 도구, 보증업체, 상담 페이지와 연결되어 체류시간과 전환 흐름을 동시에 강화합니다.</p><div class="v70-actions"><a class="v70-btn v70-btn--primary" href="/guaranteed/">추천 업체 보기</a><a class="v70-btn v70-btn--ghost" href="/consult/">상담 연결</a></div></div></section>`;
fs.writeFileSync(path.join(root,'index.html'), page('88ST.Cloud | 보증업체·도구·자동상담 플랫폼','보증업체 안내, 계산 도구, 자동 상담 시스템을 제공하는 88ST.Cloud 정보 플랫폼입니다.','home',homeBody,'/'));
fs.mkdirSync(path.join(root,'guaranteed'),{recursive:true});fs.writeFileSync(path.join(root,'guaranteed/index.html'), page('보증업체 | 88ST.Cloud','보증업체 혜택, 가입코드, 공식주소 상담 연결을 카드형으로 정리한 큐레이션 페이지입니다.','guaranteed',guaranteedBody,'/guaranteed/'));
fs.mkdirSync(path.join(root,'tools'),{recursive:true});fs.writeFileSync(path.join(root,'tools/index.html'), page('도구 | 88ST.Cloud','보너스, 롤링, 배당, EV 등 실사용 계산 도구를 모아둔 분석 도구 페이지입니다.','tools',toolsBody,'/tools/'));
fs.mkdirSync(path.join(root,'consult'),{recursive:true});fs.writeFileSync(path.join(root,'consult/index.html'), page('상담 | 88ST.Cloud','보증업체 조건과 공식주소 확인을 위한 자동 상담 연결 페이지입니다.','consult',consultBody,'/consult/'));
fs.mkdirSync(path.join(root,'blog'),{recursive:true});fs.writeFileSync(path.join(root,'blog/index.html'), page('블로그 | 88ST.Cloud','카지노, 스포츠, 슬롯, 미니게임, 보증업체 선택 기준을 도구와 상담 연결 중심으로 정리한 SEO 허브입니다.','blog',blogBody,'/blog/'));
const htmlFiles = fs.readdirSync(root,{recursive:true}).filter(f=>String(f).endsWith('.html'));
let cleaned = 0;
for (const file of htmlFiles) {
  const full = path.join(root,file);
  let html = fs.readFileSync(full,'utf8');
  const before = html;
  html = cleanLegacy(html);
  if (!html.includes('data-v70-stability="true"') && html.includes('</head>')) html = html.replace('</head>',`${cssTag}</head>`);
  if (!html.includes('v70.stability-platform.js') && html.includes('</body>')) html = html.replace('</body>',`${jsTag}</body>`);
  if (html !== before) cleaned++;
  fs.writeFileSync(full,html);
}
const sitemap = fs.existsSync(path.join(root,'sitemap.txt')) ? fs.readFileSync(path.join(root,'sitemap.txt'),'utf8').split(/\r?\n/).filter(Boolean) : [];
const categories = {core:[],blog:[],tools:[],guaranteed:[],consult:[],other:[]};
for (const url of sitemap) {
  const u = url.replace(/^https?:\/\/[^/]+/,'');
  if (['/','/blog/','/tools/','/guaranteed/','/consult/'].includes(u)) categories.core.push(u);
  else if (u.startsWith('/blog/')) categories.blog.push(u);
  else if (u.startsWith('/tools/') || u.startsWith('/tool-')) categories.tools.push(u);
  else if (u.startsWith('/guaranteed/') || u.startsWith('/provider-')) categories.guaranteed.push(u);
  else if (u.startsWith('/consult')) categories.consult.push(u);
  else categories.other.push(u);
}

const pkgPath = path.join(root,'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath,'utf8'));
  if (!pkg.scripts) pkg.scripts = {};
  if (!pkg.scripts.build.includes('generate-v70-stability-expansion.mjs')) {
    pkg.scripts.build = pkg.scripts.build.replace('node scripts/gen-build-ver.mjs','node scripts/generate-v70-stability-expansion.mjs && node scripts/gen-build-ver.mjs');
  }
  pkg.scripts.verify = 'node scripts/verify-v70-stability-expansion.mjs';
  pkg.scripts['quality:v70'] = 'node scripts/generate-v70-stability-expansion.mjs';
  pkg.scripts['verify:v70'] = 'node scripts/verify-v70-stability-expansion.mjs';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg,null,2));
}

fs.writeFileSync(path.join(root,'V70_1_STABILITY_REPORT.md'), `# V70-1 Stability / Expansion Report\n\n## Completed\n- Core page output regenerated: /, /blog/, /guaranteed/, /tools/, /consult/.\n- Legacy duplicated mobile bars and FAB elements removed from HTML output.\n- V70 CSS/JS appended after previous generators to prevent rollback.\n- iPhone Safari safe-area bottom navigation rules added.\n- Build pipeline verify script changed to V70.\n\n## Sitemap classification\n- Core: ${categories.core.length}\n- Blog detail/list: ${categories.blog.length}\n- Tools/detail tools: ${categories.tools.length}\n- Guaranteed/provider: ${categories.guaranteed.length}\n- Consult: ${categories.consult.length}\n- Other: ${categories.other.length}\n\n## Honest scope\nV70-1 is stabilization and core expansion. It does not claim every article body was manually redesigned. It applies V70 global safety CSS/JS to all HTML and fully regenerates the five user-facing hubs.\n\n## Cleaned HTML files\n${cleaned}\n`);
console.log(`V70-1 generated. html=${htmlFiles.length} cleaned=${cleaned} sitemap=${sitemap.length}`);
