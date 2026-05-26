(()=>{
  const BUILD='V100-STRUCTURE-LOCK-RELEASE-STABLE-20260526';
  const root=document.documentElement;
  root.dataset.rustBuild=BUILD;
  root.dataset.v100StructureLock='active';
  const setViewportVars=()=>{
    const vv=window.visualViewport;
    root.style.setProperty('--rust-vv-width', Math.round((vv?.width||window.innerWidth))+'px');
    root.style.setProperty('--rust-vv-height', Math.round((vv?.height||window.innerHeight))+'px');
    const overflow=Math.max(document.body?.scrollWidth||0, root.scrollWidth||0) - Math.ceil(window.innerWidth);
    if(overflow>2){ document.body?.setAttribute('data-v100-overflow-guard','true'); root.setAttribute('data-v100-overflow-detected', String(overflow)); }
    else { document.body?.removeAttribute('data-v100-overflow-guard'); root.removeAttribute('data-v100-overflow-detected'); }
  };
  setViewportVars();
  window.addEventListener('resize', setViewportVars, {passive:true});
  window.addEventListener('orientationchange', ()=>setTimeout(setViewportVars,180), {passive:true});
  window.visualViewport?.addEventListener('resize', setViewportVars, {passive:true});
  window.RUST_BUILD_VERSION=BUILD;
  window.RUST_STRUCTURE_LOCK='V100';
})();
