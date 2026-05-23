#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='static-growth-conversion-v60';
const CSS='/assets/css/v60.open-ready-final.css?v='+VERSION;
const JS='/assets/js/v60.open-ready-final.js?v='+VERSION;
function walk(dir,out=[]){for(const name of fs.readdirSync(dir)){if(['node_modules','.git','__MACOSX'].includes(name))continue;const p=path.join(dir,name);const st=fs.statSync(p);if(st.isDirectory())walk(p,out);else out.push(p);}return out;}
function rel(p){return path.relative(ROOT,p).replaceAll(path.sep,'/');}
function read(p){return fs.readFileSync(p,'utf8');}
function write(file,content){const p=path.join(ROOT,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,content,'utf8');}
function inject(html){
  html=html.replace(/<link[^>]+v60\.open-ready-final\.css[^>]*>/g,'');
  html=html.replace(/<script[^>]+v60\.open-ready-final\.js[^>]*><\/script>/g,'');
  html=html.replace('</head>',`<link rel="stylesheet" href="${CSS}"/></head>`);
  html=html.replace('</body>',`<script src="${JS}" defer></script></body>`);
  html=html.replace(/<body(?![^>]*v60-open-ready)([^>]*)>/i,(m,attrs)=>/class\s*=/.test(attrs)?m.replace(/class=["']([^"']*)["']/,(_,c)=>`class="${c} v60-open-ready"`):`<body${attrs} class="v60-open-ready">`);
  return html;
}
const files=walk(ROOT); const htmls=files.filter(f=>f.endsWith('.html'));
for(const f of htmls){ let s=read(f); const before=s; s=inject(s); s=s.replace(/(<img\b[^>]*?src=["'][^"']+["'])\/\s+(width=)/gi, '$1 $2'); if(s!==before) fs.writeFileSync(f,s,'utf8'); }
// Ensure blank targets have rel in HTML output
for(const f of htmls){ let s=read(f); const before=s; s=s.replace(/<a\b([^>]*?)target=["']_blank["']([^>]*)>/gi,(m,a,b)=>/rel=/.test(m)?m:`<a${a}target="_blank" rel="noopener noreferrer"${b}>`); if(s!==before) fs.writeFileSync(f,s,'utf8'); }
function existingRoutes(){const set=new Set(['/']);for(const f of htmls){const r='/'+rel(f);set.add(r);if(r.endsWith('/index.html')){set.add(r.slice(0,-10));set.add(r.slice(0,-11));}}return set;}
const routeSet=existingRoutes();
const assetExt=/\.(css|js|png|jpe?g|webp|svg|ico|json|txt|xml|webmanifest|pdf|map)$/i;
let badHref=[];let missingAsset=[];let deadInternal=[];let blankRelMissing=[];let whiteFallback=[];let vendor={mainCards:0,guaranteedCards:0,vendorLandings:0,copyButtons:0,detailLinks:0,domainLinks:0};let tools={cards:0,panels:0,results:0};let noindexInSitemap=[];let sitemapMissing=[];let sitemapDuplicates=[];
for(const f of htmls){const txt=read(f);const r=rel(f); if(/href=["']#(?:["']|$)|javascript:void\(0\)/i.test(txt)) badHref.push(r); if(/background\s*:\s*(#fff|white)|background-color\s*:\s*(#fff|white)/i.test(txt)&&r.startsWith('blog/')) whiteFallback.push(r); if(/target=["']_blank["'](?![^>]*rel=)/i.test(txt)) blankRelMissing.push(r);
  for(const m of txt.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){let href=m[1].split('#')[0].split('?')[0]; if(!href||href.startsWith('http')||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('//')) continue; if(!href.startsWith('/')) continue; if(assetExt.test(href)){if(!fs.existsSync(path.join(ROOT,href.replace(/^\//,'')))) missingAsset.push(`${r} -> ${href}`);} else if(!routeSet.has(href)&&!routeSet.has(href.replace(/\/$/,''))&&!routeSet.has(href+'/')&&!routeSet.has(href.replace(/\/$/,'')+'/index.html')) deadInternal.push(`${r} -> ${href}`);}
}
const home=path.join(ROOT,'index.html'); if(fs.existsSync(home)){const h=read(home); vendor.mainCards=(h.match(/v58-provider-card/g)||[]).length;}
const gidx=path.join(ROOT,'guaranteed/index.html'); if(fs.existsSync(gidx)){const g=read(gidx); vendor.guaranteedCards=(g.match(/v57-premium-provider-card|v58-provider-card|v49-guaranteed-card/g)||[]).length; vendor.copyButtons=(g.match(/data-v57-copy-code=|data-v52-copy-code=|data-v49-copy-code=|data-v47-copy-code=/g)||[]).length; vendor.detailLinks=(g.match(/상세보기/g)||[]).length; vendor.domainLinks=(g.match(/바로가기/g)||[]).length;}
for(const slug of ['queenbee','sk-holdings','anybet','udt','ddangkong']) if(fs.existsSync(path.join(ROOT,'guaranteed',slug,'index.html'))) vendor.vendorLandings++;
const toolsFp=path.join(ROOT,'tools/index.html'); if(fs.existsSync(toolsFp)){const t=read(toolsFp); tools.cards=(t.match(/data-v52-open=|data-v51-open=/g)||[]).length; tools.panels=(t.match(/data-v52-panel=|data-v51-panel=/g)||[]).length; tools.results=(t.match(/v51-tool-result|v52-tool-result/g)||[]).length;}
const sitemap=path.join(ROOT,'sitemap.xml'); if(fs.existsSync(sitemap)){const sm=read(sitemap);const locs=[...sm.matchAll(/<loc>https:\/\/88st\.cloud([^<]+)<\/loc>/g)].map(m=>m[1]);const seen=new Set();for(const route of locs){if(seen.has(route))sitemapDuplicates.push(route);seen.add(route);const target=route==='/'?path.join(ROOT,'index.html'):route.endsWith('/')?path.join(ROOT,route.slice(1),'index.html'):path.join(ROOT,route.slice(1)); if(!fs.existsSync(target)) sitemapMissing.push(route); else if(/noindex/i.test(read(target))) noindexInSitemap.push(route);}}
const referenced=new Set();for(const f of htmls.concat(files.filter(f=>/\.(css|js|mjs|json)$/i.test(f)))){let txt='';try{txt=read(f)}catch{};for(const m of txt.matchAll(/["'(]([^"'()]+\.(?:png|jpe?g|webp|svg|ico|css|js|json))["')]/gi)){const p=m[1].split('?')[0]; if(p.startsWith('/')) referenced.add(p.slice(1)); else referenced.add(path.normalize(path.join(path.dirname(rel(f)),p)).replaceAll('\\','/'));}}
const assetFiles=files.map(rel).filter(x=>/^(assets|img)\//.test(x));
const cleanupCandidates=assetFiles.filter(x=>!referenced.has(x)&&!/v59\/.*-card\.svg$/.test(x)&&!/favicon|apple-touch|site\.webmanifest/.test(x)).slice(0,80);
const audit={version:VERSION,generatedAt:new Date().toISOString(),summary:{html:htmls.length,files:files.length,badHref:badHref.length,missingAsset:missingAsset.length,deadInternal:deadInternal.length,blankRelMissing:blankRelMissing.length,whiteFallback:whiteFallback.length,sitemapMissing:sitemapMissing.length,sitemapDuplicates:sitemapDuplicates.length,noindexInSitemap:noindexInSitemap.length},vendor,tools,checks:{majorPages:['/','/blog/','/tools/','/guaranteed/','/consult/'],vendorLandings:['/guaranteed/queenbee/','/guaranteed/sk-holdings/','/guaranteed/anybet/','/guaranteed/udt/','/guaranteed/ddangkong/']},cleanup:{policy:'safe-candidate-only; no automatic deletion in V60 generator',candidates:cleanupCandidates},details:{badHref:badHref.slice(0,50),missingAsset:missingAsset.slice(0,50),deadInternal:deadInternal.slice(0,50),blankRelMissing:blankRelMissing.slice(0,50),whiteFallback:whiteFallback.slice(0,50),sitemapMissing:sitemapMissing.slice(0,50),sitemapDuplicates:sitemapDuplicates.slice(0,50),noindexInSitemap:noindexInSitemap.slice(0,50)}};
write('assets/data/v60.open-ready-final.audit.json',JSON.stringify(audit,null,2));

// Keep final build fingerprint on V60 because older generators may patch gen-build-ver.
const genBuild = path.join(ROOT, 'scripts/gen-build-ver.mjs');
if (fs.existsSync(genBuild)) {
  let g = fs.readFileSync(genBuild, 'utf8');
  g = g.replace(/static-growth-conversion-v\d+-/g, 'static-growth-conversion-v60-');
  fs.writeFileSync(genBuild, g, 'utf8');
}

console.log(`V60 open-ready finalization applied: html=${htmls.length}, badHref=${badHref.length}, missingAsset=${missingAsset.length}, deadInternal=${deadInternal.length}`);
