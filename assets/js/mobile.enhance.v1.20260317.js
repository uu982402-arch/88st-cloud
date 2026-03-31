(() => {
  const path = location.pathname || '/';
  if (window.Telegram?.WebApp || /\/tg-match-entry\/?$/i.test(path) || /\/play-guides\/site-check-guide\/?$/i.test(path)) return;

  const PROMO_OFFERS = [
    {
      id: 'yangsim-main',
      title: '안전한토토사이트 ” 양심 “',
      badgeBrand: '양심벳',
      badgeSuffix: ' 회원 전용 이벤트 다수 진행 중',
      bullets: [
        '스포츠/슬롯 첫충/매충 10%',
        '카지노,미겜 첫충,매 충전 5%',
        '출첵 / 룰렛 / 이사 지원금 이벤트',
        '콤프 최대 카지노 1.2% / 슬롯 4%'
      ],
      code: 'KAKA',
      codeLabel: '가입코드: KAKA',
      theme: 'amber',
      primaryHref: 'https://평생양심.com/',
      primaryLabel: '공식 주소 바로가기',
      secondaryHref: 'https://t.me/TRK7878',
      secondaryLabel: '텔레그램 문의하기'
    },
    {
      id: 'seven-main',
      title: '칠땡잡이 승부사이트!!',
      badgeBrand: '칠벳',
      badgeSuffix: ' 회원 전용 이벤트 다수 진행 중',
      bullets: [
        '카지노/스포츠/슬롯/미겜 입금플러스 이벤트',
        '가입 후 환전없을시 무제한 20%',
        '돌발 20% 돌발 카지노10%',
        '페이백 5%'
      ],
      code: '6767',
      codeLabel: '가입코드: 6767',
      theme: 'mint',
      primaryHref: 'https://82clf.com/',
      primaryLabel: '공식 주소 바로가기',
      secondaryHref: 'https://t.me/TRK7878',
      secondaryLabel: '텔레그램 문의하기'
    },
    {
      id: 'vegas-main',
      title: '라스베가스의 진정한 승부사!!',
      badgeBrand: '베가스',
      badgeSuffix: ' 회원 전용 이벤트 다수 진행 중',
      bullets: [
        '카지노/스포츠/슬롯/미겜 입금플러스 이벤트',
        '가입 후 환전없을시 무제한 20%',
        '돌발 20% 돌발 카지노10%',
        '페이백 5%'
      ],
      code: '6789',
      codeLabel: '가입코드: 6789',
      theme: 'red',
      primaryHref: 'https://las302.com/',
      primaryLabel: '공식 주소 바로가기',
      secondaryHref: 'https://t.me/TRK7878',
      secondaryLabel: '텔레그램 문의하기'
    },
    {
      id: 'avengers-main',
      title: '믿고 이용하는 어벤저스',
      badgeBrand: '어벤저스벳',
      badgeSuffix: ' 회원 전용 이벤트',
      bullets: [
        '신규 첫충전,카지노 충전 이벤트',
        '신규 정착이벤트',
        'USTD 입금/가입,원화 입금 가능',
        '심야충전,콤프,페이백 이벤트'
      ],
      code: '6789',
      codeLabel: '가입코드: 6789',
      theme: 'jaju',
      primaryHref: 'https://av-bet.com/',
      primaryLabel: '공식 주소 바로가기',
      secondaryHref: 'https://t.me/TRK7878',
      secondaryLabel: '텔레그램 문의하기'
    }
  ];

  function shuffleOffers(items) {
    const copy = Array.isArray(items) ? items.slice() : [];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getRandomPromoOffers(limit = 2) {
    const offers = shuffleOffers(PROMO_OFFERS).filter(Boolean);
    return offers.slice(0, Math.max(1, Math.min(limit, offers.length)));
  }

  function injectPromoStyles() {
    if (document.getElementById('autoPromoStyles')) return;
    const style = document.createElement('style');
    style.id = 'autoPromoStyles';
    style.textContent = `
      .auto-promo-zone{margin:26px 0 10px}
      .auto-promo-zone .container{padding-left:0;padding-right:0}
      .auto-promo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
      .auto-promo-card{position:relative;overflow:hidden;border-radius:28px;padding:28px 28px 24px;border:1px solid rgba(116,145,196,.24);background:linear-gradient(180deg,rgba(7,21,48,.95),rgba(5,16,33,.96));box-shadow:0 22px 50px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.04)}
      .auto-promo-card::before{content:'';position:absolute;inset:auto -12% -35% auto;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(103,150,255,.16),transparent 68%);pointer-events:none}
      .auto-promo-card::after{content:'';position:absolute;inset:0;border-radius:inherit;border:1px solid rgba(255,255,255,.05);pointer-events:none}
      .auto-promo-title{display:flex;align-items:center;gap:8px;margin:0 0 18px;font-size:1.95rem;line-height:1.12;font-weight:900;color:#f5f8ff;letter-spacing:-.03em}
      .auto-promo-title .mark{font-size:1.05rem;color:var(--promo-accent,#7cf59a)}
      .auto-promo-badge{margin:0 0 16px;font-size:1rem;font-weight:800;color:#f5f8ff;line-height:1.4}
      .auto-promo-badge-brand{display:inline-block;margin-right:6px;font-size:1.2em;font-weight:950;letter-spacing:-.03em;color:var(--promo-accent,#7cf59a);text-shadow:0 8px 18px rgba(0,0,0,.18)}
      .auto-promo-list{list-style:none;margin:0;padding:0;display:grid;gap:10px}
      .auto-promo-list li{position:relative;padding-left:18px;color:#d5ddf5;line-height:1.55}
      .auto-promo-list li::before{content:'';position:absolute;left:0;top:.6em;width:8px;height:8px;border-radius:50%;background:var(--promo-accent,#7cf59a);box-shadow:0 0 0 4px var(--promo-accent-soft,rgba(124,245,154,.12))}
      .auto-promo-code-row{margin-top:12px;display:flex;flex-wrap:wrap;gap:10px}
      .auto-promo-actions{margin-top:14px;display:flex;flex-wrap:wrap;gap:12px}
      .auto-promo-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:16px;font-weight:800;text-decoration:none;transition:transform .16s ease, box-shadow .16s ease, background .16s ease, border-color .16s ease;color:#081225;border:1px solid transparent}
      .auto-promo-btn:hover{transform:translateY(-1px)}
      .auto-promo-btn.code{width:auto;max-width:100%;justify-content:flex-start;gap:0;padding:0 18px;background:var(--promo-accent-grad,linear-gradient(135deg,#86efac,#bbf7d0 58%,#dcfce7));color:var(--promo-accent-ink,#062317);box-shadow:0 14px 34px var(--promo-accent-shadow,rgba(134,239,172,.2));cursor:pointer;white-space:nowrap;border-color:var(--promo-accent-border,rgba(134,239,172,.28))}
      .auto-promo-btn.code .sub{display:none}
      .auto-promo-btn.primary{background:var(--promo-primary-grad,linear-gradient(135deg,#6f97ff,#5577df 58%,#3a56b4));box-shadow:0 14px 34px var(--promo-primary-shadow,rgba(93,126,223,.28));color:#f7f9ff;border-color:var(--promo-primary-border,rgba(111,151,255,.24))}
      .auto-promo-btn.secondary{color:#ecf2ff;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);box-shadow:none}
      .auto-promo-card.theme-amber{--promo-accent:#f5cf68;--promo-accent-soft:rgba(245,207,104,.14);--promo-accent-grad:linear-gradient(135deg,#f8d36b,#f5c451 55%,#f2dd98);--promo-accent-ink:#251804;--promo-accent-shadow:rgba(248,211,107,.2);--promo-accent-border:rgba(248,211,107,.28);--promo-primary-grad:linear-gradient(135deg,#f0b83f,#dc8f17 58%,#a55a06);--promo-primary-shadow:rgba(240,184,63,.26);--promo-primary-border:rgba(240,184,63,.22);border-color:rgba(245,207,104,.24)}
      .auto-promo-card.theme-amber::before{background:radial-gradient(circle,rgba(245,207,104,.2),transparent 68%)}
      .auto-promo-card.theme-mint{--promo-accent:#86efac;--promo-accent-soft:rgba(134,239,172,.14);--promo-accent-grad:linear-gradient(135deg,#86efac,#bbf7d0 58%,#dcfce7);--promo-accent-ink:#062317;--promo-accent-shadow:rgba(134,239,172,.2);--promo-accent-border:rgba(134,239,172,.28);--promo-primary-grad:linear-gradient(135deg,#34d399,#10b981 58%,#0f766e);--promo-primary-shadow:rgba(16,185,129,.24);--promo-primary-border:rgba(52,211,153,.22);border-color:rgba(134,239,172,.24)}
      .auto-promo-card.theme-mint::before{background:radial-gradient(circle,rgba(52,211,153,.2),transparent 68%)}
      .auto-promo-card.theme-red{--promo-accent:#fca5a5;--promo-accent-soft:rgba(252,165,165,.14);--promo-accent-grad:linear-gradient(135deg,#fca5a5,#fb7185 58%,#fecaca);--promo-accent-ink:#32090e;--promo-accent-shadow:rgba(251,113,133,.2);--promo-accent-border:rgba(252,165,165,.28);--promo-primary-grad:linear-gradient(135deg,#ef4444,#dc2626 58%,#7f1d1d);--promo-primary-shadow:rgba(239,68,68,.24);--promo-primary-border:rgba(248,113,113,.22);border-color:rgba(252,165,165,.24)}
      .auto-promo-card.theme-red::before{background:radial-gradient(circle,rgba(239,68,68,.2),transparent 68%)}
      .auto-promo-card.theme-silver{--promo-accent:#d5deef;--promo-accent-soft:rgba(213,222,239,.14);--promo-accent-grad:linear-gradient(135deg,#d9e3f5,#bac8df 58%,#eef3fb);--promo-accent-ink:#132135;--promo-accent-shadow:rgba(186,200,223,.2);--promo-accent-border:rgba(213,222,239,.28);--promo-primary-grad:linear-gradient(135deg,#c7d2e5,#94a3b8 58%,#64748b);--promo-primary-shadow:rgba(148,163,184,.26);--promo-primary-border:rgba(199,210,229,.24);border-color:rgba(213,222,239,.24)}
      .auto-promo-card.theme-silver::before{background:radial-gradient(circle,rgba(186,200,223,.22),transparent 68%)}
      .auto-promo-card.theme-jaju{--promo-accent:#f0abcf;--promo-accent-soft:rgba(240,171,207,.15);--promo-accent-grad:linear-gradient(135deg,#f5bfdc,#e879b5 58%,#fbcfe8);--promo-accent-ink:#330a20;--promo-accent-shadow:rgba(232,121,181,.22);--promo-accent-border:rgba(240,171,207,.28);--promo-primary-grad:linear-gradient(135deg,#c2185b,#a21caf 58%,#5b1033);--promo-primary-shadow:rgba(194,24,91,.26);--promo-primary-border:rgba(232,121,181,.22);border-color:rgba(240,171,207,.24)}
      .auto-promo-card.theme-jaju::before{background:radial-gradient(circle,rgba(194,24,91,.2),transparent 68%)}
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
        .auto-promo-code-row{display:block}
        .auto-promo-btn.code{width:auto;min-width:0;padding:0 14px}
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
        .auto-promo-code-row{display:block}
        .auto-promo-btn.code{font-size:.95rem;width:auto;max-width:100%}
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

    const selectedOffers = getRandomPromoOffers(2);

    selectedOffers.forEach((offer) => {
      const article = document.createElement('article');
      article.className = `auto-promo-card theme-${offer.theme || 'mint'}`;
      const listMarkup = (offer.bullets || []).map((item) => `<li>${item}</li>`).join('');
      const badgeMarkup = offer.badgeBrand
        ? `<span class="auto-promo-badge-brand">${offer.badgeBrand}</span><span class="auto-promo-badge-rest">${offer.badgeSuffix || ''}</span>`
        : `${offer.badge || ''}`;
      article.innerHTML = `
        <h2 class="auto-promo-title"><span class="mark">✦</span><span>${offer.title}</span><span class="mark">✦</span></h2>
        <p class="auto-promo-badge">${badgeMarkup}</p>
        <ul class="auto-promo-list">${listMarkup}</ul>
        <div class="auto-promo-code-row">
          <button class="auto-promo-btn code" type="button" data-copy-code="${offer.code || ''}" aria-label="${offer.codeLabel || '가입코드 복사'}">
            <span>${offer.codeLabel || ''}</span>
          </button>
        </div>
        <div class="auto-promo-actions">
          <a class="auto-promo-btn primary" href="${offer.primaryHref}" target="_blank" rel="noopener noreferrer">${offer.primaryLabel}</a>
          <a class="auto-promo-btn secondary" href="${offer.secondaryHref}" target="_blank" rel="noopener noreferrer">${offer.secondaryLabel}</a>
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


  function copyPromoCode(code, button) {
    if (!code) return;
    const setStatus = (label) => {
      if (!button) return;
      const sub = button.querySelector('.sub');
      if (sub) sub.textContent = label;
    };
    const finish = () => {
      setStatus('복사 완료');
      window.setTimeout(() => setStatus('클릭하여 복사'), 1500);
      try { if (typeof window.track === 'function') window.track('promo_code_copy', { code, path: location.pathname }); } catch (e) {}
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(finish).catch(() => fallbackCopy(code, finish));
      return;
    }
    fallbackCopy(code, finish);
  }

  function fallbackCopy(code, done) {
    try {
      const ta = document.createElement('textarea');
      ta.value = code;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      if (typeof done === 'function') done();
    } catch (e) {}
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-copy-code]');
    if (!button) return;
    event.preventDefault();
    copyPromoCode(button.getAttribute('data-copy-code') || '', button);
  });

  function mountMobileDock() {
    if (window.innerWidth > 980) return;
    if (document.querySelector('.mobile-dock')) return;

    const items = [
      { href: '/muktu-police/search/', label: '검색', icon: '⌕' },
      { href: '/', label: '홈', icon: '⌂' },
      { href: '/analysis/', label: '분석', icon: '⌁', accent: true },
      { href: 'https://t.me/TRK7878', label: '문의', icon: '✦', external: true }
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
