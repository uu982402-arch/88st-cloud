
(() => {
  const DATA_URL = '/assets/data/brand.results.v2.20260330.json';
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  let payloadCache = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function themeGradeClass(brand) {
    return brand?.status?.grade || 'core';
  }

  async function getPayload() {
    if (payloadCache) return payloadCache;
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    const json = await res.json();
    payloadCache = json;
    return json;
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
    showToast._timer = setTimeout(() => toast.classList.remove('is-show'), 2000);
  }

  async function copyText(text, message = '복사되었습니다.') {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(String(text));
      showToast(message);
      return true;
    } catch (err) {
      const input = document.createElement('textarea');
      input.value = String(text);
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.focus();
      input.select();
      try {
        document.execCommand('copy');
        showToast(message);
        return true;
      } catch (error) {
        showToast('자동 복사가 제한되었습니다.');
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
      const hasProto = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw);
      const url = new URL(hasProto ? raw : `https://${raw}`);
      let host = String(url.hostname || '').trim().toLowerCase();
      host = host.replace(/^www\./, '').replace(/\.$/, '');
      return host;
    } catch (error) {
      const host = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].split('?')[0].split('#')[0].replace(/:\d+$/, '');
      return host.toLowerCase();
    }
  }

  function matchBrandByKeyword(brands, keyword) {
    const norm = String(keyword || '').trim().toLowerCase();
    if (!norm) return [];
    return brands.filter((brand) => {
      const bag = [
        brand.name, brand.displayTitle, brand.searchName, brand.officialDomain, brand.lookupDomain,
        ...(brand.tags || []), ...(brand.badgeTags || [])
      ].join(' ').toLowerCase();
      return bag.includes(norm);
    });
  }

  function matchBrandByDomain(brands, domain) {
    const norm = normalizeDomain(domain);
    return brands.find((brand) => [brand.officialDomain, brand.lookupDomain].map((v) => String(v || '').toLowerCase()).includes(norm));
  }

  function renderBrandBadges(brand) {
    const tags = (brand.badgeTags || brand.tags || []).slice(0, 4);
    return tags.map((tag) => `<span class="promo-showcase-badge">${escapeHtml(tag)}</span>`).join('');
  }

  function scoreText(brand) {
    return `${brand?.status?.score || brand?.benefitRank || 0} / 100`;
  }

  function renderPromoGrid(brands) {
    document.querySelectorAll('[data-safety-promos]').forEach((grid) => {
      grid.innerHTML = brands.map((brand, index) => {
        const compareHref = `/muktu-police/compare/${brand.slug}-vs-${brands[(index + 1) % brands.length].slug}/`;
        return `
        <article class="promo-showcase-card" data-theme="${escapeHtml(brand.theme)}" data-order="${index + 1}" data-brand="${escapeHtml(brand.name)}" data-code="${escapeHtml(brand.code)}" data-benefit-rank="${escapeHtml(brand.benefitRank || 0)}" data-score="${escapeHtml(brand.status?.score || 0)}" data-categories="${escapeHtml((brand.categories || []).join('|'))}">
          <div class="promo-showcase-mark">0${index + 1}</div>
          <div class="promo-showcase-head">
            <div class="promo-showcase-brand">
              <span class="promo-showcase-kicker">${escapeHtml(brand.kicker)}</span>
              <div class="promo-showcase-title">
                <div><h3><a href="/muktu-police/brand/${escapeHtml(brand.slug)}/">${escapeHtml(brand.displayTitle)}</a></h3></div>
                <span class="status-macro grade-${escapeHtml(themeGradeClass(brand))}">${escapeHtml(brand.status?.label || brand.statusLabel)}</span>
              </div>
              <p class="promo-showcase-oneline">${escapeHtml(brand.oneLine || brand.summary)}</p>
            </div>
          </div>
          <div class="promo-showcase-badges">
            <span class="promo-showcase-badge is-brand">상태 점수 · ${escapeHtml(scoreText(brand))}</span>
            ${renderBrandBadges(brand)}
          </div>
          <div class="promo-showcase-meta">
            <span class="meta-pill">공식 도메인 · ${escapeHtml(brand.officialDomain)}</span>
            <span class="meta-pill">가입코드 · ${escapeHtml(brand.code)}</span>
            <span class="meta-pill">최근 검토 · ${escapeHtml(brand.status?.lastReviewed || '-')}</span>
          </div>
          <div class="promo-showcase-perks">
            ${(brand.perks || brand.highlights || []).slice(0, 3).map((item, perkIndex) => `<div class="promo-showcase-perk"><span>혜택 ${perkIndex + 1}</span><strong>${escapeHtml(item)}</strong></div>`).join('')}
          </div>
          <div class="promo-showcase-foot">
            <a class="promo-showcase-link" href="/muktu-police/brand/${escapeHtml(brand.slug)}/">결과 페이지 →</a>
            <div class="promo-showcase-actions">
              <button class="safety-copy-btn mint luxury-copy" type="button" data-copy-code="${escapeHtml(brand.code)}"><span data-copy-label data-default-label="가입코드 복사">가입코드 복사</span></button>
              <a class="safety-link-btn ghost" href="${escapeHtml(brand.officialUrl)}" target="_blank" rel="noopener noreferrer">공식주소 이동</a>
            </div>
          </div>
          <div class="promo-showcase-subactions">
            <a href="/muktu-police/faq/${escapeHtml(brand.slug)}/">FAQ</a>
            <a href="${compareHref}">비교</a>
            <a href="/muktu-police/query/${escapeHtml(brand.slug)}-muktu/">검색팩</a>
          </div>
        </article>`;
      }).join('');
    });
  }

  function renderBrandDirectory(brands) {
    document.querySelectorAll('[data-brand-grid]').forEach((grid) => {
      grid.innerHTML = brands.map((brand) => `
      <article class="brand-card" data-theme="${escapeHtml(brand.theme)}">
        <div class="brand-topline">
          <span class="promo-kicker">${escapeHtml(brand.name)} 결과</span>
          <span class="status-macro grade-${escapeHtml(themeGradeClass(brand))}">${escapeHtml(brand.status?.label || brand.statusLabel)}</span>
        </div>
        <h3>${escapeHtml(brand.displayTitle)}</h3>
        <p>${escapeHtml(brand.summary)}</p>
        <div class="brand-chip-row">${renderBrandBadges(brand)}</div>
        <div class="brand-stats">
          <div class="brand-stat"><span>공식 도메인</span><strong>${escapeHtml(brand.officialDomain)}</strong></div>
          <div class="brand-stat"><span>가입코드</span><strong>${escapeHtml(brand.code)}</strong></div>
          <div class="brand-stat"><span>상태 점수</span><strong>${escapeHtml(scoreText(brand))}</strong></div>
        </div>
        <div class="promo-actions">
          <a class="safety-link-btn" href="/muktu-police/brand/${escapeHtml(brand.slug)}/">결과 페이지</a>
          <a class="safety-link-btn ghost" href="/muktu-police/faq/${escapeHtml(brand.slug)}/">FAQ</a>
        </div>
      </article>`).join('');
    });
  }

  function renderQueryPackLinks(brands) {
    document.querySelectorAll('[data-query-pack-grid]').forEach((grid) => {
      const cards = brands.flatMap((brand) => (brand.seoLongtails || []).slice(0, 2).map((item) => `
        <article class="quick-link-card">
          <a href="/muktu-police/query/${escapeHtml(item.slug)}/">${escapeHtml(item.query)} ↗</a>
          <p>${escapeHtml(item.description)}</p>
        </article>`));
      grid.innerHTML = cards.join('');
    });
  }

  function renderSearchResults(brands, keyword) {
    const target = $('#googleQueryResults');
    if (!target) return;
    const clean = String(keyword || '').trim();
    if (!clean) {
      target.innerHTML = '<div class="empty-state"><strong>검색할 브랜드명 또는 도메인을 입력해 주세요.</strong>예: 양심, 베가스, 82clf.com</div>';
      return;
    }
    const queries = [
      { label: '먹튀 사례 조회', suffix: '먹튀' },
      { label: '먹튀검증 검색', suffix: '먹튀검증' },
      { label: '후기 검색', suffix: '후기' },
      { label: '메이저 여부', suffix: '메이저' },
      { label: '도메인 변경', suffix: '도메인 변경' },
      { label: '가입코드 확인', suffix: '가입코드' }
    ];
    const matchedBrands = matchBrandByKeyword(brands, clean);
    target.innerHTML = `
      <div class="search-result-grid">${queries.map((item) => {
        const query = `${clean} ${item.suffix}`;
        return `<article class="search-result-card"><h3>${escapeHtml(item.label)}</h3><p>${escapeHtml(query)} 로 구글 검색을 바로 실행합니다.</p><div class="query-actions"><a class="safety-link-btn" href="https://www.google.com/search?q=${encodeURIComponent(query)}" target="_blank" rel="noopener noreferrer">구글에서 보기</a><button class="safety-copy-btn ghost" type="button" data-copy-text="${escapeHtml(query)}"><span data-copy-label data-default-label="검색어 복사">검색어 복사</span></button></div></article>`;
      }).join('')}</div>
      <div class="search-result-meta">
        <h2>같이 보면 좋은 결과 페이지</h2>
        <div class="link-grid">${matchedBrands.length ? matchedBrands.map((brand) => `
          <article class="quick-link-card"><a href="/muktu-police/brand/${escapeHtml(brand.slug)}/">${escapeHtml(brand.displayTitle)} ↗</a><p>${escapeHtml(brand.oneLine)}</p></article>`).join('') : `<article class="quick-link-card"><a href="/muktu-police/brand/">브랜드 결과 허브 ↗</a><p>입력어와 일치하는 브랜드가 없으면 전체 허브에서 브랜드별 결과를 다시 비교할 수 있습니다.</p></article>`}</div>
      </div>`;
  }

  async function fetchLookup(domain) {
    const res = await fetch(`/api/safety/domain?domain=${encodeURIComponent(domain)}`, { cache: 'no-store' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.ok === false) throw new Error(json.message || json.error || 'lookup_failed');
    return json;
  }

  function renderLookup(brands, payload, target, mode = 'check', selectedBrandSlug = '') {
    if (!target) return;
    const data = payload || {};
    const summary = data.summary || {};
    const dns = data.dns || {};
    const rdap = data.rdap || {};
    const cluster = data.cluster || {};
    const signals = Array.isArray(data.signals) ? data.signals : [];
    const matchedBrand = selectedBrandSlug ? brands.find((brand) => brand.slug === selectedBrandSlug) : matchBrandByDomain(brands, data.domain);
    const shareUrl = `${location.origin}/muktu-police/report/?domain=${encodeURIComponent(data.domain || '')}${matchedBrand ? `&brand=${encodeURIComponent(matchedBrand.slug)}` : ''}`;
    const googleCards = (data.googleSearches || []).map((item) => `<article class="quick-link-card"><a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)} ↗</a><p>${escapeHtml(item.query)}</p></article>`).join('');
    target.innerHTML = `
      <div class="result-panel">
        <div class="result-head">
          <div>
            <div class="risk-chip ${escapeHtml((summary.verdict || '추가 확인') === '주의 필요' ? 'caution' : (summary.verdict || '').includes('추가') ? 'watch' : 'safe')}">${escapeHtml(summary.verdict || '추가 확인')}</div>
            <h2>${escapeHtml(data.domain || '-')}</h2>
            <p>${escapeHtml(summary.commentary || '등록일, 만료일, DNS, IP, 클러스터 힌트를 한 번에 정리했습니다.')}</p>
          </div>
          <div class="query-actions">
            <a class="safety-link-btn" href="${escapeHtml(shareUrl)}">공유 링크 열기</a>
            <button class="safety-copy-btn ghost" type="button" data-copy-text="${escapeHtml(shareUrl)}"><span data-copy-label data-default-label="공유 링크 복사">공유 링크 복사</span></button>
          </div>
        </div>
        <div class="metric-grid">
          <article class="metric-card"><span class="kicker">도메인 생성 후</span><strong>${escapeHtml(formatAge(rdap.ageDays))}</strong><small>${escapeHtml(formatShortDate(rdap.createdAt))} 등록 기준</small></article>
          <article class="metric-card"><span class="kicker">만료 예정</span><strong>${escapeHtml(rdap.expiresInDays != null ? `${rdap.expiresInDays}일` : '-')}</strong><small>${escapeHtml(formatShortDate(rdap.expiresAt))}</small></article>
          <article class="metric-card"><span class="kicker">A 레코드</span><strong>${escapeHtml(String((dns.aRecords || []).length))}</strong><small>${escapeHtml(((dns.aRecords || []).slice(0, 3)).join(', ') || '확인된 레코드 없음')}</small></article>
          <article class="metric-card"><span class="kicker">클러스터 힌트</span><strong>${escapeHtml(String((cluster.subnets || []).length || (cluster.sharedAsns || []).length || 0))}</strong><small>${escapeHtml(cluster.summary || '대역·ASN 힌트를 같이 확인합니다.')}</small></article>
        </div>
        ${matchedBrand ? `
        <div class="domain-brand-match">
          <div class="domain-brand-head">
            <h3>연결 브랜드 결과</h3>
            <p>입력한 도메인과 연결되는 브랜드 결과 페이지를 함께 보여줍니다.</p>
          </div>
          <article class="brand-card" data-theme="${escapeHtml(matchedBrand.theme)}">
            <div class="brand-topline"><span class="promo-kicker">${escapeHtml(matchedBrand.name)} 결과</span><span class="status-macro grade-${escapeHtml(themeGradeClass(matchedBrand))}">${escapeHtml(matchedBrand.status?.label || matchedBrand.statusLabel)}</span></div>
            <h3>${escapeHtml(matchedBrand.displayTitle)}</h3>
            <p>${escapeHtml(matchedBrand.oneLine)}</p>
            <div class="promo-actions"><a class="safety-link-btn" href="/muktu-police/brand/${escapeHtml(matchedBrand.slug)}/">결과 페이지</a><a class="safety-link-btn ghost" href="/muktu-police/faq/${escapeHtml(matchedBrand.slug)}/">FAQ</a></div>
          </article>
        </div>` : ''}
        <div class="signal-grid">${signals.map((item) => `
          <article class="signal-card" data-level="${escapeHtml(item.level || 'warn')}">
            <div class="signal-chip ${escapeHtml(item.level === 'high' ? 'high' : item.level === 'warn' ? 'warn' : 'low')}">${escapeHtml(item.label || '점검')}</div>
            <h3>${escapeHtml(item.title || '')}</h3>
            <p>${escapeHtml(item.detail || '')}</p>
          </article>`).join('')}</div>
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
        <div class="domain-insight-grid">
          <article class="glass-card"><h3>검색 흐름</h3><p>도메인 검사 결과만으로 끝내지 말고, 같은 도메인 기준 먹튀·후기·도메인 변경 검색을 함께 돌리면 체감이 빨라집니다.</p></article>
          <article class="glass-card"><h3>공유형 결과</h3><p>${mode === 'report' ? '상담 채널이나 운영자 메모에 넣기 좋은 공유 링크를 같은 화면에서 바로 복사할 수 있습니다.' : '검사 후 공유 링크를 남기면 같은 결과를 다시 열기 쉬워집니다.'}</p></article>
        </div>
        <div class="section-head" style="margin-top:20px"><div><h2>연결 검색어</h2><p>도메인 기준 구글 검색어도 같이 열 수 있게 묶었습니다.</p></div></div>
        <div class="link-grid">${googleCards}</div>
      </div>`;
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
    if (num < 365) return `${Math.max(1, Math.round(num / 30))}개월`;
    return `${(num / 365).toFixed(1)}년`;
  }

  function wireCheckPage(brands) {
    const form = $('#domainCheckForm');
    const input = $('#domainCheckInput');
    const result = $('#domainCheckResult');
    if (!form || !input || !result) return;
    async function run(value) {
      const domain = normalizeDomain(value);
      if (!domain || !domain.includes('.')) {
        result.innerHTML = '<div class="empty-state"><strong>도메인 형식을 다시 확인해 주세요.</strong>예: example.com</div>';
        return;
      }
      result.innerHTML = '<div class="empty-state"><strong>도메인 점검 중입니다.</strong>RDAP, DNS, IP 정보를 불러오고 있습니다.</div>';
      try {
        const payload = await fetchLookup(domain);
        renderLookup(brands, payload, result, 'check');
      } catch (error) {
        result.innerHTML = `<div class="empty-state"><strong>조회에 실패했습니다.</strong>${escapeHtml(error.message || '잠시 후 다시 시도해 주세요.')}</div>`;
      }
    }
    form.addEventListener('submit', (event) => { event.preventDefault(); run(input.value); });
    const url = new URL(location.href);
    const domain = url.searchParams.get('domain');
    if (domain) { input.value = domain; run(domain); }
  }

  function populateBrandSelect(brands) {
    const select = $('#reportBrandSelect');
    if (!select) return;
    select.innerHTML = `<option value="">브랜드 선택</option>${brands.map((brand) => `<option value="${escapeHtml(brand.slug)}">${escapeHtml(brand.name)}</option>`).join('')}`;
    const current = new URL(location.href).searchParams.get('brand');
    if (current) select.value = current;
  }

  function updateShareBuilder(brands) {
    const brandSelect = $('#reportBrandSelect');
    const domainInput = $('#reportDomainInput');
    const modeSelect = $('#reportModeSelect');
    const output = $('#shareUrlOutput');
    const related = $('#shareLinkCards');
    if (!brandSelect || !domainInput || !modeSelect || !output || !related) return;
    const brand = brands.find((item) => item.slug === brandSelect.value);
    const domain = normalizeDomain(domainInput.value || (brand ? brand.lookupDomain : ''));
    let share = `${location.origin}/muktu-police/report/`;
    if (modeSelect.value === 'brand' && brand) {
      share = `${location.origin}/muktu-police/brand/${brand.slug}/`;
    } else if (modeSelect.value === 'faq' && brand) {
      share = `${location.origin}/muktu-police/faq/${brand.slug}/`;
    } else if (modeSelect.value === 'query' && brand) {
      share = `${location.origin}/muktu-police/query/${brand.slug}-muktu/`;
    } else if (modeSelect.value === 'check') {
      share = `${location.origin}/muktu-police/check/${domain ? `?domain=${encodeURIComponent(domain)}` : ''}`;
    } else {
      const params = new URLSearchParams();
      if (brand) params.set('brand', brand.slug);
      if (domain) params.set('domain', domain);
      share = `${location.origin}/muktu-police/report/${params.toString() ? `?${params.toString()}` : ''}`;
    }
    output.value = share;
    const cards = [];
    if (brand) {
      cards.push(`<article class="quick-link-card"><a href="/muktu-police/brand/${escapeHtml(brand.slug)}/">${escapeHtml(brand.displayTitle)} ↗</a><p>${escapeHtml(brand.summary)}</p></article>`);
      cards.push(`<article class="quick-link-card"><a href="/muktu-police/faq/${escapeHtml(brand.slug)}/">${escapeHtml(brand.name)} FAQ ↗</a><p>자주 묻는 질문과 연결 페이지를 함께 봅니다.</p></article>`);
    }
    if (domain) {
      cards.push(`<article class="quick-link-card"><a href="/muktu-police/check/?domain=${encodeURIComponent(domain)}">도메인 검사 ↗</a><p>${escapeHtml(domain)} 기준 도메인 이력과 IP, DNS를 다시 확인합니다.</p></article>`);
    }
    related.innerHTML = cards.join('') || '<div class="empty-state"><strong>브랜드 또는 도메인을 선택하면 공유 링크와 연결 카드가 함께 생성됩니다.</strong></div>';
  }

  function wireReportPage(brands) {
    populateBrandSelect(brands);
    const form = $('#reportDomainForm');
    const input = $('#reportDomainInput');
    const result = $('#domainReportResult');
    const brandSelect = $('#reportBrandSelect');
    const modeSelect = $('#reportModeSelect');
    const copyBtn = $('#shareUrlCopyBtn');
    const output = $('#shareUrlOutput');
    if (!form || !input || !result) return;
    const syncBuilder = () => updateShareBuilder(brands);
    brandSelect?.addEventListener('change', syncBuilder);
    modeSelect?.addEventListener('change', syncBuilder);
    input.addEventListener('input', syncBuilder);
    copyBtn?.addEventListener('click', () => copyText(output?.value || '', '공유 링크가 복사되었습니다.'));
    syncBuilder();

    async function run(value) {
      const domain = normalizeDomain(value || input.value);
      if (!domain || !domain.includes('.')) {
        result.innerHTML = '<div class="empty-state"><strong>도메인 형식을 다시 확인해 주세요.</strong>예: example.com</div>';
        return;
      }
      result.innerHTML = '<div class="empty-state"><strong>공유용 결과를 불러오는 중입니다.</strong>도메인 점검 결과와 연결 브랜드를 같은 화면에서 정리합니다.</div>';
      try {
        const payload = await fetchLookup(domain);
        renderLookup(brands, payload, result, 'report', brandSelect?.value || '');
      } catch (error) {
        result.innerHTML = `<div class="empty-state"><strong>조회에 실패했습니다.</strong>${escapeHtml(error.message || '잠시 후 다시 시도해 주세요.')}</div>`;
      }
    }
    form.addEventListener('submit', (event) => { event.preventDefault(); run(input.value); });
    const url = new URL(location.href);
    const domain = url.searchParams.get('domain');
    if (domain) { input.value = domain; run(domain); }
  }

  function wireDomainPresetButtons() {
    $$('[data-domain-preset]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const target = document.querySelector(chip.getAttribute('data-domain-target') || '');
        if (!target) return;
        target.value = chip.getAttribute('data-domain-preset') || '';
        target.dispatchEvent(new Event('input', { bubbles: true }));
        const form = target.closest('form');
        if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
    });
  }

  function wireSearchPage(brands) {
    const form = $('#googleQueryForm');
    const input = $('#siteKeywordInput');
    if (!form || !input) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      renderSearchResults(brands, input.value);
    });
    $$('[data-search-keyword]').forEach((chip) => {
      chip.addEventListener('click', () => {
        input.value = chip.getAttribute('data-search-keyword') || '';
        renderSearchResults(brands, input.value);
      });
    });
    const urlKeyword = new URL(location.href).searchParams.get('q');
    renderSearchResults(brands, urlKeyword || input.value);
    if (urlKeyword) input.value = urlKeyword;
  }

  function updateShowcaseSummary(grid) {
    const visible = $$('.promo-showcase-card', grid).filter((card) => !card.hidden);
    const summary = $('[data-showcase-summary]');
    if (!summary) return;
    summary.innerHTML = `
      <div class="showcase-stat"><strong>${visible.length}</strong><span>현재 노출 카드</span></div>
      <div class="showcase-stat"><strong>${Math.max(...visible.map((card) => Number(card.dataset.score || 0)), 0)}</strong><span>최고 상태 점수</span></div>
      <div class="showcase-stat"><strong>${visible.length ? visible[0].dataset.brand : '-'}</strong><span>현재 첫 카드</span></div>`;
  }

  function wireShowcaseControls() {
    const grid = $('[data-showcase-grid]');
    if (!grid) return;
    const filters = $$('[data-showcase-filter]');
    const sort = $('[data-showcase-sort]');
    const search = $('[data-showcase-search]');
    function cards() { return $$('.promo-showcase-card', grid); }
    function apply() {
      const active = $('[data-showcase-filter].is-active')?.getAttribute('data-showcase-filter') || 'all';
      const sortValue = sort?.value || 'featured';
      const keyword = String(search?.value || '').trim().toLowerCase();
      const list = cards();
      list.forEach((card) => {
        const categories = String(card.dataset.categories || '').split('|').filter(Boolean);
        const bag = `${card.dataset.brand || ''} ${card.textContent || ''}`.toLowerCase();
        const filterPass = active === 'all' || categories.includes(active);
        const searchPass = !keyword || bag.includes(keyword);
        card.hidden = !(filterPass && searchPass);
      });
      const visible = list.filter((card) => !card.hidden);
      visible.sort((a, b) => {
        if (sortValue === 'name') return String(a.dataset.brand || '').localeCompare(String(b.dataset.brand || ''), 'ko');
        if (sortValue === 'benefit') return Number(b.dataset.benefitRank || 0) - Number(a.dataset.benefitRank || 0);
        if (sortValue === 'score') return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        if (sortValue === 'code') return String(a.dataset.code || '').localeCompare(String(b.dataset.code || ''), 'ko');
        return Number(a.dataset.order || 0) - Number(b.dataset.order || 0);
      }).forEach((card) => grid.appendChild(card));
      let empty = $('.showcase-empty', grid.parentElement);
      if (!visible.length) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'showcase-empty';
          empty.textContent = '조건에 맞는 브랜드 카드가 없습니다.';
          grid.insertAdjacentElement('afterend', empty);
        }
      } else if (empty) empty.remove();
      updateShowcaseSummary(grid);
    }
    filters.forEach((btn) => btn.addEventListener('click', () => {
      filters.forEach((el) => el.classList.remove('is-active'));
      btn.classList.add('is-active');
      apply();
    }));
    sort?.addEventListener('change', apply);
    search?.addEventListener('input', apply);
    apply();
  }

  function wireCopyButtons() {
    document.addEventListener('click', async (event) => {
      const btn = event.target.closest('[data-copy-code], [data-copy-text]');
      if (!btn) return;
      const text = btn.getAttribute('data-copy-code') || btn.getAttribute('data-copy-text');
      if (!text) return;
      const label = btn.querySelector('[data-copy-label]');
      const original = label?.dataset.defaultLabel || label?.textContent?.trim() || '복사';
      if (label) label.dataset.defaultLabel = original;
      const ok = await copyText(text, '복사되었습니다.');
      if (ok && label) {
        label.textContent = '복사';
        btn.classList.add('is-copied');
        clearTimeout(btn._copyTimer);
        btn._copyTimer = setTimeout(() => {
          label.textContent = original;
          btn.classList.remove('is-copied');
        }, 1800);
      }
    });
  }

  async function init() {
    const payload = await getPayload().catch(() => null);
    if (!payload || !Array.isArray(payload.brands)) return;
    const brands = payload.brands;
    renderPromoGrid(brands);
    renderBrandDirectory(brands);
    renderQueryPackLinks(brands);
    wireCopyButtons();
    wireDomainPresetButtons();
    wireSearchPage(brands);
    wireCheckPage(brands);
    wireReportPage(brands);
    wireShowcaseControls();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
