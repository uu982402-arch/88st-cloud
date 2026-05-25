import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const VERSION = 'static-v85-4-blog-post-shell-lock-20260525';
const MARKER = 'V85_4_BLOG_POST_SHELL_LOCK_ACTIVE';
const CSS_HREF = `/assets/css/v85-4-blog-post-shell-lock.css?v=${VERSION}`;
const navItems = [['/','메인','⌂'],['/blog/','블로그','▤'],['/tools/','도구','◇'],['/guaranteed/','보증','◆'],['/consult/','상담','✦']];
function globalHeader(){return `<header class="rust-global-header" id="rust-global-header" data-rust-brand-header="true" data-v85-4-post-shell="true">
  <div class="rust-header-inner">
    <a class="rust-brand" href="/" aria-label="RUST 메인으로 이동">
      <span class="rust-brand-mark" aria-hidden="true"><img src="/assets/img/rust/rust-crest-192.png" alt="" width="42" height="42" decoding="async" loading="eager" fetchpriority="high"></span>
      <span class="rust-brand-type"><strong>RUST</strong><span>by 88ST</span></span>
    </a>
    <nav class="rust-desktop-nav" aria-label="RUST 주요 메뉴" data-rust-nav="desktop">${navItems.map(([href,label])=>`<a href="${href}"${href==='/blog/'?' class="is-active" aria-current="page"':''}>${label}</a>`).join('')}</nav>
    <button class="rust-menu-button" type="button" aria-label="메뉴 열기" aria-expanded="false" data-rust-menu-toggle><span></span><span></span></button>
  </div>
  <nav class="rust-mobile-menu" aria-label="RUST 모바일 메뉴" data-rust-nav="mobile-menu">${navItems.map(([href,label])=>`<a href="${href}"${href==='/blog/'?' class="is-active" aria-current="page"':''}>${label}</a>`).join('')}</nav>
</header>`;}
function bottomNav(){return `<nav class="rust-bottom-nav" aria-label="RUST 모바일 하단 메뉴" data-rust-bottom-nav="true" data-v85-4-post-shell="true">${navItems.map(([href,label,icon])=>`<a href="${href}"${href==='/blog/'?' class="is-active" aria-current="page"':''}><span>${icon}</span>${label}</a>`).join('')}</nav>`;}
function shouldPatch(txt,rel){return rel.startsWith('blog/')&&rel.endsWith('/index.html')&&rel!=='blog/index.html'&&(txt.includes('v82-seo-post')||txt.includes('V82_2_SEO_CONTENT_ACTIVE')||txt.includes('V82_SEO_CONTENT_20_ACTIVE')||txt.includes('V85_SEO_CONTENT_30_ACTIVE')||txt.includes('v85-seo-content-30')||txt.includes('V85_2_BLOG_POST_POLISH_ACTIVE')||txt.includes('V85_3_LIVE_LOCK_ACTIVE'));}
function ensureHeadAssets(txt){
  if(!txt.includes('v85-4-blog-post-shell-lock.css')) txt=txt.replace('</head>',`  <link rel="stylesheet" href="${CSS_HREF}" data-v85-4-post-shell="true">\n  <meta name="v85-4-blog-post-shell-lock" content="${MARKER}">\n</head>`);
  else if(!txt.includes(MARKER)) txt=txt.replace('</head>',`  <meta name="v85-4-blog-post-shell-lock" content="${MARKER}">\n</head>`);
  return txt;
}
function patchBodyClass(txt){return txt.replace(/<body([^>]*)class="([^"]*)"/i,(m,b,c)=>{let n=c; for(const x of ['rust-brand-system','v85-4-seo-post-shell']) if(!n.split(/\s+/).includes(x)) n+=' '+x; return `<body${b}class="${n.trim()}"`;}).replace(/<body(?![^>]*class=)([^>]*)>/i,`<body$1 class="rust-brand-system v85-4-seo-post-shell">`);}
function patchHeader(txt){txt=txt.replace(/<header\s+class="rust-header"[\s\S]*?<\/header>/gi,''); txt=txt.replace(/<header\s+class="rust-global-header"[\s\S]*?<\/header>/gi,''); return txt.replace(/<body([^>]*)>/i,`<body$1>${globalHeader()}`);}
function patchBottomNav(txt){txt=txt.replace(/<nav\s+class="rust-mobile-nav"[\s\S]*?<\/nav>/gi,''); txt=txt.replace(/<nav\s+class="rust-bottom-nav"[\s\S]*?<\/nav>/gi,''); return txt.replace('</body>',`${bottomNav()}\n</body>`);}
function cleanupForbiddenTail(txt){const s=['페이지 하단의 내부 링크를 따라가면 관련 도구, 보증업체 카드, 검색 가이드, 공식 상담 연결까지 이어지도록 구성했습니다.','페이지 하단의 내부 링크를 따라가면 관련 도구, 보증업체 카드, 검색 가이드, 공식 상담 연결까지 이어지도록 구성했습니다']; for(const f of s) txt=txt.split(f).join(''); txt=txt.replace(/<section[^>]*(?:v82-related|related|cta|next-route)[^>]*>[\s\S]*?<\/section>/gi,''); return txt;}
let targets=[];
function walk(dir){if(!fs.existsSync(dir))return; for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name); if(ent.isDirectory())walk(p); else if(ent.isFile()&&ent.name==='index.html'){const rel=path.relative(ROOT,p).replaceAll(path.sep,'/'); let txt=fs.readFileSync(p,'utf8'); if(!shouldPatch(txt,rel))continue; txt=ensureHeadAssets(txt); txt=patchBodyClass(txt); txt=patchHeader(txt); txt=patchBottomNav(txt); txt=cleanupForbiddenTail(txt); fs.writeFileSync(p,txt); targets.push(rel);}}}
walk(path.join(ROOT,'blog'));
fs.mkdirSync(path.join(ROOT,'assets/data'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'assets/data/v85-4-blog-post-shell-targets.json'),JSON.stringify({version:VERSION,marker:MARKER,count:targets.length,targets},null,2));
console.log(`[V85-4] blog post shell locked. targets=${targets.length}`);
