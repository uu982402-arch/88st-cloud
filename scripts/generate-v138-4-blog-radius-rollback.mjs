import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V138_4_BLOG_RADIUS_ROLLBACK_TEXT_SAFE';
const CSS_REL = 'assets/css/v138-4-blog-radius-rollback.css';
const CSS_HREF = '/assets/css/v138-4-blog-radius-rollback.css?v=20260531-v138-4-blog-rollback';
const LINK_TAG = `<link rel="stylesheet" href="${CSS_HREF}" data-v138-4-blog-radius-rollback="true">`;
const changed = new Set([CSS_REL]);

function p(...parts){return path.join(ROOT, ...parts)}
function read(file){return fs.readFileSync(file,'utf8')}
function write(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data)}
function walk(dir, pred, out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const fp=path.join(dir,ent.name);
    if(ent.isDirectory()) walk(fp,pred,out); else if(!pred || pred(fp)) out.push(fp);
  }
  return out;
}
function rel(fp){return path.relative(ROOT,fp).replace(/\\/g,'/')}

const blogIndex = p('blog/index.html');
if(!fs.existsSync(blogIndex)){
  console.error('[V138.4 GENERATE FAIL] missing blog/index.html');
  process.exit(1);
}

function activateHtmlFlag(html){
  if(html.includes('data-v138-4-blog-radius-rollback="active"')) return html;
  return html.replace(/<html\b(?![^>]*data-v138-4-blog-radius-rollback=)/i, '<html data-v138-4-blog-radius-rollback="active"');
}
function ensureLinkAfterV1383(html){
  if(html.includes('data-v138-4-blog-radius-rollback="true"')) return html;
  const v1383 = /(<link[^>]+data-v138-3-section-radius-rollback="true"[^>]*>)/i;
  const v1382 = /(<link[^>]+data-v138-2-live-header-text-visibility-fix="true"[^>]*>)/i;
  if(v1383.test(html)) return html.replace(v1383, `$1\n  ${LINK_TAG}`);
  if(v1382.test(html)) return html.replace(v1382, `$1\n  ${LINK_TAG}`);
  return html.replace(/<\/head>/i, `  <meta name="v138-4-blog-radius-rollback" content="${VERSION}">\n  ${LINK_TAG}\n</head>`);
}

let html = read(blogIndex);
const before = html;
html = activateHtmlFlag(html);
html = ensureLinkAfterV1383(html);
// Keep actual header text. Previous pseudo-label tricks must not return on blog.
html = html.replace(/(<nav class="rust-desktop-nav"[^>]*>[\s\S]*?<a href="\/guaranteed\/">)보증(<\/a>[\s\S]*?<\/nav>)/g, '$1보증업체$2');
html = html.replace(/(<nav class="rust-mobile-menu"[^>]*>[\s\S]*?<a href="\/guaranteed\/">)보증(<\/a>[\s\S]*?<\/nav>)/g, '$1보증업체$2');
if(html !== before){ write(blogIndex, html); }
changed.add('blog/index.html');

function updatePackage(){
  const pkgPath=p('package.json');
  const pkg=JSON.parse(read(pkgPath)||'{}');
  pkg.scripts=pkg.scripts||{};
  pkg.scripts.build='node scripts/build-v138-4-cloudflare-pages-safe.mjs';
  pkg.scripts.verify='node scripts/verify-v138-4-blog-radius-rollback.mjs';
  pkg.scripts['quality:v138']='node scripts/generate-v138-modern-section-radius-dark-fix.mjs';
  pkg.scripts['verify:v138']='node scripts/verify-v138-modern-section-radius-dark-fix.mjs';
  pkg.scripts['quality:v138-1']='node scripts/generate-v138-1-cert-href-hotfix.mjs';
  pkg.scripts['verify:v138-1']='node scripts/verify-v138-1-cert-href-hotfix.mjs';
  pkg.scripts['quality:v138-2']='node scripts/generate-v138-2-live-header-text-visibility-fix.mjs';
  pkg.scripts['verify:v138-2']='node scripts/verify-v138-2-live-header-text-visibility-fix.mjs';
  pkg.scripts['quality:v138-3']='node scripts/generate-v138-3-section-radius-rollback.mjs';
  pkg.scripts['verify:v138-3']='node scripts/verify-v138-3-section-radius-rollback.mjs';
  pkg.scripts['quality:v138-4']='node scripts/generate-v138-4-blog-radius-rollback.mjs';
  pkg.scripts['verify:v138-4']='node scripts/verify-v138-4-blog-radius-rollback.mjs';
  pkg.scripts['verify:deploy']='node scripts/build-v138-4-cloudflare-pages-safe.mjs';
  write(pkgPath, JSON.stringify(pkg,null,2)+'\n');
  changed.add('package.json');
}

function writeReports(){
  fs.mkdirSync(p('reports'),{recursive:true});
  const generatedAt=new Date().toISOString();
  const changedFiles=Array.from(changed).sort();
  const audit={
    ok:true,
    version:VERSION,
    base:'V137.2 BLOG LIVE MATERIALIZE FULL + V138-3',
    liveObserved:{
      blog:'https://88st.cloud/blog/ text/DOM reachable; user reported blog list visual rollback was not applied after V138-3.',
      cause:'V138-3 only rolled back main/sports/search shells. V138 CSS still targeted .v72-blog-direct and .v72-blog-card globally, leaving the blog list with the oversized rounded-shell/card treatment.'
    },
    fix:[
      'Add late V138-4 CSS only for /blog/ list page.',
      'Revert .v72-blog-direct to transparent layout shell, not a large rounded card.',
      'Keep blog cards dark/glass but restore compact V104 radius/density scale.',
      'Restore V134 season cards to dark cards where older light surface rules exist.',
      'Keep V138-1 cert href hotfix, V138-2 header visibility fix, and V138-3 main section rollback.'
    ],
    forbiddenAdditions:['AI Q&A snippet','FAQ box','trust chip','related/recommendation sections','bottom connection card block','new CTA conversion box'],
    changedFiles,
    deletedFiles:[],
    generatedAt
  };
  write(p('reports','v138-4-blog-radius-rollback-audit.json'), JSON.stringify(audit,null,2));
  const manifest={
    version:VERSION,
    patchType:'blog-radius-rollback-text-safe',
    rootOverwriteSafe:true,
    fullReplaceSafe:true,
    changedFiles:[...new Set([...changedFiles,'reports/v138-4-blog-radius-rollback-audit.json','V138_4_PATCH_MANIFEST.json','V138_4_UPGRADE_REPORT.md'])].sort(),
    deletedFiles:[],
    generatedAt
  };
  write(p('V138_4_PATCH_MANIFEST.json'), JSON.stringify(manifest,null,2));
  const reportMd=[
    '# V138-4 BLOG RADIUS ROLLBACK / TEXT SAFE',
    '',
    '/blog/ 목록 페이지에 남아 있던 V138 라운드형 섹션 쉘 처리를 복구한 핫픽스입니다.',
    '',
    '## 원인',
    '',
    '- V138-3은 메인, 스포츠체크, 검색가이드 중심으로 섹션 라운드 롤백을 처리했습니다.',
    '- 하지만 V138 CSS의 `body :where(.v72-blog-direct, .v72-blog-card)` 전역 처리 때문에 블로그 목록은 큰 라운드 쉘/카드 영향이 남았습니다.',
    '',
    '## 수정',
    '',
    '- `/blog/` 목록의 `.v72-blog-direct`를 투명 레이아웃 쉘로 복구했습니다.',
    '- 블로그 카드는 V104 계열의 촘촘한 다크 카드 비율로 복구했습니다.',
    '- V134 시즌 카드의 과거 흰색 표면 규칙도 V138-4 레이어에서 다크 카드로 고정했습니다.',
    '- 헤더 글자 복구, cert href 빌드 핫픽스, 메인 섹션 롤백은 유지했습니다.',
    '',
    '## 유지',
    '',
    '- 블로그 게시글 본문 수정 없음',
    '- 새 섹션/FAQ/관련글/추천글/신뢰칩 추가 없음',
    '- 기존 라우팅 유지',
    '- 삭제 파일 없음',
    ''
  ].join('\n');
  write(p('V138_4_UPGRADE_REPORT.md'), reportMd);
  changed.add('reports/v138-4-blog-radius-rollback-audit.json');
  changed.add('V138_4_PATCH_MANIFEST.json');
  changed.add('V138_4_UPGRADE_REPORT.md');
}

const deliveryFiles=[
  'scripts/build-v138-cloudflare-pages-safe.mjs','scripts/generate-v138-modern-section-radius-dark-fix.mjs','scripts/verify-v138-modern-section-radius-dark-fix.mjs',
  'scripts/build-v138-1-cloudflare-pages-safe.mjs','scripts/generate-v138-1-cert-href-hotfix.mjs','scripts/verify-v138-1-cert-href-hotfix.mjs',
  'scripts/build-v138-2-cloudflare-pages-safe.mjs','scripts/generate-v138-2-live-header-text-visibility-fix.mjs','scripts/verify-v138-2-live-header-text-visibility-fix.mjs',
  'scripts/build-v138-3-cloudflare-pages-safe.mjs','scripts/generate-v138-3-section-radius-rollback.mjs','scripts/verify-v138-3-section-radius-rollback.mjs',
  'scripts/build-v138-4-cloudflare-pages-safe.mjs','scripts/generate-v138-4-blog-radius-rollback.mjs','scripts/verify-v138-4-blog-radius-rollback.mjs',
  'assets/css/v138-modern-section-radius-dark-fix.css','assets/css/v138-2-live-header-text-visibility-fix.css','assets/css/v138-3-section-radius-rollback.css','assets/css/v138-4-blog-radius-rollback.css',
  'V138_PATCH_MANIFEST.json','V138_UPGRADE_REPORT.md','V138_1_PATCH_MANIFEST.json','V138_1_UPGRADE_REPORT.md','V138_2_PATCH_MANIFEST.json','V138_2_UPGRADE_REPORT.md','V138_3_PATCH_MANIFEST.json','V138_3_UPGRADE_REPORT.md',
  'reports/v138-modern-section-radius-dark-fix-audit.json','reports/v138-verify-report.json','reports/v138-cloudflare-build-safe-report.json',
  'reports/v138-1-cert-href-hotfix-audit.json','reports/v138-1-verify-report.json','reports/v138-1-cloudflare-build-safe-report.json',
  'reports/v138-2-live-header-text-visibility-fix-audit.json','reports/v138-2-verify-report.json','reports/v138-2-cloudflare-build-safe-report.json',
  'reports/v138-3-section-radius-rollback-audit.json','reports/v138-3-verify-report.json','reports/v138-3-cloudflare-build-safe-report.json'
];
for(const file of deliveryFiles) if(fs.existsSync(p(file))) changed.add(file);

updatePackage();
writeReports();
console.log('[V138.4 GENERATE PASS]', JSON.stringify({ok:true,version:VERSION,changedFiles:Array.from(changed).sort()},null,2));
