import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Authorization 헤더의 Bearer JWT를 검증하고 사용자 정보를 반환한다.
    Supabase Auth의 getUser() API를 통해 토큰 유효성을 확인한다.
    """
    token = credentials.credentials

    # anon key로 클라이언트 생성 후 토큰 검증
    # service_role 키가 아닌 anon 키를 사용해야 사용자 컨텍스트로 동작한다
    supabase = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_ANON_KEY"],
    )

    response = supabase.auth.get_user(token)

    if response is None or response.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 인증 토큰입니다.",
        )

    return {"id": response.user.id, "email": response.user.email}
