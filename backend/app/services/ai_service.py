import os
import json
from upstash_redis import Redis
from google import genai
from google.genai import types

# Redis 클라이언트 (Upstash REST 방식)
_redis = Redis(
    url=os.environ["UPSTASH_REDIS_REST_URL"],
    token=os.environ["UPSTASH_REDIS_REST_TOKEN"],
)

# Gemini 클라이언트
_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

CACHE_TTL_SECONDS = 7 * 24 * 60 * 60  # 7일


def _normalize_budget(budget_won: int) -> str:
    """
    예산 금액을 구간 문자열로 변환한다.
    25만원과 28만원을 같은 키로 처리해 캐시 히트율을 높인다. (context.md 원칙 3)
    """
    if budget_won < 100_000:
        return "10만원대 이하"
    elif budget_won < 200_000:
        return "10만원대"
    elif budget_won < 300_000:
        return "20만원대"
    elif budget_won < 500_000:
        return "30만원대"
    elif budget_won < 1_000_000:
        return "50만원대"
    else:
        return "100만원 이상"


def build_cache_key(destination: str, duration_days: int, travelers_count: int, budget_won: int) -> str:
    """
    캐시 키 생성: {destination}:{duration}일:{travelers}명:{budget_range}
    예시) 제주도:3일:1명:30만원대
    """
    budget_range = _normalize_budget(budget_won)
    return f"{destination}:{duration_days}일:{travelers_count}명:{budget_range}"


def _call_gemini(destination: str, duration_days: int, travelers_count: int, budget_range: str) -> dict:
    """Gemini 1.5 Flash를 호출해 여행 일정 JSON을 생성한다."""
    prompt = (
        f"여행지: {destination}\n"
        f"여행 기간: {duration_days}일\n"
        f"인원: {travelers_count}명\n"
        f"예산: {budget_range}\n\n"
        "위 조건에 맞는 여행 일정을 아래 JSON 형식으로 작성해줘. "
        "각 날짜별로 오전/오후/저녁 활동과 예상 비용을 포함해. "
        "응답은 JSON만 출력하고 다른 설명은 쓰지 마.\n\n"
        '{"days": [{"day": 1, "date_label": "1일차", "activities": ['
        '{"time": "오전", "title": "", "description": "", "estimated_cost": 0}'
        ']}]}'
    )

    response = _client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            response_mime_type="application/json",
        ),
    )
    return json.loads(response.text)


def get_or_generate_itinerary(
    destination: str,
    duration_days: int,
    travelers_count: int,
    budget_won: int,
) -> tuple[dict, str, bool]:
    """
    캐시 조회 후 없으면 Gemini 호출 → 결과 캐싱. (context.md 원칙 3)

    :return: (일정 content dict, cache_key, is_cached)
    """
    cache_key = build_cache_key(destination, duration_days, travelers_count, budget_won)
    budget_range = _normalize_budget(budget_won)

    # Redis 캐시 조회
    cached = _redis.get(cache_key)
    if cached:
        return json.loads(cached), cache_key, True

    # 캐시 미스 → Gemini 호출
    content = _call_gemini(destination, duration_days, travelers_count, budget_range)

    # 결과 캐싱 (TTL 7일)
    _redis.set(cache_key, json.dumps(content, ensure_ascii=False), ex=CACHE_TTL_SECONDS)

    return content, cache_key, False
