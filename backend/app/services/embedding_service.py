"""
Gemini text-embedding-004 임베딩 서비스.

사용자의 여행 성향 텍스트(bio)를 768차원 벡터로 변환한다.
Google Generative AI REST API를 직접 호출한다.
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
EMBEDDING_MODEL = "text-embedding-004"
EMBEDDING_DIMENSION = 768
EMBEDDING_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{EMBEDDING_MODEL}:embedContent"
)


async def get_embedding(text: str) -> list[float]:
    """
    텍스트를 Gemini text-embedding-004로 768차원 벡터로 변환한다.

    Args:
        text: 임베딩할 텍스트 (사용자의 bio 등)

    Returns:
        768차원 float 리스트

    Raises:
        ValueError: API 키가 설정되지 않았거나 응답이 비정상인 경우
        httpx.HTTPStatusError: API 호출 실패 시
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")

    if not text or not text.strip():
        raise ValueError("임베딩할 텍스트가 비어있습니다.")

    payload = {
        "model": f"models/{EMBEDDING_MODEL}",
        "content": {
            "parts": [{"text": text.strip()}]
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            EMBEDDING_URL,
            params={"key": GEMINI_API_KEY},
            json=payload,
        )
        response.raise_for_status()

    data = response.json()
    values = data.get("embedding", {}).get("values", [])

    if len(values) != EMBEDDING_DIMENSION:
        raise ValueError(
            f"임베딩 차원 불일치: 기대 {EMBEDDING_DIMENSION}, 실제 {len(values)}"
        )

    return values
