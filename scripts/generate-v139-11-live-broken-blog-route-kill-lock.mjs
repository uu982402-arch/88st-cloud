import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const VERSION = 'V139_11_LIVE_BROKEN_BLOG_ROUTE_KILL_LOCK';
const retiredRoutes = ['/blog/minigame-streak-exclusion-guide.html', '/blog/minigame-streak-exclusion-guide', '/blog/minigame-streak-exclusion-guide/', '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html', '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide', '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide/', '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html', '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first', '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/'];
const stubFiles = ['blog/minigame-streak-exclusion-guide.html', 'blog/minigame-streak-exclusion-guide/index.html', 'blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html', 'blog/minigame/minigame-losing-streak-event-exclusion-condition-guide/index.html', 'blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html', 'blog/minigame/minigame-losing-streak-event-exclusion-condition-first/index.html'];
const sitemapNeedles = ['minigame-streak-exclusion-guide','minigame-losing-streak-event-exclusion-condition-guide','minigame-losing-streak-event-exclusion-condition-first'];
const stubHtml = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>블로그 목록으로 이동 | 88ST.Cloud</title><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=/blog/"><link rel="canonical" href="https://88st.cloud/blog/"><style>body{margin:0;background:#050914;color:#f8fafc;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:grid;min-height:100vh;place-items:center}main{max-width:680px;padding:32px;text-align:center}a{color:#fde68a}</style></head><body><main><h1>블로그 목록으로 이동합니다</h1><p>정리된 블로그 목록에서 최신 글을 확인하세요.</p><p><a href="/blog/">블로그로 이동</a></p></main><script>location.replace('/blog/');<\/script></body></html>`;

function read(file) { return readFileSync(file, 'utf8'); }
function write(file, text) { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, text, 'utf8'); }

for (const file of stubFiles) write(file, stubHtml);

for (const file of ['sitemap.xml','serverless/sitemap.xml','sitemap.txt','serverless/sitemap.txt']) {
  if (!existsSync(file)) continue;
  let text = read(file);
  if (file.endsWith('.xml')) {
    for (const needle of sitemapNeedles) {
      text = text.replace(new RegExp('\\s*<url>\\s*<loc>[^<]*' + needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^<]*<\\/loc>[\\s\\S]*?<\\/url>', 'g'), '');
    }
  } else {
    text = text.split(/\r?\n/).filter(line => !sitemapNeedles.some(needle => line.includes(needle))).join('\n') + '\n';
  }
  write(file, text);
}

if (existsSync('blog/index.html')) {
  let blog = read('blog/index.html');
  for (const needle of sitemapNeedles) blog = blog.replaceAll(needle, 'retired-blog-route');
  blog = blog.replaceAll('인기글 · 핵심글 · 최신글 76개','인기글 · 핵심글 · 최신글 75개');
  blog = blog.replace(/<a\b[^>]*>[\s\S]*?미니게임 연패 위로금에서 회차 제외 조건을 먼저 보는 이유[\s\S]*?<\/a>/g, '');
  write('blog/index.html', blog);
}

let redirects = existsSync('_redirects') ? read('_redirects') : '';
const requiredRedirects = retiredRoutes.map(route => `${route} /blog/ 302`);
const kept = redirects.split(/\r?\n/).filter(line => line && !retiredRoutes.some(route => line.startsWith(route + ' ')));
write('_redirects', [...requiredRedirects, ...kept].join('\n') + '\n');

write('_worker.js', String.raw`const VERSION = "static-growth-conversion-v139-11-20260531";
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const V139_11_RETIRED_BLOG_ROUTES = new Set([
  "/blog/minigame-streak-exclusion-guide.html",
  "/blog/minigame-streak-exclusion-guide",
  "/blog/minigame-streak-exclusion-guide/",
  "/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html",
  "/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide",
  "/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide/",
  "/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html",
  "/blog/minigame/minigame-losing-streak-event-exclusion-condition-first",
  "/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/"
]);
const V139_11_STALE_REDIRECTS = new Map([
  ["/blog/queenbee-telegram-seoa69.html", "/search-guides/queenbee-seoa-code.html"],
  ["/blog/queenbee-telegram-seoa69", "/search-guides/queenbee-seoa-code.html"]
]);

function normalizePathname(pathname) {
  let path = pathname || "/";
  try { path = decodeURI(path); } catch (_) {}
  if (path.length > 1 && path.endsWith("/index.html")) path = path.slice(0, -"index.html".length);
  return path;
}

function isRetiredBlogRoute(pathname) {
  const path = normalizePathname(pathname);
  if (V139_11_RETIRED_BLOG_ROUTES.has(path)) return true;
  const noSlash = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  if (V139_11_RETIRED_BLOG_ROUTES.has(noSlash)) return true;
  if (V139_11_RETIRED_BLOG_ROUTES.has(noSlash + "/")) return true;
  return false;
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = origin && /(^https:\/\/88st\.cloud$|^https:\/\/www\.88st\.cloud$|^http:\/\/localhost:\d+$)/.test(origin);
  return {
    "access-control-allow-origin": allowed ? origin : "https://88st.cloud",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-requested-with",
    "vary": "Origin"
  };
}

function json(data, status = 200, request = new Request("https://88st.cloud/")) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...corsHeaders(request) } });
}

function retiredBlogRedirect() {
  return new Response(null, {
    status: 302,
    headers: {
      location: "/blog/",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "x-rust-route-status": "v139-11-retired-broken-blog-route"
    }
  });
}

function safePayload(request) {
  const url = new URL(request.url);
  return { ok: true, version: VERSION, path: url.pathname, bot: "@TRS999_bot", botUrl: "https://t.me/TRS999_bot", safeWorker: true, timestamp: new Date().toISOString() };
}

async function readJson(request) {
  try {
    if ((request.headers.get("content-type") || "").includes("application/json")) return await request.json();
  } catch (_) {}
  return {};
}

async function handleApi(request) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (url.pathname === "/api/health" || url.pathname === "/api/status") return json(safePayload(request), 200, request);
  if (url.pathname === "/api/safety-check") {
    const body = request.method === "POST" ? await readJson(request) : {};
    return json({ ...safePayload(request), result: { level: "info", message: "코드, 공식주소, 이벤트 조건, 출금 전 확인은 자동화 상담봇에서 먼저 정리할 수 있습니다.", consultBot: "@TRS999_bot", consultUrl: "https://t.me/TRS999_bot", input: body } }, 200, request);
  }
  if (url.pathname === "/api/ai-lookup") {
    const q = url.searchParams.get("q") || "";
    return json({ ...safePayload(request), query: q, suggestions: [{ label: "가입코드 조회", href: "/tools/code-check/" }, { label: "공식주소 확인", href: "/search-guides/official-address-impersonation-check.html" }, { label: "문의 문구 만들기", href: "/tools/inquiry-builder/" }, { label: "자동화 상담봇", href: "https://t.me/TRS999_bot" }] }, 200, request);
  }
  return json({ ok: false, error: "not_found", version: VERSION }, 404, request);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (isRetiredBlogRoute(url.pathname)) return retiredBlogRedirect();
      const redirectTarget = V139_11_STALE_REDIRECTS.get(normalizePathname(url.pathname));
      if (redirectTarget) return new Response(null, { status: 301, headers: { location: redirectTarget, "cache-control": "no-store" } });
      if (url.pathname.startsWith("/api/")) return await handleApi(request);
      if (env && env.ASSETS && typeof env.ASSETS.fetch === "function") {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse && assetResponse.status !== 404) return assetResponse;
      }
      return new Response('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>페이지를 찾을 수 없습니다 | 88ST.Cloud</title><meta name="robots" content="noindex,nofollow"></head><body style="margin:0;background:#03070d;color:#fff4df;font-family:system-ui;padding:32px"><main style="max-width:720px;margin:auto"><h1>페이지를 찾을 수 없습니다</h1><p>주소를 다시 확인하거나 블로그 목록으로 이동하세요.</p><p><a href="/blog/" style="color:#fff0bd">블로그로 이동</a></p></main></body></html>', { status: 404, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    } catch (error) {
      return json({ ok: false, error: "worker_error", message: String(error && error.message || error), version: VERSION }, 500, request);
    }
  },
  async scheduled(event, env, ctx) { console.log("[" + VERSION + "] scheduled noop", event && event.cron); }
};
`);

const report = { ok: true, version: VERSION, retiredRoutes, stubFiles, deletedFiles: [], generatedAt: new Date().toISOString() };
mkdirSync('reports', { recursive: true });
write('reports/v139-11-live-broken-blog-route-kill-lock-audit.json', JSON.stringify(report, null, 2) + '\n');
write('V139_11_PATCH_MANIFEST.json', JSON.stringify(report, null, 2) + '\n');
write('V139_11_UPGRADE_REPORT.md', `# V139-11 LIVE BROKEN BLOG ROUTE KILL LOCK\n\n- Broken V9 route family is retired from visible/indexable/routable surfaces.\n- No-extension route variant is included.\n- Static noindex fallback stubs are included.\n- Deleted files: 0.\n\nGenerated: ${report.generatedAt}\n`);
console.log('[V139.11 GENERATE PASS]', JSON.stringify(report, null, 2));
