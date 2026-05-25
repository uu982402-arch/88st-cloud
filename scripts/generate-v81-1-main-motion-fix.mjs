import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v81-1-main-motion-fix-20260525';
const MARKER = 'V81_1_MAIN_MOTION_FIX_ACTIVE';

const indexPath = path.join(ROOT, 'index.html');
const cssHref = `/assets/css/v81-1.main-motion-fix.css?v=${VERSION}`;
const jsSrc = `/assets/js/v81-1.main-motion-fix.js?v=${VERSION}`;

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleFromHtml(html, fallback) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h2 = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const source = h1?.[1] || h2?.[1] || title?.[1] || fallback;
  return stripTags(source)
    .replace(/\s*[|｜-]\s*(RUST|88ST\.Cloud|88ST Cloud|2026.*)$/i, '')
    .replace(/^#\s*/, '')
    .trim()
    .slice(0, 64) || fallback;
}

function descriptionFromHtml(html, fallback) {
  const meta = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["'][^>]*>/i);
  const p = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const source = meta?.[1] || p?.[1] || fallback;
  return stripTags(source).slice(0, 96) || fallback;
}

function categoryForHref(href) {
  const h = href.toLowerCase();
  if (h.includes('sports-check')) return 'SPORTS';
  if (h.includes('search-guides')) return 'SEARCH';
  if (h.includes('casino')) return 'CASINO';
  if (h.includes('slot') || h.includes('rtp')) return 'SLOT';
  if (h.includes('rolling')) return 'ROLLING';
  if (h.includes('bonus') || h.includes('first')) return 'BONUS';
  if (h.includes('domain') || h.includes('address')) return 'DOMAIN';
  if (h.includes('toto') || h.includes('sports')) return 'SPORTS';
  if (h.includes('payout') || h.includes('withdraw')) return 'PAYOUT';
  return 'GUIDE';
}

function walkHtml(dirRel, excludeIndex = true) {
  const base = path.join(ROOT, dirRel);
  if (!fs.existsSync(base)) return [];
  const result = [];
  const stack = [base];
  while (stack.length) {
    const current = stack.pop();
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, item.name);
      if (item.isDirectory()) {
        stack.push(full);
      } else if (item.isFile() && item.name.endsWith('.html')) {
        const rel = path.relative(ROOT, full).replace(/\\/g, '/');
        if (excludeIndex && rel === `${dirRel}/index.html`) continue;
        result.push(rel);
      }
    }
  }
  return result.sort();
}

function hrefFromRel(rel) {
  if (rel.endsWith('/index.html')) return '/' + rel.replace(/index\.html$/, '');
  return '/' + rel;
}

function buildPool(dirRel, fallbackSummary, limit = Infinity) {
  const files = walkHtml(dirRel, true);
  const pool = files.map((rel) => {
    const html = read(path.join(ROOT, rel));
    const href = hrefFromRel(rel);
    return {
      href,
      title: titleFromHtml(html, path.basename(rel, '.html')),
      summary: descriptionFromHtml(html, fallbackSummary),
      category: categoryForHref(href),
    };
  }).filter((item) => item.href !== '/' && item.title);
  return pool.slice(0, limit);
}

function escAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function jsonScript(id, data) {
  return `<script type="application/json" id="${id}">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

function blogCard(item, index) {
  return `<a class="v71-blog-card v71-glass v81-1-blog-card" href="${escAttr(item.href)}" data-v811-blog-card="${index}" aria-label="${escAttr(item.title)} 보기"><em data-v811-category>${escHtml(item.category)}</em><strong data-v811-title>${escHtml(item.title)}</strong><span data-v811-summary>${escHtml(item.summary)}</span></a>`;
}

function hubCard(item, lane, index) {
  return `<a class="v81-1-hub-card" href="${escAttr(item.href)}" data-v811-${lane}-card="${index}" aria-label="${escAttr(item.title)} 보기"><em data-v811-category>${escHtml(item.category)}</em><strong data-v811-title>${escHtml(item.title)}</strong><span data-v811-summary>${escHtml(item.summary)}</span></a>`;
}

function ensureHeadAssets(html) {
  html = html.replace(/<meta name="v81-1-main-motion-fix"[^>]*>\n?/g, '');
  html = html.replace(/<link rel="stylesheet" href="\/assets\/css\/v81-1\.main-motion-fix\.css[^>]*>\n?/g, '');
  const insert = `  <meta name="v81-1-main-motion-fix" content="${MARKER}">\n  <link rel="stylesheet" href="${cssHref}" data-v81-1-main-motion-fix="true">\n`;
  return html.replace('</head>', `${insert}</head>`);
}

function ensureBodyScript(html, pools) {
  html = html.replace(/<script type="application\/json" id="v81-1-blog-pool">[\s\S]*?<\/script>\n?/g, '');
  html = html.replace(/<script type="application\/json" id="v81-1-sports-pool">[\s\S]*?<\/script>\n?/g, '');
  html = html.replace(/<script type="application\/json" id="v81-1-guides-pool">[\s\S]*?<\/script>\n?/g, '');
  html = html.replace(/<script src="\/assets\/js\/v81-1\.main-motion-fix\.js[^>]*><\/script>\n?/g, '');
  const insert = `${jsonScript('v81-1-blog-pool', pools.blog)}\n${jsonScript('v81-1-sports-pool', pools.sports)}\n${jsonScript('v81-1-guides-pool', pools.guides)}\n<script src="${jsSrc}" defer data-v81-1-main-motion-fix="true"></script>\n`;
  return html.replace('</body>', `${insert}</body>`);
}

function replaceBlogSection(html, blogPool) {
  const initial = Array.from({ length: 15 }, (_, i) => blogPool[i % blogPool.length]);
  const cards = initial.map(blogCard).join('');
  const replacement = `<div class="v71-blog-grid v81-1-blog-rotator" data-v811-blog-rotator="true" aria-live="polite">\n            ${cards}\n          </div>`;
  const re = /<div class="v71-blog-grid">[\s\S]*?\n\s*<\/div>(?=\n\s*<\/div>\n\s*<aside class="v71-desktop-partner-panel")/;
  if (!re.test(html)) {
    throw new Error('V81-1 could not find the original v71 blog grid to replace.');
  }
  html = html.replace(re, replacement);

  html = html.replace(
    /<div><h2>최신 정보 가이드<\/h2><p>검색 유입과 체류시간을 만드는 핵심 콘텐츠 15건입니다\.<\/p><\/div>/,
    `<div><h2>최신 정보 가이드</h2><p>블로그 전체 글 ${blogPool.length}개가 15개 카드 슬롯 안에서 자동 순환됩니다.</p></div><span class="v81-1-rotator-status">AUTO ROTATION</span>`
  );
  return html;
}

function buildHubSection(sportsPool, guidesPool) {
  const sports = Array.from({ length: 5 }, (_, i) => sportsPool[i % sportsPool.length]);
  const guides = Array.from({ length: 5 }, (_, i) => guidesPool[i % guidesPool.length]);
  return `<section class="v71-section v71-shell v81-1-hub-section" aria-label="스포츠 체크와 검색 가이드 자동 순환 허브" data-v811-hub-section="true">
        <div class="v71-section-head">
          <div><h2>스포츠 체크 · 검색 가이드</h2><p>각 허브의 상세 게시글이 5개 슬롯 안에서 자동으로 순환됩니다.</p></div>
          <span class="v81-1-rotator-status">HUB ROTATION</span>
        </div>
        <div class="v81-1-hub-shell">
          <div>
            <div class="v81-1-hub-lane-head"><strong>스포츠 체크 인기 글</strong><span>${sportsPool.length}개 글 순환</span></div>
            <div class="v81-1-hub-lane-wrap">
              <div class="v81-1-hub-lane" data-v811-sports-lane="true" aria-live="polite">
                ${sports.map((item, index) => hubCard(item, 'sports', index)).join('\n                ')}
              </div>
            </div>
          </div>
          <div>
            <div class="v81-1-hub-lane-head"><strong>검색 가이드 인기 글</strong><span>${guidesPool.length}개 글 순환</span></div>
            <div class="v81-1-hub-lane-wrap">
              <div class="v81-1-hub-lane" data-v811-guides-lane="true" aria-live="polite">
                ${guides.map((item, index) => hubCard(item, 'guides', index)).join('\n                ')}
              </div>
            </div>
          </div>
        </div>
      </section>

      `;
}

function insertHubSection(html, sportsPool, guidesPool) {
  html = html.replace(/<section class="v71-section v71-shell v81-1-hub-section"[\s\S]*?<\/section>\s*\n\s*(?=<section class="v71-section v71-shell" aria-label="실사용 분석 도구")/, '');
  const marker = '<section class="v71-section v71-shell" aria-label="실사용 분석 도구">';
  if (!html.includes(marker)) {
    throw new Error('V81-1 could not find tools section insertion point.');
  }
  return html.replace(marker, buildHubSection(sportsPool, guidesPool) + marker);
}

function removeWrongV81(html) {
  html = html.replace(/<meta name="v81-main-motion-carousels"[^>]*>\n?/g, '');
  html = html.replace(/<link rel="stylesheet" href="\/assets\/css\/v81\.main-motion-carousels\.css[^>]*>\n?/g, '');
  html = html.replace(/<script src="\/assets\/js\/v81\.main-motion-carousels\.js[^>]*><\/script>\n?/g, '');
  return html
    .replace(/RUST MOTION HUB/g, 'RUST')
    .replace(/Premium Partners/g, '프리미엄 보증업체');
}

const blogPool = buildPool('blog', 'RUST 블로그에서 확인할 수 있는 실전 가이드입니다.');
const sportsPool = buildPool('sports-check', '스포츠 체크 허브에서 확인할 수 있는 경기 전 점검 기준입니다.');
const guidesPool = buildPool('search-guides', '검색 가이드 허브에서 확인할 수 있는 주소·코드·조건 확인 기준입니다.');

if (blogPool.length < 300) throw new Error(`Blog pool too small: ${blogPool.length}`);
if (sportsPool.length < 5) throw new Error(`Sports-check pool too small: ${sportsPool.length}`);
if (guidesPool.length < 5) throw new Error(`Search-guides pool too small: ${guidesPool.length}`);

let html = read(indexPath);
html = removeWrongV81(html);
html = ensureHeadAssets(html);
html = replaceBlogSection(html, blogPool);
html = insertHubSection(html, sportsPool, guidesPool);
html = ensureBodyScript(html, { blog: blogPool, sports: sportsPool, guides: guidesPool });
html = html.replace(/<body([^>]*)>/, '<body$1 data-v81-1-main-motion-fix="true">');
write(indexPath, html);

const report = {
  ok: true,
  version: VERSION,
  marker: MARKER,
  blogPosts: blogPool.length,
  blogVisibleSlots: 15,
  sportsPosts: sportsPool.length,
  sportsVisibleSlots: 5,
  searchGuides: guidesPool.length,
  guideVisibleSlots: 5,
  generatedAt: new Date().toISOString(),
};
write(path.join(ROOT, 'V81_1_MAIN_MOTION_FIX_REPORT.json'), JSON.stringify(report, null, 2));

try {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts ||= {};
  const cmd = 'node scripts/generate-v81-1-main-motion-fix.mjs';
  pkg.scripts.build = String(pkg.scripts.build || '').replace(' && node scripts/generate-v81-main-motion-carousels.mjs', '');
  if (!pkg.scripts.build.includes(cmd)) {
    pkg.scripts.build = pkg.scripts.build ? `${pkg.scripts.build} && ${cmd}` : cmd;
  }
  pkg.scripts.verify = 'node scripts/verify-v81-1-main-motion-fix.mjs';
  pkg.scripts['quality:v81-1'] = cmd;
  pkg.scripts['verify:v81-1'] = 'node scripts/verify-v81-1-main-motion-fix.mjs';
  delete pkg.scripts['quality:v81'];
  delete pkg.scripts['verify:v81'];
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
} catch (error) {
  console.warn('[V81-1] package.json update skipped', error && error.message);
}

console.log(`[V81-1] main motion fixed. blogPool=${blogPool.length} sports=${sportsPool.length} guides=${guidesPool.length}`);
