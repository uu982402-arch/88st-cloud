#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
const requiredFiles = [
  'assets/css/v68.ops-revenue-hardening.css',
  'assets/js/v68.ops-revenue-hardening.js',
  'assets/config/v68-ad-cards.json',
  'assets/config/v68-ops-checks.json',
  'scripts/generate-v68-ops-revenue-hardening.mjs',
  'V68_UPGRADE_REPORT.md'
];
const requiredPages = ['index.html','guaranteed/index.html','tools/index.html','consult/index.html','ops/index.html'];
const failures = [];
function read(file){ return fs.readFileSync(path.join(ROOT, file), 'utf8'); }
for (const file of requiredFiles) if (!fs.existsSync(path.join(ROOT, file))) failures.push(`missing file: ${file}`);
for (const page of requiredPages) {
  if (!fs.existsSync(path.join(ROOT, page))) { failures.push(`missing page: ${page}`); continue; }
  const html = read(page);
  for (const token of ['v68.ops-revenue-hardening.css','v68.ops-revenue-hardening.js','v68-mobile-nav','v68-fab','data-v68-global-header','v68-ops-revenue']) {
    if (!html.includes(token)) failures.push(`${page} missing token: ${token}`);
  }
}
const home = read('index.html');
for (const token of ['PREMIUM SAFETY DASHBOARD','빠른 확인','보증업체 TOP 카드']) if (!home.includes(token)) failures.push(`home missing: ${token}`);
for (const token of ['운영점검','배포점검','V68 OPS','.Cloud V68']) if (home.includes(token)) failures.push(`home must not expose ops/version text: ${token}`);
const guaranteed = read('guaranteed/index.html');
for (const token of ['SK 홀딩스','여왕벌','ANY BET','UDT BET','땅콩 BET','코드복사']) if (!guaranteed.includes(token)) failures.push(`guaranteed missing: ${token}`);
const tools = read('tools/index.html');
for (const token of ['공식주소 확인','가입코드 확인','보너스 실수령','피싱 URL']) if (!tools.includes(token)) failures.push(`tools missing: ${token}`);
const consult = read('consult/index.html');
for (const token of ['텔레그램 상담','업체명','가입코드','문의 유형']) if (!consult.includes(token)) failures.push(`consult missing: ${token}`);
const ops = read('ops/index.html');
for (const token of ['V68 OPS','브라우저 점검 실행','v68-check-grid','data-v68-ops-root','운영점검','배포점검']) if (!ops.includes(token)) failures.push(`ops missing: ${token}`);
const vendors = JSON.parse(read('assets/config/v68-ad-cards.json'));
if (!Array.isArray(vendors.items) || vendors.items.length !== 5) failures.push('v68 ad json must contain exactly 5 items');
if (!vendors.items.every(v => typeof v.weight === 'number' && v.enabled === true)) failures.push('v68 ad json missing weight/enabled fields');
const checks = JSON.parse(read('assets/config/v68-ops-checks.json'));
if (!Array.isArray(checks.checks) || checks.checks.length < 8) failures.push('v68 ops checks fewer than 8');
const pkg = JSON.parse(read('package.json'));
if (!pkg.scripts.build.includes('generate-v68-ops-revenue-hardening.mjs')) failures.push('package build missing V68 generator');
if (!pkg.scripts.verify.includes('verify-v68-ops-revenue.mjs')) failures.push('package verify missing V68 verifier');
const htmlFiles = [];
function walk(dir){
  for (const ent of fs.readdirSync(dir, { withFileTypes:true })){
    if (ent.name.startsWith('.') || ent.name === 'node_modules') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.isFile() && ent.name.endsWith('.html')) htmlFiles.push(p);
  }
}
walk(ROOT);
let missingV68 = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('v68.ops-revenue-hardening.css') || !html.includes('v68.ops-revenue-hardening.js')) missingV68 += 1;
}
if (missingV68 > 0) failures.push(`${missingV68} html files missing V68 css/js`);
let publicOpsLeak = 0;
for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  if (rel.startsWith('ops/')) continue;
  const html = fs.readFileSync(file, 'utf8');
  if (/운영점검|배포점검|\.Cloud V68|88ST\.Cloud V68|V68 OPS|빠른 점검|현재 버전 안내/.test(html)) publicOpsLeak += 1;
}
if (publicOpsLeak > 0) failures.push(`${publicOpsLeak} public html files expose ops/version text`);

if (failures.length) {
  console.error('[V68 VERIFY] failed');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}
console.log(`[V68 VERIFY] ok html=${htmlFiles.length} vendors=${vendors.items.length} checks=${checks.checks.length}`);
