import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const hub = fs.readFileSync(path.join(ROOT, 'guaranteed', 'index.html'), 'utf8');
const vendors = [
  ['sk-holdings', 'SK 홀딩스', 'IRON888', '/assets/img/guaranteed/cards/sk-holdings.svg'],
  ['queenbee', '여왕벌', 'SEOA', '/assets/img/guaranteed/cards/queenbee.svg'],
  ['anybet', 'ANY BET', 'SEOA', '/assets/img/guaranteed/cards/anybet.svg'],
  ['udt', 'UDT BET', 'SEOA', '/assets/img/guaranteed/cards/udt-bet.svg'],
  ['ddangkong', '땅콩 BET', 'DDK888', '/assets/img/guaranteed/cards/ddangkong-bet.svg']
];
const required = [
  'V74_1_GUARANTEED_CARD_LAYOUT_ACTIVE',
  'v74-1.guaranteed-card-layout.css',
  'v74-1-vendor-card',
  '보증 상태',
  '상담 확인',
  '가입코드',
  '상세보기',
  '바로가기',
  'data-v74-go="true"'
];
const forbidden = [
  'SK 홀딩스 - IRON888',
  '여왕벌 - SEOA',
  'ANY BET - SEOA',
  'UDT BET - SEOA',
  '땅콩 BET - DDK888',
  'IMAGE PLACEHOLDER',
  '<h1'
];
const missing = required.filter(x => !hub.includes(x));
const forbiddenFound = forbidden.filter(x => hub.includes(x));
const cards = (hub.match(/class="v74-1-vendor-card"/g) || []).length;
const goButtons = (hub.match(/data-v74-go="true"/g) || []).length;
const missingVendor = [];
for (const [id, name, code, image] of vendors){
  if (!hub.includes(`<h2>${name}</h2>`)) missingVendor.push(`${id}:name`);
  if (!hub.includes(`<code>${code}</code>`)) missingVendor.push(`${id}:code`);
  if (!hub.includes(image)) missingVendor.push(`${id}:hub-image`);
  if (!fs.existsSync(path.join(ROOT, image.replace(/^\//,'')))) missingVendor.push(`${id}:image-file`);
  const detailPath = path.join(ROOT, 'guaranteed', id === 'udt' ? 'udt' : id, 'index.html');
  if (fs.existsSync(detailPath)) {
    const detail = fs.readFileSync(detailPath, 'utf8');
    if (!detail.includes(image)) missingVendor.push(`${id}:detail-image`);
    if (!detail.includes('v74-1-detail-image-map')) missingVendor.push(`${id}:detail-meta`);
  } else {
    missingVendor.push(`${id}:detail-file`);
  }
}
const css = fs.readFileSync(path.join(ROOT, 'assets/css/v74-1.guaranteed-card-layout.css'), 'utf8');
const cssRequired = ['grid-template-columns:repeat(5', 'grid-template-columns:repeat(2', '.v74-1-actions', '.v74-1-info-grid'];
const missingCss = cssRequired.filter(x => !css.includes(x));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const pkgBuildOk = pkg.scripts.build.includes('node scripts/generate-v74-1-guaranteed-card-layout.mjs');
const pkgVerifyOk = pkg.scripts.verify === 'node scripts/verify-v74-1-guaranteed-card-layout.mjs';
if (missing.length || forbiddenFound.length || missingVendor.length || missingCss.length || cards !== 5 || goButtons !== 5 || !pkgBuildOk || !pkgVerifyOk) {
  console.error(JSON.stringify({ok:false, missing, forbiddenFound, missingVendor, missingCss, cards, goButtons, pkgBuildOk, pkgVerifyOk}, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ok:true, version:'V74-1', page:'/guaranteed/', cards, goButtons, images:vendors.length, pkgBuildOk, pkgVerifyOk}, null, 2));
