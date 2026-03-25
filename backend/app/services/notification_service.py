import httpx
import logging
from app.db.supabase_client import get_supabase

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def get_push_token(user_id: str) -> str | None:
    """users 테이블에서 Expo 푸시 토큰을 조회한다."""
    try:
        supabase = get_supabase()
        result = supabase.table("users").select("push_token").eq("id", user_id).single().execute()
        if result.data:
            return result.data.get("push_token")
    except Exception as e:
        logger.warning("푸시 토큰 조회 실패 user_id=%s: %s", user_id, e)
    return None


def send_push_notification(to_user_id: str, title: str, body: str, data: dict | None = None) -> None:
    """
    Expo Push API를 통해 단일 사용자에게 푸시 알림을 발송한다.
    토큰이 없거나 전송 실패 시 로그만 남기고 예외를 전파하지 않는다.
    """
    token = get_push_token(to_user_id)
    if not token:
        return

    payload = {
        "to": token,
        "title": title,
        "body": body,
        "sound": "default",
    }
    if data:
        payload["data"] = data

    try:
        res = httpx.post(EXPO_PUSH_URL, json=payload, timeout=5.0)
        if res.status_code != 200:
            logger.warning("푸시 알림 전송 실패 status=%d body=%s", res.status_code, res.text)
    except Exception as e:
        logger.warning("푸시 알림 전송 예외: %s", e)
