import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// 앱 시작 시 백엔드를 미리 깨워 콜드 스타트 대기 시간 제거
function warmUpBackend() {
  fetch(`${API_URL}/health`).catch(() => {});
}

export default function App() {
  useEffect(() => {
    warmUpBackend();
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
