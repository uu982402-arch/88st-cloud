import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const VERSION = 'v107-guaranteed-cro-card-copy-polish-20260527';
const pages = ['guaranteed/index.html','guaranteed/sk-holdings/index.html','guaranteed/zakum/index.html','guaranteed/udt/index.html','guaranteed/queenbee/index.html','guaranteed/ddangkong/index.html','guaranteed/anybet/index.html'];
const insert = `  <meta name="v107-guaranteed-cro-card-copy-polish" content="V107_GUARANTEED_CRO_CARD_COPY_POLISH_ACTIVE">
  <link rel="stylesheet" href="/assets/css/v107-guaranteed-cro-card-copy-polish.css?v=${VERSION}" data-v107-guaranteed-cro="true">
  <script defer src="/assets/js/v107-guaranteed-cro-card-copy-polish.js?v=${VERSION}" data-v107-guaranteed-cro="true"></script>
`;
function updatePage(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return;
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('data-v107-guaranteed-cro="active"')) html = html.replace(/<html([^>]*?)>/, (m,a) => a.includes('data-v107-guaranteed-cro') ? m : `<html${a} data-v107-guaranteed-cro="active">`);
  if (!html.includes('/assets/css/v107-guaranteed-cro-card-copy-polish.css')) html = html.replace('</head>', insert + '</head>');
  if (!html.includes('data-v107-guaranteed-cro="true"')) html = html.replace(/<body([^>]*?)>/, (m,a) => a.includes('data-v107-guaranteed-cro') ? m : `<body${a} data-v107-guaranteed-cro="true">`);
  if (file === 'guaranteed/index.html') {
    html = html.replaceAll('<small>보증 상태</small><b>상담 확인</b>', '<small>확인 기준</small><b>상담 후 이용</b>');
    html = html.replaceAll('>상세보기</a>', '>혜택 보기</a>');
    html = html.replaceAll('>바로가기</button>', '>코드복사 · 이동</button>');
  } else {
    html = html.replaceAll('공식 도메인 바로가기</button>', '코드복사 · 공식 이동</button>');
    html = html.replaceAll('>공식 바로가기</button>', '>코드복사 · 이동</button>');
    html = html.replaceAll('<span>확인 기준</span><strong>RUST 통일</strong>', '<span>확인 순서</span><strong>코드·주소 재확인</strong>');
    html = html.replaceAll('<h2>공통 확인 채널</h2>', '<h2>상담 전 최종 확인</h2>');
    html = html.replaceAll('>상담센터 연결</a>', '>상담으로 조건 확인</a>');
    html = html.replaceAll('바로가기 클릭 시 코드가 먼저 복사되도록 구성했습니다.', '이동 전 가입코드를 먼저 복사하는 흐름으로 구성했습니다.');
  }
  fs.writeFileSync(full, html);
}
for (const page of pages) updatePage(page);
fs.writeFileSync(path.join(ROOT, 'build.txt'), '88ST.Cloud build V107 GUARANTEED CRO / CARD COPY POLISH PATCH\n2026-05-27T04:22:00.000Z\n');
fs.writeFileSync(path.join(ROOT, 'assets/js/build.ver.js'), "window.__RUST_BUILD_VERSION__ = 'V107-GUARANTEED-CRO-CARD-COPY-POLISH-20260527';\nwindow.__RUST_BUILD_LABEL__ = 'V107 GUARANTEED CRO / CARD COPY POLISH PATCH';\n");
console.log('[V107] guaranteed CRO / card copy polish applied');
