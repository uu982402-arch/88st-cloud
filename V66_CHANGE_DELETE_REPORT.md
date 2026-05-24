# V66 변경/삭제 완료 명세서

## 변경 파일 핵심

- package.json: build 파이프라인 끝에 V66 리뉴얼 생성 스크립트 연결
- scripts/generate-v66-obsidian-renewal.mjs: sitemap 전수 파싱, 전 HTML 주입, /guaranteed 재작성, 보고서 생성
- assets/css/v66.obsidian-dashboard.css: 전 페이지 프리미엄 다크 SaaS 디자인 시스템
- assets/js/v66.obsidian-dashboard.js: 공통 헤더, 모바일 하단 내비게이션, 상담 FAB, 코드 복사 토스트, 이미지 오류 방어
- guaranteed/index.html 외 HTML 624개: V66 공통 자산 주입

## 실제 삭제 파일

- 없음

## 제거 후보

실제 삭제는 하지 않았습니다. 기존 라우팅/빌드 안정성을 우선하여 레거시 CSS/JS는 보존하고 V66 오버레이 시스템으로 통합했습니다. 향후 라이브 확인 뒤 의존성 없는 버전별 CSS/JS(v52~v65 중 미사용)를 후보로 재점검할 수 있습니다.
