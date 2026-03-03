// ─────────────────────────────────────────────────
// TripMeet Design System v2.0 — Gradient-First
// ─────────────────────────────────────────────────

export const Colors = {
  // 주색
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryDeep: '#1E3A8A',
  primaryLight: '#EFF6FF',
  primaryBorder: '#BFDBFE',

  // 강조색 (선셋 오렌지)
  accent: '#F97316',
  accentLight: '#FFF7ED',
  accentBorder: '#FED7AA',
  accentGold: '#FBBF24',

  // 상태
  green: '#10B981',
  greenLight: '#ECFDF5',
  greenBorder: '#A7F3D0',
  red: '#EF4444',
  redLight: '#FEF2F2',
  amber: '#F59E0B',
  amberLight: '#FFFBEB',

  // 배경
  background: '#F0F4FF',
  backgroundDeep: '#E8EEFF',
  card: '#FFFFFF',
  surface: '#F8FAFC',

  // 텍스트
  text: '#0F172A',
  textMedium: '#475569',
  textLight: '#94A3B8',
  textOnDark: '#FFFFFF',
  textOnDarkSub: 'rgba(255,255,255,0.75)',

  // 선
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // 글래스모피즘
  glass: 'rgba(255,255,255,0.15)',
  glassBorder: 'rgba(255,255,255,0.28)',
  glassDark: 'rgba(0,0,0,0.12)',

  // 탭 네비게이터
  tabActive: '#2563EB',
  tabInactive: '#94A3B8',
};

// ─── 그라디언트 팔레트 ────────────────────────────
export const Gradients = {
  // 히어로 — 딥 오션 블루 (Login, 상단 배너)
  hero: ['#0F2B5B', '#1E3A8A', '#2563EB', '#0EA5E9'] as string[],

  // 노을 — 주요 CTA 버튼
  sunset: ['#F97316', '#FB923C', '#FBBF24'] as string[],

  // 오션 민트
  ocean: ['#0EA5E9', '#06B6D4', '#22D3EE'] as string[],

  // 에메랄드 — 성공/모집중 배지
  emerald: ['#10B981', '#34D399', '#6EE7B7'] as string[],

  // 산호 — 강조 카드
  coral: ['#F43F5E', '#F97316', '#FBBF24'] as string[],

  // 보라 — 프리미엄 기능 (AI 일정)
  violet: ['#7C3AED', '#4F46E5', '#2563EB'] as string[],

  // 기능 타일 배경 (가로)
  tileAI:       ['#EFF6FF', '#DBEAFE'] as string[],
  tileMatch:    ['#ECFDF5', '#D1FAE5'] as string[],
  tileCommunity:['#FFF7ED', '#FEF3C7'] as string[],
  tileRestaurant:['#FFF1F2', '#FFE4E6'] as string[],
  tileCompanion: ['#FFFBEB', '#FEF3C7'] as string[],

  // 카드 그라디언트
  card: ['#FFFFFF', '#F8FAFF'] as string[],
};

// ─── 레이디우스 ──────────────────────────────────
export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
  full: 999,
};

// ─── 그림자 ──────────────────────────────────────
export const Shadow = {
  card: {
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  strong: {
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  glow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glowAccent: {
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 16,
    elevation: 8,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// ─── 타이포그래피 ─────────────────────────────────
export const Typography = {
  display: { fontSize: 36, fontWeight: '800' as const, color: Colors.text, letterSpacing: -0.8 },
  h1: { fontSize: 28, fontWeight: '800' as const, color: Colors.text, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: Colors.text },
  h3: { fontSize: 17, fontWeight: '700' as const, color: Colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.text, lineHeight: 24 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, color: Colors.textMedium, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textLight, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '600' as const, color: Colors.textMedium },
  buttonLg: { fontSize: 16, fontWeight: '700' as const },
  buttonMd: { fontSize: 14, fontWeight: '700' as const },
  buttonSm: { fontSize: 13, fontWeight: '600' as const },
};

// ─── 애니메이션 타이밍 ─────────────────────────────
export const Animation = {
  fast: 150,
  normal: 280,
  slow: 500,
  entrance: 650,
};
