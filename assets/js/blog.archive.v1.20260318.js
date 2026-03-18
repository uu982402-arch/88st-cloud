(function(){
  const DATA_URL = '/assets/data/posts.index.v1.20260318.json';
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => [...el.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const short = (s, n=86) => { const v = String(s ?? '').replace(/\s+/g,' ').trim(); return v.length > n ? v.slice(0, n-1).trim() + '…' : v; };
  function dateValue(p){ return Date.parse(p.published || 0) || 0; }
  function sortLatest(list){ return [...list].sort((a,b)=>dateValue(b)-dateValue(a) || (b.popular||0)-(a.popular||0)); }
  function sortPopular(list){ return [...list].sort((a,b)=>(b.popular||0)-(a.popular||0) || dateValue(b)-dateValue(a)); }
  function byCat(list, cat){ return list.filter(p => p.category === cat); }
  function streamCard(p){
    return `<article class="stream-card"><div class="stream-meta"><span>${esc(p.label)}</span><span>${esc(p.badge || '글')}</span><span>${esc(p.published || '')}</span></div><h3>${esc(p.title)}</h3><p>${esc(short(p.excerpt, 82))}</p><div class="stream-footer"><a class="text-link" href="${esc(p.path)}">글 읽기</a><span class="kicker">${esc((p.tag || p.label) + ' · ' + (p.readingMins || 2) + '분')}</span></div></article>`;
  }
  function popularItem(p, idx){
    return `<li><span class="popular-rank">${idx+1}</span><div><strong><a href="${esc(p.path)}">${esc(p.title)}</a></strong><p>${esc(short(p.excerpt, 70))}</p><span class="popular-meta">${esc((p.label || '') + ' · ' + (p.published || '') + ' · 인기 ' + (p.popular || 0))}</span></div></li>`;
  }
  function updateCard(label, title, desc, items){
    return `<article class="archive-card"><span class="kicker">${esc(label)}</span><h3>${esc(title)}</h3><p>${esc(desc)}</p><ul class="rail-list">${items.map(item => `<li><b>${esc(item.badge || '신규')}</b><span><a href="${esc(item.path)}">${esc(item.title)}</a></span></li>`).join('')}</ul></article>`;
  }
  function statCard(label, count, title, desc, href, newHref){
    return `<article class="category-card"><span class="kicker">${esc(label)}</span><div class="stat">${esc(count)}+</div><h3>${esc(title)}</h3><p>${esc(desc)}</p><div class="card-link-row"><a class="btn btn-primary btn-sm" href="${esc(href)}">허브 보기</a>${newHref ? `<a class="text-link" href="${esc(newHref)}">최신 글</a>` : ''}</div></article>`;
  }
  function latestCard(p){
    return `<article class="latest-card"><span class="kicker">${esc((p.badge || '최신') + ' · ' + (p.published || ''))}</span><h3>${esc(p.title)}</h3><p>${esc(short(p.excerpt, 78))}</p><div class="card-actions"><a class="btn btn-secondary btn-sm" href="${esc(p.path)}">글 보기</a><span class="text-link">${esc((p.tag || p.label) + ' · ' + (p.readingMins || 2) + '분')}</span></div></article>`;
  }
  function archiveCard(p){
    return `<article class="archive-card"><span class="kicker">${esc((p.badge || p.label) + ' · ' + (p.published || ''))}</span><h3>${esc(p.title)}</h3><p>${esc(short(p.excerpt, 92))}</p><div class="meta-line"><span class="meta-pill">${esc(p.label)}</span><span class="meta-pill">${esc(p.tag || '글')}</span><span class="meta-pill">${esc((p.readingMins || 2) + '분')}</span></div><div class="card-actions"><a class="btn btn-secondary btn-sm" href="${esc(p.path)}">상세 보기</a></div></article>`;
  }
  function matchesTag(post, needles){
    const hay = [post.tag, post.badge, post.title, post.excerpt, post.section].join(' ').toLowerCase();
    return needles.some(n => hay.includes(n));
  }
  function pickByNeedle(posts, needles, used){
    const found = posts.find(p => !used.has(p.path) && matchesTag(p, needles));
    if(found) used.add(found.path);
    return found || null;
  }
  function pickFallback(posts, used){
    const found = posts.find(p => !used.has(p.path));
    if(found) used.add(found.path);
    return found || null;
  }
  function curationCard(cat, label, desc, hub, posts){
    const ordered = sortPopular(posts);
    const used = new Set();
    const start = pickByNeedle(ordered, ['기초','기본','입문','시작','루트','약관'], used) || pickFallback(ordered, used);
    const operation = pickByNeedle(ordered, ['운영','세션','단위','자본','손실','템포','분할','중단','수익잠금'], used) || pickFallback(ordered, used);
    const caution = pickByNeedle(ordered, ['주의','실수','착각','경고','최대베팅','틸트','오토스핀','사이드베트','노디파짓'], used) || pickFallback(ordered, used);
    const expand = pickByNeedle(sortLatest(posts), ['확장','최신','무료회전','vip','라이브','배수','리베이트','기록'], used) || pickFallback(sortLatest(posts), used);
    const items = [
      ['시작 글', start],
      ['운영 글', operation],
      ['주의 글', caution],
      ['확장 글', expand]
    ].filter(([, item]) => !!item);
    return `<article class="curation-card curation-${esc(cat)}"><div class="curation-top"><span class="kicker">${esc(label)}</span><span class="curation-count">${esc(posts.length)}개 글</span></div><h3>${esc(label)} 대표글 큐레이션</h3><p>${esc(desc)}</p><ul class="curation-list">${items.map(([name, item]) => `<li><span class="curation-label">${esc(name)}</span><div><a href="${esc(item.path)}">${esc(item.title)}</a><small>${esc((item.tag || item.badge || label) + ' · ' + (item.published || ''))}</small></div></li>`).join('')}</ul><div class="card-link-row"><a class="btn btn-secondary btn-sm" href="${esc(hub)}">${esc(label)} 허브</a><a class="text-link" href="${esc(hub + 'archive/').replace('//archive/','/archive/')}">목록 보기</a></div></article>`;
  }
  function renderHome(posts){
    const latest = qs('#latestPostsGrid');
    if (latest) latest.innerHTML = sortLatest(posts).slice(0, 16).map(streamCard).join('');
    const popular = qs('#popularListHome');
    if (popular) popular.innerHTML = sortPopular(posts.filter(p => p.category !== 'guide')).slice(0, 10).map(popularItem).join('');
    const updates = qs('#freshByTopicGrid');
    if (updates) {
      updates.innerHTML = [
        updateCard('CASINO','카지노 최근 업데이트','바카라·룰렛·블랙잭·라이브 주제를 겹치지 않게 분리해 최신 글이 자동 반영됩니다.', sortLatest(byCat(posts,'casino')).slice(0,4)),
        updateCard('SLOT','슬롯 최근 업데이트','RTP·구조·기능·세션 운영 글이 중복 없이 확장되도록 최신순으로 묶습니다.', sortLatest(byCat(posts,'slot')).slice(0,4)),
        updateCard('BONUS','보너스 최근 업데이트','약관·제한·기한·출금 체크처럼 성격이 다른 글을 분리해 연결합니다.', sortLatest(byCat(posts,'bonus')).slice(0,4)),
        updateCard('STRATEGY','전략 최근 업데이트','자본·중단·틸트·기록처럼 운영 글이 겹치지 않게 최신 글을 이어줍니다.', sortLatest(byCat(posts,'strategy')).slice(0,4))
      ].join('');
    }
    const stats = qs('#categoryStartGrid');
    if (stats) {
      const latestByCat = cat => sortLatest(byCat(posts, cat))[0]?.path || '#';
      stats.innerHTML = [
        statCard('CASINO', byCat(posts,'casino').length, '카지노 글 모음', '바카라·룰렛·블랙잭·라이브 글을 겹치지 않는 주제로 더 촘촘히 확장했습니다.', '/casino/', latestByCat('casino')),
        statCard('SLOT', byCat(posts,'slot').length, '슬롯 글 모음', 'RTP, 구조, 기능, 오토스핀, 세션 운영 글을 블로그 아카이브형으로 늘렸습니다.', '/slot/', latestByCat('slot')),
        statCard('BONUS', byCat(posts,'bonus').length, '보너스 체크', '약관, 최대 베팅, 만료, 출금 체크 등 서로 다른 보너스 포인트를 분리했습니다.', '/bonus/', latestByCat('bonus')),
        statCard('STRATEGY', byCat(posts,'strategy').length, '전략·운영', '단위 설정, 틸트, 중단 루틴, 예산 잠금, 기록 글까지 운영 기준을 넓혔습니다.', '/strategy/', latestByCat('strategy')),
        statCard('GUIDE', byCat(posts,'guide').length, '상세 가이드 아카이브', '배팅기법·미니게임 상세 가이드는 유지하고 블로그형 카테고리와 함께 읽습니다.', '/play-guides/', '/play-guides/casino-betting/'),
        `<article class="category-card"><span class="kicker">AUTO</span><div class="stat">JSON</div><h3>최신글은 자동 정렬됩니다</h3><p>새 글을 추가한 뒤 posts.index 데이터에 1줄만 넣으면, 메인의 최신글·인기글·카테고리 최근 업데이트가 같이 바뀝니다.</p><div class="card-link-row"><a class="btn btn-primary btn-sm" href="#latestFlow">작동 방식 보기</a><a class="text-link" href="/archive/">전체 글 아카이브</a></div></article>`
      ].join('');
    }
    const curation = qs('#editorCurationGrid');
    if (curation) {
      curation.innerHTML = [
        curationCard('casino', '카지노', '바카라·룰렛·블랙잭·라이브에서 먼저 읽을 글과 운영·주의·확장 글을 분리했습니다.', '/casino/', byCat(posts,'casino')),
        curationCard('slot', '슬롯', 'RTP·변동성·기능·세션 운영을 한 번에 훑기 좋게 대표글을 따로 묶었습니다.', '/slot/', byCat(posts,'slot')),
        curationCard('bonus', '보너스', '약관·최대 베팅·출금·VIP처럼 서로 성격이 다른 보너스 글을 따로 고릅니다.', '/bonus/', byCat(posts,'bonus')),
        curationCard('strategy', '전략', '단위 설정·손절·틸트·기록처럼 실제 운영 기준이 흔들리지 않도록 묶었습니다.', '/strategy/', byCat(posts,'strategy'))
      ].join('');
    }
  }
  function renderHub(posts){
    const hub = document.body.dataset.blogHub;
    if (!hub) return;
    const list = sortLatest(byCat(posts, hub));
    const latest = qs('.js-hub-latest');
    if (latest) latest.innerHTML = list.slice(0,6).map(latestCard).join('');
    const archive = qs('.js-hub-archive');
    if (archive) archive.innerHTML = list.map(archiveCard).join('');
    const popular = qs('.js-hub-popular');
    if (popular) {
      const pop = sortPopular(list).slice(0,4);
      popular.innerHTML = pop.map((p, i) => `<li><b>TOP ${i+1}</b><span><a href="${esc(p.path)}">${esc(p.title)}</a></span></li>`).join('');
    }
    qsa('[data-count-category]').forEach(el => {
      const c = el.getAttribute('data-count-category');
      el.textContent = String(byCat(posts, c).length) + '+';
    });
  }
  fetch(DATA_URL, {cache:'no-store'})
    .then(r => r.ok ? r.json() : Promise.reject(new Error('posts data missing')))
    .then(data => {
      const posts = Array.isArray(data.posts) ? data.posts : [];
      renderHome(posts);
      renderHub(posts);
      const updated = qs('#blogDataUpdatedAt');
      if (updated && data.updatedAt) updated.textContent = `데이터 기준 ${data.updatedAt}`;
    })
    .catch(err => { console.warn('[blog-archive] render skipped', err); });
})();
