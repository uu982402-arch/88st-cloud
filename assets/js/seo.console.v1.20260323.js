/* SEO Console + Ops Dashboard (v1.20260323)
   - GSC summary/opportunities via Worker API
   - Static site/GA/indexing dashboard via generated JSON
*/
(function(){
  'use strict';
  const $ = (id)=>document.getElementById(id);
  const TOKEN_KEY = 'vvip_seo_admin_token_v1';
  const DASHBOARD_JSON = '/assets/data/ops.dashboard.v1.20260323.json';

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
  function fmtNum(n){ const x = Number(n||0); return Number.isFinite(x) ? x.toLocaleString('ko-KR') : '0'; }
  function fmtPct(p){ const x = Number(p||0); return Number.isFinite(x) ? (x*100).toFixed(1)+'%' : '0%'; }
  function fmtPos(p){ const x = Number(p||0); return Number.isFinite(x) ? x.toFixed(1) : '-'; }

  function setMsg(text, isErr){
    const el = $('msg');
    if(!el) return;
    el.textContent = text || '';
    el.className = 'msg' + (isErr ? ' err' : '');
    if(text) setTimeout(()=>{ try{ el.textContent=''; el.className='msg'; }catch(e){} }, 3800);
  }
  function getToken(){ try{ return (sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '').trim(); }catch(e){ return ''; } }
  function saveToken(v){ try{ localStorage.setItem(TOKEN_KEY, v||''); sessionStorage.setItem(TOKEN_KEY, v||''); }catch(e){} }

  async function api(path, opts){
    opts = opts || {};
    const headers = new Headers(opts.headers || {});
    headers.set('accept','application/json');
    const tok = getToken();
    if(tok) headers.set('authorization', 'Bearer ' + tok);
    const res = await fetch(path, Object.assign({}, opts, { headers }));
    const json = await res.json().catch(()=>null);
    if(!res.ok){
      const msg = (json && (json.error || json.message)) || ('HTTP_'+res.status);
      throw new Error(msg);
    }
    return json;
  }
  async function getJson(path){
    const res = await fetch(path, { headers:{accept:'application/json'} });
    if(!res.ok) throw new Error('HTTP_'+res.status);
    return res.json();
  }

  function setStatus(ok){
    const el = $('seoStatus');
    if(!el) return;
    el.textContent = ok ? 'online' : 'offline';
    el.style.opacity = ok ? '1' : '.7';
  }

  function renderGscKpi(sum){
    const grid = $('kpiGrid');
    if(!grid) return;
    grid.style.display = 'grid';
    const items = [
      {k:'기간', v: (sum && sum.range) || '-', m:'최근 데이터 범위'},
      {k:'클릭', v: fmtNum(sum && sum.clicks), m:'GSC 합산'},
      {k:'노출', v: fmtNum(sum && sum.impressions), m:'GSC 합산'},
      {k:'CTR', v: fmtPct(sum && sum.ctr), m:'클릭/노출'}
    ];
    grid.innerHTML = items.map(it => '<div class="kpi"><div class="k">'+it.k+'</div><div class="v">'+it.v+'</div><div class="m">'+it.m+'</div></div>').join('');
  }

  function renderOpp(list){
    const table = $('oppTable');
    const body = $('oppBody');
    if(!table || !body) return;
    table.style.display = 'table';
    body.innerHTML = (list||[]).map(row => {
      const rec = (row && row.reco) || '';
      const page = (row && row.page_path) || (row && row.page) || '';
      return '<tr>'+
        '<td><b>'+fmtNum(row.score)+'</b></td>'+
        '<td>'+escapeHtml(row.query || '')+'</td>'+
        '<td class="mono">'+escapeHtml(page)+'</td>'+
        '<td>'+fmtNum(row.impressions)+'</td>'+
        '<td>'+fmtNum(row.clicks)+'</td>'+
        '<td>'+fmtPct(row.ctr)+'</td>'+
        '<td>'+fmtPos(row.position)+'</td>'+
        '<td>'+escapeHtml(rec)+'</td>'+
      '</tr>';
    }).join('');
  }

  function renderOpsDashboard(data){
    if(!data) return;
    const opsMeta = $('opsMeta');
    if(opsMeta) opsMeta.textContent = 'generated=' + (data.generatedAt || '-') + ' · public=' + fmtNum(data.site && data.site.publicPages);

    const opsGrid = $('opsGrid');
    if(opsGrid){
      const items = [
        {k:'공개 페이지', v: fmtNum(data.site && data.site.publicPages), m:'public index.html 기준'},
        {k:'게시글', v: fmtNum(data.site && data.site.posts), m:'posts.index 기준'},
        {k:'사이트맵 URL', v: fmtNum(data.site && data.site.sitemapUrls), m:'sitemap.txt 기준'},
        {k:'광고 카드', v: fmtNum(data.site && data.site.ads), m:'현재 카드 수'}
      ];
      opsGrid.innerHTML = items.map(it => '<div class="kpi"><div class="k">'+it.k+'</div><div class="v">'+it.v+'</div><div class="m">'+it.m+'</div></div>').join('');
    }

    const gaGrid = $('gaGrid');
    if(gaGrid){
      const items = [
        {k:'Measurement ID', v: escapeHtml(((data.ga && data.ga.measurementIds) || []).join(', ') || '-'), m:'현재 코드에서 탐지'},
        {k:'page_view 자동', v: (data.ga && data.ga.sendPageViewTrue) ? 'ON' : 'OFF', m:'gtag config send_page_view'},
        {k:'운영 페이지 제외', v: (data.ga && data.ga.operatorExcluded) ? '적용' : '미적용', m:'/admin /ops /seo'},
        {k:'추적 영역', v: fmtNum((data.ga && data.ga.trackedPublicAreas || []).length), m:'공개 영역 기준'}
      ];
      gaGrid.innerHTML = items.map(it => '<div class="kpi"><div class="k">'+it.k+'</div><div class="v mono">'+it.v+'</div><div class="m">'+it.m+'</div></div>').join('');
    }

    const gaBody = $('gaBody');
    if(gaBody){
      const rows = [
        ['공개 페이지 로더', data.ga && data.ga.publicLoader, '공개 페이지 page_view 수집'],
        ['운영 페이지 로더', ((data.ga && data.ga.operatorLoaders) || []).join(', '), '운영자 방문 오염 방지'],
        ['제외 영역', ((data.ga && data.ga.excludedAreas) || []).join(', '), '이번 패치 기준'],
        ['메모', (data.notes || []).join(' / '), '현재 수집 구조']
      ];
      gaBody.innerHTML = rows.map(r => '<tr><td>'+escapeHtml(r[0])+'</td><td class="mono">'+escapeHtml(r[1] || '-')+'</td><td>'+escapeHtml(r[2])+'</td></tr>').join('');
    }

    const priorityBody = $('priorityBody');
    if(priorityBody){
      priorityBody.innerHTML = ((data.indexing && data.indexing.topPriority) || []).map((url, idx) => '<tr><td><b>'+(idx+1)+'</b></td><td class="mono">'+escapeHtml(url)+'</td><td>URL 검사 → 색인 요청</td></tr>').join('');
    }
  }

  async function refreshGsc(){
    try {
      const sum = await api('/api/seo/summary');
      setStatus(true);
      $('seoMeta').textContent = (sum && sum.site_url ? sum.site_url : '') + (sum && sum.last_sync ? (' · last_sync=' + sum.last_sync) : '');
      renderGscKpi(sum);
      const opp = await api('/api/seo/opportunities?limit=50');
      renderOpp(opp.items || []);
    } catch (e) {
      setStatus(false);
      renderGscKpi(null);
      renderOpp([]);
      setMsg('GSC 연결 오류: ' + (e && e.message ? e.message : e), true);
    }
  }

  async function syncGsc(){
    try {
      setMsg('동기화 시작…');
      const res = await api('/api/seo/sync', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ days: 28 }) });
      setMsg('동기화 완료: rows=' + (res && res.rows ? res.rows : 0));
      await refreshGsc();
    } catch (e) {
      setMsg('동기화 실패: ' + (e && e.message ? e.message : e), true);
    }
  }

  async function refreshStatic(){
    try { renderOpsDashboard(await getJson(DASHBOARD_JSON)); }
    catch (e) { if($('opsMeta')) $('opsMeta').textContent = 'static dashboard unavailable'; }
  }

  function init(){
    const tok = getToken();
    if(tok && $('adminToken')) $('adminToken').value = tok;
    $('btnSaveToken') && $('btnSaveToken').addEventListener('click', ()=>{
      const v = String($('adminToken').value || '').trim();
      if(!v){ setMsg('토큰을 입력해줘'); return; }
      saveToken(v); setMsg('저장됨');
    });
    $('btnRefresh') && $('btnRefresh').addEventListener('click', ()=>{ refreshStatic(); refreshGsc(); });
    $('btnSync') && $('btnSync').addEventListener('click', syncGsc);
    refreshStatic();
    refreshGsc();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
