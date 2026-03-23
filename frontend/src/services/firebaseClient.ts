import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

// Firebase 콘솔 > 프로젝트 설정 > 앱 추가에서 발급받은 값을 EXPO_PUBLIC_ 접두사로 .env에 등록
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);

/**
 * 백엔드에서 Firebase 커스텀 토큰을 발급받아 Firebase Auth에 로그인한다.
 * Supabase 세션이 생긴 직후 호출해야 Firestore 보안 규칙을 통과할 수 있다.
 */
export async function signInToFirebase(supabaseAccessToken: string): Promise<void> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/auth/firebase-token`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAccessToken}`,
    },
  });
  if (!res.ok) {
    throw new Error('Firebase 토큰 발급 실패');
  }
  const { firebase_token } = await res.json();
  await signInWithCustomToken(firebaseAuth, firebase_token);
}
