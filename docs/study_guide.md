# TripMeet 프로젝트 전체 기술 가이드

> 이 문서는 TripMeet 프로젝트를 처음부터 혼자 공부할 때 읽을 수 있도록,
> 코드의 흐름·역할·기술 선택 이유를 최대한 자세하게 정리한 학습용 문서입니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [전체 아키텍처 구조도](#2-전체-아키텍처-구조도)
3. [기술 스택 선택 이유](#3-기술-스택-선택-이유)
4. [백엔드 상세 (FastAPI)](#4-백엔드-상세-fastapi)
5. [프론트엔드 상세 (React Native)](#5-프론트엔드-상세-react-native)
6. [데이터베이스 스키마](#6-데이터베이스-스키마)
7. [핵심 기능별 데이터 흐름](#7-핵심-기능별-데이터-흐름)
8. [AI 일정 생성 시스템 (RAG)](#8-ai-일정-생성-시스템-rag)
9. [인증 시스템](#9-인증-시스템)
10. [실시간 채팅 시스템](#10-실시간-채팅-시스템)
11. [이미지 업로드 파이프라인](#11-이미지-업로드-파이프라인)
12. [푸시 알림 시스템](#12-푸시-알림-시스템)
13. [환경변수 전체 목록](#13-환경변수-전체-목록)
14. [수동 작업 체크리스트](#14-수동-작업-체크리스트)

---

## 1. 프로젝트 개요

### 앱 목표

기존에 네이버 카페, 블로그 등 여러 곳에 흩어져 있던 여행 커뮤니티를 단일 모바일 앱으로 통합한다. 특히 혼자 여행하는 사람의 3가지 핵심 니즈를 해결한다.

| 니즈 | 기능 |
|------|------|
| 여행지 정보 탐색 | 커뮤니티 게시판, 맛집 리뷰 |
| 현지 동행 매칭 | 지역 기반 매칭 + 1:1 채팅 |
| 여행 일정 계획 | AI 자동 일정 생성 |

### MVP 5대 기능

```
1. AI 여행 일정 자동 생성 (여행지/일수/인원/예산 입력 → 완성 일정)
2. 지역 기반 여행자 매칭 (수동 위치 등록 → 같은 지역 여행자 리스트)
3. 커뮤니티 게시판 (질문/후기/정보 카테고리, 댓글 포함)
4. 맛집 공유 & 리뷰 (사진 업로드, 별점, 평균 집계)
5. 동행 구인 게시판 (사전 동행 모집, 신청/수락/거절)
```

---

## 2. 전체 아키텍처 구조도

```
┌─────────────────────────────────────────┐
│           React Native (Expo)           │
│              TypeScript                 │
└────────────────┬────────────────────────┘
                 │ HTTPS REST API
                 ▼
┌─────────────────────────────────────────┐
│         FastAPI (Python)                │
│           Render.com 배포               │
└────┬───────┬──────────┬────────┬────────┘
     │       │          │        │
     ▼       ▼          ▼        ▼
┌─────────┐ ┌────────┐ ┌──────┐ ┌────────────┐
│Supabase │ │Upstash │ │Gemini│ │Firebase    │
│Postgres │ │ Redis  │ │ 2.5  │ │Admin SDK   │
│  + Auth │ │캐시(7일)│ │Flash │ │(토큰 발급) │
└────┬────┘ └────────┘ └──────┘ └────────────┘
     │
     ├─ Cloudflare R2 (이미지 저장)
     │
     └─ Expo Push API (푸시 알림)

┌─────────────────────────────────────────┐
│      Firebase Firestore (채팅 전용)      │
│       실시간 onSnapshot 구독             │
└─────────────────────────────────────────┘
```

### 각 서비스 역할 요약

| 서비스 | 역할 | 이유 |
|--------|------|------|
| Supabase | 주 DB + OAuth 인증 | PostgreSQL + Auth 통합, RLS 보안 |
| FastAPI | REST API 서버 | Python 생태계 (AI 라이브러리 호환) |
| Render.com | 서버 배포 | 무료 티어, GitHub 연동 자동 배포 |
| Upstash Redis | AI 일정 캐싱 | 서버리스 Redis, 동일 요청 Gemini 재호출 방지 |
| Gemini 2.5 Flash | AI 일정 생성 | 빠른 속도 + 한국어 품질 |
| Firebase Firestore | 1:1 채팅 | 실시간 구독이 핵심, Supabase보다 낮은 비용 |
| Cloudflare R2 | 이미지 저장 | S3 호환, egress 무료 |
| Expo Push API | 푸시 알림 | FCM/APNs 추상화, 무료 |

---

## 3. 기술 스택 선택 이유

### 3-1. React Native + Expo

React Native는 JavaScript/TypeScript 하나로 iOS와 Android를 동시에 개발할 수 있다. Expo는 빌드 환경 설정을 대부분 자동화해 주는 프레임워크다.

```
일반 React Native
  → Xcode, Android Studio, 네이티브 코드 직접 설정 필요

Expo (Managed Workflow)
  → npx expo start 하나로 개발 시작
  → EAS Build로 앱스토어 배포
  → expo-image-picker, expo-notifications 등 공식 패키지 제공
```

### 3-2. TypeScript

JavaScript에 정적 타입을 추가한 언어다.

```typescript
// 타입 없이 JavaScript만 쓰면
function getUser(id) {  // id가 string인지 number인지 모름
  return users[id];
}

// TypeScript를 쓰면
function getUser(id: string): User | null {
  return users[id] ?? null;
}
// 컴파일 시점에 오류를 잡아줌
```

### 3-3. FastAPI (Python)

FastAPI는 Python으로 만든 현대적인 웹 프레임워크다.

```python
# 기존 Flask 방식
@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    pass  # 타입 검증 없음

# FastAPI 방식
@router.get("/{user_id}", response_model=UserProfile)
def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    pass
# - Pydantic으로 입출력 타입 자동 검증
# - Depends()로 의존성 주입 (인증 미들웨어)
# - Swagger UI 자동 생성 (/docs)
```

선택 이유: Python AI 라이브러리(google-genai, firebase-admin 등)와 자연스럽게 통합된다.

### 3-4. Supabase

Supabase는 PostgreSQL + Auth + Storage를 하나의 패키지로 제공하는 서비스다.

```
전통적인 방식:
  PostgreSQL 직접 운영 + JWT 구현 + 파일 서버 구축

Supabase 사용:
  프로젝트 생성 → Google OAuth 활성화 → API 키 복사
  → 완료
```

이 프로젝트에서 사용하는 Supabase 기능:
- PostgreSQL: 사용자/게시글/맛집/동행/일정 등 모든 데이터
- Auth: Google OAuth, JWT 토큰 발급 및 검증
- RLS (Row Level Security): 테이블별 접근 권한

### 3-5. Upstash Redis

서버리스 환경에서 사용 가능한 Redis다. 일반 Redis는 항상 서버가 켜져 있어야 하지만, Upstash는 REST API로 호출하므로 Render.com 같은 무료 서버에서도 쉽게 사용한다.

```python
# 일반 Redis
import redis
r = redis.Redis(host='localhost', port=6379)
r.set('key', 'value')

# Upstash Redis (REST 기반)
from upstash_redis import Redis
r = Redis(url=URL, token=TOKEN)
r.set('key', 'value', ex=604800)  # TTL 7일
```

### 3-6. Gemini 2.5 Flash

Google의 Gemini 모델 중 속도와 비용이 균형 잡힌 모델이다.

```
GPT-4o (OpenAI)
  - 품질 높음, 비용 높음
  - 한국어 지원 양호

Gemini 2.5 Flash (Google)
  - 속도 빠름, 비용 낮음
  - 한국어 지원 양호
  - 무료 티어 존재

→ 1인 개발 MVP에서는 Gemini 선택
```

### 3-7. Firebase Firestore (채팅 전용)

실시간 채팅에 특화된 NoSQL 데이터베이스다.

```
Supabase Realtime도 실시간 구독이 가능하지만:
  → 무료 티어 동시 연결 수 제한 있음
  → Firestore가 채팅 패턴에 더 최적화됨

Firestore 선택 이유:
  → onSnapshot() 한 줄로 실시간 구독 구현
  → 무료 티어 넉넉함 (일 5만 읽기, 2만 쓰기)
```

---

## 4. 백엔드 상세 (FastAPI)

### 4-1. 디렉토리 구조

```
backend/
├── app/
│   ├── main.py              # 앱 진입점, CORS, 라우터 등록
│   ├── middleware/
│   │   └── auth.py          # JWT 인증 의존성
│   ├── db/
│   │   └── supabase_client.py  # Supabase 클라이언트 싱글톤
│   ├── routers/             # 기능별 엔드포인트
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── locations.py
│   │   ├── itineraries.py
│   │   ├── posts.py
│   │   ├── restaurants.py
│   │   ├── companions.py
│   │   ├── bookmarks.py
│   │   └── matching.py
│   └── services/            # 비즈니스 로직
│       ├── ai_service.py
│       ├── storage_service.py
│       └── notification_service.py
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_itineraries.py
│   └── test_locations.py
├── requirements.txt
└── render.yaml
```

### 4-2. main.py — 앱 진입점

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, locations, itineraries, posts, restaurants, companions, matching, bookmarks

app = FastAPI(title="TripMeet API")

# CORS 설정: 허용할 오리진 목록
# 개발 서버(localhost), Expo Go, Render.com 프로덕션을 모두 허용
ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:19006",
    "http://localhost:3000",
    "exp://localhost:8081",
    "https://tripmeet.onrender.com",
    "https://tripmeet-landing.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# 라우터 등록 (각 파일이 /prefix 하위 엔드포인트를 담당)
app.include_router(auth.router)        # /auth
app.include_router(users.router)       # /users
app.include_router(locations.router)   # /locations
app.include_router(itineraries.router) # /itineraries
app.include_router(posts.router)       # /posts
app.include_router(restaurants.router) # /restaurants
app.include_router(companions.router)  # /companions
app.include_router(matching.router)    # /matching
app.include_router(bookmarks.router)   # /bookmarks

@app.get("/health")
def health_check():
    """Render.com 웜업 핑 + 서비스 상태 체크"""
    # DB와 Redis 연결 상태를 동시에 확인
    # 프론트엔드가 앱 시작 시 이 엔드포인트를 호출해 서버를 미리 깨운다
    ...
```

### 4-3. auth.py (미들웨어) — JWT 토큰 검증

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

def get_current_user(credentials = Depends(security)) -> dict:
    """
    모든 인증 필요 엔드포인트에 Depends()로 주입되는 함수.

    흐름:
    1. Authorization: Bearer {token} 헤더 추출
    2. Supabase Auth API에 토큰 검증 요청
    3. 유효하면 {id, email} 반환
    4. 무효하면 401 에러
    """
    token = credentials.credentials
    supabase = get_supabase()

    try:
        response = supabase.auth.get_user(token)
        user = response.user
        return {"id": str(user.id), "email": user.email}
    except Exception:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

# 사용 예시
@router.get("/me", response_model=UserProfile)
def get_my_profile(current_user: dict = Depends(get_current_user)):
    # current_user = {"id": "uuid...", "email": "user@gmail.com"}
    pass
```

`Depends(get_current_user)` 패턴이 핵심이다. FastAPI가 라우터 함수를 호출하기 전에 자동으로 `get_current_user()`를 먼저 실행해 인증을 처리한다.

### 4-4. 라우터 패턴

모든 라우터는 아래 구조를 따른다.

```python
# 예시: posts.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from app.middleware.auth import get_current_user
from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/posts", tags=["posts"])
PAGE_SIZE = 20

# 입력 스키마 (Pydantic BaseModel)
class PostCreate(BaseModel):
    category: str   # question / review / info
    title: str
    content: str

# 출력 스키마
class PostDetail(BaseModel):
    id: str
    user_id: str
    category: str
    title: str
    content: str
    view_count: int
    created_at: str
    updated_at: str
    author: Optional[AuthorInfo] = None

# 엔드포인트
@router.post("/", response_model=PostDetail, status_code=status.HTTP_201_CREATED)
def create_post(
    body: PostCreate,                           # 요청 본문 (자동 파싱 + 검증)
    current_user: dict = Depends(get_current_user), # 인증 의존성
):
    supabase = get_supabase()
    result = supabase.table("posts").insert({
        "user_id": current_user["id"],
        "category": body.category,
        "title": body.title,
        "content": body.content,
    }).execute()
    return result.data[0]
```

**Pydantic BaseModel**이 핵심이다. 클라이언트가 보낸 JSON을 Python 객체로 자동 변환하고, 타입이 맞지 않으면 422 에러를 자동으로 반환한다.

### 4-5. Supabase 클라이언트

```python
# app/db/supabase_client.py

from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

_supabase: Client | None = None

def get_supabase() -> Client:
    """
    싱글톤 패턴으로 Supabase 클라이언트를 반환한다.
    매번 새로 생성하지 않고 한 번만 만들어 재사용한다.
    service_role 키를 사용하므로 RLS를 우회한다.
    """
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_SERVICE_ROLE_KEY"],  # 서버 전용 키
        )
    return _supabase
```

**service_role vs anon 키 차이:**
- `anon` 키: RLS(Row Level Security) 적용됨. 일반 사용자 권한
- `service_role` 키: RLS 우회. 서버 내부에서만 사용해야 함

백엔드 서버는 이미 JWT로 사용자 인증을 직접 처리하므로, DB 접근은 service_role로 제약 없이 한다.

### 4-6. 전체 API 엔드포인트 목록

```
인증
  POST /auth/sync-user          Google 로그인 후 사용자 DB 동기화
  POST /auth/firebase-token     Supabase 토큰 → Firebase 커스텀 토큰

사용자
  GET  /users/me                내 프로필 조회
  PATCH /users/me               닉네임/자기소개 수정
  POST /users/me/profile-image  프로필 이미지 업로드
  PATCH /users/me/push-token    Expo 푸시 토큰 저장

위치 (지역 기반 매칭)
  POST /locations/                현재 여행 위치 등록
  PATCH /locations/{id}/deactivate 여행 종료
  GET  /locations/                특정 지역 활성 여행자 목록

AI 일정
  GET  /itineraries/              내 저장 일정 목록
  POST /itineraries/              AI 일정 생성 (캐시 우선)
  GET  /itineraries/{id}          일정 상세 조회
  POST /itineraries/{id}/revise   AI 일정 수정 요청

게시판
  GET  /posts/                    게시글 목록 (category, cursor, my 필터)
  POST /posts/                    게시글 작성
  GET  /posts/{id}                게시글 상세 (조회수 +1)
  PATCH /posts/{id}               게시글 수정 (본인만)
  DELETE /posts/{id}              게시글 삭제 (본인만)
  GET  /posts/{id}/comments       댓글 목록
  POST /posts/{id}/comments       댓글 작성
  DELETE /posts/{id}/comments/{cid} 댓글 삭제 (본인만)

맛집
  GET  /restaurants/              맛집 목록 (location_name, sort, my 필터)
  POST /restaurants/              맛집 등록 (multipart, 이미지 최대 5장)
  GET  /restaurants/{id}          맛집 상세 (평균 별점 포함)
  PATCH /restaurants/{id}         맛집 수정
  DELETE /restaurants/{id}        맛집 삭제

동행 구인
  GET  /companions/               동행 구인 목록 (status, cursor, my 필터)
  POST /companions/               동행 구인 등록
  GET  /companions/{id}           동행 상세 (신청자 목록)
  PATCH /companions/{id}          동행 수정
  DELETE /companions/{id}         동행 삭제
  PATCH /companions/{id}/close    모집 마감
  POST /companions/{id}/apply     동행 신청
  PATCH /companions/{id}/applications/{aid}  신청 수락/거절
  GET  /companions/my-applications 내가 신청한 동행 목록

북마크
  POST /bookmarks/toggle          북마크 토글 (추가/제거)
  GET  /bookmarks/                내 북마크 목록
  GET  /bookmarks/check           특정 항목 북마크 여부

시스템
  GET  /health                    서버 상태 확인
```

---

## 5. 프론트엔드 상세 (React Native)

### 5-1. 디렉토리 구조

```
frontend/src/
├── navigation/
│   ├── RootNavigator.tsx    # 최상위 네비게이터 (인증 분기)
│   └── MainTabs.tsx         # 하단 탭 8개 정의
├── screens/
│   ├── auth/
│   │   └── LoginScreen.tsx
│   ├── landing/
│   │   └── LandingScreen.tsx
│   ├── home/
│   │   └── HomeScreen.tsx
│   ├── matching/
│   │   ├── LocationSelectScreen.tsx  # 지역 선택 (프리셋 15개)
│   │   ├── MatchingScreen.tsx        # 같은 지역 여행자 목록
│   │   └── TravelerListItem.tsx
│   ├── community/
│   │   ├── CommunityScreen.tsx      # 게시글 목록
│   │   ├── PostCreateScreen.tsx
│   │   └── PostDetailScreen.tsx     # 댓글 포함
│   ├── restaurant/
│   │   ├── RestaurantListScreen.tsx
│   │   ├── RestaurantCreateScreen.tsx
│   │   └── RestaurantDetailScreen.tsx  # 평균 별점 + 북마크
│   ├── companion/
│   │   ├── CompanionScreen.tsx
│   │   ├── CompanionCreateScreen.tsx
│   │   └── CompanionDetailScreen.tsx   # 신청 수락/거절 + 북마크
│   ├── itinerary/
│   │   ├── ItineraryFormScreen.tsx   # 일정 생성 폼
│   │   ├── ItineraryResultScreen.tsx # 일정 결과 + 수정 요청
│   │   └── MyItinerariesScreen.tsx   # 저장된 일정 목록
│   ├── chat/
│   │   ├── ChatScreen.tsx
│   │   └── ChatListScreen.tsx        # 미읽음 배지 포함
│   └── profile/
│       ├── ProfileScreen.tsx
│       ├── ProfileEditScreen.tsx
│       └── MyActivityScreen.tsx      # 5탭: 게시글/맛집/동행/신청/북마크
├── services/              # API 호출 레이어
│   ├── supabaseClient.ts
│   ├── firebaseClient.ts
│   ├── apiClient.ts
│   ├── chatService.ts
│   ├── postService.ts
│   ├── restaurantService.ts
│   ├── companionService.ts
│   ├── bookmarkService.ts
│   └── notificationService.ts
├── components/
│   └── ConfirmModal.tsx
├── store/
│   └── authStore.ts
└── utils/
    ├── theme.ts
    ├── imageCompressor.ts
    └── responsive.ts
```

### 5-2. 네비게이션 구조

React Navigation 라이브러리를 사용한다.

```
RootNavigator (Stack)
├── Landing              # 처음 방문 시 소개 화면
├── Login                # 로그인 화면
└── Main (Stack)
    ├── MainTabs (Bottom Tabs)
    │   ├── Home
    │   ├── Matching
    │   ├── Community
    │   ├── Restaurant
    │   ├── Companion
    │   ├── Itinerary
    │   ├── ChatList
    │   └── Profile
    ├── PostCreate, PostDetail
    ├── RestaurantCreate, RestaurantDetail, RestaurantEdit
    ├── CompanionCreate, CompanionDetail, CompanionEdit
    ├── ProfileEdit, MyActivity
    ├── ItineraryResult, MyItineraries
    ├── Chat
    └── LocationSelect
```

**세션 분기 로직:**

```typescript
// RootNavigator.tsx

useEffect(() => {
  // Supabase Auth 상태 변경 구독
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    setLoading(false);

    if (session?.access_token) {
      // 로그인되면 Firebase에도 동시 로그인
      signInToFirebase(session.access_token);
      // 푸시 알림 토큰 등록
      registerForPushNotifications();
    }
  });

  return () => subscription.unsubscribe();
}, []);

// 렌더링: session 여부로 화면 분기
if (!session) return <Stack.Screen name="Login" />;
return <Stack.Screen name="Main" />;
```

**Render.com 슬립 방지:**

```typescript
// 앱 시작 + 포그라운드 복귀 시 서버 웜업
function pingServer() {
  fetch(`${process.env.EXPO_PUBLIC_API_URL}/health`).catch(() => {});
}

useEffect(() => {
  pingServer(); // 앱 시작 시 즉시 핑

  const sub = AppState.addEventListener('change', (nextState) => {
    if (appState.current !== 'active' && nextState === 'active') {
      pingServer(); // 백그라운드에서 돌아올 때 재핑
    }
    appState.current = nextState;
  });

  return () => sub.remove();
}, []);
```

### 5-3. API 클라이언트 (apiClient.ts)

```typescript
// 90초 타임아웃이 있는 fetch 래퍼
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000); // 90초

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new Error('서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.');
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}
```

왜 90초인가? Render.com 무료 티어는 슬립 후 첫 요청에 30~50초가 걸린다. 기본 fetch 타임아웃(보통 30초)이면 실패한다.

### 5-4. Supabase 클라이언트 (supabaseClient.ts)

```typescript
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// 플랫폼별 세션 저장소 선택
const storage = Platform.OS === 'web'
  ? localStorage          // 웹: 브라우저 localStorage
  : SecureStore;          // 네이티브: iOS Keychain / Android Keystore

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage,
      autoRefreshToken: true,    // 토큰 만료 전 자동 갱신
      persistSession: true,      // 앱 재시작 후에도 로그인 유지
      detectSessionInUrl: Platform.OS === 'web',  // 웹만 URL에서 세션 감지
    },
  }
);
```

`SecureStore`는 민감한 정보(세션 토큰)를 기기의 안전한 저장소에 암호화해서 보관한다. 일반 AsyncStorage보다 보안이 높다.

### 5-5. 디자인 시스템 (theme.ts)

전체 앱 색상, 여백, 그림자, 타이포그래피를 중앙 관리한다.

```typescript
export const Colors = {
  // 주 색상
  primary: '#6366F1',        // Indigo Violet (메인 버튼)
  primaryLight: '#EEF2FF',   // 연한 primary (배지, 배경)
  primaryBorder: '#C7D2FE',  // 테두리

  // 기능별 색상
  green: '#10B981',          // 수락, 성공
  red: '#EF4444',            // 삭제, 거절
  amber: '#F59E0B',          // 별점, 경고
  coral: '#F97316',          // SNS 공유 버튼
  purple: '#8B5CF6',         // AI 관련

  // 텍스트
  text: '#1E1B4B',           // 본문
  textMedium: '#6366F1',     // 부제목
  textLight: '#9CA3AF',      // 힌트, 날짜

  // 배경
  background: '#F8F7FF',     // 전체 배경
  card: '#FFFFFF',           // 카드 배경
  surface: '#F3F4F6',        // 인풋 배경
};

export const Gradients = {
  ai: ['#4F46E5', '#7C3AED'],       // AI 일정 화면
  companion: ['#F97316', '#EF4444'], // 동행 화면
  community: ['#10B981', '#059669'], // 커뮤니티
  food: ['#F59E0B', '#EF4444'],      // 맛집
  chat: ['#06B6D4', '#3B82F6'],      // 채팅
  profile: ['#8B5CF6', '#6366F1'],   // 프로필
  // ...
};

export const Shadow = {
  card: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  // ...
};

export const Radius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, full: 999,
};

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 48,
  screenPad: 20,  // 화면 좌우 여백
};
```

이렇게 중앙화하면 색상 한 개를 바꿀 때 `theme.ts` 하나만 수정하면 된다.

### 5-6. 이미지 압축 (imageCompressor.ts)

```typescript
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_FILE_SIZE = 500 * 1024;  // 500KB
const MAX_DIMENSION = 1280;        // 최대 해상도

export async function compressImage(uri: string) {
  // 초기 압축 (품질 80%)
  let quality = 0.8;
  let result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],  // 가로 최대 1280px로 리사이즈
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  // 500KB 초과 시 품질을 낮춰가며 반복 압축 (최대 3회)
  let attempt = 0;
  while (result.base64 && result.base64.length * 0.75 > MAX_FILE_SIZE && attempt < 3) {
    quality = Math.max(0.2, quality - 0.2);  // 품질 0.2씩 감소, 최소 0.2
    result = await ImageManipulator.manipulateAsync(uri, ...);
    attempt++;
  }

  return { uri: result.uri, base64: result.base64, mimeType: 'image/jpeg' };
}
```

이미지를 서버에 보내기 전에 클라이언트에서 미리 압축한다. 이유:
- 서버 처리 부담 감소
- 업로드 속도 향상
- Cloudflare R2 저장 비용 절감

---

## 6. 데이터베이스 스키마

Supabase(PostgreSQL)에 생성된 테이블 전체 구조다.

### users (사용자)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,              -- Supabase Auth UID와 동기화
  nickname VARCHAR(50) NOT NULL,
  profile_image_url TEXT,           -- Cloudflare R2 URL
  bio TEXT,                         -- 자기소개 (AI 선호도 추출에 사용)
  push_token TEXT,                  -- Expo 푸시 토큰
  preference_embedding vector,      -- bio에서 추출한 성향 벡터 (Gemini Embedding)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`preference_embedding`은 사용자의 bio("맛집 위주 여행", "액티비티 좋아함" 등)를 Gemini text-embedding-004 모델로 벡터화한 값이다. AI 일정 생성 시 RAG 5번 항목으로 활용된다.

### travel_locations (현재 여행 위치)

```sql
CREATE TABLE travel_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  location_name VARCHAR(100) NOT NULL,  -- "홍대", "도쿄" 등
  country VARCHAR(50) NOT NULL,
  region VARCHAR(100),
  is_active BOOLEAN DEFAULT true,       -- 현재 여행 중 여부
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at TIMESTAMPTZ            -- 여행 종료 시각
);

CREATE INDEX ON travel_locations (location_name, is_active);
-- 지역 + 활성 여부 복합 인덱스: "이 지역에서 여행 중인 사람" 쿼리 최적화
```

GPS를 사용하지 않고 사용자가 수동으로 입력한다. 법적 리스크(개인정보 위치 자동 수집) 회피 목적이다.

### itineraries (AI 생성 일정)

```sql
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  destination VARCHAR(100) NOT NULL,
  duration_days SMALLINT NOT NULL,
  travelers_count SMALLINT NOT NULL,
  budget_range VARCHAR(20) NOT NULL,   -- "30만원대" (정규화된 예산)
  cache_key VARCHAR(255) UNIQUE,       -- Redis 캐시 키와 동일
  content JSONB NOT NULL,             -- AI 생성 일정 전체 (JSON)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`cache_key`는 `{destination}:{duration}일:{travelers}명:{budget_range}:v2` 형태다. Redis 캐시 미스 시 DB에서도 같은 키로 조회한다.

### posts (커뮤니티 게시판)

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  category VARCHAR(20) NOT NULL,  -- question / review / info
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### post_comments (게시글 댓글)

```sql
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON post_comments (post_id, created_at);
```

`ON DELETE CASCADE`: 게시글 삭제 시 댓글도 자동 삭제된다.

### restaurants (맛집 리뷰)

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  location_name VARCHAR(100) NOT NULL,  -- 수동 입력
  description TEXT,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  image_urls TEXT[],                    -- R2 URL 배열 (최대 5장)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`TEXT[]`는 PostgreSQL 배열 타입이다. 이미지 URL 여러 개를 한 컬럼에 저장한다.

### companions (동행 구인)

```sql
CREATE TABLE companions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  destination VARCHAR(100) NOT NULL,
  travel_start_date DATE NOT NULL,
  travel_end_date DATE NOT NULL,
  description TEXT NOT NULL,
  max_participants SMALLINT DEFAULT 2,
  status VARCHAR(20) DEFAULT 'open',  -- open / closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### companion_applications (동행 신청)

```sql
CREATE TABLE companion_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_id UUID REFERENCES companions(id),
  applicant_id UUID REFERENCES users(id),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',  -- pending / accepted / rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (companion_id, applicant_id)  -- 중복 신청 방지
);
```

`UNIQUE (companion_id, applicant_id)`: 같은 공고에 같은 사람이 두 번 신청하면 DB가 자동으로 막는다.

### bookmarks (북마크)

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('restaurant', 'companion')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX ON bookmarks (user_id, target_type);
```

---

## 7. 핵심 기능별 데이터 흐름

### 7-1. 게시글 무한 스크롤 (Cursor 기반 페이지네이션)

일반적인 페이지네이션(page=1, page=2...)은 데이터가 삽입되면 중복/누락이 생긴다. Cursor 기반은 이를 해결한다.

```
첫 번째 요청: GET /posts/
  → 최신 20개 반환
  → next_cursor = "2024-01-15T10:30:00Z" (마지막 항목의 created_at)

두 번째 요청: GET /posts/?cursor=2024-01-15T10:30:00Z
  → created_at < cursor인 항목 20개 반환
  → 즉, 커서 이전에 작성된 글만 가져옴

프론트엔드:
  → FlatList의 onEndReached 콜백에서 next_cursor로 다음 요청
  → next_cursor가 null이면 더 이상 데이터 없음
```

### 7-2. 파일 업로드 (Multipart)

```
프론트엔드                    백엔드                   Cloudflare R2
    │                          │                           │
    │  1. expo-image-picker    │                           │
    │     이미지 선택           │                           │
    │                          │                           │
    │  2. compressImage()       │                           │
    │     500KB 이하 압축       │                           │
    │                          │                           │
    │  3. FormData 생성         │                           │
    │     file: {uri, type}     │                           │
    │──── POST /restaurants/ ──▶│                           │
    │     multipart/form-data   │                           │
    │                          │  4. boto3 S3 클라이언트   │
    │                          │──── upload_fileobj ──────▶│
    │                          │                           │
    │                          │  5. R2_PUBLIC_URL/경로    │
    │                          │◀─── 퍼블릭 URL ───────────│
    │                          │                           │
    │◀─── JSON 응답 ────────────│                           │
    │     {image_urls: [...]}   │                           │
```

### 7-3. 동행 신청 → 수락 → 채팅 자동 연결

```
신청자                     작성자                    백엔드
   │                          │                        │
   │  1. POST /companions/     │                        │
   │     /{id}/apply           │                        │
   │──────────────────────────────────────────────────▶│
   │                          │                        │  DB에 pending 상태로 저장
   │                          │                        │
   │                          │  2. 상세 화면에서       │
   │                          │     "수락" 버튼 탭      │
   │                          │──────────────────────▶ │
   │                          │                        │  DB: accepted로 업데이트
   │                          │                        │
   │  3. 푸시 알림             │                        │  Expo Push API 호출
   │◀─────────────────────────────────────────────────│
   │  "동행 신청이 수락됐습니다"│                        │
   │                          │                        │
   │                          │  4. 프론트엔드 자동으로  │
   │                          │     ChatScreen 이동     │
   │                          │     (신청자 userId 전달) │
   │                          │                        │
   │                          │  5. Firebase 채팅방 생성 │
   │◀─────────────── 1:1 채팅 시작 ────────────────────▶│
```

---

## 8. AI 일정 생성 시스템 (RAG)

RAG(Retrieval Augmented Generation)는 AI에게 질문할 때 관련 데이터를 미리 검색해서 함께 전달하는 기법이다.

### 8-1. 전체 흐름

```
사용자 입력
  destination = "도쿄"
  duration_days = 3
  travelers_count = 2
  budget_won = 500000
  custom_requests = "스시 맛집 위주로"
            │
            ▼
1. 예산 정규화
   500000원 → "50만원대"

   구간 기준:
   ~ 100000원:  "10만원대 이하"
   ~ 200000원:  "20만원대"
   ~ 300000원:  "30만원대"
   ~ 500000원:  "50만원대"
   ~ 1000000원: "100만원대"
   이상:        "100만원 이상"
            │
            ▼
2. 캐시 키 생성
   "도쿄:3일:2명:50만원대:v2"

   (custom_requests가 있으면 캐시 우회)
            │
            ▼
3. Redis 조회
   캐시 히트 → 즉시 반환
   캐시 미스 → 4번으로
            │
            ▼
4. RAG 5종 데이터 수집 (각각 try/except, 실패해도 계속 진행)

   a. 과거 일정 분석
      SELECT content FROM itineraries WHERE destination ILIKE '%도쿄%' LIMIT 20
      → 자주 등장한 관광지 top 8, 식당 top 5 추출

   b. 앱 등록 맛집
      SELECT * FROM restaurants WHERE location_name ILIKE '%도쿄%'
        ORDER BY rating DESC LIMIT 10
      → 가게명, 별점, 설명 수집

   c. 커뮤니티 후기
      SELECT title, content FROM posts
        WHERE category IN ('review', 'info')
        AND (title ILIKE '%도쿄%' OR content ILIKE '%도쿄%')
        LIMIT 5
      → 현지 팁 수집 (본문 앞 80자만)

   d. 인기 여행 시즌
      SELECT EXTRACT(MONTH FROM travel_start_date) as month, COUNT(*) as cnt
        FROM companions WHERE destination ILIKE '%도쿄%'
        GROUP BY month ORDER BY cnt DESC LIMIT 3
      → "3월, 10월, 11월이 인기" 같은 정보

   e. 사용자 선호도
      SELECT bio FROM users WHERE id = 'current_user_id'
      → "맛집 탐방을 좋아함" → 일정에 식사 비중 높임
            │
            ▼
5. Gemini 2.5 Flash 호출

   프롬프트 구조:
   "당신은 전문 여행 플래너입니다.
   [여행 기본 정보]
   - 여행지: 도쿄
   - 기간: 3일
   - 인원: 2명
   - 예산: 50만원대
   - 추가 요구사항: 스시 맛집 위주로

   [앱 사용자 데이터 기반 인사이트]
   - 인기 관광지: 아사쿠사, 시부야, 신주쿠, ...
   - 앱 등록 맛집: 스시잔마이(★4.5), 이치란 라멘(★4.0), ...
   - 현지 팁: '도쿄 지하철 1일권 추천', '스카이트리는 저녁에 가세요', ...
   - 인기 여행 시즌: 3월, 10월, 11월
   - 사용자 성향: 맛집 탐방을 좋아함

   위 데이터를 최대한 활용해 아래 JSON 형식으로 3일 일정을 생성하세요:
   {...}"
            │
            ▼
6. JSON 파싱 및 검증
   days 배열 구조 확인
            │
            ▼
7. Redis 저장 (TTL 7일)
   캐시 키 "도쿄:3일:2명:50만원대:v2" 에 저장
            │
            ▼
8. Supabase itineraries 테이블에 저장
            │
            ▼
9. 프론트엔드 반환
   {id, destination, content: {days: [...]}, is_cached: false}
```

### 8-2. 일정 JSON 구조

```json
{
  "days": [
    {
      "day": 1,
      "date_label": "1일차",
      "activities": [
        {
          "time": "오전 9:00",
          "type": "sightseeing",
          "title": "아사쿠사 센소지 방문",
          "description": "도쿄에서 가장 오래된 절...",
          "estimated_cost": 0
        },
        {
          "time": "점심 12:00",
          "type": "meal",
          "title": "점심 식사",
          "restaurant_name": "스시잔마이 본점",
          "description": "신선한 참치 스시가 유명한...",
          "estimated_cost": 30000
        },
        {
          "time": "오후 14:00",
          "type": "sightseeing",
          "title": "스카이트리 전망대",
          "description": "도쿄 전경을 한눈에...",
          "estimated_cost": 18000
        }
      ]
    }
  ]
}
```

프론트엔드에서 `type === 'meal'`이면 초록색 테마, `restaurant_name`을 별도 표시한다.

---

## 9. 인증 시스템

### 9-1. Google OAuth 전체 흐름

```
프론트엔드                    Supabase                백엔드          Firebase
    │                          │                        │                │
    │  1. 로그인 버튼 탭        │                        │                │
    │                          │                        │                │
    │  2. supabase.auth         │                        │                │
    │     .signInWithOAuth      │                        │                │
    │     ({provider: 'google'})│                        │                │
    │──────────────────────────▶│                        │                │
    │                          │  3. Google 로그인 페이지 열림           │
    │                          │     (OS 브라우저 / WebView)             │
    │                          │                        │                │
    │                          │  4. 사용자 구글 계정 선택                │
    │                          │                        │                │
    │                          │  5. Supabase가 구글 토큰 수령           │
    │                          │     JWT access_token 발급               │
    │                          │                        │                │
    │  6. onAuthStateChange     │                        │                │
    │     이벤트 발생           │                        │                │
    │◀──────────────────────────│                        │                │
    │     session.access_token  │                        │                │
    │                          │                        │                │
    │  7. POST /auth/sync-user  │                        │                │
    │──────────────────────────────────────────────────▶│                │
    │                          │                        │  users 테이블에  │
    │                          │                        │  upsert (없으면  │
    │                          │                        │  생성, 있으면   │
    │                          │                        │  닉네임 갱신)   │
    │                          │                        │                │
    │  8. signInToFirebase      │                        │                │
    │     (access_token)        │                        │                │
    │──────────────────────────────────────────────────▶│                │
    │                          │                        │  Firebase 커스텀 │
    │                          │                        │  토큰 발급      │
    │                          │                        │────────────────▶│
    │                          │                        │                │
    │◀─────────────────────────────────────────────────│                │
    │     firebase_token        │                        │                │
    │                          │                        │                │
    │  9. signInWithCustomToken │                        │                │
    │──────────────────────────────────────────────────────────────────▶│
    │                          │                        │                │
    │  10. Firebase 로그인 완료 │                        │                │
    │      Firestore 접근 가능  │                        │                │
```

### 9-2. 왜 Firebase 커스텀 토큰이 필요한가?

Firestore 보안 규칙에서 `request.auth.uid`로 사용자를 식별한다. Supabase 토큰은 Firebase가 인식하지 못하므로, 백엔드에서 Firebase Admin SDK로 커스텀 토큰을 발급해서 Firebase에 로그인시킨다.

```
Supabase JWT (Supabase만 인식)
    ↓ 백엔드에서 변환
Firebase Custom Token (Firebase가 인식)
    ↓ signInWithCustomToken
Firebase Auth UID 획득
    ↓ Firestore 보안 규칙 통과
```

### 9-3. 토큰 자동 갱신

Supabase 클라이언트에서 `autoRefreshToken: true`로 설정했으므로, 토큰이 만료되기 전에 자동으로 갱신한다. 사용자 입장에서는 세션이 끊기지 않는다.

---

## 10. 실시간 채팅 시스템

### 10-1. Firebase Firestore 데이터 구조

```
chatRooms/                          # 컬렉션
  └── {roomId}/                     # 도큐먼트 (userId1_userId2 정렬된 조합)
        ├── participants: [uid1, uid2]
        ├── createdAt: Timestamp
        ├── lastMessage: "안녕하세요"
        ├── lastMessageAt: Timestamp
        ├── unreadCounts: {          # 미읽음 카운트 맵
        │     "uid1": 0,
        │     "uid2": 3
        │   }
        └── messages/               # 서브컬렉션
              └── {messageId}/
                    ├── senderId: "uid1"
                    ├── text: "안녕하세요"
                    └── createdAt: Timestamp
```

### 10-2. 채팅방 ID 생성 로직

```typescript
export function getChatRoomId(userIdA: string, userIdB: string): string {
  // 두 userId를 정렬해서 항상 동일한 ID가 나오게 한다
  // 예: "bbb_aaa" → sort → "aaa_bbb"
  return [userIdA, userIdB].sort().join('_');
}

// A가 B에게 채팅을 시작해도, B가 A에게 시작해도
// 항상 같은 채팅방을 사용한다
```

### 10-3. 미읽음 카운트 처리

```typescript
// 메시지 전송 시 (chatService.ts)
async function sendMessage(roomId, senderId, text) {
  // 1. 메시지 저장
  await addDoc(messages, { senderId, text, createdAt });

  // 2. 채팅방 정보 갱신
  const roomSnap = await getDoc(roomRef);
  const participants = roomSnap.data()?.participants;
  const recipientId = participants.find(id => id !== senderId); // 상대방 찾기

  await setDoc(roomRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    [`unreadCounts.${recipientId}`]: increment(1), // 상대방 카운트 +1
  }, { merge: true }); // merge: true → 기존 데이터 유지하고 덮어쓰기
}

// 채팅방 입장 시 (ChatScreen.tsx)
useEffect(() => {
  // 채팅방 만들거나 가져온 후 바로 내 미읽음 초기화
  const roomId = await getOrCreateChatRoom(userId, targetUserId);
  markRoomAsRead(roomId, userId); // 내 unreadCounts를 0으로 reset
}, []);
```

### 10-4. 실시간 구독

```typescript
export function subscribeToMessages(roomId, onMessages) {
  const q = query(
    collection(db, 'chatRooms', roomId, 'messages'),
    orderBy('createdAt', 'asc') // 오래된 메시지가 위에
  );

  // onSnapshot: Firestore 데이터 변경 시마다 자동 호출
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      senderId: doc.data().senderId,
      text: doc.data().text,
      createdAt: doc.data().createdAt?.toMillis() ?? Date.now(),
    }));
    onMessages(messages); // 콜백으로 메시지 배열 전달
  });
}

// 사용 예시 (ChatScreen.tsx)
useEffect(() => {
  if (!roomId) return;

  // 구독 시작 → 새 메시지 오면 자동으로 setMessages 호출
  const unsubscribe = subscribeToMessages(roomId, (msgs) => {
    setMessages(msgs);
    flatListRef.current?.scrollToEnd(); // 최신 메시지로 스크롤
  });

  // 화면 벗어날 때 구독 해제 (메모리 누수 방지)
  return () => unsubscribe();
}, [roomId]);
```

---

## 11. 이미지 업로드 파이프라인

### 11-1. Cloudflare R2

R2는 Cloudflare의 객체 스토리지 서비스다. AWS S3와 완전히 호환된다(S3 API 그대로 사용 가능). 차이점은 **데이터 전송 요금(egress)이 무료**다.

```python
# storage_service.py

import boto3
import uuid

s3_client = boto3.client(
    's3',
    endpoint_url=os.environ['R2_ENDPOINT_URL'],
    aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
)

def upload_image(file_bytes: bytes, content_type: str, folder: str) -> str:
    """
    이미지를 R2에 업로드하고 퍼블릭 URL을 반환한다.
    folder: "profiles", "restaurants" 등 경로 구분용
    """
    ext = content_type.split('/')[-1]  # "image/jpeg" → "jpeg"
    filename = f"{folder}/{uuid.uuid4()}.{ext}"  # "restaurants/uuid.jpeg"

    s3_client.put_object(
        Bucket=os.environ['R2_BUCKET_NAME'],
        Key=filename,
        Body=file_bytes,
        ContentType=content_type,
        ACL='public-read',  # 퍼블릭 접근 허용
    )

    return f"{os.environ['R2_PUBLIC_URL']}/{filename}"
    # 예: "https://pub.example.com/restaurants/uuid.jpeg"
```

### 11-2. 멀티파트 업로드 (프론트엔드)

```typescript
// restaurantService.ts

export async function createRestaurant(params: CreateRestaurantParams) {
  const auth = await getAuthHeader();

  const formData = new FormData();
  formData.append('name', params.name);
  formData.append('location_name', params.location_name);
  formData.append('rating', String(params.rating));

  // 이미지 파일들을 FormData에 추가
  for (const img of params.images) {
    formData.append('images', {
      uri: img.uri,
      type: img.type,    // "image/jpeg"
      name: img.name,    // "photo.jpg"
    } as any);
  }

  const res = await apiFetch(`${API_URL}/restaurants/`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      // Content-Type은 지정하지 않음!
      // fetch가 FormData를 감지해서 자동으로 multipart/form-data; boundary=... 설정
    },
    body: formData,
  });

  return res.json();
}
```

---

## 12. 푸시 알림 시스템

### 12-1. Expo Push API 구조

```
기기 (앱)
  ↓ registerForPushNotifications()
Expo 서버
  ↓ ExponentPushToken[xxxxxxxx]
백엔드 DB (users.push_token)
  ↓ 이벤트 발생 (동행 수락/거절)
백엔드 → Expo Push API (exp.host/--/api/v2/push/send)
  ↓
Expo 서버 → FCM/APNs
  ↓
기기에 알림 도착
```

일반적으로 Android는 FCM, iOS는 APNs를 직접 호출해야 한다. Expo Push API를 쓰면 이 복잡성을 추상화해서 하나의 API로 처리할 수 있다.

### 12-2. 토큰 등록 흐름

```typescript
// notificationService.ts

export async function registerForPushNotifications() {
  if (Platform.OS === 'web') return; // 웹은 지원 안 함

  // 알림 핸들러 설정 (앱이 포그라운드 상태일 때 어떻게 보여줄지)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,   // 팝업 표시
      shouldPlaySound: true,   // 소리 재생
      shouldSetBadge: true,    // 앱 아이콘 배지 표시
    }),
  });

  // 권한 확인
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') return; // 거부하면 중단
  }

  // Expo 푸시 토큰 발급
  const { data: pushToken } = await Notifications.getExpoPushTokenAsync();
  // 예: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxxxx]"

  // 백엔드에 저장
  const session = await supabase.auth.getSession();
  await apiFetch(`${API_URL}/users/me/push-token`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ push_token: pushToken }),
  });
}
```

### 12-3. 알림 발송 (백엔드)

```python
# notification_service.py

def send_push_notification(to_user_id: str, title: str, body: str, data: dict = None):
    """
    실패해도 로그만 남기고 예외 전파 안 함.
    알림 실패로 메인 기능이 실패하면 안 되기 때문.
    """
    token = get_push_token(to_user_id)
    if not token:
        return  # 토큰 없으면 조용히 종료

    try:
        httpx.post("https://exp.host/--/api/v2/push/send", json={
            "to": token,
            "title": title,
            "body": body,
            "sound": "default",
            "data": data or {},
        }, timeout=5.0)
    except Exception as e:
        logger.warning("푸시 알림 전송 실패: %s", e)

# companions.py에서 호출
send_push_notification(
    to_user_id=applicant_id,
    title="동행 신청 수락",
    body=f"{destination} 동행 신청이 수락되었습니다.",
    data={"type": "companion_accepted", "companion_id": companion_id},
)
```

---

## 13. 환경변수 전체 목록

### 백엔드 (backend/.env)

```bash
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...   # 서버 전용, 절대 클라이언트에 노출 금지
SUPABASE_ANON_KEY=eyJxxxx...           # Firebase 토큰 발급 시 사용

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxx...

# Gemini
GEMINI_API_KEY=AIzaSyxxxx...

# Cloudflare R2
R2_ENDPOINT_URL=https://xxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxxx...
R2_SECRET_ACCESS_KEY=xxxx...
R2_BUCKET_NAME=tripmeet-images
R2_PUBLIC_URL=https://pub.your-domain.com

# Firebase (JSON 문자열로 저장)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

### 프론트엔드 (frontend/.env 또는 app.json extra)

```bash
# 백엔드 API
EXPO_PUBLIC_API_URL=https://tripmeet.onrender.com

# Supabase (anon key만 — service_role 절대 금지)
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...

# Firebase 웹 앱 설정
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxx...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tripmeet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tripmeet
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tripmeet.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123:web:xxxx
```

`EXPO_PUBLIC_` 접두사가 붙은 변수만 앱 번들에 포함된다. 이 접두사가 없는 변수는 서버 전용이다.

---

## 14. 수동 작업 체크리스트

코드 외에 외부 서비스에서 직접 설정해야 하는 작업들이다.

### Supabase SQL (순서대로 실행)

```sql
-- 1. 기본 테이블 (plan.md 참고)
CREATE TABLE users (...);
CREATE TABLE travel_locations (...);
CREATE TABLE itineraries (...);
CREATE TABLE posts (...);
CREATE TABLE restaurants (...);
CREATE TABLE companions (...);
CREATE TABLE companion_applications (...);

-- 2. 댓글 테이블 (3번 기능 추가 시)
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON post_comments (post_id, created_at);

-- 3. 북마크 테이블 (9번 기능 추가 시)
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('restaurant', 'companion')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);
CREATE INDEX ON bookmarks (user_id, target_type);

-- 4. 푸시 토큰 컬럼 (6번 기능 추가 시)
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
```

### Supabase Auth

- Google OAuth 제공자 활성화
- 리다이렉트 URL 등록:
  - `tripmeet://auth/callback` (네이티브 앱)
  - `exp://localhost:8081/--/auth/callback` (Expo Go 개발)

### Firebase Console

- Firestore 보안 규칙 교체 (테스트 모드 → 아래 규칙으로):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chatRooms/{roomId} {
      allow read, write: if request.auth != null
        && request.auth.uid in resource.data.participants;
      allow create: if request.auth != null
        && request.auth.uid in request.resource.data.participants;

      match /messages/{messageId} {
        allow read: if request.auth != null
          && request.auth.uid in
             get(/databases/$(database)/documents/chatRooms/$(roomId)).data.participants;
        allow create: if request.auth != null
          && request.auth.uid in
             get(/databases/$(database)/documents/chatRooms/$(roomId)).data.participants
          && request.resource.data.senderId == request.auth.uid;
      }
    }
  }
}
```

### 패키지 설치

```bash
# 푸시 알림 라이브러리
cd frontend
npx expo install expo-notifications
```

### Render.com

- 환경변수 11개 모두 등록 (render.yaml 또는 대시보드)
- 배포 후 `https://tripmeet.onrender.com/health` 응답 확인

---

## 부록: 자주 헷갈리는 개념 정리

### Supabase service_role vs anon 키

| 구분 | anon | service_role |
|------|------|-------------|
| 사용 위치 | 프론트엔드, 백엔드 인증 검증 | 백엔드 DB 조작 |
| RLS 적용 | 적용됨 | 우회 (RLS 무시) |
| 노출 | 클라이언트 포함 가능 | 절대 노출 금지 |

### cursor 기반 페이지네이션 vs page 기반

| 구분 | page 기반 | cursor 기반 |
|------|-----------|------------|
| 요청 방식 | ?page=2 | ?cursor=timestamp |
| 새 데이터 삽입 시 | 중복/누락 발생 | 안전 |
| 특정 페이지 이동 | 가능 | 불가 (순차만) |
| 적합한 상황 | 관리자 목록 | 무한 스크롤 피드 |

### Firebase increment() 함수

```typescript
import { increment } from 'firebase/firestore';

// 아래 두 코드는 동일하지 않다

// 방법 A: 읽고 더하기 (레이스 컨디션 위험)
const doc = await getDoc(ref);
await updateDoc(ref, { count: doc.data().count + 1 }); // 동시에 두 명이 하면?

// 방법 B: Firestore 원자적 증가 (안전)
await updateDoc(ref, { count: increment(1) }); // 항상 정확히 +1
```

`increment()`는 Firestore 서버에서 원자적으로 처리하므로 동시 요청에도 값이 올바르게 증가한다.

### Pydantic BaseModel

FastAPI에서 입출력 스키마를 정의할 때 사용한다.

```python
class PostCreate(BaseModel):
    category: str
    title: str
    content: str

# 클라이언트가 {"category": "question", "title": "제목", "content": "내용"} 보내면
# FastAPI가 자동으로 PostCreate 객체로 변환
# 필드 누락 시 422 Unprocessable Entity 자동 반환
# response_model=PostDetail 이면 반환 전 자동 직렬화 + 필드 필터링
```

### React Navigation의 Stack vs Tabs

```
Stack Navigator: 카드가 쌓이는 방식. 뒤로가기 제스처 지원.
  → 상세 페이지, 폼 페이지에 적합

Bottom Tabs Navigator: 하단 탭 간 전환. 히스토리 없음.
  → 앱의 주요 섹션 전환에 적합

이 프로젝트:
  Stack(전체) 안에 Tabs(메인) 포함
  Tabs 안에서 상세/작성 화면은 Stack으로 이동
```

---

*이 문서는 TripMeet 코드베이스 기준으로 작성됐습니다. 2026-03-25*
