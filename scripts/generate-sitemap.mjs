import fs from 'fs/promises';
import path from 'path';
import {
  ROOT, SITE_ORIGIN, loadPosts, listIndexFiles, routeFromFile, isPublicRoute, normalizePath, writeText,
  extractMetaContent
} from './lib/site-automation.mjs';

const SEEDS = ['/', '/blog/', '/tools/', '/guaranteed/'];
const posts = await loadPosts();
const postMap = new Map(posts.map((post) => [normalizePath(post.path), post]));
const files = await listIndexFiles(ROOT);

const htmlByRoute = new Map();
for (const file of files) {
  const route = routeFromFile(file);
  const html = await fs.readFile(file, 'utf8');
  htmlByRoute.set(route, html);
}

function isIndexableRoute(route) {
  const html = htmlByRoute.get(route);
  if (!html) return false;
  if (!isPublicRoute(route)) return false;
  const robots = extractMetaContent(html, 'robots');
  if (/noindex/i.test(robots)) return false;
  return true;
}

function extractInternalRoutes(html = '') {
  const routes = new Set();
  const hrefMatches = html.match(/href=["']([^"']+)["']/gi) || [];
  for (const raw of hrefMatches) {
    const match = raw.match(/href=["']([^"']+)["']/i);
    if (!match) continue;
    const href = match[1].trim();
    if (!href || href.startsWith('#')) continue;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;
    let url;
    try {
      url = new URL(href, SITE_ORIGIN);
    } catch {
      continue;
    }
    if (url.origin !== SITE_ORIGIN) continue;
    const route = normalizePath(url.pathname || '/');
    if (htmlByRoute.has(route)) routes.add(route);
  }
  return [...routes];
}

const visited = new Set();
const queue = [...SEEDS];
const finalRoutes = new Set();
while (queue.length) {
  const route = normalizePath(queue.shift());
  if (visited.has(route)) continue;
  visited.add(route);
  const html = htmlByRoute.get(route);
  if (!html) continue;
  if (isIndexableRoute(route)) finalRoutes.add(route);
  for (const nextRoute of extractInternalRoutes(html)) {
    if (visited.has(nextRoute)) continue;
    if (!htmlByRoute.has(nextRoute)) continue;
    if (!isIndexableRoute(nextRoute)) continue;
    queue.push(nextRoute);
  }
}

const uniqueUrls = [...finalRoutes].sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
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
console.log(`Sitemap refreshed for ${uniqueUrls.length} live-routed public URLs.`);
