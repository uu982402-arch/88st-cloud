/* V97 CONTENT / SEO CLEAN PATCH */
(() => {
  'use strict';
  const VERSION = 'V97-CONTENT-SEO-CLEAN-20260526';
  const root = document.documentElement;
  root.dataset.v97ContentSeoClean = 'active';
  window.__RUST_V97_BUILD__ = VERSION;
  window.__RUST_SEO_CLEAN__ = Object.freeze({ version: VERSION, scope: 'content-card-copy-canonical-robots-sitemap' });

  const cleanDuplicateText = (node) => {
    if (!node) return;
    const title = node.querySelector('strong')?.textContent?.trim();
    const desc = node.querySelector('p, [data-v811-summary]');
    if (!title || !desc) return;
    const text = desc.textContent.trim();
    const doubled = text.startsWith(title + title) || text.includes('기준 기준') || text.includes('RUST 블로그는 토토사이트추천');
    if (doubled) {
      desc.dataset.v97FallbackSummary = 'true';
      desc.textContent = title + '의 핵심 조건과 확인 순서를 짧게 정리했습니다.';
    }
  };
  document.querySelectorAll('.v71-blog-card,.v72-blog-card,.v79-card').forEach(cleanDuplicateText);
})();
