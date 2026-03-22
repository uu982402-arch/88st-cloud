# 모바일·속도 점검 리포트

- 생성일: 2026-03-22

## 자동 점검 기준

- viewport 존재 여부
- defer/async 없는 스크립트
- loading 속성 없는 이미지
- alt 누락 이미지
- width/height 누락 이미지
- 일반적인 내부 링크 문구

## 요약

- viewport 누락: 0
- defer/async 없는 script: 0
- loading 속성 없는 이미지: 0
- alt 없는 이미지: 0
- width/height 없는 이미지: 0
- 일반 내부링크 문구: 0

## 권장 순서

1. 이미지 width/height 고정
2. 본문 아래 이미지 lazy 로드 정리
3. 일반 버튼 문구를 주제형 링크로 치환
4. render-blocking script 제거 또는 defer 처리
