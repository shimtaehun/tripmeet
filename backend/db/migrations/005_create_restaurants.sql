-- restaurants 테이블 생성
-- 여행자 시각의 현지 맛집 리뷰. 이미지는 Cloudflare R2에 저장 후 URL만 보관한다.

CREATE TABLE IF NOT EXISTS public.restaurants (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name           VARCHAR(100) NOT NULL,
    location_name  VARCHAR(100) NOT NULL,  -- 수동 입력 위치 (예: "홍대", "도쿄 신주쿠")
    description    TEXT,
    rating         SMALLINT     CHECK (rating BETWEEN 1 AND 5),
    image_urls     TEXT[]       DEFAULT '{}',  -- Cloudflare R2 URL 배열 (최대 5장)
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 지역별 맛집 목록 조회 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_restaurants_location
    ON public.restaurants (location_name, created_at DESC);
