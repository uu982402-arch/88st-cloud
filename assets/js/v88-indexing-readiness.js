(function(){
  const dataUrl='/assets/data/v88-indexing-readiness.json';
  const list=document.querySelector('[data-v88-indexing-list]');
  const log=document.querySelector('[data-v88-indexing-log]');
  const copyAll=document.querySelector('[data-v88-copy-indexing]');
  const copyNew=document.querySelector('[data-v88-copy-new-posts]');
  function setLog(msg){ if(log) log.textContent=msg; }
  function copy(text,label){
    if(!text){ setLog('복사할 내용이 없습니다.'); return; }
    navigator.clipboard.writeText(text).then(()=>setLog(label+' 복사 완료')).catch(()=>setLog(label+' 복사 실패: 브라우저 권한을 확인하세요.'));
  }
  fetch(dataUrl,{cache:'no-store'}).then(r=>r.json()).then(data=>{
    const cards=[
      ['핵심 URL', data.coreUrls||[]],
      ['신규 SEO 글', (data.newSeoPosts||[]).map(x=>x.url)],
      ['스포츠 체크', (data.sportsCheckUrls||[]).map(x=>x.url)],
      ['검색 가이드', (data.searchGuideUrls||[]).map(x=>x.url)],
      ['전체 색인 우선', data.indexingPriorityUrls||[]],
      ['사이트맵', [data.sitemap?.url, data.sitemap?.txt].filter(Boolean)]
    ];
    if(list){
      list.innerHTML=cards.map(([title,urls])=>`<div class="v88-index-card"><b>${title} · ${urls.length}</b>${urls.slice(0,3).map(u=>`<a href="${u}" target="_blank" rel="noopener">${u}</a>`).join('')}</div>`).join('');
    }
    if(copyAll) copyAll.addEventListener('click',()=>copy((data.indexingPriorityUrls||[]).join('\n'),'색인 우선 URL'));
    if(copyNew) copyNew.addEventListener('click',()=>copy((data.newSeoPosts||[]).map(x=>x.url).join('\n'),'신규 SEO 글 50개 URL'));
    setLog(`V88 색인 준비 데이터 로드 완료\n사이트맵: ${data.sitemap?.count||0}개\n신규 SEO 글: ${(data.newSeoPosts||[]).length}개\n색인 우선 URL: ${(data.indexingPriorityUrls||[]).length}개`);
  }).catch(err=>setLog('V88 데이터 로드 실패: '+err.message));
})();