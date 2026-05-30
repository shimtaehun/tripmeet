<div align="center">

# TripMeet

혼자 여행하면서 동행을 구하거나, 현지 맛집 정보를 모으거나, 일정을 짜는 과정이 생각보다 번거롭습니다.  
이걸 하나로 묶으면 어떨까 싶어서 만든 여행 동행 매칭 모바일 앱입니다.

<br/>

![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?style=flat-square&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-55-000020?style=flat-square&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)
![Redis](https://img.shields.io/badge/Upstash_Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_R2-F38020?style=flat-square&logo=cloudflare&logoColor=white)

<br/>

**1인 개발** · 기획 · 프론트엔드 · 백엔드 · AI 시스템 전부 직접 구현 · 2025.12 ~ 2026.03

<br/>

[**앱 바로가기**](https://tripmeet-app.onrender.com) &nbsp;·&nbsp; [**API 상태**](https://tripmeet-backend.onrender.com/health) &nbsp;·&nbsp; [**랜딩페이지**](https://tripmeet-landing.onrender.com)

</div>

<br/>

---

<table>
  <tr>
    <td width="50%"><img src="https://github.com/user-attachments/assets/8916c4ff-9644-47d5-80df-9749fe973640" /></td>
    <td width="50%"><img src="https://github.com/user-attachments/assets/fac85755-20b6-4a78-83f9-63ee5f1c4c3e" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://github.com/user-attachments/assets/402c1647-6b78-4cd3-bd33-e95b29eef0d5" /></td>
    <td width="50%"><img src="https://github.com/user-attachments/assets/92e67910-a8d1-43c3-8d2d-5866ec8e467a" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="https://github.com/user-attachments/assets/133e869e-2001-4c24-8ceb-e69514d1d068" /></td>
    <td width="50%"><img src="https://github.com/user-attachments/assets/2a8ef61f-e993-478b-9ee7-6b9145391c9e" /></td>
  </tr>
</table>

---

## 주요 기능

| | 기능 | 설명 |
|---|---|---|
| 🧭 | **동행 매칭** | 자기소개 벡터 임베딩으로 여행 성향이 유사한 사람을 추천 |
| 🗓️ | **AI 일정 생성** | 앱 데이터 기반 RAG + Redis 캐싱으로 맞춤 여행 일정 생성 |
| 💬 | **실시간 채팅** | Firebase Firestore 기반 1:1 채팅 |
| 📋 | **동행 구인** | 동행 모집 · 신청 · 수락/거절 흐름 |
| 🍜 | **맛집 리뷰** | 사진 5장 · 별점 · 위치 기반 맛집 등록 |
| 📝 | **커뮤니티** | 질문 · 후기 · 정보 카테고리 게시판 |

<br/>

### 동행 매칭
자기소개를 입력하면 같은 여행지에 있는 비슷한 성향의 여행자를 추천합니다. 텍스트를 Google Gemini(`text-embedding-004`)로 768차원 벡터로 변환하고, PostgreSQL의 pgvector로 코사인 유사도를 계산합니다. GPS는 사용하지 않고 사용자가 직접 여행지를 입력하는 방식입니다.

### AI 일정 생성
여행지, 기간, 인원, 예산을 입력하면 하루 단위 일정을 만들어줍니다. 단순히 Gemini에 요청하는 게 아니라, 앱에 쌓인 데이터를 컨텍스트로 넣어서 품질을 높입니다. 동일한 조건의 요청은 Redis에 7일 캐시해서 반복 API 호출을 줄였습니다.

> [!NOTE]
> 캐시 미스 시 아래 5가지 데이터를 Supabase에서 조회해 Gemini 프롬프트에 포함합니다.
> - 같은 여행지의 기존 생성 일정 (인기 관광지 · 식당 자동 집계)
> - 앱에 등록된 맛집 (평점 높은 순)
> - 커뮤니티 후기 · 정보 게시글
> - 동행 출발월 통계 (인기 시즌 파악)
> - 요청 사용자의 자기소개 (개인화)

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

<table>
  <tr>
    <th>구분</th>
    <th>기술</th>
    <th>버전</th>
  </tr>
  <tr>
    <td rowspan="5"><b>Frontend</b></td>
    <td>React Native</td>
    <td>0.83.2</td>
  </tr>
  <tr>
    <td>Expo</td>
    <td>~55.0.4</td>
  </tr>
  <tr>
    <td>TypeScript</td>
    <td>~5.9.2</td>
  </tr>
  <tr>
    <td>Supabase JS SDK</td>
    <td>^2.78.0</td>
  </tr>
  <tr>
    <td>Firebase SDK</td>
    <td>^12.10.0</td>
  </tr>
  <tr>
    <td rowspan="5"><b>Backend</b></td>
    <td>FastAPI</td>
    <td>0.115.5</td>
  </tr>
  <tr>
    <td>Python</td>
    <td>3.10+</td>
  </tr>
  <tr>
    <td>google-genai (Gemini 2.5 Flash)</td>
    <td>>=0.7.0</td>
  </tr>
  <tr>
    <td>upstash-redis</td>
    <td>1.1.0</td>
  </tr>
  <tr>
    <td>boto3 (Cloudflare R2)</td>
    <td>1.35.74</td>
  </tr>
  <tr>
    <td rowspan="6"><b>인프라</b></td>
    <td>Supabase</td>
    <td>PostgreSQL + pgvector + 구글 OAuth (PKCE)</td>
  </tr>
  <tr>
    <td>Render.com</td>
    <td>FastAPI 백엔드 + Expo Web 정적 배포</td>
  </tr>
  <tr>
    <td>Firebase Firestore</td>
    <td>실시간 1:1 채팅</td>
  </tr>
  <tr>
    <td>Cloudflare R2</td>
    <td>이미지 저장 (S3 호환)</td>
  </tr>
  <tr>
    <td>Upstash Redis</td>
    <td>AI 일정 결과 캐싱</td>
  </tr>
  <tr>
    <td>Google Gemini API</td>
    <td>텍스트 임베딩 + 일정 생성</td>
  </tr>
</table>

---

## 프로젝트 구조

<details>
<summary>폴더 구조 보기</summary>

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

</details>

---

## 시작하기

### 사전 준비

- Node.js 18+, Python 3.10+, `npm install -g expo-cli`
- 서비스 계정 필요: Supabase · Firebase · Google Cloud (Gemini API) · Cloudflare R2 · Upstash Redis

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

캐시 키는 `{여행지}:{기간}:{인원}:{예산구간}:v2` 형식으로 구성됩니다.

```
요청 수신
  └─ Redis 캐시 조회
       ├─ 히트 → 즉시 반환
       └─ 미스 → Supabase에서 앱 데이터 5종 조회
                └─ Gemini 프롬프트 구성 → 일정 생성
                     └─ Redis (TTL 7일) + DB 저장
```

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

| 서비스 | 설명 |
|--------|------|
| `tripmeet-api` | FastAPI 백엔드 (Python, Singapore 리전) |
| `tripmeet-app` | Expo Web 빌드 정적 배포 (`npx expo export --platform web`) |
| `tripmeet-landing` | 랜딩페이지 정적 배포 |

---

## 라이선스

포트폴리오 및 학습 목적으로 제작했습니다.
