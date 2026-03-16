(() => {
  const grid = document.getElementById('newsGrid');
  const updatedAt = document.getElementById('newsUpdatedAt');
  const refreshBtn = document.getElementById('newsRefreshBtn');
  const chips = Array.from(document.querySelectorAll('.filter-chip'));
  const modal = document.getElementById('promoSiteModal');
  const modalTitle = document.getElementById('promoModalTitle');
  const modalDesc = document.getElementById('promoModalDesc');
  const modalCode = document.getElementById('promoModalCode');
  const modalBenefit = document.getElementById('promoModalBenefit');
  const modalNotice = document.getElementById('promoModalNotice');
  const modalMoveBtn = document.getElementById('promoMoveSiteBtn');
  const modalCopyBtn = document.getElementById('promoCopyCodeBtn');
  const promoCards = Array.from(document.querySelectorAll('.promo-site'));
  if (!grid || !updatedAt) return;

  let items = [];
  let activeFilter = 'all';
  let activePromo = null;

  const fmt = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  function toast(message) {
    if (!message) return;
    let host = document.getElementById('promoToastHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'promoToastHost';
      host.style.position = 'fixed';
      host.style.left = '50%';
      host.style.bottom = '22px';
      host.style.transform = 'translateX(-50%)';
      host.style.zIndex = '180';
      document.body.appendChild(host);
    }
    const item = document.createElement('div');
    item.textContent = message;
    item.style.cssText = 'padding:12px 14px;border-radius:14px;background:rgba(7,17,31,.92);color:#fff;box-shadow:0 18px 42px rgba(0,0,0,.32);margin-top:8px;border:1px solid rgba(255,255,255,.08)';
    host.appendChild(item);
    setTimeout(() => item.remove(), 1800);
  }

  async function copyText(value) {
    if (!value) return false;
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        textarea.remove();
        return ok;
      } catch (_) {
        return false;
      }
    }
  }

  function openPromoModal(data) {
    if (!modal || !data) return;
    activePromo = data;
    modalTitle.textContent = `${data.title} 사이트 이동 안내`;
    modalDesc.textContent = '사이트 이동 전 아래 가입코드와 안내 문구를 먼저 확인해 주세요.';
    modalCode.textContent = data.code || '-';
    modalBenefit.textContent = data.benefit || '혜택 안내가 준비되지 않았습니다.';
    modalNotice.textContent = data.notice || `코드 : ${data.code || '-'} 입력 해야합니다.`;
    modalMoveBtn.href = data.link || '#';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closePromoModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function bindPromoCards() {
    promoCards.forEach((card) => {
      const data = {
        title: card.dataset.adTitle || '사이트',
        code: card.dataset.adCode || '',
        link: card.dataset.adLink || '#',
        benefit: card.dataset.adBenefit || '',
        notice: card.dataset.adNotice || ''
      };
      const open = () => openPromoModal(data);
      card.addEventListener('click', (event) => {
        if (event.target.closest('a')) return;
        event.preventDefault();
        open();
      });
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      });
      const btn = card.querySelector('.promo-open-btn');
      btn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        open();
      });
    });

    modal?.addEventListener('click', (event) => {
      if (event.target.closest('[data-close="1"]')) closePromoModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal?.classList.contains('is-open')) closePromoModal();
    });

    modalCopyBtn?.addEventListener('click', async () => {
      if (!activePromo?.code) return;
      const ok = await copyText(activePromo.code);
      toast(ok ? `코드 ${activePromo.code} 복사됨` : '코드 복사 실패');
    });

    modalMoveBtn?.addEventListener('click', async () => {
      if (activePromo?.code) {
        await copyText(activePromo.code);
      }
      closePromoModal();
    });
  }

  function render(list) {
    if (!list.length) {
      grid.innerHTML = '<div class="empty-state">표시할 뉴스가 없습니다. 다른 카테고리를 선택하거나 새로고침해 주세요.</div>';
      return;
    }

    grid.innerHTML = list.map((item) => {
      const source = item.source || 'ESPN';
      const category = item.category || '일반';
      const summary = item.summary || '해당 기사 링크를 열어 자세한 내용을 확인할 수 있습니다.';
      const published = item.publishedAt ? fmt.format(new Date(item.publishedAt)) : '방금 갱신';
      return `
        <article class="news-card" data-category="${escapeHtml(category)}">
          <div class="news-meta">
            <span class="news-badge">${escapeHtml(category)}</span>
            <span>${escapeHtml(source)}</span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(summary)}</p>
          <div class="news-meta">
            <span>${escapeHtml(published)} 기준</span>
            <a class="text-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">원문 보기</a>
          </div>
        </article>
      `;
    }).join('');
  }

  function applyFilter(filter) {
    activeFilter = filter;
    chips.forEach((chip) => chip.classList.toggle('is-active', chip.dataset.filter === filter));
    const list = filter === 'all' ? items : items.filter((item) => (item.category || '일반') === filter);
    render(list);
  }

  async function load(force = false) {
    refreshBtn?.setAttribute('disabled', 'disabled');
    updatedAt.textContent = '뉴스 불러오는 중…';
    try {
      const res = await fetch(`/api/news?limit=8${force ? '&refresh=1' : ''}`, { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      items = Array.isArray(data.items) ? data.items : [];
      applyFilter(activeFilter);
      const stamp = data.generatedAt ? fmt.format(new Date(data.generatedAt)) : fmt.format(new Date());
      const sourceLine = Array.isArray(data.sources) && data.sources.length ? ` · ${data.sources.join(' + ')}` : '';
      updatedAt.textContent = `최근 업데이트 ${stamp}${sourceLine}`;
    } catch (err) {
      items = [
        { category: '일반', source: '88ST', title: '뉴스 연결이 지연되고 있습니다', summary: '잠시 후 새로고침하거나 스포츠 분석기와 텔레그램 스포츠 봇으로 바로 이동할 수 있습니다.', link: '/analysis/' },
        { category: '축구', source: '88ST', title: '스포츠 분석기로 바로 이동', summary: '현재 뉴스 피드 연결이 지연될 경우 웹 분석기에서 즉시 분석을 시작할 수 있습니다.', link: '/analysis/' },
        { category: '일반', source: '88ST', title: '텔레그램 스포츠 봇 허브 이동', summary: '텔레그램 기반 흐름이 필요하면 봇 허브 페이지에서 바로 연결할 수 있습니다.', link: '/odds/' }
      ];
      applyFilter(activeFilter);
      updatedAt.textContent = '일시적으로 대체 카드 표시 중';
    } finally {
      refreshBtn?.removeAttribute('disabled');
    }
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => applyFilter(chip.dataset.filter || 'all'));
  });

  refreshBtn?.addEventListener('click', () => load(true));
  bindPromoCards();
  load(false);
})();
