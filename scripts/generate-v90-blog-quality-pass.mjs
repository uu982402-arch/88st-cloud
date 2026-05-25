import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'static-v90-blog-quality-pass-20260525';
const MARKER = 'V90_BLOG_QUALITY_PASS_ACTIVE';
const CSS_HREF = `/assets/css/v90-blog-quality-pass.css?v=${VERSION}`;
const DATA_PATH = path.join(ROOT, 'assets/data/v90-blog-quality-pass.json');
const TARGET_MARKERS = [
  'V82_2_SEO_CONTENT_ACTIVE',
  'V85_SEO_CONTENT_30_ACTIVE',
  'v85-seo-content-30',
  'v82-seo-post',
  'V85_4_BLOG_POST_SHELL_LOCK_ACTIVE'
];
const FORBIDDEN_BLOCKS = [
  '신규 유입 확장 콘텐츠',
  '토토·입플·보증업체·도구 연결 50개',
  '페이지 하단의 내부 링크',
  '관련 글과 다음 확인 루트',
  '도구 열기',
  '상담 연결까지 이어지도록 구성했습니다'
];
const stripHtml = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function read(p){ return fs.readFileSync(p, 'utf8'); }
function write(p,s){ fs.writeFileSync(p, s); }
function metaContent(txt, name){
  const m = txt.match(new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["'][^>]*>`, 'i'));
  return m ? m[1] : '';
}
function titleText(txt){
  const h1 = txt.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripHtml(h1[1]);
  const t = txt.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return t ? stripHtml(t[1]).replace(/\s*\|\s*RUST.*/i, '') : 'RUST 블로그 가이드';
}
function categoryText(txt){
  const tag = txt.match(/<span\s+class=["']v82-longform-hero__tag["'][^>]*>([\s\S]*?)<\/span>/i);
  if (tag) return stripHtml(tag[1]).split('·')[0].trim();
  return 'RUST 가이드';
}
function keywordText(txt){
  const kw = metaContent(txt, 'keywords').split(',').map(x=>x.trim()).find(x => x && !['RUST','88st.cloud','토토사이트추천','입플사이트추천'].includes(x));
  const tag = txt.match(/<span\s+class=["']v82-longform-hero__tag["'][^>]*>([\s\S]*?)<\/span>/i);
  if (tag) return stripHtml(tag[1]).split('·').map(x=>x.trim()).filter(Boolean).pop() || kw || 'RUST';
  return kw || 'RUST';
}
function safeDescription(txt, title, keyword){
  let current = metaContent(txt, 'description');
  current = current.replace(/RUST가\s*[^.]{0,80}?(실전 가이드|롱폼 가이드)입니다\.?/g, '').replace(/\s+/g, ' ').trim();
  const base = current || `${title}를 검색 의도, 조건 확인, 위험 신호, 계산 기준 순서로 정리한 RUST 블로그 가이드입니다.`;
  const suffix = `${keyword} 확인 기준을 광고 문구보다 실제 비교 가능한 항목 중심으로 설명합니다.`;
  let merged = `${base} ${suffix}`.replace(/\s+/g,' ').trim();
  if (merged.length > 155) merged = merged.slice(0, 152).replace(/[\s,.;:·-]+$/,'') + '...';
  return merged;
}
function ensureMeta(txt, title, keyword){
  const desc = safeDescription(txt, title, keyword);
  txt = txt.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["'][^>]*>/i, `<meta name="description" content="${esc(desc)}">`);
  const kw = metaContent(txt, 'keywords');
  const keywords = Array.from(new Set([keyword, 'RUST', '88st.cloud', '토토사이트추천', '입플사이트추천', '보증업체', '롤링 조건', 'EV 계산법', ...kw.split(',').map(x=>x.trim()).filter(Boolean)])).slice(0, 14).join(', ');
  if (kw) txt = txt.replace(/<meta\s+name=["']keywords["']\s+content=["'][^"']*["'][^>]*>/i, `<meta name="keywords" content="${esc(keywords)}">`);
  return txt;
}
function ensureHead(txt){
  if (!txt.includes('v90-blog-quality-pass.css')) {
    txt = txt.replace('</head>', `  <link rel="stylesheet" href="${CSS_HREF}" data-v90-blog-quality="true">\n  <meta name="v90-blog-quality-pass" content="${MARKER}">\n</head>`);
  } else if (!txt.includes(MARKER)) {
    txt = txt.replace('</head>', `  <meta name="v90-blog-quality-pass" content="${MARKER}">\n</head>`);
  }
  return txt;
}
function cleanForbidden(txt){
  txt = txt.replace(/<section[^>]*(?:v82-related|v85-related|related|cta|next-route|internal-link|link-panel)[^>]*>[\s\S]*?<\/section>/gi, '');
  txt = txt.replace(/<div[^>]*(?:v82-related|v85-related|related|cta|next-route|internal-link|link-panel)[^>]*>[\s\S]*?<\/div>/gi, '');
  for (const phrase of FORBIDDEN_BLOCKS) {
    txt = txt.split(phrase).join('');
  }
  return txt;
}
function addLead(txt, title, keyword, category){
  if (txt.includes('data-v90-blog-quality="lead"')) return txt;
  const lead = `<p class="v90-quality-lead" data-v90-blog-quality="lead"><strong>${esc(keyword)} 검색 의도 정리.</strong> 이 글은 ${esc(category)} 관련 조건을 광고성 추천 문구가 아니라 공식주소, 가입코드, 보증 상태, 계산 기준, 위험 신호 순서로 나눠 확인하도록 구성했습니다. 처음 방문한 사용자도 한 번에 판단 기준을 잡을 수 있도록 핵심 항목을 먼저 설명하고, 뒤에서 세부 조건을 단계적으로 풀어갑니다.</p>`;
  return txt.replace(/(<div\s+class=["']v82-longform-body["']>\s*)/i, `$1\n    ${lead}\n`);
}
function buildFaq(title, keyword, category){
  const q1 = `${keyword} 정보를 볼 때 가장 먼저 확인할 항목은 무엇인가요?`;
  const a1 = `가장 먼저 공식주소와 가입코드가 같은 흐름에서 안내되는지 확인해야 합니다. 그 다음 보증 상태, 롤링 조건, 최대출금, 상담 응답의 일관성을 순서대로 비교하는 것이 안전합니다.`;
  const q2 = `${category} 조건에서 광고 문구와 실제 기준은 어떻게 구분하나요?`;
  const a2 = `혜택률만 강조하는 문구보다 조건표가 구체적인지 확인해야 합니다. 인정 게임, 제외 조건, 정산 예외, 코드 적용 여부가 분명할수록 실제 판단에 도움이 됩니다.`;
  const q3 = `${title} 내용을 실제 이용 전에 어떻게 활용하면 좋나요?`;
  const a3 = `본문의 기준을 체크리스트처럼 사용해 주소, 코드, 보증 상태, 계산 조건을 각각 분리해 확인하면 됩니다. 한 항목만 보고 판단하지 않고 여러 기준이 일치하는지 보는 것이 핵심입니다.`;
  const q4 = `RUST 블로그 글은 어떤 기준으로 읽는 것이 좋나요?`;
  const a4 = `각 글은 검색어 하나에 맞춘 단편 정보보다 조건 해석, 위험 신호, 계산 기준을 함께 설명하는 방식으로 구성됩니다. 같은 주제라도 공식주소, 보증업체, 도구 계산, 상담 확인을 분리해서 읽으면 판단이 더 선명해집니다.`;
  return {items:[[q1,a1],[q2,a2],[q3,a3],[q4,a4]], html:`\n<section class="v90-quality-faq" data-v90-blog-quality="faq" aria-label="자주 묻는 질문">\n  <h2>자주 묻는 질문</h2>\n  ${[[q1,a1],[q2,a2],[q3,a3],[q4,a4]].map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n  ')}\n</section>\n`};
}
function ensureFaq(txt, title, keyword, category){
  txt = txt.replace(/<section\s+class=["']v90-quality-faq["'][\s\S]*?<\/section>/gi, '');
  const faq = buildFaq(title, keyword, category).html;
  if (txt.includes('</div></div></article>')) return txt.replace('</div></div></article>', `${faq}</div></div></article>`);
  if (txt.includes('</div></article>')) return txt.replace('</div></article>', `${faq}</div></article>`);
  return txt.replace('</article>', `${faq}</article>`);
}
function ensureJsonLdFaq(txt, title, keyword, category){
  txt = txt.replace(/<script\s+type=["']application\/ld\+json["'][^>]*data-v90-blog-quality=["']faq-schema["'][\s\S]*?<\/script>/gi, '');
  const faq = buildFaq(title, keyword, category).items;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faq.map(([q,a]) => ({'@type':'Question', 'name': q, 'acceptedAnswer': {'@type':'Answer', 'text': a}}))
  };
  return txt.replace('</head>', `  <script type="application/ld+json" data-v90-blog-quality="faq-schema">${JSON.stringify(schema)}</script>\n</head>`);
}
function targetFile(txt, rel){
  if (!rel.startsWith('blog/') || rel === 'blog/index.html' || !rel.endsWith('/index.html')) return false;
  return TARGET_MARKERS.some(m => txt.includes(m));
}
const targets = [];
const blogDir = path.join(ROOT, 'blog');
for (const dir of fs.readdirSync(blogDir, {withFileTypes:true})) {
  if (!dir.isDirectory()) continue;
  const file = path.join(blogDir, dir.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  let txt = read(file);
  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  if (!targetFile(txt, rel)) continue;
  const title = titleText(txt);
  const category = categoryText(txt);
  const keyword = keywordText(txt);
  txt = ensureHead(txt);
  txt = ensureMeta(txt, title, keyword);
  txt = cleanForbidden(txt);
  txt = addLead(txt, title, keyword, category);
  txt = ensureFaq(txt, title, keyword, category);
  txt = ensureJsonLdFaq(txt, title, keyword, category);
  if (!txt.includes('V90_BLOG_QUALITY_PASS_ACTIVE')) txt = txt.replace('</head>', `  <meta name="v90-blog-quality-pass" content="${MARKER}">\n</head>`);
  write(file, txt);
  targets.push({rel, title, category, keyword, chars: stripHtml(txt).length});
}
fs.mkdirSync(path.dirname(DATA_PATH), {recursive:true});
write(DATA_PATH, JSON.stringify({version: VERSION, marker: MARKER, count: targets.length, targets}, null, 2));
console.log(`[V90] blog quality pass applied. targets=${targets.length}`);
