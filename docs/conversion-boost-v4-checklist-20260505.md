# 상담 전환 강화 v4 운영 체크리스트 (2026-05-07)

## 3~7일 수집할 GA4 이벤트
- consult_open
- consult_provider_select
- consult_code_copy
- consult_official_click
- consult_telegram_click
- consult_faq_open
- safe_click_open
- safe_click_confirm
- inquiry_builder_copy
- payout_template_copy

## 핵심 계산식
1. 텔레그램 이동률 = consult_telegram_click / consult_open
2. 페이지별 상담 오픈 = consult_open 을 page_path 기준으로 정렬
3. 공식주소 이동률 = consult_official_click / consult_code_copy
4. FAQ 의존도 = consult_faq_open / consult_open

## 상담 버튼 A/B 후보
- 자동상담
- 가입 안내
- 코드 확인
- 상담받기

방문자별 버튼 문구는 localStorage로 고정됩니다.

## 수동 점검
- 모바일에서 상담창 하단이 잘리지 않는지
- 세이프클릭 확인창이 공식주소 이동 전 정상 표시되는지
- 문의 문구 생성기가 복사되는지
- 출금 전 증거 키트 문의 유형별 문구가 달라지는지
- 업체별 이벤트 조건표 카드가 노출되는지
