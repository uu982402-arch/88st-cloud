import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const blogPath = path.join(ROOT, 'blog/index.html');
if (!fs.existsSync(blogPath)) throw new Error('blog/index.html missing');

const cssHref = '/assets/css/v104-blog-list-comfort-density.css?v=v104-blog-list-comfort-density-20260526';
const jsSrc = '/assets/js/v104-blog-list-comfort-density.js?v=v104-blog-list-comfort-density-20260526';

const shortByCategory = {
  '카지노':'혜택률보다 롤링·제외게임·출금 한도를 먼저 확인합니다.',
  '스포츠':'주소·가입코드·배당 조건을 빠르게 체크합니다.',
  '슬롯':'RTP·변동성·보너스 적용 조건을 짧게 정리합니다.',
  '도메인':'주소 변경·코드 일치·공식 채널을 우선 확인합니다.',
  '가이드':'실사용 전 확인할 핵심 기준만 압축했습니다.',
  '보증업체':'보증 상태·가입코드·상담 연결 기준을 확인합니다.',
  '입플사이트':'입플 조건과 실수령 기준을 먼저 비교합니다.',
  '가입코드':'코드 입력 전 주소·상담 답변 일치를 확인합니다.'
};
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stripTags = (s) => s.replace(/<[^>]*>/g, '').trim();

let html = fs.readFileSync(blogPath, 'utf8');

if (!html.includes('data-v104-blog-comfort="active"')) {
  html = html.replace(/<html([^>]*?)>/, '<html$1 data-v104-blog-comfort="active">');
}

if (!html.includes('/assets/css/v104-blog-list-comfort-density.css')) {
  html = html.replace('</head>', `  <meta name="v104-blog-list-comfort-density" content="V104_BLOG_LIST_COMFORT_DENSITY_ACTIVE">\n  <link rel="stylesheet" href="${cssHref}" data-v104-blog-comfort="true">\n  <script defer src="${jsSrc}" data-v104-blog-comfort="true"></script>\n</head>`);
}

html = html.replace(/<body[^>]*>/, (tag) => {
  let out = tag;
  if (!out.includes('data-v104-blog-comfort=')) out = out.replace(/>$/, ' data-v104-blog-comfort="true">');
  if (!out.includes('data-blog-density=')) out = out.replace(/>$/, ' data-blog-density="compact">');
  return out;
});

if (!html.includes('data-v104-density-toggle')) {
  const toggle = `<span class="v104-density-toggle" data-v104-density-toggle aria-label="블로그 목록 밀도">\n              <button type="button" class="v104-density-btn" data-v104-density="compact" aria-pressed="true">촘촘히</button>\n              <button type="button" class="v104-density-btn" data-v104-density="comfort" aria-pressed="false">편하게</button>\n            </span>`;
  html = html.replace('<span class="v99-blog-tier">핵심글</span><span class="v99-blog-tier">최신글</span><span class="v99-blog-tier">인기글</span>',
    '<span class="v99-blog-tier">핵심글</span><span class="v99-blog-tier">최신글</span><span class="v99-blog-tier">인기글</span>' + toggle);
}

html = html.replace(/<a class="v72-blog-card"[\s\S]*?<\/a>/g, (card) => {
  const title = stripTags((card.match(/<strong>([\s\S]*?)<\/strong>/) || [,''])[1]);
  const cat = stripTags((card.match(/<span class="v72-blog-card__tag">([\s\S]*?)<\/span>/) || [,''])[1]);
  let summary = shortByCategory[cat] || '핵심 확인 순서와 실사용 체크 포인트를 짧게 정리했습니다.';
  let first = title.split(':')[0].trim();
  if (first.length > 22) first = first.slice(0, 22).trimEnd() + '…';
  if (first) summary = `${first} — ${summary}`;
  return card.replace(/<p>[\s\S]*?<\/p>/, `<p>${escapeHtml(summary)}</p>`);
});

fs.writeFileSync(blogPath, html);
fs.writeFileSync(path.join(ROOT, 'build.txt'), '88ST.Cloud build V104 BLOG LIST COMFORT / DENSITY PATCH\n2026-05-26T09:30:00.000Z\n');
fs.writeFileSync(path.join(ROOT, 'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V104-BLOG-LIST-COMFORT-DENSITY-PATCH-20260526';\nwindow.__RUST_BUILD_LABEL__ = 'V104 BLOG LIST COMFORT / DENSITY PATCH';\n");
console.log('[V104] Blog list comfort density patch applied');
