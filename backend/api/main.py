from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.chats.routers import router as chat_router
from api.core.db import sessionmanager
from api.security.routers import router as auth_router
from api.therapists.routers import router as therapists_router
from api.users.routers import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with sessionmanager._engine.begin() as conn:  # type: ignore
        await sessionmanager.create_all(conn)

    yield

    await sessionmanager.close()


app = FastAPI(lifespan=lifespan)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(chat_router)
app.include_router(therapists_router)


@app.get("/")
def root():
    return "hello world!"
