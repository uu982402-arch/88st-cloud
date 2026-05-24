import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blog = fs.readFileSync(path.join(root, 'blog/index.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const cssPath = path.join(root, 'assets/css/v72.blog-hub.css');
const jsPath = path.join(root, 'assets/js/v72.blog-hub.js');
const errors = [];

function must(condition, message) {
  if (!condition) errors.push(message);
}

must(fs.existsSync(cssPath), 'missing assets/css/v72.blog-hub.css');
must(fs.existsSync(jsPath), 'missing assets/js/v72.blog-hub.js');
must(fs.existsSync(path.join(root, 'scripts/generate-v72-blog-hub.mjs')), 'missing scripts/generate-v72-blog-hub.mjs');
must(pkg.scripts.build.includes('generate-v72-blog-hub.mjs'), 'package build does not include V72 generator');
must(pkg.scripts.verify.includes('verify-v72-blog-hub.mjs'), 'default verify is not V72');
must(blog.includes('data-v72-blog="true"'), 'blog page missing V72 asset marker');
must(blog.includes('data-v72-blog-grid'), 'blog page missing V72 grid');
must(blog.includes('data-v72-pagination'), 'blog page missing pagination');
must(!blog.includes('블로그 허브</h1>'), 'visible old blog title remains');
must(!blog.includes('v70-2-hero'), 'old V70 blog hero remains');
const staticCards = (blog.match(/class="v72-blog-card"/g) || []).length;
must(staticCards >= 50, `expected at least 50 static cards, got ${staticCards}`);
const m = blog.match(/window\.__V72_BLOG_POSTS__\s*=\s*(\[[\s\S]*?\]);<\/script>/);
must(Boolean(m), 'missing embedded blog post data');
if (m) {
  const posts = JSON.parse(m[1]);
  must(posts.length >= 300, `expected >=300 posts, got ${posts.length}`);
  must(posts.every(p => p.href && p.title && p.category && typeof p.views === 'number'), 'invalid post data');
  const missing = posts.slice(0, 50).filter(p => {
    const rel = p.href.replace(/^\//, '');
    return !fs.existsSync(path.join(root, rel)) && !fs.existsSync(path.join(root, rel, 'index.html'));
  });
  must(missing.length === 0, `top 50 post links missing: ${missing.slice(0,3).map(p=>p.href).join(', ')}`);
}
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
must(css.includes('grid-template-columns: repeat(4'), 'desktop 4-column grid rule missing');
must(css.includes('grid-template-columns: 1fr'), 'mobile one-column rule missing');
must(css.includes('backdrop-filter: blur'), 'glass blur rule missing');
must(css.includes('radial-gradient(circle at 1px 1px'), 'noise texture rule missing');
if (errors.length) {
  console.error('[V72 verify failed]');
  for (const e of errors) console.error('- ' + e);
  process.exit(1);
}
console.log(`[V72 verify ok] staticCards=${staticCards}`);
