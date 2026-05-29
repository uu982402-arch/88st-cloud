import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const requiredFiles = [
  'index.html',
  'package.json',
  'sitemap.xml',
  'robots.txt',
  'ops/index.html',
  'guaranteed/index.html',
  'tools/index.html',
  'assets/css/v126-core-page-flow-density-polish.css',
  'assets/css/v127-mobile-qa-safe-area-lock.css',
  'assets/css/v128-performance-asset-lightweight.css',
  'assets/css/v129-seo-schema-consult-strip.css',
  'assets/css/v130-final-release-lock.css',
  'scripts/verify-v130-final-release-lock.mjs'
];

const requiredRoutes = [
  'blog/index.html',
  'tools/index.html',
  'guaranteed/index.html',
  'consult/index.html',
  'sports-check/index.html',
  'search-guides/index.html',
  'ops/index.html',
  'guaranteed/sk-holdings/index.html',
  'guaranteed/zakum/index.html',
  'guaranteed/udt/index.html',
  'guaranteed/queenbee/index.html',
  'guaranteed/ddangkong/index.html',
  'guaranteed/anybet/index.html'
];

const bannedPaths = [
  'faq',
  'consult-motives',
  'consult-result',
  'provider-updates'
];

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

const missing = [...requiredFiles, ...requiredRoutes].filter((rel) => !exists(rel));
const bannedExisting = bannedPaths.filter((rel) => exists(rel) || exists(`${rel}/index.html`) || exists(`${rel}.html`));

if (missing.length || bannedExisting.length) {
  const report = {
    ok: false,
    version: 'V130.1_UPLOAD_BUILD_HOTFIX',
    missing,
    bannedExisting,
    generatedAt: new Date().toISOString()
  };
  fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'reports/v130-1-cloudflare-build-safe-report.json'), JSON.stringify(report, null, 2));
  console.error('[V130.1 BUILD SAFE FAIL]', JSON.stringify(report, null, 2));
  process.exit(1);
}

const verify = spawnSync(process.execPath, ['scripts/verify-v130-final-release-lock.mjs'], {
  cwd: ROOT,
  stdio: 'inherit'
});

if (verify.status !== 0) {
  console.error(`[V130.1 BUILD SAFE FAIL] verify script exited with ${verify.status}`);
  process.exit(verify.status ?? 1);
}

const report = {
  ok: true,
  version: 'V130.1_UPLOAD_BUILD_HOTFIX',
  mode: 'cloudflare-pages-static-safe-build',
  note: 'Static files are already materialized. Build validates final release locks instead of regenerating all legacy stages.',
  requiredFiles: requiredFiles.length,
  requiredRoutes: requiredRoutes.length,
  bannedRoutesAbsent: bannedPaths,
  generatedAt: new Date().toISOString()
};

fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'reports/v130-1-cloudflare-build-safe-report.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(ROOT, 'build.txt'), `V130.1_UPLOAD_BUILD_HOTFIX\n${report.generatedAt}\n`);
console.log('[V130.1 BUILD SAFE PASS]', JSON.stringify(report, null, 2));
