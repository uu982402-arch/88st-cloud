import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V138_3_SECTION_RADIUS_ROLLBACK_TEXT_SAFE_FINAL';
function p(...x){return path.join(ROOT,...x)}
function read(f){return fs.readFileSync(f,'utf8')}
function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const fp=path.join(dir,ent.name);if(ent.isDirectory())walk(fp,out);else out.push(fp)}return out}
function rel(fp){return path.relative(ROOT,fp).replace(/\\/g,'/')}
const errors=[];
const required=[
 'assets/css/v138-modern-section-radius-dark-fix.css','assets/css/v138-2-live-header-text-visibility-fix.css','assets/css/v138-3-section-radius-rollback.css',
 'scripts/build-v138-3-cloudflare-pages-safe.mjs','scripts/generate-v138-3-section-radius-rollback.mjs','scripts/verify-v138-3-section-radius-rollback.mjs',
 'V138_3_PATCH_MANIFEST.json','V138_3_UPGRADE_REPORT.md','reports/v138-3-section-radius-rollback-audit.json'
];
for(const f of required) if(!fs.existsSync(p(f))) errors.push('missing '+f);
const css=fs.existsSync(p('assets/css/v138-3-section-radius-rollback.css'))?read(p('assets/css/v138-3-section-radius-rollback.css')):'';
for(const needle of ['SECTION RADIUS ROLLBACK','border-radius:0!important','background:transparent!important','clip-path:none!important','v1383-text']) if(!css.includes(needle)) errors.push('v138-3 css missing '+needle);
if(/display\s*:\s*none!important[^}]*href="\/consult\//i.test(css)) errors.push('v138-3 css hides consult nav');
const pkg=JSON.parse(read(p('package.json')));
if(pkg.scripts?.build !== 'node scripts/build-v138-3-cloudflare-pages-safe.mjs') errors.push('package build not V138-3');
if(pkg.scripts?.verify !== 'node scripts/verify-v138-3-section-radius-rollback.mjs') errors.push('package verify not V138-3');
const htmlTargets=['index.html','tools/index.html','guaranteed/index.html','consult/index.html','ops/index.html','admin/index.html','cert/index.html','sports-check/index.html','search-guides/index.html'];
for(const f of htmlTargets){
 if(!fs.existsSync(p(f))) {errors.push('missing html '+f); continue;}
 const h=read(p(f));
 if(!h.includes('data-v138-3-section-radius-rollback="active"')) errors.push(f+' missing v138-3 html flag');
 if(!h.includes('data-v138-3-section-radius-rollback="true"')) errors.push(f+' missing v138-3 css link');
}
const index=read(p('index.html'));
for(const label of ['메인','블로그','도구','보증업체','상담']) if(!index.includes(`>${label}</a>`)) errors.push('index header missing '+label);
if(index.includes('font-size:0') && index.includes('/guaranteed/')) errors.push('index contains risky font-size:0 guaranteed text');
const forbidden=['faq','consult-motives','consult-result','provider-updates'];
for(const route of forbidden){
 if(fs.existsSync(p(route))) errors.push('removed route directory regenerated: '+route);
 for(const sitemap of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']){
   if(fs.existsSync(p(sitemap)) && read(p(sitemap)).includes('/'+route+'/')) errors.push(`${sitemap} contains removed route ${route}`);
 }
}
const htmlFiles=walk(ROOT).filter((fp)=>fp.endsWith('.html'));
for(const fp of htmlFiles){
 const h=read(fp);
 if(/href\s*=\s*["']#["']/i.test(h)) errors.push(rel(fp)+' still contains href="#"');
}
const sportsSearch=[...walk(p('sports-check')).filter(fp=>fp.endsWith('.html')),...walk(p('search-guides')).filter(fp=>fp.endsWith('.html'))];
if(sportsSearch.length < 40) errors.push('sports/search detail coverage too low: '+sportsSearch.length);
for(const fp of sportsSearch){
 const h=read(fp);
 if(!h.includes('data-v138-3-section-radius-rollback="true"')) errors.push(rel(fp)+' missing v138-3 css link');
 if(!h.includes('data-v138-modern-section-radius-dark-fix="true"')) errors.push(rel(fp)+' missing v138 dark css link');
}
const manifest=JSON.parse(read(p('V138_3_PATCH_MANIFEST.json')));
if(!Array.isArray(manifest.changedFiles) || !manifest.changedFiles.includes('assets/css/v138-3-section-radius-rollback.css')) errors.push('manifest missing v138-3 css');
if(manifest.deletedFiles?.length) errors.push('manifest deletedFiles not empty');
if(errors.length){console.error('[V138.3 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1);} 
fs.mkdirSync(p('reports'),{recursive:true});
fs.writeFileSync(p('reports/v138-3-verify-report.json'), JSON.stringify({ok:true,version:VERSION,htmlFiles:htmlFiles.length,sportsSearchHtml:sportsSearch.length,generatedAt:new Date().toISOString()},null,2));
console.log('[V138.3 VERIFY PASS] section radius rollback/text safe final OK');
