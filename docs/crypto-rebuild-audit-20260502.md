# 88ST.Cloud Crypto Rebuild Audit - 2026-05-02

## 구조 스캔 요약
- 기존 ZIP은 정적 HTML/CSS/JS 기반 Cloudflare Pages 배포 구조다.
- 기존 메인과 라이브 상태 모두 스포츠 분석기 중심 문구와 UI가 노출되고 있었다.
- 보증업체 데이터와 접속 모달은 `assets/data/guaranteed.providers.v1.20260330.json`, `assets/js/hub.promo.v1.20260502.js`, `assets/css/hub.promo.v1.20260502.css` 기준으로 유지 가능했다.
- 기존 `/blog/`, `/tools/`, `/guaranteed/` 라우트는 유지하고, 신규 `/coins/`, `/exchanges/` 계층을 추가했다.

## 적용 내용
- 메인: 종목 검색, 빠른 분석, 거래소 비교 중심으로 재구성.
- 차트: 대표 종목 가격 차트와 거래소 가격 차이 그래프를 SVG 기반으로 구현.
- 빠른 분석: 종목, 거래소, 기간, 분석 모드 입력 후 요약 결과 출력.
- 종목 상세: BTC, ETH, SOL, XRP 상세 페이지 생성.
- 거래소 비교: 허브와 Binance·Upbit 상세 비교 페이지 생성.
- 블로그: 시장 브리핑/종목 해설/거래소 비교/RSI 해설 중심으로 재구성.
- 보증업체: 기존 주소/코드 유지, 카드 높이와 버튼 구조를 단순화.
- 모달: 제목을 “오늘 확인할 보증업체”로 정리하고 3개 카드 노출 구조 유지.
- SEO: title, description, canonical, sitemap, robots 갱신.

## 제거 후보
실제 삭제는 라우팅 안전성 때문에 이번 패치에서 보류했다.
- 스포츠 중심 상세 도구: `/tools/ai-sports-odds-analysis/`, `/tools/odds-band/`, `/tools/ou-calculator/`, `/tools/handicap-*` 계열.
- 구 먹튀/주소 SEO 대량 페이지: `/muktu-police/`, 일부 `/blog/*muktu*`, `/blog/*major-site*` 계열.
- 구 스포츠 CSS/JS: `assets/css/app.sports.v1.20260420f.css`, `assets/js/app.sports.v1.20260420d.js`.
- 과거 럭셔리/허브 중복 스타일: `vvip-*`, `luxury.*`, 구 `hub.promo.*` 중 미사용 버전.

## QA 결과
- 신규/수정 주요 HTML 14개 파싱 확인.
- 내부 링크, CSS, JS, 이미지 참조 누락 0건.
- `assets/js/crypto.rebuild.v1.20260502.js` Node syntax check 통과.
- `assets/js/hub.promo.v1.20260502.js` Node syntax check 통과.
- 기본 빌드 스크립트 `npm run build` 실행 확인 후 build 정보 재기록.
- Telegram 링크는 `https://t.me/odds88st_bot` 기준으로 통일.
- 메인/코인 허브/거래소 허브/상세/블로그/보증업체/모달 관련 파일 반영 완료.
