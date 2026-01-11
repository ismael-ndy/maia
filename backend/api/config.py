import os

from dotenv import load_dotenv

load_dotenv()

BACKBOARD_API_KEY = os.getenv("BACKBOARD_API_KEY")

if not BACKBOARD_API_KEY:
    raise RuntimeError("BACKBOARD_API_KEY is not set")
