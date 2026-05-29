(()=>{
  const toast = (msg)=>{
    let el=document.querySelector('.v113-toast');
    if(!el){el=document.createElement('div');el.className='v113-toast';el.setAttribute('role','status');el.style.cssText='position:fixed;left:50%;bottom:calc(112px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9999;background:rgba(8,12,20,.94);color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:11px 15px;font-weight:900;box-shadow:0 18px 60px rgba(0,0,0,.45);opacity:0;transition:opacity .18s ease';document.body.appendChild(el);} 
    el.textContent=msg; el.style.opacity='1'; clearTimeout(el._t); el._t=setTimeout(()=>{el.style.opacity='0'},1700);
  };
  const copyText = async(text)=>{try{await navigator.clipboard.writeText(text);return true;}catch(e){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.focus();ta.select();const ok=document.execCommand('copy');ta.remove();return ok;}};
  document.addEventListener('click', async(e)=>{
    const btn=e.target.closest('[data-v113-copy-template]'); if(!btn) return;
    e.preventDefault();
    const txt=btn.getAttribute('data-template')||'';
    const ok=await copyText(txt.replace(/\\n/g,'\n'));
    toast(ok?'문의 양식이 복사되었습니다':'복사에 실패했습니다');
    if(window.gtag){window.gtag('event','vendor_copy_template',{event_category:'guaranteed',event_label:btn.closest('[data-v113-depth]')?.getAttribute('data-v113-depth')||'vendor'});}
  });
})();
