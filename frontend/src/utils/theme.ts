// ─────────────────────────────────────────────────────────────
// Skyline Design System v1.0  — Clean Functional Premium
// Primary: Electric Blue (#2563EB) / CTA: Warm Coral (#FF6B35)
// ─────────────────────────────────────────────────────────────

// ─── 색상 ─────────────────────────────────────────────────────
export const Colors = {
  // Primary — 일렉트릭 블루
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryDeep: '#1E3A8A',
  primaryLight: '#EFF6FF',
  primaryBorder: '#BFDBFE',

  // CTA — 웜 코랄
  coral: '#FF6B35',
  coralDark: '#E55520',
  coralLight: '#FFF4EF',
  coralBorder: '#FDCBB5',

  // 시맨틱
  green: '#10B981',
  greenLight: '#D1FAE5',
  greenBorder: '#6EE7B7',
  red: '#EF4444',
  redLight: '#FEE2E2',
  redBorder: '#FECACA',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  amberBorder: '#FDE68A',
  purple: '#7C3AED',
  purpleLight: '#EDE9FE',
  purpleBorder: '#DDD6FE',

  // 서피스
  background: '#F8FAFC',
  card: '#FFFFFF',
  surface: '#F1F5F9',
  surfaceHover: '#E8EEF6',

  // 텍스트
  text: '#0F172A',
  textMedium: '#475569',
  textLight: '#94A3B8',
  textOnDark: '#FFFFFF',
  textOnDarkSub: 'rgba(255,255,255,0.75)',

  // 선
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  divider: '#F1F5F9',

  // 탭
  tabActive: '#2563EB',
  tabInactive: '#94A3B8',
};

// ─── 그라디언트 ─────────────────────────────────────────────────
export const Gradients = {
  // 코랄 CTA
  coral: ['#FF6B35', '#FF8C5A'] as string[],

  // 히어로 배너 (AI 일정)
  hero: ['#1E3A8A', '#1D4ED8', '#2563EB'] as string[],

  // 기능별 섹션 헤더
  ai:        ['#6D28D9', '#7C3AED', '#8B5CF6'] as string[],
  matching:  ['#047857', '#059669', '#10B981'] as string[],
  food:      ['#B91C1C', '#DC2626', '#EF4444'] as string[],
  companion: ['#B45309', '#D97706', '#F59E0B'] as string[],
  community: ['#1D4ED8', '#2563EB', '#3B82F6'] as string[],
  chat:      ['#0369A1', '#0284C7', '#0EA5E9'] as string[],
  profile:   ['#1E3A8A', '#1D4ED8', '#2563EB'] as string[],

  // 오버레이
  overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)'] as string[],
};

// ─── 반경 ────────────────────────────────────────────────────
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
};

// ─── 그림자 ──────────────────────────────────────────────────
export const Shadow = {
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 6,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
  coral: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
  primary: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ─── 타이포그래피 ─────────────────────────────────────────────
export const Typography = {
  display: { fontSize: 32, fontWeight: '800' as const, color: Colors.text, letterSpacing: -0.8 },
  h1:      { fontSize: 28, fontWeight: '800' as const, color: Colors.text, letterSpacing: -0.4 },
  h2:      { fontSize: 22, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.2 },
  h3:      { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  h4:      { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
  body:    { fontSize: 15, fontWeight: '400' as const, color: Colors.text, lineHeight: 24 },
  bodyMd:  { fontSize: 14, fontWeight: '400' as const, color: Colors.textMedium, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textLight, lineHeight: 18 },
  label:   { fontSize: 12, fontWeight: '700' as const, color: Colors.textMedium, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  overline:{ fontSize: 11, fontWeight: '700' as const, color: Colors.textLight, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  buttonLg:{ fontSize: 16, fontWeight: '700' as const, letterSpacing: 0.2 },
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
