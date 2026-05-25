import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const VERSION = 'V84_PERFORMANCE_OPTIMIZATION_ACTIVE';
const REPORT = path.join(ROOT, 'assets', 'data', 'v84-performance-audit.json');

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

function read(file) { return fs.readFileSync(file, 'utf8'); }
function fail(message) { console.error(`[V84 verify] ${message}`); process.exit(1); }

const pkgPath = path.join(ROOT, 'package.json');
if (!fs.existsSync(pkgPath)) fail('package.json missing');
const pkg = JSON.parse(read(pkgPath));
if (!String(pkg.scripts?.build || '').includes('node scripts/generate-v84-performance-optimization.mjs')) fail('build chain missing V84 generator');
if (String(pkg.scripts?.verify || '') !== 'node scripts/verify-v84-performance-optimization.mjs') fail('verify script is not V84 verifier');
if (!fs.existsSync(REPORT)) fail('V84 performance audit JSON missing');

const report = JSON.parse(read(REPORT));
if (report.version !== VERSION) fail('V84 report version mismatch');
if (!report.summary || report.summary.htmlFiles < 600) fail('V84 report html count is unexpectedly low');

const htmlFiles = walk(ROOT, (file) => file.endsWith('.html'));
if (htmlFiles.length < 600) fail(`HTML count unexpectedly low: ${htmlFiles.length}`);

let markerCount = 0;
let criticalCount = 0;
let badLocalScript = [];
let duplicateCssPages = [];
let badImages = [];

for (const file of htmlFiles) {
  const html = read(file);
  if (html.includes('data-v84-performance="active"')) markerCount += 1;
  if (html.includes('data-v84-critical="true"')) criticalCount += 1;

  const scriptTags = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)];
  for (const match of scriptTags) {
    const tag = match[0];
    const src = match[1];
    if (!/^https?:\/\//i.test(src) && !/^\/\//.test(src) && !/\b(async|defer)\b/i.test(tag)) {
      badLocalScript.push(`${path.relative(ROOT, file)} -> ${src}`);
    }
  }

  const styles = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)].map((m) => String(m[1]).split('#')[0]);
  const seen = new Set();
  for (const href of styles) {
    if (seen.has(href)) duplicateCssPages.push(`${path.relative(ROOT, file)} -> ${href}`);
    seen.add(href);
  }

  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
  for (const match of imgs) {
    const tag = match[0];
    if (!/\bdecoding=["']async["']/i.test(tag)) badImages.push(`${path.relative(ROOT, file)} missing decoding`);
    if (!/\bloading=/i.test(tag)) badImages.push(`${path.relative(ROOT, file)} missing loading`);
  }
}

if (markerCount < htmlFiles.length - 5) fail(`V84 marker too low: ${markerCount}/${htmlFiles.length}`);
if (criticalCount < htmlFiles.length - 5) fail(`V84 critical CSS marker too low: ${criticalCount}/${htmlFiles.length}`);
if (badLocalScript.length) fail(`Local scripts without defer/async: ${badLocalScript.slice(0, 5).join('; ')}`);
if (duplicateCssPages.length) fail(`Duplicate stylesheet refs remain: ${duplicateCssPages.slice(0, 5).join('; ')}`);
if (badImages.length) fail(`Image performance attrs missing: ${badImages.slice(0, 5).join('; ')}`);

const corePages = ['index.html', 'blog/index.html', 'tools/index.html', 'guaranteed/index.html', 'consult/index.html', 'ops/index.html'];
for (const page of corePages) {
  const file = path.join(ROOT, page);
  if (!fs.existsSync(file)) fail(`core page missing: ${page}`);
  const html = read(file);
  if (!html.includes('data-v84-performance="active"')) fail(`core page missing V84 marker: ${page}`);
}

console.log(`[V84 verify] ok html=${htmlFiles.length} marker=${markerCount} critical=${criticalCount}`);
