import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATE = '2026-05-26';
const VERSION = 'V99_BLOG_INDEX_SEO_QUALITY_ACTIVE';
const BUILD_ID = 'V99-BLOG-INDEX-SEO-QUALITY-20260526';
const SITE = 'https://88st.cloud';
const report = { version: BUILD_ID, date: DATE, blogFiles: 0, hubCards: 0, sitemapUrls: 0, brokenBlogLinks: [], duplicateTitles: [], duplicateDescriptions: [], shortBodyCandidates: [], noindexBlogFixed: 0 };

const SKIP_DIRS = new Set(['node_modules','.git','.wrangler']);
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, data) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), data); };
const esc = (s='') => String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const textEsc = (s='') => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const stripTags = (s='') => String(s).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();

function walk(dir='.') {
  const out = [];
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const rel = path.posix.join(dir, ent.name).replace(/^\.\//,'');
    if (ent.isDirectory()) out.push(...walk(rel));
    else if (ent.isFile()) out.push(rel);
  }
  return out;
}

function urlForFile(file) {
  let p = file.replace(/\\/g,'/').replace(/^\.\//,'');
  if (p === 'index.html') return `${SITE}/`;
  if (p.endsWith('/index.html')) p = p.slice(0, -'index.html'.length);
  return `${SITE}/${p}`;
}
function localForHref(href) {
  let p = String(href || '').split('#')[0].split('?')[0];
  if (!p.startsWith('/')) return null;
  p = p.slice(1);
  if (!p) return 'index.html';
  if (p.endsWith('/')) return `${p}index.html`;
  return p;
}
function setMeta(html, name, content) {
  const tag = `<meta name="${name}" content="${esc(content)}">`;
  const re = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i');
  return re.test(html) ? html.replace(re, tag) : html.replace(/<head[^>]*>/i, m => `${m}\n  ${tag}`);
}
function setOg(html, prop, content) {
  const tag = `<meta property="${prop}" content="${esc(content)}">`;
  const re = new RegExp(`<meta\\s+property=["']${prop}["'][^>]*>`, 'i');
  return re.test(html) ? html.replace(re, tag) : html.replace(/<head[^>]*>/i, m => `${m}\n  ${tag}`);
}
function setTitle(html, title) {
  const tag = `<title>${textEsc(title)}</title>`;
  return /<title>[\s\S]*?<\/title>/i.test(html) ? html.replace(/<title>[\s\S]*?<\/title>/i, tag) : html.replace(/<head[^>]*>/i, m => `${m}\n  ${tag}`);
}
function setCanonical(html, file) {
  const tag = `<link rel="canonical" href="${urlForFile(file)}">`;
  return /<link\s+rel=["']canonical["'][^>]*>/i.test(html) ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, tag) : html.replace(/<head[^>]*>/i, m => `${m}\n  ${tag}`);
}
function ensureMarker(html) {
  const marker = `<meta name="v99-blog-index-seo-quality" content="${VERSION}">`;
  return html.includes('name="v99-blog-index-seo-quality"') ? html.replace(/<meta\s+name=["']v99-blog-index-seo-quality["'][^>]*>/i, marker) : html.replace(/<head[^>]*>/i, m => `${m}\n  ${marker}`);
}
function getH1(html) {
  const m = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? stripTags(m[1]) : '';
}
function getTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? stripTags(m[1]).replace(/\s*\|\s*(RUST|88ST\.Cloud|88ST).*$/i,'').trim() : '';
}
function getMetaDescription(html) {
  const m = html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return m ? m[1].trim() : '';
}
function getCategory(html) {
  const tag = html.match(/<span[^>]*class=["'][^"']*(?:tag|meta|category)[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  if (tag) return stripTags(tag[1]).split('·')[0].trim();
  const data = html.match(/data-category=["']([^"']+)["']/i);
  return data ? data[1].trim() : '';
}
function cleanKorean(s='') {
  return String(s)
    .replace(/\s+/g,' ')
    .replace(/기준 기준/g,'기준')
    .replace(/체크할 체크/g,'체크할')
    .replace(/혜택를/g,'혜택을')
    .replace(/조건를/g,'조건을')
    .replace(/계산법를/g,'계산법을')
    .replace(/기대값를/g,'기대값을')
    .replace(/확인를/g,'확인을')
    .replace(/목록를/g,'목록을')
    .replace(/이벤트를 조건표/g,'이벤트를 조건표')
    .replace(/정리한 88ST\.Cloud 전문 정보 문서입니다\.?/g,'정리했습니다.')
    .replace(/RUST가 .*?검색 유입자를 위해 정리한 2차 SEO 롱폼 가이드입니다\.?/g,'실사용 확인 순서와 조건표 중심으로 정리했습니다.')
    .replace(/수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로/g,'공개 지표와 약관 기준으로')
    .replace(/\s+([,.!?])/g,'$1')
    .trim();
}
function summaryFor(title, category='') {
  const t = cleanKorean(title || '블로그 글');
  const cat = cleanKorean(category || '');
  let s;
  if (/주소|도메인|공식|리뉴얼|변경/.test(t)) s = `${t}는 공식주소, 코드 일치, 리뉴얼 흔적, 상담 채널을 순서대로 확인하는 글입니다.`;
  else if (/가입코드|코드/.test(t)) s = `${t}는 가입코드 입력 위치, 대소문자, 공식 안내와 도메인 매칭을 빠르게 확인하는 글입니다.`;
  else if (/롤링|실수령|보너스|첫충|매충|페이백|쿠폰|콤프|입플|이벤트|정산/.test(t)) s = `${t}는 혜택률보다 롤링, 제외 게임, 최대 지급, 실수령 조건을 먼저 보는 기준을 정리합니다.`;
  else if (/스포츠|축구|KBO|야구|농구|배구|핸디캡|오버언더|배당|EV|프로토|파워볼|사다리/.test(t)) s = `${t}는 배당, 라인 이동, 정산 기준, 손실 한도를 함께 확인하는 스포츠 체크 글입니다.`;
  else if (/슬롯|RTP|프라그마틱|노리밋|카지노|바카라|에볼루션/.test(t)) s = `${t}는 게임 조건, RTP·변동성, 보너스 적용 범위와 제한 항목을 실사용 기준으로 정리합니다.`;
  else if (/보증업체|먹튀|검증|신뢰/.test(t) || /보증/.test(cat)) s = `${t}는 운영 신호, 공식 연결, 조건표, 상담 흐름을 비교해 판단하는 보증업체 체크 글입니다.`;
  else s = `${t}는 검색 전에 확인할 핵심 조건, 비교 순서, 실사용 체크 포인트를 짧게 정리한 글입니다.`;
  s = cleanKorean(s);
  if (s.length > 155) s = s.slice(0, 152).replace(/\s+\S*$/,'') + '…';
  return s;
}
function cleanVisibleText(html) {
  let s = html;
  s = s.replace(/<p class="meta-desc-inline">[\s\S]*?<\/p>/gi, '');
  s = s.replace(/<aside class="v70-2-related"[\s\S]*?<\/aside>/gi, '');
  s = s.replace(/<h2>\s*8\.\s*반복 문단 제거와 고유성 확인\s*<\/h2>[\s\S]*?(?=<h2>\s*9\.\s*운영 관점의 최종 요약\s*<\/h2>)/gi, '');
  s = s.replace(/<p>V48 문서는[\s\S]*?<\/p>/gi, '');
  s = s.replace(/<p>고유성 검사는[\s\S]*?<\/p>/gi, '');
  s = s.replace(/SEO 메타 디스크립션/g, '핵심 요약');
  s = s.replace(/RUST가 ([^<.]{0,80})검색 유입자를 위해 정리한 2차 SEO 롱폼 가이드입니다\.?/g, '실사용 확인 순서와 조건표 중심으로 정리했습니다.');
  s = s.replace(/정리한 88ST\.Cloud 전문 정보 문서입니다\.?/g, '정리했습니다.');
  s = s.replace(/수식·공개 지표·약관 독해/g, '공개 지표·약관 확인');
  s = cleanKorean(s);
  return s;
}
function ensureBlogInlineStyle(html) {
  const style = `<style data-v99-blog-index-seo-quality="true">
.v72-blog-control{gap:12px;align-items:flex-start}.v72-blog-status{display:flex;flex-wrap:wrap;gap:8px}.v99-blog-tier{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);border-radius:999px;padding:6px 10px;font-size:12px;color:#dbe7ff}.v72-blog-grid{width:100%;max-width:100%;min-width:0;grid-template-columns:repeat(auto-fit,minmax(min(100%,245px),1fr));gap:14px}.v72-blog-card{min-width:0;max-width:100%;height:100%;min-height:176px;display:flex;flex-direction:column;justify-content:space-between}.v72-blog-card strong{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.35}.v72-blog-card p{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;line-height:1.55}.v72-blog-card__body{min-width:0}.v72-blog-card__meta{margin-top:auto}@media(max-width:760px){.v72-blog-direct{overflow-x:clip}.v72-blog-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.v72-blog-card{min-height:188px}.v72-blog-card p{-webkit-line-clamp:3;font-size:12.5px}.v72-blog-card strong{font-size:14px}.v72-blog-card__views{font-size:11px}}@media(max-width:360px){.v72-blog-grid{grid-template-columns:1fr}.v72-blog-card{min-height:auto}}
</style>`;
  if (html.includes('data-v99-blog-index-seo-quality="true"')) return html.replace(/<style data-v99-blog-index-seo-quality="true">[\s\S]*?<\/style>/i, style);
  return html.replace(/<\/head>/i, `  ${style}\n</head>`);
}
function tierForRank(n) {
  if (n <= 10) return '인기글';
  if (n <= 30) return '핵심글';
  return '최신글';
}
function processBlogHub() {
  const file = 'blog/index.html';
  if (!exists(file)) return;
  let html = read(file);
  html = ensureMarker(html);
  html = setTitle(html, 'RUST 블로그 | 핵심글·최신글·인기글 SEO 가이드');
  const desc = 'RUST 블로그는 보증업체, 가입코드, 롤링, 스포츠 체크, 카지노·슬롯 조건을 핵심글·최신글·인기글로 나눠 빠르게 확인하는 정보 허브입니다.';
  html = setMeta(html, 'description', desc);
  html = setMeta(html, 'keywords', 'RUST 블로그, 보증업체, 가입코드, 롤링 조건, 스포츠 체크, 카지노 입플, 슬롯 RTP, 검색 가이드');
  html = setMeta(html, 'robots', 'index,follow,max-image-preview:large');
  html = setOg(html, 'og:title', 'RUST 블로그 | 핵심글·최신글·인기글 SEO 가이드');
  html = setOg(html, 'og:description', desc);
  html = setOg(html, 'og:url', `${SITE}/blog/`);
  html = setCanonical(html, file);
  html = html.replace(/인기순 총 \d+개 \/ 페이지당 50개/g, '인기글 · 핵심글 · 최신글 50개');
  html = html.replace(/총 \d+개 \/ 페이지당 50개/g, '인기글 · 핵심글 · 최신글 50개');
  html = html.replace(/핵심 글 50개 우선 노출/g, '인기글 · 핵심글 · 최신글 50개');
  html = html.replace(/<span class="v72-chip">보증 · 카지노 · 스포츠 · 슬롯 · 미니게임<\/span>/, '<span class="v99-blog-tier">핵심글</span><span class="v99-blog-tier">최신글</span><span class="v99-blog-tier">인기글</span>');
  let rank = 0;
  html = html.replace(/(<a class="v72-blog-card"[^>]*data-title="([^"]*)"[^>]*data-category="([^"]*)"[^>]*>)([\s\S]*?)(<\/a>)/g, (all, open, title, category, inner, close) => {
    rank += 1;
    const cleanTitle = cleanKorean(title);
    const tier = tierForRank(rank);
    let next = open.replace(/data-v99-tier="[^"]*"/,'').replace(/>$/, ` data-v99-tier="${tier}">`);
    inner = inner.replace(/<span class="v72-blog-card__tag">[\s\S]*?<\/span>/, `<span class="v72-blog-card__tag">${textEsc(category || tier)}</span><span class="v99-blog-tier">${tier}</span>`);
    inner = inner.replace(/<strong>[\s\S]*?<\/strong>/, `<strong>${textEsc(cleanTitle)}</strong>`);
    inner = inner.replace(/<p>[\s\S]*?<\/p>/, `<p>${textEsc(summaryFor(cleanTitle, category))}</p>`);
    return next + inner + close;
  });
  report.hubCards = rank;
  html = ensureBlogInlineStyle(html);
  write(file, html);
}
function processBlogPage(file) {
  let html = read(file);
  const beforeNoindex = /<meta\s+name=["']robots["'][^>]*noindex/i.test(html);
  html = cleanVisibleText(html);
  html = ensureMarker(html);
  let title = cleanKorean(getH1(html) || getTitle(html) || path.basename(file, '.html'));
  const pageMatch = file.match(/^blog\/page\/(\d+)\.html$/);
  if (pageMatch && /^(전체 게시글|보존 페이지|RUST 블로그 가이드)$/i.test(title)) title = `블로그 전체 글 ${pageMatch[1]}페이지`;
  if (!title || title.length < 4) title = 'RUST 블로그 가이드';
  title = title.replace(/\s*\|\s*(RUST|88ST).*$/i,'').trim();
  const category = getCategory(html);
  let desc = summaryFor(title, category);
  if (pageMatch) desc = `RUST 블로그 ${pageMatch[1]}페이지는 보증업체, 스포츠 체크, 카지노·슬롯 조건 글을 이어서 탐색하는 목록 페이지입니다.`;
  html = setTitle(html, `${title} | RUST 블로그`);
  html = setMeta(html, 'description', desc);
  html = setMeta(html, 'robots', 'index,follow,max-image-preview:large');
  html = setOg(html, 'og:title', `${title} | RUST 블로그`);
  html = setOg(html, 'og:description', desc);
  html = setOg(html, 'og:url', urlForFile(file));
  html = setCanonical(html, file);
  if (beforeNoindex) report.noindexBlogFixed += 1;
  // Keep decorative empty alt inside brand marks, but add alt for any missing content image.
  html = html.replace(/<img\b(?![^>]*\salt=)([^>]*)>/gi, (tag, rest) => {
    if (/rust-crest|logo|brand-mark/i.test(tag)) return tag.replace(/>$/, ' alt="">');
    return tag.replace(/>$/, ` alt="${esc(title)} 이미지">`);
  });
  write(file, html);
}
function ensureRobots() {
  let s = exists('robots.txt') ? read('robots.txt') : 'User-agent: *\nAllow: /\nSitemap: https://88st.cloud/sitemap.xml\n';
  const rules = ['Disallow: /admin/','Disallow: /ops/','Disallow: /api/','Disallow: /analysis/'];
  if (!/^User-agent:\s*\*/mi.test(s)) s = `User-agent: *\n${s}`;
  for (const r of rules) if (!s.includes(r)) s = s.replace(/User-agent:\s*\*\s*/i, m => `${m}${r}\n`);
  if (!s.includes('Sitemap: https://88st.cloud/sitemap.xml')) s = s.trimEnd() + '\nSitemap: https://88st.cloud/sitemap.xml\n';
  write('robots.txt', s.trimEnd() + '\n');
}
function generateSitemap() {
  const htmlFiles = walk('.').filter(f => f.endsWith('.html'));
  const urls = [];
  for (const f of htmlFiles) {
    const rel = f.replace(/\\/g,'/');
    if (rel.startsWith('admin/') || rel.startsWith('ops/') || rel.startsWith('analysis/')) continue;
    const html = read(rel);
    if (/<meta\s+name=["']robots["'][^>]*noindex/i.test(html)) continue;
    urls.push(urlForFile(rel));
  }
  urls.sort((a,b)=>{
    const ab = a.includes('/blog/') ? 0 : 1;
    const bb = b.includes('/blog/') ? 0 : 1;
    return ab - bb || a.localeCompare(b);
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc><lastmod>${DATE}</lastmod><changefreq>${u.includes('/blog/') ? 'weekly' : 'monthly'}</changefreq><priority>${u === SITE + '/' ? '1.0' : u.includes('/blog/') ? '0.7' : '0.6'}</priority></url>`).join('\n')}\n</urlset>\n`;
  write('sitemap.xml', xml);
  write('sitemap.txt', urls.join('\n') + '\n');
  if (exists('serverless')) write('serverless/sitemap.xml', xml);
  report.sitemapUrls = urls.length;
}
function updatePackage() {
  const pkg = JSON.parse(read('package.json'));
  pkg.scripts ||= {};
  if (!pkg.scripts.build.includes('generate-v99-blog-index-seo-quality.mjs')) pkg.scripts.build += ' && node scripts/generate-v99-blog-index-seo-quality.mjs';
  pkg.scripts['quality:v99'] = 'node scripts/generate-v99-blog-index-seo-quality.mjs';
  pkg.scripts['verify:v99'] = 'node scripts/verify-v99-blog-index-seo-quality.mjs';
  pkg.scripts.verify = 'node scripts/verify-v99-blog-index-seo-quality.mjs';
  write('package.json', JSON.stringify(pkg, null, 2) + '\n');
}
function auditBlog() {
  const blogFiles = walk('blog').filter(f => f.endsWith('.html'));
  report.blogFiles = blogFiles.length;
  const titles = new Map();
  const descs = new Map();
  for (const f of blogFiles) {
    const html = read(f);
    const title = getTitle(html);
    const desc = getMetaDescription(html);
    const words = stripTags(html).split(/\s+/).filter(Boolean).length;
    if (words < 180) report.shortBodyCandidates.push(f);
    if (title) titles.set(title, [...(titles.get(title)||[]), f]);
    if (desc) descs.set(desc, [...(descs.get(desc)||[]), f]);
  }
  report.duplicateTitles = [...titles.entries()].filter(([,v])=>v.length>1).map(([k,v])=>({title:k, files:v})).slice(0,20);
  report.duplicateDescriptions = [...descs.entries()].filter(([,v])=>v.length>1).map(([k,v])=>({description:k, files:v})).slice(0,20);
  const hub = exists('blog/index.html') ? read('blog/index.html') : '';
  const hrefs = [...hub.matchAll(/<a\s+[^>]*href="([^"]+)"/g)].map(m=>m[1]).filter(h => h.startsWith('/blog/'));
  for (const href of hrefs) {
    const local = localForHref(href);
    if (local && !exists(local)) report.brokenBlogLinks.push(href);
  }
}

processBlogHub();
for (const file of walk('blog').filter(f => f.endsWith('.html') && f !== 'blog/index.html')) processBlogPage(file);
ensureRobots();
generateSitemap();
updatePackage();
auditBlog();
write('scripts/v99-blog-index-seo-quality-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(`[V99] blog index/seo quality generated: blog=${report.blogFiles}, hubCards=${report.hubCards}, sitemap=${report.sitemapUrls}, broken=${report.brokenBlogLinks.length}`);
