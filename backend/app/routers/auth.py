from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.db.supabase_client import get_supabase
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


class SyncUserResponse(BaseModel):
    id: str
    nickname: str
    profile_image_url: str | None
    bio: str | None
    is_new_user: bool


@router.post("/sync-user", response_model=SyncUserResponse)
def sync_user(current_user: dict = Depends(get_current_user)):
    """
    구글 OAuth 로그인 완료 후 호출하는 엔드포인트.
    DB 트리거로 users 행이 자동 생성되지만, 트리거 누락 시 폴백으로 동작한다.
    구글 프로필의 display_name을 nickname 초기값으로 사용한다.
    """
    supabase = get_supabase()
    user_id = current_user["id"]
    user_email = current_user.get("email", "")

    # 기존 users 행 조회
    result = supabase.table("users").select("*").eq("id", user_id).single().execute()

    if result.data:
        return SyncUserResponse(**result.data, is_new_user=False)

    # 트리거 누락 시 직접 생성 (폴백)
    default_nickname = user_email.split("@")[0] if user_email else "여행자"
    insert_result = supabase.table("users").insert({
        "id": user_id,
        "nickname": default_nickname,
    }).execute()

    return SyncUserResponse(**insert_result.data[0], is_new_user=True)
