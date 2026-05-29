(function(){
  const button = document.querySelector('[data-v75-consult-cta]');
  const toast = document.querySelector('[data-v75-consult-toast]');
  const botId = 'TRS999 상담센터';
  const telegramUrl = 'https://t.me/TRS999_bot';

  function showToast(message){
    if(!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(window.__v75ConsultToastTimer);
    window.__v75ConsultToastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 1500);
  }

  function fallbackCopy(text){
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly','readonly');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try{ ok = document.execCommand('copy'); }catch(error){ ok = false; }
    document.body.removeChild(textarea);
    return ok;
  }

  function copyBotId(){
    if(navigator.clipboard && navigator.clipboard.writeText){
      return navigator.clipboard.writeText(botId).then(() => true).catch(() => fallbackCopy(botId));
    }
    return Promise.resolve(fallbackCopy(botId));
  }

  if(button){
    button.addEventListener('click', function(event){
      event.preventDefault();
      copyBotId().then((ok) => {
        showToast(ok ? '공식 상담센터 ID가 복사되었습니다.' : '공식 상담센터: ' + botId);
        window.setTimeout(() => {
          window.open(telegramUrl, '_blank', 'noopener,noreferrer');
        }, 360);
      });
    });
  }
})();
