
(() => {
  function ready(fn){ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function createMobileMenu(){
    const header = document.querySelector('.site-header');
    const inner = header?.querySelector('.header-inner');
    const nav = header?.querySelector('.main-nav');
    if (!header || !inner || !nav || document.querySelector('.mobile-menu-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'mobile-menu-btn'; btn.setAttribute('aria-label','모바일 메뉴 열기'); btn.setAttribute('aria-expanded','false'); btn.innerHTML = '<span class="mobile-menu-btn__lines"></span>';
    inner.appendChild(btn);
    const overlay = document.createElement('div'); overlay.className = 'mobile-menu-overlay';
    const path = location.pathname.replace(/index\.html$/, '');
    const links = [
      { href:'/', label:'메인', sub:'전체 허브' },
      { href:'/analysis/', label:'분석기', sub:'배당·상태 해석' },
      { href:'/play-guides/', label:'가이드', sub:'카지노·미니게임' },
      { href:'/odds/', label:'텔레그램', sub:'모바일 연동' },
      { href:'https://t.me/kakacloud', label:'문의', sub:'바로 연결', external:true, accent:true }
    ];
    overlay.innerHTML = '<div class="mobile-menu-overlay__bg"></div><div class="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="모바일 메뉴"><div class="mobile-menu-head"><div><strong>88ST 빠른 이동</strong><small>모바일에서 필요한 구간을 바로 고를 수 있게 묶었습니다.</small></div><button class="mobile-menu-close" type="button" aria-label="닫기">✕</button></div><div class="mobile-menu-links"></div></div>';
    document.body.appendChild(overlay);
    const host = overlay.querySelector('.mobile-menu-links');
    links.forEach((item) => {
      const a = document.createElement('a'); a.href = item.href;
      if (item.external) { a.target = '_blank'; a.rel = 'noopener'; }
      const current = !item.external && (path === item.href || (item.href !== '/' && path.startsWith(item.href)));
      a.className = `${item.accent ? 'is-accent' : ''} ${current ? 'is-current' : ''}`.trim();
      a.innerHTML = `<span>${item.label}</span><small>${item.sub}</small>`; host.appendChild(a);
    });
    const open = () => { document.body.classList.add('open-menu'); btn.setAttribute('aria-expanded','true'); };
    const close = () => { document.body.classList.remove('open-menu'); btn.setAttribute('aria-expanded','false'); };
    btn.addEventListener('click', () => document.body.classList.contains('open-menu') ? close() : open());
    overlay.querySelector('.mobile-menu-close')?.addEventListener('click', close);
    overlay.querySelector('.mobile-menu-overlay__bg')?.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('open-menu')) close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 980) close(); });
  }
  function addHomeStrip(){
    if (document.body.classList.contains('guide-page')) return;
    if (!(location.pathname === '/' || location.pathname === '/index.html')) return;
    const heroCopy = document.querySelector('.hero-copy'); if (!heroCopy || heroCopy.querySelector('.open-home-strip')) return;
    const wrap = document.createElement('div'); wrap.className = 'open-home-strip';
    wrap.innerHTML = '<a class="open-home-strip__item" href="/analysis/"><span class="open-home-strip__eyebrow">FAST START</span><strong>바로 분석</strong><span>배당·상태 해석부터 빠르게 확인</span></a><a class="open-home-strip__item" href="/play-guides/casino-betting/"><span class="open-home-strip__eyebrow">CASINO</span><strong>배팅기법 보기</strong><span>기법 구조·예시·테스트를 한 번에 확인</span></a><a class="open-home-strip__item" href="/play-guides/minigame/"><span class="open-home-strip__eyebrow">MINIGAME</span><strong>미니게임 읽는 법</strong><span>룰·판정 기준·운용 실수 먼저 정리</span></a><a class="open-home-strip__item" href="/odds/"><span class="open-home-strip__eyebrow">TELEGRAM</span><strong>모바일 연동</strong><span>텔레그램 중심 흐름으로 즉시 이동</span></a>';
    const actions = heroCopy.querySelector('.hero-actions'); actions?.insertAdjacentElement('afterend', wrap);
    const note = document.createElement('div'); note.className = 'open-cta-note'; note.textContent = '처음 방문이면 뉴스 → 분석기 → 가이드 순서, 운영 기준을 먼저 잡고 싶다면 가이드 → 테스트 → 분석기 순서가 가장 안정적입니다.'; wrap.insertAdjacentElement('afterend', note);
  }
  function addExpandableText(){
    const selectors = ['.service-card p','.routine-card p','.guide-mini-card p','.link-card p','.strategy-card p','.mini-card p','.community-feature .section-desc','.news-summary','.news-why span'];
    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (el.dataset.openExpandedReady === '1') return;
      const text = (el.textContent || '').replace(/\s+/g,' ').trim(); el.dataset.openExpandedReady = '1'; if (text.length < 120) return;
      el.classList.add('open-collapsed'); el.setAttribute('data-lines', /news/.test(el.className) ? '3' : '4');
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'open-expand'; btn.textContent = '더 보기';
      btn.addEventListener('click', () => { const expanded = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!expanded)); btn.textContent = expanded ? '더 보기' : '접기'; if (expanded) el.classList.add('open-collapsed'); else el.classList.remove('open-collapsed'); });
      el.insertAdjacentElement('afterend', btn);
    });
  }
  function refineNewsToolbar(){ const tools = document.querySelector('.section-tools'); if (!tools || tools.querySelector('.open-meta-pill')) return; const pill = document.createElement('span'); pill.className = 'open-meta-pill'; pill.textContent = '한글 요약 · 영향 · 다음 행동'; tools.prepend(pill); }
  ready(() => { createMobileMenu(); addHomeStrip(); addExpandableText(); refineNewsToolbar(); });
})();
