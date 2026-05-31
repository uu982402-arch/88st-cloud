import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V139_1_GA4_STALE_BLOG_COVERAGE_HOTFIX';
const GA4_ID = 'G-KWT87FBY6S';
const V82 = '<meta name="v82-1-structure-ga4" content="V82_1_STRUCTURE_GA4_ACTIVE"><meta name="rust-ga4-id" content="G-KWT87FBY6S"><script defer src="/assets/js/v82.ga4-events.js?v=static-v82-1-structure-ga4-20260525" data-v82-ga4-events="true"></script>';
const V89 = '<meta name="v89-ga4-event-depth" content="V89_GA4_EVENT_DEPTH_ACTIVE"><script defer src="/assets/js/v89.ga4-event-depth.js?v=static-v89-ga4-event-depth-20260526" data-v89-ga4-depth="true"></script>';

function p(...parts){ return path.join(ROOT, ...parts); }
function rel(fp){ return path.relative(ROOT, fp).replace(/\\/g, '/'); }
function read(fp){ return fs.readFileSync(fp, 'utf8'); }
function write(fp, s){ fs.mkdirSync(path.dirname(fp), {recursive:true}); fs.writeFileSync(fp, s); }
function walk(dir, out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const ent of fs.readdirSync(dir, {withFileTypes:true})){
    const fp = path.join(dir, ent.name);
    if(ent.isDirectory()){
      if(!['node_modules', '.git'].includes(ent.name)) walk(fp, out);
    } else if(ent.isFile() && ent.name.endsWith('.html')) out.push(fp);
  }
  return out;
}
function injectBeforeHead(html, snippet){
  if(/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `  ${snippet}\n</head>`);
  return snippet + '\n' + html;
}
function ensureGa4(html){
  let out = html;
  const hasV82 = out.includes('v82.ga4-events.js') && out.includes('rust-ga4-id');
  const hasV89 = out.includes('v89.ga4-event-depth.js');
  if(!hasV89) out = injectBeforeHead(out, V89);
  if(!hasV82) out = injectBeforeHead(out, V82);
  return out;
}


function updatePackage(){
  const pkgPath = p('package.json');
  if(!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(read(pkgPath));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = 'node scripts/build-v139-1-cloudflare-pages-safe.mjs';
  pkg.scripts.verify = 'node scripts/verify-v139-1-ga4-coverage-hotfix.mjs';
  pkg.scripts['quality:v139'] = 'node scripts/generate-v139-blog-content-differentiation-seo-intent.mjs';
  pkg.scripts['verify:v139'] = 'node scripts/verify-v139-blog-content-differentiation-seo-intent.mjs';
  pkg.scripts['quality:v139-1'] = 'node scripts/generate-v139-1-ga4-coverage-hotfix.mjs';
  pkg.scripts['verify:v139-1'] = 'node scripts/verify-v139-1-ga4-coverage-hotfix.mjs';
  pkg.scripts['verify:deploy'] = 'node scripts/build-v139-1-cloudflare-pages-safe.mjs';
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

const changed = new Set([
  'scripts/generate-v139-1-ga4-coverage-hotfix.mjs',
  'scripts/verify-v139-1-ga4-coverage-hotfix.mjs',
  'scripts/build-v139-1-cloudflare-pages-safe.mjs',
  'package.json'
]);
const repaired = [];
const alreadyOk = [];
const blogFiles = walk(p('blog')).sort();
for(const fp of blogFiles){
  const r = rel(fp);
  const before = read(fp);
  const after = ensureGa4(before);
  if(after !== before){
    write(fp, after);
    repaired.push(r);
    changed.add(r);
  } else {
    alreadyOk.push(r);
  }
}

updatePackage();

const audit = {
  ok:true,
  version:VERSION,
  reason:'Cloudflare repository can retain stale blog HTML when FULL ZIP is uploaded through GitHub web upload; this hotfix repairs GA4 coverage after V139 generation and before verify.',
  blogHtmlScanned:blogFiles.length,
  repairedFiles:repaired,
  repairedCount:repaired.length,
  alreadyOkCount:alreadyOk.length,
  deletedFiles:[],
  generatedAt:new Date().toISOString()
};
fs.mkdirSync(p('reports'), {recursive:true});
write(p('reports/v139-1-ga4-stale-blog-coverage-audit.json'), JSON.stringify(audit, null, 2));
changed.add('reports/v139-1-ga4-stale-blog-coverage-audit.json');

console.log('[V139.1 GENERATE PASS]', JSON.stringify({ok:true, version:VERSION, blogHtml:blogFiles.length, repairedCount:repaired.length, repairedFiles:repaired.slice(0,12)}, null, 2));
