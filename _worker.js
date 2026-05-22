const VERSION = "static-growth-conversion-v51-20260522";
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

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
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...corsHeaders(request) }
  });
}

function htmlResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": status === 404 ? "no-store" : "public, max-age=120"
    }
  });
}

function safePayload(request) {
  const url = new URL(request.url);
  return {
    ok: true,
    version: VERSION,
    path: url.pathname,
    bot: "@TRS999_bot",
    botUrl: "https://t.me/TRS999_bot",
    safeWorker: true,
    timestamp: new Date().toISOString()
  };
}

async function readJson(request) {
  try {
    if ((request.headers.get("content-type") || "").includes("application/json")) {
      return await request.json();
    }
  } catch (_) {}
  return {};
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (url.pathname === "/api/health" || url.pathname === "/api/status") {
    return json(safePayload(request), 200, request);
  }

  if (url.pathname === "/api/safety-check") {
    const body = request.method === "POST" ? await readJson(request) : {};
    return json({
      ...safePayload(request),
      result: {
        level: "info",
        message: "코드, 공식주소, 이벤트 조건, 출금 전 확인은 자동화 상담봇에서 먼저 정리할 수 있습니다.",
        consultBot: "@TRS999_bot",
        consultUrl: "https://t.me/TRS999_bot",
        input: body
      }
    }, 200, request);
  }

  if (url.pathname === "/api/ai-lookup") {
    const q = url.searchParams.get("q") || "";
    return json({
      ...safePayload(request),
      query: q,
      suggestions: [
        { label: "가입코드 조회", href: "/tools/code-check/" },
        { label: "공식주소 확인", href: "/search-guides/official-address-impersonation-check.html" },
        { label: "문의 문구 만들기", href: "/tools/inquiry-builder/" },
        { label: "자동화 상담봇", href: "https://t.me/TRS999_bot" }
      ]
    }, 200, request);
  }

  return json({ ok: false, error: "not_found", version: VERSION }, 404, request);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/api/")) {
        return await handleApi(request, env);
      }

      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse && assetResponse.status !== 404) {
        return assetResponse;
      }

      return htmlResponse(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>페이지를 찾을 수 없습니다 | 88ST.Cloud</title><meta name="robots" content="noindex,nofollow"></head><body style="margin:0;background:#03070d;color:#fff4df;font-family:system-ui;padding:32px"><main style="max-width:720px;margin:auto"><h1>페이지를 찾을 수 없습니다</h1><p>주소를 다시 확인하거나 메인으로 이동하세요.</p><p><a href="/" style="color:#fff0bd">메인으로 이동</a></p></main></body></html>`, 404);
    } catch (error) {
      return json({ ok: false, error: "worker_error", message: String(error && error.message || error), version: VERSION }, 500, request);
    }
  },

  async scheduled(event, env, ctx) {
    console.log(`[${VERSION}] scheduled noop`, event && event.cron);
  }
};
