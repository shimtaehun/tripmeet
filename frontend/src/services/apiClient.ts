const TIMEOUT_MS = 90000; // 90초 (Render.com 무료 플랜 웨이크업 고려)

/**
 * 타임아웃이 있는 fetch 래퍼.
 * Render.com 무료 플랜 슬립 상태에서 무한 대기 방지.
 */
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new Error('서버가 응답하지 않습니다. 서버가 시작 중일 수 있으니 30초 후 다시 시도해주세요.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
