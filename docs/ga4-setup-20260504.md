# GA4 설정 완료 (2026-05-04)

## 측정 ID
- G-KWT87FBY6S

## 적용 상태
- /assets/config/analytics.ga4.json 활성화 완료
- /assets/js/ga4.v1.20260504.js 전 페이지 삽입 완료
- page_view 자동 수집 활성화
- IP 익명화 옵션 포함

## 배포 후 확인
1. GitHub/Cloudflare Pages에 업로드
2. https://88st.cloud/?v=ga4-20260504 접속
3. Google Analytics > 실시간 보고서에서 접속 이벤트 확인
4. 브라우저 개발자도구 Elements에서 `<html data-ga4="active">`가 보이면 정상 로딩

## 주의
광고 차단기나 iOS 개인정보 보호 기능이 켜져 있으면 일부 방문은 GA4에 잡히지 않을 수 있습니다.
