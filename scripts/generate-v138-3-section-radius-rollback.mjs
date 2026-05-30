import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V138_3_SECTION_RADIUS_ROLLBACK_TEXT_SAFE_FINAL';
const CSS_REL = 'assets/css/v138-3-section-radius-rollback.css';
const CSS_HREF = '/assets/css/v138-3-section-radius-rollback.css?v=20260531-v138-3-section-rollback';
const LINK_TAG = `<link rel="stylesheet" href="${CSS_HREF}" data-v138-3-section-radius-rollback="true">`;
const changed = new Set([CSS_REL]);
const headerTouched = new Set();

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

const css = fs.readFileSync(p(CSS_REL),'utf8');
write(p(CSS_REL), css);

const targetHtml = new Set([
  'index.html','blog/index.html','tools/index.html','guaranteed/index.html','consult/index.html','ops/index.html','admin/index.html','cert/index.html',
  ...['sk-holdings','zakum','udt','queenbee','ddangkong','anybet','f1'].map((x)=>`guaranteed/${x}/index.html`),
  ...walk(p('sports-check'), (fp)=>fp.endsWith('.html')).map(rel),
  ...walk(p('search-guides'), (fp)=>fp.endsWith('.html')).map(rel)
]);

function activateHtmlFlag(html){
  if(html.includes('data-v138-3-section-radius-rollback="active"')) return html;
  return html.replace(/<html\b(?![^>]*data-v138-3-section-radius-rollback=)/i, '<html data-v138-3-section-radius-rollback="active"');
}
function ensureLinkAfterV138_2(html){
  if(html.includes('data-v138-3-section-radius-rollback="true"')) return html;
  const v1382 = /(<link[^>]+data-v138-2-live-header-text-visibility-fix="true"[^>]*>)/i;
  const v138 = /(<link[^>]+data-v138-modern-section-radius-dark-fix="true"[^>]*>)/i;
  if(v1382.test(html)) return html.replace(v1382, `$1\n  ${LINK_TAG}`);
  if(v138.test(html)) return html.replace(v138, `$1\n  ${LINK_TAG}`);
  return html.replace(/<\/head>/i, `  <meta name="v138-3-section-radius-rollback" content="${VERSION}">\n  ${LINK_TAG}\n</head>`);
}
function normalizeTargetHeaders(html){
  let out = html;
  out = out.replace(/(<nav class="rust-desktop-nav"[^>]*>[\s\S]*?<a href="\/guaranteed\/">)보증(<\/a>[\s\S]*?<\/nav>)/g, '$1보증업체$2');
  out = out.replace(/(<nav class="rust-mobile-menu"[^>]*>[\s\S]*?<a href="\/guaranteed\/">)보증(<\/a>[\s\S]*?<\/nav>)/g, '$1보증업체$2');
  out = out.replace(/(<nav class="v79-nav"[^>]*>[\s\S]*?<a href="\/guaranteed\/">)보증(<\/a>[\s\S]*?<\/nav>)/g, '$1보증업체$2');
  return out;
}

for(const relFile of [...targetHtml].sort()){
  const file=p(relFile); if(!fs.existsSync(file)) continue;
  const before=read(file);
  let html=before;
  html=activateHtmlFlag(html);
  html=ensureLinkAfterV138_2(html);
  const bh=html;
  html=normalizeTargetHeaders(html);
  if(html!==bh) headerTouched.add(relFile);
  if(html!==before){ write(file,html); changed.add(relFile); }
}

function updatePackage(){
  const pkgPath=p('package.json');
  const pkg=JSON.parse(read(pkgPath)||'{}');
  pkg.scripts=pkg.scripts||{};
  pkg.scripts.build='node scripts/build-v138-3-cloudflare-pages-safe.mjs';
  pkg.scripts.verify='node scripts/verify-v138-3-section-radius-rollback.mjs';
  pkg.scripts['quality:v138']='node scripts/generate-v138-modern-section-radius-dark-fix.mjs';
  pkg.scripts['verify:v138']='node scripts/verify-v138-modern-section-radius-dark-fix.mjs';
  pkg.scripts['quality:v138-1']='node scripts/generate-v138-1-cert-href-hotfix.mjs';
  pkg.scripts['verify:v138-1']='node scripts/verify-v138-1-cert-href-hotfix.mjs';
  pkg.scripts['quality:v138-2']='node scripts/generate-v138-2-live-header-text-visibility-fix.mjs';
  pkg.scripts['verify:v138-2']='node scripts/verify-v138-2-live-header-text-visibility-fix.mjs';
  pkg.scripts['quality:v138-3']='node scripts/generate-v138-3-section-radius-rollback.mjs';
  pkg.scripts['verify:v138-3']='node scripts/verify-v138-3-section-radius-rollback.mjs';
  pkg.scripts['verify:deploy']='node scripts/build-v138-3-cloudflare-pages-safe.mjs';
  write(pkgPath, JSON.stringify(pkg,null,2)+'\n');
  changed.add('package.json');
}
function writeReports(){
  fs.mkdirSync(p('reports'),{recursive:true});
  const generatedAt=new Date().toISOString();
  const changedFiles=Array.from(changed).sort();
  const payload={
    ok:true,
    version:VERSION,
    base:'V137.2 BLOG LIVE MATERIALIZE FULL + V138 + V138-1 + V138-2',
    liveObserved:{
      home:'Live text/DOM shows main section flow: 실사용 가이드, 보증업체, 스포츠·검색 체크, 분석 도구, 공식 상담봇, footer.',
      userScreenshotIssue:'Oversized rounded section shells made the sports/search and tools areas look clipped/heavy; some header/right-side labels could visually disappear at viewport edges.'
    },
    rollback:[
      'Rollback V138 oversized rounded section shells to transparent layout sections.',
      'Keep actual cards dark/glass but restore pre-V138 card radius scale.',
      'Keep V138 sports/search dark background fixes.',
      'Keep V138-2 header text visibility fix.',
      'Keep V138-1 cert href build hotfix.'
    ],
    forbiddenAdditions:['AI Q&A snippet','FAQ box','trust chip','related/recommendation sections','bottom connection card block','new CTA conversion box'],
    changedFiles,
    headerTouched:Array.from(headerTouched).sort(),
    deletedFiles:[],
    generatedAt
  };
  write(p('reports','v138-3-section-radius-rollback-audit.json'), JSON.stringify(payload,null,2));
  const manifest={
    version:VERSION,
    patchType:'section-radius-rollback-text-safe-final',
    rootOverwriteSafe:true,
    fullReplaceSafe:true,
    changedFiles:[...new Set([...changedFiles,'reports/v138-3-section-radius-rollback-audit.json','V138_3_PATCH_MANIFEST.json','V138_3_UPGRADE_REPORT.md'])].sort(),
    deletedFiles:[],
    generatedAt
  };
  write(p('V138_3_PATCH_MANIFEST.json'), JSON.stringify(manifest,null,2));
  const reportMd=[
    '# V138-3 SECTION RADIUS ROLLBACK / TEXT SAFE FINAL',
    '',
    '사용자 캡처 기준으로 V138 라운드형 섹션 마감이 화면을 무겁게 만들고 일부 텍스트가 사라지는 문제를 복구한 최종 핫픽스입니다.',
    '',
    '## 원인',
    '',
    '- V138의 섹션 컨테이너 라운드/보더/배경/그림자가 기존 메인 섹션을 큰 카드처럼 감싸면서 스포츠·검색 체크와 도구 영역이 잘려 보였습니다.',
    '- V138의 clip-path/overflow 조합이 폭에 따라 제목·우측 링크·카드 내부 글자를 압박할 수 있었습니다.',
    '',
    '## 수정',
    '',
    '- 메인 섹션 쉘은 투명 레이아웃으로 복구했습니다.',
    '- 카드 자체는 기존 수준의 다크/글래스 톤과 적정 라운드로 복구했습니다.',
    '- 스포츠체크/검색가이드 다크 톤 복구는 유지했습니다.',
    '- 헤더 텍스트 노출 보정과 cert href 빌드 핫픽스는 유지했습니다.',
    '',
    '## 유지',
    '',
    '- 새 섹션 추가 없음',
    '- 블로그 게시글 본문 수정 없음',
    '- 기존 라우팅 유지',
    '- 삭제 파일 없음',
    '- 제거 확정 4개 경로 재생성 없음',
    ''
  ].join('\n');
  write(p('V138_3_UPGRADE_REPORT.md'), reportMd);
  changed.add('reports/v138-3-section-radius-rollback-audit.json');
  changed.add('V138_3_PATCH_MANIFEST.json');
  changed.add('V138_3_UPGRADE_REPORT.md');
}

const deliveryFiles=[
  'scripts/build-v138-cloudflare-pages-safe.mjs','scripts/generate-v138-modern-section-radius-dark-fix.mjs','scripts/verify-v138-modern-section-radius-dark-fix.mjs',
  'scripts/build-v138-1-cloudflare-pages-safe.mjs','scripts/generate-v138-1-cert-href-hotfix.mjs','scripts/verify-v138-1-cert-href-hotfix.mjs',
  'scripts/build-v138-2-cloudflare-pages-safe.mjs','scripts/generate-v138-2-live-header-text-visibility-fix.mjs','scripts/verify-v138-2-live-header-text-visibility-fix.mjs',
  'scripts/build-v138-3-cloudflare-pages-safe.mjs','scripts/generate-v138-3-section-radius-rollback.mjs','scripts/verify-v138-3-section-radius-rollback.mjs',
  'assets/css/v138-modern-section-radius-dark-fix.css','assets/css/v138-2-live-header-text-visibility-fix.css','assets/css/v138-3-section-radius-rollback.css',
  'V138_PATCH_MANIFEST.json','V138_UPGRADE_REPORT.md','V138_1_PATCH_MANIFEST.json','V138_1_UPGRADE_REPORT.md','V138_2_PATCH_MANIFEST.json','V138_2_UPGRADE_REPORT.md',
  'reports/v138-modern-section-radius-dark-fix-audit.json','reports/v138-verify-report.json','reports/v138-cloudflare-build-safe-report.json',
  'reports/v138-1-cert-href-hotfix-audit.json','reports/v138-1-verify-report.json','reports/v138-1-cloudflare-build-safe-report.json',
  'reports/v138-2-live-header-text-visibility-fix-audit.json','reports/v138-2-verify-report.json','reports/v138-2-cloudflare-build-safe-report.json'
];
for(const file of deliveryFiles) if(fs.existsSync(p(file))) changed.add(file);

updatePackage();
writeReports();
console.log('[V138.3 GENERATE PASS]', JSON.stringify({ok:true,version:VERSION,changedFiles:Array.from(changed).sort(),headerTouched:Array.from(headerTouched).sort()},null,2));
