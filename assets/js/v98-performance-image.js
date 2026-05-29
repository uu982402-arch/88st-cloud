(()=>{
  const VERSION='V98_PERFORMANCE_IMAGE_ACTIVE';
  const onReady=(fn)=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  const idle=(fn)=>('requestIdleCallback' in window?requestIdleCallback(fn,{timeout:1600}):setTimeout(fn,80));
  onReady(()=>{
    document.documentElement.dataset.v98PerformanceImage='active';
    document.body && (document.body.dataset.v98PerformanceImage='active');
    const imgs=[...document.images];
    let highUsed=0;
    imgs.forEach((img,idx)=>{
      img.dataset.v98Img='optimized';
      if(!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
      const isLogo=/rust-crest-(?:32|48|64|96|128|180|192|256|512).png$/i.test(img.currentSrc||img.src||'');
      const isVendor=//assets/img/guaranteed/cards//i.test(img.getAttribute('src')||'');
      const isDetail=img.hasAttribute('data-v92-detail-image');
      const shouldHigh=(isDetail || (isVendor && highUsed===0 && /(?:^|/)guaranteed/?$/.test(location.pathname.replace(/index.html$/,''))));
      if(isLogo){
        img.setAttribute('loading','eager');
        img.removeAttribute('fetchpriority');
      }else if(shouldHigh){
        img.setAttribute('loading','eager');
        img.setAttribute('fetchpriority','high');
        highUsed++;
      }else{
        img.setAttribute('loading','lazy');
        img.setAttribute('fetchpriority','low');
      }
      if(!img.complete){
        img.addEventListener('load',()=>{img.dataset.v98Loaded='true';},{once:true,passive:true});
        img.addEventListener('error',()=>{img.dataset.v98Error='true';},{once:true,passive:true});
      }else{
        img.dataset.v98Loaded='true';
      }
    });
    idle(()=>document.documentElement.setAttribute('data-v98-image-idle','complete'));
  });
})();
