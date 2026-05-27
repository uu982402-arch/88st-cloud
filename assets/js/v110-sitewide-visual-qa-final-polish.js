/* V110 SITEWIDE VISUAL QA / FINAL POLISH PATCH */
(function(){
  const root=document.documentElement;
  const body=document.body;
  if(!body) return;
  root.dataset.v110SitewideVisualQa='active';
  body.dataset.v110SitewideVisualQa='true';
  body.classList.add('v110-sitewide-visual-qa');
  const markOverflow=()=>{
    const vw=Math.max(document.documentElement.clientWidth||0, window.innerWidth||0);
    const sw=document.documentElement.scrollWidth||0;
    body.dataset.v110OverflowX = sw > vw + 2 ? 'check' : 'ok';
  };
  const markRuntime=()=>{
    body.dataset.v110Runtime='ready';
    markOverflow();
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', markRuntime, {once:true});
  else markRuntime();
  window.addEventListener('resize', markOverflow, {passive:true});
  window.addEventListener('orientationchange', ()=>setTimeout(markOverflow,180), {passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', markOverflow, {passive:true});
  }
})();
