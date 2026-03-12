# 88ST 리뉴얼 패치 노트 (2026-03-13)

## 목표
- 기존 기능 유지
- 스포츠 분석기 성능 향상
- 버튼/모달/캐시 안정성 강화
- 모바일/PC 공통 톤 정리
- 빌드 가능한 ZIP 패키지 제공

## 변경 파일 요약

### 1) 빌드/캐시/공통 안정성
- `scripts/gen-build-ver.mjs`
  - 전역 로더에 포함되는 핵심 자산 목록을 확장했습니다.
  - 이제 `ui.fix`, `ui.guard`, `site.runtime`, `share.session`, `global.unify`가 빌드 산출물(`build.ver.js`)에 자동 포함됩니다.
- `assets/js/build.ver.js`
  - 새 빌드 버전과 전역 자산 목록으로 재생성했습니다.
- `build.txt`
  - 새 빌드 정보로 갱신했습니다.

### 2) 전 페이지 디자인/상호작용 통일
- `assets/css/global.unify.v1.20260313.css`
  - 버튼 높이/라운드/포커스 스타일 통일
  - 입력창/셀렉트/텍스트영역 높이 정리
  - 카드/모달/헤더 그림자와 반경 통일
  - 모바일 버튼 줄바꿈 규칙 정리
- `assets/js/global.unify.v1.20260313.js`
  - 헤더 details 메뉴 단일 오픈 처리
  - `target="_blank"` 링크에 `noopener noreferrer` 보강
  - 공통 닫기 트리거에서 `lb-modal` 안정적으로 닫히도록 보강

### 3) 스포츠 분석기 고도화
- `analysis/index.html`
  - 타이틀/설명 문구를 정밀 분석기 톤으로 갱신
  - 상단 설명 문구를 기존 계산 로직 + 추가 엔진 구조로 정리
  - 새 분석 엔진 스타일/스크립트 로드
  - 중복 로드되던 `j.efba3509e62c.js` 하단 호출 제거
- `assets/css/analysis.engine.v1.20260313.css`
  - 분석기 전용 신규 카드/테이블/AI 요약/스테이크 표 스타일 추가
- `assets/js/analysis.engine.v1.20260313.js`
  - 기존 입력 폼/결과를 유지한 채 아래 기능을 추가했습니다.
    - 다중 비그 제거 방식 비교: 정규화 / 파워 / 가산 / 언더독 보정 / Shin / Odds Ratio / Logit / Ensemble
    - 시장 합의(컨센서스) 분석: 평균 확률, 최고배당, 합의도
    - 오즈 무브 해석: 오픈 배당 대비 현재 배당과 확률 변화
    - 스테이크 제안: Ensemble 확률 기준 Kelly 1/4 · 1/2 · Full
    - AI 해설 요약: 가장 유리한 선택, 엣지, 관망/진입 해석

### 4) 홈/SEO 문구 정리
- `index.html`
  - 메타 설명, H1, 히어로 서브 문구를 더 깔끔한 분석 허브 톤으로 조정
- `config/seo.meta.json`
- `assets/config/seo.meta.json`
  - 홈 / analysis / cert / 주요 tool / guide 페이지용 SEO 초안 반영

### 5) 인증/랜딩 공통 톤 보강
- `cert/index.html`
- `cert/777/index.html`
- `cert/vegas/index.html`
  - `global.unify` CSS/JS를 직접 로드하도록 추가해 cert 계열 페이지도 공통 버튼/모달/타이포를 맞췄습니다.

## 빌드 확인
- 실행 명령: `npm run build`
- 결과: 성공

## 참고
- 기존 페이지/기능 삭제 없이 유지했습니다.
- `/odds/` 페이지는 요청에 따라 이번 패치 대상에서 제외했습니다.
- 보안 헤더(`_headers`)와 CSP 구조는 손상되지 않도록 유지했습니다.
