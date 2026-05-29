(() => {
  const root = document.body;
  if (!root || root.dataset.v55Ready === '1') return;
  root.dataset.v55Ready = '1';
  const setPointer = (event) => {
    const x = Math.round((event.clientX / Math.max(window.innerWidth, 1)) * 100);
    const y = Math.round((event.clientY / Math.max(window.innerHeight, 1)) * 100);
    root.style.setProperty('--v55-x', `${x}%`);
    root.style.setProperty('--v55-y', `${y}%`);
  };
  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', setPointer, { passive: true });
  }
  const targets = Array.from(document.querySelectorAll('main section, article, [class*="card"], [class*="panel"]')).slice(0, 160);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('v55-inview');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    targets.forEach((node) => {
      node.classList.add('v55-reveal');
      observer.observe(node);
    });
  }
})();
