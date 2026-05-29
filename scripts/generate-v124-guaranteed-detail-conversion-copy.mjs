import fs from 'fs';
import path from 'path';

const root = process.cwd();
const vendors = [
  { slug:'sk-holdings', name:'SK 홀딩스', brand:'SK HOLDINGS', domain:'snk-99.com', code:'IRON888', accent:'#67E8F9', hero:'입금 플러스와 충전 이벤트를 한 화면에서 비교합니다. 주소와 코드를 먼저 맞춘 뒤 혜택표만 확인하세요.', focus:'입금 플러스' },
  { slug:'zakum', name:'자쿰', brand:'ZAKUM', domain:'zk-777.com', code:'zk888', accent:'#FBBF24', hero:'테더 기반 혜택과 스포츠·슬롯 이벤트를 짧게 정리했습니다. 코드 입력 전 주소와 혜택 구간을 먼저 확인하세요.', focus:'테더·첫충' },
  { slug:'udt', name:'UDT BET', brand:'UDT BET', domain:'udt-01.com', code:'SEOA', accent:'#93C5FD', hero:'스포츠 첫충, 슬롯 매충, 미니게임 지원 범위를 분리해 정리했습니다. 코드와 게임 조건을 함께 확인하세요.', focus:'스포츠·미니게임' },
  { slug:'queenbee', name:'여왕벌', brand:'QUEENBEE', domain:'qb-700.com', code:'SEOA', accent:'#F9A8D4', hero:'첫 충전, 매충, USDT 보조 혜택을 핵심만 압축했습니다. 주소·코드·혜택표 순서로 확인하면 됩니다.', focus:'첫충·USDT' },
  { slug:'ddangkong', name:'땅콩 BET', brand:'DDANGKONG BET', domain:'ddk-2024.com', code:'DDK888', accent:'#FCD34D', hero:'스포츠·미니게임 포인트와 카지노·슬롯 콤프를 구분했습니다. 이용 전 코드와 한도 항목을 먼저 확인하세요.', focus:'포인트·콤프' },
  { slug:'anybet', name:'ANY BET', brand:'ANY BET', domain:'any-777.com', code:'SEOA', accent:'#A7F3D0', hero:'원화와 테더 혜택을 나눠 보기 쉽게 정리했습니다. 코드복사 후 충전·페이백 기준만 확인하세요.', focus:'원화·테더' },
];
const detailPages = vendors.map(v => path.join(root, 'guaranteed', v.slug, 'index.html'));
const hubPage = path.join(root, 'guaranteed', 'index.html');

function read(file){ return fs.readFileSync(file,'utf8'); }
function write(file, data){ fs.writeFileSync(file, data); }
function ensureHeadAsset(html){
  if (!html.includes('V124_GUARANTEED_DETAIL_CONVERSION_COPY_ACTIVE')) {
    html = html.replace('</head>', '  <meta name="v124-guaranteed-detail-conversion-copy" content="V124_GUARANTEED_DETAIL_CONVERSION_COPY_ACTIVE">\n  <link rel="stylesheet" href="/assets/css/v124-guaranteed-detail-conversion-copy.css?v=20260529" data-v124-guaranteed-detail="true">\n</head>');
  }
  return html;
}
function ensureRootMarkers(html){
  html = html.replace(/<html\b(?![^>]*data-v124-guaranteed-detail-conversion)/, '<html data-v124-guaranteed-detail-conversion="active"');
  html = html.replace(/<body\b(?![^>]*data-v124-guaranteed-detail-conversion)/, '<body data-v124-guaranteed-detail-conversion="active"');
  return html;
}
function topline(v){
  return `<section class="v124-detail-topline" aria-label="${v.name} 빠른 확인" data-v124-detail-topline="true" style="--vendor-accent:${v.accent}"><article><span>공식 주소</span><strong>${v.domain}</strong><small>이동 전 주소 일치 확인</small></article><article><span>가입코드</span><strong>${v.code}</strong><small>복사 후 입력값 확인</small></article><article><span>핵심 혜택</span><strong>${v.focus}</strong><small>롤링·한도·제외게임 확인</small></article></section>`;
}
function polishDetail(html, v){
  html = ensureRootMarkers(ensureHeadAsset(html));
  html = html.replace(/<span class="v96-2-kicker">.*?<\/span>/, `<span class="v96-2-kicker">${v.brand} BENEFIT CHECK</span>`);
  html = html.replace(/<h1>.*?보증업체 혜택 확인<\/h1>/, `<h1>${v.name} 혜택표 · 코드 확인</h1>`);
  html = html.replace(/(<div class="v96-2-copy">[\s\S]*?<h1>[\s\S]*?<\/h1>)<p>[\s\S]*?<\/p>/, `$1<p>${v.hero}</p>`);
  html = html.replace(/코드복사 · 공식 이동/g, '코드복사 · 이동');
  html = html.replace(/(<div class="v96-2-fact"><span>)확인 순서(<\/span><strong>)코드·주소 재확인(<\/strong><\/div>)/g, `$1이용 전 체크$2주소·코드 일치$3`);
  if (!html.includes('data-v124-detail-topline="true"')) {
    html = html.replace(/<\/section><section class="v96-2-facts"/, `</section>${topline(v)}<section class="v96-2-facts"`);
  }
  html = html.replace(/<div class="v96-2-section-head"><span>확인표<\/span><h2>조건 확인<\/h2><\/div>/g, `<div class="v96-2-section-head"><span>혜택표</span><h2>${v.name} 이용 전 체크</h2></div>`);
  html = html.replace(/<th>확인 항목<\/th><th>운영 메모<\/th>/g, '<th>핵심 값</th><th>이용 메모</th>');
  html = html.replace(/<td>조건 확인<\/td><td>롤링·제외 게임·최대 한도<\/td><td>혜택 적용 전 조건표와 제외 항목을 먼저 비교합니다\.<\/td>/g, '<td>롤링·한도</td><td>제외 게임·최대 출금·회차 기준</td><td>혜택 적용 전 조건표와 제외 항목을 먼저 비교합니다.</td>');
  html = html.replace(/상담에서 재확인/g, '페이지 기준으로 재확인');
  html = html.replace(/상담 답변/g, '페이지 안내');
  html = html.replace(/조건 오해를 줄일 수 있습니다/g, '조건 혼선을 줄일 수 있습니다');
  html = html.replace(/<section class="v96-2-hero v119-detail-hero"/g, '<section class="v96-2-hero v119-detail-hero v124-detail-hero" data-v124-detail-hero="true"');
  html = html.replace(/<div class="v96-2-art v119-detail-art"/g, '<div class="v96-2-art v119-detail-art v124-detail-art" data-v124-detail-art="true"');
  html = html.replace(/<section class="v96-2-section">/g, '<section class="v96-2-section v124-detail-section">');
  html = html.replace(/<ul class="v96-2-benefits">/g, '<ul class="v96-2-benefits v124-benefit-list" data-v124-benefit-list="true">');
  html = html.replace(/<div class="v96-2-table-wrap">/g, '<div class="v96-2-table-wrap v124-table-wrap" data-v124-table-wrap="true">');
  return html;
}
function polishHub(html){
  html = ensureRootMarkers(ensureHeadAsset(html));
  html = html.replace(/<section class="v74-shell v74-1-grid v119-guaranteed-card-grid"/, '<section class="v74-shell v74-1-grid v119-guaranteed-card-grid v124-guaranteed-card-grid" data-v124-guaranteed-card-grid="true"');
  html = html.replace(/혜택 보기/g, '혜택표 보기');
  html = html.replace(/data-v118-cta-variants="[^"]*"/g, 'data-v124-cta-lock="benefit-code-only"');
  html = html.replace(/확인 기준/g, '');
  html = html.replace(/조건 상담 후 이용/g, '');
  html = html.replace(/상담으로 조건 확인/g, '');
  return html;
}

for (const v of vendors) {
  const file = path.join(root, 'guaranteed', v.slug, 'index.html');
  write(file, polishDetail(read(file), v));
}
write(hubPage, polishHub(read(hubPage)));

const cssDir = path.join(root,'assets','css'); fs.mkdirSync(cssDir,{recursive:true});
write(path.join(cssDir,'v124-guaranteed-detail-conversion-copy.css'), `/* V124 GUARANTEED DETAIL CONVERSION COPY PATCH */
html[data-v124-guaranteed-detail-conversion="active"]{scroll-padding-top:88px}
body[data-v124-guaranteed-detail-conversion="active"] .v124-detail-hero{gap:clamp(18px,3vw,34px);align-items:center;padding-block:clamp(18px,4vw,42px)}
body[data-v124-guaranteed-detail-conversion="active"] .v124-detail-art{width:min(100%,520px);max-width:520px;margin-inline:auto;padding:clamp(10px,1.8vw,16px);border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.035));border:1px solid rgba(226,232,240,.18);box-shadow:0 20px 54px rgba(0,0,0,.24)}
body[data-v124-guaranteed-detail-conversion="active"] .v124-detail-art img{display:block;width:100%;height:auto;max-height:292px;object-fit:contain;margin-inline:auto;border-radius:18px;background:rgba(2,6,23,.18)}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-copy h1{font-size:clamp(28px,4.1vw,48px);line-height:1.05;letter-spacing:-.045em;margin-bottom:14px;color:#f8fafc;text-wrap:balance}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-copy p{max-width:620px;color:#dbe7f5;font-size:clamp(15px,1.75vw,18px);line-height:1.66;word-break:keep-all;text-wrap:pretty}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-btn{min-height:46px;border-radius:999px;padding:0 18px;font-weight:800;letter-spacing:-.02em}
.v124-detail-topline{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:16px 0 20px;padding:0}
.v124-detail-topline article{min-width:0;border:1px solid rgba(226,232,240,.16);border-radius:20px;background:linear-gradient(180deg,rgba(15,23,42,.82),rgba(15,23,42,.56));box-shadow:0 14px 34px rgba(0,0,0,.16);padding:16px;color:#f8fafc;position:relative;overflow:hidden}
.v124-detail-topline article::before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:var(--vendor-accent,#67E8F9);opacity:.9}
.v124-detail-topline span{display:block;font-size:12px;font-weight:900;color:#9fb1c9;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}
.v124-detail-topline strong{display:block;font-size:clamp(16px,2vw,22px);letter-spacing:-.03em;color:#ffffff;overflow-wrap:anywhere}
.v124-detail-topline small{display:block;margin-top:6px;color:#c9d6e6;font-weight:700;line-height:1.45}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-facts{gap:10px;margin-top:0}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-fact{border-color:rgba(226,232,240,.18);background:rgba(15,23,42,.68);box-shadow:none}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-fact span{color:#9fb1c9;font-weight:900}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-fact strong{color:#ffffff;letter-spacing:-.025em}
body[data-v124-guaranteed-detail-conversion="active"] .v124-detail-section{margin-top:clamp(22px,4vw,38px)}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-section-head span{color:var(--vendor-accent,#67E8F9);font-weight:950;letter-spacing:.08em}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-section-head h2{color:#f8fafc;letter-spacing:-.035em;text-wrap:balance}
body[data-v124-guaranteed-detail-conversion="active"] .v124-benefit-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:0;list-style:none}
body[data-v124-guaranteed-detail-conversion="active"] .v124-benefit-list li{display:flex;align-items:flex-start;gap:12px;padding:14px;border-radius:18px;border:1px solid rgba(226,232,240,.16);background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.035));color:#eef6ff;min-height:64px}
body[data-v124-guaranteed-detail-conversion="active"] .v124-benefit-list li b{flex:0 0 auto;display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:rgba(255,255,255,.1);color:var(--vendor-accent,#67E8F9);font-size:12px;font-weight:950;border:1px solid rgba(255,255,255,.12)}
body[data-v124-guaranteed-detail-conversion="active"] .v124-benefit-list li span{color:#f8fafc;font-weight:760;line-height:1.45;word-break:keep-all}
body[data-v124-guaranteed-detail-conversion="active"] .v124-table-wrap{overflow-x:auto;border-radius:20px;border:1px solid rgba(226,232,240,.16);background:rgba(15,23,42,.68);box-shadow:0 16px 40px rgba(0,0,0,.18)}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-table{min-width:680px;border-collapse:separate;border-spacing:0;width:100%}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-table th{background:rgba(255,255,255,.08);color:#ffffff;font-weight:950;white-space:nowrap}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-table td{color:#dbe7f5;border-top:1px solid rgba(226,232,240,.12);line-height:1.55;vertical-align:top}
body[data-v124-guaranteed-detail-conversion="active"] .v96-2-table td:first-child{color:#ffffff;font-weight:900;white-space:nowrap}
body[data-v124-guaranteed-detail-conversion="active"] .v113-depth{margin-top:clamp(24px,4vw,42px);border-top:1px solid rgba(226,232,240,.12);padding-top:clamp(20px,4vw,36px)}
body[data-v124-guaranteed-detail-conversion="active"] .v96-5-detail-quickbar{border-top:1px solid rgba(226,232,240,.16);background:rgba(2,6,23,.9);backdrop-filter:blur(16px)}
body[data-v124-guaranteed-detail-conversion="active"] .v96-5-detail-quickbar button{min-height:48px;border-radius:16px;font-weight:900}
body[data-v124-guaranteed-detail-conversion="active"] .v124-guaranteed-card-grid .v74-1-actions{grid-template-columns:repeat(2,minmax(0,1fr))}
body[data-v124-guaranteed-detail-conversion="active"] .v124-guaranteed-card-grid .v74-1-btn{min-height:44px;font-weight:900}
@media(max-width:900px){body[data-v124-guaranteed-detail-conversion="active"] .v124-detail-hero{grid-template-columns:1fr}.v124-detail-topline{grid-template-columns:1fr 1fr}body[data-v124-guaranteed-detail-conversion="active"] .v124-detail-art img{max-height:258px}}
@media(max-width:640px){body[data-v124-guaranteed-detail-conversion="active"] .v124-detail-hero{padding-block:14px 20px}body[data-v124-guaranteed-detail-conversion="active"] .v124-detail-art{max-width:360px;border-radius:18px;padding:8px}body[data-v124-guaranteed-detail-conversion="active"] .v124-detail-art img{max-height:204px;border-radius:14px}.v124-detail-topline{grid-template-columns:1fr;gap:8px;margin:12px 0 16px}.v124-detail-topline article{padding:13px 14px;border-radius:16px}body[data-v124-guaranteed-detail-conversion="active"] .v124-benefit-list{grid-template-columns:1fr;gap:8px}body[data-v124-guaranteed-detail-conversion="active"] .v124-benefit-list li{min-height:0;padding:12px;border-radius:16px}body[data-v124-guaranteed-detail-conversion="active"] .v96-2-actions{display:grid;grid-template-columns:1fr 1fr}body[data-v124-guaranteed-detail-conversion="active"] .v96-2-btn{padding:0 12px;font-size:13px}body[data-v124-guaranteed-detail-conversion="active"] .v96-2-table{min-width:590px}}
@media(max-width:420px){body[data-v124-guaranteed-detail-conversion="active"] .v96-2-actions{grid-template-columns:1fr}body[data-v124-guaranteed-detail-conversion="active"] .v124-detail-art img{max-height:186px}}
`);

const reportsDir = path.join(root,'reports'); fs.mkdirSync(reportsDir,{recursive:true});
const audit = {
  version:'V124',
  name:'GUARANTEED DETAIL CONVERSION COPY PATCH',
  generatedAt:new Date().toISOString(),
  detailPages: vendors.map(v => ({ slug:v.slug, url:`/guaranteed/${v.slug}/`, domain:v.domain, code:v.code, heroCopy:'shortened', imageMaxHeight:{desktop:'292px', tablet:'258px', mobile:'204px'} })),
  lockedRules:[
    'no bottom related sections',
    'no bottom consult blocks',
    'two CTA flow on guaranteed cards',
    'detail image object-fit contain',
    'no route deletion'
  ]
};
write(path.join(reportsDir,'v124-guaranteed-detail-conversion-audit.json'), JSON.stringify(audit,null,2));
write(path.join(reportsDir,'v124-remove-candidates.txt'), [
  'V124 remove candidates report',
  '- No files were deleted in this patch.',
  '- Bottom related/consult sections remain locked by V121/V124 checks.',
  '- Keep reviewing legacy generator scripts before deleting any unused CSS/JS.'
].join('\n')+'\n');

write(path.join(root,'V124_UPGRADE_REPORT.md'), `# V124 GUARANTEED DETAIL CONVERSION COPY PATCH\n\n- Base: V123 FULL\n- Scope: Guaranteed detail copy, benefit cards, table readability, image size lock, CTA spacing.\n- Deleted files: 0\n- Bottom related/consult sections: not reintroduced.\n`);
write(path.join(root,'V124_PATCH_MANIFEST.json'), JSON.stringify({
  version:'V124',
  base:'V123 FULL',
  changed:[
    'guaranteed/index.html',
    ...vendors.map(v=>`guaranteed/${v.slug}/index.html`),
    'assets/css/v124-guaranteed-detail-conversion-copy.css',
    'scripts/generate-v124-guaranteed-detail-conversion-copy.mjs',
    'scripts/verify-v124-guaranteed-detail-conversion-copy.mjs',
    'reports/v124-guaranteed-detail-conversion-audit.json',
    'reports/v124-remove-candidates.txt',
    'package.json'
  ]
},null,2));

const pkgPath = path.join(root,'package.json');
const pkg = JSON.parse(read(pkgPath));
pkg.scripts = pkg.scripts || {};
pkg.scripts['quality:v124'] = 'node scripts/generate-v124-guaranteed-detail-conversion-copy.mjs';
pkg.scripts['verify:v124'] = 'node scripts/verify-v124-guaranteed-detail-conversion-copy.mjs';
pkg.scripts.verify = 'node scripts/verify-v124-guaranteed-detail-conversion-copy.mjs';
if (!pkg.scripts.build.includes('generate-v124-guaranteed-detail-conversion-copy.mjs')) {
  pkg.scripts.build = `${pkg.scripts.build} && node scripts/generate-v124-guaranteed-detail-conversion-copy.mjs`;
}
write(pkgPath, JSON.stringify(pkg,null,2)+'\n');

console.log('V124 guaranteed detail conversion copy patch generated.');
