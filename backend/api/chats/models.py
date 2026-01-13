from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class SendMessageRequest(BaseModel):
    content: str


class ThreadMessage(BaseModel):
    timestamp: datetime
    content: str
    role: Literal["user", "assistant"]
