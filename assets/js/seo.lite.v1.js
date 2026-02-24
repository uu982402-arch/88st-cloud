/* 88ST.Cloud - SEO Keyword Tool (Lite, public, zero-cost)
 * No external API. Generates keyword clusters + title/meta drafts locally.
 */
(function(){
  'use strict';

  var ADV_KEY = 'seoLite_adv_open_v1';

  var $ = function(sel, root){ return (root||document).querySelector(sel); };
  var $$ = function(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); };

  function uniq(arr){
    var seen = Object.create(null);
    var out = [];
    for (var i=0;i<arr.length;i++){
      var v = String(arr[i] || '').trim();
      if(!v) continue;
      if(seen[v]) continue;
      seen[v]=1;
      out.push(v);
    }
    return out;
  }

  function pickN(arr, n){
    var a = arr.slice();
    // Fisher–Yates shuffle (deterministic-ish by seed if needed)
    for (var i=a.length-1;i>0;i--){
      var j = Math.floor(Math.random()*(i+1));
      var t=a[i]; a[i]=a[j]; a[j]=t;
    }
    return a.slice(0, Math.max(0, Math.min(n, a.length)));
  }

  function toToast(msg){
    var el = $('#seoLiteToast');
    if(!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toToast._t);
    toToast._t = setTimeout(function(){ el.classList.remove('on'); }, 1100);
  }

  async function copyText(text){
    try{
      if (navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(text);
        return true;
      }
    }catch(e){}

    try{
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly','');
      ta.style.position='fixed';
      ta.style.left='-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      return true;
    }catch(e){
      return false;
    }
  }

  function downloadText(filename, text){
    try{
      var blob = new Blob([text], {type:'text/plain;charset=utf-8'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function(){
        URL.revokeObjectURL(url);
        a.remove();
      }, 30);
    }catch(e){}
  }

  var BANK = {
    // Core
    sports: {
      base: [
        '스포츠 분석', '배당 분석', '오즈무브', '공정배당', '오버라운드',
        'EV 계산', '켈리 기준', '마진 계산', '배당 확률 변환',
        '핸디캡', '오버언더', '승무패', '승률', '리스크 관리', 'ROI',
        '라인 변동', '배당 흐름', '시장 마진'
      ],
      niche: ['토토', '온라인 스포츠', '스포츠픽', '배당 계산기', '픽 분석', '스포츠 배팅', '고배당', '언더독']
    },
    soccer: {
      base: ['축구 분석', '축구 배당', '승무패 예측', '오버언더 기준', '핸디캡 기준', '득점 기대값', '라인업 변수'],
      niche: ['EPL', '챔피언스리그', 'K리그', '유럽축구', '축구픽']
    },
    basketball: {
      base: ['농구 분석', '농구 배당', '스프레드 기준', '토탈 기준', '페이스', '공격/수비 효율', '라인 변동'],
      niche: ['NBA', 'KBL', 'NCAA', '농구픽']
    },
    baseball: {
      base: ['야구 분석', '야구 배당', '선발 매치업', '불펜 변수', '득점 기대', '오버언더 기준'],
      niche: ['KBO', 'MLB', 'NPB', '야구픽']
    },
    esports: {
      base: ['e스포츠 분석', '맵/밴픽 변수', '2-way 배당', '승패 예측', '라인 변동'],
      niche: ['LOL', '발로란트', 'CS2', '도타', 'e스포츠픽']
    },

    // Casino
    casino: {
      base: ['카지노 확률', '하우스엣지', '세션 관리', '뱅크롤', '룰렛', '블랙잭', '리스크 관리'],
      niche: ['온라인카지노', '카지노 맛집', '카지노 추천', '입플', '롤링']
    },
    baccarat: {
      base: ['바카라 전략', '바카라 확률', '추세/흐름', '플레이어/뱅커', '타이/페어', '진입 타이밍'],
      niche: ['바카라 가이드', '바카라 패턴', '바카라 계산기']
    },
    slot: {
      base: ['슬롯 RTP', '슬롯 변동성', '맥스윈', '프라그마틱 RTP', '슬롯 분석', 'RTP 확인'],
      niche: ['슬롯맛집', '슬롯 추천', 'RTP 높은 슬롯', '프라그마틱 슬롯']
    },
    minigame: {
      base: ['미니게임 분석', '확률 추정', '연속/편차', '다음 확률', '리스크 태그', '승률 관리'],
      niche: ['미니게임맛집', '미니게임 추천', '사다리', '파워볼', '하이로우']
    },

    // Promo / Community
    promo: {
      base: ['인증 사이트', '가입 코드', '보너스 조건', '롤링 규정', '출금 규정', '가입 혜택', '이벤트'],
      niche: ['안전한 토토사이트', '안전 토토', '온라인카지노 추천', '입플사이트', '먹튀검증']
    },
    community: {
      base: ['텔레그램 봇', '그룹 운영', '공지 자동화', '분석 봇', '브리핑', '운영 세팅'],
      niche: ['텔레그램 스포츠 분석', '그룹 운영자', '스포츠 분석 봇', '자동 공지']
    }
  };

  var INTENT = {
    howto: ['사용법', '하는법', '가이드', '정리', '예시', '입문'],
    calc: ['계산기', '계산', '변환', '공식', '자동 계산', '표'],
    strategy: ['전략', '룰', '체크리스트', '리스크', '기준', '팁'],
    review: ['추천', '비교', 'top', 'best', '선택', '후기'],
    definition: ['뜻', '정의', '개념', '용어', '의미'],
    faq: ['FAQ', '문제해결', '오류', '자주 묻는 질문', '해결 방법'],
    safety: ['안전', '검증', '주의', '체크', '주의사항'],
    bonus: ['보너스', '이벤트', '혜택', '프로모션', '가입 혜택']
  };

  var MOD = {
    luxe: ['정확한', '빠른', '깔끔한', '실전', '고급'],
    pro: ['데이터', '근거', '지표', '모델', '확률'],
    short: ['한눈에', '요약', '핵심', '3분', '간단'],
    newbie: ['초보', '입문', '쉬운', '처음', '기초'],
    mobile: ['모바일', '간단', '원클릭', '빠른 입력'],
    sales: ['혜택', '추천', '무료', '즉시', '확인'],
    calm: ['신뢰', '안정', '정리', '원칙', '안전']
  };

  function normalizeQuery(q){
    var s = String(q || '').replace(/\s+/g,' ').trim();
    if(!s) return '';
    // cut extreme length
    if(s.length > 48) s = s.slice(0,48).trim();
    return s;
  }

  function buildKeywords(catKey, intentKey, toneKey, limit, query){
    var cat = BANK[catKey] || BANK.sports;
    var intent = INTENT[intentKey] || INTENT.howto;
    var mod = MOD[toneKey] || MOD.luxe;

    var q = normalizeQuery(query);

    var bases = uniq(cat.base.concat(cat.niche));
    if(q){
      // allow multi token ("A / B" or "A, B")
      var parts = q.split(/[\/\,\|]+/g).map(function(x){return String(x||'').trim();}).filter(Boolean);
      if(parts.length){ bases = uniq(parts.concat(bases)); }
      else { bases = uniq([q].concat(bases)); }
    }
    var intents = uniq(intent);
    var mods = uniq(mod);

    // pick subsets to keep output tight
    var bPick = pickN(bases, Math.min(10, bases.length));
    var iPick = pickN(intents, Math.min(5, intents.length));
    var mPick = pickN(mods, Math.min(5, mods.length));

    var out = [];

    // Core
    bPick.forEach(function(b){
      out.push(b);
      iPick.forEach(function(i){ out.push(b + ' ' + i); });
    });

    // Longtail
    bPick.forEach(function(b){
      mPick.forEach(function(m){
        out.push(m + ' ' + b);
        iPick.forEach(function(i){ out.push(m + ' ' + b + ' ' + i); });
      });
    });

    // Compact variations
    bPick.forEach(function(b){
      out.push(b.replace(/\s+/g,'') + ' 가이드');
      out.push(b.replace(/\s+/g,'') + ' 계산기');
    });

    // If query is provided, make sure it appears and expands
    if(q){
      var qParts = q.split(/[\/\,\|]+/g).map(function(x){return String(x||'').trim();}).filter(Boolean);
      (qParts.length ? qParts : [q]).forEach(function(seed){
        out.push(seed);
        iPick.forEach(function(i){ out.push(seed + ' ' + i); });
        mPick.forEach(function(m){ out.push(m + ' ' + seed); });
      });
    }

    out = uniq(out);

    // hard cap
    var lim = Number(limit || 120);
    if (out.length > lim) out = out.slice(0, lim);
    return out;
  }

  function primarySeed(catKey, query){
    var p = BANK[catKey] || BANK.sports;
    var q = normalizeQuery(query);
    if(q) return q.split(/[\/\,\|]+/g)[0].trim();
    // fallback: pick a more "search-like" seed
    var seed = (p && p.niche && p.niche[0]) ? p.niche[0] : ((p && p.base && p.base[0]) ? p.base[0] : '키워드');
    return String(seed || '키워드').trim();
  }

  function buildTitles(catKey, intentKey, toneKey, query){
    var base = primarySeed(catKey, query);
    var intent = intentKey || 'howto';
    var tone = toneKey || 'luxe';

    // intent-oriented title frames (community-friendly)
    var frames = {
      howto: [
        base + ' 사용법 한 번에 정리 (초보용)',
        base + ' 시작하기: 실수 줄이는 5단계',
        base + ' 이렇게 보면 편하다 (체크리스트)'
      ],
      calc: [
        base + ' 계산/변환 빠르게 하는 법 + 예시',
        base + ' 계산기 없이도 이해되는 핵심 공식',
        base + ' 숫자 입력할 때 자주 하는 실수 5가지'
      ],
      strategy: [
        base + ' 전략 체크리스트 (과몰입 방지 포함)',
        base + ' 리스크 줄이는 기준 7가지',
        base + ' 이 구간은 피하자: 위험 신호 정리'
      ],
      review: [
        base + ' 비교 포인트 6가지 (기준 먼저)',
        base + ' 선택할 때 보는 1순위/2순위',
        base + ' 초보가 자주 놓치는 함정 정리'
      ],
      definition: [
        base + ' 뜻/정의 — 1분 요약 + 예시',
        base + ' 개념을 딱 정리하면 이렇게',
        base + ' 헷갈리는 용어 차이 한 번에'
      ],
      faq: [
        base + ' FAQ: 자주 묻는 질문 10개',
        base + ' 잘 안 될 때 먼저 확인할 것',
        base + ' 오류/막힘 해결 체크리스트'
      ],
      safety: [
        base + ' 안전 체크: 이것만 보면 된다',
        base + ' 사칭/피싱 피하는 기준 7가지',
        base + ' 안전하게 쓰려면 꼭 확인할 항목'
      ],
      bonus: [
        base + ' 보너스/이벤트 볼 때 체크 6개',
        base + ' 혜택이 커 보여도 이건 확인',
        base + ' 규정(롤링/제한) 빠르게 보는 법'
      ]
    };

    var baseTitles = frames[intent] || frames.howto;

    // tone adjustments
    var toneAdd = {
      pro: ['(데이터 기준)', '(지표 기반)', '(확률/수치 중심)'],
      short: ['(핵심만)', '(요약)', '(3줄 정리)'],
      newbie: ['(초보용)', '(입문)', '(기초부터)'],
      mobile: ['(모바일)', '(원클릭)', '(간단 버전)'],
      sales: ['(혜택 확인)', '(추천 기준)', '(바로 적용)'],
      calm: ['(차분하게)', '(안전 중심)', '(원칙 정리)'],
      luxe: ['(실전)', '(깔끔 정리)', '(기준 위주)']
    };
    var adds = toneAdd[tone] || toneAdd.luxe;

    var out = [];
    baseTitles.forEach(function(t){ out.push(t); });
    adds.slice(0,3).forEach(function(a){
      out.push(base + ' ' + (INTENT[intent] && INTENT[intent][0] ? INTENT[intent][0] : '가이드') + ' ' + a);
    });
    // a couple of evergreen patterns
    out.push(base + ' 체크리스트: 지금 바로 확인');
    out.push(base + ' 정리 — 핵심/예시/주의사항');
    out.push(base + ' 관련 키워드 묶음(롱테일) 예시');

    return uniq(out);
  }

  function clampDesc(s, min, max){
    var t = String(s || '').replace(/\s+/g,' ').trim();
    if (t.length > max) t = t.slice(0, max-1).trim() + '…';
    if (t.length < min) {
      t = (t + ' — 88ST.Cloud에서 빠르게 생성').slice(0, max);
    }
    return t;
  }

  function buildDescriptions(catKey, intentKey, toneKey, query){
    var base = primarySeed(catKey, query);
    var intent = intentKey || 'howto';
    var tone = toneKey || 'luxe';

    var intentLine = {
      howto: '사용법/순서를 초보도 따라할 수 있게 정리합니다.',
      calc: '계산·변환 포인트와 예시를 함께 제공합니다.',
      strategy: '리스크를 줄이는 기준과 체크리스트를 제공합니다.',
      review: '비교·선택 기준을 정리해 빠르게 판단할 수 있게 돕습니다.',
      definition: '용어를 1분 안에 이해할 수 있도록 뜻/예시로 정리합니다.',
      faq: '자주 묻는 질문/실수/해결 방법을 한 번에 모았습니다.',
      safety: '사칭·피싱·주의 신호를 중심으로 안전 체크 포인트를 정리합니다.',
      bonus: '보너스/규정(롤링/제한/상한) 체크 포인트를 요약합니다.'
    };

    var toneLine = {
      pro: '데이터/지표 중심으로 짧게 요약합니다.',
      short: '핵심만 3~5줄로 요약합니다.',
      newbie: '초보 기준으로 쉬운 표현으로 정리합니다.',
      mobile: '모바일에서 읽기 쉬운 구조로 정리합니다.',
      sales: '바로 적용 가능한 체크 포인트에 집중합니다.',
      calm: '과장 없이 원칙과 기준만 담습니다.',
      luxe: '깔끔한 문장과 구조로 정리합니다.'
    };

    var d = [
      base + ' 관련 글을 쓰기 위한 키워드/제목/구조를 한 번에 뽑아드립니다. ' + (intentLine[intent]||intentLine.howto),
      base + ' 커뮤니티용 제목과 본문 템플릿을 생성합니다. ' + (toneLine[tone]||toneLine.luxe),
      '검색 의도에 맞춰 ' + base + ' 키워드 클러스터를 묶고, 글 구조(H2)까지 같이 제안합니다.',
      base + ' 글을 쓸 때 자주 하는 실수를 피하도록 체크리스트를 포함합니다.',
      base + ' 관련 키워드를 롱테일로 확장해, 게시글/가이드 주제를 자연스럽게 넓힙니다.'
    ];

    return uniq(d.map(function(x){ return clampDesc(x, 110, 155); }));
  }

  function buildCommunityPost(catKey, intentKey, toneKey, query, kwList, titleList){
    var base = primarySeed(catKey, query);
    var intent = intentKey || 'howto';
    var tone = toneKey || 'luxe';
    var title = (titleList && titleList.length) ? titleList[0] : (base + ' 정리');

    var related = (kwList || []).filter(function(k){ return k && k !== base; }).slice(0, 10);
    var relLine = related.length ? ('• ' + related.slice(0,6).join('\n• ')) : '• (생성된 키워드에서 보조 키워드를 골라 넣으세요)';

    // tone: how detailed should the body be
    var depth = (tone === 'short') ? 'short' : (tone === 'pro' ? 'pro' : 'base');

    var intro = {
      short: base + ' 관련해서 핵심만 짧게 정리합니다.\n',
      pro: base + ' 관련 글/정리할 때 “의도→구조→체크” 순서로 잡으면 내용이 흔들리지 않습니다.\n',
      base: base + ' 관련해서 자주 묻는 포인트를 커뮤니티용으로 정리했습니다.\n'
    };

    var blocks = [];
    blocks.push('제목: ' + title);
    blocks.push('');
    blocks.push(intro[depth] || intro.base);
    blocks.push('✅ 핵심 요약');
    if(intent === 'calc'){
      blocks.push('• 입력값(배당/확률/라인)을 먼저 정리하고, 변환/계산은 마지막에 합니다.');
      blocks.push('• 단위/소수점/2-way·3-way 구분만 맞아도 실수의 80%가 줄어듭니다.');
    }else if(intent === 'strategy'){
      blocks.push('• 기준을 먼저 정하고(리스크/상한), 그 다음에 케이스별로 적용합니다.');
      blocks.push('• “연속/감정 배팅”을 막는 장치(한도/쿨다운)가 있으면 결과가 안정적입니다.');
    }else if(intent === 'safety'){
      blocks.push('• 사칭/피싱은 “문의처 분산”에서 가장 많이 생깁니다. 공식 채널만 고정하세요.');
      blocks.push('• 혜택보다 규정(롤링/제한/상한/환전)을 먼저 확인하는 게 안전합니다.');
    }else if(intent === 'bonus'){
      blocks.push('• 보너스는 %보다 “롤링 배수/제한 게임/상한/환전 조건”이 핵심입니다.');
      blocks.push('• 조건이 복잡하면, 체크리스트로 한 번에 비교하는 게 가장 빠릅니다.');
    }else if(intent === 'definition'){
      blocks.push('• 용어는 “한 문장 정의 + 예시 1개”만 있어도 이해가 빨라집니다.');
      blocks.push('• 같은 단어라도 종목/마켓에 따라 의미가 달라질 수 있어요.');
    }else if(intent === 'faq'){
      blocks.push('• 막히는 지점은 대부분 입력값/규정/기본 개념에서 발생합니다.');
      blocks.push('• 질문은 “상황+숫자+목표” 3가지만 적어도 답이 빨라집니다.');
    }else{
      blocks.push('• 글 목적(가이드/체크/비교)을 1개로 고정하면 내용이 깔끔해집니다.');
      blocks.push('• 핵심 키워드 1개 + 보조 키워드 6~10개로 구조를 잡으면 확장도 쉽습니다.');
    }

    blocks.push('');
    blocks.push('📌 체크리스트');
    blocks.push('1) 목적 1개 고정(가이드/계산/전략/비교)');
    blocks.push('2) 핵심 키워드 1개 + 보조 6~10개 선택');
    blocks.push('3) H2 구조 5~7개로 먼저 뼈대 만들기');
    blocks.push('4) 과장/중복 문장 줄이고, 숫자/기준을 넣기');
    blocks.push('');
    blocks.push('🔎 같이 쓰기 좋은 관련 키워드');
    blocks.push(relLine);
    blocks.push('');
    blocks.push('댓글로 "어떤 상황"인지 적어주면 더 구체적으로 정리해드릴게요.');

    return blocks.join('\n');
  }

  function buildOutline(catKey, query){
    var p = BANK[catKey] || BANK.sports;
    var base = normalizeQuery(query) || (p.base[0] || '키워드');
    var out = [
      'H2: ' + base + ' 키워드 클러스터란?',
      'H2: 검색 의도(가이드/계산기/전략)별 구조',
      'H2: 초보가 많이 쓰는 제목 패턴 7가지',
      'H2: 메타 설명(Description) 120~155자 작성법',
      'H2: 예시 키워드 묶음 3세트',
      'H2: 체크리스트 — 스팸 키워드 피하는 법',
      'H2: FAQ'
    ];
    return out;
  }

  function renderOut(id, lines){
    var ta = $(id);
    if(!ta) return;
    ta.value = (lines || []).join('\n');
  }

  function setCount(id, n){
    var el = $(id);
    if(el) el.textContent = String(n || 0);
  }

  function getState(){
    return {
      query: ($('#seoQuery')||{}).value || '',
      cat: ($('#seoCat')||{}).value || 'sports',
      intent: ($('#seoIntent')||{}).value || 'howto',
      tone: ($('#seoTone')||{}).value || 'luxe',
      limit: Number((($('#seoLimit')||{}).value) || 120)
    };
  }

  function generate(){
    var st = getState();

    var q = normalizeQuery(st.query);
    var kw = buildKeywords(st.cat, st.intent, st.tone, st.limit, q);
    var ttl = buildTitles(st.cat, st.intent, st.tone, q);
    var desc = buildDescriptions(st.cat, st.intent, st.tone, q);
    var outline = buildOutline(st.cat, q);
    var post = buildCommunityPost(st.cat, st.intent, st.tone, q, kw, ttl);

    renderOut('#outKeywords', kw);
    renderOut('#outTitles', ttl);
    renderOut('#outDesc', desc);
    renderOut('#outOutline', outline);
    renderOut('#outPost', [post]);

    setCount('#kwCount', kw.length);
    setCount('#ttlCount', ttl.length);
    setCount('#descCount', desc.length);

    toToast('생성 완료');
  }

  function resetAll(){
    var q = $('#seoQuery');
    if(q) q.value='';
    $('#outKeywords').value='';
    $('#outTitles').value='';
    $('#outDesc').value='';
    $('#outOutline').value='';
    var op = $('#outPost');
    if(op) op.value='';
    setCount('#kwCount', 0);
    setCount('#ttlCount', 0);
    setCount('#descCount', 0);
    toToast('초기화');
  }

  function wire(){
    // Search-first mode: hide advanced selects unless user expands
    (function initAdvancedToggle(){
      var adv = $('#seoAdvanced');
      var sw = $('#advSwitch');
      if(!adv || !sw) return;

      function setOpen(open, persist){
        if(open){
          adv.classList.remove('is-collapsed');
          sw.checked = true;
        }else{
          adv.classList.add('is-collapsed');
          sw.checked = false;
        }
        if(persist){
          try{ localStorage.setItem(ADV_KEY, open ? '1' : '0'); }catch(e){}
        }
      }

      var open = false;
      try{ open = localStorage.getItem(ADV_KEY) === '1'; }catch(e){}
      setOpen(open, false);

      sw.addEventListener('change', function(){
        open = !!sw.checked;
        setOpen(open, true);
      });
    })();

    $('#btnGen')?.addEventListener('click', generate);
    $('#btnReset')?.addEventListener('click', resetAll);

    $('#seoQuery')?.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        e.preventDefault();
        generate();
      }
      if(e.key === 'Escape'){
        e.preventDefault();
        this.value = '';
      }
    });

    $('#btnCopyInquiry')?.addEventListener('click', async function(){
      var ok = await copyText('스포츠 배당 분석 봇 지원');
      toToast(ok ? '문의 문구 복사' : '복사 실패');
    });

    // Fill datalist for search input (keep it light)
    (function fillDatalist(){
      var dl = $('#seoQueryList');
      if(!dl) return;
      var pool = [];
      Object.keys(BANK).forEach(function(k){
        var b = BANK[k];
        pool = pool.concat((b.base||[]), (b.niche||[]));
      });
      pool = uniq(pool).slice(0, 80);
      dl.innerHTML = pool.map(function(x){ return '<option value="' + String(x).replace(/"/g,'&quot;') + '"></option>'; }).join('');
    })();

    $$('.btnCopy').forEach(function(btn){
      btn.addEventListener('click', async function(){
        var target = btn.getAttribute('data-target');
        var ta = target ? $(target) : null;
        if(!ta) return;
        var ok = await copyText(ta.value || '');
        toToast(ok ? '복사 완료' : '복사 실패');
      });
    });

    $$('.btnDown').forEach(function(btn){
      btn.addEventListener('click', function(){
        var target = btn.getAttribute('data-target');
        var ta = target ? $(target) : null;
        if(!ta) return;
        var name = btn.getAttribute('data-fn') || 'seo.txt';
        downloadText(name, ta.value || '');
        toToast('다운로드');
      });
    });

    // Generate once on first load for nice UX
    setTimeout(generate, 50);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wire);
  }else{
    wire();
  }
})();
