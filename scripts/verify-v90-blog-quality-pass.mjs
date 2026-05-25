import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const MARKER = 'V90_BLOG_QUALITY_PASS_ACTIVE';
const forbidden = [
  '신규 유입 확장 콘텐츠',
  '토토·입플·보증업체·도구 연결 50개',
  '페이지 하단의 내부 링크',
  '관련 글과 다음 확인 루트',
  '상담 연결까지 이어지도록 구성했습니다'
];
function fail(msg){ console.error(`[V90 VERIFY] ${msg}`); process.exit(1); }
function strip(s){ return String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
const dataPath = path.join(ROOT,'assets/data/v90-blog-quality-pass.json');
if(!fs.existsSync(dataPath)) fail('missing assets/data/v90-blog-quality-pass.json');
const data = JSON.parse(fs.readFileSync(dataPath,'utf8'));
if(data.count !== 50) fail(`expected 50 V90 targets, got ${data.count}`);
for(const item of data.targets){
  const p = path.join(ROOT,item.rel);
  if(!fs.existsSync(p)) fail(`missing target ${item.rel}`);
  const s = fs.readFileSync(p,'utf8');
  if(!s.includes(MARKER)) fail(`missing V90 marker: ${item.rel}`);
  if(!s.includes('v90-blog-quality-pass.css')) fail(`missing V90 css: ${item.rel}`);
  if(!s.includes('data-v90-blog-quality="lead"')) fail(`missing lead: ${item.rel}`);
  if(!s.includes('class="v90-quality-faq"')) fail(`missing faq: ${item.rel}`);
  if(!s.includes('data-v90-blog-quality="faq-schema"')) fail(`missing faq schema: ${item.rel}`);
  if(!s.includes('rust-global-header')) fail(`missing rust global header: ${item.rel}`);
  if(!s.includes('rust-bottom-nav')) fail(`missing rust bottom nav: ${item.rel}`);
  for(const f of forbidden) if(s.includes(f)) fail(`forbidden phrase remains in ${item.rel}: ${f}`);
  const h2Count = (s.match(/<h2\b/gi)||[]).length;
  if(h2Count < 4) fail(`too few h2 headings in ${item.rel}: ${h2Count}`);
  const details = (s.match(/<details>/g)||[]).length;
  if(details < 4) fail(`faq details missing in ${item.rel}: ${details}`);
  if(strip(s).length < 3000) fail(`text too short in ${item.rel}: ${strip(s).length}`);
}
const blogIndex = fs.readFileSync(path.join(ROOT,'blog/index.html'),'utf8');
for(const f of forbidden.slice(0,2)) if(blogIndex.includes(f)) fail(`blog index forbidden phrase remains: ${f}`);
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8'));
if(!pkg.scripts.build.includes('generate-v90-blog-quality-pass.mjs')) fail('build chain missing V90 generator');
if(pkg.scripts.verify !== 'node scripts/verify-v90-blog-quality-pass.mjs') fail('verify script not set to V90');
console.log(`[V90 VERIFY] ok targets=${data.count}`);
