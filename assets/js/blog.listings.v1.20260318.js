(function(){
  const DATA_URL = '/assets/data/posts.index.v1.20260318.json';
  const qs = (s, el=document) => el.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = (v) => String(v ?? '').toLowerCase().replace(/\s+/g,' ').trim();
  const short = (s, n=88) => { const v = String(s ?? '').replace(/\s+/g,' ').trim(); return v.length > n ? v.slice(0, n-1).trim() + '…' : v; };
  const categoryMap = {
    all: {label:'전체 글', hub:'/archive/', archive:'/archive/'},
    casino: {label:'카지노', hub:'/blog/', archive:'/blog/'},
    slot: {label:'슬롯', hub:'/blog/', archive:'/blog/'},
    bonus: {label:'보너스', hub:'/tools/', archive:'/tools/'},
    strategy: {label:'전략', hub:'/blog/', archive:'/blog/'},
    analysis: {label:'분석', hub:'/', archive:'/blog/'},
    news: {label:'뉴스', hub:'/blog/', archive:'/blog/'},
    guide: {label:'가이드', hub:'/blog/', archive:'/blog/'}
  };
  function dateValue(p){ return Date.parse(p.published || 0) || 0; }
  function latest(list){ return [...list].sort((a,b)=>dateValue(b)-dateValue(a) || (b.popular||0)-(a.popular||0)); }
  function popular(list){ return [...list].sort((a,b)=>(b.popular||0)-(a.popular||0) || dateValue(b)-dateValue(a)); }
  function renderItem(p, idx){
    return `<article class="listing-item"><div class="listing-item-top"><div><div class="stream-meta"><span>${esc(p.label || categoryMap[p.category]?.label || '글')}</span><span>${esc(p.badge || '최신')}</span></div><h2>${idx+1}. <a href="${esc(p.path)}">${esc(p.title)}</a></h2></div><span class="listing-chip">${esc(p.readingMins || 2)}분 읽기</span></div><p>${esc(p.seoDescription || p.excerpt || '')}</p><div class="listing-meta"><span>발행 ${esc(p.published || '-')}</span><span>업데이트 ${esc(p.updated || p.published || '-')}</span><span>${esc(p.tag || p.label || '글')}</span><span>인기 ${esc(p.popular || 0)}</span></div><div class="listing-actions"><a class="btn btn-secondary btn-sm" href="${esc(p.path)}">글 읽기</a><a class="text-link" href="${esc(categoryMap[p.category]?.hub || '/archive/')}">${esc(categoryMap[p.category]?.label || '카테고리')} 허브</a></div></article>`;
  }
  function renderQuickItem(p, idx){
    return `<a class="quickscan-item" href="${esc(p.path)}"><span class="quickscan-rank">${idx+1}</span><span class="quickscan-copy"><b>${esc(p.title)}</b><small>${esc((categoryMap[p.category]?.label || p.label || '글') + ' · ' + (p.tag || p.badge || '기본') + ' · ' + (p.published || ''))}</small></span></a>`;
  }
  function buildControls(root, fixedCategory, initialOrder){
    const host = document.createElement('section');
    host.className = 'listing-toolbox';
    host.innerHTML = `<div class="listing-toolbox-head"><div><span class="kicker">빠른 스캔 도구</span><h2>제목·키워드 검색과 한 줄 스캔</h2><p>썸네일 없는 목록을 더 빨리 훑을 수 있도록 검색창, 빠른 정렬, 카테고리 점프를 한 번에 모았습니다.</p></div></div><div class="listing-toolbar"><label class="listing-search"><span>검색</span><input class="js-list-search" type="search" placeholder="제목·요약·태그 검색" autocomplete="off" inputmode="search"></label><div class="listing-order-row"><button class="listing-pill js-order-btn${initialOrder==='latest' ? ' is-active' : ''}" data-order="latest" type="button">최신순</button><button class="listing-pill js-order-btn${initialOrder==='popular' ? ' is-active' : ''}" data-order="popular" type="button">인기순</button></div></div><div class="listing-jumps">${['all','casino','slot','bonus','strategy','analysis','news','guide'].map(cat => {
      const info = categoryMap[cat];
      const href = fixedCategory && fixedCategory !== 'all' && cat === fixedCategory ? (info.archive || info.hub) : (info.archive || info.hub);
      const active = cat === (fixedCategory || 'all') ? ' is-active' : '';
      return `<a class="listing-jump${active}" href="${esc(href)}">${esc(info.label)}</a>`;
    }).join('')}</div><div class="quickscan-shell"><div class="section-head section-head-tight"><div><h3>한 줄 스캔</h3><p>현재 조건에 맞는 글을 짧은 제목·태그 중심으로 먼저 훑습니다.</p></div><span class="listing-chip js-quickscan-count">0개</span></div><div class="quickscan-grid js-quickscan-grid"></div></div>`;
    root.prepend(host);
  }
  fetch(DATA_URL, {cache:'no-store'})
    .then(r => r.ok ? r.json() : Promise.reject(new Error('posts data missing')))
    .then(data => {
      const root = document.body;
      const initialListType = root.dataset.blogList || 'all';
      let currentOrder = root.dataset.blogOrder || 'latest';
      const fixedCategory = initialListType === 'all' ? 'all' : initialListType;
      let query = '';
      let posts = Array.isArray(data.posts) ? data.posts : [];
      const shell = qs('.listing-shell');
      if (shell) buildControls(shell, fixedCategory, currentOrder);
      const items = qs('.js-listing-items');
      const summary = qs('.js-list-summary');
      const asideList = qs('.js-list-aside');
      const empty = qs('.js-list-empty');
      const searchInput = qs('.js-list-search');
      const quickGrid = qs('.js-quickscan-grid');
      const quickCount = qs('.js-quickscan-count');
      const orderButtons = [...document.querySelectorAll('.js-order-btn')];

      function filteredPosts(){
        let out = posts;
        if (fixedCategory !== 'all') out = out.filter(p => p.category === fixedCategory);
        if (query) {
          out = out.filter(p => norm([p.title, p.excerpt, p.tag, p.badge, p.keywords, p.label, p.seoDescription].join(' ')).includes(query));
        }
        out = currentOrder === 'popular' ? popular(out) : latest(out);
        return out;
      }
      function render(){
        const visible = filteredPosts();
        if(items) items.innerHTML = visible.map(renderItem).join('');
        if(summary) {
          const cats = [...new Set(visible.map(p=>p.category))].map(c => categoryMap[c]?.label || c).join(' · ');
          summary.innerHTML = `<span class="listing-chip">총 ${visible.length}개 글</span><span class="listing-chip">정렬 ${currentOrder === 'popular' ? '인기순' : '최신순'}</span><span class="listing-chip">범위 ${esc(cats || categoryMap[fixedCategory]?.label || '전체')}</span><span class="listing-chip">검색 ${esc(query || '전체')}</span><span class="listing-chip">데이터 기준 ${esc(data.updatedAt || '')}</span>`;
        }
        if(asideList){
          asideList.innerHTML = visible.slice(0,5).map((p,idx)=>`<li><b>TOP ${idx+1}</b><span><a href="${esc(p.path)}">${esc(p.title)}</a></span></li>`).join('');
        }
        if(quickGrid){
          quickGrid.innerHTML = visible.slice(0,18).map(renderQuickItem).join('');
        }
        if(quickCount) quickCount.textContent = `${visible.length}개`;
        if(empty) empty.style.display = visible.length ? 'none' : 'block';
      }
      if(searchInput){
        searchInput.addEventListener('input', e => {
          query = norm(e.target.value);
          render();
        });
      }
      orderButtons.forEach(btn => btn.addEventListener('click', () => {
        currentOrder = btn.dataset.order || 'latest';
        orderButtons.forEach(b => b.classList.toggle('is-active', b === btn));
        render();
      }));
      render();
    })
    .catch(err => {
      console.warn('[blog-listings] failed', err);
      const empty = qs('.js-list-empty');
      if(empty) empty.style.display = 'block';
    });
})();
