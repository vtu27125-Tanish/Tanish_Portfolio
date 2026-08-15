# Candidate Console — Chat With My Portfolio Instead of Reading My Resume

Instead of sending a static resume, this project lets recruiters and hiring
managers **chat with a digital representative grounded strictly in my real
profile data** (education, skills, projects, certifications). No hallucinated
experience, no embellishment. If it doesn't know something, it says so.

**Live demo:** _[add your deployed Vercel link here]_
**Backend API:** _[add your deployed Render/Koyeb link here]_

![Chat console screenshot](./screenshots/chat-console.png)

---

## Why this exists

A resume is a static, one-way document. This is a two-way, queryable one —
recruiters can ask follow-up questions ("which project was the hardest?",
"does this candidate know FastAPI?"), paste a job description and ask if I'm
a fit, and get honest, sourced-from-my-actual-data answers, streamed back in
real time.

## Design

The site is built around a "developer console" identity — a shell-prompt
hero (`whoami`), mono breadcrumb navigation (`~/about`, `~/projects`), and a
terminal-styled chat window — since a console/IDE feel fits a CS engineering
candidate more than a generic portfolio template. Colors: a cool blue
"signal" accent for interactive elements, paired with a warm amber for
status/availability highlights and a teal for "live" indicators, on a dark
graphite background.

## Features

- 💬 **Real-time streaming chat** — responses stream token-by-token, not
  dumped all at once
- 🧠 **Conversation memory** — follow-up questions like "which one was the
  hardest?" resolve correctly using prior chat context
- 🎯 **Job description matcher** — paste a JD, get a structured 0–100 fit
  score plus concrete strengths and honest gaps, grounded only in the real
  profile (`/match-jd`)
- 🌟 **"Why hire me" pitch mode** — a toggle that switches the assistant into
  a persuasive, structured summary register instead of neutral Q&A
- 💡 **Persistent suggestion chips** above the chat input, so a recruiter
  never has to type a cold-open question
- 🎙️ **Voice input** via the Web Speech API — ask by mic instead of typing
  (falls back gracefully on unsupported browsers)
- 📤 **Export chat** as a downloadable `.txt` transcript, so a recruiter can
  save or forward the conversation
- 📄 **One-click resume download** for recruiters who just want the PDF
- ⭐ **Live GitHub stats** on each project card (stars, forks, last commit),
  fetched client-side from the public GitHub API — no server round-trip
- ✅ **Verified certification badges** that link straight to the issuer's
  verification page where available
- 🟢 **Availability badge** in the hero, driven by `candidate_profile.json`
- 📅 **Optional "Book a call" button** (set `VITE_CALENDLY_URL` to enable)
- 📋 **Structured, validated candidate data** — profile lives in a single
  JSON file, validated against a Pydantic schema
- 🚫 **Zero hallucination by design** — the system prompt strictly forbids
  the assistant from inventing skills, experience, or achievements not in
  the profile
- 🪟 **Terminal-styled chat console** — traffic-light window chrome, live
  status indicator, typed-response cursor, contextual "thinking" states
- 🛰️ **Live profile sections** — About, Skills, Projects, and a candidate
  "verified profile" card rendered straight from the backend
- ✉️ **One-click email** — the contact icon opens Gmail's compose window
  addressed directly to me, instead of relying on a default mail client
- ⌨️ **Enter to send**, auto-scroll, typing indicator, copy-response button,
  clear-chat button
- 📱 Responsive layout, scroll-reveal animations, reduced-motion support

## Tech Stack

| Layer         | Tech                                          |
|---------------|------------------------------------------------|
| Frontend      | React (Vite), plain CSS (custom design system) |
| Backend       | FastAPI, Python, streaming responses            |
| LLM           | Groq API — `llama-3.3-70b-versatile`            |
| Data & validation | JSON + Pydantic                             |
| Deployment    | Render/Koyeb (backend), Vercel (frontend)       |

## Project Structure

```
ai-portfolio/
├── backend/
│   ├── main.py                 # FastAPI app — /health, /profile, /chat (streaming)
│   ├── candidate_profile.json  # My structured profile data
│   ├── models.py               # Pydantic validation schema
│   ├── system_prompt.py        # Builds the grounded system prompt from the profile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main layout + streaming chat state
│   │   ├── api.js                # Fetch/streaming helpers
│   │   ├── index.css             # Design tokens (color, type, spacing)
│   │   ├── App.css               # Component styles
│   │   ├── hooks/
│   │   │   ├── useTypedText.js   # Hero role-rotator typing effect
│   │   │   └── useScrollY.js     # Hero parallax scroll tracking
│   │   └── components/
│   │       ├── Nav.jsx           # Breadcrumb-style scroll nav
│   │       ├── Hero.jsx          # Terminal-prompt intro
│   │       ├── About.jsx         # Education, skills, certifications
│   │       ├── SkillsOrbit.jsx   # Orbiting skill-badge visual
│   │       ├── Projects.jsx      # Project cards with tilt effect
│   │       ├── ScheduleCard.jsx  # "Candidate console" verified-profile card
│   │       ├── ChatSection.jsx   # Terminal-styled chat console
│   │       ├── ChatWindow.jsx    # Message log + auto-scroll
│   │       ├── MessageEntry.jsx  # Single message with copy button
│   │       ├── MessageInput.jsx  # Input box, Enter-to-send
│   │       ├── Contact.jsx       # Gmail-compose contact link
│   │       └── Footer.jsx
│   └── package.json
│
└── README.md
```

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # then add your Groq API key (get one free at console.groq.com/keys)
python -m uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — the page should populate with the candidate
profile, and chat messages should stream back live.

## How It Works

1. **Profile as data, not prose** — all candidate info lives in
   `candidate_profile.json`, validated against a Pydantic schema
   (`models.py`) so the structure can't silently drift.
2. **System prompt built dynamically** — `system_prompt.py` reads the
   profile fresh on every request and assembles a system prompt with strict
   anti-hallucination rules, so editing the profile updates the assistant's
   knowledge instantly.
3. **Streaming backend** — `POST /chat` accepts the full conversation
   history from the frontend, forwards it (with the system prompt) to Groq,
   and streams the response back as plain text chunks.
4. **Stateless memory** — the frontend keeps conversation state and resends
   the whole thread each request, which is how follow-up questions resolve
   correctly without a database.
5. **CORS is origin-restricted** — set `FRONTEND_ORIGINS` in the backend
   `.env` to your deployed frontend URL(s) before going live (see
   `backend/.env.example`).

## Screenshots

_(Add screenshots to the `screenshots/` folder and reference them here.)_

| Chat in action | Mobile view |
|---|---|
| ![chat](./screenshots/chat-console.png) | ![mobile](./screenshots/mobile.png) |

## Roadmap / Bonus Ideas

- [ ] Text-to-speech for assistant replies
- [ ] Dark/light theme toggle
- [ ] Analytics on most-asked questions
- [ ] Multi-language chat support

## Author

**N. Tanish** — B.Tech CSE (AI & ML), Vel Tech University
[LinkedIn](https://www.linkedin.com/in/n-tanish-853701273/) ·
[GitHub](https://github.com/vtu27125-Tanish)
