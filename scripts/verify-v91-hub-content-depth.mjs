import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const MARKER = 'V91_HUB_CONTENT_DEPTH_ACTIVE';
const DATA = 'assets/data/v91-hub-content-depth.json';
const CSS = 'assets/css/v91-hub-content-depth.css';
const forbidden = ['오늘 확인해야 할 것','상담 전 먼저 확인할 것','함께 확인할 글','다음 단계: 자동화 상담으로 기준 정보를 확인하거나','에 보낼 문의 문구를 먼저 생성해 보세요','페이지 하단의 내부 링크','관련 글과 다음 확인 루트'];
function fail(msg){ console.error(`[V91 VERIFY] ${msg}`); process.exit(1); }
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function strip(s){ return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
if(!exists(DATA)) fail('missing V91 data report');
if(!exists(CSS)) fail('missing V91 css');
const data = JSON.parse(read(DATA));
if(data.marker !== MARKER) fail('marker mismatch in V91 data');
if(data.total !== 47) fail(`expected 47 detail pages, got ${data.total}`);
const pkg = JSON.parse(read('package.json'));
if(!String(pkg.scripts.build || '').trim().endsWith('node scripts/generate-v91-hub-content-depth.mjs')) fail('V91 generator is not final build step');
if(String(pkg.scripts.verify || '') !== 'node scripts/verify-v91-hub-content-depth.mjs') fail('verify script is not V91 verifier');
let sports = 0;
let guides = 0;
for(const item of data.targets){
  const rel = item.rel;
  if(!exists(rel)) fail(`missing target page ${rel}`);
  const html = read(rel);
  if(rel.startsWith('sports-check/')) sports++;
  if(rel.startsWith('search-guides/')) guides++;
  if(!html.includes(MARKER)) fail(`${rel} missing V91 marker`);
  if(!html.includes('v91-hub-content-depth.css')) fail(`${rel} missing V91 css link`);
  if(!html.includes('data-v91-hub-depth="article"')) fail(`${rel} missing V91 article marker`);
  if(!html.includes('data-v91-hub-depth="faq"')) fail(`${rel} missing V91 FAQ marker`);
  if(!html.includes('data-v91-hub-depth="article-schema"')) fail(`${rel} missing Article schema`);
  if(!html.includes('data-v91-hub-depth="faq-schema"')) fail(`${rel} missing FAQ schema`);
  if(!html.includes('V79_RUST_LONGFORM_HUBS_ACTIVE')) fail(`${rel} missing V79 base marker`);
  if(!html.includes('V89_GA4_EVENT_DEPTH_ACTIVE')) fail(`${rel} missing V89 marker`);
  const h2 = (html.match(/<h2\b/gi)||[]).length;
  if(h2 < 9) fail(`${rel} too few h2 headings: ${h2}`);
  const details = (html.match(/<details>/g)||[]).length;
  if(details < 4) fail(`${rel} FAQ details missing: ${details}`);
  const len = strip(html).length;
  if(len < 3600) fail(`${rel} text too short: ${len}`);
  for(const banned of forbidden) if(html.includes(banned)) fail(`${rel} contains forbidden legacy phrase: ${banned}`);
}
if(sports !== 12) fail(`expected 12 sports-check details, got ${sports}`);
if(guides !== 35) fail(`expected 35 search-guides details, got ${guides}`);
console.log(`[V91 VERIFY] ok targets=${data.total} sports=${sports} searchGuides=${guides}`);
