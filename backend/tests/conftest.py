"""
pytest 공통 fixture 정의.

- client: TestClient (get_current_user 의존성을 FAKE_USER로 대체)
- FAKE_USER: 테스트용 사용자 딕셔너리
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.middleware.auth import get_current_user

FAKE_USER = {"id": "aaaaaaaa-0000-0000-0000-000000000001", "email": "test@example.com"}


@pytest.fixture
def client():
    """get_current_user 의존성을 FAKE_USER로 교체한 TestClient."""
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
