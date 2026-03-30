
(() => {
  const HISTORY_KEY = 'raven_lookup_history_v1';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
  function toast(msg) {
    let t = $('#communityToast');
    if (!t) { t = document.createElement('div'); t.id = 'communityToast'; t.className = 'safety-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('is-show'); clearTimeout(toast._timer); toast._timer = setTimeout(()=>t.classList.remove('is-show'), 1800);
  }
  async function copyText(text, label='복사되었습니다.') {
    try { await navigator.clipboard.writeText(String(text)); toast(label); }
    catch (_) {
      const ta = document.createElement('textarea'); ta.value = String(text); ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(label); } catch(_) { toast('자동 복사가 제한되었습니다.'); }
      ta.remove();
    }
  }
  function googleUrl(q){ return `https://www.google.com/search?q=${encodeURIComponent(String(q||'').trim())}`; }
  function normalizeDomain(value=''){ let v=String(value||'').trim(); if(!v) return ''; try { const u=new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(v)?v:`https://${v}`); v=u.hostname||''; } catch(_){} return String(v).toLowerCase().replace(/^www\./,'').replace(/\.$/,'').split('/')[0].split('?')[0].split('#')[0].replace(/:\d+$/,''); }
  function isValidIp(value=''){ const raw=String(value||'').trim(); if(!raw) return false; if(raw.includes(':')) return /^[0-9a-f:]+$/i.test(raw); const parts=raw.split('.'); return parts.length===4 && parts.every((p)=>/^\d+$/.test(p)&&Number(p)>=0&&Number(p)<=255); }
  function fetchJson(url){ return fetch(url,{cache:'no-store'}).then(async(res)=>{ let data={}; try{data=await res.json();}catch(_){} if(!res.ok||data.ok===false) throw new Error(data.message||data.error||'request_failed'); return data; }); }
  function formatDate(v){ if(!v) return '-'; const d=new Date(v); return Number.isNaN(d.getTime()) ? String(v) : new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium'}).format(d); }
  function ageLabel(days){ const n=Number(days); if(!Number.isFinite(n)||n<0) return '-'; if(n<30) return `${n}일`; if(n<365) return `${Math.max(1,Math.round(n/30))}개월`; return `${(n/365).toFixed(1)}년`; }
  function saveHistory(entry){ try { const list = JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]'); const next = [entry, ...list.filter((x)=>!(x.kind===entry.kind && x.key===entry.key))].slice(0, 30); localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch(_) {} }
  function loadHistory(){ try { return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]'); } catch(_) { return []; } }
  function overlaps(current){ return loadHistory().filter((x)=>x.key !== current.key).map((item)=>({ item, overlapNs:(current.nameservers||[]).filter((v)=>(item.nameservers||[]).includes(v)), overlapSub:(current.subnets||[]).filter((v)=>(item.subnets||[]).includes(v)), overlapAsn:(current.asns||[]).filter((v)=>(item.asns||[]).includes(v)) })).filter((x)=>x.overlapNs.length||x.overlapSub.length||x.overlapAsn.length).slice(0,8); }
  function lev(a,b){ a=String(a); b=String(b); const m=a.length,n=b.length; const dp=Array.from({length:m+1},()=>Array(n+1).fill(0)); for(let i=0;i<=m;i++)dp[i][0]=i; for(let j=0;j<=n;j++)dp[0][j]=j; for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); return dp[m][n]; }
  function similarity(a,b){ if(!a||!b) return 0; const dist=lev(a,b); return Math.max(0, Math.round((1 - dist / Math.max(a.length,b.length)) * 100)); }
  function setResult(id, html, cls='result-stack'){ const el = typeof id === 'string' ? $(id) : id; if(!el) return; el.className = cls; el.innerHTML = html; }
  function empty(id, title, text){ setResult(id, `<strong>${esc(title)}</strong>${esc(text)}`, 'empty-state'); }
  function section(title, desc, body){ return `<div class="glass-card helper-box"><div class="section-head"><div><h2>${esc(title)}</h2><p>${esc(desc)}</p></div></div>${body}</div>`; }
  function listCard(items){ return `<ul class="toolkit-list">${items.map((item)=>`<li><div><strong>${esc(item.title)}</strong><small>${esc(item.detail||'')}</small></div>${item.actions||''}</li>`).join('')}</ul>`; }
  function actionButtons(query){ return `<div class="toolkit-actions"><a class="safety-link-btn ghost" href="${googleUrl(query)}" target="_blank" rel="noopener noreferrer">구글에서 보기</a><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(query)}">검색어 복사</button></div>`; }
  function domainsFromEvidence(ev={}){ return (ev.domains||[]).filter(Boolean).slice(0,6); }

  function initInlineCopy(){ document.addEventListener('click', async (e)=>{ const btn=e.target.closest('[data-inline-copy]'); if(!btn) return; await copyText(btn.getAttribute('data-inline-copy') || ''); }); }

  function initAddressTracker(){
    const form=$('#addressTrackerForm'); const input=$('#addressTrackerInput'); const result=$('#addressTrackerResult'); if(!form||!input||!result) return;
    form.addEventListener('submit',(e)=>{ e.preventDefault(); const raw=String(input.value||'').trim(); if(!raw) return empty(result, '입력값이 비어 있습니다.', '사이트명이나 도메인을 넣어 주세요.');
      const domain=normalizeDomain(raw); const base = domain ? domain.split('.')[0] : raw.replace(/\s+/g,' ').trim();
      const queries = [
        {title:'주소 확인', q:`${raw} 주소`},
        {title:'새주소', q:`${raw} 새주소`},
        {title:'도메인 변경', q:`${raw} 도메인 변경`},
        {title:'리뉴얼', q:`${raw} 리뉴얼`},
        {title:'공지', q:`${raw} 공지`},
        {title:'텔레그램', q:`${raw} 텔레그램`},
        {title:'오픈카카오', q:`${raw} 오픈카카오`},
        {title:'후기', q:`${raw} 후기`},
      ];
      const nextLinks = `<div class="lookup-links">${[
        {label:'구글링 페이지', href:`/muktu-police/search/?q=${encodeURIComponent(raw)}&type=${encodeURIComponent('주소')}`, text:'더 넓게 검색합니다.'},
        {label:'공식주소 체크', href:`/tools/official-check/${domain?`?domain=${encodeURIComponent(domain)}`:''}`, text:'마지막 점검으로 이동합니다.'},
        {label:'검색어 팩', href:`/tools/search-pack/${raw?`?q=${encodeURIComponent(raw)}`:''}`, text:'추가 검색어를 만듭니다.'}
      ].map((item)=>`<article class="lookup-link-card"><a href="${item.href}">${item.label}</a><p>${item.text}</p></article>`).join('')}</div>`;
      const html = section('주소 변경 조합', '자주 쓰는 검색 조합만 묶었습니다.', listCard(queries.map((item)=>({ title:item.title, detail:item.q, actions:`<div class="toolkit-actions"><a class="safety-link-btn ghost" href="${googleUrl(item.q)}" target="_blank" rel="noopener noreferrer">열기</a><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(item.q)}">복사</button></div>` })))) + section('다음 도구', '바로 이어서 볼 도구입니다.', nextLinks);
      setResult(result, html, 'toolkit-result-stack');
    });
    const q = new URL(location.href).searchParams.get('q'); if(q){ input.value=q; form.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true})); }
  }

  function initSimilarDomain(){
    const form=$('#similarDomainForm'); const input=$('#similarDomainInput'); const result=$('#similarDomainResult'); if(!form||!input||!result) return;
    form.addEventListener('submit',(e)=>{ e.preventDefault(); const raw=String(input.value||'').trim(); if(!raw) return empty(result, '입력값이 비어 있습니다.', '브랜드명이나 도메인을 입력해 주세요.');
      const domain=normalizeDomain(raw); const base = (domain ? domain.split('.')[0] : raw).toLowerCase().replace(/[^a-z0-9가-힣]/g,'');
      const tld = domain && domain.includes('.') ? '.' + domain.split('.').slice(1).join('.') : '.com';
      const variants = [base, `${base}01`, `${base}1`, `${base}77`, `${base}365`, `${base}vip`, `${base}bet`, `${base}24`, `${base}-bet`, `${base}-vip`, `${base}game`].filter(Boolean);
      const rows = [...new Set(variants)].map((v)=>{
        const candidate = /[가-힣]/.test(v) ? v : `${v}${tld}`;
        return { candidate, score: similarity(base, v.replace(/[-.]/g,'')), note: v.includes('-') ? '하이픈 변형' : /\d/.test(v) ? '숫자 추가' : v !== base ? '접미어 추가' : '기준 주소' };
      }).sort((a,b)=>b.score-a.score).slice(0,10);
      const table = `<table class="toolkit-table"><thead><tr><th>후보</th><th>유사도</th><th>메모</th><th>액션</th></tr></thead><tbody>${rows.map((row)=>`<tr><td><strong>${esc(row.candidate)}</strong></td><td>${esc(row.score)}%</td><td>${esc(row.note)}</td><td><div class="toolkit-actions"><a class="safety-link-btn ghost" href="${googleUrl(`${row.candidate} 먹튀`)}" target="_blank" rel="noopener noreferrer">검색</a><a class="safety-link-btn ghost" href="/tools/official-check/?domain=${encodeURIComponent(row.candidate)}">점검</a></div></td></tr>`).join('')}</tbody></table>`;
      const html = section('유사 도메인', '변형 후보만 먼저 정리했습니다.', table) + section('빠른 기준', '숫자·하이픈·접미어부터 확인합니다.', `<div class="toolkit-note">${esc(raw)} 숫자 추가, bet/vip, 하이픈 변형부터 점검하세요.</div>`);
      setResult(result, html, 'toolkit-result-stack');
    });
    const q = new URL(location.href).searchParams.get('q'); if(q){ input.value=q; form.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true})); }
  }

  function initSearchPack(){
    const form=$('#searchPackForm'); const input=$('#searchPackInput'); const result=$('#searchPackResult'); if(!form||!input||!result) return;
    form.addEventListener('submit',(e)=>{ e.preventDefault(); const raw=String(input.value||'').trim(); if(!raw) return empty(result,'입력값이 비어 있습니다.','검색 기준어를 입력해 주세요.');
      const packs = [
        ['먹튀',`${raw} 먹튀`],['후기',`${raw} 후기`],['주소',`${raw} 주소`],['도메인 변경',`${raw} 도메인 변경`],['리뉴얼',`${raw} 리뉴얼`],['공지',`${raw} 공지`],['텔레그램',`${raw} 텔레그램`],['오픈카카오',`${raw} 오픈카카오`],['가입코드',`${raw} 가입코드`],['메이저',`${raw} 메이저`],['입금 전 확인',`${raw} 첫충 후기`],['피해 제보',`${raw} 피해`]
      ];
      const copyAll = packs.map(([,q])=>q).join('\n');
      const html = section('검색어 팩', '바로 열거나 복사하면 됩니다.', listCard(packs.map(([title,q])=>({title, detail:q, actions:`<div class="toolkit-actions"><a class="safety-link-btn ghost" href="${googleUrl(q)}" target="_blank" rel="noopener noreferrer">열기</a><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(q)}">복사</button></div>`})))) + section('전체 복사', '검색 조합을 한 번에 복사합니다.', `<div class="toolkit-copy-box"><pre>${esc(copyAll)}</pre><div class="toolkit-actions"><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(copyAll)}">전체 복사</button><a class="safety-link-btn ghost" href="/muktu-police/search/?q=${encodeURIComponent(raw)}&type=${encodeURIComponent('먹튀')}">구글링 페이지</a></div></div>`);
      setResult(result, html, 'toolkit-result-stack');
    });
    const q = new URL(location.href).searchParams.get('q'); if(q){ input.value=q; form.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true})); }
  }

  async function evidenceFromUrl(url){ return fetchJson(`/api/safety/evidence?url=${encodeURIComponent(url)}`); }

  function initEvidenceBundle(){
    const form=$('#evidenceBundleForm'); const input=$('#evidenceBundleInput'); const result=$('#evidenceBundleResult'); if(!form||!input||!result) return;
    form.addEventListener('submit', async (e)=>{ e.preventDefault(); const url=String(input.value||'').trim(); if(!/^https?:\/\//i.test(url)) return empty(result, 'URL 형식을 확인해 주세요.', '예: https://example.com/post');
      empty(result, '근거를 읽는 중입니다.', '제목·날짜·도메인·IP를 정리합니다.');
      try {
        const payload = await evidenceFromUrl(url); const src=payload.source||{}; const ev=payload.evidence||{}; const memo = [
          `제목: ${src.title||'-'}`,
          `URL: ${src.url||url}`,
          `날짜: ${formatDate(src.publishedAt)}`,
          `도메인: ${(ev.domains||[]).join(', ') || '-'}`,
          `IP: ${(ev.ips||[]).join(', ') || '-'}`,
          `텔레그램: ${(ev.telegrams||[]).join(', ') || '-'}`,
          `오픈카카오: ${(ev.kakaos||[]).join(', ') || '-'}`,
          `메모: ${payload.interpretation?.map((x)=>`${x.title} - ${x.detail}`).join(' / ') || '공개 근거를 추가 확인하세요.'}`,
        ].join('\n');
        const follow = domainsFromEvidence(ev).map((domain)=>`<article class="lookup-link-card"><a href="/tools/official-check/?domain=${encodeURIComponent(domain)}">${esc(domain)} 점검 ↗</a><p>생성일·DNS·점수를 확인합니다.</p></article>`).join('');
        const html = section(src.title || '근거 요약', '원문과 핵심 흔적만 남겼습니다.', `<div class="score-grid"><div class="score-metric"><span>호스트</span><strong>${esc(src.host||'-')}</strong></div><div class="score-metric"><span>게시일</span><strong>${esc(formatDate(src.publishedAt))}</strong></div><div class="score-metric"><span>도메인</span><strong>${esc((ev.domains||[]).length)}</strong></div><div class="score-metric"><span>IP</span><strong>${esc((ev.ips||[]).length)}</strong></div></div>`) + section('기록 메모', '바로 붙여넣을 수 있는 메모입니다.', `<div class="toolkit-copy-box"><pre>${esc(memo)}</pre><div class="toolkit-actions"><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(memo)}">메모 복사</button><a class="safety-link-btn ghost" href="${esc(src.url||url)}" target="_blank" rel="noopener noreferrer">원문 열기</a></div></div>`) + (follow ? section('연결 점검', '추출된 도메인은 공식주소 체크로 이어서 봅니다.', `<div class="lookup-links">${follow}</div>`) : '');
        setResult(result, html, 'toolkit-result-stack');
      } catch(err) { empty(result, '근거 추출에 실패했습니다.', err.message || '허용된 공개 페이지 URL인지 확인해 주세요.'); }
    });
  }

  async function lookupDomain(domain){ return fetchJson(`/api/safety/domain?domain=${encodeURIComponent(domain)}`); }
  async function lookupIp(ip){ return fetchJson(`/api/safety/ip?ip=${encodeURIComponent(ip)}`); }

  function renderClusterCards(payload, type){
    if(type === 'ip'){
      const info = payload.ip || {}; const history = overlaps({kind:'ip', key:info.ip, label:info.ip, nameservers:[], subnets:payload.cluster?.subnets||[], asns:payload.cluster?.sharedAsns||[]});
      saveHistory({kind:'ip', key:info.ip, label:info.ip, nameservers:[], subnets:payload.cluster?.subnets||[], asns:payload.cluster?.sharedAsns||[]});
      return section('IP 군집 요약', '겹치는 ASN과 최근 기록을 봅니다.', `<div class="score-grid"><div class="score-metric"><span>IP</span><strong>${esc(info.ip||'-')}</strong></div><div class="score-metric"><span>ASN</span><strong>${esc(info.asn||'-')}</strong></div><div class="score-metric"><span>조직</span><strong>${esc(info.org||'-')}</strong></div><div class="score-metric"><span>대역</span><strong>${esc(info.network||'-')}</strong></div></div>`) + section('겹치는 기록', '같은 ASN·대역이 있으면 표시합니다.', history.length ? listCard(history.map((hit)=>({title:hit.item.label || hit.item.key, detail:[hit.overlapAsn.length?`ASN ${hit.overlapAsn.join(', ')}`:'', hit.overlapSub.length?`대역 ${hit.overlapSub.join(', ')}`:''].filter(Boolean).join(' · ')}))) : `<div class="toolkit-note">최근 조회 이력과 겹치는 군집 힌트가 없습니다.</div>`);
    }
    const rdap = payload.rdap || {}; const cluster = payload.cluster || {}; const nets = payload.networks || []; const history = overlaps({kind:'domain', key:payload.domain, label:payload.domain, nameservers:payload.dns?.nameServers||[], subnets:cluster.subnets||[], asns:cluster.sharedAsns||[]});
    saveHistory({kind:'domain', key:payload.domain, label:payload.domain, nameservers:payload.dns?.nameServers||[], subnets:cluster.subnets||[], asns:cluster.sharedAsns||[]});
    return section('도메인 군집', 'NS·ASN·대역 기준으로 봅니다.', `<div class="score-grid"><div class="score-metric"><span>도메인</span><strong>${esc(payload.domain)}</strong></div><div class="score-metric"><span>생성일</span><strong>${esc(formatDate(rdap.createdAt))}</strong></div><div class="score-metric"><span>네임서버</span><strong>${esc((payload.dns?.nameServers||[]).length)}</strong></div><div class="score-metric"><span>네트워크</span><strong>${esc(nets.length)}</strong></div></div>`) + section('공유 항목', '같은 ASN·조직·NS를 봅니다.', `<div class="lookup-links">${nets.map((n)=>`<article class="lookup-link-card"><a href="#">${esc(n.ip||'-')}</a><p>${esc([n.asn, n.org, n.country].filter(Boolean).join(' · ') || '-')}</p></article>`).join('') || '<div class="toolkit-note">네트워크 응답이 없습니다.</div>'}</div>`) + section('겹치는 기록', '같은 NS·대역이 있는지 봅니다.', history.length ? listCard(history.map((hit)=>({title:hit.item.label || hit.item.key, detail:[hit.overlapNs.length?`NS ${hit.overlapNs.join(', ')}`:'', hit.overlapAsn.length?`ASN ${hit.overlapAsn.join(', ')}`:'', hit.overlapSub.length?`대역 ${hit.overlapSub.join(', ')}`:''].filter(Boolean).join(' · ')}))) : `<div class="toolkit-note">최근 조회 이력과 겹치는 군집 힌트가 없습니다.</div>`);
  }

  function initClusterTool(){
    const form=$('#clusterToolForm'); const input=$('#clusterToolInput'); const result=$('#clusterToolResult'); if(!form||!input||!result) return;
    form.addEventListener('submit', async (e)=>{ e.preventDefault(); const raw=String(input.value||'').trim(); if(!raw) return empty(result,'입력값이 비어 있습니다.','도메인이나 IP를 입력해 주세요.');
      empty(result, '군집을 읽는 중입니다.', 'ASN·대역·NS를 비교합니다.');
      try {
        if(isValidIp(raw)) { const payload = await lookupIp(raw); setResult(result, renderClusterCards(payload, 'ip'), 'toolkit-result-stack'); }
        else { const domain = normalizeDomain(raw); if(!domain || !domain.includes('.')) throw new Error('도메인 형식을 다시 확인해 주세요.'); const payload = await lookupDomain(domain); setResult(result, renderClusterCards(payload, 'domain'), 'toolkit-result-stack'); }
      } catch(err) { empty(result, '군집 조회에 실패했습니다.', err.message || '잠시 후 다시 시도해 주세요.'); }
    });
  }

  function initOfficialCheck(){
    const form=$('#officialCheckForm'); const input=$('#officialCheckInput'); const result=$('#officialCheckResult'); if(!form||!input||!result) return;
    form.addEventListener('submit', async (e)=>{ e.preventDefault(); const domain=normalizeDomain(input.value); if(!domain || !domain.includes('.')) return empty(result,'도메인 형식을 확인해 주세요.','예: example.com');
      empty(result, '점검 중입니다.', '생성일·DNS·점수를 읽고 있습니다.');
      try {
        const payload = await lookupDomain(domain); const rdap=payload.rdap||{}; const dns=payload.dns||{}; const risk=payload.risk||{}; const items = [
          {title:'도메인 생성일', ok:Number(rdap.ageDays||9999) > 30, detail: rdap.createdAt ? `${formatDate(rdap.createdAt)} · ${ageLabel(rdap.ageDays)} 운영` : '응답 없음'},
          {title:'만료일 여유', ok:!(rdap.expiresInDays>=0 && rdap.expiresInDays < 21), detail: rdap.expiresAt ? `${formatDate(rdap.expiresAt)} · ${rdap.expiresInDays}일 남음` : '응답 없음'},
          {title:'A 레코드', ok:(dns.aRecords||[]).length > 0, detail:(dns.aRecords||[]).join(', ') || '응답 없음'},
          {title:'네임서버', ok:(dns.nameServers||[]).length >= 2, detail:(dns.nameServers||[]).join(', ') || '응답 없음'},
          {title:'ASN / 조직', ok:(payload.networks||[]).length > 0, detail:(payload.networks||[]).map((n)=>[n.asn,n.org].filter(Boolean).join(' · ')).join(' / ') || '응답 없음'},
          {title:'리스크 점수', ok:Number(risk.score||0) < 45, detail:`${risk.score ?? '-'}점 · ${risk.band || '-'}`},
        ];
        const html = section('공식주소 체크', '핵심 항목만 PASS/CHECK로 정리했습니다.', listCard(items.map((item)=>({title:`${item.ok ? 'PASS' : 'CHECK'} · ${item.title}`, detail:item.detail})))) + section('요약', '점수와 해석만 짧게 봅니다.', `<div class="toolkit-note">${esc(risk.commentary || '생성일·DNS·ASN·공개 흔적을 함께 보세요.')}</div><div class="toolkit-actions"><a class="safety-link-btn ghost" href="/muktu-police/check/?domain=${encodeURIComponent(domain)}">전체 기술 조회</a><a class="safety-link-btn ghost" href="${googleUrl(`${domain} 먹튀`)}" target="_blank" rel="noopener noreferrer">공개 검색</a></div>`);
        setResult(result, html, 'toolkit-result-stack');
      } catch(err) { empty(result, '체크에 실패했습니다.', err.message || '잠시 후 다시 시도해 주세요.'); }
    });
    const q = new URL(location.href).searchParams.get('domain'); if(q){ input.value=q; form.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true})); }
  }

  function initReportTemplate(){
    const form=$('#reportTemplateForm'); const result=$('#reportTemplateResult'); if(!form||!result) return;
    form.addEventListener('submit',(e)=>{ e.preventDefault(); const values = {
      site: $('#reportSiteName')?.value?.trim() || '-',
      domain: $('#reportDomain')?.value?.trim() || '-',
      type: $('#reportType')?.value?.trim() || '-',
      amount: $('#reportAmount')?.value?.trim() || '-',
      contact: $('#reportContact')?.value?.trim() || '-',
      evidence: $('#reportEvidence')?.value?.trim() || '-',
      memo: $('#reportMemo')?.value?.trim() || '-'
    };
      const text = `[제보 기본 정보]\n사이트명: ${values.site}\n주소: ${values.domain}\n피해 유형: ${values.type}\n금액: ${values.amount}\n연락 채널: ${values.contact}\n증거 링크/메모: ${values.evidence}\n추가 경과: ${values.memo}\n\n[운영 메모]\n- 공개 검색 결과 확인 여부:\n- 도메인/IP 조회 결과:\n- 추가 자료 요청 여부:`;
      const html = section('제보 템플릿', '복사해서 바로 전달하면 됩니다.', `<div class="toolkit-copy-box"><pre>${esc(text)}</pre><div class="toolkit-actions"><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(text)}">텍스트 복사</button><a class="safety-link-btn ghost" href="/muktu-police/review/">검토 기준 보기</a></div></div>`);
      setResult(result, html, 'toolkit-result-stack');
    });
  }

  function initRiskCompare(){
    const form=$('#riskCompareForm'); const left=$('#riskCompareLeft'); const right=$('#riskCompareRight'); const result=$('#riskCompareResult'); if(!form||!left||!right||!result) return;
    form.addEventListener('submit', async (e)=>{ e.preventDefault(); const l=normalizeDomain(left.value); const r=normalizeDomain(right.value); if(!l||!r) return empty(result,'도메인 형식을 확인해 주세요.','비교할 두 도메인을 입력해 주세요.');
      empty(result, '비교 중입니다.', '생성일·DNS·ASN·점수를 비교합니다.');
      try {
        const [lp, rp] = await Promise.all([lookupDomain(l), lookupDomain(r)]);
        const rows = [
          ['리스크 점수', `${lp.risk?.score ?? '-'}점`, `${rp.risk?.score ?? '-'}점`],
          ['생성일', formatDate(lp.rdap?.createdAt), formatDate(rp.rdap?.createdAt)],
          ['운영 기간', ageLabel(lp.rdap?.ageDays), ageLabel(rp.rdap?.ageDays)],
          ['만료 여유', lp.rdap?.expiresInDays >= 0 ? `${lp.rdap.expiresInDays}일` : '-', rp.rdap?.expiresInDays >= 0 ? `${rp.rdap.expiresInDays}일` : '-'],
          ['A 레코드', (lp.dns?.aRecords||[]).join(', ') || '-', (rp.dns?.aRecords||[]).join(', ') || '-'],
          ['네임서버', (lp.dns?.nameServers||[]).slice(0,2).join(', ') || '-', (rp.dns?.nameServers||[]).slice(0,2).join(', ') || '-'],
          ['ASN / 조직', (lp.networks||[]).map((n)=>[n.asn,n.org].filter(Boolean).join(' · ')).join(' / ') || '-', (rp.networks||[]).map((n)=>[n.asn,n.org].filter(Boolean).join(' · ')).join(' / ') || '-'],
        ];
        const table = `<table class="toolkit-table"><thead><tr><th>항목</th><th>${esc(l)}</th><th>${esc(r)}</th></tr></thead><tbody>${rows.map((row)=>`<tr><td><strong>${esc(row[0])}</strong></td><td>${esc(row[1])}</td><td>${esc(row[2])}</td></tr>`).join('')}</tbody></table>`;
        const note = (Number(lp.risk?.score||0) === Number(rp.risk?.score||0)) ? '점수는 비슷합니다. 생성일·ASN을 더 보세요.' : (Number(lp.risk?.score||0) < Number(rp.risk?.score||0) ? `${l}  쪽이 더 안정적으로 보입니다.` : `${r}  쪽이 더 안정적으로 보입니다.`);
        const html = section('비교 결과', '핵심 항목만 나란히 봅니다.', table) + section('요약', '점수만 말고 생성일·NS·ASN도 보세요.', `<div class="toolkit-note">${esc(note)}</div><div class="toolkit-actions"><a class="safety-link-btn ghost" href="/tools/official-check/?domain=${encodeURIComponent(l)}">${esc(l)} 체크</a><a class="safety-link-btn ghost" href="/tools/official-check/?domain=${encodeURIComponent(r)}">${esc(r)} 체크</a></div>`);
        setResult(result, html, 'toolkit-result-stack');
      } catch(err) { empty(result, '비교에 실패했습니다.', err.message || '잠시 후 다시 시도해 주세요.'); }
    });
  }

  function initToolsHubShortcuts(){
    const slots = $('#toolsExpansionGrid'); if(!slots) return;
    const tools = [
      ['주소 변경기','ADDRESS','새주소 · 리뉴얼','/tools/address-tracker/'],
      ['유사 도메인 감지기','SIMILAR','숫자 · 하이픈','/tools/similar-domain/'],
      ['검색어 팩 생성기','SEARCH PACK','먹튀 · 후기 · 주소 조합','/tools/search-pack/'],
      ['근거 요약 생성기','EVIDENCE','제목 · 날짜 · 도메인 · IP','/tools/evidence-bundle/'],
      ['IP · ASN 군집 보기','CLUSTER','ASN · 대역 · NS 겹침','/tools/ip-asn-cluster/'],
      ['공식주소 확인 체크','OFFICIAL','생성일 · DNS · 점수 체크','/tools/official-check/'],
      ['제보 정리 템플릿','REPORT','검토용 제보 템플릿 자동 작성','/tools/report-template/'],
      ['리스크 스코어 비교기','COMPARE','도메인 두 개 비교','/tools/risk-compare/']
    ];
    slots.innerHTML = tools.map((item)=>`<article class="toolkit-card"><span class="tool-badge">${item[1]}</span><h3>${item[0]}</h3><p>${item[2]}</p><div class="card-actions"><a class="safety-link-btn ghost" href="${item[3]}">열기</a></div></article>`).join('');
  }

  function initMainShortcuts(){
    const grid = $('.hero-action-grid--compact');
    if(grid){
      grid.innerHTML = [
        ['구글링','검색 조합','사이트명 · 도메인','/muktu-police/search/',''],
        ['주소 변경','주소 변경','새주소 · 리뉴얼','/tools/address-tracker/','mint'],
        ['유사 도메인','유사 주소','숫자 · 하이픈','/tools/similar-domain/',''],
        ['도메인조회','도메인·IP','등록일 · DNS','/muktu-police/check/','gold'],
      ].map((item)=>`<a class="hero-action-card ${item[4]}" href="${item[3]}"><span>${item[0]}</span><strong>${item[1]}</strong><small>${item[2]}</small></a>`).join('');
    }
    const toolGrid = $('.home-flow-section .tool-grid');
    if(toolGrid){
      toolGrid.innerHTML = [
        ['TRACKER','주소 변경','새주소 · 리뉴얼','/tools/address-tracker/'],
        ['SEARCH PACK','검색어 팩','먹튀 · 후기 · 주소 조합','/tools/search-pack/'],
        ['OFFICIAL','공식주소 체크','생성일 · DNS · 점수 확인','/tools/official-check/']
      ].map((item)=>`<article class="tool-card"><div class="tool-top"><span class="tool-badge">${item[0]}</span></div><h3>${item[1]}</h3><p>${item[2]}</p><div class="card-actions"><a class="safety-link-btn ghost" href="${item[3]}">도구 열기</a></div></article>`).join('');
    }
  }

  function init(){
    initInlineCopy();
    initAddressTracker();
    initSimilarDomain();
    initSearchPack();
    initEvidenceBundle();
    initClusterTool();
    initOfficialCheck();
    initReportTemplate();
    initRiskCompare();
    initToolsHubShortcuts();
    initMainShortcuts();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
