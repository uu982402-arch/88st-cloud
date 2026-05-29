(function () {
  var root = document.documentElement;
  root.classList.add('v71-main-ready');

  var menu = document.querySelector('[data-v71-menu]');
  if (menu) {
    menu.addEventListener('click', function () {
      var nav = document.querySelector('.v71-desktop-nav');
      if (nav) {
        nav.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  var carousel = document.querySelector('.v71-partner-carousel');
  if (carousel) {
    carousel.addEventListener('wheel', function (event) {
      if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) {
        carousel.scrollLeft += event.deltaY;
      }
    }, { passive: true });
  }
})();
