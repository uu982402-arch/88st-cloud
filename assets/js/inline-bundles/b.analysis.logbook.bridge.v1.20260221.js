/* 88ST /analysis ↔ Logbook bridge (v1)
   - Reads localStorage key used by /logbook/
   - Renders compact KPIs + recent entries inside /analysis PRO panel
   - Safe: no dependencies, guarded for private browsing / blocked storage
*/
(function(){
  'use strict';

  var KEY = '88st_betlog_v1';

  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  function safeRead(){
    try{
      var s = localStorage.getItem(KEY);
      if(!s) return [];
      var arr = JSON.parse(s);
      return Array.isArray(arr) ? arr : [];
    }catch(e){
      return [];
    }
  }

  function profit(e){
    var st = +e.stake || 0;
    var od = +e.odds || 0;
    var r = (e.res||'').toUpperCase();
    if(r==='W') return st*(od-1);
    if(r==='L') return -st;
    return 0; // V/VOID
  }

  function weekRange(){
    var d = new Date(); d.setHours(0,0,0,0);
    var day = d.getDay(); // 0 Sun
    var diff = (day===0? -6 : 1-day); // Monday start
    var start = new Date(d); start.setDate(d.getDate()+diff);
    var end = new Date(start); end.setDate(start.getDate()+7);
    return [start.getTime(), end.getTime()];
  }

  function monthRange(){
    var d = new Date(); d.setHours(0,0,0,0);
    var start = new Date(d.getFullYear(), d.getMonth(), 1);
    var end = new Date(d.getFullYear(), d.getMonth()+1, 1);
    return [start.getTime(), end.getTime()];
  }

  function fmtWon(n){
    try{ return new Intl.NumberFormat('ko-KR').format(Math.round(n)); }catch(e){ return String(Math.round(n)); }
  }

  function fmtPct(x){
    if(!isFinite(x)) return '—';
    var v = x*100;
    var s = (Math.round(v*10)/10).toFixed(1);
    return (v>=0? '+' : '') + s + '%';
  }

  function clamp(n,a,b){ n=+n; if(!isFinite(n)) return a; return Math.min(b, Math.max(a, n)); }

  function compute(arr, range){
    var items = arr.slice().sort(function(a,b){ return (+a.ts||0) - (+b.ts||0); });
    if(range){
      items = items.filter(function(e){
        var t = +e.ts || Date.parse((e.date||'')+'T00:00:00') || 0;
        return t>=range[0] && t<range[1];
      });
    }
    var cnt = items.length;
    var st=0, pnl=0, w=0, l=0, v=0, sumOdds=0, oddsN=0;
    for(var i=0;i<items.length;i++){
      var e = items[i];
      var stake = +e.stake||0;
      var od = +e.odds||0;
      var r = (e.res||'').toUpperCase();
      st += stake;
      pnl += profit(e);
      if(od>1){ sumOdds += od; oddsN++; }
      if(r==='W') w++; else if(r==='L') l++; else v++;
    }
    var roi = st>0 ? (pnl/st) : NaN;
    var wr = (w+l)>0 ? (w/(w+l)) : NaN;
    var avgod = oddsN>0 ? (sumOdds/oddsN) : NaN;
    return {cnt:cnt, st:st, pnl:pnl, roi:roi, w:w, l:l, v:v, wr:wr, avgod:avgod, items:items};
  }

  function computeMDD(arr){
    var items = arr.slice().sort(function(a,b){ return (+a.ts||0) - (+b.ts||0); });
    var cum=0, peak=0, mdd=0;
    for(var i=0;i<items.length;i++){
      cum += profit(items[i]);
      if(cum>peak) peak=cum;
      var dd = peak - cum;
      if(dd>mdd) mdd=dd;
    }
    return mdd;
  }

  function badgeClassByROI(roi){
    if(!isFinite(roi)) return 'good';
    if(roi >= 0.02) return 'good';
    if(roi <= -0.02) return 'bad';
    return 'warn';
  }

  function render(){
    var host = qs('#lbSummary');
    if(!host) return;

    var arr = safeRead();
    var wk = compute(arr, weekRange());
    var mk = compute(arr, monthRange());
    var mdd = computeMDD(arr);

    var elW = qs('#lbWroi');
    var elWn = qs('#lbWnote');
    var elM = qs('#lbMroi');
    var elMn = qs('#lbMnote');
    var elD = qs('#lbMdd');
    var elC = qs('#lbCnt');
    var elR = qs('#lbRecent');
    var elB = qs('#lbBadge');

    if(elW) elW.textContent = fmtPct(wk.roi);
    if(elWn) elWn.textContent = (wk.cnt? (wk.cnt+'건 · 순손익 '+fmtWon(wk.pnl)+'원') : '기록 없음');

    if(elM) elM.textContent = fmtPct(mk.roi);
    if(elMn) elMn.textContent = (mk.cnt? (mk.cnt+'건 · 순손익 '+fmtWon(mk.pnl)+'원') : '기록 없음');

    if(elD) elD.textContent = (arr.length? ('-'+fmtWon(mdd)+'원') : '—');
    if(elC) elC.textContent = (arr.length? (arr.length+'건') : '0건');

    if(elB){
      var cls = badgeClassByROI(wk.roi);
      elB.className = 'pro-badge '+cls;
      elB.textContent = (arr.length? ('이번주 '+(wk.cnt? fmtPct(wk.roi) : '기록 없음')) : '로그북 비어 있음');
    }

    if(elR){
      if(!arr.length){
        elR.innerHTML = '<div style="padding:10px 0;opacity:.75">아직 로그북 기록이 없습니다. <a href="/logbook/" style="text-decoration:underline" target="_blank" rel="noopener">/logbook/</a>에서 ‘빠른 기록’을 추가하세요.</div>';
      } else {
        var items = arr.slice().sort(function(a,b){ return (+b.ts||0) - (+a.ts||0); }).slice(0,5);
        var rows = items.map(function(e){
          var r = (e.res||'').toUpperCase();
          var pnl = profit(e);
          var sign = pnl>=0? '+' : '';
          var label = (r==='W'?'WIN':(r==='L'?'LOSE':'VOID'));
          var meta = [
            (e.date||''),
            (e.sport||'').trim(),
            (e.market||'').trim()
          ].filter(Boolean).join(' · ');
          if(meta.length>44) meta = meta.slice(0,44)+'…';
          return '<div class="pro-scanitem" style="align-items:flex-start">'
            + '<div class="meta"><div class="t">'+label+' <span style="opacity:.7">@ '+(isFinite(+e.odds)? (+e.odds).toFixed(2):'—')+'</span></div>'
            + '<div class="d">'+(meta||'')+'</div></div>'
            + '<div class="right" style="flex-direction:column;align-items:flex-end;gap:4px">'
            + '<div style="font-weight:900;font-variant-numeric:tabular-nums">'+sign+fmtWon(pnl)+'원</div>'
            + '<div style="font-size:12px;opacity:.75">투입 '+fmtWon(+e.stake||0)+'원</div>'
            + '</div>'
            + '</div>';
        }).join('');
        elR.innerHTML = rows;
      }
    }

    // actions
    var btnOpen = qs('#btnOpenLogbook');
    if(btnOpen && !btnOpen.__bound){
      btnOpen.__bound = true;
      btnOpen.addEventListener('click', function(){
        window.open('/logbook/', '_blank', 'noopener');
      });
    }

    var btnSync = qs('#btnLbRefresh');
    if(btnSync && !btnSync.__bound){
      btnSync.__bound = true;
      btnSync.addEventListener('click', function(){ render(); });
    }
  }

  function boot(){
    // Re-render when user comes back from /logbook/
    render();
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) render(); });
    window.addEventListener('focus', function(){ render(); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
