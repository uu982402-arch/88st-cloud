
(() => {
  const grid = document.getElementById('newsGrid');
  const updatedAt = document.getElementById('newsUpdatedAt');
  const refreshBtn = document.getElementById('newsRefreshBtn');
  const chips = Array.from(document.querySelectorAll('.filter-chip'));
  if (!grid || !updatedAt) return;

  let items = [];
  let activeFilter = 'all';

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
      const res = await fetch(`/api/news?limit=8${force ? '&refresh=1' : ''}`, { headers: { 'accept': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      items = Array.isArray(data.items) ? data.items : [];
      applyFilter(activeFilter);
      const stamp = data.generatedAt ? fmt.format(new Date(data.generatedAt)) : fmt.format(new Date());
      updatedAt.textContent = `최근 업데이트 ${stamp}`;
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
  load(false);
})();
