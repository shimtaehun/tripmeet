// ─────────────────────────────────────────────────────────────
// Vibrant Light Design System v3.0
// Primary: Indigo Violet (#6366F1) / Accent: Coral (#F97316)
// ─────────────────────────────────────────────────────────────

// ─── 색상 ─────────────────────────────────────────────────────
export const Colors = {
  // Primary — 인디고 바이올렛
  primary: '#6366F1',
  primaryDark: '#4338CA',
  primaryDeep: '#1E1B4B',
  primaryLight: '#EEF2FF',
  primaryBorder: '#C7D2FE',

  // Accent — 코랄 오렌지 (따뜻한 포인트)
  coral: '#F97316',
  coralDark: '#EA580C',
  coralLight: '#FFF7ED',
  coralBorder: '#FED7AA',

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
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
  purpleBorder: '#DDD6FE',
  pink: '#EC4899',
  pinkLight: '#FCE7F3',
  pinkBorder: '#FBCFE8',
  cyan: '#06B6D4',
  cyanLight: '#CFFAFE',
  cyanBorder: '#A5F3FC',

  // 서피스 — 인디고 틴트 배경
  background: '#F5F7FF',
  card: '#FFFFFF',
  surface: '#EEF2FF',
  surfaceHover: '#E0E7FF',

  // 텍스트
  text: '#1E1B4B',
  textMedium: '#4B5563',
  textLight: '#9CA3AF',
  textOnDark: '#FFFFFF',
  textOnDarkSub: 'rgba(255,255,255,0.80)',

  // 선
  border: '#E5E7EB',
  borderStrong: '#C7D2FE',
  divider: '#F3F4F6',

  // 탭
  tabActive: '#6366F1',
  tabInactive: '#9CA3AF',
};

// ─── 그라디언트 ─────────────────────────────────────────────────
export const Gradients = {
  // 메인 CTA — 인디고→바이올렛
  coral: ['#4338CA', '#6366F1', '#818CF8'] as string[],

  // 히어로
  hero: ['#1E1B4B', '#312E81', '#4338CA'] as string[],

  // 기능별 그라디언트
  ai:        ['#4C1D95', '#6D28D9', '#8B5CF6'] as string[],
  matching:  ['#065F46', '#059669', '#10B981'] as string[],
  food:      ['#9D174D', '#DB2777', '#EC4899'] as string[],
  companion: ['#92400E', '#D97706', '#F59E0B'] as string[],
  community: ['#1E40AF', '#2563EB', '#60A5FA'] as string[],
  chat:      ['#0E7490', '#0891B2', '#06B6D4'] as string[],
  profile:   ['#1E1B4B', '#312E81', '#6366F1'] as string[],

  // 배너 · 카드 포인트
  indigo:    ['#4338CA', '#6366F1'] as string[],
  coral:     ['#EA580C', '#F97316', '#FB923C'] as string[],
  rose:      ['#BE123C', '#E11D48', '#F43F5E'] as string[],
  teal:      ['#0F766E', '#0D9488', '#14B8A6'] as string[],
  sky:       ['#0369A1', '#0284C7', '#0EA5E9'] as string[],
  sunset:    ['#F97316', '#F43F5E', '#EC4899'] as string[],

  // 오버레이
  overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.60)'] as string[],
};

// ─── 반경 ────────────────────────────────────────────────────
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
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  md: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 10,
  },
  coral: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 6,
  },
  primary: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
  blue: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
  pink: {
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  green: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ─── 타이포그래피 ─────────────────────────────────────────────
export const Typography = {
  display: { fontSize: 32, fontWeight: '900' as const, color: Colors.text, letterSpacing: -0.8 },
  h1:      { fontSize: 28, fontWeight: '900' as const, color: Colors.text, letterSpacing: -0.5 },
  h2:      { fontSize: 22, fontWeight: '800' as const, color: Colors.text, letterSpacing: -0.3 },
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
