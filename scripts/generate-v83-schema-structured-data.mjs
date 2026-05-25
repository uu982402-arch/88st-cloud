import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SITE = 'https://88st.cloud';
const VERSION = 'V83_SCHEMA_STRUCTURED_DATA_ACTIVE';
const TODAY = new Date().toISOString().slice(0, 10);
const ORG_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;


function ensurePackageScripts() {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  const add = 'node scripts/generate-v83-schema-structured-data.mjs';
  if (!String(pkg.scripts.build || '').includes(add)) {
    pkg.scripts.build = String(pkg.scripts.build || '').trim();
    pkg.scripts.build = pkg.scripts.build ? `${pkg.scripts.build} && ${add}` : add;
  }
  pkg.scripts.verify = 'node scripts/verify-v83-schema-structured-data.mjs';
  pkg.scripts['quality:v83'] = add;
  pkg.scripts['verify:v83'] = 'node scripts/verify-v83-schema-structured-data.mjs';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

const CORE_KEYWORDS = [
  'RUST', '러스트', '88st.cloud', '토토사이트추천', '입플사이트추천', '스포츠입플',
  '카지노입플', '미니게임입플사이트', '보증업체', '롤링 계산', '배당 마진', 'EV 계산'
];

const TOOL_ITEMS = [
  ['주소 확인', '/tools/'],
  ['가입코드 확인', '/tools/'],
  ['보너스 실수령', '/tools/'],
  ['롤링 조건', '/tools/'],
  ['배당 마진', '/tool-margin/'],
  ['기대값 계산', '/tool-ev/'],
  ['스포츠 분석', '/sports-check/'],
  ['이벤트 조건', '/tools/']
];

const VENDOR_ITEMS = [
  ['SK 홀딩스', '/guaranteed/sk-holdings/'],
  ['여왕벌', '/guaranteed/queenbee/'],
  ['ANY BET', '/guaranteed/anybet/'],
  ['UDT BET', '/guaranteed/udt-bet/'],
  ['땅콩 BET', '/guaranteed/ddangkong-bet/']
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) out.push(full);
  }
  return out;
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, text) {
  fs.writeFileSync(file, text);
}

function stripTags(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function matchOne(html, re) {
  const m = html.match(re);
  return m ? stripTags(m[1]) : '';
}

function getTitle(html) {
  const og = matchOne(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i);
  const title = matchOne(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  return og || title || 'RUST';
}

function getDescription(html) {
  return matchOne(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    matchOne(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    'RUST는 보증업체, 블로그 가이드, 실사용 분석 도구, 공식 상담을 연결하는 88st.cloud 정보 플랫폼입니다.';
}

function relPath(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function urlForRel(rel) {
  if (rel === 'index.html') return `${SITE}/`;
  if (rel.endsWith('/index.html')) return `${SITE}/${rel.replace(/index\.html$/, '')}`;
  return `${SITE}/${rel}`;
}

function segmentName(seg) {
  const map = {
    'blog': '블로그',
    'tools': '도구',
    'guaranteed': '보증업체',
    'consult': '상담',
    'sports-check': '스포츠 체크',
    'search-guides': '검색 가이드',
    'ops': '운영센터',
    'admin': '관리자'
  };
  return map[seg] || decodeURIComponent(seg).replace(/[-_]/g, ' ');
}

function breadcrumbs(url, rel, title) {
  const pathname = new URL(url).pathname;
  const parts = pathname.split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: '홈', item: `${SITE}/` }];
  let acc = '';
  parts.forEach((part, idx) => {
    const isLast = idx === parts.length - 1;
    acc += `/${part}`;
    const name = isLast && !part.includes('.') ? segmentName(part) : (isLast ? title : segmentName(part));
    items.push({ '@type': 'ListItem', position: items.length + 1, name, item: `${SITE}${isLast && part.includes('.') ? acc : acc + '/'}` });
  });
  return { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: items };
}

function itemList(name, url, entries) {
  return {
    '@type': 'ItemList',
    '@id': `${url}#itemlist`,
    name,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: entries.map((entry, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: entry[0],
      url: `${SITE}${entry[1]}`
    }))
  };
}

function collectLinks(html, basePrefix, limit = 20) {
  const out = [];
  const seen = new Set();
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    if (!href.startsWith(basePrefix)) continue;
    if (href === basePrefix || href.endsWith('/index.html')) continue;
    if (seen.has(href)) continue;
    const name = stripTags(m[2]) || segmentName(path.basename(href));
    seen.add(href);
    out.push([name.slice(0, 110), href]);
    if (out.length >= limit) break;
  }
  return out;
}

function pageType(rel) {
  if (rel === 'index.html') return 'home';
  if (rel === 'blog/index.html') return 'blogIndex';
  if (rel.startsWith('blog/') && rel.endsWith('.html')) return 'blogPost';
  if (rel === 'tools/index.html') return 'toolsIndex';
  if (rel.startsWith('tool-') || rel.startsWith('tools/')) return 'toolPage';
  if (rel === 'guaranteed/index.html') return 'guaranteedIndex';
  if (rel.startsWith('guaranteed/')) return 'guaranteedDetail';
  if (rel === 'consult/index.html') return 'consult';
  if (rel === 'sports-check/index.html') return 'sportsIndex';
  if (rel.startsWith('sports-check/')) return 'sportsArticle';
  if (rel === 'search-guides/index.html') return 'searchIndex';
  if (rel.startsWith('search-guides/')) return 'searchArticle';
  if (rel.startsWith('ops/') || rel.startsWith('admin/')) return 'admin';
  return 'generic';
}

function baseGraph(html, rel, url, title, description) {
  return [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'RUST by 88ST',
      alternateName: ['RUST', '러스트', '88ST.Cloud'],
      url: `${SITE}/`,
      logo: `${SITE}/assets/img/rust/rust-crest-192.png`,
      image: `${SITE}/assets/img/rust/rust-og.jpg`,
      sameAs: [`${SITE}/`]
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${SITE}/`,
      name: 'RUST',
      alternateName: '88ST.Cloud',
      inLanguage: 'ko-KR',
      publisher: { '@id': ORG_ID },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE}/blog/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    },
    breadcrumbs(url, rel, title)
  ];
}

function schemaFor(file) {
  const rel = relPath(file);
  const html = read(file);
  const url = urlForRel(rel);
  const title = getTitle(html);
  const description = getDescription(html);
  const type = pageType(rel);
  const graph = baseGraph(html, rel, url, title, description);

  const webPage = {
    '@type': type === 'consult' ? 'ContactPage' : (type.endsWith('Index') ? 'CollectionPage' : 'WebPage'),
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: 'ko-KR',
    dateModified: TODAY,
    publisher: { '@id': ORG_ID }
  };

  if (type === 'home') {
    webPage.about = CORE_KEYWORDS.map(name => ({ '@type': 'Thing', name }));
    graph.push(webPage);
    graph.push(itemList('RUST 주요 허브', url, [
      ['블로그', '/blog/'], ['도구', '/tools/'], ['보증업체', '/guaranteed/'], ['스포츠 체크', '/sports-check/'], ['검색 가이드', '/search-guides/'], ['상담', '/consult/']
    ]));
  } else if (type === 'blogIndex') {
    graph.push(webPage);
    const links = collectLinks(html, '/blog/', 50);
    graph.push(itemList('RUST 블로그 인기 콘텐츠', url, links.length ? links : [['블로그', '/blog/']]));
  } else if (type === 'blogPost') {
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      mainEntityOfPage: { '@id': `${url}#webpage` },
      headline: title.slice(0, 110),
      description,
      image: `${SITE}/assets/img/rust/rust-og.jpg`,
      author: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      inLanguage: 'ko-KR',
      datePublished: TODAY,
      dateModified: TODAY,
      keywords: CORE_KEYWORDS.join(', ')
    });
    graph.push(webPage);
  } else if (type === 'toolsIndex') {
    graph.push(webPage);
    graph.push(itemList('RUST 실사용 분석 도구', url, TOOL_ITEMS));
    TOOL_ITEMS.slice(0, 8).forEach(([name, href]) => {
      graph.push({
        '@type': 'SoftwareApplication',
        '@id': `${SITE}${href}#software`,
        name: `RUST ${name}`,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        url: `${SITE}${href}`,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' }
      });
    });
  } else if (type === 'toolPage') {
    graph.push(webPage);
    graph.push({
      '@type': 'SoftwareApplication',
      '@id': `${url}#software`,
      name: title,
      description,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      url,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' }
    });
  } else if (type === 'guaranteedIndex') {
    graph.push(webPage);
    graph.push(itemList('RUST 보증업체 큐레이션', url, VENDOR_ITEMS));
  } else if (type === 'guaranteedDetail') {
    graph.push(webPage);
    graph.push({
      '@type': 'Review',
      '@id': `${url}#review`,
      itemReviewed: { '@type': 'Organization', name: title.replace(/\s*\|.*$/, '') },
      author: { '@id': ORG_ID },
      reviewBody: description,
      publisher: { '@id': ORG_ID }
    });
  } else if (type === 'consult') {
    graph.push(webPage);
    graph.push({
      '@type': 'ContactPoint',
      '@id': `${url}#contact`,
      contactType: 'customer support',
      availableLanguage: ['ko-KR'],
      url: 'https://t.me/TRS999_bot'
    });
  } else if (type === 'sportsIndex') {
    graph.push(webPage);
    const links = collectLinks(html, '/sports-check/', 20);
    graph.push(itemList('RUST 스포츠 체크 인기 글', url, links.length ? links : [['스포츠 체크', '/sports-check/']]));
  } else if (type === 'searchIndex') {
    graph.push(webPage);
    const links = collectLinks(html, '/search-guides/', 20);
    graph.push(itemList('RUST 검색 가이드 인기 글', url, links.length ? links : [['검색 가이드', '/search-guides/']]));
  } else if (type === 'sportsArticle' || type === 'searchArticle') {
    graph.push({
      '@type': 'Article',
      '@id': `${url}#article`,
      mainEntityOfPage: { '@id': `${url}#webpage` },
      headline: title.slice(0, 110),
      description,
      image: `${SITE}/assets/img/rust/rust-og.jpg`,
      author: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      inLanguage: 'ko-KR',
      datePublished: TODAY,
      dateModified: TODAY,
      keywords: CORE_KEYWORDS.join(', ')
    });
    graph.push(webPage);
  } else if (type === 'admin') {
    graph.push(webPage);
  } else {
    graph.push(webPage);
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function injectSchema(file) {
  let html = read(file);
  const rel = relPath(file);
  const schema = schemaFor(file);
  const json = JSON.stringify(schema).replace(/<\//g, '<\\/');
  const marker = `<meta name="v83-schema-structured-data" content="${VERSION}">`;
  const script = `<script type="application/ld+json" data-rust-schema="v83">${json}</script>`;

  html = html
    .replace(/<meta\s+name=["']v83-schema-structured-data["'][^>]*>\s*/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["']\s+data-rust-schema=["']v83["'][\s\S]*?<\/script>\s*/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["']\s+data-v36-schema=["']primary["'][\s\S]*?<\/script>\s*/gi, '');

  if (!/<\/head>/i.test(html)) {
    throw new Error(`Missing </head>: ${rel}`);
  }

  html = html.replace(/<\/head>/i, `${marker}${script}</head>`);
  write(file, html);
  return { rel, type: pageType(rel), url: urlForRel(rel) };
}

const files = walk(ROOT);
const changed = [];
for (const file of files) {
  changed.push(injectSchema(file));
}

const manifest = {
  version: VERSION,
  generatedAt: new Date().toISOString(),
  html: files.length,
  changed: changed.length,
  types: changed.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {})
};
fs.writeFileSync(path.join(ROOT, 'V83_SCHEMA_STRUCTURED_DATA_MANIFEST.json'), JSON.stringify(manifest, null, 2));
ensurePackageScripts();
console.log(`[V83] schema structured data generated. html=${manifest.html} changed=${manifest.changed}`);
