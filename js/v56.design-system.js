(function(){
  const root=document.documentElement;
  root.dataset.v56DesignSystem='active';
  document.addEventListener('click',function(e){
    const a=e.target.closest('a[href]');
    if(!a) return;
    if(a.target==='_blank' && !/noopener/.test(a.rel||'')) a.rel=((a.rel||'')+' noopener noreferrer').trim();
  },true);
})();
