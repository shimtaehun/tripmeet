import { supabase } from './supabaseClient';
import { apiFetch } from './apiClient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface PostSummary {
  id: string;
  user_id: string;
  category: string;
  title: string;
  view_count: number;
  created_at: string;
}

export interface AuthorInfo {
  nickname: string;
  profile_image_url: string | null;
}

export interface Post {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  author: AuthorInfo | null;
}

export interface PostListResponse {
  items: PostSummary[];
  next_cursor: string | null;
}

async function getAuthHeader(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('로그인이 필요합니다.');
  return `Bearer ${session.access_token}`;
}

export async function getPosts(category?: string, cursor?: string): Promise<PostListResponse> {
  const auth = await getAuthHeader();
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (cursor) params.append('cursor', cursor);
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await apiFetch(`${API_URL}/posts/${query}`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) throw new Error('게시글 목록 조회 실패');
  return res.json();
}

export async function createPost(category: string, title: string, content: string): Promise<Post> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/posts/`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, title, content }),
  });
  if (!res.ok) throw new Error('게시글 작성 실패');
  return res.json();
}

export async function getPost(id: string): Promise<Post> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/posts/${id}`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) throw new Error('게시글 조회 실패');
  return res.json();
}

export async function updatePost(id: string, title: string, content: string): Promise<Post> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/posts/${id}`, {
    method: 'PATCH',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error('게시글 수정 실패');
  return res.json();
}

export async function deletePost(id: string): Promise<void> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: auth },
  });
  if (!res.ok) throw new Error('게시글 삭제 실패');
}
