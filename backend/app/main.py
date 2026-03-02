from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, locations, itineraries, posts

app = FastAPI(title="TripMeet API")

# 허용 오리진 목록
# - Expo 개발 서버 (로컬)
# - Expo Go 앱 (LAN 접속)
# - 웹 빌드 로컬 서버
ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:19006",
    "http://localhost:3000",
    "exp://localhost:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(locations.router)
app.include_router(itineraries.router)
app.include_router(posts.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
