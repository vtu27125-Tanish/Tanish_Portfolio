"""
AI Portfolio Challenge — Backend API

Endpoints:
  GET  /health          Simple health check
  GET  /profile         Returns the raw candidate profile JSON (for the frontend "About" panel)
  POST /chat            Streams a chat completion from Groq, grounded in the candidate profile
  POST /match-jd        Returns a structured fit score for a pasted job description

Run locally:
  uvicorn main:app --reload --port 8000
"""

import json
import os
import re
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import List, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from groq import Groq
from pydantic import BaseModel, Field

load_dotenv()

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY environment variable is not set. Add it to your .env file.")

MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
PROFILE_PATH = Path(__file__).parent / "candidate_profile.json"

client = Groq(api_key=GROQ_API_KEY)

app = FastAPI(title="AI Portfolio Backend")

# Allow the React frontend to call this API. During local dev, Vite runs on
# :5173 by default; add your deployed frontend origin(s) via FRONTEND_ORIGINS
# (comma-separated) once you've deployed, e.g. FRONTEND_ORIGINS=https://your-app.vercel.app
_default_origins = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# In-Memory Rate Limiter
# ---------------------------------------------------------------------------

class SimpleRateLimiter:
    def __init__(self, requests_per_minute: int = 15):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(deque)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        window_start = now - 60
        client_requests = self.requests[client_ip]

        # Purge timestamps outside the 60-second window
        while client_requests and client_requests[0] < window_start:
            client_requests.popleft()

        if len(client_requests) >= self.requests_per_minute:
            return False

        client_requests.append(now)
        return True


chat_rate_limiter = SimpleRateLimiter(requests_per_minute=15)
match_rate_limiter = SimpleRateLimiter(requests_per_minute=10)


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

MAX_MESSAGE_LENGTH = 4000
MAX_MESSAGES_PER_REQUEST = 40


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=MAX_MESSAGE_LENGTH)


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., max_length=MAX_MESSAGES_PER_REQUEST)
    mode: Literal["chat", "pitch"] = "chat"


class MatchRequest(BaseModel):
    job_description: str


class MatchResponse(BaseModel):
    fit_score: int
    summary: str
    strengths: List[str]
    gaps: List[str]


from system_prompt import build_system_prompt, build_jd_match_prompt


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME}


@app.get("/profile")
def get_profile():
    """Expose the candidate profile so the frontend can render an About panel."""
    if not PROFILE_PATH.exists():
        raise HTTPException(status_code=444, detail="Candidate profile file not found.")
    return json.loads(PROFILE_PATH.read_text())


@app.post("/chat")
def chat(request: ChatRequest, req: Request):
    """
    Receives the full conversation history, prepends the system prompt,
    and streams the LLM's response back as plain text chunks.
    Enforces rate limits and input length caps.
    """
    client_ip = req.client.host if req.client else "unknown"
    if not chat_rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please wait a minute before sending more messages."
        )

    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty")

    # Input length caps validation
    total_len = 0
    for m in request.messages:
        if len(m.content) > 4000:
            raise HTTPException(
                status_code=400,
                detail=f"Message character cap exceeded (max 4,000 characters per message)."
            )
        total_len += len(m.content)

    if total_len > 12000:
        raise HTTPException(
            status_code=400,
            detail="Total conversation history is too long (max 12,000 characters)."
        )

    system_prompt = build_system_prompt(PROFILE_PATH, mode=request.mode)

    groq_messages = [{"role": "system", "content": system_prompt}]
    groq_messages += [{"role": m.role, "content": m.content} for m in request.messages]

    def token_stream():
        try:
            stream = client.chat.completions.create(
                model=MODEL_NAME,
                messages=groq_messages,
                temperature=0.4,
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta
        except Exception:
            # Surface a clean, user-friendly fallback rather than raw python/SDK tracebacks
            yield "\n\n[The AI assistant is temporarily busy or unavailable. Please try again in a few moments.]"

    return StreamingResponse(token_stream(), media_type="text/plain")


@app.post("/match-jd", response_model=MatchResponse)
def match_jd(request: MatchRequest, req: Request):
    """
    Takes a pasted job description and returns a structured, grounded fit
    assessment (score + strengths + gaps) against the candidate profile.
    Enforces rate limits and input length caps.
    """
    client_ip = req.client.host if req.client else "unknown"
    if not match_rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded for JD analysis. Please wait a minute before trying again."
        )

    jd = request.job_description.strip()
    if not jd:
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")

    if len(jd) > 10000:
        raise HTTPException(
            status_code=400,
            detail="Job description exceeds character limit (max 10,000 characters)."
        )

    system_prompt = build_jd_match_prompt(PROFILE_PATH)

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"JOB DESCRIPTION:\n{jd}"},
            ],
            temperature=0.2,
        )
        raw = completion.choices[0].message.content.strip()
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="AI fit analysis service is temporarily unavailable. Please try again shortly."
        )

    # Clean markdown code block wrappers defensively
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE).strip()

    try:
        data = json.loads(cleaned)
        return MatchResponse(
            fit_score=int(data.get("fit_score", 0)),
            summary=str(data.get("summary", "")),
            strengths=[str(s) for s in data.get("strengths", [])],
            gaps=[str(g) for g in data.get("gaps", [])],
        )
    except (json.JSONDecodeError, ValueError, TypeError):
        raise HTTPException(
            status_code=502,
            detail="Unable to format AI fit analysis response. Please try again."
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

