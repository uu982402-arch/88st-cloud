# QA 결과 - 전문 블로그형 A안 개편 (2026-05-03)

## 생성/유지
- 신규 카테고리 허브: 7개
- 1차 신규 글: 28개
- 기존 여왕벌 SEOA 글 10개 및 허브 유지
- 보증업체 4개 유지: 여왕벌, Any Bet, UDT, SK 홀딩스
- SK 홀딩스 로고 유지: /assets/provider-media/sk-holdings-logo.png

## 제거/리다이렉트
- 코인 관련 디렉터리/파일 FULL ZIP에서 제거
- /coins/*, /exchanges/*, /price-gap/, /market-movers/ 등 301 리다이렉트 추가
- 삭제 파일 목록: DELETE_FILES_20260504_BLOG_PRO_REBUILD.txt

## 검수
- HTML 파싱 오류: 0
- JSON 파싱 오류: 0
- 주요 JS syntax check: 통과
- sitemap.xml 파싱: 통과
- npm run build: 통과
- 내부 링크 누락: 0
- 신규 글 28개 본문 길이: 1,000자 이상 충족
- 로컬 HTTP 200 확인: 메인, 블로그, 7개 허브, 주요 글, 보증업체, 도구, CSS, SK 로고, sitemap, robots

## SEO
- 메인 title/description을 스포츠토토·온라인카지노·슬롯·미니게임 정보 블로그 중심으로 변경
- 블로그 허브를 전문 블로그형으로 변경
- 7개 카테고리별 title, description, canonical, OG, Twitter, JSON-LD 포함
- sitemap.xml / sitemap.txt / serverless sitemap 갱신
- robots.txt Sitemap 라인 유지

## 주의
PATCH ZIP만 적용하면 삭제 파일은 GitHub에서 자동 제거되지 않을 수 있습니다.
완전 정리는 FULL ZIP 기준 덮어쓰기를 권장합니다.
