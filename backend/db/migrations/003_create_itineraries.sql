-- itineraries 테이블 생성
-- AI가 생성한 여행 일정을 저장한다.
-- cache_key는 Redis 장애 시 DB 폴백 조회에도 활용된다.

CREATE TABLE IF NOT EXISTS public.itineraries (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    destination      VARCHAR(100) NOT NULL,
    duration_days    SMALLINT     NOT NULL,
    travelers_count  SMALLINT     NOT NULL,
    budget_range     VARCHAR(20)  NOT NULL,  -- 예: "30만원대"
    cache_key        VARCHAR(255) UNIQUE,    -- "{destination}:{duration}일:{travelers}명:{budget_range}"
    content          JSONB        NOT NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- cache_key 기반 빠른 조회를 위한 인덱스 (Redis 폴백용)
CREATE INDEX IF NOT EXISTS idx_itineraries_cache_key
    ON public.itineraries (cache_key);
