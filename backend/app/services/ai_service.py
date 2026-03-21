import os
import json
import logging
from collections import Counter
from upstash_redis import Redis
from google import genai
from google.genai import types
from app.db.supabase_client import get_supabase

logger = logging.getLogger(__name__)

_redis = Redis(
    url=os.environ["UPSTASH_REDIS_REST_URL"],
    token=os.environ["UPSTASH_REDIS_REST_TOKEN"],
)

_client = genai.Client(
    api_key=os.environ["GEMINI_API_KEY"],
)

CACHE_TTL_SECONDS = 7 * 24 * 60 * 60  # 7일


def _normalize_budget(budget_won: int) -> str:
    """
    예산 금액을 구간 문자열로 변환한다.
    25만원과 28만원을 같은 키로 처리해 캐시 히트율을 높인다.
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
    캐시 키: {destination}:{duration}일:{travelers}명:{budget_range}:v2
    v2 = 식사 슬롯 + RAG 3종 적용 버전
    """
    budget_range = _normalize_budget(budget_won)
    return f"{destination}:{duration_days}일:{travelers_count}명:{budget_range}:v2"


# ─── RAG 소스 1: 앱 등록 맛집 ─────────────────────────────────────────────
def _fetch_restaurant_context(destination: str) -> list[dict]:
    """해당 여행지 맛집을 평점 높은 순으로 최대 10개 조회한다."""
    try:
        result = (
            get_supabase()
            .table("restaurants")
            .select("name, description, rating")
            .ilike("location_name", f"%{destination}%")
            .order("rating", desc=True)
            .limit(10)
            .execute()
        )
        return result.data or []
    except Exception as e:
        logger.warning("맛집 RAG 조회 실패 (무시): %s", e)
        return []


# ─── RAG 소스 2: 커뮤니티 여행 후기/정보 게시글 ─────────────────────────────
def _fetch_community_tips(destination: str) -> list[str]:
    """
    review·info 카테고리 게시글 중 여행지를 언급한 것을 최대 5개 가져와
    제목 + 본문 앞 80자를 팁으로 반환한다.
    """
    try:
        result = (
            get_supabase()
            .table("posts")
            .select("title, content, category")
            .in_("category", ["review", "info"])
            .ilike("content", f"%{destination}%")
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        )
        tips = []
        for post in (result.data or []):
            excerpt = post["content"][:80].replace("\n", " ")
            tips.append(f"[{post['category']}] {post['title']}: {excerpt}...")
        return tips
    except Exception as e:
        logger.warning("커뮤니티 팁 RAG 조회 실패 (무시): %s", e)
        return []


# ─── RAG 소스 3: 동행 게시글 인기 시즌 ───────────────────────────────────────
def _fetch_companion_season(destination: str) -> str:
    """
    동행 구인 게시글에서 여행 시작월을 집계해 인기 시즌 문자열을 반환한다.
    데이터가 없으면 빈 문자열을 반환한다.
    """
    try:
        result = (
            get_supabase()
            .table("companions")
            .select("travel_start_date")
            .ilike("destination", f"%{destination}%")
            .execute()
        )
        rows = result.data or []
        if not rows:
            return ""

        month_counter: Counter = Counter()
        month_kr = ["1월", "2월", "3월", "4월", "5월", "6월",
                    "7월", "8월", "9월", "10월", "11월", "12월"]
        for row in rows:
            date_str = row.get("travel_start_date", "")
            if date_str and len(date_str) >= 7:
                month = int(date_str[5:7])
                month_counter[month] += 1

        if not month_counter:
            return ""

        top = month_counter.most_common(3)
        popular = ", ".join(month_kr[m - 1] for m, _ in top)
        return f"앱 사용자들이 {destination} 여행을 많이 가는 시즌: {popular}"
    except Exception as e:
        logger.warning("동행 시즌 RAG 조회 실패 (무시): %s", e)
        return ""


# ─── RAG 소스 4: 과거 생성 일정 ──────────────────────────────────────────────
def _fetch_past_itinerary_insights(destination: str) -> str:
    """
    같은 여행지로 생성된 과거 일정에서 자주 등장한 관광지·식당을 집계해
    인기 장소 컨텍스트로 반환한다.
    데이터가 없으면 빈 문자열을 반환한다.
    """
    try:
        result = (
            get_supabase()
            .table("itineraries")
            .select("content")
            .ilike("destination", f"%{destination}%")
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        rows = result.data or []
        if not rows:
            return ""

        sightseeing_counter: Counter = Counter()
        restaurant_counter: Counter = Counter()

        for row in rows:
            days = (row.get("content") or {}).get("days", [])
            for day in days:
                for act in day.get("activities", []):
                    title = (act.get("title") or "").strip()
                    if not title:
                        continue
                    act_type = act.get("type", "")
                    time_str = act.get("time", "")
                    is_meal = (
                        act_type == "meal"
                        or any(k in time_str for k in ["아침", "점심", "저녁", "식사"])
                    )
                    if is_meal:
                        name = (act.get("restaurant_name") or title).strip()
                        if name:
                            restaurant_counter[name] += 1
                    else:
                        sightseeing_counter[title] += 1

        lines: list[str] = []
        top_spots = sightseeing_counter.most_common(8)
        if top_spots:
            spots_str = ", ".join(f"{name}({cnt}회)" for name, cnt in top_spots)
            lines.append(f"인기 관광지: {spots_str}")

        top_restaurants = restaurant_counter.most_common(5)
        if top_restaurants:
            restaurants_str = ", ".join(f"{name}({cnt}회)" for name, cnt in top_restaurants)
            lines.append(f"자주 등장한 식당: {restaurants_str}")

        if not lines:
            return ""

        return (
            f"앱 사용자들의 {destination} 일정 {len(rows)}건 분석 결과\n"
            + "\n".join(lines)
        )
    except Exception as e:
        logger.warning("과거 일정 RAG 조회 실패 (무시): %s", e)
        return ""


# ─── RAG 소스 5: 사용자 선호도 ──────────────────────────────────────────────
def _fetch_user_preference(user_id: str) -> str:
    """사용자 자기소개(bio)를 조회해 여행 성향 컨텍스트로 반환한다."""
    try:
        result = (
            get_supabase()
            .table("users")
            .select("bio, nickname")
            .eq("id", user_id)
            .single()
            .execute()
        )
        data = result.data
        if data and data.get("bio"):
            return f"{data.get('nickname', '여행자')}의 여행 성향: {data['bio']}"
        return ""
    except Exception as e:
        logger.warning("사용자 선호도 RAG 조회 실패 (무시): %s", e)
        return ""


# ─── Gemini 호출 ─────────────────────────────────────────────────────────────
def _call_gemini(
    destination: str,
    duration_days: int,
    travelers_count: int,
    budget_range: str,
    restaurants: list[dict],
    community_tips: list[str],
    season_info: str,
    user_preference: str,
    past_insights: str,
) -> dict:
    """RAG 컨텍스트 5종을 주입해 Gemini로 여행 일정을 생성한다."""

    sections: list[str] = []

    # 1) 사용자 선호도
    if user_preference:
        sections.append(f"[여행자 성향]\n{user_preference}")

    # 2) 과거 일정 인사이트 (앱 누적 데이터)
    if past_insights:
        sections.append(
            f"[{destination} 앱 누적 일정 인사이트]\n{past_insights}\n"
            "→ 인기 관광지와 식당은 일정에 자연스럽게 반영하되, 다양성도 유지해."
        )

    # 3) 앱 등록 맛집
    if restaurants:
        lines = "\n".join(
            f"- {r['name']} (평점 {r['rating']}/5)"
            + (f": {r['description'][:60]}" if r.get("description") else "")
            for r in restaurants
        )
        sections.append(
            f"[{destination} 앱 등록 맛집 - 실제 방문 리뷰]\n{lines}\n"
            "→ 식사 슬롯에 위 맛집을 우선 배치하고, 없으면 현지 인기 식당을 추천해."
        )

    # 4) 커뮤니티 후기/팁
    if community_tips:
        tips_str = "\n".join(community_tips)
        sections.append(
            f"[{destination} 여행자 커뮤니티 후기·정보]\n{tips_str}\n"
            "→ 위 내용을 참고해 활동 설명에 현지 팁을 자연스럽게 반영해."
        )

    # 5) 인기 시즌
    if season_info:
        sections.append(f"[여행 시즌 정보]\n{season_info}")

    context_block = "\n\n".join(sections)
    if context_block:
        context_block = "\n\n" + context_block + "\n"

    prompt = (
        f"여행지: {destination}\n"
        f"여행 기간: {duration_days}일\n"
        f"인원: {travelers_count}명\n"
        f"예산: {budget_range}"
        f"{context_block}\n"
        "위 조건과 컨텍스트를 바탕으로 여행 일정을 JSON으로 작성해줘.\n"
        "하루 구성: 아침식사 → 오전관광 → 점심식사 → 오후관광 → 저녁식사.\n"
        "type 필드: 관광/체험은 'sightseeing', 식사는 'meal'.\n"
        "meal 타입은 restaurant_name 필드(식당명)를 반드시 포함해.\n"
        "사용자 성향이 있으면 일정 스타일(여유/활동적 등)에 반영해.\n"
        "커뮤니티 팁은 description에 한 문장으로 자연스럽게 녹여.\n"
        "응답은 JSON만 출력하고 다른 설명은 쓰지 마.\n\n"
        '{"days": [{"day": 1, "date_label": "1일차", "activities": ['
        '{"time": "아침", "type": "meal", "title": "", "restaurant_name": "", "description": "", "estimated_cost": 0},'
        '{"time": "오전", "type": "sightseeing", "title": "", "description": "", "estimated_cost": 0}'
        ']}]}'
    )

    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.7),
    )

    text = response.text.strip()
    if text.startswith("```"):
        text = text[text.index("\n") + 1:]
        if "```" in text:
            text = text[:text.rindex("```")]
    return json.loads(text.strip())


# ─── 메인 엔트리포인트 ───────────────────────────────────────────────────────
def get_or_generate_itinerary(
    destination: str,
    duration_days: int,
    travelers_count: int,
    budget_won: int,
    user_id: str,
) -> tuple[dict, str, bool]:
    """
    RAG 5종(과거일정·맛집·커뮤니티·시즌·사용자 선호도)을 조합해 일정 생성.
    Redis 캐시 히트 시 Gemini 호출 생략.

    :return: (일정 content dict, cache_key, is_cached)
    """
    cache_key = build_cache_key(destination, duration_days, travelers_count, budget_won)
    budget_range = _normalize_budget(budget_won)

    # Redis 캐시 조회
    cached = _redis.get(cache_key)
    if cached:
        logger.info("캐시 히트: %s", cache_key)
        return json.loads(cached), cache_key, True

    # 캐시 미스 → RAG 소스 조회
    past_insights = _fetch_past_itinerary_insights(destination)
    restaurants = _fetch_restaurant_context(destination)
    community_tips = _fetch_community_tips(destination)
    season_info = _fetch_companion_season(destination)
    user_preference = _fetch_user_preference(user_id)

    logger.info(
        "RAG 조회 완료 | 과거일정: %s | 맛집: %d건 | 커뮤니티팁: %d건 | 시즌: %s | 선호도: %s",
        bool(past_insights), len(restaurants), len(community_tips),
        bool(season_info), bool(user_preference),
    )

    content = _call_gemini(
        destination, duration_days, travelers_count, budget_range,
        restaurants, community_tips, season_info, user_preference, past_insights,
    )

    _redis.set(cache_key, json.dumps(content, ensure_ascii=False), ex=CACHE_TTL_SECONDS)
    return content, cache_key, False
