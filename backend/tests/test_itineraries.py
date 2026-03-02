"""
POST /itineraries 단위 테스트.

케이스:
1. 캐시 미스 → get_or_generate_itinerary 호출 → DB에 없음 → INSERT → is_cached=False 반환
2. 캐시 히트 → DB에 동일 cache_key 존재 → INSERT 없이 즉시 반환, is_cached=True
"""
from unittest.mock import MagicMock, patch, call

SAMPLE_CONTENT = {"days": [{"day": 1, "activities": ["관광"]}]}
SAMPLE_CACHE_KEY = "도쿄:3일:2명:50만원대"
SAMPLE_REQUEST = {
    "destination": "도쿄",
    "duration_days": 3,
    "travelers_count": 2,
    "budget_won": 500000,
}
SAMPLE_DB_ROW = {
    "id": "itinerary-id-001",
    "destination": "도쿄",
    "duration_days": 3,
    "travelers_count": 2,
    "budget_range": "50만원대",
    "cache_key": SAMPLE_CACHE_KEY,
    "content": SAMPLE_CONTENT,
}


def _make_supabase_mock(existing_rows: list):
    """
    supabase.table("itineraries").select(...).eq(...).limit(...).execute() 체인 모킹.
    existing_rows: cache_key 조회 결과
    """
    supabase = MagicMock()
    # existing 조회 (cache_key 기반)
    supabase.table.return_value.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = existing_rows

    # INSERT 체인
    inserted_row = {**SAMPLE_DB_ROW, "user_id": "aaaaaaaa-0000-0000-0000-000000000001"}
    supabase.table.return_value.insert.return_value.execute.return_value.data = [inserted_row]

    return supabase


def test_create_itinerary_cache_miss(client):
    """캐시 미스: GPT가 호출되고 DB에 저장된 후 is_cached=False로 반환해야 한다."""
    mock_sb = _make_supabase_mock(existing_rows=[])

    with (
        patch("app.routers.itineraries.get_supabase", return_value=mock_sb),
        patch(
            "app.routers.itineraries.get_or_generate_itinerary",
            return_value=(SAMPLE_CONTENT, SAMPLE_CACHE_KEY, False),
        ) as mock_gen,
    ):
        res = client.post("/itineraries/", json=SAMPLE_REQUEST)

    assert res.status_code == 201
    data = res.json()
    assert data["is_cached"] is False
    assert data["destination"] == "도쿄"
    mock_gen.assert_called_once()
    # INSERT가 호출되었는지 확인
    mock_sb.table.return_value.insert.assert_called_once()


def test_create_itinerary_cache_hit(client):
    """캐시 히트: DB에 동일 cache_key가 존재하면 INSERT 없이 즉시 is_cached=True로 반환해야 한다."""
    existing_row = {**SAMPLE_DB_ROW, "user_id": "aaaaaaaa-0000-0000-0000-000000000001"}
    mock_sb = _make_supabase_mock(existing_rows=[existing_row])

    with (
        patch("app.routers.itineraries.get_supabase", return_value=mock_sb),
        patch(
            "app.routers.itineraries.get_or_generate_itinerary",
            return_value=(SAMPLE_CONTENT, SAMPLE_CACHE_KEY, True),
        ) as mock_gen,
    ):
        res = client.post("/itineraries/", json=SAMPLE_REQUEST)

    assert res.status_code == 201
    data = res.json()
    assert data["is_cached"] is True
    mock_gen.assert_called_once()
    # cache_key 충돌 시 INSERT 미호출
    mock_sb.table.return_value.insert.assert_not_called()
