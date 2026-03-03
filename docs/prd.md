# TripMeet — Product Requirements Document

> 최종 업데이트: 2026-03-03
> 버전: v1.0 (MVP)
> 개발 형태: 1인 개발

---

## 1. 제품 개요

### 한 줄 소개
혼자 여행하는 사람들을 위한 올인원 여행 커뮤니티 앱

### 배경 및 문제 정의
- 여행자 커뮤니티가 네이버 카페, 에브리타임, 오픈카카오톡 등에 분산되어 있어 정보 탐색이 비효율적
- 혼자 여행하는 솔로 여행자의 3가지 핵심 니즈가 단일 앱에서 해결되지 않음
  - **정보 탐색**: 현지 맛집, 여행 팁을 어디서 찾아야 하는지 불명확
  - **동행 매칭**: 같은 지역 여행자를 실시간으로 찾을 방법이 없음
  - **일정 계획**: 처음 가는 여행지의 일정 수립이 막막함
- AI 일정 생성 서비스는 존재하나, 커뮤니티 기능과 통합된 사례 없음

### 핵심 가치 제안
1. **실시간 여행자 매칭**: GPS 미사용 수동 위치 선택으로 현재 같은 지역 여행자와 즉시 연결
2. **AI 맞춤 일정**: 여행지/기간/예산/인원 4가지 입력만으로 완성된 여행 일정 자동 생성
3. **여행 특화 커뮤니티**: 질문/후기/정보 카테고리로 여행자 간 경험 공유
4. **현지 맛집 공유**: 사진 중심의 현지 검증 맛집 리뷰
5. **동행 사전 모집**: 여행 전 동반자를 미리 모집하는 구인 게시판

---

## 2. 타겟 사용자

### 주요 타겟
- **20~30대 솔로 여행자** (국내/해외 무관)
- 여행 빈도: 연 2회 이상
- 디지털 기기 친숙도: 높음

### 사용자 페르소나

**페르소나 A — 김지수 (26세, 여성)**
- 혼자 여행을 즐기지만 현지에서 말 걸 사람이 없어 외로울 때가 있음
- 맛집 정보를 인스타그램에서 찾지만 현지인 검증 정보가 부족함
- 여행 일정을 짜는 것이 귀찮아 즉흥적으로 움직이다가 후회한 경험 있음

**페르소나 B — 이준호 (31세, 남성)**
- 특정 여행지에서 함께 액티비티할 동행을 찾고 싶지만 마땅한 채널이 없음
- 여행 관련 커뮤니티가 분산되어 있어 한 곳에서 해결하고 싶음
- 이전 여행 후기를 공유하고 싶지만 적합한 플랫폼이 없었음

---

## 3. 기능 목록 (MVP)

### 기능 우선순위 매트릭스

| 기능 | 분류 | 우선순위 | MVP 포함 |
|------|------|----------|---------|
| 구글 OAuth 로그인 | 인증 | P0 | O |
| 프로필 등록/수정 | 사용자 | P0 | O |
| 수동 위치 등록 | 매칭 | P0 | O |
| 지역 여행자 목록 | 매칭 | P0 | O |
| 1:1 실시간 채팅 | 채팅 | P0 | O |
| AI 여행 일정 생성 | AI | P0 | O |
| 커뮤니티 게시판 | 커뮤니티 | P1 | O |
| 맛집 리뷰 | 맛집 | P1 | O |
| 동행 구인 게시판 | 동행 | P1 | O |
| 동행 신청/수락 | 동행 | P1 | O |
| 이메일/SNS 공유 | 공유 | P2 | O (일정만) |
| 푸시 알림 | 알림 | P2 | X |
| 다국어 지원 | 국제화 | P3 | X |
| GPS 자동 위치 | 위치 | - | X (법적 제한) |

---

## 4. 화면 목록 및 기능 정의

### 4-1. 인증

#### 로그인 화면 (`LoginScreen`)
- 구글 OAuth 버튼 1개
- 앱 소개 문구 및 주요 기능 3가지 요약
- 이용약관 동의 문구
- **인증 흐름**: Supabase Auth → PKCE → `exchangeCodeForSession`

---

### 4-2. 홈

#### 홈 화면 (`HomeScreen`)
- 히어로 배너 (앱 브랜딩)
- AI 일정 생성 빠른 진입 카드
- 주요 기능 그리드 (5개 타일)
  - AI 여행 일정 → `ItineraryFormScreen`
  - 지역 매칭 → `Matching` 탭
  - 커뮤니티 → `Community` 탭
  - 맛집 → `Restaurant` 탭
  - 동행 구인 → `Companion` 탭
- 하단 GPS 미사용 안내 문구

---

### 4-3. 매칭

#### 매칭 화면 (`MatchingScreen`)
**상태 A — 위치 미등록:**
- 레이더 애니메이션 + 위치 등록 유도 문구
- "위치 등록하기" 버튼 → `LocationSelectScreen`

**상태 B — 위치 등록 완료:**
- 현재 위치명 + "위치 변경" 버튼
- 같은 지역 여행자 카드 목록 (`TravelerListItem`)
  - 프로필 사진, 닉네임, 자기소개
  - "채팅" 버튼 → `ChatScreen`
- 여행자 없을 시 빈 상태 메시지

#### 위치 선택 화면 (`LocationSelectScreen`)
- 여행지 이름 입력 (필수): 예 "홍대", "도쿄"
- 국가 입력 (필수): 예 "한국", "일본"
- 지역 입력 (선택): 예 "서울", "도쿄도"
- "이 곳에 있어요" 제출 버튼
- **제약**: GPS 권한 요청 없음. 텍스트 수동 입력만 허용

#### 여행자 카드 컴포넌트 (`TravelerListItem`)
- 프로필 이미지 (원형) + 온라인 인디케이터
- 닉네임, 자기소개
- 채팅 버튼

---

### 4-4. 커뮤니티

#### 커뮤니티 목록 (`CommunityScreen`)
- 카테고리 탭 필터: 전체 / 질문 / 후기 / 정보
- 글쓰기 버튼 → `PostCreateScreen`
- 게시글 카드 목록 (무한 스크롤)
  - 카테고리 배지, 제목, 날짜, 조회수
- 당겨서 새로고침

#### 게시글 작성/수정 (`PostCreateScreen`)
- 카테고리 선택: 질문 / 후기 / 정보 (작성 시만)
- 제목 입력
- 내용 입력 (멀티라인)
- 등록/수정 버튼

#### 게시글 상세 (`PostDetailScreen`)
- 카테고리 배지, 조회수
- 제목, 작성자, 날짜
- 본문 내용
- 본인 글: 수정 / 삭제 버튼 노출

---

### 4-5. 맛집

#### 맛집 목록 (`RestaurantListScreen`)
- 지역 검색 필터 (텍스트 입력 + 검색 버튼)
- "등록" 버튼 → `RestaurantCreateScreen`
- 맛집 카드 목록 (무한 스크롤)
  - 대표 사진 썸네일, 가게명, 위치, 별점
- 당겨서 새로고침

#### 맛집 등록 (`RestaurantCreateScreen`)
- 가게 이름 (필수)
- 위치 (필수): 수동 텍스트 입력
- 설명 (선택)
- 별점 1~5 선택 (필수)
- 사진 최대 5장 업로드 (선택)
  - **이미지 압축**: 클라이언트에서 500KB 이하로 압축 후 전송

#### 맛집 상세 (`RestaurantDetailScreen`)
- 사진 가로 스크롤 슬라이더
- 가게명, 위치, 별점
- 설명
- 작성자, 날짜
- 본인 글: 삭제 버튼 노출

---

### 4-6. 동행

#### 동행 구인 목록 (`CompanionScreen`)
- 상태 필터 탭: 전체 / 모집중 / 마감
- "등록" 버튼 → `CompanionCreateScreen`
- 동행 카드 목록 (무한 스크롤)
  - 여행지, 상태 배지 (모집중/마감), 날짜 범위, 설명 요약, 최대 인원
- 당겨서 새로고침

#### 동행 구인 등록 (`CompanionCreateScreen`)
- 여행지 (필수)
- 여행 시작일 (필수, YYYY-MM-DD)
- 여행 종료일 (필수, YYYY-MM-DD)
- 최대 모집 인원 (필수, 2~10명)
- 동행 조건 및 설명 (필수)

#### 동행 구인 상세 (`CompanionDetailScreen`)
**비작성자 + 모집중:**
- 게시글 정보 (여행지, 날짜, 인원, 설명, 작성자)
- 동행 신청 버튼 + 메시지 입력 (선택)

**작성자:**
- 게시글 정보
- "마감하기" 버튼
- 신청자 목록: 닉네임, 상태(대기중/수락됨/거절됨), 신청 메시지
- 각 신청자: 수락 / 거절 버튼 (대기중 상태만)

---

### 4-7. AI 일정

#### 일정 생성 폼 (`ItineraryFormScreen`)
- 여행지 (필수)
- 여행 기간 in 일수 (필수)
- 인원 수 (기본값 1명)
- 예산 in 원 (필수)
- "일정 만들기" 버튼
- 생성 중 로딩 인디케이터

#### 일정 결과 (`ItineraryResultScreen`)
- 여행지, 기간, 인원, 예산 범위 요약 헤더
- 일자별 타임라인 뷰
  - Day N 레이블
  - 시간대 / 활동명 / 설명 / 예상 비용
- "SNS 공유하기" 버튼 (Share API)
- 캐시된 결과 여부 표시

---

### 4-8. 채팅

#### 채팅 목록 (`ChatListScreen`)
- 참여 중인 채팅방 목록 (Firebase 실시간)
- 상대방 ID, 마지막 메시지 미리보기

#### 채팅 방 (`ChatScreen`)
- 상대방 닉네임 헤더
- 메시지 목록 (Firebase 실시간 구독)
  - 내 메시지: 우측 정렬
  - 상대 메시지: 좌측 정렬
- 텍스트 입력 + 전송 버튼
- 키보드 올라올 시 자동 스크롤

---

### 4-9. 프로필

#### 내 정보 (`ProfileScreen`)
- 프로필 사진 (원형, 팝인 애니메이션)
- 닉네임, 자기소개
- "여행중" 배지
- 메뉴
  - 프로필 수정 → `ProfileEditScreen`
  - 로그아웃

#### 프로필 수정 (`ProfileEditScreen`)
- 프로필 사진 변경 (갤러리 선택 → 압축 → 업로드)
- 닉네임 수정
- 자기소개 수정 (최대 200자, 글자 수 카운터)
- 저장 버튼

---

## 5. 네비게이션 구조

```
RootNavigator (Stack)
├── LoginScreen
└── Main (Stack)
    ├── MainTabs (BottomTab)
    │   ├── HomeScreen
    │   ├── MatchingScreen
    │   ├── CommunityScreen
    │   ├── RestaurantListScreen
    │   ├── CompanionScreen
    │   └── ProfileScreen
    ├── LocationSelectScreen
    ├── PostCreateScreen
    ├── PostDetailScreen
    ├── RestaurantCreateScreen
    ├── RestaurantDetailScreen
    ├── CompanionCreateScreen
    ├── CompanionDetailScreen
    ├── ItineraryFormScreen
    ├── ItineraryResultScreen
    ├── ChatListScreen
    ├── ChatScreen
    └── ProfileEditScreen
```

### 탭 구성

| 탭 | 아이콘 | 색상 |
|----|--------|------|
| 홈 | home | 네이비 |
| 매칭 | location | 그린 |
| 커뮤니티 | chatbubbles | 네이비 |
| 맛집 | restaurant | 레드 |
| 동행 | people | 앰버 |
| 내 정보 | person | 네이비 |

---

## 6. 기술 스택

### 프론트엔드
| 항목 | 기술 |
|------|------|
| 프레임워크 | React Native (Expo SDK) |
| 언어 | TypeScript |
| 네비게이션 | React Navigation v6 |
| 인증 클라이언트 | Supabase JS SDK |
| HTTP | fetch API |
| 실시간 채팅 | Firebase Firestore |
| 그라디언트 | expo-linear-gradient |
| 이미지 압축 | expo-image-manipulator |
| 이미지 선택 | expo-image-picker |
| 아이콘 | @expo/vector-icons (Ionicons) |
| 글래스모피즘 | expo-blur |
| 애니메이션 | React Native Animated API |

### 백엔드
| 항목 | 기술 |
|------|------|
| 프레임워크 | FastAPI (Python 3.12) |
| 배포 | Render.com |
| DB | Supabase PostgreSQL |
| 인증 검증 | Supabase Auth (JWT 검증) |
| AI | OpenAI GPT-4o-mini |
| 캐싱 | Upstash Redis |
| 이미지 저장 | Cloudflare R2 (S3 호환) |
| 멀티파트 | python-multipart |

---

## 7. API 엔드포인트

### 인증
모든 요청: `Authorization: Bearer {supabase_access_token}`

### 사용자
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /users/me | 내 프로필 조회 |
| PATCH | /users/me | 닉네임/자기소개 수정 |
| POST | /users/me/profile-image | 프로필 사진 업로드 |

### 위치 (매칭)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /locations/ | 현재 위치 등록 |
| GET | /locations/?location_name={name} | 특정 지역 여행자 목록 |

### AI 일정
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /itineraries/ | AI 일정 생성 (Redis 캐시 우선) |
| GET | /itineraries/{id} | 일정 상세 조회 |

### 커뮤니티
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /posts?category={cat}&cursor={cur} | 게시글 목록 (커서 기반 페이지네이션) |
| POST | /posts | 게시글 작성 |
| GET | /posts/{id} | 게시글 상세 (조회수 +1) |
| PATCH | /posts/{id} | 게시글 수정 (본인만) |
| DELETE | /posts/{id} | 게시글 삭제 (본인만) |

### 맛집
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /restaurants?location={loc}&cursor={cur} | 맛집 목록 |
| POST | /restaurants | 맛집 등록 (이미지 포함 multipart) |
| GET | /restaurants/{id} | 맛집 상세 |
| DELETE | /restaurants/{id} | 맛집 삭제 (본인만) |

### 동행
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /companions?status={open\|closed}&cursor={cur} | 동행 구인 목록 |
| POST | /companions | 동행 구인 등록 |
| GET | /companions/{id} | 동행 구인 상세 + 신청자 목록 |
| PATCH | /companions/{id}/close | 마감 처리 (작성자만) |
| POST | /companions/{id}/apply | 동행 신청 |
| PATCH | /companions/{id}/applications/{app_id} | 신청 수락/거절 |

---

## 8. 데이터베이스 스키마

### users
```sql
id               UUID PRIMARY KEY        -- Supabase Auth UID
nickname         VARCHAR(50) NOT NULL
profile_image_url TEXT
bio              TEXT
created_at       TIMESTAMPTZ DEFAULT now()
updated_at       TIMESTAMPTZ DEFAULT now()
```

### travel_locations
```sql
id            UUID PRIMARY KEY
user_id       UUID REFERENCES users(id)
location_name VARCHAR(100) NOT NULL       -- "홍대", "도쿄"
country       VARCHAR(50) NOT NULL        -- "한국", "일본"
region        VARCHAR(100)               -- "서울", "도쿄도"
is_active     BOOLEAN DEFAULT true
activated_at  TIMESTAMPTZ DEFAULT now()
deactivated_at TIMESTAMPTZ

INDEX (location_name, is_active)
```

### itineraries
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
destination     VARCHAR(100) NOT NULL
duration_days   SMALLINT NOT NULL
travelers_count SMALLINT NOT NULL
budget_range    VARCHAR(20) NOT NULL        -- "30만원대" (구간화)
cache_key       VARCHAR(255) UNIQUE
content         JSONB NOT NULL              -- { days: [...] }
is_cached       BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ DEFAULT now()
```

**일정 content JSON 구조:**
```json
{
  "days": [
    {
      "day": 1,
      "date_label": "1일차",
      "activities": [
        {
          "time": "10:00",
          "title": "활동명",
          "description": "설명",
          "estimated_cost": 15000
        }
      ]
    }
  ]
}
```

### posts
```sql
id         UUID PRIMARY KEY
user_id    UUID REFERENCES users(id)
category   VARCHAR(20) NOT NULL  -- 'question' | 'review' | 'info'
title      VARCHAR(200) NOT NULL
content    TEXT NOT NULL
view_count INTEGER DEFAULT 0
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

### restaurants
```sql
id            UUID PRIMARY KEY
user_id       UUID REFERENCES users(id)
name          VARCHAR(100) NOT NULL
location_name VARCHAR(100) NOT NULL
description   TEXT
rating        SMALLINT CHECK (rating BETWEEN 1 AND 5)
image_urls    TEXT[]                -- Cloudflare R2 URL (최대 5장)
created_at    TIMESTAMPTZ DEFAULT now()
```

### companions
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES users(id)
destination       VARCHAR(100) NOT NULL
travel_start_date DATE NOT NULL
travel_end_date   DATE NOT NULL
description       TEXT NOT NULL
max_participants  SMALLINT DEFAULT 2
status            VARCHAR(20) DEFAULT 'open'  -- 'open' | 'closed'
created_at        TIMESTAMPTZ DEFAULT now()
updated_at        TIMESTAMPTZ DEFAULT now()
```

### companion_applications
```sql
id           UUID PRIMARY KEY
companion_id UUID REFERENCES companions(id)
applicant_id UUID REFERENCES users(id)
message      TEXT
status       VARCHAR(20) DEFAULT 'pending'  -- 'pending' | 'accepted' | 'rejected'
created_at   TIMESTAMPTZ DEFAULT now()

UNIQUE (companion_id, applicant_id)
```

---

## 9. 비용 구조

### 인프라 비용 (월)

| 서비스 | 용도 | 무료 한도 | 초과 비용 |
|--------|------|-----------|-----------|
| Render.com | FastAPI 백엔드 | 무료 (콜드 스타트) | $7/월 |
| Supabase | PostgreSQL + Auth | 500MB DB, 50K MAU | $25/월 |
| Cloudflare R2 | 이미지 저장 | 10GB + 100만 req | $0.015/GB |
| Upstash Redis | AI 캐싱 | 10,000 req/일 | $0.2/10만 req |
| Firebase Firestore | 실시간 채팅 | 50K 읽기/일 | $0.06/10만 |
| OpenAI GPT-4o-mini | AI 일정 | - | ~$0.002/건 |

**예상 MVP 월 비용:** 초기 $0 (무료 티어 내) → 성장 시 ~$32/월

### AI 비용 방어
- Redis 캐시 키: `{destination}:{duration_days}일:{travelers_count}명:{budget_range}`
- 예산 구간화: 25만원 → "20만원대" (캐시 히트율 최대화)
- TTL: 7일

---

## 10. 주요 제약 및 정책

### 보안
- GPS 자동 수집 절대 금지 (위치정보법 적용 대상 회피)
- 위치 데이터: 사용자 직접 입력 텍스트만 저장, 좌표 저장 금지
- 인증: Supabase Auth Google OAuth (PKCE 방식)
- 이미지: 클라이언트에서 500KB 이하 압축 후 전송

### 이미지 처리
- 업로드 최대: 맛집 5장, 프로필 1장
- 압축 기준: 500KB 이하, 최대 1280px
- 저장: Cloudflare R2 (이그레스 무료)

### 페이지네이션
- 방식: 커서 기반 (Cursor-based Pagination)
- 기본 페이지 크기: 20건

### 채팅
- Firebase Firestore 실시간 리스너
- 컴포넌트 언마운트 시 반드시 리스너 해제 (`unsubscribe()`)

---

## 11. 화면별 상태 목록

| 화면 | 로딩 상태 | 빈 상태 | 에러 상태 |
|------|-----------|---------|-----------|
| MatchingScreen | ActivityIndicator | "이 지역에 여행자가 없습니다" | - |
| CommunityScreen | ActivityIndicator | "아직 게시글이 없습니다" | - |
| RestaurantListScreen | ActivityIndicator | "등록된 맛집이 없습니다" | - |
| CompanionScreen | ActivityIndicator | "등록된 동행 구인이 없습니다" | - |
| PostDetailScreen | ActivityIndicator | - | Alert + goBack |
| RestaurantDetailScreen | ActivityIndicator | - | Alert + goBack |
| CompanionDetailScreen | ActivityIndicator | - | Alert + goBack |
| ProfileScreen | ActivityIndicator | - | Alert |
| ItineraryFormScreen | 버튼 내 spinner | - | Alert |
| ChatListScreen | ActivityIndicator | "아직 채팅이 없습니다" | - |

---

## 12. 애니메이션 패턴

앱 전반에서 일관된 애니메이션을 사용한다.

| 패턴 | 적용 위치 | 구현 |
|------|-----------|------|
| 카드 진입 (fadeIn + slideUp) | 목록 카드 | `Animated.parallel(opacity + spring)` |
| 카드 프레스 (scale down) | 터치 가능 카드 | `spring(scale, 0.97)` |
| 배너 팝인 | 홈 히어로 배너 | `spring(scale, 0.97→1) + timing(opacity)` |
| 펄스 링 | 매칭 레이더 | `loop(timing(scale) + timing(opacity))` |
| 파티클 플로팅 | 로그인 배경 | `loop(sequence(translateY + translateX + rotate))` |
| 아바타 팝인 | 프로필 사진 | `spring(scale, 0.85→1)` |
| 시머 효과 | 로그인 CTA 버튼 | `loop(timing(translateX))` |
