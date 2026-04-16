# ✈️ Global Travel Companion AI Platform

> **AI 기반 글로벌 여행 동행 매칭 플랫폼**
> AI 알고리즘이 여행 스타일을 분석하여 최적의 동행을 추천하고, 실시간 채팅과 AI 여행 가이드를 제공합니다.
>
> **1인 개발** | 기획 · 프론트엔드 · 백엔드 · AI 추천 시스템 전체 직접 구현 (2025.12 ~ 2026.01)

<br/>

## 📌 프로젝트 소개

**Travel AI**는 여행자들이 자신의 여행 스타일에 맞는 동행을 찾고, AI 여행 가이드와 대화하며, 실시간으로 소통할 수 있는 풀스택 웹 플랫폼입니다.

### 핵심 기능

| 기능 | 설명 |
|------|------|
| 🤖 **AI 동행 매칭** | 사용자의 자기소개(bio)를 벡터 임베딩으로 변환하여 여행 성향이 유사한 동행을 자동 추천 |
| 💬 **AI 여행 가이드** | RAG(Retrieval-Augmented Generation) 기반으로 여행 정보를 검색하고 Gemini AI가 맞춤 답변 제공 |
| 📋 **동행 게시판** | 여행 동행 모집글을 작성하고 열람할 수 있는 커뮤니티 게시판 |
| 🗣️ **실시간 오픈채팅** | WebSocket 기반 실시간 채팅방에서 여행자들과 자유롭게 소통 |
| 🔐 **회원 인증 시스템** | JWT 토큰 기반 회원가입/로그인 (비밀번호 bcrypt 암호화) |

<br/>

## 🏗️ 기술 스택

### Frontend

| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 16.1.6 | React 기반 풀스택 프레임워크 (App Router) |
| **React** | 19.2.3 | UI 라이브러리 |
| **TypeScript** | 5.x | 정적 타입 검사 |
| **TailwindCSS** | 4.x | 유틸리티 기반 CSS 프레임워크 |
| **jwt-decode** | 4.x | 클라이언트 측 JWT 토큰 디코딩 |

### Backend

| 기술 | 버전 | 용도 |
|------|------|------|
| **FastAPI** | - | Python 고성능 비동기 웹 프레임워크 |
| **SQLAlchemy** | - | ORM (데이터베이스 객체 매핑) |
| **pgvector** | - | PostgreSQL 벡터 유사도 검색 확장 |
| **LangChain** | - | AI 파이프라인 및 임베딩 관리 |
| **Google Gemini** | 2.5-flash | AI 응답 생성 및 텍스트 임베딩 |
| **python-jose** | - | JWT 토큰 생성 및 검증 |
| **Passlib (bcrypt)** | - | 비밀번호 해싱 |

### Infrastructure

| 기술 | 용도 |
|------|------|
| **PostgreSQL + pgvector** | 관계형 DB + AI 벡터 검색 |
| **Redis** | 채팅/세션 캐시 저장소 |
| **Docker Compose** | 컨테이너 오케스트레이션 |

<br/>

## 📁 프로젝트 구조

```
tripmeet/
├── docker-compose.yml          # PostgreSQL(pgvector) + Redis 컨테이너 설정
├── backend/
│   ├── main.py                 # FastAPI 앱 (API 엔드포인트, WebSocket, CORS)
│   ├── models.py               # SQLAlchemy ORM 모델 (User, Guide, Buddy)
│   ├── schemas.py              # Pydantic 요청/응답 스키마
│   ├── crud.py                 # DB CRUD 로직 + AI 추천 알고리즘
│   ├── database.py             # DB 연결 설정 (SQLAlchemy Engine)
│   ├── init_data.py            # 초기 여행 데이터 시드 스크립트
│   ├── requirements.txt        # Python 의존성 목록
│   ├── .env                    # 환경변수 (DB URL, API Key)
│   └── services/
│       └── ai_service.py       # Gemini AI 임베딩 & 응답 생성 서비스
└── frontend/
    ├── package.json            # Node.js 의존성
    ├── next.config.ts          # Next.js 설정
    ├── tsconfig.json           # TypeScript 설정
    ├── app/
    │   ├── layout.tsx          # 전역 레이아웃 (Navbar 포함)
    │   ├── page.tsx            # 메인 랜딩 페이지
    │   ├── login/page.tsx      # 로그인 페이지
    │   ├── signup/page.tsx     # 회원가입 페이지
    │   ├── buddies/page.tsx    # 동행 찾기 (게시판 + AI 매칭)
    │   ├── chat/page.tsx       # 실시간 오픈채팅
    │   └── ai_chat/page.tsx    # AI 여행 가이드 챗봇
    └── components/
        └── Navbar.tsx          # 상단 네비게이션 바
```

<br/>

## 🚀 시작하기

### 사전 준비

- **Docker & Docker Compose** 설치
- **Node.js** 18+ 설치
- **Python** 3.10+ 설치
- **Google Gemini API Key** 발급

### 1. 저장소 클론

```bash
git clone https://github.com/shimtaehun/tripmeet.git
cd tripmeet
```

### 2. 인프라 실행 (PostgreSQL + Redis)

```bash
docker-compose up -d
```

> PostgreSQL(pgvector)이 `localhost:5432`에, Redis가 `localhost:6379`에 실행됩니다.

### 3. 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
python init_data.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

<br/>

## 🧠 AI 동작 원리

### 동행 매칭 (Vector Similarity Search)

사용자가 회원가입 시 입력한 자기소개 텍스트를 Gemini text-embedding-004 모델로 768차원 벡터로 변환합니다.
이후 pgvector의 cosine_distance 연산으로 같은 여행지를 가진 사용자 중 성향이 가장 유사한 동행을 추천합니다.

### AI 여행 가이드 (RAG)

사용자 질문을 벡터로 변환 → DB에서 유사한 여행 정보 3개 검색 → 검색된 정보와 질문을 Gemini에 전달 → 맞춤 답변 생성

<br/>

## ⚙️ 환경변수 설정

`backend/.env` 파일에 아래 값을 설정합니다:

```
DATABASE_URL=postgresql://admin:password123@localhost:5432/travel_db
GOOGLE_API_KEY=<your-google-gemini-api-key>
```

## 📝 라이선스

이 프로젝트는 학습 및 포트폴리오 목적으로 제작되었습니다.
