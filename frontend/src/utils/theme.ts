// ─────────────────────────────────────────────────────────────
// Supanova Premium Design System v1.0
// Primary: Deep Indigo (#4F46E5) / Accent: Coral (#F97316)
// ─────────────────────────────────────────────────────────────

export const Colors = {
  primary:        '#4F46E5',
  primaryDark:    '#4338CA',
  primaryDeep:    '#1E1B4B',
  primaryLight:   '#EEF2FF',
  primaryBorder:  '#C7D2FE',
  primaryMuted:   '#6366F1',

  coral:          '#F97316',
  coralDark:      '#EA580C',
  coralLight:     '#FFF7ED',
  coralBorder:    '#FED7AA',

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

  background:     '#FAFAF8',
  card:           '#FFFFFF',
  surface:        '#F5F5F3',
  surfaceHover:   '#EFEFF0',

  text:           '#0A0A0B',
  textMedium:     '#3D3D40',
  textLight:      '#898989',
  textOnDark:     '#FFFFFF',
  textOnDarkSub:  'rgba(255,255,255,0.75)',

  border:         '#E8E8E6',
  borderStrong:   '#C7D2FE',
  divider:        '#F0F0EE',

  tabActive:      '#4F46E5',
  tabInactive:    '#A0A0A0',
};

export const Gradients = {
  primary:   ['#4338CA', '#4F46E5', '#6366F1'] as string[],
  coral:     ['#EA580C', '#F97316', '#FB923C'] as string[],

  hero:      ['#0F0E1A', '#1E1B4B', '#312E81'] as string[],

  ai:        ['#4C1D95', '#6D28D9', '#7C3AED'] as string[],
  matching:  ['#064E3B', '#059669', '#10B981'] as string[],
  food:      ['#881337', '#DB2777', '#EC4899'] as string[],
  companion: ['#78350F', '#D97706', '#F59E0B'] as string[],
  community: ['#1E3A8A', '#2563EB', '#60A5FA'] as string[],
  chat:      ['#164E63', '#0891B2', '#06B6D4'] as string[],
  profile:   ['#1E1B4B', '#312E81', '#4F46E5'] as string[],

  indigo:    ['#4338CA', '#4F46E5'] as string[],
  rose:      ['#9F1239', '#E11D48', '#F43F5E'] as string[],
  teal:      ['#0F766E', '#0D9488', '#14B8A6'] as string[],
  sky:       ['#0C4A6E', '#0284C7', '#0EA5E9'] as string[],
  sunset:    ['#EA580C', '#F43F5E', '#EC4899'] as string[],

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
