import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const compact = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const VERSION = `static-growth-conversion-v56-${compact}`;
const CSS_HREF = `/assets/css/v56.high-end-system.css?v=${VERSION}`;
const JS_SRC = `/assets/js/v56.design-system.js?v=${VERSION}`;
const skipDirs = new Set(['node_modules', '.git', '__MACOSX']);
const htmlFiles = [];
function walk(dir){
  for(const name of fs.readdirSync(dir)){
    if(skipDirs.has(name)) continue;
    const p=path.join(dir,name); const st=fs.statSync(p);
    if(st.isDirectory()) walk(p); else if(p.endsWith('.html')) htmlFiles.push(p);
  }
}
function rel(p){return path.relative(ROOT,p).replaceAll(path.sep,'/');}
function addBodyClass(html){
  return html.replace(/<body\b([^>]*)>/i,(m,attrs)=>{
    if(/class=["'][^"']*\bv56-design-system\b/i.test(attrs)) return m;
    if(/class=["']/i.test(attrs)) return '<body'+attrs.replace(/class=(["'])([^"']*)\1/i,(mm,q,cls)=>`class=${q}${cls} v56-design-system${q}`)+'>';
    return `<body${attrs} class="v56-design-system">`;
  });
}
function injectCss(html){
  html=html.replace(/<link\b[^>]*href=["']\/assets\/css\/v56\.high-end-system\.css[^>]*>\s*/gi,'');
  const tag=`<link rel="stylesheet" href="${CSS_HREF}"/>`;
  const anchors=[/v55\.luminous-sitewide\.css/,/v54\.vendor-landing\.css/,/v53\.main-open-ready\.css/,/v52\.open-ready\.css/,/growth-conversion\.v36\.css/];
  for(const re of anchors){
    const m=[...html.matchAll(/<link\b[^>]*href=["'][^"']*["'][^>]*>/gi)].find(x=>re.test(x[0]));
    if(m) return html.replace(m[0],`${m[0]}${tag}`);
  }
  return html.replace(/<\/head>/i,`${tag}</head>`);
}
function injectJs(html){
  html=html.replace(/<script\b[^>]*src=["']\/assets\/js\/v56\.design-system\.js[^>]*>\s*<\/script>\s*/gi,'');
  return html.replace(/<\/body>/i,`<script defer src="${JS_SRC}"></script></body>`);
}
function refreshVersions(html){return html.replace(/static-growth-conversion-v\d+-[^"'&<>\s]+/g,VERSION);}
const logoHTML = `<span class="v56-logo-symbol" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="v56-logo-text"><span class="v56-logo-main">88ST</span><span class="v56-logo-cloud">.Cloud</span></span>`;
function normalizeBrand(html){
  const apply = (m, attrs) => {
    if(!/href=/.test(attrs)) attrs += ' href="/"';
    if(!/aria-label=/.test(attrs)) attrs += ' aria-label="88ST.Cloud 홈"';
    return `<a${attrs}>${logoHTML}</a>`;
  };
  html = html.replace(/<a\b([^>]*class=["'][^"']*\bmoon-brand\b[^"']*["'][^>]*)>[\s\S]*?<\/a>/i, apply);
  html = html.replace(/<a\b([^>]*class=["'][^"']*\bbrand\b[^"']*["'][^>]*)>[\s\S]*?<\/a>/i, apply);
  return html;
}
function normalizeFooter(html){
  return html.replace(/<footer\b([^>]*)>([\s\S]*?)<\/footer>/i,(m,attrs,inner)=>{
    const links = `<nav class="v56-footer-links" aria-label="하단 메뉴"><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증업체</a><a href="/consult/">고객센터</a></nav>`;
    const text = /보증업체|도구|가이드|코드|공식주소/.test(inner) ? '보증업체, 실사용 도구, 전문 가이드를 일관된 기준으로 정리합니다.' : '보증업체, 실사용 도구, 전문 가이드를 일관된 기준으로 정리합니다.';
    return `<footer${attrs}><div class="moon-container v56-footer-row"><div><span class="v56-footer-logo"><span class="v56-logo-main">88ST</span><span class="v56-logo-cloud">.Cloud</span></span><p>${text}</p></div>${links}</div></footer>`;
  });
}
function hardenBlankLinks(html){
  return html.replace(/href=["']#["']/g,'href="/"').replace(/href=["']javascript:void\(0\)["']/gi,'href="/"');
}
function hardenBlankTargets(html){
  return html.replace(/<a\b([^>]*target=["']_blank["'][^>]*)>/gi,(m,attrs)=>{
    if(/rel=/.test(attrs)){
      attrs=attrs.replace(/rel=(["'])([^"']*)\1/i,(mm,q,rel)=>{
        const parts = new Set(rel.split(/\s+/).filter(Boolean));
        ['noopener','noreferrer'].forEach(x=>parts.add(x));
        return `rel=${q}${[...parts].join(' ')}${q}`;
      });
    } else attrs += ' rel="noopener noreferrer"';
    return `<a${attrs}>`;
  });
}
function addPageClassHints(html,file){
  const r=rel(file);
  let hint='';
  if(r==='index.html') hint=' v56-home';
  else if(r==='tools/index.html') hint=' v56-tools';
  else if(r==='guaranteed/index.html') hint=' v56-guaranteed';
  else if(r.startsWith('guaranteed/') && r.endsWith('/index.html')) hint=' v56-vendor-landing';
  else if(r.startsWith('blog/')) hint=' v56-blog';
  if(!hint) return html;
  return html.replace(/<body\b([^>]*)>/i,(m,attrs)=>{
    if(new RegExp(`\\b${hint.trim()}\\b`).test(attrs)) return m;
    return m.replace(/class=(["'])([^"']*)\1/i,(mm,q,cls)=>`class=${q}${cls}${hint}${q}`);
  });
}
walk(ROOT);
let updated=0; const sample=[];
for(const file of htmlFiles){
  let html=fs.readFileSync(file,'utf8'); const before=html;
  html=refreshVersions(html);
  html=addBodyClass(html);
  html=addPageClassHints(html,file);
  html=normalizeBrand(html);
  html=normalizeFooter(html);
  html=hardenBlankLinks(html);
  html=hardenBlankTargets(html);
  html=injectCss(html);
  html=injectJs(html);
  if(html!==before){fs.writeFileSync(file,html,'utf8'); updated++; if(sample.length<30) sample.push(rel(file));}
}
const pkgFile=path.join(ROOT,'package.json');
if(fs.existsSync(pkgFile)){
  const pkg=JSON.parse(fs.readFileSync(pkgFile,'utf8'));
  const cmd='node scripts/generate-v56-high-end-design-system.mjs';
  if(!pkg.scripts.build.includes('generate-v56-high-end-design-system.mjs')){
    if(pkg.scripts.build.includes('node scripts/generate-v55-luminous-sitewide-design.mjs')) pkg.scripts.build=pkg.scripts.build.replace('node scripts/generate-v55-luminous-sitewide-design.mjs','node scripts/generate-v55-luminous-sitewide-design.mjs && '+cmd);
    else pkg.scripts.build += ' && '+cmd;
  }
  pkg.scripts['quality:v56']=cmd;
  fs.writeFileSync(pkgFile,JSON.stringify(pkg,null,2)+'\n','utf8');
}
const genBuild=path.join(ROOT,'scripts/gen-build-ver.mjs');
if(fs.existsSync(genBuild)) fs.writeFileSync(genBuild,fs.readFileSync(genBuild,'utf8').replace(/static-growth-conversion-v\d+-/g,'static-growth-conversion-v56-'),'utf8');
const audit={version:'v56-high-end-unified-design-system',cacheVersion:VERSION,totalHtml:htmlFiles.length,updatedHtml:updated,css:'assets/css/v56.high-end-system.css',js:'assets/js/v56.design-system.js',globalRules:['unified header/footer','compact title sections','dark navy background','glass bento cards','consistent buttons inputs and spacing','blank link hardening'],sampleUpdated:sample,generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(ROOT,'assets/data'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'assets/data/v56.high-end-system.audit.json'),JSON.stringify(audit,null,2)+'\n','utf8');
console.log(`V56 high-end design system applied to ${updated}/${htmlFiles.length} HTML files.`);
