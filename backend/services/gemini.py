import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def generate_bot_personality(profile_text: str, bot_name: str, theme: str, phone: str) -> dict:
    prompt = f"""
You are given a LinkedIn profile of a person. Extract and return a JSON object with these fields:

- name: full name of the person
- title: their current role/title
- summary: a 3-4 sentence professional summary in first person
- skills: list of top 6 skills
- experience: list of past roles (each with company and role)
- personality: based on theme "{theme}", describe how the bot should talk (tone, style)
- greeting: a first message the bot will say when someone opens the chat
- phone: "{phone}"
- bot_name: "{bot_name}"

Profile text:
{profile_text}

Return ONLY valid JSON. No explanation, no markdown.
"""
    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=prompt
    )
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())