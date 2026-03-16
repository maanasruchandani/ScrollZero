import json
import httpx

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

Return ONLY valid JSON. No explanation, no markdown. No code blocks.
"""
    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3.2", "prompt": prompt, "stream": False}
        )
        result = response.json()
        text = result["response"].strip()
# extract JSON block robustly
        start = text.find("{")
        end = text.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON found in response")
        json_str = text[start:end]
        return json.loads(json_str)