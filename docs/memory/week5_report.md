# Week 5 작업 보고서 - 커뮤니티 게시판

> 작성일: 2026-03-02

---

## 완료된 작업

### 백엔드 (5-1-1 ~ 5-1-6)

- `backend/app/routers/posts.py` 신규 생성
  - `GET /posts`: category 필터 + cursor 기반 페이지네이션(20개씩)
  - `POST /posts`: 게시글 작성 (category/title/content, 인증 필수)
  - `GET /posts/{id}`: 상세 조회 + view_count +1 + 작성자 정보 포함
  - `PATCH /posts/{id}`: 수정 (작성자 본인만, updated_at 수동 갱신)
  - `DELETE /posts/{id}`: 삭제 (작성자 본인만)
- `backend/app/main.py` 수정: posts 라우터 등록

### 프론트엔드 (5-2-1 ~ 5-2-5)

- `src/services/postService.ts` 신규 생성: 게시글 CRUD API 호출 함수 전체
- `src/screens/community/CommunityScreen.tsx` 전면 수정
  - 카테고리 탭 필터 (전체/질문/후기/정보)
  - FlatList + cursor 기반 무한 스크롤
  - 새로고침(pull-to-refresh) 지원
- `src/screens/community/PostCreateScreen.tsx` 신규 생성
  - 작성/수정 겸용 (route.params.post 유무로 분기)
  - 카테고리 선택, 제목/내용 입력, 등록/수정 버튼
- `src/screens/community/PostDetailScreen.tsx` 신규 생성
  - 게시글 본문, 작성자 정보, 조회수 표시
  - 작성자 본인에게만 수정/삭제 버튼 표시
  - 삭제 시 Alert 확인 후 처리
- `src/navigation/RootNavigator.tsx` 수정: PostCreate, PostDetail 스택 등록

---

## 발견된 문제 / 주의사항

1. **updated_at 자동 갱신 트리거 없음**
   - posts 테이블에 updated_at 자동 갱신 DB 트리거가 없음
   - PATCH 엔드포인트에서 Python 코드로 수동 갱신 처리 중
   - 필요 시 Supabase SQL에서 트리거 추가 권장

2. **조회수 증가 비원자적 처리**
   - `view_count + 1`을 코드에서 계산 후 UPDATE (레이스 컨디션 가능)
   - MVP 규모에서는 문제없음, 트래픽 증가 시 DB 함수(RPC)로 전환 필요

3. **맛집 탭 미연결**
   - `MainTabs.tsx`에 맛집 탭이 없음 (Week 6에서 추가 예정)
   - 현재는 커뮤니티 탭에서 접근하는 구조

---

## 다음 작업 (Week 6: 맛집 리뷰)

- [6-1-1] `app/routers/restaurants.py` 작성: GET /restaurants
- [6-1-2] POST /restaurants (이미지 최대 5장 R2 업로드)
- [6-1-3] GET /restaurants/{id}
- [6-1-4] DELETE /restaurants/{id}
- [6-1-5] main.py 라우터 등록
- [6-2-1] restaurantService.ts 작성
- [6-2-2] RestaurantListScreen.tsx 작성
- [6-2-3] RestaurantCreateScreen.tsx 작성 (이미지 선택→압축→업로드)
- [6-2-4] RestaurantDetailScreen.tsx 작성
- [6-2-5] RootNavigator.tsx 수정
