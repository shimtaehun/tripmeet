-- companions 테이블 생성
-- 여행 동행 구인 게시판. 사전 여행 매칭을 위한 공고 게시 기능.

CREATE TABLE IF NOT EXISTS public.companions (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    destination        VARCHAR(100) NOT NULL,
    travel_start_date  DATE        NOT NULL,
    travel_end_date    DATE        NOT NULL,
    description        TEXT        NOT NULL,
    max_participants   SMALLINT    NOT NULL DEFAULT 2,
    status             VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_travel_dates CHECK (travel_end_date >= travel_start_date)
);

-- updated_at 자동 갱신 트리거 등록
CREATE TRIGGER trg_companions_updated_at
    BEFORE UPDATE ON public.companions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 모집 중인 공고 최신순 조회 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_companions_status_created
    ON public.companions (status, created_at DESC);
