# RELEASE NOTES · 2026-03-16 · COMMUNITY V2

## 핵심 변경
- 메인 인덱스를 스포츠 커뮤니티 허브형으로 전면 재구성
- 웹 스포츠 분석기와 텔레그램 스포츠 봇을 메인에서 명확히 분리
- 해외 스포츠 뉴스 카드 섹션 추가 (/api/news)
- /analysis/ 헤더를 핵심 동선 중심으로 단순화
- /odds/ 문구 및 CTA를 텔레그램 스포츠 봇 허브 관점으로 정리
- robots, sitemap, redirects, headers 재정리

## SEO/유입 구조
- 메인: 허브 + 뉴스 + 서비스 진입
- analysis: 웹 분석기 허브
- odds: 텔레그램 스포츠 봇 허브
- admin / tg-match-entry: noindex 처리

## 비고
- 뉴스 API는 ESPN 공식 RSS 피드를 사용하도록 구성
- 외부 피드 실패 시 홈이 깨지지 않도록 대체 카드 표시
