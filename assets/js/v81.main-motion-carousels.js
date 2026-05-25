
(function(){
  var marquees = document.querySelectorAll('[data-v81-marquee]');
  marquees.forEach(function(marquee){
    marquee.addEventListener('touchstart', function(){ marquee.classList.add('is-paused'); }, {passive:true});
    marquee.addEventListener('touchend', function(){ window.setTimeout(function(){ marquee.classList.remove('is-paused'); }, 900); }, {passive:true});
    marquee.addEventListener('focusin', function(){ marquee.classList.add('is-paused'); });
    marquee.addEventListener('focusout', function(){ marquee.classList.remove('is-paused'); });
  });
})();
