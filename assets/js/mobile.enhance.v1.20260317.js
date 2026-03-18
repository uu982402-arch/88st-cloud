(() => {
  const GA_MEASUREMENT_ID = 'G-KWT87FBY6S';
  const GA_STREAM_ID = '13402610880';

  function initGA4() {
    try {
      if (window.__88stGA4Initialized) return;
      window.__88stGA4Initialized = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
      if (typeof window.track !== 'function') {
        window.track = function(name, params){
          try { window.gtag('event', name, params || {}); } catch (e) {}
        };
      }
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
      script.setAttribute('data-ga4', GA_MEASUREMENT_ID);
      document.head.appendChild(script);
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: true,
        page_title: document.title || '',
        page_location: location.href,
        page_path: location.pathname + location.search,
        anonymize_ip: true,
        allow_google_signals: true,
        stream_id: GA_STREAM_ID,
        content_group: (document.body && (document.body.getAttribute('data-post-category') || document.body.getAttribute('data-blog-list') || document.body.getAttribute('data-category'))) || ''
      });
    } catch (e) {}
  }

  initGA4();
})();

(() => {
  const path = location.pathname || '/';
  if (window.Telegram?.WebApp || /\/tg-match-entry\/?$/i.test(path)) return;

  const PROMO_OFFERS = [
    {
      title: '암호화폐 전용 놀이터',
      badge: 'TRON bet 회원 전용 이벤트 다수 진행 중',
      bullets: [
        '출석 / 충전 보너스 지급 이벤트',
        '주말 기프티콘 지급 이벤트',
        '슬롯 잭팟 이벤트',
        '카지노 0.8% / 슬롯 2.5% 콤프 지급 (1레벨)'
      ],
      primaryHref: '/cert/',
      primaryLabel: '공식 주소 바로가기',
      secondaryHref: 'https://t.me/kakacloud',
      secondaryLabel: '텔레그램 문의하기'
    },
    {
      title: '고액 안전 놀이터',
      badge: '픽스 bet 회원 전용 이벤트 다수 진행 중',
      bullets: [
        '신규가입 첫 충전 30% · 첫충 15% / 매충 10% 지급',
        '카지노 첫 충전 5% · 매충 5%',
        '정착 / 이사 지원금 이벤트',
        '콤프 최대 카지노 1.2% / 슬롯 4%'
      ],
      primaryHref: '/cert/',
      primaryLabel: '공식 주소 바로가기',
      secondaryHref: 'https://t.me/kakacloud',
      secondaryLabel: '텔레그램 문의하기'
    }
  ];

  function injectPromoStyles() {
    if (document.getElementById('autoPromoStyles')) return;
    const style = document.createElement('style');
    style.id = 'autoPromoStyles';
    style.textContent = `
      .auto-promo-zone{margin:26px 0 10px}
      .auto-promo-zone .container{padding-left:0;padding-right:0}
      .auto-promo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
      .auto-promo-card{position:relative;overflow:hidden;border-radius:28px;padding:28px 28px 24px;border:1px solid rgba(144,220,158,.26);background:linear-gradient(180deg,rgba(7,21,48,.95),rgba(5,16,33,.96));box-shadow:0 22px 50px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.04)}
      .auto-promo-card::before{content:'';position:absolute;inset:auto -12% -35% auto;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(103,150,255,.16),transparent 68%);pointer-events:none}
      .auto-promo-title{display:flex;align-items:center;gap:8px;margin:0 0 18px;font-size:1.95rem;line-height:1.12;font-weight:900;color:#f5f8ff;letter-spacing:-.03em}
      .auto-promo-title .mark{font-size:1.05rem;color:#f3c845}
      .auto-promo-badge{margin:0 0 16px;font-size:1rem;font-weight:800;color:#f5f8ff}
      .auto-promo-list{list-style:none;margin:0;padding:0;display:grid;gap:10px}
      .auto-promo-list li{position:relative;padding-left:18px;color:#d5ddf5;line-height:1.55}
      .auto-promo-list li::before{content:'';position:absolute;left:0;top:.6em;width:8px;height:8px;border-radius:50%;background:#7cf59a;box-shadow:0 0 0 4px rgba(124,245,154,.12)}
      .auto-promo-card.is-safe .auto-promo-list li::before{background:#f3c845;box-shadow:0 0 0 4px rgba(243,200,69,.12)}
      .auto-promo-actions{margin-top:18px;display:flex;flex-wrap:wrap;gap:12px}
      .auto-promo-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:16px;font-weight:800;text-decoration:none;transition:transform .16s ease, box-shadow .16s ease, background .16s ease}
      .auto-promo-btn:hover{transform:translateY(-1px)}
      .auto-promo-btn.primary{color:#081225;background:linear-gradient(135deg,#79a7ff,#7da6ff 55%,#8bb2ff);box-shadow:0 14px 34px rgba(114,153,255,.28)}
      .auto-promo-btn.secondary{color:#ecf2ff;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1)}
      .auto-promo-zone.is-article{margin:26px 0 28px}
      .auto-promo-zone.is-page{margin:18px 0 30px}
      @media (max-width: 980px){
        .auto-promo-zone .container{padding-left:16px;padding-right:16px}
        .auto-promo-grid{grid-template-columns:1fr}
        .auto-promo-card{padding:22px 20px 20px;border-radius:22px}
        .auto-promo-title{font-size:1.55rem}
        .auto-promo-badge{font-size:.98rem}
        .auto-promo-actions{display:grid;grid-template-columns:1fr 1fr}
        .auto-promo-btn{width:100%;min-height:46px;padding:0 14px;text-align:center}
      }
      @media (max-width: 640px){
        .auto-promo-zone{margin:20px 0 12px}
        .auto-promo-zone .container{padding-left:0;padding-right:0}
        .auto-promo-card{padding:18px 16px 18px;border-radius:20px}
        .auto-promo-title{font-size:1.34rem;margin-bottom:14px}
        .auto-promo-badge{font-size:.94rem;margin-bottom:12px}
        .auto-promo-list{gap:8px}
        .auto-promo-list li{font-size:.94rem;line-height:1.48}
        .auto-promo-actions{grid-template-columns:1fr;gap:10px}
      }
    `;
    document.head.appendChild(style);
  }

  function buildPromoSection(kind) {
    const section = document.createElement('section');
    section.className = `auto-promo-zone ${kind === 'article' ? 'is-article' : 'is-page'}`;
    section.setAttribute('aria-label', '추천 놀이터 안내');
    const container = document.createElement('div');
    container.className = 'container';
    const grid = document.createElement('div');
    grid.className = 'auto-promo-grid';

    PROMO_OFFERS.forEach((offer, idx) => {
      const article = document.createElement('article');
      article.className = `auto-promo-card${idx === 1 ? ' is-safe' : ''}`;
      const listMarkup = offer.bullets.map((item) => `<li>${item}</li>`).join('');
      article.innerHTML = `
        <h2 class="auto-promo-title"><span class="mark">✦</span><span>${offer.title}</span><span class="mark">✦</span></h2>
        <p class="auto-promo-badge">${offer.badge}</p>
        <ul class="auto-promo-list">${listMarkup}</ul>
        <div class="auto-promo-actions">
          <a class="auto-promo-btn primary" href="${offer.primaryHref}">${offer.primaryLabel}</a>
          <a class="auto-promo-btn secondary" href="${offer.secondaryHref}" target="_blank" rel="noopener">${offer.secondaryLabel}</a>
        </div>
      `;
      grid.appendChild(article);
    });

    container.appendChild(grid);
    section.appendChild(container);
    return section;
  }

  function insertAfter(target, node) {
    if (!target || !target.parentNode) return false;
    target.parentNode.insertBefore(node, target.nextSibling);
    return true;
  }

  function pickPromoAnchor(main) {
    if (!main) return null;
    const articleShell = main.querySelector('.article-shell');
    if (articleShell) {
      return {
        kind: 'article',
        target: articleShell.querySelector('.article-checks') || articleShell.querySelector('.article-intro') || articleShell.querySelector('.post-meta-strip') || articleShell.querySelector('h1')
      };
    }
    if (path === '/') {
      return {
        kind: 'page',
        target: main.querySelector('#categoryStart') || main.querySelector('#editorCuration') || main.querySelector('.section') || main.firstElementChild
      };
    }
    if (path.startsWith('/analysis/')) {
      return {
        kind: 'page',
        target: main.querySelector('.section .container') || main.querySelector('.section') || main.firstElementChild
      };
    }
    const pageHero = main.querySelector('.page-hero');
    if (pageHero) {
      return { kind: 'page', target: pageHero };
    }
    const firstSection = main.querySelector('.section');
    if (firstSection) {
      return { kind: 'page', target: firstSection };
    }
    return { kind: 'page', target: main.firstElementChild };
  }

  function hasExistingPromo(main) {
    return !!main.querySelector('.auto-promo-zone');
  }

  function mountInlinePromos() {
    const main = document.getElementById('mainContent') || document.querySelector('main');
    if (!main || hasExistingPromo(main)) return;
    const anchorInfo = pickPromoAnchor(main);
    if (!anchorInfo || !anchorInfo.target) return;
    injectPromoStyles();
    const section = buildPromoSection(anchorInfo.kind);
    insertAfter(anchorInfo.target, section);
  }

  function mountMobileDock() {
    if (window.innerWidth > 980) return;
    if (document.querySelector('.mobile-dock')) return;

    const items = [
      { href: '/analysis/', label: '분석', icon: '⌁' },
      { href: '/', label: '홈', icon: '⌂' },
      { href: '/play-guides/', label: '가이드', icon: '☷', accent: true },
      { href: 'https://t.me/kakacloud', label: '문의', icon: '✦', external: true }
    ];

    const dock = document.createElement('nav');
    dock.className = 'mobile-dock';
    dock.setAttribute('aria-label', '모바일 빠른 이동');
    const list = document.createElement('div');
    list.className = 'mobile-dock__list';

    items.forEach((item) => {
      const a = document.createElement('a');
      a.className = 'mobile-dock__item' + (item.accent ? ' is-accent' : '');
      a.href = item.href;
      if (!item.external && (path === item.href || (item.href !== '/' && path.startsWith(item.href)))) {
        a.className += ' is-active';
        a.setAttribute('aria-current', 'page');
      }
      if (item.external) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      a.innerHTML = `<b>${item.icon}</b><span>${item.label}</span>`;
      list.appendChild(a);
    });

    dock.appendChild(list);
    document.body.appendChild(dock);
    document.body.classList.add('has-mobile-dock');

    let dockSyncRaf = 0;
    function syncDockViewport() {
      const vv = window.visualViewport;
      let bottomGap = 0;
      if (vv) {
        bottomGap = Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height)));
      }
      document.documentElement.style.setProperty('--mobile-dock-bottom-gap', `${bottomGap}px`);
      dock.style.transform = 'translate3d(0,0,0)';
    }
    function scheduleDockSync() {
      if (dockSyncRaf) cancelAnimationFrame(dockSyncRaf);
      dockSyncRaf = requestAnimationFrame(syncDockViewport);
    }
    scheduleDockSync();
    window.addEventListener('scroll', scheduleDockSync, { passive: true });
    window.addEventListener('resize', scheduleDockSync, { passive: true });
    window.addEventListener('orientationchange', scheduleDockSync, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', scheduleDockSync, { passive: true });
      window.visualViewport.addEventListener('scroll', scheduleDockSync, { passive: true });
    }
  }

  mountInlinePromos();
  mountMobileDock();
})();
