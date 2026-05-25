
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MARKER = 'V85_SEO_CONTENT_30_ACTIVE';
const SLUGS = ["toto-site-recommendation-detail-2026-ranking-signals", "safe-toto-site-recommendation-longtail-guide", "online-sports-toto-site-recommendation-check-route", "toto-site-code-official-domain-match", "ibple-site-recommendation-longtail-map", "sports-ibple-vs-casino-ibple-compare", "casino-ibple-site-recommendation-real-receive", "sports-ibple-bonus-turnover-risk", "minigame-ibple-site-risk-before-join", "powerball-ladder-ibple-condition-check", "guaranteed-vendor-selection-standard-2026", "guaranteed-vendor-bonus-three-line-rule", "muktu-site-identification-search-pattern", "muktu-review-filter-ad-vs-real-signal", "rolling-real-receive-calculation-example-2026", "bonus-real-receive-first-recharge-recurring", "ev-calculation-example-for-event-bonus", "sports-odds-margin-example-home-draw-away", "casino-rolling-bonus-abuse-clause-check", "slot-rtp-volatility-loss-control-guide", "mini-game-speedkino-powerball-ladder-compare", "official-address-domain-history-check", "join-code-copy-before-telegram-consult", "rust-blog-tools-guaranteed-user-route-2026", "toto-site-recommendation-mobile-checklist", "sports-toto-event-condition-small-print", "casino-ibple-vs-slot-event-condition", "vendor-card-image-trust-signal-guide", "search-guide-before-deposit-risk-check", "ga4-gsc-content-feedback-loop-rust"];
const SITE = 'https://88st.cloud';
function file(...parts) { return path.join(ROOT, ...parts); }
function exists(rel) { return fs.existsSync(file(rel)); }
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function textOnly(html) { return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
const failures = [];
function must(ok, msg) { if (!ok) failures.push(msg); }

must(exists('scripts/generate-v85-seo-content-30.mjs'), 'missing V85 generator');
must(exists('scripts/verify-v85-seo-content-30.mjs'), 'missing V85 verifier');
const pkg = JSON.parse(read('package.json'));
must(String(pkg.scripts.build || '').includes('generate-v84-performance-optimization.mjs'), 'build chain lost V84 performance step');
must(String(pkg.scripts.build || '').includes('generate-v85-seo-content-30.mjs'), 'build chain missing V85 generator');
must(String(pkg.scripts.verify || '').includes('verify-v85-seo-content-30.mjs'), 'verify script is not V85');

const blogIndex = read('blog/index.html');
must(blogIndex.includes(MARKER), 'blog index missing V85 marker');
must(blogIndex.includes('총 503개 / 페이지당 50개'), 'blog count not updated to 503');
must(blogIndex.includes('신규 SEO 확장 콘텐츠 50개') || blogIndex.includes('토토·입플·보증업체·도구 연결 50개'), 'blog strip label did not update to 50');
const home = read('index.html');
must(home.includes(MARKER), 'home missing V85 marker');
must((home.match(/data-v811-blog-card=/g) || []).length === 15, 'home blog card slot count changed');
must((home.match(/data-v811-sports-card=/g) || []).length === 5, 'home sports slot count changed');
must((home.match(/data-v811-guides-card=/g) || []).length === 5, 'home guide slot count changed');
must(!home.includes('88ST.CLOUD PLATFORM'), 'home title section returned');
must(!home.includes('RUST MOTION HUB'), 'bad V81 motion title returned');

const sitemapXml = read('sitemap.xml');
const sitemapTxt = read('sitemap.txt');
for (const slug of SLUGS) {
  const rel = `blog/${slug}/index.html`;
  const url = `${SITE}/blog/${slug}/`;
  must(exists(rel), `missing ${rel}`);
  if (exists(rel)) {
    const html = read(rel);
    must(html.includes(MARKER), `${rel} missing V85 marker`);
    must(html.includes('V82_1_STRUCTURE_GA4_ACTIVE'), `${rel} missing V82 GA4 marker`);
    must(html.includes('V83_SCHEMA_STRUCTURED_DATA_ACTIVE'), `${rel} missing schema marker`);
    must(html.includes('data-v84-performance'), `${rel} missing V84 performance marker`);
    must(html.includes('/assets/js/v82.ga4-events.js'), `${rel} missing GA4 events script`);
    must(html.includes('<link rel="canonical" href="' + url + '">'), `${rel} missing canonical`);
    must(html.includes('/tools/') && html.includes('/guaranteed/') && html.includes('/consult/') && html.includes('/search-guides/'), `${rel} missing core internal links`);
    must(textOnly(html).length >= 3000, `${rel} text shorter than 3000 chars`);
    must(html.includes('application/ld+json'), `${rel} missing JSON-LD`);
  }
  must(sitemapXml.includes(`<loc>${url}</loc>`), `sitemap.xml missing ${url}`);
  must(sitemapTxt.includes(url), `sitemap.txt missing ${url}`);
}
if (exists('assets/data/v82-3-indexing-targets.json')) {
  const data = JSON.parse(read('assets/data/v82-3-indexing-targets.json'));
  must(data.searchConsole && data.searchConsole.v85AddedCount === 30, 'indexing targets did not record V85 30 URLs');
}
if (failures.length) {
  console.error('[V85] verify failed');
  for (const f of failures) console.error(' - ' + f);
  process.exit(1);
}
console.log(`[V85] verify ok. posts=${SLUGS.length} marker=${MARKER}`);
