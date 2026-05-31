import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V139_1_GA4_STALE_BLOG_COVERAGE_HOTFIX';
function p(...parts){return path.join(ROOT,...parts)}
function read(f){return fs.readFileSync(f,'utf8')}
function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const fp=path.join(dir,ent.name);if(ent.isDirectory()){if(!['node_modules','.git'].includes(ent.name))walk(fp,out)}else if(ent.isFile()&&ent.name.endsWith('.html'))out.push(fp)}return out}
function rel(fp){return path.relative(ROOT,fp).replace(/\\/g,'/')}
const errors=[];
const required=['assets/css/v139-blog-content-differentiation.css','scripts/build-v139-1-cloudflare-pages-safe.mjs','scripts/generate-v139-blog-content-differentiation-seo-intent.mjs','scripts/verify-v139-blog-content-differentiation-seo-intent.mjs','scripts/generate-v139-1-ga4-coverage-hotfix.mjs','scripts/verify-v139-1-ga4-coverage-hotfix.mjs','V139_PATCH_MANIFEST.json','V139_UPGRADE_REPORT.md','reports/v139-blog-content-differentiation-audit.json'];
for(const f of required) if(!fs.existsSync(p(f))) errors.push('missing '+f);
const pkg=JSON.parse(read(p('package.json')));
if(pkg.scripts?.build !== 'node scripts/build-v139-1-cloudflare-pages-safe.mjs') errors.push('package build not V139.1');
if(pkg.scripts?.verify !== 'node scripts/verify-v139-1-ga4-coverage-hotfix.mjs') errors.push('package verify not V139.1');
const css=fs.existsSync(p('assets/css/v139-blog-content-differentiation.css'))?read(p('assets/css/v139-blog-content-differentiation.css')):'';
if(!css.includes('.v139-blog-diff-note')) errors.push('V139 css missing diff note selector');
const seo=fs.existsSync(p('assets/config/seo.meta.json'))?JSON.parse(read(p('assets/config/seo.meta.json'))):{};
let blogCount=0, v139Css=0, diffNotes=0, genericH2=0, numbering9=0, metaOk=0, ga4Ok=0, navShort=0;
for(const fp of walk(p('blog'))){
 const r=rel(fp); const h=read(fp); blogCount++;
 if(!h.includes('data-v139-blog-quality="active"')) errors.push(r+' missing V139 html flag');
 if(!h.includes('v139-blog-content-differentiation.css')) errors.push(r+' missing V139 css'); else v139Css++;
 if(h.includes('data-v139-blog-diff=')) diffNotes++;
 if(/<h2>1\.\s*개요 및 기술적·수학적 메커니즘 분석<\/h2>/i.test(h)){ genericH2++; errors.push(r+' still has generic formula h2'); }
 if(/<h2>\s*9\.\s*운영 관점의 최종 요약\s*<\/h2>/i.test(h)){ numbering9++; errors.push(r+' still has h2 number 9 final summary'); }
 if(/<a\b[^>]*href=["']\/guaranteed\/?["'][^>]*>\s*(?:<span>[^<]*<\/span>\s*)?보증\s*<\/a>/i.test(h)){ navShort++; errors.push(r+' still has short nav label 보증'); }
 if(/<meta\b[^>]+name=["']keywords["'][^>]+content=["'][^"']*(RUST|러스트)[^"']*(88st\.cloud|88ST)[^"']*/i.test(h)) metaOk++; else errors.push(r+' weak/missing keywords');
 if(!/^(blog\/index\.html$|blog\/page\/)/.test(r)){
  const route=h.match(/<link\b[^>]+rel=["']canonical["'][^>]+href=["']https?:\/\/88st\.cloud([^"']+)["'][^>]*>/i)?.[1];
  if(route && !seo[route]) errors.push('seo.meta.json missing route '+route);
  if(!/<meta\b[^>]+name=["']description["'][^>]+content=["'][^"']{60,180}["']/i.test(h)) errors.push(r+' weak/missing description');
 }
 if(h.includes('v82.ga4-events.js') && h.includes('v89.ga4-event-depth.js')) ga4Ok++; else errors.push(r+' lost GA4 coverage');
 if(/href\s*=\s*["']#["']/i.test(h)) errors.push(r+' still contains href="#"');
}
if(diffNotes < 180) errors.push('V139 diff note coverage too low: '+diffNotes);
const audit=fs.existsSync(p('reports/v139-blog-content-differentiation-audit.json'))?JSON.parse(read(p('reports/v139-blog-content-differentiation-audit.json'))):null;
if(!audit || audit.version!=='V139_BLOG_CONTENT_DIFFERENTIATION_SEO_INTENT' || !audit.ok) errors.push('V139 audit invalid');
const audit1391=fs.existsSync(p('reports/v139-1-ga4-stale-blog-coverage-audit.json'))?JSON.parse(read(p('reports/v139-1-ga4-stale-blog-coverage-audit.json'))):null;
if(!audit1391 || audit1391.version!==VERSION || !audit1391.ok) errors.push('V139.1 audit invalid');
if(audit && audit.deletedFiles?.length) errors.push('V139 deletedFiles not empty');
if(audit1391 && audit1391.deletedFiles?.length) errors.push('V139.1 deletedFiles not empty');
for(const route of ['faq','consult-motives','consult-result','provider-updates']){
 if(fs.existsSync(p(route))) errors.push('removed route directory regenerated: '+route);
 for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']) if(fs.existsSync(p(sm)) && read(p(sm)).includes('/'+route+'/')) errors.push(sm+' contains removed route '+route);
}
const tools=fs.existsSync(p('tools/index.html'))?read(p('tools/index.html')):'';
if(tools && /class="v73-modal[\s\S]*?(moon-footer|rust-footer|site-footer|rust-bottom-nav)/i.test(tools)) errors.push('tools modal appears to contain footer/bottom nav');
if(errors.length){console.error('[V139.1 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1)}
fs.mkdirSync(p('reports'),{recursive:true});
fs.writeFileSync(p('reports/v139-1-verify-report.json'), JSON.stringify({ok:true,version:VERSION,blogHtml:blogCount,v139Css,diffNotes,genericH2,numbering9,metaOk,ga4Ok,navShort,generatedAt:new Date().toISOString()},null,2));
console.log('[V139.1 VERIFY PASS] blog content differentiation + stale GA4 coverage OK', JSON.stringify({blogHtml:blogCount,diffNotes,metaOk,ga4Ok},null,2));
