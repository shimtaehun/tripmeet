import { supabase } from './supabaseClient';
import { apiFetch } from './apiClient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface RestaurantSummary {
  id: string;
  user_id: string;
  name: string;
  location_name: string;
  rating: number;
  image_urls: string[];
  created_at: string;
}

export interface AuthorInfo {
  nickname: string;
  profile_image_url: string | null;
}

export interface Restaurant {
  id: string;
  user_id: string;
  name: string;
  location_name: string;
  description: string | null;
  rating: number;
  image_urls: string[];
  created_at: string;
  author: AuthorInfo | null;
}

export interface RestaurantListResponse {
  items: RestaurantSummary[];
  next_cursor: string | null;
}

export interface CreateRestaurantParams {
  name: string;
  location_name: string;
  description?: string;
  rating: number;
  images: { uri: string; type: string; name: string }[];
}

async function getAuthHeader(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('로그인이 필요합니다.');
  return `Bearer ${session.access_token}`;
}

export async function getRestaurants(locationName?: string, cursor?: string): Promise<RestaurantListResponse> {
  const auth = await getAuthHeader();
  const params = new URLSearchParams();
  if (locationName) params.append('location_name', locationName);
  if (cursor) params.append('cursor', cursor);
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await apiFetch(`${API_URL}/restaurants/${query}`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) throw new Error('맛집 목록 조회 실패');
  return res.json();
}

export async function createRestaurant(params: CreateRestaurantParams): Promise<Restaurant> {
  const auth = await getAuthHeader();

  const formData = new FormData();
  formData.append('name', params.name);
  formData.append('location_name', params.location_name);
  if (params.description) formData.append('description', params.description);
  formData.append('rating', String(params.rating));

  // 이미지 파일 첨부 (클라이언트에서 500KB 이하로 압축된 파일)
  params.images.forEach(img => {
    formData.append('images', {
      uri: img.uri,
      type: img.type,
      name: img.name,
    } as any);
  });

  const res = await apiFetch(`${API_URL}/restaurants/`, {
    method: 'POST',
    headers: { Authorization: auth },
    body: formData,
  });
  if (!res.ok) throw new Error('맛집 등록 실패');
  return res.json();
}

export async function getRestaurant(id: string): Promise<Restaurant> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/restaurants/${id}`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) throw new Error('맛집 조회 실패');
  return res.json();
}

export async function deleteRestaurant(id: string): Promise<void> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/restaurants/${id}`, {
    method: 'DELETE',
    headers: { Authorization: auth },
  });
  if (!res.ok) throw new Error('맛집 삭제 실패');
}
