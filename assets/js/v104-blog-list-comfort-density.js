(() => {
  const body = document.body;
  if (!body || body.dataset.v104BlogComfort !== 'true') return;
  const KEY = 'rust.blogDensity.v104';
  const setDensity = (value) => {
    const density = value === 'comfort' ? 'comfort' : 'compact';
    body.dataset.blogDensity = density;
    try { localStorage.setItem(KEY, density); } catch (_) {}
    document.querySelectorAll('[data-v104-density]').forEach((btn) => {
      const active = btn.dataset.v104Density === density;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (window.gtag) {
      window.gtag('event', 'blog_density_change', { density });
    }
  };
  let saved = 'compact';
  try { saved = localStorage.getItem(KEY) || 'compact'; } catch (_) {}
  setDensity(saved);
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-v104-density]');
    if (!btn) return;
    event.preventDefault();
    setDensity(btn.dataset.v104Density);
  });
})();