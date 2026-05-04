# 색인 404 / 색인 혼선 정리

## 확인된 문제
- sitemap에 `noindex` 또는 `X-Robots-Tag: noindex` 대상 URL이 포함되어 있었음
- 공개용 데이터 파일에 예전 섹션(`/slot/`, `/bonus/`, `/strategy/`, `/news/`, `/play-guides/`, `/latest/`, `/popular/`, `/archive/`) 경로가 남아 있었음
- `_worker.js`에서 누락 경로에 대한 명시적 404 HTML 응답이 없어 진단이 어려웠음
- 대량의 오래된 경로가 허브/홈으로만 모이는 리다이렉트 패턴은 Google에서 soft 404로 해석될 여지가 있음

## 반영 방향
- sitemap은 실제 색인 대상 URL만 포함
- noindex 대상은 생성 단계에서 제외
- 사라진 섹션 하위 경로는 410 Gone 또는 명확한 404/noindex 응답
- 대표 허브 별 정확한 진입점만 남김

## 배포 후 점검
1. `https://88st.cloud/sitemap.xml` 재제출
2. Search Console에서 404/soft 404 샘플 URL 다시 검사
3. `/slot/...`, `/bonus/...`, `/play-guides/...` 과거 URL 3~5개 직접 열어 상태 확인
4. 2주 정도 색인 리포트 변동 추적
