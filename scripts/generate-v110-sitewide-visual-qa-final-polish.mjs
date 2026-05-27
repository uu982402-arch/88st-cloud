import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const version = 'v110-sitewide-visual-qa-final-polish-20260526';
const corePages = ['index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','sports-check/index.html','search-guides/index.html','ops/index.html','guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html'];
const css = 'assets/css/v110-sitewide-visual-qa-final-polish.css';
const js = 'assets/js/v110-sitewide-visual-qa-final-polish.js';
if (!fs.existsSync(path.join(ROOT, css))) throw new Error(`missing ${css}`);
if (!fs.existsSync(path.join(ROOT, js))) throw new Error(`missing ${js}`);
const meta = '  <meta name="v110-sitewide-visual-qa-final-polish" content="V110_SITEWIDE_VISUAL_QA_FINAL_POLISH_ACTIVE">\n';
const link = `  <link rel="stylesheet" href="/${css}?v=${version}" data-v110-sitewide-visual-qa="true">\n`;
const script = `  <script defer src="/${js}?v=${version}" data-v110-sitewide-visual-qa="true"></script>\n`;
for (const rel of corePages) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-v110-sitewide-visual-qa="active"')) {
    html = html.replace(/<html([^>]*)>/, '<html$1 data-v110-sitewide-visual-qa="active">');
  }
  if (!html.includes('/assets/css/v110-sitewide-visual-qa-final-polish.css')) {
    html = html.replace('</head>', meta + link + script + '</head>');
  }
  if (!html.includes('data-v110-sitewide-visual-qa="true"')) {
    html = html.replace(/<body([^>]*)>/, '<body$1 data-v110-sitewide-visual-qa="true">');
  }
  fs.writeFileSync(file, html);
}
fs.writeFileSync(path.join(ROOT, 'build.txt'), '88ST.Cloud build V110 SITEWIDE VISUAL QA FINAL POLISH PATCH\n2026-05-26T09:10:00.000Z\n');
fs.writeFileSync(path.join(ROOT, 'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V110-SITEWIDE-VISUAL-QA-FINAL-POLISH-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V110 SITEWIDE VISUAL QA FINAL POLISH PATCH';\n");
console.log('[V110] sitewide visual QA final polish applied');
