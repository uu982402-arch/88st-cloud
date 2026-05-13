# 오늘의 확인판 수동 업데이트 양식 (2026-05-07)

아래 항목만 바꾸면 됩니다.

```json
{
  "today": {
    "title": "오늘의 확인판",
    "updated": "2026-05-07",
    "providers": [
      {
        "name": "여왕벌",
        "code": "SEOA",
        "status": "가입코드 확인 가능",
        "link": "/consult/queenbee/"
      },
      {
        "name": "SK 홀딩스",
        "code": "IRON888",
        "status": "이벤트 조건 확인 필요",
        "link": "/consult/sk-holdings/"
      },
      {
        "name": "ANY BET",
        "code": "SEOA",
        "status": "원화·테더 이벤트 확인",
        "link": "/consult/anybet/"
      },
      {
        "name": "UDT",
        "code": "SEOA",
        "status": "슬롯·스포츠 이벤트 확인",
        "link": "/consult/udt/"
      }
    ],
    "checks": [
      "공식주소와 가입코드 확인",
      "이벤트 조건표 캡처",
      "고객센터 답변 저장",
      "출금 전 롤링·제한 조건 확인"
    ]
  }
}
```

수정 후 `/tools/today-check/`에서 화면 반영을 확인하세요.
