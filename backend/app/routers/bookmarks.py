from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from pydantic import BaseModel
from app.db.supabase_client import get_supabase
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])

ALLOWED_TYPES = {"restaurant", "companion"}


class BookmarkToggleRequest(BaseModel):
    target_type: str
    target_id: str


class BookmarkItem(BaseModel):
    id: str
    target_type: str
    target_id: str
    created_at: str


@router.post("/toggle", status_code=status.HTTP_200_OK)
def toggle_bookmark(
    body: BookmarkToggleRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    북마크 토글.
    이미 저장된 경우 삭제, 없으면 추가한다.
    반환: { "bookmarked": true/false }
    """
    if body.target_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="target_type은 restaurant 또는 companion이어야 합니다.")

    supabase = get_supabase()
    existing = (
        supabase.table("bookmarks")
        .select("id")
        .eq("user_id", current_user["id"])
        .eq("target_type", body.target_type)
        .eq("target_id", body.target_id)
        .execute()
    )

    if existing.data:
        supabase.table("bookmarks").delete().eq("id", existing.data[0]["id"]).execute()
        return {"bookmarked": False}
    else:
        supabase.table("bookmarks").insert({
            "user_id": current_user["id"],
            "target_type": body.target_type,
            "target_id": body.target_id,
        }).execute()
        return {"bookmarked": True}


@router.get("/", response_model=list[BookmarkItem])
def list_bookmarks(
    target_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """내 북마크 목록 조회 (target_type 필터 가능)"""
    if target_type and target_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="target_type은 restaurant 또는 companion이어야 합니다.")

    supabase = get_supabase()
    query = (
        supabase.table("bookmarks")
        .select("id, target_type, target_id, created_at")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
    )
    if target_type:
        query = query.eq("target_type", target_type)

    result = query.execute()
    return result.data or []


@router.get("/check")
def check_bookmark(
    target_type: str = Query(...),
    target_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    """특정 항목의 북마크 여부 확인"""
    if target_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="target_type은 restaurant 또는 companion이어야 합니다.")

    supabase = get_supabase()
    result = (
        supabase.table("bookmarks")
        .select("id")
        .eq("user_id", current_user["id"])
        .eq("target_type", target_type)
        .eq("target_id", target_id)
        .execute()
    )
    return {"bookmarked": bool(result.data)}
