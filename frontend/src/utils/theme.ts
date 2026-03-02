export const Colors = {
  // 주색
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#EFF6FF',
  primaryBorder: '#BFDBFE',

  // 강조색 (오렌지 - 여행의 설렘)
  accent: '#F97316',
  accentLight: '#FFF7ED',
  accentBorder: '#FED7AA',

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
  card: '#FFFFFF',
  surface: '#F8FAFC',

  // 텍스트
  text: '#0F172A',
  textMedium: '#475569',
  textLight: '#94A3B8',

  // 선
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // 탭 네비게이터
  tabActive: '#2563EB',
  tabInactive: '#94A3B8',
};

export const Radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  strong: {
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: Colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: Colors.text },
  h3: { fontSize: 17, fontWeight: '700' as const, color: Colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.text },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textLight },
};
