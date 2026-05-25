import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const REPORT = path.join(ROOT, 'assets', 'data', 'v95-safe-cleanup-report.json');
function fail(message) { console.error(`[V95 verify] ${message}`); process.exit(1); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function walk(dir, predicate = () => true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, predicate));
    else if (entry.isFile() && predicate(full)) out.push(full);
  }
  return out;
}

if (!fs.existsSync(REPORT)) fail('missing v95 cleanup report');
const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
if (report.version !== 'V95_SAFE_CLEANUP_ACTIVE') fail('invalid report version');
if (!Array.isArray(report.deleted)) fail('deleted list missing');
if (!Array.isArray(report.unusedCandidates)) fail('unused candidate list missing');

const pkg = JSON.parse(read('package.json'));
if (!String(pkg.scripts?.build || '').includes('node scripts/generate-v95-safe-cleanup.mjs')) fail('build chain missing V95 generator');
if (String(pkg.scripts?.verify || '') !== 'node scripts/verify-v95-safe-cleanup.mjs') fail('verify script is not V95 verifier');

const htmlFiles = walk(ROOT, f => f.endsWith('.html'));
if (htmlFiles.length < 600) fail(`html count unexpectedly low: ${htmlFiles.length}`);
let marked = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('data-v95-safe-cleanup="active"')) marked += 1;
}
if (marked < 600) fail(`V95 marker missing from too many HTML files: ${marked}/${htmlFiles.length}`);

const required = [
  'index.html',
  'blog/index.html',
  'tools/index.html',
  'guaranteed/index.html',
  'consult/index.html',
  'sports-check/index.html',
  'search-guides/index.html',
  'ops/index.html'
];
for (const rel of required) {
  if (!fs.existsSync(path.join(ROOT, rel))) fail(`required route missing: ${rel}`);
}

const forbiddenDeleted = ['assets/img/rust/rust-crest-transparent.png', 'assets/img/guaranteed/cards/sk-holdings.webp', 'assets/js/v89.ga4-event-depth.js'];
for (const rel of forbiddenDeleted) {
  if (!fs.existsSync(path.join(ROOT, rel))) fail(`required asset accidentally removed: ${rel}`);
}

for (const item of report.deleted) {
  if (fs.existsSync(path.join(ROOT, item.path))) fail(`deleted file still exists: ${item.path}`);
  if (!item.path.startsWith('assets/data/')) fail(`unsafe deletion outside assets/data: ${item.path}`);
}

console.log(`[V95 verify] ok html=${htmlFiles.length} marked=${marked} deleted=${report.deleted.length}`);
