# Analytics / GSC 운영 점검

- generatedAt: 2026-03-22T15:35:29.145Z
- measurementIds: G-KWT87FBY6S
- public loader: assets/js/mobile.enhance.v1.20260317.js
- operator loaders: assets/js/build.loader.js, admin/index.html
- public page count: 133
- sitemap urls: 133
- operator excluded: yes

## 왜 Analytics에 잡히는가

- 공개 페이지는 mobile.enhance 스크립트에서 GA4를 초기화합니다.
- gtag config에서 send_page_view=true라 공개 페이지 진입 시 page_view가 자동 수집됩니다.
- 운영자 페이지(/admin/, /ops/, /seo/)는 이번 패치로 수집 제외됩니다.