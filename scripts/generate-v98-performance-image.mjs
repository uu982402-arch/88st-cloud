import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v98-performance-image-20260526';
const CSS_HREF = `/assets/css/v98-performance-image.css?v=${VERSION}`;
const JS_SRC = `/assets/js/v98-performance-image.js?v=${VERSION}`;
const META = '  <meta name="v98-performance-image" content="V98_PERFORMANCE_IMAGE_ACTIVE">';
const CSS_TAG = `  <link rel="stylesheet" href="${CSS_HREF}" data-v98-performance-image="true">`;
const JS_TAG = `<script defer src="${JS_SRC}" data-v98-performance-image="true"></script>`;

const css = `/* V98 PERFORMANCE / IMAGE PATCH
   목표: 모바일/크롬 기준 이미지 우선순위, CLS, 하단 렌더링 비용을 안전하게 낮춘다. */
:root{--v98-img-radius:18px;--v98-fade-duration:.18s}
html[data-v98-performance-image="active"],body[data-v98-performance-image="active"]{text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;vertical-align:middle}
img[data-v98-img="optimized"]{background:transparent;contain:paint;transform:translateZ(0)}
img[loading="lazy"]{content-visibility:auto;contain-intrinsic-size:320px 180px}
.rust-brand-mark img,.rust-brand-lockup img{contain:strict;content-visibility:visible;backface-visibility:hidden}
.v96-2-art,.v96-2-card-art,.vendor-image-box,.guaranteed-image,.v96-5-card-media{aspect-ratio:16/9;overflow:hidden;display:grid;place-items:center;contain:layout paint style}
.v96-2-art img,.v96-2-card-art img,.vendor-image-box img,.guaranteed-image img,.v96-5-card-media img,.guaranteed-card img,.vendor-card img{width:100%;height:100%;object-fit:contain;object-position:center;display:block}
.v96-2-info-card,.v96-2-section,.v96-2-neighbors,.blog-card,.tool-card,.guide-card,.rust-card,article[class*="card"]{content-visibility:auto;contain-intrinsic-size:1px 260px}
.blog-grid,.home-blog-grid,.tools-grid,.v96-2-info-grid,.v96-2-benefits,.v96-2-neighbor-links{contain:layout style;min-width:0}
.v96-2-table-wrap{contain:layout paint;overflow:auto;-webkit-overflow-scrolling:touch}
@media (max-width: 768px){
  .v96-2-shell,.rust-page-shell,.page-shell,.main-shell,.site-main,main{contain:layout style;min-width:0}
  .v96-2-art{border-radius:var(--v98-img-radius)}
  .v96-2-info-card,.v96-2-section,.blog-card,.tool-card{contain-intrinsic-size:1px 220px}
  .mobile-bottom-nav,.rust-mobile-bottom-nav{will-change:transform;contain:layout paint style}
}
@media (prefers-reduced-motion: reduce){img[data-v98-img="optimized"]{transition:none!important}}
`;
const js = `(()=>{
  const VERSION='V98_PERFORMANCE_IMAGE_ACTIVE';
  const onReady=(fn)=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  const idle=(fn)=>('requestIdleCallback' in window?requestIdleCallback(fn,{timeout:1600}):setTimeout(fn,80));
  onReady(()=>{
    document.documentElement.dataset.v98PerformanceImage='active';
    document.body && (document.body.dataset.v98PerformanceImage='active');
    const imgs=[...document.images];
    let highUsed=0;
    imgs.forEach((img,idx)=>{
      img.dataset.v98Img='optimized';
      if(!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
      const isLogo=/rust-crest-(?:32|48|64|96|128|180|192|256|512)\.png$/i.test(img.currentSrc||img.src||'');
      const isVendor=/\/assets\/img\/guaranteed\/cards\//i.test(img.getAttribute('src')||'');
      const isDetail=img.hasAttribute('data-v92-detail-image');
      const shouldHigh=(isDetail || (isVendor && highUsed===0 && /(?:^|\/)guaranteed\/?$/.test(location.pathname.replace(/index\.html$/,''))));
      if(isLogo){
        img.setAttribute('loading','eager');
        img.removeAttribute('fetchpriority');
      }else if(shouldHigh){
        img.setAttribute('loading','eager');
        img.setAttribute('fetchpriority','high');
        highUsed++;
      }else{
        img.setAttribute('loading','lazy');
        img.setAttribute('fetchpriority','low');
      }
      if(!img.complete){
        img.addEventListener('load',()=>{img.dataset.v98Loaded='true';},{once:true,passive:true});
        img.addEventListener('error',()=>{img.dataset.v98Error='true';},{once:true,passive:true});
      }else{
        img.dataset.v98Loaded='true';
      }
    });
    idle(()=>document.documentElement.setAttribute('data-v98-image-idle','complete'));
  });
})();
`;
const data = {"version": "V98_PERFORMANCE_IMAGE_PATCH", "date": "2026-05-26", "base": "V97_CONTENT_SEO_CLEAN_FULL", "goals": ["reduce image priority noise", "keep only actual hero/vendor image high priority", "replace 42px header logo from 192px asset to 64px asset", "add safe lazy rendering CSS", "preserve V96.3/V96.4/V96.5/V97 structure"], "noDelete": true};

function ensureDir(p){fs.mkdirSync(path.dirname(p),{recursive:true});}
function walk(dir,out=[]){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git'].includes(ent.name)) continue; const p=path.join(dir,ent.name); if(ent.isDirectory()) walk(p,out); else if(ent.isFile()) out.push(p);} return out;}
function setAttr(tag,name,value){const re=new RegExp(`\\s${name}=("[^"]*"|'[^']*'|[^\\s>]+)`,'i'); if(re.test(tag)) return tag.replace(re,` ${name}="${value}"`); return tag.replace(/>$/,` ${name}="${value}">`);}
function removeAttr(tag,name){return tag.replace(new RegExp(`\\s${name}=("[^"]*"|'[^']*'|[^\\s>]+)`,'ig'),'');}
function getAttr(tag,name){const m=tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,'i')); return m ? (m[1]||m[2]||m[3]||'') : '';}
function addClass(html,cls){return html.replace(/<body\b([^>]*)>/i,(tag,attrs)=>{if(tag.includes(cls)) return tag; if(/\sclass=/i.test(tag)) return tag.replace(/class="([^"]*)"/i,(_,v)=>`class="${v} ${cls}"`); return tag.replace(/>$/,` class="${cls}">`);});}
function setBodyData(html){return html.replace(/<body\b[^>]*>/i,(tag)=>tag.includes('data-v98-performance-image=')?tag:tag.replace(/>$/,' data-v98-performance-image="active">'));}
function processHtml(file){let s=fs.readFileSync(file,'utf8'); const before=s;
  s=s.replace(/\n?\s*<meta name="v98-performance-image"[^>]*>/g,'');
  s=s.replace(/\n?\s*<link rel="stylesheet" href="\/assets\/css\/v98-performance-image\.css[^>]*>/g,'');
  s=s.replace(/\n?\s*<script defer src="\/assets\/js\/v98-performance-image\.js[^>]*><\/script>/g,'');
  s=s.replace(/<link rel="preload" as="image" href="\/assets\/img\/rust\/rust-crest-192\.png" imagesrcset="[^"]*"([^>]*)>/g,'<link rel="preload" as="image" href="/assets/img/rust/rust-crest-64.png" imagesrcset="/assets/img/rust/rust-crest-64.png 64w, /assets/img/rust/rust-crest-96.png 96w" sizes="42px"$1 data-v98-logo-preload="true">');
  const rel=path.relative(ROOT,file).split(path.sep).join('/');
  const isHub=rel.endsWith('guaranteed/index.html') || rel==='index.html';
  let highVendorDone=false;
  s=s.replace(/<img\b[^>]*>/gi,(tag)=>{
    let src=getAttr(tag,'src'); const width=getAttr(tag,'width');
    if(src==='/assets/img/rust/rust-crest-192.png' && ['40','42','48'].includes(width)){tag=setAttr(tag,'src','/assets/img/rust/rust-crest-64.png'); src='/assets/img/rust/rust-crest-64.png';}
    const isLogo=/\/assets\/img\/rust\/rust-crest-(32|48|64|96|128|180|192|256|512)\.png$/i.test(src);
    const isVendor=src.includes('/assets/img/guaranteed/cards/');
    const isDetail=tag.includes('data-v92-detail-image');
    let shouldHigh=false;
    if(isDetail) shouldHigh=true; else if(isVendor && isHub && !highVendorDone){shouldHigh=true; highVendorDone=true;}
    tag=setAttr(tag,'decoding','async'); tag=setAttr(tag,'data-v98-img','optimized');
    if(isLogo){tag=setAttr(tag,'loading','eager'); tag=removeAttr(tag,'fetchpriority');}
    else if(shouldHigh){tag=setAttr(tag,'loading','eager'); tag=setAttr(tag,'fetchpriority','high');}
    else{tag=setAttr(tag,'loading','lazy'); tag=setAttr(tag,'fetchpriority','low');}
    return tag;
  });
  if(!s.includes('name="v98-performance-image"')) s=s.replace('</head>',`${META}\n${CSS_TAG}\n</head>`);
  if(!s.includes('data-v98-performance-image="true"></script>')) s=s.replace('</body>',`${JS_TAG}\n</body>`);
  s=addClass(s,'v98-performance-image'); s=setBodyData(s);
  s=s.replace(/<html\b([^>]*)>/i,(tag,attrs)=>attrs.includes('data-v98-performance-image=')?tag:`<html${attrs} data-v98-performance-image="active">`);
  if(s!==before) fs.writeFileSync(file,s);
}

ensureDir(path.join(ROOT,'assets/css/v98-performance-image.css'));
fs.writeFileSync(path.join(ROOT,'assets/css/v98-performance-image.css'),css);
ensureDir(path.join(ROOT,'assets/js/v98-performance-image.js'));
fs.writeFileSync(path.join(ROOT,'assets/js/v98-performance-image.js'),js);
ensureDir(path.join(ROOT,'assets/data/v98-performance-image.json'));
fs.writeFileSync(path.join(ROOT,'assets/data/v98-performance-image.json'),JSON.stringify(data,null,2));
for(const file of walk(ROOT).filter(f=>f.endsWith('.html'))) processHtml(file);
const pkgFile=path.join(ROOT,'package.json');
const pkg=JSON.parse(fs.readFileSync(pkgFile,'utf8')); pkg.scripts ||= {};
if(!pkg.scripts.build.includes('generate-v98-performance-image.mjs')) pkg.scripts.build += ' && node scripts/generate-v98-performance-image.mjs';
pkg.scripts['quality:v98']='node scripts/generate-v98-performance-image.mjs';
pkg.scripts['verify:v98']='node scripts/verify-v98-performance-image.mjs';
pkg.scripts.verify='node scripts/verify-v98-performance-image.mjs';
fs.writeFileSync(pkgFile,JSON.stringify(pkg,null,2)+'\n');
fs.writeFileSync(path.join(ROOT,'build.txt'),'V98-PERFORMANCE-IMAGE-PATCH-20260526\nbase=V97_CONTENT_SEO_CLEAN_FULL\n');
ensureDir(path.join(ROOT,'assets/js/build.ver.js'));
fs.writeFileSync(path.join(ROOT,'assets/js/build.ver.js'),"window.RUST_BUILD_VERSION='V98-PERFORMANCE-IMAGE-PATCH-20260526';\nwindow.RUST_BUILD_LABEL='V98 Performance / Image Patch';\n");
console.log('[V98] performance/image patch generated');
