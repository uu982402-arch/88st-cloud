# Provider Update Guide

업체 추가/수정 시 운영자가 확인할 문서입니다.

## 수정 대상
- `/assets/data/guaranteed.providers.v1.20260330.json`
- `/assets/data/auto.consult.v1.20260505.json`
- `/assets/data/conversion.boost.v4.20260505.json`
- `/guaranteed/index.html`
- `/consult/{provider}/`
- `/search-guides/{provider}-code.html`
- `sitemap.xml`
- `assets/config/seo.meta.json`

## 업체 추가 순서
1. 로고를 `/assets/provider-media/`에 추가합니다.
2. provider JSON에 `slug`, `name`, `cleanName`, `officialUrl`, `code`, `imageUrl`, `summary`, `conditionCards`, `checks`를 추가합니다.
3. `/guaranteed/` 카드 순서를 확인합니다.
4. 업체별 상담 허브를 생성합니다.
5. 검색 가이드 페이지를 생성합니다.
6. sitemap과 seo.meta.json을 갱신합니다.
7. GA4 이벤트가 잡히는지 확인합니다.

## 가입코드 변경
1. provider JSON의 `code`와 `displayCode`를 변경합니다.
2. 상담 허브와 검색 가이드 문구를 함께 변경합니다.
3. `/guaranteed/`에서 코드 복사 버튼을 확인합니다.
4. Search Console 색인 요청이 필요한지 판단합니다.

## 공식주소 변경
1. `officialUrl`과 `officialDomain`을 변경합니다.
2. 접속 버튼 클릭 시 새 창 이동을 확인합니다.
3. 기존 주소가 남아 있는지 전체 검색합니다.

## 배포 후 확인
- `/guaranteed/?v=latest`
- `/consult/{provider}/?v=latest`
- `/blog/?v=latest`
- `/sitemap.xml`
