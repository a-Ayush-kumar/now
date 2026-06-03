# db/mongo.py
import os
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Fallback to local connection string if environment variable isn't specified
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME")

# Initialize the Async Motor Client
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# Collections Handles
videos_collection = db.get_collection("videos")
chats_collection = db.get_collection("chat_histories")

async def get_cached_transcript(video_url: str) -> Optional[str]:
    """Checks MongoDB if the video transcript already exists."""
    video = await videos_collection.find_one({"video_url": video_url})
    return video["transcript"] if video else None

async def cache_video_transcript(video_url: str, transcript: str):
    """Caches the raw transcript text into MongoDB."""
    await videos_collection.insert_one({
        "video_url": video_url,
        "transcript": transcript,
        "processed_at": datetime.utcnow()
    })

async def save_chat_turn(session_id: str, question: str, answer: str):
    """Pushes the user query and agent answer pair to the chat session log."""
    await chats_collection.update_one(
        {"session_id": session_id},
        {
            "$push": {
                "messages": {
                    "$each": [
                        {"role": "user", "text": question, "timestamp": datetime.utcnow()},
                        {"role": "agent", "text": answer, "timestamp": datetime.utcnow()}
                    ]
                }
            }
        },
        upsert=True
    )