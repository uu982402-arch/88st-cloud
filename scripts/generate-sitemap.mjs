import fs from 'fs/promises';
import path from 'path';
import {
  ROOT, SITE_ORIGIN, loadPosts, listIndexFiles, routeFromFile, isPublicRoute, normalizePath, writeText,
  extractMetaContent
} from './lib/site-automation.mjs';

const posts = await loadPosts();
const postMap = new Map(posts.map((post) => [normalizePath(post.path), post]));
const files = await listIndexFiles(ROOT);

const htmlByRoute = new Map();
for (const file of files) {
  const route = routeFromFile(file);
  const html = await fs.readFile(file, 'utf8');
  htmlByRoute.set(route, html);
}

const urls = files
  .map((file) => routeFromFile(file))
  .filter((route) => isPublicRoute(route))
  .filter((route) => {
    const html = htmlByRoute.get(route) || '';
    const robots = extractMetaContent(html, 'robots');
    return !/noindex/i.test(robots);
  });

const uniqueUrls = [...new Set(urls)].sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

const xmlItems = uniqueUrls.map((route) => {
  const post = postMap.get(route);
  const lastmod = post?.updated || post?.published || new Date().toISOString().slice(0, 10);
  return `  <url><loc>${SITE_ORIGIN}${route}</loc><lastmod>${lastmod}</lastmod></url>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlItems}\n</urlset>\n`;
const txt = uniqueUrls.map((route) => `${SITE_ORIGIN}${route}`).join('\n') + '\n';

await writeText(path.join(ROOT, 'sitemap.xml'), xml);
await writeText(path.join(ROOT, 'sitemap.txt'), txt);
await writeText(path.join(ROOT, 'serverless', 'sitemap.xml'), xml);
console.log(`Sitemap refreshed for ${uniqueUrls.length} public indexable URLs.`);
