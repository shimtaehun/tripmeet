from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from typing import Optional
from pydantic import BaseModel
from app.db.supabase_client import get_supabase
from app.middleware.auth import get_current_user
from app.services.storage_service import upload_image

router = APIRouter(prefix="/restaurants", tags=["restaurants"])

PAGE_SIZE = 20
MAX_IMAGES = 5
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


class AuthorInfo(BaseModel):
    nickname: str
    profile_image_url: Optional[str] = None


class RestaurantSummary(BaseModel):
    id: str
    user_id: str
    name: str
    location_name: str
    rating: int
    image_urls: list[str]
    created_at: str


class RestaurantDetail(BaseModel):
    id: str
    user_id: str
    name: str
    location_name: str
    description: Optional[str] = None
    rating: int
    image_urls: list[str]
    created_at: str
    author: Optional[AuthorInfo] = None


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    location_name: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[int] = None


class RestaurantListResponse(BaseModel):
    items: list[RestaurantSummary]
    next_cursor: Optional[str] = None


def _get_author(supabase, user_id: str) -> Optional[dict]:
    result = supabase.table("users").select("nickname, profile_image_url").eq("id", user_id).single().execute()
    return result.data


@router.get("/", response_model=RestaurantListResponse)
def list_restaurants(
    location_name: Optional[str] = Query(None),
    cursor: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """
    맛집 목록 조회.
    location_name 필터와 cursor 기반 페이지네이션(20개씩)을 지원한다.
    cursor는 이전 페이지의 마지막 항목의 created_at 값이다.
    """
    supabase = get_supabase()
    query = (
        supabase.table("restaurants")
        .select("id, user_id, name, location_name, rating, image_urls, created_at")
        .order("created_at", desc=True)
        .limit(PAGE_SIZE)
    )
    if location_name:
        query = query.ilike("location_name", f"%{location_name}%")
    if cursor:
        query = query.lt("created_at", cursor)

    result = query.execute()
    items = result.data or []
    next_cursor = items[-1]["created_at"] if len(items) == PAGE_SIZE else None

    return {"items": items, "next_cursor": next_cursor}


@router.post("/", response_model=RestaurantDetail, status_code=status.HTTP_201_CREATED)
async def create_restaurant(
    name: str = Form(...),
    location_name: str = Form(...),
    description: Optional[str] = Form(None),
    rating: int = Form(...),
    images: list[UploadFile] = File(default=[]),
    current_user: dict = Depends(get_current_user),
):
    """
    맛집 등록.
    이미지는 최대 5장까지 multipart로 전송한다.
    클라이언트에서 500KB 이하로 압축 후 전송하는 것을 전제로 한다. (context.md 원칙 4)
    """
    if not (1 <= rating <= 5):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="별점은 1~5 사이여야 합니다.")
    if len(images) > MAX_IMAGES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"이미지는 최대 {MAX_IMAGES}장까지 업로드할 수 있습니다.")

    image_urls = []
    for img in images:
        if img.content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="jpeg, png, webp 형식만 허용됩니다.")
        file_bytes = await img.read()
        if len(file_bytes) > 500 * 1024:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="이미지 크기는 500KB 이하여야 합니다.")
        url = upload_image(file_bytes, img.content_type, folder="restaurants")
        image_urls.append(url)

    supabase = get_supabase()
    result = supabase.table("restaurants").insert({
        "user_id": current_user["id"],
        "name": name,
        "location_name": location_name,
        "description": description,
        "rating": rating,
        "image_urls": image_urls,
    }).execute()

    restaurant = result.data[0]
    restaurant["author"] = _get_author(supabase, current_user["id"])
    return restaurant


@router.get("/{restaurant_id}", response_model=RestaurantDetail)
def get_restaurant(
    restaurant_id: str,
    current_user: dict = Depends(get_current_user),
):
    """맛집 상세 조회"""
    supabase = get_supabase()
    result = supabase.table("restaurants").select("*").eq("id", restaurant_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="맛집을 찾을 수 없습니다.")

    restaurant = result.data
    restaurant["author"] = _get_author(supabase, restaurant["user_id"])
    return restaurant


@router.patch("/{restaurant_id}", response_model=RestaurantDetail)
def update_restaurant(
    restaurant_id: str,
    body: RestaurantUpdate,
    current_user: dict = Depends(get_current_user),
):
    """맛집 수정 (작성자 본인만 가능, 이미지 제외)"""
    supabase = get_supabase()

    existing = supabase.table("restaurants").select("user_id, image_urls").eq("id", restaurant_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="맛집을 찾을 수 없습니다.")
    if existing.data["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="수정 권한이 없습니다.")

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="수정할 항목이 없습니다.")
    if "rating" in updates and not (1 <= updates["rating"] <= 5):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="별점은 1~5 사이여야 합니다.")

    result = supabase.table("restaurants").update(updates).eq("id", restaurant_id).execute()
    restaurant = result.data[0]
    restaurant["author"] = _get_author(supabase, current_user["id"])
    return restaurant


@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_restaurant(
    restaurant_id: str,
    current_user: dict = Depends(get_current_user),
):
    """맛집 삭제 (작성자 본인만 가능)"""
    supabase = get_supabase()

    existing = supabase.table("restaurants").select("user_id").eq("id", restaurant_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="맛집을 찾을 수 없습니다.")
    if str(existing.data["user_id"]) != str(current_user["id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="삭제 권한이 없습니다.")

    supabase.table("restaurants").delete().eq("id", restaurant_id).execute()
