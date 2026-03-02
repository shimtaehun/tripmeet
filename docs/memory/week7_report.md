# Week 7 작업 보고서 - 동행 구인 게시판

> 작성일: 2026-03-02

---

## 완료된 작업

### 백엔드 (7-1-1 ~ 7-1-7)

- `backend/app/routers/companions.py` 신규 생성
  - `GET /companions`: status 필터(open/closed) + cursor 기반 페이지네이션 (20개씩)
  - `POST /companions`: destination, travel_start_date, travel_end_date, description, max_participants 입력
  - `GET /companions/{id}`: 상세 조회 + 작성자 본인에게만 신청자 목록(applicant 정보 포함) 반환
  - `PATCH /companions/{id}/close`: 모집 마감 (작성자만, 이미 마감 시 400)
  - `POST /companions/{id}/apply`: 동행 신청 (중복 신청 400, 본인 게시글 400, 마감 게시글 400)
  - `PATCH /companions/{id}/applications/{application_id}`: 수락/거절 (작성자만)
- `backend/app/main.py` 수정: companions 라우터 등록

### 프론트엔드 (7-2-1 ~ 7-2-5)

- `src/services/companionService.ts` 신규 생성: 동행 구인 CRUD + 신청/수락/거절 전체
- `src/screens/companion/CompanionScreen.tsx` 전면 수정
  - 전체/모집중/마감 탭 필터
  - 목적지, 날짜, 설명, 인원, 모집 상태 배지 카드 FlatList
  - cursor 기반 무한 스크롤, pull-to-refresh
- `src/screens/companion/CompanionCreateScreen.tsx` 신규 생성
  - 여행지, 시작/종료일(YYYY-MM-DD), 최대 인원(2~10), 설명 입력
  - 날짜 형식 및 순서 유효성 검사
- `src/screens/companion/CompanionDetailScreen.tsx` 신규 생성
  - 게시글 내용 + 모집 상태 배지 표시
  - 비작성자: 신청 메시지 입력 + 신청 버튼 (마감 시 숨김)
  - 작성자: 신청자 목록 (대기중/수락/거절 배지) + 수락/거절 버튼
  - 작성자 마감 버튼
- `src/navigation/RootNavigator.tsx` 수정: CompanionCreate, CompanionDetail 스택 추가

---

## 발견된 문제 / 주의사항

1. **날짜 입력 방식**
   - 날짜 피커 라이브러리 미사용 (신규 라이브러리 추가 금지 원칙)
   - YYYY-MM-DD 텍스트 직접 입력 방식, 정규식 검사로 보완

2. **신청 후 중복 신청 UI 처리 미완**
   - 신청 후 화면 내에서 "신청됨" 상태 표시 없음 (goBack 없이 신청만 완료)
   - MVP 수준에서 허용, 재진입 시 서버에서 400 에러로 방어됨

3. **updated_at 수동 갱신**
   - companions 테이블에 updated_at 자동 갱신 트리거 없음 (posts와 동일)
   - close 엔드포인트에서만 updated_at 수동 갱신 처리

---

## 다음 작업 (Week 8: 테스트 코드 작성 및 배포 준비)

- [8-1-1] tests/conftest.py: pytest fixture
- [8-1-2] tests/test_auth.py
- [8-1-3] tests/test_itineraries.py
- [8-1-4] tests/test_locations.py
- [8-2-1] render.yaml R2_ACCOUNT_ID → R2_ENDPOINT_URL 수정
- [8-2-2] frontend/app.json scheme 추가
- [8-2-3] frontend/eas.json EAS Build 프로필 정의
- [8-2-4] Supabase 리다이렉트 URL 등록 (수동 작업)
- [8-2-5] Render.com 환경변수 등록 및 배포 (수동 작업)
