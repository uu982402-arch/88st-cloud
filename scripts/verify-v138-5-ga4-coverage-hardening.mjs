import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const VERSION = 'V138_5_GA4_COVERAGE_HARDENING';
const GA_ID = 'G-KWT87FBY6S';
function p(...parts){return path.join(ROOT,...parts)}
function read(f){return fs.readFileSync(f,'utf8')}
function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const fp=path.join(dir,ent.name);if(ent.isDirectory()){if(!['node_modules','.git'].includes(ent.name))walk(fp,out)}else if(ent.isFile()&&ent.name.endsWith('.html'))out.push(fp)}return out}
function rel(fp){return path.relative(ROOT,fp).replace(/\\/g,'/')}
function excluded(r){return /^(admin|ops|cert|analysis)(\/|$)/i.test(r)}
function noindex(h){return /<meta\b[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(h)}
const errors=[];
const required=[
 'assets/js/v82.ga4-events.js','assets/js/v89.ga4-event-depth.js',
 'scripts/build-v138-5-cloudflare-pages-safe.mjs','scripts/generate-v138-5-ga4-coverage-hardening.mjs','scripts/verify-v138-5-ga4-coverage-hardening.mjs',
 'V138_5_PATCH_MANIFEST.json','V138_5_UPGRADE_REPORT.md','reports/v138-5-ga4-coverage-audit.json'
];
for(const f of required) if(!fs.existsSync(p(f))) errors.push('missing '+f);
const v82 = fs.existsSync(p('assets/js/v82.ga4-events.js')) ? read(p('assets/js/v82.ga4-events.js')) : '';
if(!v82.includes(GA_ID)) errors.push('v82 ga4 script missing measurement id');
if(!/send_page_view\s*:\s*true/.test(v82)) errors.push('v82 ga4 config missing send_page_view:true');
if(!v82.includes('/^\\/ops\\/?/i') || !v82.includes('/^\\/admin\\/?/i')) errors.push('v82 blocked paths missing ops/admin');
const v89 = fs.existsSync(p('assets/js/v89.ga4-event-depth.js')) ? read(p('assets/js/v89.ga4-event-depth.js')) : '';
for(const needle of ['blog_scroll_50','blog_scroll_90','post_read_complete','telegram_open','vendor_copy_code','tool_open']) if(!v89.includes(needle)) errors.push('v89 missing event '+needle);
const files = walk(ROOT);
let publicCount=0, covered=0;
for(const fp of files){
 const r=rel(fp); const h=read(fp); const isPublic=!excluded(r) && !noindex(h);
 if(isPublic){
   publicCount++;
   if(!h.includes('name="rust-ga4-id" content="'+GA_ID+'"')) errors.push(r+' missing rust-ga4-id meta');
   if(!h.includes('v82.ga4-events.js')) errors.push(r+' missing v82 ga4 loader');
   if(!h.includes('v89.ga4-event-depth.js')) errors.push(r+' missing v89 ga4 depth events');
   if(!h.includes('data-v138-5-ga4-coverage="active"')) errors.push(r+' missing v138-5 html flag');
   const v82Count=(h.match(/v82\.ga4-events\.js/g)||[]).length;
   const v89Count=(h.match(/v89\.ga4-event-depth\.js/g)||[]).length;
   const idCount=(h.match(new RegExp(GA_ID,'g'))||[]).length;
   if(v82Count!==1) errors.push(r+' duplicate/missing v82 count '+v82Count);
   if(v89Count!==1) errors.push(r+' duplicate/missing v89 count '+v89Count);
   if(idCount<1) errors.push(r+' measurement id count low '+idCount);
   covered++;
 }
 if(/href\s*=\s*["']#["']/i.test(h)) errors.push(r+' still contains href="#"');
}
const pkg=JSON.parse(read(p('package.json')));
if(pkg.scripts?.build !== 'node scripts/build-v138-5-cloudflare-pages-safe.mjs') errors.push('package build not V138-5');
if(pkg.scripts?.verify !== 'node scripts/verify-v138-5-ga4-coverage-hardening.mjs') errors.push('package verify not V138-5');
for(const route of ['faq','consult-motives','consult-result','provider-updates']){
 if(fs.existsSync(p(route))) errors.push('removed route directory regenerated: '+route);
 for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']) if(fs.existsSync(p(sm)) && read(p(sm)).includes('/'+route+'/')) errors.push(sm+' contains removed route '+route);
}
const tools=fs.existsSync(p('tools/index.html'))?read(p('tools/index.html')):'';
if(tools && /class="v73-modal[\s\S]*?(moon-footer|rust-footer|site-footer|rust-bottom-nav)/i.test(tools)) errors.push('tools modal appears to contain footer/bottom nav');
const audit=fs.existsSync(p('reports/v138-5-ga4-coverage-audit.json'))?JSON.parse(read(p('reports/v138-5-ga4-coverage-audit.json'))):null;
if(!audit || audit.version!==VERSION) errors.push('audit report invalid');
if(errors.length){console.error('[V138.5 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1)}
fs.mkdirSync(p('reports'),{recursive:true});
fs.writeFileSync(p('reports/v138-5-verify-report.json'), JSON.stringify({ok:true,version:VERSION,publicHtml:publicCount,covered,measurementId:GA_ID,generatedAt:new Date().toISOString()},null,2));
console.log('[V138.5 VERIFY PASS] GA4 coverage hardening OK', JSON.stringify({publicHtml:publicCount, covered, measurementId:GA_ID}));
