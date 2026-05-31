import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const errors=[]; const p=(...x)=>path.join(ROOT,...x); const read=(x)=>fs.existsSync(x)?fs.readFileSync(x,'utf8'):''; const fail=m=>errors.push(m);
const problemHtml='/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html';
const problemClean='/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/';
const article=read(p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html'));
if(!article) fail('direct .html article missing');
if(!article.includes('data-v139-4-direct-html-fallback="true"')) fail('direct article missing V139.4 marker');
if(!article.includes('<link rel="canonical" href="https://88st.cloud'+problemHtml+'">')) fail('direct article canonical is not .html');
for(const token of ['rust-ga4-id','/assets/js/v82.ga4-events.js','/assets/js/v89.ga4-event-depth.js']) if(!article.includes(token)) fail('direct article missing '+token);
if(/http-equiv=["']refresh["']/i.test(article)) fail('direct article must not meta refresh');
const idx=read(p('blog/index.html'));
if(!idx.includes('href="'+problemHtml+'"')) fail('blog index does not point to direct .html route');
if(idx.includes('href="'+problemClean+'"')) fail('blog index still points to clean route');
for(const f of ['_redirects','serverless/_redirects']){const txt=read(p(f)); if(txt.includes(problemHtml+' ')||txt.includes('/blog/minigame/minigame-losing-streak-event-exclusion-condition-first ')) fail(f+' still redirects problem route');}
const worker=read(p('_worker.js'));
if(worker.includes('minigame-losing-streak-event-exclusion-condition-first.html')||worker.includes('minigame-losing-streak-event-exclusion-condition-first",')) fail('_worker still redirects problem route');
const sitemap=read(p('sitemap.txt'));
if(!sitemap.includes('https://88st.cloud'+problemHtml)) fail('sitemap.txt missing direct html route');
if(sitemap.includes('https://88st.cloud'+problemClean)) fail('sitemap.txt still includes clean route for problem article');
const pkg=JSON.parse(read(p('package.json')));
if(pkg.scripts.build!=='node scripts/build-v139-4-cloudflare-pages-safe.mjs') fail('package build not v139-4');
if(pkg.scripts.verify!=='node scripts/verify-v139-4-blog-direct-html-fallback.mjs') fail('package verify not v139-4');
// global guards
for(const bad of ['faq','consult-motives','consult-result','provider-updates']){ if(fs.existsSync(p(bad))) fail('removed route regenerated: '+bad); }
const allHtml=[]; function walk(d){for(const ent of fs.readdirSync(d,{withFileTypes:true})){const fp=path.join(d,ent.name); if(ent.isDirectory()) walk(fp); else if(ent.isFile()&&ent.name.endsWith('.html')) allHtml.push(fp);}}
walk(ROOT);
let hrefSharp=[]; for(const f of allHtml){const txt=read(f); if(/href=["']#["']/.test(txt)) hrefSharp.push(path.relative(ROOT,f).replaceAll(path.sep,'/'));}
if(hrefSharp.length) fail('href="#" remained: '+hrefSharp.slice(0,5).join(', '));
if(errors.length){console.error('[V139.4 VERIFY FAIL]\n- '+errors.join('\n- ')); process.exit(1);} fs.mkdirSync(p('reports'),{recursive:true}); fs.writeFileSync(p('reports/v139-4-verify-report.json'),JSON.stringify({ok:true,version:'V139_4_BLOG_DIRECT_HTML_403_FALLBACK',htmlScanned:allHtml.length,generatedAt:new Date().toISOString()},null,2)); console.log('[V139.4 VERIFY PASS] direct .html fallback for V9 blog article OK');
