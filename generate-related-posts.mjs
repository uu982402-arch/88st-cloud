import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'assets', 'data', 'ops.dashboard.v1.20260323.json');
const DOC = path.join(ROOT, 'docs', 'analytics-ga-audit-latest.md');

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
const publicPages = htmlFiles.filter(f => !/^(admin|ops)\//.test(normalize(f)));
const sitemapUrls = (readMaybe('sitemap.txt').match(/^https?:\/\/[^\n]+/gm) || []);
const buildLoader = readMaybe('assets/js/build.loader.js');
const mobileEnhance = readMaybe('assets/js/mobile.enhance.v1.20260317.js');
const adminIndex = readMaybe('admin/index.html');

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
    sitemapUrls: sitemapUrls.length
  },
  ga: {
    measurementIds: [...measurementIds],
    streamIds: [...streamIds],
    publicLoader: 'assets/js/mobile.enhance.v1.20260317.js',
    operatorLoaders: ['assets/js/build.loader.js', 'admin/index.html'],
    sendPageViewTrue: /send_page_view\s*:\s*true/.test(buildLoader) || /send_page_view\s*:\s*true/.test(mobileEnhance),
    operatorExcluded: /operator_or_local/.test(buildLoader) && /operator_or_local/.test(mobileEnhance) && /admin_excluded/.test(adminIndex),
    trackedPublicAreas: ['메인', '블로그', '도구', '보증업체', '먹튀 커뮤니티'],
    excludedAreas: ['/admin/', '/ops/']
  },
  indexing: {
    topPriority: [
      '/',
      '/blog/',
      '/tools/',
      '/guaranteed/',
      '/muktu-police/',
      '/tools/ai-domain-analysis/',
      '/tools/ai-sports-odds-analysis/'
    ]
  },
  notes: [
    '공개 페이지는 page_view가 자동 수집됩니다.',
    '운영자 페이지(/admin/, /ops/)는 수집 제외 대상입니다.',
    'sitemap에는 indexable URL만 남겨야 합니다.'
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
  '## 메모',
  '',
  '- sitemap에는 색인 대상 URL만 유지합니다.',
  '- noindex 또는 운영자 페이지는 sitemap에서 제외합니다.'
].join('\n'));

console.log('generated', rel(OUT));
console.log('generated', rel(DOC));
