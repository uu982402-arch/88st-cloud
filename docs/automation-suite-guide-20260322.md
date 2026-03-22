# 자동화 운영 가이드

## 이번 패치로 추가된 자동화
- 제목·설명·canonical·OG 자동 최적화
- BreadcrumbList / Article / CollectionPage 구조화데이터 자동 생성
- 사이트맵 재생성
- 색인 점검 리포트 자동 생성
- 색인 우선순위 문서 자동 생성
- 중복 제외 신규 글 로드맵 자동 생성
- 모바일·속도 점검 리포트 자동 생성
- 관련 글 / 다음 동선 자동 갱신

## 실행 명령
```bash
npm run seo:static
npm run related:static
npm run sitemap:static
npm run audit:index
npm run indexing:priority
npm run topics:report
npm run audit:mobile
npm run seo:refresh
```

## 권장 운영 순서
1. 신규 글 추가 또는 수정
2. `npm run seo:refresh` 실행
3. `docs/indexing-priority-20260322.md` 기준으로 핵심 URL만 Search Console 수동 요청
4. `docs/indexing-audit-20260322.md`에서 이슈 여부 확인
5. `docs/content-gap-roadmap-20260322.md`에서 다음 글 주제 선택

## 자동 생성 파일
- `sitemap.xml`
- `sitemap.txt`
- `serverless/sitemap.xml`
- `assets/data/indexing.audit.v1.20260322.json`
- `assets/data/content.gaps.v1.20260322.json`
- `docs/indexing-audit-20260322.md`
- `docs/indexing-priority-20260322.md`
- `docs/content-gap-roadmap-20260322.md`
- `docs/mobile-speed-audit-20260322.md`

## 주의
- `/admin/`, `/ops/`, `/seo/` 는 자동으로 noindex 대상으로 유지됩니다.
- 공개 글은 canonical과 구조화데이터가 자동 보정됩니다.
- OG 이미지는 카테고리별 기본 이미지를 우선 사용합니다.
