
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


  function fmtWon(value){ const n=Number(value||0); return `${Math.round(n).toLocaleString()}원`; }
  function verdictBand(score){ if(score>=75) return '양호'; if(score>=45) return '주의'; return '경계'; }
  function classifyReviewLine(line=''){ const t=String(line||'').trim(); if(!t) return '정황부족'; const promo=/(메이저|안전|검증완료|추천|최고|무조건|절대|이벤트|보장)/i.test(t); const evidence=/(입금|출금|환전|캡처|증거|시간|날짜|금액|계좌|문의)/i.test(t); const duplicate=/(ㅋㅋ|ㅎㅎ|!!!|굿|짱|추천합니다)/.test(t) || t.length < 10; if(evidence && !promo) return '실사용형'; if(promo && duplicate) return '복붙형'; if(promo) return '홍보형'; return '정황부족'; }
  function calcProfit(stake, odds){ const s=Number(stake||0), o=Number(odds||0); if(!s||!o) return { payout:0, profit:0 }; const payout=s*o; return { payout, profit:payout-s }; }

  function initAiNoticeCheck(){ const form=$('#ainoticecheckForm'); const result=$('#aiNoticeResult'); const official=$('#aiNoticeOfficial'); const channel=$('#aiNoticeChannel'); if(!form||!result||!official||!channel) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const a=String(official.value||'').trim(); const b=String(channel.value||'').trim(); if(!a||!b) return empty(result,'입력값이 비어 있습니다.','두 공지를 모두 넣어 주세요.'); const aDomains=extractDomainsFromText(a), bDomains=extractDomainsFromText(b); const aCodes=extractCodes(a), bCodes=extractCodes(b); const domainMatch=aDomains.some((v)=>bDomains.includes(v)); const codeMatch=!aCodes.length||!bCodes.length?true:aCodes.some((v)=>bCodes.includes(v)); let score=70; if(domainMatch) score+=15; else score-=20; if(codeMatch) score+=10; else score-=15; if(/긴급|즉시|오늘만|마감임박/.test(a+b)) score-=10; if(/리뉴얼|변경|신규주소/.test(a+b)) score-=5; const warnings=[]; if(!domainMatch) warnings.push('주소 표기가 일치하지 않습니다.'); if(!codeMatch) warnings.push('가입코드가 다르게 보입니다.'); if(/긴급|즉시|오늘만|마감임박/.test(a+b)) warnings.push('긴급 유도 문구가 있습니다.'); if(warnings.length===0) warnings.push('큰 불일치는 적습니다.'); const html=section('핵심 판정','공지 두 장을 한 번에 봅니다.', `<div class="score-shell"><div class="score-top"><div><div class="score-big">${esc(score)}</div><span class="score-band">${esc(verdictBand(score))}</span></div><div class="score-meta"><h2 class="score-title">AI 공지 검토</h2><p>주소와 코드, 긴급 유도 문구를 먼저 봤습니다.</p></div></div><div class="score-bar"><span style="width:${Math.max(0,Math.min(100,score))}%"></span></div></div>`) + section('주의 포인트','짧게만 남깁니다.', `<ul class="toolkit-list">${warnings.map((w)=>`<li><div><strong>${esc(w)}</strong></div></li>`).join('')}</ul><div class="toolkit-note">사이트 공지: ${esc(aDomains.join(', ')||'-')} / 채널 공지: ${esc(bDomains.join(', ')||'-')}</div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initAiReviewClassifier(){ const form=$('#aireviewclassifierForm'); const result=$('#aiReviewResult'); const input=$('#aiReviewInput'); if(!form||!result||!input) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const lines=normalizeLines(input.value); if(!lines.length) return empty(result,'입력값이 비어 있습니다.','후기 문장을 한 줄에 하나씩 넣어 주세요.'); const counts={복붙형:0, 홍보형:0, 실사용형:0, 정황부족:0}; lines.forEach((line)=>{ counts[classifyReviewLine(line)] += 1; }); const detail=lines.slice(0,8).map((line)=>({title: classifyReviewLine(line), detail: line})); const html=section('분류 결과','많이 보이는 패턴만 모았습니다.', `<div class="score-grid"><div class="score-metric"><span>복붙형</span><strong>${counts['복붙형']}개</strong></div><div class="score-metric"><span>홍보형</span><strong>${counts['홍보형']}개</strong></div><div class="score-metric"><span>실사용형</span><strong>${counts['실사용형']}개</strong></div><div class="score-metric"><span>정황부족</span><strong>${counts['정황부족']}개</strong></div></div>`) + section('예시','일부만 보여줍니다.', listCard(detail)); setResult(result, html, 'toolkit-result-stack'); }); }
  function initAiReportDraft(){ const form=$('#aireportdraftForm'); const result=$('#aiDraftResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const site=$('#aiDraftSite')?.value?.trim()||'-'; const domain=$('#aiDraftDomain')?.value?.trim()||'-'; const code=$('#aiDraftCode')?.value?.trim()||'-'; const issue=$('#aiDraftIssue')?.value?.trim()||'-'; const story=$('#aiDraftStory')?.value?.trim()||'-'; const evidence=$('#aiDraftEvidence')?.value?.trim()||'-'; if(site==='-'&&story==='-') return empty(result,'입력값이 비어 있습니다.','사이트명과 상황 설명을 넣어 주세요.'); const draft=`안녕하세요. ${site} 관련 문의드립니다.

- 주소: ${domain}
- 가입코드: ${code}
- 문제 유형: ${issue}

[상황 요약]
${story}

[증거 요약]
${evidence}

확인 부탁드립니다.`; const html=section('정리 결과','바로 전달할 수 있습니다.', `<div class="toolkit-copy-box"><pre>${esc(draft)}</pre><div class="toolkit-actions"><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(draft)}">텍스트 복사</button></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initAiRulesInterpreter(){ const form=$('#airulesinterpreterForm'); const result=$('#aiRulesResult'); const input=$('#aiRulesInput'); if(!form||!result||!input) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const raw=String(input.value||'').trim(); if(!raw) return empty(result,'입력값이 비어 있습니다.','규정 문구를 붙여 넣어 주세요.'); const percent=(raw.match(/(\d+(?:\.\d+)?)\s*%/)||[])[1]||'-'; const rolling=(raw.match(/롤링[^0-9]{0,6}(\d+(?:\.\d+)?)/)||[])[1]||'-'; const flags=[]; ['양방','계정공유','규정변경','최대출금','롤링','졸업','보유중'].forEach((word)=>{ if(raw.includes(word)) flags.push(word); }); const html=section('핵심 항목','긴 문장을 먼저 압축합니다.', `<div class="score-grid"><div class="score-metric"><span>퍼센트</span><strong>${esc(percent==='-'?'-':percent+'%')}</strong></div><div class="score-metric"><span>롤링</span><strong>${esc(rolling==='-'?'-':rolling+'배')}</strong></div><div class="score-metric"><span>핵심 단어</span><strong>${esc(flags.slice(0,3).join(' · ')||'-')}</strong></div><div class="score-metric"><span>문장 수</span><strong>${normalizeLines(raw).length}줄</strong></div></div>`) + section('주의 포인트','짧게만 남깁니다.', `<div class="toolkit-note">규정 변경, 양방 금지, 최대 출금 제한이 같이 보이면 실제 수령액이 줄 수 있습니다.</div>`); setResult(result, html, 'toolkit-result-stack'); }); }

  function initOuPayout(){ const form=$('#oupayoutForm'); const result=$('#ouPayoutResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const line=Number($('#ouLine')?.value||0); const odds=Number($('#ouOdds')?.value||0); const stake=Number($('#ouStake')?.value||0); const total=Number($('#ouTotal')?.value||0); const side=$('#ouSide')?.value||'over'; if(!odds||!stake) return empty(result,'입력값이 비어 있습니다.','배당과 금액을 먼저 입력해 주세요.'); const diff=total-line; const status=diff===0?'적특':((side==='over'&&diff>0)||(side==='under'&&diff<0)?'적중':'미적중'); const calc=status==='적중'?calcProfit(stake,odds):{ payout: status==='적특'?stake:0, profit: status==='적특'?0:-stake }; const html=section('결과','기준점 대비로 계산합니다.', `<div class="score-grid"><div class="score-metric"><span>판정</span><strong>${esc(status)}</strong></div><div class="score-metric"><span>반환금</span><strong>${fmtWon(calc.payout)}</strong></div><div class="score-metric"><span>손익</span><strong>${fmtWon(calc.profit)}</strong></div><div class="score-metric"><span>차이</span><strong>${esc(diff.toFixed(2))}</strong></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initHandicapPayout(){ const form=$('#handicappayoutForm'); const result=$('#handicapResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const side=$('#hdpSide')?.value||'home'; const line=Number($('#hdpLine')?.value||0); const odds=Number($('#hdpOdds')?.value||0); const stake=Number($('#hdpStake')?.value||0); const home=Number($('#hdpHome')?.value||0); const away=Number($('#hdpAway')?.value||0); if(!odds||!stake) return empty(result,'입력값이 비어 있습니다.','배당과 금액을 먼저 입력해 주세요.'); const base=side==='home'?home-away:away-home; const adjusted=base+line; const status=adjusted===0?'적특':(adjusted>0?'적중':'미적중'); const calc=status==='적중'?calcProfit(stake,odds):{ payout: status==='적특'?stake:0, profit: status==='적특'?0:-stake }; const html=section('결과','선택 팀 기준으로 계산합니다.', `<div class="score-grid"><div class="score-metric"><span>판정</span><strong>${esc(status)}</strong></div><div class="score-metric"><span>조정 점수차</span><strong>${esc(adjusted.toFixed(2))}</strong></div><div class="score-metric"><span>반환금</span><strong>${fmtWon(calc.payout)}</strong></div><div class="score-metric"><span>손익</span><strong>${fmtWon(calc.profit)}</strong></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initLinePayout(){ const form=$('#linepayoutForm'); const result=$('#lineResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const value=Number($('#lineValue')?.value||0); const point=Number($('#linePoint')?.value||0); const side=$('#lineSide')?.value||'over'; const odds=Number($('#lineOdds')?.value||0); const stake=Number($('#lineStake')?.value||0); if(!odds||!stake) return empty(result,'입력값이 비어 있습니다.','배당과 금액을 먼저 입력해 주세요.'); const diff=value-point; const status=diff===0?'기준값 일치':((side==='over'&&diff>0)||(side==='under'&&diff<0)?'적중':'미적중'); const calc=status==='적중'?calcProfit(stake,odds):{ payout: status==='기준값 일치'?stake:0, profit: status==='기준값 일치'?0:-stake }; const html=section('결과','임의 기준값 기준입니다.', `<div class="score-grid"><div class="score-metric"><span>판정</span><strong>${esc(status)}</strong></div><div class="score-metric"><span>차이</span><strong>${esc(diff.toFixed(2))}</strong></div><div class="score-metric"><span>반환금</span><strong>${fmtWon(calc.payout)}</strong></div><div class="score-metric"><span>손익</span><strong>${fmtWon(calc.profit)}</strong></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initOddsBand(){ const form=$('#oddsbandForm'); const result=$('#oddsBandResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const odds=Number($('#oddsBandValue')?.value||0); const stake=Number($('#oddsBandStake')?.value||0); if(!odds) return empty(result,'입력값이 비어 있습니다.','배당을 먼저 입력해 주세요.'); let band='고배당', note='변동성이 큽니다.'; if(odds<1.4){ band='저배당'; note='적중 기대는 높지만 수익 폭은 작습니다.'; } else if(odds<1.8){ band='중저배당'; note='보수형 접근에 자주 쓰이는 구간입니다.'; } else if(odds<2.3){ band='중배당'; note='위험과 수익이 같이 올라갑니다.'; } const calc=stake?calcProfit(stake,odds):{payout:0,profit:0}; const html=section('구간 해석','배당대 성격을 먼저 봅니다.', `<div class="score-grid"><div class="score-metric"><span>구간</span><strong>${esc(band)}</strong></div><div class="score-metric"><span>예상 반환금</span><strong>${stake?fmtWon(calc.payout):'-'}</strong></div><div class="score-metric"><span>예상 수익</span><strong>${stake?fmtWon(calc.profit):'-'}</strong></div><div class="score-metric"><span>메모</span><strong>${esc(note)}</strong></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }

  function initSlotRtp(){ const form=$('#slotrtpForm'); const result=$('#slotRtpResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const rtp=Number($('#slotRtp')?.value||0); const vol=$('#slotVol')?.value||'mid'; const bankroll=Number($('#slotBankroll')?.value||0); const minutes=Number($('#slotMinutes')?.value||0); if(!rtp||!bankroll) return empty(result,'입력값이 비어 있습니다.','RTP와 자금을 먼저 입력해 주세요.'); let band='보통', note='무난한 구간입니다.'; if(rtp>=97 && vol==='low'){ band='안정'; note='긴 시간 분산형에 더 맞습니다.'; } else if(vol==='high' || rtp<95){ band='변동 큼'; note='짧게 써도 흔들림이 클 수 있습니다.'; } const burn=bankroll/Math.max(1, minutes||30); const html=section('해석 결과','RTP와 변동성을 같이 봅니다.', `<div class="score-grid"><div class="score-metric"><span>판정</span><strong>${esc(band)}</strong></div><div class="score-metric"><span>예산 소모</span><strong>${Math.round(burn).toLocaleString()}원/분</strong></div><div class="score-metric"><span>RTP</span><strong>${esc(rtp.toFixed(2))}%</strong></div><div class="score-metric"><span>변동성</span><strong>${esc(vol==='low'?'낮음':vol==='mid'?'중간':'높음')}</strong></div></div><div class="toolkit-note">${esc(note)}</div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initBaccaratBankroll(){ const form=$('#baccaratbankrollForm'); const result=$('#baccaratResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const total=Number($('#baccaratTotal')?.value||0); const unit=Number($('#baccaratUnit')?.value||0); const stop=Number($('#baccaratStop')?.value||0); const target=Number($('#baccaratTarget')?.value||0); const rounds=Number($('#baccaratRounds')?.value||0); if(!total||!unit) return empty(result,'입력값이 비어 있습니다.','총 자금과 기준 베팅금을 넣어 주세요.'); const usable=Math.max(0,total-stop); const possible=Math.floor(usable/Math.max(1,unit)); const per=Math.floor(usable/Math.max(1,rounds||10)); const html=section('운영 결과','손절선 먼저 고정합니다.', `<div class="score-grid"><div class="score-metric"><span>사용 가능</span><strong>${fmtWon(usable)}</strong></div><div class="score-metric"><span>가능 횟수</span><strong>${possible}회</strong></div><div class="score-metric"><span>회차 예산</span><strong>${fmtWon(per)}</strong></div><div class="score-metric"><span>목표금</span><strong>${fmtWon(target)}</strong></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initMinigameRoundPlanner(){ const form=$('#minigameroundplannerForm'); const result=$('#minigamePlannerResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const total=Number($('#miniTotal')?.value||0); const unit=Number($('#miniUnit')?.value||0); const rounds=Number($('#miniRounds')?.value||0); const stop=Number($('#miniStop')?.value||0); const style=$('#miniStyle')?.value||'flat'; if(!total||!unit||!rounds) return empty(result,'입력값이 비어 있습니다.','총 자금, 기준금, 회차 수를 넣어 주세요.'); const usable=Math.max(0,total-stop); const per=Math.floor(usable/Math.max(1,rounds)); const recommend = style==='step' ? [1,1,1.5,1.5,2].map((m,i)=>`${i+1}회 ${fmtWon(unit*m)}`).join(' · ') : style==='split' ? [1,0.8,0.8,1.2,1.2].map((m,i)=>`${i+1}회 ${fmtWon(unit*m)}`).join(' · ') : [1,1,1,1,1].map((m,i)=>`${i+1}회 ${fmtWon(unit*m)}`).join(' · '); const html=section('회차 계획','초반 과열을 줄이는 기준입니다.', `<div class="score-grid"><div class="score-metric"><span>사용 가능</span><strong>${fmtWon(usable)}</strong></div><div class="score-metric"><span>회차당 예산</span><strong>${fmtWon(per)}</strong></div><div class="score-metric"><span>기준금 비율</span><strong>${Math.round((unit/Math.max(1,total))*100)}%</strong></div><div class="score-metric"><span>운영 방식</span><strong>${esc(style==='flat'?'고정':style==='step'?'단계':'분산')}</strong></div></div>`) + section('초기 5회 예시','짧게만 봅니다.', `<div class="toolkit-note">${esc(recommend)}</div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initStageRisk(){ const form=$('#stageriskForm'); const result=$('#stageRiskResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const base=Number($('#stageBase')?.value||0); const mult=Number($('#stageMult')?.value||0); const count=Number($('#stageCount')?.value||0); const bankroll=Number($('#stageBankroll')?.value||0); if(!base||!mult||!count||!bankroll) return empty(result,'입력값이 비어 있습니다.','시작 금액, 배수, 단계 수, 자금을 넣어 주세요.'); let need=0; let current=base; for(let i=0;i<count;i++){ need+=current; current*=mult; } const ratio=Math.round((need/Math.max(1,bankroll))*100); const band=ratio>80?'매우 높음':ratio>50?'높음':ratio>25?'보통':'낮음'; const html=section('위험도 결과','단계 누적 자금을 먼저 봅니다.', `<div class="score-grid"><div class="score-metric"><span>필요 총액</span><strong>${fmtWon(need)}</strong></div><div class="score-metric"><span>자금 대비</span><strong>${ratio}%</strong></div><div class="score-metric"><span>판정</span><strong>${esc(band)}</strong></div><div class="score-metric"><span>마지막 단계</span><strong>${fmtWon(current/mult)}</strong></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }

  function initRollingCalculator(){ const form=$('#rollingcalculatorForm'); const result=$('#rollingCalcResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const deposit=Number($('#rollDeposit')?.value||0); const bonus=Number($('#rollBonus')?.value||0); const mult=Number($('#rollMultiplier')?.value||0); if(!deposit||!mult) return empty(result,'입력값이 비어 있습니다.','충전금과 롤링 배수를 넣어 주세요.'); const total=deposit+bonus; const need=total*mult; const html=section('계산 결과','총 사용금 기준입니다.', `<div class="score-grid"><div class="score-metric"><span>총 사용금</span><strong>${fmtWon(total)}</strong></div><div class="score-metric"><span>필요 롤링</span><strong>${fmtWon(need)}</strong></div><div class="score-metric"><span>배수</span><strong>${esc(mult)}배</strong></div><div class="score-metric"><span>보너스</span><strong>${fmtWon(bonus)}</strong></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initWithdrawLimit(){ const form=$('#withdrawlimitForm'); const result=$('#withdrawLimitResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const deposit=Number($('#limitDeposit')?.value||0); const bonus=Number($('#limitBonus')?.value||0); const current=Number($('#limitCurrent')?.value||0); const limit=Number($('#limitMax')?.value||0); if(!current||!limit) return empty(result,'입력값이 비어 있습니다.','현재 잔액과 최대 출금 값을 넣어 주세요.'); const totalBase=deposit+bonus; const effective=Math.min(current,limit); const blocked=Math.max(0,current-effective); const html=section('제한 반영','실제 가져갈 수 있는 값만 봅니다.', `<div class="score-grid"><div class="score-metric"><span>현재 잔액</span><strong>${fmtWon(current)}</strong></div><div class="score-metric"><span>최대 출금</span><strong>${fmtWon(limit)}</strong></div><div class="score-metric"><span>실수령 기준</span><strong>${fmtWon(effective)}</strong></div><div class="score-metric"><span>제한분</span><strong>${fmtWon(blocked)}</strong></div></div><div class="toolkit-note">기준 원금+보너스 ${fmtWon(totalBase)} / 최대 출금 제한이 붙으면 실제 체감 수익이 줄 수 있습니다.</div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initFirstBonus(){ const form=$('#firstbonusForm'); const result=$('#firstBonusResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const deposit=Number($('#firstDeposit')?.value||0); const percent=Number($('#firstPercent')?.value||0); const cap=Number($('#firstCap')?.value||0); const rolling=Number($('#firstRolling')?.value||0); const max=Number($('#firstMax')?.value||0); if(!deposit||!percent) return empty(result,'입력값이 비어 있습니다.','충전금과 퍼센트를 넣어 주세요.'); const bonus=Math.min(deposit*(percent/100), cap||Infinity); const total=deposit+bonus; const need=total*rolling; const effective=max?Math.min(total,max):total; const html=section('첫충 계산','조건 숫자만 먼저 봅니다.', `<div class="score-grid"><div class="score-metric"><span>보너스</span><strong>${fmtWon(bonus)}</strong></div><div class="score-metric"><span>총 사용금</span><strong>${fmtWon(total)}</strong></div><div class="score-metric"><span>필요 롤링</span><strong>${fmtWon(need)}</strong></div><div class="score-metric"><span>최대 수령</span><strong>${fmtWon(effective)}</strong></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initRecurringBonus(){ const form=$('#recurringbonusForm'); const result=$('#recurringBonusResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const deposit=Number($('#repeatDeposit')?.value||0); const percent=Number($('#repeatPercent')?.value||0); const cap=Number($('#repeatCap')?.value||0); const rolling=Number($('#repeatRolling')?.value||0); const max=Number($('#repeatMax')?.value||0); if(!deposit||!percent) return empty(result,'입력값이 비어 있습니다.','충전금과 퍼센트를 넣어 주세요.'); const bonus=Math.min(deposit*(percent/100), cap||Infinity); const total=deposit+bonus; const need=total*rolling; const effective=max?Math.min(total,max):total; const html=section('매충 계산','조건 숫자만 먼저 봅니다.', `<div class="score-grid"><div class="score-metric"><span>보너스</span><strong>${fmtWon(bonus)}</strong></div><div class="score-metric"><span>총 사용금</span><strong>${fmtWon(total)}</strong></div><div class="score-metric"><span>필요 롤링</span><strong>${fmtWon(need)}</strong></div><div class="score-metric"><span>최대 수령</span><strong>${fmtWon(effective)}</strong></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }

  function initReviewPattern(){ const form=$('#reviewpatternForm'); const result=$('#reviewPatternResult'); const input=$('#reviewPatternInput'); if(!form||!result||!input) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const lines=normalizeLines(input.value); if(!lines.length) return empty(result,'입력값이 비어 있습니다.','후기 문장을 한 줄에 하나씩 넣어 주세요.'); const groups={복붙형:[], 홍보형:[], 실사용형:[], 정황부족:[]}; lines.forEach((line)=>groups[classifyReviewLine(line)].push(line)); const html=section('분류 결과','많이 보이는 패턴만 봅니다.', `<div class="score-grid">${Object.entries(groups).map(([k,v])=>`<div class="score-metric"><span>${esc(k)}</span><strong>${v.length}개</strong></div>`).join('')}</div>`) + section('대표 예시','일부만 보여줍니다.', listCard(Object.entries(groups).filter(([,v])=>v.length).map(([k,v])=>({title:k, detail:v[0]})))); setResult(result, html, 'toolkit-result-stack'); }); }
  function initCommunitySummary(){ const form=$('#communitysummaryForm'); const result=$('#communitySummaryResult'); const input=$('#communitySummaryInput'); if(!form||!result||!input) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const lines=normalizeLines(input.value); if(!lines.length) return empty(result,'입력값이 비어 있습니다.','게시물 제목이나 댓글을 붙여 넣어 주세요.'); const counts={경고:0, 문의:0, 후기:0, 홍보:0}; lines.forEach((line)=>{ if(/먹튀|지연|거절|추가입금|차단|주의/.test(line)) counts['경고'] += 1; else if(/문의|주소|어디|알려/.test(line)) counts['문의'] += 1; else if(/후기|출금|이용/.test(line)) counts['후기'] += 1; else counts['홍보'] += 1; }); const summary=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || '중립'; const html=section('반응 요약','핵심 흐름만 남깁니다.', `<div class="score-grid">${Object.entries(counts).map(([k,v])=>`<div class="score-metric"><span>${esc(k)}</span><strong>${v}개</strong></div>`).join('')}</div><div class="toolkit-note">현재 입력 기준으로는 ${esc(summary)} 성격이 가장 많이 보입니다.</div>`); setResult(result, html, 'toolkit-result-stack'); }); }

  function initBrandChangeTracker(){ const form=$('#brandchangetrackerForm'); const result=$('#brandChangeResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const oldName=$('#brandOld')?.value?.trim()||''; const newName=$('#brandNew')?.value?.trim()||''; const raw=$('#brandTimelineInput')?.value?.trim()||''; if(!oldName||!newName||!raw) return empty(result,'입력값이 비어 있습니다.','이전 이름, 현재 이름, 기록을 넣어 주세요.'); const lines=normalizeLines(raw); const score=similarity(oldName.toLowerCase(), newName.toLowerCase()); const domains=extractDomainsFromText(raw); const html=section('변경 흐름','기록을 시간순으로 봅니다.', `<div class="timeline-list">${lines.map((line, idx)=>`<article class="timeline-entry"><span class="mini-badge">기록 ${idx+1}</span><strong>${esc(/변경|리뉴얼/.test(line)?'변경':'참고')}</strong><p>${esc(line)}</p></article>`).join('')}</div>`) + section('핵심 메모','이름과 주소를 같이 봅니다.', `<div class="score-grid"><div class="score-metric"><span>이름 유사도</span><strong>${score}</strong></div><div class="score-metric"><span>주소 수</span><strong>${domains.length}개</strong></div><div class="score-metric"><span>이전 이름</span><strong>${esc(oldName)}</strong></div><div class="score-metric"><span>현재 이름</span><strong>${esc(newName)}</strong></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initPriorBrandDetector(){ const form=$('#priorbranddetectorForm'); const result=$('#priorBrandResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const current=$('#priorCurrent')?.value?.trim()||''; const hints=$('#priorHints')?.value?.trim()||''; if(!current||!hints) return empty(result,'입력값이 비어 있습니다.','현재 값과 과거 흔적을 같이 넣어 주세요.'); const hintDomains=extractDomainsFromText(hints); const codes=extractCodes(hints); let score=hintDomains.length*18 + codes.length*10 + (/이전|리뉴얼|같은|유사|변경/.test(hints)?18:0); score=Math.min(100,score); const html=section('탐지 결과','확정이 아니라 흔적 위주입니다.', `<div class="score-shell"><div class="score-top"><div><div class="score-big">${score}</div><span class="score-band">흔적 ${esc(badgeBand(score))}</span></div><div class="score-meta"><h2 class="score-title">${esc(current)}</h2><p>과거 흔적에서 도메인·코드·변경 문구를 먼저 봤습니다.</p></div></div><div class="score-bar"><span style="width:${score}%"></span></div></div><div class="toolkit-note">도메인: ${esc(hintDomains.join(', ')||'-')} / 코드: ${esc(codes.join(', ')||'-')}</div>`); setResult(result, html, 'toolkit-result-stack'); }); }
  function initAddressHistoryCard(){ const form=$('#addresshistorycardForm'); const result=$('#addressHistoryCardResult'); if(!form||!result) return; form.addEventListener('submit',(e)=>{ e.preventDefault(); const site=$('#historySite')?.value?.trim()||'-'; const current=$('#historyCurrent')?.value?.trim()||'-'; const prev=normalizeLines($('#historyPrevious')?.value||''); const notes=$('#historyNotes')?.value?.trim()||'-'; if(site==='-'||current==='-') return empty(result,'입력값이 비어 있습니다.','사이트명과 현재 주소를 먼저 넣어 주세요.'); const card=`[주소 이력]
사이트명: ${site}
현재 주소: ${current}
이전 주소:
${prev.map((line)=>`- ${line}`).join('\n') || '- 없음'}
메모: ${notes}`; const html=section('이력 카드','복사해서 바로 쓸 수 있습니다.', `<div class="toolkit-copy-box"><pre>${esc(card)}</pre><div class="toolkit-actions"><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(card)}">텍스트 복사</button></div></div>`); setResult(result, html, 'toolkit-result-stack'); }); }

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
    initAddressConsistency();
    initChangeTimeline();
    initRelationshipMap();
    initNoticeReview();
    initReportPackager();
    initBonusPolicy();
    initSlipCompare();
    initBankrollPlanner();
    initAiNoticeCheck();
    initAiReviewClassifier();
    initAiReportDraft();
    initAiRulesInterpreter();
    initOuPayout();
    initHandicapPayout();
    initLinePayout();
    initOddsBand();
    initSlotRtp();
    initBaccaratBankroll();
    initMinigameRoundPlanner();
    initStageRisk();
    initRollingCalculator();
    initWithdrawLimit();
    initFirstBonus();
    initRecurringBonus();
    initReviewPattern();
    initCommunitySummary();
    initBrandChangeTracker();
    initPriorBrandDetector();
    initAddressHistoryCard();
    initToolsHubShortcuts();
    initMainShortcuts();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
