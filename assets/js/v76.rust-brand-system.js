(function(){
  var body=document.body;
  var path=window.location.pathname.replace(/\/+$/,'/')||'/';
  function isActive(href){
    if(href==='/') return path==='/' || path==='/index.html';
    return path.indexOf(href)===0;
  }
  document.querySelectorAll('[data-rust-nav] a').forEach(function(a){
    var href=a.getAttribute('href')||'/';
    if(isActive(href)) a.classList.add('is-active');
  });
  var btn=document.querySelector('[data-rust-menu-toggle]');
  if(btn){
    btn.addEventListener('click',function(){
      var opened=body.classList.toggle('rust-menu-open');
      btn.setAttribute('aria-expanded', opened ? 'true':'false');
    });
  }
  window.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      body.classList.remove('rust-menu-open');
      if(btn) btn.setAttribute('aria-expanded','false');
    }
  });
})();
