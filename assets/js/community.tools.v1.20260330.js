
(() => {
  const PROVIDERS_URL = '/assets/data/guaranteed.providers.v1.20260330.json';
  const COMMUNITY_SOURCE_GROUPS = [
    ['mt-police07.com', 'mt-spot.com', 'daumd08.net'],
    ['mtlevel.com', 'mtgal.com']
  ];
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function showToast(message) {
    let toast = $('#communityToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'communityToast';
      toast.className = 'safety-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('is-show'), 1800);
  }

  async function copyText(text, message = '복사되었습니다.') {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(String(text));
      showToast(message);
    } catch (err) {
      const area = document.createElement('textarea');
      area.value = String(text);
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.focus();
      area.select();
      try { document.execCommand('copy'); showToast(message); } catch (_) { showToast('자동 복사가 제한되었습니다.'); }
      area.remove();
    }
  }

  function normalizeDomain(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
      return String(url.hostname || '').toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
    } catch (_) {
      return raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0].split('#')[0].replace(/:\d+$/, '').toLowerCase();
    }
  }

  function isValidIp(value) {
    const raw = String(value || '').trim();
    if (!raw) return false;
    if (raw.includes(':')) return /^[0-9a-f:]+$/i.test(raw);
    const parts = raw.split('.');
    return parts.length === 4 && parts.every((part) => /^\d+$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
  }

  function googleUrl(query) {
    return `https://www.google.com/search?q=${encodeURIComponent(String(query || '').trim())}`;
  }

  function buildQuery(keyword, suffix) {
    return [String(keyword || '').trim(), String(suffix || '').trim()].filter(Boolean).join(' ').trim();
  }

  function buildSiteQuery(keyword, domain, suffix = '') {
    const query = [String(keyword || '').trim(), String(suffix || '').trim()].filter(Boolean).join(' ').trim();
    return `site:${domain} ${query}`.trim();
  }

  async function loadProviders() {
    try {
      const res = await fetch(PROVIDERS_URL, { cache: 'no-store' });
      const data = await res.json();
      return Array.isArray(data.providers) ? data.providers : [];
    } catch (err) {
      return [];
    }
  }

  function renderGuaranteedCards(providers) {
    $$('[data-guaranteed-grid]').forEach((grid) => {
      grid.innerHTML = providers.map((item) => `
        <article class="guaranteed-card" data-theme="${escapeHtml(item.theme)}">
          <div class="guaranteed-top">
            <span class="guaranteed-kicker">${escapeHtml(item.name)}</span>
            <span class="tag-chip">${escapeHtml(item.officialDomain)}</span>
          </div>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.oneLine)}</p>
          <div class="guaranteed-benefits">
            ${(item.benefits || []).slice(0, 3).map((benefit, idx) => `<div class="guaranteed-benefit"><span>혜택 ${idx + 1}</span><strong>${escapeHtml(benefit)}</strong></div>`).join('')}
          </div>
          <div class="tag-row">${(item.tags || []).slice(0, 3).map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join('')}</div>
          <div class="guaranteed-actions">
            <button class="safety-copy-btn mint" type="button" data-copy-text="${escapeHtml(item.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button>
            <a class="safety-link-btn ghost" href="${escapeHtml(item.officialUrl)}" target="_blank" rel="noopener noreferrer">공식주소 바로가기</a>
          </div>
        </article>`).join('');
    });
  }

  function buildPublicEvidenceQuery(keyword, suffix, groupIndex = 0) {
    const domains = COMMUNITY_SOURCE_GROUPS[groupIndex] || [];
    const scope = domains.map((domain) => `site:${domain}`).join(' OR ');
    return `${scope} ${buildQuery(keyword, suffix)}`.trim();
  }

  function renderPublicEvidenceGrid() {
    $$('[data-public-evidence-grid]').forEach((grid) => {
      grid.innerHTML = `
        <article class="community-source-card">
          <h3>가져올 수 있는 항목</h3>
          <p>공개 페이지라면 제목, 게시 날짜, URL, 카테고리/태그, 본문에 언급된 도메인·IP 같은 근거성 항목을 추출하는 구조로 붙일 수 있습니다.</p>
        </article>
        <article class="community-source-card">
          <h3>권장 방식</h3>
          <p>본문을 통째로 복사하지 않고, 공개 페이지에서 찾은 근거만 메타데이터로 저장하고 원문 링크를 함께 남기는 쪽이 안전합니다.</p>
        </article>
        <article class="community-source-card">
          <h3>바로 열어보는 공개 검색</h3>
          <p>입력한 사이트명과 도메인을 기준으로 허용된 공개 페이지 묶음에서 흔적을 다시 찾는 검색 조합을 바로 열 수 있게 구성했습니다.</p>
          <div class="card-actions"><button class="safety-link-btn ghost" type="button" data-public-evidence-open>공개 검색 열기</button></div>
        </article>`;
    });
  }

  function wireCopyButtons() {
    document.addEventListener('click', async (event) => {
      const copyBtn = event.target.closest('[data-copy-text]');
      if (copyBtn) {
        const label = $('[data-copy-label]', copyBtn);
        const defaultLabel = label?.getAttribute('data-default-label') || label?.textContent || '복사';
        await copyText(copyBtn.getAttribute('data-copy-text') || '', '복사되었습니다.');
        if (label) {
          label.textContent = '복사 완료';
          setTimeout(() => { label.textContent = defaultLabel; }, 1400);
        }
        return;
      }
      const evidenceBtn = event.target.closest('[data-public-evidence-open]');
      if (evidenceBtn) {
        const input = $('#siteKeywordInput') || $('[data-google-form] input[name="q"]');
        const select = $('#siteSearchType') || $('[data-google-form] select[name="type"]');
        const keyword = input?.value?.trim() || '';
        const suffix = select?.value || '먹튀';
        if (!keyword) {
          showToast('먼저 사이트명이나 도메인을 입력해 주세요.');
          return;
        }
        window.open(googleUrl(buildPublicEvidenceQuery(keyword, suffix, 0)), '_blank', 'noopener');
      }
    });
  }

  function buildPublicEvidenceCards(keyword, suffix) {
    return COMMUNITY_SOURCE_GROUPS.map((_, index) => {
      const query = buildPublicEvidenceQuery(keyword, suffix, index);
      return `<article class="lookup-link-card"><a href="${googleUrl(query)}" target="_blank" rel="noopener noreferrer">공개 페이지 검색 ${index + 1} ↗</a><p>허용된 공개 페이지 묶음에서 ${escapeHtml(buildQuery(keyword, suffix))} 흔적을 다시 확인합니다.</p></article>`;
    }).join('');
  }

  function renderHomePreview(keyword, suffix) {
    const target = $('#homeSearchPreview');
    if (!target) return;
    const clean = String(keyword || '').trim();
    if (!clean) { target.innerHTML = ''; return; }
    const query = buildQuery(clean, suffix || '먹튀');
    target.innerHTML = `
      <div class="glass-card helper-box">
        <div class="section-head"><div><h2>빠른 실행</h2><p>입력한 키워드로 바로 검색하고, 도메인·IP 조회로 이어갈 수 있습니다.</p></div></div>
        <div class="lookup-links">
          <article class="lookup-link-card"><a href="${googleUrl(query)}" target="_blank" rel="noopener noreferrer">구글에서 보기 ↗</a><p>${escapeHtml(query)}</p></article>
          <article class="lookup-link-card"><a href="/muktu-police/search/?q=${encodeURIComponent(clean)}&type=${encodeURIComponent(suffix || '먹튀')}">구글링 페이지 ↗</a><p>검색 조합과 공개 페이지 근거 확인으로 이어서 봅니다.</p></article>
          <article class="lookup-link-card"><a href="/muktu-police/check/${clean.includes('.') ? `?domain=${encodeURIComponent(clean)}` : ''}">도메인·IP 조회 ↗</a><p>기술적 기본값을 같이 확인합니다.</p></article>
        </div>
      </div>`;
    }

  function wireQuickGoogleForms() {
    $$('[data-google-form]').forEach((form) => {
      const input = $('input[name="q"]', form);
      const select = $('select[name="type"]', form);
      if (!input) return;
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = buildQuery(input.value, select?.value || '먹튀');
        if (!query) { showToast('먼저 사이트명이나 도메인을 입력해 주세요.'); return; }
        window.open(googleUrl(query), '_blank', 'noopener');
        renderHomePreview(input.value, select?.value || '먹튀');
      });
    });
  }

  function renderSearchResults(keyword, suffix) {
    const target = $('#googleQueryResults');
    if (!target) return;
    const clean = String(keyword || '').trim();
    if (!clean) {
      target.className = 'result-panel empty-state';
      target.innerHTML = '<strong>검색할 사이트명 또는 도메인을 입력해 주세요.</strong>예: 사이트명, example.com';
      return;
    }
    const terms = ['먹튀', '후기', '주소', '도메인 변경', '가입코드', '메이저'];
    const cards = terms.map((term) => {
      const query = buildQuery(clean, term);
      return `<article class="lookup-link-card"><a href="${googleUrl(query)}" target="_blank" rel="noopener noreferrer">${escapeHtml(term)} 검색 ↗</a><p>${escapeHtml(query)}</p></article>`;
    }).join('');
    const domainTarget = normalizeDomain(clean);
    target.className = 'lookup-panel';
    target.innerHTML = `
      <div class="glass-card helper-box">
        <div class="section-head"><div><h2>${escapeHtml(buildQuery(clean, suffix))}</h2><p>입력한 키워드로 구글 검색과 교차검색을 바로 열 수 있게 묶었습니다.</p></div><div class="section-head-actions"><a class="safety-link-btn" href="${googleUrl(buildQuery(clean, suffix))}" target="_blank" rel="noopener noreferrer">구글에서 검색</a><button class="safety-copy-btn ghost" type="button" data-copy-text="${escapeHtml(buildQuery(clean, suffix))}"><span data-copy-label data-default-label="검색어 복사">검색어 복사</span></button></div></div>
        <div class="lookup-links">${cards}</div>
      </div>
      <div class="glass-card helper-box"><div class="section-head"><div><h2>공개 페이지 교차확인</h2><p>허용된 공개 페이지 묶음을 대상으로 같은 키워드를 다시 검색해 흔적을 교차확인합니다.</p></div></div><div class="lookup-community-links">${buildPublicEvidenceCards(clean, suffix)}</div></div>
      <div class="glass-card helper-box"><div class="section-head"><div><h2>다음 단계</h2><p>검색 결과만으로 부족하면 도메인과 IP를 다시 확인합니다.</p></div></div><div class="lookup-links"><article class="lookup-link-card"><a href="/muktu-police/check/${domainTarget && domainTarget.includes('.') ? `?domain=${encodeURIComponent(domainTarget)}` : ''}">도메인·IP 조회 ↗</a><p>${domainTarget ? `${escapeHtml(domainTarget)} 기준으로 바로 조회할 수 있습니다.` : '도메인이 있으면 바로 조회로 넘어갑니다.'}</p></article><article class="lookup-link-card"><a href="/blog/google-muktu-search-guide/">검색 가이드 ↗</a><p>검색어를 왜 나눠 보는지 블로그에서 먼저 확인할 수 있습니다.</p></article><article class="lookup-link-card"><a href="/guaranteed/">보증업체 ↗</a><p>검색과 조회를 끝낸 뒤 마지막에만 참고하는 페이지입니다.</p></article></div></div>`;
  }

  function wireSearchPage() {
    const form = $('#googleSearchForm');
    const input = $('#siteKeywordInput');
    const select = $('#siteSearchType');
    const preview = $('#googlePreviewBtn');
    if (!form || !input) return;
    const run = () => renderSearchResults(input.value, select?.value || '먹튀');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = buildQuery(input.value, select?.value || '먹튀');
      if (!query) { showToast('먼저 사이트명이나 도메인을 입력해 주세요.'); return; }
      window.open(googleUrl(query), '_blank', 'noopener');
      run();
    });
    preview?.addEventListener('click', run);
    const url = new URL(location.href);
    const q = url.searchParams.get('q');
    const type = url.searchParams.get('type');
    if (q) input.value = q;
    if (type && select) select.value = type;
    renderSearchResults(input.value || q || '', select?.value || type || '먹튀');
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.message || data.error || 'lookup_failed');
    return data;
  }

  function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(d);
  }

  function formatAge(days) {
    const num = Number(days);
    if (!Number.isFinite(num) || num < 0) return '-';
    if (num < 30) return `${num}일`;
    if (num < 365) return `${Math.max(1, Math.round(num / 30))}개월`;
    return `${(num / 365).toFixed(1)}년`;
  }

  function renderDomainLookup(payload) {
    const result = $('#domainCheckResult');
    if (!result) return;
    const rdap = payload.rdap || {};
    const dns = payload.dns || {};
    const networks = Array.isArray(payload.networks) ? payload.networks : [];
    const links = Array.isArray(payload.googleSearches) ? payload.googleSearches : [];
    result.className = 'lookup-panel';
    result.innerHTML = `
      <div class="glass-card helper-box">
        <div class="section-head"><div><h2>${escapeHtml(payload.domain || '-')}</h2><p>${escapeHtml(payload.summary?.commentary || '등록일, DNS, IP 힌트를 같이 보여줍니다.')}</p></div><div class="section-head-actions"><a class="safety-link-btn ghost" href="${googleUrl(`${payload.domain} 먹튀`)}" target="_blank" rel="noopener noreferrer">구글에서 보기</a></div></div>
        <div class="lookup-metrics">
          <div class="lookup-metric"><span>등록일</span><strong>${escapeHtml(formatDate(rdap.createdAt))}</strong></div>
          <div class="lookup-metric"><span>도메인 연차</span><strong>${escapeHtml(formatAge(rdap.ageDays))}</strong></div>
          <div class="lookup-metric"><span>만료일</span><strong>${escapeHtml(formatDate(rdap.expiresAt))}</strong></div>
          <div class="lookup-metric"><span>판단</span><strong>${escapeHtml(payload.summary?.verdict || '추가 확인')}</strong></div>
        </div>
      </div>
      <div class="glass-card helper-box">
        <div class="section-head"><div><h2>기본 값</h2><p>공개 검색과 같이 봐야 할 기술적 기초값입니다.</p></div></div>
        <div class="lookup-links">
          <article class="lookup-link-card"><a href="#">네임서버</a><p>${escapeHtml((dns.nameServers || []).join(', ') || '-')}</p></article>
          <article class="lookup-link-card"><a href="#">A 레코드</a><p>${escapeHtml((dns.aRecords || []).join(', ') || '-')}</p></article>
          <article class="lookup-link-card"><a href="#">IP/ASN</a><p>${escapeHtml(networks.map((item) => [item.ip, item.asn, item.org].filter(Boolean).join(' · ')).join(' / ') || '-')}</p></article>
        </div>
      </div>
      <div class="glass-card helper-box">
        <div class="section-head"><div><h2>연결 검색</h2><p>도메인 기준으로 공개 검색을 바로 이어서 볼 수 있습니다.</p></div></div>
        <div class="lookup-community-links">
          ${links.map((item) => `<article class="lookup-link-card"><a href="${escapeHtml(item.href || item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)} ↗</a><p>${escapeHtml(item.query)}</p></article>`).join('')}
          ${buildCommunityCards(payload.domain || '', '먹튀')}
        </div>
      </div>`;
  }

  function renderIpLookup(payload) {
    const result = $('#ipCheckResult');
    if (!result) return;
    const info = payload.ip || {};
    const ptr = payload.ptr || [];
    result.className = 'lookup-panel';
    result.innerHTML = `
      <div class="glass-card helper-box">
        <div class="section-head"><div><h2>${escapeHtml(info.ip || '-')}</h2><p>${escapeHtml(payload.summary?.commentary || 'ASN, 조직, PTR, 공개 검색 조합을 함께 봅니다.')}</p></div></div>
        <div class="lookup-metrics">
          <div class="lookup-metric"><span>국가</span><strong>${escapeHtml(info.country || '-')}</strong></div>
          <div class="lookup-metric"><span>도시</span><strong>${escapeHtml(info.city || '-')}</strong></div>
          <div class="lookup-metric"><span>ASN</span><strong>${escapeHtml(info.asn || '-')}</strong></div>
          <div class="lookup-metric"><span>조직</span><strong>${escapeHtml(info.org || info.isp || '-')}</strong></div>
        </div>
      </div>
      <div class="glass-card helper-box">
        <div class="section-head"><div><h2>PTR / 네트워크 힌트</h2><p>PTR 응답과 네트워크 기본 정보를 같이 봅니다.</p></div></div>
        <div class="lookup-links">
          <article class="lookup-link-card"><a href="#">PTR</a><p>${escapeHtml(ptr.join(', ') || '-')}</p></article>
          <article class="lookup-link-card"><a href="#">도메인</a><p>${escapeHtml(info.network || '-')}</p></article>
          <article class="lookup-link-card"><a href="#">타입</a><p>${escapeHtml(info.type || '-')}</p></article>
        </div>
      </div>
      <div class="glass-card helper-box">
        <div class="section-head"><div><h2>연결 검색</h2><p>IP 기준 공개 검색과 공개 페이지 확인을 함께 엽니다.</p></div></div>
        <div class="lookup-community-links">
          ${(payload.googleSearches || []).map((item) => `<article class="lookup-link-card"><a href="${escapeHtml(item.href || item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)} ↗</a><p>${escapeHtml(item.query)}</p></article>`).join('')}
        </div>
      </div>`;
  }

  function wireCheckPage() {
    const domainForm = $('#domainCheckForm');
    const domainInput = $('#domainCheckInput');
    const domainResult = $('#domainCheckResult');
    const ipForm = $('#ipCheckForm');
    const ipInput = $('#ipCheckInput');
    const ipResult = $('#ipCheckResult');
    if (domainForm && domainInput && domainResult) {
      domainForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const domain = normalizeDomain(domainInput.value);
        if (!domain || !domain.includes('.')) {
          domainResult.className = 'empty-state';
          domainResult.innerHTML = '<strong>도메인 형식을 다시 확인해 주세요.</strong>예: example.com';
          return;
        }
        domainResult.className = 'empty-state';
        domainResult.innerHTML = '<strong>도메인 조회 중입니다.</strong>등록일, DNS, IP 힌트를 불러오고 있습니다.';
        try {
          const payload = await fetchJson(`/api/safety/domain?domain=${encodeURIComponent(domain)}`);
          renderDomainLookup(payload);
        } catch (error) {
          domainResult.className = 'empty-state';
          domainResult.innerHTML = `<strong>조회에 실패했습니다.</strong>${escapeHtml(error.message || '잠시 후 다시 시도해 주세요.')}`;
        }
      });
    }
    if (ipForm && ipInput && ipResult) {
      ipForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const ip = String(ipInput.value || '').trim();
        if (!isValidIp(ip)) {
          ipResult.className = 'empty-state';
          ipResult.innerHTML = '<strong>IP 형식을 다시 확인해 주세요.</strong>예: 1.1.1.1';
          return;
        }
        ipResult.className = 'empty-state';
        ipResult.innerHTML = '<strong>IP 조회 중입니다.</strong>ASN, 조직, PTR, 공개 검색 조합을 불러오고 있습니다.';
        try {
          const payload = await fetchJson(`/api/safety/ip?ip=${encodeURIComponent(ip)}`);
          renderIpLookup(payload);
        } catch (error) {
          ipResult.className = 'empty-state';
          ipResult.innerHTML = `<strong>조회에 실패했습니다.</strong>${escapeHtml(error.message || '잠시 후 다시 시도해 주세요.')}`;
        }
      });
    }
    const url = new URL(location.href);
    const domain = url.searchParams.get('domain');
    const ip = url.searchParams.get('ip');
    if (domain && domainForm && domainInput) {
      domainInput.value = domain;
      domainForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
    if (ip && ipForm && ipInput) {
      ipInput.value = ip;
      ipForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  }

  async function init() {
    wireCopyButtons();
    wireQuickGoogleForms();
    renderPublicEvidenceGrid();
    renderHomePreview('', '먹튀');
    wireSearchPage();
    wireCheckPage();
    const providers = await loadProviders();
    renderGuaranteedCards(providers);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
