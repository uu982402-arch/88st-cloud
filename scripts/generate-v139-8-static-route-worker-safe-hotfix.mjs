import fs from 'fs';
import path from 'path';

const root = process.cwd();
const p = (...x) => path.join(root, ...x);
const version = 'V139_8_STATIC_ROUTE_WORKER_SAFE_HOTFIX';
const newRoute = '/blog/minigame-streak-exclusion-guide.html';
const oldRoutes = [
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html',
  '/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/'
];
const sourceCandidates = [
  newRoute.slice(1),
  oldRoutes[0].slice(1),
  oldRoutes[1].slice(1),
  'blog/minigame/minigame-losing-streak-event-exclusion-condition-first/index.html'
];
function readIf(file){ return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; }
function write(file, text){ fs.mkdirSync(path.dirname(file), { recursive:true }); fs.writeFileSync(file, text, 'utf8'); }
function walk(dir){
  const out=[];
  if(!fs.existsSync(dir)) return out;
  for(const item of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,item.name);
    if(item.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}
let source = '';
for(const rel of sourceCandidates){
  const fp=p(rel);
  if(fs.existsSync(fp)){ const candidate = fs.readFileSync(fp,'utf8'); if(candidate.includes('미니게임 연패 위로금') && candidate.includes('rust-ga4-id')) { source = candidate; break; } }
}
if(!source) throw new Error('V139-8 source blog article missing');
let html = source;
for(const old of oldRoutes){
  html = html.replaceAll(`https://88st.cloud${old}`, `https://88st.cloud${newRoute}`);
  html = html.replaceAll(old, newRoute);
}
html = html.replace(/<link rel="canonical" href="[^"]*minigame[^\"]*losing-streak[^\"]*">/, `<link rel="canonical" href="https://88st.cloud${newRoute}">`);
html = html.replace(/<meta property="og:url" content="[^"]*minigame[^\"]*losing-streak[^\"]*">/, `<meta property="og:url" content="https://88st.cloud${newRoute}">`);
write(p(newRoute.slice(1)), html);

const redirectHtml = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${newRoute}"><link rel="canonical" href="https://88st.cloud${newRoute}"><title>이동 중 | RUST</title></head><body><p><a href="${newRoute}">새 글로 이동</a></p></body></html>`;
for(const old of [oldRoutes[0], oldRoutes[1]]) write(p(old.slice(1)), redirectHtml);
write(p('blog/minigame/minigame-losing-streak-event-exclusion-condition-first/index.html'), redirectHtml);

for(const file of walk(root)){
  const rel = path.relative(root,file).replaceAll(path.sep,'/');
  if(!/\.(html|xml|txt|json)$/i.test(file)) continue;
  if(rel.startsWith('node_modules/')) continue;
  let text = readIf(file);
  const before = text;
  for(const old of oldRoutes){
    text = text.replaceAll(`https://88st.cloud${old}`, `https://88st.cloud${newRoute}`);
    text = text.replaceAll(old, newRoute);
  }
  if(text !== before) fs.writeFileSync(file,text,'utf8');
}

const worker = `const VERSION = "static-growth-conversion-v139-8-20260531";
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = origin && /(^https:\\/\\/88st\\.cloud$|^https:\\/\\/www\\.88st\\.cloud$|^http:\\/\\/localhost:\\d+$)/.test(origin);
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

async function handleApi(request) {
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

const V139_8_ROUTE_REDIRECTS = new Map([
  ["/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html", "/blog/minigame-streak-exclusion-guide.html"],
  ["/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html", "/blog/minigame-streak-exclusion-guide.html"],
  ["/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/", "/blog/minigame-streak-exclusion-guide.html"],
  ["/blog/minigame/minigame-losing-streak-event-exclusion-condition-first", "/blog/minigame-streak-exclusion-guide.html"],
  ["/blog/queenbee-telegram-seoa69.html", "/search-guides/queenbee-seoa-code.html"],
  ["/blog/queenbee-telegram-seoa69", "/search-guides/queenbee-seoa-code.html"]
]);

function v1398Redirect(pathname) {
  const target = V139_8_ROUTE_REDIRECTS.get(pathname);
  return target ? new Response(null, { status: 301, headers: { location: target, "cache-control": "no-store" } }) : null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      const routeRedirect = v1398Redirect(url.pathname);
      if (routeRedirect) return routeRedirect;

      if (url.pathname.startsWith("/api/")) {
        return await handleApi(request);
      }

      if (env && env.ASSETS && typeof env.ASSETS.fetch === "function") {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse && assetResponse.status !== 404) {
          return assetResponse;
        }
      }

      return htmlResponse(\`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>페이지를 찾을 수 없습니다 | 88ST.Cloud</title><meta name="robots" content="noindex,nofollow"></head><body style="margin:0;background:#03070d;color:#fff4df;font-family:system-ui;padding:32px"><main style="max-width:720px;margin:auto"><h1>페이지를 찾을 수 없습니다</h1><p>주소를 다시 확인하거나 메인으로 이동하세요.</p><p><a href="/" style="color:#fff0bd">메인으로 이동</a></p></main></body></html>\`, 404);
    } catch (error) {
      return json({ ok: false, error: "worker_error", message: String(error && error.message || error), version: VERSION }, 500, request);
    }
  },

  async scheduled(event, env, ctx) {
    console.log(\`[\${VERSION}] scheduled noop\`, event && event.cron);
  }
};
`;
fs.writeFileSync(p('_worker.js'), worker, 'utf8');

const redirectsPath = p('_redirects');
let redirects = fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath,'utf8').split(/\r?\n/) : [];
redirects = redirects.filter(line => !line.includes('minigame-losing-streak-event-exclusion-condition'));
redirects.push('/blog/minigame/minigame-losing-streak-event-exclusion-condition-guide.html /blog/minigame-streak-exclusion-guide.html 301');
redirects.push('/blog/minigame/minigame-losing-streak-event-exclusion-condition-first.html /blog/minigame-streak-exclusion-guide.html 301');
redirects.push('/blog/minigame/minigame-losing-streak-event-exclusion-condition-first/ /blog/minigame-streak-exclusion-guide.html 301');
fs.writeFileSync(redirectsPath, Array.from(new Set(redirects.filter(Boolean))).join('\n') + '\n', 'utf8');

const report = {
  ok: true,
  version,
  newRoute,
  oldRoutes,
  changedFiles: [
    '_worker.js', '_redirects', 'blog/index.html', newRoute.slice(1),
    oldRoutes[0].slice(1), oldRoutes[1].slice(1),
    'blog/minigame/minigame-losing-streak-event-exclusion-condition-first/index.html'
  ],
  strategy: 'move V9 article to top-level static blog route and use tiny Worker redirects only; remove direct inline Worker HTML fallback.'
};
write(p('reports/v139-8-static-route-worker-safe-hotfix-audit.json'), JSON.stringify(report,null,2));
write(p('V139_8_UPGRADE_REPORT.md'), `# V139-8 Static Route Worker Safe Hotfix\n\n- New route: ${newRoute}\n- Removed inline Worker HTML fallback dependency.\n- Old conflict routes redirect to the new static route.\n- Deleted files: 0\n`);
write(p('V139_8_PATCH_MANIFEST.json'), JSON.stringify(report,null,2));
console.log('[V139.8 GENERATE PASS]', JSON.stringify(report,null,2));
