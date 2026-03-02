"""
위치 관련 엔드포인트 단위 테스트.

케이스:
1. POST /locations - 기존 활성 위치 비활성화 후 새 위치 등록 → 201 반환
2. GET /locations?location_name=xxx - 해당 지역의 활성 여행자 목록 반환 (본인 제외)
"""
from unittest.mock import MagicMock, patch
from tests.conftest import FAKE_USER

SAMPLE_LOCATION_ROW = {
    "id": "loc-id-001",
    "user_id": FAKE_USER["id"],
    "location_name": "홍대",
    "country": "한국",
    "region": "서울",
    "is_active": True,
}


def _make_supabase_mock():
    supabase = MagicMock()

    # UPDATE (기존 위치 비활성화) 체인
    supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value.data = []

    # INSERT (새 위치 등록) 체인
    supabase.table.return_value.insert.return_value.execute.return_value.data = [SAMPLE_LOCATION_ROW]

    return supabase


def test_register_location(client):
    """POST /locations: 기존 활성 위치를 비활성화하고 새 위치를 등록해야 한다."""
    mock_sb = _make_supabase_mock()

    with patch("app.routers.locations.get_supabase", return_value=mock_sb):
        res = client.post("/locations/", json={
            "location_name": "홍대",
            "country": "한국",
            "region": "서울",
        })

    assert res.status_code == 201
    data = res.json()
    assert data["location_name"] == "홍대"
    assert data["is_active"] is True
    # UPDATE(비활성화)와 INSERT(등록) 모두 호출되었는지 확인
    mock_sb.table.return_value.update.assert_called_once()
    mock_sb.table.return_value.insert.assert_called_once()


def test_list_travelers_by_location(client):
    """GET /locations?location_name=홍대: 해당 지역 활성 여행자 목록을 반환해야 한다."""
    traveler_rows = [
        {
            "user_id": "other-user-id",
            "users": {
                "nickname": "여행자A",
                "profile_image_url": None,
                "bio": "안녕하세요",
            },
        }
    ]

    supabase = MagicMock()
    (
        supabase.table.return_value
        .select.return_value
        .eq.return_value
        .eq.return_value
        .neq.return_value
        .execute.return_value
        .data
    ) = traveler_rows

    with patch("app.routers.locations.get_supabase", return_value=supabase):
        res = client.get("/locations/?location_name=홍대")

    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["nickname"] == "여행자A"
    assert data[0]["user_id"] == "other-user-id"
