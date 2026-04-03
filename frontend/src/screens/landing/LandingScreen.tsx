import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';

interface Props {
  onStart: () => void;
}

// landing/index.html 내용을 기반으로 "시작하기" 링크를 postMessage 방식으로 변환
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
            950: '#1E1B4B', 900: '#312E81', 800: '#3730A3',
            700: '#4338CA', 600: '#4F46E5', 500: '#6366F1',
            400: '#818CF8', 100: '#E0E7FF', 50:  '#EEF2FF',
          },
        },
      }
    }
  }
</script>
<style>
  * { font-family: 'Pretendard', sans-serif; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { background: #FAFAF8; overflow-x: hidden; color: #0A0A0B; margin: 0; padding: 0; }

  .bezel-card {
    background: white;
    border: 1px solid rgba(99,102,241,.10);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,.05), 0 12px 40px rgba(99,102,241,.08);
    position: relative;
  }

  .phone-bezel {
    background: #0F0E1A;
    border-radius: 44px;
    padding: 12px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,.08),
      0 48px 96px rgba(0,0,0,.45),
      0 0 80px rgba(99,102,241,.20);
  }
  .phone-screen {
    border-radius: 32px;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background: #0F0E1A;
  }

  .nav-blur {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(250,250,248,.88);
  }

  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .shimmer-line {
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.18) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 2.5s ease-in-out infinite;
    border-radius: 4px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-12px); }
  }
  @keyframes glow {
    0%,100% { box-shadow: 0 0 40px rgba(99,102,241,.20); }
    50%      { box-shadow: 0 0 80px rgba(99,102,241,.45); }
  }
  @keyframes scrollBounce {
    0%,100% { transform: translateX(-50%) translateY(0); }
    50%      { transform: translateX(-50%) translateY(6px); }
  }

  .animate-fade-up   { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
  .animate-float     { animation: float 6s ease-in-out infinite; }
  .animate-float-alt { animation: float 8s ease-in-out 2s infinite; }
  .animate-glow      { animation: glow 3s ease-in-out infinite; }
  .delay-100 { animation-delay: .10s; }
  .delay-200 { animation-delay: .20s; }
  .delay-300 { animation-delay: .30s; }

  #hero-canvas {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 32px;
  }

  .dest-card {
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,.10);
    transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s ease;
    cursor: default;
  }
  .dest-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0,0,0,.16);
  }
  .dest-card:hover img { transform: scale(1.06); }
  .dest-card img { transition: transform .5s ease; }
</style>
</head>
<body>

<!-- 네비게이션 -->
<nav class="nav-blur fixed top-0 left-0 right-0 z-50" style="border-bottom:1px solid rgba(99,102,241,.10);">
  <div style="max-width:1152px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#4338CA,#4F46E5);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(79,70,229,.35);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 17l9-13 9 13H3z" fill="white" fill-opacity=".9"/></svg>
      </div>
      <span style="font-size:18px;font-weight:900;letter-spacing:-0.5px;color:#0A0A0B;">TripMeet</span>
    </div>
    <ul style="display:flex;align-items:center;gap:4px;list-style:none;margin:0;padding:0;">
      <li><a href="#about" style="padding:8px 16px;font-size:13px;font-weight:500;color:#3D3D40;text-decoration:none;border-radius:999px;transition:all .2s;" onmouseover="this.style.background='#EEF2FF';this.style.color='#4338CA'" onmouseout="this.style.background='transparent';this.style.color='#3D3D40'">소개</a></li>
      <li><a href="#features" style="padding:8px 16px;font-size:13px;font-weight:500;color:#3D3D40;text-decoration:none;border-radius:999px;transition:all .2s;" onmouseover="this.style.background='#EEF2FF';this.style.color='#4338CA'" onmouseout="this.style.background='transparent';this.style.color='#3D3D40'">기능</a></li>
      <li><a href="#how" style="padding:8px 16px;font-size:13px;font-weight:500;color:#3D3D40;text-decoration:none;border-radius:999px;transition:all .2s;" onmouseover="this.style.background='#EEF2FF';this.style.color='#4338CA'" onmouseout="this.style.background='transparent';this.style.color='#3D3D40'">이용방법</a></li>
    </ul>
    <a href="#" onclick="window.parent.postMessage('navigate:login', '*'); return false;"
       style="display:inline-flex;align-items:center;gap:8px;background:#4338CA;color:white;font-size:13px;font-weight:700;padding:10px 22px;border-radius:999px;text-decoration:none;box-shadow:0 4px 16px rgba(67,56,202,.35);transition:all .2s;"
       onmouseover="this.style.background='#3730A3';this.style.transform='translateY(-1px)';this.style.boxShadow='0 8px 24px rgba(67,56,202,.40)'"
       onmouseout="this.style.background='#4338CA';this.style.transform='translateY(0)';this.style.boxShadow='0 4px 16px rgba(67,56,202,.35)'">
      무료 시작
    </a>
  </div>
</nav>

<!-- 히어로 스크롤텔링 (600vh) -->
<section id="hero-scroll" style="height:600vh;position:relative;">
  <div id="hero-sticky" style="position:sticky;top:0;height:100vh;overflow:hidden;background:linear-gradient(160deg, #FAFAF8 0%, #F0F0FF 60%, #E8EDFF 100%);">
    <!-- 배경 오브 -->
    <div style="position:absolute;top:-100px;right:-100px;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle, rgba(99,102,241,.12) 0%, transparent 70%);pointer-events:none;z-index:0;"></div>
    <div style="position:absolute;bottom:0;left:-50px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle, rgba(249,115,22,.06) 0%, transparent 70%);pointer-events:none;z-index:0;"></div>

    <div style="max-width:1152px;margin:0 auto;padding:calc(64px + 60px) 24px 0;width:100%;height:100%;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;position:relative;z-index:1;">
      <!-- 왼쪽: 카피 -->
      <div id="hero-text" class="animate-fade-up" style="will-change:opacity,transform;">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#EEF2FF;border:1px solid #C7D2FE;color:#4338CA;font-size:11px;font-weight:700;padding:7px 16px;border-radius:999px;margin-bottom:28px;letter-spacing:0.6px;text-transform:uppercase;">
          <span style="width:6px;height:6px;border-radius:50%;background:#10B981;display:inline-block;"></span>
          지금 12,000명이 여행 중
        </div>
        <h1 style="font-size:62px;font-weight:900;letter-spacing:-2px;line-height:1.05;margin-bottom:20px;color:#0A0A0B;">
          여행에서<br>
          <span style="background:linear-gradient(135deg,#4338CA 0%,#4F46E5 50%,#818CF8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">진짜 연결을</span><br>
          경험하세요
        </h1>
        <p style="font-size:17px;color:#898989;line-height:1.75;margin-bottom:36px;font-weight:400;max-width:400px;">
          같은 여행지의 여행자와 즉시 매칭되고,<br>AI가 나만의 일정을 완성해드려요.
        </p>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin-bottom:48px;">
          <a href="#" onclick="window.parent.postMessage('navigate:login', '*'); return false;"
             style="display:inline-flex;align-items:center;gap:10px;background:#4338CA;color:white;font-size:15px;font-weight:700;padding:16px 32px;border-radius:16px;text-decoration:none;box-shadow:0 8px 32px rgba(67,56,202,.30);transition:all .3s;"
             onmouseover="this.style.background='#3730A3';this.style.transform='translateY(-2px)';this.style.boxShadow='0 16px 48px rgba(67,56,202,.40)'"
             onmouseout="this.style.background='#4338CA';this.style.transform='translateY(0)';this.style.boxShadow='0 8px 32px rgba(67,56,202,.30)'">
            지금 무료로 시작하기
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <a href="#how" style="display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:600;color:#898989;text-decoration:none;transition:color .2s;" onmouseover="this.style.color='#4338CA'" onmouseout="this.style.color='#898989'">
            어떻게 작동하나요
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
        <!-- 통계 -->
        <div style="display:flex;align-items:center;gap:32px;padding-top:32px;border-top:1px solid rgba(99,102,241,.12);">
          <div>
            <div style="font-size:30px;font-weight:900;letter-spacing:-1px;color:#4338CA;">12K+</div>
            <div style="font-size:11px;color:#898989;margin-top:4px;">활성 여행자</div>
          </div>
          <div style="width:1px;height:36px;background:#E8E8E6;"></div>
          <div>
            <div style="font-size:30px;font-weight:900;letter-spacing:-1px;color:#4338CA;">94개</div>
            <div style="font-size:11px;color:#898989;margin-top:4px;">지원 여행지</div>
          </div>
          <div style="width:1px;height:36px;background:#E8E8E6;"></div>
          <div>
            <div style="font-size:30px;font-weight:900;letter-spacing:-1px;color:#4338CA;">4.9★</div>
            <div style="font-size:11px;color:#898989;margin-top:4px;">평균 평점</div>
          </div>
        </div>
      </div>

      <!-- 오른쪽: 폰 목업 + WebP 스크롤 애니메이션 캔버스 -->
      <div style="display:flex;justify-content:center;" class="animate-fade-up delay-200">
        <div style="position:relative;">
          <!-- 배경 글로우 -->
          <div style="position:absolute;inset:-20px;filter:blur(60px);background:radial-gradient(circle,rgba(99,102,241,.25),transparent 70%);border-radius:50%;" class="animate-glow"></div>
          <!-- 폰 베젤 -->
          <div class="phone-bezel" style="width:260px;height:520px;position:relative;z-index:1;">
            <div class="phone-screen">
              <canvas id="hero-canvas" width="236" height="496"></canvas>
            </div>
          </div>
          <!-- 플로팅 배지 -->
          <div class="bezel-card animate-float-alt" style="position:absolute;right:-52px;top:60px;padding:8px 14px;font-size:12px;font-weight:700;color:#4338CA;white-space:nowrap;z-index:2;">
            도쿄 지금 핫해요
          </div>
          <div class="bezel-card animate-float" style="position:absolute;left:-64px;bottom:80px;padding:8px 14px;font-size:12px;font-weight:600;color:#3D3D40;white-space:nowrap;z-index:2;animation-delay:1s;">
            새 메시지 2개
          </div>
        </div>
      </div>
    </div>

    <!-- 스크롤 힌트 -->
    <div id="scroll-hint" style="position:absolute;bottom:28px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;animation:scrollBounce 2s ease-in-out infinite,fadeUp .7s .8s both;opacity:0;">
      <span style="font-size:10px;font-weight:700;color:#898989;letter-spacing:1.5px;text-transform:uppercase;">스크롤</span>
      <svg width="20" height="32" viewBox="0 0 20 32" fill="none">
        <rect x="1" y="1" width="18" height="30" rx="9" stroke="#C0C0C0" stroke-width="1.5"/>
        <rect x="9" y="7" width="2" height="6" rx="1" fill="#898989">
          <animate attributeName="y" values="7;13;7" dur="1.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite"/>
        </rect>
      </svg>
    </div>
  </div>
</section>

<!-- 인기 여행지 -->
<section style="padding:112px 0;background:white;" id="destinations">
  <div style="max-width:1152px;margin:0 auto;padding:0 24px;">
    <div style="text-align:center;margin-bottom:56px;">
      <div style="display:inline-flex;align-items:center;gap:8px;background:#EEF2FF;border:1px solid #C7D2FE;color:#4338CA;font-size:11px;font-weight:700;padding:7px 16px;border-radius:999px;margin-bottom:20px;letter-spacing:0.6px;text-transform:uppercase;">인기 여행지</div>
      <h2 style="font-size:42px;font-weight:900;letter-spacing:-1.5px;line-height:1.15;color:#0A0A0B;">
        지금 여행자가 모이는<br>
        <span style="background:linear-gradient(135deg,#4338CA,#6366F1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">핫한 여행지</span>
      </h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
      <!-- 도쿄 -->
      <div class="dest-card">
        <div style="position:relative;height:300px;overflow:hidden;">
          <img src="https://images.unsplash.com/photo-1540959733-68f-17aa4c-68ce3d-?w=600&q=80&auto=format" alt="도쿄" onerror="this.src='https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=600&q=80&auto=format'" style="width:100%;height:100%;object-fit:cover;">
          <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 35%,rgba(0,0,0,.70));"></div>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:20px 24px;">
            <div style="font-size:24px;font-weight:900;color:white;letter-spacing:-0.5px;margin-bottom:4px;">도쿄</div>
            <div style="font-size:13px;color:rgba(255,255,255,.75);">지금 248명 여행 중</div>
          </div>
          <div style="position:absolute;top:16px;right:16px;background:rgba(0,0,0,.30);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.20);padding:5px 12px;border-radius:999px;font-size:11px;font-weight:700;color:white;">
            🔥 인기
          </div>
        </div>
      </div>
      <!-- 제주 -->
      <div class="dest-card">
        <div style="position:relative;height:300px;overflow:hidden;">
          <img src="https://images.unsplash.com/photo-1601621915196-2621bfb0cd6e?w=600&q=80&auto=format" alt="제주" onerror="this.src='https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600&q=80&auto=format'" style="width:100%;height:100%;object-fit:cover;">
          <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 35%,rgba(0,0,0,.70));"></div>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:20px 24px;">
            <div style="font-size:24px;font-weight:900;color:white;letter-spacing:-0.5px;margin-bottom:4px;">제주</div>
            <div style="font-size:13px;color:rgba(255,255,255,.75);">지금 192명 여행 중</div>
          </div>
          <div style="position:absolute;top:16px;right:16px;background:rgba(0,0,0,.30);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.20);padding:5px 12px;border-radius:999px;font-size:11px;font-weight:700;color:white;">
            🌿 자연
          </div>
        </div>
      </div>
      <!-- 방콕 -->
      <div class="dest-card">
        <div style="position:relative;height:300px;overflow:hidden;">
          <img src="https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80&auto=format" alt="방콕" onerror="this.src='https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80&auto=format'" style="width:100%;height:100%;object-fit:cover;">
          <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 35%,rgba(0,0,0,.70));"></div>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:20px 24px;">
            <div style="font-size:24px;font-weight:900;color:white;letter-spacing:-0.5px;margin-bottom:4px;">방콕</div>
            <div style="font-size:13px;color:rgba(255,255,255,.75);">지금 156명 여행 중</div>
          </div>
          <div style="position:absolute;top:16px;right:16px;background:rgba(0,0,0,.30);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.20);padding:5px 12px;border-radius:999px;font-size:11px;font-weight:700;color:white;">
            ✈️ 해외
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 소개 -->
<section style="padding:112px 0;" id="about">
  <div style="max-width:1152px;margin:0 auto;padding:0 24px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;">
      <!-- 왼쪽: 벤토 그리드 카드 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <!-- 여행 사진 카드 (full-width) -->
        <div style="grid-column:1/-1;border-radius:20px;overflow:hidden;height:200px;position:relative;box-shadow:0 4px 24px rgba(0,0,0,.14);">
          <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80&auto=format" alt="여행" onerror="this.src='https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80&auto=format'" style="width:100%;height:100%;object-fit:cover;">
          <div style="position:absolute;inset:0;background:linear-gradient(105deg,rgba(67,56,202,.75) 0%,rgba(99,102,241,.30) 100%);"></div>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:20px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,.20);display:flex;align-items:center;justify-content:center;font-size:14px;">🗾</div>
              <div>
                <div style="font-size:14px;font-weight:700;color:white;">도쿄 여행 중</div>
                <div style="font-size:12px;color:rgba(255,255,255,.65);margin-top:2px;">근처 여행자 3명 발견</div>
              </div>
            </div>
          </div>
        </div>
        <div class="bezel-card" style="padding:20px;">
          <div style="width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,#6D28D9,#7C3AED);display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:12px;box-shadow:0 4px 12px rgba(109,40,217,.25);">🤖</div>
          <div style="font-size:13px;font-weight:700;color:#0A0A0B;margin-bottom:4px;">AI 일정</div>
          <div style="font-size:12px;color:#898989;line-height:1.5;">제주 2박 3일 맞춤 코스 자동 완성</div>
        </div>
        <div class="bezel-card" style="padding:20px;">
          <div style="width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,#9D174D,#DB2777);display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:12px;box-shadow:0 4px 12px rgba(157,23,77,.25);">🍜</div>
          <div style="font-size:13px;font-weight:700;color:#0A0A0B;margin-bottom:4px;">맛집 추천</div>
          <div style="font-size:12px;color:#898989;line-height:1.5;">부산 광안리 여행자 직추 15곳</div>
        </div>
        <div class="bezel-card" style="padding:20px;grid-column:1/-1;background:linear-gradient(135deg,#4338CA,#312E81);border-color:rgba(99,102,241,.3);">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:14px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:18px;">👥</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:white;">오사카 동행 구인</div>
              <div style="font-size:12px;color:rgba(255,255,255,.60);margin-top:2px;">미리 동반자 모집 가능</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 오른쪽: 텍스트 -->
      <div class="animate-fade-up delay-100">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#EEF2FF;border:1px solid #C7D2FE;color:#4338CA;font-size:11px;font-weight:700;padding:7px 16px;border-radius:999px;margin-bottom:24px;letter-spacing:0.6px;text-transform:uppercase;">
          TripMeet 소개
        </div>
        <h2 style="font-size:40px;font-weight:900;letter-spacing:-1.5px;line-height:1.15;margin-bottom:20px;color:#0A0A0B;">
          혼자 여행자를 위한<br>
          <span style="background:linear-gradient(135deg,#4338CA,#6366F1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">올인원 커뮤니티</span>
        </h2>
        <p style="font-size:15px;color:#898989;line-height:1.75;margin-bottom:28px;font-weight:400;">
          네이버 카페, 구글 맵, 카카오톡을 오가는 번거로움은 이제 그만. TripMeet 하나로 여행지에서 필요한 모든 것을 해결하세요.
        </p>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px;">
          <li style="display:flex;align-items:flex-start;gap:12px;">
            <div style="width:20px;height:20px;border-radius:50%;background:#EEF2FF;border:1px solid #C7D2FE;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#4338CA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span style="font-size:14px;color:#3D3D40;line-height:1.6;">같은 여행지의 여행자와 즉시 실시간 매칭</span>
          </li>
          <li style="display:flex;align-items:flex-start;gap:12px;">
            <div style="width:20px;height:20px;border-radius:50%;background:#EEF2FF;border:1px solid #C7D2FE;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#4338CA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span style="font-size:14px;color:#3D3D40;line-height:1.6;">AI가 목적지·기간·예산에 맞는 일정 자동 생성</span>
          </li>
          <li style="display:flex;align-items:flex-start;gap:12px;">
            <div style="width:20px;height:20px;border-radius:50%;background:#EEF2FF;border:1px solid #C7D2FE;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#4338CA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span style="font-size:14px;color:#3D3D40;line-height:1.6;">현지 여행자가 직접 추천하는 진짜 맛집 정보</span>
          </li>
          <li style="display:flex;align-items:flex-start;gap:12px;">
            <div style="width:20px;height:20px;border-radius:50%;background:#EEF2FF;border:1px solid #C7D2FE;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#4338CA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span style="font-size:14px;color:#3D3D40;line-height:1.6;">GPS 수집 없이 안전한 지역 단위 매칭</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- 기능 -->
<section style="padding:112px 0;background:white;" id="features">
  <div style="max-width:1152px;margin:0 auto;padding:0 24px;">
    <div style="text-align:center;margin-bottom:64px;" class="animate-fade-up">
      <div style="display:inline-flex;align-items:center;gap:8px;background:#EEF2FF;border:1px solid #C7D2FE;color:#4338CA;font-size:11px;font-weight:700;padding:7px 16px;border-radius:999px;margin-bottom:20px;letter-spacing:0.6px;text-transform:uppercase;">핵심 기능</div>
      <h2 style="font-size:42px;font-weight:900;letter-spacing:-1.5px;line-height:1.15;color:#0A0A0B;">
        여행이 더 풍요로워지는<br>
        <span style="background:linear-gradient(135deg,#4338CA,#6366F1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">6가지 이유</span>
      </h2>
    </div>
    <!-- 비대칭 벤토 그리드 -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;" class="animate-fade-up delay-100">
      <div class="bezel-card" style="padding:28px;grid-column:span 2;cursor:default;transition:transform .3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,#4338CA,#4F46E5);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px;box-shadow:0 6px 20px rgba(67,56,202,.25);">🤝</div>
        <div style="font-size:17px;font-weight:700;color:#0A0A0B;margin-bottom:8px;">실시간 여행자 매칭</div>
        <div style="font-size:14px;color:#898989;line-height:1.7;">같은 여행지에 있는 여행자와 즉시 연결하세요. GPS 없이 도시 단위로 안전하게 매칭됩니다.</div>
      </div>
      <div class="bezel-card" style="padding:28px;cursor:default;transition:transform .3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,#6D28D9,#7C3AED);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px;box-shadow:0 6px 20px rgba(109,40,217,.25);">🤖</div>
        <div style="font-size:17px;font-weight:700;color:#0A0A0B;margin-bottom:8px;">AI 일정 생성</div>
        <div style="font-size:14px;color:#898989;line-height:1.7;">Gemini AI가 여행지·기간·예산에 최적화된 일정을 자동으로 완성합니다.</div>
      </div>
      <div class="bezel-card" style="padding:28px;cursor:default;transition:transform .3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,#9D174D,#DB2777);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px;box-shadow:0 6px 20px rgba(157,23,77,.25);">🍜</div>
        <div style="font-size:17px;font-weight:700;color:#0A0A0B;margin-bottom:8px;">여행자 맛집</div>
        <div style="font-size:14px;color:#898989;line-height:1.7;">가이드북이 아닌 실제 여행자들이 직접 추천하는 진짜 현지 맛집.</div>
      </div>
      <div class="bezel-card" style="padding:28px;grid-column:span 2;cursor:default;transition:transform .3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,#78350F,#D97706);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px;box-shadow:0 6px 20px rgba(120,53,15,.25);">👥</div>
        <div style="font-size:17px;font-weight:700;color:#0A0A0B;margin-bottom:8px;">동행 구인</div>
        <div style="font-size:14px;color:#898989;line-height:1.7;">출발 전에 미리 동행을 구하세요. 여행 목적지와 일정을 공유해 맞는 파트너를 찾아드립니다.</div>
      </div>
      <div class="bezel-card" style="padding:28px;cursor:default;transition:transform .3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,#1E3A8A,#2563EB);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px;box-shadow:0 6px 20px rgba(30,58,138,.25);">💬</div>
        <div style="font-size:17px;font-weight:700;color:#0A0A0B;margin-bottom:8px;">여행 커뮤니티</div>
        <div style="font-size:14px;color:#898989;line-height:1.7;">여행 후기, 꿀팁, 질문을 공유하며 경험을 나누세요.</div>
      </div>
      <div class="bezel-card" style="padding:28px;grid-column:span 2;background:linear-gradient(135deg,#4338CA,#1E1B4B);border-color:rgba(99,102,241,.4);cursor:default;transition:transform .3s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="width:48px;height:48px;border-radius:16px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px;">💬</div>
        <div style="font-size:17px;font-weight:700;color:white;margin-bottom:8px;">실시간 채팅</div>
        <div style="font-size:14px;color:rgba(255,255,255,.65);line-height:1.7;">매칭된 여행자와 앱 내 채팅으로 바로 소통하세요. 일정 조율부터 만남까지 한곳에서.</div>
      </div>
    </div>
  </div>
</section>

<!-- 이용 방법 -->
<section style="padding:112px 0;background:#0F0E1A;" id="how">
  <div style="max-width:1152px;margin:0 auto;padding:0 24px;">
    <div style="text-align:center;margin-bottom:64px;">
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.15);color:#818CF8;font-size:11px;font-weight:700;padding:7px 16px;border-radius:999px;margin-bottom:20px;letter-spacing:0.6px;text-transform:uppercase;">이용 방법</div>
      <h2 style="font-size:42px;font-weight:900;letter-spacing:-1.5px;line-height:1.15;color:white;">
        딱 3단계면<br>
        <span style="background:linear-gradient(135deg,#818CF8,#C7D2FE);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">여행이 달라져요</span>
      </h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;">
      <div style="text-align:center;">
        <div style="width:64px;height:64px;border-radius:20px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 20px;transition:background .3s;" onmouseover="this.style.background='rgba(99,102,241,.25)'" onmouseout="this.style.background='rgba(255,255,255,.08)'">📍</div>
        <div style="font-size:32px;font-weight:900;color:rgba(255,255,255,.08);margin-bottom:8px;letter-spacing:-1px;">01</div>
        <div style="font-size:15px;font-weight:700;color:white;margin-bottom:10px;">여행지 등록</div>
        <div style="font-size:13px;color:rgba(130,140,248,.80);line-height:1.7;">현재 여행 중인 도시를 선택하면 자동으로 같은 지역 여행자와 연결됩니다.</div>
      </div>
      <div style="text-align:center;">
        <div style="width:64px;height:64px;border-radius:20px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 20px;transition:background .3s;" onmouseover="this.style.background='rgba(99,102,241,.25)'" onmouseout="this.style.background='rgba(255,255,255,.08)'">🤝</div>
        <div style="font-size:32px;font-weight:900;color:rgba(255,255,255,.08);margin-bottom:8px;letter-spacing:-1px;">02</div>
        <div style="font-size:15px;font-weight:700;color:white;margin-bottom:10px;">여행자 탐색</div>
        <div style="font-size:13px;color:rgba(130,140,248,.80);line-height:1.7;">근처 여행자 목록을 확인하고 마음에 드는 사람에게 채팅을 보내세요.</div>
      </div>
      <div style="text-align:center;">
        <div style="width:64px;height:64px;border-radius:20px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 20px;transition:background .3s;" onmouseover="this.style.background='rgba(99,102,241,.25)'" onmouseout="this.style.background='rgba(255,255,255,.08)'">🌏</div>
        <div style="font-size:32px;font-weight:900;color:rgba(255,255,255,.08);margin-bottom:8px;letter-spacing:-1px;">03</div>
        <div style="font-size:15px;font-weight:700;color:white;margin-bottom:10px;">함께 여행</div>
        <div style="font-size:13px;color:rgba(130,140,248,.80);line-height:1.7;">맛집, 관광지, 일정을 공유하며 혼자이지만 혼자가 아닌 여행을 즐기세요.</div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section style="padding:112px 0;">
  <div style="max-width:800px;margin:0 auto;padding:0 24px;text-align:center;">
    <div class="bezel-card" style="padding:64px 48px;position:relative;overflow:hidden;">
      <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(99,102,241,.05),transparent 60%);pointer-events:none;"></div>
      <!-- 여행 이미지 배경 오버레이 -->
      <div style="position:absolute;inset:0;overflow:hidden;border-radius:20px;">
        <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=70&auto=format" alt="" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;opacity:0.06;">
      </div>
      <div style="position:relative;z-index:1;">
        <div style="font-size:48px;margin-bottom:24px;">✈️</div>
        <h2 style="font-size:42px;font-weight:900;letter-spacing:-1.5px;line-height:1.15;color:#0A0A0B;margin-bottom:16px;">
          다음 여행은<br>
          <span style="background:linear-gradient(135deg,#4338CA,#6366F1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">TripMeet과 함께</span>
        </h2>
        <p style="font-size:15px;color:#898989;margin-bottom:36px;max-width:360px;margin-left:auto;margin-right:auto;line-height:1.7;">지금 가입하면 12,000명의 여행자 커뮤니티에 바로 합류할 수 있어요.</p>
        <a href="#" onclick="window.parent.postMessage('navigate:login', '*'); return false;"
           style="display:inline-flex;align-items:center;gap:10px;background:#4338CA;color:white;font-size:15px;font-weight:700;padding:16px 36px;border-radius:16px;text-decoration:none;box-shadow:0 8px 32px rgba(67,56,202,.30);transition:all .3s;margin-bottom:16px;"
           onmouseover="this.style.background='#3730A3';this.style.transform='translateY(-2px)';this.style.boxShadow='0 16px 48px rgba(67,56,202,.40)'"
           onmouseout="this.style.background='#4338CA';this.style.transform='translateY(0)';this.style.boxShadow='0 8px 32px rgba(67,56,202,.30)'">
          웹으로 무료 시작하기
        </a>
        <p style="font-size:12px;color:#898989;margin:0;">신용카드 불필요 · 영구 무료</p>
      </div>
    </div>
  </div>
</section>

<!-- 푸터 -->
<footer style="padding:40px 0;border-top:1px solid #E8E8E6;">
  <div style="max-width:1152px;margin:0 auto;padding:0 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#4338CA,#4F46E5);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(67,56,202,.25);">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 17l9-13 9 13H3z" fill="white" fill-opacity=".9"/></svg>
      </div>
      <span style="font-size:14px;font-weight:700;color:#0A0A0B;">TripMeet</span>
    </div>
    <p style="font-size:12px;color:#898989;margin:0;">© 2026 TripMeet. 여행자를 위한 커뮤니티.</p>
  </div>
</footer>

<script>
// 히어로 WebP 스크롤 애니메이션
(function() {
  var TOTAL_FRAMES = 96;
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var heroSection = document.getElementById('hero-scroll');
  var heroText = document.getElementById('hero-text');
  var scrollHint = document.getElementById('scroll-hint');

  // 프레임 배열 및 상태
  var frames = new Array(TOTAL_FRAMES);
  var loadedCount = 0;
  var currentFrame = 0;   // 실수 (lerp 보간용)
  var targetFrame  = 0;   // 정수 (스크롤 위치 기반)
  var lastDrawn    = -1;

  function padNum(n) {
    var s = String(n);
    while (s.length < 4) s = '0' + s;
    return s;
  }

  function drawFrame(index) {
    var img = frames[index];
    if (!img || !img.complete || !img.naturalWidth) return;
    var cw = canvas.width;
    var ch = canvas.height;
    var iw = img.naturalWidth;
    var ih = img.naturalHeight;
    // object-fit: cover 방식으로 그리기
    var scale = Math.max(cw / iw, ch / ih);
    var dw = iw * scale;
    var dh = ih * scale;
    var dx = (cw - dw) / 2;
    var dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // 모든 프레임 사전 로딩
  for (var i = 0; i < TOTAL_FRAMES; i++) {
    (function(idx) {
      var img = new Image();
      img.src = '/hero-frames/frame-' + padNum(idx + 1) + '.webp';
      img.onload = function() {
        loadedCount++;
        // 첫 번째 프레임 즉시 렌더링
        if (loadedCount === 1) {
          drawFrame(0);
        }
      };
      frames[idx] = img;
    })(i);
  }

  // 스크롤 이벤트: 진행도 계산 및 타겟 프레임 결정
  function onScroll() {
    var rect = heroSection.getBoundingClientRect();
    var totalScrollable = heroSection.offsetHeight - window.innerHeight;
    var scrolled = -rect.top;
    var progress = scrolled / totalScrollable;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // 스크롤 진행도 -> 프레임 인덱스
    targetFrame = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(progress * TOTAL_FRAMES)
    );

    // 텍스트 페이드 아웃 (0~25% 구간에서 사라짐)
    if (heroText) {
      var textProg = progress / 0.25;
      if (textProg > 1) textProg = 1;
      heroText.style.opacity = String(1 - textProg);
      heroText.style.transform = 'translateY(' + (-textProg * 50) + 'px)';
    }

    // 스크롤 힌트 페이드 아웃
    if (scrollHint) {
      var hintOpacity = 0.7 - progress * 7;
      if (hintOpacity < 0) hintOpacity = 0;
      scrollHint.style.opacity = String(hintOpacity);
    }
  }

  // rAF 루프: lerp로 부드러운 프레임 전환
  function animate() {
    // 0.20 계수로 보간 (값이 클수록 반응 빠름, 작을수록 부드러움)
    currentFrame += (targetFrame - currentFrame) * 0.20;
    var frameIdx = Math.round(currentFrame);
    if (frameIdx < 0) frameIdx = 0;
    if (frameIdx >= TOTAL_FRAMES) frameIdx = TOTAL_FRAMES - 1;

    if (frameIdx !== lastDrawn) {
      drawFrame(frameIdx);
      lastDrawn = frameIdx;
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  animate();
})();
</script>

</body>
</html>`;

export default function LandingScreen({ onStart }: Props) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'navigate:login') {
        onStart();
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onStart]);

  if (Platform.OS !== 'web') {
    return <View style={{ flex: 1 }} />;
  }

  // 웹 전용: iframe 엘리먼트를 React로 직접 렌더링 (ref.appendChild 우회)
  const Iframe = 'iframe' as any;
  return (
    <View style={{ flex: 1 }}>
      <Iframe
        srcDoc={LANDING_HTML}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        title="TripMeet Landing"
      />
    </View>
  );
}
