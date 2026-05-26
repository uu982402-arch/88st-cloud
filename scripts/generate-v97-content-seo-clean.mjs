import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const VERSION = 'V97_CONTENT_SEO_CLEAN_ACTIVE';
const stamp = 'static-v97-content-seo-clean-20260526';
const buildId = 'V97-CONTENT-SEO-CLEAN-20260526';
const today = '2026-05-26';

const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, data) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), data); };
const exists = p => fs.existsSync(path.join(root, p));
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const textEsc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function walk(dir = '.') {
  const out = [];
  for (const ent of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, ent.name).replace(/^\.\//, '');
    if (ent.isDirectory()) {
      if (['node_modules', '.git', '.wrangler'].includes(ent.name)) continue;
      out.push(...walk(rel));
    } else if (ent.isFile()) out.push(rel);
  }
  return out;
}

function urlForFile(file) {
  let p = file.replace(/\\/g, '/').replace(/^\.\//, '');
  if (p === 'index.html') return 'https://88st.cloud/';
  if (p.endsWith('/index.html')) p = p.slice(0, -'index.html'.length);
  return 'https://88st.cloud/' + p;
}

function pathUrl(file) {
  let p = file.replace(/\\/g, '/').replace(/^\.\//, '');
  if (p === 'index.html') return '/';
  if (p.endsWith('/index.html')) p = p.slice(0, -'index.html'.length);
  return '/' + p;
}

function setMeta(html, name, content) {
  const escaped = esc(content);
  const re = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i');
  const tag = `<meta name="${name}" content="${escaped}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<head[^>]*>/i, m => `${m}\n  ${tag}`);
}

function setOg(html, property, content) {
  const escaped = esc(content);
  const re = new RegExp(`<meta\\s+property=["']${property}["'][^>]*>`, 'i');
  const tag = `<meta property="${property}" content="${escaped}">`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<head[^>]*>/i, m => `${m}\n  ${tag}`);
}

function setTitle(html, title) {
  const clean = textEsc(title);
  if (/<title>[\s\S]*?<\/title>/i.test(html)) return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${clean}</title>`);
  return html.replace(/<head[^>]*>/i, m => `${m}\n  <title>${clean}</title>`);
}

function ensureCanonical(html, file) {
  const href = urlForFile(file);
  const tag = `<link rel="canonical" href="${href}">`;
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) return html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, tag);
  return html.replace(/<head[^>]*>/i, m => `${m}\n  ${tag}`);
}

function ensureViewport(html) {
  const vp = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">';
  if (/<meta\s+name=["']viewport["'][^>]*>/i.test(html)) return html.replace(/<meta\s+name=["']viewport["'][^>]*>/i, vp);
  return html.replace(/<head[^>]*>/i, m => `${m}\n  ${vp}`);
}

function ensureHeadMarker(html) {
  const marker = `<meta name="v97-content-seo-clean" content="${VERSION}">`;
  if (html.includes('name="v97-content-seo-clean"')) return html.replace(/<meta\s+name=["']v97-content-seo-clean["'][^>]*>/i, marker);
  return html.replace(/<head[^>]*>/i, m => `${m}\n  ${marker}`);
}

function injectAsset(html) {
  const cssTag = `<link rel="stylesheet" href="/assets/css/v97-content-seo-clean.css?v=${stamp}" data-v97-content-seo-clean="true">`;
  const jsTag = `<script defer src="/assets/js/v97-content-seo-clean.js?v=${stamp}" data-v97-content-seo-clean="true"></script>`;
  if (!html.includes('/assets/css/v97-content-seo-clean.css')) {
    html = html.replace(/<\/head>/i, `  ${cssTag}\n</head>`);
  } else {
    html = html.replace(/<link\s+rel=["']stylesheet["'][^>]*v97-content-seo-clean\.css[^>]*>/i, cssTag);
  }
  if (!html.includes('/assets/js/v97-content-seo-clean.js')) {
    html = html.replace(/<\/body>/i, `  ${jsTag}\n</body>`);
  } else {
    html = html.replace(/<script\s+defer[^>]*v97-content-seo-clean\.js[^>]*><\/script>/i, jsTag);
  }
  return html;
}

function setRobots(html, file) {
  const p = pathUrl(file);
  const noindex = p.startsWith('/ops/') || p.startsWith('/admin/') || p.startsWith('/analysis/') || p === '/ops' || p === '/admin' || p === '/analysis';
  return setMeta(html, 'robots', noindex ? 'noindex,nofollow,noarchive' : 'index,follow,max-image-preview:large');
}

const coreMeta = {
  'index.html': {
    title: 'RUST | 보증업체·도구·가이드 통합 허브',
    desc: 'RUST는 보증업체 카드, 가입코드 확인, 스포츠 체크, 도구, 검색 가이드를 한 화면에서 연결하는 88ST.Cloud 실사용 허브입니다.',
    keywords: 'RUST, 88ST.Cloud, 보증업체, 가입코드, 스포츠 체크, 검색 가이드, 배당 마진, EV 계산, 롤링 계산'
  },
  'blog/index.html': {
    title: 'RUST 블로그 | 보증업체·도구·스포츠 체크 가이드',
    desc: 'RUST 블로그는 보증업체 조건, 가입코드, 롤링, 스포츠 체크, 카지노·슬롯 이벤트를 짧게 비교할 수 있도록 정리한 정보 허브입니다.',
    keywords: 'RUST 블로그, 보증업체 가이드, 가입코드 확인, 롤링 조건, 스포츠 체크, 카지노 이벤트, 슬롯 이벤트'
  },
  'tools/index.html': {
    title: 'RUST 도구 | 배당·EV·롤링·보너스 계산',
    desc: '배당 마진, 기대값, 롤링 조건, 보너스 실수령, 스포츠 체크를 빠르게 계산하고 조건을 비교하는 RUST 도구 대시보드입니다.',
    keywords: '배당 마진 계산, EV 계산, 롤링 계산, 보너스 실수령, 스포츠 분석 도구, RUST 도구'
  },
  'guaranteed/index.html': {
    title: 'RUST 보증업체 | 가입코드·상세보기·공식주소',
    desc: 'SK 홀딩스, 자쿰, UDT BET, 여왕벌, 땅콩 BET, ANY BET의 가입코드, 상세보기, 공식주소 이동을 한 곳에서 정리합니다.',
    keywords: 'RUST 보증업체, SK 홀딩스, 자쿰, UDT BET, 여왕벌, 땅콩 BET, ANY BET, 가입코드, 공식주소'
  },
  'sports-check/index.html': {
    title: '스포츠 체크 | 경기 전 배당·라인·총점 확인',
    desc: '축구, 야구, 농구, 배구의 라인업, 총점, 핸디캡, 라인 이동을 경기 전 체크리스트 형태로 정리한 RUST 스포츠 허브입니다.',
    keywords: '스포츠 체크, 배당 체크, 축구 오버언더, KBO 선발투수, 농구 핸디캡, 배구 세트 핸디캡'
  },
  'search-guides/index.html': {
    title: '검색 가이드 | 공식주소·가입코드·조건 확인',
    desc: '공식주소 사칭, 가입코드 입력, 환전 지연, 롤링 조건, 이벤트 조건을 빠르게 확인하는 RUST 검색 가이드 허브입니다.',
    keywords: '검색 가이드, 공식주소 확인, 가입코드 확인, 환전 지연, 롤링 조건, 이벤트 조건'
  },
  'consult/index.html': {
    title: 'RUST 상담센터 | 조건 확인 및 공식 연결',
    desc: '가입코드, 이벤트 조건, 공식 주소, 보증업체 상세 내용을 확인해야 할 때 RUST 상담센터로 연결합니다.',
    keywords: 'RUST 상담센터, 가입코드 문의, 보증업체 상담, 공식주소 문의'
  }
};

function categorySummary(title, category = '') {
  const t = String(title || '').trim();
  const cat = String(category || '').trim();
  if (!t) return '핵심 조건과 확인 순서를 짧게 정리했습니다.';
  if (/주소|도메인|공식/.test(t)) return `${t} 전 확인할 주소 매칭, 코드 일치, 리뉴얼 흔적을 압축했습니다.`;
  if (/가입코드|코드/.test(t)) return `${t}에 필요한 코드 입력 위치, 대소문자, 상담 확인 흐름을 정리했습니다.`;
  if (/롤링|실수령|보너스|첫충|매충|페이백|이벤트|쿠폰|콤프/.test(t)) return `${t}의 적용 조건, 제외 항목, 실수령 계산 포인트를 정리했습니다.`;
  if (/스포츠|축구|KBO|야구|농구|배구|핸디캡|오버언더|배당|EV|Kelly|프로토/.test(t)) return `${t}를 배당, 라인 이동, 총점·핸디캡 기준으로 빠르게 확인합니다.`;
  if (/슬롯|RTP|프라그마틱|노리밋|카지노|바카라/.test(t)) return `${t}의 게임 조건, 변동성, 이벤트 적용 범위를 실사용 기준으로 정리했습니다.`;
  if (/보증업체|먹튀|검증|신뢰/.test(t) || cat.includes('보증')) return `${t}에서 확인할 운영 신호, 공식 연결, 조건표 체크 항목을 압축했습니다.`;
  return `${t}의 핵심 확인 순서와 실사용 체크 포인트를 짧게 정리했습니다.`;
}

function cleanHubText(html, file) {
  if (file === 'index.html') {
    html = html.replace('블로그 전체 글 503개가 15개 카드 슬롯 안에서 자동 순환됩니다.', '주요 글 15개를 자동 순환해 빠르게 확인합니다.');
    html = html.replace('각 허브의 상세 게시글이 5개 슬롯 안에서 자동으로 순환됩니다.', '스포츠 체크와 검색 가이드를 5개 슬롯으로 압축해 보여줍니다.');
    html = html.replace(/<span data-v811-summary>[\s\S]*?<\/span>/g, m => {
      const title = (m.match(/data-v811-summary>[\s\S]*?<\/span>/) || [''])[0];
      return m;
    });
    html = html.replace(/(<strong data-v811-title>([\s\S]*?)<\/strong>)\s*<span data-v811-summary>[\s\S]*?<\/span>/g, (_, titleTag, rawTitle) => {
      const title = rawTitle.replace(/<[^>]*>/g, '').trim();
      return `${titleTag}<span data-v811-summary>${textEsc(categorySummary(title))}</span>`;
    });
  }

  if (file === 'blog/index.html') {
    html = html.replace('인기순 총 503개 / 페이지당 50개', '핵심 글 50개 우선 노출');
    html = html.replace('총 503개 / 페이지당 50개', '핵심 글 50개 우선 노출');
    html = html.replace(/(<a class="v72-blog-card"[^>]*data-title="([^"]*)"[^>]*data-category="([^"]*)"[^>]*>[\s\S]*?<strong>[\s\S]*?<\/strong>\s*)<p>[\s\S]*?<\/p>/g, (all, prefix, title, category) => {
      return `${prefix}<p>${textEsc(categorySummary(title, category))}</p>`;
    });
  }

  if (file === 'sports-check/index.html') {
    html = html.replace('SPORTS CHECK INDEX', 'SPORTS CHECK');
    html = html.replace('스포츠 체크 전체 자료', '스포츠 체크 자료');
    html = html.replace('큰 타이틀 배너와 반복 안내 섹션을 제거하고, 실제로 클릭할 글과 도구만 먼저 보이도록 재구성했습니다. PC에서는 넓은 그리드로, 모바일에서는 가로 슬라이더와 콤팩트 카드로 확인할 수 있습니다.', '경기 전 배당, 라인업, 총점, 핸디캡 판단에 필요한 자료만 압축했습니다.');
  }

  if (file === 'search-guides/index.html') {
    html = html.replace('SEARCH GUIDE INDEX', 'SEARCH GUIDE');
    html = html.replace('검색 가이드 전체 자료', '검색 가이드 자료');
    html = html.replace('큰 타이틀 배너와 반복 안내 섹션을 제거하고, 실제로 클릭할 글과 도구만 먼저 보이도록 재구성했습니다. PC에서는 넓은 그리드로, 모바일에서는 가로 슬라이더와 콤팩트 카드로 확인할 수 있습니다.', '공식주소, 가입코드, 환전, 롤링 조건을 빠르게 확인할 수 있게 압축했습니다.');
    html = html.replace(/<strong>([^<]+)<\/strong><p>\1 기준을 RUST 방식으로 정리한 실사용 가이드입니다\.<\/p>/g, (_, title) => `<strong>${title}</strong><p>${textEsc(categorySummary(title, '검색 가이드'))}</p>`);
    html = html.replace(/<strong>([^<]+)<\/strong><p>\1 기준 기준을 RUST 방식으로 정리한 실사용 가이드입니다\.<\/p>/g, (_, title) => `<strong>${title}</strong><p>${textEsc(categorySummary(title, '검색 가이드'))}</p>`);
  }

  // Common repetitive Korean grammar cleanup for hub card snippets only.
  html = html.replace(/를 먹튀검증 관점에서 수식, 공개 지표, 약관 독해, 공개/g, '의 핵심 확인 포인트');
  html = html.replace(/을 먹튀검증 관점에서 수식, 공개 지표, 약관 독해, 공개/g, '의 핵심 확인 포인트');
  html = html.replace(/를 스포츠토토 관점에서 수식, 공개 지표, 약관 독해, 공개/g, '를 배당·라인 기준으로 정리');
  html = html.replace(/를 온라인슬롯 관점에서 수식, 공개 지표, 약관 독해, 공개/g, '를 RTP·변동성 기준으로 정리');
  html = html.replace(/를 온라인카지노 관점에서 수식, 공개 지표, 약관 독해, 공개/g, '를 조건표와 실수령 기준으로 정리');
  html = html.replace(/(?:를|을) 먹튀검증 관점에서 수식, 공개 지표, 약관 독해[^"<]*/g, '의 핵심 확인 포인트');
  html = html.replace(/(?:를|을) 스포츠토토 관점에서 수식, 공개 지표, 약관 독해[^"<]*/g, '를 배당·라인 기준으로 정리');
  html = html.replace(/(?:를|을) 온라인슬롯 관점에서 수식, 공개 지표, 약관 독해[^"<]*/g, '를 RTP·변동성 기준으로 정리');
  html = html.replace(/(?:를|을) 온라인카지노 관점에서 수식, 공개 지표, 약관 독해[^"<]*/g, '를 조건표와 실수령 기준으로 정리');
  html = html.replace(/기술 신호 중심으로/g, '');
  html = html.replace(/기준 기준을 RUST 방식으로 정리한 실사용 가이드입니다\./g, '기준을 실사용 흐름으로 정리했습니다.');
  html = html.replace(/를 먹튀검증 관점에서 수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로 정리한 88ST\.Cloud 전문 정보 문서입니다\./g, '의 핵심 조건과 확인 순서를 정리했습니다.');
  html = html.replace(/을 먹튀검증 관점에서 수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로 정리한 88ST\.Cloud 전문 정보 문서입니다\./g, '의 핵심 조건과 확인 순서를 정리했습니다.');
  html = html.replace(/를 스포츠토토 관점에서 수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로 정리한 88ST\.Cloud 전문 정보 문서입니다\./g, '를 배당·라인 기준으로 정리했습니다.');
  html = html.replace(/를 온라인슬롯 관점에서 수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로 정리한 88ST\.Cloud 전문 정보 문서입니다\./g, '를 RTP·변동성 기준으로 정리했습니다.');
  html = html.replace(/를 온라인카지노 관점에서 수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로 정리한 88ST\.Cloud 전문 정보 문서입니다\./g, '를 조건표와 실수령 기준으로 정리했습니다.');
  return html;
}

function globalSeoTextCleanup(html) {
  const oldBlogSummary = 'RUST 블로그는 토토사이트추천, 스포츠입플, 카지노입플, 미니게임입플사이트, 롤링 조건, EV 계산법, 먹튀 구분법을 정리한 88st.cloud 정보 허브입니다.';
  html = html.split(oldBlogSummary).join('핵심 조건과 확인 순서를 짧게 정리했습니다.');
  html = html.replace(/를 먹튀검증 관점에서 수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로(?: 정리한 88ST\.Cloud 전문 정보 문서입니다\.)?/g, '의 핵심 확인 포인트를 정리했습니다.');
  html = html.replace(/을 먹튀검증 관점에서 수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로(?: 정리한 88ST\.Cloud 전문 정보 문서입니다\.)?/g, '의 핵심 확인 포인트를 정리했습니다.');
  html = html.replace(/를 스포츠토토 관점에서 수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로(?: 정리한 88ST\.Cloud 전문 정보 문서입니다\.)?/g, '를 배당·라인 기준으로 정리했습니다.');
  html = html.replace(/를 온라인슬롯 관점에서 수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로(?: 정리한 88ST\.Cloud 전문 정보 문서입니다\.)?/g, '를 RTP·변동성 기준으로 정리했습니다.');
  html = html.replace(/를 온라인카지노 관점에서 수식, 공개 지표, 약관 독해, 공개 기술 신호 중심으로(?: 정리한 88ST\.Cloud 전문 정보 문서입니다\.)?/g, '를 조건표와 실수령 기준으로 정리했습니다.');
  html = html.replace(/를 먹튀검증 관점에서 수식, 공개 지표, 약관 독해, 공개/g, '의 핵심 확인 포인트');
  html = html.replace(/을 먹튀검증 관점에서 수식, 공개 지표, 약관 독해, 공개/g, '의 핵심 확인 포인트');
  html = html.replace(/를 스포츠토토 관점에서 수식, 공개 지표, 약관 독해, 공개/g, '를 배당·라인 기준으로 정리');
  html = html.replace(/를 온라인슬롯 관점에서 수식, 공개 지표, 약관 독해, 공개/g, '를 RTP·변동성 기준으로 정리');
  html = html.replace(/를 온라인카지노 관점에서 수식, 공개 지표, 약관 독해, 공개/g, '를 조건표와 실수령 기준으로 정리');
  html = html.replace(/(?:를|을) 먹튀검증 관점에서 수식, 공개 지표, 약관 독해[^"<]*/g, '의 핵심 확인 포인트');
  html = html.replace(/(?:를|을) 스포츠토토 관점에서 수식, 공개 지표, 약관 독해[^"<]*/g, '를 배당·라인 기준으로 정리');
  html = html.replace(/(?:를|을) 온라인슬롯 관점에서 수식, 공개 지표, 약관 독해[^"<]*/g, '를 RTP·변동성 기준으로 정리');
  html = html.replace(/(?:를|을) 온라인카지노 관점에서 수식, 공개 지표, 약관 독해[^"<]*/g, '를 조건표와 실수령 기준으로 정리');
  html = html.replace(/기술 신호 중심으로/g, '');
  html = html.replace(/기준 기준을 RUST 방식으로 정리한 실사용 가이드입니다\./g, '기준을 실사용 흐름으로 정리했습니다.');
  return html;
}

const coreFiles = Object.keys(coreMeta);
const indexFiles = ['index.html', 'blog/index.html', 'sports-check/index.html', 'search-guides/index.html', 'tools/index.html', 'guaranteed/index.html', 'consult/index.html', 'ops/index.html'];
const htmlFiles = walk('.').filter(f => f.endsWith('.html'));
let canonicals = 0;
let noindexCount = 0;
let assetInjected = 0;
let cleanedCards = 0;

for (const file of htmlFiles) {
  let html = read(file);
  const before = html;
  html = ensureViewport(html);
  html = ensureHeadMarker(html);
  html = ensureCanonical(html, file);
  html = setRobots(html, file);
  if (coreMeta[file]) {
    html = setTitle(html, coreMeta[file].title);
    html = setMeta(html, 'description', coreMeta[file].desc);
    html = setMeta(html, 'keywords', coreMeta[file].keywords);
    html = setOg(html, 'og:title', coreMeta[file].title);
    html = setOg(html, 'og:description', coreMeta[file].desc);
  }
  if (indexFiles.includes(file) || file.startsWith('blog/') || file.startsWith('sports-check/') || file.startsWith('search-guides/') || file.startsWith('guaranteed/')) {
    html = injectAsset(html);
    assetInjected++;
  }
  if (['index.html', 'blog/index.html', 'sports-check/index.html', 'search-guides/index.html'].includes(file)) {
    const old = html;
    html = cleanHubText(html, file);
    if (html !== old) cleanedCards++;
  }
  html = globalSeoTextCleanup(html);
  if (/<link\s+rel=["']canonical["']/i.test(html)) canonicals++;
  if (/noindex/i.test(html)) noindexCount++;
  if (html !== before) write(file, html);
}

// Robots hardening: analysis is not a current public route, but keep it blocked if it ever appears.
let robots = exists('robots.txt') ? read('robots.txt') : 'User-agent: *\nSitemap: https://88st.cloud/sitemap.xml\n';
for (const line of ['Disallow: /admin/', 'Disallow: /ops/', 'Disallow: /api/', 'Disallow: /analysis/']) {
  if (!robots.includes(line)) robots = robots.replace(/Sitemap:/, `${line}\nSitemap:`);
}
robots = robots.replace(/\n{3,}/g, '\n\n').trim() + '\n';
write('robots.txt', robots);

// Sitemap lastmod and route hygiene.
for (const file of ['sitemap.xml', 'serverless/sitemap.xml']) {
  if (!exists(file)) continue;
  let xml = read(file);
  xml = xml.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
  xml = xml.replace(/\s*<url><loc>https:\/\/88st\.cloud\/(?:admin|ops|analysis)\/?<\/loc>[\s\S]*?<\/url>/g, '');
  write(file, xml);
}
if (exists('sitemap.txt')) {
  let txt = read('sitemap.txt').split(/\r?\n/).filter(Boolean);
  txt = txt.filter(u => !/^https:\/\/88st\.cloud\/(?:admin|ops|analysis)\/?$/.test(u));
  write('sitemap.txt', txt.join('\n') + '\n');
}

const css = `/* V97 CONTENT / SEO CLEAN PATCH\n * 텍스트 과밀, 카드 반복 문구, 검색 색인 신호를 정리한다. 라우팅/기능/보증업체 전환 UX는 유지한다.\n */\n:root{--v97-rust:#ff7a1a;--v97-gold:#f6c96b;--v97-text:#f8fafc;--v97-muted:#a8b3c7;--v97-line:rgba(255,255,255,.12)}\nhtml[data-v97-content-seo-clean=active] :where(.v71-blog-card,.v72-blog-card,.v79-card){text-decoration:none}\nhtml[data-v97-content-seo-clean=active] :where(.v71-blog-card span[data-v811-summary],.v72-blog-card p,.v79-card p){display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--v97-muted);line-height:1.52;word-break:keep-all}\nhtml[data-v97-content-seo-clean=active] .v72-blog-card strong,html[data-v97-content-seo-clean=active] .v71-blog-card strong,html[data-v97-content-seo-clean=active] .v79-card strong{letter-spacing:-.025em;word-break:keep-all}\nhtml[data-v97-content-seo-clean=active] .v97-clean-badge{display:inline-flex;align-items:center;min-height:28px;padding:0 10px;border-radius:999px;border:1px solid rgba(246,201,107,.22);background:rgba(246,201,107,.08);color:#ffe4a3;font-size:12px;font-weight:900}\nhtml[data-v97-content-seo-clean=active] :where(.v72-chip,.v79-chip){white-space:nowrap}\n@media(max-width:640px){html[data-v97-content-seo-clean=active] :where(.v71-blog-card span[data-v811-summary],.v72-blog-card p,.v79-card p){-webkit-line-clamp:2;font-size:12px}html[data-v97-content-seo-clean=active] :where(.v72-blog-card,.v79-card){min-width:0}}\n`;
const js = `/* V97 CONTENT / SEO CLEAN PATCH */\n(() => {\n  'use strict';\n  const VERSION = '${buildId}';\n  const root = document.documentElement;\n  root.dataset.v97ContentSeoClean = 'active';\n  window.__RUST_V97_BUILD__ = VERSION;\n  window.__RUST_SEO_CLEAN__ = Object.freeze({ version: VERSION, scope: 'content-card-copy-canonical-robots-sitemap' });\n\n  const cleanDuplicateText = (node) => {\n    if (!node) return;\n    const title = node.querySelector('strong')?.textContent?.trim();\n    const desc = node.querySelector('p, [data-v811-summary]');\n    if (!title || !desc) return;\n    const text = desc.textContent.trim();\n    const doubled = text.startsWith(title + title) || text.includes('기준 기준') || text.includes('RUST 블로그는 토토사이트추천');\n    if (doubled) {\n      desc.dataset.v97FallbackSummary = 'true';\n      desc.textContent = title + '의 핵심 조건과 확인 순서를 짧게 정리했습니다.';\n    }\n  };\n  document.querySelectorAll('.v71-blog-card,.v72-blog-card,.v79-card').forEach(cleanDuplicateText);\n})();\n`;
const data = {
  version: buildId,
  stamp,
  generatedAt: new Date().toISOString(),
  scope: [
    'canonical normalization',
    'robots/noindex hygiene',
    'blog and hub card summary cleanup',
    'core meta title/description cleanup',
    'sitemap lastmod refresh',
    'forbidden phrase guard'
  ],
  counts: { htmlFiles: htmlFiles.length, canonicals, noindexCount, assetInjected, cleanedHubFiles: cleanedCards }
};
write('assets/css/v97-content-seo-clean.css', css);
write('assets/js/v97-content-seo-clean.js', js);
write('assets/data/v97-content-seo-clean.json', JSON.stringify(data, null, 2) + '\n');

write('build.txt', `build=2026-05-26T00:00:00.000Z\nversion=${stamp}\ncache=20260526-v97\nhtml=${htmlFiles.length}\nsitemap=${exists('sitemap.txt') ? read('sitemap.txt').split(/\r?\n/).filter(Boolean).length : 0}\nworker=safe-mode\nconsultBot=@TRS999_bot\n`);
write('assets/js/build.ver.js', `window.__BUILD_VER__ = "${stamp}";\nwindow.__BUILD_TIME__ = "2026-05-26T00:00:00.000Z";\nwindow.__CACHE_BUSTER__ = "20260526-v97";\nwindow.__WORKER_MODE__ = "safe";\nwindow.__CONSULT_BOT__ = "@TRS999_bot";\nwindow.__RUST_LIVE_QA__ = window.__RUST_LIVE_QA__ || {};\nwindow.__RUST_LIVE_QA__.expectedBuild = "${buildId}";\n`);

const pkg = JSON.parse(read('package.json'));
if (!pkg.scripts.build.includes('generate-v97-content-seo-clean.mjs')) pkg.scripts.build += ' && node scripts/generate-v97-content-seo-clean.mjs';
pkg.scripts.verify = 'node scripts/verify-v97-content-seo-clean.mjs';
pkg.scripts['quality:v97'] = 'node scripts/generate-v97-content-seo-clean.mjs';
pkg.scripts['verify:v97'] = 'node scripts/verify-v97-content-seo-clean.mjs';
write('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log(`[V97 generate ok] content/seo cleanup applied to ${htmlFiles.length} html files; assets injected into ${assetInjected} files`);
