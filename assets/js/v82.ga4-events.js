(function () {
  'use strict';

  var VERSION = 'static-v82-1-structure-ga4-20260525';
  var GA_ID = 'G-KWT87FBY6S';
  var BLOCKED_PATHS = [/^\/ops\/?/i, /^\/admin\/?/i];
  var path = window.location.pathname || '/';

  if (BLOCKED_PATHS.some(function (pattern) { return pattern.test(path); })) {
    return;
  }

  function getMeta(name) {
    var node = document.querySelector('meta[name="' + name + '"]');
    return node ? String(node.getAttribute('content') || '').trim() : '';
  }

  var metaId = getMeta('rust-ga4-id');
  if (/^G-[A-Z0-9]+$/i.test(metaId)) {
    GA_ID = metaId;
  }

  if (!/^G-[A-Z0-9]+$/i.test(GA_ID)) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  var hasLoader = document.querySelector('script[src*="googletagmanager.com/gtag/js?id="]');
  if (!hasLoader) {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    script.setAttribute('data-rust-ga4-loader', VERSION);
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    send_page_view: true,
    page_title: document.title,
    page_location: window.location.href,
    page_path: path
  });

  function safeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  }

  function sendEvent(name, params) {
    if (!name || typeof window.gtag !== 'function') {
      return;
    }

    var payload = Object.assign({
      page_path: path,
      page_title: document.title,
      rust_version: VERSION
    }, params || {});

    window.gtag('event', name, payload);
  }

  function classifyClick(target) {
    var el = target.closest('a, button, [role="button"], [data-ga4-event], [data-copy-code], [data-code], [data-tool]');
    if (!el) {
      return null;
    }

    var href = el.getAttribute('href') || el.getAttribute('data-url') || el.getAttribute('data-href') || '';
    var text = safeText(el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '');
    var classes = String(el.className || '');
    var explicit = el.getAttribute('data-ga4-event');
    var code = el.getAttribute('data-code') || el.getAttribute('data-copy-code') || '';
    var tool = el.getAttribute('data-tool') || el.getAttribute('data-tool-id') || '';

    if (explicit) {
      return { name: explicit, params: { link_url: href, link_text: text, item_id: tool || code || '' } };
    }

    if (code || /가입코드|코드복사|copy/i.test(text + ' ' + classes)) {
      return { name: 'vendor_copy_code', params: { vendor_code: code, link_url: href, link_text: text } };
    }

    if (/t\.me|telegram|TRS999|상담|consult/i.test(href + ' ' + text + ' ' + classes)) {
      return { name: 'consult_click', params: { link_url: href, link_text: text } };
    }

    if (/\/guaranteed\//i.test(href) || /보증|vendor|partner/i.test(text + ' ' + classes)) {
      return { name: 'vendor_outbound_click', params: { link_url: href, link_text: text } };
    }

    if (/\/tools\//i.test(href) || tool || /도구|tool/i.test(text + ' ' + classes)) {
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

    if (/carousel|slider|motion|rail|track|v81/i.test(classes)) {
      return { name: 'carousel_card_click', params: { link_url: href, link_text: text } };
    }

    return null;
  }

  document.addEventListener('click', function (event) {
    var hit = classifyClick(event.target);
    if (hit) {
      sendEvent(hit.name, hit.params);
    }
  }, { capture: true, passive: true });

  window.RUST_GA4 = Object.freeze({
    version: VERSION,
    measurementId: GA_ID,
    event: sendEvent
  });
})();
