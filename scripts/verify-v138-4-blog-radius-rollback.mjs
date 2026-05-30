import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const VERSION='V138_4_BLOG_RADIUS_ROLLBACK_TEXT_SAFE';
function p(...x){return path.join(ROOT,...x)}
function read(f){return fs.readFileSync(f,'utf8')}
function walk(dir,out=[]){if(!fs.existsSync(dir))return out;for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const fp=path.join(dir,ent.name);if(ent.isDirectory())walk(fp,out);else out.push(fp)}return out}
function rel(fp){return path.relative(ROOT,fp).replace(/\\/g,'/')}
const errors=[];
const required=[
 'assets/css/v138-modern-section-radius-dark-fix.css','assets/css/v138-2-live-header-text-visibility-fix.css','assets/css/v138-3-section-radius-rollback.css','assets/css/v138-4-blog-radius-rollback.css',
 'scripts/build-v138-4-cloudflare-pages-safe.mjs','scripts/generate-v138-4-blog-radius-rollback.mjs','scripts/verify-v138-4-blog-radius-rollback.mjs',
 'V138_4_PATCH_MANIFEST.json','V138_4_UPGRADE_REPORT.md','reports/v138-4-blog-radius-rollback-audit.json'
];
for(const f of required) if(!fs.existsSync(p(f))) errors.push('missing '+f);
const css=fs.existsSync(p('assets/css/v138-4-blog-radius-rollback.css'))?read(p('assets/css/v138-4-blog-radius-rollback.css')):'';
for(const needle of ['BLOG RADIUS ROLLBACK','body[data-v104-blog-comfort="true"] .v72-blog-direct','border-radius:0!important','background:transparent!important','body[data-v104-blog-comfort="true"] .v72-blog-card','border-radius:18px!important']){
 if(!css.includes(needle)) errors.push('v138-4 css missing '+needle);
}
if(/\.v72-blog-direct[\s\S]{0,260}clip-path\s*:\s*inset/i.test(css)) errors.push('v138-4 css still clips blog direct shell');
const pkg=JSON.parse(read(p('package.json')));
if(pkg.scripts?.build !== 'node scripts/build-v138-4-cloudflare-pages-safe.mjs') errors.push('package build not V138-4');
if(pkg.scripts?.verify !== 'node scripts/verify-v138-4-blog-radius-rollback.mjs') errors.push('package verify not V138-4');
const blog=read(p('blog/index.html'));
if(!blog.includes('data-v138-4-blog-radius-rollback="active"')) errors.push('blog index missing v138-4 html flag');
if(!blog.includes('data-v138-4-blog-radius-rollback="true"')) errors.push('blog index missing v138-4 css link');
const idx4=blog.indexOf('data-v138-4-blog-radius-rollback="true"');
const idx3=blog.indexOf('data-v138-3-section-radius-rollback="true"');
if(idx3 < 0) errors.push('blog index missing v138-3 css link');
if(idx4 >= 0 && idx3 >= 0 && idx4 < idx3) errors.push('v138-4 css link is not after v138-3');
for(const label of ['메인','블로그','도구','보증업체','상담']) if(!blog.includes(`>${label}</a>`)) errors.push('blog header missing '+label);
const cardCount=(blog.match(/class="v72-blog-card/g)||[]).length;
if(cardCount < 60) errors.push('blog card count too low: '+cardCount);
if(blog.includes('font-size:0') && blog.includes('/guaranteed/')) errors.push('blog contains risky font-size:0 guaranteed text');
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
const tools=fs.existsSync(p('tools/index.html'))?read(p('tools/index.html')):'';
if(tools && /class="v73-modal[\s\S]*?(moon-footer|rust-footer|site-footer|rust-bottom-nav)/i.test(tools)) errors.push('tools modal appears to contain footer/bottom nav');
const manifest=JSON.parse(read(p('V138_4_PATCH_MANIFEST.json')));
if(!Array.isArray(manifest.changedFiles) || !manifest.changedFiles.includes('assets/css/v138-4-blog-radius-rollback.css')) errors.push('manifest missing v138-4 css');
if(manifest.deletedFiles?.length) errors.push('manifest deletedFiles not empty');
if(errors.length){console.error('[V138.4 VERIFY FAIL]'); for(const e of errors) console.error('- '+e); process.exit(1);} 
fs.mkdirSync(p('reports'),{recursive:true});
fs.writeFileSync(p('reports/v138-4-verify-report.json'), JSON.stringify({ok:true,version:VERSION,htmlFiles:htmlFiles.length,blogCards:cardCount,generatedAt:new Date().toISOString()},null,2));
console.log('[V138.4 VERIFY PASS] blog radius rollback/text safe OK');
