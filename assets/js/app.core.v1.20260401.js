
(() => {
  const PROVIDERS_URL = '/assets/data/guaranteed.providers.v1.20260330.json';
  const BLOG_URL = '/assets/data/community.blog.v2.20260330.json';
  const REVIEW_LOG_URL = '/assets/data/review.logs.v1.20260330.json';
  const HISTORY_KEY = 'raven_lookup_history_v2';
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const googleUrl = (q) => `https://www.google.com/search?q=${encodeURIComponent(String(q || '').trim())}`;
  const normalizeDomain = (value='') => {
    let v = String(value || '').trim();
    if (!v) return '';
    try {
      const u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`);
      v = u.hostname || '';
    } catch (_) {}
    return String(v).toLowerCase().replace(/^www\./, '').replace(/\.$/, '').replace(/:\d+$/, '');
  };
  const isValidIp = (value='') => {
    const raw = String(value||'').trim();
    if (!raw) return false;
    if (raw.includes(':')) return /^[0-9a-f:]+$/i.test(raw);
    const parts = raw.split('.');
    return parts.length === 4 && parts.every((p)=>/^\d+$/.test(p) && Number(p)>=0 && Number(p)<=255);
  };
  const fmtDate = (v) => {
    if (!v) return '-';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? String(v) : new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium'}).format(d);
  };
  const ageLabel = (days) => {
    const n = Number(days); if (!Number.isFinite(n) || n < 0) return '-';
    if (n < 30) return `${n}일`; if (n < 365) return `${Math.max(1, Math.round(n/30))}개월`; return `${(n/365).toFixed(1)}년`;
  };
  const toast = (msg) => {
    let t = $('#siteToast');
    if (!t) { t = document.createElement('div'); t.id='siteToast'; t.className='safety-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-show'); clearTimeout(toast._timer); toast._timer = setTimeout(()=>t.classList.remove('is-show'), 1600);
  };
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(String(text)); toast('복사되었습니다.'); }
    catch (_) {
      const ta = document.createElement('textarea'); ta.value = String(text); ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('복사되었습니다.'); } catch (__){ toast('자동 복사가 제한되었습니다.'); }
      ta.remove();
    }
  };
  async function fetchJson(url){ const res = await fetch(url,{cache:'no-store'}); const data = await res.json().catch(()=>({})); if(!res.ok || data.ok===false) throw new Error(data.message || data.error || 'request_failed'); return data; }

  function renderBlogPreviews(posts){
    $$('[data-blog-preview-grid]').forEach((grid)=>{
      const limit = Number(grid.getAttribute('data-limit') || '2');
      grid.innerHTML = posts.slice(0, limit).map((p)=>`<a class="article-card" href="/blog/${esc(p.slug)}/"><span class="article-kicker">${esc(p.kicker||'가이드')}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></a>`).join('');
    });
  }
  function renderReviewLogs(logs){
    $$('[data-review-log-grid]').forEach((grid)=>{
      const limit = Number(grid.getAttribute('data-limit') || String(logs.length));
      grid.innerHTML = logs.slice(0, limit).map((item)=>`<article class="review-log-card"><div class="review-log-head"><span class="status-chip" data-status="${esc(item.status)}">${esc(item.status)}</span><span class="risk-chip">${esc(item.risk)}</span></div><h3>${esc(item.title)}</h3><small>${esc(item.target)} · ${esc(item.type)} · ${esc(fmtDate(item.updated))}</small><p>${esc(item.summary)}</p><div class="review-log-signals">${(item.signals||[]).map((s)=>`<span class="signal-chip">${esc(s)}</span>`).join('')}</div></article>`).join('');
    });
  }
  function providerCard(item){
    const pending = !!item.pending;
    const action = pending ? `<span class="guaranteed-link is-disabled" aria-disabled="true">바로가기</span>` : `<a class="guaranteed-link" href="${esc(item.officialUrl)}" target="_blank" rel="noopener noreferrer">바로가기</a>`;
    const code = pending ? `<span class="guaranteed-code guaranteed-code--static">${esc(item.code || '준비중')}</span>` : `<button class="guaranteed-code" type="button" data-copy-text="${esc(item.code)}"><span data-copy-label data-default-label="${esc(item.code)}">${esc(item.code)}</span></button>`;
    return `<article class="guaranteed-card" data-theme="${esc(item.theme)}"><div class="guaranteed-summary"><span class="guaranteed-summary-text">${esc(item.oneLine || '공식 주소와 가입코드 확인')}</span><span class="guaranteed-status">${pending ? '준비중' : '운영중'}</span></div><div class="guaranteed-table"><div class="guaranteed-row"><span class="guaranteed-label">이름</span><strong class="guaranteed-value">${esc(item.name)}</strong></div><div class="guaranteed-row"><span class="guaranteed-label guaranteed-label--code">가입코드</span>${code}</div></div><div class="guaranteed-detail" hidden><div class="guaranteed-detail-grid"><div class="guaranteed-detail-line"><span>공식 주소</span><strong>${esc(item.officialDomain || item.officialUrl || '-')}</strong></div><div class="guaranteed-detail-line"><span>확인 기준</span><strong>${esc((item.benefits || []).slice(0,2).join(' · ') || '공식 주소와 코드 확인')}</strong></div><div class="guaranteed-detail-line"><span>핵심 태그</span><strong>${esc((item.tags || []).slice(0,3).join(' · ') || '-')}</strong></div><div class="guaranteed-detail-line"><span>상태 안내</span><strong>${pending ? '광고 준비중' : '운영중'}</strong></div></div></div><div class="guaranteed-actions"><button class="guaranteed-toggle" type="button" data-guaranteed-toggle aria-expanded="false"><span>상세보기</span></button>${action}</div></article>`;
  }
  function renderGuaranteedCards(providers){
    $$('[data-guaranteed-grid]').forEach((grid)=>{ if (grid.children.length) return; grid.innerHTML = providers.map(providerCard).join(''); });
  }
  function wireGuaranteed(){
    document.addEventListener('click', async (e)=>{
      const copyBtn = e.target.closest('[data-copy-text]');
      if (copyBtn) {
        const label = $('[data-copy-label]', copyBtn); const def = label?.getAttribute('data-default-label') || label?.textContent || '복사';
        await copyText(copyBtn.getAttribute('data-copy-text') || '');
        if (label) { label.textContent = '복사 완료'; setTimeout(()=>label.textContent = def, 1400); }
        return;
      }
      const toggle = e.target.closest('[data-guaranteed-toggle]');
      if (!toggle) return;
      const card = toggle.closest('.guaranteed-card'); const detail = card?.querySelector('.guaranteed-detail');
      if (!card || !detail) return;
      const open = detail.hasAttribute('hidden');
      $$('.guaranteed-card').forEach((node)=>{ if (node !== card) node.classList.remove('is-open'); });
      $$('.guaranteed-card .guaranteed-detail').forEach((panel)=>{ if (panel !== detail) panel.setAttribute('hidden',''); });
      $$('[data-guaranteed-toggle]').forEach((btn)=>{ if (btn !== toggle) { btn.setAttribute('aria-expanded','false'); const s = btn.querySelector('span'); if (s) s.textContent = '상세보기'; } });
      if (open) { detail.removeAttribute('hidden'); card.classList.add('is-open'); toggle.setAttribute('aria-expanded','true'); toggle.querySelector('span').textContent='접기'; }
      else { detail.setAttribute('hidden',''); card.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false'); toggle.querySelector('span').textContent='상세보기'; }
    });
  }
  function wireGoogleForms(){
    $$('[data-google-form]').forEach((form)=>{
      const input = $('input[name="q"]', form); const select = $('select[name="type"]', form); const helper = $('[data-preview-target]', form) ? document.querySelector(form.getAttribute('data-preview-target')) : null;
      if (!input) return;
      form.addEventListener('submit', (e)=>{ e.preventDefault(); const clean = String(input.value||'').trim(); if(!clean){ toast('먼저 사이트명이나 도메인을 입력해 주세요.'); return; } const suffix = select?.value || '먹튀'; window.open(googleUrl(`${clean} ${suffix}`),'_blank','noopener'); if(helper){ const domain = normalizeDomain(clean); helper.innerHTML = `<div class="card helper-note">${esc(clean)} · ${esc(suffix)} 검색을 새 탭으로 열었습니다.${domain ? ` <a href="/muktu-police/check/?domain=${encodeURIComponent(domain)}">도메인 조회 ↗</a>` : ''}</div>`; } });
    });
  }
  function wireSearchPage(){
    const form = $('#googleSearchForm'); const input = $('#siteKeywordInput'); const select = $('#siteSearchType'); const preview = $('#googlePreviewBtn'); const result = $('#googleQueryResults');
    if(!form || !input || !result) return;
    const render = () => {
      const clean = String(input.value||'').trim(); const suffix = select?.value || '먹튀';
      if (!clean) { result.className='empty-state'; result.innerHTML='<strong>사이트명 또는 도메인을 입력해 주세요.</strong>예: 사이트명, example.com'; return; }
      const terms = ['먹튀','후기','주소','도메인 변경','가입코드','메이저'];
      const domain = normalizeDomain(clean);
      result.className = 'result-stack';
      result.innerHTML = `<div class="card"><div class="section-head"><div><h2>${esc(clean)} · ${esc(suffix)}</h2><p>가장 많이 쓰는 조합만 먼저 정리합니다.</p></div><div class="section-head-actions"><a class="safety-link-btn" href="${googleUrl(`${clean} ${suffix}`)}" target="_blank" rel="noopener noreferrer">구글 검색</a></div></div><div class="lookup-links">${terms.map((term)=>`<article class="lookup-link-card"><a href="${googleUrl(`${clean} ${term}`)}" target="_blank" rel="noopener noreferrer">${esc(term)} ↗</a><p>${esc(`${clean} ${term}`)}</p></article>`).join('')}</div></div><div class="card"><div class="section-head"><div><h2>다음 확인</h2><p>검색이 끝나면 조회와 근거 정리로 이어집니다.</p></div></div><div class="lookup-links"><article class="lookup-link-card"><a href="/muktu-police/check/${domain ? `?domain=${encodeURIComponent(domain)}` : ''}">도메인·IP 조회 ↗</a><p>${domain ? esc(domain) + ' 기준으로 바로 조회합니다.' : '도메인이 있으면 바로 조회할 수 있습니다.'}</p></article><article class="lookup-link-card"><a href="/tools/evidence-bundle/">공개 근거 추출 ↗</a><p>공개 글 URL이 있으면 제목, 날짜, 도메인·IP 언급만 정리합니다.</p></article><article class="lookup-link-card"><a href="/blog/google-muktu-search-guide/">검색 기준 읽기 ↗</a><p>검색어를 왜 나눠 쓰는지부터 확인합니다.</p></article></div></div>`;
      };
    form.addEventListener('submit',(e)=>{ e.preventDefault(); const clean=String(input.value||'').trim(); if(!clean){ toast('먼저 사이트명이나 도메인을 입력해 주세요.'); return; } const suffix=select?.value||'먹튀'; window.open(googleUrl(`${clean} ${suffix}`),'_blank','noopener'); render(); });
    preview?.addEventListener('click', render); render();
  }
  function bandLabel(score){ if(score>=80) return '낮음'; if(score>=60) return '중간'; if(score>=40) return '주의'; return '높음'; }
  function saveHistory(entry){ try{ const list=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]'); const next=[entry,...list.filter((x)=>!(x.kind===entry.kind&&x.key===entry.key))].slice(0,20); localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); }catch(_){} }
  function loadHistory(){ try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch(_){return[]} }
  function matchHistory(current){ return loadHistory().filter((x)=>x.key!==current.key).map((item)=>({item, asn:(current.asns||[]).filter((a)=>(item.asns||[]).includes(a)), ns:(current.nameservers||[]).filter((n)=>(item.nameservers||[]).includes(n)), subnet:(current.subnets||[]).filter((n)=>(item.subnets||[]).includes(n))})).filter((hit)=>hit.asn.length||hit.ns.length||hit.subnet.length).slice(0,6) }
  function renderHistory(hits){ if(!hits.length) return '<article class="history-card"><h3>최근 조회 이력과 겹친 항목 없음</h3><p>같은 브라우저 최근 조회에서 ASN, 네임서버, 대역이 아직 겹치지 않았습니다.</p></article>'; return hits.map((hit)=>`<article class="history-card"><h3>${esc(hit.item.label)}</h3><p>${esc(fmtDate(hit.item.checkedAt))}</p><ul class="history-list">${hit.asn.length?`<li>같은 ASN: ${esc(hit.asn.join(', '))}</li>`:''}${hit.subnet.length?`<li>같은 대역: ${esc(hit.subnet.join(', '))}</li>`:''}${hit.ns.length?`<li>같은 네임서버: ${esc(hit.ns.join(', '))}</li>`:''}</ul></article>`).join('') }
  function renderDomainLookup(payload){
    const result = $('#domainCheckResult'); if(!result) return;
    const rdap = payload.rdap || {}; const dns = payload.dns || {}; const risk = payload.risk || payload.summary || {}; const cluster = payload.cluster || {}; const networks = payload.networks || []; const interp = payload.interpretation || [];
    saveHistory({kind:'domain', key:payload.domain, label:payload.domain, checkedAt:payload.checkedAt, nameservers:dns.nameServers||[], subnets:cluster.subnets||[], asns:cluster.sharedAsns||[]});
    const hits = matchHistory({kind:'domain', key:payload.domain, label:payload.domain, checkedAt:payload.checkedAt, nameservers:dns.nameServers||[], subnets:cluster.subnets||[], asns:cluster.sharedAsns||[]});
    result.className='result-stack';
    result.innerHTML = `<div class="score-shell"><div class="score-top"><div><div class="score-big">${esc(risk.score ?? '-')}</div><span class="score-band">리스크 ${esc(risk.band || bandLabel(Number(risk.score || 0)))}</span></div><div class="score-meta"><h2 class="score-title">${esc(payload.domain)}</h2><p>${esc(risk.commentary || '등록일, DNS, ASN, 공개 검색 연결까지 함께 봅니다.')}</p><p>신뢰도 ${esc(risk.confidence || '중간')} · 판정 ${esc(risk.verdict || '추가 확인')}</p></div></div><div class="score-bar"><span style="width:${Math.max(0, Math.min(100, Number(risk.score||0)))}%"></span></div><div class="score-grid"><div class="score-metric"><span>등록일</span><strong>${esc(fmtDate(rdap.createdAt))}</strong></div><div class="score-metric"><span>도메인 연차</span><strong>${esc(ageLabel(rdap.ageDays))}</strong></div><div class="score-metric"><span>만료일</span><strong>${esc(fmtDate(rdap.expiresAt))}</strong></div><div class="score-metric"><span>클러스터</span><strong>${esc(cluster.summary || '-')}</strong></div></div>${(risk.drivers||[]).length?`<ul class="penalty-list">${risk.drivers.map((d)=>`<li>${esc(d.label)} · ${esc(d.detail)}</li>`).join('')}</ul>`:''}</div><div class="card"><div class="section-head"><div><h2>해석 요약</h2><p>숫자를 바로 읽기 어렵지 않도록 핵심 문장으로 정리합니다.</p></div></div><div class="interpretation-grid">${interp.map((item)=>`<article class="interpret-card"><span class="risk-chip">${esc(item.level || '기본')}</span><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></article>`).join('')}</div></div><div class="card"><div class="section-head"><div><h2>기본 값</h2><p>네임서버, A 레코드, ASN을 함께 봅니다.</p></div></div><div class="lookup-links"><article class="lookup-link-card"><h3>네임서버</h3><p>${esc((dns.nameServers||[]).join(', ') || '-')}</p></article><article class="lookup-link-card"><h3>A 레코드</h3><p>${esc((dns.aRecords||[]).join(', ') || '-')}</p></article><article class="lookup-link-card"><h3>IP · ASN</h3><p>${esc(networks.map((n)=>[n.ip,n.asn,n.org].filter(Boolean).join(' · ')).join(' / ') || '-')}</p></article></div></div><div class="card"><div class="section-head"><div><h2>최근 조회 비교</h2><p>같은 브라우저에서 최근 본 항목과 겹치는 힌트를 같이 보여줍니다.</p></div></div><div class="evidence-grid">${renderHistory(hits)}</div></div>`;
  }
  function renderIpLookup(payload){
    const result = $('#ipCheckResult'); if(!result) return;
    const info=payload.ip||{}; const ptr=payload.ptr||[]; const risk=payload.risk||{}; const interp=payload.interpretation||[]; const cluster=payload.cluster||{};
    saveHistory({kind:'ip', key:info.ip, label:info.ip, checkedAt:payload.checkedAt, nameservers:[], subnets:cluster.subnets||[], asns:cluster.sharedAsns||[]});
    const hits = matchHistory({kind:'ip', key:info.ip, label:info.ip, checkedAt:payload.checkedAt, nameservers:[], subnets:cluster.subnets||[], asns:cluster.sharedAsns||[]});
    result.className='result-stack';
    result.innerHTML = `<div class="score-shell"><div class="score-top"><div><div class="score-big">${esc(risk.score ?? '-')}</div><span class="score-band">리스크 ${esc(risk.band || bandLabel(Number(risk.score || 0)))}</span></div><div class="score-meta"><h2 class="score-title">${esc(info.ip || '-')}</h2><p>${esc(risk.commentary || 'ASN, 조직, PTR, 공개 검색 연결까지 함께 봅니다.')}</p><p>신뢰도 ${esc(risk.confidence || '중간')}</p></div></div><div class="score-bar"><span style="width:${Math.max(0, Math.min(100, Number(risk.score||0)))}%"></span></div><div class="score-grid"><div class="score-metric"><span>국가</span><strong>${esc(info.country || '-')}</strong></div><div class="score-metric"><span>도시</span><strong>${esc(info.city || '-')}</strong></div><div class="score-metric"><span>ASN</span><strong>${esc(info.asn || '-')}</strong></div><div class="score-metric"><span>조직</span><strong>${esc(info.org || info.isp || '-')}</strong></div></div>${(risk.drivers||[]).length?`<ul class="penalty-list">${risk.drivers.map((d)=>`<li>${esc(d.label)} · ${esc(d.detail)}</li>`).join('')}</ul>`:''}</div><div class="card"><div class="section-head"><div><h2>해석 요약</h2><p>IP 기준으로 먼저 볼 항목만 정리합니다.</p></div></div><div class="interpretation-grid">${interp.map((item)=>`<article class="interpret-card"><span class="risk-chip">${esc(item.level || '기본')}</span><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></article>`).join('')}</div></div><div class="card"><div class="section-head"><div><h2>PTR · 네트워크</h2><p>역방향 응답과 네트워크 정보를 같이 봅니다.</p></div></div><div class="lookup-links"><article class="lookup-link-card"><h3>PTR</h3><p>${esc(ptr.join(', ') || '-')}</p></article><article class="lookup-link-card"><h3>네트워크</h3><p>${esc(info.network || '-')}</p></article><article class="lookup-link-card"><h3>타입</h3><p>${esc(info.type || '-')}</p></article></div></div><div class="card"><div class="section-head"><div><h2>최근 조회 비교</h2><p>같은 ASN이나 서브넷이 최근 이력과 겹치는지 같이 봅니다.</p></div></div><div class="evidence-grid">${renderHistory(hits)}</div></div>`;
  }
  function wireCheckPage(){
    const domainForm=$('#domainCheckForm'), domainInput=$('#domainCheckInput'), domainResult=$('#domainCheckResult');
    const ipForm=$('#ipCheckForm'), ipInput=$('#ipCheckInput'), ipResult=$('#ipCheckResult');
    if (domainForm && domainInput && domainResult) domainForm.addEventListener('submit', async (e)=>{ e.preventDefault(); const domain=normalizeDomain(domainInput.value); if(!domain || !domain.includes('.')){ domainResult.className='empty-state'; domainResult.innerHTML='<strong>도메인 형식을 다시 확인해 주세요.</strong>예: example.com'; return; } domainResult.className='empty-state'; domainResult.innerHTML='<strong>도메인 점검 중입니다.</strong>등록일, DNS, ASN, 점수를 불러옵니다.'; try{ const payload=await fetchJson(`/api/safety/domain?domain=${encodeURIComponent(domain)}`); renderDomainLookup(payload); }catch(err){ domainResult.className='empty-state'; domainResult.innerHTML=`<strong>조회에 실패했습니다.</strong>${esc(err.message || '잠시 후 다시 시도해 주세요.')}`; } });
    if (ipForm && ipInput && ipResult) ipForm.addEventListener('submit', async (e)=>{ e.preventDefault(); const ip=String(ipInput.value||'').trim(); if(!isValidIp(ip)){ ipResult.className='empty-state'; ipResult.innerHTML='<strong>IP 형식을 다시 확인해 주세요.</strong>예: 1.1.1.1'; return; } ipResult.className='empty-state'; ipResult.innerHTML='<strong>IP 점검 중입니다.</strong>ASN, PTR, 점수를 불러옵니다.'; try{ const payload=await fetchJson(`/api/safety/ip?ip=${encodeURIComponent(ip)}`); renderIpLookup(payload); }catch(err){ ipResult.className='empty-state'; ipResult.innerHTML=`<strong>조회에 실패했습니다.</strong>${esc(err.message || '잠시 후 다시 시도해 주세요.')}`; } });
    const url = new URL(location.href); if (url.searchParams.get('domain') && domainInput) { domainInput.value = url.searchParams.get('domain'); domainForm?.dispatchEvent(new Event('submit', {cancelable:true})); } if (url.searchParams.get('ip') && ipInput) { ipInput.value = url.searchParams.get('ip'); ipForm?.dispatchEvent(new Event('submit', {cancelable:true})); }
  }
  function renderEvidenceResult(payload){
    const result = $('#publicEvidenceResult'); if(!result) return;
    const src=payload.source||{}; const ev=payload.evidence||{};
    result.className='result-stack';
    result.innerHTML = `<div class="card"><div class="section-head"><div><h2>${esc(src.title || '공개 근거 추출 결과')}</h2><p>${esc(src.url || '')}</p></div><div class="section-head-actions"><a class="safety-link-btn ghost" href="${esc(src.url || '#')}" target="_blank" rel="noopener noreferrer">원문 열기</a></div></div><div class="score-grid"><div class="score-metric"><span>호스트</span><strong>${esc(src.host || '-')}</strong></div><div class="score-metric"><span>게시일</span><strong>${esc(fmtDate(src.publishedAt))}</strong></div><div class="score-metric"><span>도메인 언급</span><strong>${esc((ev.domains||[]).length)}</strong></div><div class="score-metric"><span>IP 언급</span><strong>${esc((ev.ips||[]).length)}</strong></div></div>${ev.excerpt ? `<p class="helper-note">${esc(ev.excerpt)}</p>` : ''}</div><div class="card"><div class="section-head"><div><h2>추출된 항목</h2><p>원문을 길게 복사하지 않고 메타 항목만 정리합니다.</p></div></div><div class="evidence-grid"><article class="evidence-source-card"><h3>도메인</h3><p>${esc((ev.domains||[]).join(', ') || '-')}</p></article><article class="evidence-source-card"><h3>IP</h3><p>${esc((ev.ips||[]).join(', ') || '-')}</p></article><article class="evidence-source-card"><h3>텔레그램</h3><p>${esc((ev.telegrams||[]).join(', ') || '-')}</p></article><article class="evidence-source-card"><h3>오픈카카오</h3><p>${esc((ev.kakaos||[]).join(', ') || '-')}</p></article></div></div>`;
  }
  function wireEvidence(){ const form=$('#publicEvidenceForm'); const input=$('#publicEvidenceInput'); const result=$('#publicEvidenceResult'); if(!form || !input || !result) return; form.addEventListener('submit', async (e)=>{ e.preventDefault(); const url=String(input.value||'').trim(); if(!/^https?:\/\//i.test(url)){ result.className='empty-state'; result.innerHTML='<strong>공개 글 URL 형식을 다시 확인해 주세요.</strong>예: https://example.com/post'; return; } result.className='empty-state'; result.innerHTML='<strong>근거 추출 중입니다.</strong>제목, 날짜, URL, 도메인·IP 언급을 정리하고 있습니다.'; try{ const payload=await fetchJson(`/api/safety/evidence?url=${encodeURIComponent(url)}`); renderEvidenceResult(payload); }catch(err){ result.className='empty-state'; result.innerHTML=`<strong>근거 추출에 실패했습니다.</strong>${esc(err.message || '허용된 공개 페이지 URL인지 다시 확인해 주세요.')}`; } }); }
  async function init(){
    wireGuaranteed(); wireGoogleForms(); wireSearchPage(); wireCheckPage(); wireEvidence();
    const [providers, posts, logs] = await Promise.all([
      fetchJson(PROVIDERS_URL).then((d)=>d.providers || []).catch(()=>[]),
      fetchJson(BLOG_URL).then((d)=>d.posts || []).catch(()=>[]),
      fetchJson(REVIEW_LOG_URL).then((d)=>d.entries || []).catch(()=>[])
    ]);
    renderGuaranteedCards(providers); renderBlogPreviews(posts); renderReviewLogs(logs);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
