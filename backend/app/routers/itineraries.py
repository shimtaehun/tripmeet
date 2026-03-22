import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.db.supabase_client import get_supabase
from app.middleware.auth import get_current_user
from app.services.ai_service import get_or_generate_itinerary, revise_itinerary

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/itineraries", tags=["itineraries"])


class ItineraryListItem(BaseModel):
    id: str
    destination: str
    duration_days: int
    travelers_count: int
    budget_range: str
    created_at: str


class CreateItineraryRequest(BaseModel):
    destination: str
    duration_days: int
    travelers_count: int
    budget_won: int
    custom_requests: Optional[str] = None  # 사용자 추가 요구사항 (식사, 활동 등)


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


@router.get("/", response_model=list[ItineraryListItem])
def list_my_itineraries(current_user: dict = Depends(get_current_user)):
    """내 저장 일정 목록 조회 (최신순)"""
    supabase = get_supabase()
    result = (
        supabase.table("itineraries")
        .select("id, destination, duration_days, travelers_count, budget_range, created_at")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.post("/", response_model=ItineraryResponse, status_code=status.HTTP_201_CREATED)
def create_itinerary(
    body: CreateItineraryRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    AI 여행 일정 생성.
    Redis 캐시 히트 시 Gemini를 호출하지 않고 즉시 반환한다. (context.md 원칙 3)
    """
    try:
        content, cache_key, is_cached = get_or_generate_itinerary(
            destination=body.destination,
            duration_days=body.duration_days,
            travelers_count=body.travelers_count,
            budget_won=body.budget_won,
            user_id=current_user["id"],
            custom_requests=body.custom_requests,
        )
    except Exception as e:
        logger.error("AI 일정 생성 실패: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI 일정 생성 실패: {str(e)}",
        )

    supabase = get_supabase()

    try:
        # 동일 cache_key 일정이 이미 DB에 있으면 재사용
        existing = supabase.table("itineraries").select("*").eq("cache_key", cache_key).limit(1).execute()
        if existing.data:
            row = existing.data[0]
            return ItineraryResponse(**row, is_cached=True)

        # DB 저장
        budget_range = cache_key.split(":")[-2]
        result = supabase.table("itineraries").insert({
            "user_id": current_user["id"],
            "destination": body.destination,
            "duration_days": body.duration_days,
            "travelers_count": body.travelers_count,
            "budget_range": budget_range,
            "cache_key": cache_key,
            "content": content,
        }).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"DB 저장 실패: {str(e)}",
        )

    return ItineraryResponse(**result.data[0], is_cached=is_cached)


class ReviseItineraryRequest(BaseModel):
    revision_request: str  # 사용자가 원하는 수정 내용


@router.post("/{itinerary_id}/revise", response_model=ItineraryDetailResponse)
def revise_itinerary_endpoint(
    itinerary_id: str,
    body: ReviseItineraryRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    기존 일정을 AI로 수정한다.
    수정 결과를 DB에 반영하고 갱신된 일정을 반환한다.
    """
    supabase = get_supabase()

    # 기존 일정 조회
    existing = supabase.table("itineraries").select("*").eq("id", itinerary_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="일정을 찾을 수 없습니다.")

    row = existing.data
    if row["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="수정 권한이 없습니다.")

    try:
        revised_content = revise_itinerary(row["content"], body.revision_request)
    except Exception as e:
        logger.error("AI 일정 수정 실패: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI 일정 수정 실패: {str(e)}",
        )

    try:
        updated = supabase.table("itineraries").update({"content": revised_content}).eq("id", itinerary_id).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"DB 저장 실패: {str(e)}",
        )

    return updated.data[0]


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
