# V66 엔지니어링 검증 포인트

## 완료 검증

- npm run build 실행 대상에 V66 생성 스크립트 포함
- sitemap.txt URL 매칭 리포트 생성
- 모든 HTML에 V66 CSS/JS 주입
- /guaranteed 카드 구조 직접 리뉴얼

## 해상도 체크리스트

- 320px: 카드 1열, 버튼 44px 이상, 상담 FAB 축약 표시
- 390px~430px: 모바일 하단 5탭 정상, 텍스트 줄바꿈 방어
- 768px~1024px: 카드 자동 1~2열 확장
- 1100px 이상: 모바일 하단바 숨김, PC 헤더만 노출
- 1920px~2560px: max-width 확장, 카드 그리드 3열 대응

## 예외 처리

- 이미지 로딩 실패 시 display none 처리 및 data-image-error 부여
- clipboard 실패 시 페이지 오류 없이 토스트 흐름 유지
- 기존 footer/header는 숨김 처리 후 V66 공통 컴포넌트 삽입
- 기존 라우팅과 외부 링크는 유지
