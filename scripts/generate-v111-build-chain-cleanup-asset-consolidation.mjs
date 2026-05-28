import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const removed=['faq','consult-motives','consult-result','provider-updates'];
const corePages=['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html','guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html'];
const css='/assets/css/v111-build-chain-cleanup-asset-consolidation.css?v=v111-build-chain-cleanup-asset-consolidation-20260528';
const js='/assets/js/v111-build-chain-cleanup-asset-consolidation.js?v=v111-build-chain-cleanup-asset-consolidation-20260528';
const inject=`  <meta name="v111-build-chain-cleanup-asset-consolidation" content="V111_BUILD_CHAIN_CLEANUP_ASSET_CONSOLIDATION_ACTIVE">\n  <link rel="stylesheet" href="${css}" data-v111-build-chain-cleanup="true">\n  <script defer src="${js}" data-v111-build-chain-cleanup="true"></script>\n`;
for (const r of removed) {
  const p=path.join(ROOT,r);
  if (fs.existsSync(p)) fs.rmSync(p,{recursive:true,force:true});
}
for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
  const p=path.join(ROOT,sm);
  if (!fs.existsSync(p)) continue;
  const before=fs.readFileSync(p,'utf8');
  const after=before.split(/\r?\n/).filter(line=>!removed.some(r=>line.includes(`/${r}/`)||line.includes(`/${r}<`))).join('\n');
  fs.writeFileSync(p,after+(before.endsWith('\n')?'\n':''));
}
for (const rel of corePages) {
  const p=path.join(ROOT,rel);
  if (!fs.existsSync(p)) continue;
  let html=fs.readFileSync(p,'utf8');
  if (!html.includes('data-v111-build-chain-cleanup="active"')) html=html.replace(/<html([^>]*)>/, '<html$1 data-v111-build-chain-cleanup="active">');
  if (!html.includes('v111-build-chain-cleanup-asset-consolidation.css')) html=html.replace('</head>', inject+'</head>');
  if (!html.includes('data-v111-build-chain-cleanup="true"')) html=html.replace(/<body([^>]*)>/, '<body$1 data-v111-build-chain-cleanup="true">');
  fs.writeFileSync(p,html);
}
fs.writeFileSync(path.join(ROOT,'build.txt'),'88ST.Cloud build V111 BUILD CHAIN CLEANUP / ASSET CONSOLIDATION PATCH\n2026-05-28T00:00:00Z\n');
fs.writeFileSync(path.join(ROOT,'assets/js/build.ver.js'),"window.__RUST_BUILD_VERSION__ = 'V111-BUILD-CHAIN-CLEANUP-ASSET-CONSOLIDATION-20260528';\nwindow.__RUST_BUILD_LABEL__ = 'V111 BUILD CHAIN CLEANUP / ASSET CONSOLIDATION PATCH';\n");
console.log('[V111] build chain cleanup / asset consolidation applied');
