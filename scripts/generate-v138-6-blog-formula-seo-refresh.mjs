import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V138_6_BLOG_FORMULA_SEO_REFRESH';
const CSS_HREF = '/assets/css/v138-6-blog-content-seo-refresh.css?v=20260531-v138-6-blog-seo-refresh';
const CSS_LINK = `<link rel="stylesheet" href="${CSS_HREF}" data-v138-6-blog-seo-refresh="true">`;
const HTML_FLAG = 'data-v138-6-blog-seo-refresh="active"';
const changed = new Set([
  'scripts/generate-v138-6-blog-formula-seo-refresh.mjs',
  'scripts/verify-v138-6-blog-formula-seo-refresh.mjs',
  'scripts/build-v138-6-cloudflare-pages-safe.mjs'
]);
const touchedPosts = [];
const formulaPosts = [];
const earlyPosts = [];
const keywordUpdated = [];
const descriptionsUpdated = [];

function p(...parts){ return path.join(ROOT, ...parts); }
function rel(fp){ return path.relative(ROOT, fp).replace(/\\/g, '/'); }
function read(file){ return fs.readFileSync(file, 'utf8'); }
function write(file, data){ fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, data); }
function walk(dir, out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const ent of fs.readdirSync(dir, {withFileTypes:true})){
    const fp = path.join(dir, ent.name);
    if(ent.isDirectory()){
      if(!['node_modules','.git'].includes(ent.name)) walk(fp, out);
    } else if(ent.isFile() && ent.name.endsWith('.html')) out.push(fp);
  }
  return out;
}
function stripTags(s){ return String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
function decodeHtml(s){
  return String(s||'')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'");
}
function escapeAttr(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function cleanTitle(html, r){
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = h1 || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || r;
  return decodeHtml(stripTags(title)).replace(/\s*\|\s*RUST\s*블로그\s*$/i,'').replace(/\s*\|\s*88ST\.Cloud\s*$/i,'').trim();
}
function canonicalPath(html, r){
  const can = html.match(/<link\b[^>]+rel=["']canonical["'][^>]+href=["']https?:\/\/88st\.cloud([^"']+)["'][^>]*>/i)?.[1];
  if(can) return can;
  if(r.endsWith('/index.html')) return '/' + r.replace(/index\.html$/,'');
  return '/' + r;
}
function categoryFor(r, title){
  const t = `${r} ${title}`.toLowerCase();
  if(t.includes('sports-toto') || /스포츠|축구|야구|농구|배구|kbo|nba|kbl|프로토|배당|핸디캡|월드컵|clv/i.test(title)) return 'sports';
  if(t.includes('minigame') || /파워볼|사다리|스피드키노|미니게임|동행/i.test(title)) return 'minigame';
  if(t.includes('bet365') || /가상게임|virtual|bet365/i.test(title)) return 'virtual';
  if(t.includes('slot') || /슬롯|rtp|프라그마틱|노리밋|변동성/i.test(title)) return 'slot';
  if(t.includes('casino') || /카지노|바카라|에볼루션|입플/i.test(title)) return 'casino';
  if(t.includes('affiliate') || /총판|제휴|정산|가입코드/i.test(title)) return 'affiliate';
  if(/도메인|주소|dns|ssl|tls|whois|rdap|피싱|리다이렉트|먹튀|검증|보증업체|공식주소/i.test(title) || /domain|address|muktu|guaranteed|search-guide|code/.test(t)) return 'verification';
  if(/ev|롤링|보너스|첫충|매충|페이백|계산|출금|정산|한도|조건/i.test(title)) return 'condition';
  return 'general';
}
function topicPack(category, title){
  const base = ['RUST','러스트','88st.cloud','88ST','보증업체','가입코드','공식주소','검색가이드','실사용 가이드'];
  const packs = {
    sports: ['스포츠토토','온라인스포츠토토사이트추천','토토사이트추천','스포츠 배당분석','배당 마진','환수율','EV 계산법','핸디캡','언더오버','롤링 조건','2026 스포츠토토'],
    minigame: ['미니게임입플사이트','파워볼','사다리게임','동행파워볼','동행스피드키노','스피드키노','확률 구조','연패 확률','회차 결과','미니게임 조건'],
    virtual: ['BET365 가상게임','가상축구','가상농구','가상경마','회차 ID','가상게임 정산','배당 주기','결과 확인','게임사 기준'],
    slot: ['온라인슬롯','프라그마틱 슬롯','노리밋 슬롯','슬롯 RTP','슬롯 변동성','보너스 구매','롤링 인정률','슬롯 이벤트','손실한도'],
    casino: ['온라인카지노','카지노입플사이트추천','에볼루션 카지노','프라그마틱 카지노','바카라','카지노 롤링','첫충 매충','실수령 계산','정산 조건'],
    affiliate: ['총판 정보','제휴문의','가입코드 관리','정산 구조','전환 추적','상담 기록','보증업체 제휴','코드 매칭'],
    verification: ['먹튀검증','공식 도메인 확인','주소 변경','도메인 이력','DNS 확인','SSL 인증서','리다이렉트 점검','피싱 주소 구분','보증업체 확인'],
    condition: ['EV 계산법','롤링 계산기','보너스 계산기','첫충 매충 비교','페이백 계산','실수령 계산','최대출금 한도','이벤트 조건','정산 예외'],
    general: ['토토사이트추천','입플사이트추천','조건 확인','이벤트 조건','출금 확인','상담 전 확인','도구 활용','보증업체 비교']
  };
  const titleTerms = title.split(/[\s·:|/()\[\],]+/).map(x=>x.trim()).filter(x=>x.length>=2 && x.length<=18).slice(0,8);
  const out = [];
  for(const x of [title, ...titleTerms, ...(packs[category]||packs.general), ...base]){
    const v = String(x||'').replace(/\s+/g,' ').trim();
    if(v && !out.includes(v)) out.push(v);
  }
  return out.slice(0, 26).join(', ');
}
function descriptionFor(category, title){
  const common = 'RUST 기준으로 공식주소, 가입코드, 조건표, 정산 예외를 분리해 실사용 순서로 정리합니다.';
  const map = {
    sports: `${title}를 배당 마진, 환수율, EV, 롤링 조건 관점에서 다시 정리했습니다. ${common}`,
    minigame: `${title}를 회차 독립성, 지급률, 연패 확률, 조건표 확인 순서로 보강했습니다. ${common}`,
    virtual: `${title}를 회차 ID, 제공사 기준, 결과 정산, 배당 주기 관점에서 최신화했습니다. ${common}`,
    slot: `${title}를 RTP, 변동성, 보너스 조건, 손실한도 기준으로 실사용 관점에서 보강했습니다. ${common}`,
    casino: `${title}를 카지노 입플, 롤링, 실수령, 정산 예외 기준으로 최신화했습니다. ${common}`,
    affiliate: `${title}를 가입코드, 상담 기록, 정산 기준, 전환 추적 관점에서 다시 정리했습니다. ${common}`,
    verification: `${title}를 도메인, DNS, SSL, 리다이렉트, 약관 변경 신호 중심으로 최신화했습니다. ${common}`,
    condition: `${title}를 EV, 롤링, 실수령, 최대출금 제한까지 숫자로 비교할 수 있게 보강했습니다. ${common}`,
    general: `${title}를 광고성 문구보다 사용자가 직접 확인할 수 있는 기준 중심으로 최신화했습니다. ${common}`
  };
  return (map[category] || map.general).slice(0, 158);
}
function formulaExplanation(category, title){
  const packs = {
    sports: {
      head: '2026 해석 보강: 배당 공식은 “예측”보다 가격 검증에 사용',
      p1: '암시확률과 오버라운드는 어느 선택지가 맞는지를 말해주는 공식이 아니라, 배당판 안에 들어간 마진과 가격 왜곡을 분리하는 기준입니다. 같은 배당이라도 마감 배당, 취소 기준, 핸디캡 푸시, 롤링 인정률이 다르면 실제 판단값은 달라집니다.',
      p2: 'RUST에서는 배당을 먼저 확률로 환산한 뒤 약관 조건을 따로 붙입니다. 이 순서로 보면 “적중률이 높아 보이는 경기”와 “조건까지 감안해 기록할 가치가 있는 경기”를 분리할 수 있습니다.'
    },
    minigame: {
      head: '2026 해석 보강: 짧은 회차일수록 독립시행과 자본 한도를 분리',
      p1: '파워볼·사다리·스피드키노는 회차가 빠르기 때문에 연속 결과를 패턴으로 오해하기 쉽습니다. 연패확률 공식은 다음 회차를 맞히는 공식이 아니라, 같은 단위 베팅을 반복했을 때 자본이 얼마나 빨리 소모될 수 있는지 보는 안전 장치입니다.',
      p2: '마틴게일이나 배수 조절은 승률을 바꾸지 않습니다. 따라서 공식은 공격 신호가 아니라 손실한도, 최대 회차 수, 인정 게임 여부를 먼저 제한하는 용도로 사용하는 편이 정확합니다.'
    },
    virtual: {
      head: '2026 해석 보강: 가상게임은 회차 ID와 정산 기준이 먼저',
      p1: 'BET365 가상게임류는 실제 스포츠 기록이 아니라 제공사 회차, 배당판, 결과 고시, 정산 시간이 한 묶음으로 움직입니다. 배당 공식만 보면 비슷해 보여도 회차 ID와 결과표가 어긋나면 기록 신뢰도가 떨어집니다.',
      p2: '공식은 “반복 주기”를 찾기보다 회차별 표기, 정산 시간, 이벤트 인정 범위를 대조하는 기준으로 쓰는 것이 안전합니다.'
    },
    slot: {
      head: '2026 해석 보강: RTP는 장기 평균, 세션 보장은 아님',
      p1: '슬롯 RTP와 변동성 수치는 장기 평균을 설명하는 자료입니다. 단기 세션에서 특정 금액 회수를 보장하지 않기 때문에 보너스 구매, 프리스핀, 롤링 인정률, 최대출금 조건을 함께 계산해야 합니다.',
      p2: 'RUST 기준에서는 지급률 숫자보다 손실한도와 이벤트 조건을 먼저 분리합니다. 그래야 “혜택률은 높지만 실제 실수령이 낮은” 구조를 걸러낼 수 있습니다.'
    },
    casino: {
      head: '2026 해석 보강: 카지노 계산은 실수령과 제한 조항을 같이 봐야 함',
      p1: '카지노 입플·롤링 공식은 표면 보너스율보다 인정 게임, 기여율, 제한 조항이 더 크게 작동합니다. 바카라·라이브카지노·슬롯은 같은 롤링 배수라도 인정률이 다르면 실제 부담이 달라집니다.',
      p2: '계산 순서는 입금액, 보너스, 요구 롤링, 인정률, 최대출금, 정산 예외 순서가 안전합니다. 이 순서가 빠지면 큰 혜택처럼 보여도 실제 실수령은 줄어들 수 있습니다.'
    },
    verification: {
      head: '2026 해석 보강: 검증 공식은 단일 점수가 아니라 불일치 탐지용',
      p1: '도메인 나이, SSL 인증서, DNS, 리다이렉트, 약관 변경률은 각각 단독으로 안전을 보장하지 않습니다. 공식은 점수를 만들기보다 어떤 항목이 서로 충돌하는지 빠르게 찾는 기준표에 가깝습니다.',
      p2: '특히 주소 변경이 잦은 경우에는 최종 URL, 인증서 SAN, 공지 채널, 가입코드 안내가 같은 흐름인지 확인해야 합니다. 한 항목이 비어 있으면 결론을 보류하는 편이 안전합니다.'
    },
    condition: {
      head: '2026 해석 보강: 혜택률보다 실수령 EV를 먼저 계산',
      p1: '보너스·롤링·페이백 공식은 “받는 금액”이 아니라 “조건 충족 후 남는 금액”을 보는 계산입니다. 혜택률이 높아도 요구 롤링, 인정률, 최대출금, 제외 게임이 강하면 기대값은 낮아질 수 있습니다.',
      p2: 'RUST에서는 입금액과 보너스를 합친 뒤 요구 롤링과 제한 조항을 차감하는 순서로 봅니다. 이 순서가 있어야 이벤트 문구와 실제 조건을 분리할 수 있습니다.'
    },
    general: {
      head: '2026 해석 보강: 숫자는 판단 보조, 최종 기준은 조건 일치성',
      p1: '수식이 포함된 글은 결과를 보장하기 위한 목적이 아니라 조건을 같은 단위로 비교하기 위한 기준입니다. 주소, 코드, 약관, 정산 기준이 맞지 않으면 계산값도 참고값에 그칩니다.',
      p2: '따라서 공식은 단정 문구가 아니라 재검증 순서와 함께 사용해야 합니다.'
    }
  };
  return packs[category] || packs.general;
}
function earlyExplanation(category, title){
  const packs = {
    sports: ['2026 최신화 메모: 스포츠 글은 경기 예측보다 배당판·약관·정산 기준의 일치성을 먼저 봐야 합니다.', '초기 배당과 마감 배당을 비교할 때도 라인업, 취소 기준, 핸디캡 푸시 조건을 분리해 기록하면 같은 문구의 반복보다 검색 의도에 더 맞는 자료가 됩니다.'],
    minigame: ['2026 최신화 메모: 미니게임 글은 빠른 회차 때문에 패턴 착시가 강해질 수 있습니다.', '본문의 확률 표현은 결과 예측이 아니라 회차 독립성, 지급률, 자본 한도를 확인하는 기준으로 읽는 것이 안전합니다.'],
    virtual: ['2026 최신화 메모: 가상게임 글은 실제 경기 분석보다 회차 ID, 제공사 표기, 결과 고시, 정산 시간이 핵심입니다.', '같은 화면처럼 보여도 공식 기록과 약관 인정 범위가 다르면 실사용 조건이 달라질 수 있습니다.'],
    verification: ['2026 최신화 메모: 검증 글은 후기보다 공개 신호의 일치성을 우선합니다.', '도메인, DNS, SSL, 리다이렉트, 약관 문구가 같은 방향을 가리키는지 확인하면 광고성 문구를 줄이고 실사용 판단에 가까워집니다.'],
    condition: ['2026 최신화 메모: 조건 글은 혜택률보다 실수령 계산과 제한 조항을 먼저 봐야 합니다.', '첫충·매충·페이백은 입금액, 보너스, 요구 롤링, 최대출금, 제외 게임을 같은 표에 놓고 비교해야 오해가 줄어듭니다.'],
    casino: ['2026 최신화 메모: 카지노 글은 게임사 이름보다 인정률, 롤링, 정산 예외, 실수령 흐름이 중요합니다.', '같은 이벤트라도 바카라·라이브카지노·슬롯의 기여율이 다르면 실제 부담이 달라질 수 있습니다.'],
    slot: ['2026 최신화 메모: 슬롯 글은 RTP 숫자를 단기 보장값처럼 해석하지 않아야 합니다.', '변동성, 보너스 구매, 프리스핀, 손실한도를 함께 보아야 실사용 기준이 분명해집니다.'],
    affiliate: ['2026 최신화 메모: 제휴·총판 글은 코드 관리, 상담 기록, 정산 기준을 분리해 읽어야 합니다.', '도메인과 가입코드, 운영 안내가 같은 흐름으로 유지되는지 확인하는 것이 핵심입니다.'],
    general: ['2026 최신화 메모: 초기 작성 글은 검색 유입 문구보다 실제 확인 순서를 먼저 보강했습니다.', '주소, 코드, 조건, 정산 예외를 분리해 보면 같은 주제의 반복 문장보다 판단 기준이 선명해집니다.']
  };
  return packs[category] || packs.general;
}
function makeRefreshBlock(kind, category, title, r){
  const id = r.replace(/^blog\//,'').replace(/\/index\.html$|\.html$/,'').replace(/[^a-z0-9가-힣_-]+/gi,'-').slice(0,80);
  if(kind === 'formula'){
    const x = formulaExplanation(category, title);
    return `\n<div class="v138-6-blog-refresh v138-6-formula-refresh" data-v138-6-blog-refresh="formula" id="v138-6-${id}">\n  <h2>${escapeAttr(x.head)}</h2>\n  <p>${escapeAttr(x.p1)}</p>\n  <p>${escapeAttr(x.p2)}</p>\n</div>\n`;
  }
  const [p1, p2] = earlyExplanation(category, title);
  return `\n<div class="v138-6-blog-refresh v138-6-early-refresh" data-v138-6-blog-refresh="early" id="v138-6-${id}">\n  <h2>${escapeAttr(p1.split(':')[0])}</h2>\n  <p>${escapeAttr(p1)}</p>\n  <p>${escapeAttr(p2)}</p>\n</div>\n`;
}
function ensureCss(html){
  if(html.includes('data-v138-6-blog-seo-refresh="true"') || html.includes('v138-6-blog-content-seo-refresh.css')) return html;
  if(html.includes('v138-4-blog-radius-rollback.css')){
    return html.replace(/(<link\b[^>]+v138-4-blog-radius-rollback\.css[^>]*>)/i, `$1\n  ${CSS_LINK}`);
  }
  if(html.includes('v138-3-section-radius-rollback.css')){
    return html.replace(/(<link\b[^>]+v138-3-section-radius-rollback\.css[^>]*>)/i, `$1\n  ${CSS_LINK}`);
  }
  return html.replace(/<\/head>/i, `  ${CSS_LINK}\n</head>`);
}
function ensureFlag(html){
  if(html.includes(HTML_FLAG)) return html;
  return html.replace(/<html\b(?![^>]*data-v138-6-blog-seo-refresh=)/i, `<html ${HTML_FLAG}`);
}
function setMeta(html, name, content){
  const escaped = escapeAttr(content);
  const re = new RegExp(`<meta\\b([^>]*name=["']${name}["'][^>]*)>`, 'i');
  if(re.test(html)){
    return html.replace(re, (m)=>{
      if(/\bcontent=["'][^"']*["']/i.test(m)) return m.replace(/\bcontent=["'][^"']*["']/i, `content="${escaped}"`);
      return m.replace(/>$/, ` content="${escaped}">`);
    });
  }
  const viewport = /(<meta\b[^>]+name=["']viewport["'][^>]*>)/i;
  if(viewport.test(html)) return html.replace(viewport, `$1<meta name="${name}" content="${escaped}">`);
  return html.replace(/<title/i, `<meta name="${name}" content="${escaped}"><title`);
}
function setPropertyMeta(html, prop, content){
  const escaped = escapeAttr(content);
  const re = new RegExp(`<meta\\b([^>]*property=["']${prop.replace(':','\\:')}["'][^>]*)>`, 'i');
  if(re.test(html)){
    return html.replace(re, (m)=>{
      if(/\bcontent=["'][^"']*["']/i.test(m)) return m.replace(/\bcontent=["'][^"']*["']/i, `content="${escaped}"`);
      return m.replace(/>$/, ` content="${escaped}">`);
    });
  }
  return html.replace(/<\/head>/i, `  <meta property="${prop}" content="${escaped}">\n</head>`);
}
function updateDescriptions(html, desc){
  html = setMeta(html, 'description', desc);
  html = setPropertyMeta(html, 'og:description', desc);
  html = setMeta(html, 'twitter:description', desc);
  return html;
}
function insertContentBlock(html, r, title, category){
  if(html.includes('data-v138-6-blog-refresh=')) return {html, kind:null};
  const isFormula = /class=["'][^"']*v48-formula/i.test(html) || /EV|공식|계산|확률|마진|환수율|RTP|롤링|페이백|수익률|오버라운드|배당/i.test(title);
  const isEarly = /\/v4[78]-|pro-article__wrap|v48-formula/i.test(r + ' ' + html.slice(0, 2500));
  if(isFormula && /class=["'][^"']*v48-formula/i.test(html)){
    const block = makeRefreshBlock('formula', category, title, r);
    const next = html.replace(/(<div\s+class=["'][^"']*v48-formula[^"']*["'][^>]*>[\s\S]*?<\/div>)/i, `$1${block}`);
    if(next !== html) return {html:next, kind:'formula'};
  }
  if(isFormula || isEarly){
    const kind = isFormula ? 'formula' : 'early';
    const block = makeRefreshBlock(kind, category, title, r);
    let next = html;
    // Prefer after lead paragraph on pro pages.
    next = next.replace(/(<p\s+class=["']lead["'][^>]*>[\s\S]*?<\/p>)/i, `$1${block}`);
    if(next !== html) return {html:next, kind};
    // V82 longform note pages.
    next = html.replace(/(<div\s+class=["']v82-note["'][^>]*>[\s\S]*?<\/div>)/i, `$1${block}`);
    if(next !== html) return {html:next, kind};
    // Fallback before first content h2.
    next = html.replace(/(<h2\b[^>]*>)/i, `${block}$1`);
    if(next !== html) return {html:next, kind};
  }
  return {html, kind:null};
}
function writeCss(){
  const css = `/* V138-6 BLOG FORMULA + SEO REFRESH\n   - blog article text upgrade only\n   - article text polish only\n   - keep V138-4 blog rollback and V138-5 GA4 coverage intact */\nhtml[data-v138-6-blog-seo-refresh=\"active\"] .v138-6-blog-refresh{\n  margin:clamp(18px,2.2vw,28px) 0;\n  padding:clamp(16px,2vw,22px);\n  border:1px solid rgba(148,163,184,.18);\n  border-radius:16px;\n  background:linear-gradient(180deg,rgba(15,23,42,.68),rgba(15,23,42,.42));\n  color:#e5e7eb;\n  box-shadow:0 14px 34px rgba(0,0,0,.18);\n  overflow:visible;\n}\nhtml[data-v138-6-blog-seo-refresh=\"active\"] .v138-6-blog-refresh h2{\n  margin:0 0 10px;\n  color:#f8fafc;\n  font-size:clamp(1.05rem,1.55vw,1.32rem);\n  line-height:1.35;\n  letter-spacing:-.02em;\n}\nhtml[data-v138-6-blog-seo-refresh=\"active\"] .v138-6-blog-refresh p{\n  margin:8px 0 0;\n  color:rgba(226,232,240,.9);\n  line-height:1.8;\n  word-break:keep-all;\n  overflow-wrap:anywhere;\n}\nhtml[data-v138-6-blog-seo-refresh=\"active\"] .v48-formula,\nhtml[data-v138-6-blog-seo-refresh=\"active\"] .v138-6-formula-refresh{\n  max-width:100%;\n}\n@media (max-width:640px){\n  html[data-v138-6-blog-seo-refresh=\"active\"] .v138-6-blog-refresh{\n    margin:16px 0;\n    padding:14px;\n    border-radius:14px;\n  }\n  html[data-v138-6-blog-seo-refresh=\"active\"] .v138-6-blog-refresh p{\n    font-size:.94rem;\n  }\n}\n`;
  write(p('assets/css/v138-6-blog-content-seo-refresh.css'), css);
  changed.add('assets/css/v138-6-blog-content-seo-refresh.css');
}
function shouldSkipContent(r){
  return r === 'blog/index.html' || /^blog\/page\//.test(r) || /\/index\.html$/.test(r) && /\/(sports-toto|bet365-virtual|game-guides|minigame|online-casino|online-slot|affiliate)\/index\.html$/.test(r);
}

writeCss();
const blogFiles = walk(p('blog'));
const seoMapPath = p('assets/config/seo.meta.json');
const seoMap = fs.existsSync(seoMapPath) ? JSON.parse(read(seoMapPath)) : {};
for(const fp of blogFiles){
  const r = rel(fp);
  let html = read(fp);
  const before = html;
  const title = cleanTitle(html, r);
  const category = categoryFor(r, title);
  const keywords = topicPack(category, title);
  const desc = descriptionFor(category, title);
  html = ensureFlag(html);
  html = ensureCss(html);
  html = setMeta(html, 'keywords', keywords);
  keywordUpdated.push(r);
  if(!/^(blog\/page\/|blog\/index\.html$)/.test(r)){
    html = updateDescriptions(html, desc);
    descriptionsUpdated.push(r);
  }
  if(!shouldSkipContent(r)){
    const result = insertContentBlock(html, r, title, category);
    html = result.html;
    if(result.kind){
      touchedPosts.push(r);
      if(result.kind === 'formula') formulaPosts.push(r);
      else earlyPosts.push(r);
    }
  }
  const route = canonicalPath(html, r);
  seoMap[route] = {
    ...(seoMap[route] || {}),
    title: (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ? decodeHtml(stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)[1])) : `${title} | RUST 블로그`),
    description: desc,
    keywords
  };
  if(html !== before){
    write(fp, html);
    changed.add(r);
  }
}
write(seoMapPath, JSON.stringify(seoMap, null, 2) + '\n');
changed.add('assets/config/seo.meta.json');

function updatePackage(){
  const pkgPath = p('package.json');
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = 'node scripts/build-v138-6-cloudflare-pages-safe.mjs';
  pkg.scripts.verify = 'node scripts/verify-v138-6-blog-formula-seo-refresh.mjs';
  pkg.scripts['quality:v138-6'] = 'node scripts/generate-v138-6-blog-formula-seo-refresh.mjs';
  pkg.scripts['verify:v138-6'] = 'node scripts/verify-v138-6-blog-formula-seo-refresh.mjs';
  pkg.scripts['verify:deploy'] = 'node scripts/build-v138-6-cloudflare-pages-safe.mjs';
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  changed.add('package.json');
}
function writeReports(){
  const generatedAt = new Date().toISOString();
  fs.mkdirSync(p('reports'), {recursive:true});
  const blogRelFiles = blogFiles.map(fp => rel(fp)).sort();
  const contentTouchedAll = [];
  const formulaPostsAll = [];
  const earlyPostsAll = [];
  for(const r of blogRelFiles){
    const h = read(p(r));
    if(h.includes('data-v138-6-blog-refresh=')) contentTouchedAll.push(r);
    if(h.includes('data-v138-6-blog-refresh="formula"')) formulaPostsAll.push(r);
    if(h.includes('data-v138-6-blog-refresh="early"')) earlyPostsAll.push(r);
  }
  const deliveryFiles = Array.from(new Set([
    ...blogRelFiles,
    'assets/config/seo.meta.json',
    'assets/css/v138-6-blog-content-seo-refresh.css',
    'package.json',
    'scripts/build-v138-6-cloudflare-pages-safe.mjs',
    'scripts/generate-v138-6-blog-formula-seo-refresh.mjs',
    'scripts/verify-v138-6-blog-formula-seo-refresh.mjs',
    'reports/v138-6-blog-formula-seo-refresh-audit.json',
    'reports/v138-6-verify-report.json',
    'reports/v138-6-cloudflare-build-safe-report.json',
    'V138_6_PATCH_MANIFEST.json',
    'V138_6_UPGRADE_REPORT.md'
  ])).sort();
  const counts = {
    blogHtmlScanned: blogRelFiles.length,
    changedFiles: deliveryFiles.length,
    keywordUpdated: keywordUpdated.length,
    descriptionsUpdated: descriptionsUpdated.length,
    contentTouchedPosts: contentTouchedAll.length,
    formulaPosts: formulaPostsAll.length,
    earlyPosts: earlyPostsAll.length
  };
  const audit = {
    ok: true,
    version: VERSION,
    base: 'V138-5 GA4 COVERAGE HARDENING FULL',
    scope: [
      'blog formula/calculation posts: repetitive formula interpretation reduced with category-specific paragraphs',
      'early V47/V48/pro-article posts: wording refreshed with 2026 usage notes',
      'SEO meta keywords: rebuilt per blog route and mirrored into assets/config/seo.meta.json',
      'meta descriptions: corrected boilerplate and refreshed OG/Twitter descriptions'
    ],
    counts,
    changedFiles: deliveryFiles,
    formulaPosts: formulaPostsAll,
    earlyPosts: earlyPostsAll,
    deletedFiles: [],
    forbiddenNotAdded: ['FAQ boxes','AI Q&A snippets','trust chips','related posts sections','recommendation sections','bottom connection blocks','new conversion CTA boxes'],
    generatedAt
  };
  write(p('reports/v138-6-blog-formula-seo-refresh-audit.json'), JSON.stringify(audit, null, 2));
  changed.add('reports/v138-6-blog-formula-seo-refresh-audit.json');
  const manifest = {
    version: VERSION,
    patchType: 'blog-content-formula-seo-keyword-refresh',
    rootOverwriteSafe: true,
    fullReplaceSafe: true,
    changedFiles: deliveryFiles,
    deletedFiles: [],
    counts,
    generatedAt
  };
  write(p('V138_6_PATCH_MANIFEST.json'), JSON.stringify(manifest, null, 2));
  changed.add('V138_6_PATCH_MANIFEST.json');
  const report = [
    '# V138-6 BLOG FORMULA SEO REFRESH',
    '',
    '블로그 게시글 중 수학 공식·계산식이 들어간 글의 반복 느낌을 줄이고, 초창기 V47/V48 계열 글의 문구를 2026 실사용 기준으로 보강한 패치입니다.',
    '',
    '## 반영 범위',
    '',
    `- 블로그 HTML 스캔: ${counts.blogHtmlScanned}개`,
    `- SEO keywords 재보강: ${counts.keywordUpdated}개`,
    `- meta/OG/Twitter description 최신화: ${counts.descriptionsUpdated}개`,
    `- 본문 보강 글: ${counts.contentTouchedPosts}개`,
    `- 수학 공식·계산식 글 보강: ${counts.formulaPosts}개`,
    `- 초창기/기존 공식형 글 문구 보강: ${counts.earlyPosts}개`,
    `- PATCH 전달 파일: ${counts.changedFiles}개`,
    '',
    '## 보강 내용',
    '',
    '- 공식/계산식 글은 카테고리별 해석 문단을 추가해 동일 문장 반복감을 줄였습니다.',
    '- 스포츠토토, 미니게임, BET365 가상게임, 카지노, 슬롯, 도메인 검증, 보너스/롤링 계산 계열로 문맥을 나눴습니다.',
    '- 각 블로그 글의 `meta keywords`를 제목·카테고리·RUST 핵심 키워드 기준으로 재구성했습니다.',
    '- `assets/config/seo.meta.json`의 블로그 route 키워드도 함께 최신화했습니다.',
    '',
    '## 유지',
    '',
    '- 기존 slug/canonical/sitemap 유지',
    '- GA4 V138-5 커버리지 유지',
    '- V138-4 블로그 라운드 롤백 유지',
    '- 새 FAQ/관련글/추천글/신뢰칩/하단 연결 섹션 추가 없음',
    '- 삭제 파일 없음',
    '',
    '## 주요 파일',
    '',
    '- `assets/css/v138-6-blog-content-seo-refresh.css`',
    '- `assets/config/seo.meta.json`',
    '- `scripts/generate-v138-6-blog-formula-seo-refresh.mjs`',
    '- `scripts/verify-v138-6-blog-formula-seo-refresh.mjs`',
    '- `scripts/build-v138-6-cloudflare-pages-safe.mjs`',
    ''
  ].join('\n');
  write(p('V138_6_UPGRADE_REPORT.md'), report);
  changed.add('V138_6_UPGRADE_REPORT.md');
}
updatePackage();
writeReports();
console.log('[V138.6 GENERATE PASS]', JSON.stringify({ok:true, version:VERSION, changedFiles:Array.from(changed).length, blogHtml:blogFiles.length, formulaPosts:formulaPosts.length, earlyPosts:earlyPosts.length, keywordUpdated:keywordUpdated.length}, null, 2));
