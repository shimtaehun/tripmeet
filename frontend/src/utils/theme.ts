// ─────────────────────────────────────────────────────────────
// Blue Premium Design System v2.0
// Primary: Bright Blue (#3B82F6) / Base: Deep Navy (#0F172A)
// ─────────────────────────────────────────────────────────────

// ─── 색상 ─────────────────────────────────────────────────────
export const Colors = {
  // Primary — 밝은 블루
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  primaryDeep: '#0F172A',
  primaryLight: '#EFF6FF',
  primaryBorder: '#BFDBFE',

  // CTA — 블루 그라디언트용 (기존 coral 키 유지, 값 변경)
  coral: '#3B82F6',
  coralDark: '#1E40AF',
  coralLight: '#EFF6FF',
  coralBorder: '#BFDBFE',

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

  // 서피스 — 배경은 오프화이트, 카드는 순백으로 대비 생성
  background: '#F8FAFC',
  card: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceHover: '#F1F5F9',

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
  tabActive: '#3B82F6',
  tabInactive: '#94A3B8',
};

// ─── 그라디언트 ─────────────────────────────────────────────────
export const Gradients = {
  // 블루 CTA
  coral: ['#1E40AF', '#3B82F6'] as string[],

  // 히어로 배너
  hero: ['#0F172A', '#1E293B', '#1E40AF'] as string[],

  // 기능별 섹션 헤더
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
  coral: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
  },
  primary: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  // Shadow.blue: Shadow.primary 와 동일 — 브랜드 컬러 글로우
  blue: {
    shadowColor: '#3B82F6',
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
