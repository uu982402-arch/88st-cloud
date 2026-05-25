import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const fail = (msg) => { throw new Error(`[V81-1 verify] ${msg}`); };

if (!html.includes('V81_1_MAIN_MOTION_FIX_ACTIVE')) fail('missing V81-1 marker');
if (!html.includes('v81-1-blog-pool')) fail('missing blog pool json');
if (!html.includes('v81-1-sports-pool')) fail('missing sports pool json');
if (!html.includes('v81-1-guides-pool')) fail('missing guides pool json');
if (html.includes('RUST MOTION HUB')) fail('wrong V81 title remains');
if (html.includes('v81-main-motion-carousels')) fail('wrong V81 asset remains');

const blogSlots = (html.match(/data-v811-blog-card=/g) || []).length;
const sportsSlots = (html.match(/data-v811-sports-card=/g) || []).length;
const guideSlots = (html.match(/data-v811-guides-card=/g) || []).length;
if (blogSlots !== 15) fail(`expected 15 blog slots, got ${blogSlots}`);
if (sportsSlots !== 5) fail(`expected 5 sports slots, got ${sportsSlots}`);
if (guideSlots !== 5) fail(`expected 5 guide slots, got ${guideSlots}`);

const blogJson = html.match(/<script type="application\/json" id="v81-1-blog-pool">([\s\S]*?)<\/script>/)?.[1];
const sportsJson = html.match(/<script type="application\/json" id="v81-1-sports-pool">([\s\S]*?)<\/script>/)?.[1];
const guidesJson = html.match(/<script type="application\/json" id="v81-1-guides-pool">([\s\S]*?)<\/script>/)?.[1];
const blog = JSON.parse(blogJson || '[]');
const sports = JSON.parse(sportsJson || '[]');
const guides = JSON.parse(guidesJson || '[]');
if (blog.length < 300) fail(`blog pool below 300: ${blog.length}`);
if (sports.length < 5) fail(`sports pool below 5: ${sports.length}`);
if (guides.length < 5) fail(`guides pool below 5: ${guides.length}`);

for (const item of [...sports, ...guides]) {
  if (!item.href || item.href === '/' || item.href.startsWith('#')) fail(`bad hub href: ${item.href}`);
  const rel = item.href.replace(/^\//, '');
  const file = rel.endsWith('/') ? path.join(ROOT, rel, 'index.html') : path.join(ROOT, rel);
  if (!fs.existsSync(file)) fail(`hub href target missing: ${item.href}`);
}

const css = fs.readFileSync(path.join(ROOT, 'assets/css/v81-1.main-motion-fix.css'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'assets/js/v81-1.main-motion-fix.js'), 'utf8');
if (!css.includes('v81-1-blog-rotator')) fail('css missing blog rotator');
if (!css.includes('v81-1-hub-lane')) fail('css missing hub lane');
if (!js.includes('v81-1-blog-pool')) fail('js missing blog pool loader');
if (!js.includes('rotateLane')) fail('js missing rotation logic');

console.log(`[V81-1 verify] ok blog=${blog.length} sports=${sports.length} guides=${guides.length}`);
