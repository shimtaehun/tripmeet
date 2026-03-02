-- travel_locations 테이블 생성
-- 사용자가 수동으로 선택한 현재 여행 위치를 저장한다.
-- GPS 자동 수집 없이 텍스트 기반 위치만 저장 (위치정보법 대응)

CREATE TABLE IF NOT EXISTS public.travel_locations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    location_name   VARCHAR(100) NOT NULL,  -- 예: "홍대", "서귀포", "도쿄"
    country         VARCHAR(50)  NOT NULL,  -- 예: "한국", "일본"
    region          VARCHAR(100),           -- 예: "서울", "제주", "도쿄도"
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    activated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deactivated_at  TIMESTAMPTZ
);

-- 지역 내 활성 여행자 조회 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_travel_locations_name_active
    ON public.travel_locations (location_name, is_active);

-- 사용자별 현재 활성 위치 조회 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_travel_locations_user_active
    ON public.travel_locations (user_id, is_active);
