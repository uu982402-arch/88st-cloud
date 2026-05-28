import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.cwd();
const fail=(m)=>{console.error('[V112 VERIFY FAIL]',m);process.exit(1)};
const read=(p)=>fs.readFileSync(path.join(ROOT,p),'utf8');
const slugs=["bonus-rolling-real-receive-check-2026", "domain-change-official-channel-checklist", "slot-rtp-bonus-condition-read-together", "sports-odds-margin-before-bonus", "guaranteed-vendor-card-before-click-mobile", "telegram-consult-code-domain-template", "minigame-rolling-loss-limit-check", "rust-tools-guaranteed-blog-workflow"];
for (const slug of slugs) {
 const file='blog/'+slug+'/index.html';
 if (!fs.existsSync(path.join(ROOT,file))) fail('missing post '+slug);
 const html=read(file);
 if (!html.includes('data-v112-seo-content="active"')) fail('missing marker '+slug);
 if (!html.includes('<link rel="canonical" href="https://88st.cloud/blog/'+slug+'/"')) fail('missing canonical '+slug);
 if (!/<h1>/.test(html)) fail('missing h1 '+slug);
 if (!/meta name="description" content="[^"]{45,}"/.test(html)) fail('short description '+slug);
}
const index=read('blog/index.html');
if (!index.includes('data-v112-post="true"')) fail('blog index missing V112 cards');
for (const slug of slugs) if (!index.includes('/blog/'+slug+'/')) fail('blog index missing '+slug);
for (const sm of ['sitemap.xml','sitemap.txt','serverless/sitemap.xml']) {
 if (!fs.existsSync(path.join(ROOT,sm))) continue;
 const s=read(sm);
 for (const slug of slugs) if (!s.includes('/blog/'+slug+'/')) fail(sm+' missing '+slug);
 for (const r of ['faq','consult-motives','consult-result','provider-updates']) if (s.includes('/'+r+'/')) fail('removed route in '+sm+': '+r);
}
for (const r of ['faq','consult-motives','consult-result','provider-updates']) if (fs.existsSync(path.join(ROOT,r))) fail('removed directory regenerated: '+r);
console.log('[V112 VERIFY PASS] new SEO posts, blog index and sitemaps checked');
