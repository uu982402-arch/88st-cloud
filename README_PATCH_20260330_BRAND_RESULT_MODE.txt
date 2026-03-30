[2026-03-30] BRAND RESULT MODE PATCH

핵심 반영:
- 광고카드 영역 디자인 고급화
- 메인 첫 화면 CTA 밀도 재배치
- 브랜드별 정적 결과페이지 자동 생성 구조 추가
- 신규 경로: /muktu-police/brand/
- 신규 경로:
  /muktu-police/brand/yangsim/
  /muktu-police/brand/chilbet/
  /muktu-police/brand/vegas/
  /muktu-police/brand/avengers/

자동 생성 구조:
- 데이터 파일: assets/data/brand.results.v1.20260330.json
- 생성 스크립트: scripts/generate-brand-pages.mjs
- 실행 명령:
  node scripts/generate-brand-pages.mjs

배포 메모:
- safety.center CSS/JS는 캐시 분리를 위해 신규 파일명으로 교체
  - /assets/css/safety.center.v2.20260330.css
  - /assets/js/safety.center.v2.20260330.js
- 메인 / 안전센터 / 사례조회 / 도메인검사 / 결과페이지 네비게이션에 브랜드결과 추가
- 전체 ZIP 덮어쓰기 배포 권장
