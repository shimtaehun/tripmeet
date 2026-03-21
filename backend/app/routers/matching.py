"""
성향 기반 여행자 매칭 라우터.

같은 여행지 내에서 사용자의 preference_embedding 벡터를 기준으로
cosine distance가 가장 가까운(성향이 유사한) 여행자를 추천 반환한다.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from pydantic import BaseModel
from app.db.supabase_client import get_supabase
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/matching", tags=["matching"])


class SimilarTraveler(BaseModel):
    user_id: str
    nickname: str
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None
    similarity_score: float


@router.get("/similar", response_model=list[SimilarTraveler])
def get_similar_travelers(
    location_name: str = Query(..., description="매칭할 여행지 이름"),
    limit: int = Query(20, ge=1, le=50, description="최대 반환 수"),
    current_user: dict = Depends(get_current_user),
):
    """
    같은 여행지 내 성향 유사 여행자 추천.

    현재 사용자의 preference_embedding과 동일 여행지 활성 여행자들의
    임베딩을 cosine distance로 비교해 유사도가 높은 순으로 반환한다.

    임베딩이 없는 사용자는 일반 목록(유사도 0)으로 대체한다.
    """
    supabase = get_supabase()
    user_id = current_user["id"]

    # 현재 사용자의 임베딩 조회
    user_result = (
        supabase.table("users")
        .select("preference_embedding")
        .eq("id", user_id)
        .single()
        .execute()
    )

    user_embedding = None
    if user_result.data:
        user_embedding = user_result.data.get("preference_embedding")

    # 임베딩이 있으면 cosine 유사도 기반 매칭, 없으면 일반 목록
    if user_embedding:
        # PostgreSQL function 호출 (match_travelers)
        rpc_result = supabase.rpc(
            "match_travelers",
            {
                "query_embedding": user_embedding,
                "match_location": location_name,
                "exclude_user_id": user_id,
                "match_count": limit,
            },
        ).execute()

        travelers = []
        for row in rpc_result.data or []:
            travelers.append(
                SimilarTraveler(
                    user_id=str(row["user_id"]),
                    nickname=row["nickname"] or "",
                    profile_image_url=row.get("profile_image_url"),
                    bio=row.get("bio"),
                    similarity_score=round(row.get("similarity_score", 0), 4),
                )
            )
        return travelers
    else:
        # 임베딩이 없는 사용자: 같은 여행지 활성 여행자 일반 조회
        result = (
            supabase.table("travel_locations")
            .select("user_id, users(nickname, profile_image_url, bio)")
            .eq("location_name", location_name)
            .eq("is_active", True)
            .neq("user_id", user_id)
            .execute()
        )

        travelers = []
        for row in result.data or []:
            user = row.get("users") or {}
            travelers.append(
                SimilarTraveler(
                    user_id=str(row["user_id"]),
                    nickname=user.get("nickname", ""),
                    profile_image_url=user.get("profile_image_url"),
                    bio=user.get("bio"),
                    similarity_score=0.0,
                )
            )
        return travelers
