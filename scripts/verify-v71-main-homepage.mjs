import { readFileSync, existsSync } from 'node:fs';

function fail(message) {
  console.error('[V71 verify failed]', message);
  process.exit(1);
}

function count(haystack, needle) {
  return (haystack.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
}

const required = [
  'index.html',
  'assets/css/v71.main-home.css',
  'assets/js/v71.main-home.js',
  'assets/img/partners/v71-sk-holdings.svg',
  'assets/img/partners/v71-queenbee.svg',
  'assets/img/partners/v71-anybet.svg',
  'assets/img/partners/v71-udt-bet.svg',
  'assets/img/partners/v71-ddangkong-bet.svg',
  'V71_MAIN_REDESIGN_REPORT.md'
];

for (const file of required) {
  if (!existsSync(file)) fail(`missing file: ${file}`);
}

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('assets/css/v71.main-home.css', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

if (!html.includes('assets/css/v71.main-home.css')) fail('index missing V71 CSS');
if (!html.includes('assets/js/v71.main-home.js')) fail('index missing V71 JS');
if (!html.includes('88ST.Cloud는 광고 랜딩이 아니라')) fail('hero platform copy missing');
if (!html.includes('@TRS999_bot')) fail('telegram CTA missing');
if (count(html, 'class="v71-blog-card') !== 10) fail('blog card count is not 10');
if (count(html, 'class="v71-tool-card') !== 5) fail('tool card count is not 5');
if (count(html, 'class="v71-partner-card') !== 10) fail('partner card count should be 10 because mobile and desktop render separate copies');
if (html.includes('v70-header') || html.includes('v70-2-header') || html.includes('v70-mobile-nav') || html.includes('v70-2-mobile-nav')) fail('old v70 header/nav leaked into index');
if (!css.includes('@media (min-width: 1024px)')) fail('desktop breakpoint missing');
if (!css.includes('backdrop-filter: blur(var(--v71-blur))')) fail('glass blur rule missing');
if (!css.includes('grid-template-columns: repeat(5')) fail('PC five-column grid missing');
if (!pkg.scripts.build.includes('generate-v71-main-homepage.mjs')) fail('build chain missing V71 generator');
if (!pkg.scripts.verify.includes('verify-v71-main-homepage.mjs')) fail('verify script not pointing to V71 verifier');

console.log('[V71 verify] ok');
