const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
};

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...headers }
  });
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-max-age': '86400'
  };
}

function withCors(response, request) {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(request);
  for (const [key, value] of Object.entries(cors)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function notFound(url) {
  const body = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>404 Not Found</title><style>body{margin:0;background:#03070d;color:#eef4ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}main{max-width:760px;margin:0 auto;padding:54px 18px}section{border:1px solid rgba(255,255,255,.14);border-radius:22px;background:rgba(8,14,24,.88);padding:28px}a{color:#fff0bd}</style></head><body><main><section><h1>페이지를 찾을 수 없습니다.</h1><p>요청 주소: <strong>${escapeHtml(url.pathname)}</strong></p><p><a href="/">메인으로 이동</a></p></section></main></body></html>`;
  return new Response(body, {
    status: 404,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (_) {
    return {};
  }
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (url.pathname === '/api/health') {
    return withCors(json({ ok: true, service: '88st-cloud', version: 'worker-hardfix-v35' }), request);
  }

  if (url.pathname === '/api/safety-check') {
    const data = request.method === 'POST' ? await readJson(request) : Object.fromEntries(url.searchParams.entries());
    const target = String(data.domain || data.url || data.query || '').trim();
    const warnings = [];
    if (!target) warnings.push('확인할 주소 또는 업체명을 입력하세요.');
    if (/xn--|bit\.ly|tinyurl|shorturl/i.test(target)) warnings.push('단축주소 또는 의심 도메인은 공식주소 확인이 필요합니다.');
    return withCors(json({ ok: true, target, warnings, next: '/consult/' }), request);
  }

  if (url.pathname === '/api/ai-lookup') {
    const data = request.method === 'POST' ? await readJson(request) : Object.fromEntries(url.searchParams.entries());
    const query = String(data.q || data.query || data.domain || '').trim();
    return withCors(json({ ok: true, query, summary: '공식주소, 가입코드, 이벤트 조건을 순서대로 확인하세요.', consultBot: '@TRS999_bot', consultUrl: 'https://t.me/TRS999_bot' }), request);
  }

  return withCors(json({ ok: false, error: 'not_found' }, 404), request);
}

async function fetchAsset(request, env) {
  if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
    return env.ASSETS.fetch(request);
  }
  return fetch(request);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env || {});
      } catch (error) {
        return withCors(json({ ok: false, error: 'worker_error', message: String(error && error.message || error) }, 500), request);
      }
    }

    const response = await fetchAsset(request, env || {});
    if (response && response.status !== 404) return response;
    return notFound(url);
  },

  async scheduled(event, env, ctx) {
    return undefined;
  }
};
