import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const fail=(msg)=>{console.error('[V111 VERIFY FAIL]',msg);process.exit(1);};
const exists=(rel)=>fs.existsSync(path.join(ROOT,rel));
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const corePages=['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html','guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html'];
for (const page of corePages) {
  if (!exists(page)) fail(`missing core page: ${page}`);
  const html=read(page);
  if (!html.includes('data-v111-build-chain-cleanup="active"')) fail(`missing html marker: ${page}`);
  if (!html.includes('/assets/css/v111-build-chain-cleanup-asset-consolidation.css')) fail(`missing css link: ${page}`);
  if (!html.includes('/assets/js/v111-build-chain-cleanup-asset-consolidation.js')) fail(`missing js link: ${page}`);
}
for (const rel of ['assets/css/v111-build-chain-cleanup-asset-consolidation.css','assets/js/v111-build-chain-cleanup-asset-consolidation.js','assets/data/v111-build-chain-cleanup-asset-consolidation.json']) if (!exists(rel)) fail(`missing v111 asset: ${rel}`);
const css=read('assets/css/v111-build-chain-cleanup-asset-consolidation.css');
for (const token of ['v103-unified-tool-card','v74-shell.v74-1-grid','v71-desktop-partner-panel','v108-result-panel','rust-bottom-nav','object-fit:contain']) if (!css.includes(token)) fail(`missing css guard token: ${token}`);
const index=read('index.html');
if ((index.match(/<h2>프리미엄 보증업체<\/h2>/g)||[]).length!==1) fail('main premium vendor section must exist exactly once');
const vendors=['sk-holdings','zakum','udt','queenbee','ddangkong','anybet'];
for (const v of vendors) {
  if (!exists(`guaranteed/${v}/index.html`)) fail(`missing vendor detail: ${v}`);
  if (!read('guaranteed/index.html').includes(`/guaranteed/${v}/`)) fail(`guaranteed index missing vendor link: ${v}`);
}
const tools=read('tools/index.html');
const toolOpen=(tools.match(/data-v103-open/g)||[]).length;
if (toolOpen<4) fail(`new tool markers too low: ${toolOpen}`);
const cssFiles=['assets/css/v103-1-tools-section-unify.css','assets/css/v103-2-tools-badge-clean.css','assets/css/v103-3-tools-new-ribbon-clean.css','assets/css/v103-4-tools-guaranteed-live-fix.css','assets/css/v111-build-chain-cleanup-asset-consolidation.css'];
for (const rel of cssFiles) if (exists(rel) && /content\s*:\s*["']NEW["']/.test(read(rel))) fail(`NEW ribbon content rule revived in ${rel}`);
if (!read('index.html').includes('v102-6-hub-rotation-fix.js')) fail('hub rotation script missing from home');
for (const route of ['faq','consult-motives','consult-result','provider-updates']) {
  if (exists(route)) fail(`removed route directory regenerated: ${route}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) if (exists(sm) && read(sm).includes(`/${route}/`)) fail(`removed route appears in ${sm}: ${route}`);
}
const pkg=JSON.parse(read('package.json'));
if (!pkg.scripts.build.includes('generate-v111-build-chain-cleanup-asset-consolidation.mjs')) fail('build chain does not end with V111 generator');
if (pkg.scripts.verify!=='node scripts/verify-v111-build-chain-cleanup-asset-consolidation.mjs') fail('verify script not pointed to V111');
if (!read('build.txt').includes('V111 BUILD CHAIN CLEANUP')) fail('build.txt not updated to V111');
console.log('[V111 VERIFY PASS] build chain cleanup and asset consolidation locked');
