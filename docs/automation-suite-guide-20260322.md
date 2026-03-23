# SEO / 색인 / 내부링크 자동화 운영 가이드

- 기준일: 2026-03-22
- 기준본: 최신 `88st-cloud-main(1).zip`

## 추가된 자동화

1. 제목·설명·canonical·OG 자동 갱신
2. Article / Breadcrumb / CollectionPage 구조화 데이터 자동 생성
3. 사이트맵 자동 재생성
4. 색인/모바일·속도 점검 리포트 자동 생성
5. 수동 색인 요청 우선순위 문서 자동 생성
6. 중복 주제 감지 + 신규 글 추천 문서 자동 생성
7. 관련 글/다음 동선 자동 갱신
8. 일반적인 내부링크 문구를 제목형 링크로 자동 치환
9. 기본 OG 대표 이미지 자동 지정
10. 비공개 페이지 noindex/canonical 유지

## 실행 명령

```bash
npm run seo:static
npm run related:static
npm run sitemap:static
npm run audit:index
npm run indexing:priority
npm run topics:report
npm run seo:refresh
```

## 가장 자주 쓰는 순서

새 글을 추가하거나 HTML을 수정한 뒤:

```bash
npm run seo:refresh
```

## 생성되는 결과물

- `sitemap.xml`
- `sitemap.txt`
- `serverless/sitemap.xml`
- `docs/indexing-audit-20260322.md`
- `docs/mobile-speed-audit-20260322.md`
- `docs/indexing-priority-20260322.md`
- `docs/content-gap-roadmap-20260322.md`
- `assets/data/indexing.audit.v1.20260322.json`
- `assets/data/content.gaps.v1.20260322.json`

## 운영 팁

- 새 글 발행 후 허브 노출 → `npm run seo:refresh` → Search Console 핵심 URL만 수동 요청
- 신규 글은 기존 글과 제목/키워드가 겹치지 않도록 `content-gap-roadmap` 먼저 확인
- 검색 반영이 느린 경우 `indexing-audit`에서 canonical/robots/사이트맵 누락부터 점검
