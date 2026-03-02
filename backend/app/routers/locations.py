from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.db.supabase_client import get_supabase
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/locations", tags=["locations"])


class RegisterLocationRequest(BaseModel):
    location_name: str
    country: str
    region: str | None = None


class LocationResponse(BaseModel):
    id: str
    user_id: str
    location_name: str
    country: str
    region: str | None
    is_active: bool


class TravelerItem(BaseModel):
    user_id: str
    nickname: str
    profile_image_url: str | None
    bio: str | None


@router.post("/", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def register_location(
    body: RegisterLocationRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    현재 여행 위치 등록.
    GPS 자동 수집 없이 사용자가 직접 입력한 지역명만 저장한다. (context.md 원칙 5)
    기존 활성 위치가 있으면 먼저 비활성화 후 새로 등록한다.
    """
    supabase = get_supabase()
    user_id = current_user["id"]

    # 기존 활성 위치 비활성화
    supabase.table("travel_locations").update({
        "is_active": False,
        "deactivated_at": "now()",
    }).eq("user_id", user_id).eq("is_active", True).execute()

    # 새 위치 등록
    result = supabase.table("travel_locations").insert({
        "user_id": user_id,
        "location_name": body.location_name.strip(),
        "country": body.country.strip(),
        "region": body.region.strip() if body.region else None,
    }).execute()

    return result.data[0]


@router.patch("/{location_id}/deactivate", response_model=LocationResponse)
def deactivate_location(
    location_id: str,
    current_user: dict = Depends(get_current_user),
):
    """현재 여행 위치 비활성화 (여행 종료)"""
    supabase = get_supabase()

    result = supabase.table("travel_locations").update({
        "is_active": False,
        "deactivated_at": "now()",
    }).eq("id", location_id).eq("user_id", current_user["id"]).execute()

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="위치 정보를 찾을 수 없습니다.")

    return result.data[0]


@router.get("/", response_model=list[TravelerItem])
def list_travelers_by_location(
    location_name: str,
    current_user: dict = Depends(get_current_user),
):
    """
    특정 지역의 활성 여행자 목록 반환.
    본인은 목록에서 제외한다.
    """
    supabase = get_supabase()

    result = supabase.table("travel_locations").select(
        "user_id, users(nickname, profile_image_url, bio)"
    ).eq("location_name", location_name).eq("is_active", True).neq("user_id", current_user["id"]).execute()

    travelers = []
    for row in result.data:
        user = row.get("users") or {}
        travelers.append(TravelerItem(
            user_id=row["user_id"],
            nickname=user.get("nickname", ""),
            profile_image_url=user.get("profile_image_url"),
            bio=user.get("bio"),
        ))

    return travelers
