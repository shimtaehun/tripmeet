from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel
from app.db.supabase_client import get_supabase
from app.middleware.auth import get_current_user
from app.services.storage_service import upload_image
from app.services.embedding_service import get_embedding
import asyncio
import logging

router = APIRouter(prefix="/users", tags=["users"])

logger = logging.getLogger(__name__)


class UserProfile(BaseModel):
    id: str
    nickname: str
    profile_image_url: str | None
    bio: str | None


class UpdateProfileRequest(BaseModel):
    nickname: str | None = None
    bio: str | None = None


@router.get("/me", response_model=UserProfile)
def get_my_profile(current_user: dict = Depends(get_current_user)):
    """내 프로필 조회"""
    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", current_user["id"]).single().execute()

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")

    return result.data


@router.patch("/me", response_model=UserProfile)
async def update_my_profile(
    body: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    내 프로필 수정 (nickname, bio).
    bio가 변경되면 Gemini text-embedding-004로 성향 벡터를 자동 생성한다.
    """
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="수정할 항목이 없습니다.")

    # bio가 변경되면 임베딩 생성
    if "bio" in updates and updates["bio"].strip():
        try:
            embedding = await get_embedding(updates["bio"])
            updates["preference_embedding"] = embedding
        except Exception as e:
            # 임베딩 실패 시에도 프로필 수정은 진행 (임베딩만 건너뜀)
            logger.warning(f"임베딩 생성 실패 (프로필 수정은 계속 진행): {e}")
    elif "bio" in updates and not updates["bio"].strip():
        # bio를 비우면 임베딩도 제거
        updates["preference_embedding"] = None

    supabase = get_supabase()
    result = supabase.table("users").update(updates).eq("id", current_user["id"]).execute()

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")

    return result.data[0]


class ProfileImageResponse(BaseModel):
    profile_image_url: str


@router.post("/me/profile-image", response_model=ProfileImageResponse)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    프로필 이미지 업로드.
    클라이언트에서 500KB 이하로 압축 후 전송하는 것을 전제로 한다.
    """
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="jpeg, png, webp 형식만 허용됩니다.")

    file_bytes = await file.read()
    if len(file_bytes) > 500 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="이미지 크기는 500KB 이하여야 합니다.")

    url = upload_image(file_bytes, file.content_type, folder="profiles")

    supabase = get_supabase()
    supabase.table("users").update({"profile_image_url": url}).eq("id", current_user["id"]).execute()

    return {"profile_image_url": url}
