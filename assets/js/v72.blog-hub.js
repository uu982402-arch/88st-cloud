(function () {
  var pageSize = 50;
  var posts = Array.isArray(window.__V72_BLOG_POSTS__) ? window.__V72_BLOG_POSTS__ : [];
  var grid = document.querySelector('[data-v72-blog-grid]');
  var pagination = document.querySelector('[data-v72-pagination]');
  var searchInput = document.querySelector('[data-v72-blog-search]');
  var countChip = document.querySelector('[data-v72-count]');

  if (!grid || !pagination || posts.length === 0) {
    return;
  }

  function getPage() {
    var params = new URLSearchParams(window.location.search);
    var value = parseInt(params.get('page') || '1', 10);
    if (!Number.isFinite(value) || value < 1) return 1;
    return value;
  }

  function escapeText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function formatViews(value) {
    var num = Number(value || 0);
    if (num >= 10000) return (num / 10000).toFixed(1).replace('.0', '') + '만';
    return num.toLocaleString('ko-KR');
  }

  function card(post, index) {
    var rank = index + 1;
    return '<a class="v72-blog-card" href="' + escapeText(post.href) + '" data-title="' + escapeText(post.title) + '" data-category="' + escapeText(post.category) + '">' +
      '<div class="v72-blog-card__body">' +
        '<div class="v72-blog-card__top"><span class="v72-blog-card__rank">' + rank + '</span><span class="v72-blog-card__tag">' + escapeText(post.category) + '</span></div>' +
        '<strong>' + escapeText(post.title) + '</strong>' +
        '<p>' + escapeText(post.excerpt) + '</p>' +
      '</div>' +
      '<div class="v72-blog-card__meta"><span class="v72-blog-card__views">조회 ' + formatViews(post.views) + '</span><span class="v72-blog-card__go">›</span></div>' +
    '</a>';
  }

  function pageButton(label, page, current, disabled) {
    var attrs = 'class="v72-page-btn"';
    if (current) attrs += ' aria-current="page"';
    if (disabled) attrs += ' aria-disabled="true" tabindex="-1"';
    var href = disabled ? '#' : '/blog/' + (page > 1 ? '?page=' + page : '');
    return '<a ' + attrs + ' href="' + href + '" data-v72-page="' + page + '">' + label + '</a>';
  }

  function render(targetPage, filtered) {
    var list = filtered || posts;
    var totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    var page = Math.min(Math.max(1, targetPage || getPage()), totalPages);
    var start = (page - 1) * pageSize;
    var visible = list.slice(start, start + pageSize);

    grid.innerHTML = visible.map(function (post, idx) { return card(post, start + idx); }).join('');

    var buttons = [];
    buttons.push(pageButton('이전', Math.max(1, page - 1), false, page === 1));
    for (var i = 1; i <= totalPages; i += 1) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
        buttons.push(pageButton(String(i), i, i === page, false));
      } else if (Math.abs(i - page) === 3) {
        buttons.push('<span class="v72-page-btn" aria-hidden="true">…</span>');
      }
    }
    buttons.push(pageButton('다음', Math.min(totalPages, page + 1), false, page === totalPages));
    pagination.innerHTML = buttons.join('');
    if (countChip) countChip.textContent = '총 ' + list.length.toLocaleString('ko-KR') + '개 / 페이지당 50개';
  }

  pagination.addEventListener('click', function (event) {
    var link = event.target.closest('[data-v72-page]');
    if (!link || link.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    var nextPage = parseInt(link.getAttribute('data-v72-page'), 10) || 1;
    var params = new URLSearchParams(window.location.search);
    if (nextPage <= 1) params.delete('page'); else params.set('page', String(nextPage));
    var query = params.toString();
    history.pushState(null, '', '/blog/' + (query ? '?' + query : ''));
    render(nextPage, getFilteredPosts());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function getFilteredPosts() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (!keyword) return posts;
    return posts.filter(function (post) {
      return [post.title, post.category, post.excerpt].join(' ').toLowerCase().indexOf(keyword) !== -1;
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      render(1, getFilteredPosts());
    });
  }

  window.addEventListener('popstate', function () { render(getPage(), getFilteredPosts()); });
  render(getPage(), posts);
})();
