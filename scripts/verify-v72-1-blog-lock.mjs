import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blogPath = path.join(root, 'blog', 'index.html');
const cssPath = path.join(root, 'assets', 'css', 'v72-1.blog-lock.css');
const jsPath = path.join(root, 'assets', 'js', 'v72-1.blog-lock.js');
const pkgPath = path.join(root, 'package.json');
const errors = [];
function must(ok, msg) { if (!ok) errors.push(msg); }

must(fs.existsSync(blogPath), 'missing blog/index.html');
must(fs.existsSync(cssPath), 'missing assets/css/v72-1.blog-lock.css');
must(fs.existsSync(jsPath), 'missing assets/js/v72-1.blog-lock.js');
must(fs.existsSync(path.join(root, 'scripts', 'generate-v72-1-blog-lock.mjs')), 'missing generate-v72-1-blog-lock.mjs');

const blog = fs.existsSync(blogPath) ? fs.readFileSync(blogPath, 'utf8') : '';
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : '';
const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')) : {scripts:{}};

must(blog.includes('V72_1_BLOG_LOCK_ACTIVE'), 'missing V72_1_BLOG_LOCK_ACTIVE marker');
must(blog.includes('data-v72-1-blog-lock="true"'), 'missing body lock data marker');
must(blog.includes('/assets/css/v72-1.blog-lock.css'), 'missing v72-1 css link');
must(blog.includes('/assets/js/v72-1.blog-lock.js'), 'missing v72-1 js link');
must(blog.includes('window.__V72_1_BLOG_POSTS__'), 'missing v72-1 embedded post data');

const visibleBlog = blog.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
const legacyNeedles = ['TECH ARCHIVE', 'SEO HUB', '# 블로그 허브', '# 전체 게시글', '블로그 허브', '전체 게시글', '338개 글', '1/6 페이지'];
for (const needle of legacyNeedles) {
  must(!visibleBlog.includes(needle), `legacy visible blog text remains: ${needle}`);
}

const staticCards = (blog.match(/class="v72-blog-card"/g) || []).length;
must(staticCards >= 50, `expected at least 50 static cards, got ${staticCards}`);
const dataMatch = blog.match(/window\.__V72_1_BLOG_POSTS__\s*=\s*(\[[\s\S]*?\]);<\/script>/);
must(Boolean(dataMatch), 'missing parseable V72-1 post JSON');
if (dataMatch) {
  const posts = JSON.parse(dataMatch[1]);
  must(posts.length >= 300, `expected >=300 posts, got ${posts.length}`);
  must(posts.slice(0, 50).every(p => p.href && p.title && p.category && typeof p.views === 'number'), 'top 50 has invalid post shape');
  const missing = posts.slice(0, 50).filter(p => {
    const rel = p.href.replace(/^\//, '');
    return !fs.existsSync(path.join(root, rel)) && !fs.existsSync(path.join(root, rel, 'index.html'));
  });
  must(missing.length === 0, `top 50 missing files: ${missing.slice(0,3).map(p => p.href).join(', ')}`);
}

must(css.includes('V72_1_BLOG_LOCK_ACTIVE'), 'css marker missing');
must(css.includes('backdrop-filter: blur'), 'glass blur rule missing');
must(css.includes('grid-template-columns: repeat(4'), 'desktop grid rule missing');
must(css.includes('grid-template-columns: 1fr'), 'mobile one-column rule missing');
must(css.includes('display: none !important'), 'legacy title defensive hide rule missing');
must(js.includes('V72_1_BLOG_LOCK_ACTIVE'), 'js marker missing');
must((pkg.scripts.build || '').includes('node scripts/generate-v72-1-blog-lock.mjs'), 'build does not include V72-1 generator');
must(pkg.scripts.verify === 'node scripts/verify-v72-1-blog-lock.mjs', 'verify does not point to V72-1 verifier');

if (errors.length) {
  console.error('[V72-1 verify failed]');
  for (const e of errors) console.error('- ' + e);
  process.exit(1);
}
console.log(`[V72-1 verify ok] staticCards=${staticCards}`);
