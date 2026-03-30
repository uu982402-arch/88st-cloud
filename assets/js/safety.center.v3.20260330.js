(() => {
  const body = document.body;
  if (!body) return;

  const OFFERS = [
    {
      id: 'yangsim-main', slug: 'yangsim', shortName: '양심', title: '양심', displayTitle: '안전한토토사이트 양심',
      kicker: 'Search-first entry', oneLine: '검색 흔적과 도메인 이력을 먼저 확인하기 좋게 정리한 결과 페이지입니다.',
      perks: ['스포츠·슬롯 10%', '카지노·미니게임 5%', '출석·룰렛·이사 지원'],
      tags: ['검색 우선', '도메인 체크', '정적 결과'], categories: ['search','bonus','result'], benefitRank: 93,
      bullets: ['스포츠·슬롯 첫충·매충 10%', '카지노·미니게임 충전 5%', '출석·룰렛·이사 지원'],
      code: 'KAKA', theme: 'amber', href: 'https://평생양심.com/', domain: '평생양심.com', lookupDomain: 'xn--9g4bs1b95c7tw.com',
      rewardSummary: '스포츠·슬롯 10%, 카지노·미니게임 5%, 출석·룰렛·이사 지원',
      statusLabel: '검색 우선형', verdict: '검색 흔적 우선 확인',
      summary: '검색 흔적과 도메인 이력을 먼저 보고 코드 복사와 공식 주소 진입까지 이어지게 만든 브랜드 결과 동선입니다.'
    },
    {
      id: 'seven-main', slug: 'chilbet', shortName: '칠벳', title: '칠벳', displayTitle: '칠땡잡이 승부사이트 칠벳',
      kicker: 'Review comparison', oneLine: '검색어와 도메인 이력을 함께 보고 판단하기 좋게 정리한 카드형 결과 랜딩입니다.',
      perks: ['입금플러스 이벤트', '무제한 20%', '돌발 20%·페이백 5%'],
      tags: ['후기 비교', '혜택 요약', '검색 5종'], categories: ['search','bonus','featured'], benefitRank: 91,
      bullets: ['입금플러스 이벤트', '환전 없을 시 무제한 20%', '돌발 20%·페이백 5%'],
      code: '6767', theme: 'mint', href: 'https://82clf.com/', domain: '82clf.com', lookupDomain: '82clf.com',
      rewardSummary: '입금플러스, 무제한 20%, 돌발 20%, 페이백 5%',
      statusLabel: '후기 비교형', verdict: '후기 패턴 비교',
      summary: '광고카드에서 바로 공식 주소로 가지 않고, 먼저 검색 흔적과 기본 도메인 이력을 확인하게 연결한 구조입니다.'
    },
    {
      id: 'vegas-main', slug: 'vegas', shortName: '베가스', title: '베가스', displayTitle: '라스베가스의 진정한 승부사 베가스',
      kicker: 'History + review', oneLine: '후기 패턴과 도메인 이력을 함께 보려는 사용자에게 맞춘 프리미엄 결과 랜딩입니다.',
      perks: ['입금플러스', '무제한 20%', '돌발 20%·페이백 5%'],
      tags: ['이력 병행', '결과 중심', '공유 링크'], categories: ['search','featured','result'], benefitRank: 89,
      bullets: ['입금플러스 이벤트', '무제한 20%', '돌발 20%·페이백 5%'],
      code: '6789', theme: 'red', href: 'https://las302.com/', domain: 'las302.com', lookupDomain: 'las302.com',
      rewardSummary: '입금플러스, 무제한 20%, 돌발 20%, 페이백 5%',
      statusLabel: '이력 병행형', verdict: '이력·후기 병행',
      summary: '브랜드명 검색과 도메인 검사, 결과 공유 링크 생성을 하나로 묶어 전환 흐름을 매끄럽게 만든 페이지입니다.'
    },
    {
      id: 'avengers-main', slug: 'avengers', shortName: '어벤저스벳', title: '어벤저스벳', displayTitle: '믿고 이용하는 어벤저스벳',
      kicker: 'Consult + entry', oneLine: '상담 연결과 실사용 점검 포인트를 함께 남겨두는 브랜드 결과판입니다.',
      perks: ['신규 첫충·정착 이벤트', 'USDT·원화 입금', '심야충전·콤프·페이백'],
      tags: ['상담 연동', '입출금 체크', '코드 복사'], categories: ['bonus','featured','result'], benefitRank: 90,
      bullets: ['신규 첫충·정착 이벤트', 'USDT·원화 입금 가능', '심야충전·콤프·페이백'],
      code: '6789', theme: 'jaju', href: 'https://av-bet.com/', domain: 'av-bet.com', lookupDomain: 'av-bet.com',
      rewardSummary: '신규 첫충, 정착 이벤트, USDT·원화 입금, 심야충전·콤프',
      statusLabel: '상담 연동형', verdict: '상담·입출금 병행',
      summary: '운영자 상담과 연결되더라도 같은 결과판을 바로 다시 열 수 있게 코드, 공식 주소, 검사 링크를 함께 배치했습니다.'
    }
  ];

  const GOOGLE_TEMPLATES = [
    { label: '먹튀 사례 조회', suffix: '먹튀' },
    { label: '먹튀검증 검색', suffix: '먹튀검증' },
    { label: '후기 검색', suffix: '후기' },
    { label: '도메인 변경 이력', suffix: '도메인 변경' },
    { label: '텔레그램/커뮤니티 검색', suffix: '텔레그램' },
    { label: '보증/메이저 검색', suffix: '메이저' }
  ];

  const $ = (sel, el = document) => el.querySelector(sel);

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function showToast(message) {
    let toast = document.getElementById('safetyToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'safetyToast';
      toast.className = 'safety-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('is-show'), 1800);
  }

  async function copyText(text, success = '복사되었습니다.') {
    try {
      await navigator.clipboard.writeText(String(text || ''));
      showToast(success);
      return true;
    } catch (err) {
      const input = document.createElement('textarea');
      input.value = String(text || '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.focus();
      input.select();
      try {
        document.execCommand('copy');
        showToast(success);
        return true;
      } catch (e) {
        showToast('복사에 실패했습니다. 직접 복사해 주세요.');
      } finally {
        input.remove();
      }
    }
    return false;
  }

  function normalizeDomain(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const normalizedUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
      const url = new URL(normalizedUrl);
      let host = String(url.hostname || '').trim().toLowerCase();
      host = host.replace(/^www\./, '').replace(/\.$/, '');
      if (!host.includes('.')) return '';
      return host;
    } catch (err) {
      const fallback = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0].split('#')[0].replace(/:\d+$/, '');
      return fallback.includes('.') ? fallback.toLowerCase() : '';
    }
  }

  function buildGoogleUrl(query) {
    return 'https://www.google.com/search?q=' + encodeURIComponent(query);
  }

  function formatShortDate(value) {
    if (!value) return '-';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return String(value);
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(dt);
  }

  function formatAge(days) {
    const num = Number(days || 0);
    if (!Number.isFinite(num) || num <= 0) return '-';
    if (num < 30) return `${num}일`;
    if (num < 365) return `${Math.round(num / 30)}개월`;
    return `${(num / 365).toFixed(1)}년`;
  }

  function levelClass(level) {
    if (level === 'high') return 'high';
    if (level === 'warn') return 'warn';
    return 'low';
  }

  function verdictClass(verdict) {
    if (verdict === '주의 필요') return 'caution';
    if (verdict === '추가 확인') return 'watch';
    return 'safe';
  }

  function brandPagePath(offer) {
    return `/muktu-police/brand/${offer.slug}/`;
  }

  function checkPath(offer) {
    return `/muktu-police/check/?domain=${encodeURIComponent(offer.lookupDomain || offer.domain || '')}`;
  }

  function reportPath(offer) {
    return `/muktu-police/report/?domain=${encodeURIComponent(offer.lookupDomain || offer.domain || '')}`;
  }

  function renderPromoGrid() {
    document.querySelectorAll('[data-safety-promos]').forEach((grid) => {
      grid.innerHTML = OFFERS.map((offer, index) => `
        <article class="promo-showcase-card" data-theme="${escapeHtml(offer.theme)}" data-order="${index + 1}" data-brand="${escapeHtml(offer.shortName)}" data-code="${escapeHtml(offer.code)}" data-benefit-rank="${escapeHtml(offer.benefitRank || 0)}" data-categories="${escapeHtml((offer.categories || []).join('|'))}">
          <div class="promo-showcase-mark">0${index + 1}</div>
          <div class="promo-showcase-head">
            <div class="promo-showcase-brand">
              <span class="promo-showcase-kicker">${escapeHtml(offer.kicker)}</span>
              <div class="promo-showcase-title">
                <div><h3><a href="${escapeHtml(brandPagePath(offer))}">${escapeHtml(offer.title)}</a></h3></div>
                <span class="promo-showcase-badge is-brand">${escapeHtml(offer.statusLabel)}</span>
              </div>
              <p class="promo-showcase-oneline">${escapeHtml(offer.oneLine || offer.summary)}</p>
            </div>
          </div>
          <div class="promo-showcase-badges">
            <span class="promo-showcase-badge is-brand">먼저 볼 것 · ${escapeHtml(offer.verdict)}</span>
            ${(offer.tags || []).slice(0, 2).map((tag) => `<span class="promo-showcase-badge">${escapeHtml(tag)}</span>`).join('')}
          </div>
          <div class="promo-showcase-meta">
            <span class="meta-pill">공식 도메인 · ${escapeHtml(offer.domain)}</span>
            <span class="meta-pill">가입코드 · ${escapeHtml(offer.code)}</span>
            <span class="meta-pill">결과 페이지 · ${escapeHtml(offer.shortName)}</span>
          </div>
          <div class="promo-showcase-perks">
            ${(offer.perks || offer.bullets || []).slice(0, 3).map((item, perkIndex) => `<div class="promo-showcase-perk"><span>혜택 ${perkIndex + 1}</span><strong>${escapeHtml(item)}</strong></div>`).join('')}
          </div>
          <div class="promo-showcase-foot">
            <a class="promo-showcase-link" href="${escapeHtml(brandPagePath(offer))}">결과 페이지 보기 →</a>
            <div class="promo-showcase-actions">
              <button class="safety-copy-btn mint luxury-copy" type="button" data-copy-code="${escapeHtml(offer.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button>
              <a class="safety-link-btn ghost" href="${escapeHtml(offer.href)}" target="_blank" rel="noopener noreferrer">공식주소 이동</a>
            </div>
          </div>
        </article>
      `).join('');
    });
  }

  function renderBrandDirectory() {
    document.querySelectorAll('[data-brand-grid]').forEach((grid) => {
      grid.innerHTML = OFFERS.map((offer) => `
        <article class="brand-card" data-theme="${escapeHtml(offer.theme)}">
          <div class="brand-topline">
            <span class="promo-kicker">${escapeHtml(offer.shortName)} 결과판</span>
            <span class="brand-status">${escapeHtml(offer.statusLabel)}</span>
          </div>
          <h3>${escapeHtml(offer.title)}</h3>
          <p>${escapeHtml(offer.oneLine || offer.rewardSummary)}</p>
          <div class="brand-chip-row">
            <span class="brand-chip">${escapeHtml(offer.verdict)}</span>
            <span class="brand-chip">검색 키워드 연결</span>
            <span class="brand-chip">도메인 검사 연결</span>
          </div>
          <div class="brand-stats">
            <div class="brand-stat"><span>공식 도메인</span><strong>${escapeHtml(offer.domain)}</strong></div>
            <div class="brand-stat"><span>가입코드</span><strong>${escapeHtml(offer.code)}</strong></div>
            <div class="brand-stat"><span>권장 순서</span><strong>검색 → 검사 → 이동</strong></div>
          </div>
          <div class="promo-actions">
            <a class="safety-link-btn" href="${escapeHtml(brandPagePath(offer))}">결과 보기</a>
            <a class="safety-link-btn ghost" href="${escapeHtml(checkPath(offer))}">도메인 검사</a>
          </div>
        </article>
      `).join('');
    });
  }

  function wireCopyButtons() {
    document.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-copy-code], [data-copy-text]');
      if (!btn) return;
      const text = btn.getAttribute('data-copy-code') || btn.getAttribute('data-copy-text') || '';
      copyText(text, '클립보드에 복사했습니다.');
    });
  }

  function renderSearchResults(keyword) {
    const target = $('#googleQueryResults');
    if (!target) return;
    const term = String(keyword || '').trim();
    if (!term) {
      target.innerHTML = '<div class="empty-state"><strong>검색어를 먼저 입력해 주세요.</strong>사이트명 또는 도메인을 넣으면 먹튀·후기·메이저 관련 구글링 버튼이 생성됩니다.</div>';
      return;
    }
    target.innerHTML = `<div class="search-result-grid">${GOOGLE_TEMPLATES.map((item) => {
      const query = `${term} ${item.suffix}`.trim();
      return `<article class="search-result-card"><h3>${escapeHtml(item.label)}</h3><p>${escapeHtml(query)} 로 구글 검색을 바로 실행합니다.</p><div class="query-actions"><a class="safety-link-btn" href="${buildGoogleUrl(query)}" target="_blank" rel="noopener noreferrer">구글에서 보기</a><button class="safety-copy-btn ghost" type="button" data-copy-text="${escapeHtml(query)}">검색어 복사</button></div></article>`;
    }).join('')}</div>`;
  }

  function wireSearchPage() {
    const form = $('#googleQueryForm');
    const input = $('#siteKeywordInput');
    if (!form || !input) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      renderSearchResults(input.value);
    });

    document.querySelectorAll('[data-search-keyword]').forEach((chip) => {
      chip.addEventListener('click', () => {
        input.value = chip.getAttribute('data-search-keyword') || '';
        renderSearchResults(input.value);
      });
    });

    const urlKeyword = new URL(location.href).searchParams.get('q');
    if (urlKeyword) {
      input.value = urlKeyword;
      renderSearchResults(urlKeyword);
    } else {
      renderSearchResults('');
    }
  }

  function wireDomainPresetButtons() {
    document.querySelectorAll('[data-domain-preset]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const target = document.querySelector(chip.getAttribute('data-domain-target') || '');
        if (!target) return;
        target.value = chip.getAttribute('data-domain-preset') || '';
        const form = target.closest('form');
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      });
    });
  }

  async function fetchLookup(domain) {
    const res = await fetch(`/api/safety/domain?domain=${encodeURIComponent(domain)}`, { cache: 'no-store' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.ok === false) {
      throw new Error(json.message || json.error || 'lookup_failed');
    }
    return json;
  }

  function renderLookup(payload, target, options = {}) {
    if (!target) return;
    const data = payload || {};
    const summary = data.summary || {};
    const dns = data.dns || {};
    const rdap = data.rdap || {};
    const cluster = data.cluster || {};
    const signals = Array.isArray(data.signals) ? data.signals : [];
    const queryUrl = `/muktu-police/report/?domain=${encodeURIComponent(data.domain || '')}`;

    target.innerHTML = `
      <div class="result-panel">
        <div class="result-head">
          <div>
            <div class="risk-chip ${verdictClass(summary.verdict)}">${escapeHtml(summary.verdict || '확인 필요')}</div>
            <h2>${escapeHtml(data.domain || '-')}</h2>
            <p>${escapeHtml(summary.commentary || '등록일, 만료일, 네임서버, A 레코드, IP 위치를 한 번에 정리한 결과입니다.')}</p>
          </div>
          <div class="query-actions">
            <a class="safety-link-btn" href="${escapeHtml(queryUrl)}">결과 페이지 열기</a>
            <button class="safety-copy-btn ghost" type="button" data-copy-text="${escapeHtml(location.origin + queryUrl)}">결과 링크 복사</button>
          </div>
        </div>
        <div class="metric-grid">
          <article class="metric-card"><span class="kicker">도메인 생성 후</span><strong>${escapeHtml(formatAge(rdap.ageDays))}</strong><small>${escapeHtml(formatShortDate(rdap.createdAt))} 등록 기준</small></article>
          <article class="metric-card"><span class="kicker">만료 예정</span><strong>${escapeHtml(rdap.expiresInDays != null ? `${rdap.expiresInDays}일` : '-')}</strong><small>${escapeHtml(formatShortDate(rdap.expiresAt))} 만료 예정일</small></article>
          <article class="metric-card"><span class="kicker">A 레코드</span><strong>${escapeHtml(String((dns.aRecords || []).length))}</strong><small>${escapeHtml(((dns.aRecords || []).slice(0, 3)).join(', ') || '확인된 A 레코드 없음')}</small></article>
          <article class="metric-card"><span class="kicker">클러스터 힌트</span><strong>${escapeHtml(String((cluster.subnets || []).length || (cluster.sharedAsns || []).length || 0))}</strong><small>${escapeHtml(cluster.summary || '같은 ASN·조직·대역 힌트를 함께 봅니다.')}</small></article>
        </div>
        <div class="signal-grid">${signals.length ? signals.map((item) => `
          <article class="signal-card" data-level="${escapeHtml(levelClass(item.level))}">
            <div class="signal-chip ${escapeHtml(levelClass(item.level))}">${escapeHtml(item.label || '점검')}</div>
            <h3 style="margin-top:12px">${escapeHtml(item.title || '')}</h3>
            <p>${escapeHtml(item.detail || '')}</p>
          </article>`).join('') : '<div class="empty-state" style="grid-column:1/-1"><strong>현재 표시할 플래그가 없습니다.</strong>DNS와 RDAP 응답이 제한된 경우 일부 항목은 비어 있을 수 있습니다.</div>'}
        </div>
        <div class="safety-table-wrap">
          <table class="safety-table">
            <tbody>
              <tr><th>등록일</th><td>${escapeHtml(formatShortDate(rdap.createdAt))}</td><th>만료일</th><td>${escapeHtml(formatShortDate(rdap.expiresAt))}</td></tr>
              <tr><th>네임서버</th><td colspan="3">${escapeHtml((dns.nameServers || []).join(', ') || '-')}</td></tr>
              <tr><th>A 레코드</th><td colspan="3">${escapeHtml((dns.aRecords || []).join(', ') || '-')}</td></tr>
              <tr><th>IP/ASN</th><td colspan="3">${escapeHtml((data.networks || []).map((item) => [item.ip, item.asn, item.org].filter(Boolean).join(' · ')).join(' / ') || '-')}</td></tr>
            </tbody>
          </table>
        </div>
      </div>`;
  }

  function wireCheckPage() {
    const form = $('#domainCheckForm');
    const input = $('#domainCheckInput');
    const result = $('#domainCheckResult');
    if (!form || !input || !result) return;

    async function runLookup(value) {
      const domain = normalizeDomain(value);
      if (!domain) {
        result.innerHTML = '<div class="empty-state"><strong>도메인 형식을 다시 확인해 주세요.</strong>예: example.com</div>';
        return;
      }
      result.innerHTML = '<div class="empty-state"><strong>도메인 점검 중입니다.</strong>RDAP, DNS, IP 정보를 순서대로 불러오고 있습니다.</div>';
      try {
        const payload = await fetchLookup(domain);
        renderLookup(payload, result, { mode: 'check' });
      } catch (error) {
        result.innerHTML = `<div class="empty-state"><strong>조회에 실패했습니다.</strong>${escapeHtml(error.message || '잠시 후 다시 시도해 주세요.')}</div>`;
      }
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      runLookup(input.value);
    });

    const domain = new URL(location.href).searchParams.get('domain');
    if (domain) {
      input.value = domain;
      runLookup(domain);
    }
  }

  function wireReportPage() {
    const form = $('#reportDomainForm');
    const input = $('#reportDomainInput');
    const result = $('#domainReportResult');
    if (!form || !input || !result) return;

    async function runLookup(value) {
      const domain = normalizeDomain(value);
      if (!domain) {
        result.innerHTML = '<div class="empty-state"><strong>도메인 형식을 다시 확인해 주세요.</strong>예: example.com</div>';
        return;
      }
      result.innerHTML = '<div class="empty-state"><strong>공유용 결과를 만드는 중입니다.</strong>도메인 점검 결과를 같은 페이지에서 다시 불러옵니다.</div>';
      try {
        const payload = await fetchLookup(domain);
        renderLookup(payload, result, { mode: 'report' });
      } catch (error) {
        result.innerHTML = `<div class="empty-state"><strong>조회에 실패했습니다.</strong>${escapeHtml(error.message || '잠시 후 다시 시도해 주세요.')}</div>`;
      }
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      runLookup(input.value);
    });

    const domain = new URL(location.href).searchParams.get('domain');
    if (domain) {
      input.value = domain;
      runLookup(domain);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderPromoGrid();
    renderBrandDirectory();
    wireCopyButtons();
    wireSearchPage();
    wireDomainPresetButtons();
    wireCheckPage();
    wireReportPage();
  });
})();
