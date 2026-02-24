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

  function buildTitles(catKey, intentKey, query){
    var p = BANK[catKey] || BANK.sports;
    var base = normalizeQuery(query) || (p.base[0] || '키워드').replace(/\s+/g,' ');
    var intent = (INTENT[intentKey] || INTENT.howto)[0] || '가이드';

    var t = [
      base + ' ' + intent + ' | 88ST.Cloud',
      base + ' 키워드 클러스터 생성기 (무료)',
      base + ' 타이틀/메타 설명 예시 모음',
      '초보도 바로 쓰는 ' + base + ' 체크 포인트',
      base + ' — 한 장 요약 + 실전 기준',
      base + ' ' + intent + ': 실수 줄이는 기준 10가지',
      base + ' 분석 툴: 키워드·메타·아웃라인 자동 생성',
      base + ' 콘텐츠 설계: 키워드 묶음부터 구조까지'
    ];
    return uniq(t);
  }

  function clampDesc(s, min, max){
    var t = String(s || '').replace(/\s+/g,' ').trim();
    if (t.length > max) t = t.slice(0, max-1).trim() + '…';
    if (t.length < min) {
      t = (t + ' — 88ST.Cloud에서 빠르게 생성').slice(0, max);
    }
    return t;
  }

  function buildDescriptions(catKey, query){
    var p = BANK[catKey] || BANK.sports;
    var base = normalizeQuery(query) || (p.base[0] || '키워드');
    var d = [
      base + ' 키워드 클러스터, 타이틀, 메타 설명을 한 번에 생성하세요. 외부 API 없이 로컬에서 빠르게 만들 수 있습니다.',
      '초보도 바로 쓰는 ' + base + ' 키워드 템플릿. 제목/설명/아웃라인까지 1분 컷으로 정리해보세요.',
      '검색 의도(가이드·전략·계산기)에 맞춰 ' + base + ' 키워드를 자동 조합합니다. 결과는 바로 복사해 사용 가능합니다.',
      '키워드만 쌓지 말고 구조를 잡으세요. ' + base + ' 콘텐츠용 제목/메타/섹션까지 함께 생성합니다.',
      base + ' 관련 키워드 예시를 모아, 게시글/페이지 메타에 바로 붙여 넣을 수 있도록 정리했습니다.'
    ];
    return uniq(d.map(function(x){ return clampDesc(x, 110, 155); }));
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
    var ttl = buildTitles(st.cat, st.intent, q);
    var desc = buildDescriptions(st.cat, q);
    var outline = buildOutline(st.cat, q);

    renderOut('#outKeywords', kw);
    renderOut('#outTitles', ttl);
    renderOut('#outDesc', desc);
    renderOut('#outOutline', outline);

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
    setCount('#kwCount', 0);
    setCount('#ttlCount', 0);
    setCount('#descCount', 0);
    toToast('초기화');
  }

  function wire(){
    // Search-first mode: hide advanced selects unless user expands
    (function initAdvancedToggle(){
      var adv = $('#seoAdvanced');
      var btn = $('#btnAdvToggle');
      if(!adv || !btn) return;

      function setOpen(open, persist){
        if(open){
          adv.classList.remove('is-collapsed');
          btn.textContent = '옵션 접기';
          btn.setAttribute('aria-expanded','true');
        }else{
          adv.classList.add('is-collapsed');
          btn.textContent = '옵션 펼치기';
          btn.setAttribute('aria-expanded','false');
        }
        if(persist){
          try{ localStorage.setItem(ADV_KEY, open ? '1' : '0'); }catch(e){}
        }
      }

      var open = false;
      try{ open = localStorage.getItem(ADV_KEY) === '1'; }catch(e){}
      setOpen(open, false);

      btn.addEventListener('click', function(){
        open = !open;
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
