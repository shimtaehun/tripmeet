# TripMeet (트립밋) 계획서

## 1. 핵심 가치 및 MVP 범위

### 핵심 가치 제안

- 네이버 카페 중심의 분산된 여행 커뮤니티를 단일 모바일 앱으로 통합
- 혼자 여행하는 사람의 3가지 핵심 니즈 해결: 정보 탐색, 동행 매칭, 일정 계획
- AI 기반 자동 일정 생성으로 여행 계획 진입 장벽 제거
- GPS 미사용 수동 위치 선택 방식으로 법적 리스크 최소화

### MVP 핵심 기능 5가지

| 번호 | 기능명 | 설명 |
|------|--------|------|
| 1 | AI 여행 일정 자동 생성 | 여행지/일수/인원/예산 입력 시 완성된 일정 제공 및 SNS 공유 |
| 2 | 여행자 지역 기반 매칭 | 사용자가 수동 선택한 현재 여행지 기반으로 해당 지역 여행자 리스트업 및 채팅 |
| 3 | 여행자 커뮤니티 게시판 | 질문/후기/정보 공유 게시판으로 재방문율 확보 |
| 4 | 맛집 공유 & 리뷰 | 사진 업로드 중심의 현지 맛집 리뷰 |
| 5 | 여행 동행 구인 게시판 | 사전 여행 동행 매칭 게시판 |

### MVP 제외 사항

- 이메일 인증 (구글 OAuth만 지원)
- GPS 자동 위치 수집
- 다국어 지원 (한국어 전용)
- 테스트 코드: 핵심 API 엔드포인트만 최소 작성
- 동시 사용자 목표: 100명 이하 (초기)

---

## 2. 시스템 아키텍처

### 전체 구조

```
[React Native (Expo)]
        |
        | HTTPS REST API
        v
[FastAPI 백엔드 - Render.com]
   |          |           |
   v          v           v
[Supabase] [Upstash]  [OpenAI]
PostgreSQL   Redis     GPT-4o-mini
+ Auth       (AI 캐싱)
+ Storage
        |
        v
[Cloudflare R2]       [Firebase Firestore]
   이미지 저장            실시간 채팅
```

### 프론트엔드 구조 (React Native / Expo)

```
src/
  screens/           # 화면 컴포넌트
    auth/            # 로그인
    home/            # 홈 피드
    matching/        # 지역 기반 매칭
    community/       # 커뮤니티 게시판
    restaurant/      # 맛집 리뷰
    companion/       # 동행 구인
    itinerary/       # AI 일정 생성
    chat/            # 채팅
    profile/         # 내 프로필
  components/        # 재사용 UI 컴포넌트
  hooks/             # 커스텀 훅
  utils/             # 유틸리티 (이미지 압축 등)
  services/          # API 호출 레이어
  store/             # 전역 상태 관리
  navigation/        # 네비게이션 설정
```

### 백엔드 구조 (FastAPI)

```
app/
  main.py            # FastAPI 앱 진입점
  routers/           # 엔드포인트 라우터
    auth.py          # 인증
    users.py         # 사용자 프로필
    locations.py     # 지역 기반 매칭
    itineraries.py   # AI 일정 생성
    posts.py         # 커뮤니티 게시판
    restaurants.py   # 맛집 리뷰
    companions.py    # 동행 구인
  services/          # 비즈니스 로직
    ai_service.py    # OpenAI + Redis 캐싱
    storage_service.py # Cloudflare R2 업로드
  middleware/        # JWT 검증 미들웨어
  models/            # Pydantic 스키마
  db/                # DB 연결 및 쿼리
```

---

## 3. 데이터베이스 스키마 초안

### users (사용자)

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | UUID | PK | Supabase Auth UID와 동기화 |
| nickname | VARCHAR(50) | NOT NULL | 표시 이름 |
| profile_image_url | TEXT | | Cloudflare R2 URL |
| bio | TEXT | | 자기소개 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

### travel_locations (현재 여행 위치)

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| location_name | VARCHAR(100) | NOT NULL | 예: "홍대", "도쿄" |
| country | VARCHAR(50) | NOT NULL | 예: "한국", "일본" |
| region | VARCHAR(100) | | 예: "서울", "도쿄도" |
| is_active | BOOLEAN | DEFAULT true | 현재 여행 중 여부 |
| activated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| deactivated_at | TIMESTAMPTZ | | 여행 종료 시각 |

**인덱스:** (location_name, is_active) — 지역 내 활성 여행자 조회 최적화

### itineraries (AI 생성 일정)

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| destination | VARCHAR(100) | NOT NULL | 여행지 |
| duration_days | SMALLINT | NOT NULL | 여행 일수 |
| travelers_count | SMALLINT | NOT NULL | 인원 수 |
| budget_range | VARCHAR(20) | NOT NULL | 구간 처리된 예산 (예: "30만원대") |
| cache_key | VARCHAR(255) | UNIQUE | destination:duration:travelers:budget_range 조합 |
| content | JSONB | NOT NULL | AI 생성 일정 전체 내용 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**비고:** cache_key는 Redis 조회 실패 시 DB 폴백용으로도 사용

### posts (커뮤니티 게시판)

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| category | VARCHAR(20) | NOT NULL | 'question' / 'review' / 'info' |
| title | VARCHAR(200) | NOT NULL | |
| content | TEXT | NOT NULL | |
| view_count | INTEGER | DEFAULT 0 | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

### restaurants (맛집 리뷰)

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| name | VARCHAR(100) | NOT NULL | 가게 이름 |
| location_name | VARCHAR(100) | NOT NULL | 위치 (수동 입력) |
| description | TEXT | | |
| rating | SMALLINT | CHECK (1~5) | 별점 |
| image_urls | TEXT[] | | Cloudflare R2 URL 배열 (최대 5장) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

### companions (동행 구인 게시판)

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| destination | VARCHAR(100) | NOT NULL | 여행지 |
| travel_start_date | DATE | NOT NULL | 여행 시작일 |
| travel_end_date | DATE | NOT NULL | 여행 종료일 |
| description | TEXT | NOT NULL | 동행 조건 및 설명 |
| max_participants | SMALLINT | DEFAULT 2 | 모집 인원 |
| status | VARCHAR(20) | DEFAULT 'open' | 'open' / 'closed' |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

### companion_applications (동행 신청)

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | UUID | PK | |
| companion_id | UUID | FK → companions.id | |
| applicant_id | UUID | FK → users.id | |
| message | TEXT | | 신청 메시지 |
| status | VARCHAR(20) | DEFAULT 'pending' | 'pending' / 'accepted' / 'rejected' |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**복합 유니크 제약:** (companion_id, applicant_id) — 중복 신청 방지

---

## 4. 주요 API 엔드포인트 목록 (MVP)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /users/me | 내 프로필 조회 |
| PATCH | /users/me | 내 프로필 수정 |
| POST | /locations | 현재 위치 등록 |
| PATCH | /locations/{id}/deactivate | 현재 위치 비활성화 |
| GET | /locations | 특정 지역 여행자 목록 조회 |
| POST | /itineraries | AI 일정 생성 (캐시 우선) |
| GET | /itineraries/{id} | 일정 상세 조회 |
| GET | /posts | 게시글 목록 |
| POST | /posts | 게시글 작성 |
| GET | /posts/{id} | 게시글 상세 |
| GET | /restaurants | 맛집 목록 |
| POST | /restaurants | 맛집 등록 |
| GET | /companions | 동행 구인 목록 |
| POST | /companions | 동행 구인 등록 |
| POST | /companions/{id}/apply | 동행 신청 |
