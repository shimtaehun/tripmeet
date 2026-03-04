import { useWindowDimensions } from 'react-native';

// 데스크톱으로 판별하는 너비 기준 (768px 이상 = 웹/태블릿 레이아웃)
export const BREAKPOINT = 768;

// 콘텐츠 최대 너비 — 초대형 화면에서도 가독성 유지
export const MAX_WIDTH = 1200;

// 데스크톱 상단 네비게이션 바 높이
export const TOP_NAV_H = 64;

// 반응형 훅 — 화면 크기 변화에 실시간 반응
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  return { width, height, isDesktop };
}
