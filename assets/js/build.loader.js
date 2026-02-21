/**
 * Global asset loader (CSS/JS) with cache-busting via window.__BUILD_VER.
 *
 * v107+: The list of "core assets" is auto-detected at build time and embedded into
 *         window.__BUILD_ASSETS by scripts/gen-build-ver.mjs.
 *         This keeps the loader stable even if filenames/hashes change.
 */
(function () {
  try {
    var v = (window.__BUILD_VER || "0") + "";
    var head = document.head || document.getElementsByTagName("head")[0];

    // --- Hard cache reset (optional safety net) ---
    // If a browser had a stale Service Worker / CacheStorage from older deployments,
    // it can keep serving outdated assets even after new builds.
    // We clear SW + caches ONCE per build version.
    try {
      var swKey = "__88st_cache_reset__" + v;
      if (window.localStorage && localStorage.getItem(swKey) !== "1") {
        if ("serviceWorker" in navigator && navigator.serviceWorker.getRegistrations) {
          navigator.serviceWorker.getRegistrations().then(function (regs) {
            return Promise.all(regs.map(function (r) { return r.unregister(); }));
          }).catch(function () {});
        }
        if ("caches" in window && caches.keys) {
          caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) { return caches.delete(k); }));
          }).catch(function () {});
        }
        try { localStorage.setItem(swKey, "1"); } catch (e) {}
      }
    } catch (e) {}


    function withVer(url) {
      return url + (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + encodeURIComponent(v);
    }

    function hasTag(selector, attr, baseUrl) {
      var nodes = document.querySelectorAll(selector);
      for (var i = 0; i < nodes.length; i++) {
        var val = nodes[i].getAttribute(attr) || "";
        if (val.indexOf(baseUrl) === 0) return true;
      }
      return false;
    }

    function addCSS(href) {
      // prevent duplicates if a page already includes it
      if (hasTag('link[rel="stylesheet"]', "href", href)) return;
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = withVer(href);
      head.appendChild(l);
    }

    function addJS(src) {
      if (hasTag("script", "src", src)) return;
      var s = document.createElement("script");
      s.src = withVer(src);
      // Dynamic scripts: prefer ordered execution across browsers
      s.async = false;
      head.appendChild(s);
    }

    // --- Core global assets (loaded on every page) ---
    var assets = window.__BUILD_ASSETS;
    var cssList = (assets && assets.css && assets.css.length) ? assets.css : [
      "/assets/css/vvip-luxe.v75.css",
      "/assets/css/vvip-hub.v85.css",
      "/assets/css/patch.v98.homedash.20260221.css",
      "/assets/css/pro-suite.v2.css"
    ];
    var jsList = (assets && assets.js && assets.js.length) ? assets.js : [
      "/assets/js/vvip-global.v75.js",
      "/assets/js/j.searchtyping.v83.20260219.js",
      "/assets/js/pro-suite.v2.js"
    ];

    for (var i = 0; i < cssList.length; i++) addCSS(cssList[i]);

    function loadJS(){
      for (var j = 0; j < jsList.length; j++) addJS(jsList[j]);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function(){ loadJS(); });
    } else {
      loadJS();
    }
  } catch (e) {
    // fail silently; page will still render basic HTML
  }
})();
