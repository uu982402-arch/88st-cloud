(() => {
  const root = document.querySelector('.v61-home');
  if (!root) return;
  const input = document.querySelector('[data-v61-search]');
  const cards = Array.from(document.querySelectorAll('[data-v61-card]'));
  const form = document.querySelector('.v61-search');
  if (form) form.addEventListener('submit', (event) => event.preventDefault());
  function normalize(value){ return (value || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function apply(){
    const query = normalize(input?.value || '');
    for (const card of cards) {
      const text = normalize(card.dataset.name + ' ' + card.textContent);
      card.classList.toggle('v61-card-hidden', Boolean(query) && !text.includes(query));
    }
  }
  if (input) input.addEventListener('input', apply, { passive: true });
  document.querySelectorAll('.v61-provider-visual img').forEach((img) => {
    img.addEventListener('error', () => {
      img.removeAttribute('src');
      img.alt = '88ST provider';
      img.style.display = 'none';
      const fallback = document.createElement('span');
      fallback.textContent = '88ST';
      fallback.style.cssText = 'font-weight:950;color:#fff;font-size:24px;letter-spacing:-.06em';
      img.parentElement?.appendChild(fallback);
    }, { once: true });
  });
})();
