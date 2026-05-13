(() => {
  const FALLBACK = '/img/logo.png';
  const mark = (img) => {
    if (!img || img.dataset.imageGuarded === '1') return;
    img.dataset.imageGuarded = '1';
    img.classList.add('is-image-fallback');
    const label = img.getAttribute('alt') || '88ST.Cloud';
    img.setAttribute('alt', `${label} 이미지`);
    if (img.getAttribute('src') !== FALLBACK) img.setAttribute('src', FALLBACK);
  };
  document.addEventListener('error', (event) => {
    const target = event.target;
    if (target && target.tagName === 'IMG') mark(target);
  }, true);
  const normalize = () => {
    document.querySelectorAll('img').forEach((img) => {
      if (!img.getAttribute('alt')) img.setAttribute('alt', '88ST.Cloud 이미지');
      img.decoding = img.decoding || 'async';
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', normalize, { once:true });
  else normalize();
})();