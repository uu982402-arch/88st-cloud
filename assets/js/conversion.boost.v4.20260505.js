(() => {
  const DATA_URL = '/assets/data/conversion.boost.v4.20260505.json';
  let config = null;
  let safeClickTarget = null;

  const h = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  })[c]);

  const track = (name, params = {}) => {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, {
          event_category: 'conversion_boost',
          page_path: location.pathname,
          ...params
        });
      }
    } catch (_) {}
  };

  const copy = async (text) => {
    const value = String(text || '');
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (__) {}
      ta.remove();
      return true;
    }
  };

  const toast = (message) => {
    let el = document.querySelector('.conversion-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'conversion-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('is-show'), 1600);
  };

  const findProvider = (slugOrName) => {
    const key = String(slugOrName || '').toLowerCase();
    return (config?.providers || []).find(p =>
      String(p.slug || '').toLowerCase() === key ||
      String(p.name || '').toLowerCase().includes(key)
    ) || null;
  };

  const variant = () => {
    const labels = config?.ab?.launcherLabels || ['자동상담'];
    let v = localStorage.getItem('88st_consult_launcher_variant');
    if (!v || !labels.includes(v)) {
      v = labels[Math.floor(Math.random() * labels.length)];
      localStorage.setItem('88st_consult_launcher_variant', v);
      track('consult_launcher_variant_set', { label: v });
    }
    return v;
  };

  const applyLauncherVariant = () => {
    const btn = document.querySelector('.auto-consult-launcher');
    if (!btn || btn.dataset.variantApplied) return;
    const label = variant();
    btn.textContent = label;
    btn.dataset.variantApplied = '1';
    btn.dataset.gaTrack = 'consult_launcher_click';
    btn.setAttribute('aria-label', `${label} 열기`);
    track('consult_launcher_variant_view', { label });
  };

  const observeLauncher = () => {
    applyLauncherVariant();
    const mo = new MutationObserver(applyLauncherVariant);
    mo.observe(document.body, { childList: true, subtree: true });
  };

  const providerFromElement = (el) => {
    const slug = el.getAttribute('data-provider') || el.closest('[data-provider]')?.getAttribute('data-provider') || '';
    return findProvider(slug) || {
      name: '보증업체',
      code: el.getAttribute('data-consult-open') || '',
      officialDomain: new URL(el.href, location.origin).hostname,
      officialUrl: el.href
    };
  };

  const ensureSafeClickModal = () => {
    if (document.querySelector('.safe-click-modal')) return;
    const modal = document.createElement('div');
    modal.className = 'safe-click-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="safe-click-backdrop" data-safe-close></div>
      <section class="safe-click-sheet" role="dialog" aria-modal="true" aria-label="공식주소 이동 전 확인">
        <button type="button" class="safe-click-close" data-safe-close aria-label="닫기">×</button>
        <span class="pro-kicker">세이프클릭</span>
        <h2>이동 전 확인하세요</h2>
        <p class="safe-click-desc">가입코드를 복사했습니다. 이동 후 사이트에서 코드 입력 여부와 이벤트 조건을 다시 확인하세요.</p>
        <div class="safe-click-kv">
          <div><b>업체명</b><span data-safe-name>-</span></div>
          <div><b>가입코드</b><span data-safe-code>-</span></div>
          <div><b>공식주소</b><span data-safe-domain>-</span></div>
        </div>
        <div class="safe-click-actions">
          <button type="button" class="pro-btn pro-btn--primary" data-safe-confirm>확인 후 이동</button>
          <a class="pro-btn" href="https://t.me/seoa69" target="_blank" rel="nofollow noopener" data-safe-telegram>상담 먼저 하기</a>
        </div>
      </section>`;
    document.body.appendChild(modal);
  };

  const openSafeClick = async (anchor) => {
    ensureSafeClickModal();
    const p = providerFromElement(anchor);
    const code = anchor.getAttribute('data-consult-open') || p.code || '';
    safeClickTarget = { url: anchor.href, provider: p, code };
    if (code) await copy(code);
    const modal = document.querySelector('.safe-click-modal');
    modal.querySelector('[data-safe-name]').textContent = p.name || '보증업체';
    modal.querySelector('[data-safe-code]').textContent = code || '-';
    modal.querySelector('[data-safe-domain]').textContent = p.officialDomain || new URL(anchor.href, location.origin).hostname;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    track('safe_click_open', { provider: p.slug || p.name || '', code });
  };

  const closeSafeClick = () => {
    const modal = document.querySelector('.safe-click-modal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    safeClickTarget = null;
  };

  const bindSafeClick = () => {
    document.addEventListener('click', (event) => {
      const a = event.target.closest('a[data-consult-open]');
      if (!a || !a.href) return;
      if (a.dataset.safeBypass === '1') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openSafeClick(a);
    }, true);

    document.addEventListener('click', async (event) => {
      if (event.target.closest('[data-safe-close]')) {
        event.preventDefault();
        track('safe_click_cancel');
        closeSafeClick();
      }
      if (event.target.closest('[data-safe-confirm]')) {
        event.preventDefault();
        if (safeClickTarget) {
          if (safeClickTarget.code) await copy(safeClickTarget.code);
          track('safe_click_confirm', { provider: safeClickTarget.provider?.slug || safeClickTarget.provider?.name || '', code: safeClickTarget.code || '' });
          window.open(safeClickTarget.url, '_blank', 'noopener');
          closeSafeClick();
        }
      }
      if (event.target.closest('[data-safe-telegram]')) {
        track('safe_click_telegram');
      }
    });
  };

  const providerOptions = () => (config?.providers || []).map(p => `<option value="${h(p.slug)}">${h(p.name)} · ${h(p.code)}</option>`).join('');
  const typeOptions = () => (config?.inquiryTypes || []).map(t => `<option value="${h(t.id)}">${h(t.label)}</option>`).join('');

  const buildInquiry = (provider, typeId, extra='') => {
    const type = (config?.inquiryTypes || []).find(t => t.id === typeId) || config?.inquiryTypes?.[0];
    const p = provider || {};
    return `안녕하세요.\n${p.name || '보증업체'} ${type?.label || '가입 문의'}드립니다.\n\n가입코드: ${p.code || ''}\n확인 요청: ${type?.request || '공식주소 / 이벤트 조건 / 출금 조건'}\n상담 경로: 88ST.Cloud\n${extra ? `\n추가 메모: ${extra}` : ''}`;
  };

  const bindInquiryBuilder = () => {
    const root = document.querySelector('[data-inquiry-builder]');
    if (!root) return;
    root.innerHTML = `
      <form class="customer-os-card customer-tool-form" data-inquiry-form>
        <h2>텔레그램 문의 문구 생성</h2>
        <label>업체 선택<select name="provider">${providerOptions()}</select></label>
        <label>문의 유형<select name="type">${typeOptions()}</select></label>
        <label>추가 메모<textarea name="extra" placeholder="확인받고 싶은 내용을 짧게 입력하세요."></textarea></label>
        <div class="customer-os-actions">
          <button class="pro-btn pro-btn--primary" type="submit">문구 만들기</button>
          <button class="pro-btn" type="button" data-copy-inquiry>문구 복사</button>
          <a class="pro-btn" href="https://t.me/seoa69" target="_blank" rel="nofollow noopener">상담 이동</a>
        </div>
        <pre class="customer-tool-result" data-inquiry-output>업체와 문의 유형을 선택한 뒤 문구를 만들어 주세요.</pre>
      </form>`;
    const form = root.querySelector('[data-inquiry-form]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const slug = form.provider.value;
      const type = form.type.value;
      const p = findProvider(slug);
      const out = root.querySelector('[data-inquiry-output]');
      out.textContent = buildInquiry(p, type, form.extra.value.trim());
      track('inquiry_builder_generate', { provider: slug, type });
    });
    root.addEventListener('click', async (event) => {
      if (event.target.closest('[data-copy-inquiry]')) {
        event.preventDefault();
        const text = root.querySelector('[data-inquiry-output]')?.textContent || '';
        if (text && !text.includes('선택한 뒤')) {
          await copy(text);
          toast('문의 문구 복사 완료');
          track('inquiry_builder_copy');
        }
      }
    });
  };

  const addProviderEventCards = () => {
    const targets = document.querySelectorAll('[data-provider-event-card]');
    targets.forEach(target => {
      const slug = target.getAttribute('data-provider-event-card');
      const cards = config?.eventCards?.[slug] || [];
      if (!cards.length) return;
      target.innerHTML = cards.map(c => `<div class="provider-condition-card"><b>${h(c.label)}</b><span>${h(c.value)}</span></div>`).join('');
    });
  };

  const inferBlogCta = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('sk-holdings')) return { title:'SK 홀딩스 IRON888 상담 루트', desc:'가입코드, 이벤트 조건, 공식주소 확인을 한 번에 정리합니다.', href:'/consult/sk-holdings/', primary:'IRON888 가입 안내' };
    if (path.includes('queenbee')) return { title:'여왕벌 SEOA 상담 루트', desc:'SEOA 코드와 상담·자동상담 봇 연결을 확인합니다.', href:'/consult/queenbee/', primary:'SEOA 가입 안내' };
    if (path.includes('anybet')) return { title:'ANY BET SEOA 상담 루트', desc:'원화·테더 이벤트 조건과 가입코드를 확인합니다.', href:'/consult/anybet/', primary:'ANY BET 안내' };
    if (path.includes('udt')) return { title:'UDT SEOA 상담 루트', desc:'슬롯·스포츠·미니게임 이벤트 조건을 확인합니다.', href:'/consult/udt/', primary:'UDT 안내' };
    if (path.includes('ddangkong') || path.includes('땅콩')) return { title:'땅콩 ddk888 상담 루트', desc:'BTI 스포츠·카지노·슬롯게임 이벤트 조건을 확인합니다.', href:'/consult/ddangkong/', primary:'땅콩 안내' };
    if (path.includes('payout-risk') || path.includes('withdraw')) return { title:'출금 전 증거 키트', desc:'출금 전 필요한 캡처 자료와 문의문을 정리합니다.', href:'/tools/payout-kit/', primary:'증거 키트 열기' };
    if (path.includes('first-charge') || path.includes('recharge') || path.includes('payback') || path.includes('bonus') || path.includes('event')) return { title:'이벤트 조건 판독기', desc:'입금액, 보너스율, 롤링 기준을 넣어 필요 롤링을 확인합니다.', href:'/tools/event-checker/', primary:'조건 계산하기' };
    if (path.includes('sports-toto') || path.includes('baseball') || path.includes('football') || path.includes('basketball') || path.includes('volleyball')) return { title:'스포츠 배당분석 봇 안내', desc:'@odds88st_bot에서 스포츠 배당분석 안내를 받을 수 있습니다.', href:'https://t.me/odds88st_bot', primary:'분석봇 열기' };
    if (path.includes('affiliate')) return { title:'총판 조건 확인 루트', desc:'정산 기준, 코드 관리, 보류 조건을 확인한 뒤 문의문을 정리합니다.', href:'/tools/inquiry-builder/', primary:'문의문 만들기' };
    return null;
  };

  const addAdvancedBlogCta = () => {
    const article = document.querySelector('.pro-article__body');
    if (!article || document.querySelector('.conversion-cta')) return;
    const cta = inferBlogCta();
    if (!cta) return;
    const box = document.createElement('section');
    box.className = 'conversion-card conversion-cta';
    const external = cta.href.startsWith('http');
    box.innerHTML = `
      <span class="pro-kicker">다음 단계</span>
      <h2>${h(cta.title)}</h2>
      <p>${h(cta.desc)}</p>
      <div class="customer-os-actions">
        <a class="pro-btn pro-btn--primary" href="${h(cta.href)}" ${external ? 'target="_blank" rel="nofollow noopener"' : ''} data-ga-track="advanced_blog_cta_click">${h(cta.primary)}</a>
        <a class="pro-btn" href="/tools/inquiry-builder/">문의 문구 만들기</a>
        <button class="pro-btn" data-auto-consult-open="provider">자동상담 열기</button>
      </div>`;
    article.appendChild(box);
  };

  const init = async () => {
    try {
      config = await fetch(DATA_URL, { cache: 'no-store' }).then(r => r.json());
    } catch (_) {
      config = { providers: [], inquiryTypes: [] };
    }
    observeLauncher();
    bindSafeClick();
    bindInquiryBuilder();
    addProviderEventCards();
    addAdvancedBlogCta();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
