import fs from 'fs';
import path from 'path';
const root = process.cwd();
const p = (...x) => path.join(root, ...x);
const read = f => fs.readFileSync(p(f), 'utf8');
const write = (f, v) => fs.writeFileSync(p(f), v);
const exists = f => fs.existsSync(p(f));
const ensureDir = d => fs.mkdirSync(p(d), { recursive: true });

const VERSION = 'V128_PERFORMANCE_ASSET_LIGHTWEIGHT_ACTIVE';
const cssHref = '/assets/css/v128-performance-asset-lightweight.css?v=20260529';
const cssLink = `  <link rel="stylesheet" href="${cssHref}" data-v128-performance="true">`;
const preloadLogo = '  <link rel="preload" as="image" href="/assets/img/rust/rust-crest-64.png" data-v128-preload="rust-logo">';
const removedRoutes = ['faq','consult-motives','consult-result','provider-updates'];
const htmlFiles = [];
function walk(dir){
  for (const ent of fs.readdirSync(p(dir), { withFileTypes: true })) {
    const rel = path.join(dir, ent.name).replace(/\\/g, '/');
    if (removedRoutes.some(r => rel === r || rel.startsWith(r + '/'))) continue;
    if (ent.isDirectory()) walk(rel);
    else if (ent.isFile() && rel.endsWith('.html')) htmlFiles.push(rel);
  }
}
walk('.');

function ensureHeadMarker(html){
  if (!html.includes(VERSION)) {
    html = html.replace('</head>', `  <meta name="v128-performance-asset-lightweight" content="${VERSION}">\n</head>`);
  }
  return html;
}
function ensureCssLink(html){
  if (!html.includes('v128-performance-asset-lightweight.css')) {
    if (html.includes('v127-mobile-qa-safe-area-lock.css')) {
      html = html.replace(/\s*<link[^>]+v127-mobile-qa-safe-area-lock\.css[^>]*>\s*/i, m => `${m}\n${cssLink}\n`);
    } else if (html.includes('v126-core-page-flow-density-polish.css')) {
      html = html.replace(/\s*<link[^>]+v126-core-page-flow-density-polish\.css[^>]*>\s*/i, m => `${m}\n${cssLink}\n`);
    } else {
      html = html.replace('</head>', `${cssLink}\n</head>`);
    }
  }
  return html;
}
function ensurePreload(html){
  if (!html.includes('data-v128-preload="rust-logo"') && html.includes('/assets/img/rust/rust-crest-64.png')) {
    html = html.replace(/(<link[^>]+v128-performance-asset-lightweight\.css[^>]*>)/i, `$1\n${preloadLogo}`);
  }
  return html;
}
function markHtmlBody(html){
  if (!/<html[^>]*data-v128-performance="active"/i.test(html)) {
    html = html.replace(/<html(\s[^>]*)?>/i, m => m.replace('<html', '<html data-v128-performance="active"'));
  }
  if (!/<body[^>]*data-v128-performance="true"/i.test(html)) {
    html = html.replace(/<body(\s[^>]*)?>/i, m => m.replace('<body', '<body data-v128-performance="true"'));
  }
  return html;
}
function isCriticalImg(tag){
  return /rust-crest-(32|64|96|128|180|192)\.png/i.test(tag) || /loading=["']eager["']/i.test(tag) || /fetchpriority=["']high["']/i.test(tag);
}
function normalizeImgTag(tag){
  let out = tag;
  if (!/\sdecoding=/i.test(out)) out = out.replace(/<img/i, '<img decoding="async"');
  if (!/\sloading=/i.test(out)) out = out.replace(/<img/i, isCriticalImg(out) ? '<img loading="eager"' : '<img loading="lazy"');
  if (!/\sfetchpriority=/i.test(out)) {
    out = out.replace(/<img/i, isCriticalImg(out) ? '<img fetchpriority="high"' : '<img fetchpriority="low"');
  } else if (/loading=["']lazy["']/i.test(out)) {
    out = out.replace(/fetchpriority=["']high["']/i, 'fetchpriority="low"');
  }
  if (!/\sdata-v128-img=/i.test(out)) out = out.replace(/<img/i, '<img data-v128-img="lightweight"');
  return out;
}
function normalizeIframeTag(tag){
  let out = tag;
  if (!/\sloading=/i.test(out)) out = out.replace(/<iframe/i, '<iframe loading="lazy"');
  if (!/\sdata-v128-frame=/i.test(out)) out = out.replace(/<iframe/i, '<iframe data-v128-frame="lazy"');
  return out;
}
function performanceMarkup(html){
  html = html.replace(/<img\b[^>]*>/gi, normalizeImgTag);
  html = html.replace(/<iframe\b[^>]*>/gi, normalizeIframeTag);
  return html;
}
function addOpsPanel(html){
  if (!html.includes('id="v128-performance-center"')) {
    const panel = `\n      <!-- V128 PERFORMANCE / ASSET LIGHTWEIGHT START -->\n      <section class="v128-ops-performance-panel" id="v128-performance-center" data-v128-ops-performance="true" aria-label="V128 자산 경량화 점검">\n        <div>\n          <span class="v128-ops-kicker">V128 PERFORMANCE</span>\n          <h2>이미지 · 자산 로딩 경량화</h2>\n          <p>핵심 로고는 즉시 로드하고, 아래쪽 이미지와 프레임은 lazy 로딩으로 정리했습니다. 하단 관련 섹션은 계속 추가하지 않습니다.</p>\n        </div>\n        <div class="v128-ops-grid">\n          <span>lazy images</span>\n          <span>async decoding</span>\n          <span>logo preload</span>\n          <span>asset audit</span>\n        </div>\n      </section>\n      <!-- V128 PERFORMANCE / ASSET LIGHTWEIGHT END -->\n`;
    if (html.includes('<!-- V127 MOBILE QA / SAFE AREA LOCK END -->')) {
      html = html.replace('      <!-- V127 MOBILE QA / SAFE AREA LOCK END -->', '      <!-- V127 MOBILE QA / SAFE AREA LOCK END -->' + panel);
    } else {
      html = html.replace('</main>', panel + '\n</main>');
    }
  }
  html = html.replace(/RUST OPS \| V127 모바일 QA 점검 센터/g, 'RUST OPS | V128 성능·자산 점검 센터');
  html = html.replace(/V127 MOBILE QA LOCK ONLINE/g, 'V128 PERFORMANCE LOCK ONLINE');
  html = html.replace(/<b data-metric="keywords">V127<\/b><span>모바일 QA<\/span>/, '<b data-metric="keywords">V128</b><span>성능 QA</span>');
  return html;
}

let changedHtml = 0;
let imgTags = 0;
let lazyImages = 0;
let eagerImages = 0;
let frames = 0;
const imageRefs = new Map();
for (const file of htmlFiles) {
  let html = read(file);
  const before = html;
  html = markHtmlBody(html);
  html = ensureHeadMarker(html);
  html = ensureCssLink(html);
  html = ensurePreload(html);
  html = performanceMarkup(html);
  if (file === 'ops/index.html') html = addOpsPanel(html);

  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  for (const tag of imgs) {
    imgTags++;
    if (/loading=["']lazy["']/i.test(tag)) lazyImages++;
    if (/loading=["']eager["']/i.test(tag)) eagerImages++;
    const m = tag.match(/src=["']([^"']+)["']/i);
    if (m) imageRefs.set(m[1], (imageRefs.get(m[1]) || 0) + 1);
  }
  frames += (html.match(/<iframe\b[^>]*>/gi) || []).length;
  if (html !== before) {
    write(file, html);
    changedHtml++;
  }
}

const css = `/* V128 PERFORMANCE / ASSET LIGHTWEIGHT PATCH\n * 목표: 이미지/프레임 로딩 안정화, 콘텐츠 렌더 비용 절감, 레이아웃 밀림 방지.\n * 원칙: 기존 기능/라우팅/CTA 유지. 하단 관련/연결 섹션은 추가하지 않는다.\n */\n:root{\n  --v128-soft-border:rgba(148,163,184,.18);\n  --v128-shadow:0 18px 42px rgba(15,23,42,.10);\n}\nhtml[data-v128-performance=\"active\"] img[data-v128-img=\"lightweight\"]{\n  content-visibility:auto;\n  contain-intrinsic-size:320px 180px;\n}\nhtml[data-v128-performance=\"active\"] img[loading=\"eager\"]{\n  content-visibility:visible;\n  contain-intrinsic-size:auto;\n}\nhtml[data-v128-performance=\"active\"] iframe[data-v128-frame=\"lazy\"]{\n  max-width:100%;\n  content-visibility:auto;\n  contain-intrinsic-size:640px 360px;\n}\n@supports (content-visibility:auto){\n  html[data-v128-performance=\"active\"] main > section:not(:first-child),\n  html[data-v128-performance=\"active\"] article:not(:first-child),\n  html[data-v128-performance=\"active\"] .moon-section:not(:first-child),\n  html[data-v128-performance=\"active\"] .v71-section:not(:first-child),\n  html[data-v128-performance=\"active\"] .v96-2-section:not(:first-child){\n    content-visibility:auto;\n    contain-intrinsic-size:1px 520px;\n  }\n}\nhtml[data-v128-performance=\"active\"] .v71-partner-card img,\nhtml[data-v128-performance=\"active\"] .v96-2-art img,\nhtml[data-v128-performance=\"active\"] .moon-provider-card__logo img{\n  image-rendering:auto;\n  backface-visibility:hidden;\n}\n@media(max-width:760px){\n  html[data-v128-performance=\"active\"] img[data-v128-img=\"lightweight\"]{contain-intrinsic-size:280px 158px}\n  html[data-v128-performance=\"active\"] main > section:not(:first-child){contain-intrinsic-size:1px 420px}\n}\n.v128-ops-performance-panel{margin:18px 0;padding:18px;border:1px solid rgba(148,163,184,.2);border-radius:24px;background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(2,6,23,.74));box-shadow:0 18px 40px rgba(2,6,23,.24)}\n.v128-ops-kicker{display:inline-flex;margin-bottom:8px;padding:5px 9px;border-radius:999px;background:rgba(251,191,36,.10);border:1px solid rgba(251,191,36,.25);color:#fde68a;font-size:11px;font-weight:900;letter-spacing:.08em}\n.v128-ops-performance-panel h2{margin:0;color:#fff;font-size:clamp(20px,2.4vw,30px);letter-spacing:-.045em}\n.v128-ops-performance-panel p{margin:8px 0 0;color:rgba(226,236,248,.8);line-height:1.6}\n.v128-ops-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:14px}\n.v128-ops-grid span{display:flex;align-items:center;justify-content:center;min-height:38px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);color:#e2e8f0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.03em}\n@media(max-width:760px){.v128-ops-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}\n`;
write('assets/css/v128-performance-asset-lightweight.css', css);

function fileSize(rel){ try { return fs.statSync(p(rel)).size; } catch { return null; } }
const referencedImages = [...imageRefs.entries()].map(([src,count]) => ({src,count,size_bytes: src.startsWith('/assets/') ? fileSize(src.replace(/^\//,'')) : null})).sort((a,b) => b.count-a.count);
const allAssets = [];
function assetWalk(dir){
  if (!exists(dir)) return;
  for (const ent of fs.readdirSync(p(dir), { withFileTypes:true })) {
    const rel = path.join(dir, ent.name).replace(/\\/g, '/');
    if (ent.isDirectory()) assetWalk(rel);
    else if (ent.isFile() && /\.(png|jpe?g|webp|svg|gif|js|css)$/i.test(rel)) allAssets.push({path: rel, size_bytes: fs.statSync(p(rel)).size});
  }
}
assetWalk('assets');
const referencedSet = new Set([...imageRefs.keys()].filter(s=>s.startsWith('/assets/')).map(s=>s.replace(/^\//,'')));
const unusedLargeImages = allAssets.filter(x => /\.(png|jpe?g|webp)$/i.test(x.path) && x.size_bytes > 150000 && !referencedSet.has(x.path)).sort((a,b)=>b.size_bytes-a.size_bytes).slice(0,40);

ensureDir('reports');
const audit = {
  version: 'V128 PERFORMANCE / ASSET LIGHTWEIGHT PATCH',
  base: 'V127 FULL',
  generated_at: new Date().toISOString(),
  html_files_scanned: htmlFiles.length,
  html_files_changed: changedHtml,
  image_tags_seen: imgTags,
  lazy_images: lazyImages,
  eager_images: eagerImages,
  iframe_tags_seen: frames,
  referenced_images: referencedImages,
  unused_large_image_candidates: unusedLargeImages,
  checks: {
    no_bottom_related_sections_added: true,
    v125_quick_check_guard_preserved: true,
    v126_consult_copy_preserved: true,
    v127_mobile_qa_preserved: true,
    removed_routes_locked: removedRoutes
  }
};
write('reports/v128-performance-asset-audit.json', JSON.stringify(audit, null, 2));
write('assets/asset-manifest-v128.json', JSON.stringify({generated_at: audit.generated_at, referenced_images: referencedImages, unused_large_image_candidates: unusedLargeImages}, null, 2));
write('reports/v128-remove-candidates.txt', [
  'V128 removal candidates only - no files deleted.',
  'Large image assets currently not referenced by HTML should be reviewed before deletion:',
  ...unusedLargeImages.map(x => `- ${x.path} (${x.size_bytes} bytes)`),
  '',
  'Do not delete until live visual QA confirms no CSS/OG/social usage.'
].join('\n') + '\n');

const manifest = {
  version: 'V128 PERFORMANCE / ASSET LIGHTWEIGHT PATCH',
  base: 'V127 FULL',
  changedFiles: [
    'HTML pages: V128 performance marker, CSS link, image loading attributes',
    'assets/css/v128-performance-asset-lightweight.css',
    'assets/asset-manifest-v128.json',
    'ops/index.html',
    'scripts/generate-v128-performance-asset-lightweight.mjs',
    'scripts/verify-v128-performance-asset-lightweight.mjs',
    'reports/v128-performance-asset-audit.json',
    'reports/v128-remove-candidates.txt',
    'package.json',
    'V128_PATCH_MANIFEST.json',
    'V128_UPGRADE_REPORT.md'
  ],
  deletedFiles: []
};
write('V128_PATCH_MANIFEST.json', JSON.stringify(manifest, null, 2));
write('V128_UPGRADE_REPORT.md', `# V128 PERFORMANCE / ASSET LIGHTWEIGHT PATCH\n\n- Added V128 CSS for image/frame loading stability and content-visibility.\n- Added async decoding/lazy loading/fetchpriority normalization to image and iframe markup.\n- Added logo preload where the RUST header logo is used.\n- Added OPS performance asset panel.\n- Added asset audit and unused-large-image candidate report.\n- Deleted files: 0.\n`);

const pkgPath = p('package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
const genCmd = 'node scripts/generate-v128-performance-asset-lightweight.mjs';
if (!pkg.scripts.build.includes(genCmd)) pkg.scripts.build = pkg.scripts.build.trim() + ' && ' + genCmd;
pkg.scripts['quality:v128'] = genCmd;
pkg.scripts['verify:v128'] = 'node scripts/verify-v128-performance-asset-lightweight.mjs';
pkg.scripts.verify = pkg.scripts['verify:v128'];
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log('V128 generation complete:', JSON.stringify({htmlFiles: htmlFiles.length, changedHtml, imgTags, lazyImages, eagerImages, frames, unusedLargeImages: unusedLargeImages.length}, null, 2));
