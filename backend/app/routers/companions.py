from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.db.supabase_client import get_supabase
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/companions", tags=["companions"])

PAGE_SIZE = 20
ALLOWED_STATUSES = {"open", "closed"}
ALLOWED_APP_STATUSES = {"accepted", "rejected"}


class AuthorInfo(BaseModel):
    nickname: str
    profile_image_url: Optional[str] = None


class ApplicationInfo(BaseModel):
    id: str
    applicant_id: str
    message: Optional[str] = None
    status: str
    created_at: str
    applicant: Optional[AuthorInfo] = None


class CompanionSummary(BaseModel):
    id: str
    user_id: str
    destination: str
    travel_start_date: str
    travel_end_date: str
    description: str
    max_participants: int
    status: str
    created_at: str


class CompanionDetail(CompanionSummary):
    author: Optional[AuthorInfo] = None
    applications: list[ApplicationInfo] = []


class CompanionListResponse(BaseModel):
    items: list[CompanionSummary]
    next_cursor: Optional[str] = None


def _get_author(supabase, user_id: str) -> Optional[dict]:
    result = supabase.table("users").select("nickname, profile_image_url").eq("id", user_id).single().execute()
    return result.data


@router.get("/", response_model=CompanionListResponse)
def list_companions(
    status: Optional[str] = Query(None),
    cursor: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """
    동행 구인 목록 조회.
    status 필터 (open/closed)와 cursor 기반 페이지네이션(20개씩)을 지원한다.
    cursor는 이전 페이지의 마지막 항목의 created_at 값이다.
    """
    if status and status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="status는 open 또는 closed여야 합니다.")

    supabase = get_supabase()
    query = (
        supabase.table("companions")
        .select("id, user_id, destination, travel_start_date, travel_end_date, description, max_participants, status, created_at")
        .order("created_at", desc=True)
        .limit(PAGE_SIZE)
    )
    if status:
        query = query.eq("status", status)
    if cursor:
        query = query.lt("created_at", cursor)

    result = query.execute()
    items = result.data or []
    next_cursor = items[-1]["created_at"] if len(items) == PAGE_SIZE else None

    return {"items": items, "next_cursor": next_cursor}


@router.post("/", response_model=CompanionDetail, status_code=status.HTTP_201_CREATED)
def create_companion(
    payload: dict,
    current_user: dict = Depends(get_current_user),
):
    """
    동행 구인 게시글 등록.
    destination, travel_start_date (YYYY-MM-DD), travel_end_date, description, max_participants 필수.
    """
    destination = payload.get("destination", "").strip()
    travel_start_date = payload.get("travel_start_date", "").strip()
    travel_end_date = payload.get("travel_end_date", "").strip()
    description = payload.get("description", "").strip()
    max_participants = payload.get("max_participants", 2)

    if not destination:
        raise HTTPException(status_code=400, detail="destination은 필수입니다.")
    if not travel_start_date or not travel_end_date:
        raise HTTPException(status_code=400, detail="여행 날짜는 필수입니다.")
    if not description:
        raise HTTPException(status_code=400, detail="description은 필수입니다.")
    if not isinstance(max_participants, int) or not (2 <= max_participants <= 10):
        raise HTTPException(status_code=400, detail="max_participants는 2~10 사이여야 합니다.")

    supabase = get_supabase()
    result = supabase.table("companions").insert({
        "user_id": current_user["id"],
        "destination": destination,
        "travel_start_date": travel_start_date,
        "travel_end_date": travel_end_date,
        "description": description,
        "max_participants": max_participants,
        "status": "open",
    }).execute()

    companion = result.data[0]
    companion["author"] = _get_author(supabase, current_user["id"])
    companion["applications"] = []
    return companion


@router.get("/{companion_id}", response_model=CompanionDetail)
def get_companion(
    companion_id: str,
    current_user: dict = Depends(get_current_user),
):
    """동행 구인 상세 조회 (신청자 목록 포함)"""
    supabase = get_supabase()
    result = supabase.table("companions").select("*").eq("id", companion_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="동행 구인 게시글을 찾을 수 없습니다.")

    companion = result.data
    companion["author"] = _get_author(supabase, companion["user_id"])

    # 신청자 목록 조회 (작성자 본인에게만 신청자 정보 노출)
    if current_user["id"] == companion["user_id"]:
        apps_result = (
            supabase.table("companion_applications")
            .select("id, applicant_id, message, status, created_at")
            .eq("companion_id", companion_id)
            .order("created_at")
            .execute()
        )
        applications = apps_result.data or []
        for app in applications:
            app["applicant"] = _get_author(supabase, app["applicant_id"])
        companion["applications"] = applications
    else:
        companion["applications"] = []

    return companion


@router.patch("/{companion_id}/close", status_code=status.HTTP_200_OK)
def close_companion(
    companion_id: str,
    current_user: dict = Depends(get_current_user),
):
    """동행 구인 마감 (작성자 본인만 가능)"""
    supabase = get_supabase()
    existing = supabase.table("companions").select("user_id, status").eq("id", companion_id).single().execute()

    if not existing.data:
        raise HTTPException(status_code=404, detail="동행 구인 게시글을 찾을 수 없습니다.")
    if existing.data["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="마감 권한이 없습니다.")
    if existing.data["status"] == "closed":
        raise HTTPException(status_code=400, detail="이미 마감된 게시글입니다.")

    updated_at = datetime.utcnow().isoformat()
    supabase.table("companions").update({"status": "closed", "updated_at": updated_at}).eq("id", companion_id).execute()

    return {"id": companion_id, "status": "closed"}


@router.post("/{companion_id}/apply", status_code=status.HTTP_201_CREATED)
def apply_companion(
    companion_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
):
    """
    동행 신청.
    같은 게시글에 중복 신청 시 400 에러를 반환한다.
    """
    message = payload.get("message", "").strip() or None

    supabase = get_supabase()
    existing_post = supabase.table("companions").select("user_id, status").eq("id", companion_id).single().execute()

    if not existing_post.data:
        raise HTTPException(status_code=404, detail="동행 구인 게시글을 찾을 수 없습니다.")
    if existing_post.data["status"] == "closed":
        raise HTTPException(status_code=400, detail="마감된 게시글에는 신청할 수 없습니다.")
    if existing_post.data["user_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="본인 게시글에는 신청할 수 없습니다.")

    # 중복 신청 검사
    dup = (
        supabase.table("companion_applications")
        .select("id")
        .eq("companion_id", companion_id)
        .eq("applicant_id", current_user["id"])
        .execute()
    )
    if dup.data:
        raise HTTPException(status_code=400, detail="이미 신청한 게시글입니다.")

    result = supabase.table("companion_applications").insert({
        "companion_id": companion_id,
        "applicant_id": current_user["id"],
        "message": message,
        "status": "pending",
    }).execute()

    return result.data[0]


@router.patch("/{companion_id}/applications/{application_id}", status_code=status.HTTP_200_OK)
def update_application_status(
    companion_id: str,
    application_id: str,
    payload: dict,
    current_user: dict = Depends(get_current_user),
):
    """
    신청 수락 또는 거절 (동행 구인 게시글 작성자만 가능).
    payload: { "status": "accepted" | "rejected" }
    """
    new_status = payload.get("status", "")
    if new_status not in ALLOWED_APP_STATUSES:
        raise HTTPException(status_code=400, detail="status는 accepted 또는 rejected여야 합니다.")

    supabase = get_supabase()
    companion = supabase.table("companions").select("user_id").eq("id", companion_id).single().execute()

    if not companion.data:
        raise HTTPException(status_code=404, detail="동행 구인 게시글을 찾을 수 없습니다.")
    if companion.data["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="권한이 없습니다.")

    app = (
        supabase.table("companion_applications")
        .select("id, status")
        .eq("id", application_id)
        .eq("companion_id", companion_id)
        .single()
        .execute()
    )
    if not app.data:
        raise HTTPException(status_code=404, detail="신청 내역을 찾을 수 없습니다.")

    supabase.table("companion_applications").update({"status": new_status}).eq("id", application_id).execute()

    return {"id": application_id, "status": new_status}
