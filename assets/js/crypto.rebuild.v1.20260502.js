
(() => {
  const COINS = {
    BTC:{name:'Bitcoin', price:'₩92,480,000', tone:'상승 우세', risk:'중간', volume:'최근 증가', volatility:'높음', change:'+2.4%', path:[18,24,21,35,42,38,52,58,56,68,72,80], desc:'단기 반등 흐름은 유지되지만, 거래량 확장이 부족해 추격 진입은 신중하게 보는 편이 좋습니다.'},
    ETH:{name:'Ethereum', price:'₩4,120,000', tone:'관망', risk:'중간', volume:'둔화', volatility:'보통', change:'+0.8%', path:[30,28,32,35,34,38,41,39,42,45,44,47], desc:'방향성은 유지되지만 강한 확정 신호 전까지는 분할 확인이 더 안전합니다.'},
    SOL:{name:'Solana', price:'₩212,000', tone:'반등 시도', risk:'높음', volume:'증가', volatility:'높음', change:'+4.1%', path:[20,18,24,29,25,36,48,44,53,57,62,60], desc:'변동성이 커서 짧은 대응이 필요하며 지지 유지 여부를 먼저 봐야 합니다.'},
    XRP:{name:'Ripple', price:'₩830', tone:'지지 확인 필요', risk:'중간', volume:'보통', volatility:'보통', change:'-0.3%', path:[48,46,45,43,44,47,46,49,51,50,52,51], desc:'거래량 확장이 부족해 추격 진입보다 지지 확인 후 접근이 더 안전합니다.'}
  };
  const EXCHANGES = {
    BINANCE:{name:'Binance', fee:'0.10%', liquidity:'96', gap:'+0.18%', volume:'매우 높음'},
    UPBIT:{name:'Upbit', fee:'0.05%', liquidity:'88', gap:'기준', volume:'높음'},
    BITHUMB:{name:'Bithumb', fee:'0.04~0.25%', liquidity:'82', gap:'-0.12%', volume:'높음'},
    BYBIT:{name:'Bybit', fee:'0.10%', liquidity:'90', gap:'+0.21%', volume:'높음'}
  };
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const symbolOf = value => {
    const q = String(value || '').trim().toUpperCase();
    if(!q) return 'BTC';
    if(q.includes('ETH')) return 'ETH'; if(q.includes('SOL')) return 'SOL'; if(q.includes('XRP')) return 'XRP'; if(q.includes('BTC') || q.includes('BIT')) return 'BTC';
    return COINS[q] ? q : 'BTC';
  };
  function buildPath(points, w=640, h=220, pad=18){
    const min = Math.min(...points), max = Math.max(...points), span = Math.max(1, max-min);
    return points.map((v,i)=>{
      const x = pad + (i*(w-pad*2))/(points.length-1);
      const y = h-pad - ((v-min)/span)*(h-pad*2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }
  function renderSvg(points, type='price'){
    const path = buildPath(points);
    const coords = path.split(' '); const last = coords[coords.length - 1]; const first = coords[0];
    const area = `${first.replace(/,.*/,',202')} ${path} ${last.replace(/,.*/,',202')}`;
    const bars = points.map((v,i)=>`<rect class="crypto-chart-volume" x="${28+i*50}" y="${180-(v%32)}" width="22" height="${20+(v%32)}" rx="6"></rect>`).join('');
    return `<svg class="crypto-svg" viewBox="0 0 640 220" role="img" aria-label="${type==='diff'?'거래소 가격 차이 그래프':'대표 종목 가격 차트'}"><g opacity=".7"><line x1="18" y1="46" x2="622" y2="46" stroke="#e2e8f0"/><line x1="18" y1="104" x2="622" y2="104" stroke="#e2e8f0"/><line x1="18" y1="162" x2="622" y2="162" stroke="#e2e8f0"/></g>${type==='volume'? bars : `<polygon class="crypto-chart-area" points="${area}"></polygon><polyline class="${type==='diff'?'crypto-chart-diff':'crypto-chart-line'}" points="${path}"></polyline>`}<text x="20" y="214">1H</text><text x="302" y="214">현재</text><text x="584" y="214">최근</text></svg>`;
  }
  function setActiveTab(btn){ const group = btn.closest('[data-chart-tabs]'); if(!group) return; $$('[data-period]', group).forEach(b=>b.classList.toggle('is-active', b===btn)); }
  function variantPoints(base, period){ const k = { '1H':1, '4H':1.08, '1D':.92, '1W':1.18 }[period] || 1; return base.map((v,i)=>Math.round(v*k + ((i%3)-1)*2)); }
  function updateCharts(symbol='BTC', period='1H'){
    const coin = COINS[symbol] || COINS.BTC;
    $$('[data-price-chart]').forEach(node=> node.innerHTML = renderSvg(variantPoints(coin.path, period),'price'));
    $$('[data-diff-chart]').forEach(node=> node.innerHTML = renderSvg([42,44,39,47,45,52,49,55,53,58,54,61],'diff'));
    $$('[data-volume-chart]').forEach(node=> node.innerHTML = renderSvg(coin.path,'volume'));
    $$('[data-chart-coin]').forEach(node=> node.textContent = symbol);
    $$('[data-chart-interpret]').forEach(node=> node.textContent = coin.desc);
  }
  function saveRecent(symbol){
    try{ const key='crypto_recent_symbols_v1'; const arr=JSON.parse(localStorage.getItem(key)||'[]').filter(x=>x!==symbol); arr.unshift(symbol); localStorage.setItem(key, JSON.stringify(arr.slice(0,6))); renderRecent(); }catch(_){ }
  }
  function renderRecent(){
    const root=$('[data-recent-symbols]'); if(!root) return;
    let arr=['BTC','ETH','SOL'];
    try{ const saved=JSON.parse(localStorage.getItem('crypto_recent_symbols_v1')||'[]'); if(saved.length) arr=saved; }catch(_){ }
    root.innerHTML=arr.map(sym=>`<a class="crypto-recent-chip" href="/coins/${sym.toLowerCase()}/">${esc(sym)} 최근 분석</a>`).join('');
  }
  function analysisHtml(symbol, exchange, period, mode){
    const coin = COINS[symbol] || COINS.BTC;
    const aggressive = mode === 'aggressive'; const safe = mode === 'safe';
    const risk = aggressive ? '높음' : safe && coin.risk === '높음' ? '중간' : coin.risk;
    const call = coin.tone;
    const interpretation = call.includes('상승') ? '단기 과열 가능성은 있으나 흐름은 유지 중입니다.' : call.includes('관망') ? '방향성 확정 전까지 무리한 진입은 주의가 필요합니다.' : '눌림 확인 후 접근이 더 안전합니다.';
    return `<div class="crypto-result-box"><h3>빠른 분석 결과</h3><div class="crypto-kpi-grid"><article class="crypto-kpi"><span>흐름</span><strong>${esc(call)}</strong></article><article class="crypto-kpi"><span>위험도</span><strong>${esc(risk)}</strong></article><article class="crypto-kpi"><span>거래량</span><strong>${esc(coin.volume)}</strong></article><article class="crypto-kpi"><span>변동성</span><strong>${esc(coin.volatility)}</strong></article></div><div class="crypto-interpret">해석: ${esc(interpretation)} ${esc(exchange)} · ${esc(period)} 기준으로 먼저 확인했습니다.</div><div class="crypto-result-actions"><a class="crypto-btn crypto-btn--primary" href="/coins/${symbol.toLowerCase()}/">상세 분석 보기</a><a class="crypto-btn crypto-btn--ghost" href="https://t.me/odds88st_bot" target="_blank" rel="noopener noreferrer">Telegram 상세 분석</a></div></div>`;
  }
  function wireAnalysis(){
    $$('[data-quick-analysis-form]').forEach(form=>{
      const output = $(form.getAttribute('data-output') || '[data-quick-analysis-result]');
      form.addEventListener('submit', e=>{
        e.preventDefault();
        const fd = new FormData(form); const symbol = symbolOf(fd.get('symbol')); const exchange = fd.get('exchange') || 'Binance'; const period = fd.get('period') || '1D'; const mode = fd.get('mode') || 'balanced';
        if(output){ output.innerHTML = analysisHtml(symbol, exchange, period, mode); output.removeAttribute('hidden'); }
        saveRecent(symbol); updateCharts(symbol, period);
      });
    });
    $$('[data-hero-search]').forEach(form=>{
      form.addEventListener('submit', e=>{
        e.preventDefault();
        const value = String(new FormData(form).get('q') || '').trim();
        const upper = value.toUpperCase();
        if(/BINANCE|UPBIT|BITHUMB|BYBIT|거래소/.test(upper)) location.href='/exchanges/'; else location.href=`/coins/${symbolOf(value).toLowerCase()}/`;
      });
    });
  }
  function wireTabs(){
    document.addEventListener('click', e=>{
      const tab=e.target.closest('[data-period]'); if(tab){ setActiveTab(tab); updateCharts(tab.getAttribute('data-symbol') || $('[data-page-symbol]')?.getAttribute('data-page-symbol') || 'BTC', tab.getAttribute('data-period')); }
      const copy=e.target.closest('[data-copy-text]'); if(copy){ copyText(copy.getAttribute('data-copy-text')||'', copy); }
      const open=e.target.closest('[data-copy-open]'); if(open){ copyText(open.getAttribute('data-copy-open')||''); }
    });
  }
  async function copyText(text, trigger){
    try{ await navigator.clipboard.writeText(text); }
    catch(_){ const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    if(trigger){ const old=trigger.textContent; trigger.textContent='복사 완료'; setTimeout(()=>trigger.textContent=old,1300); }
  }
  function renderDetail(){
    const host=$('[data-coin-detail]'); if(!host) return; const symbol=host.getAttribute('data-coin-detail') || 'BTC'; const coin=COINS[symbol] || COINS.BTC; saveRecent(symbol); updateCharts(symbol,'1D');
    const title=$('[data-detail-title]'); if(title) title.textContent=`${symbol} 상세 분석`;
    const desc=$('[data-detail-desc]'); if(desc) desc.textContent='가격 흐름, 거래량, 지표를 함께 보고 현재 구간을 해석합니다.';
    $$('[data-coin-symbol]').forEach(n=>n.textContent=symbol); $$('[data-coin-price]').forEach(n=>n.textContent=coin.price); $$('[data-coin-tone]').forEach(n=>n.textContent=coin.tone); $$('[data-coin-risk]').forEach(n=>n.textContent=coin.risk); $$('[data-coin-volume]').forEach(n=>n.textContent=coin.volume); $$('[data-coin-volatility]').forEach(n=>n.textContent=coin.volatility); $$('[data-coin-desc]').forEach(n=>n.textContent=coin.desc);
  }
  function renderExchangeCharts(){
    $$('[data-exchange-diff-chart]').forEach(n=>n.innerHTML=renderSvg([48,47,51,49,54,52,56,53,58,55,60,57],'diff'));
    $$('[data-exchange-volume-chart]').forEach(n=>n.innerHTML=renderSvg([80,68,58,62,74,70,86,72,76,84,78,88],'volume'));
  }
  function init(){ renderRecent(); wireAnalysis(); wireTabs(); renderDetail(); updateCharts($('[data-page-symbol]')?.getAttribute('data-page-symbol') || 'BTC','1H'); renderExchangeCharts(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
