(function () {
  var panel = document.querySelector('[data-v87-live-deploy]');
  if (!panel) return;

  var list = document.querySelector('[data-v87-live-list]');
  var log = document.querySelector('[data-v87-live-log]');
  var runButton = document.querySelector('[data-v87-run-live-check]');
  var copyButton = document.querySelector('[data-v87-copy-urls]');
  var config = null;

  function writeLog(message) {
    if (!log) return;
    var time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    log.textContent = '[' + time + '] ' + message + '\n' + (log.textContent || '');
  }

  function stateClass(ok, pending) {
    if (pending) return 'v87-live-state is-wait';
    return ok ? 'v87-live-state' : 'v87-live-state is-fail';
  }

  function render(items, statusMap) {
    if (!list || !items) return;
    list.innerHTML = items.map(function (item) {
      var state = statusMap && statusMap[item.url];
      var pending = !state;
      var ok = state && state.ok;
      var text = pending ? '대기' : (ok ? '정상' : '점검 필요');
      var detail = state && state.detail ? state.detail : item.file;
      return '<article class="v87-live-item">' +
        '<small>' + escapeHtml(item.label || item.url) + '</small>' +
        '<b>' + escapeHtml(item.url) + '</b>' +
        '<a href="' + escapeAttr(item.url) + '" target="_blank" rel="noopener">열기</a>' +
        '<span class="' + stateClass(ok, pending) + '">' + text + '</span>' +
        '<small style="margin-top:8px">' + escapeHtml(detail) + '</small>' +
        '</article>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }

  function normalizeUrl(path) {
    if (!path) return '/';
    if (/^https?:\/\//i.test(path)) return path;
    return path.charAt(0) === '/' ? path : '/' + path;
  }

  function fetchConfig() {
    return fetch('/assets/data/v87-live-deploy-check.json?v=' + Date.now(), { cache: 'no-store' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        config = data;
        render(config.keyUrls || [], null);
        writeLog('검증 목록 로드 완료: ' + ((config.keyUrls || []).length) + '개 URL');
        return config;
      })
      .catch(function (error) {
        writeLog('검증 목록 로드 실패: ' + error.message);
      });
  }

  function checkOne(item) {
    var url = normalizeUrl(item.url);
    return fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + 'v87_live=' + Date.now(), { cache: 'no-store' })
      .then(function (res) {
        return res.text().then(function (text) {
          var missing = (item.mustContain || []).filter(function (needle) { return text.indexOf(needle) === -1; });
          var forbidden = (item.mustNotContain || []).filter(function (needle) { return text.indexOf(needle) !== -1; });
          var ok = res.ok && missing.length === 0 && forbidden.length === 0;
          var detail = 'HTTP ' + res.status;
          if (missing.length) detail += ' / 누락: ' + missing.slice(0, 3).join(', ');
          if (forbidden.length) detail += ' / 금지문구: ' + forbidden.slice(0, 3).join(', ');
          return { ok: ok, detail: detail };
        });
      })
      .catch(function (error) {
        return { ok: false, detail: error.message };
      });
  }

  function runLiveCheck() {
    if (!config) {
      writeLog('검증 목록이 아직 없습니다. 다시 로드합니다.');
      return fetchConfig().then(runLiveCheck);
    }
    var items = config.keyUrls || [];
    var statusMap = {};
    render(items, statusMap);
    writeLog('라이브 검증 시작');

    return items.reduce(function (promise, item) {
      return promise.then(function () {
        return checkOne(item).then(function (result) {
          statusMap[item.url] = result;
          render(items, statusMap);
          writeLog(item.url + ' → ' + (result.ok ? '정상' : '점검 필요') + ' (' + result.detail + ')');
        });
      });
    }, Promise.resolve()).then(function () {
      var failed = Object.keys(statusMap).filter(function (key) { return !statusMap[key].ok; });
      writeLog('라이브 검증 완료: 정상 ' + (items.length - failed.length) + ' / 점검 필요 ' + failed.length);
    });
  }

  function copyUrls() {
    if (!config) return;
    var text = (config.keyUrls || []).map(function (item) { return location.origin + normalizeUrl(item.url); }).join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { writeLog('URL 목록 복사 완료'); });
    } else {
      writeLog('클립보드 API를 사용할 수 없습니다.');
    }
  }

  if (runButton) runButton.addEventListener('click', runLiveCheck);
  if (copyButton) copyButton.addEventListener('click', copyUrls);
  fetchConfig();
})();
