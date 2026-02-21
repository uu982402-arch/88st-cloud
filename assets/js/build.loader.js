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
      "/assets/js/j.8829a3ccde44.js",
      "/assets/js/pro-suite.v2.js"
    ];

    for (var i = 0; i < cssList.length; i++) addCSS(cssList[i]);

    function loadJS(){
      for (var j = 0; j < jsList.length; j++) addJS(jsList[j]);
    }



    // --- Recent tool visit tracker (for Home "최근 사용") ---
    function addRecentTool(item){
      try{
        var KEY = '88st_recent_tools_v1';
        var arr = [];
        try{ arr = JSON.parse(localStorage.getItem(KEY) || '[]'); }catch(e){ arr = []; }
        if(!Array.isArray(arr)) arr = [];
        var href = String(item && item.href || '').trim();
        if(!href) return;
        arr = arr.filter(function(x){ return x && x.href !== href; });
        arr.unshift({ title: String(item.title||'').trim() || href, href: href, ts: Date.now() });
        if(arr.length > 20) arr = arr.slice(0,20);
        localStorage.setItem(KEY, JSON.stringify(arr));
      }catch(e){}
    }

    function trackToolVisit(){
      try{
        if(!window.localStorage) return;
        var path = String(location.pathname || '/');
        // ignore assets and non-app paths
        if(path.indexOf('/assets/')===0) return;

        var map = [
          {p:'/analysis/', t:'스포츠 분석기'},
          {p:'/tool-margin/', t:'마진 계산기'},
          {p:'/tool-ev/', t:'EV 계산기'},
          {p:'/tool-odds/', t:'배당↔확률 변환'},
          {p:'/tool/fair-odds/', t:'공정배당 계산기'},
          {p:'/tool/kelly/', t:'Kelly 비중'},
          {p:'/tool-casino/', t:'카지노 전략 분석기'},
          {p:'/tool-minigame/', t:'미니게임 분석기'},
          {p:'/tool-virtual/', t:'BET365 가상게임'},
          {p:'/tool-slot/', t:'슬롯 RTP 분석기'},
          {p:'/calc/', t:'스포츠 계산기 홈'},
          {p:'/logbook/', t:'베팅 로그북'},
          {p:'/bonus-checklist/', t:'입플 체크리스트'}
        ];

        var title = '';
        var href = path;
        for(var i=0;i<map.length;i++){
          if(path.indexOf(map[i].p)===0){ title = map[i].t; href = map[i].p; break; }
        }

        // also track home (but keep it low priority)
        if(!title && path==='/' ){
          title = '홈'; href = '/';
        }

        if(title){
          // avoid spamming when reloading the same page repeatedly
          var lastKey = '__88st_last_visit';
          var last = '';
          try{ last = localStorage.getItem(lastKey) || ''; }catch(e){}
          var cur = title + '|' + href;
          if(cur !== last){
            addRecentTool({title:title, href:href});
            try{ localStorage.setItem(lastKey, cur); }catch(e){}
          }
        }
      }catch(e){}
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function(){ loadJS(); trackToolVisit(); });
    } else {
      loadJS();
      trackToolVisit();
    }
  } catch (e) {
    // fail silently; page will still render basic HTML
  }
})();
