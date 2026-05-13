(() => {
  const DEFAULT_ID = '';
  const VALID_ID = /^G-[A-Z0-9]{4,}$/i;
  const CONFIG_URL = '/assets/config/analytics.ga4.json';

  const loadGtag = (measurementId) => {
    if (!measurementId || !VALID_ID.test(measurementId) || measurementId === 'G-XXXXXXXXXX') {
      document.documentElement.setAttribute('data-ga4', 'not-configured');
      return;
    }
    if (window.__GA4_LOADED__) return;
    window.__GA4_LOADED__ = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    script.onload = () => {
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        send_page_view: true,
        anonymize_ip: true
      });
      document.documentElement.setAttribute('data-ga4', 'active');
    };
    script.onerror = () => {
      document.documentElement.setAttribute('data-ga4', 'load-error');
    };
    document.head.appendChild(script);
  };

  const fromGlobal = String(window.__GA4_MEASUREMENT_ID__ || DEFAULT_ID || '').trim();
  if (fromGlobal && VALID_ID.test(fromGlobal)) {
    loadGtag(fromGlobal);
    return;
  }

  fetch(CONFIG_URL, { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : null)
    .then((config) => {
      if (!config || config.enabled !== true) {
        document.documentElement.setAttribute('data-ga4', 'disabled');
        return;
      }
      loadGtag(String(config.measurement_id || '').trim());
    })
    .catch(() => {
      document.documentElement.setAttribute('data-ga4', 'config-error');
    });
})();