import fs from 'fs/promises';
import path from 'path';
import { listHtmlRoutes, normalizePath, isNoindexPath, toFilePath, urlFor, loadPosts, fileExists, readFileSafe } from './lib/site-automation.mjs';

const { posts } = await loadPosts();
const postMap = new Map(posts.map((post) => [normalizePath(post.path), post]));
const routes = await listHtmlRoutes();

function hasNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html || '');
}

const publicRoutes = [];
for (const pathname of routes) {
  if (isNoindexPath(pathname)) continue;
  const filePath = toFilePath(pathname);
  if (!(await fileExists(filePath))) continue;
  const html = await readFileSafe(filePath);
  if (hasNoindex(html)) continue;
  publicRoutes.push(pathname);
}

const uniqueRoutes = [...new Set(publicRoutes)].sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b, 'ko')));

const xmlLines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const pathname of uniqueRoutes) {
  const post = postMap.get(normalizePath(pathname));
  xmlLines.push('  <url>');
  xmlLines.push(`    <loc>${urlFor(pathname)}</loc>`);
  const lastmod = post?.updated || post?.published || '';
  if (lastmod) xmlLines.push(`    <lastmod>${lastmod}</lastmod>`);
  xmlLines.push('  </url>');
}
xmlLines.push('</urlset>');

const textLines = uniqueRoutes.map((pathname) => urlFor(pathname));

await fs.writeFile(path.join(process.cwd(), 'sitemap.xml'), `${xmlLines.join('\n')}\n`, 'utf8');
await fs.writeFile(path.join(process.cwd(), 'sitemap.txt'), `${textLines.join('\n')}\n`, 'utf8');
await fs.mkdir(path.join(process.cwd(), 'serverless'), { recursive: true });
await fs.writeFile(path.join(process.cwd(), 'serverless/sitemap.xml'), `${xmlLines.join('\n')}\n`, 'utf8');

console.log(`Sitemap regenerated for ${uniqueRoutes.length} public routes.`);
