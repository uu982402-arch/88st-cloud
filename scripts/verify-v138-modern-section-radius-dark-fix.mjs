import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const p = (...parts) => path.join(ROOT, ...parts);
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const errors = [];
const warnings = [];
const CSS_REL = 'assets/css/v138-modern-section-radius-dark-fix.css';
const removedRoutes = ['faq', 'consult-motives', 'consult-result', 'provider-updates'];
const requiredRoutes = ['blog', 'tools', 'guaranteed', 'consult', 'sports-check', 'search-guides', 'ops'];
const guaranteedRoutes = ['sk-holdings', 'zakum', 'udt', 'queenbee', 'ddangkong', 'anybet', 'f1'];

function walk(dir, predicate = () => true) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(fp, predicate));
    else if (entry.isFile() && predicate(fp)) out.push(fp);
  }
  return out;
}
const rel = (file) => path.relative(ROOT, file).replace(/\\/g, '/');

for (const f of [CSS_REL,'scripts/generate-v138-modern-section-radius-dark-fix.mjs','scripts/verify-v138-modern-section-radius-dark-fix.mjs','scripts/build-v138-cloudflare-pages-safe.mjs','V138_UPGRADE_REPORT.md','V138_PATCH_MANIFEST.json','reports/v138-modern-section-radius-dark-fix-audit.json']) if (!fs.existsSync(p(f))) errors.push('missing ' + f);
const css = read(p(CSS_REL));
for (const token of ['V138 MODERN SECTION RADIUS','--v138-radius-section','body.v71-main-home','body.v79-rust-longform-body','data-v116-sports-check-polish','data-v117-search-guides-polish','.v73-modal :where(.moon-footer','content:"보증업체"','href="/consult/"']) if (!css.includes(token)) errors.push('V138 css missing token: ' + token);
if (css.includes('background:#fff') || css.includes('background: #fff') || css.includes('background:white')) warnings.push('CSS contains white selector text only; it is expected as override selector, not a light surface.');

for (const route of requiredRoutes) if (!fs.existsSync(p(route, 'index.html'))) errors.push('required route missing index: /' + route + '/');
if (!fs.existsSync(p('index.html'))) errors.push('root index missing');
for (const gr of guaranteedRoutes) if (!fs.existsSync(p('guaranteed', gr, 'index.html'))) errors.push('guaranteed route missing: /guaranteed/' + gr + '/');
const admin = read(p('admin', 'index.html'));
if (!admin) errors.push('/admin/ redirect page missing'); else if (!admin.includes('/ops/') || !admin.includes('noindex')) errors.push('/admin/ must keep /ops/ noindex redirect');

const targetHtml = new Set(['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','ops/index.html','admin/index.html',...guaranteedRoutes.map((x)=>`guaranteed/${x}/index.html`),...walk(p('sports-check'), (fp)=>fp.endsWith('.html')).map(rel),...walk(p('search-guides'), (fp)=>fp.endsWith('.html')).map(rel)]);
for (const r of targetHtml) {
  const h = read(p(r));
  if (!h) errors.push('target html missing ' + r);
  else if (!h.includes(CSS_REL)) errors.push(r + ' missing V138 CSS link');
}
const htmls = walk(ROOT, (fp) => fp.endsWith('.html'));
for (const file of htmls) {
  const h = read(file); const r = rel(file);
  if (h.includes('href="#"')) errors.push(r + ' still contains href="#"');
}

const sportsDetails = walk(p('sports-check'), (fp) => fp.endsWith('.html') && rel(fp) !== 'sports-check/index.html');
const searchDetails = walk(p('search-guides'), (fp) => fp.endsWith('.html') && rel(fp) !== 'search-guides/index.html');
if (sportsDetails.length !== 12) errors.push('sports-check detail count expected 12, got ' + sportsDetails.length);
if (searchDetails.length !== 35) errors.push('search-guides detail count expected 35, got ' + searchDetails.length);
for (const file of [p('sports-check','index.html'), ...sportsDetails, p('search-guides','index.html'), ...searchDetails]) {
  const h = read(file); const r = rel(file);
  if (!h.includes('v79-rust-longform-body')) errors.push(r + ' missing longform dark body class');
  if (!h.includes(CSS_REL)) errors.push(r + ' missing V138 route CSS');
  if ((h.match(/<footer class="moon-footer"/g) || []).length !== 1) errors.push(r + ' footer count not exactly one');
  const mainPos = h.indexOf('<main'); const footerPos = h.indexOf('<footer class="moon-footer"');
  if (footerPos >= 0 && mainPos >= 0 && footerPos < mainPos) errors.push(r + ' footer is before main');
}

const home = read(p('index.html'));
for (const name of ['SK 홀딩스','자쿰','UDT BET','여왕벌','땅콩 BET','ANY BET','광고 문의','F-1']) if (!home.includes(name)) errors.push('home missing guaranteed card text: ' + name);
const cardOrderSource = (home.match(/<div class="v71-partner-tile-grid">[\s\S]*?<\/div>\s*<\/aside>/) || [home])[0];
const order = ['SK 홀딩스','자쿰','UDT BET','여왕벌','땅콩 BET','ANY BET','광고 문의','F-1'].map((x) => cardOrderSource.indexOf(x));
if (order.some((i) => i < 0) || order.some((v, i) => i && v < order[i-1])) errors.push('home guaranteed card order changed');
if (!home.includes(CSS_REL)) errors.push('home missing V138 CSS');

const tools = read(p('tools','index.html'));
if (!tools.includes('v73-modal')) errors.push('/tools/ missing modal structure');
if ((tools.match(/<footer class="moon-footer"/g) || []).length !== 1) errors.push('/tools/ footer count not exactly one');

for (const dir of ['analysis', ...removedRoutes]) if (fs.existsSync(p(dir))) errors.push('removed/excluded route directory exists: ' + dir);
for (const sm of ['sitemap.xml', 'sitemap.txt', 'serverless/sitemap.xml', 'serverless/sitemap.txt']) {
  const s = read(p(sm));
  if (!s) { errors.push('missing ' + sm); continue; }
  for (const route of ['/faq/', '/consult-motives/', '/consult-result/', '/provider-updates/']) if (s.includes('https://88st.cloud' + route) || s.includes(route)) errors.push(sm + ' includes removed route ' + route);
  for (const keep of ['https://88st.cloud/', 'https://88st.cloud/blog/', 'https://88st.cloud/tools/', 'https://88st.cloud/guaranteed/', 'https://88st.cloud/sports-check/', 'https://88st.cloud/search-guides/', 'https://88st.cloud/ops/']) if (!s.includes(keep)) errors.push(sm + ' missing keep URL ' + keep);
}

const manifest = JSON.parse(read(p('V138_PATCH_MANIFEST.json')) || '{}');
if (!Array.isArray(manifest.deletedFiles) || manifest.deletedFiles.length !== 0) errors.push('manifest deletedFiles must be []');
if (!manifest.changedFiles?.includes(CSS_REL)) errors.push('manifest missing CSS file');
const pkg = JSON.parse(read(p('package.json')) || '{}');
if (pkg.scripts?.build !== 'node scripts/build-v138-cloudflare-pages-safe.mjs') errors.push('package build not V138');
if (pkg.scripts?.verify !== 'node scripts/verify-v138-modern-section-radius-dark-fix.mjs') errors.push('package verify not V138');
for (const [name, cmd] of Object.entries(pkg.scripts || {})) for (const mm of cmd.matchAll(/node\s+(scripts\/[^\s&|]+\.mjs)/g)) if (!fs.existsSync(p(mm[1]))) errors.push(`package script ${name} references missing ${mm[1]}`);
const suspicious = walk(p('assets'), (fp) => /\.(js|html|css)$/.test(fp)).concat(fs.existsSync(p('_worker.js')) ? [p('_worker.js')] : []).flatMap((file) => /eval\(|new Function\(|document\.write\(|unescape\(/.test(read(file)) ? [rel(file)] : []);
if (suspicious.length) errors.push('suspicious obfuscation markers: ' + suspicious.slice(0, 10).join(', '));
if (errors.length) { console.error('[V138 VERIFY FAIL]'); for (const e of errors) console.error('- ' + e); if (warnings.length) for (const w of warnings) console.warn('[V138 VERIFY WARN] ' + w); process.exit(1); }
fs.mkdirSync(p('reports'), { recursive: true });
fs.writeFileSync(p('reports/v138-verify-report.json'), JSON.stringify({ok:true,version:'V138_MODERN_SECTION_RADIUS_SPORTS_SEARCH_DARK_TONE_FIX',htmlCount:htmls.length,targetHtmlCount:targetHtml.size,sportsDetailCount:sportsDetails.length,searchGuideDetailCount:searchDetails.length,warnings,generatedAt:new Date().toISOString()}, null, 2));
console.log('[V138 VERIFY PASS] modern section radius + sports/search dark tone fix OK');
