from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, locations, itineraries, posts, restaurants, companions, matching, bookmarks

app = FastAPI(title="TripMeet API")

# 허용 오리진 목록
# - Expo 개발 서버 (로컬)
# - Expo Go 앱 (LAN 접속)
# - 웹 빌드 로컬 서버
# - Render.com 프로덕션 서비스
ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:19006",
    "http://localhost:3000",
    "exp://localhost:8081",
    "https://tripmeet.onrender.com",
    "https://tripmeet-landing.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(locations.router)
app.include_router(itineraries.router)
app.include_router(posts.router)
app.include_router(restaurants.router)
app.include_router(companions.router)
app.include_router(matching.router)
app.include_router(bookmarks.router)


@app.get("/health")
def health_check():
    db_status = "ok"
    redis_status = "ok"

    try:
        from app.db.supabase_client import get_supabase
        supabase = get_supabase()
        supabase.table("users").select("id").limit(1).execute()
    except Exception:
        db_status = "error"

    try:
        from app.services.ai_service import _redis
        _redis.set("__keepalive__", "1", ex=86400)
    except Exception:
        redis_status = "error"

    return {"status": "ok", "db": db_status, "redis": redis_status}
