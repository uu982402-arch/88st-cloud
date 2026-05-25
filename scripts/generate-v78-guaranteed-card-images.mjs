import fs from 'fs';
import path from 'path';

const root = process.cwd();
const version = 'static-v78-guaranteed-card-images-20260524';

const vendors = [
  { slug: 'sk-holdings', partner: 'v71-sk-holdings', label: 'SK 홀딩스', image: '/assets/img/guaranteed/cards/sk-holdings.webp' },
  { slug: 'queenbee', partner: 'v71-queenbee', label: '여왕벌', image: '/assets/img/guaranteed/cards/queenbee.webp' },
  { slug: 'anybet', partner: 'v71-anybet', label: 'ANY BET', image: '/assets/img/guaranteed/cards/anybet.webp' },
  { slug: 'udt-bet', partner: 'v71-udt-bet', label: 'UDT BET', image: '/assets/img/guaranteed/cards/udt-bet.webp', detailSlug: 'udt' },
  { slug: 'ddangkong-bet', partner: 'v71-ddangkong-bet', label: '땅콩 BET', image: '/assets/img/guaranteed/cards/ddangkong-bet.webp', detailSlug: 'ddangkong' },
];

const replacementMap = new Map([
  ['/assets/img/guaranteed/cards/sk-holdings.svg', '/assets/img/guaranteed/cards/sk-holdings.webp'],
  ['/assets/img/guaranteed/cards/queenbee.svg', '/assets/img/guaranteed/cards/queenbee.webp'],
  ['/assets/img/guaranteed/cards/anybet.svg', '/assets/img/guaranteed/cards/anybet.webp'],
  ['/assets/img/guaranteed/cards/udt-bet.svg', '/assets/img/guaranteed/cards/udt-bet.webp'],
  ['/assets/img/guaranteed/cards/ddangkong-bet.svg', '/assets/img/guaranteed/cards/ddangkong-bet.webp'],
  ['/assets/img/partners/v71-sk-holdings.svg', '/assets/img/partners/v71-sk-holdings.webp'],
  ['/assets/img/partners/v71-queenbee.svg', '/assets/img/partners/v71-queenbee.webp'],
  ['/assets/img/partners/v71-anybet.svg', '/assets/img/partners/v71-anybet.webp'],
  ['/assets/img/partners/v71-udt-bet.svg', '/assets/img/partners/v71-udt-bet.webp'],
  ['/assets/img/partners/v71-ddangkong-bet.svg', '/assets/img/partners/v71-ddangkong-bet.webp'],
]);

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function write(rel, content) {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), content);
}
function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

for (const vendor of vendors) {
  const imgRel = vendor.image.replace(/^\//, '');
  const partnerRel = `assets/img/partners/${vendor.partner}.webp`;
  if (!exists(imgRel)) {
    throw new Error(`Missing guaranteed card image: ${imgRel}`);
  }
  if (!exists(partnerRel)) {
    throw new Error(`Missing main partner image: ${partnerRel}`);
  }
}

let touched = 0;
for (const file of walk(root)) {
  if (!file.endsWith('.html')) continue;
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  for (const [from, to] of replacementMap.entries()) {
    html = html.split(from).join(to);
  }
  html = html.replace(/data-v74-1-detail-image-map="([^"]+)\.svg"/g, (m, p1) => `data-v74-1-detail-image-map="${p1}.webp"`);
  html = html.replace(/<meta name="v74-1-detail-image-map" content="([^"]+)\.svg">/g, (m, p1) => `<meta name="v74-1-detail-image-map" content="${p1}.webp">`);
  html = html.replace(/<meta name="v78-guaranteed-card-images" content="[^"]*">/g, '');
  if (html.includes('/assets/img/guaranteed/cards/') || html.includes('/assets/img/partners/')) {
    html = html.replace('</head>', `  <meta name="v78-guaranteed-card-images" content="${version}">\n</head>`);
  }
  if (html !== before) {
    fs.writeFileSync(file, html);
    touched++;
  }
}

const css = `
/* V78 guaranteed card image application */
.v74-1-image-link,
.v71-partner-card {
  background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(244,246,248,.95)) !important;
}
.v74-1-image-link img,
.v71-partner-card img {
  object-fit: cover;
  object-position: center;
}
.v74-1-image-link::after,
.v71-partner-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 0%, rgba(246,201,107,.12), transparent 45%);
  mix-blend-mode: multiply;
}
.v74-1-vendor-card .v74-1-image-link {
  box-shadow: inset 0 1px 0 rgba(255,255,255,.55), 0 12px 30px rgba(0,0,0,.28);
}
`.trim() + '\n';
write('assets/css/v78.guaranteed-card-images.css', css);

for (const rel of ['index.html','guaranteed/index.html','guaranteed/sk-holdings/index.html','guaranteed/queenbee/index.html','guaranteed/anybet/index.html','guaranteed/udt/index.html','guaranteed/ddangkong/index.html']) {
  if (!exists(rel)) continue;
  let html = read(rel);
  if (!html.includes('/assets/css/v78.guaranteed-card-images.css')) {
    html = html.replace('</head>', `  <link rel="stylesheet" href="/assets/css/v78.guaranteed-card-images.css?v=${version}" data-v78-guaranteed-images="true">\n</head>`);
    write(rel, html);
  }
}

const manifest = {
  version,
  generatedAt: new Date().toISOString(),
  touchedHtml: touched,
  vendors: vendors.map(v => ({ label: v.label, image: v.image, mainPreview: `/assets/img/partners/${v.partner}.webp` })),
  changedReferences: Object.fromEntries(replacementMap),
  note: 'V78 applies the delivered advertising card images to guaranteed cards, vendor detail hero images, and main page partner preview cards without deleting existing routes.'
};
write('V78_GUARANTEED_CARD_IMAGES_MANIFEST.json', JSON.stringify(manifest, null, 2) + '\n');

// Keep V78 as the final verification target because V77 generator rewrites the verify script.
const packagePath = path.join(root, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  const v78Build = 'node scripts/generate-v78-guaranteed-card-images.mjs';
  const genBuild = 'node scripts/gen-build-ver.mjs';
  let build = pkg.scripts.build || '';
  build = build.replace(/\s*&&\s*node scripts\/generate-v78-guaranteed-card-images\.mjs/g, '');
  if (build.includes(genBuild)) build = build.replace(genBuild, `${genBuild} && ${v78Build}`);
  else if (build.trim()) build = `${build} && ${v78Build}`;
  else build = v78Build;
  pkg.scripts.build = build;
  pkg.scripts.verify = 'node scripts/verify-v78-guaranteed-card-images.mjs';
  pkg.scripts['quality:v78'] = 'node scripts/generate-v78-guaranteed-card-images.mjs';
  pkg.scripts['verify:v78'] = 'node scripts/verify-v78-guaranteed-card-images.mjs';
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
}

console.log(`[V78] guaranteed card images applied. touched=${touched}, vendors=${vendors.length}`);
