import os
import json
import logging
from upstash_redis import Redis
from google import genai
from google.genai import types
from app.db.supabase_client import get_supabase

logger = logging.getLogger(__name__)

# Redis 클라이언트 (Upstash REST 방식)
_redis = Redis(
    url=os.environ["UPSTASH_REDIS_REST_URL"],
    token=os.environ["UPSTASH_REDIS_REST_TOKEN"],
)

# Gemini 클라이언트
_client = genai.Client(
    api_key=os.environ["GEMINI_API_KEY"],
)

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
    캐시 키 생성: {destination}:{duration}일:{travelers}명:{budget_range}:v2
    v2: 식사 슬롯 + type 필드 추가로 기존 캐시 무효화
    """
    budget_range = _normalize_budget(budget_won)
    return f"{destination}:{duration_days}일:{travelers_count}명:{budget_range}:v2"


def _fetch_restaurant_context(destination: str) -> list[dict]:
    """
    Supabase에서 해당 여행지 맛집을 조회해 RAG 컨텍스트로 반환한다.
    location_name에 destination이 포함된 맛집을 평점 높은 순으로 최대 10개 가져온다.
    """
    try:
        supabase = get_supabase()
        result = (
            supabase.table("restaurants")
            .select("name, location_name, description, rating")
            .ilike("location_name", f"%{destination}%")
            .order("rating", desc=True)
            .limit(10)
            .execute()
        )
        return result.data or []
    except Exception as e:
        logger.warning("맛집 컨텍스트 조회 실패 (무시하고 진행): %s", e)
        return []


def _call_gemini(
    destination: str,
    duration_days: int,
    travelers_count: int,
    budget_range: str,
    restaurants: list[dict],
) -> dict:
    """Gemini를 호출해 식사 포함 여행 일정 JSON을 생성한다."""

    # 앱에 등록된 맛집 컨텍스트 구성
    if restaurants:
        restaurant_lines = "\n".join(
            f"- {r['name']} (평점 {r['rating']}/5)"
            + (f": {r['description'][:60]}" if r.get("description") else "")
            for r in restaurants
        )
        restaurant_section = (
            f"\n[{destination} 현지 맛집 정보 - 앱 사용자 실제 방문 리뷰]\n"
            f"{restaurant_lines}\n"
            "위 맛집 중 적합한 곳을 식사 슬롯에 우선 배치해줘. "
            "목록에 없으면 현지 인기 식당을 자유롭게 추천해.\n"
        )
    else:
        restaurant_section = ""

    prompt = (
        f"여행지: {destination}\n"
        f"여행 기간: {duration_days}일\n"
        f"인원: {travelers_count}명\n"
        f"예산: {budget_range}\n"
        f"{restaurant_section}\n"
        "위 조건에 맞는 여행 일정을 JSON으로 작성해줘.\n"
        "하루 일정은 아침식사 · 오전관광 · 점심식사 · 오후관광 · 저녁식사 순서로 구성해.\n"
        "type 필드: 관광/체험은 'sightseeing', 식사는 'meal'로 표기해.\n"
        "meal 타입은 restaurant_name 필드(식당명)를 반드시 포함해.\n"
        "응답은 JSON만 출력하고 다른 설명은 쓰지 마.\n\n"
        '{"days": [{"day": 1, "date_label": "1일차", "activities": ['
        '{"time": "아침", "type": "meal", "title": "", "restaurant_name": "", "description": "", "estimated_cost": 0},'
        '{"time": "오전", "type": "sightseeing", "title": "", "description": "", "estimated_cost": 0}'
        ']}]}'
    )

    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
        ),
    )

    # 마크다운 코드블록 제거 후 JSON 파싱
    text = response.text.strip()
    if text.startswith("```"):
        text = text[text.index("\n") + 1:]
        if "```" in text:
            text = text[:text.rindex("```")]
    return json.loads(text.strip())


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

    # 캐시 미스 → 맛집 컨텍스트 조회 후 Gemini 호출
    restaurants = _fetch_restaurant_context(destination)
    logger.info("RAG 맛집 컨텍스트: %d건 조회됨 (destination=%s)", len(restaurants), destination)
    content = _call_gemini(destination, duration_days, travelers_count, budget_range, restaurants)

    # 결과 캐싱 (TTL 7일)
    _redis.set(cache_key, json.dumps(content, ensure_ascii=False), ex=CACHE_TTL_SECONDS)

    return content, cache_key, False
