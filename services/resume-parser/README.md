# Resume Parser Microservice

A minimal FastAPI service that ingests a resume (via public URL) and returns basic structured data (name, email, phone, title, skills, etc.). Intended as a temporary MVP until a more sophisticated extractor is integrated.

## Running locally

```bash
cd services/resume-parser
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

The service exposes a single endpoint:

```
POST /parse
Body: { "file_url": "https://example.com/resume.pdf" }
```

The response resembles:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "phone": "+1 555 555 5555",
  "title": "Software Engineer",
  "skills": ["Python", "Data Science"],
  "experienceYears": 5.0,
  "rawText": "..."
}
```

## Deployment

You can containerize the service with a simple Dockerfile:

```Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Expose the container internally (e.g., behind your Kubernetes cluster or ECS task) and set `RESUME_PARSER_URL` in the Next.js app to point to it (e.g. `http://resume-parser:8000`).
