import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const VERSION = 'V138_6_BLOG_FORMULA_SEO_REFRESH';
function p(...parts){return path.join(ROOT,...parts)}
function read(f){return fs.readFileSync(f,'utf8')}
function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const fp=path.join(dir,ent.name);if(ent.isDirectory()){if(!['node_modules','.git'].includes(ent.name))walk(fp,out)}else if(ent.isFile()&&ent.name.endsWith('.html'))out.push(fp)}return out}
function rel(fp){return path.relative(ROOT,fp).replace(/\\/g,'/')}
const errors=[];
const required=[
 'assets/css/v138-6-blog-content-seo-refresh.css',
 'assets/config/seo.meta.json',
 'scripts/build-v138-6-cloudflare-pages-safe.mjs',
 'scripts/generate-v138-6-blog-formula-seo-refresh.mjs',
 'scripts/verify-v138-6-blog-formula-seo-refresh.mjs',
 'V138_6_PATCH_MANIFEST.json',
 'V138_6_UPGRADE_REPORT.md',
 'reports/v138-6-blog-formula-seo-refresh-audit.json'
];
for(const f of required) if(!fs.existsSync(p(f))) errors.push('missing '+f);
const pkg=JSON.parse(read(p('package.json')));
if(pkg.scripts?.build !== 'node scripts/build-v138-6-cloudflare-pages-safe.mjs') errors.push('package build not V138-6');
if(pkg.scripts?.verify !== 'node scripts/verify-v138-6-blog-formula-seo-refresh.mjs') errors.push('package verify not V138-6');
const css=fs.existsSync(p('assets/css/v138-6-blog-content-seo-refresh.css')) ? read(p('assets/css/v138-6-blog-content-seo-refresh.css')) : '';
if(!css.includes('.v138-6-blog-refresh')) errors.push('V138-6 css missing refresh selector');
const seo=fs.existsSync(p('assets/config/seo.meta.json')) ? JSON.parse(read(p('assets/config/seo.meta.json'))) : {};
let blogCount=0, cssCount=0, keywordCount=0, descCount=0, bodyRefresh=0, formulaWithRefresh=0, ga4Count=0;
const blogFiles=walk(p('blog'));
for(const fp of blogFiles){
 const r=rel(fp); const h=read(fp); blogCount++;
 if(!h.includes('data-v138-6-blog-seo-refresh="active"')) errors.push(r+' missing html V138-6 flag');
 if(!h.includes('v138-6-blog-content-seo-refresh.css')) errors.push(r+' missing V138-6 css'); else cssCount++;
 if(!/<meta\b[^>]+name=["']keywords["'][^>]+content=["'][^"']*(RUST|러스트)[^"']*(88st\.cloud|88ST)[^"']*/i.test(h)) errors.push(r+' weak/missing SEO keywords'); else keywordCount++;
 if(!/<meta\b[^>]+name=["']description["'][^>]+content=["'][^"']{50,180}["']/i.test(h) && !/^blog\/(index\.html|page\/)/.test(r)) errors.push(r+' weak/missing description'); else descCount++;
 if(h.includes('v138-6-blog-refresh')) bodyRefresh++;
 if(/class=["'][^"']*v48-formula/i.test(h) && h.includes('data-v138-6-blog-refresh="formula"')) formulaWithRefresh++;
 if(!/^(blog\/page\/|blog\/index\.html$)/.test(r)){
  const route = h.match(/<link\b[^>]+rel=["']canonical["'][^>]+href=["']https?:\/\/88st\.cloud([^"']+)["'][^>]*>/i)?.[1];
  if(route && !seo[route]) errors.push('seo.meta.json missing route '+route);
 }
 if(!h.includes('v82.ga4-events.js') || !h.includes('v89.ga4-event-depth.js')) errors.push(r+' lost GA4 coverage'); else ga4Count++;
 if(/href\s*=\s*["']#["']/i.test(h)) errors.push(r+' still contains href="#"');
 for(const forbidden of ['AI검색 Q&A','관련글','추천글','신뢰칩','선택 기준','확인 기준']){
   // Allow natural occurrences in older article text only if not introduced as a V138-6 block. Fail if appears near our marker.
   const idx=h.indexOf('v138-6-blog-refresh');
   if(idx>=0 && h.slice(Math.max(0,idx-300), idx+1200).includes(forbidden)) errors.push(r+' V138-6 block includes forbidden text '+forbidden);
 }
}
if(formulaWithRefresh < 40) errors.push('formula refresh coverage too low: '+formulaWithRefresh);
if(bodyRefresh < 80) errors.push('blog content refresh coverage too low: '+bodyRefresh);
const audit=fs.existsSync(p('reports/v138-6-blog-formula-seo-refresh-audit.json')) ? JSON.parse(read(p('reports/v138-6-blog-formula-seo-refresh-audit.json'))) : null;
if(!audit || audit.version!==VERSION || !audit.ok) errors.push('audit invalid');
if(audit && audit.deletedFiles?.length) errors.push('deletedFiles not empty');
for(const route of ['faq','consult-motives','consult-result','provider-updates']){
 if(fs.existsSync(p(route))) errors.push('removed route directory regenerated: '+route);
 for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']) if(fs.existsSync(p(sm)) && read(p(sm)).includes('/'+route+'/')) errors.push(sm+' contains removed route '+route);
}
const tools=fs.existsSync(p('tools/index.html'))?read(p('tools/index.html')):'';
if(tools && /class="v73-modal[\s\S]*?(moon-footer|rust-footer|site-footer|rust-bottom-nav)/i.test(tools)) errors.push('tools modal appears to contain footer/bottom nav');
if(errors.length){console.error('[V138.6 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1)}
fs.mkdirSync(p('reports'),{recursive:true});
fs.writeFileSync(p('reports/v138-6-verify-report.json'), JSON.stringify({ok:true,version:VERSION,blogHtml:blogCount,cssCount,keywordCount,descCount,bodyRefresh,formulaWithRefresh,ga4Count,generatedAt:new Date().toISOString()},null,2));
console.log('[V138.6 VERIFY PASS] blog formula + SEO refresh OK', JSON.stringify({blogHtml:blogCount, bodyRefresh, formulaWithRefresh, keywordCount, ga4Count}));
