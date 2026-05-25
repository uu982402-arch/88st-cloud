import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MARKER = 'V82_2_SEO_CONTENT_ACTIVE';
const POST_SLUGS = [
  '2026-toto-site-recommendation-safe-checklist',
  'sports-ibple-site-before-join',
  'casino-ibple-real-receive-guide',
  'minigame-ibple-code-check-order',
  'safe-toto-site-vendor-checklist',
  'sports-ibple-event-hidden-conditions',
  'first-recharge-real-receive-calculation',
  'slot-rtp-volatility-event-reading',
  'official-address-risk-routine',
  'online-sports-toto-search-differentiation',
  'guaranteed-detail-page-seven-signals',
  'auto-copy-code-domain-match',
  'rolling-calculator-before-use-example',
  'ev-calculation-bonus-comparison',
  'sports-margin-low-site-formula',
  'powerball-ladder-minigame-loss-limit',
  'usdt-deposit-event-condition-reading',
  'telegram-consult-question-list',
  'search-guide-risk-lowering-route',
  'rust-route-blog-tools-guaranteed'
];

function file(...parts) { return path.join(ROOT, ...parts); }
function read(rel) { return fs.readFileSync(file(rel), 'utf8'); }
function exists(rel) { return fs.existsSync(file(rel)); }
function textOnly(html) { return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

const failures = [];
function must(condition, message) { if (!condition) failures.push(message); }

must(exists('scripts/generate-v82-2-seo-content.mjs'), 'missing generate-v82-2-seo-content.mjs');
must(exists('assets/css/v82.seo-content.css'), 'missing assets/css/v82.seo-content.css');

const pkg = JSON.parse(read('package.json'));
must(String(pkg.scripts.build || '').includes('generate-v82-1-structure-ga4.mjs'), 'build chain lost V82-1 structure guard');
must(String(pkg.scripts.build || '').includes('generate-v82-2-seo-content.mjs'), 'build chain missing V82-2 generator');
must(String(pkg.scripts.verify || '').includes('verify-v82-2-seo-content.mjs'), 'verify script is not V82-2 verifier');

const blogIndex = read('blog/index.html');
must(blogIndex.includes('data-v82-2-seo-strip="true"'), 'blog index missing V82-2 strip');
must((blogIndex.match(/data-v82-seo-card=/g) || []).length === 20, 'blog index V82 SEO card count is not 20');
must(blogIndex.includes('총 473개 / 페이지당 50개'), 'blog index count did not update to 473');

const home = read('index.html');
must(home.includes('/blog/2026-toto-site-recommendation-safe-checklist/'), 'home blog pool missing new SEO content');
must((home.match(/data-v811-blog-card=/g) || []).length === 15, 'home blog slot count changed from 15');
must((home.match(/data-v811-sports-card=/g) || []).length === 5, 'home sports slot count changed from 5');
must((home.match(/data-v811-guides-card=/g) || []).length === 5, 'home guide slot count changed from 5');
must(!home.includes('88ST.CLOUD PLATFORM'), 'home title section text returned');
must(!home.includes('RUST MOTION HUB'), 'incorrect V81 motion hub returned');

const sitemapXml = read('sitemap.xml');
const sitemapTxt = read('sitemap.txt');
for (const slug of POST_SLUGS) {
  const rel = `blog/${slug}/index.html`;
  const url = `https://88st.cloud/blog/${slug}/`;
  must(exists(rel), `missing generated blog post ${rel}`);
  const html = read(rel);
  must(html.includes(MARKER), `${rel} missing V82-2 marker`);
  must(html.includes('V82_1_STRUCTURE_GA4_ACTIVE'), `${rel} missing V82-1 marker`);
  must(html.includes('/assets/js/v82.ga4-events.js'), `${rel} missing GA4 event script`);
  must(html.includes('/assets/css/v82.seo-content.css'), `${rel} missing V82 SEO CSS`);
  must(html.includes('<link rel="canonical" href="' + url + '">'), `${rel} missing canonical`);
  must(html.includes('/guaranteed/') && html.includes('/tools/') && html.includes('/consult/'), `${rel} missing core internal links`);
  must(textOnly(html).length >= 2500, `${rel} text is shorter than 2500 chars`);
  must(sitemapXml.includes(`<loc>${url}</loc>`), `sitemap.xml missing ${url}`);
  must(sitemapTxt.includes(url), `sitemap.txt missing ${url}`);
}

const robots = read('robots.txt');
must(/Sitemap:\s*https:\/\/88st\.cloud\/sitemap\.xml/i.test(robots), 'robots.txt missing sitemap line');

if (failures.length) {
  console.error('[V82-2] verify failed');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}

console.log(`[V82-2] verify ok. posts=${POST_SLUGS.length} marker=${MARKER}`);
