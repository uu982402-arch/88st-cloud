import fs from 'fs';
import path from 'path';
const root = process.cwd();
const marker = 'V79_RUST_LONGFORM_HUBS_ACTIVE';
const required = [
  'sports-check/index.html',
  'search-guides/index.html',
  'assets/css/v79.rust-longform-hubs.css',
  'scripts/generate-v79-rust-longform-hubs.mjs'
];
const banned = [
  '오늘 확인해야 할 것',
  '상담 전 먼저 확인할 것',
  '함께 확인할 글',
  '다음 단계: 자동화 상담으로 기준 정보를 확인하거나',
  '에 보낼 문의 문구를 먼저 생성해 보세요'
];
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function walk(dir, out=[]) {
  const abs = path.join(root, dir);
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name);
    if (entry.isDirectory()) walk(path.relative(root, full), out);
    else if (entry.name.endsWith('.html')) out.push(path.relative(root, full).replaceAll('\\','/'));
  }
  return out;
}
for (const rel of required) {
  if (!exists(rel)) throw new Error(`Missing required V79 file: ${rel}`);
}
const targets = [...walk('sports-check'), ...walk('search-guides')];
if (targets.length < 40) throw new Error(`Too few target pages detected: ${targets.length}`);
let longformOk = 0;
for (const rel of targets) {
  const html = read(rel);
  if (!html.includes(marker)) throw new Error(`Missing V79 marker: ${rel}`);
  for (const phrase of banned) {
    if (html.includes(phrase)) throw new Error(`Banned legacy phrase remains in ${rel}: ${phrase}`);
  }
  if (!html.includes('v79-rail')) throw new Error(`Missing V79 rail layout: ${rel}`);
  if (!html.includes('/tools/?tool=')) throw new Error(`Missing tool links: ${rel}`);
  if (!rel.endsWith('/index.html')) {
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
    if (text.length < 3000) throw new Error(`Longform text too short: ${rel} (${text.length})`);
    longformOk++;
  }
}
const sportsHub = read('sports-check/index.html');
const searchHub = read('search-guides/index.html');
for (const [rel, html] of [['sports-check/index.html', sportsHub], ['search-guides/index.html', searchHub]]) {
  const cards = (html.match(/class="v79-card"/g) || []).length;
  const tools = (html.match(/class="v79-tool"/g) || []).length;
  if (cards < 10) throw new Error(`Hub card count too low: ${rel} cards=${cards}`);
  if (tools < 5) throw new Error(`Hub tool count too low: ${rel} tools=${tools}`);
}
console.log(`[V79 verify] ok targets=${targets.length} longform=${longformOk}`);
