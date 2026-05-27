import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const fail = (msg) => { console.error('[V110 VERIFY FAIL]', msg); process.exit(1); };
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const corePages = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html','guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html'];
for (const page of corePages) {
  if (!exists(page)) fail(`missing core page: ${page}`);
  const html = read(page);
  if (!html.includes('data-v110-sitewide-visual-qa="active"')) fail(`missing html marker: ${page}`);
  if (!html.includes('/assets/css/v110-sitewide-visual-qa-final-polish.css')) fail(`missing css link: ${page}`);
}
for (const rel of ['assets/css/v110-sitewide-visual-qa-final-polish.css','assets/js/v110-sitewide-visual-qa-final-polish.js','assets/data/v110-sitewide-visual-qa-final-polish.json']) {
  if (!exists(rel)) fail(`missing V110 asset: ${rel}`);
}
const css = read('assets/css/v110-sitewide-visual-qa-final-polish.css');
for (const token of ['overflow-x:hidden','v103-unified-tool-card::before','v74-1-btn--go','v108-result-panel','rust-bottom-nav']) {
  if (!css.includes(token)) fail(`V110 css missing guard token: ${token}`);
}
const index = read('index.html');
if ((index.match(/<h2>프리미엄 보증업체<\/h2>/g) || []).length !== 1) fail('main premium vendor section must exist exactly once');
for (const vendor of ['sk-holdings','zakum','udt','queenbee','ddangkong','anybet']) {
  if (!exists(`guaranteed/${vendor}/index.html`)) fail(`missing vendor detail: ${vendor}`);
  if (!read('guaranteed/index.html').includes(`/guaranteed/${vendor}/`)) fail(`guaranteed index missing vendor link: ${vendor}`);
}
const tools = read('tools/index.html');
const toolOpenCount = (tools.match(/data-v103-open/g) || []).length;
if (toolOpenCount < 4) fail(`new tool open markers too low: ${toolOpenCount}`);
if (/content\s*:\s*["']NEW["']/.test(read('assets/css/v103-1-tools-section-unify.css') || '')) fail('NEW ribbon content rule revived');
for (const route of ['faq','consult-motives','consult-result','provider-updates']) {
  if (exists(route)) fail(`removed route directory regenerated: ${route}`);
  for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
    if (exists(sm) && read(sm).includes(`/${route}/`)) fail(`removed route appears in ${sm}: ${route}`);
  }
}
if (!read('build.txt').includes('V110 SITEWIDE VISUAL QA')) fail('build.txt not updated to V110');
console.log('[V110 VERIFY PASS] sitewide visual QA final polish locked');
