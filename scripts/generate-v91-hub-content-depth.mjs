import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MARKER = 'V91_HUB_CONTENT_DEPTH_ACTIVE';
const CSS = 'assets/css/v91-hub-content-depth.css';
const DATA = 'assets/data/v91-hub-content-depth.json';
const TARGET_DIRS = ['sports-check', 'search-guides'];
const BANNED = [
  '오늘 확인해야 할 것',
  '상담 전 먼저 확인할 것',
  '함께 확인할 글',
  '다음 단계: 자동화 상담으로 기준 정보를 확인하거나',
  '에 보낼 문의 문구를 먼저 생성해 보세요',
  '페이지 하단의 내부 링크',
  '관련 글과 다음 확인 루트'
];

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function write(rel, value){
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, value);
}
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function walk(dir, out=[]){
  const abs = path.join(ROOT, dir);
  if(!fs.existsSync(abs)) return out;
  for(const ent of fs.readdirSync(abs,{withFileTypes:true})){
    const full = path.join(abs, ent.name);
    if(ent.isDirectory()) walk(path.relative(ROOT, full).replaceAll(path.sep,'/'), out);
    else if(ent.isFile() && ent.name === 'index.html' && path.relative(ROOT, full).replaceAll(path.sep,'/') !== `${dir}/index.html`) out.push(path.relative(ROOT, full).replaceAll(path.sep,'/'));
    else if(ent.isFile() && ent.name.endsWith('.html') && ent.name !== 'index.html') out.push(path.relative(ROOT, full).replaceAll(path.sep,'/'));
  }
  return out;
}
function stripTags(s){ return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
function getMatch(text, re, fallback='') { const m=text.match(re); return m ? m[1].trim() : fallback; }
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function sentenceTitle(title){ return title.replace(/\s*\|\s*RUST.*/,'').replace(/\s+/g,' ').trim(); }
function topicKind(rel){
  if(rel.startsWith('sports-check/')) return 'sports';
  return 'search';
}
function categoryFromPath(rel){
  if(rel.includes('/football/')) return '축구';
  if(rel.includes('/baseball/')) return '야구';
  if(rel.includes('/basketball/')) return '농구';
  if(rel.includes('/volleyball/')) return '배구';
  if(rel.includes('casino') || rel.includes('slot') || rel.includes('roulette') || rel.includes('baccarat')) return '카지노';
  if(rel.includes('code') || rel.includes('address') || rel.includes('telegram')) return '검색가이드';
  if(rel.includes('payout') || rel.includes('rolling') || rel.includes('payback') || rel.includes('deposit')) return '조건확인';
  return rel.startsWith('sports-check/') ? '스포츠 체크' : '검색 가이드';
}
function slugText(rel){ return rel.replace(/index\.html$/,'').replace(/\.html$/,'').split('/').filter(Boolean).pop() || 'guide'; }
function buildParagraphs(title, desc, rel){
  const kind = topicKind(rel);
  const category = categoryFromPath(rel);
  const slug = slugText(rel);
  const base = kind === 'sports'
    ? {
      intent: `${title}는 경기 전 정보가 하나로 맞물리는지 확인하는 스포츠 체크 문서입니다. 단순히 승패나 총점 하나만 보는 것이 아니라 라인 변화, 참여자 심리, 배당 마진, 직전 뉴스, 정산 조건을 같은 화면에서 비교할 수 있어야 합니다.`,
      risk: `스포츠 시장은 경기 시작 전까지 변수가 계속 바뀝니다. 선발 라인업, 부상 공시, 휴식일, 이동거리, 날씨, 감독 인터뷰, 직전 배당 움직임이 모두 결과 해석에 영향을 줍니다. ${title}를 볼 때는 첫 인상보다 변경된 조건이 무엇인지 기록하는 쪽이 더 안전합니다.`,
      action: `실사용자는 이 페이지를 읽은 뒤 바로 결론을 내리기보다, 마진 계산과 기대값 판단을 한 번 더 거치는 것이 좋습니다. 숫자를 검산하면 과도하게 유리해 보이는 문구와 실제 조건의 차이를 줄일 수 있습니다.`
    }
    : {
      intent: `${title}는 검색으로 유입된 사용자가 주소, 코드, 조건, 지급 기준을 빠르게 분리해서 확인할 수 있도록 만든 검색 가이드 문서입니다. 광고 문구보다 실제 확인 순서와 위험 신호를 먼저 정리하는 것이 핵심입니다.`,
      risk: `검색 결과에는 공식 페이지, 리뉴얼 주소, 커뮤니티 게시글, 복제 주소가 섞여 나올 수 있습니다. 그래서 ${title}를 확인할 때는 주소 표기, 가입코드, 안내 문구, 상담 채널, 지급 조건이 같은 기준으로 이어지는지 살펴야 합니다.`,
      action: `실사용자는 검색으로 찾은 정보를 그대로 믿기보다, 조건 문구를 캡처하고 코드 표기를 확인한 뒤 현재 적용 가능한 기준인지 다시 점검하는 흐름이 좋습니다. 이 과정이 짧아질수록 실수와 오해가 줄어듭니다.`
    };
  const sections = [
    {h:'검색 의도와 페이지 역할', p:[base.intent, `${desc || title}라는 표현은 겉으로는 단순해 보여도 사용자의 목적은 꽤 구체적입니다. 누군가는 공식 주소를 찾고, 누군가는 가입코드 적용 여부를 확인하며, 또 다른 사용자는 롤링이나 정산 기준이 맞는지 비교합니다. 따라서 본문은 홍보 문장보다 판단 순서를 먼저 보여주도록 구성했습니다.`]},
    {h:'가장 먼저 분리해야 할 기준', p:[`첫 번째 기준은 현재 보고 있는 정보가 최신인지입니다. ${title} 관련 정보는 시간이 지나면 조건이 바뀌거나 주소가 변경될 수 있습니다. 두 번째 기준은 수치입니다. 보너스율, 배당 마진, 롤링 배수, 최대 환전 제한처럼 숫자로 확인되는 조건은 문구보다 우선합니다.`, `세 번째 기준은 출처의 일관성입니다. 같은 업체명이라도 주소, 코드, 상담 계정이 서로 다르면 같은 정보로 묶어 판단하면 안 됩니다. RUST는 이런 혼선을 줄이기 위해 허브와 상세 문서의 톤을 통일하고, 사용자가 필요한 기준만 빠르게 찾을 수 있게 정리했습니다.`]},
    {h:'실전에서 자주 생기는 오해', p:[`많은 사용자가 높은 혜택 문구를 먼저 보고 판단하지만, 실제 중요한 것은 적용 조건입니다. 첫충, 매충, 페이백, 슬롯 혜택, 스포츠 이벤트는 각각 기준이 다르고, 일부 조건은 특정 게임군이나 특정 시간대에만 적용됩니다. ${title}에서도 문구 자체보다 조건의 적용 범위를 먼저 봐야 합니다.`, `또 다른 오해는 한 번 확인한 주소나 조건을 오래 믿는 것입니다. 운영 환경에서는 리뉴얼, 도메인 변경, 이벤트 종료, 상담 채널 변경이 발생할 수 있습니다. 그래서 본문은 특정 결론을 강요하지 않고, 사용자가 직접 비교할 수 있는 체크 순서를 제공하는 방식으로 설계했습니다.`]},
    {h:'RUST식 검토 순서', p:[`RUST 기준의 검토 순서는 단순합니다. 먼저 페이지 제목과 검색 의도를 확인하고, 그다음 공식성, 조건, 숫자, 리스크를 분리합니다. 이후 필요한 경우 도구에서 마진이나 기대값을 계산하고, 보증업체 카드에서 코드와 주소의 일치 여부를 확인합니다.`, `${category} 영역에서는 특히 같은 키워드라도 사용자가 원하는 답이 다를 수 있습니다. 그래서 ${slug} 문서는 단일 홍보 문장으로 끝내지 않고, 왜 이 기준을 봐야 하는지와 어떤 상황에서 조심해야 하는지를 길게 설명합니다.`]},
    {h:'모바일에서 읽기 쉽게 보는 방법', p:[`모바일 사용자는 긴 문장을 한 번에 읽기 어렵습니다. 따라서 핵심은 한 문단에서 하나의 기준만 보는 것입니다. ${title}를 확인할 때는 제목, 요약 박스, 소제목, 본문 순서로 내려가며 현재 필요한 정보만 빠르게 추려도 충분합니다.`, `스크롤 중간에 있는 강조 박스는 결정을 대신하는 문구가 아니라 판단을 멈추고 기준을 다시 확인하게 만드는 장치입니다. 이 방식은 광고성 랜딩보다 정보 플랫폼에 더 어울리고, 검색 유입 사용자의 체류 흐름에도 맞습니다.`]},
    {h:'조건 비교와 기록의 중요성', p:[`조건을 비교할 때는 기억에 의존하지 않는 것이 좋습니다. 주소, 코드, 이벤트명, 적용 게임, 보너스율, 롤링 배수, 정산 기준을 따로 기록해 두면 나중에 문구가 바뀌어도 어느 지점이 달라졌는지 확인할 수 있습니다.`, `특히 ${title}처럼 검색 의도가 뚜렷한 문서는 처음 읽을 때보다 다시 확인할 때 가치가 커집니다. 같은 문서를 여러 번 읽어도 기준이 흔들리지 않도록, 본문은 반복 안내보다 기준 설명을 중심으로 구성했습니다.`]},
    {h:'위험 신호를 판단하는 방식', p:[`위험 신호는 하나로 확정되지 않습니다. 지나치게 큰 혜택, 불명확한 지급 조건, 자주 바뀌는 주소, 상담 계정 불일치, 계산 결과와 맞지 않는 설명이 함께 나타날 때 주의도가 올라갑니다. ${title}에서도 이런 신호가 겹치는지를 보는 것이 중요합니다.`, `반대로 모든 조건이 깔끔하게 정리되어 있어도 최종 판단은 현재 시점에서 해야 합니다. RUST의 문서는 사용자가 과거 글에 매달리지 않고 지금 확인 가능한 기준을 중심으로 움직이도록 돕는 데 초점을 둡니다.`]},
    {h:'읽은 뒤 활용 방법', p:[base.action, `이 문서는 특정 행동을 강제하는 화면이 아니라 판단 기준을 정리한 콘텐츠입니다. 그래서 하단에 불필요한 반복 버튼이나 추천 링크 묶음을 넣기보다, 본문 안에서 정보의 깊이를 확보하는 쪽으로 보강했습니다. ${title}를 읽은 뒤에는 본인의 상황에 맞춰 필요한 항목만 다시 확인하면 됩니다.`]}
  ];
  return sections;
}
function buildArticle(title, desc, rel){
  const category = categoryFromPath(rel);
  const sections = buildParagraphs(title, desc, rel);
  const faq = [
    {q:`${title}를 볼 때 가장 먼저 확인할 것은 무엇인가요?`, a:`가장 먼저 확인할 것은 현재 정보의 최신성, 주소와 코드의 일치 여부, 그리고 숫자로 표시된 조건입니다. 이 세 가지가 맞지 않으면 다른 설명이 좋아 보여도 판단을 보류하는 편이 안전합니다.`},
    {q:`검색 결과에 나온 ${title} 정보는 그대로 믿어도 되나요?`, a:`검색 결과는 여러 출처가 섞여 있으므로 그대로 믿기보다 공식성, 조건 문구, 적용 범위, 상담 채널 일치 여부를 함께 확인해야 합니다. 특히 오래된 글은 현재 조건과 다를 수 있습니다.`},
    {q:`RUST 문서에서 강조하는 핵심 기준은 무엇인가요?`, a:`RUST는 광고 문구보다 확인 순서, 계산 가능한 수치, 조건의 적용 범위, 위험 신호를 우선합니다. 그래서 본문은 짧은 홍보 문장보다 실제 판단에 필요한 기준을 길게 설명합니다.`},
    {q:`이 글을 읽은 뒤 어떤 식으로 활용하면 좋나요?`, a:`본문에서 기준을 파악한 뒤 필요한 항목만 다시 확인하면 됩니다. 숫자가 필요한 항목은 도구에서 검산하고, 주소나 코드처럼 변동 가능성이 큰 항목은 현재 시점 기준으로 재확인하는 흐름이 좋습니다.`}
  ];
  const faqJson = {
    '@context':'https://schema.org', '@type':'FAQPage',
    mainEntity: faq.map(item => ({ '@type':'Question', name:item.q, acceptedAnswer:{'@type':'Answer', text:item.a} }))
  };
  const articleJson = {
    '@context':'https://schema.org', '@type':'Article',
    headline:title, description:desc || `${title} 기준과 확인 흐름을 RUST 방식으로 정리한 롱폼 콘텐츠입니다.`,
    author:{'@type':'Organization', name:'RUST'}, publisher:{'@type':'Organization', name:'RUST', logo:{'@type':'ImageObject', url:'https://88st.cloud/assets/img/rust/rust-crest-192.png'}},
    mainEntityOfPage:`https://88st.cloud/${rel.replace(/index\.html$/,'').replace(/\.html$/,'/')}`
  };
  const sectionHtml = sections.map((sec, idx)=>`
      <section class="v91-depth-section" data-v91-depth-section="${idx+1}">
        <h2>${esc(sec.h)}</h2>
        ${idx === 0 ? `<div class="v91-depth-callout"><b>${esc(category)} 기준 요약</b><p>${esc(title)}는 검색 유입 사용자가 현재 조건을 판단할 수 있도록 기준, 수치, 위험 신호를 분리해 설명하는 RUST 롱폼 문서입니다.</p></div>` : ''}
        ${sec.p.map(p=>`<p>${esc(p)}</p>`).join('\n        ')}
        ${idx === 3 ? `<div class="v91-depth-callout v91-depth-callout-copper"><b>중간 점검</b><p>주소, 코드, 조건, 계산 결과가 서로 다른 방향을 가리키면 결론을 서두르지 말고 기준을 다시 나누어 확인하는 편이 안전합니다.</p></div>` : ''}
      </section>`).join('\n');
  return `<article class="v79-article v91-depth-article" data-v91-hub-depth="article">
    <div class="v79-article-kicker">${esc(category)} · RUST CONTENT DEPTH</div>
    <h1 class="v79-article-title">${esc(title)}</h1>
    <p class="v79-article-lead">${esc(desc || `${title}의 핵심 기준과 실전 확인 흐름을 깊이 있게 정리했습니다.`)} 광고성 안내를 늘리지 않고, 검색 유입 사용자가 실제로 판단할 수 있는 기준·수치·위험 신호 중심으로 보강했습니다.</p>
    <div class="v79-content v91-depth-content">
      <div class="v79-summary-box v91-depth-summary"><b>핵심 요약</b><p>${esc(title)}는 단순 소개보다 기준 분리, 조건 비교, 최신성 확인이 중요한 주제입니다. 이 문서는 불필요한 하단 링크 묶음 없이 본문 안에서 필요한 판단 근거를 충분히 제공하도록 구성했습니다.</p></div>
      ${sectionHtml}
      <section class="v91-depth-faq" data-v91-hub-depth="faq">
        <h2>자주 묻는 질문</h2>
        ${faq.map(item=>`<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`).join('\n        ')}
      </section>
      <script type="application/ld+json" data-v91-hub-depth="article-schema">${JSON.stringify(articleJson)}</script>
      <script type="application/ld+json" data-v91-hub-depth="faq-schema">${JSON.stringify(faqJson)}</script>
    </div>
  </article>`;
}
function injectHead(html, rel){
  html = html.replace(/<meta name="v91-hub-content-depth"[^>]*>/g,'');
  html = html.replace(/<link rel="stylesheet" href="\/assets\/css\/v91-hub-content-depth\.css[^>]*>/g,'');
  html = html.replace(/<\/head>/i, `  <meta name="v91-hub-content-depth" content="${MARKER}">\n  <link rel="stylesheet" href="/assets/css/v91-hub-content-depth.css?v=static-v91-hub-content-depth-20260526" data-v91-hub-depth="css">\n</head>`);
  return html;
}
function removeOldV91(html){
  return html.replace(/<script type="application\/ld\+json" data-v91-hub-depth="(?:article|faq)-schema">[\s\S]*?<\/script>/g,'');
}
function transformPage(rel){
  let html = read(rel);
  html = removeOldV91(html);
  const titleRaw = getMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, getMatch(html, /<title>([\s\S]*?)<\/title>/i, rel));
  const title = sentenceTitle(stripTags(titleRaw));
  const desc = getMatch(html, /<meta\s+name="description"\s+content="([^"]*)"/i, '');
  const article = buildArticle(title, desc, rel);
  if(/<article\b[\s\S]*?<\/article>/i.test(html)) {
    html = html.replace(/<article\b[\s\S]*?<\/article>/i, article);
  } else if(/<main\b[^>]*>/i.test(html)) {
    html = html.replace(/<\/main>/i, `${article}</main>`);
  } else {
    html = html.replace(/<\/body>/i, `<main class="v79-main">${article}</main></body>`);
  }
  for(const banned of BANNED){
    html = html.split(banned).join('');
  }
  html = injectHead(html, rel);
  write(rel, html);
  return { rel, title, textLength: stripTags(html).length, h2: (html.match(/<h2\b/gi)||[]).length };
}

const targets = [];
for(const dir of TARGET_DIRS){
  for(const rel of walk(dir)){
    if(rel.endsWith('/index.html') || rel === `${dir}/index.html`) continue;
    targets.push(rel);
  }
}
targets.sort();
const result = targets.map(transformPage);

write(CSS, `
.v91-depth-article{position:relative;}
.v91-depth-content{font-size:16px;line-height:1.88;letter-spacing:-.015em;}
.v91-depth-content p{margin:0 0 1.05rem;color:rgba(232,238,247,.88);word-break:keep-all;}
.v91-depth-section{margin:1.65rem 0 0;padding:1.15rem;border:1px solid rgba(255,122,26,.13);border-radius:22px;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.022));box-shadow:inset 0 1px 0 rgba(255,255,255,.05);}
.v91-depth-section h2,.v91-depth-faq h2{margin:.1rem 0 .9rem;font-size:clamp(1.12rem,2.4vw,1.48rem);letter-spacing:-.045em;color:#fff3e7;}
.v91-depth-callout{margin:.25rem 0 1rem;padding:1rem;border:1px solid rgba(255,122,26,.24);border-radius:18px;background:radial-gradient(circle at 20% 0%,rgba(255,122,26,.15),transparent 55%),rgba(255,255,255,.045);box-shadow:0 18px 70px rgba(255,122,26,.06);}
.v91-depth-callout b,.v91-depth-summary b{display:block;margin-bottom:.42rem;color:#ffb36b;letter-spacing:-.02em;}
.v91-depth-callout p,.v91-depth-summary p{margin:0;color:rgba(240,246,255,.88);}
.v91-depth-callout-copper{border-color:rgba(255,188,114,.22);background:radial-gradient(circle at 80% 0%,rgba(255,188,114,.14),transparent 55%),rgba(255,255,255,.04);}
.v91-depth-faq{margin:1.7rem 0 0;padding:1.15rem;border-radius:22px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);}
.v91-depth-faq details{border-top:1px solid rgba(255,255,255,.08);padding:.92rem 0;}
.v91-depth-faq details:first-of-type{border-top:0;}
.v91-depth-faq summary{cursor:pointer;color:#fff;font-weight:800;letter-spacing:-.025em;min-height:44px;display:flex;align-items:center;}
.v91-depth-faq details[open] summary{color:#ffb36b;}
@media (max-width:720px){.v91-depth-content{font-size:15px;line-height:1.82}.v91-depth-section,.v91-depth-faq{padding:1rem;border-radius:18px}.v91-depth-content p{word-break:keep-all}}
`);

write(DATA, JSON.stringify({ marker: MARKER, generatedAt: new Date().toISOString(), total: result.length, targets: result }, null, 2));
console.log(`[V91] hub content depth generated. targets=${result.length}`);
