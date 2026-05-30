import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const TODAY = '2026-05-29';
const SITE = 'https://88st.cloud';
const posts = [
  {
    "slug": "kbo-remaining-season-five-race-table.html",
    "title": "KBO 남은 시즌 5강 경쟁표를 볼 때 먼저 나눌 항목",
    "category": "KBO 시즌",
    "description": "KBO 남은 시즌 5강 경쟁을 볼 때 승차, 잔여경기, 맞대결, 불펜 소모를 분리해서 확인하는 기준형 가이드입니다.",
    "lead": "KBO 남은 시즌은 현재 순위 하나로 판단하기보다 승차, 잔여경기, 맞대결, 로테이션을 분리해서 보는 편이 안전합니다.",
    "sections": [
      [
        "승차는 단독 숫자가 아니라 경기 수와 함께 본다",
        "승차가 같아 보여도 남은 경기 수와 맞대결 수가 다르면 체감 난도는 달라집니다. 한 팀은 이미 많은 경기를 치렀고, 다른 팀은 잔여경기가 몰려 있을 수 있습니다. 그래서 5강 경쟁을 볼 때는 순위표의 위치보다 남은 일정의 밀도를 먼저 분리하는 편이 좋습니다."
      ],
      [
        "맞대결은 순위 변동 폭을 크게 만든다",
        "막판 순위 싸움에서는 중하위권 상대와의 경기보다 경쟁팀끼리의 맞대결이 더 크게 작용합니다. 맞대결은 승차를 직접 줄이거나 벌릴 수 있기 때문에, 일정표에서 같은 권역 팀과의 남은 경기 수를 따로 표시해두면 흐름을 훨씬 현실적으로 볼 수 있습니다."
      ],
      [
        "불펜 소모와 선발 간격을 같이 본다",
        "남은 시즌에는 선발 로테이션보다 불펜 소모가 더 빠르게 체감됩니다. 연투가 이어지는 팀, 휴식일이 적은 팀, 대체 선발이 필요한 팀은 같은 순위라도 운영 부담이 다릅니다. 최근 3연전의 불펜 투구 수와 다음 선발 간격을 함께 보면 단순 승패보다 더 유용합니다."
      ],
      [
        "판단은 단정이 아니라 체크 순서로 남긴다",
        "가을야구 진출 여부를 확정처럼 쓰기보다 승차, 잔여경기, 맞대결, 부상, 불펜 소모를 같은 순서로 기록하는 것이 좋습니다. 시즌 막판 정보는 하루 경기 결과로도 달라질 수 있으므로, 글을 볼 때도 최신 순위표와 일정표를 같이 확인해야 합니다."
      ]
    ]
  },
  {
    "slug": "kbo-schedule-density-rest-day-check.html",
    "title": "KBO 막판 일정 밀도와 휴식일을 같이 보는 법",
    "category": "KBO 일정",
    "description": "KBO 막판 일정에서 더블헤더, 이동거리, 휴식일, 선발 간격이 경기 흐름에 주는 영향을 확인하는 글입니다.",
    "lead": "막판 일정은 단순히 몇 경기가 남았는지보다 언제 몰려 있고, 어떤 이동 흐름으로 이어지는지를 봐야 합니다.",
    "sections": [
      [
        "잔여경기 수보다 일정 간격이 먼저다",
        "잔여경기가 많은 팀이 항상 유리한 것은 아닙니다. 일정이 짧은 기간에 몰리면 선발 간격이 흔들리고, 불펜 운영도 빡빡해질 수 있습니다. 반대로 잔여경기가 적더라도 휴식일이 적절히 배치되면 주요 투수를 안정적으로 운영할 수 있습니다."
      ],
      [
        "이동거리와 원정 연전을 같이 본다",
        "원정 이동이 길게 이어지는 구간은 컨디션 관리에 영향을 줍니다. 특히 주말 3연전 뒤 바로 다른 지역 원정이 붙는 일정은 라인업 관리와 불펜 운영이 더 중요해집니다. 일정표를 볼 때 홈·원정 표기를 나눠두면 막판 흐름을 더 명확히 볼 수 있습니다."
      ],
      [
        "더블헤더와 우천 변수는 별도로 표시한다",
        "우천 취소가 쌓이면 더블헤더나 월요일 경기로 일정이 재배치될 수 있습니다. 이때는 단순한 한 경기 추가가 아니라 포수, 불펜, 대체 선발, 야수 휴식까지 같이 영향을 받습니다. 그래서 재편성 일정은 일반 경기와 따로 표시하는 편이 안전합니다."
      ],
      [
        "최종 확인은 당일 엔트리와 선발 발표다",
        "일정 분석은 큰 흐름을 보는 작업이고, 실제 경기 전에는 당일 선발, 엔트리 변동, 휴식 선수 여부를 다시 봐야 합니다. 막판 일정이 빡빡할수록 경기 직전 공개 정보의 영향이 커집니다."
      ]
    ]
  },
  {
    "slug": "pro-baseball-final-stretch-overprediction-filter.html",
    "title": "프로야구 막판 전망글에서 과장 예측을 걸러내는 기준",
    "category": "프로야구",
    "description": "프로야구 막판 순위 전망을 볼 때 확정형 문구와 실제 확인 가능한 변수들을 구분하는 기준을 정리했습니다.",
    "lead": "막판 전망글은 재미있지만, 확정형 예측과 확인 가능한 변수는 분리해서 읽어야 합니다.",
    "sections": [
      [
        "확정 표현보다 근거 항목을 본다",
        "“무조건 진출”, “탈락 확정”, “우승 유력” 같은 문구는 클릭을 유도하기 쉽지만 실제 판단에는 도움이 적습니다. 전망글을 볼 때는 문장 강도보다 남은 경기, 맞대결, 부상, 선발 간격 같은 근거 항목이 함께 제시되는지 확인하는 것이 좋습니다."
      ],
      [
        "최근 흐름은 표본 크기를 같이 봐야 한다",
        "최근 5경기 성적은 분위기를 보여주지만, 시즌 전체 전력과 완전히 같지는 않습니다. 타격 사이클, 불펜 피로, 상대 선발 수준이 섞이면 짧은 연승·연패도 과하게 해석될 수 있습니다. 최근 흐름은 참고값으로 두고, 일정과 전력 변수를 함께 봐야 합니다."
      ],
      [
        "부상과 복귀 일정은 날짜보다 역할이 중요하다",
        "핵심 선수가 돌아온다는 소식만으로 전력이 바로 회복된다고 단정하기 어렵습니다. 복귀 후 수비 이닝, 타순 위치, 투구 수 제한, 연전 투입 가능성까지 봐야 합니다. 이름값보다 실제 기용 범위를 확인해야 막판 전망이 현실적입니다."
      ],
      [
        "전망은 업데이트 전제를 둔다",
        "프로야구 막판 정보는 하루 만에 바뀔 수 있습니다. 좋은 전망글은 결론을 고정하지 않고, 어떤 조건이 바뀌면 판단을 다시 해야 하는지 남겨둡니다. 이 기준이 있으면 순위 경쟁 글을 읽을 때 과장과 현실을 분리하기 쉽습니다."
      ]
    ]
  },
  {
    "slug": "vleague-men-preseason-roster-check.html",
    "title": "남자배구 V리그 시즌 전 로스터 변화를 확인하는 순서",
    "category": "남자배구",
    "description": "남자배구 V리그 시즌 전 세터, 외국인 선수, 아시아쿼터, 미들블로커 구성을 순서대로 확인하는 글입니다.",
    "lead": "남자배구는 한 명의 공격수보다 세터와 리시브 라인, 외국인 선수 조합을 함께 보는 것이 중요합니다.",
    "sections": [
      [
        "세터 변화는 팀 속도를 바꾼다",
        "세터가 바뀌면 공격 템포, 중앙 활용, 아포짓 의존도가 달라집니다. 같은 공격수라도 세터와의 호흡이 맞지 않으면 시즌 초반 효율이 흔들릴 수 있습니다. 그래서 시즌 전 전망에서는 세터 변화와 주전 경쟁을 먼저 확인하는 편이 좋습니다."
      ],
      [
        "외국인 선수는 득점뿐 아니라 역할을 본다",
        "외국인 선수가 아포짓인지 아웃사이드인지에 따라 국내 선수 배치가 달라집니다. 득점력만 보지 말고 리시브 참여 여부, 블로킹 높이, 서브 강도, 후위 공격 비중을 함께 봐야 합니다."
      ],
      [
        "아시아쿼터는 깊이를 만드는 변수다",
        "아시아쿼터 선수는 주전 한 자리뿐 아니라 교체 카드, 리시브 안정, 블로킹 높이 보강에 영향을 줄 수 있습니다. 시즌 전에는 이름보다 포지션 중복과 팀 내 역할을 먼저 확인하는 것이 좋습니다."
      ],
      [
        "초반 일정은 호흡 점검의 기간이다",
        "배구는 조직력이 중요해서 시즌 초반에는 전력 자체보다 조합 완성도가 더 크게 보일 수 있습니다. 개막 전 평가전, 컵대회, 초반 상대 조합을 함께 보면 시즌 초반 변수를 더 현실적으로 볼 수 있습니다."
      ]
    ]
  },
  {
    "slug": "vleague-women-receive-foreign-player-check.html",
    "title": "여자배구 V리그 시즌 초반 리시브와 외국인 선수 변수를 보는 법",
    "category": "여자배구",
    "description": "여자배구 V리그 시즌 초반 리시브 라인, 외국인 선수, 미들 활용, 세트 흐름을 확인하는 기준형 글입니다.",
    "lead": "여자배구 시즌 초반은 외국인 선수의 득점력뿐 아니라 리시브 안정과 세터 선택지를 같이 봐야 합니다.",
    "sections": [
      [
        "리시브 라인이 흔들리면 공격 선택지도 줄어든다",
        "여자배구는 리시브 안정이 세터 선택지와 직결됩니다. 리시브가 흔들리면 중앙 속공과 시간차 활용이 줄고, 특정 공격수 의존도가 높아질 수 있습니다. 시즌 초반에는 득점 순위보다 리시브 라인의 안정 여부를 먼저 확인하는 편이 좋습니다."
      ],
      [
        "외국인 선수는 초반 적응 속도를 본다",
        "외국인 선수는 시즌 초반에 팀 수비 시스템, 세터 호흡, 국내 블로커 성향에 적응하는 시간이 필요합니다. 첫 몇 경기의 공격 성공률만으로 판단하기보다 세트가 길어질 때의 결정력과 범실 흐름을 함께 봐야 합니다."
      ],
      [
        "미들블로커 활용은 팀 균형을 보여준다",
        "중앙 공격이 살아 있으면 상대 블로커가 분산되고, 날개 공격수의 부담도 줄어듭니다. 미들 활용이 적은 팀은 리시브 문제인지 세터 성향인지, 혹은 공격 조합 문제인지 나눠서 봐야 합니다."
      ],
      [
        "초반 순위보다 경기 내용이 먼저다",
        "시즌 초반 순위는 대진 난도와 컨디션의 영향을 크게 받습니다. 세트별 흐름, 범실 구간, 리시브 효율, 교체 카드 활용을 같이 보면 실제 전력 안정성을 더 잘 볼 수 있습니다."
      ]
    ]
  },
  {
    "slug": "kbl-new-season-roster-foreign-player-check.html",
    "title": "KBL 새 시즌 로스터와 외국선수 구성을 확인하는 기준",
    "category": "KBL",
    "description": "KBL 새 시즌을 보기 전 가드진, 외국선수 조합, 빅맨 깊이, 일정 밀도를 확인하는 기준을 정리했습니다.",
    "lead": "KBL 새 시즌 전망은 이적 이름값보다 가드진 안정, 외국선수 조합, 빅맨 로테이션을 함께 봐야 합니다.",
    "sections": [
      [
        "가드진은 공격 시작점을 결정한다",
        "새 시즌 로스터에서 가장 먼저 볼 부분은 가드진입니다. 볼 운반, 픽앤롤 운영, 턴오버 관리, 클러치 상황의 선택지가 안정적이어야 팀 공격이 흔들리지 않습니다. 득점력이 좋은 선수만큼 경기 운영을 안정시키는 선수가 중요합니다."
      ],
      [
        "외국선수 조합은 역할 분담을 본다",
        "외국선수가 모두 득점형이면 수비와 리바운드가 약해질 수 있고, 반대로 수비형만 있으면 공격 옵션이 부족해질 수 있습니다. 1옵션과 2옵션이 어떤 역할을 나누는지, 국내 빅맨과 겹치지 않는지도 확인해야 합니다."
      ],
      [
        "백투백과 원정 일정은 로테이션을 시험한다",
        "농구는 일정 밀도가 높아질수록 주전 의존도가 부담이 됩니다. 백투백, 장거리 원정, 연전 구간에서는 벤치 깊이와 수비 집중력이 중요해집니다. 일정표를 볼 때는 상대보다 팀의 체력 운용을 같이 봐야 합니다."
      ],
      [
        "새 시즌 초반은 완성도보다 조합 점검이다",
        "초반 성적만으로 시즌 전체를 단정하기 어렵습니다. 새 전술, 새 외국선수, 이적 선수의 역할이 자리 잡는 데 시간이 필요하기 때문입니다. 초반에는 승패보다 주전 조합과 벤치 로테이션이 안정되는지 보는 것이 좋습니다."
      ]
    ]
  },
  {
    "slug": "wkbl-season-flow-injury-rotation-check.html",
    "title": "WKBL 시즌 흐름을 볼 때 부상 복귀와 로테이션을 확인하는 법",
    "category": "WKBL",
    "description": "WKBL 시즌 전망에서 부상 복귀, 주전 출전 시간, 벤치 로테이션, 국가대표 일정 변수를 확인하는 글입니다.",
    "lead": "WKBL은 전력 차이만큼 출전 시간 관리와 부상 복귀 타이밍이 시즌 흐름에 크게 작용합니다.",
    "sections": [
      [
        "부상 복귀는 출전 시간으로 확인한다",
        "부상 선수가 복귀했다는 소식만으로 바로 정상 전력이라고 보기 어렵습니다. 복귀 직후에는 출전 시간이 제한되거나 수비 강도가 조절될 수 있습니다. 실제 영향은 출전 시간, 역할, 경기 후반 기용 여부를 통해 확인하는 편이 정확합니다."
      ],
      [
        "주전 의존도는 시즌 중반 이후 차이를 만든다",
        "WKBL은 주전 의존도가 높은 팀일수록 시즌이 길어질수록 체력 관리가 중요해집니다. 특정 선수의 출전 시간이 계속 높다면 승리 흐름이 좋아도 장기적으로는 로테이션 부담을 함께 봐야 합니다."
      ],
      [
        "벤치 로테이션은 수비 집중력과 연결된다",
        "벤치 득점만으로 팀 깊이를 판단하기 어렵습니다. 수비 전환, 리바운드, 파울 관리, 주전 휴식 시간을 버텨주는지가 더 중요할 때가 많습니다. 시즌 흐름을 볼 때는 벤치 구간의 실점 흐름을 같이 보는 것이 좋습니다."
      ],
      [
        "일정 변수는 컨디션 회복과 연결된다",
        "휴식일, 연전, 원정 이동은 여자농구에서도 중요합니다. 시즌 전망을 볼 때는 순위표와 함께 다음 2~3주 일정의 밀도를 확인하면 실제 흐름을 더 현실적으로 볼 수 있습니다."
      ]
    ]
  },
  {
    "slug": "domestic-pro-sports-season-calendar-routine.html",
    "title": "국내 프로스포츠 시즌 일정을 한 번에 정리하는 확인 루틴",
    "category": "스포츠 일정",
    "description": "야구, 배구, 남녀농구 시즌 일정을 볼 때 개막, 휴식일, 맞대결, 포스트시즌 흐름을 한 번에 정리하는 방법입니다.",
    "lead": "국내 프로스포츠는 종목마다 시즌 흐름이 달라서 일정표를 같은 방식으로 정리해두면 훨씬 보기 쉽습니다.",
    "sections": [
      [
        "종목별로 먼저 시즌 구간을 나눈다",
        "야구는 장기 레이스와 막판 순위 싸움, 배구와 농구는 정규리그와 플레이오프 흐름을 나눠 보는 것이 좋습니다. 같은 “시즌 전망”이라도 종목마다 중요한 시점이 다르기 때문에 먼저 구간을 나누는 작업이 필요합니다."
      ],
      [
        "일정표는 홈·원정·휴식일을 같이 표시한다",
        "단순히 날짜와 상대만 적으면 실제 흐름을 놓치기 쉽습니다. 홈·원정, 휴식일, 연전, 이동거리, 맞대결 여부를 함께 표시하면 경기력 변수를 더 선명하게 볼 수 있습니다."
      ],
      [
        "포스트시즌 경쟁권은 직접 맞대결을 따로 본다",
        "막판 경쟁에서는 같은 순위권 팀끼리의 맞대결이 가장 큰 변수가 됩니다. 종목이 달라도 직접 맞대결은 순위 변동 폭을 키우기 때문에 일정표에서 별도로 표시해두면 좋습니다."
      ],
      [
        "최신 정보는 일정 변경 가능성을 전제로 본다",
        "국내 프로스포츠 일정은 중계, 경기장 사정, 기상, 대회 일정에 따라 바뀔 수 있습니다. 그래서 정리표는 고정된 결론이 아니라 업데이트 가능한 체크리스트로 두는 것이 안전합니다."
      ]
    ]
  }
];
function ensureDir(p){ fs.mkdirSync(p,{recursive:true}); }
function read(p){ return fs.existsSync(p) ? fs.readFileSync(p,'utf8') : ''; }
function write(p,s){ ensureDir(path.dirname(p)); fs.writeFileSync(p,s); }
function esc(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
function articleSchema(post,url){
  return JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":`${SITE}/#organization`,"name":"RUST by 88ST","url":`${SITE}/`,"logo":`${SITE}/assets/img/rust/rust-crest-192.png`},{"@type":"WebSite","@id":`${SITE}/#website`,"url":`${SITE}/`,"name":"RUST by 88ST","inLanguage":"ko-KR","publisher":{"@id":`${SITE}/#organization`}},{"@type":"BreadcrumbList","@id":`${url}#breadcrumb`,"itemListElement":[{"@type":"ListItem","position":1,"name":"메인","item":`${SITE}/`},{"@type":"ListItem","position":2,"name":"블로그","item":`${SITE}/blog/`},{"@type":"ListItem","position":3,"name":"스포츠 시즌","item":`${SITE}/blog/sports-season/`},{"@type":"ListItem","position":4,"name":post.title,"item":url}]},{"@type":"Article","@id":`${url}#article`,"url":url,"headline":post.title,"name":post.title,"description":post.description,"inLanguage":"ko-KR","datePublished":TODAY,"dateModified":TODAY,"author":{"@type":"Organization","name":"RUST by 88ST"},"publisher":{"@id":`${SITE}/#organization`},"isPartOf":{"@id":`${SITE}/#website`},"breadcrumb":{"@id":`${url}#breadcrumb`},"primaryImageOfPage":{"@type":"ImageObject","url":`${SITE}/assets/img/rust/rust-og.jpg`}}]}, null, 2);
}
function baseHead(post,url){return `<!doctype html>
<html lang="ko" data-v127-mobile-qa="active" data-v128-performance="active" data-v129-seo-schema="active" data-v130-release-lock="active" data-v131-live-visual="active" data-v132-live-cleanup="true" data-v132-1-cleanup="true" data-v133-sports-season="true" class="v130-final-release-lock">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<title>${esc(post.title)} | RUST 블로그</title>
<meta name="description" content="${esc(post.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="RUST by 88ST">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(post.title)} | RUST 블로그">
<meta property="og:description" content="${esc(post.description)}">
<meta property="og:image" content="${SITE}/assets/img/rust/rust-og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(post.title)} | RUST 블로그">
<meta name="twitter:description" content="${esc(post.description)}">
<meta name="twitter:image" content="${SITE}/assets/img/rust/rust-og.jpg">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="stylesheet" href="/assets/css/v76.rust-brand-system.css?v=static-v76-rust-brand-system-20260524" data-v76-rust="true">
<link rel="stylesheet" href="/assets/css/v77.rust-logo-assets.css?v=static-v77-rust-logo-assets-20260524" data-v77-rust-logo="true">
<link rel="stylesheet" href="/assets/css/v121-clean-layout-lock.css?v=20260529" data-v121-clean-layout-lock="true">
<link rel="stylesheet" href="/assets/css/v127-mobile-qa-safe-area-lock.css?v=20260529" data-v127-mobile-qa="true">
<link rel="stylesheet" href="/assets/css/v128-performance-asset-lightweight.css?v=20260529" data-v128-performance="true">
<link rel="stylesheet" href="/assets/css/v129-seo-schema-consult-strip.css?v=20260529" data-v129-seo-schema="true">
<link rel="stylesheet" href="/assets/css/v130-final-release-lock.css?v=20260529" data-v130-release-lock="true">
<link rel="stylesheet" href="/assets/css/v131-live-visual-deploy-polish.css?v=20260529" data-v131-live-visual="true">
<link rel="stylesheet" href="/assets/css/v132-live-screen-cleanup.css?v=20260529" data-v132-live-cleanup="true">
<link rel="stylesheet" href="/assets/css/v132-1-live-header-tool-cleanup.css?v=20260529" data-v132-1-cleanup="true">
<link rel="stylesheet" href="/assets/css/v133-sports-season-blog.css?v=20260529" data-v133-sports-season="true">
<script type="application/ld+json" data-v129-schema="true">${articleSchema(post,url)}</script>
</head>`}
function header(){return `<body data-v133-sports-season="true" data-v132-live-cleanup="true" data-v132-1-cleanup="true" data-v131-live-visual="true" data-v130-release-lock="true" data-v129-seo-schema="true" data-v128-performance="true" data-v127-mobile-qa="true">
<header class="rust-global-header" id="rust-global-header" data-rust-brand-header="true"><div class="rust-header-inner"><a class="rust-brand" href="/" aria-label="RUST 메인으로 이동"><span class="rust-brand-mark" aria-hidden="true"><img src="/assets/img/rust/rust-crest-64.png" alt="" width="42" height="42" decoding="async" loading="eager"></span><span class="rust-brand-type"><strong>RUST</strong><span>by 88ST</span></span></a><nav class="rust-desktop-nav" aria-label="RUST 주요 메뉴" data-rust-nav="desktop"><a href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증</a><a href="/consult/">상담</a></nav><button class="rust-menu-button" type="button" aria-label="메뉴 열기" aria-expanded="false" data-rust-menu-toggle><span></span><span></span></button></div><nav class="rust-mobile-menu" aria-label="RUST 모바일 메뉴" data-rust-nav="mobile-menu"><a href="/">메인</a><a href="/blog/">블로그</a><a href="/tools/">도구</a><a href="/guaranteed/">보증</a><a href="/consult/">상담</a></nav></header>`}
function footer(){return `<nav class="rust-bottom-nav" aria-label="RUST 모바일 하단 메뉴" data-rust-nav="bottom"><a href="/"><span>⌂</span>메인</a><a href="/blog/"><span>▤</span>블로그</a><a href="/tools/"><span>◈</span>도구</a><a href="/guaranteed/"><span>◆</span>보증</a><a href="/consult/"><span>✦</span>상담</a></nav><script src="/assets/js/v76.rust-brand-system.js?v=static-v76-rust-brand-system-20260524" defer data-v76-rust="true"></script></body></html>`}
function renderPost(post){ const url = `${SITE}/blog/sports-season/${post.slug}`; return `${baseHead(post,url)}${header()}<main class="v133-season-article"><article><section class="v133-season-hero"><div class="v133-season-meta"><span>${esc(post.category)}</span><span>시즌 확인</span><span>${TODAY}</span></div><h1>${esc(post.title)}</h1><p class="v133-season-lead">${esc(post.lead)}</p></section><section class="v133-season-body">${post.sections.map(([h,p])=>`<section class="v133-season-block"><h2>${esc(h)}</h2><p>${esc(p)}</p></section>`).join('')}<div class="v133-season-note">순위, 일정, 엔트리, 부상 정보는 경기 종료와 공지에 따라 달라질 수 있습니다. 이 글은 특정 결과를 단정하지 않고 남은 시즌을 확인하는 순서를 정리한 기준형 콘텐츠입니다.</div></section></article></main>${footer()}`; }
function card(post,idx){return `<a class="v72-blog-card" href="/blog/sports-season/${post.slug}" data-title="${esc(post.title)}" data-category="${esc(post.category)}" data-v99-tier="최신글" data-v133-post="true" data-ga4-event="blog_card_click"><div class="v72-blog-card__body"><div class="v72-blog-card__top"><span class="v72-blog-card__rank">S${idx}</span><span class="v72-blog-card__tag">${esc(post.category)}</span><span class="v99-blog-tier">시즌</span></div><strong>${esc(post.title)}</strong><p>${esc(post.description)}</p></div><div class="v72-blog-card__meta"><span class="v72-blog-card__views">시즌 점검</span><span class="v72-blog-card__go">›</span></div></a>`}
function removeOldV133Cards(html){ return html.replace(/<a class="v72-blog-card"[^>]*data-v133-post="true"[\s\S]*?<\/a>\s*/g,''); }
function injectCss(html){ if(html.includes('v133-sports-season-blog.css')) return html; return html.replace('</head>','  <link rel="stylesheet" href="/assets/css/v133-sports-season-blog.css?v=20260529" data-v133-sports-season="true">\n</head>'); }
function updateBlogIndex(){ const p=path.join(ROOT,'blog/index.html'); let s=read(p); s=injectCss(s); s=removeOldV133Cards(s); const cards=posts.map((post,i)=>card(post,i+1)).join('\n'); s=s.replace(/(<div class="v72-blog-grid"[^>]*>)/, `$1\n${cards}\n`); s=s.replace(/인기글 · 핵심글 · 최신글 \d+개/g,'인기글 · 핵심글 · 최신글 66개'); s=s.replace(/<span class="v72-chip" data-v72-count>[^<]*<\/span>/, '<span class="v72-chip" data-v72-count>인기글 · 핵심글 · 최신글 66개</span>'); write(p,s); }
function updateSitemaps(){ const urls = posts.map(p=>`${SITE}/blog/sports-season/${p.slug}`); const files=['sitemap.txt','serverless/sitemap.txt']; for(const f of files){ const p=path.join(ROOT,f); let s=read(p); if(!s) continue; let lines=s.split(/\r?\n/).filter(Boolean).filter(line=>!urls.includes(line.trim())); lines.push(...urls); write(p, lines.join('\n')+'\n'); }
  for(const f of ['sitemap.xml','serverless/sitemap.xml']){ const p=path.join(ROOT,f); let s=read(p); if(!s) continue; for(const url of urls){ s=s.replace(new RegExp(`\\s*<url><loc>${url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}</loc>[\\s\\S]*?<\\/url>`,'g'),''); }
    const nodes=urls.map(url=>`  <url><loc>${url}</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`).join('\n');
    s=s.replace('</urlset>', `${nodes}\n</urlset>`); write(p,s); }
}
function scanTitles(){ const out=[]; for(const file of fs.readdirSync(path.join(ROOT,'blog'),{recursive:true}).filter(f=>String(f).endsWith('.html'))){ const full=path.join(ROOT,'blog',file); const m=read(full).match(/<title>([\s\S]*?)<\/title>/i); if(m) out.push({file:'blog/'+file,title:m[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()}); } return out; }
function normalizeTitle(t){ return t.replace(/\|.*$/,'').replace(/[\s·:|,]/g,'').toLowerCase(); }
function writeReports(){ const titles=scanTitles(); const existing=titles.filter(x=>!x.file.includes('blog/sports-season/')).map(x=>({...x,norm:normalizeTitle(x.title)})); const audit=posts.map(post=>{ const n=normalizeTitle(post.title); const closest=existing.map(x=>({file:x.file,title:x.title,score:similarity(n,x.norm)})).sort((a,b)=>b.score-a.score).slice(0,5); return {title:post.title,slug:post.slug,closest}; }); ensureDir(path.join(ROOT,'reports')); write(path.join(ROOT,'reports/v133-sports-season-blog-audit.json'), JSON.stringify({ok:true,version:'V133_SPORTS_SEASON_CONTENT',newPosts:posts.length,audit,generatedAt:new Date().toISOString()},null,2)); write(path.join(ROOT,'reports/v133-remove-candidates.txt'), 'V133: no file deletion. Removed no UI blocks. No related/recommendation/FAQ/trust-chip sections were added.\n'); write(path.join(ROOT,'V133_PATCH_MANIFEST.json'), JSON.stringify({version:'V133_SPORTS_SEASON_CONTENT',base:'V132.2',newPosts:posts.map(p=>`blog/sports-season/${p.slug}`),changed:['blog/index.html','sitemap.xml','sitemap.txt','serverless/sitemap.xml','serverless/sitemap.txt','package.json','assets/css/v133-sports-season-blog.css'],generatedAt:new Date().toISOString()},null,2)); write(path.join(ROOT,'V133_UPGRADE_REPORT.md'), `# V133 SPORTS SEASON CONTENT / DUPLICATE SAFE PATCH\n\n- Base: V132.2 FULL\n- Added posts: ${posts.length}\n- Category: KBO, V-League, KBL, WKBL, domestic pro sports season\n- No FAQ, no trust chips, no related/recommendation blocks, no bottom connection sections.\n- Sitemap and blog index updated.\n`); }
function similarity(a,b){ const as=new Set(a.split('')); const bs=new Set(b.split('')); const inter=[...as].filter(x=>bs.has(x)).length; const union=new Set([...as,...bs]).size||1; return Number((inter/union).toFixed(3)); }

function updatePackage(){
  const p=path.join(ROOT,'package.json');
  const pkg=JSON.parse(read(p));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = 'node scripts/build-v133-cloudflare-pages-safe.mjs';
  pkg.scripts.verify = 'node scripts/verify-v133-sports-season-content.mjs';
  pkg.scripts['quality:v133'] = 'node scripts/generate-v133-sports-season-content.mjs';
  pkg.scripts['verify:v133'] = 'node scripts/verify-v133-sports-season-content.mjs';
  write(p, JSON.stringify(pkg,null,2)+'\n');
}

function main(){ ensureDir(path.join(ROOT,'blog/sports-season')); for(const post of posts){ write(path.join(ROOT,'blog/sports-season',post.slug), renderPost(post)); } updateBlogIndex(); updateSitemaps(); updatePackage(); writeReports(); console.log('[V133 GENERATE PASS]', JSON.stringify({ok:true,posts:posts.length,version:'V133_SPORTS_SEASON_CONTENT'},null,2)); }
main();
