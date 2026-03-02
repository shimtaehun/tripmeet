"""
POST /auth/sync-user 단위 테스트.

케이스:
1. 기존 사용자 조회 - DB에 users 행이 존재 → is_new_user=False 반환
2. 신규 사용자 생성 - DB에 users 행 없음 → INSERT 후 is_new_user=True 반환
"""
from unittest.mock import MagicMock, patch
from tests.conftest import FAKE_USER


def _make_supabase_mock(existing_user: dict | None):
    """
    supabase.table("users").select(...).eq(...).single().execute() 체인을 모킹.
    existing_user가 None이면 조회 결과 없음, dict이면 해당 데이터 반환.
    """
    supabase = MagicMock()
    select_chain = supabase.table.return_value.select.return_value
    select_chain.eq.return_value.single.return_value.execute.return_value.data = existing_user

    # INSERT 체인 (신규 사용자 생성 시)
    new_user_data = {
        "id": FAKE_USER["id"],
        "nickname": "test",
        "profile_image_url": None,
        "bio": None,
        "created_at": "2026-01-01T00:00:00",
        "updated_at": "2026-01-01T00:00:00",
    }
    supabase.table.return_value.insert.return_value.execute.return_value.data = [new_user_data]

    return supabase


def test_sync_user_existing(client):
    """기존 사용자: DB에 users 행이 이미 있으면 is_new_user=False를 반환해야 한다."""
    existing_user = {
        "id": FAKE_USER["id"],
        "nickname": "기존닉네임",
        "profile_image_url": None,
        "bio": "소개글",
        "created_at": "2026-01-01T00:00:00",
        "updated_at": "2026-01-01T00:00:00",
    }
    mock_sb = _make_supabase_mock(existing_user)

    with patch("app.routers.auth.get_supabase", return_value=mock_sb):
        res = client.post("/auth/sync-user")

    assert res.status_code == 200
    data = res.json()
    assert data["id"] == FAKE_USER["id"]
    assert data["nickname"] == "기존닉네임"
    assert data["is_new_user"] is False


def test_sync_user_new(client):
    """신규 사용자: DB에 users 행이 없으면 INSERT 후 is_new_user=True를 반환해야 한다."""
    mock_sb = _make_supabase_mock(existing_user=None)

    with patch("app.routers.auth.get_supabase", return_value=mock_sb):
        res = client.post("/auth/sync-user")

    assert res.status_code == 200
    data = res.json()
    assert data["id"] == FAKE_USER["id"]
    assert data["is_new_user"] is True
    # INSERT가 호출되었는지 확인
    mock_sb.table.return_value.insert.assert_called_once()
