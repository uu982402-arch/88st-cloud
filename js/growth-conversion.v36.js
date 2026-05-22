(function(){
  if (window.__GROWTH_CONVERSION_V43_INIT__) return;
  window.__GROWTH_CONVERSION_V43_INIT__ = true;
  var VERSION = "static-growth-conversion-v48-20260520";
  var BOT_URL = "https://t.me/TRS999_bot";
  function ready(fn){ if(document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn, { once:true }); }
  function track(name, params){
    params = params || {}; params.version = VERSION; params.path = location.pathname;
    try { if (typeof window.gtag === "function") window.gtag("event", name, params); } catch(e) {}
    try { window.dispatchEvent(new CustomEvent("v43:quality", { detail: { name:name, params:params }})); } catch(e) {}
  }
  function label(el){ return (el && (el.getAttribute("data-provider") || el.getAttribute("aria-label") || el.textContent || "") || "").trim().replace(/\s+/g," ").slice(0,100); }
  function toast(msg){
    try { var old=document.querySelector(".v36-toast"); if(old) old.remove(); var el=document.createElement("div"); el.className="v36-toast v43-toast"; el.setAttribute("role","status"); el.setAttribute("aria-live","polite"); el.textContent=msg; document.body.appendChild(el); setTimeout(function(){ el.remove(); }, 2300); } catch(e) {}
  }
  function copyText(text){ if(!text) return Promise.resolve(false); if(navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function(){return true;}).catch(function(){return false;}); try{ var ta=document.createElement("textarea"); ta.value=text; ta.setAttribute("readonly",""); ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); var ok=document.execCommand("copy"); ta.remove(); return Promise.resolve(ok);}catch(e){return Promise.resolve(false);} }
  function focusProviderCards(){ try{ var target=document.querySelector('#providerCards'); if(!target) return; target.classList.add('v43-provider-focus'); target.scrollIntoView({ behavior:'smooth', block:'start' }); setTimeout(function(){ target.classList.remove('v43-provider-focus'); }, 1500); }catch(e){} }
  function textCategory(row){ var href=row.getAttribute('href')||''; if(href.indexOf('/online-slot/')>-1) return '슬롯'; if(href.indexOf('/online-casino/')>-1) return '카지노'; if(href.indexOf('/sports-toto/')>-1) return '스포츠'; if(href.indexOf('/minigame/')>-1) return '미니게임'; if(href.indexOf('/bet365-virtual/')>-1) return '가상게임'; if(href.indexOf('/game-guides/')>-1) return '공통가이드'; return '기타'; }
  function buildBlogControls(){
    var page=document.querySelector('.v37-blog-index'); var list=document.querySelector('.v37-post-list'); if(!page || !list || document.querySelector('.v43-blog-controls')) return;
    var rows=Array.prototype.slice.call(list.querySelectorAll('.v37-post-row'));
    rows.forEach(function(row,idx){ row.dataset.title=(row.querySelector('strong')||row).textContent.trim().toLowerCase(); row.dataset.desc=(row.querySelector('small')||row).textContent.trim().toLowerCase(); row.dataset.category=textCategory(row); row.dataset.index=String(idx); row.setAttribute('data-v43-row',''); });
    var counts={전체:rows.length}; rows.forEach(function(row){ counts[row.dataset.category]=(counts[row.dataset.category]||0)+1; });
    var controls=document.createElement('section'); controls.className='v43-blog-controls'; controls.setAttribute('aria-label','게시글 필터');
    controls.innerHTML='<div class="v43-blog-search"><input type="search" placeholder="제목·태그·키워드 검색" aria-label="블로그 게시글 검색"><select aria-label="정렬"><option value="default">기본순</option><option value="category">카테고리순</option><option value="title">제목순</option></select><button type="button">초기화</button></div><div class="v43-blog-chips" role="list"></div>';
    var chips=controls.querySelector('.v43-blog-chips'); Object.keys(counts).sort(function(a,b){return a==='전체'?-1:b==='전체'?1:a.localeCompare(b,'ko');}).forEach(function(cat){ var b=document.createElement('button'); b.type='button'; b.dataset.category=cat; b.textContent=cat+' '+counts[cat]; if(cat==='전체') b.className='is-active'; chips.appendChild(b); });
    var head=document.querySelector('.v37-blog-index .moon-section-head'); if(head) head.insertAdjacentElement('afterend', controls); else list.insertAdjacentElement('beforebegin', controls);
    var input=controls.querySelector('input'), sort=controls.querySelector('select'), reset=controls.querySelector('button[type="button"]'); var active='전체';
    function apply(){ var q=(input.value||'').trim().toLowerCase(); var visible=0; rows.forEach(function(row){ var ok=(active==='전체'||row.dataset.category===active) && (!q || (row.dataset.title+' '+row.dataset.desc+' '+row.dataset.category).indexOf(q)>-1); row.hidden=!ok; if(ok) visible++; }); controls.dataset.result=visible+'개 표시'; }
    function sortRows(){ var val=sort.value; var sorted=rows.slice(); if(val==='category') sorted.sort(function(a,b){ return a.dataset.category.localeCompare(b.dataset.category,'ko') || Number(a.dataset.index)-Number(b.dataset.index); }); else if(val==='title') sorted.sort(function(a,b){ return a.dataset.title.localeCompare(b.dataset.title,'ko'); }); else sorted.sort(function(a,b){ return Number(a.dataset.index)-Number(b.dataset.index); }); sorted.forEach(function(row){ list.appendChild(row); }); }
    chips.addEventListener('click',function(e){ var b=e.target.closest('button[data-category]'); if(!b) return; active=b.dataset.category; chips.querySelectorAll('button').forEach(function(x){x.classList.toggle('is-active',x===b);}); apply(); track('blog_filter',{category:active}); });
    input.addEventListener('input',function(){ apply(); }); sort.addEventListener('change',function(){ sortRows(); apply(); track('blog_sort',{sort:sort.value}); }); reset.addEventListener('click',function(){ input.value=''; sort.value='default'; active='전체'; chips.querySelectorAll('button').forEach(function(x){x.classList.toggle('is-active',x.dataset.category==='전체');}); sortRows(); apply(); }); apply();
  }
  document.addEventListener('click', function(e){
    var code=e.target.closest('[data-g-copy],.moon-code,[data-copy-code]');
    if(code){ var codeValue=code.getAttribute('data-g-copy')||code.getAttribute('data-copy-code')||((code.querySelector('b')||{}).textContent)||''; codeValue=codeValue.trim(); var old=code.innerHTML; copyText(codeValue).then(function(ok){ if(ok){ code.classList.add('is-copied'); if(code.tagName==='BUTTON') code.innerHTML='<span>복사완료</span><b>'+codeValue+'</b>'; toast('가입코드를 복사했습니다. 도메인과 조건을 함께 확인하세요.'); setTimeout(function(){ code.innerHTML=old; code.classList.remove('is-copied'); }, 1500); } else { toast('복사가 제한되었습니다. 코드를 직접 확인하세요: '+codeValue); } }); track('code_copy',{provider:code.getAttribute('data-provider')||label(code),code:codeValue}); }
    var domain=e.target.closest('[data-g-open],.moon-domain,.moon-provider-chip'); if(domain){ track('official_domain_click',{provider:domain.getAttribute('data-provider')||label(domain),href:domain.getAttribute('href')||''}); }
    var consult=e.target.closest(".auto-consult-launcher,[href*='/consult/'],[href*='t.me/TRS999_bot'],[href*='TRS999_bot']"); if(consult){ var href=consult.getAttribute('href')||''; track(href.indexOf('TRS999_bot')>-1?'consult_bot_click':'consult_open',{label:label(consult),href:href}); }
    var cta=e.target.closest('[data-v39-hero-action="code"],[data-v39-hero-action="domain"]'); if(cta) focusProviderCards();
    var related=e.target.closest('.v36-related-links a,.v36-growth-hubs a,.pro-related a,.v43-blog-controls button,.v43-blog-controls select'); if(related) track('internal_ui_click',{label:label(related),href:related.getAttribute('href')||''});
  }, true);
  ready(function(){
    document.documentElement.classList.add('v43-quality-ready');
    buildBlogControls();
    var header=document.querySelector('.moon-header'); if(header){ var onScroll=function(){ header.classList.toggle('is-scrolled', window.scrollY>8); }; onScroll(); window.addEventListener('scroll', onScroll, { passive:true }); }
    document.querySelectorAll('a[target="_blank"]').forEach(function(a){ if(!/noopener/i.test(a.rel)) a.rel=(a.rel+' noopener noreferrer').trim(); a.classList.add('v43-external-link'); });
    document.querySelectorAll('img').forEach(function(img){ if(!img.loading) img.loading='lazy'; if(!img.decoding) img.decoding='async'; img.addEventListener('error',function(){ img.classList.add('v43-image-fallback'); img.alt=img.alt||'이미지 로딩 실패'; }, { once:true }); });
    document.querySelectorAll('form').forEach(function(form){ form.addEventListener('submit',function(){ track('form_submit',{label:label(form)}); }); });
    track('seo_page_ready',{title:document.title});
  });
  window.__GROWTH_CONVERSION_V36__=VERSION;
  window.__GROWTH_CONVERSION_V43__=VERSION;
  window.__CONSULT_BOT_URL__=BOT_URL;
})();
