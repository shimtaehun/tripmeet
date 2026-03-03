// ─────────────────────────────────────────────────────────────
// Blue Premium Design System v2.0
// 배경: #FFFFFF / 메인: Deep Navy (#0F172A) / 포인트: Blue (#3B82F6)
// 그라디언트: #1E40AF → #3B82F6
// ─────────────────────────────────────────────────────────────

// ─── 폰트 패밀리 ─────────────────────────────────────────────
// 주의: Expo에서 Google Fonts를 사용하려면 App.tsx에서 useFonts() 설정 필요
// @expo-google-fonts/montserrat, @expo-google-fonts/noto-sans-kr 설치 후 적용
export const Fonts = {
  heading: 'Montserrat',       // 제목 — 영문 브랜드 타이포
  body: 'NotoSansKR',          // 본문 — 한글 가독성 최적화
  headingFallback: 'System',   // 폰트 미로드 시 폴백
};

// ─── 색상 ─────────────────────────────────────────────────────
export const Colors = {
  // Base — 딥 네이비 (메인 텍스트/헤더)
  navy: '#0F172A',
  navyMid: '#1E293B',
  navyLight: '#334155',

  // Blue — 포인트 컬러 (인터랙티브 요소)
  blue: '#3B82F6',
  blueDark: '#1E40AF',
  blueMid: '#2563EB',
  blueLight: '#EFF6FF',
  blueBorder: '#BFDBFE',

  // 시맨틱
  green: '#10B981',
  greenLight: '#D1FAE5',
  greenBorder: '#6EE7B7',
  red: '#EF4444',
  redLight: '#FEE2E2',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  purple: '#7C3AED',
  purpleLight: '#EDE9FE',

  // 서피스 — 화이트 베이스
  background: '#FFFFFF',
  card: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceAlt: '#F1F5F9',

  // 텍스트
  text: '#0F172A',
  textMedium: '#475569',
  textLight: '#94A3B8',
  textOnDark: '#FFFFFF',
  textOnDarkSub: 'rgba(255,255,255,0.72)',

  // 선
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  divider: '#F1F5F9',

  // 탭바
  tabActive: '#3B82F6',
  tabInactive: '#94A3B8',
};

// ─── 그라디언트 ─────────────────────────────────────────────────
export const Gradients = {
  // 메인 블루 CTA
  primary: ['#1E40AF', '#3B82F6'] as string[],

  // 히어로 (딥 네이비 → 블루)
  hero: ['#0F172A', '#1E293B', '#1E40AF'] as string[],

  // 섹션별
  ai:        ['#4C1D95', '#6D28D9', '#8B5CF6'] as string[],
  matching:  ['#065F46', '#059669', '#10B981'] as string[],
  food:      ['#991B1B', '#DC2626', '#EF4444'] as string[],
  companion: ['#92400E', '#D97706', '#F59E0B'] as string[],
  community: ['#1E40AF', '#2563EB', '#3B82F6'] as string[],
  chat:      ['#0369A1', '#0284C7', '#0EA5E9'] as string[],
  profile:   ['#0F172A', '#1E293B', '#1E40AF'] as string[],

  // 오버레이
  overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)'] as string[],
};

// ─── 반경 ────────────────────────────────────────────────────
// 카드: xl(20px) 사용 권장
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

// ─── 그림자 ──────────────────────────────────────────────────
export const Shadow = {
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 10,
  },
  blue: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ─── 타이포그래피 ─────────────────────────────────────────────
// fontFamily는 Fonts 상수를 함께 사용
export const Typography = {
  display: { fontSize: 32, fontWeight: '900' as const, color: Colors.text, letterSpacing: -1 },
  h1:      { fontSize: 28, fontWeight: '900' as const, color: Colors.text, letterSpacing: -0.5 },
  h2:      { fontSize: 22, fontWeight: '800' as const, color: Colors.text, letterSpacing: -0.3 },
  h3:      { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  h4:      { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
  body:    { fontSize: 15, fontWeight: '400' as const, color: Colors.text, lineHeight: 24 },
  bodyMd:  { fontSize: 14, fontWeight: '400' as const, color: Colors.textMedium, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textLight, lineHeight: 18 },
  label:   { fontSize: 12, fontWeight: '700' as const, color: Colors.textMedium, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  buttonLg:{ fontSize: 16, fontWeight: '700' as const, letterSpacing: 0.3 },
  buttonMd:{ fontSize: 14, fontWeight: '700' as const },
  buttonSm:{ fontSize: 13, fontWeight: '600' as const },
};

// ─── 간격 ─────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPad: 20,
};

// ─── 애니메이션 타이밍 ─────────────────────────────────────────
export const Animation = {
  fast: 150,
  normal: 220,
  entrance: 300,
  slow: 420,
};
