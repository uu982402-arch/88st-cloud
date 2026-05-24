(function(){
  var nav = document.querySelector('.v68-mobile-nav');
  if (nav) {
    var path = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function(a){
      var route = a.getAttribute('data-v68-route') || a.getAttribute('href') || '/';
      var normalized = route.endsWith('/') ? route : route + '/';
      if (path === normalized || (normalized !== '/' && path.indexOf(normalized) === 0)) {
        a.classList.add('is-active');
        a.setAttribute('aria-current','page');
      }
    });
    var lastY = window.scrollY || 0;
    window.addEventListener('scroll', function(){
      var y = window.scrollY || 0;
      if (y > 160 && y > lastY + 8) nav.style.transform = 'translateY(calc(100% + 24px))';
      else if (y < lastY - 8) nav.style.transform = 'translateY(0)';
      lastY = y;
    }, { passive:true });
  }
  document.documentElement.setAttribute('data-v68-mobile-title-hotfix','ready');
})();
