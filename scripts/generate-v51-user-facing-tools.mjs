import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION_BASE = 'static-growth-conversion-v51-20260522';
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT,p)), {recursive:true}); fs.writeFileSync(path.join(ROOT,p), s, 'utf8'); };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function walk(dir, out=[]) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules','.git','__MACOSX'].includes(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
function updateBuildVersionScript() {
  const p = path.join(ROOT, 'scripts/gen-build-ver.mjs');
  if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/static-growth-conversion-v\d+-\$\{compact\}/g, 'static-growth-conversion-v51-${compact}');
  fs.writeFileSync(p, s, 'utf8');
}

updateBuildVersionScript();

const providers = [
  { slug:'queenbee', name:'여왕벌', label:'QUEENBEE', img:'/assets/provider-media/queenbee-logo-clean-v22.png', detail:'/guaranteed/queenbee/' },
  { slug:'sk-holdings', name:'SK 홀딩스', label:'SK HOLDINGS', img:'/assets/provider-media/sk-holdings-logo.png', detail:'/guaranteed/sk-holdings/' },
  { slug:'anybet', name:'ANYBET', label:'ANYBET', img:'/assets/provider-media/anybet-logo.png', detail:'/guaranteed/anybet/' },
  { slug:'udt', name:'UDT', label:'UDT', img:'/assets/provider-media/udt-logo-transparent-v14.png', detail:'/guaranteed/udt/' },
  { slug:'ddangkong', name:'땅콩', label:'DDANGKONG', img:'/assets/provider-media/ddangkong-logo-v19.png', detail:'/guaranteed/ddangkong/' }
];

const implementedTools = [
  {id:'official-url', group:'주소·코드 확인', title:'공식주소 확인 도구', summary:'입력한 주소의 HTTPS, 서브도메인, 유사문자, 하이픈·숫자 변조 신호를 한 번에 정리합니다.', inputs:['확인할 URL','기준 도메인'], result:'정규화 도메인, 의심 신호, 확인 포인트', related:['/tools/official-check/','/blog/game-guides/v47-whois-domain-creation-date-risk.html']},
  {id:'join-code', group:'주소·코드 확인', title:'가입코드 확인 도구', summary:'업체명과 입력 코드를 대조해 코드 오입력 가능성을 줄입니다.', inputs:['업체 선택','입력 코드'], result:'일치 여부, 권장 확인 문구', related:['/tools/code-check/','/guaranteed/']},
  {id:'bonus-net', group:'보너스·롤링·출금', title:'보너스 실수령 계산기', summary:'입금액, 보너스율, 롤링 배수, 인정 비율을 넣어 필요 턴오버와 실수령 구조를 계산합니다.', inputs:['입금액','보너스율','롤링 배수','인정 비율'], result:'보너스, 총 크레딧, 필요 롤링', related:['/tools/bonus-calculator/','/tools/rolling-calculator/']},
  {id:'rolling', group:'보너스·롤링·출금', title:'롤링 조건 계산기', summary:'현재까지 인정된 배팅액과 남은 롤링을 계산합니다.', inputs:['기준 금액','롤링 배수','진행 배팅액','인정 비율'], result:'필요 롤링, 인정 진행액, 남은 금액', related:['/tools/rolling-calculator/','/blog/game-guides/rtp-volatility-simple-meaning.html']},
  {id:'withdraw', group:'보너스·롤링·출금', title:'출금 가능 금액 계산기', summary:'잔액, 최대 출금 한도, 남은 롤링을 분리해 출금 가능성을 정리합니다.', inputs:['현재 잔액','최대 출금 한도','남은 롤링'], result:'즉시 출금 가능 추정, 제한 사유', related:['/tools/withdraw-limit/','/tools/payout-kit/']},
  {id:'first-recurring', group:'보너스·롤링·출금', title:'첫충 / 매충 혜택 비교 계산기', summary:'첫충과 매충의 지급액만 보지 않고 필요한 롤링 부담까지 함께 비교합니다.', inputs:['입금액','첫충율','매충율','각 롤링 배수'], result:'혜택 차이, 롤링 차이, 부담 대비 효율', related:['/tools/first-bonus/','/tools/recurring-bonus/']},
  {id:'overround', group:'스포츠 배당 계산', title:'스포츠 배당 환수율 계산기', summary:'2~3개 배당을 입력해 implied probability, 오버라운드, 환수율을 계산합니다.', inputs:['소수 배당 목록'], result:'내재 확률 합계, 마진, 환수율', related:['/tools/line-payout/','/blog/sports-toto/v47-football-1x2-overround-calculation.html']},
  {id:'ev', group:'스포츠 배당 계산', title:'EV 기대값 계산기', summary:'본인이 추정한 확률과 배당을 비교해 기대값을 수식으로 계산합니다.', inputs:['소수 배당','추정 확률'], result:'공정 배당, EV%, 손익분기 확률', related:['/tools/odds-band/','/sports-check/']},
  {id:'combo', group:'스포츠 배당 계산', title:'조합 배당 실수령 계산기', summary:'복수 배당 조합의 총 배당, 예상 지급액, 순손익을 계산합니다.', inputs:['배당 목록','투입 금액'], result:'총 조합 배당, 예상 지급액, 순손익', related:['/tools/slip-compare/','/tools/handicap-payout/']},
  {id:'slot-rtp', group:'카지노·슬롯 수학', title:'슬롯 RTP 체감 손실 계산기', summary:'회전당 금액, 횟수, RTP를 넣어 장기 기대 손실을 추정합니다.', inputs:['회전당 금액','회전 수','RTP'], result:'총 투입액, 기대 환급, 기대 손실', related:['/tools/slot-rtp/','/blog/online-slot/pragmatic-play-volatility-check.html']},
  {id:'martingale', group:'미니게임 확률', title:'파워볼 마틴게일 파산 위험 계산기', summary:'기준 배팅액, 배수, 자본, 연패 횟수 기준으로 필요한 자본과 위험 구간을 계산합니다.', inputs:['기준 배팅액','배수','보유 자본','승률'], result:'감당 가능 단계, 필요 자본, 연패 위험', related:['/tools/minigame-round-planner/','/blog/minigame/ladder-game-gambler-ruin.html']},
  {id:'phishing', group:'주소·코드 확인', title:'피싱 URL 문자 변조 확인 도구', summary:'기준 도메인과 비교해 숫자 치환, 하이픈, 서브도메인 사칭, punycode 신호를 잡습니다.', inputs:['기준 도메인','검사 URL'], result:'변조 신호, 문자열 거리, 확인 순서', related:['/tools/similar-domain/','/blog/game-guides/whois-domain-age-risk-score.html']}
];

function classifyRoadmap() {
  const src = path.join(ROOT, 'assets/data/v50.tools.feature-roadmap.json');
  let raw = { items: [] };
  if (fs.existsSync(src)) raw = JSON.parse(fs.readFileSync(src, 'utf8'));
  const visitorKeys = new Set(['domain_dns_ssl','url_redirect_phishing','sports_odds_math','casino_live_math','slot_rtp_variance','minigame_probability','bonus_rolling_payout','security_privacy','forms_inputs']);
  const operatorKeys = new Set(['content_seo_blog','technical_audit_build','performance_cwv','accessibility_ui','analytics_ga4','search_indexing','data_management','visual_regression']);
  const integratedTitles = new Set(implementedTools.map(t => t.title.replace(/\s+/g,'').toLowerCase()));
  const items = (raw.items || []).map(it => {
    const norm = String(it.title || '').replace(/\s+/g,'').toLowerCase();
    let bucket = visitorKeys.has(it.category_key) ? 'visitor_candidate' : operatorKeys.has(it.category_key) ? 'internal_ops' : 'backlog';
    if (it.category_key === 'vendor_partner_ops' || it.category_key === 'consult_flow') bucket = 'conversion_support';
    if (it.category_key === 'future_ai_assist') bucket = 'future_ai_backlog';
    const implemented = [...integratedTitles].some(x => norm.includes(x.slice(0, Math.min(8, x.length))) || x.includes(norm.slice(0, Math.min(8, norm.length))));
    return { ...it, v51_bucket: bucket, v51_visibility: bucket === 'visitor_candidate' ? 'tools_candidate' : 'not_on_public_tools_index', v51_note: implemented ? 'implemented_or_covered_by_v51_core_tool' : 'candidate_after_duplicate_review' };
  });
  const counts = items.reduce((acc, it) => (acc[it.v51_bucket] = (acc[it.v51_bucket] || 0) + 1, acc), {});
  write('assets/data/v51.user-facing-tools.json', JSON.stringify({
    version: VERSION_BASE,
    generatedAt: new Date().toISOString(),
    policy: 'V51은 방문자가 바로 계산·확인할 수 있는 도구만 /tools/ 전면에 노출합니다. 운영자 QA·빌드·GA4·시각회귀 도구는 내부 후보로 분리합니다.',
    implementedTools,
    implementedCount: implementedTools.length,
    sourceRoadmap: 'assets/data/v50.tools.feature-roadmap.json',
    roadmapTotal: items.length,
    buckets: counts,
    items
  }, null, 2));
}
classifyRoadmap();

const providerCards = providers.map(p => `<a class="v50-provider-mini-card v51-provider-mini-card" href="${p.detail}" aria-label="${esc(p.name)} 상세보기"><img alt="${esc(p.name)} 로고" decoding="async" loading="lazy" src="${p.img}" width="320" height="120"/><span>${esc(p.name)}</span><small>${esc(p.label)}</small></a>`).join('\n');

const toolCards = implementedTools.map((t, idx) => `<button class="v51-tool-card${idx===0?' is-active':''}" type="button" data-v51-open="${t.id}"><span>${esc(t.group)}</span><strong>${esc(t.title)}</strong><small>${esc(t.summary)}</small></button>`).join('\n');

const relatedLinks = (links) => links.map((href, idx) => `<a href="${href}">${idx===0 ? '관련 도구' : '관련 글'} →</a>`).join('');
const panels = implementedTools.map((t, idx) => `<section class="v51-tool-panel${idx===0?' is-active':''}" id="tool-${t.id}" data-v51-panel="${t.id}">
  <div class="v51-panel-head"><span>${esc(t.group)}</span><h2>${esc(t.title)}</h2><p>${esc(t.summary)}</p></div>
  <div class="v51-tool-form" data-v51-form="${t.id}">${formFor(t.id)}</div>
  <output class="v51-tool-result" data-v51-result="${t.id}">값을 입력하면 계산 결과가 여기에 표시됩니다.</output>
  <div class="v51-tool-related">${relatedLinks(t.related)}</div>
</section>`).join('\n');

function input(label, name, type='number', value='', extra='') {
  return `<label><span>${esc(label)}</span><input name="${name}" type="${type}" value="${esc(value)}" ${extra}/></label>`;
}
function select(label, name, opts) {
  return `<label><span>${esc(label)}</span><select name="${name}">${opts.map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select></label>`;
}
function formFor(id) {
  const providerOpts = [
    {value:'queenbee|seoa', label:'여왕벌 / seoa'},
    {value:'sk-holdings|IRON888', label:'SK 홀딩스 / IRON888'},
    {value:'anybet|seoa', label:'ANYBET / seoa'},
    {value:'udt|SEOA', label:'UDT / SEOA'},
    {value:'ddangkong|ddk888', label:'땅콩 / ddk888'}
  ];
  const map = {
    'official-url': `${input('확인할 URL','url','url','https://qb-700.com/?code=seoa')} ${input('기준 도메인','base','text','qb-700.com')}`,
    'join-code': `${select('업체 선택','provider',providerOpts)} ${input('입력 코드','code','text','seoa')}`,
    'bonus-net': `${input('입금액','deposit','number','100000')} ${input('보너스율 %','bonusRate','number','50')} ${input('롤링 배수','rolling','number','5')} ${input('인정 비율 %','contribution','number','100')}`,
    'rolling': `${input('기준 금액','base','number','150000')} ${input('롤링 배수','multiple','number','5')} ${input('진행 배팅액','progress','number','300000')} ${input('인정 비율 %','contribution','number','100')}`,
    'withdraw': `${input('현재 잔액','balance','number','250000')} ${input('최대 출금 한도','cap','number','500000')} ${input('남은 롤링','remaining','number','0')}`,
    'first-recurring': `${input('입금액','deposit','number','100000')} ${input('첫충율 %','firstRate','number','40')} ${input('첫충 롤링','firstRolling','number','5')} ${input('매충율 %','recRate','number','10')} ${input('매충 롤링','recRolling','number','3')}`,
    'overround': `${input('소수 배당 목록','odds','text','1.91, 1.91')}`,
    'ev': `${input('소수 배당','odds','number','1.95','step="0.01"')} ${input('내 추정 확률 %','prob','number','53','step="0.1"')}`,
    'combo': `${input('배당 목록','odds','text','1.72, 1.86, 2.05')} ${input('투입 금액','stake','number','50000')}`,
    'slot-rtp': `${input('회전당 금액','stake','number','1000')} ${input('회전 수','spins','number','300')} ${input('RTP %','rtp','number','96','step="0.01"')}`,
    'martingale': `${input('기준 배팅액','base','number','10000')} ${input('배수','multiplier','number','2','step="0.1"')} ${input('보유 자본','bankroll','number','500000')} ${input('단일 승률 %','winProb','number','50','step="0.1"')}`,
    'phishing': `${input('기준 도메인','base','text','qb-700.com')} ${input('검사 URL','url','url','https://q-b700.com/login')}`
  };
  return `${map[id] || ''}<button type="button" data-v51-calc="${id}">계산 / 확인</button>`;
}

const main = `<main class="moon-shell v51-tools-shell" id="mainContent">
  <section class="moon-container v51-tools-app" data-v51-tools-app>
    <div class="v51-tools-topline">
      <div><span>USER TOOLS</span><h1>도구</h1><p>방문자가 바로 입력하고 결과를 확인할 수 있는 계산기·확인기만 전면에 배치했습니다.</p></div>
      <div class="v51-tools-search"><input type="search" id="v51ToolSearch" placeholder="도구명, 배당, 롤링, URL 검색" aria-label="도구 검색"/><small>12개 실사용 도구</small></div>
    </div>
    <div class="v51-tools-layout">
      <aside class="v51-tool-list" aria-label="실사용 도구 목록">${toolCards}</aside>
      <div class="v51-tool-panels">${panels}</div>
    </div>
    <section class="v51-public-roadmap" aria-label="다음 구현 후보">
      <div><span>ROADMAP</span><h2>다음 구현 후보</h2><p>V50의 500건 후보는 방문자용·운영자용·보류로 재분류했습니다. /tools/ 전면에는 방문자가 직접 쓰는 기능만 확장합니다.</p></div>
      <ul><li>보너스·롤링·출금 계산 고도화</li><li>스포츠 배당 EV·오버라운드 계산 세분화</li><li>슬롯 RTP·분산·보너스 구매 계산 확장</li><li>주소·도메인·피싱 URL 공개 신호 확인 강화</li></ul>
    </section>
    <section class="moon-section v37-provider-strip v38-tools-provider-strip v50-tools-provider-strip v51-tools-provider-strip">
      <div class="moon-section-head"><h2>보증업체</h2><a href="/guaranteed/">전체 보기 →</a></div>
      <div aria-label="보증업체 상세 랜딩 빠른 이동" class="v50-provider-row v51-provider-row">${providerCards}</div>
    </section>
    <section class="v51-legacy-tools"><h2>기존 도구 바로가기</h2><div><a href="/tools/inquiry-builder/">문의 문구 만들기</a><a href="/tools/code-check/">가입코드 확인</a><a href="/tools/official-check/">공식주소 확인</a><a href="/tools/event-checker/">이벤트 조건 확인</a><a href="/tools/payout-kit/">출금 전 자료 정리</a><a href="/tools/ai-game-lab/">게임 조건 해석</a></div></section>
  </section>
</main>`;

// Tools index rebuild
{
  let html = read('tools/index.html');
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>도구 | 실사용 계산기·주소·코드 확인</title>');
  html = html.replace(/<body class="([^"]*)"/, (m, cls) => `<body class="${cls.includes('v51-tools-index') ? cls : cls + ' v51-tools-index'}"`);
  html = html.replace(/<meta name="description" content="[^"]*"\/>/, '<meta name="description" content="공식주소, 가입코드, 보너스, 롤링, 출금, 스포츠 배당, 슬롯 RTP, 파워볼 위험도를 한 화면에서 계산하고 확인하는 실사용 도구 모음입니다."/>');
  html = html.replace(/<meta property="og:title" content="[^"]*"\/>/, '<meta property="og:title" content="도구 | 실사용 계산기·주소·코드 확인"/>');
  html = html.replace(/<meta property="og:description" content="[^"]*"\/>/, '<meta property="og:description" content="주소·코드 확인부터 보너스·롤링·스포츠 배당·슬롯 RTP 계산까지 방문자가 바로 쓰는 도구를 제공합니다."/>');
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\/>/, '<meta name="twitter:title" content="도구 | 실사용 계산기·주소·코드 확인"/>');
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\/>/, '<meta name="twitter:description" content="주소·코드 확인부터 보너스·롤링·스포츠 배당·슬롯 RTP 계산까지 방문자가 바로 쓰는 도구를 제공합니다."/>');
  html = html.replace(/<script type="application\/ld\+json" data-v36-schema="primary">[\s\S]*?<\/script>/, `<script type="application/ld+json" data-v36-schema="primary">${JSON.stringify({
    '@context':'https://schema.org', '@graph':[
      {'@type':'Organization','@id':'https://88st.cloud/#organization','name':'88ST.Cloud','url':'https://88st.cloud/','logo':'https://88st.cloud/img/logo-v24.png'},
      {'@type':'WebSite','@id':'https://88st.cloud/#website','url':'https://88st.cloud/','name':'88ST.Cloud','publisher':{'@id':'https://88st.cloud/#organization'}},
      {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'홈','item':'https://88st.cloud/'},{'@type':'ListItem','position':2,'name':'도구','item':'https://88st.cloud/tools/'}]},
      {'@type':'WebPage','@id':'https://88st.cloud/tools/#webpage','url':'https://88st.cloud/tools/','name':'도구 | 실사용 계산기·주소·코드 확인','description':'공식주소, 가입코드, 보너스, 롤링, 출금, 스포츠 배당, 슬롯 RTP, 파워볼 위험도를 한 화면에서 계산하고 확인하는 실사용 도구 모음입니다.','isPartOf':{'@id':'https://88st.cloud/#website'}},
      {'@type':'ItemList','@id':'https://88st.cloud/tools/#tools','name':'88ST.Cloud 실사용 도구','numberOfItems':implementedTools.length,'itemListElement':implementedTools.map((t,i)=>({'@type':'ListItem','position':i+1,'name':t.title,'url':'https://88st.cloud/tools/#tool-'+t.id}))}
    ]
  })}</script>`);
  html = html.replace(/<main\b(?=[^>]*id="mainContent")[^>]*>[\s\S]*?<\/main>/, main);
  if (!/assets\/js\/v51\.tools\.js/.test(html)) html = html.replace('</body>', '<script defer src="/assets/js/v51.tools.js?v=static-growth-conversion-v51-20260522"></script></body>');
  html = html.replace(/static-growth-conversion-v\d+-\d+/g, VERSION_BASE);
  write('tools/index.html', html);
}

// V51 JS
write('assets/js/v51.tools.js', `(() => {
  const money = (n) => Number.isFinite(n) ? Math.round(n).toLocaleString('ko-KR') + '원' : '-';
  const pct = (n) => Number.isFinite(n) ? n.toFixed(2) + '%' : '-';
  const num = (form, name, fallback=0) => {
    const v = Number((form.querySelector('[name="'+name+'"]') || {}).value);
    return Number.isFinite(v) ? v : fallback;
  };
  const val = (form, name) => ((form.querySelector('[name="'+name+'"]') || {}).value || '').trim();
  const parseOdds = (s) => String(s || '').split(/[,\\s]+/).map(Number).filter(n => Number.isFinite(n) && n > 1);
  const hostOf = (u) => { try { return new URL(u.includes('://') ? u : 'https://' + u).hostname.toLowerCase(); } catch { return ''; } };
  const dist = (a,b) => { a=a||''; b=b||''; const dp=Array.from({length:a.length+1},(_,i)=>[i]); for(let j=1;j<=b.length;j++) dp[0][j]=j; for(let i=1;i<=a.length;i++){ for(let j=1;j<=b.length;j++){ dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); } } return dp[a.length][b.length]; };
  const render = (id, html) => { const out = document.querySelector('[data-v51-result="'+id+'"]'); if (out) out.innerHTML = html; };
  const riskUrl = (url, base) => {
    const h = hostOf(url), b = hostOf(base || url) || String(base||'').toLowerCase();
    const flags = [];
    if (!String(url || '').toLowerCase().startsWith('https://')) flags.push('HTTPS 아님 또는 스킴 누락');
    if (h.includes('xn--')) flags.push('punycode 도메인');
    if (h && b && h !== b && !h.endsWith('.'+b)) flags.push('기준 도메인과 불일치');
    if ((h.match(/-/g)||[]).length >= 2) flags.push('하이픈 과다');
    if (/0|1|3|5|7/.test(h.replace(b,''))) flags.push('숫자 치환 가능성');
    if (h.split('.').length > b.split('.').length + 1) flags.push('서브도메인 단계 과다');
    const d = dist(h.replace(/[^a-z0-9]/g,''), b.replace(/[^a-z0-9]/g,''));
    return {h,b,flags,d};
  };
  const calcs = {
    'official-url': (f) => { const r=riskUrl(val(f,'url'), val(f,'base')); render('official-url', '<strong>도메인:</strong> '+(r.h||'-')+'<br><strong>기준:</strong> '+(r.b||'-')+'<br><strong>문자열 거리:</strong> '+r.d+'<br><strong>확인 신호:</strong> '+(r.flags.length?r.flags.join(' · '):'큰 변조 신호 없음')); },
    'join-code': (f) => { const [provider,code]=(val(f,'provider')||'|').split('|'); const input=val(f,'code'); const ok=input.toLowerCase()===String(code).toLowerCase(); render('join-code','<strong>'+provider+'</strong><br>기준 코드: <b>'+code+'</b><br>입력 코드: <b>'+input+'</b><br>결과: '+(ok?'일치':'불일치 또는 대소문자/공백 확인 필요')); },
    'bonus-net': (f) => { const dep=num(f,'deposit'), br=num(f,'bonusRate')/100, roll=num(f,'rolling'), c=Math.max(num(f,'contribution')/100,0.01); const bonus=dep*br,total=dep+bonus, turnover=total*roll/c; render('bonus-net','보너스: <b>'+money(bonus)+'</b><br>총 크레딧: <b>'+money(total)+'</b><br>필요 롤링: <b>'+money(turnover)+'</b><br>공식: (입금+보너스) × 롤링 ÷ 인정비율'); },
    'rolling': (f) => { const base=num(f,'base'), m=num(f,'multiple'), p=num(f,'progress'), c=Math.max(num(f,'contribution')/100,0.01); const need=base*m/c, done=p*c, remain=Math.max(need-done,0); render('rolling','필요 롤링: <b>'+money(need)+'</b><br>인정 진행액: <b>'+money(done)+'</b><br>남은 롤링: <b>'+money(remain)+'</b>'); },
    'withdraw': (f) => { const bal=num(f,'balance'), cap=num(f,'cap'), rem=num(f,'remaining'); const possible=rem>0?0:Math.min(bal, cap || bal); render('withdraw','현재 잔액: <b>'+money(bal)+'</b><br>최대 한도 반영: <b>'+money(cap||bal)+'</b><br>남은 롤링: <b>'+money(rem)+'</b><br>즉시 출금 가능 추정: <b>'+money(possible)+'</b>'); },
    'first-recurring': (f) => { const dep=num(f,'deposit'), fr=num(f,'firstRate')/100, rr=num(f,'recRate')/100, froll=num(f,'firstRolling'), rroll=num(f,'recRolling'); const fb=dep*fr, rb=dep*rr; render('first-recurring','첫충 보너스: <b>'+money(fb)+'</b> / 필요 롤링: <b>'+money((dep+fb)*froll)+'</b><br>매충 보너스: <b>'+money(rb)+'</b> / 필요 롤링: <b>'+money((dep+rb)*rroll)+'</b><br>차이: 보너스 '+money(fb-rb)+', 롤링 '+money(((dep+fb)*froll)-((dep+rb)*rroll))); },
    'overround': (f) => { const odds=parseOdds(val(f,'odds')); const sum=odds.reduce((a,o)=>a+1/o,0); const margin=(sum-1)*100; const payout=100/sum; render('overround','입력 배당: '+odds.join(' / ')+'<br>내재확률 합계: <b>'+pct(sum*100)+'</b><br>오버라운드: <b>'+pct(margin)+'</b><br>환수율 추정: <b>'+pct(payout)+'</b>'); },
    'ev': (f) => { const o=num(f,'odds'), p=num(f,'prob')/100; const ev=(o*p-1)*100; render('ev','손익분기 확률: <b>'+pct(100/o)+'</b><br>공정 배당: <b>'+(p>0?(1/p).toFixed(3):'-')+'</b><br>EV: <b>'+pct(ev)+'</b>'); },
    'combo': (f) => { const odds=parseOdds(val(f,'odds')); const stake=num(f,'stake'); const total=odds.reduce((a,o)=>a*o,1); const payout=stake*total; render('combo','총 조합 배당: <b>'+total.toFixed(3)+'</b><br>예상 지급액: <b>'+money(payout)+'</b><br>순손익: <b>'+money(payout-stake)+'</b>'); },
    'slot-rtp': (f) => { const stake=num(f,'stake'), spins=num(f,'spins'), rtp=num(f,'rtp')/100; const total=stake*spins, ret=total*rtp; render('slot-rtp','총 투입액: <b>'+money(total)+'</b><br>이론 환급: <b>'+money(ret)+'</b><br>이론 손실: <b>'+money(total-ret)+'</b><br>단기 결과는 분산 때문에 크게 달라질 수 있습니다.'); },
    'martingale': (f) => { const base=num(f,'base'), mul=num(f,'multiplier'), bank=num(f,'bankroll'), p=num(f,'winProb')/100, q=1-p; let need=0, step=0, bet=base; while(need+bet<=bank && step<50){ need+=bet; bet*=mul; step++; } const ruin=Math.pow(q, Math.max(step,1))*100; render('martingale','감당 가능 연속 단계: <b>'+step+'단계</b><br>해당 단계 누적 필요 자본: <b>'+money(need)+'</b><br>다음 배팅액: <b>'+money(bet)+'</b><br>단순 연패 위험: <b>'+pct(ruin)+'</b>'); },
    'phishing': (f) => { const r=riskUrl(val(f,'url'), val(f,'base')); render('phishing','검사 도메인: <b>'+(r.h||'-')+'</b><br>기준 도메인: <b>'+(r.b||'-')+'</b><br>문자열 거리: <b>'+r.d+'</b><br>변조 신호: <b>'+(r.flags.length?r.flags.join(' · '):'큰 변조 신호 없음')+'</b>'); }
  };
  document.addEventListener('click', (e) => {
    const open=e.target.closest('[data-v51-open]');
    if(open){ const id=open.dataset.v51Open; document.querySelectorAll('[data-v51-open]').forEach(x=>x.classList.toggle('is-active',x===open)); document.querySelectorAll('[data-v51-panel]').forEach(x=>x.classList.toggle('is-active',x.dataset.v51Panel===id)); }
    const calc=e.target.closest('[data-v51-calc]');
    if(calc){ const id=calc.dataset.v51Calc; const form=calc.closest('[data-v51-form]'); if(calcs[id]) calcs[id](form); }
  });
  document.addEventListener('input', (e) => {
    if(e.target && e.target.id==='v51ToolSearch'){
      const q=e.target.value.trim().toLowerCase();
      document.querySelectorAll('.v51-tool-card').forEach(card=>{ card.hidden=q && !card.textContent.toLowerCase().includes(q); });
    }
  });
  document.querySelectorAll('[data-v51-calc]').forEach(btn => btn.click());
})();
`);

// CSS
{
  const cssPath = 'assets/css/growth-conversion.v36.css';
  let css = read(cssPath);
  css = css.replace(/\/\* V51 USER FACING TOOLS START \*\/[\s\S]*?\/\* V51 USER FACING TOOLS END \*\//, '').trimEnd();
  css += `
/* V51 USER FACING TOOLS START */
body.v51-tools-index{background:#050b13!important;color:#e8eef8!important;}
.v51-tools-shell{padding:22px 0 48px;}
.v51-tools-app{width:min(1180px,calc(100% - 28px));margin:0 auto;}
.v51-tools-topline{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,390px);gap:16px;align-items:end;margin:0 0 16px;padding:18px;border:1px solid rgba(255,255,255,.10);border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.025));box-shadow:0 22px 70px rgba(0,0,0,.28);}
.v51-tools-topline span,.v51-public-roadmap span{font-size:11px;letter-spacing:.12em;font-weight:950;color:#9bdcff;}
.v51-tools-topline h1{margin:4px 0 6px;font-size:clamp(28px,4vw,48px);line-height:1.02;color:#fff8e9!important;}
.v51-tools-topline p{margin:0;color:#b8c7d9;line-height:1.55;}
.v51-tools-search{display:grid;gap:8px;}
.v51-tools-search input{width:100%;min-height:46px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(4,10,18,.72);color:#fff;padding:0 14px;outline:none;}
.v51-tools-search small{color:#f1d59b;font-weight:800;}
.v51-tools-layout{display:grid;grid-template-columns:minmax(250px,320px) minmax(0,1fr);gap:16px;align-items:start;}
.v51-tool-list{display:grid;gap:10px;position:sticky;top:92px;}
.v51-tool-card{border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.045);color:#dce8f7;text-align:left;padding:13px;cursor:pointer;transition:.18s ease;}
.v51-tool-card:hover,.v51-tool-card.is-active{border-color:rgba(232,189,104,.58);background:rgba(232,189,104,.10);transform:translateY(-1px);}
.v51-tool-card span{display:block;color:#8bd8ff;font-size:11px;font-weight:900;letter-spacing:.06em;margin-bottom:4px;}
.v51-tool-card strong{display:block;color:#fff7e8;font-size:15px;line-height:1.25;margin-bottom:5px;}
.v51-tool-card small{display:block;color:#a9b7ca;line-height:1.45;}
.v51-tool-panels{min-width:0;}
.v51-tool-panel{display:none;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.03)),rgba(6,12,22,.80);padding:20px;box-shadow:0 24px 80px rgba(0,0,0,.32);}
.v51-tool-panel.is-active{display:block;}
.v51-panel-head span{color:#f1d59b;font-size:12px;font-weight:950;letter-spacing:.08em;}
.v51-panel-head h2{margin:6px 0 8px;color:#fff8e9!important;font-size:clamp(22px,3vw,32px)!important;}
.v51-panel-head p{margin:0 0 16px;color:#b8c7d9;line-height:1.65;}
.v51-tool-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.v51-tool-form label{display:grid;gap:6px;color:#b8c7d9;font-size:13px;font-weight:800;}
.v51-tool-form input,.v51-tool-form select{min-height:44px;border:1px solid rgba(255,255,255,.13);border-radius:13px;background:rgba(2,7,14,.72);color:#fff;padding:0 12px;}
.v51-tool-form button{grid-column:1/-1;min-height:48px;border:0;border-radius:14px;background:linear-gradient(180deg,#f3d89a,#bf8639);color:#171009;font-weight:950;cursor:pointer;}
.v51-tool-result{display:block;margin-top:14px;padding:16px;border:1px solid rgba(139,216,255,.20);border-radius:16px;background:rgba(3,10,20,.82);color:#dfeeff;line-height:1.8;}
.v51-tool-result b,.v51-tool-result strong{color:#fff3d2;}
.v51-tool-related{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}
.v51-tool-related a,.v51-legacy-tools a{display:inline-flex;align-items:center;min-height:34px;padding:0 11px;border:1px solid rgba(255,255,255,.13);border-radius:999px;color:#dce8f7!important;text-decoration:none;background:rgba(255,255,255,.045);}
.v51-public-roadmap,.v51-legacy-tools{margin:18px 0;padding:18px;border:1px solid rgba(255,255,255,.10);border-radius:22px;background:rgba(255,255,255,.04);}
.v51-public-roadmap{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,420px);gap:16px;}
.v51-public-roadmap h2,.v51-legacy-tools h2{margin:4px 0 8px;color:#fff8e9!important;}
.v51-public-roadmap p{margin:0;color:#b8c7d9;line-height:1.6;}
.v51-public-roadmap ul{margin:0;padding-left:18px;color:#dce8f7;line-height:1.8;}
.v51-provider-row{grid-template-columns:repeat(5,minmax(0,1fr));}
.v51-provider-mini-card{min-height:98px;}
.v51-legacy-tools div{display:flex;flex-wrap:wrap;gap:8px;}
@media(max-width:900px){.v51-tools-topline,.v51-tools-layout,.v51-public-roadmap{grid-template-columns:1fr}.v51-tool-list{position:relative;top:auto;grid-template-columns:repeat(2,minmax(0,1fr));}.v51-provider-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));}.v51-tool-form{grid-template-columns:1fr;}}
@media(max-width:520px){.v51-tools-app{width:min(100% - 18px,1180px)}.v51-tool-list{grid-template-columns:1fr}.v51-provider-row{grid-template-columns:1fr}.v51-tools-topline,.v51-tool-panel,.v51-public-roadmap,.v51-legacy-tools{padding:14px;border-radius:18px;}}
/* V51 USER FACING TOOLS END */
`;
  write(cssPath, css);
}

// Deploy check + package-visible version refresh
{
  const checkPath = 'assets/data/deploy-check.urls.v36.json';
  let data = { checkUrls: [] };
  if (fs.existsSync(path.join(ROOT, checkPath))) data = JSON.parse(read(checkPath));
  data.version = VERSION_BASE;
  data.generatedAt = new Date().toISOString();
  data.checkUrls = [
    `https://88st.cloud/?v=${VERSION_BASE}`,
    `https://88st.cloud/blog/?v=${VERSION_BASE}`,
    `https://88st.cloud/tools/?v=${VERSION_BASE}`,
    `https://88st.cloud/guaranteed/?v=${VERSION_BASE}`,
    `https://88st.cloud/guaranteed/queenbee/?v=${VERSION_BASE}`,
    `https://88st.cloud/consult/?v=${VERSION_BASE}`,
    `https://88st.cloud/sitemap.xml?v=${VERSION_BASE}`,
    `https://88st.cloud/robots.txt?v=${VERSION_BASE}`
  ];
  write(checkPath, JSON.stringify(data, null, 2));
}

// Cache version references across HTML/CSS query strings
for (const f of walk(ROOT)) {
  if (!/\.(html|css|js|json|txt|xml|mjs)$/.test(f)) continue;
  const rel = path.relative(ROOT, f).replaceAll(path.sep, '/');
  if (rel.startsWith('node_modules/')) continue;
  let txt = fs.readFileSync(f, 'utf8');
  const next = txt.replace(/static-growth-conversion-v(3[6-9]|4\d|50)-\d{8,14}/g, VERSION_BASE);
  if (next !== txt) fs.writeFileSync(f, next, 'utf8');
}

console.log('V51 user-facing tools rebuilt:', implementedTools.length, 'tools');
