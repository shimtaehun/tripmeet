# 알려진 이슈 및 개선 사항

> 최초 작성: 2026-03-02 (전체 코드 점검 후)
> 수정 시 날짜와 상태를 업데이트할 것

---

## 상태 범례
- `미해결`: 아직 수정 안 됨
- `해결됨`: 코드에서 수정 완료
- `MVP 허용`: 현재 규모에서는 문제없음, 추후 개선 권장
- `수동 작업`: 개발자가 대시보드/인프라에서 직접 처리해야 함

---

## 프론트엔드

### [FE-001] ChatListScreen 채팅 목록에서 상대방 이름이 UUID로 표시
- **상태**: `미해결`
- **파일**: `frontend/src/screens/chat/ChatListScreen.tsx`
- **원인**: `getTargetUserId(item)` 가 UUID를 반환하는데, 이를 그대로 `targetNickname`과 방 이름으로 사용
- **증상**: 채팅 목록에서 상대방 이름이 "abc123-..." 같은 UUID로 보임
- **해결 방법**: Firebase 채팅방 doc에 상대방 닉네임을 저장하거나, 목록 로드 시 Supabase에서 users 테이블로 닉네임을 별도 조회해야 함

### [FE-002] MatchingScreen API 실패 시 setLoading(false) 누락
- **상태**: `MVP 허용`
- **파일**: `frontend/src/screens/matching/MatchingScreen.tsx`
- **원인**: `fetchTravelers` 함수에 try/catch 없음. `!session` 조건에서 return 시 setLoading(false) 미호출
- **증상**: 세션이 갑자기 만료되거나 API가 실패하면 로딩 스피너가 무한히 표시됨
- **해결 방법**: `fetchTravelers` 함수에 try/catch/finally 패턴 적용 (ProfileScreen 수정 방식 참고)

### [FE-003] ItineraryFormScreen API 실패 시 setLoading(false) 누락
- **상태**: `MVP 허용`
- **파일**: `frontend/src/screens/itinerary/ItineraryFormScreen.tsx`
- **원인**: `!session` 조건에서 return 시 setLoading(false) 미호출
- **증상**: 세션 만료 상태에서 일정 생성 버튼 클릭 시 무한 로딩
- **해결 방법**: `setLoading(false)` 를 finally 블록으로 이동

### [FE-004] ProfileEditScreen 프로필 이미지 업로드 후 화면 반영 안 됨
- **상태**: `미해결`
- **파일**: `frontend/src/screens/profile/ProfileEditScreen.tsx`
- **원인**: 이미지 업로드 성공 후 Alert만 띄우고 ProfileScreen의 이미지 상태를 갱신하지 않음
- **증상**: 이미지 변경 후 ProfileScreen으로 돌아가도 기존 이미지가 보임 (단, useFocusEffect로 fetchProfile이 호출되므로 API 응답 후에는 갱신됨)
- **해결 방법**: 현재 useFocusEffect 덕분에 goBack 시 자동 갱신되므로 실제로는 큰 문제없음. 단, 이미지 업로드와 텍스트 저장이 별개 동작이라 UX가 어색할 수 있음

---

## 백엔드

### [BE-001] posts 조회수 증가 비원자적 처리
- **상태**: `MVP 허용`
- **파일**: `backend/app/routers/posts.py` (get_post 함수)
- **원인**: `view_count + 1` 을 Python 코드에서 계산 후 UPDATE → 동시 요청 시 레이스 컨디션 가능
- **해결 방법**: Supabase SQL RPC 함수로 `UPDATE posts SET view_count = view_count + 1` 처리

### [BE-002] posts, companions 테이블에 updated_at 자동 갱신 트리거 없음
- **상태**: `MVP 허용`
- **파일**: `backend/app/routers/posts.py`, `backend/app/routers/companions.py`
- **원인**: DB 트리거가 없어서 PATCH 엔드포인트에서 Python 코드로 updated_at을 수동 갱신
- **증상**: 기능상 문제없으나, 트리거 누락 시 갱신 안 될 위험
- **해결 방법**: Supabase SQL에서 트리거 추가
  ```sql
  CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

  CREATE TRIGGER companions_updated_at
    BEFORE UPDATE ON companions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  ```

### [BE-003] 맛집/커뮤니티 게시글 삭제 시 R2 이미지 미삭제
- **상태**: `미해결`
- **파일**: `backend/app/routers/restaurants.py` (delete_restaurant 함수)
- **원인**: DELETE 엔드포인트가 DB 레코드만 삭제하고 Cloudflare R2에 저장된 이미지 파일은 삭제하지 않음
- **증상**: 맛집 삭제 후에도 R2에 이미지가 잔류 → 스토리지 비용 누적
- **해결 방법**: 삭제 전 `image_urls` 배열을 조회해 각 URL에서 R2 key를 추출하고 `s3_client.delete_object` 호출

### [BE-004] ai_service.py 모듈 로드 시 환경변수 즉시 참조
- **상태**: `MVP 허용`
- **파일**: `backend/app/services/ai_service.py`
- **원인**: `_redis = Redis(...)`, `_openai = OpenAI(...)` 가 모듈 최상위에서 실행 → 환경변수 미설정 시 앱 시작 실패
- **해결 방법**: 환경변수가 올바르게 설정되어 있으면 문제없음. Render.com 배포 시 환경변수 11개 전부 등록 필수

---

## 배포 수동 작업 (미완료)

### [DEPLOY-001] Supabase 리다이렉트 URL 등록
- **상태**: `수동 작업`
- **위치**: Supabase 대시보드 > Authentication > URL Configuration > Redirect URLs
- **추가할 URL**:
  - `tripmeet://auth/callback` (프로덕션 빌드)
  - `exp://127.0.0.1:8081/--/auth/callback` (Expo Go 로컬)

### [DEPLOY-002] Render.com 환경변수 등록
- **상태**: `수동 작업`
- **위치**: Render.com 대시보드 > tripmeet-api > Environment
- **등록할 변수 11개**:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - OPENAI_API_KEY
  - UPSTASH_REDIS_REST_URL
  - UPSTASH_REDIS_REST_TOKEN
  - R2_ENDPOINT_URL
  - R2_ACCESS_KEY_ID
  - R2_SECRET_ACCESS_KEY
  - R2_BUCKET_NAME
  - R2_PUBLIC_URL
- **확인**: 배포 후 `GET /health` → `{"status": "ok"}` 응답 확인
