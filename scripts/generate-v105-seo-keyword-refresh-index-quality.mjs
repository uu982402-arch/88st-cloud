import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V105_SEO_KEYWORD_REFRESH_INDEX_QUALITY_ACTIVE';
const cssHref = '/assets/css/v105-seo-keyword-refresh-index-quality.css?v=v105-seo-keyword-refresh-index-quality-20260526';
const jsHref = '/assets/js/v105-seo-keyword-refresh-index-quality.js?v=v105-seo-keyword-refresh-index-quality-20260526';
const removed = ['faq','consult-motives','consult-result','provider-updates'];

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, v) => fs.writeFileSync(path.join(ROOT, p), v);
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const esc = (s) => String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');

function ensureHtmlMarker(html){
  if (!html.includes('data-v105-seo-keyword-refresh="active"')) {
    html = html.replace(/<html\b([^>]*)>/i, '<html$1 data-v105-seo-keyword-refresh="active">');
  }
  return html;
}
function setTitle(html, title){
  if (/<title>[\s\S]*?<\/title>/i.test(html)) return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  return html.replace('</head>', `  <title>${esc(title)}</title>\n</head>`);
}
function setMeta(html, key, content, attr='name'){
  const pattern = new RegExp(`<meta\\s+${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["'][^>]*>`, 'i');
  const repl = `<meta ${attr}="${key}" content="${esc(content)}">`;
  if (pattern.test(html)) return html.replace(pattern, repl);
  return html.replace('</head>', `  ${repl}\n</head>`);
}
function setCanonical(html, url){
  const repl = `<link rel="canonical" href="${esc(url)}">`;
  if (/<link[^>]+rel=["']canonical["'][^>]*>/i.test(html)) return html.replace(/<link[^>]+rel=["']canonical["'][^>]*>/i, repl);
  return html.replace('</head>', `  ${repl}\n</head>`);
}
function ensureAssets(html, addJs=false){
  if (!html.includes('name="v105-seo-keyword-refresh"')) {
    html = html.replace('</head>', `  <meta name="v105-seo-keyword-refresh" content="${VERSION}">\n</head>`);
  }
  if (!html.includes('/assets/css/v105-seo-keyword-refresh-index-quality.css')) {
    html = html.replace('</head>', `  <link rel="stylesheet" href="${cssHref}" data-v105-seo-keyword-refresh="true">\n</head>`);
  }
  if (addJs && !html.includes('/assets/js/v105-seo-keyword-refresh-index-quality.js')) {
    html = html.replace('</body>', `  <script defer src="${jsHref}" data-v105-seo-keyword-refresh="true"></script>\n</body>`);
  }
  return html;
}
function shortSummary(title, cat=''){
  const t = `${title} ${cat}`;
  if (/보증업체|가입코드|ANY BET|SK|UDT|여왕벌|자쿰|땅콩/.test(t)) return '주소·코드·상담 기준을 빠르게 확인합니다.';
  if (/도메인|주소|IP|ASN|리뉴얼/.test(t)) return '주소 변경·운영 신호·코드 매칭을 확인합니다.';
  if (/슬롯|RTP|프리스핀|잭팟/.test(t)) return 'RTP·변동성·보너스 조건을 짧게 비교합니다.';
  if (/카지노|바카라|에볼루션|프라그마틱/.test(t)) return '롤링·제외게임·출금 조건을 짧게 확인합니다.';
  if (/스포츠|토토|배당|핸디캡|오버언더|KBO|농구|야구/.test(t)) return '배당·라인·정산 기준을 빠르게 확인합니다.';
  if (/미니게임|파워볼|사다리|키노/.test(t)) return '회차·정산·롤링 조건을 빠르게 점검합니다.';
  return '핵심 확인 순서와 실사용 포인트를 정리합니다.';
}

const hubs = {
  'index.html':['RUST | 보증업체·도구·블로그 실사용 허브','88ST.Cloud RUST는 보증업체, 가입코드, 도구 계산기, 블로그 가이드를 한 번에 확인하는 실사용 중심 정보 허브입니다.','https://88st.cloud/'],
  'blog/index.html':['RUST 블로그 | 보증업체·가입코드·도구 실사용 가이드','보증업체, 가입코드, 도메인 변경, 롤링 계산, 슬롯 RTP, 스포츠 체크 글을 목록형으로 빠르게 찾는 RUST 블로그입니다.','https://88st.cloud/blog/'],
  'tools/index.html':['RUST 도구 | 가입코드·보너스·롤링·출금 계산기','가입코드 매칭, 보너스 실수령, 롤링 조건, 출금 체크, 도메인 메모까지 실사용 계산 도구를 한 곳에 정리했습니다.','https://88st.cloud/tools/'],
  'guaranteed/index.html':['RUST 보증업체 | 가입코드·상세보기·공식주소 확인','SK 홀딩스, 자쿰, UDT BET, 여왕벌, 땅콩 BET, ANY BET의 가입코드와 공식주소, 상세 랜딩을 비교합니다.','https://88st.cloud/guaranteed/'],
  'sports-check/index.html':['스포츠 체크 | 배당·핸디캡·오버언더 확인 가이드','스포츠 배당, 핸디캡, 오버언더, 라인 이동과 정산 기준을 빠르게 확인하는 RUST 스포츠 체크 허브입니다.','https://88st.cloud/sports-check/'],
  'search-guides/index.html':['검색 가이드 | 도메인·가입코드·공식 채널 확인법','도메인 변경, 가입코드 매칭, 공식 채널, 보증업체 검색 흐름을 실사용 기준으로 정리한 검색 가이드입니다.','https://88st.cloud/search-guides/'],
  'consult/index.html':['RUST 상담 | 가입코드·공식주소·조건 확인','가입코드, 공식주소, 이벤트 조건, 롤링과 출금 기준이 애매할 때 상담 연결 전 확인할 핵심 정보를 정리합니다.','https://88st.cloud/consult/']
};
for (const [file,[title,desc,canonical]] of Object.entries(hubs)){
  if (!exists(file)) continue;
  let html = read(file);
  html = ensureHtmlMarker(html);
  html = ensureAssets(html, file === 'blog/index.html');
  html = setTitle(html,title);
  html = setMeta(html,'description',desc);
  html = setMeta(html,'og:title',title,'property');
  html = setMeta(html,'og:description',desc,'property');
  html = setCanonical(html,canonical);
  write(file, html);
}

if (exists('blog/index.html')) {
  let blog = read('blog/index.html');
  blog = blog.replace(/<a class="v72-blog-card"[\s\S]*?<\/a>/g, (block) => {
    const title = (block.match(/<strong>([\s\S]*?)<\/strong>/)?.[1] || '').replace(/<[^>]+>/g,'').trim();
    const cat = (block.match(/<span class="v72-blog-card__tag">([\s\S]*?)<\/span>/)?.[1] || '').replace(/<[^>]+>/g,'').trim();
    return block.replace(/<p>[\s\S]*?<\/p>/, `<p>${shortSummary(title, cat)}</p>`);
  });
  if (!blog.includes('data-v105-keyword-buckets')) {
    blog = blog.replace('</div>\n\n        <div class="v72-blog-grid"', `</div>\n          <div class="v105-keyword-buckets" data-v105-keyword-buckets aria-label="주요 키워드 묶음"><span>보증업체</span><span>가입코드</span><span>도메인</span><span>롤링</span><span>슬롯 RTP</span><span>스포츠 체크</span></div>\n\n        <div class="v72-blog-grid"`);
  }
  write('blog/index.html', blog);
}


// Refresh blog detail metadata after older generators run.
function walkHtml(dir, out=[]){
  for (const ent of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, out);
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}
const usedDesc = new Set();
const tones = ['핵심 기준','실사용 체크','조건 확인','위험 신호','정산 포인트','검색 흐름','운영 신호','빠른 비교'];
let detailIdx = 0;
for (const full of walkHtml(path.join(ROOT, 'blog'))) {
  const rel = path.relative(ROOT, full).replaceAll(path.sep,'/');
  if (rel === 'blog/index.html') continue;
  let html = fs.readFileSync(full, 'utf8');
  html = ensureHtmlMarker(html);
  html = ensureAssets(html, false);
  let rawTitle = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || 'RUST 블로그';
  rawTitle = rawTitle.replace(/<[^>]+>/g,'').replace(/\s*\|\s*RUST 블로그\s*$/,'').trim();
  const pageMatch = rel.match(/^blog\/page\/(\d+)\.html$/);
  if (pageMatch) rawTitle = `블로그 전체 게시글 ${pageMatch[1]}페이지`;
  let title = rawTitle.length > 54 ? `${rawTitle.slice(0,51).trim()}…` : rawTitle;
  const slug = rel.toLowerCase();
  let cat = '가이드';
  if (/도메인|주소|ip|asn/.test(rawTitle+slug)) cat = '도메인';
  else if (/슬롯|rtp/.test(rawTitle+slug)) cat = '슬롯';
  else if (/카지노|바카라|evolution|pragmatic/.test(rawTitle+slug)) cat = '카지노';
  else if (/스포츠|토토|kbo|handicap|over-under|배당/.test(rawTitle+slug)) cat = '스포츠';
  else if (/보증|가입코드|anybet|queenbee|sk-holdings|udt|zakum|ddangkong/.test(rawTitle+slug)) cat = '보증업체';
  let desc = pageMatch
    ? `RUST 블로그 ${pageMatch[1]}페이지입니다. 보증업체, 가입코드, 도메인, 카지노·슬롯, 스포츠 체크 글을 목록형으로 빠르게 확인합니다.`
    : `${rawTitle}의 ${tones[detailIdx % tones.length]}을 ${shortSummary(rawTitle, cat)}`;
  if (desc.length < 55) desc += ' 주소, 코드, 조건, 상담 흐름까지 실사용 기준으로 다시 확인합니다.';
  if (desc.length > 155) desc = `${desc.slice(0,152).trim()}…`;
  if (usedDesc.has(desc)) desc = `${rawTitle} 체크 포인트 ${detailIdx+1}: 주소·조건·상담 흐름을 확인합니다.`;
  usedDesc.add(desc);
  let url = `https://88st.cloud/${rel}`;
  if (url.endsWith('/index.html')) url = url.slice(0, -10);
  html = setTitle(html, `${title} | RUST 블로그`);
  html = setMeta(html, 'description', desc);
  html = setMeta(html, 'og:title', `${title} | RUST 블로그`, 'property');
  html = setMeta(html, 'og:description', desc, 'property');
  html = setMeta(html, 'twitter:description', desc);
  html = setMeta(html, 'robots', 'index,follow,max-image-preview:large');
  html = setCanonical(html, url);
  fs.writeFileSync(full, html);
  detailIdx++;
}

for (const r of removed) {
  const dir = path.join(ROOT, r);
  if (fs.existsSync(dir)) fs.rmSync(dir, {recursive:true, force:true});
}
for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
  if (!exists(sm)) continue;
  let data = read(sm);
  for (const r of removed) {
    data = data.split('\n').filter(line => !line.includes(`/${r}/`)).join('\n');
    data = data.replace(new RegExp(`\\s*<url><loc>https://88st\\.cloud/${r}/?</loc>[\\s\\S]*?</url>`, 'g'), '');
  }
  write(sm, data.trim() + '\n');
}
if (exists('robots.txt')) {
  let robots = read('robots.txt');
  for (const dis of ['/analysis/','/faq/','/consult-motives/','/consult-result/','/provider-updates/']) {
    if (!robots.includes(`Disallow: ${dis}`)) robots += `\nDisallow: ${dis}`;
  }
  write('robots.txt', robots.trim() + '\n');
}
write('build.txt', '88ST.Cloud build V105-SEO-KEYWORD-REFRESH-INDEX-QUALITY-20260526\n2026-05-26T00:00:00.000Z\n');
write('assets/js/build.ver.js', "window.__RUST_BUILD_VERSION__ = 'V105-SEO-KEYWORD-REFRESH-INDEX-QUALITY-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V105 SEO KEYWORD REFRESH / INDEX QUALITY PATCH';\n");
console.log('[V105] SEO keyword refresh and index quality markers applied');
