/* V105 SEO keyword refresh: lightweight GA4 markers for blog keyword buckets. */
(function(){
  function send(name, params){
    try{ if(typeof window.gtag === 'function') window.gtag('event', name, params || {}); }catch(e){}
  }
  document.addEventListener('click', function(e){
    var bucket = e.target && e.target.closest ? e.target.closest('[data-v105-keyword-buckets] span') : null;
    if(bucket) send('blog_keyword_bucket_click', {keyword: bucket.textContent.trim(), version:'v105'});
  }, {passive:true});
})();
