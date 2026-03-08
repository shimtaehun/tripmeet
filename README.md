# ✈️ Global Travel Companion AI Platform

> **AI 기반 글로벌 여행 동행 매칭 플랫폼**  
> AI 알고리즘이 여행 스타일을 분석하여 최적의 동행을 추천하고, 실시간 채팅과 AI 여행 가이드를 제공합니다.

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
travel_ai/
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
git clone https://github.com/shimtaehun/travel_ai.git
cd travel_ai
```

### 2. 인프라 실행 (PostgreSQL + Redis)
```bash
docker-compose up -d
```
> PostgreSQL(pgvector)이 `localhost:5432`에, Redis가 `localhost:6379`에 실행됩니다.

### 3. 백엔드 실행
```bash
cd backend

# 환경변수 설정 (.env 파일 수정)
# DATABASE_URL=postgresql://admin:password123@localhost:5432/travel_db
# GOOGLE_API_KEY=<your-gemini-api-key>

# 의존성 설치
pip install -r requirements.txt

# 초기 여행 데이터 삽입 (최초 1회)
python init_data.py

# 서버 실행
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> 백엔드 API가 `http://localhost:8000`에서 실행됩니다.

### 4. 프론트엔드 실행
```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```
> 프론트엔드가 `http://localhost:3000`에서 실행됩니다.

<br/>

## 🔌 API 엔드포인트

### 인증 (Auth)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/users/` | 회원가입 (AI 임베딩 자동 생성) |
| `POST` | `/token` | 로그인 (JWT 토큰 발급) |

### 여행 가이드 (AI Guide)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/guide/chat` | AI 여행 가이드에게 질문 (RAG 기반) |

### 동행 (Buddies)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/buddies` | 동행 모집글 작성 |
| `POST` | `/buddies/list` | 동행 모집글 목록 조회 |

### 사용자 (Users)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/users/{user_id}/check-vector` | 사용자 벡터 임베딩 확인 |
| `GET` | `/users/{user_id}/recommendations` | AI 기반 동행 추천 |

### WebSocket
| Protocol | Endpoint | 설명 |
|----------|----------|------|
| `WS` | `/ws/{client_id}` | 실시간 오픈채팅 |

<br/>

## 🧠 AI 동작 원리

### 동행 매칭 (Vector Similarity Search)
```mermaid
flowchart LR
    A[회원가입 시 자기소개 입력] --> B[Gemini text-embedding-004로 벡터 변환]
    B --> C[768차원 벡터를 pgvector DB에 저장]
    C --> D[cosine_distance로 유사도 계산]
    D --> E[같은 여행지 + 가장 유사한 성향의 동행 추천]
```

### AI 여행 가이드 (RAG)
```mermaid
flowchart LR
    A[사용자 질문] --> B[질문을 벡터로 변환]
    B --> C[DB에서 유사한 여행 정보 3개 검색]
    C --> D[검색된 정보 + 질문을 Gemini에 전달]
    D --> E[맞춤 답변 생성 및 반환]
```

<br/>

## 📸 주요 화면

| 페이지 | 설명 |
|--------|------|
| **메인 (Landing)** | 플랫폼 소개 및 회원가입/로그인 유도 |
| **회원가입** | 이메일, 닉네임, 여행 도시, 여행 스타일(AI 분석용) 입력 |
| **로그인** | 이메일/비밀번호로 JWT 토큰 발급 |
| **동행 찾기** | 게시판 탭(전체 모집글) + AI 매칭 탭(성향 기반 추천) |
| **오픈채팅** | WebSocket 기반 실시간 채팅방 |
| **AI 가이드** | AI에게 여행 정보를 질문하는 챗봇 인터페이스 |

<br/>

## ⚙️ 환경변수 설정

`backend/.env` 파일에 아래 값을 설정합니다:

```env
DATABASE_URL=postgresql://admin:password123@localhost:5432/travel_db
GOOGLE_API_KEY=<your-google-gemini-api-key>
```

<br/>

## 📝 라이선스

이 프로젝트는 학습 및 포트폴리오 목적으로 제작되었습니다.

