
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
  function setResult(id, html, cls='result-stack'){ const el = typeof id === 'string' ? $(id) : id; if(!el) return; const base = (el.dataset && el.dataset.baseClass ? el.dataset.baseClass : '').trim(); el.className = [base, cls].filter(Boolean).join(' '); el.innerHTML = html; }
  function empty(id, title, text){ setResult(id, `<strong>${esc(title)}</strong>${esc(text)}`, 'empty-state'); }
  function section(title, desc, body){ return `<div class="glass-card helper-box"><div class="section-head"><div><h2>${esc(title)}</h2><p>${esc(desc)}</p></div></div>${body}</div>`; }
  function listCard(items){ return `<ul class="toolkit-list">${items.map((item)=>`<li><div><strong>${esc(item.title)}</strong><small>${esc(item.detail||'')}</small></div>${item.actions||''}</li>`).join('')}</ul>`; }
  function actionButtons(query){ return `<div class="toolkit-actions"><a class="safety-link-btn ghost" href="${googleUrl(query)}" target="_blank" rel="noopener noreferrer">구글에서 보기</a><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(query)}">검색어 복사</button></div>`; }
  function domainsFromEvidence(ev={}){ return (ev.domains||[]).filter(Boolean).slice(0,6); }

  function initInlineCopy(){ document.addEventListener('click', async (e)=>{ const btn=e.target.closest('[data-inline-copy]'); if(!btn) return; await copyText(btn.getAttribute('data-inline-copy') || ''); }); }

  function initResultCopy(){ document.addEventListener('click', async (e)=>{ const btn=e.target.closest('[data-copy-result-target]'); if(!btn) return; const target=$(btn.getAttribute('data-copy-result-target') || ''); if(!target) return; const text=String(target.innerText || '').replace(/\n{3,}/g,'\n\n').trim(); if(!text) return toast('복사할 결과가 없습니다.'); await copyText(text, '결과를 복사했습니다.'); }); }
  function bindFormPersistence(form){
    if(!form) return;
    const key = `raven_tool_form_state:${location.pathname}`;
    const fields = $$('input, textarea, select', form).filter((el)=>{
      const type = String(el.type || '').toLowerCase();
      return !['submit','button','reset','file','hidden'].includes(type) && (el.id || el.name);
    });
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      fields.forEach((el)=>{
        const fieldKey = el.id || el.name;
        if(!(fieldKey in saved)) return;
        if(el.type === 'checkbox' || el.type === 'radio') el.checked = !!saved[fieldKey];
        else el.value = String(saved[fieldKey] ?? '');
      });
    } catch(_) {}
    const persist = ()=>{
      const payload = {};
      fields.forEach((el)=>{
        const fieldKey = el.id || el.name;
        payload[fieldKey] = (el.type === 'checkbox' || el.type === 'radio') ? !!el.checked : el.value;
      });
      try { localStorage.setItem(key, JSON.stringify(payload)); } catch(_) {}
    };
    form.addEventListener('input', persist);
    form.addEventListener('change', persist);
    form.addEventListener('reset', ()=>{ try { localStorage.removeItem(key); } catch(_) {} });
  }

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
        {label:'최종 체크', href:`/tools/official-check/${domain?`?domain=${encodeURIComponent(domain)}`:''}`, text:'마지막 점검으로 이동합니다.'},
        {label:'검색 조합', href:`/tools/search-pack/${raw?`?q=${encodeURIComponent(raw)}`:''}`, text:'추가 검색어를 만듭니다.'}
      ].map((item)=>`<article class="lookup-link-card"><a href="${item.href}">${item.label}</a><p>${item.text}</p></article>`).join('')}</div>`;
      const html = section('주소 변경 조합', '자주 쓰는 조합만 남겼습니다.', listCard(queries.map((item)=>({ title:item.title, detail:item.q, actions:`<div class="toolkit-actions"><a class="safety-link-btn ghost" href="${googleUrl(item.q)}" target="_blank" rel="noopener noreferrer">열기</a><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(item.q)}">복사</button></div>` })))) + section('다음 확인', '이어 보면 좋은 도구입니다.', nextLinks);
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
      const html = section('유사 주소 후보', '변형 후보만 먼저 보여줍니다.', table) + section('빠른 기준', '숫자·하이픈·접미어부터 확인하면 됩니다.', `<div class="toolkit-note">${esc(raw)} 숫자 추가, bet/vip, 하이픈 변형부터 점검하세요.</div>`);
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
      const html = section('검색 조합', '열거나 복사하면 됩니다.', listCard(packs.map(([title,q])=>({title, detail:q, actions:`<div class="toolkit-actions"><a class="safety-link-btn ghost" href="${googleUrl(q)}" target="_blank" rel="noopener noreferrer">열기</a><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(q)}">복사</button></div>`})))) + section('전체 복사', '검색 조합을 한 번에 복사합니다.', `<div class="toolkit-copy-box"><pre>${esc(copyAll)}</pre><div class="toolkit-actions"><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(copyAll)}">전체 복사</button><a class="safety-link-btn ghost" href="/muktu-police/search/?q=${encodeURIComponent(raw)}&type=${encodeURIComponent('먹튀')}">구글링 페이지</a></div></div>`);
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
        const html = section(src.title || '근거 짧은 판단', '원문과 핵심 흔적만 남겼습니다.', `<div class="score-grid"><div class="score-metric"><span>호스트</span><strong>${esc(src.host||'-')}</strong></div><div class="score-metric"><span>게시일</span><strong>${esc(formatDate(src.publishedAt))}</strong></div><div class="score-metric"><span>도메인</span><strong>${esc((ev.domains||[]).length)}</strong></div><div class="score-metric"><span>IP</span><strong>${esc((ev.ips||[]).length)}</strong></div></div>`) + section('기록 메모', '바로 붙여넣을 수 있는 메모입니다.', `<div class="toolkit-copy-box"><pre>${esc(memo)}</pre><div class="toolkit-actions"><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(memo)}">메모 복사</button><a class="safety-link-btn ghost" href="${esc(src.url||url)}" target="_blank" rel="noopener noreferrer">원문 열기</a></div></div>`) + (follow ? section('연결 점검', '추출된 도메인은 최종 체크로 이어서 봅니다.', `<div class="lookup-links">${follow}</div>`) : '');
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
      return section('IP 군집 짧은 판단', '겹치는 ASN과 최근 기록을 봅니다.', `<div class="score-grid"><div class="score-metric"><span>IP</span><strong>${esc(info.ip||'-')}</strong></div><div class="score-metric"><span>ASN</span><strong>${esc(info.asn||'-')}</strong></div><div class="score-metric"><span>조직</span><strong>${esc(info.org||'-')}</strong></div><div class="score-metric"><span>대역</span><strong>${esc(info.network||'-')}</strong></div></div>`) + section('겹치는 기록', '같은 ASN·대역이 있으면 표시합니다.', history.length ? listCard(history.map((hit)=>({title:hit.item.label || hit.item.key, detail:[hit.overlapAsn.length?`ASN ${hit.overlapAsn.join(', ')}`:'', hit.overlapSub.length?`대역 ${hit.overlapSub.join(', ')}`:''].filter(Boolean).join(' · ')}))) : `<div class="toolkit-note">최근 조회 이력과 겹치는 군집 힌트가 없습니다.</div>`);
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
        const html = section('최종 체크', '핵심 항목만 PASS/CHECK로 정리합니다.', listCard(items.map((item)=>({title:`${item.ok ? 'PASS' : 'CHECK'} · ${item.title}`, detail:item.detail})))) + section('짧은 판단', '점수와 핵심 해석만 봅니다.', `<div class="toolkit-note">${esc(risk.commentary || '생성일·DNS·ASN·공개 흔적을 함께 보세요.')}</div><div class="toolkit-actions"><a class="safety-link-btn ghost" href="/muktu-police/check/?domain=${encodeURIComponent(domain)}">전체 기술 조회</a><a class="safety-link-btn ghost" href="${googleUrl(`${domain} 먹튀`)}" target="_blank" rel="noopener noreferrer">공개 검색</a></div>`);
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
      const html = section('제보 초안', '복사해 바로 전달하면 됩니다.', `<div class="toolkit-copy-box"><pre>${esc(text)}</pre><div class="toolkit-actions"><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(text)}">텍스트 복사</button><a class="safety-link-btn ghost" href="/muktu-police/review/">검토 기준 보기</a></div></div>`);
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
        const html = section('핵심 비교', '핵심 항목만 나란히 봅니다.', table) + section('짧은 판단', '점수와 생성일·NS·ASN을 같이 보세요.', `<div class="toolkit-note">${esc(note)}</div><div class="toolkit-actions"><a class="safety-link-btn ghost" href="/tools/official-check/?domain=${encodeURIComponent(l)}">${esc(l)} 체크</a><a class="safety-link-btn ghost" href="/tools/official-check/?domain=${encodeURIComponent(r)}">${esc(r)} 체크</a></div>`);
        setResult(result, html, 'toolkit-result-stack');
      } catch(err) { empty(result, '비교에 실패했습니다.', err.message || '잠시 후 다시 시도해 주세요.'); }
    });
  }


  function normalizeLines(value=''){ return String(value||'').split(/\n+/).map((v)=>v.trim()).filter(Boolean); }
  function extractDomainsFromText(value=''){ return Array.from(new Set((String(value||'').match(/(?:[a-z0-9-]+\.)+[a-z]{2,}/ig)||[]).map((v)=>normalizeDomain(v)).filter(Boolean))); }
  function extractCodes(value=''){ return Array.from(new Set((String(value||'').match(/[A-Z0-9]{3,10}/g)||[]).filter((v)=>/[A-Z]/.test(v)))).slice(0,8); }
  function extractHandles(value=''){ return Array.from(new Set((String(value||'').match(/@[A-Za-z0-9_]{3,32}/g)||[]))).slice(0,8); }
  function badgeBand(score){ if(score>=80) return '높음'; if(score>=55) return '중간'; return '낮음'; }
  function initAddressConsistency(){ const form=$('#addressconsistencyForm'); const input=$('#addressConsistencyInput'); const result=$('#addressConsistencyResult'); if(!form||!input||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const lines=normalizeLines(input.value); if(!lines.length) return empty(result,'입력값이 비어 있습니다.','주소나 채널을 한 줄에 하나씩 넣어 주세요.'); const domains=Array.from(new Set(lines.map((v)=>normalizeDomain(v)).filter(Boolean))); const hostCounts={}; domains.forEach((d)=>hostCounts[d]=(hostCounts[d]||0)+1); const rootCounts={}; domains.forEach((d)=>{ const parts=d.split('.'); const base=parts.length>1?parts.slice(-2).join('.'):d; rootCounts[base]=(rootCounts[base]||0)+1;}); const official=Object.entries(rootCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]||domains[0]||'-'; const table=`<table class="toolkit-table"><thead><tr><th>입력 주소</th><th>정규화</th><th>판정</th></tr></thead><tbody>${lines.map((line)=>{ const d=normalizeDomain(line); const verdict=!d?'확인 필요':(d===official||d.endsWith('.'+official.replace(/^www\./,''))?'일치 후보':'불일치'); return `<tr><td>${esc(line)}</td><td>${esc(d||'-')}</td><td>${esc(verdict)}</td></tr>`; }).join('')}</tbody></table>`; const html=section('정합성 결과','같은 기준으로 먼저 묶었습니다.',table)+section('핵심 결과','한 줄로 먼저 봅니다.',`<div class="toolkit-note">최신 후보는 ${esc(official)} 입니다. 다른 주소는 공지·채널과 다시 대조하세요.</div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initChangeTimeline(){ const form=$('#changetimelineForm'); const input=$('#changeTimelineInput'); const result=$('#changeTimelineResult'); if(!form||!input||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const raw=String(input.value||'').trim(); if(!raw) return empty(result,'입력값이 비어 있습니다.','공지문이나 주소 기록을 붙여 넣어 주세요.'); const lines=normalizeLines(raw); const rows=lines.map((line,idx)=>{ const date=(line.match(/20\d{2}[./-]\d{1,2}[./-]\d{1,2}|20\d{2}[./-]\d{1,2}|20\d{2}년\s*\d{1,2}월?/)||['기록 '+String(idx+1).padStart(2,'0')])[0]; const domains=extractDomainsFromText(line); const tag=/리뉴얼|변경|이전|신규|공지/i.test(line)?'변경':'참고'; return {date,line,domains,tag}; }); const timeline=`<div class="timeline-list">${rows.map((row)=>`<article class="timeline-entry"><span class="mini-badge">${esc(row.date)}</span><strong>${esc(row.tag)}</strong><p>${esc(row.line)}</p>${row.domains.length?`<small>${esc(row.domains.join(' · '))}</small>`:''}</article>`).join('')}</div>`; const warnings=[]; if(rows.filter(r=>r.domains.length).length>=2) warnings.push('주소가 여러 번 언급됩니다.'); if(/리뉴얼|변경/i.test(raw)) warnings.push('리뉴얼/변경 문구가 있습니다.'); if(warnings.length===0) warnings.push('큰 변화 문구는 많지 않습니다.'); const html=section('이력 흐름','기록 순서대로 먼저 정리합니다.',timeline)+section('짧은 판단','먼저 볼 포인트만 남깁니다.',`<div class="toolkit-note">${esc(warnings.join(' '))}</div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initRelationshipMap(){ const form=$('#relationshipmapForm'); const base=$('#relationshipBase'); const input=$('#relationshipInput'); const result=$('#relationshipResult'); if(!form||!base||!input||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const seed=String(base.value||'').trim(); const raw=String(input.value||'').trim(); if(!seed||!raw) return empty(result,'입력값이 비어 있습니다.','기준값과 관련 기록을 같이 넣어 주세요.'); const domains=extractDomainsFromText(raw); const codes=extractCodes(raw); const handles=extractHandles(raw); const score = Math.min(100, domains.length*12 + codes.length*8 + handles.length*10 + (/같은|공통|동일|리뉴얼|변경/i.test(raw)?18:0)); const map=`<div class="tool-grid tool-grid--dense"><article class="tool-help-card"><h3>도메인</h3><p>${esc(domains.join(' · ')||'-')}</p></article><article class="tool-help-card"><h3>코드</h3><p>${esc(codes.join(' · ')||'-')}</p></article><article class="tool-help-card"><h3>채널</h3><p>${esc(handles.join(' · ')||'-')}</p></article></div>`; const html=section('관계도 요약','겹치는 신호만 먼저 모았습니다.',map)+section('유사도','확정이 아니라 추정으로 봅니다.',`<div class="score-shell"><div class="score-top"><div><div class="score-big">${esc(score)}</div><span class="score-band">유사도 ${esc(badgeBand(score))}</span></div><div class="score-meta"><h2 class="score-title">${esc(seed)}</h2><p>도메인 · 코드 · 채널 · 문구가 얼마나 겹치는지 본 결과입니다.</p></div></div><div class="score-bar"><span style="width:${score}%"></span></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initNoticeReview(){ const form=$('#noticereviewForm'); const main=$('#noticeMainInput'); const side=$('#noticeSideInput'); const result=$('#noticeReviewResult'); if(!form||!main||!side||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const a=String(main.value||'').trim(); const b=String(side.value||'').trim(); if(!a||!b) return empty(result,'입력값이 비어 있습니다.','공지 두 개를 붙여 넣어 주세요.'); const aDomains=extractDomainsFromText(a), bDomains=extractDomainsFromText(b); const aCodes=extractCodes(a), bCodes=extractCodes(b); const sameDomain = aDomains.some((d)=>bDomains.includes(d)); const sameCode = aCodes.some((d)=>bCodes.includes(d)); const warnings=[]; if(!sameDomain) warnings.push('주소가 다르게 보입니다.'); if(!sameCode && aCodes.length && bCodes.length) warnings.push('코드가 다르게 보입니다.'); if(/긴급|즉시|서둘러|오늘만/.test(a+b)) warnings.push('과장형 긴급 문구가 있습니다.'); if(warnings.length===0) warnings.push('큰 불일치는 적습니다.'); const table=`<table class="toolkit-table"><thead><tr><th>항목</th><th>사이트 공지</th><th>채널/후기</th></tr></thead><tbody><tr><td><strong>주소</strong></td><td>${esc(aDomains.join(', ')||'-')}</td><td>${esc(bDomains.join(', ')||'-')}</td></tr><tr><td><strong>코드</strong></td><td>${esc(aCodes.join(', ')||'-')}</td><td>${esc(bCodes.join(', ')||'-')}</td></tr></tbody></table>`; const html=section('비교 결과','주소와 코드부터 먼저 봅니다.',table)+section('주의 포인트','짧게 남깁니다.',`<ul class="toolkit-list">${warnings.map((w)=>`<li><div><strong>${esc(w)}</strong></div></li>`).join('')}</ul>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initReportPackager(){ const form=$('#reportpackagerForm'); const result=$('#reportPackagerResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const site=$('#reportSite')?.value?.trim()||'-'; const domain=$('#reportDomain')?.value?.trim()||'-'; const amount=$('#reportAmount')?.value?.trim()||'-'; const code=$('#reportCode')?.value?.trim()||'-'; const story=$('#reportStory')?.value?.trim()||'-'; const checklist=[['사이트명',site!=='-'],['주소',domain!=='-'],['금액',amount!=='-'],['가입코드',code!=='-'],['사건 설명',story!=='-']]; const text=`[기본 정보]
사이트명: ${site}
주소: ${domain}
금액: ${amount}
가입코드: ${code}

[사건 요약]
${story}

[확인 메모]
- 입금내역:
- 대화 캡처:
- 공지 캡처:
- 추가 자료:`; const html=section('자료 체크','빠진 항목부터 봅니다.',`<div class="tool-grid tool-grid--dense">${checklist.map((item)=>`<article class="tool-help-card"><h3>${esc(item[0])}</h3><p>${item[1]?'확보':'입력 필요'}</p></article>`).join('')}</div>`)+section('전달용 요약','바로 복사할 수 있습니다.',`<div class="toolkit-copy-box"><pre>${esc(text)}</pre><div class="toolkit-actions"><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(text)}">텍스트 복사</button></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initBonusPolicy(){ const form=$('#bonuspolicyForm'); const result=$('#bonusPolicyResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const deposit=Number($('#bonusDeposit')?.value||0); const percent=Number($('#bonusPercent')?.value||0); const cap=Number($('#bonusCap')?.value||0); const rolling=Number($('#bonusRolling')?.value||0); const maxWithdraw=Number($('#bonusMaxWithdraw')?.value||0); if(!deposit||!percent) return empty(result,'입력값이 비어 있습니다.','충전금과 퍼센트를 먼저 입력해 주세요.'); const bonus=Math.min(deposit*(percent/100), cap||Infinity); const total=deposit+bonus; const needRolling=total*Math.max(0,rolling); const effective=maxWithdraw?Math.min(total,maxWithdraw):total; const difficulty=needRolling>total*15?'높음':needRolling>total*8?'보통':'낮음'; const html=section('조건 결과','핵심 숫자만 먼저 봅니다.',`<div class="score-grid"><div class="score-metric"><span>보너스</span><strong>${Math.round(bonus).toLocaleString()}원</strong></div><div class="score-metric"><span>총 사용금</span><strong>${Math.round(total).toLocaleString()}원</strong></div><div class="score-metric"><span>필요 롤링</span><strong>${Math.round(needRolling).toLocaleString()}원</strong></div><div class="score-metric"><span>최대 수령</span><strong>${Math.round(effective).toLocaleString()}원</strong></div></div>`)+section('짧은 판단','부담도만 남깁니다.',`<div class="toolkit-note">조건 부담도는 ${esc(difficulty)} 입니다. 퍼센트보다 롤링과 최대 출금 제한을 같이 보세요.</div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initSlipCompare(){ const form=$('#slipcompareForm'); const result=$('#slipCompareResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const stake=Number($('#slipStake')?.value||0); const odds=[Number($('#slipOddsA')?.value||0),Number($('#slipOddsB')?.value||0),Number($('#slipOddsC')?.value||0)].filter(Boolean); if(!stake||odds.length<2) return empty(result,'입력값이 비어 있습니다.','금액과 배당 두 개 이상을 입력해 주세요.'); const singles=odds.reduce((sum,o)=>sum+stake*o,0); const parlay=stake*odds.reduce((m,o)=>m*o,1); const html=section('비교 결과','같은 금액 기준입니다.',`<table class="toolkit-table"><thead><tr><th>방식</th><th>예상 반환금</th><th>메모</th></tr></thead><tbody><tr><td><strong>단폴 합계</strong></td><td>${Math.round(singles).toLocaleString()}원</td><td>분산형</td></tr><tr><td><strong>조합 1회</strong></td><td>${Math.round(parlay).toLocaleString()}원</td><td>집중형</td></tr></tbody></table>`)+section('짧은 판단','숫자보다 운영 방향을 먼저 봅니다.',`<div class="toolkit-note">단폴은 분산, 조합은 고변동 구조입니다. 폴더 수가 늘수록 난도도 같이 올라갑니다.</div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initBankrollPlanner(){ const form=$('#bankrollplannerForm'); const result=$('#bankrollPlannerResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const total=Number($('#bankrollTotal')?.value||0); const unit=Number($('#bankrollUnit')?.value||0); const sessions=Number($('#bankrollSessions')?.value||0); const stop=Number($('#bankrollStop')?.value||0); if(!total||!unit||!sessions) return empty(result,'입력값이 비어 있습니다.','총 자금, 기준금, 회차 수를 입력해 주세요.'); const usable=Math.max(0,total-stop); const per=Math.floor(usable/Math.max(1,sessions)); const ratio=unit?Math.round((unit/Math.max(1,total))*100):0; const html=section('분배 결과','회차 기준으로 먼저 봅니다.',`<div class="score-grid"><div class="score-metric"><span>사용 가능</span><strong>${Math.round(usable).toLocaleString()}원</strong></div><div class="score-metric"><span>회차당 예산</span><strong>${Math.round(per).toLocaleString()}원</strong></div><div class="score-metric"><span>기준금 비율</span><strong>${ratio}%</strong></div><div class="score-metric"><span>손절선</span><strong>${Math.round(stop).toLocaleString()}원</strong></div></div>`)+section('짧은 판단','과도한 단계 상승을 막는 기준입니다.',`<div class="toolkit-note">1회 기준금이 총 자금의 5%를 넘기면 부담이 빨라질 수 있습니다. 손절선은 먼저 고정해 두는 편이 안전합니다.</div>`); setResult(result, html, 'toolkit-result-stack'); }); }

  function initToolsHubShortcuts(){
    const slots = $('#toolsExpansionGrid'); if(!slots) return;
    const tools = [
      ['주소 변경기','ADDRESS','새주소 · 리뉴얼','/tools/address-tracker/'],
      ['유사 주소 후보 감지기','SIMILAR','숫자 · 하이픈','/tools/similar-domain/'],
      ['검색 조합 생성기','SEARCH PACK','먹튀 · 후기 · 주소 조합','/tools/search-pack/'],
      ['근거 짧은 판단 생성기','EVIDENCE','제목 · 날짜 · 도메인 · IP','/tools/evidence-bundle/'],
      ['IP · ASN 군집 보기','CLUSTER','ASN · 대역 · NS 겹침','/tools/ip-asn-cluster/'],
      ['공식주소 확인 체크','OFFICIAL','생성일 · DNS · 점수 체크','/tools/official-check/'],
      ['제보 정리 템플릿','REPORT','검토용 제보 초안 자동 작성','/tools/report-template/'],
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
        ['유사 주소 후보','유사 주소','숫자 · 하이픈','/tools/similar-domain/',''],
        ['도메인조회','도메인·IP','등록일 · DNS','/muktu-police/check/','gold'],
      ].map((item)=>`<a class="hero-action-card ${item[4]}" href="${item[3]}"><span>${item[0]}</span><strong>${item[1]}</strong><small>${item[2]}</small></a>`).join('');
    }
    const toolGrid = $('.home-flow-section .tool-grid');
    if(toolGrid){
      toolGrid.innerHTML = [
        ['TRACKER','주소 변경','새주소 · 리뉴얼','/tools/address-tracker/'],
        ['SEARCH PACK','검색 조합','먹튀 · 후기 · 주소 조합','/tools/search-pack/'],
        ['OFFICIAL','최종 체크','생성일 · DNS · 점수 확인','/tools/official-check/']
      ].map((item)=>`<article class="tool-card"><div class="tool-top"><span class="tool-badge">${item[0]}</span></div><h3>${item[1]}</h3><p>${item[2]}</p><div class="card-actions"><a class="safety-link-btn ghost" href="${item[3]}">도구 열기</a></div></article>`).join('');
    }
  }


  function engineSet(result, title, cards, notes = []) {
    const metrics = `<div class="score-grid">${cards.map((item)=>`<div class="score-metric"><span>${esc(item.label)}</span><strong>${esc(item.value)}</strong><small>${esc(item.note||'')}</small></div>`).join('')}</div>`;
    const noteHtml = notes.length ? `<ul class="toolkit-points">${notes.map((item)=>`<li>${esc(item)}</li>`).join('')}</ul>` : '';
    setResult(result, `<div class="toolkit-result-stack">${section(title,'',metrics)}${noteHtml}</div>`, 'toolkit-result-stack');
  }

  function toolRiskLabel(score){ if(score >= 75) return '매우 높음'; if(score >= 55) return '높음'; if(score >= 30) return '보통'; return '낮음'; }

  function engineSportsStudy({ market='moneyline', odds=[], capital=0, mode='neutral', line=0, labels=[] }={}) {
    const engines = window.RavenEngines || {};
    if(!engines.fairProbability) return null;
    const fair = engines.fairProbability({ odds, market });
    const outcomes = fair.fairProbabilities.map((prob, idx) => {
      const ev = engines.expectedValue({ probability: prob, odds: odds[idx], stake: capital || 100000 });
      const vol = engines.volatilityRisk({ probability: prob, odds: odds[idx], stake: Math.max(1000, (capital || 100000) * 0.01), plays: market === '1x2' ? 3 : 2 });
      return { label: labels[idx] || `선택 ${idx+1}`, prob, probPct: prob * 100, odds: odds[idx], ev, vol, fairOdds: fair.fairOdds[idx] };
    });
    const bestProb = outcomes.slice().sort((a,b)=>b.prob-a.prob)[0];
    const bestEdge = outcomes.slice().sort((a,b)=>b.ev.evRate-a.ev.evRate)[0];
    const score = outcomes.reduce((sum,item)=>sum+item.vol.volatilityScore,0) / Math.max(1,outcomes.length);
    const bankroll = engines.bankrollPlan({ capital, probability: bestEdge.prob, odds: bestEdge.odds, mode, volatilityScore: score });
    return { fair, outcomes, bestProb, bestEdge, volatilityScore: score, volatilityLabel: toolRiskLabel(score), bankroll, line };
  }

  function initBonusPolicy(){
    const form=$('#bonuspolicyForm'); const result=$('#bonusPolicyResult'); if(!form||!result) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const engines = window.RavenEngines || {};
      const deposit=Number($('#bonusDeposit')?.value||0); const percent=Number($('#bonusPercent')?.value||0); const cap=Number($('#bonusCap')?.value||0); const rolling=Number($('#bonusRolling')?.value||0); const maxWithdraw=Number($('#bonusMaxWithdraw')?.value||0);
      if(!deposit||!percent) return empty(result,'입력값이 비어 있습니다.','충전금과 퍼센트를 먼저 입력해 주세요.');
      const bonus=Math.min(deposit*(percent/100), cap||Infinity); const total=deposit+bonus; const needRolling=total*Math.max(0,rolling); const effective=maxWithdraw?Math.min(total,maxWithdraw):total;
      const efficiency = effective > 0 ? effective / Math.max(total, 1) : 0;
      const burdenScore = clamp((needRolling / Math.max(total,1)) * 5, 0, 100);
      const bankroll = engines.bankrollPlan ? engines.bankrollPlan({ capital: total, probability: Math.max(0.35, efficiency * 0.65), odds: 1.9, mode:'safe', volatilityScore: burdenScore }) : { amount:0, ratio:0, label:'보수' };
      engineSet(result,'조건 결과',[
        { label:'보너스', value:`${Math.round(bonus).toLocaleString()}원`, note:`총 사용금 ${Math.round(total).toLocaleString()}원` },
        { label:'필요 롤링', value:`${Math.round(needRolling).toLocaleString()}원`, note:`배수 ${rolling || 0}배` },
        { label:'실수령 기준', value:`${Math.round(effective).toLocaleString()}원`, note:maxWithdraw?'최대 출금 반영':'제한 없음' },
        { label:'추천 비중', value: bankroll.amount ? `${Math.round(bankroll.amount).toLocaleString()}원` : `${(bankroll.ratio*100).toFixed(1)}%`, note:`부담도 ${toolRiskLabel(burdenScore)}` },
      ], [
        efficiency < 0.75 ? '최대 출금 제한이 체감 실익을 크게 줄입니다.' : '최대 출금 제한은 상대적으로 약한 편입니다.',
        needRolling > total * 10 ? '롤링 부담이 높아 보수적으로 접근하는 편이 안전합니다.' : '롤링 부담은 과도한 편은 아닙니다.',
      ]);
    });
  }

  function initSlipCompare(){
    const form=$('#slipcompareForm'); const result=$('#slipCompareResult'); if(!form||!result) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const engines = window.RavenEngines || {};
      const stake=Number($('#slipStake')?.value||0);
      const odds=[Number($('#slipOddsA')?.value||0),Number($('#slipOddsB')?.value||0),Number($('#slipOddsC')?.value||0)].filter(Boolean);
      if(!stake||odds.length<2) return empty(result,'입력값이 비어 있습니다.','금액과 배당 두 개 이상을 입력해 주세요.');
      const singlesStudy = engineSportsStudy({ market:'moneyline', odds: odds.slice(0,2), capital: stake, mode:'neutral', labels:['선택1','선택2'] });
      const parlayOdds = odds.reduce((m,o)=>m*o,1);
      const fairProb = odds.map((o)=>1/o).reduce((m,v)=>m*v,1);
      const parlayEv = engines.expectedValue ? engines.expectedValue({ probability: fairProb * 0.98, odds: parlayOdds, stake }) : { evRate: 0 };
      const parlayVol = engines.volatilityRisk ? engines.volatilityRisk({ probability: fairProb * 0.98, odds: parlayOdds, stake, plays: odds.length }) : { volatilityScore: 0, grade:'낮음' };
      const singleAvgEv = singlesStudy ? singlesStudy.outcomes.reduce((sum,item)=>sum+item.ev.evRate,0)/Math.max(1,singlesStudy.outcomes.length) : 0;
      engineSet(result,'비교 결과',[
        { label:'단폴 평균 EV', value:`${(singleAvgEv*100).toFixed(1)}%`, note:'분산형' },
        { label:'조합 EV', value:`${(parlayEv.evRate*100).toFixed(1)}%`, note:`총 배당 ${parlayOdds.toFixed(2)}` },
        { label:'단폴 변동성', value: singlesStudy ? singlesStudy.volatilityLabel : '-', note:'평균 기준' },
        { label:'조합 변동성', value: parlayVol.grade, note:'폴더 수가 늘수록 상승' },
      ], [
        parlayVol.volatilityScore > (singlesStudy?.volatilityScore||0) ? '조합은 수익이 몰리지만 흔들림도 같이 커집니다.' : '분산형 단폴이 상대적으로 안정적입니다.',
        parlayEv.evRate > singleAvgEv ? '조합 쪽 기대값이 더 높아 보여도 손실 구간은 더 길 수 있습니다.' : '단폴 여러 번이 운영 난도는 더 낮습니다.',
      ]);
    });
  }

  function initBankrollPlanner(){
    const form=$('#bankrollplannerForm'); const result=$('#bankrollPlannerResult'); if(!form||!result) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const engines = window.RavenEngines || {};
      const total=Number($('#bankrollTotal')?.value||0); const unit=Number($('#bankrollUnit')?.value||0); const sessions=Number($('#bankrollSessions')?.value||0); const stop=Number($('#bankrollStop')?.value||0);
      if(!total||!unit||!sessions) return empty(result,'입력값이 비어 있습니다.','총 자금, 기준금, 회차 수를 입력해 주세요.');
      const usable=Math.max(0,total-stop); const per=Math.floor(usable/Math.max(1,sessions)); const ratio=unit?Math.round((unit/Math.max(1,total))*100):0;
      const bankroll = engines.bankrollPlan ? engines.bankrollPlan({ capital: total, probability: 0.52, odds: 1.95, mode: ratio > 4 ? 'aggressive' : ratio > 2 ? 'neutral' : 'safe', volatilityScore: ratio > 4 ? 70 : ratio > 2 ? 45 : 25 }) : { amount:0, ratio:0, label:'보수', targetGain:0 };
      engineSet(result,'분배 결과',[
        { label:'사용 가능', value:`${Math.round(usable).toLocaleString()}원`, note:`손절선 ${Math.round(stop).toLocaleString()}원` },
        { label:'회차당 예산', value:`${Math.round(per).toLocaleString()}원`, note:`목표 회차 ${sessions}` },
        { label:'기준금 비율', value:`${ratio}%`, note:`현재 설정 ${bankroll.label}` },
        { label:'권장 비중', value: bankroll.amount ? `${Math.round(bankroll.amount).toLocaleString()}원` : `${(bankroll.ratio*100).toFixed(1)}%`, note:`목표선 ${Math.round(bankroll.targetGain).toLocaleString()}원` },
      ], [
        ratio > 5 ? '1회 기준금 비중이 높아 붕괴 속도가 빨라질 수 있습니다.' : '1회 기준금은 상대적으로 무난한 편입니다.',
        stop <= 0 ? '손절선을 함께 정하면 회차 운영이 훨씬 안정적입니다.' : '손절선이 있어 운영 통제가 쉬운 편입니다.',
      ]);
    });
  }


  function focusCenterMode(){
    const params=new URL(location.href).searchParams; return params.get('focus')||'';
  }

  function initAiDomainAnalysis(){
    const form=$('#aidomainanalysisForm'); const result=$('#aiDomainAnalysisResult'); if(!form||!result) return;
    const seed=$('#aiDomainSeed'); const candidates=$('#aiDomainCandidates'); const evidence=$('#aiDomainEvidence');
    const addr=$('#domainCheckAddress'); const timeline=$('#domainCheckTimeline'); const relation=$('#domainCheckRelation');
    bindFormPersistence(form);
    const focus = focusCenterMode();
    if(focus==='address' && addr) addr.checked=true;
    if(focus==='timeline' && timeline) timeline.checked=true;
    if(focus==='relation' && relation) relation.checked=true;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const base=String(seed?.value||'').trim(); const cand=String(candidates?.value||'').trim(); const raw=String(evidence?.value||'').trim();
      if(!base && !cand && !raw) return empty(result,'입력값이 비어 있습니다.','기준값이나 근거 텍스트를 입력해 주세요.');
      const parts=[];
      const allLines = normalizeLines([base,cand,raw].filter(Boolean).join('\n'));
      const domains = Array.from(new Set(allLines.flatMap((line)=>{const d=normalizeDomain(line); return d?[d]:extractDomainsFromText(line);}))).filter(Boolean);
      const official = domains[0] || normalizeDomain(base) || '-';
      if(addr?.checked){
        const table=`<table class="toolkit-table"><thead><tr><th>후보</th><th>정규화</th><th>판정</th></tr></thead><tbody>${allLines.map((line)=>{ const d=normalizeDomain(line)||extractDomainsFromText(line)[0]||''; const verdict=!d?'확인 필요':(d===official||d.endsWith('.'+official)?'일치 후보':(d===official?'일치 후보':'추가 확인')); return `<tr><td>${esc(line)}</td><td>${esc(d||'-')}</td><td>${esc(verdict)}</td></tr>`; }).join('')}</tbody></table>`;
        parts.push(section('주소 정합성','주소 후보를 같은 기준으로 먼저 묶습니다.',table));
      }
      if(timeline?.checked){
        const rows=normalizeLines(raw||cand||base).map((line,idx)=>{ const date=(line.match(/20\d{2}[./-]\d{1,2}[./-]\d{1,2}|20\d{2}[./-]\d{1,2}|20\d{2}년\s*\d{1,2}월?/)||['기록 '+String(idx+1).padStart(2,'0')])[0]; const ds=extractDomainsFromText(line); const tag=/리뉴얼|변경|이전|신규|공지/i.test(line)?'변경':'참고'; return {date,line,ds,tag}; });
        const flow=`<div class="timeline-list">${rows.map((r)=>`<article class="timeline-entry"><span class="mini-badge">${esc(r.date)}</span><strong>${esc(r.tag)}</strong><p>${esc(r.line)}</p>${r.ds.length?`<small>${esc(r.ds.join(' · '))}</small>`:''}</article>`).join('')}</div>`;
        parts.push(section('변경 이력','리뉴얼·주소 변경 흐름을 시간순으로 정리합니다.',flow));
      }
      if(relation?.checked){
        const codes=extractCodes(raw); const handles=extractHandles(raw); const score=Math.min(100, domains.length*12 + codes.length*8 + handles.length*10 + (/같은|공통|동일|리뉴얼|변경/i.test(raw)?18:0));
        const cards=`<div class="score-grid"><div class="score-metric"><span>주소 신호</span><strong>${domains.length||0}개</strong><small>${esc(domains.slice(0,3).join(' · ')||'-')}</small></div><div class="score-metric"><span>코드 신호</span><strong>${codes.length||0}개</strong><small>${esc(codes.slice(0,3).join(' · ')||'-')}</small></div><div class="score-metric"><span>채널 신호</span><strong>${handles.length||0}개</strong><small>${esc(handles.slice(0,2).join(' · ')||'-')}</small></div><div class="score-metric"><span>유사도</span><strong>${score}점</strong><small>${toolRiskLabel(score)}</small></div></div>`;
        parts.push(section('계열 신호','겹치는 운영 패턴을 추정으로 묶어 봅니다.',cards));
      }
      const memo = [`기준 후보는 ${official} 입니다.`, domains.length>1?'주소 후보가 여러 개여서 공지·채널 대조가 필요합니다.':'주소 후보가 많지 않습니다.', /리뉴얼|변경/i.test(raw)?'리뉴얼/변경 문구가 있어 흐름 점검이 필요합니다.':'큰 변경 문구는 많지 않습니다.'];
      parts.push(section('실전 메모','지금 바로 확인할 포인트만 남깁니다.',`<ul class="toolkit-points">${memo.map((m)=>`<li>${esc(m)}</li>`).join('')}</ul><div class="toolkit-actions"><a class="safety-link-btn ghost" href="/tools/notice-review/">공지·후기 분석</a><a class="safety-link-btn ghost" href="/tools/official-check/">공식주소 체크</a></div>`));
      setResult(result, parts.join(''), 'toolkit-result-stack');
    });
  }

  function syncSportsCenterFields(){
    const mode=$('#centerMode'); if(!mode) return;
    const val=mode.value;
    $$('[data-center-wrap]').forEach((el)=>el.hidden=false);
    const hide=(keys)=>keys.forEach((k)=>{ const el=$(`[data-center-wrap="${k}"]`); if(el) el.hidden=true; });
    if(val==='condition'){ hide(['market','line','oddC']); }
    if(val==='casino'){ hide(['market','line','oddC','percent','rolling','maxWithdraw']); }
    if(val==='mini'){ hide(['market','line','oddA','oddB','oddC','percent','rolling','maxWithdraw']); }
    if(val==='sports'){ hide(['percent','rolling','maxWithdraw']); }
  }

  function initAiSportsOddsAnalysis(){
    const form=$('#aisportsoddsanalysisForm'); const result=$('#aiSportsOddsAnalysisResult'); if(!form||!result) return;
    bindFormPersistence(form);
    const focus = focusCenterMode();
    const mode=$('#centerMode');
    if(focus==='condition') mode.value='condition';
    else if(focus==='casino') mode.value='casino';
    else if(focus==='mini') mode.value='mini';
    else mode.value='sports';
    const market=$('#centerMarket');
    if(focus==='ou') market.value='ou'; else if(focus==='hcp') market.value='hcp';
    syncSportsCenterFields();
    mode.addEventListener('change', syncSportsCenterFields);
    form.addEventListener('submit',(e)=>{
      e.preventDefault(); const engines=window.RavenEngines||{}; const m=mode.value; const showFair=$('#centerShowFair')?.checked; const showEv=$('#centerShowEv')?.checked; const showRisk=$('#centerShowRisk')?.checked; const showBank=$('#centerShowBank')?.checked;
      if(m==='condition'){
        const deposit=Number($('#centerCapital')?.value||0); const percent=Number($('#centerPercent')?.value||0); const rolling=Number($('#centerRolling')?.value||0); const maxWithdraw=Number($('#centerMaxWithdraw')?.value||0); const rules=String($('#centerRules')?.value||'').trim();
        if(!deposit||!percent) return empty(result,'입력값이 비어 있습니다.','충전금과 보너스 %를 입력해 주세요.');
        const bonus=deposit*(percent/100); const total=deposit+bonus; const needRolling=total*Math.max(0,rolling); const effective=maxWithdraw?Math.min(total,maxWithdraw):total; const p=Math.max(0.32, Math.min(0.78, (effective/Math.max(total,1))*0.7)); const ev=engines.expectedValue({ probability:p, odds:1.9, stake:deposit}); const burden=clamp(((needRolling/Math.max(total,1))*4.8)+(/양방|제한|최대베팅|몰수|회수/.test(rules)?20:0),0,100); const bank=engines.bankrollPlan({ capital:deposit, probability:p, odds:1.9, mode: burden>60?'safe':'neutral', volatilityScore: burden });
        const cards=[]; if(showFair) cards.push({label:'보너스', value:`${Math.round(bonus).toLocaleString()}원`, note:`총 사용금 ${Math.round(total).toLocaleString()}원`}); if(showEv) cards.push({label:'실수령 기준', value:`${Math.round(effective).toLocaleString()}원`, note:`EV ${(ev.evRate*100).toFixed(1)}%`}); if(showRisk) cards.push({label:'조건 부담', value:toolRiskLabel(burden), note:`필요 롤링 ${Math.round(needRolling).toLocaleString()}원`}); if(showBank) cards.push({label:'권장 비중', value: bank.amount?`${Math.round(bank.amount).toLocaleString()}원`:`${(bank.ratio*100).toFixed(1)}%`, note:bank.label});
        engineSet(result,'AI 조건 해석',cards,['최대 출금 제한은 실익을 직접 깎습니다.','규정 문구에 제한/몰수 표현이 있으면 더 보수적으로 봐야 합니다.']); return;
      }
      if(m==='sports'){
        const odds=[Number($('#centerOddA')?.value||0),Number($('#centerOddB')?.value||0),Number($('#centerOddC')?.value||0)].filter(Boolean); const capital=Number($('#centerCapital')?.value||0); const risk=$('#centerRisk')?.value||'neutral'; const mk=$('#centerMarket')?.value||'1x2'; if(odds.length<2) return empty(result,'입력값이 비어 있습니다.','배당 두 개 이상을 입력해 주세요.'); const labels=mk==='1x2'?['홈','무','원정']:mk==='moneyline'?['홈','원정']:mk==='ou'?['오버','언더']:['홈','원정']; const study=engineSportsStudy({ market:mk, odds, capital, mode:risk, line:Number($('#centerLine')?.value||0), labels}); const cards=[]; if(showFair) cards.push({label:'공정확률', value:`${study.bestProb.label} ${(study.bestProb.prob*100).toFixed(1)}%`, note:`북마진 ${(study.fair.margin*100).toFixed(1)}%`}); if(showEv) cards.push({label:'기대값', value:`${(study.bestEdge.ev.evRate*100).toFixed(1)}%`, note:study.bestEdge.label}); if(showRisk) cards.push({label:'변동성', value:study.volatilityLabel, note:`연패위험 ${(study.outcomes[0].vol.streakLossProb*100).toFixed(1)}%`}); if(showBank) cards.push({label:'추천 비중', value:study.bankroll.amount?`${Math.round(study.bankroll.amount).toLocaleString()}원`:`${(study.bankroll.ratio*100).toFixed(1)}%`, note:study.bankroll.label}); engineSet(result,'AI 스포츠 배당분석',cards,[`${study.bestProb.label} 쪽 공정확률이 조금 더 앞섭니다.`, `${study.bestEdge.label} 기준으로는 ${study.bestEdge.label} 선택을 먼저 볼 수 있습니다.`]); return;
      }
      if(m==='casino'){
        const rtp=Number($('#centerOddA')?.value||$('#centerOddA').value||0) || Number($('#centerOddA')?.value||0); const capital=Number($('#centerCapital')?.value||0); const unit=Number($('#centerUnit')?.value||0); const rounds=Number($('#centerRounds')?.value||0); const risk=$('#centerRisk')?.value||'neutral'; const variance = Number($('#centerOddB')?.value||0) > 2 ? 'high':'mid'; if(!capital||!unit) return empty(result,'입력값이 비어 있습니다.','현재 자본과 1회 금액을 입력해 주세요.'); const rr=Number($('#centerOddA')?.value||96); const p=Math.max(0.35, Math.min(0.98, rr/100)); const ev=engines.expectedValue({ probability:p, odds:1.0+(rr/100), stake:unit}); const volScore=variance==='high'?78:48; const bank=engines.bankrollPlan({ capital, probability:p, odds:1.85, mode:risk, volatilityScore:volScore}); const cards=[]; if(showFair) cards.push({label:'RTP 기준', value:`${rr.toFixed(1)}%`, note:'세션 기준'}); if(showEv) cards.push({label:'기대값', value:`${(ev.evRate*100).toFixed(1)}%`, note:'RTP 참고'}); if(showRisk) cards.push({label:'변동성', value:toolRiskLabel(volScore), note:'세션 흔들림'}); if(showBank) cards.push({label:'권장 비중', value:bank.amount?`${Math.round(bank.amount).toLocaleString()}원`:`${(bank.ratio*100).toFixed(1)}%`, note:bank.label}); engineSet(result,'카지노 해석',cards,['RTP가 높아 보여도 변동성이 크면 체감 손실 폭이 커질 수 있습니다.','1회 금액은 총자본의 5% 이내가 더 안전합니다.']); return;
      }
      const capital=Number($('#centerCapital')?.value||0); const unit=Number($('#centerUnit')?.value||0); const rounds=Number($('#centerRounds')?.value||0); const risk=$('#centerRisk')?.value||'neutral'; if(!capital||!unit||!rounds) return empty(result,'입력값이 비어 있습니다.','자본, 1회 금액, 회차를 입력해 주세요.'); const collapse=Math.min(99,(unit*rounds/Math.max(1,capital))*100); const bank=engines.bankrollPlan({ capital, probability:0.5, odds:1.9, mode:risk, volatilityScore:collapse}); const cards=[]; if(showFair) cards.push({label:'회차 예산', value:`${Math.round((capital-bank.stopLoss)/Math.max(1,rounds)).toLocaleString()}원`, note:`목표 ${rounds}회`}); if(showEv) cards.push({label:'운영 판단', value:collapse>70?'보수 접근':'운영 가능', note:'자본 대비 회차'}); if(showRisk) cards.push({label:'붕괴 위험', value:toolRiskLabel(collapse), note:`압박 ${collapse.toFixed(0)}%`}); if(showBank) cards.push({label:'권장 비중', value:bank.amount?`${Math.round(bank.amount).toLocaleString()}원`:`${(bank.ratio*100).toFixed(1)}%`, note:bank.label}); engineSet(result,'미니게임 해석',cards,['단계 베팅보다 고정금 분배가 훨씬 안정적입니다.','회차가 늘수록 기대수익보다 붕괴 위험을 먼저 봐야 합니다.']);
    });
  }

  function initAiGameLab(){
    const form=$('#aigamelabForm'); const result=$('#aiGameLabResult'); if(!form||!result) return;
    const mode=$('#aiGameMode'); const market=$('#aiGameMarket');
    const wraps={ sportsType:$('[data-ai-wrap="sportsType"]', form), line:$('[data-ai-wrap="line"]', form), oddsA:$('[data-ai-wrap="oddsA"]', form), oddsB:$('[data-ai-wrap="oddsB"]', form), oddsC:$('[data-ai-wrap="oddsC"]', form), rtp:$('[data-ai-wrap="rtp"]', form), variance:$('[data-ai-wrap="variance"]', form), capital:$('[data-ai-wrap="capital"]', form), unit:$('[data-ai-wrap="unit"]', form), rounds:$('[data-ai-wrap="rounds"]', form), risk:$('[data-ai-wrap="risk"]', form) };
    function syncMode(){
      const v=mode.value;
      const showSports=v==='sports'; const showCasino=v==='casino'; const showMini=v==='mini';
      wraps.sportsType.hidden=!showSports; wraps.line.hidden=!(showSports && ['ou','hcp'].includes(market.value)); wraps.oddsA.hidden=!showSports; wraps.oddsB.hidden=!showSports; wraps.oddsC.hidden=!(showSports && market.value==='1x2');
      wraps.rtp.hidden=!showCasino; wraps.variance.hidden=!showCasino; wraps.capital.hidden=false; wraps.unit.hidden=showSports; wraps.rounds.hidden=showSports; wraps.risk.hidden=false;
    }
    mode.addEventListener('change', syncMode); market.addEventListener('change', syncMode); syncMode();
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const engines = window.RavenEngines || {};
      const m=mode.value; const risk=$('#aiGameRisk')?.value||'neutral';
      if(m==='sports'){
        const marketType=market.value; const odds=[Number($('#aiGameOddsA')?.value||0),Number($('#aiGameOddsB')?.value||0),Number($('#aiGameOddsC')?.value||0)].filter(Boolean); const capital=Number($('#aiGameCapital')?.value||0); const labels=marketType==='1x2'?['홈','무','원정']:marketType==='ou'?['오버','언더']:['홈','원정'];
        if(odds.length < (marketType==='1x2'?3:2)) return empty(result,'입력값이 비어 있습니다.','해석할 배당을 입력해 주세요.');
        const study=engineSportsStudy({ market: marketType, odds, capital, mode:risk, labels });
        engineSet(result,'AI 게임 해석',[
          { label:'공정확률', value:`${study.bestProb.label} ${(study.bestProb.prob*100).toFixed(1)}%`, note:`공정 오즈 ${study.bestProb.fairOdds.toFixed(2)}` },
          { label:'기대값', value:`${(study.bestEdge.ev.evRate*100).toFixed(1)}%`, note:`${study.bestEdge.label} ${study.bestEdge.ev.label}` },
          { label:'변동성', value:study.volatilityLabel, note:`북마진 ${(study.fair.margin*100).toFixed(1)}%` },
          { label:'추천 비중', value:study.bankroll.amount?`${Math.round(study.bankroll.amount).toLocaleString()}원`:`${(study.bankroll.ratio*100).toFixed(1)}%`, note:`${study.bankroll.label}` },
        ], [
          `${study.bestProb.label} 쪽이 공정확률 기준 가장 앞섭니다.`,
          `${study.bestEdge.label} 쪽 보정 EV는 ${engines.formatSignedPercent(study.bestEdge.ev.evRate*100)} 입니다.`,
          `${study.volatilityLabel} 변동성이므로 ${risk==='safe'?'비중을 줄여':'비중을 관리하며'} 접근하는 편이 좋습니다.`,
        ]);
        return;
      }
      if(m==='casino'){
        const rtp=Number($('#aiGameRtp')?.value||0); const variance=$('#aiGameVariance')?.value||'mid'; const capital=Number($('#aiGameCapital')?.value||0); const unit=Number($('#aiGameUnit')?.value||0); const rounds=Number($('#aiGameRounds')?.value||0);
        if(!rtp||!capital||!unit) return empty(result,'입력값이 비어 있습니다.','RTP, 자본, 1회 금액을 입력해 주세요.');
        const p=Math.min(0.98, Math.max(0.35, rtp/100)); const odds=1 + (rtp/100); const volScore = variance==='high'?78:variance==='mid'?48:25;
        const ev=engines.expectedValue({ probability:p, odds, stake:unit }); const vol=engines.volatilityRisk({ probability:p, odds: variance==='high'?1.2:variance==='mid'?1.08:1.03, stake:unit, plays:Math.max(1,rounds||10) }); const bank=engines.bankrollPlan({ capital, probability:p, odds:1.9, mode:risk, volatilityScore:Math.max(volScore, vol.volatilityScore) });
        engineSet(result,'AI 게임 해석',[
          { label:'기대값', value:`${(ev.evRate*100).toFixed(1)}%`, note:`RTP ${rtp.toFixed(1)}% 기준` },
          { label:'변동성', value:toolRiskLabel(Math.max(volScore, vol.volatilityScore)), note:`세션 ${rounds||10}회 기준` },
          { label:'추천 비중', value: bank.amount?`${Math.round(bank.amount).toLocaleString()}원`:`${(bank.ratio*100).toFixed(1)}%`, note:`${bank.label}` },
          { label:'소모 속도', value:`약 ${Math.max(1, Math.floor(capital/Math.max(1,unit)))}회`, note:'이론상 버티는 횟수' },
        ], [
          variance==='high' ? '고변동 구조는 짧은 시간에도 체감 손실이 크게 흔들릴 수 있습니다.' : '변동성이 과한 편은 아닙니다.',
          unit > capital * 0.05 ? '1회 금액 비중이 높아 세션 붕괴가 빨라질 수 있습니다.' : '1회 금액 비중은 상대적으로 무난합니다.',
        ]);
        return;
      }
      const capital=Number($('#aiGameCapital')?.value||0); const unit=Number($('#aiGameUnit')?.value||0); const rounds=Number($('#aiGameRounds')?.value||0); const stage=$('#aiGameVariance')?.value||'mid';
      if(!capital||!unit||!rounds) return empty(result,'입력값이 비어 있습니다.','자본, 1회 금액, 회차를 입력해 주세요.');
      const stageRisk = stage==='high'?82:stage==='mid'?52:30;
      const bank=engines.bankrollPlan({ capital, probability:0.5, odds:1.9, mode:risk, volatilityScore:stageRisk });
      const collapse = Math.min(99, (unit * rounds / Math.max(1,capital)) * 100);
      engineSet(result,'AI 게임 해석',[
        { label:'권장 분배', value: bank.amount?`${Math.round(bank.amount).toLocaleString()}원`:`${(bank.ratio*100).toFixed(1)}%`, note:`${bank.label}` },
        { label:'회차 예산', value:`${Math.round((capital-bank.stopLoss)/Math.max(1,rounds)).toLocaleString()}원`, note:`목표 ${rounds}회` },
        { label:'붕괴 위험', value:toolRiskLabel(collapse), note:`자금 소진 압력 ${collapse.toFixed(0)}%` },
        { label:'손절선', value:`${Math.round(bank.stopLoss).toLocaleString()}원`, note:'자동 제안' },
      ], [
        collapse > 70 ? '현재 회차 설정은 자본 대비 부담이 큽니다.' : '회차 분배는 상대적으로 무난합니다.',
        '단계 배팅은 기대값보다 변동성을 먼저 키우는 구조로 봐야 합니다.',
      ]);
    });
  }

  function initAiConditionLab(){
    const form=$('#aiconditionlabForm'); const result=$('#aiConditionLabResult'); if(!form||!result) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const engines = window.RavenEngines || {};
      const deposit=Number($('#aiCondDeposit')?.value||0); const percent=Number($('#aiCondPercent')?.value||0); const cap=Number($('#aiCondCap')?.value||0); const rolling=Number($('#aiCondRolling')?.value||0); const maxWithdraw=Number($('#aiCondMaxWithdraw')?.value||0); const capital=Number($('#aiCondCapital')?.value||0); const rules=String($('#aiCondRules')?.value||'').trim();
      if(!deposit||!percent) return empty(result,'입력값이 비어 있습니다.','충전금과 보너스 퍼센트를 입력해 주세요.');
      const bonus=Math.min(deposit*(percent/100), cap||Infinity); const total=deposit+bonus; const needRolling=total*Math.max(0,rolling); const effective=maxWithdraw?Math.min(total,maxWithdraw):total;
      const rulePenalty = (/양방|제한|최대베팅|제외|불가/.test(rules)?12:0) + (/취소|몰수|회수/.test(rules)?18:0);
      const burden = clamp(((needRolling/Math.max(total,1))*4.8) + rulePenalty, 0, 100);
      const p = Math.max(0.32, Math.min(0.78, (effective/Math.max(total,1))*0.7));
      const ev = engines.expectedValue({ probability:p, odds:1.9, stake:deposit });
      const bank = engines.bankrollPlan({ capital: capital || total, probability:p, odds:1.9, mode: burden > 60 ? 'safe' : 'neutral', volatilityScore: burden });
      engineSet(result,'AI 조건 해석',[
        { label:'보너스', value:`${Math.round(bonus).toLocaleString()}원`, note:`총 사용금 ${Math.round(total).toLocaleString()}원` },
        { label:'필요 롤링', value:`${Math.round(needRolling).toLocaleString()}원`, note:`배수 ${rolling || 0}배` },
        { label:'실수령 기준', value:`${Math.round(effective).toLocaleString()}원`, note:maxWithdraw?'최대 출금 반영':'출금 제한 없음' },
        { label:'조건 판정', value:toolRiskLabel(burden), note:`보정 EV ${engines.formatSignedPercent(ev.evRate*100)}` },
      ], [
        burden > 60 ? '조건 부담이 높아 보수적으로 해석하는 편이 낫습니다.' : '조건 부담이 과도한 편은 아닙니다.',
        maxWithdraw && maxWithdraw < total ? '최대 출금 제한이 실제 실익을 줄이고 있습니다.' : '최대 출금 제한 영향은 크지 않습니다.',
        rules ? '규정 문구에서 제한/몰수성 표현이 있는지 같이 확인했습니다.' : '추가 규정 문구가 없으면 기본 조건 위주로 해석합니다.',
        bank.amount ? `권장 접근 금액은 ${Math.round(bank.amount).toLocaleString()}원 수준입니다.` : '권장 접근 금액은 비중 위주로 보세요.',
      ]);
    });
  }

  function initOuCalculator(){
    const form=$('#oucalculatorForm'); const result=$('#ouCalculatorResult'); if(!form||!result) return;
    form.addEventListener('submit',(e)=>{ e.preventDefault(); const odds=[Number($('#ouOverOdds')?.value||0), Number($('#ouUnderOdds')?.value||0)]; const capital=Number($('#ouCapital')?.value||0); const risk=$('#ouRisk')?.value||'neutral'; if(odds.some(v=>!v||v<1.02)) return empty(result,'입력값이 비어 있습니다.','오버와 언더 배당을 입력해 주세요.'); const study=engineSportsStudy({ market:'ou', odds, capital, mode:risk, labels:['오버','언더'] }); engineSet(result,'언더·오버 결과',[{label:'공정확률',value:`${study.bestProb.label} ${(study.bestProb.prob*100).toFixed(1)}%`,note:`기준점 ${$('#ouLine')?.value||'-'}`},{label:'기대값',value:`${(study.bestEdge.ev.evRate*100).toFixed(1)}%`,note:`${study.bestEdge.label}`},{label:'변동성',value:study.volatilityLabel,note:`북마진 ${(study.fair.margin*100).toFixed(1)}%`},{label:'추천 비중',value:study.bankroll.amount?`${Math.round(study.bankroll.amount).toLocaleString()}원`:`${(study.bankroll.ratio*100).toFixed(1)}%`,note:study.bankroll.label}], [`${study.bestProb.label} 쪽 공정확률이 조금 더 높습니다.`, `${study.volatilityLabel} 변동성이라 기준점 해석과 비중 관리가 같이 필요합니다.`]); });
  }

  function initHandicapProfit(){
    const form=$('#handicapprofitForm'); const result=$('#handicapProfitResult'); if(!form||!result) return;
    form.addEventListener('submit',(e)=>{ e.preventDefault(); const odds=[Number($('#hcpHomeOdds')?.value||0), Number($('#hcpAwayOdds')?.value||0)]; const capital=Number($('#hcpCapital')?.value||0); const risk=$('#hcpRisk')?.value||'neutral'; if(odds.some(v=>!v||v<1.02)) return empty(result,'입력값이 비어 있습니다.','양쪽 배당을 입력해 주세요.'); const study=engineSportsStudy({ market:'hcp', odds, capital, mode:risk, labels:['홈','원정'], line:Number($('#hcpLine')?.value||0) }); engineSet(result,'핸디캡 결과',[{label:'공정확률',value:`${study.bestProb.label} ${(study.bestProb.prob*100).toFixed(1)}%`,note:`핸디 ${$('#hcpLine')?.value||'-'}`},{label:'기대값',value:`${(study.bestEdge.ev.evRate*100).toFixed(1)}%`,note:`${study.bestEdge.label}`},{label:'변동성',value:study.volatilityLabel,note:'라인 포함 해석'},{label:'추천 비중',value:study.bankroll.amount?`${Math.round(study.bankroll.amount).toLocaleString()}원`:`${(study.bankroll.ratio*100).toFixed(1)}%`,note:study.bankroll.label}], [`핸디 라인은 적중/미적중보다 라인 적합성이 먼저입니다.`, `${study.bestEdge.label} 쪽이 보정 EV 기준으로 조금 더 앞섭니다.`]); });
  }

  function initSlotSession(){
    const form=$('#slotsessionForm'); const result=$('#slotSessionResult'); if(!form||!result) return;
    form.addEventListener('submit',(e)=>{ e.preventDefault(); const engines=window.RavenEngines||{}; const rtp=Number($('#slotRtp')?.value||0); const variance=$('#slotVariance')?.value||'mid'; const capital=Number($('#slotCapital')?.value||0); const unit=Number($('#slotUnit')?.value||0); const rounds=Number($('#slotRounds')?.value||0); const risk=$('#slotRisk')?.value||'neutral'; if(!rtp||!capital||!unit) return empty(result,'입력값이 비어 있습니다.','RTP, 자본, 1회 금액을 입력해 주세요.'); const p=Math.max(0.35, Math.min(0.98, rtp/100)); const ev=engines.expectedValue({ probability:p, odds:1.0 + (rtp/100), stake:unit }); const volScore=variance==='high'?78:variance==='mid'?48:25; const bank=engines.bankrollPlan({ capital, probability:p, odds:1.85, mode:risk, volatilityScore:volScore }); engineSet(result,'슬롯 세션 결과',[{label:'기대값',value:`${(ev.evRate*100).toFixed(1)}%`,note:`RTP ${rtp.toFixed(1)}%`},{label:'변동성',value:toolRiskLabel(volScore),note:`${variance==='high'?'고변동':'일반'} 세션`},{label:'권장 비중',value:bank.amount?`${Math.round(bank.amount).toLocaleString()}원`:`${(bank.ratio*100).toFixed(1)}%`,note:bank.label},{label:'예상 회차',value:`${Math.max(1,Math.floor(capital/Math.max(1,unit)))}회`,note:`입력 회차 ${rounds||'-'}`}],[variance==='high' ? '고변동 슬롯은 짧은 시간에도 체감 손실 폭이 큽니다.' : '과도한 변동성은 아닙니다.', unit > capital*0.05 ? '1회 금액 비중이 커 세션 지속성이 약해질 수 있습니다.' : '1회 금액 비중은 무난한 편입니다.']); });
  }

  function initMinigameRounds(){
    const form=$('#minigameroundsForm'); const result=$('#minigameRoundsResult'); if(!form||!result) return;
    form.addEventListener('submit',(e)=>{ e.preventDefault(); const engines=window.RavenEngines||{}; const capital=Number($('#miniCapital')?.value||0); const unit=Number($('#miniUnit')?.value||0); const rounds=Number($('#miniRounds')?.value||0); const stop=Number($('#miniStop')?.value||0); const stage=$('#miniStage')?.value||'flat'; const risk=$('#miniRisk')?.value||'neutral'; if(!capital||!unit||!rounds) return empty(result,'입력값이 비어 있습니다.','자본, 1회 금액, 회차를 입력해 주세요.'); const volatilityScore=stage==='step'?82:38; const bank=engines.bankrollPlan({ capital, probability:0.5, odds:1.9, mode:risk, volatilityScore }); const usable=Math.max(0, capital-stop); const per=Math.floor(usable/Math.max(1,rounds)); const collapse=Math.min(99, (unit * rounds / Math.max(1, capital)) * (stage==='step'?1.35:1) * 100);
      engineSet(result,'미니게임 결과',[{label:'회차 예산',value:`${Math.round(per).toLocaleString()}원`,note:`사용 가능 ${Math.round(usable).toLocaleString()}원`},{label:'붕괴 위험',value:toolRiskLabel(collapse),note:`자금 압박 ${collapse.toFixed(0)}%`},{label:'권장 비중',value:bank.amount?`${Math.round(bank.amount).toLocaleString()}원`:`${(bank.ratio*100).toFixed(1)}%`,note:bank.label},{label:'손절선',value:`${Math.round(bank.stopLoss || stop).toLocaleString()}원`,note:stage==='step'?'단계 배팅 반영':'고정금 기준'}], [stage==='step' ? '단계 배팅은 회차가 늘수록 붕괴 위험이 빠르게 커집니다.' : '고정금 운영이 훨씬 안정적입니다.', collapse > 70 ? '현재 입력값은 자본 대비 부담이 큰 편입니다.' : '현재 입력값은 과도한 편은 아닙니다.']); });
  }



  const TOOLS_LOGBOOK_KEY = 'raven_tools_logbook_v1';
  const TOOLS_PATTERN_KEY = 'raven_tools_pattern_v1';
  const TOOLS_LINKS_KEY = 'raven_tools_links_v1';
  const TOOLS_TEMPLATE_KEY = 'raven_tools_template_v1';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function readStore(key, fallback){ try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch(_) { return fallback; } }
  function writeStore(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {} }
  function won(value){ return `${Math.round(Number(value)||0).toLocaleString()}원`; }
  function signedWon(value){ const n = Math.round(Number(value)||0); return `${n>0?'+':''}${n.toLocaleString()}원`; }
  function percent(value, digits = 1){ const n = Number(value)||0; return `${n.toFixed(digits)}%`; }
  function fmtDateInput(value){ const d = value ? new Date(value) : new Date(); const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
  function toolBadge(score){ if(score >= 80) return '높음'; if(score >= 55) return '주의'; if(score >= 30) return '보통'; return '낮음'; }
  function storageRow(title, meta = [], actions = ''){ return `<article class="tool-storage-row"><h4>${esc(title)}</h4>${meta.length?`<div class="tool-storage-meta">${meta.map((item)=>`<span>${esc(item)}</span>`).join('')}</div>`:''}${actions?`<div class="tool-storage-actions">${actions}</div>`:''}</article>`; }
  function parseDate(value){ const d = value ? new Date(value) : null; return d && !Number.isNaN(d.getTime()) ? d : null; }
  function daysDiff(value){ const d = parseDate(value); if(!d) return Infinity; return Math.floor((Date.now() - d.getTime()) / 86400000); }
  function inRangeDays(value, days){ return daysDiff(value) <= days; }
  function longestStreak(values){ let best = { value:'-', count:0 }; let current = { value:'-', count:0 }; values.forEach((value)=>{ if(value === current.value){ current.count += 1; } else { current = { value, count:1 }; } if(current.count > best.count) best = { ...current }; }); return best; }
  function summarizeLogEntries(entries, days = null){ const scoped = days == null ? entries : entries.filter((item)=>inRangeDays(item.date || item.at, days));
    const totalStake = scoped.reduce((sum, item)=>sum + Number(item.stake || 0), 0);
    const totalPayout = scoped.reduce((sum, item)=>sum + Number(item.payout || 0), 0);
    const profit = totalPayout - totalStake;
    const wins = scoped.filter((item)=>item.result === 'win').length;
    const loss = scoped.filter((item)=>item.result === 'lose').length;
    const oddsItems = scoped.filter((item)=>Number(item.odds) > 0);
    const avgOdds = oddsItems.length ? oddsItems.reduce((sum, item)=>sum + Number(item.odds || 0), 0) / oddsItems.length : 0;
    const highOddsRatio = oddsItems.length ? oddsItems.filter((item)=>Number(item.odds || 0) >= 3).length / oddsItems.length : 0;
    const categoryMap = {};
    scoped.forEach((item)=>{ const key = item.category || item.game || '기타'; categoryMap[key] = (categoryMap[key] || 0) + (Number(item.payout || 0) - Number(item.stake || 0)); });
    const ranked = Object.entries(categoryMap).sort((a,b)=>b[1]-a[1]);
    return { entries:scoped, count:scoped.length, totalStake, totalPayout, profit, wins, loss, avgOdds, highOddsRatio, bestCategory: ranked[0] || null, worstCategory: ranked[ranked.length-1] || null };
  }
  function favoriteSave(title, text, meta=''){ const next = [{ id: Date.now(), title, text, meta, at: new Date().toISOString() }, ...readStore(TOOLS_TEMPLATE_KEY, [])].slice(0, 40); writeStore(TOOLS_TEMPLATE_KEY, next); }
  function renderMetricRow(items){ return `<div class="score-grid">${items.map((item)=>`<div class="score-metric"><span>${esc(item.label)}</span><strong>${esc(item.value)}</strong><small>${esc(item.note || '')}</small></div>`).join('')}</div>`; }

  function initToolsHubNavigation(){
    const chips = $$('.tool-anchor-chip');
    if(!chips.length) return;
    chips.forEach((chip)=>chip.addEventListener('click', ()=>{
      chips.forEach((item)=>item.classList.remove('is-active'));
      chip.classList.add('is-active');
      const id = chip.getAttribute('data-scroll-target');
      const target = id ? document.getElementById(id) : null;
      if(target) target.scrollIntoView({ behavior:'smooth', block:'start' });
    }));
  }

  function renderToolsDomainDeskHistory(){
    const wrap = $('#toolsDomainDeskHistory');
    if(!wrap) return;
    const items = loadHistory().filter((item)=>item.kind === 'domain' || item.kind === 'ip').slice(0, 8);
    if(!items.length){ wrap.innerHTML = '<div class="toolkit-note">최근 확인 기록이 아직 없습니다.</div>'; return; }
    wrap.innerHTML = items.map((item)=>storageRow(item.label || item.key, [item.kind === 'ip' ? 'IP 조회' : '도메인 조회', item.key], `<button class="safety-copy-btn ghost" type="button" data-domain-history="${esc(item.key)}">다시 넣기</button>`)).join('');
  }

  function initToolsDomainDesk(){
    const form = $('#toolsDomainDeskForm'); const result = $('#toolsDomainDeskResult');
    const nameInput = $('#toolsDomainName'); const domainInput = $('#toolsDomainValue'); const resetBtn = $('#toolsDomainDeskReset');
    if(!form || !result || !nameInput || !domainInput) return;
    const params = new URL(location.href).searchParams;
    if(!nameInput.value && params.get('q')) nameInput.value = params.get('q') || '';
    if(!domainInput.value && params.get('domain')) domainInput.value = params.get('domain') || '';
    renderToolsDomainDeskHistory();
    if(resetBtn) resetBtn.addEventListener('click', ()=>{ nameInput.value=''; domainInput.value=''; empty(result, '입력값을 기다리는 중입니다.', '사이트명이나 도메인을 넣으면 빠른 판단을 시작합니다.'); nameInput.focus(); });
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-domain-history]');
      if(!btn) return;
      domainInput.value = btn.getAttribute('data-domain-history') || '';
      form.dispatchEvent(new Event('submit', { bubbles:true, cancelable:true }));
    });
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const siteName = String(nameInput.value || '').trim();
      const rawDomain = String(domainInput.value || '').trim();
      const domain = normalizeDomain(rawDomain);
      const seed = siteName || domain || rawDomain;
      if(!seed) return empty(result, '입력값이 비어 있습니다.', '사이트명 또는 도메인을 한 개 이상 입력해 주세요.');
      empty(result, '확인 중입니다.', '도메인 정보와 검색 동선을 함께 정리합니다.');
      const queries = [`${seed} 먹튀`, `${seed} 후기`, `${seed} 주소`, `${seed} 도메인 변경`, `${seed} 리뉴얼`, `${seed} 텔레그램`, `${seed} 공지`];
      let payload = null; let lookupError = '';
      if(domain && domain.includes('.')){
        try {
          payload = await lookupDomain(domain);
          saveHistory({ kind:'domain', key:payload.domain || domain, label:siteName || payload.domain || domain, nameservers:payload.dns?.nameServers || [], subnets:payload.cluster?.subnets || [], asns:payload.cluster?.sharedAsns || [] });
        } catch(err) { lookupError = err.message || '도메인 응답을 읽지 못했습니다.'; }
      }
      const rdap = payload?.rdap || {};
      const dns = payload?.dns || {};
      const risk = payload?.risk || {};
      const cluster = payload?.cluster || {};
      const networks = payload?.networks || [];
      const hits = payload ? overlaps({ kind:'domain', key:payload.domain || domain, label:siteName || payload.domain || domain, nameservers:dns.nameServers || [], subnets:cluster.subnets || [], asns:cluster.sharedAsns || [] }) : [];
      const riskScore = Number(risk.score || 0);
      const ageDays = Number(rdap.ageDays || 0);
      const quickFlags = [];
      if(!domain || !domain.includes('.')) quickFlags.push('검색 중심 확인');
      if(ageDays && ageDays < 120) quickFlags.push('신규 도메인');
      if((dns.nameServers || []).length <= 1 && domain) quickFlags.push('DNS 정보 적음');
      if(hits.length) quickFlags.push(`최근 군집 겹침 ${hits.length}건`);
      if(riskScore >= 70) quickFlags.push('추가 확인 우선');
      const quickList = quickFlags.length ? quickFlags : ['공개 검색과 공지 일치 확인', '주소·코드·채널을 같이 비교'];
      const driverList = (risk.drivers || []).slice(0,5).map((item)=>`${item.label} · ${item.detail}`);
      const actionMemo = [
        ageDays && ageDays < 120 ? '생성일이 짧으면 첫충/출금 전 확인 강도를 높이는 편이 안전합니다.' : '생성일만으로 안전 판단을 끝내지 말고 검색 흔적을 같이 보세요.',
        hits.length ? '같은 브라우저 조회 이력과 네임서버/대역이 겹치면 주소 변경 흐름을 같이 확인하세요.' : '최근 조회 이력과 겹침은 크지 않지만 공개 후기 밀도는 꼭 함께 확인하세요.',
        domain ? '최종 클릭 전에는 공지 채널과 공식 주소 표기가 같은지 다시 보는 편이 좋습니다.' : '사이트명 기준 검색 후 공식 주소를 다시 입력하면 더 정확한 결과를 볼 수 있습니다.'
      ];
      const summaryCards = renderMetricRow([
        { label:'기준값', value: siteName || domain || rawDomain, note: domain && domain.includes('.') ? '도메인 정규화 완료' : '검색 기준어 중심' },
        { label:'도메인 생성일', value: formatDate(rdap.createdAt), note: ageLabel(rdap.ageDays) },
        { label:'기본 판정', value: risk.verdict || (domain ? '추가 확인' : '검색 우선'), note: `리스크 ${risk.band || toolBadge(riskScore)}` },
        { label:'네트워크', value: String(networks.length || 0), note: `네임서버 ${(dns.nameServers || []).length}개` }
      ]);
      const quickCards = renderMetricRow([
        { label:'우선 신호', value: quickFlags[0] || '기본 확인', note: quickFlags[1] || '검색+공지 비교' },
        { label:'군집 힌트', value: hits.length ? `${hits.length}건` : '낮음', note: hits[0]?.item?.label || '최근 조회 기준' },
        { label:'검색 밀도', value: `${queries.length}개`, note: '먹튀 · 후기 · 주소 조합' },
        { label:'다음 단계', value: domain ? '주소 최종 체크' : '검색 결과 정리', note: domain ? '세부 도구와 연결' : '도메인 입력 시 상세화' }
      ]);
      const lookupCards = `<div class="lookup-links">${queries.slice(0,6).map((query)=>`<article class="lookup-link-card"><a href="${googleUrl(query)}" target="_blank" rel="noopener noreferrer">${esc(query)}</a><p>검색 바로가기</p></article>`).join('')}</div>`;
      const detailTable = payload ? `<table class="toolkit-table"><thead><tr><th>항목</th><th>값</th></tr></thead><tbody>
        <tr><td><strong>도메인</strong></td><td>${esc(payload.domain || domain)}</td></tr>
        <tr><td><strong>등록일</strong></td><td>${esc(formatDate(rdap.createdAt))}</td></tr>
        <tr><td><strong>만료일</strong></td><td>${esc(formatDate(rdap.expiresAt))}</td></tr>
        <tr><td><strong>네임서버</strong></td><td>${esc((dns.nameServers || []).join(', ') || '-')}</td></tr>
        <tr><td><strong>A 레코드</strong></td><td>${esc((dns.aRecords || []).join(', ') || '-')}</td></tr>
        <tr><td><strong>클러스터</strong></td><td>${esc(cluster.summary || '-')}</td></tr>
      </tbody></table>` : `<div class="toolkit-note">도메인까지 입력하면 등록일, DNS, 네트워크 힌트를 같이 확인할 수 있습니다.</div>`;
      const overlapHtml = hits.length ? listCard(hits.map((hit)=>({ title:hit.item.label || hit.item.key, detail:[hit.overlapNs.length?`NS ${hit.overlapNs.join(', ')}`:'', hit.overlapAsn.length?`ASN ${hit.overlapAsn.join(', ')}`:'', hit.overlapSub.length?`대역 ${hit.overlapSub.join(', ')}`:''].filter(Boolean).join(' · ') }))) : '<div class="toolkit-note">최근 조회 이력과 겹치는 군집 힌트가 크지 않습니다.</div>';
      const nextActions = `<div class="lookup-links">
        <article class="lookup-link-card"><a href="/muktu-police/search/?q=${encodeURIComponent(seed)}&type=${encodeURIComponent('먹튀')}">구글링 도구</a><p>검색 결과를 더 넓게 정리합니다.</p></article>
        <article class="lookup-link-card"><a href="#tools-legacy">세부 도구 보기</a><p>기존 도구는 하단에서 그대로 이어집니다.</p></article>
        <article class="lookup-link-card"><a href="${googleUrl(`${seed} 공식주소`)}" target="_blank" rel="noopener noreferrer">공식 주소 검색</a><p>공지 채널과 주소 표기를 같이 확인합니다.</p></article>
      </div>`;
      const errorBlock = lookupError ? `<div class="toolkit-note">도메인 응답을 읽지 못해 검색 동선 중심으로 먼저 정리했습니다. ${esc(lookupError)}</div>` : '';
      const html = summaryCards + quickCards + errorBlock + section('짧은 판단', '지금 먼저 볼 포인트만 남겼습니다.', `<ul class="toolkit-points">${[...quickList, ...driverList.slice(0,2), ...actionMemo.slice(0,2)].slice(0,6).map((item)=>`<li>${esc(item)}</li>`).join('')}</ul>`) + section('검색 동선', '먹튀·후기·주소 조합을 먼저 여는 흐름입니다.', lookupCards) + section('도메인 응답', '도메인을 입력했을 때 보이는 기본 값입니다.', detailTable) + section('최근 기록 비교', '같은 브라우저에서 확인한 항목과 겹치는 힌트입니다.', overlapHtml) + section('다음 단계', '기존 기능을 유지하면서 이어서 볼 수 있습니다.', nextActions);
      setResult(result, html, 'toolkit-result-stack');
      renderToolsDomainDeskHistory();
    });
    if(nameInput.value || domainInput.value) setTimeout(()=>form.dispatchEvent(new Event('submit', { bubbles:true, cancelable:true })), 30);
  }

  function initToolsOddsDesk(){
    const form = $('#toolsOddsDeskForm'); const result = $('#toolsOddsDeskResult');
    if(!form || !result) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const stake = Number($('#toolsOddsStake')?.value || 0);
      const capital = Number($('#toolsOddsCapital')?.value || 0);
      const mode = $('#toolsOddsMode')?.value || 'neutral';
      const odds = [Number($('#toolsOddsOne')?.value || 0), Number($('#toolsOddsTwo')?.value || 0), Number($('#toolsOddsThree')?.value || 0), Number($('#toolsOddsFour')?.value || 0)].filter((value)=>value >= 1.01);
      if(!stake || !odds.length) return empty(result, '입력값이 비어 있습니다.', '배팅금과 배당 하나 이상을 입력해 주세요.');
      const comboOdds = odds.reduce((acc, value)=>acc * value, 1);
      const payout = stake * comboOdds;
      const profit = payout - stake;
      const breakEven = comboOdds > 0 ? (1 / comboOdds) * 100 : 0;
      const riskScore = clamp((odds.length - 1) * 18 + Math.max(0, comboOdds - 2) * 8 + (mode === 'safe' ? -6 : mode === 'aggressive' ? 12 : 0), 12, 96);
      const unitRatio = capital ? (stake / capital) * 100 : 0;
      const engines = window.RavenEngines || {};
      const bank = engines.bankrollPlan ? engines.bankrollPlan({ capital, probability: Math.max(0.08, Math.min(0.92, 1 / comboOdds)), odds: comboOdds, mode, volatilityScore: riskScore }) : null;
      const safeRange = capital ? `${won(Math.max(capital * 0.01, 1))} ~ ${won(Math.max(capital * (comboOdds >= 3 ? 0.02 : 0.03), 1))}` : '자본 입력 시 계산';
      const notes = [
        `${odds.length}폴더 조합 기준입니다.`,
        `손익분기 승률은 약 ${breakEven.toFixed(1)}% 입니다.`,
        comboOdds >= 4 ? '고배당 조합은 적중 시 수익이 크지만 연속 미적중 구간도 길어질 수 있습니다.' : '배당대가 과도한 편은 아니지만 자본 비중은 꼭 같이 보세요.',
        unitRatio > 0 ? `현재 배팅금은 총 자본의 ${unitRatio.toFixed(1)}% 수준입니다.` : '총 자본을 넣으면 권장 비중도 같이 볼 수 있습니다.'
      ];
      const table = `<table class="toolkit-table"><thead><tr><th>입력 배당</th><th>값</th></tr></thead><tbody>${odds.map((value, index)=>`<tr><td><strong>${index + 1}폴더</strong></td><td>${value.toFixed(2)}</td></tr>`).join('')}</tbody></table>`;
      const judgement = renderMetricRow([
        { label:'조합배당', value: comboOdds.toFixed(2), note: `${odds.length}폴더` },
        { label:'적중금', value: won(payout), note: '원금 포함' },
        { label:'순수익', value: signedWon(profit), note: '적중 시 기준' },
        { label:'손익분기', value: percent(breakEven), note: '이론상 최소 승률' }
      ]);
      const operation = renderMetricRow([
        { label:'변동성', value: toolBadge(riskScore), note: `리스크 ${riskScore.toFixed(0)}점` },
        { label:'배팅 비중', value: capital ? percent(unitRatio) : '-', note: capital ? '총 자본 대비' : '자본 입력 시 계산' },
        { label:'권장 비중', value: bank && capital ? (bank.amount ? won(bank.amount) : percent((bank.ratio || 0) * 100)) : '-', note: bank?.label || '기준 없음' },
        { label:'권장 범위', value: safeRange, note: '보수 기준' }
      ]);
      const html = judgement + section('운영 판단', '숫자만 보지 않고 운영 강도까지 같이 봅니다.', operation) + section('입력 배당', '입력한 폴더를 그대로 다시 보여줍니다.', table) + section('짧은 판단', '실전에서 먼저 보는 포인트만 남겼습니다.', `<ul class="toolkit-points">${notes.map((item)=>`<li>${esc(item)}</li>`).join('')}</ul>`);
      setResult(result, html, 'toolkit-result-stack');
    });
  }

  function initToolsBonusDesk(){
    const form = $('#toolsBonusDeskForm'); const result = $('#toolsBonusDeskResult');
    if(!form || !result) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const deposit = Number($('#toolsBonusDeposit')?.value || 0);
      const percentValue = Number($('#toolsBonusPercent')?.value || 0);
      const cap = Number($('#toolsBonusCap')?.value || 0);
      const rolling = Number($('#toolsBonusRolling')?.value || 0);
      const contribution = clamp(Number($('#toolsBonusContribution')?.value || 100), 1, 100);
      const progress = clamp(Number($('#toolsBonusProgress')?.value || 0), 0, 100);
      const maxWithdraw = Number($('#toolsBonusMaxWithdraw')?.value || 0);
      if(!deposit || !percentValue) return empty(result, '입력값이 비어 있습니다.', '입금액과 보너스 퍼센트를 입력해 주세요.');
      const bonus = Math.min(deposit * (percentValue / 100), cap || Infinity);
      const total = deposit + bonus;
      const effectiveContribution = contribution / 100;
      const needRolling = total * Math.max(0, rolling) / effectiveContribution;
      const doneRolling = needRolling * (progress / 100);
      const remaining = Math.max(0, needRolling - doneRolling);
      const effectiveCashout = maxWithdraw ? Math.min(total, maxWithdraw) : total;
      const pressure = clamp((remaining / Math.max(total, 1)) * 4.4 + (contribution < 100 ? 8 : 0) + (maxWithdraw && maxWithdraw < total ? 12 : 0), 0, 100);
      const reachable = progress >= 100 && (!maxWithdraw || maxWithdraw >= effectiveCashout);
      const quickSummary = renderMetricRow([
        { label:'보너스', value: won(bonus), note: `총 사용금 ${won(total)}` },
        { label:'충족률', value: percent(progress), note: `남은 롤링 ${won(remaining)}` },
        { label:'실출금 기준', value: won(effectiveCashout), note: maxWithdraw ? '최대 출금 반영' : '제한 없음' },
        { label:'조건 압박', value: toolBadge(pressure), note: `기여율 ${contribution}%` }
      ]);
      const notes = [
        `기여율 ${contribution}%를 반영해 필요한 롤링을 계산했습니다.`,
        remaining > total * 10 ? '남은 롤링 부담이 큰 편이라 실수령보다 회전 비용을 먼저 보는 편이 낫습니다.' : '남은 롤링 부담이 과도한 편은 아닙니다.',
        maxWithdraw && maxWithdraw < total ? '최대 출금 제한이 실수령 상단을 줄이고 있습니다.' : '최대 출금 제한 영향은 크지 않습니다.',
        reachable ? '입력 진행률 기준으로는 출금 가능 단계에 가까운 편입니다.' : '현재 수치만 보면 아직 조건 충족 전으로 보는 편이 안전합니다.'
      ];
      const detail = `<ul class="toolkit-points"><li>필요 롤링 ${won(needRolling)} · 완료 ${won(doneRolling)}</li><li>남은 롤링 ${won(remaining)} · 총 사용금 ${won(total)}</li><li>현재 진행률 ${percent(progress)} · 실출금 기준 ${won(effectiveCashout)}</li></ul>`;
      const html = quickSummary + section('조건 요약', '출금 가능성과 남은 부담을 먼저 봅니다.', detail) + section('짧은 판단', '숫자를 해석할 때 먼저 볼 포인트입니다.', `<ul class="toolkit-points">${notes.map((item)=>`<li>${esc(item)}</li>`).join('')}</ul>`);
      setResult(result, html, 'toolkit-result-stack');
    });
  }

  function renderToolsCashflowSummary(){
    const panel = $('#toolsCashflowSummary');
    if(!panel) return;
    const entries = readStore(TOOLS_LOGBOOK_KEY, []).sort((a,b)=>String(b.date).localeCompare(String(a.date)) || b.id - a.id);
    if(!entries.length){ panel.innerHTML = '<div class="toolkit-note">배팅 로그가 쌓이면 오늘 · 최근 7일 · 최근 30일 손익과 패턴을 자동으로 요약합니다.</div>'; return; }
    const today = summarizeLogEntries(entries, 0);
    const week = summarizeLogEntries(entries, 7);
    const month = summarizeLogEntries(entries, 30);
    const overall = summarizeLogEntries(entries);
    const noteList = [];
    if(overall.highOddsRatio >= 0.45) noteList.push('고배당 비중이 높은 편이라 손익 변동 폭이 커질 수 있습니다.');
    if(week.profit < 0 && month.profit < 0) noteList.push('최근 7일과 30일 모두 손실 구간이면 배팅 강도를 낮추는 편이 좋습니다.');
    if(overall.bestCategory) noteList.push(`현재 가장 성과가 좋은 구분은 ${overall.bestCategory[0]}입니다.`);
    if(overall.worstCategory && overall.worstCategory[1] < 0) noteList.push(`손실이 큰 구분은 ${overall.worstCategory[0]}라 비중 조정이 필요할 수 있습니다.`);
    panel.innerHTML = renderMetricRow([
      { label:'오늘 손익', value: signedWon(today.profit), note: `${today.count}건` },
      { label:'최근 7일', value: signedWon(week.profit), note: `적중률 ${percent(week.count ? week.wins / week.count * 100 : 0)}` },
      { label:'최근 30일', value: signedWon(month.profit), note: `평균 배당 ${month.avgOdds ? month.avgOdds.toFixed(2) : '-'}` },
      { label:'고배당 비중', value: percent(overall.highOddsRatio * 100, 0), note: overall.bestCategory ? `${overall.bestCategory[0]} 우세` : '데이터 누적 중' }
    ]) + `<div class="tool-mini-list-box"><ul class="toolkit-points">${noteList.slice(0,4).map((item)=>`<li>${esc(item)}</li>`).join('')}</ul></div>`;
  }

  function renderToolsLogbook(){
    const summary = $('#toolsLogbookSummary'); const list = $('#toolsLogbookList');
    if(!summary || !list) return;
    const entries = readStore(TOOLS_LOGBOOK_KEY, []).sort((a,b)=>String(b.date).localeCompare(String(a.date)) || b.id - a.id);
    renderToolsCashflowSummary();
    if(!entries.length){ summary.innerHTML = ''; list.innerHTML = '<div class="toolkit-note">아직 저장된 기록이 없습니다.</div>'; return; }
    const overall = summarizeLogEntries(entries);
    const week = summarizeLogEntries(entries, 7);
    const month = summarizeLogEntries(entries, 30);
    summary.innerHTML = renderMetricRow([
      { label:'기록 수', value: String(entries.length), note:'최대 60개 저장' },
      { label:'총 배팅금', value: won(overall.totalStake), note:'누적 금액' },
      { label:'누적 손익', value: signedWon(overall.profit), note:`최근 7일 ${signedWon(week.profit)}` },
      { label:'적중률', value: percent(overall.count ? overall.wins / overall.count * 100 : 0), note:`적중 ${overall.wins}건` },
      { label:'평균 배당', value: overall.avgOdds ? overall.avgOdds.toFixed(2) : '-', note:`최근 30일 ${month.avgOdds ? month.avgOdds.toFixed(2) : '-'}` },
      { label:'강한 구분', value: overall.bestCategory ? overall.bestCategory[0] : '-', note: overall.bestCategory ? signedWon(overall.bestCategory[1]) : '누적 중' }
    ]);
    list.innerHTML = `<table class="tool-storage-table"><thead><tr><th>날짜</th><th>구분</th><th>경기/게임</th><th>배당</th><th>배팅금</th><th>손익</th><th></th></tr></thead><tbody>${entries.slice(0,16).map((item)=>`<tr><td>${esc(item.date)}</td><td>${esc(item.category)}</td><td>${esc(item.title || '-')}</td><td>${item.odds ? Number(item.odds).toFixed(2) : '-'}</td><td>${won(item.stake)}</td><td>${signedWon(Number(item.payout || 0) - Number(item.stake || 0))}</td><td><button type="button" class="safety-copy-btn ghost" data-log-delete="${item.id}">삭제</button></td></tr>`).join('')}</tbody></table>`;
  }

  function initToolsLogbook(){
    const form = $('#toolsLogbookForm');
    const refreshBtn = $('#toolsCashflowRefresh');
    if(!form) return;
    const dateInput = $('#toolsLogDate'); if(dateInput && !dateInput.value) dateInput.value = fmtDateInput();
    renderToolsLogbook();
    if(refreshBtn) refreshBtn.addEventListener('click', ()=>renderToolsLogbook());
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-log-delete]');
      if(!btn) return;
      const id = Number(btn.getAttribute('data-log-delete'));
      const next = readStore(TOOLS_LOGBOOK_KEY, []).filter((item)=>item.id !== id);
      writeStore(TOOLS_LOGBOOK_KEY, next); renderToolsLogbook(); toast('기록을 삭제했습니다.');
    });
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const date = $('#toolsLogDate')?.value || fmtDateInput();
      const category = $('#toolsLogCategory')?.value || '스포츠';
      const title = String($('#toolsLogTitle')?.value || '').trim();
      const odds = Number($('#toolsLogOdds')?.value || 0);
      const stake = Number($('#toolsLogStake')?.value || 0);
      const resultValue = $('#toolsLogResult')?.value || 'lose';
      const payoutInput = Number($('#toolsLogPayout')?.value || 0);
      const memo = String($('#toolsLogMemo')?.value || '').trim();
      if(!stake) return toast('배팅금을 입력해 주세요.');
      const payout = payoutInput || (resultValue === 'win' && odds ? stake * odds : resultValue === 'push' ? stake : 0);
      const next = [{ id: Date.now(), date, category, title, odds, stake, payout, result:resultValue, memo }, ...readStore(TOOLS_LOGBOOK_KEY, [])].slice(0, 60);
      writeStore(TOOLS_LOGBOOK_KEY, next); form.reset(); if(dateInput) dateInput.value = fmtDateInput(); renderToolsLogbook(); toast('기록을 저장했습니다.');
    });
  }

  function renderToolsPattern(){
    const summary = $('#toolsPatternSummary'); const list = $('#toolsPatternList');
    if(!summary || !list) return;
    const entries = readStore(TOOLS_PATTERN_KEY, []);
    if(!entries.length){ summary.innerHTML = ''; list.innerHTML = '<div class="toolkit-note">패턴 기록이 아직 없습니다.</div>'; return; }
    const recent20 = entries.slice(0, 20);
    const recent5 = entries.slice(0, 5);
    const countMap = (items)=>items.reduce((acc, item)=>{ const key = item.value; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
    const rank20 = Object.entries(countMap(recent20)).sort((a,b)=>b[1]-a[1]);
    const rank5 = Object.entries(countMap(recent5)).sort((a,b)=>b[1]-a[1]);
    const top20 = rank20[0] ? `${rank20[0][0]} ${percent((rank20[0][1] / recent20.length) * 100, 0)}` : '-';
    const top5 = rank5[0] ? `${rank5[0][0]} ${percent((rank5[0][1] / recent5.length) * 100, 0)}` : '-';
    let currentStreak = 0; const head = recent20[0]?.value;
    for(const item of recent20){ if(item.value === head) currentStreak += 1; else break; }
    const maxStreak = longestStreak(recent20.map((item)=>item.value));
    const ratioChips = rank20.slice(0,4).map(([name, count])=>`<span class="tool-ratio-chip">${esc(name)} <strong>${percent((count / recent20.length) * 100, 0)}</strong></span>`).join('');
    summary.innerHTML = renderMetricRow([
      { label:'전체 기록', value: String(entries.length), note:'최대 80개 저장' },
      { label:'현재 연속', value: `${head || '-'} ${currentStreak}회`, note:'최신 기준' },
      { label:'최근 5회', value: top5, note:'짧은 구간 비율' },
      { label:'최근 20회', value: top20, note:'누적 비율' },
      { label:'최대 연속', value: `${maxStreak.value} ${maxStreak.count}회`, note:'최근 20회 기준' },
      { label:'게임 구분', value: recent20[0]?.game || '-', note:`토큰 ${rank20[0]?.[0] || '-'} ${rank20[0]?.[1] || 0}회` }
    ]) + `<div class="tool-ratio-line">${ratioChips}</div>`;
    list.innerHTML = `<div class="tool-storage-card"><h4>최근 빈도</h4><div class="tool-storage-tags">${rank20.map(([name, count])=>`<span class="mini-badge">${esc(name)} ${count}</span>`).join('')}</div></div>` + recent20.map((item)=>storageRow(item.value, [item.game || '구분 없음', formatDate(item.at), item.note || '메모 없음'], `<button type="button" class="safety-copy-btn ghost" data-pattern-delete="${item.id}">삭제</button>`)).join('');
  }

  function initToolsPattern(){
    const form = $('#toolsPatternForm'); const clearBtn = $('#toolsPatternClear'); const shortcuts = $('#toolsPatternShortcuts');
    if(!form) return;
    renderToolsPattern();
    if(shortcuts) shortcuts.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-pattern-value]'); if(!btn) return;
      const input = $('#toolsPatternValue'); if(input) { input.value = btn.getAttribute('data-pattern-value') || ''; input.focus(); }
    });
    if(clearBtn) clearBtn.addEventListener('click', ()=>{ writeStore(TOOLS_PATTERN_KEY, []); renderToolsPattern(); toast('패턴 기록을 비웠습니다.'); });
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-pattern-delete]');
      if(!btn) return;
      const id = Number(btn.getAttribute('data-pattern-delete'));
      writeStore(TOOLS_PATTERN_KEY, readStore(TOOLS_PATTERN_KEY, []).filter((item)=>item.id !== id));
      renderToolsPattern(); toast('패턴 기록을 삭제했습니다.');
    });
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const game = String($('#toolsPatternGame')?.value || '').trim();
      const value = String($('#toolsPatternValue')?.value || '').trim();
      const note = String($('#toolsPatternNote')?.value || '').trim();
      if(!value) return toast('결과 토큰을 입력해 주세요.');
      const next = [{ id: Date.now(), game, value, note, at: new Date().toISOString() }, ...readStore(TOOLS_PATTERN_KEY, [])].slice(0, 80);
      writeStore(TOOLS_PATTERN_KEY, next); form.reset(); renderToolsPattern(); toast('패턴 기록을 저장했습니다.');
    });
  }

  function buildReplyTemplate(type, brand, code, url, note){
    const safeBrand = brand || '사이트';
    const safeCode = code ? `가입코드 ${code}` : '가입코드 확인';
    const safeUrl = url || '공식주소 별도 안내';
    const safeNote = note ? `
- 참고: ${note}` : '';
    if(type === 'deposit') return `[안내]
${safeBrand} 이용 전 주소와 코드부터 다시 확인해 주세요.
- 공식주소: ${safeUrl}
- ${safeCode}${safeNote}`;
    if(type === 'inspection') return `[점검 공지]
${safeBrand} 점검 또는 접속 이슈가 있는 경우 공식주소와 공지 채널을 먼저 다시 확인해 주세요.
- 공식주소: ${safeUrl}${safeNote}`;
    if(type === 'code') return `[코드 안내]
${safeBrand} 이용 시 ${safeCode} 기준으로 확인해 주세요.
- 공식주소: ${safeUrl}${safeNote}`;
    if(type === 'settlement') return `[문의 응답]
정산 관련 문의는 현재 확인 중입니다. 주소와 코드, 진행 내역을 같이 남겨 주시면 더 빠르게 확인할 수 있습니다.${safeNote}`;
    return `[가입 안내]
${safeBrand} 이용 전 공식주소와 가입코드를 먼저 확인해 주세요.
- 공식주소: ${safeUrl}
- ${safeCode}${safeNote}`;
  }

  function initToolsReplyHelper(){
    const form = $('#toolsReplyHelperForm'); const result = $('#toolsReplyHelperResult');
    if(!form || !result) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const type = $('#toolsReplyType')?.value || 'join';
      const brand = String($('#toolsReplyBrand')?.value || '').trim();
      const code = String($('#toolsReplyCode')?.value || '').trim();
      const url = String($('#toolsReplyUrl')?.value || '').trim();
      const note = String($('#toolsReplyNote')?.value || '').trim();
      const textValue = buildReplyTemplate(type, brand, code, url, note);
      const favTitle = `${brand || '기본'} · ${type}`;
      setResult(result, `<div class="tool-output-box"><pre>${esc(textValue)}</pre><div class="tool-inline-actions"><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(textValue)}">문구 복사</button><button class="safety-copy-btn ghost" type="button" data-template-save="${esc(textValue)}" data-template-title="${esc(favTitle)}" data-template-meta="${esc(note || '응대 문구')}">즐겨찾기 저장</button></div></div>`, 'tool-output-box');
    });
  }

  function renderToolsTemplateFavorites(){
    const list = $('#toolsTemplateFavoriteList');
    if(!list) return;
    const items = readStore(TOOLS_TEMPLATE_KEY, []);
    if(!items.length){ list.innerHTML = '<div class="toolkit-note">자주 쓰는 문구를 저장해 두면 여기서 바로 복사할 수 있습니다.</div>'; return; }
    list.innerHTML = items.map((item)=>storageRow(item.title || '저장 문구', [item.meta || '메모 없음', formatDate(item.at)], `<button type="button" class="safety-copy-btn ghost" data-inline-copy="${esc(item.text)}">복사</button><button type="button" class="safety-copy-btn ghost" data-template-fill="${item.id}">불러오기</button><button type="button" class="safety-copy-btn ghost" data-template-delete="${item.id}">삭제</button>`)).join('');
  }

  function initToolsTemplateFavorites(){
    const form = $('#toolsTemplateFavoriteForm');
    if(!form) return;
    renderToolsTemplateFavorites();
    document.addEventListener('click', (e)=>{
      const saveBtn = e.target.closest('[data-template-save]');
      if(saveBtn){
        favoriteSave(saveBtn.getAttribute('data-template-title') || '저장 문구', saveBtn.getAttribute('data-template-save') || '', saveBtn.getAttribute('data-template-meta') || '');
        renderToolsTemplateFavorites();
        toast('즐겨찾기에 저장했습니다.');
        return;
      }
      const deleteBtn = e.target.closest('[data-template-delete]');
      if(deleteBtn){
        const id = Number(deleteBtn.getAttribute('data-template-delete'));
        writeStore(TOOLS_TEMPLATE_KEY, readStore(TOOLS_TEMPLATE_KEY, []).filter((item)=>item.id !== id));
        renderToolsTemplateFavorites();
        toast('즐겨찾기를 삭제했습니다.');
        return;
      }
      const fillBtn = e.target.closest('[data-template-fill]');
      if(fillBtn){
        const id = Number(fillBtn.getAttribute('data-template-fill'));
        const item = readStore(TOOLS_TEMPLATE_KEY, []).find((entry)=>entry.id === id);
        if(!item) return;
        const titleInput = $('#toolsTemplateTitle'); const metaInput = $('#toolsTemplateMeta'); const textInput = $('#toolsTemplateText');
        if(titleInput) titleInput.value = item.title || '';
        if(metaInput) metaInput.value = item.meta || '';
        if(textInput) textInput.value = item.text || '';
        toast('즐겨찾기 문구를 불러왔습니다.');
      }
    });
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const title = String($('#toolsTemplateTitle')?.value || '').trim();
      const meta = String($('#toolsTemplateMeta')?.value || '').trim();
      const textValue = String($('#toolsTemplateText')?.value || '').trim();
      if(!textValue) return toast('저장할 문구를 입력해 주세요.');
      favoriteSave(title || '직접 저장 문구', textValue, meta);
      form.reset();
      renderToolsTemplateFavorites();
      toast('문구를 즐겨찾기에 저장했습니다.');
    });
  }

  function renderToolsLinks(){
    const list = $('#toolsLinkManagerList');
    if(!list) return;
    const items = readStore(TOOLS_LINKS_KEY, []);
    if(!items.length){ list.innerHTML = '<div class="toolkit-note">저장된 링크가 아직 없습니다.</div>'; return; }
    list.innerHTML = items.map((item)=>storageRow(item.label || item.url, [item.url, item.code ? `코드 ${item.code}` : '코드 없음', item.note || '메모 없음'], `<a class="safety-link-btn ghost" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">열기</a><button class="safety-copy-btn ghost" type="button" data-inline-copy="${esc(item.url)}">주소 복사</button>${item.code ? `<button class="safety-copy-btn ghost" type="button" data-inline-copy="${esc(item.code)}">코드 복사</button>` : ''}<button class="safety-copy-btn ghost" type="button" data-link-delete="${item.id}">삭제</button>`)).join('');
  }

  function initToolsLinkManager(){
    const form = $('#toolsLinkManagerForm'); if(!form) return;
    renderToolsLinks();
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-link-delete]');
      if(!btn) return;
      const id = Number(btn.getAttribute('data-link-delete'));
      writeStore(TOOLS_LINKS_KEY, readStore(TOOLS_LINKS_KEY, []).filter((item)=>item.id !== id));
      renderToolsLinks(); toast('링크를 삭제했습니다.');
    });
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const label = String($('#toolsLinkLabel')?.value || '').trim();
      const url = String($('#toolsLinkUrl')?.value || '').trim();
      const code = String($('#toolsLinkCode')?.value || '').trim();
      const note = String($('#toolsLinkNote')?.value || '').trim();
      if(!url) return toast('공식주소를 입력해 주세요.');
      const next = [{ id: Date.now(), label, url, code, note }, ...readStore(TOOLS_LINKS_KEY, [])].slice(0, 40);
      writeStore(TOOLS_LINKS_KEY, next); form.reset(); renderToolsLinks(); toast('링크를 저장했습니다.');
    });
  }

  function initToolsSettlement(){
    const form = $('#toolsSettlementForm'); const result = $('#toolsSettlementResult');
    if(!form || !result) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const clicks = Number($('#toolsSetClicks')?.value || 0);
      const signups = Number($('#toolsSetSignups')?.value || 0);
      const ftd = Number($('#toolsSetFtd')?.value || 0);
      const cpa = Number($('#toolsSetCpa')?.value || 0);
      const revenue = Number($('#toolsSetRevenue')?.value || 0);
      const rs = Number($('#toolsSetRs')?.value || 0);
      const recharge = Number($('#toolsSetRecharge')?.value || 0);
      const target = Number($('#toolsSetTarget')?.value || 0);
      if(!clicks && !signups && !ftd && !revenue) return empty(result, '입력값이 비어 있습니다.', '유입, 가입, 첫충, 매출 중 한 개 이상 입력해 주세요.');
      const signupRate = clicks ? (signups / clicks) * 100 : 0;
      const ftdRate = signups ? (ftd / signups) * 100 : 0;
      const cpaEarn = ftd * cpa;
      const rsEarn = revenue * (rs / 100);
      const total = cpaEarn + rsEarn;
      const progress = target ? clamp((total / target) * 100, 0, 999) : 0;
      const html = renderMetricRow([
        { label:'CPA 정산', value: won(cpaEarn), note:`첫충 ${ftd}명` },
        { label:'RS 정산', value: won(rsEarn), note:`순매출 ${won(revenue)}` },
        { label:'예상 총액', value: won(total), note:'CPA + RS 합산' },
        { label:'목표 달성률', value: target ? percent(progress) : '-', note: target ? `목표 ${won(target)}` : '선택 입력' }
      ]) + section('전환 흐름', '유입과 가입 흐름을 같이 봅니다.', `<ul class="toolkit-points"><li>유입 → 가입 전환 ${percent(signupRate)}</li><li>가입 → 첫충 전환 ${percent(ftdRate)}</li><li>CPA 단가 ${won(cpa)} · RS ${percent(rs)}</li><li>재충전 ${recharge}회 · 목표 대비 ${target ? signedWon(total - target) : '기준 없음'}</li></ul>`);
      setResult(result, html, 'toolkit-result-stack');
    });
  }

  function initToolsBankrollSim(){
    const form = $('#toolsBankrollSimForm'); const result = $('#toolsBankrollSimResult');
    if(!form || !result) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const capital = Number($('#toolsBankrollCapital')?.value || 0);
      const unit = Number($('#toolsBankrollUnit')?.value || 0);
      const stop = Number($('#toolsBankrollStop')?.value || 0);
      const target = Number($('#toolsBankrollTarget')?.value || 0);
      const loseStreak = Number($('#toolsBankrollLoseStreak')?.value || 0);
      const mode = $('#toolsBankrollMode')?.value || 'neutral';
      if(!capital || !unit) return empty(result, '입력값이 비어 있습니다.', '총 자본과 기준 배팅금을 입력해 주세요.');
      const usable = Math.max(0, capital - stop);
      const unitRatio = (unit / capital) * 100;
      const streakCost = unit * Math.max(1, loseStreak);
      const strain = clamp((streakCost / Math.max(usable, 1)) * 100 + (mode === 'aggressive' ? 12 : mode === 'safe' ? -6 : 0), 0, 100);
      const engines = window.RavenEngines || {};
      const plan = engines.bankrollPlan ? engines.bankrollPlan({ capital, probability:0.52, odds:1.95, mode, volatilityScore:strain }) : null;
      const targetWins = target ? Math.ceil(target / Math.max(unit * 0.9, 1)) : 0;
      const html = renderMetricRow([
        { label:'기준 비중', value: percent(unitRatio), note:'총 자본 대비' },
        { label:'사용 가능', value: won(usable), note:`손절선 ${won(stop)}` },
        { label:'연패 버팀', value: won(streakCost), note:`허용 연패 ${loseStreak || 0}회` },
        { label:'권장 비중', value: plan ? (plan.amount ? won(plan.amount) : percent((plan.ratio || 0) * 100)) : '-', note: plan?.label || '기준 없음' }
      ]) + section('운영 판단', '자금 대비 기준금이 과한지 먼저 봅니다.', `<ul class="toolkit-points"><li>${unitRatio > 5 ? '1회 기준금 비중이 높아 붕괴 속도가 빨라질 수 있습니다.' : '1회 기준금 비중은 과도한 편은 아닙니다.'}</li><li>${strain > 65 ? '허용 연패 구간이 자금 압박을 빠르게 키우는 편입니다.' : '허용 연패 기준은 감당 가능한 범위에 가깝습니다.'}</li><li>${target ? `목표 수익 ${won(target)} 기준으로는 순익 기준 약 ${targetWins}회 적중 구간이 필요합니다.` : '목표 수익을 넣으면 필요한 적중 구간을 같이 계산합니다.'}</li></ul>`);
      setResult(result, html, 'toolkit-result-stack');
    });
  }

  function initToolsConditionCompare(){
    const form = $('#toolsConditionCompareForm'); const result = $('#toolsConditionCompareResult');
    if(!form || !result) return;
    const readSide = (suffix)=>{
      const name = String($(`#toolsCompareName${suffix}`)?.value || '').trim() || `조건 ${suffix}`;
      const bonus = Number($(`#toolsCompareBonus${suffix}`)?.value || 0);
      const rolling = Number($(`#toolsCompareRolling${suffix}`)?.value || 0);
      const contribution = clamp(Number($(`#toolsCompareContribution${suffix}`)?.value || 100), 1, 100);
      const max = Number($(`#toolsCompareMax${suffix}`)?.value || 0);
      const benefit = bonus * 1.1 + (max ? clamp(max / 120000, 0, 10) : 4);
      const burden = rolling * 10 + ((100 - contribution) * 0.6) + (max && max < 500000 ? 8 : 0);
      const score = clamp(58 + benefit - burden, 0, 100);
      return { name, bonus, rolling, contribution, max, score };
    };
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const a = readSide('A'); const b = readSide('B');
      const better = a.score === b.score ? null : (a.score > b.score ? a : b);
      const gap = Math.abs(a.score - b.score);
      const html = renderMetricRow([
        { label:a.name, value:`${a.score.toFixed(0)}점`, note:`보너스 ${a.bonus}% · 롤링 ${a.rolling}배` },
        { label:b.name, value:`${b.score.toFixed(0)}점`, note:`보너스 ${b.bonus}% · 롤링 ${b.rolling}배` },
        { label:'점수 차이', value:`${gap.toFixed(0)}점`, note: better ? `${better.name} 우세` : '유사' },
        { label:'판단', value: better ? better.name : '비슷함', note: better ? '체감 부담이 더 낮은 편' : '세부 규정 추가 확인' }
      ]) + section('비교 메모', '보너스보다 롤링·기여율·최대 출금을 같이 봅니다.', `<ul class="toolkit-points"><li>${a.name}: 기여율 ${a.contribution}% · 최대 출금 ${a.max ? won(a.max) : '제한 없음'}</li><li>${b.name}: 기여율 ${b.contribution}% · 최대 출금 ${b.max ? won(b.max) : '제한 없음'}</li><li>${better ? `${better.name} 쪽이 수치상 부담이 낮지만 실제 규정 문구를 같이 확인해야 합니다.` : '두 조건 차이가 크지 않아 세부 규정 문구를 같이 확인하는 편이 좋습니다.'}</li></ul>`);
      setResult(result, html, 'toolkit-result-stack');
    });
  }


  function initAiNoticeCheck(){
    const form=$('#ainoticecheckForm'); const official=$('#aiNoticeOfficial'); const channel=$('#aiNoticeChannel'); const result=$('#aiNoticeResult');
    if(!form||!official||!channel||!result) return;
    bindFormPersistence(form);
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const a=String(official.value||'').trim(); const b=String(channel.value||'').trim();
      if(!a||!b) return empty(result,'입력값이 비어 있습니다.','사이트 공지와 채널·후기 문구를 같이 넣어 주세요.');
      const aDomains=extractDomainsFromText(a), bDomains=extractDomainsFromText(b);
      const aCodes=extractCodes(a), bCodes=extractCodes(b);
      const urgent=/긴급|즉시|오늘만|마감|서둘러/.test(a+b);
      const domainMatch=aDomains.some((d)=>bDomains.includes(d));
      const codeMatch=aCodes.some((d)=>bCodes.includes(d));
      const html = renderMetricRow([
        { label:'주소 비교', value: domainMatch ? '일치 후보' : '차이 있음', note:`사이트 ${aDomains[0]||'-'} · 채널 ${bDomains[0]||'-'}` },
        { label:'코드 비교', value: codeMatch ? '일치 후보' : '재확인 필요', note:`사이트 ${aCodes[0]||'-'} · 채널 ${bCodes[0]||'-'}` },
        { label:'긴급 문구', value: urgent ? '있음' : '낮음', note:'과장 문구 여부' },
        { label:'판단', value: (!domainMatch || !codeMatch || urgent) ? '추가 확인' : '기본 정합', note:'주소 · 코드 · 문구 종합' }
      ]) + section('세부 비교','주소와 코드부터 먼저 봅니다.', `<table class="toolkit-table"><thead><tr><th>항목</th><th>사이트 공지</th><th>채널/후기</th></tr></thead><tbody><tr><td><strong>주소</strong></td><td>${esc(aDomains.join(', ')||'-')}</td><td>${esc(bDomains.join(', ')||'-')}</td></tr><tr><td><strong>코드</strong></td><td>${esc(aCodes.join(', ')||'-')}</td><td>${esc(bCodes.join(', ')||'-')}</td></tr></tbody></table>`) + section('주의 포인트','실전에서 먼저 볼 부분만 남깁니다.', `<ul class="toolkit-points"><li>${!domainMatch ? '주소가 다르게 보이면 공지·채널·공식 안내를 다시 대조해야 합니다.' : '주소는 큰 차이가 적습니다.'}</li><li>${(!codeMatch && aCodes.length && bCodes.length) ? '가입코드가 다르면 운영 주체나 공지 출처를 다시 확인해야 합니다.' : '코드 차이는 크지 않습니다.'}</li><li>${urgent ? '긴급·마감 문구가 섞여 있으면 과장형 안내일 수 있어 주의가 필요합니다.' : '과장형 긴급 문구는 많지 않습니다.'}</li></ul>`);
      setResult(result, html, 'toolkit-result-stack');
    });
  }

  function initAiReportDraft(){
    const form=$('#aireportdraftForm'); const result=$('#aiDraftResult'); if(!form||!result) return;
    bindFormPersistence(form);
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const site=String($('#aiDraftSite')?.value||'').trim()||'-';
      const domain=String($('#aiDraftDomain')?.value||'').trim()||'-';
      const code=String($('#aiDraftCode')?.value||'').trim()||'-';
      const issue=String($('#aiDraftIssue')?.value||'').trim()||'-';
      const story=String($('#aiDraftStory')?.value||'').trim()||'-';
      const evidence=String($('#aiDraftEvidence')?.value||'').trim()||'-';
      if(site==='-' && domain==='-' && story==='-' && evidence==='-') return empty(result,'입력값이 비어 있습니다.','사이트 정보나 사건 설명을 한 개 이상 입력해 주세요.');
      const checklist=[['사이트명',site!=='-'],['주소',domain!=='-'],['가입코드',code!=='-'],['문제 유형',issue!=='-'],['사건 설명',story!=='-'],['증거 요약',evidence!=='-']];
      const draft=`[기본 정보]\n- 사이트명: ${site}\n- 주소: ${domain}\n- 가입코드: ${code}\n- 문제 유형: ${issue}\n\n[사건 개요]\n${story}\n\n[증거 요약]\n${evidence}\n\n[추가 확인 필요]\n- 입금/출금 내역\n- 공지/채널 캡처\n- 대화 내용\n- 주소 변경 여부`;
      const html = section('자료 체크','빠진 항목부터 먼저 봅니다.', `<div class="tool-grid tool-grid--dense">${checklist.map((item)=>`<article class="tool-help-card"><h3>${esc(item[0])}</h3><p>${item[1] ? '입력됨' : '추가 필요'}</p></article>`).join('')}</div>`) + section('복사용 초안','필요한 곳에 그대로 붙여 넣을 수 있게 정리했습니다.', `<div class="tool-output-box"><pre>${esc(draft)}</pre></div>`) + section('실전 메모','추가로 챙기면 좋은 자료입니다.', '<ul class="toolkit-points"><li>입금/출금 내역은 시간 정보가 보이게 캡처해 두는 편이 좋습니다.</li><li>공지·채널·대화 내용은 같은 날짜 기준으로 함께 남기면 정리가 쉬워집니다.</li></ul>');
      setResult(result, html, 'toolkit-result-stack');
    });
  }

  function initAiReviewClassifier(){
    const form=$('#aireviewclassifierForm'); const input=$('#aiReviewInput'); const result=$('#aiReviewResult');
    if(!form||!input||!result) return;
    bindFormPersistence(form);
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const lines=normalizeLines(input.value);
      if(!lines.length) return empty(result,'입력값이 비어 있습니다.','후기 문장을 한 줄에 하나씩 넣어 주세요.');
      const classify=(line)=>{
        const ad=/무조건|보장|레전드|이벤트|지급|혜택|추천|문의/.test(line);
        const copy=/복붙|동일|반복/.test(line) || /(ㅋㅋ|ㅎㅎ|!!){2,}/.test(line) || line.length<12;
        const real=/입금|출금|응답|지연|처리|시간|캡처|상담/.test(line);
        if(ad && !real) return '광고형';
        if(copy && !real) return '복붙형';
        return '실사용형';
      };
      const rows=lines.map((line)=>({ line, label: classify(line) }));
      const counts=rows.reduce((acc,row)=>{ acc[row.label]=(acc[row.label]||0)+1; return acc; },{});
      const html = renderMetricRow([
        { label:'실사용형', value:String(counts['실사용형']||0), note:'구체 정보 포함' },
        { label:'광고형', value:String(counts['광고형']||0), note:'혜택·홍보 중심' },
        { label:'복붙형', value:String(counts['복붙형']||0), note:'짧고 반복적인 문체' },
        { label:'총 문장', value:String(rows.length), note:'입력 기준' }
      ]) + section('문장 분류','문장별 분류 결과를 먼저 봅니다.', `<table class="toolkit-table"><thead><tr><th>문장</th><th>분류</th></tr></thead><tbody>${rows.map((row)=>`<tr><td>${esc(row.line)}</td><td>${esc(row.label)}</td></tr>`).join('')}</tbody></table>`) + section('짧은 판단','분류 비율만으로 확정하지 말고 근거와 함께 보세요.', `<ul class="toolkit-points"><li>${(counts['광고형']||0) >= Math.max(1, rows.length/2) ? '광고형 문장이 많아 과장 표현 비중이 높아 보입니다.' : '광고형 비중은 과도하지 않습니다.'}</li><li>${(counts['복붙형']||0) ? '짧고 반복적인 문체가 보여 복붙 가능성을 같이 확인하는 편이 좋습니다.' : '복붙형 문장은 많지 않습니다.'}</li><li>${(counts['실사용형']||0) ? '입금/출금·응답·시간 정보가 있으면 실사용형 문장으로 먼저 분류됩니다.' : '구체적인 실사용 근거 문장은 많지 않습니다.'}</li></ul>`);
      setResult(result, html, 'toolkit-result-stack');
    });
  }

  function initAiRulesInterpreter(){
    const form=$('#airulesinterpreterForm'); const input=$('#aiRulesInput'); const result=$('#aiRulesResult');
    if(!form||!input||!result) return;
    bindFormPersistence(form);
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const raw=String(input.value||'').trim();
      if(!raw) return empty(result,'입력값이 비어 있습니다.','규정 문구를 붙여 넣어 주세요.');
      const rolling=(raw.match(/(\d+(?:\.\d+)?)\s*배/)||[])[1]||'-';
      const maxWithdraw=(raw.match(/최대\s*출금[^\d]*(\d[\d,]*)/)||[])[1]||'-';
      const minBet=(raw.match(/최소\s*베팅[^\d]*(\d[\d,]*)/)||[])[1]||'-';
      const riskHits=['양방','몰수','제한','회수','환수','관리자','심사'].filter((word)=>raw.includes(word));
      const burden = clamp((rolling !== '-' ? Number(rolling) * 10 : 20) + (maxWithdraw !== '-' ? 8 : 0) + riskHits.length * 7, 0, 100);
      const html = renderMetricRow([
        { label:'롤링 배수', value: rolling === '-' ? '-' : `${rolling}배`, note:'추출 기준' },
        { label:'최대 출금', value: maxWithdraw === '-' ? '-' : `${maxWithdraw}원`, note:'문구 추출 기준' },
        { label:'최소 베팅', value: minBet === '-' ? '-' : `${minBet}원`, note:'문구 추출 기준' },
        { label:'주의도', value: toolRiskLabel(burden), note:`키워드 ${riskHits.length}개` }
      ]) + section('주의 문구','규정 안에서 자주 주의가 필요한 표현입니다.', `<ul class="toolkit-points">${(riskHits.length ? riskHits : ['큰 제한 키워드는 많지 않습니다.']).map((item)=>`<li>${esc(item)}</li>`).join('')}</ul>`) + section('실전 메모','규정은 숫자보다 제한 표현을 같이 봐야 합니다.', `<ul class="toolkit-points"><li>${rolling === '-' ? '롤링 배수를 직접 못 찾았습니다. 원문 문구를 다시 확인해 주세요.' : `롤링 ${rolling}배 기준이면 실제 충족 부담을 같이 계산하는 편이 좋습니다.`}</li><li>${maxWithdraw === '-' ? '최대 출금 제한은 직접 명시되지 않았거나 찾기 어렵습니다.' : `최대 출금 ${maxWithdraw}원 제한은 실수령 금액을 직접 깎을 수 있습니다.`}</li><li>${riskHits.length ? '양방·몰수·제한·회수 표현이 보이면 회수 가능성과 제한 조건을 더 보수적으로 봐야 합니다.' : '큰 제한 키워드는 적지만 세부 규정은 끝까지 확인하는 편이 좋습니다.'}</li></ul>`);
      setResult(result, html, 'toolkit-result-stack');
    });
  }

  function init(){
    initInlineCopy();
    initResultCopy();
    initAddressTracker();
    initSimilarDomain();
    initSearchPack();
    initEvidenceBundle();
    initClusterTool();
    initOfficialCheck();
    initReportTemplate();
    initRiskCompare();
    initAddressConsistency();
    initChangeTimeline();
    initRelationshipMap();
    initNoticeReview();
    initReportPackager();
    initBonusPolicy();
    initSlipCompare();
    initBankrollPlanner();
    initAiDomainAnalysis();
    initAiSportsOddsAnalysis();
    initAiNoticeCheck();
    initAiReportDraft();
    initAiReviewClassifier();
    initAiRulesInterpreter();
    initAiGameLab();
    initAiConditionLab();
    initOuCalculator();
    initHandicapProfit();
    initSlotSession();
    initMinigameRounds();
    initToolsHubShortcuts();
    initMainShortcuts();
    initToolsHubNavigation();
    initToolsDomainDesk();
    initToolsOddsDesk();
    initToolsBonusDesk();
    initToolsLogbook();
    initToolsPattern();
    initToolsReplyHelper();
    initToolsLinkManager();
    initToolsSettlement();
    initToolsBankrollSim();
    initToolsTemplateFavorites();
    initToolsConditionCompare();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
