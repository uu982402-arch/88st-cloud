/* 88ST.Cloud - SEO Keyword Tool (Lite, public, zero-cost)
 * No external API. Generates keyword clusters + title/meta drafts locally.
 */
(function(){
  'use strict';

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
    sports: {
      base: [
        '스포츠 분석', '배당 분석', '오즈무브', '공정배당', '오버라운드',
        'EV 계산', '켈리 기준', '마진 계산', '배당 확률 변환', '핸디캡',
        '오버언더', '승무패', '승률', '리스크 관리', 'ROI'
      ],
      niche: ['토토', '온라인 스포츠', '스포츠픽', '배당 계산기', '픽 분석']
    },
    casino: {
      base: ['바카라 전략', '카지노 확률', '하우스엣지', '세션 관리', '뱅크롤', '룰렛', '블랙잭'],
      niche: ['카지노', '카지노 맛집', '바카라 가이드']
    },
    slot: {
      base: ['슬롯 RTP', '슬롯 변동성', '맥스윈', '프라그마틱 RTP', '슬롯 분석'],
      niche: ['슬롯맛집', '슬롯 추천', 'RTP 확인']
    },
    minigame: {
      base: ['미니게임 분석', '확률 추정', '연속/편차', '다음 확률', '리스크 태그'],
      niche: ['미니게임맛집', '미니게임 추천']
    },
    promo: {
      base: ['인증 사이트', '가입 코드', '보너스 조건', '롤링 규정', '출금 규정'],
      niche: ['안전 토토', '온라인카지노', '입플']
    }
  };

  var INTENT = {
    howto: ['사용법', '하는법', '가이드', '정리', '예시'],
    calc: ['계산기', '계산', '변환', '공식', '자동 계산'],
    strategy: ['전략', '룰', '체크리스트', '리스크', '기준'],
    review: ['추천', '비교', 'top', 'best', '선택']
  };

  var MOD = {
    luxe: ['정확한', '빠른', '깔끔한', '실전', '고급'],
    newbie: ['초보', '입문', '쉬운', '한눈에'],
    mobile: ['모바일', '간단', '원클릭']
  };

  function buildKeywords(catKey, intentKey, toneKey, limit){
    var cat = BANK[catKey] || BANK.sports;
    var intent = INTENT[intentKey] || INTENT.howto;
    var mod = MOD[toneKey] || MOD.luxe;

    var bases = uniq(cat.base.concat(cat.niche));
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

    out = uniq(out);

    // hard cap
    var lim = Number(limit || 120);
    if (out.length > lim) out = out.slice(0, lim);
    return out;
  }

  function buildTitles(catKey, intentKey){
    var p = BANK[catKey] || BANK.sports;
    var base = (p.base[0] || '키워드').replace(/\s+/g,' ');
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

  function buildDescriptions(catKey){
    var p = BANK[catKey] || BANK.sports;
    var base = (p.base[0] || '키워드');
    var d = [
      base + ' 키워드 클러스터, 타이틀, 메타 설명을 한 번에 생성하세요. 외부 API 없이 로컬에서 빠르게 만들 수 있습니다.',
      '초보도 바로 쓰는 ' + base + ' 키워드 템플릿. 제목/설명/아웃라인까지 1분 컷으로 정리해보세요.',
      '검색 의도(가이드·전략·계산기)에 맞춰 ' + base + ' 키워드를 자동 조합합니다. 결과는 바로 복사해 사용 가능합니다.',
      '키워드만 쌓지 말고 구조를 잡으세요. ' + base + ' 콘텐츠용 제목/메타/섹션까지 함께 생성합니다.',
      base + ' 관련 키워드 예시를 모아, 게시글/페이지 메타에 바로 붙여 넣을 수 있도록 정리했습니다.'
    ];
    return uniq(d.map(function(x){ return clampDesc(x, 110, 155); }));
  }

  function buildOutline(catKey){
    var p = BANK[catKey] || BANK.sports;
    var base = p.base[0] || '키워드';
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
      cat: ($('#seoCat')||{}).value || 'sports',
      intent: ($('#seoIntent')||{}).value || 'howto',
      tone: ($('#seoTone')||{}).value || 'luxe',
      limit: Number((($('#seoLimit')||{}).value) || 120)
    };
  }

  function generate(){
    var st = getState();

    var kw = buildKeywords(st.cat, st.intent, st.tone, st.limit);
    var ttl = buildTitles(st.cat, st.intent);
    var desc = buildDescriptions(st.cat);
    var outline = buildOutline(st.cat);

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
    $('#btnGen')?.addEventListener('click', generate);
    $('#btnReset')?.addEventListener('click', resetAll);

    $('#btnCopyInquiry')?.addEventListener('click', async function(){
      var ok = await copyText('스포츠 분석 봇 지원');
      toToast(ok ? '문의 문구 복사' : '복사 실패');
    });

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
