"""
매칭 엔드포인트 단위 테스트.

케이스:
1. GET /matching/similar - 임베딩이 있는 사용자: RPC 기반 유사도 매칭 반환
2. GET /matching/similar - 임베딩이 없는 사용자: 일반 여행자 목록 반환
3. GET /matching/similar - location_name 필수 검증
"""
from unittest.mock import MagicMock, patch
from tests.conftest import FAKE_USER


def _make_supabase_with_embedding():
    """사용자에게 임베딩이 있는 경우의 Supabase 모의 객체."""
    supabase = MagicMock()

    # 사용자 임베딩 조회 결과
    (
        supabase.table.return_value
        .select.return_value
        .eq.return_value
        .single.return_value
        .execute.return_value
    ).data = {"preference_embedding": "[0.1, 0.2, 0.3]"}

    # RPC 호출 결과
    supabase.rpc.return_value.execute.return_value.data = [
        {
            "user_id": "bbbbbbbb-0000-0000-0000-000000000002",
            "nickname": "여행자B",
            "profile_image_url": None,
            "bio": "자연 여행 좋아해요",
            "similarity_score": 0.9234,
        },
        {
            "user_id": "cccccccc-0000-0000-0000-000000000003",
            "nickname": "여행자C",
            "profile_image_url": "https://example.com/img.jpg",
            "bio": "카페 투어",
            "similarity_score": 0.7512,
        },
    ]

    return supabase


def _make_supabase_without_embedding():
    """사용자에게 임베딩이 없는 경우의 Supabase 모의 객체."""
    supabase = MagicMock()

    # 사용자 임베딩 없음
    (
        supabase.table.return_value
        .select.return_value
        .eq.return_value
        .single.return_value
        .execute.return_value
    ).data = {"preference_embedding": None}

    # 일반 여행자 목록 조회 (travel_locations join users)
    (
        supabase.table.return_value
        .select.return_value
        .eq.return_value
        .eq.return_value
        .neq.return_value
        .execute.return_value
    ).data = [
        {
            "user_id": "dddddddd-0000-0000-0000-000000000004",
            "users": {
                "nickname": "여행자D",
                "profile_image_url": None,
                "bio": "여행 초보",
            },
        }
    ]

    return supabase


def test_similar_travelers_with_embedding(client):
    """임베딩이 있는 사용자: cosine 유사도 기반 매칭 결과를 반환해야 한다."""
    mock_sb = _make_supabase_with_embedding()

    with patch("app.routers.matching.get_supabase", return_value=mock_sb):
        res = client.get("/matching/similar?location_name=홍대")

    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    assert data[0]["nickname"] == "여행자B"
    assert data[0]["similarity_score"] == 0.9234
    assert data[1]["nickname"] == "여행자C"
    assert data[1]["similarity_score"] == 0.7512

    # RPC가 올바른 인자로 호출되었는지 검증
    mock_sb.rpc.assert_called_once_with(
        "match_travelers",
        {
            "query_embedding": "[0.1, 0.2, 0.3]",
            "match_location": "홍대",
            "exclude_user_id": FAKE_USER["id"],
            "match_count": 20,
        },
    )


def test_similar_travelers_without_embedding(client):
    """임베딩이 없는 사용자: 일반 여행자 목록(유사도 0)을 반환해야 한다."""
    mock_sb = _make_supabase_without_embedding()

    with patch("app.routers.matching.get_supabase", return_value=mock_sb):
        res = client.get("/matching/similar?location_name=홍대")

    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["nickname"] == "여행자D"
    assert data[0]["similarity_score"] == 0.0


def test_similar_travelers_requires_location_name(client):
    """location_name이 없으면 422 에러를 반환해야 한다."""
    res = client.get("/matching/similar")
    assert res.status_code == 422
