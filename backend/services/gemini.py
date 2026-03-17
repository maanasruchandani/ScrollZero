import json
import httpx

async def generate_bot_personality(profile_text: str, bot_name: str, theme: str, email: str) -> dict:
    prompt = f"""You must return ONLY a valid JSON object. No text before or after. No markdown. No code blocks.

{{
  "name": "person full name",
  "title": "current job title",
  "summary": "brief professional summary without apostrophes",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
  "experience": [{{"company": "company name", "role": "role title"}}],
  "personality": "tone for {theme} theme",
  "greeting": "Hi I am {bot_name}",
  "email": "{email}",
  "bot_name": "{bot_name}"
}}

Profile:
{profile_text[:2000]}

Return ONLY the JSON. Start your response with {{ and end with }}"""

    for attempt in range(3):
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": "llama3.2", "prompt": prompt, "stream": False}
            )
            result = response.json()
            text = result["response"].strip()
            start = text.find("{")
            end = text.rfind("}") + 1
            if start == -1 or end == 0:
                continue
            json_str = text[start:end]
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                continue

    raise ValueError("Failed to generate valid JSON after 3 attempts")