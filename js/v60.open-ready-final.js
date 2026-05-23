(()=>{
  const MARK='__V60_OPEN_READY_FINAL__';
  if(window[MARK]) return; window[MARK]=true;
  const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  function toast(msg){
    let el=$('.v60-toast');
    if(!el){el=document.createElement('div');el.className='v60-toast';el.setAttribute('role','status');document.body.appendChild(el);}
    el.textContent=msg; el.classList.add('is-visible');
    clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('is-visible'),1800);
  }
  async function copyText(text){
    try{ await navigator.clipboard.writeText(String(text||'').trim()); toast('복사되었습니다'); }
    catch(e){ toast('복사를 지원하지 않는 환경입니다'); }
  }
  document.addEventListener('click',e=>{
    const codeBtn=e.target.closest('[data-v57-copy-code],[data-v52-copy-code],[data-v49-copy-code],[data-v47-copy-code],[data-copy-code],.code-badge');
    if(codeBtn){
      const code=codeBtn.dataset.v57CopyCode||codeBtn.dataset.v52CopyCode||codeBtn.dataset.v49CopyCode||codeBtn.dataset.v47CopyCode||codeBtn.dataset.copyCode||codeBtn.textContent;
      copyText(code); return;
    }
    const copyResult=e.target.closest('[data-v60-copy-result]');
    if(copyResult){
      const panel=copyResult.closest('section')||copyResult.closest('.v51-tool-panel')||copyResult.closest('.v52-tool-panel');
      const out=panel?.querySelector('output,.v51-tool-result,.v52-tool-result');
      copyText(out?.innerText||''); return;
    }
    const action=e.target.closest('a,button');
    if(action && action.matches('.v58-tool-card,.v58-provider-main,.v58-guide-card,.action-btn,.detail-btn,[data-v49-detail-click],[data-v49-domain-click]')){
      document.body.classList.add('v60-interacted');
    }
  });
  function enhanceToolResults(){
    $$('output,.v51-tool-result,.v52-tool-result').forEach(out=>{
      const panel=out.closest('section')||out.parentElement;
      if(!panel || panel.querySelector('[data-v60-copy-result]')) return;
      const btn=document.createElement('button');
      btn.type='button'; btn.className='v60-copy-result'; btn.dataset.v60CopyResult='1'; btn.textContent='결과 복사';
      out.insertAdjacentElement('afterend',btn);
    });
  }
  function ensureVendorSticky(){
    if(!/^\/guaranteed\/(queenbee|sk-holdings|anybet|udt|ddangkong)\/?$/.test(location.pathname)) return;
    if($('.v60-vendor-sticky')) return;
    const domain=$('a[href^="http"]');
    const codeEl=$('[data-v57-copy-code],[data-v52-copy-code],[data-v49-copy-code],[data-v47-copy-code],.code-badge');
    const wrap=document.createElement('div'); wrap.className='v60-vendor-sticky';
    if(codeEl){ const b=document.createElement('button'); b.type='button'; b.textContent='가입코드 복사'; b.dataset.copyCode=codeEl.dataset.v57CopyCode||codeEl.dataset.v52CopyCode||codeEl.dataset.v49CopyCode||codeEl.dataset.v47CopyCode||codeEl.textContent.trim(); wrap.appendChild(b); }
    if(domain){ const a=document.createElement('a'); a.href=domain.href; a.target='_blank'; a.rel='noopener noreferrer'; a.textContent='공식 도메인'; wrap.appendChild(a); }
    const support=document.createElement('a'); support.href='https://t.me/TRS999_bot'; support.target='_blank'; support.rel='noopener noreferrer nofollow'; support.textContent='고객센터'; wrap.appendChild(support);
    const main=$('main')||document.body; main.appendChild(wrap);
  }
  function imageFallbacks(){
    $$('img').forEach(img=>{
      if(img.dataset.v60Bound) return; img.dataset.v60Bound='1';
      img.addEventListener('error',()=>{
        const p=img.parentElement; if(p){ p.classList.add('v60-image-fallback'); p.dataset.v60Fallback=(img.alt||'88ST').replace(/\s*(통일|카드|로고|이미지).*$/,'').slice(0,10)||'88ST'; }
        img.remove();
      },{once:true});
    });
  }
  function fixBlankTargets(){
    $$('a[target="_blank"]').forEach(a=>{
      const rel=(a.getAttribute('rel')||'').split(/\s+/).filter(Boolean); ['noopener','noreferrer'].forEach(x=>{if(!rel.includes(x)) rel.push(x);}); a.setAttribute('rel',rel.join(' '));
    });
  }
  function init(){ enhanceToolResults(); ensureVendorSticky(); imageFallbacks(); fixBlankTargets(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
