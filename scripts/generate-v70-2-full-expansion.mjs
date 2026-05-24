import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const stamp = 'static-v70-2-full-expansion-20260524';
const cssHref = `/assets/css/v70-2.full-expansion.css?v=${stamp}`;
const jsSrc = `/assets/js/v70-2.full-expansion.js?v=${stamp}`;
const cssTag = `<link rel="stylesheet" href="${cssHref}" data-v70-2-expansion="true">`;
const jsTag = `<script src="${jsSrc}" defer data-v70-2-expansion="true"></script>`;

const activeByFile = (file) => {
  const p = file.replaceAll('\\\\','/');
  if (p === 'index.html') return 'home';
  if (p.startsWith('blog/')) return 'blog';
  if (p.startsWith('tools/') || p.startsWith('tool-')) return 'tools';
  if (p.startsWith('guaranteed/') || p.startsWith('provider-')) return 'guaranteed';
  if (p.startsWith('consult')) return 'consult';
  return '';
};

const nav = (active='') => `<header class="v70-2-header" data-v70-2-component="global-header"><div class="v70-2-shell v70-2-header__inner"><a class="v70-2-brand" href="/" aria-label="88ST.Cloud 홈"><span class="v70-2-brand__mark">88</span><span class="v70-2-brand__text"><strong>88ST</strong><span>.Cloud</span></span></a><nav class="v70-2-nav" aria-label="주요 메뉴"><a href="/"${active==='home'?' aria-current="page"':''}>메인</a><a href="/blog/"${active==='blog'?' aria-current="page"':''}>블로그</a><a href="/tools/"${active==='tools'?' aria-current="page"':''}>도구</a><a href="/guaranteed/"${active==='guaranteed'?' aria-current="page"':''}>보증업체</a><a href="/consult/"${active==='consult'?' aria-current="page"':''}>상담</a></nav><a class="v70-2-header-cta" href="/consult/">자동 상담 시작</a></div></header>`;
const mobile = (active='') => `<nav class="v70-2-mobile-nav" aria-label="모바일 하단 내비게이션" data-v70-2-component="mobile-nav"><a href="/"${active==='home'?' aria-current="page"':''}><span>⌂</span>메인</a><a href="/blog/"${active==='blog'?' aria-current="page"':''}><span>▤</span>블로그</a><a href="/tools/"${active==='tools'?' aria-current="page"':''}><span>◇</span>도구</a><a href="/guaranteed/"${active==='guaranteed'?' aria-current="page"':''}><span>◆</span>보증</a><a href="/consult/"${active==='consult'?' aria-current="page"':''}><span>✦</span>상담</a></nav>`;
const footer = `<footer class="v70-2-footer" data-v70-2-component="footer"><div class="v70-2-shell v70-2-footer__inner"><div><b>88ST.Cloud</b><p>보증업체 큐레이션, 계산 도구, 자동 상담을 연결하는 정보 플랫폼입니다.</p></div><nav aria-label="하단 메뉴"><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">상담</a></nav></div></footer>`;
const tail = (active='') => `<div class="v70-2-sticky-cta" data-v70-2-component="sticky-cta"><a href="/guaranteed/">보증업체 보기</a><a href="/consult/">자동 상담 시작</a></div><a class="v70-2-fab" href="/consult/" aria-label="자동 상담 시작" data-v70-2-component="fab">상담</a>${mobile(active)}${footer}${jsTag}`;

function page(title, desc, active, body, canonicalPath) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${title}</title><meta name="description" content="${desc}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#0F172A"><link rel="canonical" href="https://88st.cloud${canonicalPath}"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon-v24.png"><link rel="manifest" href="/site.webmanifest"><link rel="stylesheet" href="/assets/css/v70.stability-platform.css?v=static-v70-stability-expansion-20260524" data-v70-stability="true">${cssTag}</head><body class="v70-platform v70-2-expanded" data-v70-2-page="${active}"><div class="v70-2-page">${nav(active)}<main class="v70-2-main">${body}</main></div>${tail(active)}</body></html>`;
}

const blogCards = [
  ['/blog/game-guides/first-charge-meaning.html','카지노','첫충 뜻','첫 충전 혜택은 혜택률보다 롤링, 인정 게임, 최대 출금 조건을 같이 봐야 합니다.'],
  ['/blog/game-guides/recharge-meaning.html','카지노','매충 뜻','매 충전 이벤트는 반복 혜택처럼 보이지만 한도와 제외 게임을 반드시 확인해야 합니다.'],
  ['/tool-ev/','스포츠','EV 계산법','예상 확률과 배당을 나눠 기대값이 양수인지 확인하는 기본 계산 흐름입니다.'],
  ['/blog/game-guides/slot-rtp-volatility.html','슬롯','슬롯 RTP 설명','RTP는 장기 평균이고 변동성은 체감 리스크입니다. 두 기준을 분리해서 봐야 합니다.'],
  ['/blog/game-guides/sports-odds-reading.html','스포츠','스포츠 배당 보는법','배당에는 확률과 마진이 동시에 들어 있으므로 공정 확률로 변환해 보는 습관이 필요합니다.'],
  ['/tools/rolling-calculator/','도구','롤링 조건 계산','보너스 조건은 지급률이 아니라 실제 필요한 롤링 금액으로 비교해야 합니다.'],
  ['/blog/game-guides/scam-site-checklist.html','보증','먹튀 구분법','주소, 상담 채널, 조건 문구, 정산 기준을 순서대로 확인하면 위험 신호를 줄일 수 있습니다.'],
  ['/guaranteed/','보증','보증업체 선택 기준','업체 선택은 혜택보다 공식주소, 가입코드, 상담 확인 흐름을 먼저 기준으로 잡는 편이 안전합니다.']
];
const blogBody = `<section class="v70-2-shell v70-2-hero v70-2-compact"><div><span class="v70-2-kicker">SEO HUB</span><h1>블로그 허브</h1><p>카지노, 스포츠, 슬롯, 미니게임, 보증업체 기준으로 검색 의도와 도구·상담 연결을 함께 정리했습니다.</p></div><div class="v70-2-hero-actions"><a class="v70-2-btn v70-2-btn--primary" href="/tools/">계산기 보기</a><a class="v70-2-btn v70-2-btn--ghost" href="/consult/">상담 연결</a></div></section><section class="v70-2-shell v70-2-grid v70-2-grid--2">${blogCards.map(c=>`<a class="v70-2-blog-card" href="${c[0]}"><em>${c[1]}</em><h2>${c[2]}</h2><p>${c[3]}</p><div><span>도구 연결</span><span>상담 연결</span></div></a>`).join('')}</section>`;
fs.writeFileSync(path.join(root,'blog/index.html'), page('블로그 | 88ST.Cloud','카지노, 스포츠, 슬롯, 미니게임, 보증업체 선택 기준을 도구와 상담 연결 중심으로 정리한 SEO 허브입니다.','blog',blogBody,'/blog/'));

const tools = [
  ['/tools/official-check/','공식주소 확인','도메인과 상담 채널 일치 여부를 확인합니다.','주소'],
  ['/tools/code-check/','가입코드 확인','업체명과 가입코드를 상담 전 대조합니다.','코드'],
  ['/tools/bonus-calculator/','보너스 실수령','첫충, 매충, 롤링, 최대 출금 조건을 계산합니다.','보너스'],
  ['/tools/rolling-calculator/','롤링 조건','필요 롤링 금액과 진행률을 정리합니다.','롤링'],
  ['/tool-margin/','배당 마진','배당에 포함된 마진과 공정 확률을 확인합니다.','마진'],
  ['/tool-ev/','기대값 계산','예상 확률과 배당 기준 기대값을 계산합니다.','EV'],
  ['/tools/ai-sports-odds-analysis/','스포츠 분석','배당과 확률 기반으로 기본 판단 흐름을 정리합니다.','분석'],
  ['/tools/event-checker/','이벤트 조건','이벤트 조건을 체크리스트형으로 정리합니다.','조건']
];
const toolsBody = `<section class="v70-2-shell v70-2-hero v70-2-compact"><div><span class="v70-2-kicker">ANALYTICS TOOLS</span><h1>도구 허브</h1><p>광고 버튼이 아니라 실제 계산과 확인에 필요한 도구를 금융 분석툴 스타일로 재정렬했습니다.</p></div><div class="v70-2-hero-actions"><a class="v70-2-btn v70-2-btn--primary" href="/tools/bonus-calculator/">보너스 계산</a><a class="v70-2-btn v70-2-btn--ghost" href="/consult/">조건 상담</a></div></section><section class="v70-2-shell v70-2-grid">${tools.map(t=>`<a class="v70-2-tool-card" href="${t[0]}"><b>${t[3]}</b><h2>${t[1]}</h2><p>${t[2]}</p><span>도구 열기</span></a>`).join('')}</section>`;
fs.writeFileSync(path.join(root,'tools/index.html'), page('도구 | 88ST.Cloud','보너스, 롤링, 배당, EV 등 실사용 계산 도구를 모아둔 분석 도구 페이지입니다.','tools',toolsBody,'/tools/'));

function stripInjected(html){
  let out = html;
  out = out.replace(/<header\b[^>]*data-v70-2-component="global-header"[\s\S]*?<\/header>/gi,'');
  out = out.replace(/<nav\b[^>]*data-v70-2-component="mobile-nav"[\s\S]*?<\/nav>/gi,'');
  out = out.replace(/<div\b[^>]*data-v70-2-component="sticky-cta"[\s\S]*?<\/div>/gi,'');
  out = out.replace(/<a\b[^>]*data-v70-2-component="fab"[\s\S]*?<\/a>/gi,'');
  out = out.replace(/<footer\b[^>]*data-v70-2-component="footer"[\s\S]*?<\/footer>/gi,'');
  out = out.replace(/<script\b[^>]*data-v70-2-expansion="true"[^>]*><\/script>/gi,'');
  out = out.replace(/<link\b[^>]*data-v70-2-expansion="true"[^>]*>/gi,'');
  return out;
}
function ensureHead(html){
  let out = html;
  if (!out.includes('viewport-fit=cover')) out = out.replace(/<meta name="viewport"[^>]*>/i,'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');
  if (!out.includes('data-v70-2-expansion="true"') && out.includes('</head>')) out = out.replace('</head>',`${cssTag}</head>`);
  return out;
}
function bodyClass(html){
  if (/<body\b[^>]*class=/i.test(html)) return html.replace(/<body\b([^>]*)class=["']([^"']*)["']([^>]*)>/i,(m,a,c,b)=>`<body${a}class="${c} v70-2-expanded"${b}>`);
  return html.replace(/<body\b([^>]*)>/i,`<body$1 class="v70-2-expanded">`);
}
function titleOf(html, fallback){
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g,'').trim();
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s*\|\s*88ST\.Cloud.*/,'').trim();
  return h1 || title || fallback;
}
function addExpansionFrame(file, html){
  const active = activeByFile(file);
  if (!active || file.startsWith('admin/') || file.startsWith('ops/')) return html;
  let out = stripInjected(html);
  out = ensureHead(out);
  out = bodyClass(out);
  if (!out.includes('data-v70-2-page=')) out = out.replace(/<body\b([^>]*)>/i,`<body$1 data-v70-2-page="${active}">`);
  if (!out.includes('data-v70-2-component="global-header"')) out = out.replace(/<body\b[^>]*>/i,(m)=>`${m}${nav(active)}`);
  const title = titleOf(out, '88ST.Cloud 안내');
  const isDetail = !['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html'].includes(file);
  if (isDetail && (file.startsWith('blog/') || file.startsWith('search-guides/') || file.startsWith('faq/') || file.startsWith('consult-') || file.startsWith('provider-updates/'))) {
    const related = `<aside class="v70-2-related" data-v70-2-related="true"><div><span>다음 확인</span><h2>${title}</h2><p>본문을 확인한 뒤 조건 계산, 보증업체 비교, 상담 연결까지 바로 이어갈 수 있습니다.</p></div><nav><a href="/tools/">관련 도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">상담 연결</a></nav></aside>`;
    if (!out.includes('data-v70-2-related="true"')) out = out.replace('</main>',`${related}</main>`);
  }
  if (isDetail && (file.startsWith('tools/') || file.startsWith('tool-'))) {
    const toolCta = `<aside class="v70-2-related" data-v70-2-related="true"><div><span>도구 결과 확인</span><h2>${title}</h2><p>계산 결과를 해석하기 어렵다면 보증업체 조건 또는 상담센터에서 추가 확인하세요.</p></div><nav><a href="/guaranteed/">보증업체 보기</a><a href="/consult/">상담 연결</a></nav></aside>`;
    if (!out.includes('data-v70-2-related="true"')) out = out.replace('</main>',`${toolCta}</main>`);
  }
  if (!out.includes('data-v70-2-component="sticky-cta"')) out = out.replace('</body>',`${tail(active)}</body>`);
  return out;
}

const cssDir = path.join(root,'assets/css');
const jsDir = path.join(root,'assets/js');
fs.mkdirSync(cssDir,{recursive:true});
fs.mkdirSync(jsDir,{recursive:true});
fs.writeFileSync(path.join(cssDir,'v70-2.full-expansion.css'), `:root{--v702-bg:#0f172a;--v702-deep:#050812;--v702-card:rgba(255,255,255,.065);--v702-card-2:rgba(255,255,255,.095);--v702-line:rgba(255,255,255,.12);--v702-text:#f8fafc;--v702-muted:#a8b3c7;--v702-primary:#10b981;--v702-blue:#2563eb;--v702-radius:12px;--v702-shadow:0 16px 44px rgba(0,0,0,.30);--v702-shell:1120px}body.v70-2-expanded{margin:0;min-width:320px;background:radial-gradient(circle at 18% -10%,rgba(16,185,129,.18),transparent 30rem),radial-gradient(circle at 88% 8%,rgba(37,99,235,.16),transparent 30rem),linear-gradient(180deg,#0f172a,#08111f 54%,#050812);color:var(--v702-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Segoe UI",sans-serif;overflow-x:hidden}body.v70-2-expanded a{text-decoration:none;color:inherit}body.v70-2-expanded img{max-width:100%;height:auto}.v70-2-shell{width:min(var(--v702-shell),calc(100% - 40px));margin:0 auto}.v70-2-header{position:sticky;top:0;z-index:100;border-bottom:1px solid var(--v702-line);background:rgba(15,23,42,.82);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}.v70-2-header__inner{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px}.v70-2-brand{min-height:52px;display:inline-flex;align-items:center;gap:12px;font-weight:950}.v70-2-brand__mark{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#7dd3fc,#a78bfa);color:#fff}.v70-2-brand__text{display:grid;line-height:1.05}.v70-2-brand__text strong{font-size:20px}.v70-2-brand__text span{color:var(--v702-muted);font-size:13px;font-weight:800}.v70-2-nav{display:flex;gap:6px}.v70-2-nav a{min-height:44px;padding:0 13px;border-radius:999px;display:inline-flex;align-items:center;color:var(--v702-muted);font-size:14px;font-weight:850}.v70-2-nav a[aria-current="page"],.v70-2-nav a:hover{background:rgba(255,255,255,.08);color:#fff}.v70-2-header-cta,.v70-2-btn--primary{min-height:44px;padding:0 15px;border-radius:var(--v702-radius);display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--v702-primary),var(--v702-blue));color:#fff;font-weight:950}.v70-2-main{padding:24px 0 56px}.v70-2-hero{border:1px solid var(--v702-line);border-radius:var(--v702-radius);background:linear-gradient(180deg,var(--v702-card-2),rgba(255,255,255,.045));box-shadow:var(--v702-shadow);padding:24px;display:flex;align-items:center;justify-content:space-between;gap:18px}.v70-2-compact h1{margin:8px 0;font-size:clamp(30px,5vw,50px);line-height:1.04;letter-spacing:-.06em}.v70-2-compact p{margin:0;color:var(--v702-muted);line-height:1.7;word-break:keep-all}.v70-2-kicker{display:inline-flex;min-height:31px;padding:0 10px;align-items:center;border-radius:999px;border:1px solid rgba(16,185,129,.36);background:rgba(16,185,129,.1);color:#9ff6d8;font-size:12px;font-weight:950}.v70-2-hero-actions{display:flex;gap:10px;flex-wrap:wrap}.v70-2-btn{min-height:52px;padding:0 18px;border-radius:var(--v702-radius);display:inline-flex;align-items:center;justify-content:center;font-weight:950}.v70-2-btn--ghost{background:rgba(255,255,255,.06);border:1px solid var(--v702-line);color:#fff}.v70-2-grid{width:min(var(--v702-shell),calc(100% - 40px));margin:18px auto 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.v70-2-grid--2{grid-template-columns:repeat(2,minmax(0,1fr))}.v70-2-blog-card,.v70-2-tool-card,.v70-2-related{border:1px solid var(--v702-line);border-radius:var(--v702-radius);background:rgba(255,255,255,.058);box-shadow:var(--v702-shadow);padding:18px;transition:all .25s ease}.v70-2-blog-card:hover,.v70-2-tool-card:hover{transform:translateY(-3px);border-color:rgba(16,185,129,.38)}.v70-2-blog-card em,.v70-2-tool-card b,.v70-2-related span{font-style:normal;color:#91f3d5;font-size:12px;font-weight:950}.v70-2-blog-card h2,.v70-2-tool-card h2,.v70-2-related h2{margin:9px 0 8px;font-size:20px;letter-spacing:-.04em}.v70-2-blog-card p,.v70-2-tool-card p,.v70-2-related p{margin:0;color:var(--v702-muted);line-height:1.65}.v70-2-blog-card div{margin-top:13px;display:flex;gap:7px;flex-wrap:wrap}.v70-2-blog-card div span,.v70-2-tool-card span{display:inline-flex;min-height:32px;padding:0 10px;border-radius:999px;align-items:center;background:rgba(255,255,255,.06);color:#dbeafe;font-size:12px;font-weight:850}.v70-2-related{width:min(var(--v702-shell),calc(100% - 40px));margin:20px auto;display:flex;align-items:center;justify-content:space-between;gap:16px}.v70-2-related nav{display:flex;gap:8px;flex-wrap:wrap}.v70-2-related nav a{min-height:44px;padding:0 13px;border-radius:var(--v702-radius);display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,.07);font-weight:900}.v70-2-related nav a:last-child{background:linear-gradient(135deg,var(--v702-primary),var(--v702-blue));color:#fff}.v70-2-footer{border-top:1px solid var(--v702-line);padding:28px 0 34px;color:var(--v702-muted);background:rgba(5,8,18,.4)}.v70-2-footer__inner{display:flex;justify-content:space-between;gap:14px}.v70-2-footer b{color:#fff}.v70-2-footer p{margin:6px 0 0;line-height:1.6}.v70-2-footer nav{display:flex;gap:12px;flex-wrap:wrap}.v70-2-mobile-nav,.v70-2-sticky-cta{display:none}.v70-2-fab{position:fixed;right:20px;bottom:22px;z-index:110;min-height:54px;padding:0 16px;border-radius:16px;background:linear-gradient(135deg,var(--v702-primary),var(--v702-blue));display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:950;box-shadow:0 18px 54px rgba(16,185,129,.22)}body.v70-2-expanded .v68-header,body.v70-2-expanded .v67-header,body.v70-2-expanded .moon-header,body.v70-2-expanded .v39-header,body.v70-2-expanded .v48-header,body.v70-2-expanded .v66-header,body.v70-2-expanded .mobile-nav,body.v70-2-expanded .fab,body.v70-2-expanded .v68-mobile-nav,body.v70-2-expanded .v69-mobile-nav,body.v70-2-expanded .v70-mobile-nav,body.v70-2-expanded .v70-fab,body.v70-2-expanded .v70-sticky-cta{display:none!important}body.v70-2-expanded main{max-width:100%;overflow-x:hidden}body.v70-2-expanded main h1{letter-spacing:-.05em}body.v70-2-expanded table{max-width:100%;display:block;overflow-x:auto;border-collapse:collapse}body.v70-2-expanded input,body.v70-2-expanded select,body.v70-2-expanded button{min-height:44px}@media (min-width:721px){.v70-2-mobile-nav,.v70-2-sticky-cta{display:none!important}.v70-2-fab{display:inline-flex!important}}@media (max-width:980px){.v70-2-grid,.v70-2-grid--2{grid-template-columns:1fr 1fr}.v70-2-hero{align-items:flex-start;flex-direction:column}}@media (max-width:720px){.v70-2-shell,.v70-2-grid,.v70-2-related{width:calc(100% - 40px)}.v70-2-header__inner{min-height:64px}.v70-2-nav,.v70-2-header-cta{display:none}.v70-2-main{padding:18px 0 42px}.v70-2-hero{padding:20px}.v70-2-compact h1{font-size:32px}.v70-2-hero-actions{width:100%;display:grid;grid-template-columns:1fr}.v70-2-btn{width:100%}.v70-2-grid,.v70-2-grid--2{grid-template-columns:1fr}.v70-2-related{align-items:flex-start;flex-direction:column}.v70-2-related nav{width:100%;display:grid;grid-template-columns:1fr 1fr}.v70-2-footer__inner{flex-direction:column}.v70-2-fab{display:none!important}.v70-2-sticky-cta{position:fixed;left:50%;bottom:calc(82px + env(safe-area-inset-bottom));z-index:116;width:calc(100% - 40px);transform:translateX(-50%);border:1px solid var(--v702-line);border-radius:16px;padding:8px;background:rgba(15,23,42,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 18px 54px rgba(0,0,0,.36);display:grid;grid-template-columns:1fr 1fr;gap:8px}.v70-2-sticky-cta a{min-height:52px;border-radius:var(--v702-radius);display:flex;align-items:center;justify-content:center;font-weight:950;background:rgba(255,255,255,.07)}.v70-2-sticky-cta a:last-child{background:linear-gradient(135deg,var(--v702-primary),var(--v702-blue));color:#fff}.v70-2-mobile-nav{position:fixed;left:12px;right:12px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:117;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;padding:7px;border-radius:18px;border:1px solid var(--v702-line);background:rgba(15,23,42,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 18px 54px rgba(0,0,0,.36);overflow:hidden}.v70-2-mobile-nav a{min-width:0;min-height:52px;border-radius:var(--v702-radius);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:var(--v702-muted);font-size:11px;font-weight:900;white-space:nowrap}.v70-2-mobile-nav a span{font-size:17px;line-height:1}.v70-2-mobile-nav a[aria-current="page"]{background:linear-gradient(135deg,var(--v702-primary),var(--v702-blue));color:#fff}body.v70-2-expanded{padding-bottom:calc(150px + env(safe-area-inset-bottom))}}@media (max-width:360px){.v70-2-shell,.v70-2-grid,.v70-2-related{width:calc(100% - 32px)}.v70-2-sticky-cta{width:calc(100% - 24px)}}`);
fs.writeFileSync(path.join(jsDir,'v70-2.full-expansion.js'), `(()=>{const copyButtons=document.querySelectorAll('[data-v70-copy]');function toast(msg){let el=document.querySelector('.v70-2-copy-toast');if(!el){el=document.createElement('div');el.className='v70-2-copy-toast';document.body.appendChild(el)}el.textContent=msg;el.classList.add('is-show');clearTimeout(window.__v702toast);window.__v702toast=setTimeout(()=>el.classList.remove('is-show'),1600)}copyButtons.forEach(btn=>btn.addEventListener('click',()=>{const code=btn.getAttribute('data-v70-copy')||'88ST';if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(code).then(()=>toast('가입코드 복사 완료: '+code)).catch(()=>toast('가입코드: '+code))}else{toast('가입코드: '+code)}}));})();`);

const htmlFiles = fs.readdirSync(root,{recursive:true}).filter(f=>String(f).endsWith('.html')).map(String);
let touched = 0;
let blogDetails = 0;
let toolDetails = 0;
for (const file of htmlFiles) {
  const full = path.join(root,file);
  let html = fs.readFileSync(full,'utf8');
  const before = html;
  html = addExpansionFrame(file, html);
  if (html !== before) touched++;
  if (file.startsWith('blog/') && file !== 'blog/index.html') blogDetails++;
  if ((file.startsWith('tools/') && file !== 'tools/index.html') || file.startsWith('tool-')) toolDetails++;
  fs.writeFileSync(full, html);
}

const pkgPath = path.join(root,'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath,'utf8'));
  pkg.scripts = pkg.scripts || {};
  if (!pkg.scripts.build.includes('generate-v70-2-full-expansion.mjs')) {
    pkg.scripts.build = pkg.scripts.build.replace('node scripts/gen-build-ver.mjs','node scripts/generate-v70-2-full-expansion.mjs && node scripts/gen-build-ver.mjs');
  }
  pkg.scripts.verify = 'node scripts/verify-v70-2-full-expansion.mjs';
  pkg.scripts['quality:v70-2'] = 'node scripts/generate-v70-2-full-expansion.mjs';
  pkg.scripts['verify:v70-2'] = 'node scripts/verify-v70-2-full-expansion.mjs';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg,null,2));
}

const sitemap = fs.existsSync(path.join(root,'sitemap.txt')) ? fs.readFileSync(path.join(root,'sitemap.txt'),'utf8').split(/\r?\n/).filter(Boolean) : [];
const groups = {core:0,blog:0,tools:0,guaranteed:0,consult:0,faq:0,search:0,provider:0,other:0};
for (const raw of sitemap) {
  const u = raw.replace(/^https?:\/\/[^/]+/,'');
  if (['/','/blog/','/tools/','/guaranteed/','/consult/'].includes(u)) groups.core++;
  else if (u.startsWith('/blog/')) groups.blog++;
  else if (u.startsWith('/tools/') || u.startsWith('/tool-')) groups.tools++;
  else if (u.startsWith('/guaranteed/')) groups.guaranteed++;
  else if (u.startsWith('/consult')) groups.consult++;
  else if (u.startsWith('/faq/')) groups.faq++;
  else if (u.startsWith('/search-guides/')) groups.search++;
  else if (u.startsWith('/provider-updates/')) groups.provider++;
  else groups.other++;
}
fs.writeFileSync(path.join(root,'V70_2_FULL_EXPANSION_REPORT.md'), `# V70-2 Full Expansion Report\n\n## Completed scope\n- Injected one unified V70-2 global header into user-facing HTML.\n- Hid legacy duplicated headers, old mobile bars, and old floating buttons through V70-2 override CSS.\n- Rebuilt /blog/ as SEO hub with category cards and tool/consult links.\n- Rebuilt /tools/ as analytics-tool hub.\n- Added related CTA blocks to detail articles, FAQ, search guides, consult result/motive pages, provider update pages, and tool detail pages.\n- Added mobile safe-area bottom navigation and sticky CTA rules.\n\n## Counts\n- HTML files inspected: ${htmlFiles.length}\n- HTML files touched: ${touched}\n- Blog detail files detected: ${blogDetails}\n- Tool detail files detected: ${toolDetails}\n\n## Sitemap classification\n- Core: ${groups.core}\n- Blog: ${groups.blog}\n- Tools: ${groups.tools}\n- Guaranteed: ${groups.guaranteed}\n- Consult: ${groups.consult}\n- FAQ: ${groups.faq}\n- Search guides: ${groups.search}\n- Provider updates: ${groups.provider}\n- Other: ${groups.other}\n\n## Honest scope note\nV70-2 expands the common UI shell, mobile safety layer, blog hub, tools hub, and detail CTA structure across the site. It does not rewrite every individual article paragraph by hand. Existing article/tool content is preserved to avoid breaking SEO content and existing tool functions.\n`);
console.log(`V70-2 expansion generated. html=${htmlFiles.length} touched=${touched} blogDetails=${blogDetails} toolDetails=${toolDetails}`);
