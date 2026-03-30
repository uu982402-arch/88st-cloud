
(function(){
  'use strict';
  var TOKEN_KEY = 'vvip_seo_admin_token_v1';
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]); }); }
  function fmtNum(n){ var x = Number(n||0); return isFinite(x) ? x.toLocaleString('ko-KR') : '0'; }
  function fmtPct(n){ var x = Number(n||0); return isFinite(x) ? (x*100).toFixed(1)+'%' : '0%'; }
  function fmtSec(n){ var x = Number(n||0); if(!isFinite(x)) return '-'; if(x < 60) return x.toFixed(0) + 's'; var m = Math.floor(x/60); var s = Math.round(x%60); return m + 'm ' + s + 's'; }
  function setMsg(text, isErr){ var el = $('opsAnalyticsMsg'); if(!el) return; el.textContent = text || ''; el.className = 'opsMsg' + (isErr ? ' opsErr' : ''); }
  function getToken(){ try{ return (sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '').trim(); }catch(e){ return ''; } }
  function saveToken(v){ try{ localStorage.setItem(TOKEN_KEY, v||''); sessionStorage.setItem(TOKEN_KEY, v||''); }catch(e){} }
  async function api(path, opts){
    opts = opts || {};
    var headers = new Headers(opts.headers || {});
    headers.set('accept', 'application/json');
    var tok = getToken();
    if(tok) headers.set('authorization', 'Bearer ' + tok);
    var res = await fetch(path, Object.assign({}, opts, { headers: headers }));
    var json = await res.json().catch(function(){ return null; });
    if(!res.ok){
      var msg = (json && (json.error || json.message)) || ('HTTP_' + res.status);
      throw new Error(msg);
    }
    return json || {};
  }
  function renderCards(){
    var grid = $('opsAnalyticsCards');
    if(!grid) return;
    grid.innerHTML = [
      { k:'GSC 클릭', v:'-', m:'최근 스냅샷', id:'gscClicks' },
      { k:'GSC 노출', v:'-', m:'최근 스냅샷', id:'gscImpressions' },
      { k:'GSC CTR', v:'-', m:'최근 스냅샷', id:'gscCtr' },
      { k:'GA 활성 사용자', v:'-', m:'최근 28일', id:'gaUsers' },
      { k:'GA 세션', v:'-', m:'최근 28일', id:'gaSessions' },
      { k:'GA 페이지뷰', v:'-', m:'최근 28일', id:'gaViews' },
      { k:'실시간 활성', v:'-', m:'최근 30분', id:'gaRealtime' },
      { k:'참여율', v:'-', m:'최근 28일', id:'gaEngagement' }
    ].map(function(x){
      return '<div class="kpi"><div class="k">'+esc(x.k)+'</div><div class="v" id="'+esc(x.id)+'">'+esc(x.v)+'</div><div class="m">'+esc(x.m)+'</div></div>';
    }).join('');
  }
  function renderTable(tbodyId, rows, cols){
    var body = $(tbodyId); if(!body) return;
    body.innerHTML = (rows || []).map(function(row){
      return '<tr>' + cols.map(function(col){
        var val = (typeof col.render === 'function') ? col.render(row) : row[col.key];
        return '<td>' + val + '</td>';
      }).join('') + '</tr>';
    }).join('');
  }
  function renderSearch(data){
    $('gscClicks').textContent = fmtNum(data && data.clicks);
    $('gscImpressions').textContent = fmtNum(data && data.impressions);
    $('gscCtr').textContent = fmtPct(data && data.ctr);
    var meta = $('opsSearchMeta');
    if(meta) meta.textContent = ((data && data.site_url) || '-') + ' · ' + ((data && data.range) || '-');
  }
  function renderSearchOpportunities(items){
    renderTable('opsSearchOppBody', items || [], [
      { key:'score', render:function(r){ return '<b>' + fmtNum(r.score) + '</b>'; } },
      { key:'query', render:function(r){ return esc(r.query || ''); } },
      { key:'page_path', render:function(r){ return '<span class="mono">' + esc(r.page_path || '') + '</span>'; } },
      { key:'impressions', render:function(r){ return fmtNum(r.impressions); } },
      { key:'clicks', render:function(r){ return fmtNum(r.clicks); } },
      { key:'ctr', render:function(r){ return fmtPct(r.ctr); } },
      { key:'position', render:function(r){ return Number(r.position || 0).toFixed(1); } },
      { key:'reco', render:function(r){ return esc(r.reco || ''); } }
    ]);
  }
  function renderGa(data){
    if(!data || !data.ok){
      var state = $('opsGaState');
      if(state) state.textContent = (data && data.message) || 'GA가 아직 연결되지 않았습니다.';
      return;
    }
    $('gaUsers').textContent = fmtNum(data.summary && data.summary.activeUsers);
    $('gaSessions').textContent = fmtNum(data.summary && data.summary.sessions);
    $('gaViews').textContent = fmtNum(data.summary && data.summary.screenPageViews);
    $('gaRealtime').textContent = fmtNum(data.realtime && data.realtime.activeUsers);
    $('gaEngagement').textContent = fmtPct(data.summary && data.summary.engagementRate);
    var state = $('opsGaState');
    if(state){
      state.textContent = 'property=' + esc(data.property_id || '-') + ' · auth=' + esc(data.auth_mode || '-') + ' · range=' + esc(data.range || '-');
    }
    renderTable('opsGaPagesBody', data.top_pages || [], [
      { key:'pagePath', render:function(r){ return '<span class="mono">' + esc(r.pagePath || '/') + '</span>'; } },
      { key:'screenPageViews', render:function(r){ return fmtNum(r.screenPageViews); } },
      { key:'sessions', render:function(r){ return fmtNum(r.sessions); } },
      { key:'activeUsers', render:function(r){ return fmtNum(r.activeUsers); } },
      { key:'averageSessionDuration', render:function(r){ return fmtSec(r.averageSessionDuration); } }
    ]);
    renderTable('opsGaChannelsBody', data.acquisition || [], [
      { key:'channel', render:function(r){ return esc(r.channel || '(direct)'); } },
      { key:'sessions', render:function(r){ return fmtNum(r.sessions); } },
      { key:'activeUsers', render:function(r){ return fmtNum(r.activeUsers); } }
    ]);
    renderTable('opsGaEventsBody', data.top_events || [], [
      { key:'eventName', render:function(r){ return esc(r.eventName || ''); } },
      { key:'eventCount', render:function(r){ return fmtNum(r.eventCount); } }
    ]);
  }
  async function refreshAll(){
    try{
      setMsg('운영 데이터를 불러오는 중…');
      var s = await api('/api/seo/summary');
      renderSearch(s);
      var opp = await api('/api/seo/opportunities?limit=25');
      renderSearchOpportunities(opp.items || []);
      var ga = await api('/api/ops/ga/summary');
      renderGa(ga);
      setMsg('완료');
    }catch(e){
      setMsg('오류: ' + (e && e.message ? e.message : e), true);
    }
  }
  async function syncSearch(){
    try{
      setMsg('Search Console 동기화 시작…');
      await api('/api/seo/sync', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ days: 28 }) });
      await refreshAll();
      setMsg('Search Console 동기화 완료');
    }catch(e){
      setMsg('동기화 실패: ' + (e && e.message ? e.message : e), true);
    }
  }
  function bind(){
    if(!$('opsAnalyticsSection')) return;
    renderCards();
    var tok = getToken();
    if(tok && $('opsAdminToken')) $('opsAdminToken').value = tok;
    var saveBtn = $('opsSaveAdminToken');
    if(saveBtn) saveBtn.addEventListener('click', function(){
      var v = String(($('opsAdminToken') && $('opsAdminToken').value) || '').trim();
      if(!v){ setMsg('ADMIN_TOKEN을 입력해줘', true); return; }
      saveToken(v);
      setMsg('ADMIN_TOKEN 저장됨');
    });
    var refreshBtn = $('opsAnalyticsRefresh');
    if(refreshBtn) refreshBtn.addEventListener('click', refreshAll);
    var syncBtn = $('opsAnalyticsSync');
    if(syncBtn) syncBtn.addEventListener('click', syncSearch);
    refreshAll();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
