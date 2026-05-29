import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd(); const VERSION='V132_LIVE_SCREEN_CLEANUP_DUPLICATE_UI_REMOVAL'; const now=new Date().toISOString();
const CSS_FILE='assets/css/v132-live-screen-cleanup.css'; const CSS_HREF='/assets/css/v132-live-screen-cleanup.css?v=20260529';
function abs(rel){return path.join(ROOT,rel)} function exists(rel){return fs.existsSync(abs(rel))} function read(rel){return fs.readFileSync(abs(rel),'utf8')} function write(rel,body){fs.mkdirSync(path.dirname(abs(rel)),{recursive:true});fs.writeFileSync(abs(rel),body)}
function walk(dir=ROOT,out=[]){ if(!fs.existsSync(dir)) return out; for(const name of fs.readdirSync(dir)){ if(['node_modules','.git','.wrangler','.cache'].includes(name)) continue; const full=path.join(dir,name); const rel=path.relative(ROOT,full).replace(/\\/g,'/'); const st=fs.statSync(full); if(st.isDirectory()) walk(full,out); else out.push(rel);} return out; }
function ensureHead(html){ if(!/<html\b/i.test(html)) html='<!doctype html>\n<html lang="ko">\n'+html+'\n</html>'; if(!/<head\b/i.test(html)) html=html.replace(/<html\b[^>]*>/i,m=>`${m}\n<head></head>`); return html; }
function addHead(html,snippet){ html=ensureHead(html); return html.includes('v132-live-screen-cleanup.css')?html:html.replace(/<\/head>/i,`${snippet}\n</head>`); }
function addAttr(html,tag,attr,value){ const re=new RegExp(`<${tag}\\b([^>]*)>`,'i'); if(!re.test(html)){ if(tag==='body') return html.replace(/<\/head>/i,`</head>\n<body ${attr}="${value}"></body>`); return html; } return html.replace(re,(m,attrs='')=>new RegExp(`${attr}=`,'i').test(attrs)?m:`<${tag}${attrs} ${attr}="${value}">`); }
const exactBlockRules=[
  /\s*<header\b[^>]*class=["'][^"']*v71-topbar[^"']*["'][^>]*>[\s\S]*?<\/header>\s*/gi,
  /\s*<nav\b[^>]*class=["'][^"']*v71-mobile-nav[^"']*["'][^>]*>[\s\S]*?<\/nav>\s*/gi,
  /\s*<a\b[^>]*class=["'][^"']*v71-fab[^"']*["'][^>]*>[\s\S]*?<\/a>\s*/gi,
  /\s*<a\b[^>]*class=["'][^"']*v65-chat-bubble[^"']*["'][^>]*>[\s\S]*?<\/a>\s*/gi,
  /\s*<div\b[^>]*class=["'][^"']*v65-chat-bubble[^"']*["'][^>]*>[\s\S]*?<\/div>\s*/gi,
  /\s*<section\b[^>]*class=["'][^"']*v70-2-sticky-cta[^"']*["'][^>]*>[\s\S]*?<\/section>\s*/gi,
  /\s*<div\b[^>]*class=["'][^"']*v70-2-sticky-cta[^"']*["'][^>]*>[\s\S]*?<\/div>\s*/gi,
  /\s*<a\b[^>]*class=["'][^"']*v70-2-fab[^"']*["'][^>]*>[\s\S]*?<\/a>\s*/gi,
  /\s*<section\b[^>]*class=["'][^"']*v73-footer-cta[^"']*["'][^>]*>[\s\S]*?<\/section>\s*/gi,
  /\s*<a\b[^>]*class=["'][^"']*v73-fab[^"']*["'][^>]*>[\s\S]*?<\/a>\s*/gi,
  /\s*<a\b[^>]*class=["'][^"']*v74-fab[^"']*["'][^>]*>[\s\S]*?<\/a>\s*/gi,
  /\s*<nav\b[^>]*class=["'][^"']*v74-mobile-nav[^"']*["'][^>]*>[\s\S]*?<\/nav>\s*/gi,
  /\s*<header\b[^>]*class=["'][^"']*v70-2-header[^"']*["'][^>]*>[\s\S]*?<\/header>\s*/gi,
  /\s*<header\b[^>]*class=["'][^"']*v68-header[^"']*["'][^>]*>[\s\S]*?<\/header>\s*/gi,
  /\s*<header\b[^>]*class=["'][^"']*v67-header[^"']*["'][^>]*>[\s\S]*?<\/header>\s*/gi,
  /\s*<header\b[^>]*class=["'][^"']*moon-header[^"']*["'][^>]*>[\s\S]*?<\/header>\s*/gi,
  /\s*<section\b[^>]*class=["'][^"']*(?:v36-related-links|v36-growth-hubs|v36-conversion-cta|v70-2-related|quick-resource-grid|pro-related|consult-motive-section)[^"']*["'][^>]*>[\s\S]*?<\/section>\s*/gi,
  /\s*<div\b[^>]*class=["'][^"']*(?:v36-related-links|v36-growth-hubs|v36-conversion-cta|v70-2-related|quick-resource-grid|pro-related|consult-motive-section)[^"']*["'][^>]*>[\s\S]*?<\/div>\s*/gi,
  /\s*<button\b[^>]*(?:data-v103-consult|data-v73-telegram)[^>]*>[\s\S]*?<\/button>\s*/gi,
  /\s*<a\b[^>]*href=["']https:\/\/t\.me\/TRS999_bot["'][^>]*>\s*(?:✦\s*)?상담\s*<\/a>\s*/gi,
  /\s*<a\b[^>]*>\s*텔레그램 상담 연결\s*<\/a>\s*/gi,
  /\s*<p\b[^>]*>\s*계산 결과가 애매하면 상담센터로 바로 넘기세요\.[\s\S]*?<\/p>\s*/gi,
  /\s*<section\b[^>]*>[\s\S]{0,5000}?다른 보증업체[\s\S]{0,5000}?<\/section>\s*/gi
];
const tokenCleanup=['RUST QUICK CHECK','data-v120-fold="true"','data-v120-search-form="true"','v120-action-sports','v120-action-guaranteed','조건 상담 후 이용','상담 후 이용','상담으로 조건 확인','확인 기준','상담 전 최종 확인','COMMON CENTER','공통 확인 채널','상담센터 연결','상담 전 문의 템플릿','상담에서 재확인','다른 보증업체','상담 기록','관련 링크 포함','관련 허브 보기','같이 보면 좋은 링크','관련 확인'];
function ensureV132(html){ html=ensureHead(html); html=addAttr(html,'html','data-v132-live-cleanup','true'); html=addAttr(html,'body','data-v132-live-cleanup','true'); html=addHead(html,`  <link rel="stylesheet" href="${CSS_HREF}" data-v132-live-cleanup="true">`); return html; }
function normalizeMain(html,rel){ if(rel!=='index.html') return html; html=html.replace(/<span class="v131-consult-kicker">[\s\S]*?<\/span>/i,'<span class="v131-consult-kicker">OFFICIAL BOT</span>'); html=html.replace(/<strong class="v131-consult-title">[\s\S]*?<\/strong>/i,'<strong class="v131-consult-title">@TRS999_bot</strong>'); html=html.replace(/<p class="v131-consult-copy">[\s\S]*?<\/p>/i,''); html=html.replace(/<a class="v131-consult-link"[^>]*>[\s\S]*?<\/a>/i,'<a class="v131-consult-link" href="https://t.me/TRS999_bot" target="_blank" rel="noopener noreferrer" data-ga4-event="consult_click">공식 상담봇 열기</a>'); html=html.replace('주소·코드·조건 확인에 바로 쓰는 글만 보여줍니다.','주소·코드·조건 확인용 핵심 글만 남겼습니다.').replace('이미지와 코드, 공식 이동만 간결하게 확인합니다.','이미지·코드·이동 버튼만 간결하게 확인합니다.').replace('자주 확인하는 경기 변수와 검색 루트만 압축했습니다.','경기 변수와 검색 루트만 짧게 정리했습니다.').replace('계산·확인·복사를 한 화면에서 끝내는 핵심 도구입니다.','계산·확인·복사를 바로 실행합니다.'); return html; }
function clean(rel){ let html=read(rel); const before=html; html=ensureV132(html); for(const re of exactBlockRules) html=html.replace(re,'\n'); for(const t of tokenCleanup) html=html.split(t).join(''); html=normalizeMain(html,rel); if(html!==before) write(rel,html); return html!==before; }
if(!exists(CSS_FILE)) throw new Error(`missing ${CSS_FILE}`);
const htmls=walk().filter(r=>r.endsWith('.html')); let touched=[]; const legacyBefore={}; const legacyTokens=['v71-topbar','v71-mobile-nav','v71-fab','v65-chat-bubble','v70-2-header','v68-header','v67-header','moon-header','v70-2-sticky-cta','v70-2-fab','v73-footer-cta','v73-fab','pro-related','quick-resource-grid','consult-motive-section','RUST QUICK CHECK','관련 링크 포함','관련 허브 보기','계산 결과가 애매하면 상담센터로 바로 넘기세요','텔레그램 상담 연결','v74-fab','v74-mobile-nav'];
for(const rel of htmls){ const body=read(rel); for(const t of legacyTokens) if(body.includes(t)) legacyBefore[t]=(legacyBefore[t]||0)+1; if(clean(rel)) touched.push(rel); }
for(const r of ['faq','consult-motives','consult-result','provider-updates']){ for(const rel of [r,`${r}.html`,`${r}/index.html`]){ const p=abs(rel); if(fs.existsSync(p)){ const st=fs.statSync(p); if(st.isDirectory()) fs.rmSync(p,{recursive:true,force:true}); else fs.rmSync(p); } } }

// Keep Cloudflare Pages build pinned to V132 even after V131 baseline generators rewrite package.json.
if(exists('package.json')){
  const pkg = JSON.parse(read('package.json'));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = 'node scripts/build-v132-cloudflare-pages-safe.mjs';
  pkg.scripts.verify = 'node scripts/verify-v132-live-screen-cleanup-duplicate-ui.mjs';
  pkg.scripts['verify:deploy'] = 'node scripts/build-v132-cloudflare-pages-safe.mjs';
  pkg.scripts['quality:v132'] = 'node scripts/generate-v132-live-screen-cleanup-duplicate-ui.mjs';
  pkg.scripts['verify:v132'] = 'node scripts/verify-v132-live-screen-cleanup-duplicate-ui.mjs';
  write('package.json', JSON.stringify(pkg, null, 2));
}

const report={ok:true,version:VERSION,htmlScanned:htmls.length,htmlTouched:touched.length,legacyBefore,touchedSample:touched.slice(0,60),vendors:['guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html'].filter(exists).length,deletedFiles:0,generatedAt:now};
write('reports/v132-live-screen-cleanup-audit.json',JSON.stringify(report,null,2));
write('reports/v132-remove-candidates.txt',['# V132 remove candidates / cleanup notes','No source file deletion was performed.','Removed/disabled from generated HTML: legacy v71 header/nav/FAB, v65 chat bubbles, v70 sticky CTA/FAB, old related blocks, tool consult CTA residue.'].join('\n'));
write('V132_PATCH_MANIFEST.json',JSON.stringify({version:VERSION,base:'V131.1 upload patch lock backfill',changedAt:now,deletedFiles:0,patchUploadSafe:true},null,2));
write('V132_UPGRADE_REPORT.md',`# ${VERSION}\n\nV131.1 기준 라이브 화면 정리 패치입니다. 새 섹션은 추가하지 않고, 구버전 중복 UI와 하단 상담/관련 잔여 요소를 제거했습니다.\n\n- HTML scanned: ${htmls.length}\n- HTML touched: ${touched.length}\n- Vendors: ${report.vendors}\n- Deleted files: 0\n- Generated: ${now}\n`);
console.log('[V132 GENERATE PASS]',JSON.stringify(report,null,2));
