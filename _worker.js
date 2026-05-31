const VERSION = "static-growth-conversion-v139-10-20260531";
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const V139_10_RETIRED_BLOG_ROUTES = new Set([
  "/blog/minigame-streak-exclusion-guide.html",
  "/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html",
  "/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html",
  "/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/",
  "/blog/minigame/minigame-losing-streak-event-exclusion-condition-first"
]);

const V139_10_STALE_REDIRECTS = new Map([
  ["/blog/queenbee-telegram-seoa69.html", "/search-guides/queenbee-seoa-code.html"],
  ["/blog/queenbee-telegram-seoa69", "/search-guides/queenbee-seoa-code.html"]
]);

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
      "cache-control": "no-store",
      "x-rust-route-status": "v139-10-retired-blog-route"
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
      if (V139_10_RETIRED_BLOG_ROUTES.has(url.pathname)) return retiredBlogRedirect();
      const redirectTarget = V139_10_STALE_REDIRECTS.get(url.pathname);
      if (redirectTarget) return new Response(null, { status: 301, headers: { location: redirectTarget, "cache-control": "no-store" } });
      if (url.pathname.startsWith("/api/")) return await handleApi(request);
      if (env && env.ASSETS && typeof env.ASSETS.fetch === "function") {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse && assetResponse.status !== 404) return assetResponse;
      }
      return new Response("<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>페이지를 찾을 수 없습니다 | 88ST.Cloud</title><meta name=\"robots\" content=\"noindex,nofollow\"></head><body style=\"margin:0;background:#03070d;color:#fff4df;font-family:system-ui;padding:32px\"><main style=\"max-width:720px;margin:auto\"><h1>페이지를 찾을 수 없습니다</h1><p>주소를 다시 확인하거나 블로그 목록으로 이동하세요.</p><p><a href=\"/blog/\" style=\"color:#fff0bd\">블로그로 이동</a></p></main></body></html>", { status: 404, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    } catch (error) {
      return json({ ok: false, error: "worker_error", message: String(error && error.message || error), version: VERSION }, 500, request);
    }
  },
  async scheduled(event, env, ctx) { console.log(`[${VERSION}] scheduled noop`, event && event.cron); }
};
