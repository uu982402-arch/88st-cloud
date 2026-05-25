(function () {
  'use strict';

  var VERSION = 'static-v89-ga4-event-depth-20260526';
  var BLOCKED_PATHS = [/^\/ops\/?/i, /^\/admin\/?/i, /^\/api\/?/i];
  var path = window.location.pathname || '/';

  if (BLOCKED_PATHS.some(function (pattern) { return pattern.test(path); })) {
    return;
  }

  var sent = Object.create(null);
  var timers = Object.create(null);

  function textOf(value, max) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max || 120);
  }

  function cssName(el) {
    if (!el) return '';
    try { return String(el.className || ''); } catch (error) { return ''; }
  }

  function closest(target, selector) {
    return target && target.closest ? target.closest(selector) : null;
  }

  function pageType() {
    if (path === '/') return 'home';
    if (path === '/blog/') return 'blog_hub';
    if (/^\/blog\//.test(path)) return 'blog_post';
    if (path === '/tools/') return 'tools_hub';
    if (/^\/tools?\//.test(path) || /^\/tool-/.test(path)) return 'tool_detail';
    if (path === '/guaranteed/') return 'guaranteed_hub';
    if (/^\/guaranteed\//.test(path)) return 'vendor_detail';
    if (path === '/consult/') return 'consult';
    if (path === '/sports-check/') return 'sports_hub';
    if (/^\/sports-check\//.test(path)) return 'sports_detail';
    if (path === '/search-guides/') return 'search_guides_hub';
    if (/^\/search-guides\//.test(path)) return 'search_guides_detail';
    return 'page';
  }

  function baseParams(extra) {
    return Object.assign({
      page_path: path,
      page_title: document.title,
      page_type: pageType(),
      rust_version: VERSION
    }, extra || {});
  }

  function send(name, params, onceKey) {
    if (!name) return;
    var key = onceKey || '';
    if (key && sent[key]) return;
    if (key) sent[key] = true;

    var payload = baseParams(params || {});

    if (window.RUST_GA4 && typeof window.RUST_GA4.event === 'function') {
      window.RUST_GA4.event(name, payload);
      return;
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', name, payload);
    }
  }

  function debounce(name, fn, wait) {
    window.clearTimeout(timers[name]);
    timers[name] = window.setTimeout(fn, wait || 320);
  }

  function trackScrollDepth() {
    var doc = document.documentElement;
    var body = document.body;
    var max = Math.max(
      body ? body.scrollHeight : 0,
      doc ? doc.scrollHeight : 0
    ) - window.innerHeight;

    if (max <= 0) return;

    var pct = Math.round((window.scrollY / max) * 100);

    if (pct >= 50) {
      send('blog_scroll_50', { scroll_percent: 50 }, path + ':scroll50');
    }
    if (pct >= 90) {
      send('blog_scroll_90', { scroll_percent: 90 }, path + ':scroll90');
      if (/^\/(blog|sports-check|search-guides)\//.test(path) && !/\/$/.test(path.replace(/^\/(blog|sports-check|search-guides)\/$/, ''))) {
        send('post_read_complete', { scroll_percent: 90 }, path + ':readComplete');
      }
    }
  }

  window.addEventListener('scroll', function () {
    debounce('scroll-depth', trackScrollDepth, 150);
  }, { passive: true });

  function classify(target) {
    var el = closest(target, 'a, button, input, [role="button"], [data-ga4-event], [data-copy-code], [data-code], [data-tool], [data-v73-copy], [data-v88-copy-indexing], [data-v82-copy]');
    if (!el) return null;

    var href = el.getAttribute('href') || el.getAttribute('data-url') || el.getAttribute('data-href') || '';
    var text = textOf(el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || el.value || '');
    var cls = cssName(el);
    var explicit = el.getAttribute('data-ga4-event');
    var code = el.getAttribute('data-code') || el.getAttribute('data-copy-code') || '';
    var tool = el.getAttribute('data-tool') || el.getAttribute('data-tool-id') || el.getAttribute('data-v73-tool') || '';

    if (explicit) return { name: explicit, params: { link_url: href, link_text: text, item_id: tool || code || '' } };

    if (/t\.me|telegram|TRS999|텔레그램/i.test(href + ' ' + text)) {
      return { name: 'telegram_open', params: { link_url: href, link_text: text } };
    }

    if (/상담|consult|고객센터/i.test(href + ' ' + text + ' ' + cls)) {
      return { name: 'consult_click', params: { link_url: href, link_text: text } };
    }

    if (/rust-bottom-nav|mobile-nav|bottom-nav/i.test(cls) || closest(el, '.rust-bottom-nav, .mobile-nav, [data-rust-bottom-nav]')) {
      return { name: 'mobile_bottom_nav_click', params: { link_url: href, link_text: text } };
    }

    if (/^\/guaranteed\/(?!$)/i.test(href) || /상세보기|vendor detail|보증업체 상세/i.test(text + ' ' + cls)) {
      return { name: 'vendor_detail_click', params: { link_url: href, link_text: text } };
    }

    if (code || /가입코드|코드복사|code copy|copy code/i.test(text + ' ' + cls)) {
      return { name: 'vendor_copy_code', params: { vendor_code: code, link_url: href, link_text: text } };
    }

    if (/바로가기|공식주소|외부|official|outbound/i.test(text + ' ' + cls) && /guaranteed|vendor|partner|보증/i.test(document.body.className + ' ' + path + ' ' + cls)) {
      return { name: 'vendor_outbound_click', params: { link_url: href, link_text: text } };
    }

    if (/결과 복사|result copy|계산 결과|복사/i.test(text + ' ' + cls) && /tool|v73|result|copy/i.test(cls + ' ' + path)) {
      return { name: 'tool_result_copy', params: { tool_id: tool, link_url: href, link_text: text } };
    }

    if (/\/tools\//i.test(href) || /^\/tool-/i.test(href) || tool || /도구|tool_open|계산기|분석도구/i.test(text + ' ' + cls)) {
      return { name: 'tool_open', params: { tool_id: tool, link_url: href, link_text: text } };
    }

    if (/\/blog\//i.test(href)) {
      return { name: 'blog_card_click', params: { link_url: href, link_text: text } };
    }

    if (/\/sports-check\//i.test(href)) {
      return { name: 'sports_check_click', params: { link_url: href, link_text: text } };
    }

    if (/\/search-guides\//i.test(href)) {
      return { name: 'search_guide_click', params: { link_url: href, link_text: text } };
    }

    if (/carousel|slider|motion|rail|track|v81|marquee/i.test(cls + ' ' + (closest(el, '[class]') ? cssName(closest(el, '[class]')) : ''))) {
      return { name: 'carousel_card_click', params: { link_url: href, link_text: text } };
    }

    return null;
  }

  document.addEventListener('click', function (event) {
    var hit = classify(event.target);
    if (hit) send(hit.name, hit.params);
  }, { capture: true, passive: true });

  document.addEventListener('submit', function (event) {
    var form = event.target;
    var text = textOf(form.getAttribute('aria-label') || form.id || form.className || 'search_form');
    if (/search|검색|v72|blog/i.test(text + ' ' + path)) {
      send('search_keyword_click', { search_context: text, search_term: textOf((form.querySelector('input[type="search"], input[name="q"], input') || {}).value || '', 80) });
    }
  }, { capture: true });

  document.addEventListener('input', function (event) {
    var input = event.target;
    if (!input || !/input|textarea/i.test(input.tagName || '')) return;
    var type = String(input.getAttribute('type') || '').toLowerCase();
    var placeholder = textOf(input.getAttribute('placeholder') || input.getAttribute('aria-label') || input.name || input.id || '', 80);
    var cls = cssName(input);
    if (type === 'search' || /검색|search|keyword|v72|blog/i.test(placeholder + ' ' + cls)) {
      debounce('search-keyword:' + path, function () {
        var value = textOf(input.value || '', 80);
        if (value.length >= 2) {
          send('search_keyword_click', { search_context: placeholder || pageType(), search_term: value });
        }
      }, 700);
    }
  }, { capture: true, passive: true });

  document.addEventListener('DOMContentLoaded', function () {
    trackScrollDepth();
    window.RUST_GA4_DEPTH = Object.freeze({ version: VERSION, marker: 'V89_GA4_EVENT_DEPTH_ACTIVE', event: send });
  });
})();
