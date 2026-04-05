
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
  function checkedValues(form, name){ return $$(`input[name="${name}"]:checked`, form).map((el)=>el.value); }
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

  const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));
  function toolRiskLabel(score=0){ const n=Number(score)||0; if(n>=75) return '높음'; if(n>=45) return '보통'; return '낮음'; }
  function cardsHtml(cards=[]){ return `<div class="score-grid">${(cards||[]).map((item)=>`<div class="score-metric"><span>${esc(item.label||item.title||'-')}</span><strong>${esc(item.value||item.detail||'-')}</strong><small>${esc(item.note||'')}</small></div>`).join('')}</div>`; }
  function engineSet(target, title, cards=[], notes=[], extra=''){
    const html = `<div class="toolkit-result-stack">${section(title,'',cardsHtml(cards))}${notes&&notes.length?section('실전 메모','',`<ul class="toolkit-points">${notes.map((note)=>`<li>${esc(note)}</li>`).join('')}</ul>`):''}${extra||''}</div>`;
    setResult(target, html, 'toolkit-result-stack');
  }
  function engineSportsStudy({ market='moneyline', odds=[], capital=0, mode='neutral', labels=[] }={}){
    const engines = window.RavenEngines || {};
    const fair = engines.fairProbability ? engines.fairProbability({ odds, market }) : { odds:(odds||[]).map((v)=>Number(v)).filter((v)=>Number.isFinite(v)&&v>=1.02), fairProbabilities:[], fairOdds:[], margin:0 };
    const cleanOdds = fair.odds || [];
    const named = cleanOdds.map((odd, idx)=>{
      const prob = fair.fairProbabilities?.[idx] || 0;
      const label = labels[idx] || `선택 ${idx+1}`;
      const ev = engines.expectedValue ? engines.expectedValue({ probability: prob, odds: odd, stake: capital || 1 }) : { evRate:0, label:'보통' };
      return { label, odd, prob, fairOdds: fair.fairOdds?.[idx] || 0, ev };
    });
    const bestProb = named.slice().sort((a,b)=>b.prob-a.prob)[0] || { label:'-', prob:0, fairOdds:0 };
    const bestEdge = named.slice().sort((a,b)=>b.ev.evRate-a.ev.evRate)[0] || { label:'-', ev:{ evRate:0, label:'중립' }, odd:0, prob:0 };
    const vol = engines.volatilityRisk ? engines.volatilityRisk({ probability: bestProb.prob || bestEdge.prob || 0, odds: bestEdge.odd || cleanOdds[0] || 1.9, stake: capital || 1, plays: cleanOdds.length || 1 }) : { volatilityScore:0, grade:'낮음' };
    const bankroll = engines.bankrollPlan ? engines.bankrollPlan({ capital: capital || 0, probability: bestEdge.prob || bestProb.prob || 0.5, odds: bestEdge.odd || cleanOdds[0] || 1.9, mode: mode === 'safe' ? 'safe' : mode === 'aggressive' ? 'aggressive' : 'neutral', volatilityScore: vol.volatilityScore || 0 }) : { amount:0, ratio:0, label:'보수' };
    return { fair, outcomes:named, bestProb, bestEdge, volatilityLabel:vol.grade||'낮음', volatilityScore:vol.volatilityScore||0, bankroll };
  }
  function detectKeywordLines(text='', patterns=[]){
    const rows = normalizeLines(text);
    return rows.filter((row)=>patterns.some((re)=>re.test(row)));
  }
  function initNoticeReview(){
    const form=$('#noticereviewForm'); const mainInput=$('#noticeMainInput'); const sideInput=$('#noticeSideInput'); const result=$('#noticeReviewResult'); if(!form||!mainInput||!sideInput||!result) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const modes=checkedValues(form,'noticeMode');
      if(!modes.length) return empty(result,'선택이 비어 있습니다.','실행할 항목을 하나 이상 선택해 주세요.');
      const mainText=String(mainInput.value||'').trim(); const sideText=String(sideInput.value||'').trim();
      if(!mainText || !sideText) return empty(result,'입력값이 비어 있습니다.','사이트 공지와 채널/후기 내용을 같이 넣어 주세요.');
      const mainDomains=extractDomainsFromText(mainText); const sideDomains=extractDomainsFromText(sideText);
      const mainCodes=extractCodes(mainText); const sideCodes=extractCodes(sideText);
      const mainHandles=extractHandles(mainText); const sideHandles=extractHandles(sideText);
      const overlapDomains=mainDomains.filter((v)=>sideDomains.includes(v));
      const overlapCodes=mainCodes.filter((v)=>sideCodes.includes(v));
      const overlapHandles=mainHandles.filter((v)=>sideHandles.includes(v));
      const hypeRegex=[/100%/i,/무조건/i,/확실/i,/안전/i,/전액/i,/즉시/i,/최고/i,/무제한/i,/보장/i];
      const reactionRegex=[/먹튀/i,/지연/i,/거절/i,/추가입금/i,/선입금/i,/사칭/i,/주의/i,/보류/i,/환전/i];
      const hypeLines=detectKeywordLines(`${mainText}
${sideText}`, hypeRegex);
      const reactionLines=detectKeywordLines(`${mainText}
${sideText}`, reactionRegex);
      const cautionScore=clamp((overlapDomains.length?0:25)+(overlapCodes.length?0:18)+(overlapHandles.length?0:12)+(hypeLines.length*9)+(reactionLines.length*8),0,100);
      let html=`<div class="toolkit-result-stack">${section('센터 요약','',cardsHtml([
        {label:'주소 일치', value: overlapDomains.length?`${overlapDomains.length}개`:'없음', note: overlapDomains.slice(0,3).join(' · ')||'비교 필요'},
        {label:'코드 일치', value: overlapCodes.length?`${overlapCodes.length}개`:'없음', note: overlapCodes.slice(0,3).join(' · ')||'코드 비교'},
        {label:'채널 일치', value: overlapHandles.length?`${overlapHandles.length}개`:'없음', note: overlapHandles.slice(0,3).join(' · ')||'핸들 비교'},
        {label:'주의 점수', value: `${cautionScore}점`, note: toolRiskLabel(cautionScore)}
      ]))}`;
      if(modes.includes('address')){
        html += section('주소 비교','', listCard([
          {title:'사이트 공지', detail: mainDomains.join(' · ') || '추출 없음'},
          {title:'채널·후기', detail: sideDomains.join(' · ') || '추출 없음'},
          {title:'겹치는 주소', detail: overlapDomains.join(' · ') || '일치 후보 없음'}
        ]));
      }
      if(modes.includes('code')){
        html += section('코드 비교','', listCard([
          {title:'사이트 공지', detail: mainCodes.join(' · ') || '추출 없음'},
          {title:'채널·후기', detail: sideCodes.join(' · ') || '추출 없음'},
          {title:'겹치는 코드', detail: overlapCodes.join(' · ') || '일치 후보 없음'}
        ]));
      }
      if(modes.includes('hype')){
        html += section('과장 문구','', hypeLines.length ? listCard(hypeLines.slice(0,8).map((line, idx)=>({ title:`문구 ${idx+1}`, detail:line }))) : `<div class="toolkit-note">과장 표현은 많지 않습니다.</div>`);
      }
      if(modes.includes('reaction')){
        html += section('반응 요약','', reactionLines.length ? listCard(reactionLines.slice(0,8).map((line, idx)=>({ title:`반응 ${idx+1}`, detail:line }))) : `<div class="toolkit-note">강한 경고 표현은 많지 않습니다.</div>`);
      }
      const notes=[];
      notes.push(overlapDomains.length ? '주소 표기는 어느 정도 맞아도 최종 연결 주소를 다시 확인하는 편이 안전합니다.' : '공지와 채널 주소가 다르면 새주소/가짜 채널 가능성을 열어 두고 보세요.');
      if(hypeLines.length) notes.push('과장 문구가 많을수록 실제 조건과 다를 가능성을 같이 보세요.');
      if(reactionLines.length) notes.push('지연·거절·선입금 관련 표현이 보이면 증거를 먼저 남기고 확인하는 편이 좋습니다.');
      html += section('실전 메모','',`<ul class="toolkit-points">${notes.map((note)=>`<li>${esc(note)}</li>`).join('')}</ul>`);
      html += '</div>';
      setResult(result, html, 'toolkit-result-stack');
    });
  }
  function initReportPackager(){
    const form=$('#reportpackagerForm'); const result=$('#reportPackagerResult'); if(!form||!result) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const modes=checkedValues(form,'reportMode');
      if(!modes.length) return empty(result,'선택이 비어 있습니다.','실행할 항목을 하나 이상 선택해 주세요.');
      const site=String($('#reportSite')?.value||'').trim();
      const domain=String($('#reportDomain')?.value||'').trim();
      const amount=String($('#reportAmount')?.value||'').trim();
      const code=String($('#reportCode')?.value||'').trim();
      const story=String($('#reportStory')?.value||'').trim();
      if(!site && !domain) return empty(result,'입력값이 비어 있습니다.','사이트명이나 도메인을 먼저 입력해 주세요.');
      if(!story) return empty(result,'입력값이 비어 있습니다.','사건 흐름을 순서대로 적어 주세요.');
      const lines=normalizeLines(story);
      const dateHits=(story.match(/20\d{2}[./-]\d{1,2}(?:[./-]\d{1,2})?|오늘|어제|방금|새벽|오전|오후/g)||[]);
      const signalHits=(story.match(/입금|문의|답변|지연|거절|차단|추가입금|보류|환전/gi)||[]);
      const evidenceScore=[site||domain, normalizeDomain(domain)||domain, amount, code, lines.length>=2? 'story':'', dateHits.length? 'date':'' ].filter(Boolean).length * 16;
      let html=`<div class="toolkit-result-stack">${section('센터 요약','',cardsHtml([
        {label:'기준 정보', value: site || normalizeDomain(domain) || '-', note: normalizeDomain(domain) || '도메인 미입력'},
        {label:'이야기 줄 수', value: `${lines.length}줄`, note: dateHits.length?`날짜 단서 ${dateHits.length}건`:'날짜 단서 적음'},
        {label:'증거 점수', value: `${clamp(evidenceScore,0,100)}점`, note: toolRiskLabel(evidenceScore)},
        {label:'핵심 신호', value: `${signalHits.length}건`, note: signalHits.slice(0,4).join(' · ') || '기본 흐름'}
      ]))}`;
      if(modes.includes('evidence')){
        const items=[
          {title:'사이트명/도메인', detail:(site||domain)?`${site||'-'} / ${domain||'-'}`:'누락'},
          {title:'금액', detail:amount||'누락'},
          {title:'가입코드', detail:code||'누락'},
          {title:'사건 흐름', detail:lines.length>=2?`${lines.length}줄 정리됨`:'조금 더 자세한 흐름 필요'},
          {title:'날짜 단서', detail:dateHits.length?dateHits.join(' · '):'날짜/시간 표현이 거의 없습니다.'},
        ];
        html += section('증거 점검','', listCard(items));
      }
      if(modes.includes('timeline')){
        const timeline=`<div class="timeline-list">${lines.map((line, idx)=>{ const tag=(line.match(/20\d{2}[./-]\d{1,2}(?:[./-]\d{1,2})?|오늘|어제|방금|새벽|오전|오후/)||[`기록 ${String(idx+1).padStart(2,'0')}`])[0]; return `<article class="timeline-entry"><span class="mini-badge">${esc(tag)}</span><strong>흐름</strong><p>${esc(line)}</p></article>`; }).join('')}</div>`;
        html += section('타임라인 정리','', timeline);
      }
      if(modes.includes('summary')){
        const summary=`[제보 요약]
사이트명: ${site || '-'}
주소: ${domain || '-'}
금액: ${amount || '-'}
가입코드: ${code || '-'}

[사건 흐름]
${lines.map((line, idx)=>`${idx+1}. ${line}`).join('\n')}

[추가 확인]
- 입금내역 캡처
- 대화 캡처
- 공지/채널 캡처`;
        html += section('전달용 요약','', `<div class="toolkit-copy-box"><pre>${esc(summary)}</pre><div class="toolkit-actions"><button class="safety-copy-btn mint" type="button" data-inline-copy="${esc(summary)}">요약 복사</button></div></div>`);
      }
      html += section('실전 메모','',`<ul class="toolkit-points"><li>입금내역, 대화, 공지 캡처가 같이 있으면 제보 신뢰도가 훨씬 높아집니다.</li><li>사건 흐름은 시간 순서대로 짧게 나누는 편이 전달력이 좋습니다.</li><li>추가입금·지연·거절 표현은 원문 그대로 남기는 쪽이 안전합니다.</li></ul>`);
      html += '</div>';
      setResult(result, html, 'toolkit-result-stack');
    });
  }
  function initToolsHubShortcuts(){}
  function initMainShortcuts(){}

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
  
  function initAddressConsistency(){
    const form=$('#addressconsistencyForm'); const input=$('#addressConsistencyInput'); const result=$('#addressConsistencyResult'); if(!form||!input||!result) return;
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const modes = checkedValues(form,'centerMode');
      if(!modes.length) return empty(result,'선택이 비어 있습니다.','실행할 항목을 하나 이상 선택해 주세요.');
      const lines=normalizeLines(input.value); if(!lines.length) return empty(result,'입력값이 비어 있습니다.','주소나 채널을 한 줄에 하나씩 넣어 주세요.');
      const domains=Array.from(new Set(lines.map((v)=>normalizeDomain(v)).filter(Boolean)));
      const rootCounts={}; domains.forEach((d)=>{ const parts=d.split('.'); const base=parts.length>1?parts.slice(-2).join('.'):d; rootCounts[base]=(rootCounts[base]||0)+1;});
      const official=Object.entries(rootCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]||domains[0]||'-';
      let domainInfo=null;
      if(modes.includes('domain') && domains[0] && !isValidIp(domains[0])){ try{ domainInfo=await fetchJson(`/api/safety/domain?domain=${encodeURIComponent(domains[0])}`); }catch(_){} }
      const cards=[
        {label:'기준 후보',value:official,note:`후보 ${domains.length||0}개`},
        {label:'주소 밀도',value:`${lines.length}줄`,note:`도메인 ${domains.length||0}개`},
      ];
      if(domainInfo?.registration){ cards.push({label:'등록일',value:formatDate(domainInfo.registration.createdAt||domainInfo.registration.created),note:ageLabel(domainInfo.registration.ageDays)}); }
      else if(modes.includes('domain')) { cards.push({label:'도메인 요약',value:domains[0]||'-',note:'공개 조회 기준'}); }
      cards.push({label:'판정',value:domains.length>1?'추가 확인':'단일 후보',note:domains.length>1?'주소가 여러 개 보입니다.':'주소 후보가 단순합니다.'});
      const notes=[];
      if(modes.includes('search')) notes.push(`${official} 먹튀 / ${official} 주소 / ${official} 텔레그램 순서로 같이 확인하세요.`);
      if(modes.includes('address') && domains.length>1) notes.push('공식 공지와 링크모음 주소가 섞여 보이면 최종 연결 주소를 다시 확인하세요.');
      if(modes.includes('evidence')) notes.push('주소, 공지문, 채널 캡처를 같이 남기면 나중에 비교하기가 훨씬 쉽습니다.');
      let html=`<div class="toolkit-result-stack">${section('센터 요약','',`<div class="score-grid">${cards.map((item)=>`<div class="score-metric"><span>${esc(item.label)}</span><strong>${esc(item.value)}</strong><small>${esc(item.note||'')}</small></div>`).join('')}</div>`)}`;
      if(modes.includes('address')){
        const table=`<table class="toolkit-table"><thead><tr><th>입력값</th><th>정규화</th><th>판정</th></tr></thead><tbody>${lines.map((line)=>{ const d=normalizeDomain(line); const verdict=!d?'확인 필요':(d===official||d.endsWith('.'+official)?'기준 후보':'추가 확인'); return `<tr><td>${esc(line)}</td><td>${esc(d||'-')}</td><td>${esc(verdict)}</td></tr>`; }).join('')}</tbody></table>`;
        html += section('주소 정합성','',table);
      }
      if(modes.includes('domain')){
        const domainBody = domainInfo ? `<div class="score-grid"><div class="score-metric"><span>등록일</span><strong>${esc(formatDate(domainInfo.registration?.createdAt||domainInfo.registration?.created))}</strong><small>${esc(ageLabel(domainInfo.registration?.ageDays))}</small></div><div class="score-metric"><span>네임서버</span><strong>${esc((domainInfo.dns?.ns||[]).slice(0,2).join(' · ')||'-')}</strong><small>${esc(domainInfo.domain||domains[0]||'-')}</small></div><div class="score-metric"><span>A 기록</span><strong>${esc((domainInfo.dns?.a||[]).slice(0,2).join(' · ')||'-')}</strong><small>공개 DNS 기준</small></div><div class="score-metric"><span>최종 연결</span><strong>${esc(domainInfo.live?.finalUrl||domainInfo.live?.url||'-')}</strong><small>${esc(domainInfo.live?.title||'')}</small></div></div>` : `<div class="toolkit-note">도메인 요약은 실제 도메인 형식 입력 시 더 정확합니다.</div>`;
        html += section('도메인 요약','',domainBody);
      }
      if(modes.includes('search')){
        html += section('검색 루트','',`<div class="toolkit-copy-box"><pre>${esc(`${official} 먹튀
${official} 주소
${official} 텔레그램
${official} 후기`)}</pre>${actionButtons(`${official} 먹튀`)}</div>`);
      }
      if(modes.includes('evidence')){
        const domainsList=(domains.length?domains:extractDomainsFromText(input.value)).slice(0,6);
        html += section('공개 근거','', domainsList.length ? listCard(domainsList.map((d)=>({title:d,detail:'주소 후보로 캡처/기록 권장'}))) : `<div class="toolkit-note">입력값에서 추출된 주소가 없습니다.</div>`);
      }
      html += notes.length ? `<ul class="toolkit-points">${notes.map((item)=>`<li>${esc(item)}</li>`).join('')}</ul>` : '';
      html += '</div>';
      setResult(result, html, 'toolkit-result-stack');
    });
  }

function initChangeTimeline(){
  const form=$('#changetimelineForm'); const input=$('#changeTimelineInput'); const result=$('#changeTimelineResult'); if(!form||!input||!result) return;
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const modes = checkedValues(form,'timelineMode');
    if(!modes.length) return empty(result,'선택이 비어 있습니다.','실행할 항목을 하나 이상 선택해 주세요.');
    const raw=String(input.value||'').trim(); if(!raw) return empty(result,'입력값이 비어 있습니다.','공지문이나 주소 기록을 붙여 넣어 주세요.');
    const lines=normalizeLines(raw);
    const rows=lines.map((line,idx)=>{ const date=(line.match(/20\d{2}[./-]\d{1,2}[./-]\d{1,2}|20\d{2}[./-]\d{1,2}|20\d{2}년\s*\d{1,2}월?/)||['기록 '+String(idx+1).padStart(2,'0')])[0]; const domains=extractDomainsFromText(line); const tag=/리뉴얼|변경|이전|신규|merge|통합/i.test(line)?'변경':'기록'; return {date,line,domains,tag}; });
    const domainCount = new Set(rows.flatMap((r)=>r.domains)).size;
    const renewalHits = rows.filter((r)=>/리뉴얼|변경|이전|신규|merge|통합/i.test(r.line)).length;
    const brandHits = rows.filter((r)=>/브랜드|운영명|이전명|새이름|rename|변경/i.test(r.line)).length;
    let html=`<div class="toolkit-result-stack">${section('센터 요약','',`<div class="score-grid"><div class="score-metric"><span>기록 수</span><strong>${rows.length}건</strong><small>입력 기준</small></div><div class="score-metric"><span>주소 흔적</span><strong>${domainCount}개</strong><small>중복 제거</small></div><div class="score-metric"><span>리뉴얼 단서</span><strong>${renewalHits}건</strong><small>${renewalHits?toolRiskLabel(renewalHits*15):'낮음'}</small></div><div class="score-metric"><span>브랜드 단서</span><strong>${brandHits}건</strong><small>${brandHits?'이전 명칭 의심':'큰 흔적 없음'}</small></div></div>`)}`;
    if(modes.includes('history')){
      const timeline=`<div class="timeline-list">${rows.map((row)=>`<article class="timeline-entry"><span class="mini-badge">${esc(row.date)}</span><strong>${esc(row.tag)}</strong><p>${esc(row.line)}</p>${row.domains.length?`<small>${esc(row.domains.join(' · '))}</small>`:''}</article>`).join('')}</div>`;
      html += section('주소 흐름','',timeline);
    }
    if(modes.includes('renewal')){
      const items = rows.filter((row)=>/리뉴얼|변경|이전|신규|merge|통합/i.test(row.line));
      html += section('리뉴얼 흔적','', items.length ? listCard(items.map((row)=>({title:row.date, detail:row.line}))) : `<div class="toolkit-note">눈에 띄는 리뉴얼 문구는 많지 않습니다.</div>`);
    }
    if(modes.includes('brand')){
      const brands = rows.filter((row)=>/브랜드|운영명|이전명|새이름|rename|변경/i.test(row.line));
      html += section('브랜드 언급','', brands.length ? listCard(brands.map((row)=>({title:row.date, detail:row.line}))) : `<div class="toolkit-note">브랜드 변경 단서는 많지 않습니다.</div>`);
    }
    html += `<ul class="toolkit-points"><li>주소가 여러 번 등장하면 리뉴얼 공지와 실제 연결 주소를 같이 보세요.</li><li>이전 이름이 보이면 계열사 관계도와 같이 보는 쪽이 빠릅니다.</li></ul></div>`;
    setResult(result, html, 'toolkit-result-stack');
  });
}
function initRelationshipMap(){
    const form=$('#relationshipmapForm'); const base=$('#relationshipBase'); const input=$('#relationshipInput'); const result=$('#relationshipResult'); if(!form||!base||!input||!result) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const seed=String(base.value||'').trim();
      const raw=String(input.value||'').trim();
      const modes=checkedValues(form,'relationshipMode');
      if(!modes.length) return empty(result,'선택이 비어 있습니다.','실행할 항목을 하나 이상 선택해 주세요.');
      if(!seed||!raw) return empty(result,'입력값이 비어 있습니다.','기준값과 관련 기록을 같이 넣어 주세요.');
      const domains=extractDomainsFromText(raw);
      const codes=extractCodes(raw);
      const handles=extractHandles(raw);
      const lines=normalizeLines(raw);
      const patternHits=(raw.match(/리뉴얼|변경|이전|통합|같은|공통|문의|고객센터|채널|코드/gi)||[]).length;
      const score = Math.min(100, domains.length*12 + codes.length*8 + handles.length*10 + patternHits*4);
      const cards=[];
      const notes=[];
      if(modes.includes('domain')){
        cards.push({label:'도메인 겹침', value:domains.length?`${domains.length}개`:'없음', note:domains.slice(0,4).join(' · ')||'도메인 추출 없음'});
        if(domains.length>=2) notes.push('도메인 신호가 여러 개 보이면 주소 변경 흐름과 함께 보는 쪽이 빠릅니다.');
      }
      if(modes.includes('code')){
        cards.push({label:'코드 신호', value:codes.length?`${codes.length}개`:'없음', note:codes.slice(0,4).join(' · ')||'코드 추출 없음'});
        if(codes.length) notes.push('가입코드가 반복되면 같은 운영선상인지 같이 확인하는 편이 좋습니다.');
      }
      if(modes.includes('channel')){
        cards.push({label:'채널 겹침', value:handles.length?`${handles.length}개`:'없음', note:handles.slice(0,4).join(' · ')||'채널 추출 없음'});
        if(handles.length) notes.push('채널 표기가 반복되면 공지문/후기와 교차로 보는 쪽이 안전합니다.');
      }
      if(modes.includes('pattern')){
        cards.push({label:'운영 패턴', value:badgeBand(score), note:`문구·코드·채널 기반 유사도 ${score}`});
        notes.push(score>=75 ? '겹치는 신호가 많아 같은 계열 가능성을 열어 두고 보는 편이 좋습니다.' : '신호는 있으나 확정 판단보다는 추가 기록 확보가 먼저입니다.');
      }
      let html=`<div class="toolkit-result-stack">`;
      html += section('관계도 요약','',`<div class="score-grid"><div class="score-metric"><span>기준값</span><strong>${esc(seed)}</strong><small>비교 기준</small></div><div class="score-metric"><span>유사도</span><strong>${esc(score)}</strong><small>${esc(badgeBand(score))}</small></div><div class="score-metric"><span>기록 줄 수</span><strong>${lines.length}</strong><small>입력 기준</small></div></div>`);
      if(cards.length) html += section('겹치는 신호','',cardsHtml(cards));
      html += section('실전 메모','',`<ul class="toolkit-points">${notes.map((w)=>`<li>${esc(w)}</li>`).join('')}</ul>`);
      html += '</div>';
      setResult(result, html, 'toolkit-result-stack');
    });
  }

  function initBonusPolicy(){
    const form=$('#bonuspolicyForm'); const result=$('#bonusPolicyResult'); if(!form||!result) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const focuses=checkedValues(form,'conditionFocus');
      if(!focuses.length) return empty(result,'선택이 비어 있습니다.','보여줄 항목을 하나 이상 선택해 주세요.');
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
      const focuses=checkedValues(form,'conditionFocus');
      if(!focuses.length) return empty(result,'선택이 비어 있습니다.','보여줄 항목을 하나 이상 선택해 주세요.');
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
      const focuses=checkedValues(form,'conditionFocus');
      if(!focuses.length) return empty(result,'선택이 비어 있습니다.','보여줄 항목을 하나 이상 선택해 주세요.');
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
      const focuses=checkedValues(form,'conditionFocus');
      if(!focuses.length) return empty(result,'선택이 비어 있습니다.','보여줄 항목을 하나 이상 선택해 주세요.');
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
      const focuses=checkedValues(form,'conditionFocus');
      if(!focuses.length) return empty(result,'선택이 비어 있습니다.','보여줄 항목을 하나 이상 선택해 주세요.');
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
    initAiGameLab();
    initAiConditionLab();
    initOuCalculator();
    initHandicapProfit();
    initSlotSession();
    initMinigameRounds();
    initToolsHubShortcuts();
    initMainShortcuts();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
