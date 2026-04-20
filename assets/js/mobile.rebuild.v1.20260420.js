(function(){
  const MOBILE_MAX = 820;
  const isMobile = () => window.innerWidth <= MOBILE_MAX;

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  function q(sel, root=document){ return root.querySelector(sel); }
  function qa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  function setHeaderTelegram(){
    qa('.header-actions a').forEach((a)=>{
      if(!a) return;
      a.textContent = 'Telegram';
      a.setAttribute('aria-label','Telegram');
    });
  }

  function applySwipeRows(){
    if(!isMobile()) return;
    const selectors = [
      'body[data-community-page="home"] .hub-link-strip',
      'body[data-community-page="home"] .quick-resource-grid',
      'body[data-community-page="home"] .article-grid',
      'body[data-community-page="home"] .home-provider-rotator-grid',
      'body[data-community-page="blog"] .article-grid',
      'body[data-community-page="tools"] .hub-mini-grid',
      'body[data-community-page="tools"] .tool-status-grid',
      'body[data-community-page="guaranteed"] .hub-link-strip',
      'body[data-community-page="guaranteed"] .quick-resource-grid'
    ];
    selectors.forEach((sel)=>{
      qa(sel).forEach((el)=>{
        if(el.dataset.mobileSwipeDone === '1') return;
        el.classList.add('mobile-swipe-row');
        Array.from(el.children).forEach((child)=> child.classList.add('mobile-swipe-card'));
        el.dataset.mobileSwipeDone = '1';
      });
    });
  }

  function buildQuickbar(){
    if(!isMobile()) return;
    if(q('.mobile-quickbar')) return;
    const nav = document.createElement('nav');
    nav.className = 'mobile-quickbar';
    nav.setAttribute('aria-label','빠른 이동');
    const pathname = window.location.pathname;
    const items = [
      {href:'/', label:'메인', icon:'⌂', active: pathname === '/'},
      {href:'/blog/', label:'블로그', icon:'≣', active: pathname.startsWith('/blog/')},
      {href:'/tools/', label:'도구', icon:'⌘', active: pathname.startsWith('/tools/')},
      {href:'/guaranteed/', label:'보증', icon:'★', active: pathname.startsWith('/guaranteed/')},
      {href:'https://t.me/TRK7878', label:'텔레그램', icon:'✈', external:true, active:false}
    ];
    nav.innerHTML = items.map(item => `<a href="${item.href}"${item.external?' target="_blank" rel="noopener noreferrer"':''} class="${item.active?'is-active':''}"><strong>${item.icon}</strong><span>${item.label}</span></a>`).join('');
    document.body.appendChild(nav);
  }

  function setupHomeTabs(){
    if(!isMobile()) return;
    if(document.body.dataset.communityPage !== 'home') return;
    if(q('.mobile-section-switch')) return;
    const anchor = q('.home-sports-hero .container');
    const sections = [
      {key:'tools', label:'도구', el:q('.home-tool-shortcuts')},
      {key:'providers', label:'보증업체', el:q('.home-provider-rotator-section')},
      {key:'blog', label:'블로그', el:q('.home-blog-section')}
    ].filter(item => item.el);
    if(!anchor || sections.length < 2) return;

    const wrap = document.createElement('div');
    wrap.className = 'mobile-section-switch';
    wrap.setAttribute('role','tablist');
    sections.forEach((item, index)=>{
      item.el.classList.add('mobile-section-panel');
      if(index !== 0) item.el.hidden = true;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = item.label;
      btn.className = index === 0 ? 'is-active' : '';
      btn.setAttribute('role','tab');
      btn.addEventListener('click', ()=>{
        qa('.mobile-section-switch button').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        sections.forEach((entry)=>{ entry.el.hidden = entry !== item; });
        item.el.scrollIntoView({behavior:'smooth', block:'start'});
      });
      wrap.appendChild(btn);
    });
    anchor.appendChild(wrap);
  }

  function makeCollapsibleSection(section, options={}){
    if(!isMobile() || !section || section.dataset.mobileFoldDone === '1') return;
    const head = q('.section-head', section);
    if(!head) return;
    const title = q('h2,h3', head)?.textContent?.trim() || options.title || '섹션';
    const count = section.querySelectorAll(options.countSelector || '.article-card,.tool-panel,.legacy-tool-link,.quick-resource-card,.guaranteed-card').length;
    const details = document.createElement('details');
    details.className = 'mobile-fold';
    if(options.open) details.open = true;
    const summary = document.createElement('summary');
    summary.innerHTML = `<span>${title}</span><small>${count ? `${count}개` : '열기'}</small>`;
    const body = document.createElement('div');
    body.className = 'mobile-fold__body';

    const children = Array.from(section.children).filter((child)=> child !== head);
    children.forEach((child)=> body.appendChild(child));
    details.append(summary, body);
    section.innerHTML = '';
    section.appendChild(details);
    section.dataset.mobileFoldDone = '1';
  }

  function setupBlogMobile(){
    if(document.body.dataset.communityPage !== 'blog' || !isMobile()) return;
    const ids = ['blog-risk','blog-major','blog-search','blog-evidence','blog-practice'];
    ids.forEach((id)=> makeCollapsibleSection(document.getElementById(id), {open:false, countSelector:'.article-card'}));
    const featured = document.getElementById('blog-featured');
    if(featured) featured.dataset.mobileFoldDone = '1';
  }

  function setupToolsMobile(){
    if(document.body.dataset.communityPage !== 'tools' || !isMobile()) return;
    ['tools-records','tools-ops','tools-legacy'].forEach((id)=> makeCollapsibleSection(document.getElementById(id), {open:false}));
  }

  function setupGuaranteedMobile(){
    if(document.body.dataset.communityPage !== 'guaranteed' || !isMobile()) return;
    makeCollapsibleSection(q('.guaranteed-precheck-panel'), {open:false, countSelector:'.hub-link-card'});
    makeCollapsibleSection(q('.guaranteed-resource-section'), {open:false, countSelector:'.quick-resource-card'});
  }

  function hideInlineBlogFigures(){
    if(!isMobile()) return;
    qa('.post-inline-figure').forEach((fig)=> fig.setAttribute('hidden','hidden'));
  }

  function init(){
    setHeaderTelegram();
    applySwipeRows();
    buildQuickbar();
    setupHomeTabs();
    setupBlogMobile();
    setupToolsMobile();
    setupGuaranteedMobile();
    hideInlineBlogFigures();
  }

  ready(init);
  let resizeTimer = null;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(init, 140);
  });
})();
