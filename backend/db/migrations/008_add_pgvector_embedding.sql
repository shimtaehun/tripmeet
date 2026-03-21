-- pgvector 확장 활성화 및 사용자 성향 임베딩 컬럼 추가
-- Gemini text-embedding-004 모델의 출력 차원: 768

-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- users 테이블에 성향 임베딩 컬럼 추가
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS preference_embedding vector(768);

-- cosine 유사도 검색 최적화 인덱스 (IVFFlat)
-- lists 값은 데이터 규모에 따라 조정 (rows/1000 ~ sqrt(rows) 권장)
CREATE INDEX IF NOT EXISTS idx_users_preference_embedding
    ON public.users
    USING ivfflat (preference_embedding vector_cosine_ops)
    WITH (lists = 100);
