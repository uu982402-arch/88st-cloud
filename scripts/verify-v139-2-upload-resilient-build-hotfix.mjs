import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V139_2_UPLOAD_RESILIENT_BUILD_HOTFIX';
function p(...parts){ return path.join(ROOT, ...parts); }
function read(f){ return fs.readFileSync(f, 'utf8'); }
function rel(fp){ return path.relative(ROOT, fp).replace(/\\/g, '/'); }
function walk(dir, out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const ent of fs.readdirSync(dir, {withFileTypes:true})){
    const fp = path.join(dir, ent.name);
    if(ent.isDirectory()){
      if(!['node_modules','.git'].includes(ent.name)) walk(fp, out);
    } else if(ent.isFile() && ent.name.endsWith('.html')) out.push(fp);
  }
  return out;
}

const errors = [];
const required = [
  'assets/css/v139-blog-content-differentiation.css',
  'scripts/build-v139-2-cloudflare-pages-safe.mjs',
  'scripts/generate-v139-blog-content-differentiation-seo-intent.mjs',
  'scripts/generate-v139-1-ga4-coverage-hotfix.mjs',
  'scripts/generate-v139-2-upload-resilient-build-hotfix.mjs',
  'scripts/verify-v139-2-upload-resilient-build-hotfix.mjs',
  'reports/v139-2-upload-resilient-build-hotfix-audit.json',
  'V139_2_PATCH_MANIFEST.json',
  'V139_2_UPGRADE_REPORT.md'
];
for(const f of required) if(!fs.existsSync(p(f))) errors.push('missing ' + f);

let pkg = null;
try { pkg = JSON.parse(read(p('package.json'))); } catch { errors.push('package.json unreadable'); }
if(pkg){
  if(pkg.scripts?.build !== 'node scripts/build-v139-2-cloudflare-pages-safe.mjs') errors.push('package build not V139.2');
  if(pkg.scripts?.verify !== 'node scripts/verify-v139-2-upload-resilient-build-hotfix.mjs') errors.push('package verify not V139.2');
}

const css = fs.existsSync(p('assets/css/v139-blog-content-differentiation.css')) ? read(p('assets/css/v139-blog-content-differentiation.css')) : '';
if(!css.includes('.v139-blog-diff-note')) errors.push('V139 css missing diff note selector');

let seo = {};
try { if(fs.existsSync(p('assets/config/seo.meta.json'))) seo = JSON.parse(read(p('assets/config/seo.meta.json'))); } catch { errors.push('seo.meta.json unreadable'); }

let blogCount=0, v139Css=0, diffNotes=0, metaOk=0, ga4Ok=0;
for(const fp of walk(p('blog'))){
  const r = rel(fp);
  const h = read(fp);
  blogCount++;
  if(!h.includes('data-v139-blog-quality="active"')) errors.push(r + ' missing V139 html flag');
  if(!h.includes('v139-blog-content-differentiation.css')) errors.push(r + ' missing V139 css'); else v139Css++;
  if(h.includes('data-v139-blog-diff=')) diffNotes++;
  if(/<h2>1\.\s*개요 및 기술적·수학적 메커니즘 분석<\/h2>/i.test(h)) errors.push(r + ' still has generic formula h2');
  if(/<h2>\s*9\.\s*운영 관점의 최종 요약\s*<\/h2>/i.test(h)) errors.push(r + ' still has h2 number 9 final summary');
  if(/<a\b[^>]*href=["']\/guaranteed\/?["'][^>]*>\s*(?:<span>[^<]*<\/span>\s*)?보증\s*<\/a>/i.test(h)) errors.push(r + ' still has short nav label 보증');
  if(/<meta\b[^>]+name=["']keywords["'][^>]+content=["'][^"']*(RUST|러스트)[^"']*(88st\.cloud|88ST)[^"']*/i.test(h)) metaOk++; else errors.push(r + ' weak/missing keywords');
  if(!/^(blog\/index\.html$|blog\/page\/)/.test(r)){
    const route = h.match(/<link\b[^>]+rel=["']canonical["'][^>]+href=["']https?:\/\/88st\.cloud([^"']+)["'][^>]*>/i)?.[1];
    if(route && !seo[route]) errors.push('seo.meta.json missing route ' + route);
    if(!/<meta\b[^>]+name=["']description["'][^>]+content=["'][^"']{60,180}["']/i.test(h)) errors.push(r + ' weak/missing description');
  }
  if(h.includes('v82.ga4-events.js') && h.includes('v89.ga4-event-depth.js') && h.includes('rust-ga4-id')) ga4Ok++; else errors.push(r + ' lost GA4 coverage');
  if(/href\s*=\s*["']#["']/i.test(h)) errors.push(r + ' still contains href="#"');
}
if(blogCount < 500) errors.push('blog html count unexpectedly low: ' + blogCount);
if(diffNotes < 180) errors.push('V139 diff note coverage too low: ' + diffNotes);

for(const route of ['faq','consult-motives','consult-result','provider-updates']){
  if(fs.existsSync(p(route))) errors.push('removed route directory regenerated: ' + route);
  for(const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt']){
    if(fs.existsSync(p(sm)) && read(p(sm)).includes('/' + route + '/')) errors.push(sm + ' contains removed route ' + route);
  }
}

const tools = fs.existsSync(p('tools/index.html')) ? read(p('tools/index.html')) : '';
if(tools && /class="v73-modal[\s\S]*?(moon-footer|rust-footer|site-footer|rust-bottom-nav)/i.test(tools)) errors.push('tools modal appears to contain footer/bottom nav');

let audit = null;
try { audit = JSON.parse(read(p('reports/v139-2-upload-resilient-build-hotfix-audit.json'))); } catch { errors.push('V139.2 audit unreadable'); }
if(audit && (audit.version !== VERSION || !audit.ok)) errors.push('V139.2 audit invalid');
if(audit && audit.deletedFiles?.length) errors.push('V139.2 deletedFiles not empty');

if(errors.length){
  console.error('[V139.2 VERIFY FAIL]');
  for(const e of errors) console.error('- ' + e);
  process.exit(1);
}
fs.mkdirSync(p('reports'), {recursive:true});
fs.writeFileSync(p('reports/v139-2-verify-report.json'), JSON.stringify({ok:true, version:VERSION, blogHtml:blogCount, v139Css, diffNotes, metaOk, ga4Ok, generatedAt:new Date().toISOString()}, null, 2));
console.log('[V139.2 VERIFY PASS] upload-resilient build hotfix OK', JSON.stringify({blogHtml:blogCount, diffNotes, metaOk, ga4Ok}, null, 2));
