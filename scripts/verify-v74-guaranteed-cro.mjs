import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const file = path.join(ROOT, 'guaranteed', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const required = [
  'V74_GUARANTEED_CRO_ACTIVE',
  'v74.guaranteed-cro.css',
  'v74.guaranteed-cro.js',
  'SK 홀딩스 - IRON888',
  '여왕벌 - SEOA',
  'ANY BET - SEOA',
  'UDT BET - SEOA',
  '땅콩 BET - DDK888',
  'data-v74-go="true"',
  'IMAGE PLACEHOLDER'
];
const forbidden = ['v70-3-mini-hero', 'GUARANTEED CURATION', '<h1', '보증업체를 광고가 아니라'];
const missing = required.filter(x => !html.includes(x));
const forbiddenFound = forbidden.filter(x => html.includes(x));
const cards = (html.match(/class="v74-vendor-card"/g) || []).length;
const buttons = (html.match(/data-v74-go="true"/g) || []).length;
const cssOk = fs.existsSync(path.join(ROOT, 'assets/css/v74.guaranteed-cro.css'));
const jsOk = fs.existsSync(path.join(ROOT, 'assets/js/v74.guaranteed-cro.js'));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const pkgVerifyOk = pkg.scripts.verify === 'node scripts/verify-v74-guaranteed-cro.mjs';
const pkgBuildOk = pkg.scripts.build.includes('node scripts/generate-v74-guaranteed-cro.mjs');
if (missing.length || forbiddenFound.length || cards !== 5 || buttons !== 5 || !cssOk || !jsOk || !pkgVerifyOk || !pkgBuildOk) {
  console.error(JSON.stringify({ok:false, missing, forbiddenFound, cards, buttons, cssOk, jsOk, pkgVerifyOk, pkgBuildOk}, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ok:true, version:'V74', page:'/guaranteed/', cards, buttons, cssOk, jsOk, pkgVerifyOk, pkgBuildOk}, null, 2));
