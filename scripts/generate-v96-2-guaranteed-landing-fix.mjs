import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const VERSION = 'V96_2_GUARANTEED_LANDING_FIX_ACTIVE';
const stamp = 'static-v96-2-guaranteed-landing-fix-20260526';
const cssPath = 'assets/css/v96-2-guaranteed-landing-fix.css';
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, data) => { fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true }); fs.writeFileSync(path.join(root, p), data); };
const exists = p => fs.existsSync(path.join(root, p));
const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const attr = esc;

const vendors = [
  {
    slug:'sk-holdings', name:'SK 홀딩스', label:'SK HOLDINGS', code:'IRON888', domain:'snk-99.com', href:'https://snk-99.com/', img:'/assets/img/guaranteed/cards/sk-holdings.webp', accent:'#67E8F9',
    tone:'입금 플러스, 첫충·매충, 스포츠·카지노·슬롯·미니게임 이벤트를 구분해 확인할 수 있는 SK 홀딩스 전용 보증업체 안내입니다.',
    bullets:['입금 플러스 3+2부터 200+50 외 30%','스포츠 첫 10% / 매 5%','미니게임 첫 10% / 매 5%','슬롯 첫 20% / 매 10%','VIP 단일 1,000,000원 이상 충전 시 5% 추가','당일 환전 5회 달성 시 룰렛 쿠폰 5장'],
    sections:[['신규 입금 플러스',['3+2, 5+3, 10+5, 20+7, 30+10, 50+20, 100+35, 200+50 외 30%','스포츠·카지노·슬롯·미니게임 입금 플러스 이용 가능']],['첫충전 및 매충전',['스포츠 첫 10% / 매 5%','미니게임 첫 10% / 매 5%','슬롯 첫 20% / 매 10%','VIP 100만 이상 충전 시 5% 추가 지급']],['이벤트 목록',['월요일 입금플러스','주간 페이백','출석체크','출근길·심야 이벤트','지인추천','누적 충전','스포츠 전용 이벤트','복귀 회원 이벤트']]]
  },
  {
    slug:'udt', name:'UDT BET', label:'UDT', code:'SEOA', domain:'udt-01.com', href:'https://udt-01.com/', img:'/assets/img/guaranteed/cards/udt-bet.webp', accent:'#10B981',
    tone:'스포츠 첫충, 슬롯 매충, 파워볼·사다리·동행류 미니게임 목록과 이벤트를 정리한 UDT 전용 보증업체 안내입니다.',
    bullets:['스포츠 첫충 10%','슬롯 매충 20%','보글 파워볼·보글 사다리 지원','EOS5분·PBG 파워볼 지원','동행 파워볼·키노 사다리 지원','실시간 연승·연패 이벤트'],
    sections:[['충전 혜택',['스포츠 첫충 10%','슬롯 매충 20%']],['미니게임 목록',['보글 파워볼','보글 사다리','EOS5분','PBG 파워볼','동행 파워볼','키노 사다리']],['이벤트 목록',['실시간 연승/연패 이벤트','주간 페이백','출석 이벤트','생일 축하 이벤트','지인추천 이벤트']]]
  },
  {
    slug:'queenbee', name:'여왕벌', label:'QUEENBEE', code:'SEOA', domain:'qb-700.com', href:'https://qb-700.com/?code=seoa', img:'/assets/img/guaranteed/cards/queenbee.webp', accent:'#F6C96B',
    tone:'신규 첫 충전, 미니게임 첫 충전, 매충, USDT 충전 보조 혜택을 한 페이지에서 정리한 여왕벌 전용 보증업체 안내입니다.',
    bullets:['신규 가입 첫 충전 50%','신규 가입 첫 미니게임 20%','무한 매충 10%','USDT 충전 시 프리미엄 룰렛 쿠폰','테더 가스비 수수료 지원','테더 카지노·슬롯 콤프 지급'],
    sections:[['신규 회원 이벤트',['첫 충전 50% 조건 확인','첫 미니게임 20% 조건 확인','무한 매충 10% 적용 범위 확인']],['USDT 가입 이벤트',['1일 1회 테더 충전 시 프리미엄 룰렛 쿠폰 지급','당일 페이백·주간 페이백 확인','테더 가스비 수수료 지원 범위 확인','테더 카지노·슬롯 콤프 지급 기준 확인']],['운영 메모',['미니게임 무제재 환경을 강조하는 업체 메모가 포함됨','코드 입력 후 이벤트 적용 여부는 접속 전 공지 기준으로 재확인 권장']]]
  },
  {
    slug:'ddangkong', name:'땅콩 BET', label:'DDANGKONG', code:'DDK888', domain:'ddk-2024.com', href:'https://ddk-2024.com/', img:'/assets/img/guaranteed/cards/ddangkong-bet.webp', accent:'#FB7185',
    tone:'스포츠·미니게임 충전 포인트 선택, 카지노·슬롯 콤프, 룰렛 쿠폰, 지인추천 이벤트를 정리한 땅콩 전용 보증업체 안내입니다.',
    bullets:['스포츠·미니게임 10% 또는 5% 충전 포인트 선택','신규 가입 즉시 카지노 1% 콤프','신규 가입 즉시 슬롯 3% 콤프','충전 금액 비례 룰렛 쿠폰','지인 추천 이벤트 준비','무기명 카지노·슬롯 중심 안내'],
    sections:[['충전 포인트',['스포츠·미니게임에 한해 10% 또는 5% 충전 포인트 선택 가능']],['콤프 설정',['신규가입 즉시 카지노 1% 콤프 설정','신규가입 즉시 슬롯 3% 콤프 설정']],['부가 이벤트',['충전 금액 비례 룰렛 쿠폰 지급','지인 추천 이벤트 준비']]]
  },
  {
    slug:'anybet', name:'ANY BET', label:'ANYBET', code:'SEOA', domain:'any-777.com', href:'https://any-777.com/', img:'/assets/img/guaranteed/cards/anybet.webp', accent:'#A78BFA',
    tone:'원화 가입 혜택과 테더 무기명 가입 혜택, 주간 페이백·롤링·컴프 이벤트를 구분해 정리한 ANY BET 전용 보증업체 안내입니다.',
    bullets:['원화 신규 스포츠 첫 충전 40%','원화 신규 슬롯 첫 충전 20%','테더 첫 코인 충전 50%','코인 입금 수수료 전액 지원','주간 페이백 5%','롤링·컴프·출석 체크 이벤트'],
    sections:[['원화 가입 혜택',['신규 회원 스포츠 첫 충전 시 40% 추가 증정','신규 회원 슬롯 첫 충전 시 20% 추가 증정']],['테더 가입 혜택',['코인 입금 시 수수료 전액 지원','첫 코인 충전 시 50% 추가 증정']],['회원 서비스',['모든 게임에서 충전 보너스 제공','주간 페이백 5% 지급','롤링 및 컴프 이벤트 운영','출석 체크 포함 8개 이벤트 예정']]]
  },
  {
    slug:'zakum', name:'자쿰', label:'ZAKUM', code:'zk888', domain:'zk-777.com', href:'https://zk-777.com/?code=zk888', img:'/assets/img/guaranteed/cards/zakum.webp', accent:'#F6C96B',
    tone:'테더(USDT) 기반 시스템과 신규회원 전용 이벤트, 스포츠·미니게임·슬롯·카지노 혜택을 한 화면에서 확인할 수 있는 자쿰 전용 보증업체 안내입니다.',
    bullets:['신규회원 스포츠 첫충전 40%','신규회원 입플 5+3 · 10+5 · 50+20 · 100+35 · 200+70','이사 지원금 이벤트','신규정착 이벤트','스포츠 첫충 15%','미니게임 첫충 5%','슬롯 첫충 10% · 매충 7%','돌발: 스포츠 20% · 미니게임 10% · 카지노 1% 콤프 · 슬롯 10%'],
    sections:[['주요 이벤트',['페이백 이벤트','연속출석 이벤트','월급날 이벤트','위로금 이벤트','생일 이벤트','간식 & 야식 이벤트','리뷰작성 이벤트','레벨UP 이벤트','지인추천 이벤트','누적 충전금 이벤트','충전왕 이벤트','텔레그램 채널 돌발 쿠폰 이벤트','텔레그램 채널방 입장 이벤트']],['스포츠 전용 이벤트',['신규회원 첫충전 이벤트','스포츠 대박 패키지 이벤트','스포츠 무제한 입플 이벤트','초대박 콤프 이벤트','농구 시리즈 이벤트']],['카지노·슬롯 전용 이벤트',['카지노 1% 콤프 적용','슬롯 프리스핀 이벤트','슬롯왕 이벤트','슬롯 잭팟 이벤트','슬롯 당일 페이백 이벤트','카지노 당일 페이백 이벤트','카지노 연승연패 이벤트','카지노&슬롯 무제한 입플 이벤트']]],
    notes:[['게임 범위','카지노 금지게임 없음','모든 게임은 공지와 상담 답변 기준으로 조건을 확인합니다.'],['주의 항목','시간차·배당 하락·양방 배팅·VPN','불이익 방지를 위해 이용 전 조건과 접속 환경을 먼저 확인합니다.']]
  }
];

const css = `/* V96-2: guaranteed detail landing rewrite + ad image crop rollback. */
:root{--v96-2-bg:#06090f;--v96-2-panel:rgba(10,15,24,.86);--v96-2-panel2:rgba(14,20,32,.74);--v96-2-line:rgba(255,255,255,.12);--v96-2-text:#f8fafc;--v96-2-muted:#a8b3c7;--v96-2-accent:#f6c96b;--v96-2-shell:1120px}
.v96-2-guaranteed-landing-fix .v74-1-image-link{background:linear-gradient(180deg,#fff,#f4f6f8)!important;overflow:hidden!important}
.v96-2-guaranteed-landing-fix .v74-1-image-link img{object-fit:contain!important;object-position:center!important;transform:none!important;filter:none!important;background:#fff!important;width:100%!important;height:100%!important}
.v96-2-guaranteed-landing-fix .v54-visual-card{display:flex;align-items:center;justify-content:center;min-height:0;aspect-ratio:16/9;background:linear-gradient(180deg,#fff,#f4f6f8)!important;overflow:hidden!important}
.v96-2-guaranteed-landing-fix .v54-visual-card img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;background:#fff!important;transform:none!important;filter:none!important}
.v96-2-detail{background:radial-gradient(circle at 20% 0,rgba(246,201,107,.13),transparent 34%),linear-gradient(180deg,#06090f 0%,#0b0f19 55%,#06090f 100%);color:var(--v96-2-text);min-height:100vh;padding-bottom:calc(84px + env(safe-area-inset-bottom))}
.v96-2-detail main{display:block}.v96-2-shell{width:min(var(--v96-2-shell),calc(100% - 36px));margin:0 auto;padding:22px 0 36px}.v96-2-breadcrumb{display:flex;gap:8px;align-items:center;margin:10px 0 14px;color:var(--v96-2-muted);font-size:13px}.v96-2-breadcrumb a{color:#e5edf8;text-decoration:none}.v96-2-hero{display:grid;grid-template-columns:minmax(0,.96fr) minmax(320px,.74fr);gap:16px;align-items:stretch;padding:16px;border:1px solid var(--v96-2-line);border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.035));box-shadow:0 26px 80px rgba(0,0,0,.36)}.v96-2-art{display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;border-radius:18px;background:linear-gradient(180deg,#fff,#f4f6f8);overflow:hidden}.v96-2-art img{width:100%;height:100%;object-fit:contain;object-position:center;background:#fff}.v96-2-copy{border-radius:18px;padding:22px;background:linear-gradient(180deg,rgba(6,9,15,.72),rgba(14,20,32,.78));border:1px solid rgba(255,255,255,.09);display:flex;flex-direction:column;justify-content:center}.v96-2-kicker{display:inline-flex;width:max-content;padding:7px 10px;border-radius:999px;background:rgba(246,201,107,.12);border:1px solid rgba(246,201,107,.22);color:#ffe4a3;font-size:12px;font-weight:800;letter-spacing:.08em}.v96-2-copy h1{margin:13px 0 9px;font-size:clamp(26px,3.2vw,44px);line-height:1.08;letter-spacing:-.045em}.v96-2-copy p{margin:0;color:var(--v96-2-muted);font-size:15px;line-height:1.72}.v96-2-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.v96-2-btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 16px;border-radius:14px;text-decoration:none;border:1px solid var(--v96-2-line);font-weight:900;color:#e5edf8;background:rgba(255,255,255,.06);cursor:pointer}.v96-2-btn--primary{background:linear-gradient(135deg,var(--vendor-accent,var(--v96-2-accent)),#fff1ba);color:#120d06;border:0}.v96-2-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0}.v96-2-fact{min-height:74px;padding:14px;border-radius:18px;border:1px solid var(--v96-2-line);background:var(--v96-2-panel);color:var(--v96-2-text);text-decoration:none;text-align:left}.v96-2-fact span{display:block;color:var(--v96-2-muted);font-size:12px;margin-bottom:6px}.v96-2-fact strong{font-size:18px}.v96-2-section{margin-top:14px;padding:18px;border-radius:22px;border:1px solid var(--v96-2-line);background:var(--v96-2-panel)}.v96-2-section-head span{color:#ffe4a3;font-size:12px;font-weight:900;letter-spacing:.1em}.v96-2-section-head h2{margin:7px 0 14px;font-size:22px;letter-spacing:-.03em}.v96-2-benefits{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0;padding:0}.v96-2-benefits li{min-height:74px;padding:13px;border-radius:16px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.085)}.v96-2-benefits b{display:block;color:#ffe4a3;font-size:12px;margin-bottom:7px}.v96-2-benefits span{font-size:14px;line-height:1.5}.v96-2-info-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}.v96-2-info-card{padding:17px;border-radius:20px;border:1px solid var(--v96-2-line);background:var(--v96-2-panel2)}.v96-2-info-card h2{margin:0 0 10px;font-size:18px}.v96-2-info-card ul{margin:0;padding-left:18px;color:var(--v96-2-muted);line-height:1.75;font-size:14px}.v96-2-table-wrap{overflow:auto;border-radius:16px;border:1px solid var(--v96-2-line)}.v96-2-table{width:100%;border-collapse:collapse;min-width:640px}.v96-2-table th,.v96-2-table td{padding:13px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left}.v96-2-table th{color:#ffe4a3;background:rgba(246,201,107,.07)}.v96-2-table td{color:#d8e1ee}.v96-2-contact{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-top:14px;padding:18px;border-radius:22px;border:1px solid rgba(246,201,107,.2);background:linear-gradient(135deg,rgba(246,201,107,.12),rgba(255,255,255,.035))}.v96-2-contact h2{margin:5px 0;font-size:20px}.v96-2-contact p{margin:0;color:var(--v96-2-muted);line-height:1.7}.v96-2-contact a:not(.v96-2-btn){color:#ffe4a3}.v96-2-neighbors{margin-top:14px}.v96-2-neighbors h2{font-size:16px}.v96-2-neighbor-links{display:flex;flex-wrap:wrap;gap:8px}.v96-2-neighbor-links a{padding:10px 12px;border-radius:999px;border:1px solid var(--v96-2-line);background:rgba(255,255,255,.055);color:#e5edf8;text-decoration:none;font-size:13px;font-weight:800}.v96-2-toast{position:fixed;left:50%;bottom:calc(88px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(16px);opacity:0;pointer-events:none;background:#fff;color:#0f172a;border-radius:999px;padding:11px 15px;font-size:13px;font-weight:900;box-shadow:0 18px 50px rgba(0,0,0,.35);transition:.22s ease;z-index:9999}.v96-2-toast.is-visible{opacity:1;transform:translateX(-50%) translateY(0)}
@media(max-width:980px){.v96-2-hero{grid-template-columns:1fr}.v96-2-facts,.v96-2-benefits,.v96-2-info-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v96-2-contact{display:block}.v96-2-contact .v96-2-btn{margin-top:12px;width:100%}}
@media(max-width:640px){.v96-2-shell{width:calc(100% - 24px);padding-top:14px}.v96-2-hero{padding:10px;border-radius:20px;gap:10px}.v96-2-art{border-radius:15px}.v96-2-copy{padding:16px;border-radius:15px}.v96-2-actions{display:grid;grid-template-columns:1fr}.v96-2-btn{width:100%}.v96-2-facts,.v96-2-benefits,.v96-2-info-grid{grid-template-columns:1fr}.v96-2-fact{min-height:64px}.v96-2-section{padding:15px;border-radius:18px}.v96-2-copy h1{font-size:26px}}
`;

function ensureHeadAsset(html) {
  html = html.replace(/<meta name="v96-2-guaranteed-landing-fix" content="[^"]*">\s*/g, '');
  html = html.replace(/<link rel="stylesheet" href="\/assets\/css\/v96-2-guaranteed-landing-fix\.css[^>]*>\s*/g, '');
  return html.replace('</head>', `  <meta name="v96-2-guaranteed-landing-fix" content="${VERSION}">\n  <link rel="stylesheet" href="/${cssPath}?v=${stamp}" data-v96-2-guaranteed-landing-fix="true">\n</head>`);
}
function markBody(html) {
  return html.replace(/<body([^>]*)>/, (m, attrs) => {
    let next = attrs.replace(/\sdata-v96-2-guaranteed-landing-fix="[^"]*"/g, '');
    if (/class="/.test(next)) next = next.replace(/class="([^"]*)"/, (mm, cls) => `class="${Array.from(new Set(`${cls} v96-2-guaranteed-landing-fix`.trim().split(/\s+/))).join(' ')}"`);
    else next += ' class="v96-2-guaranteed-landing-fix"';
    return `<body${next} data-v96-2-guaranteed-landing-fix="${VERSION}">`;
  });
}
function commonRustHeader(active='guaranteed') {
  const links = [['/','메인','main'],['/blog/','블로그','blog'],['/tools/','도구','tools'],['/guaranteed/','보증업체','guaranteed'],['/consult/','상담','consult']];
  return `<header class="rust-global-header" id="rust-global-header" data-rust-brand-header="true"><div class="rust-header-inner"><a class="rust-brand-lockup" href="/" aria-label="RUST 홈"><span class="rust-brand-mark"><img src="/assets/img/rust/rust-crest-32.png" alt="" width="32" height="32" loading="eager" decoding="async"></span><span class="rust-brand-text"><b>RUST</b><small>by 88ST</small></span></a><nav class="rust-desktop-nav" aria-label="RUST 주요 메뉴" data-rust-nav="desktop">${links.map(([href,label,key])=>`<a href="${href}"${key===active?' aria-current="page"':''}>${label}</a>`).join('')}</nav><button class="rust-menu-toggle" type="button" aria-label="모바일 메뉴 열기" data-rust-menu-toggle="true"><span></span><span></span></button></div><nav class="rust-mobile-menu" aria-label="RUST 모바일 메뉴" data-rust-nav="mobile-menu">${links.map(([href,label,key])=>`<a href="${href}"${key===active?' aria-current="page"':''}>${label}</a>`).join('')}</nav></header>`;
}
function bottomNav(active='guaranteed') {
  const links = [['/','⌂','메인','main'],['/blog/','▤','블로그','blog'],['/tools/','◇','도구','tools'],['/guaranteed/','◆','보증','guaranteed'],['/consult/','✦','상담','consult']];
  return `<nav class="rust-bottom-nav" aria-label="RUST 모바일 하단 메뉴" data-rust-nav="bottom">${links.map(([href,icon,label,key])=>`<a href="${href}"${key===active?' aria-current="page"':''}><span>${icon}</span>${label}</a>`).join('')}</nav>`;
}
function head(v) {
  const title = `${v.name} 보증업체 혜택 안내`;
  const desc = `${v.name} 공식 도메인, 가입코드 ${v.code}, 주요 이벤트와 조건 확인표를 RUST 통일 디자인으로 정리했습니다.`;
  const url = `https://88st.cloud/guaranteed/${v.slug}/`;
  const schema = {'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':'https://88st.cloud/#organization','name':'RUST by 88ST','url':'https://88st.cloud/','logo':'https://88st.cloud/assets/img/rust/rust-crest-192.png'},{'@type':'WebPage','@id':`${url}#webpage`,'url':url,'name':title,'description':desc,'isPartOf':{'@id':'https://88st.cloud/#website'},'inLanguage':'ko-KR'},{'@type':'BreadcrumbList','@id':`${url}#breadcrumb`,'itemListElement':[{'@type':'ListItem','position':1,'name':'홈','item':'https://88st.cloud/'},{'@type':'ListItem','position':2,'name':'보증업체','item':'https://88st.cloud/guaranteed/'},{'@type':'ListItem','position':3,'name':v.name,'item':url}]}]};
  return `<!DOCTYPE html><html lang="ko" data-v96-2-guaranteed="active"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${esc(title)} | 88ST.Cloud</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#06090f"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="RUST by 88ST"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://88st.cloud${v.img}"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/assets/img/rust/rust-crest-32.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="preload" as="image" href="${v.img}"><link rel="stylesheet" href="/assets/css/v76.rust-brand-system.css?v=static-v76-rust-brand-system-20260524" data-v76-rust="true"><link rel="stylesheet" href="/assets/css/v77.rust-logo-assets.css?v=static-v77-rust-logo-assets-20260524" data-v77-rust-logo="true"><link rel="stylesheet" href="/assets/css/v92-vendor-conversion-pass.css?v=static-v92-vendor-conversion-pass-20260526" data-v92-vendor-conversion="true"><meta name="v96-2-guaranteed-landing-fix" content="${VERSION}"><link rel="stylesheet" href="/${cssPath}?v=${stamp}" data-v96-2-guaranteed-landing-fix="true"><script type="application/ld+json" data-rust-schema="v96-2">${JSON.stringify(schema)}</script></head>`;
}
function rowHtml(rows) { return rows.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join(''); }
function renderDetail(v) {
  const others = vendors.filter(x => x.slug !== v.slug).map(x => `<a href="/guaranteed/${x.slug}/">${esc(x.name)}</a>`).join('');
  const benefits = v.bullets.map((b, i) => `<li><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(b)}</span></li>`).join('');
  const sections = v.sections.map(([title, items]) => `<article class="v96-2-info-card"><h2>${esc(title)}</h2><ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul></article>`).join('');
  const defaultRows = [['공식 도메인', v.domain, '카드와 상세 랜딩에 표기된 도메인 기준으로 확인합니다.'], ['가입코드', v.code, '바로가기 클릭 시 코드가 먼저 복사되도록 구성했습니다.'], ['이벤트 범위', '충전·페이백·콤프·쿠폰 등', '게임 카테고리, 충전 수단, 회원 등급, 회차 기준에 따라 달라질 수 있습니다.'], ['조건 확인', '롤링·제외 게임·최대 한도', '혜택 적용 전 조건표와 제외 항목을 먼저 비교합니다.']];
  const rows = rowHtml([...(defaultRows.slice(0,2)), ...(v.notes || defaultRows.slice(2))]);
  const botUrl = `https://t.me/TRS999_bot?start=${v.slug}`;
  return `${head(v)}<body class="rust-brand-system v96-2-detail v96-2-guaranteed-landing-fix" data-v96-2-guaranteed-landing-fix="${VERSION}" style="--vendor-accent:${v.accent}">${commonRustHeader('guaranteed')}<main id="mainContent"><section class="v96-2-shell"><nav class="v96-2-breadcrumb" aria-label="현재 위치"><a href="/guaranteed/">보증업체</a><span>/</span><strong>${esc(v.name)}</strong></nav><section class="v96-2-hero"><div class="v96-2-art"><img src="${v.img}" alt="${attr(v.name)} 보증업체 카드 이미지" width="960" height="540" loading="eager" decoding="async" fetchpriority="high" data-v92-detail-image="${attr(v.slug)}"></div><div class="v96-2-copy"><span class="v96-2-kicker">${esc(v.label)} GUARANTEED</span><h1>${esc(v.name)} 보증업체 혜택 안내</h1><p>${esc(v.tone)}</p><div class="v96-2-actions"><a class="v96-2-btn" href="/guaranteed/">전체 카드 보기</a><button type="button" class="v96-2-btn v96-2-btn--primary" data-v92-go="true" data-ga4-event="vendor_outbound_click" data-code="${attr(v.code)}" data-href="${attr(v.href)}" data-vendor="${attr(v.name)}" aria-label="${attr(v.name)} 가입코드 ${attr(v.code)} 복사 후 공식 도메인 바로가기">공식 도메인 바로가기</button></div></div></section><section class="v96-2-facts" aria-label="${attr(v.name)} 핵심 정보"><a class="v96-2-fact" href="${attr(v.href)}" target="_blank" rel="nofollow sponsored noopener noreferrer"><span>공식 도메인</span><strong>${esc(v.domain)}</strong></a><button type="button" class="v96-2-fact" data-v92-copy="true" data-ga4-event="vendor_copy_code" data-code="${attr(v.code)}" data-vendor="${attr(v.name)}" aria-label="${attr(v.name)} 가입코드 복사"><span>가입코드</span><strong>${esc(v.code)}</strong></button><div class="v96-2-fact"><span>확인 기준</span><strong>RUST 통일</strong></div></section><section class="v96-2-section"><div class="v96-2-section-head"><span>BENEFIT SUMMARY</span><h2>${esc(v.name)} 핵심 혜택 요약</h2></div><ul class="v96-2-benefits">${benefits}</ul></section><section class="v96-2-info-grid">${sections}</section><section class="v96-2-section"><div class="v96-2-section-head"><span>CHECK TABLE</span><h2>조건 확인표</h2></div><div class="v96-2-table-wrap"><table class="v96-2-table"><thead><tr><th>구분</th><th>확인 항목</th><th>운영 메모</th></tr></thead><tbody>${rows}</tbody></table></div></section><section class="v96-2-contact"><div><span class="v96-2-kicker">COMMON CENTER</span><h2>공통 확인 채널</h2><p>코드 적용, 이벤트 조건, 공식주소 변경 여부는 최신 업체 공지와 상담 답변 기준으로 확인합니다. 공통 연결 기준은 <a href="${botUrl}" target="_blank" rel="nofollow noopener noreferrer">@TRS999_bot</a> 입니다.</p></div><a class="v96-2-btn v96-2-btn--primary" href="${botUrl}" target="_blank" rel="nofollow noopener noreferrer" data-ga4-event="telegram_open">상담센터 연결</a></section><section class="v96-2-neighbors"><h2>다른 보증업체 보기</h2><div class="v96-2-neighbor-links">${others}</div></section></section></main>${bottomNav('guaranteed')}<div class="v96-2-toast" id="v96-2-toast" role="status" aria-live="polite">가입코드가 복사되었습니다</div><script src="/assets/js/v76.rust-brand-system.js?v=static-v76-rust-brand-system-20260524" defer data-v76-rust="true"></script><script src="/assets/js/v77.rust-logo-assets.js?v=static-v77-rust-logo-assets-20260524" defer data-v77-rust-logo="true"></script><script src="/assets/js/v92-vendor-conversion-pass.js?v=static-v92-vendor-conversion-pass-20260526" defer data-v92-vendor-conversion="true"></script><script src="/assets/js/v89.ga4-event-depth.js?v=static-v89-ga4-event-depth-20260526" defer data-v89-ga4-depth="true"></script><script src="/assets/js/v96-2-guaranteed-landing-fix.js?v=${stamp}" defer data-v96-2-guaranteed-landing-fix="true"></script></body></html>`;
}

const js = `(() => {\n  const toast = document.getElementById('v96-2-toast');\n  const showToast = (msg = '가입코드가 복사되었습니다') => {\n    if (!toast) return;\n    toast.textContent = msg;\n    toast.classList.add('is-visible');\n    clearTimeout(window.__v962ToastTimer);\n    window.__v962ToastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1600);\n  };\n  const copyCode = async (code) => {\n    if (!code) return false;\n    try { await navigator.clipboard.writeText(code); return true; }\n    catch (err) {\n      const input = document.createElement('input');\n      input.value = code; document.body.appendChild(input); input.select();\n      let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}\n      input.remove(); return ok;\n    }\n  };\n  document.addEventListener('click', async (event) => {\n    const copy = event.target.closest('[data-v92-copy]');\n    if (copy) {\n      event.preventDefault();\n      const ok = await copyCode(copy.dataset.code || '');\n      showToast(ok ? '가입코드가 복사되었습니다' : '코드를 직접 확인해 주세요');\n      window.gtag?.('event', copy.dataset.ga4Event || 'vendor_copy_code', { vendor: copy.dataset.vendor || '', code: copy.dataset.code || '' });\n      return;\n    }\n    const go = event.target.closest('[data-v92-go]');\n    if (go) {\n      event.preventDefault();\n      await copyCode(go.dataset.code || '');\n      showToast('가입코드 복사 후 이동합니다');\n      window.gtag?.('event', go.dataset.ga4Event || 'vendor_outbound_click', { vendor: go.dataset.vendor || '', code: go.dataset.code || '' });\n      const href = go.dataset.href;\n      if (href) setTimeout(() => window.open(href, '_blank', 'noopener,noreferrer'), 180);\n    }\n  }, { passive:false });\n})();\n`;

function updatePackageScripts() {
  const pkg = JSON.parse(read('package.json'));
  const gen = 'node scripts/generate-v96-2-guaranteed-landing-fix.mjs';
  const parts = String(pkg.scripts.build || '').split('&&').map(x => x.trim()).filter(Boolean).filter(x => x !== gen);
  parts.push(gen);
  pkg.scripts.build = parts.join(' && ');
  pkg.scripts.verify = 'node scripts/verify-v96-2-guaranteed-landing-fix.mjs';
  pkg.scripts['quality:v96-2'] = gen;
  pkg.scripts['verify:v96-2'] = 'node scripts/verify-v96-2-guaranteed-landing-fix.mjs';
  write('package.json', JSON.stringify(pkg, null, 2) + '\n');
}

function main() {
  write(cssPath, css);
  write('assets/js/v96-2-guaranteed-landing-fix.js', js);
  if (exists('guaranteed/index.html')) write('guaranteed/index.html', markBody(ensureHeadAsset(read('guaranteed/index.html'))));
  for (const v of vendors) write(`guaranteed/${v.slug}/index.html`, renderDetail(v));
  write('assets/data/v96-2-guaranteed-landing-fix.json', JSON.stringify({ version: VERSION, generatedAt: new Date().toISOString(), pages: vendors.map(v => `/guaranteed/${v.slug}/`), changes: ['rewrote all guaranteed vendor detail pages with one RUST header', 'removed duplicate legacy headers and V54 visible marker', 'restored ad artwork object-fit to contain instead of cover crop', 'kept copy-code/outbound GA4 hooks'] }, null, 2));
  updatePackageScripts();
  console.log(`[V96-2] guaranteed landing fix applied: ${vendors.length} detail pages`);
}
main();
