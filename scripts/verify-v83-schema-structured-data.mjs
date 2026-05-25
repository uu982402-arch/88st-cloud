import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const VERSION = 'V83_SCHEMA_STRUCTURED_DATA_ACTIVE';

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) out.push(full);
  }
  return out;
}

function fail(message) {
  console.error(`[V83 verify] ${message}`);
  process.exit(1);
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
if (!pkg.scripts?.build?.includes('node scripts/generate-v83-schema-structured-data.mjs')) {
  fail('package.json build script does not include generate-v83-schema-structured-data.mjs');
}
if (pkg.scripts?.verify !== 'node scripts/verify-v83-schema-structured-data.mjs') {
  fail('package.json verify script is not V83 schema verifier');
}

const htmlFiles = walk(ROOT);
let markerCount = 0;
let schemaCount = 0;
let blogPosting = 0;
let article = 0;
let software = 0;
let itemList = 0;
let breadcrumb = 0;
let invalid = [];
let legacyV36 = [];

for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const r = rel(file);
  if (!text.includes(VERSION)) invalid.push(`${r}: missing V83 marker`);
  const matches = [...text.matchAll(/<script\s+type=["']application\/ld\+json["']\s+data-rust-schema=["']v83["']>([\s\S]*?)<\/script>/gi)];
  if (matches.length !== 1) invalid.push(`${r}: expected exactly one V83 JSON-LD script, got ${matches.length}`);
  if (/data-v36-schema=["']primary["']/i.test(text)) legacyV36.push(r);
  markerCount += text.includes(VERSION) ? 1 : 0;
  schemaCount += matches.length;
  for (const m of matches) {
    try {
      const data = JSON.parse(m[1]);
      const graph = Array.isArray(data['@graph']) ? data['@graph'] : [];
      const types = graph.flatMap(node => Array.isArray(node['@type']) ? node['@type'] : [node['@type']]).filter(Boolean);
      if (types.includes('BlogPosting')) blogPosting += 1;
      if (types.includes('Article')) article += 1;
      if (types.includes('SoftwareApplication')) software += 1;
      if (types.includes('ItemList')) itemList += 1;
      if (types.includes('BreadcrumbList')) breadcrumb += 1;
      if (!types.includes('WebPage') && !types.includes('CollectionPage') && !types.includes('ContactPage')) {
        invalid.push(`${r}: missing page-level schema type`);
      }
    } catch (err) {
      invalid.push(`${r}: invalid JSON-LD ${err.message}`);
    }
  }
}

for (const required of ['index.html', 'blog/index.html', 'tools/index.html', 'guaranteed/index.html', 'consult/index.html', 'sports-check/index.html', 'search-guides/index.html']) {
  const file = path.join(ROOT, required);
  if (!fs.existsSync(file)) fail(`missing required page ${required}`);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(VERSION)) fail(`required page missing V83 marker: ${required}`);
}

if (legacyV36.length) {
  fail(`legacy v36 schema scripts remain: ${legacyV36.slice(0, 10).join(', ')}`);
}
if (invalid.length) {
  fail(`schema verification failed:\n${invalid.slice(0, 30).join('\n')}`);
}
if (blogPosting < 20) fail(`expected at least 20 BlogPosting schemas, got ${blogPosting}`);
if (article < 20) fail(`expected at least 20 Article schemas, got ${article}`);
if (software < 8) fail(`expected at least 8 SoftwareApplication schemas, got ${software}`);
if (itemList < 5) fail(`expected at least 5 ItemList schemas, got ${itemList}`);
if (breadcrumb < htmlFiles.length) fail(`expected BreadcrumbList on every HTML page, got ${breadcrumb}/${htmlFiles.length}`);

console.log(`[V83 verify] ok html=${htmlFiles.length} marker=${markerCount} schema=${schemaCount} BlogPosting=${blogPosting} Article=${article} SoftwareApplication=${software} ItemList=${itemList}`);
