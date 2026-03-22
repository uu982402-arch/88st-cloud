
# OPS 통합 Search Console + GA Data API 대시보드 설정

## 화면 경로
- 운영판: `/ops/#ops-analytics`
- 기존 `/seo/`는 OPS 안내 페이지로 유지

## 필요한 Worker env

### Search Console
- `ADMIN_TOKEN`
- `DB`
- `GSC_SITE_URL`
- `GSC_CLIENT_ID`
- `GSC_CLIENT_SECRET`
- `GSC_REFRESH_TOKEN`

### Google Analytics Data API
필수:
- `GA_PROPERTY_ID`

권장(서비스계정):
- `GA_SERVICE_ACCOUNT_EMAIL`
- `GA_SERVICE_ACCOUNT_PRIVATE_KEY`

대안(OAuth refresh token):
- `GA_CLIENT_ID`
- `GA_CLIENT_SECRET`
- `GA_REFRESH_TOKEN`

선택:
- `GA_USE_GSC_OAUTH=1`
  - 기존 GSC refresh token에 `analytics.readonly` 권한까지 포함되어 있을 때만 사용

## 권장 설정 순서
1. Google Cloud에서 **Google Analytics Data API v1** 활성화
2. 서비스계정 생성
3. GA4 속성에 서비스계정 이메일을 읽기 권한으로 추가
4. Cloudflare Worker env에 `GA_PROPERTY_ID`, `GA_SERVICE_ACCOUNT_EMAIL`, `GA_SERVICE_ACCOUNT_PRIVATE_KEY` 저장
5. `/ops/#ops-analytics` 접속 후 `ADMIN_TOKEN` 저장 → 새로고침

## 참고
- 운영자 페이지(`/ops/`, `/seo/`, `/admin/`)는 GA 페이지뷰에서 제외되도록 같이 정리함
- Search Console 데이터 동기화는 기존 `/api/seo/sync` 유지
- GA 데이터는 `/api/ops/ga/summary`에서 실시간 조회
