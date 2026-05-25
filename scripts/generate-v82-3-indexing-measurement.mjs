import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v82-3-indexing-measurement-20260525';
const MARKER = 'V82_3_INDEXING_MEASUREMENT_ACTIVE';
const GA_ID = 'G-KWT87FBY6S';
const CSS_HREF = `/assets/css/v82-3-indexing-ops.css?v=${VERSION}`;
const JS_HREF = `/assets/js/v82-3-indexing-ops.js?v=${VERSION}`;
const DATA_HREF = '/assets/data/v82-3-indexing-targets.json';

const GA_EVENTS = [
  'consult_click',
  'vendor_copy_code',
  'vendor_outbound_click',
  'tool_open',
  'blog_card_click',
  'sports_check_click',
  'search_guide_click',
  'carousel_card_click',
  'ops_indexing_copy'
];

const CORE_URLS = [
  'https://88st.cloud/',
  'https://88st.cloud/blog/',
  'https://88st.cloud/tools/',
  'https://88st.cloud/guaranteed/',
  'https://88st.cloud/consult/',
  'https://88st.cloud/sports-check/',
  'https://88st.cloud/search-guides/'
];

const NOINDEX_EXPECTED = [
  'https://88st.cloud/ops/',
  'https://88st.cloud/admin/'
];

function file(...parts) {
  return path.join(ROOT, ...parts);
}

function exists(rel) {
  return fs.existsSync(file(rel));
}

function read(rel) {
  return fs.readFileSync(file(rel), 'utf8');
}

function write(rel, text) {
  fs.mkdirSync(path.dirname(file(rel)), { recursive: true });
  fs.writeFileSync(file(rel), text, 'utf8');
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plain(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleFromHtml(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return plain(h1[1]).slice(0, 120);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return plain(title[1]).replace(/\s*[|｜-]\s*RUST[\s\S]*$/i, '').slice(0, 120);
  return '';
}

function canonicalFromHtml(html, rel) {
  const match = html.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
  if (match) return match[1];
  const clean = rel.replace(/index\.html$/, '').replace(/\.html$/, '/');
  return `https://88st.cloud/${clean}`.replace(/\/+/g, '/').replace('https:/', 'https://');
}

function listHtml(dir) {
  const out = [];
  const start = file(dir);
  if (!fs.existsSync(start)) return out;
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const p = path.join(current, item.name);
      if (item.isDirectory()) stack.push(p);
      else if (item.isFile() && item.name.endsWith('.html')) out.push(path.relative(ROOT, p).replace(/\\/g, '/'));
    }
  }
  return out.sort();
}

function collectNewSeoPosts() {
  const posts = [];
  for (const rel of listHtml('blog')) {
    if (rel === 'blog/index.html') continue;
    const html = read(rel);
    if (!html.includes('V82_2_SEO_CONTENT_ACTIVE') && !html.includes('data-v82-2-seo="true"')) continue;
    posts.push({
      title: titleFromHtml(html) || rel.split('/').pop().replace(/\.html$/, ''),
      url: canonicalFromHtml(html, rel),
      path: rel
    });
  }
  return posts.slice(0, 20);
}

function collectHubUrls(dir, limit) {
  return listHtml(dir)
    .filter((rel) => rel !== `${dir}/index.html`)
    .slice(0, limit)
    .map((rel) => {
      const html = read(rel);
      return { title: titleFromHtml(html) || rel.split('/').pop().replace(/\.html$/, ''), url: canonicalFromHtml(html, rel), path: rel };
    });
}

function buildTargets() {
  const newSeoPosts = collectNewSeoPosts();
  const sports = collectHubUrls('sports-check', 12);
  const searchGuides = collectHubUrls('search-guides', 20);
  const indexingUrls = [...CORE_URLS, ...newSeoPosts.map((post) => post.url), ...sports.slice(0, 5).map((post) => post.url), ...searchGuides.slice(0, 5).map((post) => post.url)];
  const uniqueIndexingUrls = [...new Set(indexingUrls)];
  return {
    version: VERSION,
    marker: MARKER,
    generatedAt: new Date().toISOString(),
    domain: 'https://88st.cloud',
    ga4: {
      measurementId: GA_ID,
      events: GA_EVENTS
    },
    searchConsole: {
      sitemapXml: 'https://88st.cloud/sitemap.xml',
      sitemapTxt: 'https://88st.cloud/sitemap.txt',
      manualInspectionPriority: uniqueIndexingUrls.slice(0, 35)
    },
    noindexExpected: NOINDEX_EXPECTED,
    coreUrls: CORE_URLS,
    newSeoPosts,
    sportsCheckSamples: sports.slice(0, 5),
    searchGuideSamples: searchGuides.slice(0, 5),
    indexingUrls: uniqueIndexingUrls
  };
}

function ensureHeadAssets(html) {
  let next = html;
  next = next.replace(/<meta\s+name=["']v82-3-indexing-measurement["'][^>]*>\s*/gi, '');
  next = next.replace(/<link\b[^>]*v82-3-indexing-ops\.css[^>]*>\s*/gi, '');
  next = next.replace(/<script\b[^>]*v82-3-indexing-ops\.js[^>]*>\s*<\/script>\s*/gi, '');
  const insert = [
    `  <meta name="v82-3-indexing-measurement" content="${MARKER}">`,
    `  <link rel="stylesheet" href="${CSS_HREF}" data-v82-3-indexing="true">`
  ].join('\n');
  if (/<\/head>/i.test(next)) return next.replace(/<\/head>/i, `${insert}\n</head>`);
  return `${insert}\n${next}`;
}

function ensureScript(html) {
  let next = html.replace(/<script\b[^>]*v82-3-indexing-ops\.js[^>]*>\s*<\/script>\s*/gi, '');
  const tag = `  <script defer src="${JS_HREF}" data-v82-3-indexing="true"></script>`;
  if (/<\/body>/i.test(next)) return next.replace(/<\/body>/i, `${tag}\n</body>`);
  return `${next}\n${tag}\n`;
}

function navInject(html) {
  if (html.includes('href="#indexing"')) return html;
  return html.replace(/<a href="#deploy">배포검증<\/a>/, '<a href="#indexing">색인·측정</a>\n        <a href="#deploy">배포검증</a>');
}

function opsPanel(targets) {
  const newPostLinks = targets.newSeoPosts.map((post, idx) => `<a href="${post.url.replace('https://88st.cloud', '')}" target="_blank" rel="noopener"><span>${idx + 1}. ${esc(post.title)}</span><b>URL</b></a>`).join('\n          ');
  const inspectLinks = targets.searchConsole.manualInspectionPriority.slice(0, 20).map((url, idx) => `<a href="${url.replace('https://88st.cloud', '') || '/'}" target="_blank" rel="noopener"><span>${idx + 1}. ${esc(url.replace('https://88st.cloud', '') || '/')}</span><b>검사</b></a>`).join('\n          ');
  const eventRows = GA_EVENTS.map((eventName) => `<div class="v82-3-check-row"><span>${esc(eventName)}</span><b>GA4</b></div>`).join('\n          ');
  const checks = [
    ['sitemap.xml', '필수'],
    ['robots.txt Sitemap 라인', '필수'],
    ['canonical', '핵심 페이지'],
    ['/ops noindex', '정상'],
    ['/admin noindex', '정상'],
    ['GA4 이벤트 스크립트', GA_ID]
  ].map(([label, value]) => `<div class="v82-3-check-row"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join('\n          ');

  return `
      <!-- V82-3 INDEXING MEASUREMENT START -->
      <section class="v82-3-ops-panel" id="indexing" data-v82-3-indexing="${MARKER}" aria-label="색인 및 GA4 측정 안정화">
        <div class="v82-3-ops-head">
          <div><strong>색인 · GA4 측정 안정화 센터</strong><span>신규 SEO 글, 핵심 URL, sitemap/canonical/noindex/GA4 이벤트를 업로드 직후 바로 점검합니다.</span></div>
          <span class="v82-3-ops-badge">${GA_ID}</span>
        </div>
        <div class="v82-3-metric-grid">
          <div class="v82-3-metric"><small>신규 SEO 글</small><b>${targets.newSeoPosts.length}</b><em>V82-2 콘텐츠</em></div>
          <div class="v82-3-metric"><small>색인 우선 URL</small><b>${targets.indexingUrls.length}</b><em>GSC URL 검사 후보</em></div>
          <div class="v82-3-metric"><small>GA4 이벤트</small><b>${GA_EVENTS.length}</b><em>클릭/전환 추적</em></div>
          <div class="v82-3-metric"><small>noindex 유지</small><b>${NOINDEX_EXPECTED.length}</b><em>/ops · /admin</em></div>
        </div>
        <div class="v82-3-control-grid">
          <article class="v82-3-control-card">
            <h3>신규 블로그 20개 색인 요청 리스트</h3>
            <div class="v82-3-url-list" id="v82-3-new-posts">${newPostLinks}</div>
            <div class="v82-3-actions"><button class="v82-3-action" type="button" data-v82-copy="#v82-3-new-posts">신규 글 URL 복사</button></div>
          </article>
          <article class="v82-3-control-card">
            <h3>핵심 URL 검사 우선순위</h3>
            <div class="v82-3-url-list" id="v82-3-inspection-urls">${inspectLinks}</div>
            <div class="v82-3-actions"><button class="v82-3-action" type="button" data-v82-copy="#v82-3-inspection-urls">검사 URL 복사</button></div>
          </article>
          <article class="v82-3-control-card">
            <h3>GA4 이벤트 추적명</h3>
            <div class="v82-3-check-list" id="v82-3-ga-events">${eventRows}</div>
            <div class="v82-3-actions"><button class="v82-3-action" type="button" data-v82-copy="#v82-3-ga-events">이벤트명 복사</button></div>
          </article>
          <article class="v82-3-control-card">
            <h3>배포 직후 필수 체크</h3>
            <div class="v82-3-check-list">${checks}</div>
            <div class="v82-3-actions"><a class="v82-3-action" href="/sitemap.xml" target="_blank" rel="noopener">sitemap.xml 열기</a><a class="v82-3-action" href="/robots.txt" target="_blank" rel="noopener">robots.txt 열기</a></div>
          </article>
        </div>
      </section>
      <!-- V82-3 INDEXING MEASUREMENT END -->
`;
}

function injectOps(targets) {
  const rel = 'ops/index.html';
  if (!exists(rel)) throw new Error('missing ops/index.html');
  let html = read(rel);
  html = ensureHeadAssets(html);
  html = ensureScript(html);
  html = navInject(html);
  html = html.replace(/\n\s*<!-- V82-3 INDEXING MEASUREMENT START -->[\s\S]*?<!-- V82-3 INDEXING MEASUREMENT END -->\s*\n/gi, '\n');
  const block = opsPanel(targets);
  if (/<section\s+class="v80-layout"\s+id="deploy"/i.test(html)) {
    html = html.replace(/\n\s*<section\s+class="v80-layout"\s+id="deploy"/i, `${block}\n      <section class="v80-layout" id="deploy"`);
  } else if (/<\/main>/i.test(html)) {
    html = html.replace(/<\/main>/i, `${block}\n    </main>`);
  } else {
    html += block;
  }
  write(rel, html);
}

function updatePackage() {
  const pkgPath = file('package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const generate = 'node scripts/generate-v82-3-indexing-measurement.mjs';
  const verify = 'node scripts/verify-v82-3-indexing-measurement.mjs';
  const chain = String(pkg.scripts?.build || '')
    .split('&&')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item !== generate);
  chain.push(generate);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = chain.join(' && ');
  pkg.scripts.verify = verify;
  pkg.scripts['quality:v82-3'] = generate;
  pkg.scripts['verify:v82-3'] = verify;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

const targets = buildTargets();
write('assets/data/v82-3-indexing-targets.json', JSON.stringify(targets, null, 2) + '\n');
injectOps(targets);
updatePackage();
console.log(`[V82-3] indexing/measurement stability generated. newSeo=${targets.newSeoPosts.length} indexing=${targets.indexingUrls.length} ga4=${GA_EVENTS.length}`);
