# TripMeet 현재 상태 보고서

> 작성일: 2026-03-02

---

## 완료된 작업

### Phase 1 전체 완료 (1~4주차)

- 외부 서비스 설정 완료 (Supabase, Firebase, Cloudflare R2, Upstash Redis, OpenAI)
- 백엔드 FastAPI 전체 구조 완성 (main.py, routers 4개, services 2개, middleware, db)
- 프론트엔드 React Native 전체 구조 완성 (navigation, screens 전체, services, store, utils)
- frontend/.env, backend/.env 실제 값 입력 완료
- 인증 방식: 카카오 아닌 구글 OAuth로 변경됨

### 오늘 수정한 버그 (2026-03-02)

1. **LoginScreen.tsx** - 구글 OAuth 팝업 2개 뜨는 버그 수정
   - `useRef`로 중복 호출 방지 guard 추가
   - PKCE 코드 교환 로직 추가 (`exchangeCodeForSession`)

2. **RootNavigator.tsx** - 로그인 후 흰 화면 버그 수정
   - `Linking.addEventListener` 딥링크 리스너 추가 (fallback)
   - `Linking.getInitialURL()` 처리 추가

---

## 미완료 항목

### Phase 2 전체 미착수 (5~8주차)

checklist.md 참조:
- 커뮤니티 게시판 CRUD (5-1, 5-2)
- 맛집 리뷰 CRUD (6-1, 6-2)
- 동행 구인 게시판 CRUD + 신청/수락 (7-1, 7-2)
- 테스트 코드 작성 (8-1)
- 배포 준비 (8-2)

---

## 발견된 문제점

### 긴급 (배포 전 반드시 수정)

1. **render.yaml 환경변수 불일치** [8-2-1]
   - `render.yaml`에 `R2_ACCOUNT_ID`로 등록되어 있음
   - 실제 코드(`storage_service.py`)는 `R2_ENDPOINT_URL` 사용
   - Render.com 배포 시 이미지 업로드 전체 실패
   - 수정 방법: `render.yaml`의 `R2_ACCOUNT_ID` → `R2_ENDPOINT_URL`로 변경

2. **Supabase 콜백 URL 미등록 가능성** [1-1-2]
   - Supabase 대시보드 Authentication > URL Configuration에서
   - Expo Go URL (`exp://192.168.x.x:8081/--/auth/callback`) 등록 여부 확인 필요
   - 미등록 시 구글 OAuth 리다이렉트가 차단됨

3. **app.json scheme 미설정** [8-2-2]
   - 현재 `scheme` 필드 없음
   - Expo Go 개발 중에는 `exp://` 스킴으로 동작하지만 스탠드얼론 빌드 시 딥링크 미동작

### 코드 품질 (Phase 2 전 개선 권장)

4. **authStore.ts 미사용 코드**
   - `AuthProvider`와 `useAuth` 훅이 정의되어 있으나 어디서도 import하지 않음
   - `App.tsx`는 `RootNavigator`만 직접 사용
   - Phase 2 화면에서 `useAuth()`를 쓰려면 `App.tsx`에 `AuthProvider`로 감싸야 함
   - 또는 각 화면에서 `supabase.auth.getSession()`을 직접 호출하는 방식으로 통일

5. **auth.py 미들웨어 성능**
   - `get_current_user` 함수가 호출될 때마다 새 Supabase 클라이언트 생성
   - MVP 규모에서는 문제없음, 트래픽 증가 시 싱글톤으로 리팩터링 필요

---

## 다음 작업 우선순위

1. **[즉시]** Supabase 대시보드에서 Expo Go 리다이렉트 URL 등록 확인 (로그인 버그 근본 원인일 수 있음)
2. **[Phase 2 시작 전]** `render.yaml` 수정 [8-2-1]
3. **[Phase 2 시작 전]** `authStore.ts` 사용 방침 결정 (AuthProvider 도입 or 제거)
4. **[Phase 2]** 커뮤니티 게시판 백엔드부터 순서대로 진행 ([5-1-1] → [5-1-2] → ...)

---

## 파일 구조 현황

### 백엔드 (`backend/`)

```
app/
  main.py                    완료
  db/supabase_client.py      완료
  middleware/auth.py         완료
  routers/
    auth.py                  완료
    users.py                 완료
    locations.py             완료
    itineraries.py           완료
    posts.py                 미작성 (Phase 2)
    restaurants.py           미작성 (Phase 2)
    companions.py            미작성 (Phase 2)
  services/
    ai_service.py            완료
    storage_service.py       완료
requirements.txt             완료
render.yaml                  완료 (R2_ENDPOINT_URL 키 이름 버그 있음)
.env                         완료 (실제 값 입력됨)
```

### 프론트엔드 (`frontend/`)

```
src/
  navigation/
    RootNavigator.tsx        완료 (딥링크 리스너 추가됨)
    MainTabs.tsx             완료
  screens/
    auth/LoginScreen.tsx     완료 (PKCE 교환 + 중복 방지 추가됨)
    home/HomeScreen.tsx      완료
    matching/ (3개)          완료
    community/CommunityScreen.tsx  완료 (목록 화면 껍데기)
    chat/ (2개)              완료
    companion/CompanionScreen.tsx  완료 (목록 화면 껍데기)
    profile/ (2개)           완료
    itinerary/ (2개)         완료
  services/
    supabaseClient.ts        완료
    firebaseClient.ts        완료
    chatService.ts           완료
  store/authStore.ts         완료 (미사용 상태)
  utils/imageCompressor.ts   완료
app.json                     scheme 미설정 (배포 전 추가 필요)
.env                         완료 (실제 값 입력됨)
```
