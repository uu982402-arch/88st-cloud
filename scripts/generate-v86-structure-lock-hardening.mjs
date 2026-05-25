import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v86-structure-lock-hardening-20260525';
const MARKER = 'V86_STRUCTURE_LOCK_HARDENING_ACTIVE';
const REPORT_PATH = path.join(ROOT, 'assets/data/v86-structure-lock-report.json');

const keyPages = [
  'index.html',
  'blog/index.html',
  'tools/index.html',
  'guaranteed/index.html',
  'consult/index.html',
  'sports-check/index.html',
  'search-guides/index.html',
  'ops/index.html',
  'admin/index.html'
];

const mainForbidden = [
  'RUST MOTION HUB',
  '88ST.CLOUD PLATFORM',
  '보증업체 보기</a>',
  '자동 상담 시작</a>'
];

const blogForbidden = [
  '신규 유입 확장 콘텐츠',
  '토토·입플·보증업체·도구 연결 50개'
];

const postForbidden = [
  '페이지 하단의 내부 링크',
  '관련 글과 다음 확인 루트',
  '도구 열기</a>',
  '상담 연결</a>'
];

const legacyBlockForbidden = [
  '오늘 확인해야 할 것',
  '상담 전 먼저 확인할 것',
  '다음 단계: 자동화 상담으로 기준 정보를 확인하거나'
];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function write(file, body) {
  fs.writeFileSync(path.join(ROOT, file), body, 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

function normalizeDuplicateBodyClass(html) {
  return html.replace(/<body\b([^>]*)>/i, (match, attrs) => {
    const classes = [];
    const cleanAttrs = attrs.replace(/\sclass=["']([^"']*)["']/gi, (_m, value) => {
      classes.push(...String(value).split(/\s+/).filter(Boolean));
      return '';
    });
    if (!classes.length) return `<body${attrs}>`;
    const unique = [...new Set(classes)].join(' ');
    return `<body${cleanAttrs} class="${unique}">`;
  });
}

function removeExactStrings(html, phrases) {
  let next = html;
  for (const phrase of phrases) next = next.split(phrase).join('');
  return next;
}

function removeBlogExpansionSection(html) {
  let next = html;
  next = next.replace(/<section[^>]*>[\s\S]*?신규 유입 확장 콘텐츠[\s\S]*?<\/section>/gi, '');
  next = next.replace(/<div[^>]*>[\s\S]*?신규 유입 확장 콘텐츠[\s\S]*?<\/div>/gi, '');
  next = removeExactStrings(next, blogForbidden);
  return next;
}

function removeSeoPostTail(html) {
  let next = html;
  next = removeExactStrings(next, postForbidden);
  next = next.replace(/<section[^>]*(?:v82-related|related|cta|next-route|internal-link|link-panel)[^>]*>[\s\S]*?<\/section>/gi, '');
  next = next.replace(/<aside[^>]*(?:v82-related|related|cta|next-route|internal-link|link-panel)[^>]*>[\s\S]*?<\/aside>/gi, '');
  return next;
}

function ensureNoindex(fileRel, html) {
  if (!/^(ops|admin)\//.test(fileRel)) return html;
  let next = html;
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(next)) {
    next = next.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,nofollow,noarchive">');
  } else {
    next = next.replace(/<head[^>]*>/i, '$&\n  <meta name="robots" content="noindex,nofollow,noarchive">');
  }
  return next;
}

function ensureMarker(fileRel, html) {
  if (!keyPages.includes(fileRel) && !fileRel.startsWith('blog/')) return html;
  let next = html.replace(/<meta\s+name=["']v86-structure-lock["'][^>]*>\s*/gi, '');
  if (/<\/head>/i.test(next)) {
    next = next.replace(/<\/head>/i, `  <meta name="v86-structure-lock" content="${MARKER}" data-v86-structure-lock="true">\n</head>`);
  }
  return next;
}

function ensureRobots() {
  const file = path.join(ROOT, 'robots.txt');
  let body = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : 'User-agent: *\nAllow: /\n';
  if (!/Sitemap:\s*https:\/\/88st\.cloud\/sitemap\.xml/i.test(body)) {
    body = body.trimEnd() + '\nSitemap: https://88st.cloud/sitemap.xml\n';
  }
  fs.writeFileSync(file, body, 'utf8');
}

function loadTargetPosts() {
  const file = path.join(ROOT, 'assets/data/v85-4-blog-post-shell-targets.json');
  if (!fs.existsSync(file)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(data.targets) ? data.targets : [];
  } catch {
    return [];
  }
}

function updatePackage() {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const generate = 'node scripts/generate-v86-structure-lock-hardening.mjs';
  const verify = 'node scripts/verify-v86-structure-lock-hardening.mjs';
  const chain = String(pkg.scripts?.build || '')
    .split('&&')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item !== generate);
  chain.push(generate);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = chain.join(' && ');
  pkg.scripts.verify = verify;
  pkg.scripts['quality:v86'] = generate;
  pkg.scripts['verify:v86'] = verify;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

const targetPosts = loadTargetPosts();
const touched = [];
const repaired = [];

for (const file of walk(ROOT)) {
  const fileRel = rel(file);
  let html = fs.readFileSync(file, 'utf8');
  let next = html;

  next = normalizeDuplicateBodyClass(next);
  next = ensureNoindex(fileRel, next);

  if (fileRel === 'index.html') {
    next = removeExactStrings(next, mainForbidden);
  }

  if (fileRel === 'blog/index.html') {
    next = removeBlogExpansionSection(next);
  }

  if (targetPosts.includes(fileRel)) {
    next = removeSeoPostTail(next);
  }

  next = ensureMarker(fileRel, next);

  if (next !== html) {
    fs.writeFileSync(file, next, 'utf8');
    touched.push(fileRel);
  }
}

for (const fileRel of keyPages) {
  if (!exists(fileRel)) repaired.push({ file: fileRel, status: 'missing' });
}

ensureRobots();
updatePackage();

const report = {
  version: VERSION,
  marker: MARKER,
  generatedAt: new Date().toISOString(),
  htmlCount: walk(ROOT).length,
  keyPages,
  targetSeoPosts: targetPosts.length,
  touchedCount: touched.length,
  touched,
  repaired,
  lockedRules: {
    mainForbidden,
    blogForbidden,
    postForbidden,
    legacyBlockForbidden,
    mainSlots: { blog: 15, sports: 5, guides: 5 },
    privateNoindex: ['ops/', 'admin/']
  }
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

console.log(`[V86] structure lock hardening complete. html=${report.htmlCount} touched=${report.touchedCount} seoPosts=${targetPosts.length}`);
