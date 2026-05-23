(() => {
  const isHome = document.body.classList.contains('v58-dashboard-home');
  const qsa = (s, r=document) => [...r.querySelectorAll(s)];
  const setTab = (id) => {
    const views = qsa('[data-v58-view]');
    if (!views.length) return false;
    views.forEach(v => { const on = v.dataset.v58View === id; v.hidden = !on; v.classList.toggle('is-active', on); });
    qsa('[data-v58-tab-trigger]').forEach(b => { const on = b.dataset.v58TabTrigger === id; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    const input = document.querySelector('[data-v58-live-search]');
    if (input) input.dispatchEvent(new Event('input'));
    history.replaceState(null, '', id === 'home' ? location.pathname : '#'+id);
    return true;
  };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-v58-tab-trigger]');
    if (btn && isHome) { e.preventDefault(); setTab(btn.dataset.v58TabTrigger); }
    const card = e.target.closest('[data-v58-card], .v58-provider-card, .v58-tool-card, .v58-guide-card, .v58-support-card');
    if (card) {
      const r = document.createElement('span'); r.className='v58-ripple'; const rect=card.getBoundingClientRect(); const size=Math.max(rect.width,rect.height); r.style.width=r.style.height=size+'px'; r.style.left=(e.clientX-rect.left-size/2)+'px'; r.style.top=(e.clientY-rect.top-size/2)+'px'; card.appendChild(r); setTimeout(()=>r.remove(),620);
    }
  });
  const input = document.querySelector('[data-v58-live-search]');
  if (input) input.addEventListener('input', () => {
    const active = document.querySelector('[data-v58-view].is-active') || document;
    const q = input.value.trim().toLowerCase(); let visible = 0;
    qsa('.v58-filter-card', active).forEach(card => { const hay=(card.dataset.name || card.textContent || '').toLowerCase(); const hit=!q || hay.includes(q); card.hidden=!hit; if(hit) visible++; });
    const empty = document.querySelector('[data-v58-empty]'); if (empty) empty.hidden = !q || visible > 0;
  });
  if (isHome) {
    const initial = (location.hash || '#home').replace('#','');
    if (['home','providers','tools','guides','support'].includes(initial)) setTab(initial);
  } else {
    document.body.classList.add('v58-enhanced');
    if (!document.querySelector('.v58-bottom-nav')) {
      const map=[['/','홈','메인'],['/blog/','블로그','블로그'],['/tools/','도구','도구'],['/guaranteed/','보증','보증업체'],['/consult/','센터','고객센터']];
      const nav=document.createElement('nav'); nav.className='v58-bottom-nav'; nav.setAttribute('aria-label','모바일 하단 내비게이션');
      nav.innerHTML=map.map(([href,short,label])=>'<a href="'+href+'" class="'+(location.pathname===href?'is-active':'')+'"><span>'+short+'</span><small>'+label+'</small></a>').join('');
      document.body.appendChild(nav);
    }
  }
  qsa('img').forEach(img => {
    img.addEventListener('error', () => { img.style.display='none'; const p=img.parentElement; if(p){ p.classList.add('v58-image-fallback'); if(!p.dataset.v58Fallback) p.dataset.v58Fallback=(img.alt||'88ST').slice(0,3); } });
  });
})();