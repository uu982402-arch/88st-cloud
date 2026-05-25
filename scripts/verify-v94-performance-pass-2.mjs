import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const VERSION = 'V94_PERFORMANCE_PASS_2_ACTIVE';
const REPORT = path.join(ROOT, 'assets', 'data', 'v94-performance-pass-2.json');

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
function fail(msg) { console.error(`[V94 verify] ${msg}`); process.exit(1); }
function norm(src) { return String(src || '').split('#')[0].split('?')[0].trim(); }
function isExternal(src) { return /^https?:\/\//i.test(src) || /^\/\//.test(src) || /^data:/i.test(src) || /^mailto:/i.test(src) || /^tel:/i.test(src); }

const pkgPath = path.join(ROOT, 'package.json');
if (!fs.existsSync(pkgPath)) fail('package.json missing');
const pkg = JSON.parse(read(pkgPath));
if (!String(pkg.scripts?.build || '').includes('node scripts/generate-v94-performance-pass-2.mjs')) fail('build chain missing V94 generator');
if (String(pkg.scripts?.verify || '') !== 'node scripts/verify-v94-performance-pass-2.mjs') fail('verify script is not V94 verifier');
if (!fs.existsSync(REPORT)) fail('V94 performance pass 2 JSON missing');
const report = JSON.parse(read(REPORT));
if (report.version !== VERSION) fail('V94 report version mismatch');
if (!report.summary || report.summary.htmlFiles < 600) fail('V94 report html count unexpectedly low');

const htmlFiles = walk(ROOT, (file) => file.endsWith('.html'));
if (htmlFiles.length < 600) fail(`HTML count unexpectedly low: ${htmlFiles.length}`);
let marker = 0;
const duplicateCss = [];
const duplicateJs = [];
const badScripts = [];
const badImgs = [];
const missingCritical = [];

for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const html = read(file);
  if (html.includes('data-v94-performance="active"')) marker += 1;
  if (!html.includes('data-v94-critical="true"')) missingCritical.push(rel);

  const cssRefs = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => norm(m[1]));
  const cssSeen = new Set();
  for (const href of cssRefs) { if (cssSeen.has(href)) duplicateCss.push(`${rel} -> ${href}`); cssSeen.add(href); }

  const scriptTags = [...html.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi)];
  const jsSeen = new Set();
  for (const m of scriptTags) {
    const tag = m[0];
    const src = norm(m[1]);
    if (jsSeen.has(src)) duplicateJs.push(`${rel} -> ${src}`);
    jsSeen.add(src);
    if (!isExternal(src) && !/\b(async|defer)\b/i.test(tag) && !/type=["']module["']/i.test(tag)) badScripts.push(`${rel} -> ${src}`);
  }

  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  for (const tag of imgs) {
    if (!/\bloading=/i.test(tag)) badImgs.push(`${rel} image missing loading`);
    if (!/\bdecoding=["']async["']/i.test(tag)) badImgs.push(`${rel} image missing decoding=async`);
  }
}

if (marker < htmlFiles.length - 5) fail(`V94 marker too low: ${marker}/${htmlFiles.length}`);
if (missingCritical.length > 5) fail(`V94 critical missing on too many pages: ${missingCritical.slice(0,5).join('; ')}`);
if (duplicateCss.length) fail(`duplicate stylesheet refs remain: ${duplicateCss.slice(0,5).join('; ')}`);
if (duplicateJs.length) fail(`duplicate script refs remain: ${duplicateJs.slice(0,5).join('; ')}`);
if (badScripts.length) fail(`local scripts without defer/async/module: ${badScripts.slice(0,5).join('; ')}`);
if (badImgs.length) fail(`image performance attrs missing: ${badImgs.slice(0,5).join('; ')}`);

const guardPages = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','ops/index.html'];
for (const page of guardPages) {
  const file = path.join(ROOT, page);
  if (!fs.existsSync(file)) fail(`guard page missing: ${page}`);
  const html = read(file);
  if (!html.includes('data-v94-performance="active"')) fail(`guard page missing V94 marker: ${page}`);
}

const v94MdFiles = walk(ROOT, (file) => file.endsWith('.md') && /v94/i.test(path.basename(file)));
if (v94MdFiles.length) fail(`V94 generated unexpected MD files: ${v94MdFiles.slice(0,3).map((f)=>path.relative(ROOT,f)).join(', ')}`);

console.log(`[V94 verify] ok html=${htmlFiles.length} marker=${marker} report=${path.relative(ROOT, REPORT)}`);
