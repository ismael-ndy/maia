from datetime import datetime

from pydantic import BaseModel


class SendMessageRequest(BaseModel):
    content: str


class ThreadMessage(BaseModel):
    timestamp: datetime
    content: str
