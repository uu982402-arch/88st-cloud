
(() => {
  const DATA_URL = '/assets/data/auto.consult.v1.20260505.json';
  let state = { data: null, panel: null, body: null, toast: null };

  const h = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  })[ch]);

  const copyText = async (text) => {
    const value = String(text || '').trim();
    if (!value) return false;
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (__) {}
      ta.remove();
      return true;
    }
  };

  const toast = (message) => {
    if (!state.toast) return;
    state.toast.textContent = message;
    state.toast.classList.add('is-show');
    clearTimeout(state.toast._timer);
    state.toast._timer = setTimeout(() => state.toast.classList.remove('is-show'), 1500);
  };

  const actionLink = (label, url, primary=false) => {
    const cls = primary ? 'auto-consult-action is-primary' : 'auto-consult-action';
    return `<a class="${cls}" href="${h(url)}" target="${url.startsWith('http') ? '_blank' : '_self'}" rel="nofollow noopener">${h(label)}</a>`;
  };

  const renderStart = () => {
    const start = state.data.flows.start;
    state.body.innerHTML = `
      <div class="auto-consult-msg">
        <h3 class="auto-consult-title">무엇을 도와드릴까요?</h3>
        <p>${h(start.message)}</p>
        <div class="auto-consult-options">
          ${start.options.map((o, i) => `<button type="button" class="auto-consult-option ${i === 0 ? 'is-primary' : ''}" data-consult-next="${h(o.next)}">${h(o.label)}</button>`).join('')}
        </div>
      </div>
      <div class="auto-consult-msg">
        <h3 class="auto-consult-title">빠른 연결</h3>
        <p>직접 상담은 <strong>@seoa69</strong>, 자동화 가입 안내와 분석봇은 <strong>@odds88st_bot</strong>으로 안내합니다.</p>
        <div class="auto-consult-actions">
          ${actionLink('@seoa69 상담', state.data.contacts.human.url, true)}
          ${actionLink('@odds88st_bot', state.data.contacts.automation.url)}
        </div>
      </div>`;
  };

  const renderProviderSelect = () => {
    state.body.innerHTML = `
      <div class="auto-consult-msg">
        <h3 class="auto-consult-title">가입 안내를 원하는 업체를 선택하세요</h3>
        <p>가입코드, 공식주소, 상담 텔레그램, 자동상담 봇을 한 번에 확인할 수 있습니다.</p>
        <div class="auto-consult-options">
          ${state.data.providers.map(p => `<button type="button" class="auto-consult-option" data-consult-provider="${h(p.slug)}">${h(p.name)}</button>`).join('')}
        </div>
      </div>`;
  };

  const renderProvider = (slug) => {
    const p = state.data.providers.find(x => x.slug === slug);
    if (!p) return renderStart();
    const benefits = (p.benefits || []).map(x => `<li>${h(x)}</li>`).join('');
    state.body.innerHTML = `
      <div class="auto-consult-msg">
        <div class="auto-consult-provider">
          <img src="${h(p.imageUrl)}" alt="${h(p.name)} 로고"/>
          <div>
            <h3 class="auto-consult-title">${h(p.name)} 가입 안내</h3>
            <p>${h(p.notice)}</p>
          </div>
        </div>
        <div class="auto-consult-kv">
          <div><b>가입코드</b><span>${h(p.code)}</span></div>
          <div><b>공식주소</b><span>${h(p.officialDomain || p.officialUrl)}</span></div>
          <div><b>상담</b><span>@seoa69</span></div>
          <div><b>자동상담/분석봇</b><span>@odds88st_bot</span></div>
        </div>
        <ul class="auto-consult-checks">${benefits}</ul>
        <div class="auto-consult-actions">
          <button type="button" class="auto-consult-action is-primary" data-consult-copy="${h(p.code)}">코드 복사</button>
          <a class="auto-consult-action" data-consult-open="${h(p.code)}" href="${h(p.officialUrl)}" target="_blank" rel="nofollow sponsored noopener">공식주소 이동</a>
          ${actionLink('@seoa69 상담', state.data.contacts.human.url)}
          ${actionLink('자동상담 봇', state.data.contacts.automation.url)}
        </div>
      </div>`;
  };

  const renderFlow = (key) => {
    if (key === 'provider') return renderProviderSelect();
    const flow = state.data.flows[key];
    if (!flow) return renderStart();
    const checks = (flow.checks || []).map(x => `<li>${h(x)}</li>`).join('');
    const links = (flow.links || []).map((l, i) => actionLink(l.label, l.url, i === 0)).join('');
    state.body.innerHTML = `
      <div class="auto-consult-msg">
        <h3 class="auto-consult-title">${h(flow.title || '안내')}</h3>
        <p>${h(flow.message)}</p>
        ${checks ? `<ul class="auto-consult-checks">${checks}</ul>` : ''}
        ${links ? `<div class="auto-consult-actions">${links}</div>` : ''}
      </div>`;
  };

  const inject = async () => {
    if (document.querySelector('.auto-consult-launcher')) return;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      state.data = await res.json();
    } catch (_) {
      return;
    }

    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'auto-consult-launcher';
    launcher.textContent = '자동상담';

    const panel = document.createElement('section');
    panel.className = 'auto-consult-panel';
    panel.setAttribute('aria-label', '88ST 자동상담센터');
    panel.innerHTML = `
      <div class="auto-consult-head">
        <div><strong>88ST 자동상담센터</strong><span>가입 안내 · 코드 확인 · 이벤트 조건 · 분석봇 연결</span></div>
        <button type="button" class="auto-consult-close" aria-label="상담창 닫기">×</button>
      </div>
      <div class="auto-consult-body"></div>
      <div class="auto-consult-foot">
        <button type="button" class="auto-consult-option" data-consult-next="start">처음으로</button>
        <a class="auto-consult-option is-primary" href="https://t.me/seoa69" target="_blank" rel="nofollow noopener">담당자 연결</a>
      </div>`;

    const toastEl = document.createElement('div');
    toastEl.className = 'auto-consult-toast';
    toastEl.setAttribute('role', 'status');

    document.body.appendChild(launcher);
    document.body.appendChild(panel);
    document.body.appendChild(toastEl);

    state.panel = panel;
    state.body = panel.querySelector('.auto-consult-body');
    state.toast = toastEl;

    renderStart();

    launcher.addEventListener('click', () => {
      panel.classList.toggle('is-open');
      if (panel.classList.contains('is-open')) renderStart();
    });
    panel.querySelector('.auto-consult-close').addEventListener('click', () => panel.classList.remove('is-open'));

    document.addEventListener('click', (event) => {
      const opener = event.target.closest('[data-auto-consult-open]');
      if (!opener) return;
      event.preventDefault();
      panel.classList.add('is-open');
      const key = opener.getAttribute('data-auto-consult-open');
      if (key === 'provider') renderProviderSelect();
      else renderFlow(key);
    });


    panel.addEventListener('click', async (event) => {
      const next = event.target.closest('[data-consult-next]');
      if (next) {
        event.preventDefault();
        const key = next.getAttribute('data-consult-next');
        if (key === 'start') renderStart();
        else renderFlow(key);
        return;
      }
      const provider = event.target.closest('[data-consult-provider]');
      if (provider) {
        event.preventDefault();
        renderProvider(provider.getAttribute('data-consult-provider'));
        return;
      }
      const copy = event.target.closest('[data-consult-copy]');
      if (copy) {
        event.preventDefault();
        const code = copy.getAttribute('data-consult-copy');
        await copyText(code);
        toast(`가입코드 ${code} 복사 완료`);
        return;
      }
      const open = event.target.closest('[data-consult-open]');
      if (open) {
        const code = open.getAttribute('data-consult-open');
        if (code) {
          await copyText(code);
          toast(`가입코드 ${code} 복사 후 이동합니다`);
        }
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
