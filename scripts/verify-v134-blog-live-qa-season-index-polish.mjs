
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const posts=[
  {
    "slug": "kbo-remaining-season-five-race-table.html",
    "title": "KBO 남은 시즌 5강 경쟁표를 볼 때 먼저 나눌 항목",
    "category": "KBO 시즌",
    "description": "KBO 남은 시즌 5강 경쟁을 볼 때 승차, 잔여경기, 맞대결, 불펜 소모를 분리해서 확인하는 기준형 가이드입니다."
  },
  {
    "slug": "kbo-schedule-density-rest-day-check.html",
    "title": "KBO 막판 일정 밀도와 휴식일을 같이 보는 법",
    "category": "KBO 일정",
    "description": "KBO 막판 일정에서 더블헤더, 이동거리, 휴식일, 선발 간격이 경기 흐름에 주는 영향을 확인하는 글입니다."
  },
  {
    "slug": "pro-baseball-final-stretch-overprediction-filter.html",
    "title": "프로야구 막판 전망글에서 과장 예측을 걸러내는 기준",
    "category": "프로야구",
    "description": "프로야구 막판 순위 전망을 볼 때 확정형 문구와 실제 확인 가능한 변수들을 구분하는 기준을 정리했습니다."
  },
  {
    "slug": "vleague-men-preseason-roster-check.html",
    "title": "남자배구 V리그 시즌 전 로스터 변화를 확인하는 순서",
    "category": "남자배구",
    "description": "남자배구 V리그 시즌 전 세터, 외국인 선수, 아시아쿼터, 미들블로커 구성을 순서대로 확인하는 글입니다."
  },
  {
    "slug": "vleague-women-receive-foreign-player-check.html",
    "title": "여자배구 V리그 시즌 초반 리시브와 외국인 선수 변수를 보는 법",
    "category": "여자배구",
    "description": "여자배구 V리그 시즌 초반 리시브 라인, 외국인 선수, 미들 활용, 세트 흐름을 확인하는 기준형 글입니다."
  },
  {
    "slug": "kbl-new-season-roster-foreign-player-check.html",
    "title": "KBL 새 시즌 로스터와 외국선수 구성을 확인하는 기준",
    "category": "KBL",
    "description": "KBL 새 시즌을 보기 전 가드진, 외국선수 조합, 빅맨 깊이, 일정 밀도를 확인하는 기준을 정리했습니다."
  },
  {
    "slug": "wkbl-season-flow-injury-rotation-check.html",
    "title": "WKBL 시즌 흐름을 볼 때 부상 복귀와 로테이션을 확인하는 법",
    "category": "WKBL",
    "description": "WKBL 시즌 전망에서 부상 복귀, 주전 출전 시간, 벤치 로테이션, 국가대표 일정 변수를 확인하는 글입니다."
  },
  {
    "slug": "domestic-pro-sports-season-calendar-routine.html",
    "title": "국내 프로스포츠 시즌 일정을 한 번에 정리하는 확인 루틴",
    "category": "스포츠 일정",
    "description": "야구, 배구, 남녀농구 시즌 일정을 볼 때 개막, 휴식일, 맞대결, 포스트시즌 흐름을 한 번에 정리하는 방법입니다."
  }
];
const errors=[];
function read(rel){ const p=path.join(ROOT,rel); return fs.existsSync(p)?fs.readFileSync(p,'utf8'):''; }
function exists(rel){ return fs.existsSync(path.join(ROOT,rel)); }
function fail(m){ errors.push(m); }
const required=['blog/index.html','blog/sports-season/index.html',...posts.map(p=>`blog/sports-season/${p.slug}`)];
for(const rel of required){ if(!exists(rel)) fail(`missing route file: ${rel}`); }
for(const post of posts){
  const rel=`blog/sports-season/${post.slug}`;
  const s=read(rel);
  if(!s.includes(post.title)) fail(`title missing: ${rel}`);
  if(!s.includes('v134-blog-live-qa-season-index-polish.css')) fail(`v134 css missing: ${rel}`);
  if(!s.includes('data-v134-blog-live-qa')) fail(`v134 marker missing: ${rel}`);
  if(!s.includes('<link rel="canonical"')) fail(`canonical missing: ${rel}`);
  if(!s.includes('application/ld+json')) fail(`schema missing: ${rel}`);
  if(/FAQ|자주 묻는 질문|신뢰칩|확인 기준|관련글|추천글|같이 보면 좋은 링크|조건 상담 후 이용|RUST QUICK CHECK/.test(s)) fail(`forbidden phrase in: ${rel}`);
}
const blog=read('blog/index.html');
if(!blog.includes('v134-blog-live-qa-season-index-polish.css')) fail('blog index missing v134 css');
for(const [i,post] of posts.entries()){
  const href=`/blog/sports-season/${post.slug}`;
  if(!blog.includes(href)) fail(`blog index missing href: ${href}`);
  if(!exists(`blog/sports-season/${post.slug}`)) fail(`href target missing: ${href}`);
}
const idx=read('blog/sports-season/index.html');
for(const post of posts){ if(!idx.includes(`/blog/sports-season/${post.slug}`)) fail(`season index missing card: ${post.slug}`); }
for(const f of ['sitemap.txt','sitemap.xml','serverless/sitemap.xml']){
  const s=read(f);
  if(!s.includes('https://88st.cloud/blog/sports-season/')) fail(`${f} missing season index`);
  for(const post of posts){ if(!s.includes(`https://88st.cloud/blog/sports-season/${post.slug}`)) fail(`${f} missing post ${post.slug}`); }
}
for(const banned of ['faq','consult-motives','consult-result','provider-updates']){
  for(const rel of [banned,`${banned}/index.html`,`${banned}.html`]){ if(exists(rel)) fail(`removed route exists: ${rel}`); }
}
const pkg=JSON.parse(read('package.json'));
const refs=JSON.stringify(pkg.scripts||{}).match(/scripts\/[\w.\-]+\.mjs/g)||[];
for(const r of refs){ if(!exists(r)) fail(`package references missing script: ${r}`); }
if(errors.length){ console.error('[V134 VERIFY FAIL]'); for(const e of errors) console.error('-',e); process.exit(1); }
console.log('[V134 VERIFY PASS] blog live QA + sports season route/index polish OK');
