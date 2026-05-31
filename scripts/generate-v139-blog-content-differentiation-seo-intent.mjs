import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERSION = 'V139_BLOG_CONTENT_DIFFERENTIATION_SEO_INTENT';
const CSS_HREF = '/assets/css/v139-blog-content-differentiation.css?v=20260531-v139-blog-quality';
const CSS_LINK = `<link rel="stylesheet" href="${CSS_HREF}" data-v139-blog-quality="true">`;
const HTML_FLAG = 'data-v139-blog-quality="active"';
const changed = new Set([
  'scripts/generate-v139-blog-content-differentiation-seo-intent.mjs',
  'scripts/verify-v139-blog-content-differentiation-seo-intent.mjs',
  'scripts/build-v139-cloudflare-pages-safe.mjs'
]);

function p(...parts){return path.join(ROOT,...parts)}
function rel(fp){return path.relative(ROOT,fp).replace(/\\/g,'/')}
function read(f){return fs.readFileSync(f,'utf8')}
function write(f,s){fs.mkdirSync(path.dirname(f),{recursive:true}); fs.writeFileSync(f,s)}
function walk(dir,out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const fp=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(!['node_modules','.git'].includes(ent.name)) walk(fp,out);
    } else if(ent.isFile() && ent.name.endsWith('.html')) out.push(fp);
  }
  return out;
}
function stripTags(s){return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
function decodeHtml(s){return String(s||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'")}
function escapeAttr(s){return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function cleanTitle(html,r){
  const h1=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const t=h1 || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || r;
  return decodeHtml(stripTags(t)).replace(/\s*\|\s*RUST\s*블로그\s*$/i,'').replace(/\s*\|\s*88ST\.Cloud\s*$/i,'').trim();
}
function canonicalPath(html,r){
  const can=html.match(/<link\b[^>]+rel=["']canonical["'][^>]+href=["']https?:\/\/88st\.cloud([^"']+)["'][^>]*>/i)?.[1];
  if(can) return can;
  if(r.endsWith('/index.html')) return '/' + r.replace(/index\.html$/,'');
  return '/' + r;
}
function categoryFor(r,title){
  const t=`${r} ${title}`.toLowerCase();
  if(t.includes('sports-toto') || /스포츠|프로토|승부식|토토|축구|야구|농구|배구|kbo|kbl|nba|핸디캡|오버언더|언더오버|배당|환수율|오버라운드|kelly|켈리/i.test(title)) return 'sports';
  if(t.includes('minigame') || /파워볼|사다리|스피드키노|키노|엔트리|동행|로투스|미니게임|홀짝|언오버/i.test(title)) return 'minigame';
  if(t.includes('bet365') || /bet365|가상게임|가상축구|가상농구|가상경마|virtual/i.test(title)) return 'virtual';
  if(t.includes('online-slot') || /슬롯|rtp|프라그마틱 슬롯|노리밋|보너스 구매|프리스핀|변동성/i.test(title)) return 'slot';
  if(t.includes('online-casino') || /바카라|블랙잭|룰렛|라이브카지노|카지노|에볼루션|프라그마틱 라이브/i.test(title)) return 'casino';
  if(t.includes('affiliate') || /총판|제휴|정산|가입코드 관리|코드 관리/i.test(title)) return 'affiliate';
  if(/첫충|매충|페이백|보너스|롤링|실수령|최대출금|한도|ev|계산|정산|조건/i.test(title)) return 'condition';
  if(/도메인|주소|dns|ssl|tls|whois|rdap|asn|ip|피싱|리다이렉트|먹튀|검증|공식주소|공지|고객센터|후기|제보|증거|캡처/i.test(title) || /domain|address|muktu|search-guides|official|notice|evidence|community|customer/.test(t)) return 'verification';
  if(/여왕벌|SK 홀딩스|ANY BET|UDT|땅콩|자쿰|F-1|보증업체|가입코드/i.test(title)) return 'vendor';
  return 'general';
}
const cats={
  sports:{
    h1:'1. 배당을 확률로 환산하는 기준',
    p1:(title)=>`${title}는 경기 예측글이 아니라 배당을 확률 단위로 바꿔 마진과 조건을 분리하는 글이다. 먼저 암시확률을 계산하고, 그 다음 오버라운드와 환수율을 확인해야 배당판 안에 들어간 비용을 볼 수 있다.`,
    h2:'2. 배당판·정산 기준·약관을 분리해서 읽기',
    p2:'스포츠 배당은 라인업 뉴스, 취소 기준, 연장 포함 여부, 핸디캡 푸시, 마감 배당 흐름이 함께 움직인다. 숫자가 좋아 보여도 정산 기준이 다르면 같은 EV로 볼 수 없기 때문에 화면 배당과 약관 문장을 따로 기록해야 한다.',
    matrix:'스포츠토토 글의 결론은 어느 팀을 찍느냐가 아니라 배당판이 합리적인지, 조건이 숫자로 환산 가능한지, 정산 예외가 명확한지 확인하는 것이다.',
    focus:'스포츠 배당은 EV, Kelly, 환수율, 핸디캡 조건을 서로 다른 검증 축으로 나눠야 반복 문장이 줄어든다.',
    keywords:['스포츠토토','토토사이트추천','프로토','스포츠 배당분석','암시확률','오버라운드','환수율','EV 계산','Kelly 자금관리','핸디캡','오버언더','마감배당','롤링 조건']
  },
  minigame:{
    h1:'1. 회차 독립성과 자본 한도를 먼저 보는 기준',
    p1:(title)=>`${title}는 다음 결과를 예측하기 위한 글이 아니라 짧은 회차형 게임에서 반복 참여가 자본에 주는 부담을 분리하는 글이다. 파워볼·사다리·스피드키노는 결과 간격이 짧아 패턴처럼 보이지만, 계산의 출발점은 독립시행과 지급률이다.`,
    h2:'2. 회차 결과·정산 시간·무효 기준 대조',
    p2:'미니게임은 회차 ID, 마감 시간, 공식 결과표, 정산 지연 기준이 맞아야 기록 의미가 생긴다. 연속 결과를 근거로 진입 신호를 만들기보다 손실한도, 최대 회차 수, 이벤트 인정 범위를 먼저 제한해야 한다.',
    matrix:'미니게임 글의 핵심은 패턴을 찾는 것이 아니라 회차 기록, 지급률, 자본 소모 속도, 정산 기준을 같은 표에서 비교하는 것이다.',
    focus:'미니게임 공식 글은 독립시행, 파산확률, 회차 캡처, 무효 처리 기준을 분리해 읽어야 한다.',
    keywords:['미니게임','파워볼','사다리게임','동행파워볼','동행스피드키노','엔트리게임','회차 결과','독립시행','마틴게일 파산확률','미니게임 롤링','정산 지연','결과 캡처']
  },
  virtual:{
    h1:'1. 선결정 회차와 정산 기준을 분리하는 기준',
    p1:(title)=>`${title}는 실제 스포츠 분석과 다르게 제공사 회차, 결과 고시, 배당 표시, 정산 시간이 하나의 단위로 움직이는지 확인하는 글이다. 가상게임은 회차 ID가 기록의 기준이므로 배당보다 먼저 회차 식별값과 결과 이력을 확인해야 한다.`,
    h2:'2. 제공사 표기·회차 ID·결과표 일치성 확인',
    p2:'BET365 가상게임류는 하이라이트 화면, 결과 데이터, 정산 시간이 서로 맞아야 분쟁 가능성이 낮아진다. 같은 종목명이라도 가상축구, 가상경마, 가상농구는 회차 주기와 인정 조건이 다르기 때문에 별도 기준으로 읽어야 한다.',
    matrix:'가상게임 글은 반복 주기를 찾는 글이 아니라 회차 식별, 제공사 표기, 결과 정산의 일치성을 확인하는 기록 문서에 가깝다.',
    focus:'BET365 가상게임 글은 실제 경기 예측과 분리하고 회차 ID·결과표·정산 조건 중심으로 차별화해야 한다.',
    keywords:['BET365 가상게임','가상축구','가상농구','가상경마','회차 ID','결과 고시','가상게임 정산','배당 주기','제공사 표기','게임사 확인','이벤트 인정 범위']
  },
  slot:{
    h1:'1. RTP와 변동성을 분리해서 읽는 기준',
    p1:(title)=>`${title}는 슬롯 결과를 맞히는 글이 아니라 RTP, 변동성, 보너스 구매, 프리스핀, 롤링 인정률을 서로 다른 조건으로 나누는 글이다. RTP는 장기 평균이고 단기 회수율 보장이 아니므로 손실한도와 이벤트 조건을 함께 봐야 한다.`,
    h2:'2. 게임사·지급표·보너스 조건 일치성 확인',
    p2:'슬롯은 게임사명, 지급표, 보너스 구매 가능 여부, 프리스핀 조건, 최대출금 제한이 실제 실수령을 바꾼다. 프라그마틱·노리밋 등 제공사 표기가 같아도 이벤트 인정률이 다르면 같은 조건으로 볼 수 없다.',
    matrix:'슬롯 글은 RTP 숫자 하나로 판단하지 않고 변동성, 이벤트 조건, 손실한도, 제공사 일치성을 같이 기록해야 한다.',
    focus:'슬롯 공식 글은 RTP·변동성·보너스 구매·롤링 인정률을 분리해야 중복 문장보다 실사용 가치가 커진다.',
    keywords:['온라인슬롯','슬롯 RTP','슬롯 변동성','프라그마틱 슬롯','노리밋 슬롯','보너스 구매','프리스핀','슬롯 이벤트','롤링 인정률','손실한도','지급표']
  },
  casino:{
    h1:'1. 룰·지급표·기여율을 먼저 분해하는 기준',
    p1:(title)=>`${title}는 카지노 게임을 단순 추천으로 보는 글이 아니라 바카라·블랙잭·룰렛·라이브카지노의 룰, 지급표, 기여율, 정산 예외를 분리하는 글이다. 같은 롤링 배수라도 게임별 인정률이 다르면 실제 부담은 달라진다.`,
    h2:'2. 라이브 테이블·제공사·정산 예외 확인',
    p2:'온라인카지노 글은 게임사 로고보다 테이블 한도, 사이드베팅 인정 여부, 지연 정산, 결과 캡처 항목이 중요하다. 에볼루션과 프라그마틱처럼 공급사가 달라도 운영 약관이 다르면 실사용 조건은 다시 계산해야 한다.',
    matrix:'카지노 글은 승부 결과보다 실수령, 인정률, 테이블 제한, 정산 예외를 숫자화할 수 있는지 확인하는 문서다.',
    focus:'카지노 공식 글은 하우스엣지, 사이드베팅, 롤링 기여율, 정산 예외를 구분해야 한다.',
    keywords:['온라인카지노','카지노입플사이트추천','바카라','블랙잭','룰렛','에볼루션 카지노','프라그마틱 카지노','라이브카지노','하우스엣지','카지노 롤링','실수령 계산','정산 예외']
  },
  condition:{
    h1:'1. 혜택률을 실수령 기준으로 환산하는 기준',
    p1:(title)=>`${title}는 이벤트 문구의 퍼센트보다 실제 남는 금액을 계산하는 글이다. 입금액, 보너스, 요구 롤링, 인정률, 최대출금, 제외 게임을 같은 단위로 바꿔야 혜택률과 실수령의 차이를 볼 수 있다.`,
    h2:'2. 롤링·인정률·최대출금 조항 대조',
    p2:'첫충, 매충, 페이백, 보너스 EV는 조건표를 숫자로 바꿀 때 의미가 생긴다. 상담 문구가 좋아 보여도 최대출금 제한이나 제외 게임이 강하면 기대값은 낮아질 수 있으므로 계산 순서를 고정해야 한다.',
    matrix:'조건 글은 보너스율을 홍보하는 글이 아니라 롤링 부담과 실수령 가능성을 같은 표에서 비교하는 글이다.',
    focus:'보너스 계산 글은 혜택률, 롤링 배수, 인정률, 최대출금, 제외 게임을 분리해야 한다.',
    keywords:['EV 계산법','롤링 계산','보너스 계산','실수령 계산','첫충','매충','페이백','최대출금','인정률','이벤트 조건','정산 예외','입플사이트추천']
  },
  verification:{
    h1:'1. 공개 신호를 시간순으로 대조하는 기준',
    p1:(title)=>`${title}는 후기 감정평가보다 도메인, DNS, SSL, 리다이렉트, 공지 채널, 약관 변경 이력을 시간순으로 맞춰보는 글이다. 단일 지표가 아니라 여러 공개 신호가 서로 충돌하지 않는지 확인하는 것이 핵심이다.`,
    h2:'2. 주소·인증서·공지 채널 불일치 확인',
    p2:'먹튀검증·공식주소 글은 오래된 도메인이라는 이유만으로 안전을 단정하지 않는다. 최종 URL, 인증서 SAN, 공지 채널, 가입코드 안내, 상담 계정이 같은 운영 흐름을 가리키는지 확인해야 한다.',
    matrix:'검증 글의 결론은 안전 단정이 아니라 자료 충분성이다. 공개 신호가 부족하면 부족하다고 남기는 편이 더 정확하다.',
    focus:'검증 글은 도메인·DNS·SSL·공지·상담 채널을 분리해야 중복 안내가 줄어든다.',
    keywords:['먹튀검증','공식주소','도메인 확인','DNS 확인','SSL 인증서','WHOIS','RDAP','리다이렉트 점검','피싱 주소','공지 채널','보증업체 확인','가입코드 확인']
  },
  affiliate:{
    h1:'1. 코드·유입·정산 기준을 분리하는 기준',
    p1:(title)=>`${title}는 제휴 구조를 과장해서 설명하는 글이 아니라 가입코드, 상담 기록, 유입 경로, 정산 기준을 분리하는 글이다. 코드가 바뀌면 혜택 적용과 기록 기준이 같이 바뀔 수 있으므로 증거를 남기는 과정이 중요하다.`,
    h2:'2. 상담 기록·정산표·코드 매칭 확인',
    p2:'총판·제휴 글은 업체명보다 코드 매칭, 정산 기준, 지급 주기, 예외 조항을 확인해야 한다. 같은 코드라도 도메인과 상담 채널이 다르면 다른 조건으로 처리될 수 있다.',
    matrix:'제휴 글은 모집 문구보다 코드·상담·정산 기록이 일치하는지 확인하는 운영형 문서다.',
    focus:'제휴/총판 글은 코드 관리와 정산 증거 중심으로 차별화해야 한다.',
    keywords:['총판 정보','제휴문의','가입코드 관리','코드 매칭','정산 기준','상담 기록','전환 추적','보증업체 제휴','파트너 운영']
  },
  vendor:{
    h1:'1. 업체명·가입코드·공식주소를 같은 기준으로 확인',
    p1:(title)=>`${title}는 업체 홍보 문구를 늘리는 글이 아니라 업체명, 가입코드, 공식주소, 이벤트 조건, 상담 채널이 서로 맞는지 확인하는 글이다. 보증업체 글은 코드와 조건이 일치해야 실사용 가치가 생긴다.`,
    h2:'2. 카드 정보·상세 조건·상담 채널 대조',
    p2:'보증업체 상세는 카드 이미지나 이벤트 문구보다 도메인 이동, 코드 복사, 조건표, 공식 상담 응답이 같은 기준으로 유지되는지 보는 것이 중요하다.',
    matrix:'업체 글은 과한 추천보다 주소·코드·조건·상담 채널의 일치성을 확인하는 용도로 정리하는 편이 안전하다.',
    focus:'업체 글은 광고성 표현보다 코드와 조건의 일치성 중심으로 정리해야 한다.',
    keywords:['보증업체','가입코드','공식주소','이벤트 조건','상담센터','도메인 바로가기','코드 확인','실사용 안내','88ST 보증업체']
  },
  general:{
    h1:'1. 검색 의도와 실제 확인 순서를 분리하는 기준',
    p1:(title)=>`${title}는 검색어를 반복하는 글이 아니라 사용자가 실제로 확인해야 할 순서를 정리하는 글이다. 주소, 코드, 조건, 상담, 정산 기준을 나누면 같은 주제라도 판단 포인트가 선명해진다.`,
    h2:'2. 조건표·공식 안내·상담 기록 대조',
    p2:'일반 안내 글도 광고 문구보다 사용자가 직접 재확인할 수 있는 항목을 우선해야 한다. 확인 가능한 자료가 부족하면 단정하지 않고 보류하는 것이 더 안전하다.',
    matrix:'일반 글은 검색 유입용 문장보다 실제 확인 루트와 기록 기준을 제공할 때 가치가 높다.',
    focus:'일반 글은 주소·조건·상담 기록을 중심으로 반복감을 줄여야 한다.',
    keywords:['토토사이트추천','입플사이트추천','실사용 가이드','조건 확인','공식주소','가입코드','보증업체','검색가이드','상담 전 확인']
  }
};
function pack(category){return cats[category] || cats.general}
function titleTerms(title){return title.split(/[\s·:|/()\[\],]+/).map(x=>x.trim()).filter(x=>x.length>=2 && x.length<=18).slice(0,8)}
function keywordsFor(category,title){
  const base=['RUST','러스트','88st.cloud','88ST','보증업체','가입코드','공식주소','검색가이드','실사용 가이드'];
  const out=[];
  for(const x of [title,...titleTerms(title),...pack(category).keywords,...base]){ const v=String(x||'').replace(/\s+/g,' ').trim(); if(v && !out.includes(v)) out.push(v); }
  return out.slice(0,30).join(', ');
}
function descFor(category,title){
  const desc={
    sports:`${title}를 배당 마진, 환수율, EV, 정산 기준으로 분리해 최신화했습니다. RUST 기준으로 공식주소, 가입코드, 조건표, 상담 흐름까지 실사용 순서로 정리합니다.`,
    minigame:`${title}를 회차 독립성, 지급률, 손실한도, 정산 기준 중심으로 보강했습니다. RUST 기준으로 패턴 착시보다 확인 가능한 기록 순서를 우선합니다.`,
    virtual:`${title}를 회차 ID, 제공사 표기, 결과 고시, 정산 시간 기준으로 최신화했습니다. 가상게임과 실제 스포츠 분석을 분리해 확인합니다.`,
    slot:`${title}를 RTP, 변동성, 보너스 구매, 롤링 인정률 중심으로 차별화했습니다. 단기 회수 보장보다 조건표와 손실한도 확인을 우선합니다.`,
    casino:`${title}를 게임 룰, 지급표, 롤링 기여율, 정산 예외 기준으로 보강했습니다. 카지노 입플과 실수령 계산을 분리해 확인합니다.`,
    condition:`${title}를 혜택률보다 실수령 EV, 롤링, 인정률, 최대출금 기준으로 다시 정리했습니다. 조건표를 숫자로 바꿔 비교합니다.`,
    verification:`${title}를 도메인, DNS, SSL, 리다이렉트, 공지 채널 일치성 기준으로 최신화했습니다. 공개 신호를 시간순으로 대조합니다.`,
    affiliate:`${title}를 가입코드, 상담 기록, 정산 기준, 유입 경로 중심으로 보강했습니다. 코드 매칭과 증거 기록을 우선합니다.`,
    vendor:`${title}를 업체명, 가입코드, 공식주소, 이벤트 조건 일치성 기준으로 보강했습니다. 보증업체 카드와 상세 조건을 함께 확인합니다.`,
    general:`${title}를 검색어 반복보다 실제 확인 순서 중심으로 최신화했습니다. 주소, 코드, 조건, 상담 기록을 분리해 정리합니다.`
  }[category] || '';
  return desc.slice(0,170);
}
function ensureFlag(html){ if(html.includes(HTML_FLAG)) return html; return html.replace(/<html\b(?![^>]*data-v139-blog-quality=)/i, `<html ${HTML_FLAG}`); }
function ensureCss(html){
  if(html.includes('v139-blog-content-differentiation.css')) return html;
  if(html.includes('v138-6-blog-content-seo-refresh.css')) return html.replace(/(<link\b[^>]+v138-6-blog-content-seo-refresh\.css[^>]*>)/i, `$1\n  ${CSS_LINK}`);
  return html.replace(/<\/head>/i, `  ${CSS_LINK}\n</head>`);
}
function setMeta(html, name, content){
  const esc=escapeAttr(content);
  const re=new RegExp(`<meta\\b([^>]*name=["']${name}["'][^>]*)>`, 'i');
  if(re.test(html)) return html.replace(re, m=>/\bcontent=["'][^"']*["']/i.test(m) ? m.replace(/\bcontent=["'][^"']*["']/i, `content="${esc}"`) : m.replace(/>$/, ` content="${esc}">`));
  return html.replace(/(<meta\b[^>]+name=["']viewport["'][^>]*>)/i, `$1<meta name="${name}" content="${esc}">`);
}
function setProp(html, prop, content){
  const esc=escapeAttr(content);
  const re=new RegExp(`<meta\\b([^>]*property=["']${prop.replace(':','\\:')}["'][^>]*)>`, 'i');
  if(re.test(html)) return html.replace(re, m=>/\bcontent=["'][^"']*["']/i.test(m) ? m.replace(/\bcontent=["'][^"']*["']/i, `content="${esc}"`) : m.replace(/>$/, ` content="${esc}">`));
  return html.replace(/<\/head>/i, `  <meta property="${prop}" content="${esc}">\n</head>`);
}
function updateDescriptions(html,desc){html=setMeta(html,'description',desc); html=setProp(html,'og:description',desc); html=setMeta(html,'twitter:description',desc); return html;}
function fixGuaranteeText(html){
  // Only change the visible nav label for guaranteed links, not free text.
  html = html.replace(/(<a\b[^>]*href=["']\/guaranteed\/?["'][^>]*>\s*(?:<span>[^<]*<\/span>\s*)?)보증(\s*<\/a>)/g, '$1보증업체$2');
  html = html.replace(/(<a\b[^>]*href=["']\/guaranteed\/?["'][^>]*>\s*(?:<span>[^<]*<\/span>\s*)?)보증업체업체(\s*<\/a>)/g, '$1보증업체$2');
  return html;
}
function normalizeNumbering(html){return html.replace(/<h2>\s*9\.\s*운영 관점의 최종 요약\s*<\/h2>/g,'<h2>8. 운영 관점의 최종 요약</h2>')}
function replaceGenericArticle(html,category,title){
  const c=pack(category);
  html = html.replace(/<h2>1\.\s*개요 및 기술적·수학적 메커니즘 분석<\/h2>\s*<p>[\s\S]*?<\/p>/i, `<h2>${c.h1}</h2><p>${escapeAttr(c.p1(title))}</p>`);
  html = html.replace(/<h2>2\.\s*시스템 내부 구조와 변조 리스크 검증<\/h2>\s*<p>[\s\S]*?<\/p>/i, `<h2>${c.h2}</h2><p>${escapeAttr(c.p2)}</p>`);
  html = html.replace(/<h2>5\.\s*판독 매트릭스와 리스크 관리 프로토콜<\/h2>\s*<p>[\s\S]*?<\/p>/i, `<h2>5. 글별 판독 포인트와 리스크 관리</h2><p>${escapeAttr(c.matrix)}</p>`);
  return html;
}
function updateV138Block(html,category,title,r){
  const c=pack(category);
  const id = r.replace(/^blog\//,'').replace(/\/index\.html$|\.html$/,'').replace(/[^a-z0-9가-힣_-]+/gi,'-').slice(0,80);
  const block = `<div class="v139-blog-diff-note" data-v139-blog-diff="${category}" id="v139-${id}"><h2>V139 글별 차별화: ${escapeAttr(c.focus.split('은 ')[0] || '핵심')}</h2><p>${escapeAttr(c.focus)}</p><p>${escapeAttr(c.p2)}</p></div>`;
  if(html.includes('data-v139-blog-diff=')) return html;
  if(/<div class="v138-6-blog-refresh[\s\S]*?data-v138-6-blog-refresh="(?:formula|early)"[\s\S]*?<\/div>/i.test(html)){
    return html.replace(/(<div class="v138-6-blog-refresh[\s\S]*?data-v138-6-blog-refresh="(?:formula|early)"[\s\S]*?<\/div>)/i, `$1\n${block}`);
  }
  if(/class=["'][^"']*v48-formula/i.test(html)){
    return html.replace(/(<div\s+class=["'][^"']*v48-formula[^"']*["'][^>]*>[\s\S]*?<\/div>)/i, `$1\n${block}`);
  }
  if(/v47-|v48-|pro-article__body/i.test(r+' '+html.slice(0,3000))){
    return html.replace(/(<p\s+class=["']lead["'][^>]*>[\s\S]*?<\/p>)/i, `$1\n${block}`);
  }
  return html;
}
function writeCss(){
 const css=`/* V139 BLOG CONTENT DIFFERENTIATION / SEO INTENT SPLIT
   - content readability only
   - no FAQ / related / trust chips / new conversion sections */
html[data-v139-blog-quality="active"] .v139-blog-diff-note{
  margin:clamp(18px,2.2vw,26px) 0;
  padding:clamp(15px,2vw,21px);
  border:1px solid rgba(148,163,184,.16);
  border-left:3px solid rgba(96,165,250,.58);
  border-radius:14px;
  background:linear-gradient(180deg,rgba(15,23,42,.54),rgba(2,6,23,.34));
  color:#e5e7eb;
  overflow:visible;
}
html[data-v139-blog-quality="active"] .v139-blog-diff-note h2{
  margin:0 0 9px;
  color:#f8fafc;
  font-size:clamp(1.02rem,1.42vw,1.24rem);
  line-height:1.38;
  letter-spacing:-.015em;
}
html[data-v139-blog-quality="active"] .v139-blog-diff-note p{
  margin:7px 0 0;
  color:rgba(226,232,240,.9);
  line-height:1.78;
  word-break:keep-all;
  overflow-wrap:anywhere;
}
html[data-v139-blog-quality="active"] .pro-article__body h2,
html[data-v139-blog-quality="active"] .v47-article-body h2,
html[data-v139-blog-quality="active"] .v48-article-body h2{
  scroll-margin-top:96px;
}
@media(max-width:640px){
  html[data-v139-blog-quality="active"] .v139-blog-diff-note{padding:14px;border-radius:12px;margin:15px 0;}
  html[data-v139-blog-quality="active"] .v139-blog-diff-note p{font-size:.94rem;line-height:1.72;}
}
`;
 write(p('assets/css/v139-blog-content-differentiation.css'), css);
 changed.add('assets/css/v139-blog-content-differentiation.css');
}
function updatePackage(){
 const pkg=JSON.parse(read(p('package.json')));
 pkg.scripts = pkg.scripts || {};
 pkg.scripts.build='node scripts/build-v139-cloudflare-pages-safe.mjs';
 pkg.scripts.verify='node scripts/verify-v139-blog-content-differentiation-seo-intent.mjs';
 pkg.scripts['quality:v139']='node scripts/generate-v139-blog-content-differentiation-seo-intent.mjs';
 pkg.scripts['verify:v139']='node scripts/verify-v139-blog-content-differentiation-seo-intent.mjs';
 pkg.scripts['verify:deploy']='node scripts/build-v139-cloudflare-pages-safe.mjs';
 write(p('package.json'), JSON.stringify(pkg,null,2)+'\n');
 changed.add('package.json');
}
function updateSeoMap(route,entry){
 const seoPath=p('assets/config/seo.meta.json');
 let map={}; if(fs.existsSync(seoPath)) map=JSON.parse(read(seoPath));
 map[route] = {...(map[route]||{}), ...entry};
 write(seoPath, JSON.stringify(map,null,2)+'\n');
 changed.add('assets/config/seo.meta.json');
}

writeCss();
const blogFiles=walk(p('blog')).sort();
const touched=[]; const formulaTouched=[]; const legacyTouched=[]; const metaUpdated=[]; const navFixed=[];
let seoMap=fs.existsSync(p('assets/config/seo.meta.json')) ? JSON.parse(read(p('assets/config/seo.meta.json'))) : {};
for(const fp of blogFiles){
 const r=rel(fp); let html=read(fp); const before=html; const title=cleanTitle(html,r); const category=categoryFor(r,title);
 html=ensureFlag(html); html=ensureCss(html); html=fixGuaranteeText(html); html=normalizeNumbering(html);
 if(/<h2>1\.\s*개요 및 기술적·수학적 메커니즘 분석<\/h2>/i.test(html)){
   html=replaceGenericArticle(html,category,title); formulaTouched.push(r);
 }
 if(!/^(blog\/index\.html$|blog\/page\/)/.test(r)){
   if(/v138-6-blog-refresh|v48-formula|v47-|v48-|pro-article__body/i.test(html+' '+r)){
     const after=updateV138Block(html,category,title,r);
     if(after!==html){html=after; if(!formulaTouched.includes(r)) legacyTouched.push(r);}
   }
   const desc=descFor(category,title); const keywords=keywordsFor(category,title);
   html=setMeta(html,'keywords',keywords); html=updateDescriptions(html,desc); metaUpdated.push(r);
   const route=canonicalPath(html,r); seoMap[route] = {...(seoMap[route]||{}), title:(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ? decodeHtml(stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)[1])) : `${title} | RUST 블로그`), description:desc, keywords};
 } else {
   html=setMeta(html,'keywords',keywordsFor(category,title));
 }
 if(before!==html){write(fp,html); changed.add(r); touched.push(r); if(before.includes('>보증<') && html.includes('>보증업체<')) navFixed.push(r);}
}
write(p('assets/config/seo.meta.json'), JSON.stringify(seoMap,null,2)+'\n'); changed.add('assets/config/seo.meta.json');

// sitewide header/bottom nav label consistency without changing page content.
for(const fp of walk(ROOT).filter(f=>f.endsWith('.html') && !rel(f).startsWith('blog/'))){
 const r=rel(fp); if(r.startsWith('node_modules/')) continue;
 let html=read(fp); const before=html; html=fixGuaranteeText(html);
 if(before!==html){write(fp,html); changed.add(r); navFixed.push(r);}
}

updatePackage();
const total = {diffNotes:0, formulaRefresh:0, genericH2Remaining:0, h2Number9Remaining:0, shortGuaranteeNavRemaining:0, categoryRewrittenH2:0};
for(const fp of blogFiles){
  const h=read(fp);
  if(h.includes('data-v139-blog-diff=')) total.diffNotes++;
  if(h.includes('data-v138-6-blog-refresh="formula"')) total.formulaRefresh++;
  if(/<h2>1\.\s*개요 및 기술적·수학적 메커니즘 분석<\/h2>/i.test(h)) total.genericH2Remaining++;
  if(/<h2>\s*9\.\s*운영 관점의 최종 요약\s*<\/h2>/i.test(h)) total.h2Number9Remaining++;
  if(/<a\b[^>]*href=["']\/guaranteed\/?["'][^>]*>\s*(?:<span>[^<]*<\/span>\s*)?보증\s*<\/a>/i.test(h)) total.shortGuaranteeNavRemaining++;
  if(/<h2>1\.\s*(배당을 확률로 환산|회차 독립성과 자본 한도|선결정 회차와 정산 기준|RTP와 변동성을 분리|룰·지급표·기여율|혜택률을 실수령|공개 신호를 시간순|코드·유입·정산 기준|업체명·가입코드·공식주소|검색 의도와 실제 확인 순서)/i.test(h)) total.categoryRewrittenH2++;
}
const delivery=Array.from(new Set([
  ...touched,
  ...navFixed,
  'assets/css/v139-blog-content-differentiation.css',
  'assets/config/seo.meta.json',
  'package.json',
  'scripts/build-v139-cloudflare-pages-safe.mjs',
  'scripts/generate-v139-blog-content-differentiation-seo-intent.mjs',
  'scripts/verify-v139-blog-content-differentiation-seo-intent.mjs',
  'reports/v139-blog-content-differentiation-audit.json',
  'reports/v139-verify-report.json',
  'reports/v139-cloudflare-build-safe-report.json',
  'V139_PATCH_MANIFEST.json',
  'V139_UPGRADE_REPORT.md'
])).sort();
const counts={blogHtmlScanned:blogFiles.length,changedFiles:delivery.length,formulaOrMathArticleBlocks:total.formulaRefresh,categoryRewrittenH2:total.categoryRewrittenH2,v139DifferentiationNotes:total.diffNotes,metaUpdated:metaUpdated.length,navLabelsFixedThisRun:Array.from(new Set(navFixed)).length,genericH2Remaining:total.genericH2Remaining,h2Number9Remaining:total.h2Number9Remaining,shortGuaranteeNavRemaining:total.shortGuaranteeNavRemaining};
const audit={ok:true,version:VERSION,base:'V138-6 BLOG FORMULA SEO META REFRESH FULL',scope:['formula/math article differentiation','legacy post wording polish','SEO meta keywords intent split','header label consistency 보증업체','h2 numbering cleanup'],counts,changedFiles:delivery,deletedFiles:[],forbiddenNotAdded:['AI검색 Q&A','FAQ box','신뢰칩','선택 기준/확인 기준 라벨','관련글 섹션','추천글 섹션','하단 연결 섹션','새 전환 유도 박스'],generatedAt:new Date().toISOString()};
fs.mkdirSync(p('reports'),{recursive:true});
write(p('reports/v139-blog-content-differentiation-audit.json'), JSON.stringify(audit,null,2)); changed.add('reports/v139-blog-content-differentiation-audit.json');
write(p('V139_PATCH_MANIFEST.json'), JSON.stringify({version:VERSION,patchType:'blog-content-differentiation-seo-intent',rootOverwriteSafe:true,fullReplaceSafe:true,changedFiles:delivery,deletedFiles:[],counts:audit.counts,generatedAt:audit.generatedAt},null,2)); changed.add('V139_PATCH_MANIFEST.json');
write(p('V139_UPGRADE_REPORT.md'), `# V139 BLOG CONTENT DIFFERENTIATION / SEO INTENT SPLIT

V138-6을 최신 원본으로 잡고 블로그 공식/계산식 글의 반복 템플릿 느낌을 줄인 콘텐츠 품질 패치입니다.

## 반영 범위

- 블로그 HTML 스캔: ${blogFiles.length}개
- 공식/계산식 계열 보강 블록 유지: ${counts.formulaOrMathArticleBlocks}개
- 카테고리별 H2/첫 문단 재분리: ${counts.categoryRewrittenH2}개
- V139 글별 차별화 메모: ${counts.v139DifferentiationNotes}개
- 블로그 meta keywords/description 재분리: ${metaUpdated.length}개
- 짧은 \`보증\` 메뉴 잔여: ${counts.shortGuaranteeNavRemaining}개
- 삭제 파일: 0개

## 핵심 변경

- EV, Kelly, RTP, 롤링, 환수율, 배당마진, 파산확률 계열 글의 첫 문단과 핵심 설명을 카테고리별로 분리했습니다.
- 스포츠토토/미니게임/BET365 가상게임/온라인슬롯/온라인카지노/도메인 검증/보너스 조건/총판·제휴/보증업체 글의 검색 의도를 분리했습니다.
- 목차 번호 9번으로 튀는 글은 8번 최종 요약으로 정리했습니다.
- \`보증\` 짧은 메뉴 표기를 \`보증업체\`로 통일했습니다.
- 새 FAQ, 관련글, 추천글, 신뢰칩, 하단 연결 섹션은 추가하지 않았습니다.

## 유지

- 기존 slug/canonical/sitemap 유지
- GA4 V138-5 커버리지 유지
- V138-4 블로그 디자인 롤백 유지
- 삭제 파일 없음
`, 'utf8'); changed.add('V139_UPGRADE_REPORT.md');
console.log('[V139 GENERATE PASS]', JSON.stringify({ok:true,version:VERSION,blogHtml:blogFiles.length,changedFiles:delivery.length,...counts},null,2));
