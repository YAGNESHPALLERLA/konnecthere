import io
import os
import re
from typing import List, Optional, Tuple

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

try:
    import pdfplumber
except ImportError:  # pragma: no cover
    pdfplumber = None

app = FastAPI(title="KonnectHere Resume Parser", version="0.1.0")

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\+?\d[\d\s().-]{7,}\d")
YEARS_RE = re.compile(r"(\d+(?:\.\d+)?)\s+(?:years|yrs)")
SKILL_SPLIT_RE = re.compile(r",|\||;")

class ParseRequest(BaseModel):
    file_url: str

class ParseResponse(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    skills: List[str] = []
    experienceYears: Optional[float] = None
    rawText: str

async def download_file(url: str) -> Tuple[bytes, Optional[str]]:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url)
        if resp.status_code >= 400:
            raise HTTPException(status_code=400, detail=f"Unable to download file: {resp.status_code}")
        return resp.content, resp.headers.get("content-type")

def extract_text(data: bytes, content_type: Optional[str]) -> str:
    is_pdf = False
    if content_type and "pdf" in content_type.lower():
        is_pdf = True
    elif data[:4] == b"%PDF":
        is_pdf = True

    if is_pdf and pdfplumber is not None:
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
            return "\n".join(pages)
    return data.decode("utf-8", errors="ignore")

@app.post("/parse", response_model=ParseResponse)
async def parse_resume(payload: ParseRequest):
    if not payload.file_url.startswith("http"):
        raise HTTPException(status_code=400, detail="file_url must be an http(s) URL")

    raw_bytes, content_type = await download_file(payload.file_url)
    text = extract_text(raw_bytes, content_type)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Unable to extract text from resume")

    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    name = lines[0] if lines else None
    title = lines[1] if len(lines) > 1 else None

    email_match = EMAIL_RE.search(text)
    phone_match = PHONE_RE.search(text)
    exp_match = YEARS_RE.search(text)

    skills: List[str] = []
    for line in lines:
        lower = line.lower()
        if "skill" in lower or "technologies" in lower:
            skills = [token.strip() for token in SKILL_SPLIT_RE.split(line)
                      if token.strip() and "skill" not in token.lower()]
            break

    experience_years = float(exp_match.group(1)) if exp_match else None

    return ParseResponse(
        name=name,
        email=email_match.group(0) if email_match else None,
        phone=phone_match.group(0) if phone_match else None,
        title=title,
        skills=skills,
        experienceYears=experience_years,
        rawText=text,
    )

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
