(()=>{
  const d=document;
  const body=d.body;
  body?.classList.add('v65-global-premium-fix');
  const path=location.pathname;
  if(path.startsWith('/guaranteed/')) body.classList.add('v65-guaranteed-page');
  if(path.startsWith('/tools/')) body.classList.add('v65-tools-page');
  if(path.startsWith('/consult/')) body.classList.add('v65-consult-page');

  // remove broken image icon visually and keep premium fallback
  d.querySelectorAll('img').forEach(img=>{
    img.addEventListener('error',()=>{
      const label=img.alt||img.closest('[data-fallback]')?.getAttribute('data-fallback')||'88ST';
      img.style.display='none';
      const box=img.parentElement;
      if(box && !box.querySelector('.v65-img-fallback')){
        const span=d.createElement('span');
        span.className='v65-img-fallback';
        span.textContent=label;
        span.style.cssText='display:grid;place-items:center;width:100%;min-height:88px;color:#fff;font-weight:950;letter-spacing:-.04em;background:radial-gradient(circle at 50% 0,rgba(0,240,255,.16),transparent 55%),#05070d;border-radius:18px;border:1px solid rgba(255,255,255,.10)';
        box.appendChild(span);
      }
    },{once:true});
  });

  d.addEventListener('click', async (e)=>{
    const btn=e.target.closest('[data-v65-copy-code], [data-v57-copy-code]');
    if(!btn) return;
    const code=btn.getAttribute('data-v65-copy-code')||btn.getAttribute('data-v57-copy-code')||btn.textContent.trim();
    try{ await navigator.clipboard.writeText(code); }catch{}
    const old=btn.textContent;
    btn.textContent='복사 완료';
    setTimeout(()=>btn.textContent=old,1100);
  });
})();
