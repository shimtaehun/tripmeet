from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.db.supabase_client import get_supabase
from app.middleware.auth import get_current_user
from app.services.ai_service import get_or_generate_itinerary

router = APIRouter(prefix="/itineraries", tags=["itineraries"])


class CreateItineraryRequest(BaseModel):
    destination: str
    duration_days: int
    travelers_count: int
    budget_won: int


class ItineraryResponse(BaseModel):
    id: str
    destination: str
    duration_days: int
    travelers_count: int
    budget_range: str
    content: dict
    is_cached: bool


class ItineraryDetailResponse(BaseModel):
    id: str
    destination: str
    duration_days: int
    travelers_count: int
    budget_range: str
    content: dict


@router.post("/", response_model=ItineraryResponse, status_code=status.HTTP_201_CREATED)
def create_itinerary(
    body: CreateItineraryRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    AI 여행 일정 생성.
    Redis 캐시 히트 시 GPT를 호출하지 않고 즉시 반환한다. (context.md 원칙 3)
    """
    content, cache_key, is_cached = get_or_generate_itinerary(
        destination=body.destination,
        duration_days=body.duration_days,
        travelers_count=body.travelers_count,
        budget_won=body.budget_won,
    )

    supabase = get_supabase()

    # 동일 cache_key 일정이 이미 DB에 있으면 재사용
    existing = supabase.table("itineraries").select("*").eq("cache_key", cache_key).limit(1).execute()
    if existing.data:
        row = existing.data[0]
        return ItineraryResponse(**row, is_cached=True)

    # DB 저장
    budget_range = cache_key.split(":")[-1]
    result = supabase.table("itineraries").insert({
        "user_id": current_user["id"],
        "destination": body.destination,
        "duration_days": body.duration_days,
        "travelers_count": body.travelers_count,
        "budget_range": budget_range,
        "cache_key": cache_key,
        "content": content,
    }).execute()

    return ItineraryResponse(**result.data[0], is_cached=is_cached)


@router.get("/{itinerary_id}", response_model=ItineraryDetailResponse)
def get_itinerary(
    itinerary_id: str,
    current_user: dict = Depends(get_current_user),
):
    """저장된 일정 조회"""
    supabase = get_supabase()
    result = supabase.table("itineraries").select("*").eq("id", itinerary_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="일정을 찾을 수 없습니다.")

    return result.data
