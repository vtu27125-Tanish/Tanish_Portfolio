<div align="center">



\# Tanish Portfolio — Candidate Console



\*\*An AI-native portfolio: instead of reading a resume, you talk to it.\*\*



Recruiters chat with a digital representative grounded strictly in real profile

data — projects, skills, certifications, education. Paste a job description

and get a structured, honest fit score. No hallucinated experience. If it

doesn't know something, it says so.



\[!\[React](https://img.shields.io/badge/React-18-149ECA?logo=react\&logoColor=white)](https://react.dev)

\[!\[Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite\&logoColor=white)](https://vitejs.dev)

\[!\[FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi\&logoColor=white)](https://fastapi.tiangolo.com)

\[!\[Groq](https://img.shields.io/badge/LLM-Groq%20Llama%203.3%2070B-F55036)](https://groq.com)

\[!\[Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python\&logoColor=white)](https://python.org)

\[!\[License](https://img.shields.io/badge/License-MIT-lightgrey)](#license)



\*\*Live demo:\*\* \[tanish-portfolio-beta.vercel.app](https://tanish-portfolio-beta.vercel.app) · \*\*Backend API:\*\* \[tanish-portfolio-chfy.onrender.com](https://tanish-portfolio-chfy.onrender.com)



> Backend runs on Render's free tier — if it's been idle for 15+ minutes, the first request can take 30–50s to wake up. That's a cold start, not a bug.



</div>



\---



\## Table of contents



\- \[Why this exists](#why-this-exists)

\- \[Feature overview](#feature-overview)

\- \[Architecture](#architecture)

\- \[Tech stack](#tech-stack)

\- \[Project structure](#project-structure)

\- \[Running locally](#running-locally)

\- \[API reference](#api-reference)

\- \[Environment variables](#environment-variables)

\- \[Reliability \& security](#reliability--security)

\- \[Design system](#design-system)

\- \[Deployment](#deployment)

\- \[Roadmap](#roadmap)

\- \[License](#license)

\- \[Author](#author)



\---



\## Why this exists



A resume is a static, one-way document. This is a two-way, queryable one.

Recruiters can ask follow-up questions ("which project was hardest to

build?", "does this candidate know FastAPI?"), paste a full job description

and ask whether I'm a fit, and get honest answers sourced only from my

actual profile data — streamed back token-by-token in real time, exactly

like talking to a real assistant.



Every claim the assistant makes is traceable back to

`backend/candidate\_profile.json`. There's no free-floating LLM knowledge

about "me" in play — the system prompt is rebuilt from that file on every

single request, so editing the JSON changes what the assistant knows

instantly, with no redeploy.



\## Feature overview



<table>

<tr><td width="50%" valign="top">



\*\*Conversational layer\*\*

\- 💬 Real-time streaming chat (token-by-token, not dumped)

\- 🧠 Full conversation memory for accurate follow-ups

\- 🎯 \*\*Job description matcher\*\* — paste a JD, get a structured 0–100 fit

&#x20; score, concrete strengths, and honest gaps (`POST /match-jd`)

\- 🌟 \*\*"Why hire me" pitch mode\*\* — toggles the assistant into a

&#x20; persuasive, structured register instead of neutral Q\&A

\- 💡 Persistent suggestion chips above the input

\- 🎙️ Voice input via the Web Speech API

\- 📤 Export the full chat as a downloadable `.txt` transcript

\- 🚫 Zero hallucination by design — the system prompt strictly forbids

&#x20; inventing skills, experience, or achievements



</td><td width="50%" valign="top">



\*\*Experience \& UI\*\*

\- 🎬 Animated boot-sequence splash screen

\- 🎨 Two-palette live theme switcher (Rose Quartz / Emerald Depths)

\- 📊 Scroll progress bar, scroll-reveal animations

\- 🧭 Sticky sidebar navigation with live section tracking

\- 🖥️ \*\*Interactive terminal console\*\* — a real shell with tab-completion

&#x20; and playable easter eggs (Snake, Tic-Tac-Toe, Space Invaders, a Matrix

&#x20; rain effect, `neofetch`, `whoami`, and more — try `help`)

\- 💀 Loading skeletons instead of blank sections while data loads

\- 📱 Fully responsive, `prefers-reduced-motion`-aware



</td></tr>

<tr><td width="50%" valign="top">



\*\*Credibility \& conversion\*\*

\- ⭐ Live GitHub stats per project (stars, forks, last commit) fetched

&#x20; client-side — no server round-trip

\- ✅ Verified certification badges linking to issuer verification pages

\- 🟢 Availability badge in the hero, driven by profile data

\- 📄 One-click resume download

\- 📅 Optional "Book a call" button (Calendly)

\- ✉️ One-click email via Gmail compose link



</td><td width="50%" valign="top">



\*\*Engineering\*\*

\- 📋 Structured, Pydantic-validated candidate data

\- 🛡️ Per-IP rate limiting on `/chat` and `/match-jd`

\- 🔒 Input length caps on every user-supplied field

\- 🩹 Friendly error messages — no raw tracebacks ever reach the client

\- 🌐 Origin-restricted CORS with a production misconfiguration warning

\- 💾 Session persistence (chat survives a refresh via `sessionStorage`)

\- 📶 PWA basics — installable, offline fallback page, app-shell caching



</td></tr>

</table>



\## Architecture



```

┌──────────────────────┐        POST /chat (streamed)        ┌───────────────────────┐

│                       │ ───────────────────────────────────▶│                        │

│   React (Vite) SPA    │        POST /match-jd                │   FastAPI backend      │

│                       │ ───────────────────────────────────▶│                        │

│  • Chat UI            │                                       │  • Rate limiting       │

│  • JD matcher UI      │        GET /profile                  │  • Input validation    │

│  • Terminal console   │ ◀───────────────────────────────────│  • Prompt assembly     │

│  • Theme switcher      │                                       │                        │

└──────────────────────┘                                       └───────────┬────────────┘

&#x20;                                                                            │

&#x20;                                                   system prompt +          │  chat.completions

&#x20;                                                   conversation history     │  (streamed)

&#x20;                                                                            ▼

&#x20;                                                                 ┌───────────────────────┐

&#x20;                                                                 │   Groq API             │

&#x20;                                                                 │   llama-3.3-70b-       │

&#x20;                                                                 │   versatile            │

&#x20;                                                                 └───────────────────────┘



&#x20;                       ┌─────────────────────────────┐

&#x20;                       │ candidate\_profile.json       │  ← single source of truth,

&#x20;                       │ (validated by models.py)     │    re-read on every request

&#x20;                       └─────────────────────────────┘

```



The frontend never talks to Groq directly — the API key stays server-side.

The backend re-reads and re-validates `candidate\_profile.json` on every

`/chat` and `/match-jd` call, so there's no caching layer to invalidate when

the profile changes.



\## Tech stack



| Layer              | Technology                                              |

|---------------------|-----------------------------------------------------------|

| Frontend framework  | React 18 + Vite 5                                        |

| Styling             | Hand-written CSS design system (no framework), CSS custom properties for theming |

| Backend             | FastAPI (Python), streaming `StreamingResponse`           |

| LLM                 | Groq API — `llama-3.3-70b-versatile`                      |

| Data \& validation   | JSON profile + Pydantic v2 schema                          |

| Rate limiting       | In-memory, per-IP sliding window (no external dependency) |

| PWA                 | Hand-rolled service worker, app manifest, offline fallback |

| Deployment target   | Vercel (frontend) · Render / Koyeb (backend)               |



\## Project structure



```

Tanish\_Portfolio/

├── backend/

│   ├── main.py                  # FastAPI app: /health, /profile, /chat, /match-jd

│   ├── candidate\_profile.json   # Single source of truth for all candidate data

│   ├── models.py                # Pydantic schema the profile is validated against

│   ├── system\_prompt.py         # Builds the grounded system prompt from the profile

│   ├── requirements.txt

│   └── .env.example

│

├── frontend/

│   ├── index.html               # SEO/OG meta, favicon, manifest

│   ├── src/

│   │   ├── App.jsx              # Root layout, streaming chat state, scroll lock

│   │   ├── api.js                # Fetch/streaming helpers + error normalization

│   │   ├── index.css             # Design tokens (color, type, spacing, both themes)

│   │   ├── App.css               # Component styles

│   │   ├── hooks/

│   │   │   ├── useTypedText.js   # Hero role-rotator typing effect

│   │   │   ├── useScrollY.js     # Hero parallax scroll tracking

│   │   │   ├── useInView.js      # Scroll-reveal intersection observer

│   │   │   └── useGithubStats.js # Client-side GitHub API fetch, per project

│   │   └── components/

│   │       ├── SplashScreen.jsx   # Animated boot sequence

│   │       ├── Sidebar.jsx        # Sticky nav with active-section tracking

│   │       ├── ScrollProgress.jsx # Top-of-page scroll progress bar

│   │       ├── ThemeSelector.jsx  # Rose Quartz / Emerald Depths switcher

│   │       ├── Nav.jsx

│   │       ├── Hero.jsx

│   │       ├── NeuralAvatar.jsx   # Live particle-mesh canvas avatar

│   │       ├── SkillsOrbit.jsx

│   │       ├── About.jsx

│   │       ├── Projects.jsx       # Project cards + live GitHub stats

│   │       ├── TerminalConsole.jsx# Interactive shell + mini-games

│   │       ├── ChatSection.jsx    # Chat / JD-matcher tabbed console

│   │       ├── ChatWindow.jsx

│   │       ├── MessageEntry.jsx

│   │       ├── MessageInput.jsx   # Voice input, suggestion chips, char counter

│   │       ├── JDMatcher.jsx      # Job description fit-score UI

│   │       ├── ScheduleCard.jsx

│   │       ├── Skeleton.jsx       # Loading-state placeholders

│   │       ├── Contact.jsx

│   │       └── Footer.jsx

│   ├── public/

│   │   ├── manifest.json          # PWA manifest

│   │   ├── sw.js                  # Service worker (offline fallback + app shell cache)

│   │   ├── offline.html

│   │   ├── og-image.png           # Social share preview image

│   │   ├── resume.pdf

│   │   └── favicon.svg

│   ├── package.json

│   └── .env.example

│

└── README.md

```



\## Running locally



You need Python 3.11+, Node 18+, and a free \[Groq API key](https://console.groq.com/keys).



\### Backend



```bash

cd backend

python -m venv venv

source venv/bin/activate        # Windows: venv\\Scripts\\Activate.ps1

pip install -r requirements.txt

cp .env.example .env            # then paste your Groq key into GROQ\_API\_KEY=

python -m uvicorn main:app --reload --port 8000

```



Verify it's up: `curl http://localhost:8000/health`



\### Frontend



```bash

cd frontend

npm install

npm run dev

```



Open `http://localhost:5173` — the profile should populate, chat should

stream live, and `/match-jd` should return a real fit score.



\## API reference



| Method | Endpoint      | Body                                              | Description                                                              |

|--------|---------------|----------------------------------------------------|---------------------------------------------------------------------------|

| GET    | `/health`     | —                                                    | Health check + active model name                                          |

| GET    | `/profile`    | —                                                    | Returns the full candidate profile JSON                                   |

| POST   | `/chat`       | `{ messages: \[{role, content}], mode }`              | Streams a grounded assistant reply as plain text chunks (`mode` is `"chat"` or `"pitch"`) |

| POST   | `/match-jd`   | `{ job\_description: string }`                        | Returns `{ fit\_score, summary, strengths\[], gaps\[] }`, grounded in profile |



Both `/chat` and `/match-jd` are rate-limited per IP (defaults: 15 req/min

and 10 req/min respectively) and reject inputs over their length caps with

a `429` / `422` and a human-readable error message — never a raw traceback.



\## Environment variables



\*\*`backend/.env`\*\*



| Variable          | Required | Default                     | Notes                                                        |

|--------------------|----------|-------------------------------|-----------------------------------------------------------------|

| `GROQ\_API\_KEY`      | ✅        | —                              | Get one free at console.groq.com/keys                          |

| `GROQ\_MODEL`        | —        | `llama-3.3-70b-versatile`      |                                                                    |

| `FRONTEND\_ORIGINS`  | —        | `http://localhost:5173`        | Comma-separated. \*\*Set this to your real deployed frontend URL before going live\*\* — a startup warning fires if it's still pointing at localhost in production. |



\*\*`frontend/.env`\*\*



| Variable              | Required | Default                    | Notes                                          |

|------------------------|----------|-------------------------------|---------------------------------------------------|

| `VITE\_API\_BASE\_URL`    | —        | `http://localhost:8000`        | Point this at your deployed backend URL            |

| `VITE\_CALENDLY\_URL`    | —        | unset                          | Adds a "Book a call" button to Contact if set      |



\## Reliability \& security



\- \*\*Rate limiting\*\* — in-memory, per-IP sliding window on both LLM-calling

&#x20; endpoints, tuned tighter on `/match-jd` since each call is a full

&#x20; non-streamed completion.

\- \*\*Input caps\*\* — every user-supplied string (chat messages, conversation

&#x20; length, job descriptions) has an enforced max length, checked on both the

&#x20; client and the server.

\- \*\*No leaked internals\*\* — LLM/API failures are caught and translated into

&#x20; plain, friendly messages; the real exception is never surfaced to the

&#x20; client.

\- \*\*CORS is origin-restricted\*\* by default and warns at startup if a

&#x20; production environment still allows a localhost origin.

\- \*\*Secrets never bundled\*\* — `.env` is gitignored on both frontend and

&#x20; backend; only `.env.example` templates are committed.



\## Design system



Two switchable palettes — \*\*Rose Quartz\*\* and \*\*Emerald Depths\*\* — both

defined as CSS custom properties in `index.css`, so every component reads

color through tokens rather than hardcoded values. The interactive

`TerminalConsole` component leans into the "developer console" identity the

whole site is built around: a real command prompt with tab-completion,

history, and playable mini-games (type `help` to see the full command

list).



\## Deployment



This project is \*\*already deployed\*\* — see the live links at the top of

this README. The steps below are for anyone forking this repo and standing

up their own copy.



\*\*Backend → Render\*\*

1\. New Web Service from this repo, root directory `backend`

2\. Build command: `pip install -r requirements.txt`

3\. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4\. Add `GROQ\_API\_KEY` and `FRONTEND\_ORIGINS` as environment variables

5\. A `runtime.txt` pinning `python-3.11.9` is committed in `backend/` —

&#x20;  Render's default Python can be too new to have prebuilt wheels for

&#x20;  `pydantic-core`, which fails the build with a `metadata-generation-failed`

&#x20;  error. If you hit that, also set `PYTHON\_VERSION=3.11.9` directly under

&#x20;  Environment on Render.



\*\*Frontend → Vercel\*\*

1\. Import the repo, set the root directory to `frontend`

2\. Framework preset: Vite (auto-detected)

3\. Add `VITE\_API\_BASE\_URL` — your live Render URL — (and optionally

&#x20;  `VITE\_CALENDLY\_URL`) as environment variables



\*\*Wire them together\*\*

Once both are live, set `FRONTEND\_ORIGINS` on Render to your real Vercel

URL and `VITE\_API\_BASE\_URL` on Vercel to your real Render URL. Without this

last step the frontend's requests to `/chat` and `/match-jd` get blocked by

CORS even though both services look "up".



\## Roadmap



\- \[ ] Text-to-speech for assistant replies

\- \[ ] Analytics on most-asked questions

\- \[ ] Multi-language chat support

\- \[ ] Shared Redis-backed rate limiting for multi-instance deployments



\## License



MIT — feel free to fork this as a template for your own AI-native portfolio.



\## Author



\*\*N. Tanish\*\* — B.Tech CSE (AI \& ML), Vel Tech University

\[LinkedIn](https://www.linkedin.com/in/n-tanish-853701273/) ·

\[GitHub](https://github.com/vtu27125-Tanish)

