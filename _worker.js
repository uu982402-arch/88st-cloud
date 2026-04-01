// 레븐 Pages Advanced Mode Worker (_worker.js)
// Community board API: D1 + Turnstile
// - /api/posts        GET(list) / POST(create)
// - /api/posts/:id    GET(detail)
// - /api/posts/:id/comments  POST(create)
// - /api/health       GET(debug)

let __schemaReady = false;

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      // Normalize: collapse repeated trailing slashes (but keep root '/').
      const rawPath = url.pathname || '/';
      const path = rawPath.replace(/\/+$/, '') || '/';
      const method = request.method.toUpperCase();

      // Fix: Chrome/Edge speculative prefetch can receive a Cloudflare "speculation refused" 503 and then
      // poison subsequent navigations ("503 from prefetch cache").
      // We normalize speculative requests by stripping purpose headers before serving from Pages assets.
      if (method === 'GET') {
        const secPurpose = (request.headers.get('Sec-Purpose') || request.headers.get('sec-purpose') || '').toLowerCase();
        const purpose = (request.headers.get('Purpose') || request.headers.get('purpose') || '').toLowerCase();
        const dest = (request.headers.get('Sec-Fetch-Dest') || request.headers.get('sec-fetch-dest') || '').toLowerCase();
        const accept = (request.headers.get('Accept') || request.headers.get('accept') || '').toLowerCase();
        const isPrefetch = secPurpose.includes('prefetch') || purpose === 'prefetch';
        const isDoc = dest === 'document' || accept.includes('text/html');
        if (isPrefetch && isDoc) {
          const h = new Headers(request.headers);
          // Strip speculation/prefetch intent headers so Pages asset serving treats it as a normal navigation.
          h.delete('Purpose');
          h.delete('purpose');
          h.delete('Sec-Purpose');
          h.delete('sec-purpose');
          h.delete('Sec-Speculation-Tags');
          h.delete('sec-speculation-tags');
          const cleanReq = new Request(url.toString(), { method: 'GET', headers: h, redirect: 'follow' });
          return env.ASSETS.fetch(cleanReq);
        }
      }

      // Preflight / defensive
      if (method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders(request) });
      }

      // Debug endpoint (lets you confirm worker is active)
      if (path === '/api/health') {
        const hasDB = !!getDB(env);
        const hasTS = !!String(env.TURNSTILE_SECRET || '').trim();
        return json({ ok: true, service: '88st-community', hasDB, hasTurnstileSecret: hasTS, ts: Date.now() }, 200, corsHeaders(request));
      }

      // API routing (never fall through to static for /api/*)
      if (path === '/api/posts') {
        if (method === 'GET') return handlePostsGet(request, env);
        if (method === 'POST') return handlePostsPost(request, env);
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }

      const mPost = path.match(/^\/api\/posts\/(\d+)$/);
      if (mPost) {
        if (method === 'GET') return handlePostGet(request, env, Number(mPost[1]));
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }

      const mC = path.match(/^\/api\/posts\/(\d+)\/comments$/);
      if (mC) {
        if (method === 'POST') return handleCommentPost(request, env, Number(mC[1]));
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }



      if (path === '/api/news') {
        if (method === 'GET') return handleSportsNews(request, env, ctx);
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }

      // SEO Console API (GSC -> D1)
      if (path === '/api/seo/summary') {
        if (method === 'GET') return handleSeoSummary(request, env);
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }

      if (path === '/api/seo/opportunities') {
        if (method === 'GET') return handleSeoOpportunities(request, env);
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }

      if (path === '/api/seo/sync') {
        if (method === 'POST') return handleSeoSync(request, env, ctx);
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }


      if (path === '/api/safety/domain') {
        if (method === 'GET') return handleSafetyDomainLookup(request, env);
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }

      if (path === '/api/safety/brands') {
        if (method === 'GET') return handleSafetyBrandDirectory(request, env);
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }

      if (path === '/api/safety/compare') {
        if (method === 'GET') return handleSafetyCompare(request, env);
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }

      if (path === '/api/safety/ip') {
        if (method === 'GET') return handleSafetyIpLookup(request, env);
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }

      if (path === '/api/safety/evidence') {
        if (method === 'GET') return handleSafetyEvidenceExtract(request, env);
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }

      if (path.startsWith('/api/')) {
        return json({ ok: false, error: 'not_found' }, 404, corsHeaders(request));
      }

      if (isDeprecatedSearchCleanupPath(path)) {
        return gone({ ok: false, error: 'gone', path, message: '정리된 예전 구조 경로입니다.' }, request);
      }

// TEMP: Community routes disabled (redirect to home)
if (path === '/community' || path.startsWith('/community/')) {
  const target = url.origin + '/';
  return Response.redirect(target, 302);
}


      // OPS deploy patch config: always no-store (fast operations)
      if (path === '/assets/config/ops.dom.patch.json') {
        const res = await env.ASSETS.fetch(request);
        const h = new Headers(res.headers);
        h.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
        h.set('pragma', 'no-cache');
        h.set('expires', '0');
        return new Response(res.body, { status: res.status, headers: h });
      }

      // CERT landing deploy config: always no-store (operational swaps)
      if (path === '/assets/config/cert.landing.json') {
        const res = await env.ASSETS.fetch(request);
        const h = new Headers(res.headers);
        h.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
        h.set('pragma', 'no-cache');
        h.set('expires', '0');
        return new Response(res.body, { status: res.status, headers: h });
      }

      // EVENT popup deploy config: always no-store (operational swaps)
      if (path === '/assets/config/popup.event.json') {
        const res = await env.ASSETS.fetch(request);
        const h = new Headers(res.headers);
        h.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
        h.set('pragma', 'no-cache');
        h.set('expires', '0');
        return new Response(res.body, { status: res.status, headers: h });
      }

      
      // SITE runtime deploy config: always no-store (operational swaps)
      if (path === '/assets/config/site.runtime.json') {
        const res = await env.ASSETS.fetch(request);
        const h = new Headers(res.headers);
        h.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
        h.set('pragma', 'no-cache');
        h.set('expires', '0');
        return new Response(res.body, { status: res.status, headers: h });
      }

// SEO keyword bank: always no-store (operational swaps)
      if (path === '/assets/config/seo.bank.json') {
        const res = await env.ASSETS.fetch(request);
        const h = new Headers(res.headers);
        h.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
        h.set('pragma', 'no-cache');
        h.set('expires', '0');
        return new Response(res.body, { status: res.status, headers: h });
      }

      // SEO meta deploy file: always no-store (operational swaps)
      if (path === '/assets/config/seo.meta.json') {
        const res = await env.ASSETS.fetch(request);
        const h = new Headers(res.headers);
        h.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
        h.set('pragma', 'no-cache');
        h.set('expires', '0');
        return new Response(res.body, { status: res.status, headers: h });
      }

      // EVENT popup image: fixed path swap (image replace only, no config changes)
      if (path === '/img/popup/event-popup.jpg') {
        const res = await env.ASSETS.fetch(request);
        const h = new Headers(res.headers);
        h.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
        h.set('pragma', 'no-cache');
        h.set('expires', '0');
        return new Response(res.body, { status: res.status, headers: h });
      }

      // Static fallthrough
      return env.ASSETS.fetch(request);

    } catch (e) {
      return json({ ok: false, error: 'worker_error', message: String(e?.message || e) }, 500);
    }
  },
  async scheduled(event, env, ctx) {
    // Optional: set a Cron Trigger in Cloudflare to run this daily.
    // Recommended: schedule around 03:10 KST to avoid peak traffic.
    try{
      await seoSyncCore(env, ctx, { days: 28, reason: 'cron' });
    }catch(e){}
  }
};


function corsHeaders(request) {
  // Same-origin is expected, but keep permissive for safety.
  const origin = request.headers.get('Origin') || '*';
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400'
  };
}

function json(body, status = 200, extraHeaders = {}) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...extraHeaders
  });
  return new Response(JSON.stringify(body), { status, headers });
}

function gone(body, request) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-robots-tag': 'noindex, nofollow'
  });
  const accept = String(request.headers.get('accept') || '').toLowerCase();
  if (accept.includes('text/html')) {
    return new Response(`<!DOCTYPE html><html lang="ko"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>410 Gone</title><body style="background:#07111f;color:#eef4ff;font-family:system-ui;padding:32px"><h1>정리된 경로입니다.</h1><p>이 페이지는 더 이상 사용하지 않습니다.</p><p><a href="/" style="color:#8fb6ff">메인으로 이동</a></p></body></html>`, { status: 410, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } });
  }
  return new Response(JSON.stringify(body), { status: 410, headers });
}

function getDB(env) {
  // primary binding name is expected to be "DB"
  return env.DB || env["88stcloud"] || env.db || env.D1 || null;
}

async function ensureSchema(db) {
  if (!db) return;
  if (__schemaReady) return;

  // Safe: CREATE IF NOT EXISTS. Runs once per isolate.
  const schemaSQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  board TEXT NOT NULL DEFAULT 'promo',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_name TEXT NOT NULL,
  ip_hash TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  author_name TEXT NOT NULL,
  ip_hash TEXT,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_board_created ON posts(board, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status_board_created ON posts(status, board, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at DESC);

CREATE TABLE IF NOT EXISTS seo_sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_at INTEGER NOT NULL,
  range_start TEXT NOT NULL,
  range_end TEXT NOT NULL,
  rows INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ok',
  message TEXT
);

CREATE TABLE IF NOT EXISTS seo_gsc_rows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  page TEXT NOT NULL,
  page_path TEXT NOT NULL,
  query TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr REAL NOT NULL DEFAULT 0,
  position REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_seo_gsc_date ON seo_gsc_rows(date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_gsc_page ON seo_gsc_rows(page_path, date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_gsc_query ON seo_gsc_rows(query, date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_gsc_page_query ON seo_gsc_rows(page_path, query, date DESC);

CREATE TABLE IF NOT EXISTS seo_opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  computed_at INTEGER NOT NULL,
  page TEXT NOT NULL,
  page_path TEXT NOT NULL,
  query TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr REAL NOT NULL DEFAULT 0,
  position REAL NOT NULL DEFAULT 0,
  expected_ctr REAL NOT NULL DEFAULT 0,
  potential_clicks REAL NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  reco TEXT
);

CREATE INDEX IF NOT EXISTS idx_seo_opp_score ON seo_opportunities(score DESC, computed_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_opp_page ON seo_opportunities(page_path, score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_opp_query ON seo_opportunities(query, score DESC);
`;

  try {
    // D1 supports multi-statement exec.
    await db.exec(schemaSQL);
  } catch (e) {
    // If exec isn't available or fails, fall back to single statements.
    // (Keeps compatibility across D1 API changes.)
    try {
      await db.prepare("PRAGMA foreign_keys = ON").run();
      await db.prepare("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, board TEXT NOT NULL DEFAULT 'promo', title TEXT NOT NULL, body TEXT NOT NULL, author_name TEXT NOT NULL, ip_hash TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active', like_count INTEGER NOT NULL DEFAULT 0, comment_count INTEGER NOT NULL DEFAULT 0)").run();
      await db.prepare("CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, body TEXT NOT NULL, author_name TEXT NOT NULL, ip_hash TEXT, created_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active')").run();
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC)").run();
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status, created_at DESC)").run();
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_posts_board_created ON posts(board, created_at DESC)").run();
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_posts_status_board_created ON posts(status, board, created_at DESC)").run();
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at DESC)").run();
    } catch (_) {}
  }

  // If you created schema earlier without board column, ensure it's present.
  try { await db.prepare("ALTER TABLE posts ADD COLUMN board TEXT NOT NULL DEFAULT 'promo'").run(); } catch (_) {}

  __schemaReady = true;
}

function normBoard(v) {
  const b = String(v || '').trim().toLowerCase();
  return (b === 'promo') ? 'promo' : 'free';
}

function clampIntDefaultFirst(v, def = 0, min = 0, max = 999999999) {
  const n = parseInt(String(v ?? ''), 10);
  if (Number.isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

function normalizeText(v, maxLen) {
  const s = String(v ?? '').replace(/\s+/g, ' ').trim();
  return s.slice(0, maxLen);
}

function normalizeBody(v, maxLen) {
  let s = String(v ?? '').trim();
  s = s.replace(/\r\n/g, '\n');
  s = s.replace(/[ \t]{3,}/g, '  ');
  return s.slice(0, maxLen);
}

function getIP(request) {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')
    || '';
}

async function sha256B64Url(input) {
  const buf = new TextEncoder().encode(String(input));
  const hash = await crypto.subtle.digest('SHA-256', buf);
  const bytes = new Uint8Array(hash);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function verifyTurnstile(token, ip, env) {
  const secret = String(env.TURNSTILE_SECRET || '').trim();
  if (!secret) return { ok: false, reason: 'missing_secret' };

  const t = String(token || '').trim();
  if (!t) return { ok: false, reason: 'missing_token' };

  const fd = new FormData();
  fd.append('secret', secret);
  fd.append('response', t);
  if (ip) fd.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: fd
  });
  const data = await res.json().catch(() => null);
  return { ok: !!data?.success, data };
}

async function handlePostsGet(request, env) {
  const db = getDB(env);
  if (!db) return json({ ok: false, error: 'missing_db_binding' }, 500, corsHeaders(request));
  await ensureSchema(db);

  const url = new URL(request.url);
  const q = normalizeText(url.searchParams.get('q') || '', 80);
  const sort = String(url.searchParams.get('sort') || 'latest').toLowerCase();
  const board = normBoard(url.searchParams.get('board') || url.searchParams.get('b') || 'free');
  const page = clampIntDefaultFirst(url.searchParams.get('page'), 1, 1, 200);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let orderBy = 'created_at DESC';
  if (sort === 'hot') orderBy = 'comment_count DESC, created_at DESC';

  let where = "status='active' AND board=?";
  const binds = [board];

  if (q) {
    where += " AND (title LIKE ? OR body LIKE ? OR author_name LIKE ?)";
    const like = `%${q}%`;
    binds.push(like, like, like);
  }

  const sql = `SELECT id, board, title, author_name, created_at, comment_count,
      substr(replace(replace(body, char(10), ' '), char(13), ' '), 1, 140) AS snippet
    FROM posts
    WHERE ${where}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?`;

  binds.push(pageSize, offset);

  const rows = await db.prepare(sql).bind(...binds).all();
  const items = (rows?.results || []).map(r => ({
    id: r.id,
    board: r.board || board,
    title: r.title,
    author_name: r.author_name,
    created_at: r.created_at,
    comment_count: r.comment_count,
    snippet: r.snippet || ''
  }));

  return json({ ok: true, items, page, board }, 200, corsHeaders(request));
}

async function handlePostsPost(request, env) {
  const db = getDB(env);
  if (!db) return json({ ok: false, error: 'missing_db_binding' }, 500, corsHeaders(request));
  await ensureSchema(db);

  const ip = getIP(request);
  const ipHash = await sha256B64Url(ip || '0.0.0.0');

  const payload = await request.json().catch(() => null);
  if (!payload) return json({ ok: false, error: 'bad_json' }, 400, corsHeaders(request));

  const board = normBoard(payload.board || 'free');
  const title = normalizeText(payload.title, 80);
  const body = normalizeBody(payload.body, 5000);
  const author = normalizeText(payload.author_name || '익명', 20) || '익명';
  const token = payload.turnstileToken;

  if (title.length < 2) return json({ ok: false, error: 'title_too_short' }, 400, corsHeaders(request));
  if (body.length < 10) return json({ ok: false, error: 'body_too_short' }, 400, corsHeaders(request));

  const v = await verifyTurnstile(token, ip, env);
  if (!v.ok) return json({ ok: false, error: 'turnstile_failed', reason: v.reason }, 400, corsHeaders(request));

  // rate limit: 3 posts / 5m / ip
  const now = Date.now();
  const since = now - 5 * 60 * 1000;
  const cntRow = await db.prepare(
    'SELECT COUNT(*) AS c FROM posts WHERE ip_hash=? AND created_at>?'
  ).bind(ipHash, since).first();

  if (Number(cntRow?.c || 0) >= 3) return json({ ok: false, error: 'rate_limited' }, 429, corsHeaders(request));

  const res = await db.prepare(
    "INSERT INTO posts (board, title, body, author_name, ip_hash, created_at, updated_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')"
  ).bind(board, title, body, author, ipHash, now, now).run();

  const id = res?.meta?.last_row_id;
  return json({ ok: true, id, board }, 201, corsHeaders(request));
}

async function handlePostGet(request, env, id) {
  const db = getDB(env);
  if (!db) return json({ ok: false, error: 'missing_db_binding' }, 500, corsHeaders(request));
  await ensureSchema(db);

  const pid = clampInt(id, 0, 1, 1_000_000_000);
  if (!pid) return json({ ok: false, error: 'bad_id' }, 400, corsHeaders(request));

  const post = await db.prepare(
    "SELECT id, board, title, body, author_name, created_at, updated_at, comment_count FROM posts WHERE id=? AND status='active' LIMIT 1"
  ).bind(pid).first();

  if (!post) return json({ ok: false, error: 'not_found' }, 404, corsHeaders(request));

  const commentsRes = await db.prepare(
    "SELECT id, post_id, body, author_name, created_at FROM comments WHERE post_id=? AND status='active' ORDER BY created_at DESC LIMIT 200"
  ).bind(pid).all();

  const comments = (commentsRes?.results || []).map(c => ({
    id: c.id,
    post_id: c.post_id,
    body: c.body,
    author_name: c.author_name,
    created_at: c.created_at
  }));

  return json({ ok: true, post, comments }, 200, corsHeaders(request));
}

async function handleCommentPost(request, env, id) {
  const db = getDB(env);
  if (!db) return json({ ok: false, error: 'missing_db_binding' }, 500, corsHeaders(request));
  await ensureSchema(db);

  const pid = clampInt(id, 0, 1, 1_000_000_000);
  if (!pid) return json({ ok: false, error: 'bad_id' }, 400, corsHeaders(request));

  const ip = getIP(request);
  const ipHash = await sha256B64Url(ip || '0.0.0.0');

  const payload = await request.json().catch(() => null);
  if (!payload) return json({ ok: false, error: 'bad_json' }, 400, corsHeaders(request));

  const body = normalizeBody(payload.body, 2000);
  const author = normalizeText(payload.author_name || '익명', 20) || '익명';
  const token = payload.turnstileToken;

  if (body.length < 2) return json({ ok: false, error: 'body_too_short' }, 400, corsHeaders(request));

  const v = await verifyTurnstile(token, ip, env);
  if (!v.ok) return json({ ok: false, error: 'turnstile_failed', reason: v.reason }, 400, corsHeaders(request));

  const post = await db.prepare(
    "SELECT id FROM posts WHERE id=? AND status='active' LIMIT 1"
  ).bind(pid).first();

  if (!post) return json({ ok: false, error: 'not_found' }, 404, corsHeaders(request));

  // rate limit: 8 comments / 5m / ip
  const now = Date.now();
  const since = now - 5 * 60 * 1000;
  const recent = await db.prepare(
    'SELECT COUNT(*) AS c FROM comments WHERE ip_hash=? AND created_at>?'
  ).bind(ipHash, since).first();

  if (Number(recent?.c || 0) >= 8) return json({ ok: false, error: 'rate_limited' }, 429, corsHeaders(request));

  const ins = await db.prepare(
    "INSERT INTO comments (post_id, body, author_name, ip_hash, created_at, status) VALUES (?, ?, ?, ?, ?, 'active')"
  ).bind(pid, body, author, ipHash, now).run();

  await db.prepare('UPDATE posts SET comment_count = comment_count + 1, updated_at=? WHERE id=?')
    .bind(now, pid).run();

  const cid = ins?.meta?.last_row_id;
  return json({ ok: true, id: cid }, 201, corsHeaders(request));
}


// -------------------------
// SEO Console (GSC -> D1)
// -------------------------

function getBearerToken(request){
  const h = request.headers.get('authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? String(m[1]||'').trim() : '';
}

function isAuthorized(request, env){
  const want = String(env.ADMIN_TOKEN || '').trim();
  if(!want) return false;
  const got = getBearerToken(request);
  return !!got && got === want;
}

function requireAuth(request, env){
  if(!isAuthorized(request, env)){
    return json({ ok:false, error:'unauthorized' }, 401, corsHeaders(request));
  }
  return null;
}

function isoDate(d){
  // YYYY-MM-DD (UTC)
  try{ return new Date(d).toISOString().slice(0,10); }catch(e){ return ''; }
}

function clampIntRange(v, min, max, def){
  const n = Number(v);
  if(!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function expectedCtrByPosition(pos){
  // Conservative CTR curve (rough heuristic). Tune later using your own data.
  const p = Number(pos||0);
  if(!Number.isFinite(p) || p<=0) return 0.01;
  if(p<=1) return 0.28;
  if(p<=2) return 0.16;
  if(p<=3) return 0.11;
  if(p<=4) return 0.08;
  if(p<=5) return 0.065;
  if(p<=6) return 0.055;
  if(p<=7) return 0.048;
  if(p<=8) return 0.042;
  if(p<=9) return 0.038;
  if(p<=10) return 0.035;
  if(p<=12) return 0.028;
  if(p<=15) return 0.022;
  if(p<=20) return 0.016;
  return 0.01;
}

async function handleSeoSummary(request, env){
  const denied = requireAuth(request, env);
  if(denied) return denied;

  const db = getDB(env);
  if(!db) return json({ ok:false, error:'db_not_configured' }, 500, corsHeaders(request));
  await ensureSchema(db);

  const last = await db.prepare('SELECT date AS d FROM seo_gsc_rows ORDER BY date DESC LIMIT 1').first();
  const d = String(last?.d || '').trim();
  const sum = d ? await db.prepare('SELECT SUM(clicks) AS clicks, SUM(impressions) AS impressions FROM seo_gsc_rows WHERE date=?').bind(d).first()
                : { clicks:0, impressions:0 };

  const run = await db.prepare('SELECT run_at, range_start, range_end, rows, status, message FROM seo_sync_runs ORDER BY run_at DESC LIMIT 1').first();
  const clicks = Number(sum?.clicks || 0);
  const impressions = Number(sum?.impressions || 0);
  const ctr = impressions ? (clicks / impressions) : 0;

  return json({
    ok:true,
    site_url: String(env.GSC_SITE_URL || '').trim(),
    range: d ? (d + ' (snapshot)') : '-',
    clicks, impressions, ctr,
    last_sync: run?.run_at ? new Date(Number(run.run_at)).toISOString() : null,
    last_sync_status: run?.status || null,
    last_sync_rows: Number(run?.rows || 0),
    last_sync_message: run?.message || null
  }, 200, corsHeaders(request));
}

async function handleSeoOpportunities(request, env){
  const denied = requireAuth(request, env);
  if(denied) return denied;

  const db = getDB(env);
  if(!db) return json({ ok:false, error:'db_not_configured' }, 500, corsHeaders(request));
  await ensureSchema(db);

  const url = new URL(request.url);
  const limit = clampIntRange(url.searchParams.get('limit'), 1, 200, 50);

  const rs = await db.prepare(
    'SELECT score, query, page_path, page, clicks, impressions, ctr, position, reco FROM seo_opportunities ORDER BY score DESC, computed_at DESC LIMIT ?'
  ).bind(limit).all();

  return json({ ok:true, items: rs?.results || [] }, 200, corsHeaders(request));
}

async function handleSeoSync(request, env, ctx){
  const denied = requireAuth(request, env);
  if(denied) return denied;

  let body = null;
  try{ body = await request.json(); }catch(e){ body = {}; }
  const days = clampIntRange(body?.days, 7, 90, 28);

  try{
    const out = await seoSyncCore(env, ctx, { days, reason:'manual' });
    return json({ ok:true, ...out }, 200, corsHeaders(request));
  }catch(e){
    return json({ ok:false, error:'sync_failed', message: String(e?.message || e) }, 500, corsHeaders(request));
  }
}

async function seoSyncCore(env, ctx, opts){
  const db = getDB(env);
  if(!db) throw new Error('DB binding not configured');
  await ensureSchema(db);

  const siteUrl = String(env.GSC_SITE_URL || '').trim();
  const cid = String(env.GSC_CLIENT_ID || '').trim();
  const csec = String(env.GSC_CLIENT_SECRET || '').trim();
  const rtk = String(env.GSC_REFRESH_TOKEN || '').trim();
  if(!siteUrl || !cid || !csec || !rtk) throw new Error('Missing env: GSC_SITE_URL / GSC_CLIENT_ID / GSC_CLIENT_SECRET / GSC_REFRESH_TOKEN');

  const days = clampIntRange(opts?.days, 7, 90, 28);

  // GSC data often lags 1~2 days. Use endDate = today-3days (UTC) for stability.
  const end = new Date(Date.now() - 3*864e5);
  const start = new Date(end.getTime() - (days-1)*864e5);
  const startDate = isoDate(start);
  const endDate = isoDate(end);

  const runAt = Date.now();
  let rows = [];
  let status = 'ok';
  let msg = null;

  try{
    rows = await gscFetchQueryPage(env, siteUrl, startDate, endDate);
    // Keep only top N by impressions to avoid D1 timeouts.
    rows.sort((a,b)=> (Number(b.impressions||0) - Number(a.impressions||0)));
    const MAX_ROWS = 5000;
    if(rows.length > MAX_ROWS) rows = rows.slice(0, MAX_ROWS);

    // Refresh snapshot for endDate
    await db.prepare('DELETE FROM seo_gsc_rows WHERE date=?').bind(endDate).run();

    // Batch insert
    const chunkSize = 50;
    for(let i=0; i<rows.length; i+=chunkSize){
      const chunk = rows.slice(i, i+chunkSize);
      const stmts = chunk.map(r => db.prepare(
        'INSERT INTO seo_gsc_rows (date, page, page_path, query, clicks, impressions, ctr, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        endDate,
        r.page,
        r.page_path,
        r.query,
        Number(r.clicks||0),
        Number(r.impressions||0),
        Number(r.ctr||0),
        Number(r.position||0),
        runAt
      ));
      // D1 supports batch execution
      await db.batch(stmts);
    }

    // Recompute opportunities (keep it small)
    await db.prepare('DELETE FROM seo_opportunities').run();

    const opp = [];
    for(const r of rows){
      const imp = Number(r.impressions||0);
      const clk = Number(r.clicks||0);
      const pos = Number(r.position||0);
      const ctr = Number(r.ctr||0);

      if(!imp || imp < 120) continue;         // minimum exposure
      if(!(pos >= 3 && pos <= 15)) continue;  // quick-win zone

      const exp = expectedCtrByPosition(pos);
      const pot = (imp * exp) - clk;
      if(pot < 3) continue;

      const score = Math.max(1, Math.round(pot));
      let reco = '본문 보강 + 내부링크';
      if(pos <= 10 && ctr < exp*0.7) reco = '타이틀/메타 CTR 개선';
      if(pos > 10) reco = '콘텐츠 보강(의도/FAQ)';

      opp.push({
        page: r.page,
        page_path: r.page_path,
        query: r.query,
        clicks: clk,
        impressions: imp,
        ctr,
        position: pos,
        expected_ctr: exp,
        potential_clicks: pot,
        score,
        reco
      });
    }
    opp.sort((a,b)=> (b.score - a.score));
    const top = opp.slice(0, 200);

    const computedAt = Date.now();
    for(let i=0; i<top.length; i+=50){
      const chunk = top.slice(i, i+50);
      const stmts = chunk.map(o => db.prepare(
        'INSERT INTO seo_opportunities (computed_at, page, page_path, query, clicks, impressions, ctr, position, expected_ctr, potential_clicks, score, reco) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        computedAt,
        o.page,
        o.page_path,
        o.query,
        o.clicks,
        o.impressions,
        o.ctr,
        o.position,
        o.expected_ctr,
        o.potential_clicks,
        o.score,
        o.reco
      ));
      await db.batch(stmts);
    }

  }catch(e){
    status = 'error';
    msg = String(e?.message || e);
    throw e;
  }finally{
    // Log run
    try{
      await db.prepare(
        'INSERT INTO seo_sync_runs (run_at, range_start, range_end, rows, status, message) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(runAt, startDate, endDate, rows.length, status, msg).run();
    }catch(e){}
  }

  return { startDate, endDate, rows: rows.length };
}

async function gscFetchQueryPage(env, siteUrl, startDate, endDate){
  const token = await gscAccessToken(env);
  const api = 'https://searchconsole.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(siteUrl) + '/searchAnalytics/query';

  const payload = {
    startDate,
    endDate,
    dimensions: ['query','page'],
    rowLimit: 25000
  };

  const res = await fetch(api, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + token },
    body: JSON.stringify(payload)
  });

  const j = await res.json().catch(()=>null);
  if(!res.ok){
    const msg = (j && (j.error && (j.error.message || JSON.stringify(j.error)))) || ('HTTP_'+res.status);
    throw new Error('GSC API error: ' + msg);
  }

  const rows = Array.isArray(j?.rows) ? j.rows : [];
  const out = [];
  for(const r of rows){
    const keys = Array.isArray(r?.keys) ? r.keys : [];
    const query = String(keys[0]||'').trim();
    const page = String(keys[1]||'').trim();
    if(!query || !page) continue;

    let pagePath = page;
    try{ pagePath = new URL(page).pathname || '/'; }catch(e){}

    out.push({
      query,
      page,
      page_path: pagePath,
      clicks: Number(r?.clicks || 0),
      impressions: Number(r?.impressions || 0),
      ctr: Number(r?.ctr || 0),
      position: Number(r?.position || 0)
    });
  }
  return out;
}

async function gscAccessToken(env){
  const cid = String(env.GSC_CLIENT_ID || '').trim();
  const csec = String(env.GSC_CLIENT_SECRET || '').trim();
  const rtk = String(env.GSC_REFRESH_TOKEN || '').trim();

  const form = new URLSearchParams();
  form.set('client_id', cid);
  form.set('client_secret', csec);
  form.set('refresh_token', rtk);
  form.set('grant_type', 'refresh_token');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form.toString()
  });
  const j = await res.json().catch(()=>null);
  if(!res.ok){
    const msg = (j && (j.error_description || j.error)) || ('HTTP_'+res.status);
    throw new Error('OAuth token error: ' + msg);
  }
  const tok = String(j?.access_token || '').trim();
  if(!tok) throw new Error('OAuth token missing access_token');
  return tok;
}



async function handleSportsNews(request, env, ctx) {
  const url = new URL(request.url);
  const refresh = url.searchParams.get('refresh') === '1';
  const limit = Math.max(4, Math.min(12, Number(url.searchParams.get('limit') || 8)));
  const cache = caches.default;
  const cacheKey = new Request(url.origin + `/api/news?limit=${limit}`);
  const stale = await cache.match(cacheKey);
  if (!refresh && stale) return stale;

  const generatedAt = new Date().toISOString();
  const primaryFeeds = [
    { source: 'ESPN', category: '일반', url: 'https://www.espn.com/espn/rss/news' },
    { source: 'ESPN', category: '축구', url: 'https://www.espn.com/espn/rss/soccer/news' },
    { source: 'ESPN', category: '농구', url: 'https://www.espn.com/espn/rss/nba/news' },
    { source: 'ESPN', category: '야구', url: 'https://www.espn.com/espn/rss/mlb/news' }
  ];

  const [primaryItems, backupItems] = await Promise.all([
    fetchEspnFeedItems(primaryFeeds),
    fetchBackupNewsItems()
  ]);

  let items = dedupeNewsItems([...primaryItems, ...backupItems])
    .sort((a, b) => (Date.parse(b.publishedAt || 0) || 0) - (Date.parse(a.publishedAt || 0) || 0));

  if (!items.length && stale) {
    const headers = new Headers(stale.headers);
    headers.set('x-88st-news-fallback', 'stale-cache');
    return new Response(stale.body, { status: 200, headers });
  }

  if (!items.length) {
    items = buildCuratedSportsFallback(generatedAt);
  }

  items = items.map((item) => localizeSportsItem(item));

  const usedSources = Array.from(new Set(items.map((item) => item.source).filter(Boolean)));
  const body = JSON.stringify({
    ok: true,
    generatedAt,
    sources: usedSources,
    items: items.slice(0, limit)
  });

  const response = new Response(body, {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600',
      'x-88st-news-fallback': backupItems.length ? 'backup-enabled' : 'primary-only',
      ...corsHeaders(request)
    }
  });

  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

async function fetchEspnFeedItems(feeds) {
  const settled = await Promise.allSettled(feeds.map((feed) => fetch(feed.url, {
    headers: {
      'user-agent': '레븐-NewsFetcher/1.1 (+https://88st.cloud/)',
      'accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1'
    }
  }).then(async (res) => {
    if (!res.ok) throw new Error(`feed_${res.status}`);
    const xml = await res.text();
    return parseSportsRss(xml, feed).slice(0, 3);
  })));

  return settled.flatMap((entry) => entry.status === 'fulfilled' ? entry.value : []);
}

async function fetchBackupNewsItems() {
  const backups = [
    fetchReutersSportsItems(),
    fetchBbcSportItems('football', '축구'),
    fetchGoogleNewsSportsItems('international sports', '일반'),
    fetchGoogleNewsSportsItems('soccer OR football', '축구'),
    fetchGoogleNewsSportsItems('NBA basketball', '농구'),
    fetchGoogleNewsSportsItems('MLB baseball', '야구')
  ];
  const settled = await Promise.allSettled(backups);
  return settled.flatMap((entry) => entry.status === 'fulfilled' ? entry.value : []);
}

async function fetchReutersSportsItems() {
  const res = await fetch('https://www.reuters.com/sports/', {
    headers: {
      'user-agent': '레븐-NewsFetcher/1.1 (+https://88st.cloud/)',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  if (!res.ok) throw new Error(`reuters_${res.status}`);
  const html = await res.text();
  return parseReutersSportsHtml(html).slice(0, 4);
}


async function fetchBbcSportItems(path, category) {
  const feedUrl = `https://newsrss.bbc.co.uk/rss/sportonline_uk_edition/${path}/rss.xml`;
  const res = await fetch(feedUrl, {
    headers: {
      'user-agent': '레븐-NewsFetcher/1.1 (+https://88st.cloud/)',
      'accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1'
    }
  });
  if (!res.ok) throw new Error(`bbc_${path}_${res.status}`);
  const xml = await res.text();
  return parseSportsRss(xml, { source: 'BBC Sport', category }).slice(0, 3);
}

async function fetchGoogleNewsSportsItems(query, category) {
  const feedUrl = 'https://news.google.com/rss/search?q=' + encodeURIComponent(query) + '&hl=en-US&gl=US&ceid=US:en';
  const res = await fetch(feedUrl, {
    headers: {
      'user-agent': '레븐-NewsFetcher/1.1 (+https://88st.cloud/)',
      'accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1'
    }
  });
  if (!res.ok) throw new Error(`google_news_${res.status}`);
  const xml = await res.text();
  return parseSportsRss(xml, { source: 'Google News', category }).slice(0, 2);
}

function parseSportsRss(xml, feed) {
  const items = [];
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = extractXmlTag(block, 'title');
    const link = extractXmlTag(block, 'link');
    const description = extractXmlTag(block, 'description');
    const pubDate = extractXmlTag(block, 'pubDate');
    if (!title || !link) continue;
    const cleanTitle = decodeXml(title).replace(/\s+-\s+Reuters$/i, '').trim();
    const cleanLink = decodeXml(link).trim();
    if (!cleanTitle || !cleanLink) continue;
    items.push({
      source: feed.source,
      category: feed.category,
      title: cleanTitle,
      link: cleanLink,
      summary: summarizeText(decodeXml(description)),
      publishedAt: safeIsoDate(pubDate)
    });
  }
  return items;
}

function parseReutersSportsHtml(html) {
  const items = [];
  const seen = new Set();
  const re = /<a[^>]+href="(\/sports\/[^"#?]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html)) && items.length < 8) {
    const href = match[1];
    const rawText = decodeXml(match[2]);
    const title = rawText.replace(/\s+/g, ' ').trim();
    if (!href || !title || title.length < 18) continue;
    const link = href.startsWith('http') ? href : 'https://www.reuters.com' + href;
    const dedupeKey = (title + '|' + link).toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    items.push({
      source: 'Reuters',
      category: inferCategory(title, href),
      title,
      link,
      summary: 'Reuters Sports 최신 기사에서 확인한 백업 뉴스 카드입니다. 원문 링크에서 자세한 내용을 확인할 수 있습니다.',
      publishedAt: new Date().toISOString()
    });
  }
  return items;
}

function inferCategory(title = '', href = '') {
  const hay = `${title} ${href}`.toLowerCase();
  if (/(soccer|football|premier league|champions league|uefa|fifa)/.test(hay)) return '축구';
  if (/(nba|basketball|ncaab|wnba)/.test(hay)) return '농구';
  if (/(mlb|baseball)/.test(hay)) return '야구';
  return '일반';
}

function normalizeNewsTitle(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[\[\]().,:;!?"'`]/g, ' ')
    .replace(/(update|updates|report|reports|preview|analysis|live)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeNewsItems(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (!item || !item.title || !item.link) continue;
    const titleKey = normalizeNewsTitle(item.title);
    const linkKey = String(item.link).trim().toLowerCase().replace(/[?#].*$/, '');
    const key = `${titleKey}|${linkKey}`;
    if (seen.has(key) || seen.has(titleKey)) continue;
    seen.add(key);
    if (titleKey) seen.add(titleKey);
    result.push(item);
  }
  return result;
}



function localizeSportsItem(item) {
  const originalTitle = String(item?.title || '').trim();
  const originalSummary = String(item?.summary || '').trim();
  const category = item?.category || '일반';
  const summary = localizeSportsSummary(originalSummary, originalTitle, category, item?.source || '');
  const guidance = buildNewsGuidance(category, originalTitle, summary);
  return {
    ...item,
    originalTitle,
    originalSummary,
    title: localizeSportsHeadline(originalTitle, category),
    summary,
    whyImportant: guidance.whyImportant,
    impact: guidance.impact,
    actionLabel: guidance.actionLabel,
    actionHref: guidance.actionHref
  };
}

function buildNewsGuidance(category = '일반', title = '', summary = '') {
  const hay = `${title} ${summary}`.toLowerCase();
  if (category === '축구') {
    const why = /injury|결장|부상|lineup|선발/.test(hay)
      ? '선발 구성과 결장 변수는 축구 경기 흐름과 라인 해석에 직접 연결됩니다.'
      : '축구 뉴스는 라인업·일정 간격·동기부여 변수를 빠르게 정리할 때 가장 가치가 큽니다.';
    return { whyImportant: why, impact: '라인업과 일정 변수 확인 후 분석기에서 공정·마진 구간까지 함께 확인하는 흐름이 좋습니다.', actionLabel: '축구 변수 확인하기', actionHref: '/odds/' };
  }
  if (category === '농구') {
    const why = /back-to-back|rotation|rest|출전|결장/.test(hay)
      ? '농구는 백투백 일정, 로테이션, 핵심 자원 출전 여부가 시장 반응을 크게 움직입니다.'
      : '농구 뉴스는 일정 밀도와 로테이션 변화를 같이 볼 때 해석 가치가 높아집니다.';
    return { whyImportant: why, impact: '백투백·주전 변수 확인 후 분석기에서 상태 해설까지 같이 보는 편이 안전합니다.', actionLabel: '농구 분석 이어보기', actionHref: '/odds/' };
  }
  if (category === '야구') {
    const why = /starter|pitcher|bullpen|선발|불펜/.test(hay)
      ? '야구는 선발 매치업과 불펜 소모 정보가 당일 흐름 해석에 핵심입니다.'
      : '야구 뉴스는 선발·불펜·타선 흐름을 함께 읽을 때 체감 가치가 커집니다.';
    return { whyImportant: why, impact: '선발과 불펜 소모 확인 뒤 경기별 비교 구간을 잡는 흐름이 좋습니다.', actionLabel: '야구 분석 이어보기', actionHref: '/odds/' };
  }
  return { whyImportant: '핵심 이슈를 먼저 짧게 파악한 뒤 상세 맥락은 원문으로 확인하는 구조가 가장 효율적입니다.', impact: '브리핑 확인 후 관심 종목에 맞는 가이드나 분석기로 바로 이동할 수 있습니다.', actionLabel: '안전센터 이동', actionHref: '/muktu-police/' };
}

function localizeSportsHeadline(value = '', category = '일반') {
  let text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return `${category} 주요 소식 업데이트`;
  text = text.replace(/\s+\|\s+.+$/g, '').trim();

  const phraseRules = [
    [/^(.+?)\s+beat(?:s|ing|en)?\s+(.+)$/i, '$1, $2 제압'],
    [/^(.+?)\s+defeat(?:s|ed)?\s+(.+)$/i, '$1, $2 꺾어'],
    [/^(.+?)\s+edge(?:s|d)?\s+(.+)$/i, '$1, $2에 신승'],
    [/^(.+?)\s+top(?:s|ped)?\s+(.+)$/i, '$1, $2 상대로 우위'],
    [/^(.+?)\s+down(?:s|ed)?\s+(.+)$/i, '$1, $2 격파'],
    [/^(.+?)\s+hold(?:s|ing)?\s+off\s+(.+)$/i, '$1, $2 추격 뿌리쳐'],
    [/^(.+?)\s+advance(?:s|d)?\s+to\s+(.+)$/i, '$1, $2 진출'],
    [/^(.+?)\s+reach(?:es|ed)?\s+(.+)$/i, '$1, $2 도달'],
    [/^(.+?)\s+sign(?:s|ed)?\s+(.+)$/i, '$1, $2 영입'],
    [/^(.+?)\s+re-sign(?:s|ed)?\s+(.+)$/i, '$1, $2 재계약'],
    [/^(.+?)\s+extend(?:s|ed)?\s+(.+)$/i, '$1, $2 연장 계약'],
    [/^(.+?)\s+trade(?:s|d)?\s+for\s+(.+)$/i, '$1, $2 트레이드'],
    [/^(.+?)\s+fire(?:s|d)?\s+(.+)$/i, '$1, $2 해임'],
    [/^(.+?)\s+hire(?:s|d)?\s+(.+)$/i, '$1, $2 선임'],
    [/^(.+?)\s+out\s+for\s+(.+)$/i, '$1, $2 결장 가능성'],
    [/^injury update[:\-]?\s*(.+)$/i, '$1 부상 업데이트'],
    [/^preview[:\-]?\s*(.+)$/i, '$1 프리뷰'],
    [/^report[:\-]?\s*(.+)$/i, '$1 리포트'],
    [/^live[:\-]?\s*(.+)$/i, '$1 라이브 업데이트']
  ];
  for (const [pattern, replacement] of phraseRules) {
    if (pattern.test(text)) {
      text = text.replace(pattern, replacement).replace(/\s+/g, ' ').trim();
      break;
    }
  }

  const wordMap = [
    ['breaking', '속보'], ['exclusive', '단독'], ['update', '업데이트'], ['preview', '프리뷰'],
    ['report', '리포트'], ['analysis', '분석'], ['reaction', '반응'], ['injury', '부상'],
    ['injured', '부상'], ['returns', '복귀'], ['return', '복귀'], ['questionable', '출전 여부 불확실'],
    ['doubtful', '출전 불투명'], ['available', '출전 가능'], ['ruled out', '결장'], ['suspended', '징계 결장'],
    ['coach', '감독'], ['manager', '감독'], ['player', '선수'], ['captain', '주장'],
    ['team', '팀'], ['lineup', '선발 명단'], ['starter', '선발'], ['bench', '벤치'], ['rotation', '로테이션'],
    ['trade', '트레이드'], ['transfer', '이적'], ['contract', '계약'], ['deal', '계약'],
    ['playoff', '플레이오프'], ['playoffs', '플레이오프'], ['regular season', '정규시즌'],
    ['final', '결승'], ['semi-final', '준결승'], ['semifinal', '준결승'], ['quarterfinal', '8강'],
    ['overtime', '연장'], ['ot', '연장'], ['shootout', '승부차기'], ['draw', '무승부'],
    ['win', '승리'], ['wins', '승리'], ['loss', '패배'], ['losses', '패배'],
    ['soccer', '축구'], ['football', '축구'], ['basketball', '농구'], ['baseball', '야구'],
    ['premier league', '프리미어리그'], ['champions league', '챔피언스리그'], ['uefa', 'UEFA'], ['fifa', 'FIFA'],
    ['nba', 'NBA'], ['wnba', 'WNBA'], ['mlb', 'MLB'], ['nfl', 'NFL'], ['nhl', 'NHL'], ['ufc', 'UFC'],
    ['grand prix', '그랑프리']
  ];
  for (const [from, to] of wordMap) {
    const re = new RegExp(`\\b${escapeForRegExp(from)}\\b`, 'gi');
    text = text.replace(re, to);
  }

  text = text
    .replace(/\bvs\.?\b/gi, '대결')
    .replace(/\s+at\s+/gi, ' 원정 ')
    .replace(/\s+home\s+/gi, ' 홈 ')
    .replace(/\s+/g, ' ')
    .replace(/[–—]/g, '·')
    .trim();

  if (englishRatio(text) > 0.72) {
    return `${category} 주요 이슈: ${text}`;
  }
  return text;
}

function localizeSportsSummary(value = '', originalTitle = '', category = '일반', source = '') {
  let text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) {
    return `${category} 주요 소식입니다. 핵심 흐름을 빠르게 확인한 뒤 원문 링크에서 세부 내용을 살펴보세요.`;
  }

  const replacements = [
    ['according to', '보도에 따르면'], ['sources said', '현지 보도 기준'], ['latest', '최신'],
    ['breaking', '속보'], ['update', '업데이트'], ['preview', '프리뷰'], ['report', '리포트'],
    ['injury', '부상'], ['returns', '복귀'], ['return', '복귀'], ['coach', '감독'], ['manager', '감독'],
    ['player', '선수'], ['team', '팀'], ['season', '시즌'], ['playoffs', '플레이오프'], ['playoff', '플레이오프'],
    ['regular season', '정규시즌'], ['overtime', '연장'], ['soccer', '축구'], ['football', '축구'],
    ['basketball', '농구'], ['baseball', '야구'], ['won', '승리'], ['lost', '패배'], ['draw', '무승부']
  ];
  for (const [from, to] of replacements) {
    const re = new RegExp(`\\b${escapeForRegExp(from)}\\b`, 'gi');
    text = text.replace(re, to);
  }
  text = text.replace(/\s+/g, ' ').trim();

  if (englishRatio(text) > 0.55) {
    const localizedTitle = localizeSportsHeadline(originalTitle, category);
    return `${localizedTitle} 관련 ${category} 소식입니다. 기사 핵심만 한국어로 빠르게 정리한 카드이며, 자세한 맥락과 수치는 원문 링크에서 확인하는 편이 가장 정확합니다.`;
  }
  return summarizeText(text);
}

function englishRatio(value = '') {
  const text = String(value || '');
  const letters = (text.match(/[A-Za-z]/g) || []).length;
  const korean = (text.match(/[가-힣]/g) || []).length;
  const base = letters + korean || 1;
  return letters / base;
}

function escapeForRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function buildCuratedSportsFallback(generatedAt = new Date().toISOString()) {
  return [
    {
      source: '레븐 브리핑',
      category: '축구',
      title: '축구 브리핑 연결 지연 시 먼저 확인할 포인트',
      link: 'https://88st.cloud/odds/',
      summary: '선발 라인업, 핵심 결장, 일정 간격, 최근 홈·원정 흐름을 우선 정리하면 경기 판단이 훨씬 선명해집니다.',
      publishedAt: generatedAt
    },
    {
      source: '레븐 브리핑',
      category: '농구',
      title: '농구 브리핑 연결 지연 시 체크할 핵심 변수',
      link: 'https://88st.cloud/odds/',
      summary: '백투백 일정, 주전 출전 여부, 로테이션 변화, 최근 공격·수비 페이스를 먼저 보면 기본 판단 구조를 빠르게 세울 수 있습니다.',
      publishedAt: generatedAt
    },
    {
      source: '레븐 브리핑',
      category: '야구',
      title: '야구 브리핑 연결 지연 시 확인할 기본 흐름',
      link: 'https://88st.cloud/odds/',
      summary: '선발 매치업, 불펜 소모, 타선 흐름, 구장 변수까지 같이 보면 당일 경기 리듬을 읽는 데 도움이 됩니다.',
      publishedAt: generatedAt
    },
    {
      source: '레븐 브리핑',
      category: '일반',
      title: '실시간 브리핑 재연결 중에도 스포츠 자료 흐름은 유지됩니다',
      link: 'https://88st.cloud/odds/',
      summary: '실시간 외부 피드가 잠시 지연될 경우에도 메인 허브에서는 스포츠 중심 카드와 연결 동선을 유지하도록 구성했습니다.',
      publishedAt: generatedAt
    }
  ];
}

function extractXmlTag(block, tag) {
  const re = new RegExp(String.raw`<${tag}\b[^>]*>([\s\S]*?)<\/${tag}>`, 'i');
  const match = block.match(re);
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function decodeXml(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

function summarizeText(value = '') {
  const clean = decodeXml(value).replace(/\s+/g, ' ').trim();
  if (!clean) return '원문 링크에서 자세한 내용을 확인할 수 있습니다.';
  return clean.length > 160 ? clean.slice(0, 157).trimEnd() + '…' : clean;
}

function safeIsoDate(value) {
  const ts = Date.parse(value || '');
  return Number.isFinite(ts) ? new Date(ts).toISOString() : new Date().toISOString();
}


async function handleSafetyDomainLookup(request, env) {
  const url = new URL(request.url);
  const raw = url.searchParams.get('domain') || '';
  const domain = normalizeLookupDomain(raw);
  if (!domain) {
    return json({ ok: false, error: 'invalid_domain', message: '도메인 형식이 올바르지 않습니다.' }, 400, corsHeaders(request));
  }

  const now = Date.now();
  const [rdap, dnsA, dnsAAAA, dnsNS, dnsMX] = await Promise.all([
    fetchJsonWithTimeout(`https://rdap.org/domain/${encodeURIComponent(domain)}`),
    dnsJsonLookup(domain, 'A'),
    dnsJsonLookup(domain, 'AAAA'),
    dnsJsonLookup(domain, 'NS'),
    dnsJsonLookup(domain, 'MX')
  ]);

  const aRecords = dedupeDnsAnswers(dnsA);
  const aaaaRecords = dedupeDnsAnswers(dnsAAAA);
  const nsRecords = dedupeDnsAnswers(dnsNS);
  const mxRecords = dedupeDnsAnswers(dnsMX);
  const ipTargets = [...aRecords, ...aaaaRecords].slice(0, 4);
  const ipProfilesRaw = await Promise.all(ipTargets.map((ip) => fetchJsonWithTimeout(`https://ipwho.is/${encodeURIComponent(ip)}`)));
  const ipProfiles = ipProfilesRaw.filter((item) => item && item.success !== false).map((item) => normalizeIpProfile(item));
  const rdapSummary = normalizeRdapSummary(rdap, now);
  const cluster = buildClusterSummary(ipProfiles, nsRecords);
  const risk = buildDomainRiskV1(rdapSummary, { aRecords, nsRecords, mxRecords }, cluster);
  const interpretation = buildDomainInterpretation(rdapSummary, { aRecords, nsRecords, mxRecords }, cluster, risk);
  const googleSearches = buildSafetyGoogleSearches(domain);

  return json({
    ok: true,
    domain,
    checkedAt: new Date(now).toISOString(),
    summary: { score: risk.score, verdict: risk.verdict, commentary: risk.commentary },
    risk,
    interpretation,
    rdap: rdapSummary,
    dns: { aRecords, aaaaRecords, nameServers: nsRecords, mxRecords },
    networks: ipProfiles,
    cluster,
    googleSearches
  }, 200, corsHeaders(request));
}

async function handleSafetyIpLookup(request, env) {
  const url = new URL(request.url);
  const raw = url.searchParams.get('ip') || '';
  const ip = normalizeLookupIp(raw);
  if (!ip) {
    return json({ ok: false, error: 'invalid_ip', message: 'IP 형식이 올바르지 않습니다.' }, 400, corsHeaders(request));
  }
  const [profileRaw, ptrPayload] = await Promise.all([
    fetchJsonWithTimeout(`https://ipwho.is/${encodeURIComponent(ip)}`),
    lookupPtrRecord(ip)
  ]);
  if (!profileRaw || profileRaw.success === false) {
    return json({ ok: false, error: 'ip_lookup_failed', message: 'IP 조회 응답을 불러오지 못했습니다.' }, 502, corsHeaders(request));
  }
  const profile = normalizeIpDetail(profileRaw);
  const ptr = dedupeDnsAnswers(ptrPayload);
  const cluster = buildClusterSummary([{ ip: profile.ip, asn: profile.asn, org: profile.org }], []);
  const risk = buildIpRiskV1(profile, ptr, cluster);
  const interpretation = buildIpInterpretation(profile, ptr, cluster, risk);
  const googleSearches = buildSafetyIpSearches(ip);
  return json({
    ok: true,
    checkedAt: new Date().toISOString(),
    ip: profile,
    ptr,
    cluster,
    risk,
    interpretation,
    summary: { commentary: risk.commentary },
    googleSearches
  }, 200, corsHeaders(request));
}

async function handleSafetyEvidenceExtract(request, env) {
  const url = new URL(request.url);
  const target = normalizeEvidenceUrl(url.searchParams.get('url') || '');
  if (!target) {
    return json({ ok: false, error: 'invalid_url', message: '공개 글 URL 형식이 올바르지 않습니다.' }, 400, corsHeaders(request));
  }
  const host = new URL(target).hostname.toLowerCase();
  if (!isAllowedEvidenceHost(host)) {
    return json({ ok: false, error: 'host_not_allowed', message: '허용된 공개 페이지 호스트만 추출할 수 있습니다.' }, 400, corsHeaders(request));
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), 9000);
  let html = '';
  try {
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'accept': 'text/html,application/xhtml+xml' } });
    if (!res.ok) return json({ ok: false, error: 'fetch_failed', message: '공개 글 응답을 가져오지 못했습니다.' }, 502, corsHeaders(request));
    html = await res.text();
  } catch (error) {
    return json({ ok: false, error: 'fetch_failed', message: '공개 글 응답을 가져오지 못했습니다.' }, 502, corsHeaders(request));
  } finally {
    clearTimeout(timer);
  }
  const extracted = extractEvidenceFromHtml(target, html);
  return json({ ok: true, source: extracted.source, evidence: extracted.evidence, interpretation: extracted.interpretation }, 200, corsHeaders(request));
}

async function handleSafetyBrandDirectory(request, env) {
  const url = new URL(request.url);
  const slug = String(url.searchParams.get('slug') || '').trim().toLowerCase();
  const payload = await loadStaticJsonAsset(env, '/assets/data/brand.results.v2.20260330.json');
  if (!payload || !Array.isArray(payload.brands)) {
    return json({ ok: false, error: 'brand_payload_unavailable' }, 500, corsHeaders(request));
  }
  const brands = payload.brands.map((brand) => ({
    slug: brand.slug,
    name: brand.name,
    displayTitle: brand.displayTitle,
    officialDomain: brand.officialDomain,
    code: brand.code,
    oneLine: brand.oneLine,
    status: brand.status,
    tags: brand.badgeTags || brand.tags || []
  }));
  const item = slug ? brands.find((brand) => brand.slug === slug) : null;
  return json({ ok: true, updated: payload.updated, brands: item ? [item] : brands }, 200, corsHeaders(request));
}

async function handleSafetyCompare(request, env) {
  const url = new URL(request.url);
  const left = String(url.searchParams.get('left') || '').trim().toLowerCase();
  const right = String(url.searchParams.get('right') || '').trim().toLowerCase();
  const payload = await loadStaticJsonAsset(env, '/assets/data/brand.results.v2.20260330.json');
  if (!payload || !Array.isArray(payload.brands)) {
    return json({ ok: false, error: 'brand_payload_unavailable' }, 500, corsHeaders(request));
  }
  const brands = payload.brands;
  const leftBrand = brands.find((brand) => brand.slug === left);
  const rightBrand = brands.find((brand) => brand.slug === right);
  if (!leftBrand || !rightBrand) {
    return json({ ok: false, error: 'brand_not_found', message: '비교할 브랜드를 찾지 못했습니다.' }, 404, corsHeaders(request));
  }
  const rows = [
    { label: '혜택 요약', left: leftBrand.rewardSummary, right: rightBrand.rewardSummary },
    { label: '검색 흐름', left: leftBrand.oneLine, right: rightBrand.oneLine },
    { label: '도메인 점검', left: leftBrand.headline, right: rightBrand.headline },
    { label: '진입 문구', left: leftBrand.conversionVariants?.[0]?.title || '', right: rightBrand.conversionVariants?.[0]?.title || '' }
  ];
  return json({
    ok: true,
    updated: payload.updated,
    left: { slug: leftBrand.slug, name: leftBrand.name, score: leftBrand.status?.score || leftBrand.benefitRank || 0 },
    right: { slug: rightBrand.slug, name: rightBrand.name, score: rightBrand.status?.score || rightBrand.benefitRank || 0 },
    rows
  }, 200, corsHeaders(request));
}

async function loadStaticJsonAsset(env, pathname) {
  try {
    const req = new Request('https://88st.cloud' + pathname, { method: 'GET' });
    const res = await env.ASSETS.fetch(req);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}


function normalizeLookupIp(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.includes(':')) {
    return /^[0-9a-f:]+$/i.test(raw) ? raw.toLowerCase() : '';
  }
  const parts = raw.split('.');
  if (parts.length !== 4) return '';
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return '';
    const num = Number(part);
    if (num < 0 || num > 255) return '';
  }
  return parts.join('.');
}

function reversePtrName(ip = '') {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    return ip.split('.').reverse().join('.') + '.in-addr.arpa';
  }
  return '';
}

async function lookupPtrRecord(ip = '') {
  const ptrName = reversePtrName(ip);
  if (!ptrName) return null;
  return dnsJsonLookup(ptrName, 'PTR');
}

function normalizeIpDetail(payload) {
  const connection = payload?.connection || {};
  return {
    ip: String(payload?.ip || ''),
    country: String(payload?.country || ''),
    city: String(payload?.city || ''),
    region: String(payload?.region || ''),
    org: String(connection?.org || payload?.org || ''),
    isp: String(connection?.isp || payload?.isp || ''),
    asn: connection?.asn ? `AS${connection.asn}` : '',
    network: String(connection?.domain || connection?.isp || payload?.isp || ''),
    type: String(connection?.type || payload?.type || '')
  };
}

function buildSafetyIpSearches(ip) {
  const terms = [
    { label: 'IP 먹튀 검색', query: `${ip} 먹튀` },
    { label: 'IP 후기 검색', query: `${ip} 후기` },
    { label: 'IP 도메인 검색', query: `${ip} 도메인` },
    { label: '공개 페이지 검색 1', query: `(site:mt-police07.com OR site:mt-spot.com) ${ip}` },
    { label: '공개 페이지 검색 2', query: `(site:mtlevel.com OR site:mtgal.com) ${ip}` },
    { label: '공개 페이지 검색 3', query: `site:daumd08.net ${ip}` }
  ];
  return terms.map((item) => ({ ...item, href: `https://www.google.com/search?q=${encodeURIComponent(item.query)}` }));
}

function normalizeLookupDomain(value = '') {
  let next = String(value || '').trim().toLowerCase();
  next = next.replace(/^https?:\/\//, '').replace(/^www\./, '');
  next = next.split('/')[0].split('?')[0].split('#')[0].replace(/:\d+$/, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(next)) return '';
  return next;
}

async function fetchJsonWithTimeout(url, init = {}, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);
  try {
    const res = await fetch(url, { ...init, headers: { 'accept': 'application/json', ...(init.headers || {}) }, signal: controller.signal, redirect: 'follow' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function dnsJsonLookup(name, type) {
  return fetchJsonWithTimeout(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, {
    headers: { 'accept': 'application/dns-json' }
  }, 7000);
}

function dedupeDnsAnswers(payload) {
  const items = Array.isArray(payload?.Answer) ? payload.Answer : [];
  const output = [];
  const seen = new Set();
  for (const item of items) {
    const data = String(item?.data || '').trim().replace(/\.$/, '');
    if (!data || seen.has(data)) continue;
    seen.add(data);
    output.push(data);
  }
  return output;
}

function normalizeRdapSummary(payload, now = Date.now()) {
  const events = Array.isArray(payload?.events) ? payload.events : [];
  const byAction = {};
  for (const evt of events) {
    const key = String(evt?.eventAction || '').toLowerCase();
    if (!key || byAction[key]) continue;
    byAction[key] = evt?.eventDate || '';
  }
  const createdAt = byAction['registration'] || byAction['registered'] || byAction['creation'] || byAction['created'] || '';
  const expiresAt = byAction['expiration'] || byAction['expiry'] || byAction['expires'] || '';
  const createdTs = Date.parse(createdAt || '');
  const expiresTs = Date.parse(expiresAt || '');
  const ageDays = Number.isFinite(createdTs) ? Math.max(0, Math.round((now - createdTs) / 86400000)) : null;
  const expiresInDays = Number.isFinite(expiresTs) ? Math.round((expiresTs - now) / 86400000) : null;
  const registrar = payload?.registrarName || payload?.port43 || payload?.ldhName || payload?.handle || '';
  const status = Array.isArray(payload?.status) ? payload.status.map((item) => String(item || '')) : [];
  return {
    registrar,
    createdAt,
    expiresAt,
    ageDays,
    expiresInDays,
    status
  };
}

function normalizeIpProfile(payload) {
  const connection = payload?.connection || {};
  return {
    ip: String(payload?.ip || ''),
    country: String(payload?.country || ''),
    city: String(payload?.city || ''),
    org: String(connection?.org || payload?.org || ''),
    asn: connection?.asn ? `AS${connection.asn}` : '',
    network: String(connection?.domain || connection?.isp || payload?.isp || '')
  };
}

function buildClusterSummary(ipProfiles = [], nsRecords = []) {
  const subnets = [];
  const subnetSeen = new Set();
  const asnSet = new Set();
  const orgSet = new Set();
  for (const item of ipProfiles) {
    const ip = String(item?.ip || '');
    if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
      const parts = ip.split('.');
      const subnet = `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
      if (!subnetSeen.has(subnet)) {
        subnetSeen.add(subnet);
        subnets.push(subnet);
      }
    }
    if (item?.asn) asnSet.add(item.asn);
    if (item?.org) orgSet.add(item.org);
  }
  const sharedAsns = [...asnSet];
  const sharedOrgs = [...orgSet];
  const summaryParts = [];
  if (subnets.length) summaryParts.push(`${subnets.length}개 대역`);
  if (sharedAsns.length) summaryParts.push(`${sharedAsns.length}개 ASN`);
  if (nsRecords.length) summaryParts.push(`${nsRecords.length}개 네임서버`);
  return {
    subnets,
    sharedAsns,
    sharedOrgs,
    nameservers: nsRecords,
    summary: summaryParts.length ? summaryParts.join(' · ') : '클러스터 힌트가 충분하지 않습니다.'
  };
}

function buildSafetySignals(rdap, dns, cluster) {
  const signals = [];
  if (rdap?.ageDays != null && rdap.ageDays < 90) {
    signals.push({ level: 'high', label: '주의', title: '신규 생성 도메인', detail: `도메인 생성 후 ${rdap.ageDays}일 수준입니다. 광고 문구상 운영 연차와 일치하는지 추가 확인이 필요합니다.` });
  } else if (rdap?.ageDays != null && rdap.ageDays < 365) {
    signals.push({ level: 'warn', label: '확인', title: '생성 1년 미만', detail: `도메인 생성 후 ${rdap.ageDays}일입니다. 후기와 커뮤니티 흔적을 같이 보는 편이 좋습니다.` });
  } else {
    signals.push({ level: 'low', label: '기본', title: '도메인 연차 확인', detail: rdap?.ageDays != null ? `도메인 생성 후 ${rdap.ageDays}일입니다.` : '등록일 응답이 없어 도메인 연차를 판단하기 어렵습니다.' });
  }
  if (rdap?.expiresInDays != null && rdap.expiresInDays < 45) {
    signals.push({ level: 'warn', label: '확인', title: '만료 임박', detail: `도메인 만료까지 ${rdap.expiresInDays}일입니다. 주소 변경 공지나 운영 계획을 함께 확인해 보세요.` });
  }
  if (!(dns?.aRecords || []).length) {
    signals.push({ level: 'high', label: '주의', title: 'A 레코드 부재', detail: '현재 확인된 A 레코드가 없습니다. 운영 중 도메인이라면 연결 상태를 먼저 확인해야 합니다.' });
  } else {
    signals.push({ level: 'low', label: '기본', title: 'A 레코드 확인', detail: `${dns.aRecords.length}개의 A 레코드를 확인했습니다.` });
  }
  if (!(dns?.nameServers || []).length) {
    signals.push({ level: 'warn', label: '확인', title: '네임서버 응답 제한', detail: '네임서버 응답이 비어 있습니다. DNS 응답 제한 또는 비정상 설정 여부를 확인해 보세요.' });
  }
  if ((cluster?.sharedAsns || []).length > 1 || (cluster?.subnets || []).length > 1) {
    signals.push({ level: 'warn', label: '확인', title: '복수 대역/ASN 힌트', detail: '여러 대역 또는 ASN이 보입니다. 인프라 분산일 수도 있어 커뮤니티 흔적과 함께 보는 편이 좋습니다.' });
  } else {
    signals.push({ level: 'low', label: '기본', title: '클러스터 기초 확인', detail: cluster?.summary || '클러스터 힌트가 충분하지 않습니다.' });
  }
  return signals.slice(0, 6);
}

function buildSafetySummary(rdap, dns, cluster) {
  let score = 100;
  if (rdap?.ageDays != null && rdap.ageDays < 90) score -= 30;
  else if (rdap?.ageDays != null && rdap.ageDays < 365) score -= 15;
  if (rdap?.expiresInDays != null && rdap.expiresInDays < 45) score -= 15;
  if (!(dns?.aRecords || []).length) score -= 25;
  if (!(dns?.nameServers || []).length) score -= 10;
  if ((cluster?.subnets || []).length > 1) score -= 5;
  score = Math.max(20, Math.min(100, score));
  const verdict = score >= 85 ? '기본 점검 통과' : score >= 60 ? '추가 확인' : '주의 필요';
  const commentary = verdict === '기본 점검 통과'
    ? '기초 지표상 바로 큰 경고는 적지만, 실제 이용 전에는 후기·입출금 테스트까지 함께 확인하는 편이 안전합니다.'
    : verdict === '추가 확인'
      ? '기초 지표 중 몇 가지는 추가 확인이 필요합니다. 구글링과 커뮤니티 후기, 소액 테스트를 함께 보세요.'
      : '신규 도메인, A 레코드, 만료일 등에서 주의 포인트가 보여 추가 검증 없이 바로 이용하는 것은 권장되지 않습니다.';
  return { score, verdict, commentary };
}

function buildSafetyGoogleSearches(domain) {
  const terms = [
    { label: '먹튀 사례 조회', query: `${domain} 먹튀` },
    { label: '먹튀검증 검색', query: `${domain} 먹튀검증` },
    { label: '후기 검색', query: `${domain} 후기` },
    { label: '도메인 변경 검색', query: `${domain} 도메인 변경` },
    { label: '텔레그램 검색', query: `${domain} 텔레그램` },
    { label: '메이저 검색', query: `${domain} 메이저` }
  ];
  return terms.map((item) => ({
    ...item,
    href: `https://www.google.com/search?q=${encodeURIComponent(item.query)}`
  }));
}


function isDeprecatedSearchCleanupPath(path = '') {
  return /^\/muktu-police\/(brand|compare|report|query)(\/|$)/.test(path) || /^\/muktu-police\/faq\/(yangsim|chilbet|vegas|avengers)(\/|$)/.test(path);
}

function buildDomainRiskV1(rdap, dns, cluster) {
  const drivers = [];
  let score = 100;
  const apply = (points, label, detail) => { score -= points; drivers.push({ points, label, detail }); };
  if (rdap?.ageDays == null) apply(8, '등록일 응답 부족', 'RDAP 등록일 응답이 없어 도메인 연차 판단 신뢰도가 낮습니다.');
  else if (rdap.ageDays < 30) apply(34, '생성 30일 미만', `도메인 생성 후 ${rdap.ageDays}일입니다.`);
  else if (rdap.ageDays < 90) apply(24, '생성 90일 미만', `도메인 생성 후 ${rdap.ageDays}일입니다.`);
  else if (rdap.ageDays < 365) apply(12, '생성 1년 미만', `도메인 생성 후 ${rdap.ageDays}일입니다.`);
  if (rdap?.expiresInDays != null && rdap.expiresInDays < 30) apply(16, '만료 임박', `도메인 만료까지 ${rdap.expiresInDays}일입니다.`);
  else if (rdap?.expiresInDays != null && rdap.expiresInDays < 90) apply(8, '만료 90일 이내', `도메인 만료까지 ${rdap.expiresInDays}일입니다.`);
  if (!(dns?.aRecords || []).length) apply(26, 'A 레코드 부재', '현재 확인된 A 레코드가 없습니다.');
  if (!(dns?.nameServers || []).length) apply(10, '네임서버 응답 부족', '네임서버 응답이 비어 있습니다.');
  if ((cluster?.sharedAsns || []).length > 1) apply(6, '복수 ASN', '복수 ASN이 보여 인프라 분산 또는 변경 가능성을 같이 봐야 합니다.');
  if ((cluster?.subnets || []).length > 1) apply(6, '복수 대역', '복수 /24 대역이 보여 공개 검색과 함께 확인하는 편이 좋습니다.');
  score = Math.max(10, Math.min(100, score));
  const confidence = rdap?.createdAt && (dns?.nameServers || []).length ? '중간 이상' : '중간';
  const band = score >= 80 ? '낮음' : score >= 60 ? '중간' : score >= 40 ? '주의' : '높음';
  const verdict = score >= 80 ? '기본 점검 통과' : score >= 60 ? '추가 확인' : score >= 40 ? '주의 필요' : '고위험 신호';
  const commentary = score >= 80 ? '기초 지표상 큰 경고는 적지만, 공개 검색과 실제 이용 전 소액 확인은 계속 필요합니다.' : score >= 60 ? '기초 지표 중 몇 가지는 추가 확인이 필요합니다. 검색 흔적과 공지 일관성을 같이 보세요.' : score >= 40 ? '신규 도메인 또는 인프라 신호가 보여 보수적으로 보는 편이 좋습니다.' : '기술 신호 기준으로 바로 이용하기엔 위험 신호가 많은 편입니다.';
  return { score, band, verdict, confidence, commentary, drivers };
}

function buildIpRiskV1(profile, ptr, cluster) {
  const drivers = [];
  let score = 100;
  const apply = (points, label, detail) => { score -= points; drivers.push({ points, label, detail }); };
  if (!profile?.asn) apply(18, 'ASN 정보 부족', 'ASN 응답이 없어 네트워크 조직 판단이 제한됩니다.');
  if (!profile?.org && !profile?.isp) apply(14, '조직 정보 부족', '조직 또는 ISP 정보가 비어 있습니다.');
  if (!(ptr || []).length) apply(10, 'PTR 없음', '역방향 PTR 응답이 없습니다.');
  if ((profile?.type || '').toLowerCase().includes('hosting') || (profile?.type || '').toLowerCase().includes('business')) apply(8, '호스팅형 IP', '호스팅 또는 비즈니스 성격 IP일 수 있어 공개 검색과 같이 보는 편이 좋습니다.');
  if ((cluster?.sharedAsns || []).length > 1) apply(6, '복수 ASN 힌트', '복수 ASN 힌트가 보여 같은 운영군 추적 시 메모가 필요합니다.');
  score = Math.max(15, Math.min(100, score));
  const band = score >= 80 ? '낮음' : score >= 60 ? '중간' : score >= 40 ? '주의' : '높음';
  const commentary = score >= 80 ? 'IP 기준 큰 경고는 적지만, 도메인과 같이 확인하는 편이 좋습니다.' : score >= 60 ? 'IP 기준 몇 가지 해석 포인트가 있어 공개 검색과 같이 보는 편이 좋습니다.' : 'IP 기준으로 추가 확인이 필요한 신호가 있어 도메인 정보와 함께 다시 보는 편이 좋습니다.';
  return { score, band, confidence: profile?.asn ? '중간' : '낮음', commentary, drivers };
}

function buildDomainInterpretation(rdap, dns, cluster, risk) {
  const items = [];
  items.push({ level: risk.band, title: '도메인 연차', detail: rdap?.ageDays != null ? `도메인 생성 후 ${rdap.ageDays}일입니다.` : '등록일 응답이 없어 도메인 연차 해석 신뢰도가 낮습니다.' });
  items.push({ level: (dns?.aRecords || []).length ? '기본' : '주의', title: 'DNS 연결', detail: (dns?.aRecords || []).length ? `${dns.aRecords.length}개 A 레코드를 확인했습니다.` : 'A 레코드가 없어 현재 연결 상태를 먼저 확인해야 합니다.' });
  items.push({ level: (cluster?.sharedAsns || []).length > 1 || (cluster?.subnets || []).length > 1 ? '주의' : '기본', title: '클러스터 힌트', detail: cluster?.summary || '뚜렷한 클러스터 힌트가 많지 않습니다.' });
  if (rdap?.expiresInDays != null) items.push({ level: rdap.expiresInDays < 90 ? '확인' : '기본', title: '만료 시점', detail: `도메인 만료까지 ${rdap.expiresInDays}일입니다.` });
  return items.slice(0, 4);
}

function buildIpInterpretation(profile, ptr, cluster, risk) {
  return [
    { level: risk.band, title: '네트워크 조직', detail: [profile?.asn, profile?.org || profile?.isp, profile?.network].filter(Boolean).join(' · ') || 'ASN/조직 응답이 제한적입니다.' },
    { level: (ptr || []).length ? '기본' : '확인', title: 'PTR 응답', detail: (ptr || []).length ? ptr.join(', ') : 'PTR 응답이 없습니다.' },
    { level: (cluster?.subnets || []).length > 1 ? '주의' : '기본', title: '클러스터 힌트', detail: cluster?.summary || '동일 IP 기준 추가 클러스터 힌트가 많지 않습니다.' }
  ];
}

function normalizeEvidenceUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    if (!/^https?:$/.test(url.protocol)) return '';
    return url.toString();
  } catch (error) {
    return '';
  }
}

function isAllowedEvidenceHost(host = '') {
  const value = String(host || '').toLowerCase();
  const allow = ['mt-police07.com', 'www.mt-police07.com', 'mt-spot.com', 'www.mt-spot.com', 'daumd08.net', 'www.daumd08.net', 'mtlevel.com', 'www.mtlevel.com', 'mtgal.com', 'www.mtgal.com'];
  return allow.includes(value);
}

function extractEvidenceFromHtml(url, html = '') {
  const sourceUrl = new URL(url);
  const title = firstMatch(html, [/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i, /<title[^>]*>([^<]+)<\/title>/i]);
  const publishedAt = firstMatch(html, [/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i, /<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i, /<time[^>]+datetime=["']([^"']+)["']/i]);
  const canonical = firstMatch(html, [/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i]);
  const text = stripHtml(html).replace(/\s+/g, ' ').trim();
  const domains = collectUniqueMatches(text, /(?:[a-z0-9-]+\.)+[a-z]{2,}/gi).filter((item) => !item.endsWith('.png') && !item.endsWith('.jpg')).slice(0, 12);
  const ips = collectUniqueMatches(text, /(?:\d{1,3}\.){3}\d{1,3}/g).slice(0, 12);
  const telegrams = collectUniqueMatches(text, /(?:t\.me\/[A-Za-z0-9_]+|@[A-Za-z0-9_]{4,})/g).slice(0, 8);
  const kakaos = collectUniqueMatches(html, /open\.kakao\.com\/[A-Za-z0-9_\-\/]+/gi).slice(0, 8);
  const interpretation = [];
  interpretation.push({ title: '기본 기록 항목', detail: '제목, 날짜, URL, 도메인·IP 언급만 기록해도 재확인 속도가 빨라집니다.' });
  if (domains.length) interpretation.push({ title: '도메인 흔적', detail: `${domains.length}개의 도메인 언급을 찾았습니다.` });
  if (ips.length) interpretation.push({ title: 'IP 흔적', detail: `${ips.length}개의 IP 언급을 찾았습니다.` });
  if (!domains.length && !ips.length) interpretation.push({ title: '도메인·IP 직접 언급 없음', detail: '본문에는 직접적인 도메인·IP 표현이 많지 않을 수 있어 제목과 URL 위주로 먼저 기록하는 편이 좋습니다.' });
  return {
    source: { url, host: sourceUrl.hostname, title: title || sourceUrl.hostname, publishedAt: publishedAt || '', canonical: canonical || url },
    evidence: { excerpt: trimText(text, 220), domains, ips, telegrams, kakaos },
    interpretation
  };
}

function firstMatch(text = '', patterns = []) {
  for (const re of patterns) {
    const match = String(text || '').match(re);
    if (match && match[1]) return decodeHtmlEntities(match[1].trim());
  }
  return '';
}

function stripHtml(value = '') {
  return decodeHtmlEntities(String(value || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '));
}

function decodeHtmlEntities(value = '') {
  return String(value || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/\s+/g, ' ').trim();
}

function collectUniqueMatches(text = '', regex) {
  const values = new Set();
  for (const match of String(text || '').matchAll(regex)) {
    const item = String(match[0] || '').trim().replace(/[),.;]+$/, '');
    if (!item) continue;
    values.add(item);
  }
  return [...values];
}

function trimText(value = '', max = 220) {
  const text = String(value || '').trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}
