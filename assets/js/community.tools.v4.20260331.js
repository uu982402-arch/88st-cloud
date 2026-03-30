(() => {
  const PROVIDERS_URL = '/assets/data/guaranteed.providers.v1.20260330.json';
  const BLOG_URL = '/assets/data/community.blog.v2.20260330.json';
  const REVIEW_LOG_URL = '/assets/data/review.logs.v1.20260330.json';
  const PUBLIC_SOURCE_GROUPS = [
    ['mt-police07.com', 'mt-spot.com', 'daumd08.net'],
    ['mtlevel.com', 'mtgal.com']
  ];
  const HISTORY_KEY = 'raven_lookup_history_v1';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
  }
  function toast(msg) {
    let t = $('#communityToast');
    if (!t) {
      t = document.createElement('div'); t.id = 'communityToast'; t.className = 'safety-toast'; document.body.appendChild(t);
    }
    t.textContent = msg; t.classList.add('is-show'); clearTimeout(toast._timer); toast._timer = setTimeout(()=>t.classList.remove('is-show'), 1800);
  }
  async function copyText(text, label) {
    try { await navigator.clipboard.writeText(String(text)); toast(label || '복사되었습니다.'); }
    catch(e){ const ta=document.createElement('textarea'); ta.value=String(text); ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy'); toast(label||'복사되었습니다.');}catch(_){toast('자동 복사가 제한되었습니다.');} ta.remove(); }
  }
  function googleUrl(q){ return `https://www.google.com/search?q=${encodeURIComponent(String(q||'').trim())}`; }
  function normalizeDomain(value=''){ let v=String(value||'').trim(); if(!v) return ''; try { const u=new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(v)?v:`https://${v}`); v=u.hostname||''; } catch(_){} return String(v).toLowerCase().replace(/^www\./,'').replace(/\.$/,'').split('/')[0].split('?')[0].split('#')[0].replace(/:\d+$/,''); }
  function isValidIp(value=''){ const raw=String(value||'').trim(); if(!raw) return false; if(raw.includes(':')) return /^[0-9a-f:]+$/i.test(raw); const parts=raw.split('.'); return parts.length===4 && parts.every((p)=>/^\d+$/.test(p)&&Number(p)>=0&&Number(p)<=255); }
  function formatDate(v){ if(!v) return '-'; const d=new Date(v); return Number.isNaN(d.getTime()) ? String(v) : new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium'}).format(d); }
  function ageLabel(days){ const n=Number(days); if(!Number.isFinite(n)||n<0) return '-'; if(n<30) return `${n}일`; if(n<365) return `${Math.max(1,Math.round(n/30))}개월`; return `${(n/365).toFixed(1)}년`; }

  async function fetchJson(url){ const res=await fetch(url,{cache:'no-store'}); let data={}; try{data=await res.json();}catch(e){} if(!res.ok || data.ok===false) throw new Error(data.message||data.error||'request_failed'); return data; }

  async function loadProviders(){ try { const data=await fetchJson(PROVIDERS_URL); return Array.isArray(data.providers)?data.providers:[]; } catch(_) { return []; } }
  async function loadBlogPosts(){ try { const data=await fetchJson(BLOG_URL); return Array.isArray(data.posts)?data.posts:[]; } catch(_) { return []; } }
  async function loadReviewLogs(){ try { const data=await fetchJson(REVIEW_LOG_URL); return Array.isArray(data.entries)?data.entries:[]; } catch(_) { return []; } }

  function renderBlogPreviews(posts){ $$('[data-blog-preview-grid]').forEach((grid)=>{ const limit=Number(grid.getAttribute('data-limit')||'3'); const rows=posts.slice(0,limit).map((p)=>`<a class="article-card" href="/blog/${esc(p.slug)}/"><span class="article-kicker">${esc(p.kicker||'글')}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></a>`).join(''); grid.innerHTML = rows; }); }
  function renderReviewLogs(logs){ $$('[data-review-log-grid]').forEach((grid)=>{ const limit=Number(grid.getAttribute('data-limit')||logs.length); grid.innerHTML = logs.slice(0,limit).map((item)=>`<article class="review-log-card"><div class="review-log-head"><span class="status-chip" data-status="${esc(item.status)}">${esc(item.status)}</span><span class="risk-chip">${esc(item.risk)}</span></div><h3>${esc(item.title)}</h3><small>${esc(item.target)} · ${esc(item.type)} · ${esc(formatDate(item.updated))}</small><p>${esc(item.summary)}</p><div class="review-log-signals">${(item.signals||[]).map((s)=>`<span class="signal-chip">${esc(s)}</span>`).join('')}</div></article>`).join(''); }); }
  function renderGuaranteedCards(providers){ $$('[data-guaranteed-grid]').forEach((grid)=>{ grid.innerHTML = providers.map((item)=>`<article class="guaranteed-card guaranteed-card--panel" data-theme="${esc(item.theme)}"><div class="guaranteed-summary">${esc(item.oneLine)}</div><div class="guaranteed-table"><div class="guaranteed-row"><span class="guaranteed-label">이름</span><strong class="guaranteed-value">${esc(item.name)}</strong></div><div class="guaranteed-row"><span class="guaranteed-label">가입코드</span><button class="guaranteed-code" type="button" data-copy-text="${esc(item.code)}"><span data-copy-label data-default-label="${esc(item.code)}">${esc(item.code)}</span></button></div></div><div class="guaranteed-detail" hidden><div class="guaranteed-detail-line"><span>공식주소</span><strong>${esc(item.officialDomain)}</strong></div><div class="guaranteed-detail-line"><span>핵심확인</span><strong>${esc((item.benefits||[]).slice(0,2).join(' · ') || '공식 주소와 가입코드 확인')}</strong></div><div class="tag-row">${(item.tags||[]).slice(0,3).map((t)=>`<span class="tag-chip">${esc(t)}</span>`).join('')}</div></div><div class="guaranteed-actions"><button class="guaranteed-toggle" type="button" data-guaranteed-toggle aria-expanded="false"><span>상세보기</span></button><a class="guaranteed-link" href="${esc(item.officialUrl)}" target="_blank" rel="noopener noreferrer">바로가기</a></div></article>`).join(''); }); }

  function saveLookupHistory(entry){
    try {
      const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const next = [entry, ...list.filter((x)=>!(x.kind===entry.kind && x.key===entry.key))].slice(0,25);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch(_) {}
  }
  function loadLookupHistory(){ try { return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]'); } catch(_) { return []; } }
  function matchHistory(current){
    const items = loadLookupHistory().filter((x)=>x.key!==current.key);
    const hits=[];
    for (const item of items) {
      const overlapNs = (current.nameservers||[]).filter((ns)=> (item.nameservers||[]).includes(ns));
      const overlapSub = (current.subnets||[]).filter((s)=> (item.subnets||[]).includes(s));
      const overlapAsn = (current.asns||[]).filter((a)=> (item.asns||[]).includes(a));
      if (overlapNs.length || overlapSub.length || overlapAsn.length) {
        hits.push({ item, overlapNs, overlapSub, overlapAsn });
      }
    }
    return hits.slice(0,6);
  }

  function renderPublicEvidenceGrid(){
    $$('[data-public-evidence-grid]').forEach((grid)=>{
      grid.innerHTML = `
      <article class="community-source-card"><h3>가져올 수 있는 항목</h3><p>제목, 날짜, URL, 도메인, IP, 채널 흔적처럼 공개적으로 확인 가능한 항목만 기록합니다.</p></article>
      <article class="community-source-card"><h3>정리 원칙</h3><p>본문을 길게 복사하지 않고 핵심 항목과 원문 링크만 남기는 방식입니다.</p></article>
      <article class="community-source-card"><h3>다음 확인</h3><p>검색과 공개 글 확인 뒤에는 도메인·IP 조회로 넘어가 점수와 해석을 같이 봅니다.</p><strong>/tools 의 공개 근거 추출기 사용</strong></article>`;
    });
  }

  function buildQuery(keyword, suffix){ return [String(keyword||'').trim(), String(suffix||'').trim()].filter(Boolean).join(' ').trim(); }
  function buildPublicQuery(keyword, suffix, groupIdx){ const domains = PUBLIC_SOURCE_GROUPS[groupIdx] || []; const scope = domains.map((d)=>`site:${d}`).join(' OR '); return `${scope} ${buildQuery(keyword, suffix)}`.trim(); }

  function renderHomePreview(keyword, suffix){
    const target=$('#homeSearchPreview'); if(!target) return; const clean=String(keyword||'').trim(); if(!clean){target.innerHTML=''; return;}
    const q=buildQuery(clean, suffix||'먹튀'); const domain=normalizeDomain(clean);
    target.innerHTML = `<div class="glass-card helper-box"><div class="section-head"><div><h2>바로 이어 보기</h2><p>검색, 기술 조회, 근거 정리를 바로 이어서 엽니다.</p></div></div><div class="lookup-links"><article class="lookup-link-card"><a href="${googleUrl(q)}" target="_blank" rel="noopener noreferrer">구글에서 보기 ↗</a><p>${esc(q)}</p></article><article class="lookup-link-card"><a href="/muktu-police/search/?q=${encodeURIComponent(clean)}&type=${encodeURIComponent(suffix||'먹튀')}">구글링 페이지 ↗</a><p>검색 조합과 공개 근거 확인으로 이어서 봅니다.</p></article><article class="lookup-link-card"><a href="/muktu-police/check/${domain && domain.includes('.') ? `?domain=${encodeURIComponent(domain)}`:''}">도메인·IP 조회 ↗</a><p>기술적 기본값과 점수를 확인합니다.</p></article></div></div>`;
  }

  function wireQuickGoogleForms(){
    $$('[data-google-form]').forEach((form)=>{
      const input=$('input[name="q"]', form); const select=$('select[name="type"]', form); if(!input) return;
      form.addEventListener('submit',(e)=>{ e.preventDefault(); const q=buildQuery(input.value, select?.value || '먹튀'); if(!q){toast('먼저 사이트명이나 도메인을 입력해 주세요.'); return;} window.open(googleUrl(q), '_blank', 'noopener'); renderHomePreview(input.value, select?.value || '먹튀'); });
    });
  }

  function renderSearchResults(keyword, suffix){
    const target=$('#googleQueryResults'); if(!target) return; const clean=String(keyword||'').trim(); if(!clean){ target.className='result-panel empty-state'; target.innerHTML='<strong>검색할 사이트명 또는 도메인을 입력해 주세요.</strong>예: 사이트명, example.com'; return; }
    const terms=['먹튀','후기','주소','도메인 변경','가입코드','메이저'];
    const cards=terms.map((t)=>`<article class="lookup-link-card"><a href="${googleUrl(buildQuery(clean,t))}" target="_blank" rel="noopener noreferrer">${esc(t)} 검색 ↗</a><p>${esc(buildQuery(clean,t))}</p></article>`).join('');
    const pub=PUBLIC_SOURCE_GROUPS.map((_,i)=>`<article class="lookup-link-card"><a href="${googleUrl(buildPublicQuery(clean,suffix||'먹튀',i))}" target="_blank" rel="noopener noreferrer">공개 검색 ${i+1} ↗</a><p>${esc(buildPublicQuery(clean,suffix||'먹튀',i))}</p></article>`).join('');
    const domain=normalizeDomain(clean);
    target.className='result-stack';
    target.innerHTML = `<div class="glass-card helper-box"><div class="section-head"><div><h2>${esc(buildQuery(clean,suffix))}</h2><p>입력한 키워드로 일반 검색과 공개 검색을 나눠 실행합니다.</p></div><div class="section-head-actions"><a class="safety-link-btn" href="${googleUrl(buildQuery(clean,suffix))}" target="_blank" rel="noopener noreferrer">구글에서 검색</a><button class="safety-copy-btn ghost" type="button" data-copy-text="${esc(buildQuery(clean,suffix))}"><span data-copy-label data-default-label="검색어 복사">검색어 복사</span></button></div></div><div class="lookup-links">${cards}</div></div><div class="glass-card helper-box"><div class="section-head"><div><h2>공개 검색 묶음</h2><p>허용된 공개 페이지 기준으로 같은 키워드를 다시 검색합니다.</p></div></div><div class="lookup-community-links">${pub}</div></div><div class="glass-card helper-box"><div class="section-head"><div><h2>다음 확인</h2><p>검색 결과만으로 부족하면 조회와 근거 추출기로 넘어갑니다.</p></div></div><div class="lookup-links"><article class="lookup-link-card"><a href="/muktu-police/check/${domain&&domain.includes('.')?`?domain=${encodeURIComponent(domain)}`:''}">도메인·IP 조회 ↗</a><p>${domain ? `${esc(domain)} 기준으로 바로 조회할 수 있습니다.` : '도메인이 있으면 바로 조회로 넘어갑니다.'}</p></article><article class="lookup-link-card"><a href="/tools/#evidenceExtractor">공개 근거 추출기 ↗</a><p>공개 글 URL이 있으면 제목, 날짜, URL, 도메인·IP 언급만 정리합니다.</p></article><article class="lookup-link-card"><a href="/blog/google-muktu-search-guide/">검색 가이드 ↗</a><p>검색어를 왜 나눠 보는지 기준부터 확인할 수 있습니다.</p></article></div></div>`;
  }

  function wireSearchPage(){
    const form=$('#googleSearchForm'); const input=$('#siteKeywordInput'); const select=$('#siteSearchType'); const preview=$('#googlePreviewBtn');
    if(!form || !input) return;
    const run=()=>renderSearchResults(input.value, select?.value || '먹튀');
    form.addEventListener('submit',(e)=>{ e.preventDefault(); const q=buildQuery(input.value, select?.value||'먹튀'); if(!q){toast('먼저 사이트명이나 도메인을 입력해 주세요.'); return;} window.open(googleUrl(q),'_blank','noopener'); run(); });
    preview?.addEventListener('click', run);
    const url=new URL(location.href); const q=url.searchParams.get('q'); const type=url.searchParams.get('type'); if(q) input.value=q; if(type&&select) select.value=type; renderSearchResults(input.value||'', select?.value||'먹튀');
  }

  function bandLabel(score){ if(score>=80) return '낮음'; if(score>=60) return '중간'; if(score>=40) return '주의'; return '높음'; }
  function renderHistoryMatches(historyHits){
    if (!historyHits.length) return '<div class="history-card"><h3>최근 조회 이력과 겹친 흔적 없음</h3><p>같은 브라우저에서 최근 조회한 도메인·IP 중 겹치는 네임서버, ASN, 서브넷이 아직 없습니다.</p></div>';
    return historyHits.map((hit)=>`<article class="history-card"><h3>${esc(hit.item.label)}</h3><p>${esc(hit.item.kind==='domain' ? '도메인 이력' : 'IP 이력')} · ${esc(formatDate(hit.item.checkedAt))}</p><ul class="history-list">${hit.overlapAsn.length?`<li>같은 ASN: ${esc(hit.overlapAsn.join(', '))}</li>`:''}${hit.overlapSub.length?`<li>같은 대역: ${esc(hit.overlapSub.join(', '))}</li>`:''}${hit.overlapNs.length?`<li>같은 네임서버: ${esc(hit.overlapNs.join(', '))}</li>`:''}</ul></article>`).join('');
  }
  function renderDomainLookup(payload){
    const result=$('#domainCheckResult'); if(!result) return;
    const rdap=payload.rdap||{}; const dns=payload.dns||{}; const risk=payload.risk||payload.summary||{}; const cluster=payload.cluster||{}; const networks=payload.networks||[]; const interp=payload.interpretation||[];
    const historyMatches=matchHistory({kind:'domain', key:payload.domain, label:payload.domain, checkedAt:payload.checkedAt, nameservers:dns.nameServers||[], subnets:cluster.subnets||[], asns:cluster.sharedAsns||[]});
    saveLookupHistory({kind:'domain', key:payload.domain, label:payload.domain, checkedAt:payload.checkedAt, nameservers:dns.nameServers||[], subnets:cluster.subnets||[], asns:cluster.sharedAsns||[]});
    result.className='result-stack';
    result.innerHTML = `
      <div class="score-shell"><div class="score-top"><div><div class="score-big">${esc(risk.score ?? payload.summary?.score ?? '-')}</div><span class="score-band">리스크 ${esc(risk.band || bandLabel(Number(risk.score||0)))}</span></div><div class="score-meta"><h2 class="score-title">${esc(payload.domain)}</h2><p>${esc(risk.commentary || payload.summary?.commentary || '등록일, DNS, IP 힌트를 함께 보여줍니다.')}</p><p>신뢰도 ${esc(risk.confidence || '중간')} · 판정 ${esc(risk.verdict || payload.summary?.verdict || '추가 확인')}</p></div></div><div class="score-bar"><span style="width:${Math.max(0,Math.min(100,Number(risk.score||payload.summary?.score||0)))}%"></span></div><div class="score-grid"><div class="score-metric"><span>등록일</span><strong>${esc(formatDate(rdap.createdAt))}</strong></div><div class="score-metric"><span>도메인 연차</span><strong>${esc(ageLabel(rdap.ageDays))}</strong></div><div class="score-metric"><span>만료일</span><strong>${esc(formatDate(rdap.expiresAt))}</strong></div><div class="score-metric"><span>클러스터</span><strong>${esc(cluster.summary || '-')}</strong></div></div>${(risk.drivers||[]).length?`<ul class="penalty-list">${risk.drivers.map((d)=>`<li>${esc(d.label)} · ${esc(d.detail)}</li>`).join('')}</ul>`:''}</div>
      <div class="glass-card helper-box"><div class="section-head"><div><h2>기술 해석 요약</h2><p>값을 그대로 보여주는 대신, 지금 확인한 신호를 문장으로 같이 읽습니다.</p></div></div><div class="interpretation-grid">${interp.map((item)=>`<article class="interpret-card"><span class="risk-chip">${esc(item.level || '기본')}</span><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></article>`).join('')}</div></div>
      <div class="glass-card helper-box"><div class="section-head"><div><h2>기본 값</h2><p>공개 검색과 같이 봐야 할 기술적 기초값입니다.</p></div></div><div class="lookup-links"><article class="lookup-link-card"><a href="#">네임서버</a><p>${esc((dns.nameServers||[]).join(', ') || '-')}</p></article><article class="lookup-link-card"><a href="#">A 레코드</a><p>${esc((dns.aRecords||[]).join(', ') || '-')}</p></article><article class="lookup-link-card"><a href="#">IP/ASN</a><p>${esc(networks.map((n)=>[n.ip,n.asn,n.org].filter(Boolean).join(' · ')).join(' / ') || '-')}</p></article></div></div>
      <div class="glass-card helper-box"><div class="section-head"><div><h2>클러스터 탐지</h2><p>같은 브라우저에서 최근 조회한 이력과 네임서버, ASN, /24 대역이 겹치는지 같이 봅니다.</p></div></div><div class="evidence-grid">${renderHistoryMatches(historyMatches)}</div></div>
      <div class="glass-card helper-box"><div class="section-head"><div><h2>연결 검색</h2><p>도메인 기준 검색과 공개 근거 확인으로 바로 이어집니다.</p></div></div><div class="lookup-community-links">${(payload.googleSearches||[]).map((item)=>`<article class="lookup-link-card"><a href="${esc(item.href||item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.label)} ↗</a><p>${esc(item.query)}</p></article>`).join('')}<article class="lookup-link-card"><a href="/tools/#evidenceExtractor">공개 근거 추출기 ↗</a><p>공개 글 URL이 있으면 제목, 날짜, URL, 도메인·IP 언급을 메타데이터로 정리합니다.</p></article></div></div>`;
  }
  function renderIpLookup(payload){
    const result=$('#ipCheckResult'); if(!result) return; const info=payload.ip||{}; const ptr=payload.ptr||[]; const risk=payload.risk||{}; const interp=payload.interpretation||[]; const cluster=payload.cluster||{};
    const historyMatches=matchHistory({kind:'ip', key:info.ip, label:info.ip, checkedAt:payload.checkedAt, nameservers:[], subnets:cluster.subnets||[], asns:cluster.sharedAsns||[]});
    saveLookupHistory({kind:'ip', key:info.ip, label:info.ip, checkedAt:payload.checkedAt, nameservers:[], subnets:cluster.subnets||[], asns:cluster.sharedAsns||[]});
    result.className='result-stack';
    result.innerHTML = `
      <div class="score-shell"><div class="score-top"><div><div class="score-big">${esc(risk.score ?? '-')}</div><span class="score-band">리스크 ${esc(risk.band || bandLabel(Number(risk.score||0)))}</span></div><div class="score-meta"><h2 class="score-title">${esc(info.ip || '-')}</h2><p>${esc(risk.commentary || payload.summary?.commentary || 'ASN, 조직, PTR, 공개 검색 조합을 함께 봅니다.')}</p><p>신뢰도 ${esc(risk.confidence || '중간')}</p></div></div><div class="score-bar"><span style="width:${Math.max(0,Math.min(100,Number(risk.score||0)))}%"></span></div><div class="score-grid"><div class="score-metric"><span>국가</span><strong>${esc(info.country || '-')}</strong></div><div class="score-metric"><span>도시</span><strong>${esc(info.city || '-')}</strong></div><div class="score-metric"><span>ASN</span><strong>${esc(info.asn || '-')}</strong></div><div class="score-metric"><span>조직</span><strong>${esc(info.org || info.isp || '-')}</strong></div></div>${(risk.drivers||[]).length?`<ul class="penalty-list">${risk.drivers.map((d)=>`<li>${esc(d.label)} · ${esc(d.detail)}</li>`).join('')}</ul>`:''}</div>
      <div class="glass-card helper-box"><div class="section-head"><div><h2>해석 요약</h2><p>IP 기준 핵심 해석만 정리했습니다.</p></div></div><div class="interpretation-grid">${interp.map((item)=>`<article class="interpret-card"><span class="risk-chip">${esc(item.level || '기본')}</span><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></article>`).join('')}</div></div>
      <div class="glass-card helper-box"><div class="section-head"><div><h2>PTR · 네트워크</h2><p>PTR 응답과 네트워크 기본 정보를 같이 봅니다.</p></div></div><div class="lookup-links"><article class="lookup-link-card"><a href="#">PTR</a><p>${esc(ptr.join(', ') || '-')}</p></article><article class="lookup-link-card"><a href="#">도메인</a><p>${esc(info.network || '-')}</p></article><article class="lookup-link-card"><a href="#">타입</a><p>${esc(info.type || '-')}</p></article></div></div>
      <div class="glass-card helper-box"><div class="section-head"><div><h2>최근 조회 비교</h2><p>같은 ASN이나 서브넷이 최근 이력과 겹치는지 확인합니다.</p></div></div><div class="evidence-grid">${renderHistoryMatches(historyMatches)}</div></div>
      <div class="glass-card helper-box"><div class="section-head"><div><h2>연결 검색</h2><p>IP 기준 공개 검색과 공개 근거 확인을 함께 엽니다.</p></div></div><div class="lookup-community-links">${(payload.googleSearches||[]).map((item)=>`<article class="lookup-link-card"><a href="${esc(item.href||item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.label)} ↗</a><p>${esc(item.query)}</p></article>`).join('')}</div></div>`;
  }
  function wireCheckPage(){
    const domainForm=$('#domainCheckForm'), domainInput=$('#domainCheckInput'), domainResult=$('#domainCheckResult');
    const ipForm=$('#ipCheckForm'), ipInput=$('#ipCheckInput'), ipResult=$('#ipCheckResult');
    if(domainForm && domainInput && domainResult){ domainForm.addEventListener('submit', async (e)=>{ e.preventDefault(); const domain=normalizeDomain(domainInput.value); if(!domain || !domain.includes('.')){ domainResult.className='empty-state'; domainResult.innerHTML='<strong>도메인 형식을 다시 확인해 주세요.</strong>예: example.com'; return; } domainResult.className='empty-state'; domainResult.innerHTML='<strong>도메인 점검 중입니다.</strong>등록일, DNS, ASN, 점수와 해석을 불러옵니다.'; try { const payload=await fetchJson(`/api/safety/domain?domain=${encodeURIComponent(domain)}`); renderDomainLookup(payload); } catch(err){ domainResult.className='empty-state'; domainResult.innerHTML=`<strong>조회에 실패했습니다.</strong>${esc(err.message||'잠시 후 다시 시도해 주세요.')}`; } }); }
    if(ipForm && ipInput && ipResult){ ipForm.addEventListener('submit', async (e)=>{ e.preventDefault(); const ip=String(ipInput.value||'').trim(); if(!isValidIp(ip)){ ipResult.className='empty-state'; ipResult.innerHTML='<strong>IP 형식을 다시 확인해 주세요.</strong>예: 1.1.1.1'; return; } ipResult.className='empty-state'; ipResult.innerHTML='<strong>IP 점검 중입니다.</strong>ASN, PTR, 점수와 해석을 불러옵니다.'; try { const payload=await fetchJson(`/api/safety/ip?ip=${encodeURIComponent(ip)}`); renderIpLookup(payload); } catch(err){ ipResult.className='empty-state'; ipResult.innerHTML=`<strong>조회에 실패했습니다.</strong>${esc(err.message||'잠시 후 다시 시도해 주세요.')}`; } }); }
    const url=new URL(location.href); const domain=url.searchParams.get('domain'); const ip=url.searchParams.get('ip'); if(domain && domainForm && domainInput){ domainInput.value=domain; domainForm.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); } if(ip && ipForm && ipInput){ ipInput.value=ip; ipForm.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); }
  }

  function renderEvidenceResult(payload){
    const result=$('#publicEvidenceResult'); if(!result) return; const src=payload.source||{}; const ev=payload.evidence||{};
    result.className='result-stack';
    result.innerHTML = `<div class="glass-card helper-box"><div class="section-head"><div><h2>${esc(src.title || '공개 근거 추출 결과')}</h2><p>${esc(src.url || '')}</p></div><div class="section-head-actions"><a class="safety-link-btn ghost" href="${esc(src.url || '#')}" target="_blank" rel="noopener noreferrer">원문 열기</a></div></div><div class="score-grid"><div class="score-metric"><span>호스트</span><strong>${esc(src.host || '-')}</strong></div><div class="score-metric"><span>게시일</span><strong>${esc(formatDate(src.publishedAt))}</strong></div><div class="score-metric"><span>도메인 언급</span><strong>${esc((ev.domains||[]).length)}</strong></div><div class="score-metric"><span>IP 언급</span><strong>${esc((ev.ips||[]).length)}</strong></div></div>${ev.excerpt?`<p class="helper-note">${esc(ev.excerpt)}</p>`:''}</div><div class="glass-card helper-box"><div class="section-head"><div><h2>추출된 근거</h2><p>공개 글에서 바로 기록할 수 있는 항목만 정리했습니다.</p></div></div><div class="evidence-grid"><article class="evidence-source-card"><h3>도메인</h3><p>${esc((ev.domains||[]).join(', ') || '-')}</p></article><article class="evidence-source-card"><h3>IP</h3><p>${esc((ev.ips||[]).join(', ') || '-')}</p></article><article class="evidence-source-card"><h3>텔레그램</h3><p>${esc((ev.telegrams||[]).join(', ') || '-')}</p></article><article class="evidence-source-card"><h3>오픈카카오</h3><p>${esc((ev.kakaos||[]).join(', ') || '-')}</p></article></div></div><div class="glass-card helper-box"><div class="section-head"><div><h2>기록 메모</h2><p>기록용으로 남길 핵심만 추렸습니다.</p></div></div><ul class="penalty-list">${(payload.interpretation||[]).map((item)=>`<li>${esc(item.title)} · ${esc(item.detail)}</li>`).join('')}</ul></div>`;
  }
  function wireEvidenceExtractor(){
    const form=$('#publicEvidenceForm'); const input=$('#publicEvidenceInput'); const result=$('#publicEvidenceResult'); if(!form || !input || !result) return;
    form.addEventListener('submit', async (e)=>{ e.preventDefault(); const url=String(input.value||'').trim(); if(!/^https?:\/\//i.test(url)){ result.className='empty-state'; result.innerHTML='<strong>공개 글 URL 형식을 다시 확인해 주세요.</strong>예: https://example.com/post'; return; } result.className='empty-state'; result.innerHTML='<strong>공개 근거 추출 중입니다.</strong>제목, 날짜, URL, 도메인·IP 언급을 정리하고 있습니다.'; try { const payload=await fetchJson(`/api/safety/evidence?url=${encodeURIComponent(url)}`); renderEvidenceResult(payload); } catch(err){ result.className='empty-state'; result.innerHTML=`<strong>근거 추출에 실패했습니다.</strong>${esc(err.message||'허용된 공개 페이지 URL인지 다시 확인해 주세요.')}`; } });
  }

  function wireCopyButtons(){ document.addEventListener('click', async (e)=>{ const toggle=e.target.closest('[data-guaranteed-toggle]'); if(toggle){ const card=toggle.closest('.guaranteed-card'); const detail=card ? $('.guaranteed-detail', card) : null; if(detail){ const next=!detail.hasAttribute('hidden'); if(next){ detail.setAttribute('hidden',''); toggle.setAttribute('aria-expanded','false'); $('span', toggle).textContent='상세보기'; } else { detail.removeAttribute('hidden'); toggle.setAttribute('aria-expanded','true'); $('span', toggle).textContent='접기'; } } return; } const btn=e.target.closest('[data-copy-text]'); if(!btn) return; const label=$('[data-copy-label]', btn); const defaultLabel=label?.getAttribute('data-default-label') || label?.textContent || '복사'; await copyText(btn.getAttribute('data-copy-text') || '', '복사되었습니다.'); if(label){ label.textContent='복사 완료'; setTimeout(()=>{ label.textContent=defaultLabel; }, 1400); } }); }

  async function init(){
    wireCopyButtons(); wireQuickGoogleForms(); renderPublicEvidenceGrid(); renderHomePreview('', '먹튀'); wireSearchPage(); wireCheckPage(); wireEvidenceExtractor();
    const [providers, posts, logs] = await Promise.all([loadProviders(), loadBlogPosts(), loadReviewLogs()]);
    renderGuaranteedCards(providers); renderBlogPreviews(posts); renderReviewLogs(logs);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
