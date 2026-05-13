# Provider Image Guidelines

88ST.Cloud 보증업체 이미지 관리 기준입니다.

## 로고 규칙
- 카드 로고는 PNG 투명 배경을 기본으로 사용합니다.
- 흰색 또는 검은색 사각 배경이 남은 로고는 등록하지 않습니다.
- 권장 크기: 가로 400px 이상, 세로 120px 이상.
- 가로형 로고를 우선 사용합니다.
- 카드 내부에서는 `object-fit: contain` 기준으로 표시합니다.

## 파일명 규칙
- 여왕벌: `queenbee-logo-transparent.png`
- SK 홀딩스: `sk-holdings-logo.png`
- ANY BET: `anybet-logo.png`
- UDT: `udt-logo-transparent.png`
- 체스: `chess-logo.png`

## 교체 시 확인
1. `/assets/data/guaranteed.providers...json`의 `imageUrl` 확인
2. `/guaranteed/` 카드 출력 확인
3. 메인 업체 카드 확인
4. 업체별 상담 허브 확인
5. 모바일에서 로고가 잘리지 않는지 확인
6. 캐시 회피용 파일명 또는 CSS 버전 갱신

## 금지
- 로고 안에 큰 흰색/검은색 배경을 그대로 두는 것
- 지나치게 작은 로고 파일 사용
- 업체별 카드마다 크기 기준을 다르게 두는 것
