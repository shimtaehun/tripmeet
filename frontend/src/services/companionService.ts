import { supabase } from './supabaseClient';
import { apiFetch } from './apiClient';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface CompanionSummary {
  id: string;
  user_id: string;
  destination: string;
  travel_start_date: string;
  travel_end_date: string;
  description: string;
  max_participants: number;
  status: 'open' | 'closed';
  created_at: string;
}

export interface AuthorInfo {
  nickname: string;
  profile_image_url: string | null;
}

export interface ApplicationInfo {
  id: string;
  applicant_id: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  applicant: AuthorInfo | null;
}

export interface CompanionDetail extends CompanionSummary {
  author: AuthorInfo | null;
  applications: ApplicationInfo[];
  my_application: ApplicationInfo | null;
}

export interface CompanionListResponse {
  items: CompanionSummary[];
  next_cursor: string | null;
}

async function getAuthHeader(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('로그인이 필요합니다.');
  return `Bearer ${session.access_token}`;
}

export async function getCompanions(status?: 'open' | 'closed', cursor?: string, my?: boolean): Promise<CompanionListResponse> {
  const auth = await getAuthHeader();
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (cursor) params.append('cursor', cursor);
  if (my) params.append('my', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await apiFetch(`${API_URL}/companions/${query}`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) throw new Error('동행 구인 목록 조회 실패');
  return res.json();
}

export async function createCompanion(params: {
  destination: string;
  travel_start_date: string;
  travel_end_date: string;
  description: string;
  max_participants: number;
}): Promise<CompanionDetail> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/companions/`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('동행 구인 등록 실패');
  return res.json();
}

export async function getCompanion(id: string): Promise<CompanionDetail> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/companions/${id}`, {
    headers: { Authorization: auth },
  });
  if (!res.ok) throw new Error('동행 구인 조회 실패');
  return res.json();
}

export async function closeCompanion(id: string): Promise<void> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/companions/${id}/close`, {
    method: 'PATCH',
    headers: { Authorization: auth },
  });
  if (!res.ok) throw new Error('동행 구인 마감 실패');
}

export async function applyCompanion(id: string, message?: string): Promise<ApplicationInfo> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/companions/${id}/apply`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message ?? '' }),
  });
  if (!res.ok) throw new Error('동행 신청 실패');
  return res.json();
}

export async function updateCompanion(id: string, params: {
  destination?: string;
  travel_start_date?: string;
  travel_end_date?: string;
  description?: string;
  max_participants?: number;
}): Promise<CompanionDetail> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/companions/${id}`, {
    method: 'PATCH',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('동행 구인 수정 실패');
  return res.json();
}

export async function deleteCompanion(id: string): Promise<void> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/companions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: auth },
  });
  if (!res.ok) throw new Error('동행 구인 삭제 실패');
}

export async function updateApplicationStatus(
  companionId: string,
  applicationId: string,
  status: 'accepted' | 'rejected',
): Promise<void> {
  const auth = await getAuthHeader();
  const res = await apiFetch(`${API_URL}/companions/${companionId}/applications/${applicationId}`, {
    method: 'PATCH',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('신청 상태 변경 실패');
}
