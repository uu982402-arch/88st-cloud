
(() => {
  const root = document.body;
  if (!root) return;
  root.classList.add('v63-sitewide-hard-reset');
  root.dataset.v63 = 'sitewide-hard-reset';

  const fallbackText = (img) => {
    const alt = (img.getAttribute('alt') || '88ST').replace(/로고|이미지/g, '').trim() || '88ST';
    return alt.length > 14 ? alt.slice(0,14) : alt;
  };
  document.querySelectorAll('img').forEach((img) => {
    img.setAttribute('decoding', img.getAttribute('decoding') || 'async');
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    img.addEventListener('error', () => {
      const holder = document.createElement('span');
      holder.className = 'v63-img-fallback';
      holder.textContent = fallbackText(img);
      holder.setAttribute('aria-label', img.getAttribute('alt') || '이미지 대체 표시');
      Object.assign(holder.style, {
        display:'grid', placeItems:'center', width:'100%', minHeight:'110px', borderRadius:'18px',
        background:'radial-gradient(circle at 50% 30%, rgba(229,9,20,.22), transparent 45%), #050505',
        color:'#fff', fontWeight:'900', letterSpacing:'-.04em', border:'1px solid rgba(255,255,255,.10)'
      });
      img.replaceWith(holder);
    }, { once:true });
  });

  document.addEventListener('pointerdown', (event) => {
    const target = event.target.closest('a,button');
    if (!target || target.classList.contains('v63-ripple-lock')) return;
    const r = document.createElement('span');
    r.className = 'v63-ripple';
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    Object.assign(r.style, {
      position:'absolute', width:size+'px', height:size+'px', borderRadius:'999px',
      left:(event.clientX-rect.left-size/2)+'px', top:(event.clientY-rect.top-size/2)+'px',
      pointerEvents:'none', background:'rgba(0,240,255,.16)', transform:'scale(0)', opacity:'1',
      transition:'transform .45s ease, opacity .65s ease'
    });
    const pos = getComputedStyle(target).position;
    if (pos === 'static') target.style.position = 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(r);
    requestAnimationFrame(() => { r.style.transform='scale(2.4)'; r.style.opacity='0'; });
    setTimeout(() => r.remove(), 680);
  }, { passive:true });

  const search = document.querySelector('[data-v62-search], #v52ToolSearch, input[type="search"]');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      const cards = document.querySelectorAll('.v62-filter-card,[data-name],[data-title]');
      cards.forEach((card) => {
        const hay = ((card.dataset.name || '') + ' ' + (card.dataset.title || '') + ' ' + card.textContent).toLowerCase();
        card.style.display = !q || hay.includes(q) ? '' : 'none';
      });
    });
  }
})();
