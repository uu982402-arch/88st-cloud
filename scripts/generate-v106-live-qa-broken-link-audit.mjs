import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V106-LIVE-QA-BROKEN-LINK-AUDIT-20260527';
const LABEL='V106 LIVE QA / BROKEN LINK AUDIT PATCH';
const core=['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html'];
for (const rel of core) {
  const p=path.join(ROOT,rel);
  if (!fs.existsSync(p)) continue;
  let html=fs.readFileSync(p,'utf8');
  if (!html.includes('data-v106-live-qa="active"')) html=html.replace(/<html([^>]*)>/, '<html$1 data-v106-live-qa="active">');
  if (!html.includes('/assets/css/v106-live-qa-broken-link-audit.css')) html=html.replace('</head>', '  <meta name="v106-live-qa-broken-link-audit" content="V106_LIVE_QA_BROKEN_LINK_AUDIT_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v106-live-qa-broken-link-audit.css?v=v106-live-qa-broken-link-audit-20260527" data-v106-live-qa="true">\n  <script defer src="/assets/js/v106-live-qa-broken-link-audit.js?v=v106-live-qa-broken-link-audit-20260527" data-v106-live-qa="true"></script>\n</head>');
  if (!html.includes('data-v106-live-qa="true"')) html=html.replace(/<body([^>]*)>/, '<body$1 data-v106-live-qa="true">');
  fs.writeFileSync(p,html);
}
const removed=['faq','consult-motives','consult-result','provider-updates'];
for (const r of removed) if (fs.existsSync(path.join(ROOT,r))) fs.rmSync(path.join(ROOT,r),{recursive:true,force:true});
for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
  const p=path.join(ROOT,sm); if (!fs.existsSync(p)) continue;
  let text=fs.readFileSync(p,'utf8');
  for (const r of removed) text=text.split('\n').filter(line=>!line.includes(`/${r}/`)).join('\n');
  fs.writeFileSync(p,text);
}
fs.writeFileSync(path.join(ROOT,'build.txt'),`88ST.Cloud build ${VERSION}\n2026-05-27T00:00:00.000Z\n`);
fs.writeFileSync(path.join(ROOT,'assets/js/build.ver.js'),`window.__RUST_BUILD_VERSION__ = '${VERSION}';\nwindow.__RUST_BUILD_LABEL__ = '${LABEL}';\n`);
console.log('[V106] live QA / broken link audit markers applied');
