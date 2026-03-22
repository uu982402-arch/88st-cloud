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


  const ADS_DATA_URL = '/assets/data/ads.index.v1.20260319.json';
  const SEED_PROMO_OFFERS = [
    {
        "id": "fix-main",
        "title": "신사답게 화답하는 메이저 놀이터",
        "badge": "픽스 bet 회원 전용 이벤트 다수 진행 중",
        "bullets": [
            "신규가입 첫 충전 30% · 첫충 15% / 매충 10% 지급",
            "카지노 첫 충전 5% · 매충 5%",
            "정착 / 이사 지원금 이벤트",
            "콤프 최대 카지노 1.2% / 슬롯 4%"
        ],
        "code": "KAKA",
        "codeLabel": "가입코드: KAKA",
        "theme": "amber",
        "primaryHref": "https://픽스주소.com/",
        "primaryLabel": "공식 주소 바로가기",
        "secondaryHref": "https://t.me/kakacloud",
        "secondaryLabel": "텔레그램 문의하기",
        "categories": [
            "common"
        ],
        "targets": [
            "all"
        ],
        "priority": 100,
        "enabled": true,
        "mobile": true,
        "desktop": true
    },
    {
        "id": "seven-main",
        "title": "칠땡잡이 승부사이트!!",
        "badge": "칠벳 회원 전용 이벤트 다수 진행 중",
        "bullets": [
            "카지노/스포츠/슬롯/미겜 입금플러스 이벤트",
            "가입 후 환전없을시 무제한 20%",
            "돌발 20% 돌발 카지노10%",
            "페이백 5%"
        ],
        "code": "6767",
        "codeLabel": "가입코드: 6767",
        "theme": "mint",
        "primaryHref": "https://82clf.com/",
        "primaryLabel": "공식 주소 바로가기",
        "secondaryHref": "https://t.me/kakacloud",
        "secondaryLabel": "텔레그램 문의하기",
        "categories": [
            "common"
        ],
        "targets": [
            "all"
        ],
        "priority": 90,
        "enabled": true,
        "mobile": true,
        "desktop": true
    },
    {
        "id": "vegas-main",
        "title": "라스베가스의 진정한 승부사!!",
        "badge": "베가스 회원 전용 이벤트 다수 진행 중",
        "bullets": [
            "카지노/스포츠/슬롯/미겜 입금플러스 이벤트",
            "가입 후 환전없을시 무제한 20%",
            "돌발 20% 돌발 카지노10%",
            "페이백 5%"
        ],
        "code": "6789",
        "codeLabel": "가입코드: 6789",
        "theme": "red",
        "primaryHref": "https://las302.com/",
        "primaryLabel": "공식 주소 바로가기",
        "secondaryHref": "https://t.me/kakacloud",
        "secondaryLabel": "텔레그램 문의하기",
        "categories": [
            "common"
        ],
        "targets": [
            "all"
        ],
        "priority": 80,
        "enabled": true,
        "mobile": true,
        "desktop": true
    },
    {
        "id": "topgun-main",
        "title": "오늘 탑건과 함께 날아보아요.",
        "badge": "탑건벳 회원 전용 이벤트",
        "bullets": [
            "신규 첫 40% 충전 보너스 지급",
            "매충 10% 돌발20%",
            "출석, 생일, 공지방 페이백 이벤트",
            "카지노 0.8% / 슬롯 3% 콤프 지급"
        ],
        "code": "GAS7",
        "codeLabel": "가입코드: GAS7",
        "theme": "silver",
        "primaryHref": "https://topgun-88.com",
        "primaryLabel": "공식 주소 바로가기",
        "secondaryHref": "https://t.me/kakacloud",
        "secondaryLabel": "텔레그램 문의하기",
        "categories": [
            "common"
        ],
        "targets": [
            "all"
        ],
        "priority": 70,
        "enabled": true,
        "mobile": true,
        "desktop": true
    }
];

  const PROMO_SLOT_LIMITS = {
    home: { desktop: 4, mobile: 2 },
    hub: { desktop: 4, mobile: 2 },
    news: { desktop: 3, mobile: 2 },
    analysis: { desktop: 2, mobile: 2 },
    post: { desktop: 2, mobile: 2 },
    default: { desktop: 2, mobile: 2 }
  };

  let promoOffersCache = null;

  function injectPromoStyles() {
    if (document.getElementById('autoPromoStyles')) return;
    const style = document.createElement('style');
    style.id = 'autoPromoStyles';
    style.textContent = `
      .auto-promo-zone{margin:26px 0 10px}
      .auto-promo-zone .container{padding-left:0;padding-right:0}
      .auto-promo-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;padding:0 2px}
      .auto-promo-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:.82rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#93a8d8}
      .auto-promo-eyebrow::before{content:'';width:8px;height:8px;border-radius:999px;background:#7cf59a;box-shadow:0 0 0 4px rgba(124,245,154,.12)}
      .auto-promo-note{margin:0;color:#9fb1d8;font-size:.92rem;line-height:1.45}
      .auto-promo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
      .auto-promo-card{position:relative;overflow:hidden;border-radius:28px;padding:28px 28px 24px;border:1px solid rgba(144,220,158,.26);background:linear-gradient(180deg,rgba(7,21,48,.95),rgba(5,16,33,.96));box-shadow:0 22px 50px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.04);display:flex;flex-direction:column;min-height:100%}
      .auto-promo-card::before{content:'';position:absolute;inset:auto -12% -35% auto;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(103,150,255,.16),transparent 68%);pointer-events:none}
      .auto-promo-title{display:flex;align-items:center;gap:8px;margin:0 0 18px;font-size:1.95rem;line-height:1.12;font-weight:900;color:#f5f8ff;letter-spacing:-.03em}
      .auto-promo-title .mark{font-size:1.05rem;color:#f3c845}
      .auto-promo-badge{margin:0 0 16px;font-size:1rem;font-weight:800;color:#f5f8ff}
      .auto-promo-list{list-style:none;margin:0;padding:0;display:grid;gap:10px;flex:1}
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
      .auto-promo-card.theme-red .auto-promo-btn.code{background:linear-gradient(135deg,#fb7185,#f43f5e 55%,#fecdd3);box-shadow:0 14px 34px rgba(244,63,94,.2);color:#320610;border-color:rgba(244,63,94,.28)}
      .auto-promo-card.theme-silver .auto-promo-btn.code{background:linear-gradient(135deg,#e2e8f0,#cbd5e1 55%,#f8fafc);box-shadow:0 14px 34px rgba(148,163,184,.18);color:#0f172a;border-color:rgba(203,213,225,.36)}
      .auto-promo-btn.secondary{color:#ecf2ff;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);box-shadow:none}
      .auto-promo-toggle-wrap{display:none}
      .auto-promo-zone.is-article{margin:26px 0 28px}
      .auto-promo-zone.is-page{margin:18px 0 30px}
      .auto-promo-zone.is-bottom{margin:34px 0 8px}
      @media (max-width: 980px){
        .auto-promo-zone .container{padding-left:16px;padding-right:16px}
        .auto-promo-head{align-items:flex-start;flex-direction:column;gap:6px;margin-bottom:12px}
        .auto-promo-grid{grid-template-columns:1fr}
        .auto-promo-card{padding:22px 20px 20px;border-radius:22px}
        .auto-promo-title{font-size:1.55rem}
        .auto-promo-badge{font-size:.98rem}
        .auto-promo-actions{display:grid;grid-template-columns:1fr 1fr}
        .auto-promo-btn{width:100%;min-height:46px;padding:0 14px;text-align:center}
        .auto-promo-code-row{display:block}
        .auto-promo-btn.code{width:auto;min-width:0;padding:0 14px}
        .auto-promo-zone[data-mobile-collapsed="true"] .auto-promo-card.is-extra{display:none}
        .auto-promo-toggle-wrap{display:block;margin-top:12px}
        .auto-promo-toggle{width:100%;min-height:46px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#ecf2ff;font-weight:800;letter-spacing:-.01em}
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

  function normalizePromoOffer(raw, idx) {
    if (!raw || typeof raw !== 'object') return null;
    const offer = {
      id: String(raw.id || `promo-${idx + 1}`),
      title: String(raw.title || '').trim(),
      badge: String(raw.badge || '').trim(),
      bullets: Array.isArray(raw.bullets) ? raw.bullets.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 6) : [],
      code: String(raw.code || '').trim(),
      codeLabel: String(raw.codeLabel || '').trim(),
      theme: String(raw.theme || (idx % 2 ? 'amber' : 'mint')).trim(),
      primaryHref: String(raw.primaryHref || raw.url || '').trim(),
      primaryLabel: String(raw.primaryLabel || '공식 주소 바로가기').trim(),
      secondaryHref: String(raw.secondaryHref || 'https://t.me/kakacloud').trim(),
      secondaryLabel: String(raw.secondaryLabel || '텔레그램 문의하기').trim(),
      categories: Array.isArray(raw.categories) ? raw.categories.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean) : ['common'],
      targets: Array.isArray(raw.targets) ? raw.targets.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean) : ['all'],
      priority: Number.isFinite(Number(raw.priority)) ? Number(raw.priority) : 0,
      enabled: raw.enabled !== false,
      mobile: raw.mobile !== false,
      desktop: raw.desktop !== false
    };
    if (!offer.title || !offer.primaryHref) return null;
    if (!offer.codeLabel && offer.code) offer.codeLabel = `가입코드: ${offer.code}`;
    if (!offer.bullets.length && raw.description) offer.bullets = [String(raw.description).trim()];
    return offer;
  }

  async function loadPromoOffers() {
    if (promoOffersCache) return promoOffersCache;
    try {
      const response = await fetch(ADS_DATA_URL, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error(`ad-data-${response.status}`);
      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload.offers) ? payload.offers : []);
      const normalized = list.map(normalizePromoOffer).filter(Boolean);
      if (normalized.length) {
        promoOffersCache = normalized;
        return promoOffersCache;
      }
      throw new Error('ad-data-empty');
    } catch (error) {
      promoOffersCache = SEED_PROMO_OFFERS.map(normalizePromoOffer).filter(Boolean);
      return promoOffersCache;
    }
  }

  function getPromoContext() {
    const body = document.body;
    const pageCategory = String(body?.getAttribute('data-post-category') || body?.getAttribute('data-category') || '').trim().toLowerCase();
    if (body?.matches('body[data-post-category]')) {
      return { pageType: 'post', category: pageCategory || inferCategoryFromPath(), slotKey: pageCategory ? `post-${pageCategory}` : 'post' };
    }
    if (path === '/') return { pageType: 'home', category: 'home', slotKey: 'home' };
    if (/^\/analysis\//i.test(path)) return { pageType: 'analysis', category: 'analysis', slotKey: 'analysis' };
    if (/^\/news\//i.test(path)) return { pageType: 'news', category: 'news', slotKey: 'news' };
    const hubCategory = inferCategoryFromPath();
    if (body?.hasAttribute('data-blog-hub') || hubCategory) {
      return { pageType: 'hub', category: hubCategory || 'common', slotKey: hubCategory ? `hub-${hubCategory}` : 'hub' };
    }
    return { pageType: 'default', category: hubCategory || 'common', slotKey: 'default' };
  }

  function inferCategoryFromPath() {
    if (/^\/casino\//i.test(path)) return 'casino';
    if (/^\/slot\//i.test(path)) return 'slot';
    if (/^\/bonus\//i.test(path)) return 'bonus';
    if (/^\/strategy\//i.test(path)) return 'strategy';
    if (/^\/analysis\//i.test(path)) return 'analysis';
    if (/^\/news\//i.test(path)) return 'news';
    if (/^\/play-guides\//i.test(path)) return 'guide';
    return '';
  }

  function getPromoLimits(context) {
    return PROMO_SLOT_LIMITS[context.pageType] || PROMO_SLOT_LIMITS.default;
  }

  function offerMatchesContext(offer, context) {
    if (!offer || offer.enabled === false) return false;
    if (window.innerWidth <= 980 && offer.mobile === false) return false;
    if (window.innerWidth > 980 && offer.desktop === false) return false;

    const targetPool = new Set(['all', context.pageType, context.slotKey]);
    if (context.category) {
      targetPool.add(context.category);
      targetPool.add(`hub-${context.category}`);
      targetPool.add(`post-${context.category}`);
    }

    const categoryPool = new Set(['all', 'common']);
    if (context.category) categoryPool.add(context.category);

    const targetOk = (offer.targets || []).some((item) => targetPool.has(String(item || '').toLowerCase()));
    const categoryOk = (offer.categories || []).some((item) => categoryPool.has(String(item || '').toLowerCase()));
    return targetOk && categoryOk;
  }

  function selectPromoOffers(offers, context) {
    const limits = getPromoLimits(context);
    const maxSlots = Math.max(4, limits.desktop, limits.mobile);
    const matching = offers.filter((offer) => offerMatchesContext(offer, context));
    const fallback = offers.filter((offer) => offer.enabled !== false && ((window.innerWidth <= 980 && offer.mobile !== false) || (window.innerWidth > 980 && offer.desktop !== false)));
    const source = (matching.length ? matching : fallback)
      .slice()
      .sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return a.title.localeCompare(b.title, 'ko');
      });
    return shufflePromoOffers(source).slice(0, Math.min(maxSlots, source.length));
  }

  function shufflePromoOffers(source) {
    const list = source.slice();
    const random = createPromoRandom();
    for (let idx = list.length - 1; idx > 0; idx -= 1) {
      const swapIdx = Math.floor(random() * (idx + 1));
      [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];
    }
    return list;
  }

  function createPromoRandom() {
    try {
      if (window.crypto?.getRandomValues) {
        const seed = new Uint32Array(1);
        window.crypto.getRandomValues(seed);
        let state = seed[0] || Date.now();
        return () => {
          state = (state * 1664525 + 1013904223) >>> 0;
          return state / 4294967296;
        };
      }
    } catch (e) {}
    let fallback = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    return () => {
      fallback = (fallback * 1664525 + 1013904223) >>> 0;
      return fallback / 4294967296;
    };
  }

  function buildPromoSection(kind, offers, context, options = {}) {
    const limits = getPromoLimits(context);
    const mobileInitial = Math.min(limits.mobile, offers.length);
    const hasMoreOnMobile = options.mobileCollapse !== false && offers.length > mobileInitial;
    const title = String(options.title || '추천 파트너').trim();
    const note = String(options.note || '페이지 성격에 맞는 광고만 자동으로 노출됩니다.').trim();

    const section = document.createElement('section');
    section.className = `auto-promo-zone ${kind === 'article' ? 'is-article' : 'is-page'}${options.position === 'bottom' ? ' is-bottom' : ' is-top'}`;
    section.setAttribute('aria-label', title || '추천 놀이터 안내');
    section.dataset.mobileCollapsed = hasMoreOnMobile ? 'true' : 'false';

    const container = document.createElement('div');
    container.className = 'container';

    const head = document.createElement('div');
    head.className = 'auto-promo-head';
    head.innerHTML = `
      <div>
        <p class="auto-promo-eyebrow">${title}</p>
        <p class="auto-promo-note">${note}</p>
      </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'auto-promo-grid';

    offers.forEach((offer, idx) => {
      const article = document.createElement('article');
      const extraMobile = idx >= mobileInitial;
      article.className = `auto-promo-card theme-${offer.theme || (idx % 2 ? 'amber' : 'mint')}${idx % 2 ? ' is-safe' : ''}${extraMobile ? ' is-extra' : ''}`;
      const listMarkup = offer.bullets.map((item) => `<li>${item}</li>`).join('');
      const isPrimaryExternal = /^https?:\/\//i.test(offer.primaryHref || '');
      const isSecondaryExternal = /^https?:\/\//i.test(offer.secondaryHref || '');
      const primaryAttrs = isPrimaryExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      const secondaryAttrs = isSecondaryExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
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
          <a class="auto-promo-btn secondary" href="${offer.secondaryHref}"${secondaryAttrs}>${offer.secondaryLabel}</a>
        </div>
      `;
      grid.appendChild(article);
    });

    container.appendChild(head);
    container.appendChild(grid);

    if (hasMoreOnMobile) {
      const toggleWrap = document.createElement('div');
      toggleWrap.className = 'auto-promo-toggle-wrap';
      toggleWrap.innerHTML = '<button class="auto-promo-toggle" type="button" data-promo-toggle aria-expanded="false">추천 파트너 더보기</button>';
      container.appendChild(toggleWrap);
    }

    section.appendChild(container);
    return section;
  }

  function insertAfter(target, node) {
    if (!target || !target.parentNode) return false;
    target.parentNode.insertBefore(node, target.nextSibling);
    return true;
  }

  function insertBefore(target, node) {
    if (!target || !target.parentNode) return false;
    target.parentNode.insertBefore(node, target);
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
    return !!main.querySelector('.auto-promo-zone[data-promo-position="top"], .auto-promo-zone[data-promo-position="bottom"]');
  }

  function pickPromoBottomAnchor(main) {
    if (!main) return null;
    const articleShell = main.querySelector('.article-shell');
    if (articleShell) {
      return articleShell.querySelector('.article-related') || articleShell.querySelector('.article-faq') || articleShell.querySelector('.article-body') || articleShell.lastElementChild;
    }
    const sections = Array.from(main.querySelectorAll(':scope > .section, :scope > section'));
    if (sections.length) return sections[sections.length - 1];
    return main.lastElementChild || main.firstElementChild;
  }

  async function mountInlinePromos() {
    const main = document.getElementById('mainContent') || document.querySelector('main');
    if (!main || hasExistingPromo(main)) return;
    const anchorInfo = pickPromoAnchor(main);
    if (!anchorInfo || !anchorInfo.target) return;
    const context = getPromoContext();
    const offers = selectPromoOffers(await loadPromoOffers(), context);
    if (!offers.length) return;
    injectPromoStyles();

    const topOffers = offers.slice(0, 2);
    const bottomOffers = offers.slice(2, 4);

    if (topOffers.length) {
      const topSection = buildPromoSection(anchorInfo.kind, topOffers, context, {
        title: '추천 파트너',
        note: '새로고침하거나 다시 접속하면 다른 광고 조합으로 바뀔 수 있습니다.',
        position: 'top',
        mobileCollapse: false
      });
      topSection.dataset.promoPosition = 'top';
      insertAfter(anchorInfo.target, topSection);
    }

    if (bottomOffers.length) {
      const bottomTarget = pickPromoBottomAnchor(main) || main.lastElementChild || anchorInfo.target;
      const bottomSection = buildPromoSection('page', bottomOffers, context, {
        title: '추가 추천 파트너',
        note: '페이지 하단에서 한 번 더 확인할 수 있도록 다른 광고 2건을 배치했습니다.',
        position: 'bottom',
        mobileCollapse: false
      });
      bottomSection.dataset.promoPosition = 'bottom';
      if (!insertAfter(bottomTarget, bottomSection)) {
        main.appendChild(bottomSection);
      }
    }
  }

  function copyPromoCode(code, button) {
    if (!code) return;
    const setStatus = (label) => {
      if (!button) return;
      const span = button.querySelector('span');
      if (span) span.textContent = label;
    };
    const original = button?.dataset.originalLabel || button?.textContent || '';
    if (button && !button.dataset.originalLabel) button.dataset.originalLabel = original.trim();
    const finish = () => {
      setStatus('복사 완료');
      window.setTimeout(() => setStatus(button?.dataset.originalLabel || original || '가입코드 복사'), 1500);
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
    if (button) {
      event.preventDefault();
      copyPromoCode(button.getAttribute('data-copy-code') || '', button);
      return;
    }
    const toggle = event.target.closest('[data-promo-toggle]');
    if (!toggle) return;
    event.preventDefault();
    const zone = toggle.closest('.auto-promo-zone');
    if (!zone) return;
    const expanded = zone.dataset.mobileCollapsed !== 'true';
    zone.dataset.mobileCollapsed = expanded ? 'true' : 'false';
    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    toggle.textContent = expanded ? '추천 파트너 더보기' : '추천 파트너 접기';
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



  function syncMobileArticleLinkLabels() {
    const isMobileLike = window.innerWidth <= 980;
    if (!document.body || !document.body.matches('body[data-post-category]')) return;

    const compactLinkLabel = (value) => {
      const raw = String(value || '').replace(/\s+/g, ' ').trim();
      if (!raw) return raw;
      const normalized = raw
        .replace(/관련 주제를 이어서 읽기 좋은 연결 글/g, '연결 글')
        .replace(/같이 보기 좋은 기본 자본 운영법/g, '기본 운영 글')
        .replace(/세션 중단 기준을 더 구체적으로 정리한 글/g, '중단 기준 글')
        .replace(/출금 전 확인 흐름을 묶은 글/g, '출금 확인 글')
        .replace(/보너스 조건을 기본부터 정리한 글/g, '조건 정리 글')
        .replace(/실전 전후 점검용으로 같이 보기 좋은 글/g, '점검 글')
        .replace(/가장 기본이 되는 베팅 단위 접근/g, '기본 단위 글')
        .replace(/흐름을 묶은 글/g, '흐름 글')
        .replace(/관련 글$/g, '연결 글');
      if (normalized.length <= 14) return normalized;
      return normalized.slice(0, 13).trim() + '…';
    };

    document.querySelectorAll('body[data-post-category] .related-card').forEach((card) => {
      if (isMobileLike) card.setAttribute('data-mobile-cta', '읽기');
      else card.removeAttribute('data-mobile-cta');
    });

    document.querySelectorAll('body[data-post-category] .inline-links a').forEach((link) => {
      const raw = (link.textContent || '').replace(/\s+/g, ' ').trim();
      if (!raw) return;
      if (!link.dataset.fullText) link.dataset.fullText = raw;
      const full = link.dataset.fullText;
      link.setAttribute('title', full);
      if (isMobileLike) {
        link.textContent = compactLinkLabel(full);
        link.setAttribute('aria-label', full);
      } else {
        link.textContent = full;
        link.removeAttribute('aria-label');
      }
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
  syncMobileArticleLinkLabels();
  window.addEventListener('resize', syncMobilePostMetaLabels, { passive: true });
  window.addEventListener('resize', syncMobileArticleSectionTitles, { passive: true });
  window.addEventListener('resize', syncMobileArticleLinkLabels, { passive: true });
})();
