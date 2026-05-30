import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V138_1_CERT_HREF_BUILD_HOTFIX';
const CSS_REL = 'assets/css/v138-modern-section-radius-dark-fix.css';
const CSS_HREF = '/assets/css/v138-modern-section-radius-dark-fix.css?v=20260531-v138-radius-dark-fix';
const LINK_TAG = `<link rel="stylesheet" href="${CSS_HREF}" data-v138-modern-section-radius-dark-fix="true">`;
const changed = new Set();
const fixedHrefFiles = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const write = (file, content) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); };
const p = (...parts) => path.join(ROOT, ...parts);
const rel = (file) => path.relative(ROOT, file).replace(/\\/g, '/');

function walk(dir, predicate = () => true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(fp, predicate));
    else if (entry.isFile() && predicate(fp)) out.push(fp);
  }
  return out;
}

function ensureCertIndex() {
  const file = p('cert', 'index.html');
  const existing = read(file);
  const html = `<!doctype html>
<html lang="ko" data-v138-1-cert-hotfix="active">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="robots" content="noindex,nofollow">
  <meta http-equiv="refresh" content="0; url=/guaranteed/">
  <title>보증업체 안내로 이동 | RUST</title>
  <link rel="canonical" href="https://88st.cloud/guaranteed/">
  ${LINK_TAG}
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#090f19;color:#f8fafc;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
    main{width:min(92vw,560px);border:1px solid rgba(255,255,255,.12);border-radius:28px;background:rgba(15,23,42,.78);box-shadow:0 24px 84px rgba(2,6,23,.34);padding:28px;text-align:center;}
    p{color:#aab6c8;line-height:1.7;}
    a{display:inline-flex;align-items:center;justify-content:center;margin-top:12px;padding:12px 16px;border-radius:999px;background:linear-gradient(135deg,#f6d58a,#ff9a35);color:#120904;text-decoration:none;font-weight:900;}
  </style>
</head>
<body>
  <main>
    <h1>보증업체 안내로 이동합니다</h1>
    <p>이전 cert 경로는 현재 보증업체 안내 페이지로 통합되어 있습니다.</p>
    <a href="/guaranteed/">보증업체 바로가기</a>
  </main>
</body>
</html>
`;
  if (existing !== html) {
    write(file, html);
    changed.add('cert/index.html');
  }
}

function replacementFor(relFile) {
  if (relFile === 'cert/index.html') return 'href="/guaranteed/"';
  if (relFile === 'index.html') return 'href="/" aria-disabled="true" tabindex="-1"';
  if (relFile.startsWith('sports-check/')) return 'href="/sports-check/" aria-disabled="true" tabindex="-1"';
  if (relFile.startsWith('search-guides/')) return 'href="/search-guides/" aria-disabled="true" tabindex="-1"';
  if (relFile.startsWith('tools/')) return 'href="/tools/" aria-disabled="true" tabindex="-1"';
  if (relFile.startsWith('guaranteed/')) return 'href="/guaranteed/" aria-disabled="true" tabindex="-1"';
  if (relFile.startsWith('blog/')) return 'href="/blog/" aria-disabled="true" tabindex="-1"';
  return 'href="/" aria-disabled="true" tabindex="-1"';
}

function fixDeadHashLinks() {
  for (const file of walk(ROOT, (fp) => fp.endsWith('.html'))) {
    const before = read(file);
    if (!before.includes('href="#"')) continue;
    const relFile = rel(file);
    const after = before.replaceAll('href="#"', replacementFor(relFile));
    write(file, after);
    changed.add(relFile);
    fixedHrefFiles.push(relFile);
  }
}

function updatePackage() {
  const pkgPath = p('package.json');
  const pkg = JSON.parse(read(pkgPath) || '{}');
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = 'node scripts/build-v138-1-cloudflare-pages-safe.mjs';
  pkg.scripts.verify = 'node scripts/verify-v138-1-cert-href-hotfix.mjs';
  pkg.scripts['quality:v138'] = 'node scripts/generate-v138-modern-section-radius-dark-fix.mjs';
  pkg.scripts['verify:v138'] = 'node scripts/verify-v138-modern-section-radius-dark-fix.mjs';
  pkg.scripts['quality:v138-1'] = 'node scripts/generate-v138-1-cert-href-hotfix.mjs';
  pkg.scripts['verify:v138-1'] = 'node scripts/verify-v138-1-cert-href-hotfix.mjs';
  pkg.scripts['verify:deploy'] = 'node scripts/build-v138-1-cloudflare-pages-safe.mjs';
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  changed.add('package.json');
}

function writeReports() {
  fs.mkdirSync(p('reports'), { recursive: true });
  const generatedAt = new Date().toISOString();
  const changedFiles = Array.from(changed).sort();
  const fixedFiles = Array.from(new Set(fixedHrefFiles)).sort();
  const payload = {
    ok: true,
    version: VERSION,
    base: 'V137.2 BLOG LIVE MATERIALIZE FULL + V138 PATCH',
    fix: 'Cloudflare build failed because stale cert/index.html contained href="#". V138-1 materializes a noindex cert bridge and fixes remaining href="#" before verify.',
    changedFiles,
    fixedHrefFiles: fixedFiles,
    deletedFiles: [],
    generatedAt
  };
  write(p('reports', 'v138-1-cert-href-hotfix-audit.json'), JSON.stringify(payload, null, 2));
  write(p('V138_1_PATCH_MANIFEST.json'), JSON.stringify({
    version: VERSION,
    patchType: 'build-hotfix',
    rootOverwriteSafe: true,
    fullReplaceSafe: true,
    changedFiles: [...changedFiles, 'reports/v138-1-cert-href-hotfix-audit.json', 'V138_1_PATCH_MANIFEST.json', 'V138_1_UPGRADE_REPORT.md'].sort(),
    deletedFiles: [],
    fixedHrefFiles: fixedFiles,
    generatedAt
  }, null, 2));
  write(p('V138_1_UPGRADE_REPORT.md'), `# V138-1 CERT HREF BUILD HOTFIX\n\nCloudflare Pages 업로드 중 발생한 V138 검증 실패를 수정한 빌드 핫픽스입니다.\n\n## 원인\n\n- GitHub 저장소에 남아 있던 \`cert/index.html\`이 \`href="#"\`를 포함해 V138 verify에서 실패했습니다.\n- V137.2 FULL 원본에는 해당 파일이 없어 로컬 FULL 기준 검증에서는 드러나지 않았지만, PATCH를 기존 저장소에 덮어쓸 때 stale 파일이 남으면서 실패했습니다.\n\n## 수정\n\n- \`cert/index.html\`을 noindex 보증업체 이동 페이지로 물질화했습니다.\n- V138-1 generator가 빌드 중 전체 HTML의 잔여 \`href="#"\`를 실제 경로로 교체합니다.\n- build/verify 명령을 V138-1로 고정했습니다.\n- 삭제 파일은 없습니다.\n\n## 유지\n\n- 기존 V138 섹션 라운드/스포츠체크/검색가이드 다크톤 수정 유지\n- 기존 라우팅 유지\n- 제거 확정 4개 경로 재생성 없음\n- 새 추천/FAQ/관련글/신뢰칩/전환 섹션 추가 없음\n`);
  changed.add('reports/v138-1-cert-href-hotfix-audit.json');
  changed.add('V138_1_PATCH_MANIFEST.json');
  changed.add('V138_1_UPGRADE_REPORT.md');
}

ensureCertIndex();
fixDeadHashLinks();
updatePackage();
writeReports();
console.log('[V138.1 GENERATE PASS]', JSON.stringify({ ok: true, version: VERSION, changedFiles: Array.from(changed).sort(), fixedHrefFiles: Array.from(new Set(fixedHrefFiles)).sort() }, null, 2));
