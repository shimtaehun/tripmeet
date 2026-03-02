# Week 8 작업 보고서 - 테스트 코드 작성 및 배포 준비

> 작성일: 2026-03-02

---

## 완료된 작업

### 핵심 API 단위 테스트 (8-1-1 ~ 8-1-4)

- `backend/requirements-dev.txt` 신규 생성: pytest, pytest-asyncio (프로덕션 배포 미포함)
- `backend/tests/__init__.py` 신규 생성
- `backend/tests/conftest.py` 신규 생성
  - FAKE_USER 상수 (테스트용 사용자 정보)
  - client fixture: get_current_user 의존성을 FAKE_USER로 교체한 TestClient
  - Supabase 모킹은 각 테스트 파일에서 unittest.mock.patch로 처리 (신규 라이브러리 없음)
- `backend/tests/test_auth.py`: POST /auth/sync-user 2케이스
  - 기존 사용자: DB 조회 결과 있음 → is_new_user=False
  - 신규 사용자: DB 조회 결과 없음 → INSERT 후 is_new_user=True
- `backend/tests/test_itineraries.py`: POST /itineraries 2케이스
  - 캐시 미스: get_or_generate_itinerary 호출 → INSERT → is_cached=False
  - 캐시 히트: DB에 cache_key 존재 → INSERT 미호출 → is_cached=True
- `backend/tests/test_locations.py`: 2케이스
  - POST /locations: UPDATE(비활성화) + INSERT(등록) 모두 호출됨 확인
  - GET /locations: 여행자 목록 반환 형식 확인

### 배포 준비 (8-2-1 ~ 8-2-3)

- `backend/render.yaml` 수정: R2_ACCOUNT_ID → R2_ENDPOINT_URL (storage_service.py와 일치)
- `frontend/app.json` 수정
  - name: "frontend" → "TripMeet"
  - slug: "frontend" → "tripmeet"
  - scheme: "tripmeet" 추가 (딥링크 `tripmeet://auth/callback` 동작 필수)
  - iOS bundleIdentifier, Android package: "com.tripmeet.app"
- `frontend/eas.json` 신규 생성: development/preview/production EAS Build 프로필

---

## 잔여 수동 작업 (개발자 직접 수행 필요)

### [8-2-4] Supabase 대시보드
- Authentication > URL Configuration > Redirect URLs에 추가:
  - `tripmeet://auth/callback` (프로덕션 빌드)
  - `exp://127.0.0.1:8081/--/auth/callback` (Expo Go 로컬 개발)

### [8-2-5] Render.com 대시보드
- Environment 탭에서 환경변수 11개 등록:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - OPENAI_API_KEY
  - UPSTASH_REDIS_REST_URL
  - UPSTASH_REDIS_REST_TOKEN
  - R2_ENDPOINT_URL (구: R2_ACCOUNT_ID — render.yaml 수정 완료)
  - R2_ACCESS_KEY_ID
  - R2_SECRET_ACCESS_KEY
  - R2_BUCKET_NAME
  - R2_PUBLIC_URL
- 배포 후 `GET /health` → `{"status": "ok"}` 응답 확인

---

## Phase 2 전체 완료 요약

| 주차 | 기능 | 상태 |
|------|------|------|
| Week 5 | 커뮤니티 게시판 (CRUD) | 완료 |
| Week 6 | 맛집 리뷰 (이미지 업로드) | 완료 |
| Week 7 | 동행 구인 + 신청/수락/거절 | 완료 |
| Week 8 | 테스트 코드 + 배포 준비 | 코드 완료, 수동 작업 잔여 |
