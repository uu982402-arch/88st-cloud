import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'assets', 'data', 'ops.dashboard.v1.20260323.json');
const DOC = path.join(ROOT, 'docs', 'analytics-ga-audit-20260323.md');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git'].includes(entry.name)) continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }
function readMaybe(relPath) {
  const full = path.join(ROOT, relPath);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
}

const files = walk(ROOT);
const htmlFiles = files.filter(f => f.endsWith('index.html'));
const normalize = (f) => rel(f);
const postHtml = htmlFiles.filter(f => /^(casino|slot|bonus|strategy)\/.+\/index\.html$/.test(normalize(f)));
const publicPages = htmlFiles.filter(f => !/^(admin|ops|seo)\//.test(normalize(f)));
const sitemapUrls = (readMaybe('sitemap.txt').match(/^https?:\/\/[^\n]+/gm) || []);
const postsIndexRawText = readMaybe('assets/data/posts.index.v1.20260318.json');
const postsIndexRaw = postsIndexRawText ? JSON.parse(postsIndexRawText) : [];
const posts = Array.isArray(postsIndexRaw) ? postsIndexRaw : (Array.isArray(postsIndexRaw.posts) ? postsIndexRaw.posts : (Array.isArray(postsIndexRaw.items) ? postsIndexRaw.items : []));
const buildLoader = readMaybe('assets/js/build.loader.js');
const mobileEnhance = readMaybe('assets/js/mobile.enhance.v1.20260317.js');
const adminIndex = readMaybe('admin/index.html');
const promoOfferCount = (mobileEnhance.match(/title:\s*'[^']+'/g) || []).length;

const measurementIds = new Set();
for (const txt of [buildLoader, mobileEnhance, adminIndex]) {
  for (const m of txt.matchAll(/G-[A-Z0-9]+/g)) measurementIds.add(m[0]);
}
const streamIds = new Set();
for (const txt of [buildLoader, mobileEnhance, adminIndex]) {
  for (const m of txt.matchAll(/stream_id\s*[:=]\s*['"]([^'"]+)['"]|13402610880/g)) {
    streamIds.add(m[1] || m[0]);
  }
}

const dashboard = {
  generatedAt: new Date().toISOString(),
  site: {
    publicPages: publicPages.length,
    posts: posts.length,
    postHtml: postHtml.length,
    sitemapUrls: sitemapUrls.length,
    ads: promoOfferCount,
    noindexOperatorPages: 3
  },
  ga: {
    measurementIds: [...measurementIds],
    streamIds: [...streamIds],
    publicLoader: 'assets/js/mobile.enhance.v1.20260317.js',
    operatorLoaders: ['assets/js/build.loader.js', 'admin/index.html'],
    sendPageViewTrue: /send_page_view\s*:\s*true/.test(buildLoader) || /send_page_view\s*:\s*true/.test(mobileEnhance),
    operatorExcluded: /operator_or_local/.test(buildLoader) && /operator_or_local/.test(mobileEnhance) && /admin_excluded/.test(adminIndex),
    trackedPublicAreas: ['메인', '배당분석', '카지노', '슬롯', '보너스', '뉴스', '가이드', '전략', '상세글'],
    excludedAreas: ['/admin/', '/ops/', '/seo/']
  },
  indexing: {
    topPriority: [
      '/', '/slot/', '/bonus/', '/strategy/', '/news/', '/play-guides/', '/latest/', '/popular/',
      '/casino/baccarat-start/', '/slot/rtp-basics/', '/bonus/wagering-requirements/', '/strategy/bankroll-basics/'
    ]
  },
  notes: [
    '공개 페이지는 page_view가 자동 수집됩니다.',
    '운영자 페이지(/admin/, /ops/, /seo/)는 이번 패치로 수집 제외됩니다.',
    'GSC 실시간 요약/기회 목록은 /seo/에서 ADMIN_TOKEN으로 확인합니다.'
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(dashboard, null, 2));
fs.mkdirSync(path.dirname(DOC), { recursive: true });
fs.writeFileSync(DOC, [
  '# Analytics / GSC 운영 점검',
  '',
  `- generatedAt: ${dashboard.generatedAt}`,
  `- measurementIds: ${dashboard.ga.measurementIds.join(', ') || '-'}`,
  `- public loader: ${dashboard.ga.publicLoader}`,
  `- operator loaders: ${dashboard.ga.operatorLoaders.join(', ')}`,
  `- public page count: ${dashboard.site.publicPages}`,
  `- sitemap urls: ${dashboard.site.sitemapUrls}`,
  `- operator excluded: ${dashboard.ga.operatorExcluded ? 'yes' : 'no'}`,
  '',
  '## 왜 Analytics에 잡히는가',
  '',
  '- 공개 페이지는 mobile.enhance 스크립트에서 GA4를 초기화합니다.',
  '- gtag config에서 send_page_view=true라 공개 페이지 진입 시 page_view가 자동 수집됩니다.',
  '- 운영자 페이지(/admin/, /ops/, /seo/)는 이번 패치로 수집 제외됩니다.'
].join('\n'));

console.log('generated', rel(OUT));
console.log('generated', rel(DOC));
