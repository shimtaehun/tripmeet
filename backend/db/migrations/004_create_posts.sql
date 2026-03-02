-- posts 테이블 생성
-- 여행자 커뮤니티 게시판 (질문 / 후기 / 정보 공유)

CREATE TABLE IF NOT EXISTS public.posts (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category    VARCHAR(20)  NOT NULL CHECK (category IN ('question', 'review', 'info')),
    title       VARCHAR(200) NOT NULL,
    content     TEXT         NOT NULL,
    view_count  INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 트리거 등록
CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 카테고리별 최신순 목록 조회 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_category_created
    ON public.posts (category, created_at DESC);
