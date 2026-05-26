(function(){
  'use strict';
  var ACTIVE_ATTR='data-v102-6-rotated';
  var timers=[];
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true}); else fn(); }
  function safeText(value,fallback){ return (typeof value==='string' && value.trim()) ? value.trim() : fallback; }
  function readPool(id){
    var node=document.getElementById(id);
    if(!node) return [];
    try{
      var data=JSON.parse(node.textContent||'[]');
      if(!Array.isArray(data)) return [];
      return data.filter(function(item){ return item && typeof item.href==='string' && item.href.indexOf('/')===0 && item.title; });
    }catch(e){ return []; }
  }
  function setCard(card,item,type,index){
    if(!card || !item) return;
    card.href=item.href;
    card.setAttribute('aria-label', safeText(item.title,'RUST 가이드')+' 보기');
    card.setAttribute(ACTIVE_ATTR,'true');
    card.setAttribute('data-v102-6-rotation-index', String(index));
    card.setAttribute('data-ga4-event', type==='SPORTS' ? 'sports_check_card_click' : 'search_guide_card_click');
    var cat=card.querySelector('[data-v811-category]') || card.querySelector('em');
    var title=card.querySelector('[data-v811-title]') || card.querySelector('strong');
    var summary=card.querySelector('[data-v811-summary]') || card.querySelector('span:last-child');
    if(cat) cat.textContent=safeText(item.category,type);
    if(title) title.textContent=safeText(item.title,'RUST 가이드');
    if(summary) summary.textContent=safeText(item.summary,'핵심 조건과 확인 순서를 짧게 정리했습니다.');
  }
  function makeRotator(options){
    var lane=document.querySelector(options.laneSelector);
    if(!lane) return null;
    var cards=Array.prototype.slice.call(lane.querySelectorAll(options.cardSelector)).slice(0,5);
    var pool=readPool(options.poolId);
    if(cards.length<1 || pool.length<=cards.length) return null;
    var offset=0;
    var paused=false;
    var step=options.step || cards.length;
    var delay=options.delay || 5200;
    lane.setAttribute('data-v102-6-active','true');
    lane.setAttribute('data-v102-6-pool-size',String(pool.length));
    lane.setAttribute('data-v102-6-role',options.type);
    function render(){
      if(paused || document.hidden) return;
      lane.classList.add('v102-6-is-swapping');
      window.setTimeout(function(){
        for(var i=0;i<cards.length;i++){
          var item=pool[(offset+i)%pool.length];
          setCard(cards[i],item,options.type,offset+i);
        }
        offset=(offset+step)%pool.length;
        lane.setAttribute('data-v102-6-offset',String(offset));
        lane.classList.remove('v102-6-is-swapping');
      },120);
    }
    lane.addEventListener('mouseenter',function(){ paused=true; },{passive:true});
    lane.addEventListener('mouseleave',function(){ paused=false; },{passive:true});
    lane.addEventListener('focusin',function(){ paused=true; },{passive:true});
    lane.addEventListener('focusout',function(){ paused=false; },{passive:true});
    render();
    var timer=window.setInterval(render,delay);
    timers.push(timer);
    return {render:render,stop:function(){ window.clearInterval(timer); }};
  }
  ready(function(){
    var sports=makeRotator({laneSelector:'[data-v811-sports-lane]',cardSelector:'[data-v811-sports-card]',poolId:'v81-1-sports-pool',type:'SPORTS',step:5,delay:4300});
    var guides=makeRotator({laneSelector:'[data-v811-guides-lane]',cardSelector:'[data-v811-guides-card]',poolId:'v81-1-guides-pool',type:'SEARCH',step:5,delay:5100});
    document.documentElement.setAttribute('data-v102-6-hub-rotation-ready',(sports||guides)?'true':'false');
    document.addEventListener('visibilitychange',function(){ if(!document.hidden){ if(sports) sports.render(); if(guides) guides.render(); } });
  });
  window.RUST_V102_6_HUB_ROTATION={version:'V102.6',timers:timers};
})();
