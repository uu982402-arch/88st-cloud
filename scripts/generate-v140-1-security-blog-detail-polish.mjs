import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

const VERSION = 'V140_1_SECURITY_BLOG_CONVERSION_DETAIL_POLISH';
const today = '2026-05-31';
const cssHref = '/assets/css/v140-1-security-blog-common-polish.css?v=20260531-v140-1-security-blog-polish';
const posts = [
  {
    file: 'blog/fake-evolution-pragmatic-api-parsing-site-check.html',
    url: '/blog/fake-evolution-pragmatic-api-parsing-site-check.html',
    titleNeedle: '에볼루션이 가짜일 수 있다',
    description: '에볼루션·프라그마틱 가짜 API 파싱 사이트의 조작 의심 신호와 테이블 번호·라운드 정보 동기화 팩트체크를 정리했습니다.',
    keywords: '가짜 에볼루션 API, 프라그마틱 가짜 API, 카지노 파싱 사이트, 테이블 번호 동기화, 에볼루션 조작 의심, 슬롯 조작 구별법, 정품 API 연동, 보증 카지노, RUST, 88ST.Cloud',
    after: '두 번째는 공급사 로고를 눌러도 반응이 없거나, 공식 정보로 연결되지 않는 경우입니다. 진짜 서비스라면 공급사 표기와 게임 정보가 자연스럽게 맞아야 하는데, 가짜는 그림만 붙여둔 경우가 많습니다.</p>',
    block: '<div class="v140-fact-check" data-v140-1-fact-check="api-sync"><strong>1분 팩트 체크: 테이블·라운드 동기화</strong><p>정품 에볼루션 라이브 테이블은 같은 테이블 번호, 딜러·라운드 흐름, 공개되는 채팅/테이블 정보가 다른 메이저 사이트와 실시간에 가깝게 맞아야 합니다. 한 곳만 라운드가 늦거나 테이블 번호가 어긋나면 화면만 베낀 파싱 구조를 의심해야 합니다.</p></div>',
    conversionBefore: '<div class="v140-cta-space" data-v140-cta="guaranteed"><h2>[보증 사이트 바로가기 버튼]</h2>',
    conversionBlock: '<div class="v140-conversion-bridge" data-v140-1-conversion="api"><strong>눈으로 구별 못 합니다.</strong><p>지금 쓰는 사이트가 의심된다면, 본사 정품 API 계약과 보증 범위를 먼저 확인할 수 있는 아래 보증 카지노를 이용하는 것이 가장 안전합니다.</p></div>',
    ctaReplace: ['조작된 가짜 게임에서 돈을 잃고 후회하지 마세요. 오직 정품 100% API 연동과 먹튀 발생 시 100% 환불을 보장하는 아래 안전 보증 사이트에서 안전하게 플레이하세요.', '조작된 가짜 게임에서 돈을 잃고 후회하지 마세요. 정품 API 연동 여부와 보증 범위를 먼저 확인할 수 있는 아래 안전 보증 사이트에서 안전하게 플레이하세요.']
  },
  {
    file: 'blog/mobile-addressbar-telegram-impersonation-scam.html',
    url: '/blog/mobile-addressbar-telegram-impersonation-scam.html',
    titleNeedle: '모바일 주소창 사기와 텔레그램 사칭 먹튀',
    description: '모바일 주소창 은닉 피싱, 텔레그램 공식 고객센터 사칭, 채널·유저 계정 구별 팁과 평생 도메인 확인 기준을 정리했습니다.',
    keywords: '모바일 주소창 사기, 텔레그램 사칭 먹튀, 공식 고객센터 사칭, 텔레그램 채널 구독자 수, 1:1 대화방 링크, 평생 도메인 센터, 토토 피싱, 카지노 피싱, 보증 사이트, RUST, 88ST.Cloud',
    after: '사칭 상담방은 먼저 친절하게 응대합니다. 그다음 “지금 주소가 바뀌었다”, “이쪽 링크로 재가입하면 혜택이 크다”, “입금 확인을 위해 지갑 주소를 바꿔야 한다”는 식으로 사용자를 다른 경로로 이동시킵니다.</p>',
    block: '<div class="v140-fact-check" data-v140-1-fact-check="telegram"><strong>텔레그램 검색창 구별 팁</strong><p>사칭 텔레그램은 검색창에 아이디를 쳤을 때 구독자 수가 보이는 채널이거나 일반 유저(User) 계정처럼 보이는 경우가 많습니다. 진짜 고객센터는 보통 공식 페이지에서 연결되는 1:1 대화방 링크 형태로 안내되므로, 검색 결과만 믿지 말고 보증업체 페이지의 상담 링크와 대조하세요.</p></div>',
    conversionBefore: '<div class="v140-cta-space" data-v140-cta="guaranteed"><h2>[보증 사이트 가입 링크 및 추천코드 안내]</h2>',
    conversionBlock: '<div class="v140-conversion-bridge" data-v140-1-conversion="mobile"><strong>검색으로 찾은 주소는 사칭이 섞일 수 있습니다.</strong><p>주소가 바뀔 때마다 기술팀이 도메인과 상담 채널을 확인하는 아래 평생 도메인 센터를 북마크하고, 입금 전 공식주소·추천코드·상담 링크를 같은 화면에서 다시 확인하세요.</p></div>',
    ctaReplace: ['보증업체 페이지에서 현재 공식주소, 추천코드, 상담 연결 상태를 먼저 확인하세요.', '보증업체 페이지에서 현재 공식주소, 추천코드, 상담 연결 상태를 먼저 확인하고 평생 도메인 센터를 북마크하세요.']
  },
  {
    file: 'blog/usdt-trx-coin-deposit-withdrawal-scam-txid-guide.html',
    url: '/blog/usdt-trx-coin-deposit-withdrawal-scam-txid-guide.html',
    titleNeedle: 'USDT·TRX',
    description: 'USDT·TRX 코인 입출금 먹튀, TRC-20·ERC-20 네트워크 전환 핑계, 가짜 TxID와 추가 입금 요구 수법을 정리했습니다.',
    keywords: '코인 토토사이트 먹튀, USDT 입금 사기, TRX 먹튀, TRC-20 ERC-20 사기, 가짜 TxID, 테더 출금 지연, 코인 먹튀 예방, 보증업체 추천코드, RUST, 88ST.Cloud',
    after: '더 나쁜 경우에는 입금 주소만 받고 사이트와 상담방을 동시에 닫습니다. 이런 곳은 처음부터 정산할 생각이 없기 때문에 혜택 문구가 아무리 좋아도 피해야 합니다.</p>',
    block: '<div class="v140-fact-check" data-v140-1-fact-check="coin-network"><strong>TRC-20 입금 후 ERC-20 출금 핑계</strong><p>먹튀 사이트는 입금할 때는 수수료가 저렴한 트론(TRX) 네트워크, 즉 TRC-20을 쓰게 해놓고 출금 신청 후에는 갑자기 ERC-20으로 보냈다며 가짜 TxID를 주거나 추가 수수료 입금을 요구하기도 합니다. 입금·출금 네트워크가 갑자기 바뀌면 즉시 캡처하고 추가 입금은 중단해야 합니다.</p></div>',
    conversionBefore: '<div class="v140-cta-space" data-v140-cta="guaranteed"><h2>[추천 보증 사이트 및 가입 코드 안내]</h2>',
    conversionBlock: '<div class="v140-conversion-bridge" data-v140-1-conversion="coin"><strong>코인 먹튀는 개인이 바로 회수하기 어렵습니다.</strong><p>익명성은 지키되, 자본력과 보증 기준이 확인된 코인 입출금 가능 보증업체를 이용해야 추가 입금 요구와 가짜 TxID 리스크를 줄일 수 있습니다.</p></div>',
    ctaReplace: ['개인이 코인 트랙킹을 하는 것은 사실상 불가능합니다. 코인 입출금의 익명성은 지키되, 자본력이 검증되어 절대로 코인 먹튀를 하지 않는 자사 보증 업체를 추천합니다.', '개인이 코인 트랙킹을 하는 것은 사실상 어렵습니다. 코인 입출금의 익명성은 지키되, 자본력과 보증 기준이 검증된 자사 보증 업체를 이용하는 것이 안전합니다.']
  }
];

function read(file){ return readFileSync(file, 'utf8'); }
function write(file, text){ mkdirSync(dirname(file), {recursive:true}); writeFileSync(file, text, 'utf8'); }
function escRegex(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function injectCss(text){
  text = text.replace('<html lang="ko" data-v140-security-blog="active"', '<html lang="ko" data-v140-1-security-blog-polish="active" data-v140-security-blog="active"');
  if (!text.includes(cssHref)) {
    text = text.replace(/(<link rel="stylesheet" href="\/assets\/css\/v140-security-blog-expansion\.css[^>]+>)/, `$1\n  <link rel="stylesheet" href="${cssHref}" data-v140-1-security-blog-polish="true">`);
  }
  return text;
}
function updateMeta(text, post){
  text = text.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${post.description}">`);
  text = text.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${post.description}">`);
  text = text.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${post.description}">`);
  text = text.replace(/<meta name="keywords" content="[^"]*">/, `<meta name="keywords" content="${post.keywords}">`);
  text = text.replace(/(<section class="v82-longform-hero">[\s\S]*?<h1>[\s\S]*?<\/h1><p>)[\s\S]*?(<\/p><\/section>)/, `$1${post.description}$2`);
  text = text.replace(/<div class="v140-security-note"><strong>핵심 요약<\/strong><br>[\s\S]*?<\/div>/, `<div class="v140-security-note"><strong>핵심 요약</strong><br>${post.description}</div>`);
  text = text.replace(/("description":")[^"]*(")/, `$1${post.description}$2`);
  return text;
}
function patchPost(post){
  if (!existsSync(post.file)) throw new Error(`${post.file} missing`);
  let text = read(post.file);
  text = injectCss(text);
  text = updateMeta(text, post);
  if (!text.includes(post.block)) {
    if (!text.includes(post.after)) throw new Error(`${post.file} insertion anchor missing`);
    text = text.replace(post.after, post.after + '\n' + post.block);
  }
  if (!text.includes(post.conversionBlock)) {
    if (!text.includes(post.conversionBefore)) throw new Error(`${post.file} conversion anchor missing`);
    text = text.replace(post.conversionBefore, post.conversionBlock + '\n' + post.conversionBefore);
  }
  if (post.ctaReplace && text.includes(post.ctaReplace[0])) text = text.replace(post.ctaReplace[0], post.ctaReplace[1]);
  write(post.file, text);
}

for (const post of posts) patchPost(post);

if (existsSync('blog/index.html')) {
  let blog = read('blog/index.html');
  if (!blog.includes(cssHref)) {
    blog = blog.replace(/(<link rel="stylesheet" href="\/assets\/css\/v140-security-blog-expansion\.css[^>]+>)/, `$1\n  <link rel="stylesheet" href="${cssHref}" data-v140-1-security-blog-polish="true">`);
  }
  blog = blog.replace('<html lang="ko" data-v140-security-blog="active"', '<html lang="ko" data-v140-1-security-blog-polish="active" data-v140-security-blog="active"');
  write('blog/index.html', blog);
}

if (existsSync('assets/config/seo.meta.json')) {
  const seo = JSON.parse(read('assets/config/seo.meta.json'));
  for (const post of posts) {
    if (!seo[post.url]) seo[post.url] = {};
    seo[post.url].description = post.description;
    seo[post.url].keywords = post.keywords;
  }
  write('assets/config/seo.meta.json', JSON.stringify(seo, null, 2) + '\n');
}

const report = {
  ok: true,
  version: VERSION,
  base: 'V140_SECURITY_BLOG_EXPANSION',
  changedPosts: posts.map(p => p.file),
  cssFile: 'assets/css/v140-1-security-blog-common-polish.css',
  contentPolish: [
    'fake API article: table/chat/round sync fact-check and CTA bridge',
    'mobile phishing article: Telegram search channel/user account distinction and domain center CTA bridge',
    'coin article: TRC-20/ERC-20 fake TxID/additional-fee scam pattern and CTA bridge'
  ],
  deletedFiles: [],
  generatedAt: new Date().toISOString()
};
mkdirSync('reports', {recursive:true});
write('reports/v140-1-security-blog-detail-polish-audit.json', JSON.stringify(report, null, 2) + '\n');
write('V140_1_PATCH_MANIFEST.json', JSON.stringify(report, null, 2) + '\n');
write('V140_1_UPGRADE_REPORT.md', `# V140.1 SECURITY BLOG DETAIL POLISH\n\n- Applied V140.1 article-local common design rules.\n- Strengthened fake API, mobile phishing, and USDT/TRX scam article detail points.\n- Updated descriptions/keywords in article heads and seo.meta.json.\n- Preserved V139-11 retired route lock and V140 security article routes.\n- Deleted files: 0.\n\nGenerated: ${report.generatedAt}\n`);
console.log('[V140.1 GENERATE PASS]', JSON.stringify(report, null, 2));
