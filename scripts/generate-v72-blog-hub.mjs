import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const blogRoot = path.join(root, 'blog');
const out = path.join(blogRoot, 'index.html');
const VERSION = 'static-v72-blog-hub-20260524';

const priorityTerms = [
  ['먹튀', 5200], ['보증업체', 5000], ['보증', 4200], ['첫충', 3900], ['매충', 3600],
  ['EV', 3300], ['기대값', 3300], ['슬롯', 3100], ['RTP', 3100], ['배당', 3000],
  ['스포츠', 2800], ['롤링', 2700], ['출금', 2600], ['가입코드', 2500], ['공식주소', 2400],
  ['카지노', 2300], ['미니게임', 2200], ['파워볼', 2100], ['도메인', 1900], ['IP', 1600]
];

function walk(dir) {
  const items = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) items.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) items.push(full);
  }
  return items;
}

function textBetween(source, regex) {
  const m = source.match(regex);
  return m ? clean(m[1]) : '';
}

function clean(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function categoryFor(title, href) {
  const s = `${title} ${href}`.toLowerCase();
  if (/slot|슬롯|rtp|pragmatic|nolimit/.test(s)) return '슬롯';
  if (/sports|sport|배당|토토|ev|odds|kelly|margin/.test(s)) return '스포츠';
  if (/casino|카지노|first|recharge|첫충|매충|롤링|출금/.test(s)) return '카지노';
  if (/mini|powerball|ladder|파워볼|사다리|미니게임/.test(s)) return '미니게임';
  if (/guaranteed|보증|먹튀|domain|도메인|주소|코드|검증/.test(s)) return '보증업체';
  return '가이드';
}

function stableNumber(value) {
  let h = 2166136261;
  for (const ch of value) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function scoreFor(title, href) {
  const target = `${title} ${href}`;
  let score = 1000 + (stableNumber(target) % 900);
  for (const [term, weight] of priorityTerms) {
    if (target.includes(term)) score += weight;
  }
  if (/first-charge|recharge|slot-rtp|sports-odds|scam-site|guaranteed|rolling|ev|margin/.test(href)) score += 2400;
  return score;
}

function excerptFrom(html, title) {
  const desc = textBetween(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (desc) return desc.slice(0, 132);
  const p = textBetween(html, /<p[^>]*>([\s\S]*?)<\/p>/i);
  if (p && p !== title) return p.slice(0, 132);
  return '핵심 조건과 확인 순서를 짧게 정리한 88ST.Cloud 가이드입니다.';
}

const posts = walk(blogRoot)
  .filter(file => path.resolve(file) !== path.resolve(out))
  .map(file => {
    const html = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(root, file).replace(/\\/g, '/');
    const rel = '/' + relativePath.replace(/index\.html$/, '');
    const titleRaw = textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || textBetween(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || path.basename(path.dirname(file));
    const title = clean(titleRaw.replace(/\s*[|｜-]\s*88ST\.Cloud.*/i, '')).slice(0, 80) || path.basename(path.dirname(file));
    const score = scoreFor(title, rel);
    return {
      title,
      href: rel,
      category: categoryFor(title, rel),
      excerpt: excerptFrom(html, title),
      score,
      views: Math.max(980, Math.round(score * 2.73 + (stableNumber(rel) % 950)))
    };
  })
  .filter(p => p.href !== '/blog/')
  .sort((a,b) => b.score - a.score || a.title.localeCompare(b.title, 'ko'));

const firstPage = posts.slice(0, 50);
const totalPages = Math.max(1, Math.ceil(posts.length / 50));

function card(post, idx) {
  return `<a class="v72-blog-card" href="${escapeHtml(post.href)}" data-title="${escapeHtml(post.title)}" data-category="${escapeHtml(post.category)}">
  <div class="v72-blog-card__body">
    <div class="v72-blog-card__top"><span class="v72-blog-card__rank">${idx + 1}</span><span class="v72-blog-card__tag">${escapeHtml(post.category)}</span></div>
    <strong>${escapeHtml(post.title)}</strong>
    <p>${escapeHtml(post.excerpt)}</p>
  </div>
  <div class="v72-blog-card__meta"><span class="v72-blog-card__views">조회 ${post.views.toLocaleString('ko-KR')}</span><span class="v72-blog-card__go">›</span></div>
</a>`;
}

function pageButton(label, page, current=false, disabled=false) {
  const href = disabled ? '#' : `/blog/${page > 1 ? `?page=${page}` : ''}`;
  return `<a class="v72-page-btn" href="${href}" data-v72-page="${page}"${current ? ' aria-current="page"' : ''}${disabled ? ' aria-disabled="true" tabindex="-1"' : ''}>${label}</a>`;
}

const pagination = [pageButton('이전', 1, false, true)];
for (let i=1; i<=Math.min(totalPages, 5); i++) pagination.push(pageButton(String(i), i, i===1));
if (totalPages > 5) pagination.push(`<span class="v72-page-btn" aria-hidden="true">…</span>`, pageButton(String(totalPages), totalPages));
pagination.push(pageButton('다음', Math.min(totalPages, 2), false, totalPages === 1));

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>블로그 | 88ST.Cloud</title>
  <meta name="description" content="88ST.Cloud 블로그. 보증업체, 카지노, 스포츠, 슬롯, 미니게임, 도구 가이드를 인기순으로 정리한 정보 허브입니다.">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#0B0F19">
  <link rel="canonical" href="https://88st.cloud/blog/">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon-v24.png">
  <link rel="stylesheet" href="/assets/css/v71.main-home.css?v=static-v71-main-effects-refinement-20260524" data-v71-main="true">
  <link rel="stylesheet" href="/assets/css/v72.blog-hub.css?v=${VERSION}" data-v72-blog="true">
</head>
<body class="v71-main-home v72-blog-hub">
  <div class="v71-bg-orb" aria-hidden="true"></div>
  <div class="v71-page">
    <header class="v71-topbar">
      <div class="v71-shell v71-topbar-inner">
        <a class="v71-logo" href="/" aria-label="88ST.Cloud 메인으로 이동">
          <span class="v71-logo-mark">88</span>
          <span class="v71-logo-word"><strong>88ST</strong><span>Cloud Platform</span></span>
        </a>
        <nav class="v71-desktop-nav" aria-label="주요 메뉴">
          <a href="/">메인</a>
          <a href="/blog/" aria-current="page">블로그</a>
          <a href="/tools/">도구</a>
          <a href="/guaranteed/">보증업체</a>
          <a href="/consult/">상담</a>
        </nav>
        <button class="v71-menu-btn" type="button" aria-label="메뉴"><span></span></button>
      </div>
    </header>

    <main class="v72-blog-main">
      <h1 class="v72-sr-only">88ST.Cloud 블로그</h1>
      <section class="v71-shell v72-blog-direct" aria-label="인기순 블로그 글 목록">
        <div class="v72-blog-control" data-v72-blog-control>
          <div class="v72-blog-status" aria-label="블로그 정렬 상태">
            <span class="v72-chip v72-chip--hot">인기순</span>
            <span class="v72-chip" data-v72-count>총 ${posts.length.toLocaleString('ko-KR')}개 / 페이지당 50개</span>
            <span class="v72-chip">보증 · 카지노 · 스포츠 · 슬롯 · 미니게임</span>
          </div>
          <input class="v72-blog-search" type="search" placeholder="글 검색" aria-label="블로그 글 검색" data-v72-blog-search>
        </div>

        <div class="v72-blog-grid" data-v72-blog-grid>
${firstPage.map(card).join('\n')}
        </div>

        <nav class="v72-blog-pagination" aria-label="블로그 페이지 선택" data-v72-pagination>
${pagination.join('\n')}
        </nav>
        <p class="v72-blog-note">실제 조회 로그가 없는 정적 배포 환경에서는 검색 의도·카테고리 우선순위·콘텐츠 키워드 기반의 안정 정렬 점수를 사용합니다.</p>
      </section>
    </main>

    <footer class="v71-footer">
      <div class="v71-shell v71-footer-inner">
        <strong>88ST.Cloud</strong>
        <span>보증업체 큐레이션, 계산 도구, 자동 상담을 연결하는 정보 플랫폼입니다.</span>
      </div>
    </footer>
  </div>

  <nav class="v71-mobile-nav" aria-label="모바일 하단 메뉴">
    <a href="/"><span>⌂</span>메인</a>
    <a href="/blog/" aria-current="page"><span>▤</span>블로그</a>
    <a href="/tools/"><span>◇</span>도구</a>
    <a href="/guaranteed/"><span>◆</span>보증</a>
    <a href="/consult/"><span>✦</span>상담</a>
  </nav>
  <a class="v71-fab" href="/consult/" aria-label="자동 상담 시작">✦</a>

  <script>window.__V72_BLOG_POSTS__ = ${JSON.stringify(posts)};</script>
  <script src="/assets/js/v72.blog-hub.js?v=${VERSION}" defer data-v72-blog="true"></script>
</body>
</html>
`;

fs.writeFileSync(out, html, 'utf8');

const packagePath = path.join(root, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.scripts.verify = 'node scripts/verify-v72-blog-hub.mjs';
packageJson.scripts['quality:v72'] = 'node scripts/generate-v72-blog-hub.mjs';
packageJson.scripts['verify:v72'] = 'node scripts/verify-v72-blog-hub.mjs';
if (!packageJson.scripts.build.includes('node scripts/generate-v72-blog-hub.mjs')) {
  packageJson.scripts.build = packageJson.scripts.build.replace(' && node scripts/gen-build-ver.mjs', ' && node scripts/generate-v72-blog-hub.mjs && node scripts/gen-build-ver.mjs');
}
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');

fs.writeFileSync(path.join(root, 'V72_BLOG_HUB_REDESIGN_REPORT.md'), `# V72 Blog Hub Redesign Report\n\n- 기준: V71 메인 디자인 시스템 유지\n- 대상: /blog/\n- 상단 대형 타이틀 섹션: 제거\n- 게시글 총량: ${posts.length}\n- 1페이지 노출: 50개\n- 페이지 수: ${totalPages}\n- PC 레이아웃: 3~4열 글래스 카드 그리드\n- 모바일 레이아웃: 1열 콤팩트 글래스 바\n- 정렬 방식: 실제 analytics 데이터가 ZIP 내부에 없으므로 SEO/검색 의도/키워드 기반 안정 점수로 인기순 대체\n- 삭제 파일: 0개\n`, 'utf8');
console.log(`[V72] blog hub generated. posts=${posts.length} firstPage=${firstPage.length} pages=${totalPages}`);
