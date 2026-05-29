import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const VERSION = 'V121_CLEAN_LAYOUT_LOCK_NO_BOTTOM_RELATED_SECTIONS';
const CSS = `/* V121 CLEAN LAYOUT LOCK / NO BOTTOM RELATED SECTIONS */
html[data-v121-clean-layout-lock="active"],
html[data-v121-clean-layout-lock="active"] body{max-width:100%;overflow-x:hidden}
/* Defensive guard: if an older generator injects bottom connection sections again, keep them out of the rendered layout. */
html[data-v121-clean-layout-lock="active"] .v36-related-links,
html[data-v121-clean-layout-lock="active"] .v36-growth-hubs,
html[data-v121-clean-layout-lock="active"] .v36-conversion-cta,
html[data-v121-clean-layout-lock="active"] .v70-2-related,
html[data-v121-clean-layout-lock="active"] .pro-related,
html[data-v121-clean-layout-lock="active"] .quick-resource-grid,
html[data-v121-clean-layout-lock="active"] .article-related-panel,
html[data-v121-clean-layout-lock="active"] .article-related-grid,
html[data-v121-clean-layout-lock="active"] .consult-motive-section{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important}
`;

function file(p){ return join(root,p); }
function read(p){ return readFileSync(file(p),'utf8'); }
function write(p,v){ writeFileSync(file(p),v); }
function ensureDir(p){ mkdirSync(file(p),{recursive:true}); }
function listHtml(dir='.'){
  const out=[];
  function walk(abs){
    for(const name of readdirSync(abs)){
      const p=join(abs,name);
      const st=statSync(p);
      if(st.isDirectory()){
        if(['node_modules','.git'].includes(name)) continue;
        walk(p);
      }else if(name.endsWith('.html')) out.push(relative(root,p).replace(/\\/g,'/'));
    }
  }
  walk(file(dir));
  return out;
}
function addHtmlAttr(t){
  if(!/data-v121-clean-layout-lock="active"/.test(t)) t=t.replace(/<html\b/i,'<html data-v121-clean-layout-lock="active"');
  return t;
}
function addBodyClass(t){
  if(/<body\b[^>]*class="/.test(t)){
    t=t.replace(/<body\b([^>]*?)class="([^"]*)"/i,(m,a,c)=> c.includes('v121-clean-layout-lock')?m:`<body${a}class="${c} v121-clean-layout-lock"`);
  }else{
    t=t.replace(/<body\b/i,'<body class="v121-clean-layout-lock"');
  }
  return t;
}
function addHeadLink(t){
  if(t.includes('v121-clean-layout-lock.css')) return t;
  const tag='  <meta name="v121-clean-layout-lock" content="V121_CLEAN_LAYOUT_LOCK_NO_BOTTOM_RELATED_SECTIONS_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v121-clean-layout-lock.css?v=20260529" data-v121-clean-layout-lock="true">';
  return t.replace('</head>',tag+'\n</head>');
}
function hasClassInTag(tag,className){
  const cls=tag.match(/class\s*=\s*(["'])(.*?)\1/i);
  return cls ? cls[2].split(/\s+/).includes(className) : false;
}
function findTagEnd(html,tag,start){
  const re=new RegExp(`<\\/?${tag}\\b[^>]*>`,'ig');
  re.lastIndex=start;
  let depth=0;
  let m;
  while((m=re.exec(html))){
    const txt=m[0];
    const isClose=/^<\//.test(txt);
    const selfClose=/\/\s*>$/.test(txt);
    if(!isClose && !selfClose) depth++;
    if(isClose){
      depth--;
      if(depth===0) return re.lastIndex;
    }
  }
  return -1;
}
function removeTagByClass(html,tag,className){
  let count=0;
  const startRe=new RegExp(`<${tag}\\b[^>]*>`,'ig');
  let pos=0;
  while(true){
    startRe.lastIndex=pos;
    const m=startRe.exec(html);
    if(!m) break;
    const start=m.index;
    const open=m[0];
    if(!hasClassInTag(open,className)){ pos=startRe.lastIndex; continue; }
    const end=findTagEnd(html,tag,start);
    if(end<0){ pos=startRe.lastIndex; continue; }
    html=html.slice(0,start)+html.slice(end);
    count++;
    pos=start;
  }
  return {html,count};
}
function removeTagContaining(html,tag,needle){
  let count=0;
  while(true){
    const idx=html.indexOf(needle);
    if(idx<0) break;
    const before=html.lastIndexOf(`<${tag}`,idx);
    if(before<0) break;
    const end=findTagEnd(html,tag,before);
    if(end<0 || end<idx) break;
    html=html.slice(0,before)+html.slice(end);
    count++;
  }
  return {html,count};
}
function applyClean(html){
  let counts={};
  const add=(k,n)=>{ counts[k]=(counts[k]||0)+n; };
  for(const [tag,cls] of [
    ['section','v36-related-links'],
    ['section','v36-growth-hubs'],
    ['section','v36-conversion-cta'],
    ['aside','v70-2-related'],
    ['section','pro-related'],
    ['section','consult-motive-section'],
    ['div','article-related-panel'],
    ['section','article-related-panel']
  ]){
    const r=removeTagByClass(html,tag,cls); html=r.html; add(`${tag}.${cls}`,r.count);
  }
  for(const needle of ['quick-resource-grid','같이 보면 좋은 링크']){
    const r=removeTagContaining(html,'section',needle); html=r.html; add(`section contains ${needle}`,r.count);
  }
  return {html,counts};
}

ensureDir('assets/css');
ensureDir('reports');
write('assets/css/v121-clean-layout-lock.css',CSS);

const touched=[];
const removals={};
for(const p of listHtml()){
  let src=read(p);
  let next=src;
  const cleaned=applyClean(next);
  next=cleaned.html;
  const removedTotal=Object.values(cleaned.counts).reduce((a,b)=>a+b,0);
  const isCore=['index.html','blog/index.html','tools/index.html','guaranteed/index.html','sports-check/index.html','search-guides/index.html','ops/index.html'].includes(p);
  const shouldTag=removedTotal>0 || isCore || p.startsWith('tools/');
  if(shouldTag){
    next=addHtmlAttr(next);
    next=addBodyClass(next);
    next=addHeadLink(next);
  }
  if(next!==src){
    write(p,next);
    touched.push(p);
    if(removedTotal>0) removals[p]=cleaned.counts;
  }
}

const removeCandidateText = `V121 CLEAN LAYOUT LOCK / NO-BOTTOM-RELATED-SECTIONS\n\n삭제 파일: 0개\n\n이번 버전은 파일을 삭제하지 않고 HTML 내부의 하단 연결형 UI 블록만 제거했습니다.\n\n제거 대상 UI:\n- v36-growth-hubs / TOPIC HUB 하단 허브\n- v36-related-links / RELATED 관련 확인\n- v36-conversion-cta / 상담 전환\n- v70-2-related / 도구 결과 하단 연결\n- pro-related / 관련 링크\n- quick-resource-grid / 같이 보면 좋은 링크\n- consult-motive-section / 불안 제거 상담 루트\n\n앞으로 내부 연결은 하단 박스가 아니라 기존 허브 카드, 본문 내 짧은 텍스트 링크, sitemap/canonical/meta 구조로만 처리합니다.\n`;
write('reports/v121-no-bottom-related-audit.json', JSON.stringify({
  version:'V121',
  policy:'No bottom related/link/connection sections by default',
  deleted_files:0,
  touched_files:touched,
  removed_blocks_by_file:removals,
  defensive_css:'assets/css/v121-clean-layout-lock.css',
  preserved_routes:['/','/blog/','/tools/','/guaranteed/','/consult/','/sports-check/','/search-guides/','/ops/'],
  removed_route_lock:['faq','consult-motives','consult-result','provider-updates']
}, null, 2));
write('reports/v121-remove-candidates.txt', removeCandidateText);
write('V121_UPGRADE_REPORT.md', `# V121 CLEAN LAYOUT LOCK / NO-BOTTOM-RELATED-SECTIONS PATCH\n\n- V120 FULL 기준 누적 반영\n- 하단 연결/관련/상담 전환 섹션 제거\n- 삭제 파일 0개\n- 방어 CSS 추가: assets/css/v121-clean-layout-lock.css\n- 리포트 추가: reports/v121-no-bottom-related-audit.json\n\n## Policy\n\n하단 관련글/연결 카드/상담 전환 박스는 기본 생성 금지. 내부 링크가 필요하면 기존 허브 구조 또는 본문 내 짧은 텍스트 링크만 사용.\n`);
write('V121_PATCH_MANIFEST.json', JSON.stringify({
  version:'V121',
  name:'CLEAN LAYOUT LOCK / NO-BOTTOM-RELATED-SECTIONS PATCH',
  base:'V120 FULL',
  deleted_files:0,
  changed_files:touched.concat([
    'assets/css/v121-clean-layout-lock.css',
    'reports/v121-no-bottom-related-audit.json',
    'reports/v121-remove-candidates.txt',
    'V121_UPGRADE_REPORT.md',
    'V121_PATCH_MANIFEST.json',
    'scripts/generate-v121-clean-layout-lock.mjs',
    'scripts/verify-v121-clean-layout-lock.mjs',
    'package.json'
  ]).filter((v,i,a)=>a.indexOf(v)===i).sort()
}, null, 2));

const pkgPath=file('package.json');
const pkg=JSON.parse(readFileSync(pkgPath,'utf8'));
pkg.scripts=pkg.scripts||{};
if(!String(pkg.scripts.build||'').includes('generate-v121-clean-layout-lock.mjs')){
  pkg.scripts.build=String(pkg.scripts.build||'')+' && node scripts/generate-v121-clean-layout-lock.mjs';
}
pkg.scripts['quality:v121']='node scripts/generate-v121-clean-layout-lock.mjs';
pkg.scripts['verify:v121']='node scripts/verify-v121-clean-layout-lock.mjs';
pkg.scripts.verify='node scripts/verify-v121-clean-layout-lock.mjs';
writeFileSync(pkgPath, JSON.stringify(pkg,null,2)+'\n');
console.log(`V121 generated: ${touched.length} HTML files touched, ${Object.keys(removals).length} files had bottom blocks removed`);
