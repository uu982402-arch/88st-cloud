import fs from 'fs';
import path from 'path';
const root = process.cwd();
const p = (...x) => path.join(root, ...x);
const read = f => fs.readFileSync(p(f), 'utf8');
const write = (f, v) => fs.writeFileSync(p(f), v);
const exists = f => fs.existsSync(p(f));
const ensureDir = d => fs.mkdirSync(p(d), { recursive: true });

const VERSION = 'V129_SEO_META_OG_SCHEMA_FINAL_ACTIVE';
const cssHref = '/assets/css/v129-seo-schema-consult-strip.css?v=20260529';
const cssLink = `  <link rel="stylesheet" href="${cssHref}" data-v129-seo-schema="true">`;
const baseUrl = 'https://88st.cloud';
const defaultOg = `${baseUrl}/assets/img/rust/rust-og.jpg`;
const removedRoutes = ['faq','consult-motives','consult-result','provider-updates'];
const htmlFiles = [];
function walk(dir){
  for (const ent of fs.readdirSync(p(dir), { withFileTypes: true })) {
    const rel = path.join(dir, ent.name).replace(/\\/g, '/');
    if (removedRoutes.some(r => rel === r || rel.startsWith(r + '/'))) continue;
    if (ent.isDirectory()) walk(rel);
    else if (ent.isFile() && rel.endsWith('.html')) htmlFiles.push(rel);
  }
}
walk('.');

function routeFromFile(file){
  let route = file.replace(/\\/g, '/');
  if (route === 'index.html') return '/';
  if (route.endsWith('/index.html')) return '/' + route.slice(0, -'index.html'.length);
  return '/' + route;
}
function absUrl(file){ return baseUrl + routeFromFile(file); }
function textFrom(html, selectorTag){
  const re = new RegExp(`<${selectorTag}[^>]*>([\\s\\S]*?)<\\/${selectorTag}>`, 'i');
  const m = html.match(re);
  return m ? cleanText(m[1]) : '';
}
function cleanText(s){ return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim(); }
function escapeAttr(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function titleFor(file, html){
  const route = routeFromFile(file);
  const custom = {
    '/': 'RUST by 88ST | 보증업체·도구·검색가이드 실사용 허브',
    '/blog/': 'RUST 블로그 | 주소·가입코드·조건 확인 가이드',
    '/tools/': 'RUST 도구 | 보너스·롤링·배당 계산 도구',
    '/guaranteed/': 'RUST 보증업체 | 공식주소·가입코드 확인',
    '/sports-check/': 'RUST 스포츠 체크 | 배당·라인·변수 확인',
    '/search-guides/': 'RUST 검색가이드 | 도메인·코드·조건 확인',
    '/consult/': 'RUST 상담 연결 | 공식 상담봇 안내',
    '/ops/': 'RUST OPS | 배포·SEO·모바일 점검 센터'
  };
  if (custom[route]) return custom[route];
  let current = textFrom(html, 'title');
  if (current && current.length <= 72 && !/RUST QUICK CHECK/i.test(current)) return current;
  let h1 = textFrom(html, 'h1') || textFrom(html, 'h2') || 'RUST 실사용 가이드';
  return h1.includes('RUST') ? h1 : `${h1} | RUST by 88ST`;
}
function descFor(file, html){
  const route = routeFromFile(file);
  const custom = {
    '/': '보증업체, 공식주소, 가입코드, 스포츠 체크, 계산 도구를 모바일 기준으로 빠르게 확인하는 RUST 실사용 허브입니다.',
    '/blog/': '주소 변경, 가입코드, 롤링 조건, 스포츠·카지노·미니게임 확인 루트를 실사용 기준으로 정리한 블로그입니다.',
    '/tools/': '보너스 실수령, 롤링 조건, 공식주소, 가입코드, 스포츠 배당을 한 화면에서 계산하고 복사하는 실사용 도구 모음입니다.',
    '/guaranteed/': '6개 보증업체의 카드 이미지, 공식주소, 가입코드, 핵심 혜택을 간결하게 확인하는 보증업체 허브입니다.',
    '/sports-check/': 'KBO, 축구, 농구, 배구 등 스포츠 체크에서 배당·라인·변수·주의사항을 짧게 확인하는 허브입니다.',
    '/search-guides/': '도메인, 가입코드, 공식주소, 정산, 게임 조건을 검색 목적별로 정리한 확인 가이드입니다.',
    '/consult/': '공식 상담봇으로 주소, 가입코드, 이벤트 조건, 롤링 계산 확인 흐름을 빠르게 정리합니다.',
    '/ops/': 'RUST 사이트의 배포 상태, 라우트, SEO, 모바일, 자산 점검 결과를 확인하는 운영 점검 페이지입니다.'
  };
  if (custom[route]) return custom[route];
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i) || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["'][^>]*>/i);
  let d = m ? cleanText(m[1]) : '';
  if (!d || d.length < 48) {
    const h1 = textFrom(html, 'h1') || textFrom(html, 'h2') || 'RUST';
    d = `${h1}의 핵심 확인 순서, 주소·코드·조건 체크 포인트를 모바일 기준으로 짧게 정리했습니다.`;
  }
  if (d.length > 155) d = d.slice(0, 152).replace(/\s+\S*$/,'') + '…';
  return d;
}
function pageType(file){
  const r = routeFromFile(file);
  if (r === '/') return 'WebSite';
  if (r.startsWith('/blog/') && r !== '/blog/') return 'Article';
  return 'WebPage';
}
function breadcrumbItems(file){
  const route = routeFromFile(file);
  const parts = route.split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: '메인', item: baseUrl + '/' }];
  let acc = '';
  const labels = { blog:'블로그', tools:'도구', guaranteed:'보증업체', 'sports-check':'스포츠 체크', 'search-guides':'검색가이드', consult:'상담', ops:'운영 점검' };
  parts.forEach((part, idx) => {
    acc += '/' + part;
    const name = labels[part] || decodeURIComponent(part).replace(/[-_]+/g,' ').replace(/\.html$/,'');
    items.push({ '@type': 'ListItem', position: idx + 2, name, item: baseUrl + acc + (part.endsWith('.html') ? '' : '/') });
  });
  return items;
}
function ldJson(file, title, desc){
  const type = pageType(file);
  const url = absUrl(file);
  const graph = [
    { '@type': 'Organization', '@id': `${baseUrl}/#organization`, name: 'RUST by 88ST', url: baseUrl + '/', logo: `${baseUrl}/assets/img/rust/rust-crest-192.png` },
    { '@type': 'WebSite', '@id': `${baseUrl}/#website`, url: baseUrl + '/', name: 'RUST by 88ST', inLanguage: 'ko-KR', publisher: { '@id': `${baseUrl}/#organization` }, potentialAction: { '@type':'SearchAction', target: `${baseUrl}/search-guides/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: breadcrumbItems(file) },
    { '@type': type, '@id': `${url}#webpage`, url, name: title, description: desc, inLanguage: 'ko-KR', isPartOf: { '@id': `${baseUrl}/#website` }, breadcrumb: { '@id': `${url}#breadcrumb` }, primaryImageOfPage: { '@type':'ImageObject', url: defaultOg } }
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}
function removeMetaByPattern(html, patterns){
  for (const pat of patterns) html = html.replace(pat, '');
  return html;
}
function ensureHeadMeta(html, file){
  const title = titleFor(file, html);
  const desc = descFor(file, html);
  const url = absUrl(file);
  html = html.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  if (/<title>[\s\S]*?<\/title>/i.test(html)) html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  else html = html.replace('</head>', `  <title>${escapeHtml(title)}</title>\n</head>`);
  html = removeMetaByPattern(html, [
    /\s*<meta\s+name=["']description["'][^>]*>\s*/gi,
    /\s*<meta\s+property=["']og:title["'][^>]*>\s*/gi,
    /\s*<meta\s+property=["']og:description["'][^>]*>\s*/gi,
    /\s*<meta\s+property=["']og:url["'][^>]*>\s*/gi,
    /\s*<meta\s+property=["']og:image["'][^>]*>\s*/gi,
    /\s*<meta\s+property=["']og:image:width["'][^>]*>\s*/gi,
    /\s*<meta\s+property=["']og:image:height["'][^>]*>\s*/gi,
    /\s*<meta\s+name=["']twitter:title["'][^>]*>\s*/gi,
    /\s*<meta\s+name=["']twitter:description["'][^>]*>\s*/gi,
    /\s*<meta\s+name=["']twitter:image["'][^>]*>\s*/gi,
    /\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi,
    /\s*<script\s+type=["']application\/ld\+json["']\s+data-v129-schema=["']true["'][\s\S]*?<\/script>\s*/gi
  ]);
  const block = `  <meta name="description" content="${escapeAttr(desc)}">\n  <link rel="canonical" href="${url}">\n  <meta property="og:url" content="${url}">\n  <meta property="og:title" content="${escapeAttr(title)}">\n  <meta property="og:description" content="${escapeAttr(desc)}">\n  <meta property="og:image" content="${defaultOg}">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta name="twitter:title" content="${escapeAttr(title)}">\n  <meta name="twitter:description" content="${escapeAttr(desc)}">\n  <meta name="twitter:image" content="${defaultOg}">\n  <script type="application/ld+json" data-v129-schema="true">${ldJson(file, title, desc)}</script>`;
  const titleTag = html.match(/<title>[\s\S]*?<\/title>/i)?.[0];
  if (titleTag) html = html.replace(titleTag, titleTag + '\n' + block);
  else html = html.replace('</head>', block + '\n</head>');
  return { html, title, desc, url };
}
function ensureV129Markers(html){
  if (!/<html[^>]*data-v129-seo-schema="active"/i.test(html)) html = html.replace(/<html(\s[^>]*)?>/i, m => m.replace('<html', '<html data-v129-seo-schema="active"'));
  if (!/<body[^>]*data-v129-seo-schema="true"/i.test(html)) html = html.replace(/<body(\s[^>]*)?>/i, m => m.replace('<body', '<body data-v129-seo-schema="true"'));
  if (!html.includes(VERSION)) html = html.replace('</head>', `  <meta name="v129-seo-meta-og-schema-final" content="${VERSION}">\n</head>`);
  if (!html.includes('v129-seo-schema-consult-strip.css')) {
    if (html.includes('v128-performance-asset-lightweight.css')) html = html.replace(/\s*<link[^>]+v128-performance-asset-lightweight\.css[^>]*>\s*/i, m => `${m}\n${cssLink}\n`);
    else html = html.replace('</head>', `${cssLink}\n</head>`);
  }
  return html;
}
function replaceIndexConsult(html){
  const strip = `      <section class="v129-consult-strip v71-shell" aria-label="공식 상담봇 바로가기" data-v129-consult-strip="true">\n        <a class="v129-consult-card" href="https://t.me/TRS999_bot" rel="nofollow noopener" target="_blank" data-ga4-event="consult_click">\n          <span class="v129-consult-dot" aria-hidden="true"></span>\n          <strong>공식 상담봇</strong>\n          <span>@TRS999_bot 열기</span>\n        </a>\n      </section>`;
  html = html.replace(/\s*<section[^>]*data-v126-consult-polish="true"[\s\S]*?<\/section>/i, '\n' + strip);
  html = html.replace(/\s*<a[^>]*class=["']v71-fab["'][\s\S]*?<\/a>\s*/gi, '');
  return html;
}
function addOpsPanel(html){
  if (!html.includes('id="v129-seo-center"')) {
    const panel = `\n      <!-- V129 SEO / OG / STRUCTURED DATA START -->\n      <section class="v129-ops-seo-panel" id="v129-seo-center" data-v129-ops-seo="true" aria-label="V129 SEO 점검">\n        <div>\n          <span class="v129-ops-kicker">V129 SEO</span>\n          <h2>메타 · OG · 구조화 데이터 최종 점검</h2>\n          <p>canonical, OG URL, Twitter 카드, BreadcrumbList, WebPage 스키마를 핵심 페이지 기준으로 재정리했습니다.</p>\n        </div>\n        <div class="v129-ops-grid"><span>canonical</span><span>open graph</span><span>schema.org</span><span>no bottom links</span></div>\n      </section>\n      <!-- V129 SEO / OG / STRUCTURED DATA END -->\n`;
    html = html.replace('</main>', panel + '\n</main>');
  }
  html = html.replace(/RUST OPS \| V128 성능·자산 점검 센터/g, 'RUST OPS | V129 SEO·OG·스키마 점검 센터');
  html = html.replace(/V128 PERFORMANCE LOCK ONLINE/g, 'V129 SEO SCHEMA LOCK ONLINE');
  return html;
}

const seoAudit = [];
let changedHtml = 0;
for (const file of htmlFiles) {
  let html = read(file);
  const before = html;
  if (file === 'index.html') html = replaceIndexConsult(html);
  if (file === 'ops/index.html') html = addOpsPanel(html);
  html = ensureV129Markers(html);
  const meta = ensureHeadMeta(html, file);
  html = meta.html;
  if (html !== before) { write(file, html); changedHtml++; }
  if (['index.html','blog/index.html','tools/index.html','guaranteed/index.html','sports-check/index.html','search-guides/index.html','consult/index.html','ops/index.html'].includes(file) || file.startsWith('guaranteed/')) {
    seoAudit.push({ file, route: routeFromFile(file), title: meta.title, description_length: meta.desc.length, canonical: meta.url, schema: pageType(file) });
  }
}

const css = `/* V129 SEO META / OG / SCHEMA FINAL + COMPACT CONSULT STRIP\n * 목표: 메타/OG/schema 최종 정리, 메인 하단 상담봇 배너 초압축.\n * 원칙: 하단 관련 링크/추천 카드 재생성 금지. 긴 상담 문구 금지.\n */\nhtml[data-v129-seo-schema="active"] .v126-consult-section{display:none!important}\n.v129-consult-strip{margin:10px auto 16px!important;padding:0!important}\n.v129-consult-card{display:flex;align-items:center;justify-content:center;gap:10px;min-height:54px;padding:11px 18px;border:1px solid rgba(202,138,4,.22);border-radius:20px;background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(248,250,252,.78));box-shadow:0 14px 34px rgba(15,23,42,.08);color:#0f172a;text-decoration:none;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}\n.v129-consult-card:hover{transform:translateY(-1px);box-shadow:0 18px 38px rgba(15,23,42,.12);border-color:rgba(202,138,4,.36)}\n.v129-consult-dot{width:9px;height:9px;border-radius:999px;background:#f59e0b;box-shadow:0 0 0 5px rgba(245,158,11,.13)}\n.v129-consult-card strong{font-size:15px;font-weight:900;letter-spacing:-.03em}\n.v129-consult-card span:last-child{font-size:13px;font-weight:800;color:#334155}\n@media(max-width:760px){.v129-consult-strip{margin:8px auto 12px!important}.v129-consult-card{min-height:48px;padding:10px 13px;border-radius:16px;justify-content:space-between}.v129-consult-card strong{font-size:14px}.v129-consult-card span:last-child{font-size:12px}}\n.v129-ops-seo-panel{margin:18px 0;padding:18px;border:1px solid rgba(148,163,184,.20);border-radius:24px;background:linear-gradient(135deg,rgba(15,23,42,.92),rgba(30,41,59,.72));box-shadow:0 18px 40px rgba(2,6,23,.22)}\n.v129-ops-kicker{display:inline-flex;margin-bottom:8px;padding:5px 9px;border-radius:999px;background:rgba(59,130,246,.12);border:1px solid rgba(147,197,253,.24);color:#bfdbfe;font-size:11px;font-weight:900;letter-spacing:.08em}\n.v129-ops-seo-panel h2{margin:0;color:#fff;font-size:clamp(20px,2.4vw,30px);letter-spacing:-.045em}.v129-ops-seo-panel p{margin:8px 0 0;color:rgba(226,236,248,.8);line-height:1.6}.v129-ops-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:14px}.v129-ops-grid span{display:flex;align-items:center;justify-content:center;min-height:38px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);color:#e2e8f0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.03em}@media(max-width:760px){.v129-ops-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}\n`;
write('assets/css/v129-seo-schema-consult-strip.css', css);

ensureDir('reports');
write('reports/v129-seo-schema-audit.json', JSON.stringify({ version:'V129', generated_at:new Date().toISOString(), html_files:htmlFiles.length, changed_html:changedHtml, checked:seoAudit }, null, 2));
write('reports/v129-remove-candidates.txt', ['V129 REMOVE CANDIDATES / NOTES','- 실제 삭제 파일 없음.','- 메인 하단 상담봇 긴 문구는 압축 스트립으로 교체.','- 하단 관련/추천 섹션 재생성 금지 유지.','- RUST QUICK CHECK 재생성 금지 유지.'].join('\n'));
write('V129_PATCH_MANIFEST.json', JSON.stringify({ version:'V129 SEO META OG SCHEMA FINAL', base:'V128 FULL', changed_html:changedHtml, added:['assets/css/v129-seo-schema-consult-strip.css','scripts/generate-v129-seo-meta-og-schema-final.mjs','scripts/verify-v129-seo-meta-og-schema-final.mjs','reports/v129-seo-schema-audit.json','reports/v129-remove-candidates.txt','V129_UPGRADE_REPORT.md'], deleted:[] }, null, 2));
write('V129_UPGRADE_REPORT.md', `# V129 SEO META / OG / STRUCTURED DATA FINAL\n\n- Base: V128 FULL\n- 메인 하단 상담봇 섹션을 긴 문구 없는 압축 스트립으로 교체했습니다.\n- canonical, OG URL/title/description/image, Twitter 카드, JSON-LD BreadcrumbList/WebPage를 재정리했습니다.\n- 하단 관련 섹션, RUST QUICK CHECK, 제거 확정 4개 경로 재생성 금지를 유지했습니다.\n- 삭제 파일: 0개\n`);

const pkgPath = 'package.json';
const pkg = JSON.parse(read(pkgPath));
pkg.scripts = pkg.scripts || {};
pkg.scripts['quality:v129'] = 'node scripts/generate-v129-seo-meta-og-schema-final.mjs';
pkg.scripts['verify:v129'] = 'node scripts/verify-v129-seo-meta-og-schema-final.mjs';
pkg.scripts.verify = 'node scripts/verify-v129-seo-meta-og-schema-final.mjs';
if (!pkg.scripts.build.includes('generate-v129-seo-meta-og-schema-final.mjs')) pkg.scripts.build += ' && node scripts/generate-v129-seo-meta-og-schema-final.mjs';
write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`V129 generated: ${changedHtml} HTML files updated, SEO audit rows: ${seoAudit.length}`);
