#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
const requiredFiles = [
  'assets/css/v67.productized-dashboard.css',
  'assets/js/v67.productized-dashboard.js',
  'assets/config/v67-ad-cards.json',
  'scripts/generate-v67-productized-dashboard.mjs',
  'V67_UPGRADE_REPORT.md'
];
const requiredPages = ['index.html','guaranteed/index.html','tools/index.html','consult/index.html','ops/index.html'];
let failures = [];
for (const f of requiredFiles) if (!fs.existsSync(path.join(ROOT,f))) failures.push(`missing file: ${f}`);
for (const p of requiredPages) {
  const file = path.join(ROOT,p);
  if (!fs.existsSync(file)) { failures.push(`missing page: ${p}`); continue; }
  const html = fs.readFileSync(file,'utf8');
  for (const token of ['v67.productized-dashboard.css','v67.productized-dashboard.js','v67-mobile-nav','v67-fab','data-v67-global-header']) {
    if (!html.includes(token)) failures.push(`${p} missing token ${token}`);
  }
}
const vendorData = JSON.parse(fs.readFileSync(path.join(ROOT,'assets/config/v67-ad-cards.json'),'utf8'));
if (!Array.isArray(vendorData.items) || vendorData.items.length < 5) failures.push('ad cards json has fewer than 5 items');
const guaranteed = fs.readFileSync(path.join(ROOT,'guaranteed/index.html'),'utf8');
for (const name of ['SK 홀딩스','여왕벌','ANY BET','UDT BET','땅콩 BET']) if (!guaranteed.includes(name)) failures.push(`guaranteed missing vendor ${name}`);
const tools = fs.readFileSync(path.join(ROOT,'tools/index.html'),'utf8');
for (const token of ['공식주소 확인','보너스 실수령','슬롯 RTP','피싱 URL']) if (!tools.includes(token)) failures.push(`tools missing ${token}`);
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8'));
if (!pkg.scripts.build.includes('generate-v67-productized-dashboard.mjs')) failures.push('package build missing V67 generator');
if (!pkg.scripts.verify.includes('verify-v67-productized.mjs')) failures.push('package verify missing V67 verifier');
if (failures.length) {
  console.error('[V67 VERIFY] failed');
  for (const f of failures) console.error(' - ' + f);
  process.exit(1);
}
console.log('[V67 VERIFY] ok');
