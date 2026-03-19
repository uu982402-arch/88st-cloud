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
      code: 'KAKA',
      codeLabel: '가입코드: KAKA',
      theme: 'mint',
      primaryHref: 'https://www.trc-11.com/',
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
      code: 'KAKA',
      codeLabel: '가입코드: KAKA',
      theme: 'amber',
      primaryHref: 'https://픽스주소.com/',
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
      .auto-promo-code-row{margin-top:12px;display:flex;flex-wrap:wrap;gap:10px}
      .auto-promo-actions{margin-top:14px;display:flex;flex-wrap:wrap;gap:12px}
      .auto-promo-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:16px;font-weight:800;text-decoration:none;transition:transform .16s ease, box-shadow .16s ease, background .16s ease, border-color .16s ease;color:#081225;border:1px solid transparent}
      .auto-promo-btn:hover{transform:translateY(-1px)}
      .auto-promo-btn.code{width:auto;max-width:100%;justify-content:flex-start;gap:0;padding:0 18px;background:rgba(255,255,255,.03);color:#ecf2ff;box-shadow:none;cursor:pointer;white-space:nowrap}
      .auto-promo-btn.code .sub{display:none}
      .auto-promo-btn.primary{background:linear-gradient(135deg,#6f97ff,#5577df 58%,#3a56b4);box-shadow:0 14px 34px rgba(93,126,223,.28);color:#f7f9ff;border-color:rgba(111,151,255,.24)}
      .auto-promo-card.theme-mint .auto-promo-btn.code{background:linear-gradient(135deg,#86efac,#bbf7d0 58%,#dcfce7);box-shadow:0 14px 34px rgba(134,239,172,.2);color:#062317;border-color:rgba(134,239,172,.28)}
      .auto-promo-card.theme-amber .auto-promo-btn.code{background:linear-gradient(135deg,#f8d36b,#f5c451 55%,#f2dd98);box-shadow:0 14px 34px rgba(248,211,107,.2);color:#251804;border-color:rgba(248,211,107,.28)}
      .auto-promo-btn.secondary{color:#ecf2ff;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);box-shadow:none}
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

    PROMO_OFFERS.forEach((offer, idx) => {
      const article = document.createElement('article');
      article.className = `auto-promo-card theme-${offer.theme || (idx === 1 ? 'amber' : 'mint')}${idx === 1 ? ' is-safe' : ''}`;
      const listMarkup = offer.bullets.map((item) => `<li>${item}</li>`).join('');
      const isPrimaryExternal = /^https?:\/\//i.test(offer.primaryHref || '');
      const primaryAttrs = isPrimaryExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      article.innerHTML = `
        <h2 class="auto-promo-title"><span class="mark">✦</span><span>${offer.title}</span><span class="mark">✦</span></h2>
        <p class="auto-promo-badge">${offer.badge}</p>
        <ul class="auto-promo-list">${listMarkup}</ul>
        <div class="auto-promo-code-row">
          <button class="auto-promo-btn code" type="button" data-copy-code="${offer.code || ''}" aria-label="${offer.codeLabel || '가입코드 복사'}">
            <span>${offer.codeLabel || ''}</span>
          </button>
        </div>
        <div class="auto-promo-actions">
          <a class="auto-promo-btn primary" href="${offer.primaryHref}"${primaryAttrs}>${offer.primaryLabel}</a>
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


  function createGlobalMobileMenu() {
    const header = document.querySelector('.site-header');
    const inner = header?.querySelector('.header-inner');
    const nav = header?.querySelector('.main-nav');
    if (!header || !inner || !nav || document.querySelector('.mobile-menu-btn')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mobile-menu-btn';
    button.setAttribute('aria-label', '모바일 메뉴 열기');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="mobile-menu-btn__lines"></span>';
    inner.appendChild(button);

    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.innerHTML = '<div class="mobile-menu-overlay__bg"></div><div class="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="모바일 메뉴"><div class="mobile-menu-head"><div><strong>레븐 빠른 이동</strong><small>모바일에서는 필요한 메뉴만 짧고 선명하게 묶었습니다.</small></div><button class="mobile-menu-close" type="button" aria-label="닫기">✕</button></div><div class="mobile-menu-links"></div></div>';
    document.body.appendChild(overlay);

    const labels = {
      '메인': '메인 허브',
      '배당분석': '빠른 배당 체크',
      '카지노': '바카라·룰렛·블랙잭',
      '슬롯': '슬롯 구조·RTP·변동성',
      '보너스': '보너스 조건 확인',
      '뉴스': '한글 요약 뉴스',
      '가이드': '기법·미니게임 구조',
      '전략': '운영 기준·기록·손절'
    };

    const currentPath = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
    const isCurrent = (href) => {
      try {
        const url = new URL(href, location.origin);
        if (url.origin !== location.origin) return false;
        const target = url.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
        return currentPath === target || (target !== '/' && currentPath.startsWith(target));
      } catch (e) {
        return false;
      }
    };

    const host = overlay.querySelector('.mobile-menu-links');
    Array.from(nav.querySelectorAll('a')).forEach((link) => {
      const label = (link.textContent || '').trim();
      if (!label) return;
      const a = document.createElement('a');
      a.href = link.getAttribute('href') || link.href;
      if (isCurrent(a.href)) a.classList.add('is-current');
      a.innerHTML = `<span>${label}</span><small>${labels[label] || '바로 이동'}</small>`;
      host.appendChild(a);
    });

    const action = header.querySelector('.header-actions a');
    if (action) {
      const a = document.createElement('a');
      a.href = action.getAttribute('href') || action.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'is-accent';
      a.innerHTML = `<span>${(action.textContent || '').trim() || '텔레그램 문의'}</span><small>텔레그램 바로 연결</small>`;
      host.appendChild(a);
    }

    const close = () => {
      document.body.classList.remove('open-menu');
      button.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      document.body.classList.add('open-menu');
      button.setAttribute('aria-expanded', 'true');
    };

    button.addEventListener('click', () => {
      if (document.body.classList.contains('open-menu')) close();
      else open();
    });
    overlay.querySelector('.mobile-menu-close')?.addEventListener('click', close);
    overlay.querySelector('.mobile-menu-overlay__bg')?.addEventListener('click', close);
    host.addEventListener('click', (event) => {
      const anchor = event.target.closest('a');
      if (anchor && !anchor.target) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('open-menu')) close();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) close();
    }, { passive: true });
  }


  function syncMobilePostMetaLabels() {
    const isMobileLike = window.innerWidth <= 980;
    const metaItems = document.querySelectorAll('body[data-post-category] .post-meta-item');
    if (!metaItems.length) return;

    const labelMap = {
      '카테고리': '분야',
      '발행일': '발행',
      '업데이트': '수정',
      '읽기': '소요',
      '핵심 태그': '태그'
    };

    const compactDate = (value) => {
      const raw = String(value || '').trim();
      const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m) return raw;
      return `${m[2]}.${m[3]}`;
    };

    metaItems.forEach((item) => {
      const label = item.querySelector('b');
      const value = item.querySelector('span');
      if (!label || !value) return;
      if (!label.dataset.fullText) label.dataset.fullText = (label.textContent || '').trim();
      if (!value.dataset.fullText) value.dataset.fullText = (value.textContent || '').trim();

      const originalLabel = label.dataset.fullText;
      const originalValue = value.dataset.fullText;

      if (isMobileLike) {
        label.textContent = labelMap[originalLabel] || originalLabel;
        if (originalLabel === '발행일' || originalLabel === '업데이트') {
          value.textContent = compactDate(originalValue);
        } else {
          value.textContent = originalValue;
        }
      } else {
        label.textContent = originalLabel;
        value.textContent = originalValue;
      }
    });
  }



  function syncMobileArticleSectionTitles() {
    const isMobileLike = window.innerWidth <= 980;
    if (!document.body || !document.body.matches('body[data-post-category]')) return;

    const titleMap = {
      '같이 보면 좋은 글': '관련 글',
      '이 글의 핵심': '핵심 정리',
      '연결 카테고리': '연결 분야',
      '다음 동선': '다음 글'
    };

    const selectors = [
      'body[data-post-category] .article-shell h2',
      'body[data-post-category] .rail-card h3'
    ];

    document.querySelectorAll(selectors.join(',')).forEach((node) => {
      const raw = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!raw) return;
      if (!node.dataset.fullText) node.dataset.fullText = raw;
      const full = node.dataset.fullText;
      node.textContent = isMobileLike ? (titleMap[full] || full) : full;
    });
  }

  function mountMobileDock() {
    if (window.innerWidth > 980) return;
    if (document.querySelector('.mobile-dock')) return;

    const items = [
      { href: '/', label: '메인', icon: '⌂' },
      { href: '/analysis/', label: '분석', icon: '⌁' },
      { href: '/play-guides/', label: '가이드', icon: '☷' },
      { href: 'https://t.me/kakacloud', label: '문의', icon: '✦', external: true, accent: true }
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
      a.innerHTML = `<span class="mobile-dock__icon" aria-hidden="true">${item.icon}</span><span class="mobile-dock__label">${item.label}</span>`;
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

  createGlobalMobileMenu();
  mountInlinePromos();
  mountMobileDock();
  syncMobilePostMetaLabels();
  syncMobileArticleSectionTitles();
  window.addEventListener('resize', syncMobilePostMetaLabels, { passive: true });
  window.addEventListener('resize', syncMobileArticleSectionTitles, { passive: true });
})();


(() => {
  const MOBILE_BP = 980;
  const body = document.body;
  if (!body) return;

  const isMobile = () => window.innerWidth <= MOBILE_BP;
  const path = location.pathname || '/';
  let syncRaf = 0;
  let dockScrollBound = false;

  const compactCopyMap = [
    ['body.blog-home-page #categoryStart .section-head p', '허브를 빠르게 고를 수 있게 정리했습니다.'],
    ['body.blog-home-page #beginnerRoutes .section-head p', '처음 읽을 순서를 짧게 묶었습니다.'],
    ['body.blog-home-page #editorCuration .section-head p', '자주 찾는 글만 먼저 모았습니다.'],
    ['body[data-blog-hub] .section-head p', '관련 글을 카드로 바로 볼 수 있게 정리했습니다.'],
    ['#newsSection .section-head p', '스포츠 브리핑을 바로 확인합니다.'],
    ['#oddsCenter .section-head p', '배당 구조를 빠르게 확인하고 텔레그램으로 이어서 볼 수 있습니다.'],
    ['#oddsCenter [data-role="helper"]', '3개 배당을 넣으면 공정확률·마진을 바로 계산합니다.'],
    ['#oddsCenter .widget-note', '가격 구조를 해석하는 도구입니다. 공정확률·마진·우세격차를 함께 계산합니다.'],
    ['#oddsCenter .empty-state', '배당을 입력하면 공정확률·마진·종합 점수가 계산됩니다.']
  ];

  const cardLabelMap = {
    '허브 보기': '허브',
    '최신 글': '최신',
    '글 보기': '보기',
    '상세 보기': '보기',
    '글 읽기': '읽기',
    '원문 보기': '원문',
    '새로고침': '갱신',
    '슬롯 목록': '목록',
    '카지노 목록': '목록',
    '보너스 목록': '목록',
    '전략 목록': '목록',
    '손실 제어 보기': '손실 제어',
    '중단 기준 보기': '중단 기준',
    'VIP 혜택 보기': 'VIP 혜택',
    '세션 체크리스트': '체크리스트',
    '텔레그램 열기': '텔레그램',
    '공식 주소 바로가기': '주소 열기',
    '텔레그램 문의하기': '문의하기'
  };

  function storeText(node) {
    if (!node) return '';
    if (!node.dataset.fullText) node.dataset.fullText = (node.textContent || '').replace(/\s+/g, ' ').trim();
    return node.dataset.fullText;
  }

  function syncTextNode(node, shortText) {
    if (!node) return;
    const fullText = storeText(node);
    node.textContent = isMobile() ? shortText : fullText;
  }

  function syncSelectorMap() {
    compactCopyMap.forEach(([selector, shortText]) => {
      document.querySelectorAll(selector).forEach((node) => syncTextNode(node, shortText));
    });
  }

  function syncCardLabels() {
    const selectors = [
      '.archive-card .btn',
      '.archive-card .text-link',
      '.stream-card .text-link',
      '.latest-card .btn',
      '.latest-card .text-link',
      '.category-card .btn',
      '.category-card .text-link',
      '.guide-tail-actions .btn',
      '.guide-tail-actions .text-link',
      '.widget-actions .btn',
      '.analysis-hero-cta .btn',
      '.news-card .btn',
      '.news-card .text-link',
      '#newsRefreshBtn'
    ];
    document.querySelectorAll(selectors.join(',')).forEach((node) => {
      if (node.children && node.children.length) return;
      const fullText = storeText(node);
      node.textContent = isMobile() ? (cardLabelMap[fullText] || fullText) : fullText;
    });
  }

  function syncMenuAccentLabel() {
    const accent = document.querySelector('.mobile-menu-links a.is-accent');
    if (!accent) return;
    const main = accent.querySelector('span');
    const sub = accent.querySelector('small');
    if (main) {
      if (!main.dataset.fullText) main.dataset.fullText = (main.textContent || '').trim();
      main.textContent = isMobile() ? '문의' : main.dataset.fullText;
    }
    if (sub) {
      if (!sub.dataset.fullText) sub.dataset.fullText = (sub.textContent || '').trim();
      sub.textContent = isMobile() ? '텔레그램 연결' : sub.dataset.fullText;
    }
  }

  function syncArticleBreadcrumb() {
    const breadcrumb = document.querySelector('body[data-post-category] .breadcrumb');
    if (!breadcrumb) return;
    if (!breadcrumb.dataset.fullHtml) breadcrumb.dataset.fullHtml = breadcrumb.innerHTML;
    if (!isMobile()) {
      breadcrumb.innerHTML = breadcrumb.dataset.fullHtml;
      breadcrumb.classList.remove('is-mobile-compact');
      return;
    }
    const links = Array.from(breadcrumb.querySelectorAll('a'));
    if (links.length < 2) return;
    const compact = `${links[0].outerHTML}<span class="crumb-sep">/</span>${links[1].outerHTML}`;
    breadcrumb.innerHTML = compact;
    breadcrumb.classList.add('is-mobile-compact');
  }

  function insertAfter(target, node) {
    if (!target || !target.parentNode || !node) return;
    if (target.nextSibling === node) return;
    target.parentNode.insertBefore(node, target.nextSibling);
  }

  function syncArticlePromoFlow() {
    const promo = document.querySelector('body[data-post-category] .auto-promo-zone.is-article');
    const shell = document.querySelector('body[data-post-category] .article-shell');
    if (!promo || !shell) return;
    const mobileTarget = shell.querySelector('.faq-list') || shell.querySelector('.callout') || shell.querySelector('.article-checks');
    const desktopTarget = shell.querySelector('.article-checks') || shell.querySelector('.article-intro');
    const target = isMobile() ? mobileTarget : desktopTarget;
    insertAfter(target, promo);
  }

  function syncArticleRailOrder() {
    const rail = document.querySelector('body[data-post-category] .side-rail');
    if (!rail) return;
    const cards = Array.from(rail.querySelectorAll('.rail-card'));
    if (!cards.length) return;
    cards.forEach((card, index) => {
      if (!card.dataset.originalIndex) card.dataset.originalIndex = String(index);
    });
    const orderMap = { '다음 동선': 0, '다음 글': 0, '이 글의 핵심': 1, '핵심 정리': 1, '연결 카테고리': 2, '연결 분야': 2 };
    const sorted = [...cards].sort((a, b) => {
      if (!isMobile()) return Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex);
      const aTitle = (a.querySelector('h3')?.textContent || '').trim();
      const bTitle = (b.querySelector('h3')?.textContent || '').trim();
      return (orderMap[aTitle] ?? 99) - (orderMap[bTitle] ?? 99);
    });
    sorted.forEach((card) => rail.appendChild(card));
  }

  function syncHeaderCompact() {
    if (!isMobile()) {
      body.classList.remove('is-header-compact');
      return;
    }
    body.classList.toggle('is-header-compact', window.scrollY > 16);
  }

  function bindDockScroll() {
    if (dockScrollBound) return;
    dockScrollBound = true;
    let lastY = window.scrollY || 0;
    window.addEventListener('scroll', () => {
      const dock = document.querySelector('.mobile-dock');
      if (!dock || !isMobile()) return;
      const currentY = window.scrollY || 0;
      if (currentY > lastY + 8 && currentY > 96) dock.classList.add('is-hidden');
      if (currentY < lastY - 8 || currentY < 72) dock.classList.remove('is-hidden');
      lastY = currentY;
      syncHeaderCompact();
    }, { passive: true });
  }

  function syncAnalysisButtons() {
    const cta = document.querySelector('#oddsCenter .analysis-hero-cta');
    if (!cta) return;
    const primary = cta.querySelector('.cta-actions .btn-primary');
    const secondary = cta.querySelector('.cta-actions .btn-copy, .cta-actions .btn-ghost');
    if (primary) syncTextNode(primary, '텔레그램');
    if (secondary) syncTextNode(secondary, '아이디 복사');
  }

  function syncHomeRouteLinks() {
    const linkMap = {
      '손실 제어 보기': '손실 제어',
      '중단 기준 보기': '중단 기준',
      'VIP 혜택 보기': 'VIP 혜택',
      '세션 체크리스트': '체크리스트'
    };
    document.querySelectorAll('.guide-tail-actions .text-link').forEach((node) => {
      if (node.children && node.children.length) return;
      const fullText = storeText(node);
      node.textContent = isMobile() ? (linkMap[fullText] || fullText) : fullText;
    });
  }

  function syncArticleRelatedLinkLabels() {
    document.querySelectorAll('body[data-post-category] .related-card, body[data-post-category] .inline-links a').forEach((node) => {
      if (node.matches('.inline-links a') && !(node.children && node.children.length)) {
        const fullText = storeText(node);
        if (isMobile() && fullText.length > 12) node.textContent = `${fullText.slice(0, 11).trim()}…`;
        else node.textContent = fullText;
      }
    });
  }

  function runMobileSuite() {
    syncSelectorMap();
    syncCardLabels();
    syncMenuAccentLabel();
    syncArticleBreadcrumb();
    syncArticlePromoFlow();
    syncArticleRailOrder();
    syncAnalysisButtons();
    syncHomeRouteLinks();
    syncArticleRelatedLinkLabels();
    syncHeaderCompact();
    bindDockScroll();
  }

  function queueRun() {
    if (syncRaf) cancelAnimationFrame(syncRaf);
    syncRaf = requestAnimationFrame(runMobileSuite);
  }

  queueRun();
  window.addEventListener('resize', queueRun, { passive: true });
  window.addEventListener('orientationchange', queueRun, { passive: true });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && (mutation.addedNodes.length || mutation.removedNodes.length)) {
        queueRun();
        return;
      }
    }
  });
  observer.observe(body, { childList: true, subtree: true });
})();
