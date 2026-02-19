# 88ST 커뮤니티 MVP 게시판 (Cloudflare Pages Functions + D1 + Turnstile)

이 ZIP에는 **정적 페이지 UI** + **/api 백엔드(Functions)** + **D1 스키마**가 포함되어 있습니다.

## 1) Turnstile 설정
1. Cloudflare Dashboard → Turnstile → **Add site**
2. 도메인: `88st.cloud`
3. 발급된 **Site Key**를 아래 파일에 입력:
   - `assets/config/community.json` → `turnstileSiteKey`

4. 발급된 **Secret Key**는 Pages(또는 Worker) 환경변수로 설정:
   - 변수명: `TURNSTILE_SECRET`

## 2) D1 설정
1. Cloudflare Dashboard → D1 → **Create database**
2. `d1/schema.sql` 내용을 실행해 테이블 생성
3. Cloudflare Pages → Settings → Functions → **D1 database bindings**
   - Binding name: `DB` (권장)
   - Database: (방금 만든 D1)

> 이미 예전 스키마로 테이블을 만들어둔 경우(= posts 테이블에 board 컬럼이 없는 경우)
> D1 콘솔에서 아래 마이그레이션을 1회 실행하세요:
> - `d1/migrations/0002_add_board.sql`

## 3) 배포 후 URL
- 목록: `/community/`
- 홍보 목록: `/community/promo/`
- 글쓰기: `/community/write/`
- 홍보 글쓰기: `/community/promo/write/`
- 글 상세: `/community/post/?id=123`

## API
- `GET /api/posts?board=free|promo&sort=latest|hot&q=...`
- `POST /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts/:id/comments`

## MVP 제한(의도적으로 가볍게)
- 익명 닉네임 기반
- Turnstile 필수(스팸 방지)
- IP 기준 간단한 Rate Limit (글 3/5분, 댓글 8/5분)

## 참고
- D1 바인딩 이름을 `88stcloud`로 만들어둔 경우에도 동작하도록 호환 처리했습니다.
  (그래도 가능하면 다음 배포부터는 `DB`로 통일 추천)

원하면 다음 버전에서:
- 관리자 모드(숨김/삭제), 신고, 좋아요, 해시태그, 검색 고도화
- pinned 공지 / 카테고리 / 파일첨부(또는 이미지 링크 검증)
까지 확장 가능.
