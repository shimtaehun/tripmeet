-- 같은 여행지 내 성향 유사 여행자 매칭 PostgreSQL 함수
-- cosine distance 기반으로 유사도가 높은 순서대로 반환한다.
-- pgvector의 <=> 연산자는 cosine distance를 반환하므로
-- similarity = 1 - distance 로 변환한다.

CREATE OR REPLACE FUNCTION match_travelers(
    query_embedding vector(768),
    match_location text,
    exclude_user_id uuid,
    match_count int DEFAULT 20
)
RETURNS TABLE (
    user_id uuid,
    nickname varchar,
    profile_image_url text,
    bio text,
    similarity_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id AS user_id,
        u.nickname,
        u.profile_image_url,
        u.bio,
        (1 - (u.preference_embedding <=> query_embedding))::float AS similarity_score
    FROM public.users u
    INNER JOIN public.travel_locations tl
        ON tl.user_id = u.id
    WHERE tl.location_name = match_location
      AND tl.is_active = true
      AND u.id != exclude_user_id
      AND u.preference_embedding IS NOT NULL
    ORDER BY u.preference_embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
