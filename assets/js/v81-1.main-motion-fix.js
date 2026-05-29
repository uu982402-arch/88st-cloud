(function () {
  var state = {
    blogOffset: 0,
    sportsOffset: 0,
    guidesOffset: 0,
    paused: false,
    hubPaused: false
  };

  function text(value, fallback) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  function readPool(id) {
    var node = document.getElementById(id);
    if (!node) return [];
    try {
      var data = JSON.parse(node.textContent || '[]');
      return Array.isArray(data) ? data.filter(function (item) {
        return item && typeof item.href === 'string' && item.href !== '/' && item.href.indexOf('#') !== 0;
      }) : [];
    } catch (error) {
      return [];
    }
  }

  function applyCard(card, item, type) {
    if (!card || !item) return;
    card.setAttribute('href', item.href);
    card.setAttribute('aria-label', text(item.title, '게시글') + ' 보기');

    var category = card.querySelector('[data-v811-category]') || card.querySelector('em');
    var title = card.querySelector('[data-v811-title]') || card.querySelector('strong');
    var summary = card.querySelector('[data-v811-summary]') || card.querySelector('span:last-child');

    if (category) category.textContent = text(item.category, type || 'GUIDE');
    if (title) title.textContent = text(item.title, 'RUST 정보 가이드');
    if (summary) summary.textContent = text(item.summary, '상세 기준을 확인할 수 있는 RUST 가이드입니다.');

    card.classList.remove('v81-1-card-fade');
    void card.offsetWidth;
    card.classList.add('v81-1-card-fade');
  }

  function rotateLane(cards, pool, offsetKey, step, type) {
    if (!cards.length || !pool.length) return;
    state[offsetKey] = (state[offsetKey] + step) % pool.length;
    cards.forEach(function (card, index) {
      var item = pool[(state[offsetKey] + index) % pool.length];
      applyCard(card, item, type);
    });
  }

  function bindPause(container, key) {
    if (!container) return;
    ['mouseenter', 'focusin', 'touchstart'].forEach(function (eventName) {
      container.addEventListener(eventName, function () {
        state[key] = true;
        container.classList.add('is-paused');
      }, { passive: true });
    });
    ['mouseleave', 'focusout', 'touchend', 'touchcancel'].forEach(function (eventName) {
      container.addEventListener(eventName, function () {
        state[key] = false;
        container.classList.remove('is-paused');
      }, { passive: true });
    });
  }

  function init() {
    var blogPool = readPool('v81-1-blog-pool');
    var sportsPool = readPool('v81-1-sports-pool');
    var guidesPool = readPool('v81-1-guides-pool');

    var blogWrap = document.querySelector('[data-v811-blog-rotator]');
    var sportsWrap = document.querySelector('[data-v811-sports-lane]');
    var guidesWrap = document.querySelector('[data-v811-guides-lane]');

    var blogCards = Array.prototype.slice.call(document.querySelectorAll('[data-v811-blog-card]'));
    var sportsCards = Array.prototype.slice.call(document.querySelectorAll('[data-v811-sports-card]'));
    var guideCards = Array.prototype.slice.call(document.querySelectorAll('[data-v811-guides-card]'));

    bindPause(blogWrap, 'paused');
    bindPause(sportsWrap, 'hubPaused');
    bindPause(guidesWrap, 'hubPaused');

    if (blogPool.length) {
      blogCards.forEach(function (card, index) {
        applyCard(card, blogPool[index % blogPool.length], 'BLOG');
      });
    }
    if (sportsPool.length) {
      sportsCards.forEach(function (card, index) {
        applyCard(card, sportsPool[index % sportsPool.length], 'SPORTS');
      });
    }
    if (guidesPool.length) {
      guideCards.forEach(function (card, index) {
        applyCard(card, guidesPool[index % guidesPool.length], 'GUIDE');
      });
    }

    window.setInterval(function () {
      if (!state.paused) rotateLane(blogCards, blogPool, 'blogOffset', 15, 'BLOG');
    }, 5200);

    window.setInterval(function () {
      if (!state.hubPaused) {
        rotateLane(sportsCards, sportsPool, 'sportsOffset', 5, 'SPORTS');
        rotateLane(guideCards, guidesPool, 'guidesOffset', 5, 'GUIDE');
      }
    }, 6200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
