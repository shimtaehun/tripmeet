import json
import os
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db.supabase_client import get_supabase
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

# Firebase Admin SDK 초기화 (앱이 아직 초기화되지 않은 경우에만)
if not firebase_admin._apps:
    _service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    if _service_account_json:
        _cred = credentials.Certificate(json.loads(_service_account_json))
        firebase_admin.initialize_app(_cred)


class SyncUserResponse(BaseModel):
    id: str
    nickname: str
    profile_image_url: str | None
    bio: str | None
    is_new_user: bool


@router.post("/sync-user", response_model=SyncUserResponse)
def sync_user(current_user: dict = Depends(get_current_user)):
    """
    구글 OAuth 로그인 완료 후 호출하는 엔드포인트.
    DB 트리거로 users 행이 자동 생성되지만, 트리거 누락 시 폴백으로 동작한다.
    구글 프로필의 display_name을 nickname 초기값으로 사용한다.
    """
    supabase = get_supabase()
    user_id = current_user["id"]
    user_email = current_user.get("email", "")

    # 기존 users 행 조회
    result = supabase.table("users").select("*").eq("id", user_id).single().execute()

    if result.data:
        return SyncUserResponse(**result.data, is_new_user=False)

    # 트리거 누락 시 직접 생성 (폴백)
    default_nickname = user_email.split("@")[0] if user_email else "여행자"
    insert_result = supabase.table("users").insert({
        "id": user_id,
        "nickname": default_nickname,
    }).execute()

    return SyncUserResponse(**insert_result.data[0], is_new_user=True)


class FirebaseTokenResponse(BaseModel):
    firebase_token: str


@router.post("/firebase-token", response_model=FirebaseTokenResponse)
def get_firebase_token(current_user: dict = Depends(get_current_user)):
    """
    Supabase 세션으로 인증된 사용자에게 Firebase 커스텀 토큰을 발급한다.
    클라이언트는 이 토큰으로 Firebase Auth에 로그인해 Firestore 보안 규칙을 통과한다.
    """
    if not firebase_admin._apps:
        raise HTTPException(status_code=500, detail="Firebase Admin SDK가 초기화되지 않았습니다.")

    user_id = current_user["id"]
    try:
        token = firebase_auth.create_custom_token(user_id)
        return FirebaseTokenResponse(firebase_token=token.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firebase 토큰 발급 실패: {str(e)}")
