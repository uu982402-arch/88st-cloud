# 88ST 리뉴얼 추가 패치 노트 (2026-03-13)

## 이번 패치 목적
- 전 페이지 공통 색상 토큰 재정비
- 세이프티락 기능 전체 제거
- 홈/analysis 리뉴얼 보강
- 공통 버튼/모달/카드 규격 통일 강화
- 미사용/구버전 중복 코드 정리

## 주요 변경 파일

### 디자인 / 테마
- `assets/css/theme.tokens.v1.20260226.css`
  - 전 페이지 공통 컬러 토큰을 네이비 + 골드 기반 프리미엄 팔레트로 재설계.
  - light/dark 모두 배경, 패널, 보더, 그림자, 상태색 재정비.

- `assets/css/global.unify.v2.20260313.css`
  - 버튼, 입력창, 카드, 모달, 헤더 공통 토큰 전면 강화.
  - 홈/analysis/cert/tool/landing 공통 표면/CTA/입력 스타일을 통일.

- `assets/css/home.relayout.v1.20260313.css`
  - 홈 핵심 진입/핵심 계산기 카드의 컬러와 하단 액센트 라인 강화.

- `assets/css/analysis.upgrade.v2.20260313.css`
  - analysis 추가 수학 엔진/시장 해석 패널을 새 팔레트에 맞게 재정렬.

### 기능 / 정리
- `assets/config/site.runtime.json`
  - `sessionSafety`, `homeTodayStatus`, `homeQuickLog`, `logbookReport`, `logbookCategoryChips` 비활성화.

- `scripts/gen-build-ver.mjs`
  - 빌드 시 `share.session` 자산이 더 이상 글로벌 로더에 포함되지 않도록 정리.

- `assets/js/build.loader.js`
  - fallback 자산 목록에서도 `share.session` 제거.

- `assets/js/global.unify.v2.20260313.js`
  - 로그북/세이프티락/루틴/패턴 관련 전면 노출 요소 정리.
  - 공통 메뉴/모달 닫기 동작 보강.
  - `target="_blank"` 링크의 `noopener noreferrer` 자동 보강.

- `assets/js/home.enhance.v154.js`
  - 세이프티락/빠른 로그 관련 dead code 비활성화.

- `analysis/index.html`
  - 로그북 퀵세이브 모달 스타일 제거.
  - analysis 상단/추가 엔진 영역은 유지하되 불필요한 로그북 흔적 제거.

- `index.html`
  - 홈 메인 리뉴얼 유지 + 계산기 메뉴 단순화 보정.

- `assets/js/pro-suite.v3.js`
  - 로그북/루틴 중심 문구를 분석/세션 리뷰 중심 문구로 정리.

- `assets/js/usage.track.v154.js`
  - `/logbook/` 라벨을 중립적인 기록 보기 표현으로 교체.

- `ops/index.html`
  - 세이프티락/로그북 관련 운영 토글 문구 제거.

### 제거된 중복 / 미사용 파일
- `assets/js/share.session.v1.20260226.js`
- `assets/js/ops.sitecfg.v152.js`
- `assets/js/ops.sitecfg.v153.js`
- `assets/js/pro-suite.v2.js`
- `assets/css/pro-suite.v2.css`
- `assets/js/inline-bundles/b.analysis.logbook.bridge.v2.20260221.js`
- `js/build.loader.js`
- `js/build.ver.js`

## 빌드 점검
- `npm run build` 성공
- `assets/js/build.ver.js` 재생성 완료
- `build.txt` 재생성 완료

## 주의
- `/odds/`는 요청대로 건드리지 않음.
- 로그북 페이지 자체는 삭제하지 않았고, 전면 노출/연결만 정리한 상태.
