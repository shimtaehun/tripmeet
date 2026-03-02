-- companion_applications 테이블 생성
-- 동행 구인 공고에 대한 신청 내역. 동일 공고에 중복 신청을 방지한다.

CREATE TABLE IF NOT EXISTS public.companion_applications (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id  UUID        NOT NULL REFERENCES public.companions(id) ON DELETE CASCADE,
    applicant_id  UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message       TEXT,
    status        VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- 동일 공고에 동일 사용자가 중복 신청 불가
    CONSTRAINT uq_companion_applicant UNIQUE (companion_id, applicant_id)
);

-- 공고별 신청 목록 조회 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_companion_applications_companion
    ON public.companion_applications (companion_id, status);

-- 사용자별 신청 이력 조회 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_companion_applications_applicant
    ON public.companion_applications (applicant_id);
