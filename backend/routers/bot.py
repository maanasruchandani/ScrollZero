from fastapi import APIRouter, UploadFile, File, Form
from services.scraper import extract_pdf_text
from services.gemini import generate_bot_personality

router = APIRouter()

@router.post("/generate-bot")
async def generate_bot(
    phone: str = Form(...),
    bot_name: str = Form(...),
    theme: str = Form(...),
    pdf: UploadFile = File(...)
):
    file_bytes = await pdf.read()
    profile_text = extract_pdf_text(file_bytes)
    personality = await generate_bot_personality(profile_text, bot_name, theme, phone)
    return {"message": "generated", "personality": personality}