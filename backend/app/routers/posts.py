from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timezone
from app.db.supabase_client import get_supabase
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/posts", tags=["posts"])

PAGE_SIZE = 20
ALLOWED_CATEGORIES = {"question", "review", "info"}


class PostCreate(BaseModel):
    category: str
    title: str
    content: str


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class AuthorInfo(BaseModel):
    nickname: str
    profile_image_url: Optional[str] = None


class PostSummary(BaseModel):
    id: str
    user_id: str
    category: str
    title: str
    view_count: int
    created_at: str


class PostDetail(BaseModel):
    id: str
    user_id: str
    category: str
    title: str
    content: str
    view_count: int
    created_at: str
    updated_at: str
    author: Optional[AuthorInfo] = None


class PostListResponse(BaseModel):
    items: list[PostSummary]
    next_cursor: Optional[str] = None


def _get_author(supabase, user_id: str) -> Optional[dict]:
    result = supabase.table("users").select("nickname, profile_image_url").eq("id", user_id).single().execute()
    return result.data


@router.get("/", response_model=PostListResponse)
def list_posts(
    category: Optional[str] = Query(None),
    cursor: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """
    게시글 목록 조회.
    category 필터(question/review/info)와 cursor 기반 페이지네이션(20개씩)을 지원한다.
    cursor는 이전 페이지의 마지막 항목의 created_at 값이다.
    """
    if category and category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="유효하지 않은 카테고리입니다.")

    supabase = get_supabase()
    query = (
        supabase.table("posts")
        .select("id, user_id, category, title, view_count, created_at")
        .order("created_at", desc=True)
        .limit(PAGE_SIZE)
    )
    if category:
        query = query.eq("category", category)
    if cursor:
        query = query.lt("created_at", cursor)

    result = query.execute()
    items = result.data or []
    next_cursor = items[-1]["created_at"] if len(items) == PAGE_SIZE else None

    return {"items": items, "next_cursor": next_cursor}


@router.post("/", response_model=PostDetail, status_code=status.HTTP_201_CREATED)
def create_post(
    body: PostCreate,
    current_user: dict = Depends(get_current_user),
):
    """게시글 작성"""
    if body.category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="카테고리는 question, review, info 중 하나여야 합니다.")

    supabase = get_supabase()
    insert_result = supabase.table("posts").insert({
        "user_id": current_user["id"],
        "category": body.category,
        "title": body.title,
        "content": body.content,
    }).execute()

    post = insert_result.data[0]
    post["author"] = _get_author(supabase, current_user["id"])
    return post


@router.get("/{post_id}", response_model=PostDetail)
def get_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
):
    """게시글 상세 조회 (조회수 +1)"""
    supabase = get_supabase()

    post_result = supabase.table("posts").select("*").eq("id", post_id).single().execute()
    if not post_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시글을 찾을 수 없습니다.")

    post = post_result.data
    supabase.table("posts").update({"view_count": post["view_count"] + 1}).eq("id", post_id).execute()
    post["author"] = _get_author(supabase, post["user_id"])
    return post


@router.patch("/{post_id}", response_model=PostDetail)
def update_post(
    post_id: str,
    body: PostUpdate,
    current_user: dict = Depends(get_current_user),
):
    """게시글 수정 (작성자 본인만 가능)"""
    supabase = get_supabase()

    existing = supabase.table("posts").select("user_id").eq("id", post_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시글을 찾을 수 없습니다.")
    if existing.data["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="수정 권한이 없습니다.")

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="수정할 항목이 없습니다.")

    # DB 트리거 없으므로 updated_at 수동 갱신
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = supabase.table("posts").update(updates).eq("id", post_id).execute()
    post = result.data[0]
    post["author"] = _get_author(supabase, current_user["id"])
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
):
    """게시글 삭제 (작성자 본인만 가능)"""
    supabase = get_supabase()

    existing_result = supabase.table("posts").select("user_id").eq("id", post_id).execute()
    if not existing_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="게시글을 찾을 수 없습니다.")
    if existing_result.data[0]["user_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="삭제 권한이 없습니다.")

    supabase.table("posts").delete().eq("id", post_id).execute()
