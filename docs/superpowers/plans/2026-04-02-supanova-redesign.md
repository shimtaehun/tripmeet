# TripMeet Supanova 전면 리디자인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supanova Design Skill 원칙을 적용해 랜딩 페이지(HTML)와 앱 전체 화면(React Native)을 프리미엄 에이전시 수준으로 전면 리디자인한다.

**Architecture:** LandingScreen은 `LANDING_HTML` 문자열을 완전히 교체한다(iframe srcDoc 방식 유지). 앱 화면은 `theme.ts` 토큰 업그레이드를 기반으로 CustomTabBar → HomeScreen → 목록 화면(Community/Companion/Restaurant/Matching) → ProfileScreen 순으로 리디자인한다.

**Tech Stack:** React Native (Expo), TypeScript, expo-linear-gradient, Ionicons, Tailwind CDN(랜딩 전용), Pretendard(랜딩 전용)

---

## 파일 목록

| 파일 | 작업 |
|---|---|
| `frontend/src/screens/landing/LandingScreen.tsx` | LANDING_HTML 전면 교체 |
| `frontend/src/utils/theme.ts` | 컬러·타이포·쉐도우 토큰 업그레이드 |
| `frontend/src/navigation/CustomTabBar.tsx` | 웹 상단 네비 + 모바일 탭바 프리미엄 재작성 |
| `frontend/src/screens/home/HomeScreen.tsx` | 전면 리디자인 |
| `frontend/src/screens/community/CommunityScreen.tsx` | 헤더·카드 리디자인 |
| `frontend/src/screens/companion/CompanionScreen.tsx` | 헤더·카드 리디자인 |
| `frontend/src/screens/restaurant/RestaurantListScreen.tsx` | 헤더·카드 리디자인 |
| `frontend/src/screens/matching/MatchingScreen.tsx` | 헤더·카드 리디자인 |
| `frontend/src/screens/profile/ProfileScreen.tsx` | 헤더·섹션 리디자인 |

---

## Task 1: 랜딩 페이지 — Supanova HTML 전면 교체

**Files:**
- Modify: `frontend/src/screens/landing/LandingScreen.tsx`

`LANDING_HTML` 상수를 아래 전체 HTML로 교체한다. `onStart` 콜백, iframe 렌더링 로직은 변경하지 않는다.

- [ ] **Step 1: LANDING_HTML 상수 전체 교체**

`LandingScreen.tsx`의 줄 9 `const LANDING_HTML = \`<!DOCTYPE html>` 부터 줄 1204 `\`;` 까지 삭제하고 아래로 교체한다.

```tsx
const LANDING_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TripMeet — 여행자 커뮤니티</title>
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="stylesheet" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: { sans: ['Pretendard', 'sans-serif'] },
        colors: {
          indigo: {
            950: '#1E1B4B',
            900: '#312E81',
            800: '#3730A3',
            700: '#4338CA',
            600: '#4F46E5',
            500: '#6366F1',
            400: '#818CF8',
            100: '#E0E7FF',
            50:  '#EEF2FF',
          },
          coral: { 500: '#F97316', 400: '#FB923C' },
          surface: '#FAFAF8',
        },
        animation: {
          'fade-up':   'fadeUp 0.7s cubic-bezier(.16,1,.3,1) both',
          'fade-in':   'fadeIn 0.5s ease both',
          'float':     'float 6s ease-in-out infinite',
          'float-alt': 'float 8s ease-in-out 2s infinite',
          'glow':      'glow 3s ease-in-out infinite',
        },
        keyframes: {
          fadeUp:  { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
          fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
          float:   { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
          glow:    { '0%,100%': { boxShadow: '0 0 40px rgba(99,102,241,.25)' }, '50%': { boxShadow: '0 0 80px rgba(99,102,241,.45)' } },
        },
        transitionTimingFunction: { spring: 'cubic-bezier(.16,1,.3,1)' },
      }
    }
  }
</script>
<style>
  * { font-family: 'Pretendard', sans-serif; }
  html { scroll-behavior: smooth; }
  body { background: #FAFAF8; overflow-x: hidden; }

  .bezel-card {
    background: white;
    border: 1px solid rgba(99,102,241,.10);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(99,102,241,.06), 0 12px 40px rgba(99,102,241,.08);
    position: relative;
  }
  .bezel-card::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 21px;
    background: linear-gradient(135deg, rgba(99,102,241,.15) 0%, transparent 60%);
    z-index: -1;
  }

  .phone-bezel {
    background: #0F0E1A;
    border-radius: 44px;
    padding: 16px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,.08),
      0 48px 96px rgba(0,0,0,.45),
      0 0 80px rgba(99,102,241,.20);
  }
  .phone-screen {
    background: linear-gradient(160deg, #0F0E1A 0%, #1E1B4B 60%, #312E81 100%);
    border-radius: 32px;
    overflow: hidden;
  }

  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .shimmer {
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.15) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 2.5s ease-in-out infinite;
  }

  .nav-blur {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(250,250,248,.85);
  }
</style>
</head>
<body class="bg-surface text-indigo-950">

<!-- 네비게이션 -->
<nav class="nav-blur fixed top-0 left-0 right-0 z-50 border-b border-indigo-100/60" style="animation-delay:0s">
  <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 17l9-13 9 13H3z" fill="white" fill-opacity=".9"/></svg>
      </div>
      <span class="text-lg font-black tracking-tight text-indigo-950">TripMeet</span>
    </div>
    <ul class="hidden md:flex items-center gap-1">
      <li><a href="#about" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-700 rounded-full hover:bg-indigo-50 transition-all">소개</a></li>
      <li><a href="#features" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-700 rounded-full hover:bg-indigo-50 transition-all">기능</a></li>
      <li><a href="#how" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-700 rounded-full hover:bg-indigo-50 transition-all">이용방법</a></li>
    </ul>
    <a href="#" onclick="window.parent.postMessage('navigate:login', '*'); return false;"
       class="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5">
      무료 시작
    </a>
  </div>
</nav>

<!-- 히어로 -->
<section class="min-h-screen pt-16 flex items-center relative overflow-hidden">
  <!-- 배경 오브 -->
  <div class="absolute top-20 right-0 w-[700px] h-[700px] rounded-full bg-gradient-radial from-indigo-100/60 to-transparent pointer-events-none"></div>
  <div class="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-radial from-coral-500/5 to-transparent pointer-events-none"></div>

  <div class="max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-16 items-center py-20">
    <!-- 왼쪽: 카피 -->
    <div class="animate-fade-up">
      <div class="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-wide uppercase">
        <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
        지금 12,000명이 여행 중
      </div>
      <h1 class="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6 text-indigo-950">
        여행에서<br>
        <span class="bg-gradient-to-r from-indigo-700 via-indigo-500 to-coral-400 bg-clip-text text-transparent">
          진짜 연결을
        </span><br>
        경험하세요
      </h1>
      <p class="text-lg text-slate-500 leading-relaxed mb-10 font-light max-w-md">
        같은 여행지의 여행자와 즉시 매칭되고,<br>AI가 나만의 일정을 완성해드려요.
      </p>
      <div class="flex flex-wrap items-center gap-4 mb-12">
        <a href="#" onclick="window.parent.postMessage('navigate:login', '*'); return false;"
           class="inline-flex items-center gap-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 text-base">
          지금 무료로 시작하기
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a href="#how" class="text-sm font-semibold text-slate-500 hover:text-indigo-700 transition-colors flex items-center gap-1.5">
          어떻게 작동하나요
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
      <!-- 통계 -->
      <div class="flex items-center gap-8 pt-8 border-t border-slate-200/80">
        <div>
          <div class="text-3xl font-black tracking-tight text-indigo-700">12K+</div>
          <div class="text-xs text-slate-400 mt-1">활성 여행자</div>
        </div>
        <div class="w-px h-10 bg-slate-200"></div>
        <div>
          <div class="text-3xl font-black tracking-tight text-indigo-700">94개</div>
          <div class="text-xs text-slate-400 mt-1">지원 여행지</div>
        </div>
        <div class="w-px h-10 bg-slate-200"></div>
        <div>
          <div class="text-3xl font-black tracking-tight text-indigo-700">4.9</div>
          <div class="text-xs text-slate-400 mt-1">평균 평점</div>
        </div>
      </div>
    </div>

    <!-- 오른쪽: 폰 목업 -->
    <div class="flex justify-center animate-fade-up" style="animation-delay:.15s">
      <div class="relative">
        <!-- 배경 글로우 -->
        <div class="absolute inset-0 blur-3xl bg-indigo-500/20 rounded-full scale-110 animate-glow"></div>
        <!-- 폰 외곽 베젤 -->
        <div class="phone-bezel w-64 h-[520px] animate-float relative z-10">
          <div class="phone-screen w-full h-full">
            <!-- 앱 헤더 -->
            <div class="px-4 pt-5 pb-3 flex justify-between items-center">
              <span class="text-base font-black text-white tracking-tight">TripMeet</span>
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-coral-400 shimmer"></div>
            </div>
            <!-- 위치 카드 -->
            <div class="mx-4 mb-3 px-3 py-2.5 rounded-2xl bg-white/8 border border-white/10 flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-xl bg-indigo-500/20 flex items-center justify-center text-base">📍</div>
              <div>
                <div class="text-white text-xs font-semibold">도쿄, 일본</div>
                <div class="text-white/40 text-[10px] mt-0.5">3일차 여행 중</div>
              </div>
            </div>
            <!-- 섹션 라벨 -->
            <div class="px-4 text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">근처 여행자</div>
            <!-- 여행자 카드 3개 -->
            <div class="px-4 space-y-2">
              <div class="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-xs">😊</div>
                <div class="flex-1 min-w-0">
                  <div class="text-white text-xs font-semibold">지민 · 25세</div>
                  <div class="text-white/35 text-[10px]">서울 · 혼자 여행</div>
                </div>
                <button class="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-full">채팅</button>
              </div>
              <div class="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-400 flex items-center justify-center text-xs">🧳</div>
                <div class="flex-1 min-w-0">
                  <div class="text-white text-xs font-semibold">준혁 · 28세</div>
                  <div class="text-white/35 text-[10px]">부산 · 혼자 여행</div>
                </div>
                <button class="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-full">채팅</button>
              </div>
              <div class="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-green-600 to-emerald-400 flex items-center justify-center text-xs">✈️</div>
                <div class="flex-1 min-w-0">
                  <div class="text-white text-xs font-semibold">수아 · 23세</div>
                  <div class="text-white/35 text-[10px]">인천 · 혼자 여행</div>
                </div>
                <button class="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-full">채팅</button>
              </div>
            </div>
          </div>
        </div>
        <!-- 플로팅 배지 -->
        <div class="absolute -right-10 top-16 bezel-card px-3 py-2 animate-float-alt text-xs font-semibold text-indigo-700 whitespace-nowrap z-20">
          도쿄 지금 핫해요
        </div>
        <div class="absolute -left-12 bottom-24 bezel-card px-3 py-2 animate-float text-xs font-semibold text-slate-700 whitespace-nowrap z-20" style="animation-delay:1s">
          새 메시지 2개
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 소개 -->
<section class="py-28" id="about">
  <div class="max-w-6xl mx-auto px-6">
    <div class="grid md:grid-cols-2 gap-16 items-center">
      <!-- 왼쪽: 카드 벤토 그리드 -->
      <div class="grid grid-cols-2 gap-4 animate-fade-up">
        <div class="bezel-card p-5 col-span-2">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-lg">🗾</div>
            <div>
              <div class="text-sm font-bold text-indigo-950">도쿄 여행 중</div>
              <div class="text-xs text-slate-400">근처 여행자 3명 발견</div>
            </div>
          </div>
          <div class="h-1.5 rounded-full bg-indigo-50 overflow-hidden">
            <div class="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-700 to-indigo-400 shimmer"></div>
          </div>
        </div>
        <div class="bezel-card p-5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center mb-3 text-base shadow-lg shadow-violet-500/25">🤖</div>
          <div class="text-sm font-bold text-indigo-950 mb-1">AI 일정</div>
          <div class="text-xs text-slate-400 leading-relaxed">제주 2박 3일 맞춤 코스 자동 완성</div>
        </div>
        <div class="bezel-card p-5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-600 to-rose-500 flex items-center justify-center mb-3 text-base shadow-lg shadow-pink-500/25">🍜</div>
          <div class="text-sm font-bold text-indigo-950 mb-1">맛집 추천</div>
          <div class="text-xs text-slate-400 leading-relaxed">부산 광안리 여행자 직추 15곳</div>
        </div>
        <div class="bezel-card p-5 col-span-2 bg-gradient-to-br from-indigo-700 to-indigo-900" style="border-color: rgba(99,102,241,.3)">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg">👥</div>
            <div>
              <div class="text-sm font-bold text-white">오사카 동행 구인</div>
              <div class="text-xs text-indigo-200">미리 동반자 모집 가능</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 오른쪽: 텍스트 -->
      <div class="animate-fade-up" style="animation-delay:.1s">
        <div class="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wide">
          TripMeet 소개
        </div>
        <h2 class="text-4xl font-black tracking-tighter leading-tight mb-6 text-indigo-950">
          혼자 여행자를 위한<br>
          <span class="bg-gradient-to-r from-indigo-700 to-indigo-400 bg-clip-text text-transparent">올인원 커뮤니티</span>
        </h2>
        <p class="text-slate-500 leading-relaxed mb-8 font-light">
          네이버 카페, 구글 맵, 카카오톡을 오가는 번거로움은 이제 그만. TripMeet 하나로 여행지에서 필요한 모든 것을 해결하세요.
        </p>
        <ul class="space-y-3">
          <li class="flex items-start gap-3">
            <div class="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#4338CA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span class="text-sm text-slate-600 leading-relaxed">같은 여행지의 여행자와 즉시 실시간 매칭</span>
          </li>
          <li class="flex items-start gap-3">
            <div class="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#4338CA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span class="text-sm text-slate-600 leading-relaxed">AI가 목적지·기간·예산에 맞는 일정 자동 생성</span>
          </li>
          <li class="flex items-start gap-3">
            <div class="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#4338CA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span class="text-sm text-slate-600 leading-relaxed">현지 여행자가 직접 추천하는 진짜 맛집 정보</span>
          </li>
          <li class="flex items-start gap-3">
            <div class="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#4338CA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span class="text-sm text-slate-600 leading-relaxed">GPS 수집 없이 안전한 지역 단위 매칭</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- 기능 -->
<section class="py-28 bg-white" id="features">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16 animate-fade-up">
      <div class="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-wide">핵심 기능</div>
      <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-indigo-950">
        여행이 더 풍요로워지는<br>
        <span class="bg-gradient-to-r from-indigo-700 to-indigo-400 bg-clip-text text-transparent">6가지 이유</span>
      </h2>
    </div>
    <!-- 비대칭 벤토 그리드 -->
    <div class="grid md:grid-cols-3 gap-5 animate-fade-up" style="animation-delay:.1s">
      <div class="bezel-card p-7 md:col-span-2 hover:-translate-y-1 transition-transform duration-300">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-500 flex items-center justify-center text-2xl mb-5 shadow-lg shadow-indigo-500/25">🤝</div>
        <div class="text-lg font-bold text-indigo-950 mb-2">실시간 여행자 매칭</div>
        <div class="text-sm text-slate-500 leading-relaxed">같은 여행지에 있는 여행자와 즉시 연결하세요. GPS 없이 도시 단위로 안전하게 매칭됩니다.</div>
      </div>
      <div class="bezel-card p-7 hover:-translate-y-1 transition-transform duration-300">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-2xl mb-5 shadow-lg shadow-violet-500/25">🤖</div>
        <div class="text-lg font-bold text-indigo-950 mb-2">AI 일정 생성</div>
        <div class="text-sm text-slate-500 leading-relaxed">Gemini AI가 여행지·기간·예산에 최적화된 일정을 자동으로 완성합니다.</div>
      </div>
      <div class="bezel-card p-7 hover:-translate-y-1 transition-transform duration-300">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-500 flex items-center justify-center text-2xl mb-5 shadow-lg shadow-pink-500/25">🍜</div>
        <div class="text-lg font-bold text-indigo-950 mb-2">여행자 맛집</div>
        <div class="text-sm text-slate-500 leading-relaxed">가이드북이 아닌 실제 여행자들이 직접 추천하는 진짜 현지 맛집.</div>
      </div>
      <div class="bezel-card p-7 md:col-span-2 hover:-translate-y-1 transition-transform duration-300">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center text-2xl mb-5 shadow-lg shadow-amber-500/25">👥</div>
        <div class="text-lg font-bold text-indigo-950 mb-2">동행 구인</div>
        <div class="text-sm text-slate-500 leading-relaxed">출발 전에 미리 동행을 구하세요. 여행 목적지와 일정을 공유해 맞는 파트너를 찾아드립니다.</div>
      </div>
      <div class="bezel-card p-7 hover:-translate-y-1 transition-transform duration-300">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl mb-5 shadow-lg shadow-blue-500/25">💬</div>
        <div class="text-lg font-bold text-indigo-950 mb-2">여행 커뮤니티</div>
        <div class="text-sm text-slate-500 leading-relaxed">여행 후기, 꿀팁, 질문을 공유하며 경험을 나누세요.</div>
      </div>
      <div class="bezel-card p-7 md:col-span-2 bg-gradient-to-br from-indigo-700 to-indigo-900 hover:-translate-y-1 transition-transform duration-300" style="border-color: rgba(99,102,241,.4)">
        <div class="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl mb-5">💬</div>
        <div class="text-lg font-bold text-white mb-2">실시간 채팅</div>
        <div class="text-sm text-indigo-200 leading-relaxed">매칭된 여행자와 앱 내 채팅으로 바로 소통하세요. 일정 조율부터 만남까지 한곳에서.</div>
      </div>
    </div>
  </div>
</section>

<!-- 이용 방법 -->
<section class="py-28 bg-indigo-950" id="how">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-indigo-300 text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-wide">이용 방법</div>
      <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-white">
        딱 3단계면<br>
        <span class="bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">여행이 달라져요</span>
      </h2>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="text-center group">
        <div class="w-16 h-16 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center text-3xl mx-auto mb-5 group-hover:bg-indigo-700/50 transition-colors">📍</div>
        <div class="text-4xl font-black text-white/10 mb-2">01</div>
        <div class="text-base font-bold text-white mb-2">여행지 등록</div>
        <div class="text-sm text-indigo-300 leading-relaxed">현재 여행 중인 도시를 선택하면 자동으로 같은 지역 여행자와 연결됩니다.</div>
      </div>
      <div class="text-center group">
        <div class="w-16 h-16 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center text-3xl mx-auto mb-5 group-hover:bg-indigo-700/50 transition-colors">🤝</div>
        <div class="text-4xl font-black text-white/10 mb-2">02</div>
        <div class="text-base font-bold text-white mb-2">여행자 탐색</div>
        <div class="text-sm text-indigo-300 leading-relaxed">근처 여행자 목록을 확인하고 마음에 드는 사람에게 채팅을 보내세요.</div>
      </div>
      <div class="text-center group">
        <div class="w-16 h-16 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center text-3xl mx-auto mb-5 group-hover:bg-indigo-700/50 transition-colors">🌏</div>
        <div class="text-4xl font-black text-white/10 mb-2">03</div>
        <div class="text-base font-bold text-white mb-2">함께 여행</div>
        <div class="text-sm text-indigo-300 leading-relaxed">맛집, 관광지, 일정을 공유하며 혼자이지만 혼자가 아닌 여행을 즐기세요.</div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-28">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <div class="bezel-card p-12 md:p-16 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 opacity-60"></div>
      <div class="relative z-10">
        <div class="text-5xl mb-6">✈️</div>
        <h2 class="text-4xl md:text-5xl font-black tracking-tighter text-indigo-950 mb-5">
          다음 여행은<br>
          <span class="bg-gradient-to-r from-indigo-700 to-indigo-400 bg-clip-text text-transparent">TripMeet과 함께</span>
        </h2>
        <p class="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">지금 가입하면 12,000명의 여행자 커뮤니티에 바로 합류할 수 있어요.</p>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="#" onclick="window.parent.postMessage('navigate:login', '*'); return false;"
             class="inline-flex items-center gap-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 text-base">
            웹으로 무료 시작하기
          </a>
        </div>
        <p class="text-xs text-slate-400 mt-5">신용카드 불필요 · 영구 무료</p>
      </div>
    </div>
  </div>
</section>

<!-- 푸터 -->
<footer class="py-10 border-t border-slate-200/80">
  <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/25">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 17l9-13 9 13H3z" fill="white" fill-opacity=".9"/></svg>
      </div>
      <span class="font-bold text-indigo-950">TripMeet</span>
    </div>
    <p class="text-xs text-slate-400">© 2026 TripMeet. 여행자를 위한 커뮤니티.</p>
  </div>
</footer>

</body>
</html>`;
```

- [ ] **Step 2: 파일 저장 후 개발 서버에서 확인**

```bash
cd /home/sthun11/tripmeet/frontend
npx expo start --web --port 8081
```

랜딩 페이지(`/`) 접속해 다음 항목 확인:
- Pretendard 폰트 로딩
- 히어로 애니메이션 작동
- "무료 시작" 버튼 클릭 시 로그인 화면으로 전환
- 반응형 레이아웃 (모바일/데스크톱)

- [ ] **Step 3: 커밋**

```bash
cd /home/sthun11/tripmeet
git add frontend/src/screens/landing/LandingScreen.tsx
git commit -m "feat(landing): Supanova 디자인 랜딩 페이지 전면 재작성"
```

---

## Task 2: theme.ts — Supanova 프리미엄 토큰 업그레이드

**Files:**
- Modify: `frontend/src/utils/theme.ts`

색상은 기존 인디고 아이덴티티를 유지하되 전체 팔레트를 더 깊고 정교하게 업그레이드한다. 배경은 따뜻한 화이트, 카드는 순백, 쉐도우는 다층 구조로 변경한다.

- [ ] **Step 1: theme.ts 전체 교체**

`frontend/src/utils/theme.ts`를 아래 내용으로 전면 교체한다:

```typescript
// ─────────────────────────────────────────────────────────────
// Supanova Premium Design System v1.0
// Primary: Deep Indigo (#4F46E5) / Accent: Coral (#F97316)
// ─────────────────────────────────────────────────────────────

export const Colors = {
  // Primary — 딥 인디고 (기존 대비 더 깊고 차분한 톤)
  primary:        '#4F46E5',
  primaryDark:    '#4338CA',
  primaryDeep:    '#1E1B4B',
  primaryLight:   '#EEF2FF',
  primaryBorder:  '#C7D2FE',
  primaryMuted:   '#6366F1',

  // Accent — 코랄 오렌지
  coral:          '#F97316',
  coralDark:      '#EA580C',
  coralLight:     '#FFF7ED',
  coralBorder:    '#FED7AA',

  // 시맨틱
  green:          '#059669',
  greenLight:     '#D1FAE5',
  greenBorder:    '#6EE7B7',
  red:            '#DC2626',
  redLight:       '#FEE2E2',
  redBorder:      '#FECACA',
  amber:          '#D97706',
  amberLight:     '#FEF3C7',
  amberBorder:    '#FDE68A',
  purple:         '#7C3AED',
  purpleLight:    '#EDE9FE',
  purpleBorder:   '#DDD6FE',
  pink:           '#DB2777',
  pinkLight:      '#FCE7F3',
  pinkBorder:     '#FBCFE8',
  cyan:           '#0891B2',
  cyanLight:      '#CFFAFE',
  cyanBorder:     '#A5F3FC',

  // 서피스 — 따뜻한 뉴트럴 배경
  background:     '#FAFAF8',
  card:           '#FFFFFF',
  surface:        '#F5F5F3',
  surfaceHover:   '#EFEFF0',

  // 텍스트 — 더 깊고 선명한 계층
  text:           '#0A0A0B',
  textMedium:     '#3D3D40',
  textLight:      '#898989',
  textOnDark:     '#FFFFFF',
  textOnDarkSub:  'rgba(255,255,255,0.75)',

  // 선 — 얇고 정교한
  border:         '#E8E8E6',
  borderStrong:   '#C7D2FE',
  divider:        '#F0F0EE',

  // 탭
  tabActive:      '#4F46E5',
  tabInactive:    '#A0A0A0',
};

export const Gradients = {
  // CTA 메인
  primary:   ['#4338CA', '#4F46E5', '#6366F1'] as string[],
  coral:     ['#4338CA', '#4F46E5', '#818CF8'] as string[],

  // 히어로
  hero:      ['#0F0E1A', '#1E1B4B', '#312E81'] as string[],

  // 기능별
  ai:        ['#4C1D95', '#6D28D9', '#7C3AED'] as string[],
  matching:  ['#064E3B', '#059669', '#10B981'] as string[],
  food:      ['#881337', '#DB2777', '#EC4899'] as string[],
  companion: ['#78350F', '#D97706', '#F59E0B'] as string[],
  community: ['#1E3A8A', '#2563EB', '#60A5FA'] as string[],
  chat:      ['#164E63', '#0891B2', '#06B6D4'] as string[],
  profile:   ['#1E1B4B', '#312E81', '#4F46E5'] as string[],

  // 배너
  indigo:    ['#4338CA', '#4F46E5'] as string[],
  rose:      ['#9F1239', '#E11D48', '#F43F5E'] as string[],
  teal:      ['#0F766E', '#0D9488', '#14B8A6'] as string[],
  sky:       ['#0C4A6E', '#0284C7', '#0EA5E9'] as string[],
  sunset:    ['#EA580C', '#F43F5E', '#EC4899'] as string[],

  // 오버레이
  overlay:   ['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)'] as string[],
};

export const Radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  card: 20,
  full: 999,
};

export const Shadow = {
  // 기본 계층형 쉐도우
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 10,
  },
  // 컬러 쉐도우 (CTA 버튼 등)
  primary: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  coral: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  blue: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  pink: {
    shadowColor: '#DB2777',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  green: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const Typography = {
  display: { fontSize: 34, fontWeight: '900' as const, color: Colors.text, letterSpacing: -1.0 },
  h1:      { fontSize: 28, fontWeight: '800' as const, color: Colors.text, letterSpacing: -0.6 },
  h2:      { fontSize: 22, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.4 },
  h3:      { fontSize: 18, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.2 },
  h4:      { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
  body:    { fontSize: 15, fontWeight: '400' as const, color: Colors.textMedium, lineHeight: 24 },
  bodyMd:  { fontSize: 14, fontWeight: '400' as const, color: Colors.textMedium, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textLight, lineHeight: 18 },
  label:   { fontSize: 11, fontWeight: '700' as const, color: Colors.textLight, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  overline:{ fontSize: 10, fontWeight: '700' as const, color: Colors.textLight, letterSpacing: 1.5, textTransform: 'uppercase' as const },
  buttonLg:{ fontSize: 16, fontWeight: '700' as const, letterSpacing: -0.1 },
  buttonMd:{ fontSize: 14, fontWeight: '700' as const },
  buttonSm:{ fontSize: 13, fontWeight: '600' as const },
};

export const Spacing = {
  xs:        4,
  sm:        8,
  md:        16,
  lg:        24,
  xl:        32,
  xxl:       48,
  screenPad: 20,
};

export const Animation = {
  fast:     150,
  normal:   220,
  entrance: 300,
  slow:     420,
};
```

- [ ] **Step 2: TypeScript 오류 확인**

```bash
cd /home/sthun11/tripmeet/frontend
npx tsc --noEmit 2>&1 | head -50
```

`Shadow.coral`이 기존에는 `Gradients.coral`과 이름이 충돌하지 않는지 확인. 기존 코드에서 `Gradients.coral`을 `Gradients.primary`로 참조하는 곳이 있는지 grep으로 체크:

```bash
grep -r "Gradients\.coral" frontend/src --include="*.tsx" --include="*.ts"
```

발견된 경우 해당 파일에서 `Gradients.coral` → `Gradients.primary`로 수정.

- [ ] **Step 3: 커밋**

```bash
cd /home/sthun11/tripmeet
git add frontend/src/utils/theme.ts
git commit -m "feat(theme): Supanova 프리미엄 디자인 토큰 업그레이드"
```

---

## Task 3: CustomTabBar — 프리미엄 네비게이션 재작성

**Files:**
- Modify: `frontend/src/navigation/CustomTabBar.tsx`

웹 상단바는 glassmorphism + 그라디언트 로고로 업그레이드. 모바일 하단바는 베젤 카드 스타일 플로팅 탭바로 변경.

- [ ] **Step 1: CustomTabBar.tsx 전체 교체**

```tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius, Shadow } from '../utils/theme';
import { useResponsive, TOP_NAV_H } from '../utils/responsive';

const TAB_META: Record<string, {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconActive: React.ComponentProps<typeof Ionicons>['name'];
  gradient: string[];
}> = {
  Home:       { label: '홈',      icon: 'home-outline',        iconActive: 'home',        gradient: Gradients.primary   },
  Matching:   { label: '매칭',    icon: 'location-outline',    iconActive: 'location',    gradient: Gradients.matching  },
  Community:  { label: '커뮤니티', icon: 'chatbubbles-outline', iconActive: 'chatbubbles', gradient: Gradients.community },
  Restaurant: { label: '맛집',    icon: 'restaurant-outline',  iconActive: 'restaurant',  gradient: Gradients.food      },
  Companion:  { label: '동행',    icon: 'people-outline',      iconActive: 'people',      gradient: Gradients.companion },
  Itinerary:  { label: 'AI 일정', icon: 'sparkles-outline',    iconActive: 'sparkles',    gradient: Gradients.ai        },
  ChatList:   { label: '채팅',    icon: 'chatbubble-outline',  iconActive: 'chatbubble',  gradient: Gradients.chat      },
  Profile:    { label: '내 정보', icon: 'person-outline',      iconActive: 'person',      gradient: Gradients.profile   },
};

function WebTopNav({ state, navigation }: Pick<BottomTabBarProps, 'state' | 'navigation'>) {
  return (
    <View style={webStyles.container}>
      <TouchableOpacity
        style={webStyles.logo}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={webStyles.logoIcon}
        >
          <Ionicons name="airplane" size={13} color="#fff" />
        </LinearGradient>
        <Text style={webStyles.logoText}>TripMeet</Text>
      </TouchableOpacity>

      <View style={webStyles.navItems}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[webStyles.navItem, isFocused && webStyles.navItemActive]}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={meta.label}
            >
              <Text style={[webStyles.navItemText, isFocused && webStyles.navItemTextActive]}>
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function MobileBottomBar({ state, navigation, descriptors }: BottomTabBarProps) {
  return (
    <View style={mobileStyles.wrapper}>
      <View style={mobileStyles.container}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          const options = descriptors[route.key]?.options;
          const label = (options?.tabBarLabel as string | undefined) ?? meta.label;
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={mobileStyles.tab}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={label}
            >
              {isFocused ? (
                <LinearGradient
                  colors={meta.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={mobileStyles.iconWrapActive}
                >
                  <Ionicons name={meta.iconActive} size={18} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={mobileStyles.iconWrap}>
                  <Ionicons name={meta.icon} size={20} color={Colors.tabInactive} />
                </View>
              )}
              <Text style={[mobileStyles.label, { color: isFocused ? Colors.primary : Colors.tabInactive }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function CustomTabBar(props: BottomTabBarProps) {
  const { isDesktop } = useResponsive();
  if (isDesktop) return <WebTopNav state={props.state} navigation={props.navigation} />;
  return <MobileBottomBar {...props} />;
}

const webStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: TOP_NAV_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'rgba(250,250,248,0.90)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,232,230,0.80)',
    zIndex: 100,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any : {}),
    ...Shadow.sm,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 40,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  navItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  navItem: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  navItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  navItemText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textLight,
  },
  navItemTextActive: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});

const mobileStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.xxl,
    paddingHorizontal: 8,
    paddingVertical: 8,
    ...Shadow.card,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  iconWrapActive: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '600' as const,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
cd /home/sthun11/tripmeet
git add frontend/src/navigation/CustomTabBar.tsx
git commit -m "feat(nav): CustomTabBar Supanova 프리미엄 재작성"
```

---

## Task 4: HomeScreen — 에디토리얼 레이아웃 재작성

**Files:**
- Modify: `frontend/src/screens/home/HomeScreen.tsx`

히어로 섹션 리디자인, 퀵 메뉴 벤토 그리드, 목적지 카드 가로 스크롤, 커뮤니티·동행 프리뷰 카드 업그레이드.

- [ ] **Step 1: HomeScreen.tsx 전체 교체**

파일 전체를 아래 코드로 교체한다. (HERO_IMG, QUICK_MENUS, DESTINATIONS, NEARBY_TRAVELERS, COMMUNITY_POSTS, COMPANION_POSTS 데이터 배열은 기존과 동일하게 유지하되 스타일만 변경한다.)

읽어야 할 파일: `frontend/src/screens/home/HomeScreen.tsx` (전체)

전체 파일을 읽은 뒤, 아래 구조로 스타일시트(`StyleSheet.create`) 부분을 교체한다:

**핵심 변경 사항:**
1. `headerBg` 그라디언트: `['#0F0E1A', '#1E1B4B', '#312E81']` (더 깊은 다크)
2. 퀵 메뉴 아이콘: 44px → 52px, 원형 → `borderRadius: Radius.xl` (20px)
3. 카드 배경: `Colors.card`, 테두리: `Colors.border`, 반경: `Radius.card` (20px)
4. 목적지 카드: 너비 140px → 160px, 높이 180px → 200px
5. 카드 쉐도우: `Shadow.card`
6. 텍스트: `Colors.text` / `Colors.textMedium` / `Colors.textLight`
7. 배경: `Colors.background` (#FAFAF8)
8. 여행자 카드: 아바타 크기 40px → 48px
9. 커뮤니티 카드: 좌측 컬러 바 너비 4px → 3px, 반경 있음

파일 전체를 읽은 뒤 스타일시트를 아래로 교체:

```typescript
const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: Colors.background },
  scrollContent:     { paddingBottom: 32 },

  // 히어로
  heroWrap:          { position: 'relative' },
  heroImg:           { height: 340 },
  heroOverlay:       { ...StyleSheet.absoluteFillObject },
  heroContent:       { paddingHorizontal: Spacing.screenPad, paddingBottom: Spacing.lg },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginBottom: 14,
  },
  heroBadgeDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  heroBadgeText:     { ...Typography.caption, color: 'rgba(255,255,255,0.90)', fontWeight: '600' as const },
  heroTitle:         { ...Typography.display, color: '#FFFFFF', marginBottom: 8 },
  heroTitleAccent:   { color: 'rgba(255,255,255,0.75)' },
  heroSub:           { ...Typography.body, color: 'rgba(255,255,255,0.65)', marginBottom: 24 },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: Radius.full,
    ...Shadow.primary,
  },
  heroBtnText:       { ...Typography.buttonMd, color: Colors.primary },

  // 퀵 메뉴
  section:           { paddingHorizontal: Spacing.screenPad, paddingTop: Spacing.lg },
  sectionHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle:      { ...Typography.h3, color: Colors.text },
  seeAll:            { ...Typography.caption, color: Colors.primary, fontWeight: '600' as const },
  quickMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  quickMenuItem: {
    width: '18%',
    alignItems: 'center',
    gap: 6,
  },
  quickMenuIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },
  quickMenuLabel:    { ...Typography.caption, color: Colors.textMedium, textAlign: 'center', fontWeight: '600' as const },

  // 목적지
  destinationsRow:   { paddingLeft: Spacing.screenPad, flexDirection: 'row', gap: 12 },
  destCard: {
    width: 160,
    height: 200,
    borderRadius: Radius.card,
    overflow: 'hidden',
    ...Shadow.card,
  },
  destImg:           { width: '100%', height: '100%' },
  destOverlay:       { ...StyleSheet.absoluteFillObject },
  destInfo:          { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 },
  destCity:          { fontSize: 16, fontWeight: '800' as const, color: '#fff', letterSpacing: -0.3, marginBottom: 2 },
  destCountry:       { fontSize: 11, color: 'rgba(255,255,255,0.70)', marginBottom: 6 },
  destCount: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  destCountText:     { fontSize: 10, color: '#fff', fontWeight: '600' as const },

  // 근처 여행자
  travelerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 14,
    marginBottom: 10,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  travelerAvatar:    { width: 48, height: 48, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  travelerEmoji:     { fontSize: 22 },
  travelerName:      { ...Typography.h4, color: Colors.text, marginBottom: 2 },
  travelerFrom:      { ...Typography.caption, color: Colors.textLight },
  travelerBadge: {
    marginLeft: 'auto' as const,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  travelerBadgeText: { fontSize: 11, color: Colors.primary, fontWeight: '700' as const },

  // 커뮤니티 카드
  postCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catBar:            { width: 3, height: '100%' as const, borderRadius: 2, minHeight: 60 },
  postInner:         { flex: 1 },
  postCat:           { ...Typography.label, marginBottom: 5 },
  postTitle:         { ...Typography.h4, color: Colors.text, lineHeight: 22, marginBottom: 8 },
  postMeta:          { flexDirection: 'row', alignItems: 'center', gap: 14 },
  postMetaText:      { ...Typography.caption, color: Colors.textLight },

  // 동행 카드
  companionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  companionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companionEmoji:    { fontSize: 20 },
  companionInfo:     { flex: 1 },
  companionDest:     { ...Typography.h4, color: Colors.text, marginBottom: 3 },
  companionPeriod:   { ...Typography.caption, color: Colors.textLight, marginBottom: 5 },
  companionDesc:     { ...Typography.bodyMd, color: Colors.textMedium, lineHeight: 20 },
  companionCount: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  companionCountText: { fontSize: 11, color: Colors.primary, fontWeight: '700' as const },
});
```

- [ ] **Step 2: 커밋**

```bash
cd /home/sthun11/tripmeet
git add frontend/src/screens/home/HomeScreen.tsx
git commit -m "feat(home): HomeScreen Supanova 리디자인"
```

---

## Task 5: CommunityScreen — 에디토리얼 카드 리디자인

**Files:**
- Modify: `frontend/src/screens/community/CommunityScreen.tsx`

전체 파일을 읽은 뒤 아래 변경을 적용:

- [ ] **Step 1: CommunityScreen.tsx 스타일시트 교체**

파일 전체를 읽어 `StyleSheet.create({...})` 블록을 찾아 아래로 교체:

```typescript
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background },
  scrollContent:   { paddingBottom: 32 },

  // 헤더
  header: {
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.screenPad,
  },
  headerTitle:     { ...Typography.display, color: Colors.textOnDark, marginBottom: 4 },
  headerSub:       { ...Typography.body, color: 'rgba(255,255,255,0.65)' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  newPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  newPostBtnText:  { fontSize: 13, fontWeight: '600' as const, color: '#fff' },

  // 카테고리 필터
  filterWrap:      { paddingHorizontal: Spacing.screenPad, paddingVertical: Spacing.md },
  filterRow:       { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  filterChipText:       { fontSize: 13, fontWeight: '500' as const, color: Colors.textMedium },
  filterChipTextActive: { fontWeight: '700' as const, color: Colors.primary },

  // 포스트 카드
  postCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.screenPad,
    borderRadius: Radius.card,
    padding: 16,
    marginBottom: 12,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catBar:          { width: '100%', height: 3, borderRadius: 2, marginBottom: 12 },
  cardContent:     { flex: 1 },
  catRow:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  catBadgeText:    { fontSize: 11, fontWeight: '700' as const },
  postTitle:       { ...Typography.h4, color: Colors.text, lineHeight: 22, marginBottom: 10 },
  postMeta:        { flexDirection: 'row', alignItems: 'center', gap: 16 },
  postMetaItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postMetaText:    { ...Typography.caption, color: Colors.textLight },
  postTime:        { ...Typography.caption, color: Colors.textLight, marginLeft: 'auto' as const },

  emptyWrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText:       { ...Typography.body, color: Colors.textLight, marginTop: 12 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },
});
```

또한 헤더 섹션(`LinearGradient` 컴포넌트)의 colors prop을 `Gradients.community`로 유지하면서 `paddingTop`을 `TOP_NAV_H + Spacing.lg`로 설정되어 있는지 확인.

- [ ] **Step 2: 커밋**

```bash
cd /home/sthun11/tripmeet
git add frontend/src/screens/community/CommunityScreen.tsx
git commit -m "feat(community): CommunityScreen Supanova 리디자인"
```

---

## Task 6: CompanionScreen — 동행 카드 리디자인

**Files:**
- Modify: `frontend/src/screens/companion/CompanionScreen.tsx`

- [ ] **Step 1: CompanionScreen.tsx 스타일시트 교체**

파일 전체를 읽어 `StyleSheet.create({...})` 블록을 아래로 교체:

```typescript
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  scrollContent:  { paddingBottom: 32 },

  // 헤더 (LinearGradient, colors=Gradients.companion 유지)
  header:         { paddingBottom: Spacing.lg, paddingHorizontal: Spacing.screenPad },
  headerTitle:    { ...Typography.display, color: Colors.textOnDark, marginBottom: 4 },
  headerSub:      { ...Typography.body, color: 'rgba(255,255,255,0.65)' },
  newBtn: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.full,
  },
  newBtnText:     { fontSize: 13, fontWeight: '600' as const, color: '#fff' },

  // 필터
  filterWrap:     { paddingHorizontal: Spacing.screenPad, paddingVertical: Spacing.md },
  filterRow:      { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    borderColor: Colors.amber,
    backgroundColor: Colors.amberLight,
  },
  filterText:       { fontSize: 13, fontWeight: '500' as const, color: Colors.textMedium },
  filterTextActive: { fontWeight: '700' as const, color: Colors.amber },

  // 카드
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.screenPad,
    borderRadius: Radius.card,
    marginBottom: 12,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accentBar:      { height: 3, width: '100%' },
  cardInner:      { padding: 16 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  destinationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  destination:    { ...Typography.h3, color: Colors.text },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeOpen:       { backgroundColor: Colors.greenLight },
  badgeClosed:     { backgroundColor: Colors.redLight },
  statusBadgeText: { fontSize: 11, fontWeight: '700' as const },
  badgeOpenText:   { color: Colors.green },
  badgeClosedText: { color: Colors.red },
  period:          { ...Typography.caption, color: Colors.textLight, marginBottom: 6 },
  desc:            { ...Typography.bodyMd, color: Colors.textMedium, lineHeight: 20, marginBottom: 12 },
  cardFooter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAvatar: {
    width: 26,
    height: 26,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName:     { ...Typography.caption, color: Colors.textMedium, fontWeight: '600' as const },
  date:           { ...Typography.caption, color: Colors.textLight },

  emptyWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText:      { ...Typography.body, color: Colors.textLight, marginTop: 12 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
cd /home/sthun11/tripmeet
git add frontend/src/screens/companion/CompanionScreen.tsx
git commit -m "feat(companion): CompanionScreen Supanova 리디자인"
```

---

## Task 7: RestaurantListScreen — 맛집 카드 리디자인

**Files:**
- Modify: `frontend/src/screens/restaurant/RestaurantListScreen.tsx`

- [ ] **Step 1: RestaurantListScreen.tsx 스타일시트 교체**

파일 전체를 읽어 `StyleSheet.create({...})` 블록을 아래로 교체:

```typescript
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 32 },

  // 헤더
  header:        { paddingBottom: Spacing.lg, paddingHorizontal: Spacing.screenPad },
  headerTitle:   { ...Typography.display, color: Colors.textOnDark, marginBottom: 4 },
  headerSub:     { ...Typography.body, color: 'rgba(255,255,255,0.65)' },
  searchWrap: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    gap: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },

  // 카드
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.screenPad,
    borderRadius: Radius.card,
    marginBottom: 12,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pinkAccentBar:  { height: 3, width: '100%', backgroundColor: Colors.pink },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surface,
  },
  noImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody:       { padding: 14 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  nameWrap:       { flex: 1, marginRight: 8 },
  restaurantName: { ...Typography.h4, color: Colors.text, marginBottom: 2 },
  starRow:        { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingNum:      { ...Typography.caption, color: Colors.textMedium, marginLeft: 4, fontWeight: '600' as const },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText:   { ...Typography.caption, color: Colors.textLight },
  tagRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.pinkLight,
  },
  tagText:        { fontSize: 11, color: Colors.pink, fontWeight: '600' as const },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyWrap:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText:     { ...Typography.body, color: Colors.textLight, marginTop: 12 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.pink,
  },
});
```

- [ ] **Step 2: 커밋**

```bash
cd /home/sthun11/tripmeet
git add frontend/src/screens/restaurant/RestaurantListScreen.tsx
git commit -m "feat(restaurant): RestaurantListScreen Supanova 리디자인"
```

---

## Task 8: MatchingScreen + ProfileScreen 리디자인

**Files:**
- Modify: `frontend/src/screens/matching/MatchingScreen.tsx`
- Modify: `frontend/src/screens/profile/ProfileScreen.tsx`

- [ ] **Step 1: MatchingScreen 전체 파일 읽기 후 스타일시트 교체**

파일 전체를 읽어 `StyleSheet.create({...})` 블록을 아래 원칙으로 교체:
- container: `backgroundColor: Colors.background`
- 카드: `backgroundColor: Colors.card`, `borderRadius: Radius.card`, `...Shadow.card`, `borderWidth: 1`, `borderColor: Colors.border`
- 헤더 LinearGradient colors: `Gradients.matching` 유지, paddingTop: `TOP_NAV_H + Spacing.lg`
- 아바타: 48→52px, borderRadius full
- 필터 칩: 기존 스타일 유지하되 borderRadius `Radius.full`, backgroundColor `Colors.card`
- 위치 배지: backgroundColor `Colors.greenLight`, color `Colors.green`

```bash
cd /home/sthun11/tripmeet
git add frontend/src/screens/matching/MatchingScreen.tsx
git commit -m "feat(matching): MatchingScreen Supanova 리디자인"
```

- [ ] **Step 2: ProfileScreen 전체 파일 읽기 후 스타일시트 교체**

파일 전체를 읽어 `StyleSheet.create({...})` 블록을 아래 원칙으로 교체:
- container: `backgroundColor: Colors.background`
- 프로필 카드: `backgroundColor: Colors.card`, `borderRadius: Radius.card`, `...Shadow.card`
- 헤더 LinearGradient: `Gradients.profile` 유지
- 섹션 타이틀: `...Typography.h3`
- 메뉴 아이템: `backgroundColor: Colors.card`, `borderRadius: Radius.lg`, `borderWidth: 1`, `borderColor: Colors.border`
- 로그아웃 버튼: `backgroundColor: Colors.redLight`, borderColor `Colors.redBorder`

```bash
cd /home/sthun11/tripmeet
git add frontend/src/screens/profile/ProfileScreen.tsx
git commit -m "feat(profile): ProfileScreen Supanova 리디자인"
```

---

## 최종 검증

- [ ] `npx expo start --web` 실행 후 모든 화면 순차 확인
- [ ] 모바일 시뮬레이터 혹은 Expo Go로 모바일 화면 확인
- [ ] `npx tsc --noEmit` 타입 오류 없음 확인
- [ ] 랜딩 페이지 → 로그인 → 홈 → 각 탭 이동 플로우 확인
