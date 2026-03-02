# Week 6 작업 보고서 - 맛집 리뷰

> 작성일: 2026-03-02

---

## 완료된 작업

### 백엔드 (6-1-1 ~ 6-1-5)

- `backend/app/routers/restaurants.py` 신규 생성
  - `GET /restaurants`: location_name ilike 필터 + cursor 기반 페이지네이션 (20개씩)
  - `POST /restaurants`: multipart 이미지 최대 5장, 500KB 제한 검증, R2 업로드
  - `GET /restaurants/{id}`: 상세 조회 + 작성자 정보 포함
  - `DELETE /restaurants/{id}`: 작성자 본인만 삭제 가능
- `backend/app/main.py` 수정: restaurants 라우터 등록

### 프론트엔드 (6-2-1 ~ 6-2-5)

- `src/services/restaurantService.ts` 신규 생성: 맛집 CRUD API 호출 함수 전체 (FormData multipart 포함)
- `src/screens/restaurant/RestaurantListScreen.tsx` 신규 생성
  - 지역 텍스트 검색 필터
  - FlatList 썸네일 + StarRating + 이름/위치 카드
  - cursor 기반 무한 스크롤, pull-to-refresh
- `src/screens/restaurant/RestaurantCreateScreen.tsx` 신규 생성
  - 가게 이름, 위치, 설명, 별점 (탭 선택) 입력
  - 갤러리에서 이미지 최대 5장 선택 (expo-image-picker)
  - compressImage로 500KB 이하 압축 후 createRestaurant 전송 (context.md 원칙 4 준수)
  - 썸네일 그리드 + X 버튼으로 개별 제거
- `src/screens/restaurant/RestaurantDetailScreen.tsx` 신규 생성
  - 이미지 가로 스크롤 (페이징 방식, 화면 너비 × 0.65 비율)
  - 가게 이름, 위치, 별점, 설명 표시
  - 작성자 본인에게만 삭제 버튼 표시
  - Alert 확인 후 삭제 처리
- `src/navigation/RootNavigator.tsx` 수정: RestaurantCreate, RestaurantDetail 스택 추가
- `src/navigation/MainTabs.tsx` 수정: 맛집 탭 추가 (커뮤니티-동행 사이)

---

## 발견된 문제 / 주의사항

1. **맛집 탭 위치**
   - 홈 / 매칭 / 커뮤니티 / **맛집** / 동행 / 내 정보 순서로 6개 탭 구성
   - 탭이 6개가 되어 좁아질 수 있음 — 향후 UX 재검토 권장

2. **이미지 삭제 미구현**
   - DELETE /restaurants/{id}는 DB 레코드만 삭제하고 R2 이미지는 그대로 남음
   - MVP 수준에서는 허용 범위, 추후 R2 객체 삭제 로직 추가 권장

3. **별점 수정 미지원**
   - 등록 후 수정 기능 없음 (삭제 후 재등록 방식)
   - 기획에 수정 기능이 없으므로 의도된 설계

---

## 다음 작업 (Week 7: 동행 구인)

- [7-1-1] `app/routers/companions.py` 작성: GET /companions
- [7-1-2] POST /companions
- [7-1-3] GET /companions/{id} (신청자 목록 포함)
- [7-1-4] PATCH /companions/{id}/close
- [7-1-5] POST /companions/{id}/apply
- [7-1-6] PATCH /companions/{id}/applications/{application_id}
- [7-1-7] main.py 라우터 등록
- [7-2-1] companionService.ts 작성
- [7-2-2] CompanionScreen.tsx 수정: 목록 FlatList (open/closed 탭)
- [7-2-3] CompanionCreateScreen.tsx 신규
- [7-2-4] CompanionDetailScreen.tsx 신규
- [7-2-5] RootNavigator.tsx 수정
