# TripMeet

혼자 여행하면서 동행을 구하거나, 현지 맛집 정보를 모으거나, 일정을 짜는 과정이 생각보다 번거롭습니다. 네이버 카페에서 동행 글을 찾고, 블로그를 뒤지고, 엑셀로 일정을 정리하는 흐름이 여전한데 — 이걸 하나로 묶으면 어떨까 싶어서 만들었습니다.

React Native + FastAPI로 직접 개발한 여행 동행 매칭 모바일 앱입니다. 기획부터 프론트엔드, 백엔드, AI 시스템까지 전부 혼자 구현했습니다. 2025년 12월부터 2026년 3월까지 약 3개월.

**앱 (웹)**: https://tripmeet-app.onrender.com  
**API**: https://tripmeet-backend.onrender.com/health  
**랜딩페이지**: https://tripmeet-landing.onrender.com

<br/>

<img width="1918" height="872" alt="image" src="https://github.com/user-attachments/assets/8916c4ff-9644-47d5-80df-9749fe973640" />
<img width="1919" height="867" alt="스크린샷 2026-05-21 111010" src="https://github.com/user-attachments/assets/fac85755-20b6-4a78-83f9-63ee5f1c4c3e" />
<img width="1919" height="869" alt="스크린샷 2026-05-21 111039" src="https://github.com/user-attachments/assets/402c1647-6b78-4cd3-bd33-e95b29eef0d5" />
<img width="1897" height="869" alt="스크린샷 2026-05-21 095120" src="https://github.com/user-attachments/assets/92e67910-a8d1-43c3-8d2d-5866ec8e467a" />
<img width="1899" height="866" alt="스크린샷 2026-05-21 095525" src="https://github.com/user-attachments/assets/133e869e-2001-4c24-8ceb-e69514d1d068" />
<img width="1919" height="866" alt="스크린샷 2026-05-21 111137" src="https://github.com/user-attachments/assets/2a8ef61f-e993-478b-9ee7-6b9145391c9e" />

---

## 주요 기능

### 동행 매칭
자기소개를 입력하면 같은 여행지에 있는 비슷한 성향의 여행자를 추천합니다. 텍스트를 Google Gemini(`text-embedding-004`)로 768차원 벡터로 변환하고, PostgreSQL의 pgvector로 코사인 유사도를 계산합니다. GPS는 사용하지 않고 사용자가 직접 여행지를 입력하는 방식입니다.

### AI 일정 생성
여행지, 기간, 인원, 예산을 입력하면 하루 단위 일정을 만들어줍니다. 단순히 Gemini에 요청하는 게 아니라, 앱에 쌓인 데이터를 컨텍스트로 넣어서 품질을 높입니다. 동일한 조건의 요청은 Redis에 7일 캐시해서 반복 API 호출을 줄였습니다.

캐시 미스 시 아래 5가지 데이터를 Supabase에서 조회해서 Gemini 프롬프트에 포함합니다:
- 같은 여행지의 기존 생성 일정 (인기 관광지 · 식당 자동 집계)
- 앱에 등록된 맛집 (평점 높은 순)
- 커뮤니티 후기 · 정보 게시글
- 동행 출발월 통계 (인기 시즌 파악)
- 요청 사용자의 자기소개 (개인화)

사용자가 늘수록 추천 품질이 자연스럽게 올라가는 구조입니다.

### 커뮤니티 게시판
질문, 후기, 정보 세 가지 카테고리로 게시글을 올릴 수 있습니다. 여행 준비 중 궁금한 것들, 다녀온 후기, 현지 꿀팁 공유가 주요 용도입니다.

### 맛집 리뷰
사진(최대 5장), 별점(1~5), 위치를 포함해서 맛집을 등록합니다. 사진은 클라이언트에서 500KB 이하로 압축한 뒤 Cloudflare R2에 저장합니다. AI 일정 생성 시 등록된 맛집이 식사 슬롯에 우선 배치됩니다.

### 동행 구인 게시판
여행 일정을 올리고 동행을 모집합니다. 신청 → 수락/거절 흐름이 있고, 수락 후 1:1 채팅으로 이어집니다.

### 실시간 채팅
Firebase Firestore를 직접 사용합니다. 두 사용자의 ID 조합으로 채팅방을 식별하고, Firestore 실시간 리스너로 메시지를 구독합니다.

---

## 기술 스택

**Frontend**

| | 버전 |
|---|---|
| React Native | 0.83.2 |
| Expo | ~55.0.4 |
| TypeScript | ~5.9.2 |
| React Navigation (bottom-tabs + stack) | ^7.x |
| Supabase JS SDK | ^2.78.0 |
| Firebase SDK | ^12.10.0 |
| expo-image-manipulator (클라이언트 압축) | ^55.0.9 |

**Backend**

| | 버전 |
|---|---|
| FastAPI | 0.115.5 |
| Python | 3.10+ |
| Supabase (PostgreSQL + Auth) | 2.10.0 |
| google-genai (Gemini 2.5 Flash) | >=0.7.0 |
| upstash-redis (REST API) | 1.1.0 |
| boto3 (Cloudflare R2 · S3 호환) | 1.35.74 |
| firebase-admin | 6.5.0 |

**인프라 & 외부 서비스**

| 서비스 | 용도 |
|--------|------|
| Supabase | PostgreSQL + pgvector + 구글 OAuth (PKCE) |
| Render.com | FastAPI 백엔드 + Expo Web 정적 배포 |
| Firebase Firestore | 실시간 1:1 채팅 |
| Cloudflare R2 | 이미지 저장 (S3 호환) |
| Upstash Redis | AI 일정 결과 캐싱 |
| Google Gemini API | 텍스트 임베딩 + 일정 생성 |

---

## 프로젝트 구조

```
tripmeet/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI 앱 진입점
│   │   ├── routers/             # API 라우터 8개
│   │   │   ├── auth.py          # 사용자 동기화
│   │   │   ├── users.py         # 프로필 조회·수정
│   │   │   ├── locations.py     # 여행 위치 등록
│   │   │   ├── itineraries.py   # AI 일정 생성·조회
│   │   │   ├── posts.py         # 커뮤니티 게시판
│   │   │   ├── restaurants.py   # 맛집 리뷰
│   │   │   ├── companions.py    # 동행 구인 + 신청
│   │   │   └── matching.py      # 벡터 유사도 매칭
│   │   ├── services/
│   │   │   ├── ai_service.py    # Gemini 호출 + Redis 캐싱 + RAG
│   │   │   ├── embedding_service.py
│   │   │   └── storage_service.py  # Cloudflare R2 업로드
│   │   ├── middleware/
│   │   │   └── auth.py          # JWT 토큰 검증
│   │   └── db/
│   │       └── supabase_client.py
│   ├── tests/                   # pytest (인증, 일정, 위치, 매칭)
│   ├── requirements.txt
│   └── render.yaml
│
└── frontend/
    ├── src/
    │   ├── screens/             # 화면 컴포넌트
    │   │   ├── auth/            # 로그인
    │   │   ├── home/            # 홈 피드
    │   │   ├── matching/        # 동행 매칭
    │   │   ├── community/       # 게시판
    │   │   ├── chat/            # 채팅
    │   │   ├── restaurant/      # 맛집
    │   │   ├── companion/       # 동행 구인
    │   │   ├── itinerary/       # AI 일정
    │   │   └── profile/         # 프로필
    │   ├── navigation/
    │   │   ├── RootNavigator.tsx    # 인증 여부 기반 분기
    │   │   ├── MainTabs.tsx         # 하단 탭 6개
    │   │   └── CustomTabBar.tsx     # 반응형 탭바
    │   ├── services/            # API 호출 레이어
    │   ├── store/               # authStore (전역 인증 상태)
    │   ├── components/          # 공용 컴포넌트
    │   └── utils/
    │       ├── theme.ts         # 디자인 시스템 (색상, 타이포그래피)
    │       ├── responsive.ts    # useResponsive 훅
    │       └── imageCompressor.ts  # 500KB 이하 압축
    ├── app.json                 # Expo 설정 (scheme: tripmeet)
    └── eas.json                 # EAS Build 프로필
```

---

## 시작하기

### 사전 준비

- Node.js 18+, Python 3.10+
- `npm install -g expo-cli`
- 아래 서비스 계정 필요: Supabase, Firebase, Google Cloud (Gemini API), Cloudflare R2, Upstash Redis

### 1. 저장소 클론

```bash
git clone https://github.com/shimtaehun/tripmeet.git
cd tripmeet
```

### 2. 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
```

`backend/.env` 파일 생성:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
R2_ENDPOINT_URL=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
```

`frontend/.env` 파일 생성:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

```bash
npx expo start
# 웹: w  /  iOS 시뮬레이터: i  /  Android 에뮬레이터: a
```

---

## AI 동작 원리

### 동행 매칭 — 벡터 유사도 검색

자기소개를 입력하면 Gemini `text-embedding-004`로 768차원 벡터를 생성합니다. 동행 검색 시 같은 여행지에 있는 사용자들의 벡터와 비교해서 pgvector의 `<=>` 연산자(cosine_distance)로 거리를 계산하고, 가까운 순으로 추천합니다.

### AI 일정 생성 — RAG + Redis 캐싱

캐시 키는 `{여행지}:{기간}:{인원}:{예산구간}:v2` 형식으로 구성됩니다. Redis에서 히트되면 바로 반환하고, 미스면 Supabase에서 앱 데이터를 조회해 Gemini 프롬프트를 구성한 뒤 생성합니다. 결과는 Redis(TTL 7일)와 DB 양쪽에 저장합니다.

---

## 데이터베이스 구조

Supabase PostgreSQL을 사용합니다. pgvector 확장으로 동행 매칭용 벡터 유사도 검색을 지원합니다.

| 테이블 | 설명 |
|--------|------|
| `users` | 프로필 (Supabase Auth UID와 1:1 연동) |
| `travel_locations` | 현재 여행 위치 (is_active로 활성 여부 관리) |
| `itineraries` | AI 생성 일정 (cache_key UNIQUE 제약으로 중복 저장 방지) |
| `posts` | 커뮤니티 게시글 (category: question / review / info) |
| `restaurants` | 맛집 리뷰 (image_urls TEXT[], rating 1~5) |
| `companions` | 동행 구인 (status: open / closed) |
| `companion_applications` | 동행 신청 (status: pending / accepted / rejected) |

---

## 배포

Render.com에 3개 서비스로 배포합니다. `render.yaml`에 설정이 있습니다.

- **tripmeet-api** — FastAPI 백엔드 (Python, Singapore 리전)
- **tripmeet-app** — Expo Web 빌드 정적 배포 (`npx expo export --platform web`)
- **tripmeet-landing** — 랜딩페이지 정적 배포

---

## 라이선스

포트폴리오 및 학습 목적으로 제작했습니다.
