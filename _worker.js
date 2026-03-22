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

      if (path === '/api/ops/ga/summary') {
        if (method === 'GET') return handleOpsGaSummary(request, env);
        return json({ ok: false, error: 'method_not_allowed' }, 405, corsHeaders(request));
      }

      if (path.startsWith('/api/')) {
        return json({ ok: false, error: 'not_found' }, 404, corsHeaders(request));
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



async function handleOpsGaSummary(request, env){
  const denied = requireAuth(request, env);
  if(denied) return denied;

  try{
    const propertyId = String(env.GA_PROPERTY_ID || '').trim();
    if(!propertyId) return json({ ok:false, error:'ga_not_configured', message:'Missing env: GA_PROPERTY_ID' }, 200, corsHeaders(request));

    const authMode = detectGaAuthMode(env);
    if(authMode === 'none'){
      return json({
        ok:false,
        error:'ga_auth_not_configured',
        message:'Missing GA credentials. Set GA service account or GA OAuth refresh token envs.',
        property_id: propertyId,
        auth_mode: 'none'
      }, 200, corsHeaders(request));
    }

    const batch = await gaBatchRunReports(env, propertyId, [
      {
        dateRanges:[{startDate:'28daysAgo', endDate:'yesterday'}],
        metrics:[
          {name:'activeUsers'},
          {name:'sessions'},
          {name:'screenPageViews'},
          {name:'eventCount'},
          {name:'engagementRate'},
          {name:'averageSessionDuration'}
        ]
      },
      {
        dateRanges:[{startDate:'28daysAgo', endDate:'yesterday'}],
        dimensions:[{name:'sessionDefaultChannelGroup'}],
        metrics:[{name:'sessions'},{name:'activeUsers'}],
        orderBys:[{metric:{metricName:'sessions'}, desc:true}],
        limit:8
      },
      {
        dateRanges:[{startDate:'28daysAgo', endDate:'yesterday'}],
        dimensions:[{name:'pagePath'}],
        metrics:[{name:'screenPageViews'},{name:'sessions'},{name:'activeUsers'},{name:'averageSessionDuration'}],
        dimensionFilter:{
          filter:{
            fieldName:'pagePath',
            stringFilter:{matchType:'BEGINS_WITH', value:'/'}
          }
        },
        orderBys:[{metric:{metricName:'screenPageViews'}, desc:true}],
        limit:10
      },
      {
        dateRanges:[{startDate:'28daysAgo', endDate:'yesterday'}],
        dimensions:[{name:'eventName'}],
        metrics:[{name:'eventCount'}],
        orderBys:[{metric:{metricName:'eventCount'}, desc:true}],
        limit:8
      },
      {
        dateRanges:[{startDate:'28daysAgo', endDate:'yesterday'}],
        dimensions:[{name:'deviceCategory'}],
        metrics:[{name:'sessions'}],
        orderBys:[{metric:{metricName:'sessions'}, desc:true}],
        limit:3
      }
    ]);

    const realtime = await gaRunRealtimeReport(env, propertyId, {
      metrics:[{name:'activeUsers'}]
    }).catch(function(err){
      return { error: String(err && err.message || err) };
    });

    const reports = Array.isArray(batch && batch.reports) ? batch.reports : [];
    const summaryReport = reports[0] || {};
    const channelsReport = reports[1] || {};
    const pagesReport = reports[2] || {};
    const eventsReport = reports[3] || {};
    const devicesReport = reports[4] || {};

    const summary = extractGaSummary(summaryReport);
    const channels = extractGaRows(channelsReport, ['sessionDefaultChannelGroup'], ['sessions','activeUsers']).map(function(r){
      return { channel: r.sessionDefaultChannelGroup || '(direct)', sessions: Number(r.sessions||0), activeUsers: Number(r.activeUsers||0) };
    });
    const pages = extractGaRows(pagesReport, ['pagePath'], ['screenPageViews','sessions','activeUsers','averageSessionDuration']).map(function(r){
      return {
        pagePath: r.pagePath || '/',
        screenPageViews: Number(r.screenPageViews||0),
        sessions: Number(r.sessions||0),
        activeUsers: Number(r.activeUsers||0),
        averageSessionDuration: Number(r.averageSessionDuration||0)
      };
    });
    const events = extractGaRows(eventsReport, ['eventName'], ['eventCount']).map(function(r){
      return { eventName: r.eventName || '(unknown)', eventCount: Number(r.eventCount||0) };
    });
    const devices = extractGaRows(devicesReport, ['deviceCategory'], ['sessions']).map(function(r){
      return { deviceCategory: r.deviceCategory || '(unknown)', sessions: Number(r.sessions||0) };
    });

    let realtimeActiveUsers = 0;
    if(realtime && !realtime.error){
      realtimeActiveUsers = extractGaRealtimeTotal(realtime, 'activeUsers');
    }

    return json({
      ok:true,
      property_id: propertyId,
      auth_mode: authMode,
      range: '28daysAgo → yesterday',
      summary: summary,
      acquisition: channels,
      top_pages: pages,
      top_events: events,
      devices: devices,
      realtime: {
        activeUsers: realtimeActiveUsers,
        window: '30m',
        error: realtime && realtime.error ? realtime.error : null
      },
      config: {
        property_id_set: !!propertyId,
        service_account_set: !!(String(env.GA_SERVICE_ACCOUNT_EMAIL || '').trim() && String(env.GA_SERVICE_ACCOUNT_PRIVATE_KEY || '').trim()),
        oauth_refresh_set: !!((String(env.GA_CLIENT_ID || '').trim() && String(env.GA_CLIENT_SECRET || '').trim() && String(env.GA_REFRESH_TOKEN || '').trim()) || (String(env.GA_USE_GSC_OAUTH || '').trim()==='1' && String(env.GSC_CLIENT_ID || '').trim() && String(env.GSC_CLIENT_SECRET || '').trim() && String(env.GSC_REFRESH_TOKEN || '').trim()))
      }
    }, 200, corsHeaders(request));
  }catch(e){
    return json({ ok:false, error:'ga_summary_failed', message: String(e && e.message || e) }, 500, corsHeaders(request));
  }
}

function detectGaAuthMode(env){
  const saEmail = String(env.GA_SERVICE_ACCOUNT_EMAIL || '').trim();
  const saKey = String(env.GA_SERVICE_ACCOUNT_PRIVATE_KEY || '').trim();
  if(saEmail && saKey) return 'service_account';
  const gaCid = String(env.GA_CLIENT_ID || '').trim();
  const gaSec = String(env.GA_CLIENT_SECRET || '').trim();
  const gaRef = String(env.GA_REFRESH_TOKEN || '').trim();
  if(gaCid && gaSec && gaRef) return 'oauth_refresh';
  if(String(env.GA_USE_GSC_OAUTH || '').trim() === '1'){
    const cid = String(env.GSC_CLIENT_ID || '').trim();
    const sec = String(env.GSC_CLIENT_SECRET || '').trim();
    const ref = String(env.GSC_REFRESH_TOKEN || '').trim();
    if(cid && sec && ref) return 'gsc_oauth_refresh';
  }
  return 'none';
}

async function gaAccessToken(env){
  const authMode = detectGaAuthMode(env);
  const scope = 'https://www.googleapis.com/auth/analytics.readonly';
  if(authMode === 'service_account'){
    return googleServiceAccountToken(String(env.GA_SERVICE_ACCOUNT_EMAIL || '').trim(), String(env.GA_SERVICE_ACCOUNT_PRIVATE_KEY || '').trim(), scope);
  }
  if(authMode === 'oauth_refresh'){
    return googleRefreshTokenToken(String(env.GA_CLIENT_ID || '').trim(), String(env.GA_CLIENT_SECRET || '').trim(), String(env.GA_REFRESH_TOKEN || '').trim());
  }
  if(authMode === 'gsc_oauth_refresh'){
    return googleRefreshTokenToken(String(env.GSC_CLIENT_ID || '').trim(), String(env.GSC_CLIENT_SECRET || '').trim(), String(env.GSC_REFRESH_TOKEN || '').trim());
  }
  throw new Error('GA auth env not configured');
}

async function gaBatchRunReports(env, propertyId, requests){
  const token = await gaAccessToken(env);
  const api = 'https://analyticsdata.googleapis.com/v1beta/properties/' + encodeURIComponent(propertyId) + ':batchRunReports';
  const res = await fetch(api, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + token },
    body: JSON.stringify({ requests: requests })
  });
  const j = await res.json().catch(function(){ return null; });
  if(!res.ok){
    const msg = (j && (j.error && (j.error.message || JSON.stringify(j.error)))) || ('HTTP_' + res.status);
    throw new Error('GA Data API batchRunReports error: ' + msg);
  }
  return j || {};
}

async function gaRunRealtimeReport(env, propertyId, body){
  const token = await gaAccessToken(env);
  const api = 'https://analyticsdata.googleapis.com/v1beta/properties/' + encodeURIComponent(propertyId) + ':runRealtimeReport';
  const res = await fetch(api, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + token },
    body: JSON.stringify(body || { metrics:[{name:'activeUsers'}] })
  });
  const j = await res.json().catch(function(){ return null; });
  if(!res.ok){
    const msg = (j && (j.error && (j.error.message || JSON.stringify(j.error)))) || ('HTTP_' + res.status);
    throw new Error('GA Data API runRealtimeReport error: ' + msg);
  }
  return j || {};
}

function extractGaSummary(report){
  const metrics = Array.isArray(report && report.metricHeaders) ? report.metricHeaders : [];
  const rows = Array.isArray(report && report.rows) ? report.rows : [];
  const first = rows[0] || {};
  const vals = Array.isArray(first && first.metricValues) ? first.metricValues : [];
  const out = {};
  for(let i=0; i<metrics.length; i++){
    const name = String(metrics[i] && metrics[i].name || 'metric_' + i);
    const raw = String(vals[i] && vals[i].value || '0');
    out[name] = Number(raw || 0);
  }
  return out;
}

function extractGaRows(report, dimensionNames, metricNames){
  const rows = Array.isArray(report && report.rows) ? report.rows : [];
  const out = [];
  for(const row of rows){
    const item = {};
    const dvals = Array.isArray(row && row.dimensionValues) ? row.dimensionValues : [];
    const mvals = Array.isArray(row && row.metricValues) ? row.metricValues : [];
    for(let i=0; i<dimensionNames.length; i++) item[dimensionNames[i]] = String(dvals[i] && dvals[i].value || '');
    for(let j=0; j<metricNames.length; j++) item[metricNames[j]] = String(mvals[j] && mvals[j].value || '0');
    out.push(item);
  }
  return out;
}

function extractGaRealtimeTotal(report, metricName){
  try{
    const headers = Array.isArray(report && report.metricHeaders) ? report.metricHeaders : [];
    const rows = Array.isArray(report && report.rows) ? report.rows : [];
    if(rows.length){
      const idx = headers.findIndex(function(h){ return String(h && h.name || '') === metricName; });
      if(idx >= 0){
        let total = 0;
        for(const row of rows){
          const mvals = Array.isArray(row && row.metricValues) ? row.metricValues : [];
          total += Number(mvals[idx] && mvals[idx].value || 0);
        }
        return total;
      }
    }
    const totals = Array.isArray(report && report.totals) ? report.totals : [];
    if(totals.length){
      const idx = headers.findIndex(function(h){ return String(h && h.name || '') === metricName; });
      const totalVals = Array.isArray(totals[0] && totals[0].metricValues) ? totals[0].metricValues : [];
      return Number(totalVals[idx] && totalVals[idx].value || 0);
    }
  }catch(e){}
  return 0;
}

function base64UrlEncode(input){
  let bytes;
  if(typeof input === 'string') bytes = new TextEncoder().encode(input);
  else if(input instanceof ArrayBuffer) bytes = new Uint8Array(input);
  else if(ArrayBuffer.isView(input)) bytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  else bytes = new Uint8Array([]);
  let binary = '';
  for(let i=0; i<bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToArrayBuffer(pem){
  const clean = String(pem || '').replace(/\\n/g, '\n').replace(/-----BEGIN PRIVATE KEY-----/g, '').replace(/-----END PRIVATE KEY-----/g, '').replace(/\s+/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for(let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function googleServiceAccountToken(email, privateKeyPem, scope){
  const now = Math.floor(Date.now()/1000);
  const header = { alg:'RS256', typ:'JWT' };
  const claim = {
    iss: email,
    scope: scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaim = base64UrlEncode(JSON.stringify(claim));
  const unsigned = encodedHeader + '.' + encodedClaim;
  const key = await crypto.subtle.importKey('pkcs8', pemToArrayBuffer(privateKeyPem), { name:'RSASSA-PKCS1-v1_5', hash:'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const assertion = unsigned + '.' + base64UrlEncode(sig);

  const form = new URLSearchParams();
  form.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  form.set('assertion', assertion);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:'POST',
    headers:{ 'content-type':'application/x-www-form-urlencoded' },
    body: form.toString()
  });
  const j = await res.json().catch(function(){ return null; });
  if(!res.ok){
    const msg = (j && (j.error_description || j.error || (j.error && j.error.message))) || ('HTTP_' + res.status);
    throw new Error('GA service account token error: ' + msg);
  }
  const tok = String(j && j.access_token || '').trim();
  if(!tok) throw new Error('GA service account token missing access_token');
  return tok;
}

async function googleRefreshTokenToken(clientId, clientSecret, refreshToken){
  const form = new URLSearchParams();
  form.set('client_id', clientId);
  form.set('client_secret', clientSecret);
  form.set('refresh_token', refreshToken);
  form.set('grant_type', 'refresh_token');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:'POST',
    headers:{ 'content-type':'application/x-www-form-urlencoded' },
    body: form.toString()
  });
  const j = await res.json().catch(function(){ return null; });
  if(!res.ok){
    const msg = (j && (j.error_description || j.error || (j.error && j.error.message))) || ('HTTP_' + res.status);
    throw new Error('GA OAuth token error: ' + msg);
  }
  const tok = String(j && j.access_token || '').trim();
  if(!tok) throw new Error('GA OAuth token missing access_token');
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
    return { whyImportant: why, impact: '라인업과 일정 변수 확인 후 분석기에서 공정·마진 구간까지 함께 확인하는 흐름이 좋습니다.', actionLabel: '축구 변수 확인하기', actionHref: '/analysis/' };
  }
  if (category === '농구') {
    const why = /back-to-back|rotation|rest|출전|결장/.test(hay)
      ? '농구는 백투백 일정, 로테이션, 핵심 자원 출전 여부가 시장 반응을 크게 움직입니다.'
      : '농구 뉴스는 일정 밀도와 로테이션 변화를 같이 볼 때 해석 가치가 높아집니다.';
    return { whyImportant: why, impact: '백투백·주전 변수 확인 후 분석기에서 상태 해설까지 같이 보는 편이 안전합니다.', actionLabel: '농구 분석 이어보기', actionHref: '/analysis/' };
  }
  if (category === '야구') {
    const why = /starter|pitcher|bullpen|선발|불펜/.test(hay)
      ? '야구는 선발 매치업과 불펜 소모 정보가 당일 흐름 해석에 핵심입니다.'
      : '야구 뉴스는 선발·불펜·타선 흐름을 함께 읽을 때 체감 가치가 커집니다.';
    return { whyImportant: why, impact: '선발과 불펜 소모 확인 뒤 경기별 비교 구간을 잡는 흐름이 좋습니다.', actionLabel: '야구 분석 이어보기', actionHref: '/analysis/' };
  }
  return { whyImportant: '핵심 이슈를 먼저 짧게 파악한 뒤 상세 맥락은 원문으로 확인하는 구조가 가장 효율적입니다.', impact: '브리핑 확인 후 관심 종목에 맞는 가이드나 분석기로 바로 이동할 수 있습니다.', actionLabel: '가이드 라이브러리', actionHref: '/play-guides/' };
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
      link: 'https://88st.cloud/analysis/',
      summary: '선발 라인업, 핵심 결장, 일정 간격, 최근 홈·원정 흐름을 우선 정리하면 경기 판단이 훨씬 선명해집니다.',
      publishedAt: generatedAt
    },
    {
      source: '레븐 브리핑',
      category: '농구',
      title: '농구 브리핑 연결 지연 시 체크할 핵심 변수',
      link: 'https://88st.cloud/analysis/',
      summary: '백투백 일정, 주전 출전 여부, 로테이션 변화, 최근 공격·수비 페이스를 먼저 보면 기본 판단 구조를 빠르게 세울 수 있습니다.',
      publishedAt: generatedAt
    },
    {
      source: '레븐 브리핑',
      category: '야구',
      title: '야구 브리핑 연결 지연 시 확인할 기본 흐름',
      link: 'https://88st.cloud/analysis/',
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
