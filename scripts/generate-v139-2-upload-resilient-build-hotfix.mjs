import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V139_2_UPLOAD_RESILIENT_BUILD_HOTFIX';
function p(...parts){ return path.join(ROOT, ...parts); }
function rel(fp){ return path.relative(ROOT, fp).replace(/\\/g, '/'); }
function read(fp){ return fs.readFileSync(fp, 'utf8'); }
function write(fp, s){ fs.mkdirSync(path.dirname(fp), {recursive:true}); fs.writeFileSync(fp, s); }
function walk(dir, out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const ent of fs.readdirSync(dir, {withFileTypes:true})){
    const fp = path.join(dir, ent.name);
    if(ent.isDirectory()){
      if(!['node_modules','.git'].includes(ent.name)) walk(fp, out);
    } else if(ent.isFile()) out.push(fp);
  }
  return out;
}
function updatePackage(){
  const pkgPath = p('package.json');
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(read(pkgPath)) : {scripts:{}};
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = 'node scripts/build-v139-2-cloudflare-pages-safe.mjs';
  pkg.scripts.verify = 'node scripts/verify-v139-2-upload-resilient-build-hotfix.mjs';
  pkg.scripts['quality:v139'] = 'node scripts/generate-v139-blog-content-differentiation-seo-intent.mjs';
  pkg.scripts['verify:v139'] = 'node scripts/verify-v139-blog-content-differentiation-seo-intent.mjs';
  pkg.scripts['quality:v139-1'] = 'node scripts/generate-v139-1-ga4-coverage-hotfix.mjs';
  pkg.scripts['verify:v139-1'] = 'node scripts/verify-v139-1-ga4-coverage-hotfix.mjs';
  pkg.scripts['quality:v139-2'] = 'node scripts/generate-v139-2-upload-resilient-build-hotfix.mjs';
  pkg.scripts['verify:v139-2'] = 'node scripts/verify-v139-2-upload-resilient-build-hotfix.mjs';
  pkg.scripts['verify:deploy'] = 'node scripts/build-v139-2-cloudflare-pages-safe.mjs';
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

updatePackage();

const changed = new Set([
  'package.json',
  'scripts/build-v139-2-cloudflare-pages-safe.mjs',
  'scripts/generate-v139-2-upload-resilient-build-hotfix.mjs',
  'scripts/verify-v139-2-upload-resilient-build-hotfix.mjs',
  'V139_2_PATCH_MANIFEST.json',
  'V139_2_UPGRADE_REPORT.md',
  'reports/v139-2-upload-resilient-build-hotfix-audit.json'
]);

const blogFiles = walk(p('blog')).filter(f => f.endsWith('.html')).sort();
const allHtml = walk(ROOT).filter(f => f.endsWith('.html')).sort();
const existingImportant = [
  'assets/css/v139-blog-content-differentiation.css',
  'assets/css/v138-6-blog-content-seo-refresh.css',
  'assets/css/v138-5-ga4-coverage-hardening.css',
  'assets/css/v138-4-blog-radius-rollback.css',
  'assets/css/v138-3-section-radius-rollback.css',
  'assets/css/v138-2-live-header-text-visibility-fix.css',
  'assets/css/v138-modern-section-radius-dark-fix.css',
  'assets/config/seo.meta.json',
  'scripts/generate-v139-blog-content-differentiation-seo-intent.mjs',
  'scripts/verify-v139-blog-content-differentiation-seo-intent.mjs',
  'scripts/generate-v139-1-ga4-coverage-hotfix.mjs',
  'scripts/verify-v139-1-ga4-coverage-hotfix.mjs',
  'scripts/build-v139-cloudflare-pages-safe.mjs',
  'scripts/build-v139-1-cloudflare-pages-safe.mjs'
].filter(f => fs.existsSync(p(f)));
existingImportant.forEach(f => changed.add(f));

const v139Manifest = fs.existsSync(p('V139_PATCH_MANIFEST.json'));
const v139Report = fs.existsSync(p('V139_UPGRADE_REPORT.md'));
const v1391Manifest = fs.existsSync(p('V139_1_PATCH_MANIFEST.json'));
const v1391Report = fs.existsSync(p('V139_1_UPGRADE_REPORT.md'));

const audit = {
  ok: true,
  version: VERSION,
  reason: 'Cloudflare/GitHub web upload can omit or leave stale root manifest files; V139-2 removes hard dependency on V139_PATCH_MANIFEST.json and validates the actual repository state after regenerating content and GA4 coverage.',
  buildPolicy: 'run V139 generator if present, run V139-1 GA4 repair if present, then backfill V139-2 package/report/manifest and verify repository state without requiring older manifest files',
  htmlFiles: allHtml.length,
  blogHtml: blogFiles.length,
  observedPriorArtifacts: {v139Manifest, v139Report, v1391Manifest, v1391Report},
  deletedFiles: [],
  generatedAt: new Date().toISOString()
};
fs.mkdirSync(p('reports'), {recursive:true});
write(p('reports/v139-2-upload-resilient-build-hotfix-audit.json'), JSON.stringify(audit, null, 2));

const manifest = {
  version: VERSION,
  patchType: 'upload-resilient-build-hotfix',
  rootOverwriteSafe: true,
  fullReplaceSafe: true,
  previousFailureFixed: 'V139.1 BUILD SAFE FAIL: V139 base artifact missing: V139_PATCH_MANIFEST.json',
  changedFiles: Array.from(changed).sort(),
  deletedFiles: [],
  generatedAt: audit.generatedAt
};
write(p('V139_2_PATCH_MANIFEST.json'), JSON.stringify(manifest, null, 2));
write(p('V139_2_UPGRADE_REPORT.md'), `# V139-2 UPLOAD RESILIENT BUILD HOTFIX\n\nV139-1 업로드 실패 원인인 \`V139_PATCH_MANIFEST.json\` 선행 의존성을 제거한 빌드 안전판 패치입니다.\n\n## 수정 내용\n\n- Cloudflare Pages 빌드가 시작 직후 \`V139_PATCH_MANIFEST.json\` 누락으로 중단되지 않도록 수정\n- V139 생성 스크립트가 있으면 먼저 실행하고, 없더라도 과거 manifest 유무만으로 실패하지 않도록 변경\n- V139-1 GA4 복구 스크립트를 V139 생성 후 다시 실행\n- package.json build/verify를 V139-2 체인으로 고정\n- 블로그 콘텐츠/SEO/GA4 검증은 실제 파일 상태 기준으로 유지\n- 삭제 파일 없음\n\n## 유지\n\n- V139 블로그 콘텐츠 차별화 유지\n- V139-1 stale blog GA4 복구 유지\n- V138 계열 디자인/GA4/빌드 안정화 유지\n- faq, consult-motives, consult-result, provider-updates 재생성 금지 유지\n`, 'utf8');

console.log('[V139.2 GENERATE PASS]', JSON.stringify({ok:true, version:VERSION, blogHtml:blogFiles.length, htmlFiles:allHtml.length, observedPriorArtifacts:audit.observedPriorArtifacts}, null, 2));
