
(function(){
  const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  let toast;
  function ensureToast(){
    if (toast) return toast;
    toast=document.createElement('div');
    toast.className='resource-toast';
    document.body.appendChild(toast);
    return toast;
  }
  function showToast(msg){
    const t=ensureToast();
    t.textContent=msg;
    t.classList.add('is-show');
    clearTimeout(showToast._timer);
    showToast._timer=setTimeout(()=>t.classList.remove('is-show'),1400);
  }
  async function copyText(text){
    try{ await navigator.clipboard.writeText(text); showToast('복사되었습니다'); }
    catch(e){ showToast('복사에 실패했습니다'); }
  }
  function defaultValue(el){ return el.getAttribute('data-default-value') ?? el.defaultValue ?? ''; }
  document.addEventListener('DOMContentLoaded', ()=>{
    qsa('[data-resource-storage]').forEach(el=>{
      const key='raven:'+el.getAttribute('data-resource-storage');
      const saved=localStorage.getItem(key);
      if(saved!==null) el.value=saved;
      el.addEventListener('input',()=>localStorage.setItem(key,el.value));
      el.setAttribute('data-default-value', el.defaultValue || el.value || '');
    });
    qsa('[data-copy-target]').forEach(btn=>btn.addEventListener('click',()=>{
      const target=document.querySelector(btn.getAttribute('data-copy-target'));
      if(!target) return;
      copyText(target.value || target.innerText || '');
    }));
    qsa('[data-reset-target]').forEach(btn=>btn.addEventListener('click',()=>{
      const target=document.querySelector(btn.getAttribute('data-reset-target'));
      if(!target) return;
      const val=target.getAttribute('data-default-value') || target.defaultValue || '';
      target.value=val;
      const key=target.getAttribute('data-resource-storage');
      if(key) localStorage.setItem('raven:'+key, val);
      showToast('초기화되었습니다');
    }));
  });
})();
