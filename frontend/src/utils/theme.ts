// ─────────────────────────────────────────────────────────────
// Voyage Design System v3.0  — Editorial Premium
// ─────────────────────────────────────────────────────────────

// ─── 색상 ─────────────────────────────────────────────────────
export const Colors = {
  // Primary — 딥 네이비
  primary: '#1B3A5C',
  primaryDark: '#0D2137',
  primaryDeep: '#071524',
  primaryLight: '#EEF4FA',
  primaryBorder: '#C2D8EC',

  // Accent — 샴페인 골드
  gold: '#C9A96E',
  goldDark: '#A8824A',
  goldLight: '#FBF5E8',
  goldBorder: '#E8D5B0',

  // 시맨틱
  green: '#2A9D6F',
  greenLight: '#E8F7F1',
  greenBorder: '#A7DFC8',
  red: '#D64045',
  redLight: '#FDEAEA',
  amber: '#E8A020',
  amberLight: '#FDF3E0',

  // 서피스
  background: '#FAF9F7',
  backgroundDeep: '#F2EDE4',
  card: '#FFFFFF',
  surface: '#F7F5F2',

  // 텍스트
  text: '#1A1A2E',
  textMedium: '#4A5568',
  textLight: '#8A9AB0',
  textOnDark: '#FFFFFF',
  textOnDarkSub: 'rgba(255,255,255,0.72)',

  // 선
  border: '#E8E0D4',
  divider: '#F0EBE3',

  // 글래스
  glass: 'rgba(255,255,255,0.12)',
  glassBorder: 'rgba(255,255,255,0.24)',
  glassDark: 'rgba(0,0,0,0.10)',

  // 탭
  tabActive: '#1B3A5C',
  tabInactive: '#A0AEC0',
};

// ─── 그라디언트 ─────────────────────────────────────────────────
export const Gradients = {
  // 히어로 — 딥 오션 네이비
  hero: ['#071524', '#0D2137', '#1B3A5C', '#2C5282'] as string[],

  // 골드 CTA
  gold: ['#C9A96E', '#D4B87A', '#B8895C'] as string[],

  // 카드 서피스
  card: ['#FFFFFF', '#FDFCFB'] as string[],

  // 미드나잇 오버레이
  midnight: ['rgba(7,21,36,0)', 'rgba(7,21,36,0.82)'] as string[],

  // 에메랄드
  emerald: ['#2A9D6F', '#3EBD8A', '#56D4A2'] as string[],

  // 섹션별 타일 (에디토리얼 무드)
  tileAI:         ['#EEF4FA', '#D9EAF7'] as string[],
  tileMatch:      ['#E8F4F0', '#CDE9DF'] as string[],
  tileCommunity:  ['#FBF5E8', '#F5EDD6'] as string[],
  tileRestaurant: ['#FDEAEA', '#F8D8D8'] as string[],
  tileCompanion:  ['#F0EDF8', '#E4DEF4'] as string[],
};

// ─── 반경 ────────────────────────────────────────────────────
export const Radius = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
  full: 999,
};

// ─── 그림자 ──────────────────────────────────────────────────
export const Shadow = {
  subtle: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  card: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  strong: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#1B3A5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  glowGold: {
    shadowColor: '#C9A96E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 6,
  },
  glowAccent: {
    shadowColor: '#C9A96E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 6,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// ─── 타이포그래피 ─────────────────────────────────────────────
export const Typography = {
  display: { fontSize: 38, fontWeight: '800' as const, color: Colors.text, letterSpacing: -0.8 },
  h1:      { fontSize: 28, fontWeight: '800' as const, color: Colors.text, letterSpacing: -0.4 },
  h2:      { fontSize: 22, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.2 },
  h3:      { fontSize: 17, fontWeight: '700' as const, color: Colors.text },
  h4:      { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  body:    { fontSize: 15, fontWeight: '400' as const, color: Colors.text, lineHeight: 24 },
  bodyMd:  { fontSize: 14, fontWeight: '400' as const, color: Colors.textMedium, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textLight, lineHeight: 18 },
  label:   { fontSize: 12, fontWeight: '700' as const, color: Colors.textMedium, letterSpacing: 0.8 },
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
  normal: 280,
  slow: 480,
  entrance: 600,
};
