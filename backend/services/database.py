import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

async def save_bot(personality: dict, theme: str, bot_name: str) -> str:
    result = supabase.table("bots").insert({
        "bot_name": bot_name,
        "theme": theme,
        "personality": personality
    }).execute()
    return result.data[0]["id"]