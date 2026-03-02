# TripMeet 개발 체크리스트

> 작업 규칙: 한 번의 지시에 체크박스 1개 항목만 작업한다. 완료 후 반드시 보고하고 정지한다.

---

## Phase 1: 기반 구축 및 핵심 기능 구현 (1~4주차)

---

### Week 1: 프로젝트 환경 구축

#### 1-1. 외부 서비스 초기화

- [x] **[1-1-1]** Supabase 프로젝트 생성 및 환경변수(URL, anon key, service role key) 메모
- [x] **[1-1-2]** Supabase Auth에서 구글 OAuth 제공자 활성화 및 콜백 URL 설정
- [x] **[1-1-3]** Cloudflare R2 버킷 생성 및 퍼블릭 접근 도메인 설정
- [x] **[1-1-4]** Upstash Redis 인스턴스 생성 및 REST URL/토큰 메모
- [x] **[1-1-5]** Firebase 프로젝트 생성 및 Firestore 데이터베이스 활성화 (테스트 모드)
- [x] **[1-1-6]** OpenAI API 키 발급 및 사용 한도 설정

#### 1-2. 백엔드 프로젝트 초기화

- [x] **[1-2-1]** FastAPI 프로젝트 폴더 생성 및 `requirements.txt` 작성 (fastapi, uvicorn, supabase, openai, redis, python-dotenv)
- [x] **[1-2-2]** `app/main.py` 작성: FastAPI 앱 인스턴스 생성, CORS 미들웨어 설정 (Expo 개발 서버 허용)
- [x] **[1-2-3]** `.env` 파일 작성: 모든 외부 서비스 환경변수 정의 (Supabase, OpenAI, Redis, R2)
- [x] **[1-2-4]** `app/db/supabase_client.py` 작성: Supabase 클라이언트 싱글톤 초기화
- [x] **[1-2-5]** `app/middleware/auth.py` 작성: Supabase JWT 토큰 검증 의존성 함수 (`get_current_user`)
- [x] **[1-2-6]** `render.yaml` 작성: Render.com 무료 티어 배포 설정 (웹 서비스, 환경변수 참조)

#### 1-3. 데이터베이스 스키마 생성

- [x] **[1-3-1]** Supabase SQL 에디터에서 `users` 테이블 생성 SQL 실행 (plan.md 스키마 기준)
- [x] **[1-3-2]** Supabase SQL 에디터에서 `travel_locations` 테이블 생성 SQL 실행 + (location_name, is_active) 인덱스 생성
- [x] **[1-3-3]** Supabase SQL 에디터에서 `itineraries` 테이블 생성 SQL 실행
- [x] **[1-3-4]** Supabase SQL 에디터에서 `posts` 테이블 생성 SQL 실행
- [x] **[1-3-5]** Supabase SQL 에디터에서 `restaurants` 테이블 생성 SQL 실행
- [x] **[1-3-6]** Supabase SQL 에디터에서 `companions` 테이블 생성 SQL 실행
- [x] **[1-3-7]** Supabase SQL 에디터에서 `companion_applications` 테이블 생성 SQL 실행 + 복합 유니크 제약 설정

#### 1-4. 프론트엔드 프로젝트 초기화

- [x] **[1-4-1]** `expo init tripmeet-app` 실행 (TypeScript 템플릿 선택)
- [x] **[1-4-2]** 필수 패키지 설치: `@supabase/supabase-js`, `expo-secure-store`, `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`
- [x] **[1-4-3]** `src/services/supabaseClient.ts` 작성: Supabase 클라이언트 초기화 (expo-secure-store 기반 세션 저장)
- [x] **[1-4-4]** `src/navigation/RootNavigator.tsx` 작성: 인증 여부에 따라 AuthStack / MainTabs 분기하는 최상위 네비게이터
- [x] **[1-4-5]** `src/navigation/MainTabs.tsx` 작성: 하단 탭 5개 정의 (홈, 매칭, 커뮤니티, 동행, 내 정보)

---

### Week 2: 인증 및 사용자 프로필

#### 2-1. 구글 OAuth 인증

- [x] **[2-1-1]** `app/routers/auth.py` 작성: `POST /auth/sync-user` 엔드포인트 (구글 로그인 후 users 테이블 동기화)
- [x] **[2-1-2]** `src/screens/auth/LoginScreen.tsx` 작성: 구글 로그인 버튼 UI 및 Supabase OAuth 호출 로직
- [x] **[2-1-3]** `src/store/authStore.ts` 작성: 로그인 세션 전역 상태 관리 (Context API 사용 — 신규 라이브러리 없음)
- [x] **[2-1-4]** Supabase `onAuthStateChange` 리스너 설정: 로그인/로그아웃 상태 변경 시 네비게이터 자동 전환 (RootNavigator.tsx에서 구현 완료)

#### 2-2. 사용자 프로필 API

- [x] **[2-2-1]** `app/routers/users.py` 작성: `GET /users/me` 엔드포인트 (JWT 인증 필수)
- [x] **[2-2-2]** `app/routers/users.py` 수정: `PATCH /users/me` 엔드포인트 추가 (nickname, bio 수정)
- [x] **[2-2-3]** `app/services/storage_service.py` 작성: Cloudflare R2 이미지 업로드 함수
- [x] **[2-2-4]** `app/routers/users.py` 수정: `POST /users/me/profile-image` 엔드포인트 추가 (R2 업로드 후 URL 저장)

#### 2-3. 프로필 화면 및 이미지 압축

- [x] **[2-3-1]** `src/utils/imageCompressor.ts` 작성: expo-image-manipulator로 500KB 이하 압축 유틸리티 함수
- [x] **[2-3-2]** `src/screens/profile/ProfileScreen.tsx` 작성: 프로필 조회 화면 (닉네임, 사진, 자기소개 표시)
- [x] **[2-3-3]** `src/screens/profile/ProfileEditScreen.tsx` 작성: 프로필 수정 화면 (이미지 선택 → 압축 → 업로드 포함)

---

### Week 3: 지역 기반 매칭 및 채팅

#### 3-1. 위치 등록 API

- [x] **[3-1-1]** `app/routers/locations.py` 작성: `POST /locations` 엔드포인트 (현재 여행 위치 등록, GPS 사용 금지)
- [x] **[3-1-2]** `app/routers/locations.py` 수정: `PATCH /locations/{id}/deactivate` 엔드포인트 추가 (여행 종료 처리)
- [x] **[3-1-3]** `app/routers/locations.py` 수정: `GET /locations` 엔드포인트 추가 (location_name 파라미터로 해당 지역 활성 여행자 목록 반환)

#### 3-2. 매칭 화면

- [x] **[3-2-1]** `src/screens/matching/LocationSelectScreen.tsx` 작성: 지역 텍스트 검색 및 선택 UI (자동완성 없이 직접 입력 방식)
- [x] **[3-2-2]** `src/screens/matching/MatchingScreen.tsx` 작성: 내 현재 위치 표시 + 해당 지역 여행자 목록
- [x] **[3-2-3]** `src/screens/matching/TravelerListItem.tsx` 작성: 여행자 목록 항목 컴포넌트 (닉네임, 사진, 채팅 버튼)

#### 3-3. 실시간 채팅

- [x] **[3-3-1]** Firebase SDK 설치 및 `src/services/firebaseClient.ts` 작성: Firestore 초기화
- [x] **[3-3-2]** `src/services/chatService.ts` 작성: 1:1 채팅방 생성 함수 (두 userId 조합으로 채팅방 ID 생성)
- [x] **[3-3-3]** `src/services/chatService.ts` 수정: 메시지 전송 함수 및 메시지 실시간 구독 함수 추가
- [x] **[3-3-4]** `src/screens/chat/ChatScreen.tsx` 작성: 채팅 화면 UI (메시지 목록, 입력창, 전송 버튼)
- [x] **[3-3-5]** `src/screens/chat/ChatListScreen.tsx` 작성: 내 채팅 목록 화면 (최근 메시지 표시)

---

### Week 4: AI 여행 일정 생성

#### 4-1. AI 서비스 및 캐싱

- [x] **[4-1-1]** `app/services/ai_service.py` 작성: Upstash Redis 연결 초기화 및 캐시 키 생성 함수 (context.md 원칙 3 기준)
- [x] **[4-1-2]** `app/services/ai_service.py` 수정: 예산 구간화 함수 추가 (context.md 원칙 3의 구간 기준 적용)
- [x] **[4-1-3]** `app/services/ai_service.py` 수정: GPT-4o-mini 호출 함수 작성 (한국어 프롬프트, 일정 JSON 반환)
- [x] **[4-1-4]** `app/services/ai_service.py` 수정: Redis 조회 → 미스 시 GPT 호출 → Redis 저장(TTL 7일) 흐름 통합

#### 4-2. AI 일정 API

- [x] **[4-2-1]** `app/routers/itineraries.py` 작성: `POST /itineraries` 엔드포인트 (ai_service 호출, DB 저장)
- [x] **[4-2-2]** `app/routers/itineraries.py` 수정: `GET /itineraries/{id}` 엔드포인트 추가 (저장된 일정 조회)

#### 4-3. AI 일정 화면

- [x] **[4-3-1]** `src/screens/itinerary/ItineraryFormScreen.tsx` 작성: 일정 생성 입력 폼 (여행지, 일수, 인원, 예산 입력)
- [x] **[4-3-2]** `src/screens/itinerary/ItineraryResultScreen.tsx` 작성: 생성된 일정 결과 화면 (날짜별 일정 표시)
- [x] **[4-3-3]** `src/screens/itinerary/ItineraryResultScreen.tsx` 수정: React Native Share API로 SNS 공유 기능 추가

---

## Phase 2: 커뮤니티/맛집/동행 + 테스트 + 배포 (5~8주차)

---

### Week 5: 커뮤니티 게시판

#### 5-1. 커뮤니티 게시판 API (백엔드)

- [ ] **[5-1-1]** `app/routers/posts.py` 작성: `GET /posts` 엔드포인트 (category 필터, cursor 기반 페이지네이션 20개씩, 인증 필수)
- [ ] **[5-1-2]** `app/routers/posts.py` 수정: `POST /posts` 엔드포인트 추가 (title, content, category 입력, 인증 필수)
- [ ] **[5-1-3]** `app/routers/posts.py` 수정: `GET /posts/{id}` 엔드포인트 추가 (조회수 view_count +1 증가 포함)
- [ ] **[5-1-4]** `app/routers/posts.py` 수정: `PATCH /posts/{id}` 엔드포인트 추가 (작성자 본인만 수정 가능, 권한 검증)
- [ ] **[5-1-5]** `app/routers/posts.py` 수정: `DELETE /posts/{id}` 엔드포인트 추가 (작성자 본인만 삭제 가능)
- [ ] **[5-1-6]** `app/main.py` 수정: posts 라우터 import 및 `app.include_router(posts.router)` 추가

#### 5-2. 커뮤니티 게시판 화면 (프론트엔드)

- [ ] **[5-2-1]** `src/services/postService.ts` 작성: GET /posts, POST /posts, GET /posts/{id}, PATCH, DELETE API 호출 함수 (Authorization 헤더 포함)
- [ ] **[5-2-2]** `src/screens/community/CommunityScreen.tsx` 수정: 게시글 목록 FlatList 구현 (카테고리 탭 필터: 전체/질문/후기/정보, 무한 스크롤)
- [ ] **[5-2-3]** `src/screens/community/PostCreateScreen.tsx` 작성: 게시글 작성 화면 (카테고리 선택, 제목/내용 입력, 등록 버튼)
- [ ] **[5-2-4]** `src/screens/community/PostDetailScreen.tsx` 작성: 게시글 상세 화면 (본문 표시, 작성자일 경우 수정/삭제 버튼 표시)
- [ ] **[5-2-5]** `src/navigation/RootNavigator.tsx` 수정: PostCreateScreen, PostDetailScreen을 Stack에 추가 (Community 탭 내 스택 네비게이션)

---

### Week 6: 맛집 리뷰

#### 6-1. 맛집 리뷰 API (백엔드)

- [ ] **[6-1-1]** `app/routers/restaurants.py` 작성: `GET /restaurants` 엔드포인트 (location_name 필터, cursor 기반 페이지네이션 20개씩)
- [ ] **[6-1-2]** `app/routers/restaurants.py` 수정: `POST /restaurants` 엔드포인트 추가 (이미지 최대 5장 multipart 업로드, R2 저장 후 URL 배열로 저장, 인증 필수)
- [ ] **[6-1-3]** `app/routers/restaurants.py` 수정: `GET /restaurants/{id}` 엔드포인트 추가
- [ ] **[6-1-4]** `app/routers/restaurants.py` 수정: `DELETE /restaurants/{id}` 엔드포인트 추가 (작성자 본인만)
- [ ] **[6-1-5]** `app/main.py` 수정: restaurants 라우터 import 및 `app.include_router(restaurants.router)` 추가

#### 6-2. 맛집 리뷰 화면 (프론트엔드)

- [ ] **[6-2-1]** `src/services/restaurantService.ts` 작성: 맛집 CRUD API 호출 함수 (이미지 multipart FormData 전송 포함)
- [ ] **[6-2-2]** `src/screens/restaurant/RestaurantListScreen.tsx` 작성: 맛집 목록 화면 (지역 입력 필터, 별점 표시, FlatList)
- [ ] **[6-2-3]** `src/screens/restaurant/RestaurantCreateScreen.tsx` 작성: 맛집 등록 화면 (이미지 최대 5장 선택→압축→업로드, 가게명/위치/설명/별점 입력)
- [ ] **[6-2-4]** `src/screens/restaurant/RestaurantDetailScreen.tsx` 작성: 맛집 상세 화면 (이미지 ScrollView, 별점, 설명, 삭제 버튼)
- [ ] **[6-2-5]** `src/navigation/RootNavigator.tsx` 수정: RestaurantListScreen, RestaurantCreateScreen, RestaurantDetailScreen 스택 추가 (Community 탭 또는 별도 접근 경로)

---

### Week 7: 동행 구인 게시판

#### 7-1. 동행 구인 API (백엔드)

- [ ] **[7-1-1]** `app/routers/companions.py` 작성: `GET /companions` 엔드포인트 (status 필터: open/closed, cursor 기반 페이지네이션 20개씩)
- [ ] **[7-1-2]** `app/routers/companions.py` 수정: `POST /companions` 엔드포인트 추가 (destination, travel_start_date, travel_end_date, description, max_participants 입력, 인증 필수)
- [ ] **[7-1-3]** `app/routers/companions.py` 수정: `GET /companions/{id}` 엔드포인트 추가 (신청자 목록 포함)
- [ ] **[7-1-4]** `app/routers/companions.py` 수정: `PATCH /companions/{id}/close` 엔드포인트 추가 (모집 마감, 작성자만 가능)
- [ ] **[7-1-5]** `app/routers/companions.py` 수정: `POST /companions/{id}/apply` 엔드포인트 추가 (신청 메시지 포함, 중복 신청 시 400 에러)
- [ ] **[7-1-6]** `app/routers/companions.py` 수정: `PATCH /companions/{id}/applications/{application_id}` 엔드포인트 추가 (status: accepted/rejected, 작성자만 가능)
- [ ] **[7-1-7]** `app/main.py` 수정: companions 라우터 import 및 `app.include_router(companions.router)` 추가

#### 7-2. 동행 구인 화면 (프론트엔드)

- [ ] **[7-2-1]** `src/services/companionService.ts` 작성: 동행 구인 CRUD + 신청/수락/거절 API 호출 함수
- [ ] **[7-2-2]** `src/screens/companion/CompanionScreen.tsx` 수정: 동행 구인 목록 FlatList (open/closed 탭 필터, 여행 날짜/목적지 카드 표시)
- [ ] **[7-2-3]** `src/screens/companion/CompanionCreateScreen.tsx` 작성: 동행 구인 등록 화면 (여행지, 날짜 선택, 모집 인원, 조건 설명 입력)
- [ ] **[7-2-4]** `src/screens/companion/CompanionDetailScreen.tsx` 작성: 동행 상세 화면 (게시글 내용, 신청 버튼, 작성자일 경우 신청자 목록 및 수락/거절 버튼)
- [ ] **[7-2-5]** `src/navigation/RootNavigator.tsx` 수정: CompanionCreateScreen, CompanionDetailScreen 스택 추가

---

### Week 8: 테스트 코드 작성 및 배포 준비

#### 8-1. 핵심 API 단위 테스트

- [ ] **[8-1-1]** `tests/conftest.py` 작성: pytest fixture 정의 (FastAPI TestClient, 테스트용 Supabase 목 또는 실제 연결)
- [ ] **[8-1-2]** `tests/test_auth.py` 작성: `POST /auth/sync-user` 테스트 (신규 사용자 생성, 기존 사용자 조회 케이스)
- [ ] **[8-1-3]** `tests/test_itineraries.py` 작성: `POST /itineraries` 테스트 (캐시 미스 → GPT 호출, 캐시 히트 → API 미호출 케이스)
- [ ] **[8-1-4]** `tests/test_locations.py` 작성: `POST /locations`, `GET /locations` 테스트 (지역 등록 및 목록 조회 케이스)

#### 8-2. 배포 준비

- [ ] **[8-2-1]** `render.yaml` 수정: `R2_ACCOUNT_ID` 항목을 `R2_ENDPOINT_URL`로 교체 (storage_service.py와 키 이름 일치)
- [ ] **[8-2-2]** `frontend/app.json` 수정: `scheme` 필드 추가 ("tripmeet"), 앱 이름/버전 확정
- [ ] **[8-2-3]** `frontend/eas.json` 작성: EAS Build 프로필 정의 (development, preview, production)
- [ ] **[8-2-4]** Supabase 대시보드 작업: 프로덕션 리다이렉트 URL 등록 (`tripmeet://auth/callback`), 현재 Expo Go URL도 병행 등록
- [ ] **[8-2-5]** Render.com 대시보드 작업: 환경변수 11개 전체 등록 및 배포 실행 후 `/health` 엔드포인트 응답 확인
