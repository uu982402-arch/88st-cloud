import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const errors = [];
const exists = p => fs.existsSync(path.join(ROOT,p));
const read = p => exists(p) ? fs.readFileSync(path.join(ROOT,p),'utf8') : '';
function walk(dir='.') { const out=[]; const abs=path.join(ROOT,dir); if(!fs.existsSync(abs)) return out; for(const ent of fs.readdirSync(abs,{withFileTypes:true})){ if(['node_modules','.git','.wrangler'].includes(ent.name)) continue; const rel=path.posix.join(dir,ent.name).replace(/^\.\//,''); if(ent.isDirectory()) out.push(...walk(rel)); else if(ent.isFile()) out.push(rel); } return out; }
function fileForHref(href){ let p=href.split('#')[0].split('?')[0]; if(!p.startsWith('/')) return null; p=p.slice(1); if(!p) return 'index.html'; return p.endsWith('/') ? `${p}index.html` : p; }
const required = ['blog/index.html','robots.txt','sitemap.xml','sitemap.txt','package.json','scripts/generate-v99-blog-index-seo-quality.mjs','scripts/verify-v99-blog-index-seo-quality.mjs','scripts/v99-blog-index-seo-quality-report.json'];
for(const f of required) if(!exists(f)) errors.push(`missing ${f}`);
const pkg = JSON.parse(read('package.json') || '{}');
if(!pkg.scripts?.build?.includes('generate-v99-blog-index-seo-quality.mjs')) errors.push('build chain missing V99 generator');
if(pkg.scripts?.verify !== 'node scripts/verify-v99-blog-index-seo-quality.mjs') errors.push('default verify not V99');
if(!pkg.scripts?.['quality:v99'] || !pkg.scripts?.['verify:v99']) errors.push('V99 helper scripts missing');
const blogFiles = walk('blog').filter(f=>f.endsWith('.html'));
if(blogFiles.length < 500) errors.push(`blog html count too low: ${blogFiles.length}`);
const hub = read('blog/index.html');
for(const token of ['v99-blog-index-seo-quality','핵심글','최신글','인기글','data-v99-tier','grid-template-columns:repeat(2,minmax(0,1fr))']) if(!hub.includes(token)) errors.push(`blog hub missing ${token}`);
const hrefs = [...hub.matchAll(/<a\s+[^>]*href="([^"]+)"/g)].map(m=>m[1]).filter(h=>h.startsWith('/blog/'));
let broken=0; for(const h of hrefs){ const f=fileForHref(h); if(f && !exists(f)) broken++; }
if(broken) errors.push(`broken blog hub links: ${broken}`);
let noindex=0, missingCanon=0, missingDesc=0, missingMarker=0, metaInline=0, repeatedAside=0, missingAlt=0, duplicateH1=0;
const titleMap = new Map(); const descMap = new Map(); const shortBodies=[];
for(const f of blogFiles){ const html=read(f); if(/<meta\s+name=["']robots["'][^>]*noindex/i.test(html)) noindex++; if(!html.includes('v99-blog-index-seo-quality')) missingMarker++; if(!/<link rel="canonical" href="https:\/\/88st\.cloud\/blog\//.test(html)) missingCanon++; const dm=html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']{45,170})["']/i); if(!dm) missingDesc++; if(html.includes('SEO 메타 디스크립션') || html.includes('meta-desc-inline')) metaInline++; if(html.includes('다음 확인') && html.includes('v70-2-related')) repeatedAside++; const h1=(html.match(/<h1\b/gi)||[]).length; if(f!=='blog/index.html' && h1!==1) duplicateH1++; for(const tag of html.match(/<img\b[^>]*>/gi)||[]) if(!/\salt=/i.test(tag)) missingAlt++; const title=(html.match(/<title>([\s\S]*?)<\/title>/i)||[])[1]?.trim()||''; const desc=dm?.[1]?.trim()||''; if(title) titleMap.set(title,[...(titleMap.get(title)||[]),f]); if(desc) descMap.set(desc,[...(descMap.get(desc)||[]),f]); const words=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(Boolean).length; if(words<160) shortBodies.push(f); }
if(noindex) errors.push(`${noindex} blog pages are noindex`);
if(missingMarker) errors.push(`${missingMarker} blog pages missing V99 marker`);
if(missingCanon) errors.push(`${missingCanon} blog pages missing blog canonical`);
if(missingDesc) errors.push(`${missingDesc} blog pages missing clean description`);
if(metaInline) errors.push(`${metaInline} blog pages still expose SEO meta inline text`);
if(repeatedAside) errors.push(`${repeatedAside} blog pages still expose repeated related aside`);
if(missingAlt) errors.push(`${missingAlt} blog images missing alt`);
if(duplicateH1) errors.push(`${duplicateH1} blog pages do not have exactly one h1`);
const dupTitles=[...titleMap.entries()].filter(([,v])=>v.length>1);
const dupDescs=[...descMap.entries()].filter(([,v])=>v.length>1);
if(dupTitles.length) errors.push(`duplicate blog titles: ${dupTitles.length}`);
if(dupDescs.length) errors.push(`duplicate blog descriptions: ${dupDescs.length}`);
const robots=read('robots.txt'); for(const line of ['Disallow: /analysis/','Disallow: /admin/','Disallow: /ops/','Sitemap: https://88st.cloud/sitemap.xml']) if(!robots.includes(line)) errors.push(`robots missing ${line}`);
const sitemap=read('sitemap.xml'); if(sitemap.includes('https://88st.cloud/analysis/')||sitemap.includes('https://88st.cloud/admin/')||sitemap.includes('https://88st.cloud/ops/')) errors.push('sitemap includes excluded route');
let sitemapMissing=0; for(const f of blogFiles){ let url='https://88st.cloud/'+(f.endsWith('/index.html')?f.slice(0,-'index.html'.length):f); if(!sitemap.includes(`<loc>${url}</loc>`)) sitemapMissing++; }
if(sitemapMissing) errors.push(`${sitemapMissing} existing blog pages missing sitemap loc`);
let report={}; try{ report=JSON.parse(read('scripts/v99-blog-index-seo-quality-report.json')||'{}'); }catch{ errors.push('report json invalid'); }
if(report.version !== 'V99-BLOG-INDEX-SEO-QUALITY-20260526') errors.push('report version mismatch');
if(report.brokenBlogLinks?.length) errors.push('report has broken blog links');
if(errors.length){ console.error('[V99 VERIFY FAIL]'); for(const e of errors) console.error('-',e); process.exit(1); }
console.log(`[V99 VERIFY PASS] blog=${blogFiles.length} hubLinks=${hrefs.length} shortBodyCandidates=${shortBodies.length}`);
