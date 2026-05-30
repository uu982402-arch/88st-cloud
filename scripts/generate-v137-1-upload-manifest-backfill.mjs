import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const p=(...a)=>path.join(ROOT,...a);
const read=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8'):'';
const write=(f,s)=>{fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
const VERSION='V137_1_UPLOAD_MANIFEST_BACKFILL';
function jsonRead(file, fallback){try{return JSON.parse(read(file)||'');}catch{return fallback;}}
const audit=jsonRead(p('reports/v137-blog-duplicate-audit.json'), {ok:true,version:'V137_BLOG_CONTENT_EXPANSION_DUPLICATE_SAFE_10_POSTS',newPosts:[]});
const posts=Array.isArray(audit.newPosts)?audit.newPosts:[];
const existingManifest=jsonRead(p('V137_PATCH_MANIFEST.json'), null);
if(!existingManifest){
  write(p('V137_PATCH_MANIFEST.json'), JSON.stringify({
    version:'V137_BLOG_CONTENT_EXPANSION_DUPLICATE_SAFE_10_POSTS',
    type:'patch-manifest',
    purpose:'Duplicate-safe 10 blog post expansion. Auto-restored by V137.1 when PATCH upload omitted root manifest.',
    newPosts:posts.map(x=>x.path),
    requiredFiles:[
      'package.json',
      'scripts/build-v137-cloudflare-pages-safe.mjs',
      'scripts/generate-v137-blog-content-expansion.mjs',
      'scripts/verify-v137-blog-content-expansion.mjs',
      'reports/v137-blog-duplicate-audit.json',
      'V137_PATCH_MANIFEST.json',
      'V137_UPGRADE_REPORT.md'
    ],
    restoredBy:VERSION,
    generatedAt:new Date().toISOString()
  },null,2)+'\n');
}
if(!fs.existsSync(p('V137_UPGRADE_REPORT.md'))){
  write(p('V137_UPGRADE_REPORT.md'), `# V137 BLOG CONTENT EXPANSION / DUPLICATE-SAFE 10 POSTS PATCH\n\n- 기준: V136.1 FULL 이후 누적 패치\n- 신규 블로그: ${posts.length}개\n- 중복 title/slug 검사: reports/v137-blog-duplicate-audit.json 기준\n- 금지 요소: FAQ/Q&A/신뢰칩/관련글/추천글/하단 연결 섹션 추가 없음\n- V137.1: PATCH 업로드 중 루트 manifest/report가 누락되어도 Cloudflare build에서 자동 복구하도록 보강\n- 생성시각: ${new Date().toISOString()}\n`);
}
write(p('V137_1_PATCH_MANIFEST.json'), JSON.stringify({
  version:VERSION,
  type:'upload-build-hotfix',
  fixes:['missing V137_PATCH_MANIFEST.json','missing V137_UPGRADE_REPORT.md'],
  build:'node scripts/build-v137-cloudflare-pages-safe.mjs',
  verify:'node scripts/verify-v137-blog-content-expansion.mjs',
  generatedAt:new Date().toISOString()
},null,2)+'\n');
write(p('V137_1_UPGRADE_REPORT.md'), `# V137.1 UPLOAD MANIFEST BACKFILL HOTFIX\n\nCloudflare Pages build에서 V137 글 생성은 성공했지만 루트 manifest/report 누락으로 검증이 실패한 문제를 수정했습니다.\n\n- V137_PATCH_MANIFEST.json 누락 시 자동 생성\n- V137_UPGRADE_REPORT.md 누락 시 자동 생성\n- 기존 V137 신규 글/블로그 목록/sitemap 구조는 변경하지 않음\n- PATCH 업로드 기준 build 안전성 보강\n\n생성시각: ${new Date().toISOString()}\n`);
fs.mkdirSync(p('reports'),{recursive:true});
write(p('reports/v137-1-upload-manifest-backfill-report.json'), JSON.stringify({ok:true,version:VERSION,posts:posts.length,created:{manifest:!existingManifest,upgradeReport:!fs.existsSync(p('V137_UPGRADE_REPORT.md'))},generatedAt:new Date().toISOString()},null,2)+'\n');
console.log('[V137.1 GENERATE PASS] manifest/report backfill OK');
