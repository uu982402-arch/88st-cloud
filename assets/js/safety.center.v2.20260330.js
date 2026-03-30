(() => {
  const body = document.body;
  if (!body) return;

  const OFFERS = [
    {
      id: 'yangsim-main',
      slug: 'yangsim',
      shortName: '양심',
      title: '안전한토토사이트 양심',
      kicker: '양심 회원 전용 이벤트',
      bullets: ['스포츠/슬롯 첫충·매충 10%', '카지노·미겜 첫충 및 매충전 5%', '출첵 · 룰렛 · 이사 지원금 이벤트', '콤프 최대 카지노 1.2% · 슬롯 4%'],
      code: 'KAKA',
      theme: 'amber',
      href: 'https://평생양심.com/',
      domain: '평생양심.com',
      lookupDomain: 'xn--9g4bs1b95c7tw.com',
      rewardSummary: '스포츠/슬롯 첫충·매충 10%, 카지노·미겜 첫충 및 매충전 5%',
      statusLabel: '정적 결과 지원',
      verdict: '운영 정보 우선 확인',
      summary: '검색 흔적과 도메인 이력을 먼저 보고 코드 복사와 공식 주소 진입까지 이어지게 만든 브랜드별 결과 동선입니다.'
    },
    {
      id: 'seven-main',
      slug: 'chilbet',
      shortName: '칠벳',
      title: '칠땡잡이 승부사이트 칠벳',
      kicker: '칠벳 회원 전용 이벤트',
      bullets: ['카지노/스포츠/슬롯/미겜 입금플러스 이벤트', '가입 후 환전 없을 시 무제한 20%', '돌발 20% · 돌발 카지노 10%', '페이백 5%'],
      code: '6767',
      theme: 'mint',
      href: 'https://82clf.com/',
      domain: '82clf.com',
      lookupDomain: '82clf.com',
      rewardSummary: '입금플러스, 환전 없을 시 무제한 20%, 돌발 20%, 페이백 5%',
      statusLabel: '검색어 5종 지원',
      verdict: '검색 흔적 우선 확인',
      summary: '광고카드에서 바로 공식 주소로 가지 않고, 먼저 검색 흔적과 기본 도메인 이력을 확인하게 연결한 구조입니다.'
    },
    {
      id: 'vegas-main',
      slug: 'vegas',
      shortName: '베가스',
      title: '라스베가스의 진정한 승부사 베가스',
      kicker: '베가스 회원 전용 이벤트',
      bullets: ['카지노/스포츠/슬롯/미겜 입금플러스 이벤트', '가입 후 환전 없을 시 무제한 20%', '돌발 20% · 돌발 카지노 10%', '페이백 5%'],
      code: '6789',
      theme: 'red',
      href: 'https://las302.com/',
      domain: 'las302.com',
      lookupDomain: 'las302.com',
      rewardSummary: '입금플러스, 무제한 20%, 돌발 20%, 페이백 5%',
      statusLabel: '공유 링크 대응',
      verdict: '이력·후기 병행 점검',
      summary: '브랜드명 검색과 도메인 검사, 결과 공유 링크 생성을 하나로 묶어 상담과 전환 흐름을 매끄럽게 만든 페이지입니다.'
    },
    {
      id: 'avengers-main',
      slug: 'avengers',
      shortName: '어벤저스벳',
      title: '믿고 이용하는 어벤저스벳',
      kicker: '어벤저스벳 회원 전용 이벤트',
      bullets: ['신규 첫충전 · 카지노 충전 이벤트', '신규 정착 이벤트', 'USDT 입금/가입 및 원화 입금 가능', '심야충전 · 콤프 · 페이백 이벤트'],
      code: '6789',
      theme: 'jaju',
      href: 'https://av-bet.com/',
      domain: 'av-bet.com',
      lookupDomain: 'av-bet.com',
      rewardSummary: '신규 첫충전, 정착 이벤트, USDT/원화 입금, 심야충전·콤프',
      statusLabel: '코드 복사 최적화',
      verdict: '상담·입출금 병행 확인',
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
      grid.innerHTML = OFFERS.map((offer) => `
        <article class="promo-card" data-theme="${escapeHtml(offer.theme)}">
          <div class="promo-topline">
            <span class="promo-kicker">${escapeHtml(offer.kicker)}</span>
            <span class="promo-status">${escapeHtml(offer.statusLabel)}</span>
          </div>
          <div>
            <h3>${escapeHtml(offer.title)}</h3>
            <p class="promo-summary">${escapeHtml(offer.summary)}</p>
          </div>
          <div class="promo-meta-grid">
            <div class="promo-meta"><span>공식 도메인</span><strong>${escapeHtml(offer.domain)}</strong></div>
            <div class="promo-meta"><span>가입코드</span><strong>${escapeHtml(offer.code)}</strong></div>
            <div class="promo-meta"><span>운영 메모</span><strong>${escapeHtml(offer.verdict)}</strong></div>
          </div>
          <ul>${offer.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
          <div class="promo-actions">
            <a class="safety-link-btn" href="${escapeHtml(brandPagePath(offer))}">브랜드 결과</a>
            <button class="safety-copy-btn mint" type="button" data-copy-code="${escapeHtml(offer.code)}">코드 복사</button>
            <a class="safety-link-btn ghost" href="${escapeHtml(offer.href)}" target="_blank" rel="noopener noreferrer">공식 주소</a>
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
          <p>${escapeHtml(offer.rewardSummary)}</p>
          <div class="brand-chip-row">
            <span class="brand-chip">${escapeHtml(offer.verdict)}</span>
            <span class="brand-chip">공식주소 확인 가능</span>
            <span class="brand-chip">검색/검사 연결</span>
          </div>
          <div class="brand-stats">
            <div class="brand-stat"><span>공식 도메인</span><strong>${escapeHtml(offer.domain)}</strong></div>
            <div class="brand-stat"><span>가입코드</span><strong>${escapeHtml(offer.code)}</strong></div>
            <div class="brand-stat"><span>핵심 흐름</span><strong>결과 보기 → 검사 → 이동</strong></div>
          </div>
          <div class="promo-actions">
            <a class="safety-link-btn" href="${escapeHtml(brandPagePath(offer))}">정적 결과 보기</a>
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
    const google = Array.isArray(data.googleSearches) ? data.googleSearches : [];
    const ips = Array.isArray(data.networks) ? data.networks : [];
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
            <thead><tr><th>항목</th><th>값</th><th>메모</th></tr></thead>
            <tbody>
              <tr><td>등록기관</td><td>${escapeHtml(rdap.registrar || '-')}</td><td><small>${escapeHtml((rdap.status || []).join(', ') || 'RDAP 상태값 없음')}</small></td></tr>
              <tr><td>등록일</td><td>${escapeHtml(formatShortDate(rdap.createdAt))}</td><td><small>${escapeHtml(rdap.ageDays != null ? `도메인 생성 후 ${rdap.ageDays}일` : '등록일 미확인')}</small></td></tr>
              <tr><td>만료일</td><td>${escapeHtml(formatShortDate(rdap.expiresAt))}</td><td><small>${escapeHtml(rdap.expiresInDays != null ? `만료까지 ${rdap.expiresInDays}일` : '만료일 미확인')}</small></td></tr>
              <tr><td>네임서버</td><td>${escapeHtml((dns.nameServers || []).join(', ') || '-')}</td><td><small>네임서버 패턴이 자주 바뀌는지 추가 확인 권장</small></td></tr>
              <tr><td>MX 레코드</td><td>${escapeHtml((dns.mxRecords || []).join(', ') || '-')}</td><td><small>메일 레코드가 비어 있다고 바로 위험으로 단정하진 않습니다.</small></td></tr>
              <tr><td>클러스터 요약</td><td>${escapeHtml(cluster.summary || '-')}</td><td><small>${escapeHtml(((cluster.subnets || []).join(', ')) || ((cluster.sharedAsns || []).join(', ')) || '동일 대역/ASN 힌트 없음')}</small></td></tr>
            </tbody>
          </table>
        </div>
        <div class="network-grid">${ips.length ? ips.map((item) => `
          <article class="network-card">
            <h3>${escapeHtml(item.ip || '-')}</h3>
            <p>${escapeHtml([item.country, item.city].filter(Boolean).join(' · ') || '위치 정보 없음')}</p>
            <ul style="margin-top:12px">
              <li>ASN: ${escapeHtml(item.asn || '-')}</li>
              <li>조직: ${escapeHtml(item.org || '-')}</li>
              <li>네트워크: ${escapeHtml(item.network || '-')}</li>
            </ul>
          </article>`).join('') : '<div class="empty-state" style="grid-column:1/-1"><strong>IP 분석 데이터가 비어 있습니다.</strong>A 레코드가 없거나 외부 응답이 제한된 경우일 수 있습니다.</div>'}
        </div>
        <div class="link-grid">${google.map((item) => `
          <article class="quick-link-card">
            <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)} ↗</a>
            <p>${escapeHtml(item.query)}</p>
          </article>`).join('')}</div>
        <div class="safety-note">${options.compact ? '체크 페이지에서는 핵심 지표만 우선 보여 줍니다. 결과 페이지로 이동하면 같은 내용을 링크형으로 공유할 수 있습니다.' : '이 결과는 WHOIS(RDAP)·DNS·IP 기반 기초 검토용입니다. 실제 이용 여부 판단은 입금 전 구글링, 커뮤니티 후기, 입출금 테스트, 고객센터 대응까지 함께 확인하는 흐름이 가장 안전합니다.'}</div>
      </div>`;
  }

  function wireCheckPage() {
    const form = $('#domainCheckForm');
    const input = $('#domainCheckInput');
    const result = $('#domainCheckResult');
    if (!form || !input || !result) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const domain = normalizeDomain(input.value);
      if (!domain) {
        result.innerHTML = '<div class="empty-state"><strong>도메인 형식을 확인해 주세요.</strong>예시: example.com 또는 sample-bet.net</div>';
        return;
      }
      result.innerHTML = '<div class="loading-state"><strong>도메인 점검 중입니다.</strong>RDAP, DNS, IP 응답을 순서대로 확인하고 있습니다.</div>';
      try {
        const data = await fetchLookup(domain);
        renderLookup(data, result, { compact: true });
        history.replaceState({}, '', `/muktu-police/check/?domain=${encodeURIComponent(domain)}`);
      } catch (err) {
        result.innerHTML = `<div class="empty-state"><strong>조회에 실패했습니다.</strong>${escapeHtml(err.message || '잠시 후 다시 시도해 주세요.')}</div>`;
      }
    });

    const preset = new URL(location.href).searchParams.get('domain');
    if (preset) {
      input.value = preset;
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  }

  function wireReportPage() {
    const target = $('#domainReportResult');
    const input = $('#reportDomainInput');
    const form = $('#reportDomainForm');
    if (!target || !input || !form) return;

    async function run(domain) {
      const clean = normalizeDomain(domain);
      if (!clean) {
        target.innerHTML = '<div class="empty-state"><strong>도메인을 입력해 주세요.</strong>예시: example.com</div>';
        return;
      }
      target.innerHTML = '<div class="loading-state"><strong>결과 페이지 생성 중입니다.</strong>WHOIS, DNS, IP 데이터를 결합하고 있습니다.</div>';
      try {
        const data = await fetchLookup(clean);
        renderLookup(data, target, { compact: false });
        history.replaceState({}, '', `/muktu-police/report/?domain=${encodeURIComponent(clean)}`);
      } catch (err) {
        target.innerHTML = `<div class="empty-state"><strong>결과 생성에 실패했습니다.</strong>${escapeHtml(err.message || '잠시 후 다시 시도해 주세요.')}</div>`;
      }
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      run(input.value);
    });

    const preset = new URL(location.href).searchParams.get('domain');
    if (preset) {
      input.value = preset;
      run(preset);
    }
  }

  renderPromoGrid();
  renderBrandDirectory();
  wireCopyButtons();
  wireSearchPage();
  wireDomainPresetButtons();
  wireCheckPage();
  wireReportPage();
})();