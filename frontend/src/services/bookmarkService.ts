import { supabase } from './supabaseClient';
import { apiFetch } from './apiClient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function getAuthHeader(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('로그인이 필요합니다.');
  return `Bearer ${session.access_token}`;
}

export async function toggleBookmark(targetType: 'restaurant' | 'companion', targetId: string): Promise<boolean> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/bookmarks/toggle`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_type: targetType, target_id: targetId }),
  });
  if (!res.ok) throw new Error('북마크 처리 실패');
  const data = await res.json();
  return data.bookmarked as boolean;
}

export async function checkBookmark(targetType: 'restaurant' | 'companion', targetId: string): Promise<boolean> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/bookmarks/check?target_type=${targetType}&target_id=${targetId}`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.bookmarked as boolean;
}
