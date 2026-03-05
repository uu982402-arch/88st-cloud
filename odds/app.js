(function(){
  const copyBtn = document.getElementById('copyLink');
  if(copyBtn){
    copyBtn.addEventListener('click', async () => {
      const url = window.location.origin + window.location.pathname;
      try{
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = '✅ 복사 완료';
        setTimeout(()=>copyBtn.textContent='🔗 링크 복사', 1400);
      }catch(e){
        prompt('이 링크를 복사하세요:', url);
      }
    });
  }
})();