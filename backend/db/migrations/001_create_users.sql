-- users 테이블 생성
-- Supabase Auth의 auth.users와 1:1 대응하는 공개 프로필 테이블

CREATE TABLE IF NOT EXISTS public.users (
    id                UUID        PRIMARY KEY,  -- Supabase Auth UID와 동일한 값 사용
    nickname          VARCHAR(50) NOT NULL,
    profile_image_url TEXT,
    bio               TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 테이블에 트리거 등록
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- 신규 Auth 사용자 가입 시 users 행 자동 생성 트리거
-- nickname 기본값: 구글에서 받아온 email 앞부분
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, nickname)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
