import fs from 'fs/promises';
import path from 'path';
import {
  ROOT,
  SITE_ORIGIN,
  loadPosts,
  listHtmlFiles,
  fileToPathname,
  normalizePathname,
  urlFor,
  isPrivatePath,
  isIgnoredPath,
  writeTextIfChanged,
  TODAY
} from './lib/site-automation.mjs';

const { posts } = await loadPosts();
const postMap = new Map(posts.map((post) => [normalizePathname(post.path), post]));
const htmlFiles = await listHtmlFiles();

const urls = [];
for (const filePath of htmlFiles) {
  const pathname = fileToPathname(filePath);
  if (isIgnoredPath(pathname) || isPrivatePath(pathname)) continue;
  if (pathname.includes('index.orig')) continue;
  const post = postMap.get(pathname);
  let lastmod = TODAY;
  if (post) lastmod = String(post.updated || post.published || TODAY);
  else {
    const stat = await fs.stat(filePath);
    lastmod = new Date(stat.mtime).toISOString().slice(0, 10);
  }
  urls.push({ pathname, url: urlFor(pathname), lastmod });
}

urls.sort((a, b) => {
  if (a.pathname === '/') return -1;
  if (b.pathname === '/') return 1;
  return a.pathname.localeCompare(b.pathname, 'ko');
});

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((entry) => `  <url><loc>${entry.url}</loc><lastmod>${entry.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
const sitemapTxt = `${urls.map((entry) => entry.url).join('\n')}\n`;

let changed = 0;
if (await writeTextIfChanged(path.join(ROOT, 'sitemap.xml'), sitemapXml)) changed += 1;
if (await writeTextIfChanged(path.join(ROOT, 'sitemap.txt'), sitemapTxt)) changed += 1;
if (await writeTextIfChanged(path.join(ROOT, 'serverless/sitemap.xml'), sitemapXml)) changed += 1;

console.log(`Sitemaps regenerated for ${urls.length} public URLs. Files changed: ${changed}.`);
