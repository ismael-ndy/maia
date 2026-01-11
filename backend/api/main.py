from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.chats.routers import router as chat_router
from api.core.db import sessionmanager
from api.security.routers import router as auth_router
from api.users.routers import router as users_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with sessionmanager._engine.begin() as conn:  # type: ignore
        await sessionmanager.create_all(conn)

    yield

    await sessionmanager.close()


app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(chat_router)


@app.get("/")
def root():
    return "hello world!"
